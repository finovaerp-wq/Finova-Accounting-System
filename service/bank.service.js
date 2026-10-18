/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Bank Service
Version : 1.0.0
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";

export class BankService {

    /*
    ==========================================================
    GET ALL ACTIVE BANK
    ==========================================================
    */

    static async getAll() {

        const { data, error } = await supabase
            .from(TABLE.BANK)
            .select("*")
            .eq("status", true)
            .order("bank_name", {
                ascending: true
            });

        if (error) {
            throw error;
        }

        return data;

    }

}