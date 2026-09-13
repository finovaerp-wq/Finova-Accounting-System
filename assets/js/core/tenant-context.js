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


    /*
    ======================================================
    GET CURRENT COMPANY ID
    ======================================================
    */

    static async getCompanyId({
        refresh = false
    } = {}) {

        if (
            !refresh
            &&
            this.cache !== undefined
        ) {

            return this.cache;

        }


        const {
            data,
            error
        } = await supabase.rpc(
            "finova_current_company_id"
        );


        if (
            error
        ) {

            throw error;

        }


        this.cache =
            data
            ??
            null;


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