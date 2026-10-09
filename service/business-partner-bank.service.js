/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Business Partner Bank Service
Version : 1.1.0
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";


export class BusinessPartnerBankService {

    /*
    ==========================================================
    GET BANK BY BUSINESS PARTNER
    ==========================================================
    */

    static async getByBusinessPartner(bpId) {

        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .select(`
                *,
                mst_bank (
                    id,
                    bank_code,
                    bank_name
                )
            `)

            .eq("bp_id", bpId)

            .eq("is_active", true)

            .order("is_primary", {
                ascending: false
            })

            .order("id", {
                ascending: true
            });


        if (error) {

            console.error(
                "BusinessPartnerBankService.getByBusinessPartner:",
                error
            );

            throw error;

        }


        return data || [];

    }


    /*
    ==========================================================
    GET BY ID
    ==========================================================
    */

    static async getById(id) {

        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .select(`
                *,
                mst_bank (
                    id,
                    bank_code,
                    bank_name
                )
            `)

            .eq("id", id)

            .single();


        if (error) {

            console.error(
                "BusinessPartnerBankService.getById:",
                error
            );

            throw error;

        }


        return data;

    }


    /*
    ==========================================================
    INSERT
    ==========================================================
    */

    static async insert(payload) {

        const insertPayload = {

            bp_id:
                payload.bp_id,

            bank_id:
                payload.bank_id,

            account_name:
                payload.account_name,

            account_number:
                payload.account_number,

            branch_name:
                payload.branch_name ?? null,

            currency:
                payload.currency ?? "IDR",

            is_primary:
                payload.is_primary ?? false,

            is_active:
                payload.is_active ?? true,

            remarks:
                payload.remarks ?? null

        };


        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .insert([insertPayload])

            .select()

            .single();


        if (error) {

            console.error(
                "BusinessPartnerBankService.insert:",
                error
            );

            throw error;

        }


        return data;

    }


    /*
    ==========================================================
    UPDATE
    ==========================================================
    */

    static async update(id, payload) {

        const updatePayload = {

            bank_id:
                payload.bank_id,

            account_name:
                payload.account_name,

            account_number:
                payload.account_number,

            branch_name:
                payload.branch_name ?? null,

            currency:
                payload.currency ?? "IDR",

            is_primary:
                payload.is_primary ?? false,

            is_active:
                payload.is_active ?? true,

            remarks:
                payload.remarks ?? null,

            updated_at:
                new Date().toISOString()

        };


        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .update(updatePayload)

            .eq("id", id)

            .select()

            .single();


        if (error) {

            console.error(
                "BusinessPartnerBankService.update:",
                error
            );

            throw error;

        }


        return data;

    }


    /*
    ==========================================================
    DELETE
    ==========================================================
    */

    static async delete(id) {

        const { error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .delete()

            .eq("id", id);


        if (error) {

            console.error(
                "BusinessPartnerBankService.delete:",
                error
            );

            throw error;

        }


        return true;

    }


    /*
    ==========================================================
    DELETE ALL BANK BY BUSINESS PARTNER
    ==========================================================
    */

    static async deleteByBusinessPartner(bpId) {

        const { error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .delete()

            .eq("bp_id", bpId);


        if (error) {

            console.error(
                "BusinessPartnerBankService.deleteByBusinessPartner:",
                error
            );

            throw error;

        }


        return true;

    }


    /*
    ==========================================================
    SAVE MULTIPLE BANK ACCOUNT
    ==========================================================
    */

    static async saveBanks(bpId, banks) {

        /*
        ------------------------------------------------------
        DELETE EXISTING BANK ACCOUNT
        ------------------------------------------------------
        */

        await this.deleteByBusinessPartner(bpId);


        /*
        ------------------------------------------------------
        NO BANK ACCOUNT
        ------------------------------------------------------
        */

        if (
            !Array.isArray(banks) ||
            banks.length === 0
        ) {

            return true;

        }


        /*
        ------------------------------------------------------
        PREPARE PAYLOAD
        ------------------------------------------------------

        Frontend field       -> Database field

        bank_id              -> bank_id
        account_name         -> account_name
        account_number       -> account_number
        branch               -> branch_name
        purpose              -> remarks
        is_default           -> is_primary
        status               -> is_active
        ------------------------------------------------------
        */

        const payload = banks.map(bank => ({

            bp_id:
                bpId,

            bank_id:
                bank.bank_id,

            account_name:
                bank.account_name,

            account_number:
                bank.account_number,

            branch_name:
                bank.branch ?? null,

            currency:
                bank.currency ?? "IDR",

            is_primary:
                bank.is_default === true,

            is_active:
                bank.status !== false,

            remarks:
                bank.purpose ?? null

        }));


        /*
        ------------------------------------------------------
        INSERT ALL BANK ACCOUNT
        ------------------------------------------------------
        */

        const { error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .insert(payload);


        if (error) {

            console.error(
                "BusinessPartnerBankService.saveBanks:",
                error
            );

            throw error;

        }


        return true;

    }

}