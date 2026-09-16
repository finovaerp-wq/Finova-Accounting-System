/*
==========================================================
FINOVA ACCOUNTING SYSTEM
EFFECTIVE COMPANY RLS
AUDIT LOG SELECT

Migration : 027
==========================================================
*/


/*
==========================================================
DROP OLD POLICY
==========================================================
*/

drop policy if exists
    finova_audit_log_select
on
    public.finova_audit_log;


/*
==========================================================
CREATE EFFECTIVE COMPANY POLICY

ACCOUNTING SYSTEM / TENANT CONTEXT

Tenant User:
- effective company = current tenant company

Super Admin:
- effective company = selected Company Context
- no company selected = no tenant audit rows

IMPORTANT:
- This policy intentionally removes the global
  Super Admin SELECT bypass from tenant Audit Trail.
- Audit writer functions are NOT changed here.
==========================================================
*/

create policy finova_audit_log_select
on public.finova_audit_log

for select

to authenticated

using (

    company_id =
        public.finova_effective_company_id()

);