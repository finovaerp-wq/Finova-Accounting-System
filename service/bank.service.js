/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Bank Service
Version : 1.1.0
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";

export class BankService {

    static async getAll() {

        const { data, error } = await supabase
            .from(TABLE.BANK)
            .select("*")
            .eq("is_active", true)
            .order("bank_name", {
                ascending: true
            });

        if (error) {
            throw error;
        }

        return data || [];

    }

}
