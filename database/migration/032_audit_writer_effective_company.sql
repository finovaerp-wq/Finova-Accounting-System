/*
==========================================================
FINOVA ACCOUNTING SYSTEM
AUDIT WRITER
EFFECTIVE COMPANY CONTEXT

Migration : 032
==========================================================
*/


create or replace function public.finova_write_audit_log(

    p_company_id uuid,

    p_module text,

    p_table_name text,

    p_record_id text,

    p_document_no text,

    p_action text,

    p_old_data jsonb default null::jsonb,

    p_new_data jsonb default null::jsonb,

    p_source_module text default null::text,

    p_source_id text default null::text,

    p_source_no text default null::text

)

returns uuid

language plpgsql

security definer

set search_path = ''

as $$

declare

    v_user_uid uuid;

    v_audit_id uuid;

    v_effective_company_id uuid;

begin

    /*
    ======================================================
    CURRENT USER
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

    if nullif(
        trim(p_module),
        ''
    ) is null then

        raise exception
            'Audit module is required.';

    end if;


    if nullif(
        trim(p_table_name),
        ''
    ) is null then

        raise exception
            'Audit table_name is required.';

    end if;


    if nullif(
        trim(p_action),
        ''
    ) is null then

        raise exception
            'Audit action is required.';

    end if;


    /*
    ======================================================
    EFFECTIVE COMPANY CONTEXT

    Normal tenant:
        effective company = tenant company

    Super Admin:
        effective company = selected Company Context

    No Company:
        effective company = null
    ======================================================
    */

    v_effective_company_id :=
        public.finova_effective_company_id();


    /*
    ======================================================
    COMPANY REQUIRED

    Accounting audit writer must never create
    a tenant audit row without an active/effective company.
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

    This applies equally to:

    - Tenant user
    - Super Admin operating Accounting System

    Therefore Super Admin cannot bypass selected
    Company Context through this writer.
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
    INSERT APPEND-ONLY AUDIT LOG
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
            trim(p_module)
        ),

        lower(
            trim(p_table_name)
        ),

        nullif(
            trim(p_record_id),
            ''
        ),

        nullif(
            trim(p_document_no),
            ''
        ),

        upper(
            trim(p_action)
        ),

        p_old_data,

        p_new_data,

        nullif(
            upper(
                trim(p_source_module)
            ),
            ''
        ),

        nullif(
            trim(p_source_id),
            ''
        ),

        nullif(
            trim(p_source_no),
            ''
        )

    )

    returning id
    into v_audit_id;


    /*
    ======================================================
    RETURN AUDIT ID
    ======================================================
    */

    return v_audit_id;

end;

$$;