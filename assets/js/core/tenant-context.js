/*
==========================================================
FINOVA TENANT CONTEXT
Multi Company Context
==========================================================
*/

import {
    supabase
} from "./supabase.js";


export class TenantContext {

    /*
    ======================================================
    CACHE
    ======================================================
    */

    static cache = undefined;

    static companyNameCache = undefined;


    static async getCompanyId({
    refresh = false
} = {}) {

    /*
    ======================================================
    RETURN CACHE
    ======================================================
    */

    if (
        !refresh
        &&
        this.cache !== undefined
    ) {

        return this.cache;

    }


    /*
    ======================================================
    GET EFFECTIVE COMPANY
    ======================================================

    TENANT USER
        -> finova_current_company_id()

    SUPER ADMIN
        -> selected company context

    ======================================================
    */

    const {
        data,
        error
    } = await supabase.rpc(
        "finova_effective_company_id"
    );


    /*
    ======================================================
    ERROR
    ======================================================
    */

    if (
        error
    ) {

        console.error(
            "FINOVA TENANT CONTEXT ERROR:",
            error
        );

        throw error;

    }


    /*
    ======================================================
    CACHE
    ======================================================
    */

    this.cache =
        data
        ??
        null;


    /*
    ======================================================
    DEBUG
    ======================================================
    */

    console.log(
        "FINOVA EFFECTIVE COMPANY ID:",
        this.cache
    );


    return this.cache;

}


    /*
    ======================================================
    GET CURRENT COMPANY NAME
    ======================================================
    */

    static async getCompanyName({
        refresh = false
    } = {}) {

        if (
            !refresh
            &&
            this.companyNameCache !== undefined
        ) {

            return this.companyNameCache;

        }


        // Resolve the active company with the existing tenant RPC,
        // then read its display name from finova_companies.
        // finova_current_company_name() is not installed in this database.
        const companyId = await this.getCompanyId({ refresh });

        if (!companyId) {
            this.companyNameCache = null;
            return null;
        }

        const {
            data,
            error
        } = await supabase
            .from("finova_companies")
            .select("company_name, legal_name")
            .eq("id", companyId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        this.companyNameCache =
            data?.company_name
            || data?.legal_name
            || null;

        return this.companyNameCache;

    }


    /*
    ======================================================
    CLEAR CACHE
    ======================================================
    */

    static clear() {

        this.cache = undefined;

        this.companyNameCache = undefined;

    }

}