/*
==========================================================
FINOVA ACCOUNTING SYSTEM
CONTROL CENTER AUDIT LOG
SUPER ADMIN READ RPC

Migration : 039
==========================================================

PURPOSE
- Keep tenant RLS on public.finova_audit_log unchanged.
- Allow an authenticated FINOVA Super Admin to read Audit Log
  from Control Center without requiring tenant Company Context.
- Do not grant direct global SELECT access to the table.
==========================================================
*/

create or replace function public.finova_admin_list_audit_logs(
    p_limit integer default 200
)
returns table (
    id uuid,
    company_id uuid,
    user_uid uuid,
    module text,
    table_name text,
    record_id text,
    document_no text,
    action text,
    old_data jsonb,
    new_data jsonb,
    source_module text,
    source_id text,
    source_no text,
    created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_limit integer;
begin

    /*
    ======================================================
    SUPER ADMIN REQUIRED
    ======================================================
    */

    if not public.is_finova_super_admin() then
        raise exception
            'Access denied: FINOVA Super Admin required.';
    end if;


    /*
    ======================================================
    SAFE LIMIT
    ======================================================
    */

    v_limit :=
        least(
            greatest(
                coalesce(
                    p_limit,
                    200
                ),
                1
            ),
            500
        );


    /*
    ======================================================
    GLOBAL CONTROL CENTER AUDIT VIEW

    SECURITY DEFINER intentionally reads across tenant RLS,
    but only after is_finova_super_admin() succeeds.
    ======================================================
    */

    return query

    select
        a.id,
        a.company_id,
        a.user_uid,
        a.module,
        a.table_name,
        a.record_id::text,
        a.document_no,
        a.action,
        a.old_data,
        a.new_data,
        a.source_module,
        a.source_id::text,
        a.source_no,
        a.created_at

    from public.finova_audit_log a

    order by
        a.created_at desc

    limit
        v_limit;

end;
$$;


revoke all
on function public.finova_admin_list_audit_logs(integer)
from public;


grant execute
on function public.finova_admin_list_audit_logs(integer)
to authenticated;
