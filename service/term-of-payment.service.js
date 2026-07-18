/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Term Of Payment Service
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";

export class TermOfPaymentService {

    static async getAll() {

    const { data, error } = await supabase
        .from(TABLE.TERM_OF_PAYMENT)
        .select("*");

    console.log("DATA :", data);
    console.log("ERROR :", error);

    return data;

}
}