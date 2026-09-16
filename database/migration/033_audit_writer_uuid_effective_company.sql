/*
==========================================================
FINOVA ACCOUNTING SYSTEM
AUDIT WRITER UUID OVERLOAD
EFFECTIVE COMPANY CONTEXT

Migration : 033
==========================================================
*/


create or replace function public.finova_write_audit_log(

    p_company_id uuid,

    p_module text,

    p_table_name text,

    p_record_id uuid,

    p_document_no text,

    p_action text,

    p_old_data jsonb default null::jsonb,

    p_new_data jsonb default null::jsonb,

    p_source_module text default null::text,

    p_source_id uuid default null::uuid,

    p_source_no text default null::text

)

returns uuid

language plpgsql

security definer

set search_path = ''

as $$

declare

    v_id uuid;

    v_user_uid uuid;

    v_effective_company_id uuid;

begin

    /*
    ======================================================
    USER CONTEXT
    ======================================================
    */

    v_user_uid :=
        auth.uid();


    /*
    ======================================================
    AUTHENTICATED USER REQUIRED
    ======================================================
    */

    if v_user_uid is null then

        raise exception
            'Authenticated user is required for audit log.';

    end if;


    /*
    ======================================================
    BASIC VALIDATION
    ======================================================
    */

    if p_module is null
       or btrim(p_module) = '' then

        raise exception
            'Audit module is required.';

    end if;


    if p_table_name is null
       or btrim(p_table_name) = '' then

        raise exception
            'Audit table_name is required.';

    end if;


    if p_action is null
       or btrim(p_action) = '' then

        raise exception
            'Audit action is required.';

    end if;


    /*
    ======================================================
    EFFECTIVE COMPANY CONTEXT

    Tenant:
        tenant company

    Super Admin:
        selected Company Context

    Super Admin without company:
        null
    ======================================================
    */

    v_effective_company_id :=
        public.finova_effective_company_id();


    /*
    ======================================================
    COMPANY REQUIRED
    ======================================================
    */

    if p_company_id is null then

        raise exception
            'Audit company_id is required.';

    end if;


    if v_effective_company_id is null then

        raise exception
            'Effective company could not be resolved for audit activity.';

    end if;


    /*
    ======================================================
    COMPANY SAFETY
    ======================================================
    */

    if p_company_id
       is distinct from
       v_effective_company_id then

        raise exception
            'Audit company does not match effective company context.';

    end if;


    /*
    ======================================================
    WRITE AUDIT LOG
    ======================================================
    */

    insert into public.finova_audit_log (

        company_id,

        user_uid,

        module,

        table_name,

        record_id,

        document_no,

        action,

        old_data,

        new_data,

        source_module,

        source_id,

        source_no

    )

    values (

        p_company_id,

        v_user_uid,

        upper(
            btrim(p_module)
        ),

        lower(
            btrim(p_table_name)
        ),

        p_record_id,

        nullif(
            btrim(p_document_no),
            ''
        ),

        upper(
            btrim(p_action)
        ),

        p_old_data,

        p_new_data,

        nullif(
            upper(
                btrim(p_source_module)
            ),
            ''
        ),

        p_source_id,

        nullif(
            btrim(p_source_no),
            ''
        )

    )

    returning id
    into v_id;


    /*
    ======================================================
    RETURN AUDIT ID
    ======================================================
    */

    return v_id;

end;

$$;