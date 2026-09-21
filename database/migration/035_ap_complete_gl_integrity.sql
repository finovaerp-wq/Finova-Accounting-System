/*
==========================================================
FINOVA ACCOUNTING SYSTEM
AP COMPLETE / GL INTEGRITY GUARD
Migration : 035 (REVISED)
==========================================================
IMPORTANT:
- This migration DOES NOT update tenant transaction rows directly.
- Recovery is exposed through an authenticated RPC so the existing
  effective-company / tenant triggers remain active.
- The CHECK is added NOT VALID. PostgreSQL still enforces it for new
  or changed rows, while existing legacy rows can be repaired safely.
==========================================================
*/

/* ==========================================================
1. PROTECT ALL NEW / CHANGED AP ROWS
========================================================== */

alter table public.trx_account_payable
    drop constraint if exists chk_ap_completed_requires_gl;

alter table public.trx_account_payable
    add constraint chk_ap_completed_requires_gl
    check (
        status not in ('Complete', 'Partial Paid', 'Paid')
        or gl_journal_id is not null
    ) not valid;


/* ==========================================================
2. SAFE LEGACY RECOVERY RPC

Called from the authenticated FINOVA application.
The existing tenant guard therefore receives the same effective
company context as normal AP transactions.

Rules:
- Lock the AP row.
- AP must belong to effective company.
- Only Complete + NULL gl_journal_id is repairable.
- If exactly one AP_INVOICE GL already exists, relink it.
- If no GL exists, return AP to Draft so migration 034 can complete it.
- More than one matching GL is rejected for manual investigation.
========================================================== */

create or replace function public.finova_repair_ap_complete_without_gl(
    p_account_payable_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_company_id uuid;
    v_ap public.trx_account_payable%rowtype;
    v_gl_id uuid;
    v_gl_count integer;
begin
    v_company_id := public.finova_effective_company_id();

    if v_company_id is null then
        raise exception 'FINOVA: company context aktif tidak ditemukan.';
    end if;

    select *
      into v_ap
      from public.trx_account_payable
     where id = p_account_payable_id
       and company_id = v_company_id
     for update;

    if not found then
        raise exception 'FINOVA: Account Payable tidak ditemukan pada company context aktif.';
    end if;

    if v_ap.status <> 'Complete' or v_ap.gl_journal_id is not null then
        raise exception
            'FINOVA: recovery hanya untuk AP Complete dengan gl_journal_id NULL.';
    end if;

    select count(*), min(gl.id::text)::uuid
      into v_gl_count, v_gl_id
      from public.trx_gl_journal gl
     where gl.company_id = v_company_id
       and upper(coalesce(gl.source_module, '')) = 'AP'
       and upper(coalesce(gl.source_document_type, '')) = 'AP_INVOICE'
       and gl.source_document_id = v_ap.id;

    if v_gl_count > 1 then
        raise exception
            'FINOVA: ditemukan lebih dari satu AP_INVOICE GL untuk Account Payable ini.';
    end if;

    if v_gl_count = 1 then
        update public.trx_account_payable
           set gl_journal_id = v_gl_id
         where id = v_ap.id;

        return jsonb_build_object(
            'action', 'RELINKED',
            'status', 'Complete',
            'account_payable_id', v_ap.id,
            'gl_journal_id', v_gl_id
        );
    end if;

    update public.trx_account_payable
       set status = 'Draft'
     where id = v_ap.id;

    return jsonb_build_object(
        'action', 'RESET_TO_DRAFT',
        'status', 'Draft',
        'account_payable_id', v_ap.id,
        'gl_journal_id', null
    );
end;
$$;

revoke all
on function public.finova_repair_ap_complete_without_gl(uuid)
from public;

grant execute
on function public.finova_repair_ap_complete_without_gl(uuid)
to authenticated;


/* ==========================================================
3. VALIDATION NOTE

Do NOT VALIDATE the constraint in this migration because production
may still contain legacy Complete rows with NULL gl_journal_id.
After all legacy rows have been repaired through the RPC, validation
can be performed in a later migration.
========================================================== */
