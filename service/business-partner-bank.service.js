/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Business Partner Bank Service
Version : 1.0.0
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
        bank_name
    )
`)

            .eq("bp_id", bpId)

            .eq("status", true)

            .order("is_default", {
    ascending: false
});

        if (error) {

            throw error;

        }

        return data;

    }

    /*
    ==========================================================
    GET BY ID
    ==========================================================
    */

    static async getById(id) {

        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .select("*")

            .eq("id", id)

            .single();

        if (error) {

            throw error;

        }

        return data;
        

    }
    /*
==========================================================
INSERT
==========================================================
*/

static async insert(data) {

    const { error } = await supabase

        .from(TABLE.CHART_OF_ACCOUNTS)

        .insert([data]);

    if (error) {

        throw error;

    }

    return true;

}

    /*
    ==========================================================
    INSERT
    ==========================================================
    */

    static async insert(payload) {

        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .insert([payload])

            .select()

            .single();

        if (error) {

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

        payload.updated_at =
            new Date().toISOString();

        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .update(payload)

            .eq("id", id)

            .select()

            .single();

        if (error) {

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

        await this.deleteByBusinessPartner(bpId);

        if (!banks || banks.length === 0) {

            return true;

        }

        const payload = banks.map(bank => ({

    bp_id: bpId,

    bank_id: bank.bank_id,

    account_name: bank.account_name,

    account_number: bank.account_number,

    branch: bank.branch ?? "",

    purpose: bank.purpose ?? "Both",

    is_default: bank.is_default ?? false,

    status: true

}));

        const { error } = await supabase

            .from(TABLE.BUSINESS_PARTNER_BANK)

            .insert(payload);

        if (error) {

            throw error;

        }

        return true;

    }

}