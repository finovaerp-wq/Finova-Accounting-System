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

// Keep the two Vercel deployments connected to their own Supabase projects.
// The old Accounting System domain stays on its original database; all other
// hosts (including finova-accounting-erp.vercel.app) use Manufacturing ERP.
const IS_LEGACY_ACCOUNTING_DOMAIN =
    window.location.hostname === "finova-accounting-system.vercel.app";

const SUPABASE_URL = IS_LEGACY_ACCOUNTING_DOMAIN
    ? "https://rzirphjklgvhntewiixx.supabase.co"
    : "https://bqcupgoylxvxbyymomjw.supabase.co";

const SUPABASE_ANON_KEY = IS_LEGACY_ACCOUNTING_DOMAIN
    ? "sb_publishable_NHd4larL4DVPq37D1K8H_Q_cLrhP8Op"
    : "sb_publishable_xTpK998Tvm0JmMo9ciLT8Q_otdrwVYc";

/*
===========================================
CREATE CLIENT
===========================================
*/

const FINOVA_REMEMBER_SESSION_KEY = "finova_remember_session";

// Legacy accounts default to persistent sessions to avoid unexpectedly
// signing existing users out during the first release of this change.
const shouldPersistAuthSession = () => {
    const setting = localStorage.getItem(FINOVA_REMEMBER_SESSION_KEY);
    return setting === null ? true : setting === "true";
};

// Supabase calls this adapter for auth-token persistence. The selected storage
// is read dynamically, allowing the login checkbox to choose localStorage
// (remembered session) or sessionStorage (current browser session only).
const finovaAuthStorage = {
    getItem(key) {
        const store = shouldPersistAuthSession() ? localStorage : sessionStorage;
        return store.getItem(key);
    },
    setItem(key, value) {
        const persist = shouldPersistAuthSession();
        const target = persist ? localStorage : sessionStorage;
        const other = persist ? sessionStorage : localStorage;
        other.removeItem(key);
        target.setItem(key, value);
    },
    removeItem(key) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    }
};

export function setAuthPersistence(remember) {
    localStorage.setItem(FINOVA_REMEMBER_SESSION_KEY, remember ? "true" : "false");

    // Clear the token from the opposite store before the next login writes it.
    // Supabase's in-memory auth state remains managed by the existing client.
    const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
    const authStorageKey = `sb-${projectRef}-auth-token`;
    if (remember) {
        sessionStorage.removeItem(authStorageKey);
    } else {
        localStorage.removeItem(authStorageKey);
    }
}

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            storage: finovaAuthStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

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