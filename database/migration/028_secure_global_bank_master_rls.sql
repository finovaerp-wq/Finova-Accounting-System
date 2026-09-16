/*
==========================================================
FINOVA ACCOUNTING SYSTEM
GLOBAL BANK MASTER RLS HARDENING

Migration : 028
==========================================================
*/


/*
==========================================================
DROP OLD PUBLIC POLICIES
==========================================================
*/

drop policy if exists
    "Allow Select Bank"
on
    public.mst_bank;


drop policy if exists
    "Allow Insert Bank"
on
    public.mst_bank;


drop policy if exists
    "Allow Update Bank"
on
    public.mst_bank;


drop policy if exists
    "Allow Delete Bank"
on
    public.mst_bank;


/*
==========================================================
SELECT

GLOBAL REFERENCE MASTER

All authenticated FINOVA users may read the bank master.

No Company Context is required because mst_bank
is intentionally global and has no company_id.
==========================================================
*/

create policy finova_bank_select
on public.mst_bank

for select

to authenticated

using (
    true
);


/*
==========================================================
INSERT

Only active FINOVA Super Admin may maintain
the global Bank Master.
==========================================================
*/

create policy finova_bank_insert
on public.mst_bank

for insert

to authenticated

with check (
    public.is_finova_super_admin()
);


/*
==========================================================
UPDATE

Only active FINOVA Super Admin may maintain
the global Bank Master.
==========================================================
*/

create policy finova_bank_update
on public.mst_bank

for update

to authenticated

using (
    public.is_finova_super_admin()
)

with check (
    public.is_finova_super_admin()
);


/*
==========================================================
DELETE

Only active FINOVA Super Admin may maintain
the global Bank Master.
==========================================================
*/

create policy finova_bank_delete
on public.mst_bank

for delete

to authenticated

using (
    public.is_finova_super_admin()
);