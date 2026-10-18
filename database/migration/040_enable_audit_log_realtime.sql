/*
==========================================================
FINOVA ACCOUNTING SYSTEM
ENABLE AUDIT LOG SUPABASE REALTIME

Migration : 040
==========================================================
*/

do $$
begin

    /*
    ======================================================
    ADD TABLE TO SUPABASE REALTIME PUBLICATION

    Safe to run repeatedly:
    pg_publication_tables is checked first.
    ======================================================
    */

    if not exists (
        select
            1
        from
            pg_publication_tables
        where
            pubname = 'supabase_realtime'
            and schemaname = 'public'
            and tablename = 'finova_audit_log'
    ) then

        alter publication supabase_realtime
        add table public.finova_audit_log;

    end if;

end
$$;
