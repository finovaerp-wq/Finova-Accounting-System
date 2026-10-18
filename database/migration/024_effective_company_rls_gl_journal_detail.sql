/*
==========================================================
FINOVA ACCOUNTING SYSTEM
EFFECTIVE COMPANY RLS
GL JOURNAL DETAIL

Migration : 024
==========================================================
*/


/*
==========================================================
DROP OLD POLICY
==========================================================
*/

drop policy if exists
    finova_tenant_gl_journal_detail
on
    public.trx_gl_journal_detail;


/*
==========================================================
CREATE EFFECTIVE COMPANY POLICY
==========================================================
*/

create policy finova_tenant_gl_journal_detail
on public.trx_gl_journal_detail

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