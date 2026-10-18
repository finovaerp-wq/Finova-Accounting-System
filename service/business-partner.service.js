/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Business Partner Service
Version : 2.0.0
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";

export class BusinessPartnerService {

    /*
    ==========================================================
    GET ALL
    ==========================================================
    */

    static async getAll() {

        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER)

            .select(`
                *,
                mst_term_of_payment (
                    id,
                    top_code,
                    top_name,
                    days
                )
            `)

            .order("bp_code", {
                ascending: true
            });

        if (error) throw error;

        return data;

    }

    /*
    ==========================================================
    GET BY ID
    ==========================================================
    */

    static async getById(id) {

        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER)

            .select(`
                *,
                mst_term_of_payment (
                    id,
                    top_code,
                    top_name,
                    days
                )
            `)

            .eq("id", id)

            .single();

        if (error) throw error;

        return data;

    }

    /*
    ==========================================================
    SEARCH
    ==========================================================
    */

    static async search(

        keyword = "",

        type = "",

        status = ""

    ) {

        let query = supabase

            .from(TABLE.BUSINESS_PARTNER)

            .select(`
                *,
                mst_term_of_payment (
                    id,
                    top_code,
                    top_name,
                    days
                )
            `);

        if (keyword) {

            query = query.or(
                `bp_code.ilike.%${keyword}%,bp_name.ilike.%${keyword}%`
            );

        }

        if (type) {

            query = query.eq(
                "bp_type",
                type
            );

        }

        if (status !== "") {

            query = query.eq(
                "status",
                status === "true"
            );

        }

        query = query.order(
            "bp_code",
            {
                ascending: true
            }
        );

        const { data, error } = await query;

        if (error) throw error;

        return data;

    }

    /*
==========================================================
GENERATE BUSINESS PARTNER CODE
==========================================================
*/

static async generateCode(type) {

    let prefix = "CUS";

    switch (type) {

        case "Vendor":
            prefix = "VEN";
            break;

        case "Employee":
            prefix = "EMP";
            break;

        default:
            prefix = "CUS";

    }

    const { data, error } = await supabase
        .from(TABLE.BUSINESS_PARTNER)
        .select("bp_code")
        .like("bp_code", `${prefix}%`)
        .order("bp_code", {
            ascending: false
        })
        .limit(1);

    if (error) throw error;

    let number = 1;

    if (data.length > 0) {

        const lastCode = data[0].bp_code;

        number =
            parseInt(lastCode.substring(3), 10) + 1;

    }

    return `${prefix}${String(number).padStart(5, "0")}`;

}
    /*
    ==========================================================
    INSERT
    ==========================================================
    */

    static async insert(payload) {

        payload.created_at = new Date().toISOString();

        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER)

            .insert(payload)

            .select()

            .single();

        if (error) throw error;

        return data;

    }

   
    /*
==========================================================
UPDATE
==========================================================
*/

static async update(id, payload) {

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase

        .from(TABLE.BUSINESS_PARTNER)

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

            .from(TABLE.BUSINESS_PARTNER)

            .delete()

            .eq("id", id);

        if (error) throw error;

        return true;

    }

    /*
    ==========================================================
    CHECK DUPLICATE CODE
    ==========================================================
    */

    static async isCodeExists(

        code,

        excludeId = null

    ) {

        let query = supabase

            .from(TABLE.BUSINESS_PARTNER)

            .select("id")

            .eq("bp_code", code);

        if (excludeId) {

            query = query.neq(
                "id",
                excludeId
            );

        }

        const { data, error } = await query;

        if (error) throw error;

        return data.length > 0;

    }

}