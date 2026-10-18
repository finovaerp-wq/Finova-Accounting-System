/*
==========================================================
FINOVA ACCOUNTING SYSTEM
COMPANY CONTEXT SERVICE
Version : 2.0.0
==========================================================

NO SUPER ADMIN MODE
----------------------------------------------------------
All authenticated FINOVA users operate through their own
company membership. There is no global Super Admin company
selector or database-backed Super Admin context.
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
    GET AVAILABLE COMPANIES
    ======================================================

    In tenant mode the effective company comes from the
    authenticated user's company membership. Return that
    company only, so legacy callers remain safe without
    exposing a global company selector.
    ======================================================
    */

    static async getAvailableCompanies() {

        const companyId =
            await TenantContext.getCompanyId({
                refresh: true
            });

        if (!companyId) {
            return [];
        }

        const {
            data,
            error
        } = await supabase
            .from("finova_companies")
            .select(`
                id,
                company_code,
                company_name,
                legal_name,
                status
            `)
            .eq("id", companyId)
            .eq("status", "ACTIVE")
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data ? [data] : [];

    }


    /*
    ======================================================
    GET SELECTED COMPANY ID
    ======================================================
    */

    static async getSelectedCompanyId() {

        return await TenantContext.getCompanyId({
            refresh: true
        });

    }


    /*
    ======================================================
    GET SELECTED COMPANY
    ======================================================
    */

    static async getSelectedCompany() {

        const companyId =
            await this.getSelectedCompanyId();

        if (!companyId) {
            return null;
        }

        const {
            data,
            error
        } = await supabase
            .from("finova_companies")
            .select(`
                id,
                company_code,
                company_name,
                legal_name,
                status
            `)
            .eq("id", companyId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data ?? null;

    }


    /*
    ======================================================
    SELECT COMPANY
    ======================================================

    Tenant users cannot switch to another company through
    a global selector. The requested company must equal the
    user's effective membership company.
    ======================================================
    */

    static async selectCompany(companyId) {

        if (!companyId) {
            throw new Error(
                "FINOVA: Company ID is required."
            );
        }

        const effectiveCompanyId =
            await TenantContext.getCompanyId({
                refresh: true
            });

        if (!effectiveCompanyId) {
            throw new Error(
                "FINOVA: Company context is not assigned to this user."
            );
        }

        if (effectiveCompanyId !== companyId) {
            throw new Error(
                "FINOVA: You can only access your assigned company."
            );
        }

        return effectiveCompanyId;

    }


    /*
    ======================================================
    CLEAR COMPANY
    ======================================================

    Clearing a tenant company context is not permitted at
    database level. Only the local cache is cleared; the
    membership remains authoritative.
    ======================================================
    */

    static async clearCompany() {

        TenantContext.clear();

        return true;

    }

}
