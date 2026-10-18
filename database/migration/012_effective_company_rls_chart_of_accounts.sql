/*
==========================================================
FINOVA ACCOUNTING SYSTEM
EFFECTIVE COMPANY RLS
CHART OF ACCOUNTS

Migration : 012
==========================================================
*/


/*
==========================================================
DROP OLD POLICY
==========================================================
*/

drop policy if exists
    finova_tenant_coa_all
on
    public.mst_chart_of_accounts;


/*
==========================================================
CREATE EFFECTIVE COMPANY POLICY
==========================================================
*/

create policy finova_tenant_coa_all
on public.mst_chart_of_accounts

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