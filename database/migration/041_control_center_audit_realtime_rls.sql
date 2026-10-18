/*
==========================================================
FINOVA ACCOUNTING SYSTEM

CONTROL CENTER
AUDIT LOG REALTIME RLS

Migration : 041
==========================================================

PURPOSE

TENANT USER
-> hanya dapat SELECT audit company aktif

SUPER ADMIN
-> dapat SELECT seluruh Audit Log
-> dibutuhkan oleh Supabase Realtime postgres_changes
   pada Control Center

IMPORTANT
-> hanya SELECT policy yang berubah
-> INSERT / UPDATE / DELETE tidak dibuka
-> audit writer tetap menggunakan mekanisme existing
==========================================================
*/


/*
==========================================================
DROP CURRENT AUDIT SELECT POLICY
==========================================================
*/

drop policy if exists
    finova_audit_log_select
on
    public.finova_audit_log;


/*
==========================================================
CREATE FINAL AUDIT SELECT POLICY
==========================================================
*/

create policy finova_audit_log_select
on public.finova_audit_log

for select

to authenticated

using (

    /*
    ======================================================
    CONTROL CENTER SUPER ADMIN

    Super Admin may read all companies.

    This is required because Supabase Realtime evaluates
    SELECT/RLS visibility before delivering
    postgres_changes events.
    ======================================================
    */

    public.is_finova_super_admin()

    OR

    /*
    ======================================================
    NORMAL TENANT USER

    Only audit records belonging to the currently
    effective company are visible.
    ======================================================
    */

    company_id =
        public.finova_effective_company_id()

);