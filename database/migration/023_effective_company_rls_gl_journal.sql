/*
==========================================================
FINOVA ACCOUNTING SYSTEM
EFFECTIVE COMPANY RLS
GL JOURNAL HEADER

Migration : 023
==========================================================
*/


/*
==========================================================
DROP OLD POLICY
==========================================================
*/

drop policy if exists
    finova_tenant_gl_journal
on
    public.trx_gl_journal;


/*
==========================================================
CREATE EFFECTIVE COMPANY POLICY
==========================================================
*/

create policy finova_tenant_gl_journal
on public.trx_gl_journal

for all

to authenticated

using (

    company_id =
        public.finova_effective_company_id()

)

with check (

    company_id =
        public.finova_effective_company_id()

);