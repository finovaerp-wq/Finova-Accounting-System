/*
==========================================================
FINOVA ACCOUNTING SYSTEM
COMPANY CONTEXT SERVICE
Version : 1.0.0
==========================================================

PURPOSE
----------------------------------------------------------
Mengelola selected company context untuk FINOVA Super Admin.

TENANT USER
----------------------------------------------------------
Tetap menggunakan company membership existing.

SUPER ADMIN
----------------------------------------------------------
Dapat memilih satu ACTIVE company sebagai accounting
company context.

IMPORTANT
----------------------------------------------------------
Service ini TIDAK mengubah membership company.
==========================================================
*/


import {
    supabase
} from "../assets/js/core/supabase.js";


import {
    TenantContext
} from "../assets/js/core/tenant-context.js";


export class CompanyContextService {


    /*
    ======================================================
    CHECK SUPER ADMIN
    ======================================================
    */

    static async isSuperAdmin() {

        const {
            data,
            error
        } = await supabase.rpc(
            "is_finova_super_admin"
        );


        if (
            error
        ) {

            console.error(
                "CompanyContextService.isSuperAdmin:",
                error
            );

            throw error;

        }


        return (
            data === true
        );

    }


    /*
    ======================================================
    GET AVAILABLE COMPANIES
    ======================================================

    Hanya digunakan oleh FINOVA Super Admin.

    Company yang dapat dipilih:
    - status ACTIVE

    ======================================================
    */

    static async getAvailableCompanies() {

        /*
        ==================================================
        SECURITY CHECK
        ==================================================
        */

        const isSuperAdmin =
            await this.isSuperAdmin();


        if (
            !isSuperAdmin
        ) {

            throw new Error(
                "FINOVA: Super Admin access required."
            );

        }


        /*
        ==================================================
        GET ACTIVE COMPANIES
        ==================================================
        */

        const {
            data,
            error
        } = await supabase

            .from(
                "finova_companies"
            )

            .select(`
                id,
                company_code,
                company_name,
                legal_name,
                status
            `)

            .eq(
                "status",
                "ACTIVE"
            )

            .order(
                "company_name",
                {
                    ascending: true
                }
            );


        if (
            error
        ) {

            console.error(
                "CompanyContextService.getAvailableCompanies:",
                error
            );

            throw error;

        }


        return (
            data
            ??
            []
        );

    }


    /*
    ======================================================
    GET SELECTED COMPANY ID
    ======================================================
    */

    static async getSelectedCompanyId() {

        const isSuperAdmin =
            await this.isSuperAdmin();


        /*
        ==================================================
        TENANT USER
        ==================================================

        Untuk tenant biasa, effective company berasal dari
        company membership existing.

        ==================================================
        */

        if (
            !isSuperAdmin
        ) {

            return await TenantContext.getCompanyId({
                refresh: true
            });

        }


        /*
        ==================================================
        SUPER ADMIN
        ==================================================
        */

        const {
            data,
            error
        } = await supabase.rpc(
            "finova_super_admin_company_context"
        );


        if (
            error
        ) {

            console.error(
                "CompanyContextService.getSelectedCompanyId:",
                error
            );

            throw error;

        }


        return (
            data
            ??
            null
        );

    }


    /*
    ======================================================
    GET SELECTED COMPANY
    ======================================================
    */

    static async getSelectedCompany() {

        const companyId =
            await this.getSelectedCompanyId();


        if (
            !companyId
        ) {

            return null;

        }


        const {
            data,
            error
        } = await supabase

            .from(
                "finova_companies"
            )

            .select(`
                id,
                company_code,
                company_name,
                legal_name,
                status
            `)

            .eq(
                "id",
                companyId
            )

            .maybeSingle();


        if (
            error
        ) {

            console.error(
                "CompanyContextService.getSelectedCompany:",
                error
            );

            throw error;

        }


        return (
            data
            ??
            null
        );

    }


    /*
    ======================================================
    SELECT COMPANY
    ======================================================
    */

    static async selectCompany(
        companyId
    ) {

        /*
        ==================================================
        VALIDATE
        ==================================================
        */

        if (
            !companyId
        ) {

            throw new Error(
                "FINOVA: Company ID is required."
            );

        }


        /*
        ==================================================
        SECURITY CHECK
        ==================================================
        */

        const isSuperAdmin =
            await this.isSuperAdmin();


        if (
            !isSuperAdmin
        ) {

            throw new Error(
                "FINOVA: Super Admin access required."
            );

        }


        /*
        ==================================================
        SET DATABASE CONTEXT
        ==================================================
        */

        const {
            data,
            error
        } = await supabase.rpc(
            "finova_super_admin_set_company_context",
            {
                p_company_id:
                    companyId
            }
        );


        if (
            error
        ) {

            console.error(
                "CompanyContextService.selectCompany:",
                error
            );

            throw error;

        }


        /*
        ==================================================
        CLEAR TENANT CACHE
        ==================================================

        Sangat penting.

        Jika sebelumnya Company A tersimpan dalam cache,
        kemudian Super Admin pindah ke Company B,
        aplikasi tidak boleh tetap memakai Company A.

        ==================================================
        */

        TenantContext.clear();


        /*
        ==================================================
        RELOAD EFFECTIVE COMPANY
        ==================================================
        */

        const effectiveCompanyId =
            await TenantContext.getCompanyId({
                refresh: true
            });


        /*
        ==================================================
        SECURITY VALIDATION
        ==================================================
        */

        if (
            effectiveCompanyId !== data
        ) {

            throw new Error(
                "FINOVA: Company context validation failed."
            );

        }


        console.log(
            "FINOVA SUPER ADMIN COMPANY CONTEXT:",
            effectiveCompanyId
        );


        return effectiveCompanyId;

    }


    /*
    ======================================================
    CLEAR COMPANY CONTEXT
    ======================================================
    */

    static async clearCompany() {

        /*
        ==================================================
        SECURITY CHECK
        ==================================================
        */

        const isSuperAdmin =
            await this.isSuperAdmin();


        if (
            !isSuperAdmin
        ) {

            /*
            ==================================================
            Tenant user tidak mempunyai Super Admin context.
            Cukup bersihkan local cache.
            ==================================================
            */

            TenantContext.clear();

            return true;

        }


        /*
        ==================================================
        CLEAR DATABASE CONTEXT
        ==================================================
        */

        const {
            data,
            error
        } = await supabase.rpc(
            "finova_super_admin_clear_company_context"
        );


        if (
            error
        ) {

            console.error(
                "CompanyContextService.clearCompany:",
                error
            );

            throw error;

        }


        /*
        ==================================================
        CLEAR LOCAL CACHE
        ==================================================
        */

        TenantContext.clear();


        console.log(
            "FINOVA SUPER ADMIN COMPANY CONTEXT: CLEARED"
        );


        return (
            data === true
        );

    }

}