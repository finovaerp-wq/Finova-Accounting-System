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


        const {
            data,
            error
        } = await supabase.rpc(
            "finova_current_company_name"
        );


        if (
            error
        ) {

            throw error;

        }


        this.companyNameCache =
            data
            ??
            null;


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