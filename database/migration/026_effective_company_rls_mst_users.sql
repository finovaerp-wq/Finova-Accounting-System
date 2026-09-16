/*
==========================================================
FINOVA ACCOUNTING SYSTEM
EFFECTIVE COMPANY RLS
MST USERS

Migration : 026
==========================================================
*/


/*
==========================================================
DROP OLD POLICIES
==========================================================
*/

drop policy if exists
    finova_mst_users_select
on
    public.mst_users;


drop policy if exists
    finova_mst_users_update
on
    public.mst_users;


/*
==========================================================
SELECT

SUPER ADMIN
- hanya user milik Company Context aktif

TENANT USER
- boleh melihat profil sendiri
- boleh melihat user dalam company tenant yang sama

IMPORTANT
- Super Admin tidak memakai jalur self-profile mst_users
- profil Super Admin berasal dari finova_super_admins
==========================================================
*/

create policy finova_mst_users_select
on public.mst_users

for select

to authenticated

using (

    /*
    ======================================================
    SUPER ADMIN COMPANY CONTEXT
    ======================================================
    */

    (
        public.is_finova_super_admin()

        and

        company_id is not null

        and

        company_id =
            public.finova_effective_company_id()
    )


    or


    /*
    ======================================================
    TENANT USER - OWN PROFILE
    ======================================================
    */

    (
        not public.is_finova_super_admin()

        and

        user_uid = (select auth.uid())
    )


    or


    /*
    ======================================================
    TENANT USER - SAME COMPANY
    ======================================================
    */

    (
        not public.is_finova_super_admin()

        and

        company_id is not null

        and

        company_id =
            public.finova_current_company_id()
    )

);


/*
==========================================================
UPDATE

SUPER ADMIN
- hanya user milik Company Context aktif

TENANT USER
- harus Manager
- hanya user dalam company tenant yang sama
==========================================================
*/

create policy finova_mst_users_update
on public.mst_users

for update

to authenticated

using (

    /*
    ======================================================
    SUPER ADMIN COMPANY CONTEXT
    ======================================================
    */

    (
        public.is_finova_super_admin()

        and

        company_id is not null

        and

        company_id =
            public.finova_effective_company_id()
    )


    or


    /*
    ======================================================
    TENANT MANAGER
    ======================================================
    */

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

    /*
    ======================================================
    SUPER ADMIN COMPANY CONTEXT
    ======================================================
    */

    (
        public.is_finova_super_admin()

        and

        company_id is not null

        and

        company_id =
            public.finova_effective_company_id()
    )


    or


    /*
    ======================================================
    TENANT MANAGER
    ======================================================
    */

    (
        not public.is_finova_super_admin()

        and

        public.finova_is_current_company_manager()

        and

        company_id =
            public.finova_current_company_id()
    )

);