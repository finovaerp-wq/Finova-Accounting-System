/*
==========================================================
FINOVA ACCOUNTING SYSTEM
EFFECTIVE COMPANY RLS
BUSINESS PARTNER

Migration : 010
==========================================================
*/


/*
==========================================================
DROP OLD POLICY
==========================================================
*/

drop policy if exists
    finova_tenant_bp_all
on
    public.mst_business_partner;


/*
==========================================================
CREATE EFFECTIVE COMPANY POLICY
==========================================================
*/

create policy finova_tenant_bp_all
on public.mst_business_partner

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