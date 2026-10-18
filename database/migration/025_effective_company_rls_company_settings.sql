/*
==========================================================
FINOVA ACCOUNTING SYSTEM
EFFECTIVE COMPANY RLS
COMPANY SETTINGS

Migration : 025
==========================================================
*/


/*
==========================================================
DROP OLD POLICIES
==========================================================
*/

drop policy if exists
    finova_company_settings_select
on
    public.finova_company_settings;


drop policy if exists
    finova_company_settings_insert
on
    public.finova_company_settings;


drop policy if exists
    finova_company_settings_update
on
    public.finova_company_settings;


drop policy if exists
    finova_company_settings_delete
on
    public.finova_company_settings;


/*
==========================================================
SELECT

Tenant:
- hanya company miliknya

Super Admin:
- hanya company context yang sedang dipilih
==========================================================
*/

create policy finova_company_settings_select
on public.finova_company_settings

for select

to authenticated

using (

    company_id =
        public.finova_effective_company_id()

);


/*
==========================================================
INSERT

Super Admin:
- hanya boleh membuat settings untuk company context
  yang sedang dipilih

Tenant:
- tidak mendapat hak INSERT dari policy ini
==========================================================
*/

create policy finova_company_settings_insert
on public.finova_company_settings

for insert

to authenticated

with check (

    public.is_finova_super_admin()

    and

    company_id =
        public.finova_effective_company_id()

);


/*
==========================================================
UPDATE

Super Admin:
- company context yang sedang dipilih

Tenant:
- harus Manager
- company harus current company tenant
==========================================================
*/

create policy finova_company_settings_update
on public.finova_company_settings

for update

to authenticated

using (

    (
        public.is_finova_super_admin()

        and

        company_id =
            public.finova_effective_company_id()
    )

    or

    (
        not public.is_finova_super_admin()

        and

        public.finova_is_current_company_manager()

        and

        company_id =
            public.finova_current_company_id()
    )

)

with check (

    (
        public.is_finova_super_admin()

        and

        company_id =
            public.finova_effective_company_id()
    )

    or

    (
        not public.is_finova_super_admin()

        and

        public.finova_is_current_company_manager()

        and

        company_id =
            public.finova_current_company_id()
    )

);


/*
==========================================================
DELETE

Super Admin:
- hanya settings company context yang sedang dipilih

Tenant:
- tidak mendapat hak DELETE dari policy ini
==========================================================
*/

create policy finova_company_settings_delete
on public.finova_company_settings

for delete

to authenticated

using (

    public.is_finova_super_admin()

    and

    company_id =
        public.finova_effective_company_id()

);