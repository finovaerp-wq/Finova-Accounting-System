/*
==========================================================
FINOVA ACCOUNTING SYSTEM
AP PAYMENT ATOMIC SAVE
Migration : 038
==========================================================
*/

create or replace function public.finova_save_ap_payment_atomic(
    p_payment jsonb,
    p_allocations jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
    v_user_uid uuid := auth.uid();
    v_company_id uuid;
    v_payment_no text;
    v_payment_date date;
    v_vendor_id bigint;
    v_bank_account_id bigint;
    v_reference_no text;
    v_description text;
    v_batch_id uuid := gen_random_uuid();
    v_journal_id uuid := gen_random_uuid();
    v_journal_no text;
    v_prefix text;
    v_running integer;
    v_payable_account_id bigint;
    v_allocation jsonb;
    v_ap public.trx_account_payable%rowtype;
    v_payment_amount numeric;
    v_active_paid numeric;
    v_fresh_outstanding numeric;
    v_ratio numeric;
    v_dpp numeric;
    v_tax_plus numeric;
    v_tax_minus numeric;
    v_total_payment numeric := 0;
    v_total_dpp numeric := 0;
    v_total_tax_plus numeric := 0;
    v_total_tax_minus numeric := 0;
    v_invoice_nos text[] := array[]::text[];
    v_line_no integer := 0;
    v_group_id uuid;
    v_allocations_out jsonb := '[]'::jsonb;
    v_payment_id uuid;
begin
    if v_user_uid is null then
        raise exception 'Authenticated user is required.';
    end if;

    if p_payment is null or jsonb_typeof(p_payment) <> 'object' then
        raise exception 'AP Payment header is required.';
    end if;

    if p_allocations is null or jsonb_typeof(p_allocations) <> 'array'
       or jsonb_array_length(p_allocations) = 0 then
        raise exception 'At least one AP Payment allocation is required.';
    end if;

    v_company_id := public.finova_effective_company_id();
    if v_company_id is null then
        raise exception 'Effective company context is required.';
    end if;

    v_payment_no := nullif(btrim(p_payment ->> 'payment_no'), '');
    v_payment_date := nullif(p_payment ->> 'payment_date', '')::date;
    v_vendor_id := nullif(p_payment ->> 'vendor_id', '')::bigint;
    v_bank_account_id := nullif(p_payment ->> 'bank_account_id', '')::bigint;
    v_reference_no := nullif(btrim(p_payment ->> 'reference_no'), '');
    v_description := nullif(btrim(p_payment ->> 'description'), '');

    if v_payment_no is null then raise exception 'Payment Number is required.'; end if;
    if v_payment_date is null then raise exception 'Payment Date is required.'; end if;
    if v_vendor_id is null then raise exception 'Vendor is required.'; end if;
    if v_bank_account_id is null then raise exception 'Bank Account is required.'; end if;

    if not exists (
        select 1 from public.mst_business_partner bp
        where bp.id = v_vendor_id and bp.company_id = v_company_id
          and bp.bp_type = 'Vendor' and coalesce(bp.is_active, false) = true
    ) then
        raise exception 'Vendor is invalid or inactive for the active company.';
    end if;

    if not exists (
        select 1 from public.mst_chart_of_accounts c
        where c.id = v_bank_account_id and c.company_id = v_company_id
          and coalesce(c.status, false) = true and coalesce(c.allow_transaction, false) = true
    ) then
        raise exception 'Bank Account is invalid for the active company.';
    end if;

    select c.id into v_payable_account_id
    from public.mst_chart_of_accounts c
    where c.company_id = v_company_id
      and c.account_code = '2-11011'
      and coalesce(c.status, false) = true
      and coalesce(c.allow_transaction, false) = true
    limit 1;

    if v_payable_account_id is null then
        raise exception 'Account Payable account 2-11011 - HUTANG USAHA is not configured for this company.';
    end if;

    /* Lock every AP first, in deterministic order, to prevent concurrent overpayment. */
    perform 1
    from public.trx_account_payable ap
    where ap.company_id = v_company_id
      and ap.id in (
          select distinct (x ->> 'account_payable_id')::uuid
          from jsonb_array_elements(p_allocations) x
      )
    order by ap.id
    for update;

    if (select count(*) from (
        select distinct (x ->> 'account_payable_id')::uuid id
        from jsonb_array_elements(p_allocations) x
    ) q) <> (select count(*) from public.trx_account_payable ap
             where ap.company_id = v_company_id and ap.id in (
                 select distinct (x ->> 'account_payable_id')::uuid
                 from jsonb_array_elements(p_allocations) x
             )) then
        raise exception 'One or more Account Payable allocations were not found for the active company.';
    end if;

    if (select count(*) from jsonb_array_elements(p_allocations)) <>
       (select count(distinct (x ->> 'account_payable_id')) from jsonb_array_elements(p_allocations) x) then
        raise exception 'Duplicate Account Payable invoice found in payment allocation.';
    end if;

    /* First pass: validate and calculate totals while rows are locked. */
    for v_allocation in select value from jsonb_array_elements(p_allocations)
    loop
        select * into strict v_ap
        from public.trx_account_payable
        where id = (v_allocation ->> 'account_payable_id')::uuid
          and company_id = v_company_id;

        if v_ap.vendor_id <> v_vendor_id then
            raise exception 'Invoice % does not belong to selected Vendor.', v_ap.invoice_no;
        end if;

        if v_ap.status not in ('Complete', 'Partial Paid') then
            raise exception 'Invoice % is not available for payment. Current status: %.', v_ap.invoice_no, v_ap.status;
        end if;

        if v_ap.gl_journal_id is null or not exists (
            select 1 from public.trx_gl_journal g
            where g.id = v_ap.gl_journal_id and g.company_id = v_company_id and g.status = 'Posted'
        ) then
            raise exception 'Invoice % GL Journal must be Posted before payment.', v_ap.invoice_no;
        end if;

        v_payment_amount := round(coalesce((v_allocation ->> 'payment_amount')::numeric, 0), 2);
        if v_payment_amount <= 0 then
            raise exception 'Payment Amount must be greater than 0 for Invoice %.', v_ap.invoice_no;
        end if;

        select coalesce(sum(p.payment_amount), 0) into v_active_paid
        from public.trx_ap_payment p
        left join public.trx_ap_payment_batch b on b.id = p.payment_batch_id
        where p.account_payable_id = v_ap.id
          and p.company_id = v_company_id
          and p.gl_journal_id is not null
          and (b.id is null or b.status <> 'Void');

        v_fresh_outstanding := greatest(round(coalesce(v_ap.total_amount,0) - v_active_paid, 2), 0);
        if v_payment_amount > v_fresh_outstanding then
            raise exception 'Payment for Invoice % cannot exceed Outstanding Amount %.', v_ap.invoice_no, v_fresh_outstanding;
        end if;

        v_ratio := case when coalesce(v_ap.total_amount,0) > 0 then v_payment_amount / v_ap.total_amount else 0 end;
        v_tax_plus := round(coalesce(v_ap.tax_input_amount,0) * v_ratio, 2);
        v_tax_minus := round(coalesce(v_ap.withholding_tax_amount,0) * v_ratio, 2);
        v_dpp := round(v_payment_amount - v_tax_plus + v_tax_minus, 2);

        v_total_payment := v_total_payment + v_payment_amount;
        v_total_dpp := v_total_dpp + v_dpp;
        v_total_tax_plus := v_total_tax_plus + v_tax_plus;
        v_total_tax_minus := v_total_tax_minus + v_tax_minus;
        if not (v_ap.invoice_no = any(v_invoice_nos)) then
            v_invoice_nos := array_append(v_invoice_nos, v_ap.invoice_no);
        end if;
    end loop;

    if round(v_total_dpp + v_total_tax_plus - v_total_tax_minus, 2) <> round(v_total_payment, 2) then
        raise exception 'AP Payment journal components do not match Total Payment.';
    end if;

    /* DB-safe journal number. */
    v_prefix := 'GJ-' || to_char(v_payment_date, 'YYYYMM');
    perform pg_advisory_xact_lock(hashtext(v_company_id::text || ':' || v_prefix));
    select coalesce(max(case when journal_no ~ ('^' || v_prefix || '-[0-9]{6}$') then right(journal_no,6)::integer end),0)+1
      into v_running
      from public.trx_gl_journal
     where company_id = v_company_id and journal_no like v_prefix || '-%';
    v_journal_no := v_prefix || '-' || lpad(v_running::text,6,'0');

    insert into public.trx_gl_journal (
        id, company_id, journal_no, journal_date, posting_period, description,
        reference_no, source_module, source_document_type, source_document_id,
        source_invoice_no, source_po_no, status, total_debit, total_credit, created_by
    ) values (
        v_journal_id, v_company_id, v_journal_no, v_payment_date, to_char(v_payment_date,'YYYY-MM'),
        '[AUTO] PAYMENT AP' || case when v_description is null then '' else chr(10)||v_description end,
        v_payment_no, 'AP', 'AP_PAYMENT', v_batch_id,
        array_to_string(v_invoice_nos, ', '), v_reference_no, 'Draft', v_total_payment, v_total_payment, v_user_uid
    );

    if v_total_dpp > 0 then
        v_group_id := gen_random_uuid();
        v_line_no := v_line_no + 1;
        insert into public.trx_gl_journal_detail(company_id,journal_id,line_no,account_id,business_partner_id,description,debit,credit,transaction_group)
        values(v_company_id,v_journal_id,v_line_no,v_payable_account_id,v_vendor_id,coalesce(v_description,v_payment_no)||' - DPP',v_total_dpp,0,v_group_id);
        v_line_no := v_line_no + 1;
        insert into public.trx_gl_journal_detail(company_id,journal_id,line_no,account_id,business_partner_id,description,debit,credit,transaction_group)
        values(v_company_id,v_journal_id,v_line_no,v_bank_account_id,v_vendor_id,coalesce(v_description,v_payment_no)||' - DPP',0,v_total_dpp,v_group_id);
    end if;
    if v_total_tax_plus > 0 then
        v_group_id := gen_random_uuid();
        v_line_no := v_line_no + 1;
        insert into public.trx_gl_journal_detail(company_id,journal_id,line_no,account_id,business_partner_id,description,debit,credit,transaction_group)
        values(v_company_id,v_journal_id,v_line_no,v_payable_account_id,v_vendor_id,coalesce(v_description,v_payment_no)||' - Tax (+)',v_total_tax_plus,0,v_group_id);
        v_line_no := v_line_no + 1;
        insert into public.trx_gl_journal_detail(company_id,journal_id,line_no,account_id,business_partner_id,description,debit,credit,transaction_group)
        values(v_company_id,v_journal_id,v_line_no,v_bank_account_id,v_vendor_id,coalesce(v_description,v_payment_no)||' - Tax (+)',0,v_total_tax_plus,v_group_id);
    end if;
    if v_total_tax_minus > 0 then
        v_group_id := gen_random_uuid();
        v_line_no := v_line_no + 1;
        insert into public.trx_gl_journal_detail(company_id,journal_id,line_no,account_id,business_partner_id,description,debit,credit,transaction_group)
        values(v_company_id,v_journal_id,v_line_no,v_bank_account_id,v_vendor_id,coalesce(v_description,v_payment_no)||' - Tax (-)',v_total_tax_minus,0,v_group_id);
        v_line_no := v_line_no + 1;
        insert into public.trx_gl_journal_detail(company_id,journal_id,line_no,account_id,business_partner_id,description,debit,credit,transaction_group)
        values(v_company_id,v_journal_id,v_line_no,v_payable_account_id,v_vendor_id,coalesce(v_description,v_payment_no)||' - Tax (-)',0,v_total_tax_minus,v_group_id);
    end if;

    insert into public.trx_ap_payment_batch(
        id, company_id, payment_no, payment_date, vendor_id, bank_account_id,
        reference_no, description, total_payment, status, gl_journal_id
    ) values (
        v_batch_id, v_company_id, v_payment_no, v_payment_date, v_vendor_id, v_bank_account_id,
        v_reference_no, v_description, round(v_total_payment,2), 'Draft', v_journal_id
    );

    /* Second pass: insert allocations and update AP totals in the same transaction. */
    for v_allocation in select value from jsonb_array_elements(p_allocations)
    loop
        select * into strict v_ap
        from public.trx_account_payable
        where id = (v_allocation ->> 'account_payable_id')::uuid and company_id = v_company_id;

        v_payment_amount := round((v_allocation ->> 'payment_amount')::numeric,2);
        v_ratio := case when coalesce(v_ap.total_amount,0)>0 then v_payment_amount/v_ap.total_amount else 0 end;
        v_tax_plus := round(coalesce(v_ap.tax_input_amount,0)*v_ratio,2);
        v_tax_minus := round(coalesce(v_ap.withholding_tax_amount,0)*v_ratio,2);
        v_dpp := round(v_payment_amount-v_tax_plus+v_tax_minus,2);
        v_payment_id := gen_random_uuid();

        insert into public.trx_ap_payment(
            id, company_id, account_payable_id, payment_batch_id, payment_date,
            bank_account_id, reference_no, description, dpp_amount, tax_plus_amount,
            tax_minus_amount, payment_amount, gl_journal_id
        ) values (
            v_payment_id, v_company_id, v_ap.id, v_batch_id, v_payment_date,
            v_bank_account_id, v_reference_no, v_description, v_dpp, v_tax_plus,
            v_tax_minus, v_payment_amount, v_journal_id
        );

        select coalesce(sum(p.payment_amount),0) into v_active_paid
        from public.trx_ap_payment p
        left join public.trx_ap_payment_batch b on b.id=p.payment_batch_id
        where p.account_payable_id=v_ap.id and p.company_id=v_company_id
          and p.gl_journal_id is not null and (b.id is null or b.status <> 'Void');

        update public.trx_account_payable
           set paid_amount = least(round(v_active_paid,2), round(coalesce(total_amount,0),2)),
               outstanding_amount = greatest(round(coalesce(total_amount,0)-v_active_paid,2),0),
               status = case when round(coalesce(total_amount,0)-v_active_paid,2) <= 0 then 'Paid' else 'Partial Paid' end
         where id=v_ap.id and company_id=v_company_id;

        v_allocations_out := v_allocations_out || jsonb_build_array(jsonb_build_object(
            'id',v_payment_id,'account_payable_id',v_ap.id,'payment_batch_id',v_batch_id,
            'payment_amount',v_payment_amount,'gl_journal_id',v_journal_id
        ));
    end loop;

    return jsonb_build_object(
        'batch', jsonb_build_object('id',v_batch_id,'payment_no',v_payment_no,'payment_date',v_payment_date,'vendor_id',v_vendor_id,'bank_account_id',v_bank_account_id,'total_payment',round(v_total_payment,2),'status','Draft','gl_journal_id',v_journal_id),
        'journal', jsonb_build_object('id',v_journal_id,'journal_no',v_journal_no,'status','Draft'),
        'allocations', v_allocations_out
    );
end;
$$;

revoke all on function public.finova_save_ap_payment_atomic(jsonb,jsonb) from public;
grant execute on function public.finova_save_ap_payment_atomic(jsonb,jsonb) to authenticated;
