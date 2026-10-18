/*
==========================================================
FINOVA ACCOUNTING SYSTEM
SUPER ADMIN COMPANY CONTEXT
Migration : 008
Version   : 1.0.0
==========================================================

PURPOSE
----------------------------------------------------------
Memberikan explicit company context kepada FINOVA
Super Admin ketika menggunakan Accounting System.

IMPORTANT
----------------------------------------------------------
- Super Admin TIDAK dimasukkan ke finova_company_users.
- Tenant context existing tetap dipertahankan.
- Super Admin hanya memiliki satu selected company.
- Hanya company ACTIVE yang dapat dipilih.
==========================================================
*/


/*
==========================================================
1. VALIDATE REQUIRED FOUNDATION
==========================================================
*/

do $$
begin

    if to_regclass(
        'public.finova_companies'
    ) is null then

        raise exception
            'FINOVA: public.finova_companies tidak ditemukan.';

    end if;


    if to_regclass(
        'public.finova_super_admins'
    ) is null then

        raise exception
            'FINOVA: public.finova_super_admins tidak ditemukan.';

    end if;


    if to_regprocedure(
        'public.is_finova_super_admin()'
    ) is null then

        raise exception
            'FINOVA: is_finova_super_admin() tidak ditemukan.';

    end if;


    if to_regprocedure(
        'public.finova_current_company_id()'
    ) is null then

        raise exception
            'FINOVA: finova_current_company_id() tidak ditemukan.';

    end if;

end
$$;


/*
==========================================================
2. SUPER ADMIN COMPANY CONTEXT TABLE
==========================================================
*/

create table if not exists
public.finova_super_admin_context
(
    user_uid uuid
        primary key
        references auth.users(id)
        on delete cascade,

    company_id uuid
        not null
        references public.finova_companies(id)
        on delete cascade,

    selected_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now()
);


/*
==========================================================
3. INDEX
==========================================================
*/

create index if not exists
idx_finova_super_admin_context_company
on public.finova_super_admin_context(company_id);


/*
==========================================================
4. ENABLE RLS
==========================================================
*/

alter table
public.finova_super_admin_context
enable row level security;


/*
==========================================================
5. NO DIRECT CLIENT TABLE ACCESS
==========================================================
*/

revoke all
on table public.finova_super_admin_context
from public;

revoke all
on table public.finova_super_admin_context
from anon;

revoke all
on table public.finova_super_admin_context
from authenticated;


/*
==========================================================
6. GET SUPER ADMIN COMPANY CONTEXT
==========================================================
*/

create or replace function
public.finova_super_admin_company_context()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$

    select
        ctx.company_id

    from
        public.finova_super_admin_context ctx

    inner join
        public.finova_companies c
            on c.id = ctx.company_id

    where
        ctx.user_uid = (select auth.uid())

        and c.status = 'ACTIVE'

        and public.is_finova_super_admin()

    limit 1;

$$;


revoke all
on function
public.finova_super_admin_company_context()
from public;

grant execute
on function
public.finova_super_admin_company_context()
to authenticated;


/*
==========================================================
7. SET SUPER ADMIN COMPANY CONTEXT
==========================================================
*/

create or replace function
public.finova_super_admin_set_company_context(
    p_company_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$

declare

    v_company_id uuid;

begin

    /*
    ======================================================
    VALIDATE SUPER ADMIN
    ======================================================
    */

    if not public.is_finova_super_admin() then

        raise exception
            'FINOVA: Super Admin access required.';

    end if;


    /*
    ======================================================
    VALIDATE COMPANY
    ======================================================
    */

    select
        c.id

    into
        v_company_id

    from
        public.finova_companies c

    where
        c.id = p_company_id

        and c.status = 'ACTIVE';


    if v_company_id is null then

        raise exception
            'FINOVA: Company tidak ditemukan atau tidak aktif.';

    end if;


    /*
    ======================================================
    SAVE / CHANGE CONTEXT
    ======================================================
    */

    insert into
        public.finova_super_admin_context
        (
            user_uid,
            company_id,
            selected_at,
            updated_at
        )

    values
        (
            (select auth.uid()),
            v_company_id,
            now(),
            now()
        )

    on conflict
        (user_uid)

    do update set

        company_id =
            excluded.company_id,

        selected_at =
            now(),

        updated_at =
            now();


    return
        v_company_id;

end;

$$;


revoke all
on function
public.finova_super_admin_set_company_context(uuid)
from public;

grant execute
on function
public.finova_super_admin_set_company_context(uuid)
to authenticated;


/*
==========================================================
8. CLEAR SUPER ADMIN COMPANY CONTEXT
==========================================================
*/

create or replace function
public.finova_super_admin_clear_company_context()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$

begin

    /*
    ======================================================
    VALIDATE SUPER ADMIN
    ======================================================
    */

    if not public.is_finova_super_admin() then

        raise exception
            'FINOVA: Super Admin access required.';

    end if;


    /*
    ======================================================
    CLEAR CONTEXT
    ======================================================
    */

    delete from
        public.finova_super_admin_context

    where
        user_uid =
            (select auth.uid());


    return true;

end;

$$;


revoke all
on function
public.finova_super_admin_clear_company_context()
from public;

grant execute
on function
public.finova_super_admin_clear_company_context()
to authenticated;


/*
==========================================================
9. EFFECTIVE COMPANY ID
==========================================================

TENANT USER
----------------------------------------------------------
finova_current_company_id()

SUPER ADMIN
----------------------------------------------------------
finova_super_admin_company_context()

==========================================================
*/

create or replace function
public.finova_effective_company_id()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$

begin

    /*
    ======================================================
    SUPER ADMIN
    ======================================================
    */

    if public.is_finova_super_admin() then

        return
            public.finova_super_admin_company_context();

    end if;


    /*
    ======================================================
    TENANT USER
    ======================================================
    */

    return
        public.finova_current_company_id();

end;

$$;


revoke all
on function
public.finova_effective_company_id()
from public;

grant execute
on function
public.finova_effective_company_id()
to authenticated;


/*
==========================================================
END OF MIGRATION
==========================================================
*/