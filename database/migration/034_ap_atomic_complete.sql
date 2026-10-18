/*
==========================================================
FINOVA ACCOUNTING SYSTEM
AP ATOMIC COMPLETE + AP INVOICE JOURNAL PROTECTION
Migration : 034
==========================================================
*/

/* ========================================================
   1. ONE ACTIVE SOURCE JOURNAL PER AP INVOICE
   Pre-check already confirmed no duplicate AP_INVOICE rows.
   ======================================================== */

create unique index if not exists uq_gl_ap_invoice_source
on public.trx_gl_journal (
    company_id,
    source_document_id
)
where upper(coalesce(source_module, '')) = 'AP'
  and upper(coalesce(source_document_type, '')) = 'AP_INVOICE'
  and source_document_id is not null;


/* ========================================================
   2. ATOMIC COMPLETE AP

   In one PostgreSQL transaction:
   - lock AP row
   - validate tenant + Draft status
   - create Draft AP_INVOICE GL header
   - create GL detail rows
   - link AP -> GL
   - change AP Draft -> Complete

   Existing company, audit and period-lock triggers remain active.
   ======================================================== */

create or replace function public.finova_complete_account_payable(
    p_account_payable_id uuid,
    p_journal_lines jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_uid uuid;
    v_company_id uuid;
    v_ap public.trx_account_payable%rowtype;
    v_journal_id uuid;
    v_journal_no text;
    v_prefix text;
    v_running integer;
    v_line jsonb;
    v_line_no integer := 0;
    v_group_id uuid;
    v_amount numeric;
    v_debit_account_id bigint;
    v_credit_account_id bigint;
    v_business_partner_id bigint;
    v_description text;
    v_total_debit numeric := 0;
    v_total_credit numeric := 0;
begin
    v_user_uid := auth.uid();

    if v_user_uid is null then
        raise exception 'Authenticated user is required.';
    end if;

    if p_account_payable_id is null then
        raise exception 'Account Payable ID is required.';
    end if;

    if p_journal_lines is null
       or jsonb_typeof(p_journal_lines) <> 'array'
       or jsonb_array_length(p_journal_lines) = 0 then
        raise exception 'GL Journal detail cannot be empty.';
    end if;

    v_company_id := public.finova_effective_company_id();

    if v_company_id is null then
        raise exception 'Effective company context is required.';
    end if;

    /* Serialize changes to this AP invoice. */
    select *
      into v_ap
      from public.trx_account_payable
     where id = p_account_payable_id
       and company_id = v_company_id
     for update;

    if not found then
        raise exception 'Account Payable not found for the active company.';
    end if;

    if v_ap.status <> 'Draft' then
        raise exception 'Only Draft Account Payable can be completed. Current status: %.', v_ap.status;
    end if;

    if v_ap.gl_journal_id is not null then
        raise exception 'Account Payable is already linked to GL Journal %.', v_ap.gl_journal_id;
    end if;

    if not exists (
        select 1
          from public.trx_account_payable_detail d
         where d.account_payable_id = v_ap.id
           and d.company_id = v_company_id
    ) then
        raise exception 'Account Payable detail cannot be empty.';
    end if;

    if exists (
        select 1
          from public.trx_gl_journal g
         where g.company_id = v_company_id
           and upper(coalesce(g.source_module, '')) = 'AP'
           and upper(coalesce(g.source_document_type, '')) = 'AP_INVOICE'
           and g.source_document_id = v_ap.id
    ) then
        raise exception 'GL Journal for this Account Payable already exists.';
    end if;

    /* Validate incoming journal pairs before inserting anything. */
    for v_line in
        select value
          from jsonb_array_elements(p_journal_lines)
    loop
        begin
            v_amount := (v_line ->> 'amount')::numeric;
            v_debit_account_id := (v_line ->> 'debit_account_id')::bigint;
            v_credit_account_id := (v_line ->> 'credit_account_id')::bigint;
        exception
            when others then
                raise exception 'Invalid AP journal line payload.';
        end;

        if v_amount is null or v_amount <= 0 then
            raise exception 'Every AP journal line amount must be greater than zero.';
        end if;

        if v_debit_account_id is null or v_credit_account_id is null then
            raise exception 'Debit and credit account are required for every AP journal line.';
        end if;

        v_total_debit := v_total_debit + v_amount;
        v_total_credit := v_total_credit + v_amount;
    end loop;

    if v_total_debit <= 0 or v_total_debit <> v_total_credit then
        raise exception 'AP GL Journal is not balanced.';
    end if;

    /* Generate the same GJ-YYYYMM-###### format under a DB lock. */
    v_prefix := 'GJ-' || to_char(v_ap.date_received, 'YYYYMM');

    perform pg_advisory_xact_lock(
        hashtext(v_company_id::text || ':' || v_prefix)
    );

    select coalesce(
               max(
                   case
                       when journal_no ~ ('^' || v_prefix || '-[0-9]{6}$')
                       then right(journal_no, 6)::integer
                       else null
                   end
               ),
               0
           ) + 1
      into v_running
      from public.trx_gl_journal
     where company_id = v_company_id
       and journal_no like v_prefix || '-%';

    v_journal_no := v_prefix || '-' || lpad(v_running::text, 6, '0');
    v_journal_id := gen_random_uuid();

    insert into public.trx_gl_journal (
        id,
        company_id,
        journal_no,
        journal_date,
        posting_period,
        description,
        reference_no,
        source_module,
        source_document_type,
        source_document_id,
        source_invoice_no,
        source_po_no,
        status,
        total_debit,
        total_credit,
        created_by
    ) values (
        v_journal_id,
        v_company_id,
        v_journal_no,
        v_ap.date_received,
        to_char(v_ap.date_received, 'YYYY-MM'),
        case
            when nullif(btrim(coalesce(v_ap.description, '')), '') is null
                then '[AUTO] INV AP'
            else '[AUTO] INV AP' || chr(10) || btrim(v_ap.description)
        end,
        v_ap.invoice_no,
        'AP',
        'AP_INVOICE',
        v_ap.id,
        v_ap.invoice_no,
        v_ap.po_no,
        'Draft',
        v_total_debit,
        v_total_credit,
        v_user_uid
    );

    for v_line in
        select value
          from jsonb_array_elements(p_journal_lines)
    loop
        v_amount := (v_line ->> 'amount')::numeric;
        v_debit_account_id := (v_line ->> 'debit_account_id')::bigint;
        v_credit_account_id := (v_line ->> 'credit_account_id')::bigint;
        v_business_partner_id := nullif(v_line ->> 'business_partner_id', '')::bigint;
        v_description := coalesce(v_line ->> 'description', '');
        v_group_id := gen_random_uuid();

        v_line_no := v_line_no + 1;
        insert into public.trx_gl_journal_detail (
            company_id, journal_id, line_no, account_id,
            business_partner_id, description, debit, credit,
            transaction_group
        ) values (
            v_company_id, v_journal_id, v_line_no, v_debit_account_id,
            v_business_partner_id, v_description, v_amount, 0,
            v_group_id
        );

        v_line_no := v_line_no + 1;
        insert into public.trx_gl_journal_detail (
            company_id, journal_id, line_no, account_id,
            business_partner_id, description, debit, credit,
            transaction_group
        ) values (
            v_company_id, v_journal_id, v_line_no, v_credit_account_id,
            v_business_partner_id, v_description, 0, v_amount,
            v_group_id
        );
    end loop;

    update public.trx_account_payable
       set gl_journal_id = v_journal_id,
           status = 'Complete'
     where id = v_ap.id
       and company_id = v_company_id
       and status = 'Draft';

    if not found then
        raise exception 'Account Payable could not be completed.';
    end if;

    return jsonb_build_object(
        'account_payable_id', v_ap.id,
        'invoice_no', v_ap.invoice_no,
        'status', 'Complete',
        'gl_journal_id', v_journal_id,
        'journal_no', v_journal_no,
        'journal_status', 'Draft'
    );
end;
$$;

revoke all on function public.finova_complete_account_payable(uuid, jsonb) from public;
grant execute on function public.finova_complete_account_payable(uuid, jsonb) to authenticated;
