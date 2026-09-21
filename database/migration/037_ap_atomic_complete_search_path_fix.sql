/*
==========================================================
FINOVA ACCOUNTING SYSTEM
AP ATOMIC COMPLETE - TRIGGER SEARCH PATH FIX
Migration : 037
==========================================================

Reason:
- public.finova_complete_account_payable(uuid, jsonb) was created with
  SET search_path = ''.
- The RPC itself uses schema-qualified transaction tables.
- Existing trigger functions fired by INSERT/UPDATE may contain legacy
  unqualified references such as trx_gl_journal.
- Trigger functions without their own SET search_path inherit the calling
  session/function search_path, causing PostgreSQL 42P01:
  relation "trx_gl_journal" does not exist.

This patch changes only the RPC execution search_path. It does not disable,
replace, or remove any existing tenant/company/audit/period/GL-total trigger.
==========================================================
*/

alter function public.finova_complete_account_payable(uuid, jsonb)
    set search_path = pg_catalog, public;

/* Keep API permissions explicit. */
revoke all on function public.finova_complete_account_payable(uuid, jsonb) from public;
grant execute on function public.finova_complete_account_payable(uuid, jsonb) to authenticated;
