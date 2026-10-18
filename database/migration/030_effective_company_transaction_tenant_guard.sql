/*
==========================================================
FINOVA ACCOUNTING SYSTEM
EFFECTIVE COMPANY
TRANSACTION TENANT GUARD

Migration : 030
==========================================================
*/


create or replace function public.finova_transaction_tenant_guard()
returns trigger

language plpgsql

security definer

set search_path = ''

as $$

declare

    v_company_id uuid;

begin

    /*
    ======================================================
    EFFECTIVE COMPANY CONTEXT

    TENANT USER
    → current tenant company

    SUPER ADMIN
    → selected Company Context
    ======================================================
    */

    v_company_id :=
        public.finova_effective_company_id();


    /*
    ======================================================
    COMPANY CONTEXT REQUIRED
    ======================================================
    */

    if v_company_id is null then

        raise exception
            'FINOVA: company context aktif tidak ditemukan.';

    end if;


    /*
    ======================================================
    INSERT
    ======================================================
    */

    if tg_op = 'INSERT' then

        /*
        --------------------------------------------------
        AUTO ASSIGN COMPANY
        --------------------------------------------------
        */

        if new.company_id is null then

            new.company_id :=
                v_company_id;


        /*
        --------------------------------------------------
        BLOCK CROSS-COMPANY INSERT
        --------------------------------------------------
        */

        elsif new.company_id
              is distinct from
              v_company_id then

            raise exception
                'FINOVA: cross-company transaction tidak diizinkan.';

        end if;


        return new;

    end if;


    /*
    ======================================================
    UPDATE
    ======================================================
    */

    if tg_op = 'UPDATE' then

        /*
        --------------------------------------------------
        EXISTING TRANSACTION MUST BELONG
        TO EFFECTIVE COMPANY
        --------------------------------------------------
        */

        if old.company_id
           is distinct from
           v_company_id then

            raise exception
                'FINOVA: transaksi berasal dari company lain.';

        end if;


        /*
        --------------------------------------------------
        COMPANY_ID CANNOT BE CHANGED
        --------------------------------------------------
        */

        if new.company_id
           is distinct from
           old.company_id then

            raise exception
                'FINOVA: company_id transaksi tidak boleh dipindahkan.';

        end if;


        return new;

    end if;


    /*
    ======================================================
    DELETE
    ======================================================
    */

    if tg_op = 'DELETE' then

        if old.company_id
           is distinct from
           v_company_id then

            raise exception
                'FINOVA: transaksi berasal dari company lain.';

        end if;


        return old;

    end if;


    /*
    ======================================================
    FALLBACK
    ======================================================
    */

    return new;

end;

$$;