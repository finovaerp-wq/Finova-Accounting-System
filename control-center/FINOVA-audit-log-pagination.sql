/* ==========================================================
   FINOVA CONTROL CENTER
   AUDIT LOG SERVER-SIDE PAGINATION
   100 RECORDS / PAGE
   ========================================================== */

create or replace function public.finova_admin_list_audit_logs_page(
    p_page integer default 1,
    p_page_size integer default 100,
    p_search text default null,
    p_action text default null,
    p_module text default 'ALL'
)
returns table (
    id uuid,
    company_id uuid,
    company_code text,
    company_name text,
    user_uid uuid,
    user_name text,
    user_role text,
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
    created_at timestamptz,
    remarks text,
    total_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_page integer;
    v_page_size integer;
    v_offset integer;
    v_search text;
    v_action text;
    v_module text;
begin

    if not exists (
        select 1
        from public.finova_super_admins sa
        where sa.user_uid = auth.uid()
          and sa.is_active = true
    ) then
        raise exception 'SUPER_ADMIN_REQUIRED';
    end if;

    v_page :=
        greatest(
            coalesce(p_page, 1),
            1
        );

    v_page_size :=
        least(
            greatest(
                coalesce(p_page_size, 100),
                1
            ),
            100
        );

    v_offset :=
        (v_page - 1) * v_page_size;

    v_search :=
        nullif(
            btrim(coalesce(p_search, '')),
            ''
        );

    v_action :=
        nullif(
            upper(btrim(coalesce(p_action, ''))),
            ''
        );

    v_module :=
        upper(
            btrim(
                coalesce(p_module, 'ALL')
            )
        );

    return query
    select
        a.id,
        a.company_id,
        c.company_code,
        c.company_name,
        a.user_uid,

        coalesce(
            u.full_name,
            case
                when a.user_uid is null then 'System'
                else a.user_uid::text
            end
        ) as user_name,

        u.role as user_role,

        a.module,
        a.table_name,
        a.record_id,
        a.document_no,
        a.action,
        a.old_data,
        a.new_data,
        a.source_module,
        a.source_id,
        a.source_no,
        a.created_at,
        a.remarks,

        count(*) over() as total_count

    from public.finova_audit_log a

    left join public.finova_companies c
        on c.id = a.company_id

    left join public.mst_users u
        on u.user_uid = a.user_uid

    where
        (
            v_module = 'ALL'
            or upper(coalesce(a.module, '')) = v_module
            or upper(coalesce(a.table_name, '')) = v_module
        )

        and (
            v_action is null
            or upper(coalesce(a.action, '')) = v_action
        )

        and (
            v_search is null
            or lower(
                concat_ws(
                    ' ',
                    c.company_code,
                    c.company_name,
                    a.company_id::text,
                    a.module,
                    a.table_name,
                    a.document_no,
                    a.source_no,
                    a.action,
                    u.full_name,
                    u.role,
                    a.user_uid::text,
                    a.record_id,
                    a.source_module,
                    a.source_id,
                    a.remarks
                )
            ) like
            '%' || lower(v_search) || '%'
        )

    order by
        a.created_at desc,
        a.id desc

    limit v_page_size
    offset v_offset;

end;
$$;

grant execute
on function public.finova_admin_list_audit_logs_page(
    integer,
    integer,
    text,
    text,
    text
)
to authenticated;
