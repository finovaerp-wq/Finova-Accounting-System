/*
==========================================================
FINOVA ACCOUNTING SYSTEM
EFFECTIVE COMPANY RLS
BUSINESS PARTNER BANK

Migration : 011
==========================================================
*/


/*
==========================================================
DROP OLD POLICY
==========================================================
*/

drop policy if exists
    finova_tenant_bp_bank_all
on
    public.mst_business_partner_bank;


/*
==========================================================
CREATE EFFECTIVE COMPANY POLICY
==========================================================
*/

create policy finova_tenant_bp_bank_all
on public.mst_business_partner_bank

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