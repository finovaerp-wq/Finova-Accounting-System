/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MIGRATION : 006
MODULE    : USER MANAGEMENT MULTI-COMPANY ISOLATION
PURPOSE   :
- Isolate mst_users by company_id
- Allow each user to read own profile
- Allow users to read users in their active company only
- Allow active Manager to update users in own company only
- Browser INSERT / DELETE are blocked; use Edge Function
==========================================================
*/

begin;

/* ==========================================================
   PREREQUISITES
========================================================== */

do $$
begin
    if to_regclass('public.mst_users') is null then
        raise exception 'Required table public.mst_users was not found.';
    end if;

    if to_regclass('public.finova_companies') is null then
        raise exception 'Run Control Center Tahap 2 migration first: public.finova_companies not found.';
    end if;

    if to_regclass('public.finova_company_users') is null then
        raise exception 'Run Control Center Tahap 2 migration first: public.finova_company_users not found.';
    end if;

    if to_regprocedure('public.finova_current_company_id()') is null then
        raise exception 'Required function public.finova_current_company_id() was not found.';
    end if;

    if to_regprocedure('public.is_finova_super_admin()') is null then
        raise exception 'Required function public.is_finova_super_admin() was not found.';
    end if;
end;
$$;


/* ==========================================================
   ENSURE COMPANY COLUMN + INDEX
========================================================== */

alter table public.mst_users
    add column if not exists company_id uuid null
    references public.finova_companies(id)
    on delete set null;

create index if not exists idx_mst_users_company_id
    on public.mst_users(company_id);

create index if not exists idx_mst_users_company_status
    on public.mst_users(company_id, status);


/* ==========================================================
   CURRENT COMPANY MANAGER HELPER
   SECURITY DEFINER avoids recursive RLS policy checks.
========================================================== */

create or replace function public.finova_is_current_company_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.mst_users u
        where u.user_uid = (select auth.uid())
          and u.company_id = public.finova_current_company_id()
          and lower(coalesce(u.role, '')) = 'manager'
          and u.status = true
    );
$$;

revoke all on function public.finova_is_current_company_manager() from public;
grant execute on function public.finova_is_current_company_manager() to authenticated;


/* ==========================================================
   RLS
========================================================== */

alter table public.mst_users enable row level security;

/*
Remove existing mst_users policies so an old permissive policy
cannot bypass company isolation.
*/
do $$
declare
    p record;
begin
    for p in
        select policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = 'mst_users'
    loop
        execute format(
            'drop policy if exists %I on public.mst_users',
            p.policyname
        );
    end loop;
end;
$$;


/*
SELECT:
- FINOVA Super Admin can read all.
- User can always read own profile (needed for access bootstrap).
- Authenticated tenant user can read only same company.
*/
create policy finova_mst_users_select
on public.mst_users
for select
to authenticated
using (
    public.is_finova_super_admin()
    or user_uid = (select auth.uid())
    or (
        company_id is not null
        and company_id = public.finova_current_company_id()
    )
);


/*
UPDATE:
- FINOVA Super Admin can update all.
- Active Manager can update only rows belonging to own company.
- WITH CHECK prevents company_id from being moved to another tenant.
*/
create policy finova_mst_users_update
on public.mst_users
for update
to authenticated
using (
    public.is_finova_super_admin()
    or (
        public.finova_is_current_company_manager()
        and company_id = public.finova_current_company_id()
    )
)
with check (
    public.is_finova_super_admin()
    or (
        public.finova_is_current_company_manager()
        and company_id = public.finova_current_company_id()
    )
);


/* ==========================================================
   PRIVILEGES
   CREATE / DELETE are server-side only via Edge Function.
========================================================== */

grant select, update on public.mst_users to authenticated;
revoke insert, delete on public.mst_users from authenticated;


/* ==========================================================
   DIAGNOSTIC RPC
   Useful for testing from browser session.
========================================================== */

create or replace function public.finova_user_management_tenant_status()
returns table (
    current_company_id uuid,
    visible_users bigint,
    foreign_company_users_visible bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
    select
        public.finova_current_company_id() as current_company_id,
        count(*)::bigint as visible_users,
        count(*) filter (
            where company_id is distinct from public.finova_current_company_id()
        )::bigint as foreign_company_users_visible
    from public.mst_users;
$$;

revoke all on function public.finova_user_management_tenant_status() from public;
grant execute on function public.finova_user_management_tenant_status() to authenticated;

commit;
