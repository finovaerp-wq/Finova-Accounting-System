/*
==========================================================
FINOVA ACCOUNTING SYSTEM
AUDIT TRIGGER
EFFECTIVE COMPANY CONTEXT

Migration : 031
==========================================================
*/


do $$

declare

    v_function_definition text;

    v_old_fragment text;

    v_new_fragment text;

begin

    /*
    ======================================================
    GET CURRENT FUNCTION DEFINITION
    ======================================================
    */

    select
        pg_get_functiondef(
            p.oid
        )

    into
        v_function_definition

    from pg_proc p

    join pg_namespace n
        on n.oid = p.pronamespace

    where n.nspname = 'public'

      and p.proname =
          'finova_audit_trigger'

      and p.prokind = 'f'

    limit 1;


    /*
    ======================================================
    FUNCTION MUST EXIST
    ======================================================
    */

    if v_function_definition is null then

        raise exception
            'FINOVA: finova_audit_trigger() not found.';

    end if;


    /*
    ======================================================
    OLD COMPANY FALLBACK
    ======================================================
    */

    v_old_fragment :=
        'public.finova_current_company_id()';


    /*
    ======================================================
    NEW COMPANY FALLBACK
    ======================================================
    */

    v_new_fragment :=
        'public.finova_effective_company_id()';


    /*
    ======================================================
    SAFETY CHECK

    Migration must fail instead of silently doing nothing
    if the expected old implementation is no longer there.
    ======================================================
    */

    if position(
        v_old_fragment
        in
        v_function_definition
    ) = 0 then

        raise exception
            'FINOVA: expected current-company fallback not found in finova_audit_trigger().';

    end if;


    /*
    ======================================================
    REPLACE COMPANY RESOLVER
    ======================================================
    */

    v_function_definition :=
        replace(
            v_function_definition,
            v_old_fragment,
            v_new_fragment
        );


    /*
    ======================================================
    APPLY UPDATED FUNCTION
    ======================================================
    */

    execute
        v_function_definition;

end;

$$;