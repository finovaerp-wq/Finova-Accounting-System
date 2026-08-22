/*
===========================================
FINOVA ACCOUNTING SYSTEM
Supabase Configuration
Version : 1.0.0
===========================================
*/

import { createClient } from
    "https://esm.sh/@supabase/supabase-js";

/*
===========================================
SUPABASE CONFIGURATION
===========================================
*/

const SUPABASE_URL =
"https://rzirphjklgvhntewiixx.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_NHd4larL4DVPq37D1K8H_Q_cLrhP8Op";

/*
===========================================
CREATE CLIENT
===========================================
*/

export const supabase = createClient(

    SUPABASE_URL,

    SUPABASE_ANON_KEY,

    {

        auth: {

            persistSession: true,

            autoRefreshToken: true,

            detectSessionInUrl: true

        }

    }

);
/*
======================================================
DEBUG SUPABASE AUTH SESSION
======================================================
*/

supabase.auth.getSession()
    .then(({ data, error }) => {

        console.log(
            "FINOVA SUPABASE SESSION:",
            data?.session
        );

        console.log(
            "FINOVA SUPABASE USER:",
            data?.session?.user
        );

        console.log(
            "FINOVA SUPABASE AUTH ERROR:",
            error
        );

    });

/*
===========================================
DATABASE TABLE
===========================================
*/

export const TABLE = {

    /*
    =======================================
    MASTER
    =======================================
    */

    USERS:
        "mst_users",

    BUSINESS_PARTNER:
        "mst_business_partner",

    BUSINESS_PARTNER_BANK:
        "mst_business_partner_bank",

    TERM_OF_PAYMENT:
        "mst_term_of_payment",

    BANK:
        "mst_bank",

    CHART_OF_ACCOUNTS:
        "mst_chart_of_accounts",

    TAX:
        "mst_taxes",


    /*
    =======================================
    GENERAL LEDGER
    =======================================
    */

    GL_JOURNAL:
        "trx_gl_journal",

    GL_JOURNAL_DETAIL:
        "trx_gl_journal_detail",


    /*
    =======================================
    ACCOUNT PAYABLE
    =======================================
    */

    ACCOUNT_PAYABLE:
        "trx_account_payable",

    ACCOUNT_PAYABLE_DETAIL:
        "trx_account_payable_detail",


    /*
    =======================================
    ACCOUNT RECEIVABLE
    =======================================
    */

    ACCOUNT_RECEIVABLE:
        "trx_account_receivable",

    ACCOUNT_RECEIVABLE_DETAIL:
        "trx_account_receivable_detail",

    ACCOUNT_RECEIVABLE_PAYMENT:
        "trx_account_receivable_payment",


    /*
    =======================================
    PAYMENT MODULE
    =======================================
    */

    AP_PAYMENT:
        "trx_ap_payment",

    AR_PAYMENT:
        "trx_ar_payment"

};
/*
===========================================
SYSTEM CONFIGURATION
===========================================
*/

export const CONFIG = {

    APP_NAME: "FINOVA Accounting System",

    VERSION: "1.0.0",

    PAGE_SIZE: 20,

    DATE_FORMAT: "YYYY-MM-DD",

    DATETIME_FORMAT: "YYYY-MM-DD HH:mm:ss",

    CURRENCY: "IDR",

    DECIMAL: 2

};
console.log("==================================");
console.log("FINOVA SUPABASE CONNECTED");
console.log("URL :", SUPABASE_URL);
console.log("==================================");