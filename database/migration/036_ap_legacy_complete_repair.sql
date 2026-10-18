/*
==========================================================
FINOVA ACCOUNTING SYSTEM
AP LEGACY COMPLETE WITHOUT GL REPAIR
Migration : 036
==========================================================

Purpose:
- Repair historical AP rows that are Complete but have no
  gl_journal_id.
- Runs only through authenticated application context.
- Never disables tenant/company guards.
- If an AP_INVOICE journal already exists, relink it.
- If no journal exists, restore AP to Draft so Migration 034
  can complete AP + GL atomically.
==========================================================
*/

create or replace function public.finova_repair_ap_complete_without_gl(
    p_account_payable_id uuid
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
    v_existing_journal_id uuid;
begin
    v_user_uid := auth.uid();

    if v_user_uid is null then
        raise exception 'Authenticated user is required.';
    end if;

    if p_account_payable_id is null then
        raise exception 'Account Payable ID is required.';
    end if;

    v_company_id := public.finova_effective_company_id();

    if v_company_id is null then
        raise exception 'Effective company context is required.';
    end if;

    select *
      into v_ap
      from public.trx_account_payable
     where id = p_account_payable_id
       and company_id = v_company_id
     for update;

    if not found then
        raise exception 'Account Payable not found for the active company.';
    end if;

    if v_ap.gl_journal_id is not null then
        return jsonb_build_object(
            'account_payable_id', v_ap.id,
            'invoice_no', v_ap.invoice_no,
            'status', v_ap.status,
            'gl_journal_id', v_ap.gl_journal_id,
            'action', 'NO_REPAIR_REQUIRED'
        );
    end if;

    if v_ap.status <> 'Complete' then
        raise exception
            'Repair is only allowed for Complete AP without GL. Current status: %.',
            v_ap.status;
    end if;

    select g.id
      into v_existing_journal_id
      from public.trx_gl_journal g
     where g.company_id = v_company_id
       and upper(coalesce(g.source_module, '')) = 'AP'
       and upper(coalesce(g.source_document_type, '')) = 'AP_INVOICE'
       and g.source_document_id = v_ap.id
     order by g.created_at desc
     limit 1;

    if v_existing_journal_id is not null then
        update public.trx_account_payable
           set gl_journal_id = v_existing_journal_id
         where id = v_ap.id
           and company_id = v_company_id
           and status = 'Complete'
           and gl_journal_id is null;

        if not found then
            raise exception 'Account Payable could not be relinked.';
        end if;

        return jsonb_build_object(
            'account_payable_id', v_ap.id,
            'invoice_no', v_ap.invoice_no,
            'status', 'Complete',
            'gl_journal_id', v_existing_journal_id,
            'action', 'RELINKED_EXISTING_GL'
        );
    end if;

    update public.trx_account_payable
       set status = 'Draft'
     where id = v_ap.id
       and company_id = v_company_id
       and status = 'Complete'
       and gl_journal_id is null;

    if not found then
        raise exception 'Account Payable could not be restored to Draft.';
    end if;

    return jsonb_build_object(
        'account_payable_id', v_ap.id,
        'invoice_no', v_ap.invoice_no,
        'status', 'Draft',
        'gl_journal_id', null,
        'action', 'RESTORED_TO_DRAFT'
    );
end;
$$;

revoke all on function public.finova_repair_ap_complete_without_gl(uuid) from public;
grant execute on function public.finova_repair_ap_complete_without_gl(uuid) to authenticated;
