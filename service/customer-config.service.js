/*
==========================================================
FINOVA ACCOUNTING SYSTEM
CUSTOMER CONFIGURATION SERVICE
Version : 1.0.0
==========================================================

PURPOSE
----------------------------------------------------------
Data Access Layer untuk Customer Configuration.

Service ini bertanggung jawab untuk:

1. Mengambil konfigurasi company aktif.
2. Memanggil RPC:
      finova_current_company_config()
3. Membaca raw settings:
      finova_company_settings
4. Update settings company aktif.
5. Menyediakan cache configuration.
6. Membersihkan cache ketika session/company berubah.

IMPORTANT
----------------------------------------------------------
Service ini TIDAK bertanggung jawab untuk:

- Mengatur UI
- Mengubah sidebar
- Mengatur feature visibility
- Format currency/date di module
- Generate nomor AP / AR / GL
- Business logic AP / AR / GL

Hal-hal tersebut akan menggunakan CustomerConfig
pada layer berikutnya.

==========================================================
*/


/*
==========================================================
IMPORT
==========================================================
*/

import {
    supabase
} from "../assets/js/core/supabase.js";


/*
==========================================================
CUSTOMER CONFIGURATION SERVICE
==========================================================
*/

export class CustomerConfigService {


    /*
    ======================================================
    INTERNAL CACHE
    ======================================================
    */

    static _configCache = null;

    static _configPromise = null;


    /*
    ======================================================
    ALLOWED UPDATE FIELDS
    ------------------------------------------------------
    Field whitelist untuk mencegah field yang tidak
    seharusnya diubah dari frontend ikut terkirim.
    ======================================================
    */

    static ALLOWED_UPDATE_FIELDS = [

        /*
        --------------------------------------------------
        ACCOUNTING
        --------------------------------------------------
        */

        "base_currency",

        "fiscal_year_start_month",


        /*
        --------------------------------------------------
        LOCALIZATION
        --------------------------------------------------
        */

        "locale",

        "timezone",

        "date_format",

        "number_format",


        /*
        --------------------------------------------------
        FEATURES
        --------------------------------------------------
        */

        "ap_enabled",

        "ar_enabled",

        "tax_enabled",

        "multi_currency_enabled",


        /*
        --------------------------------------------------
        DOCUMENT NUMBERING
        --------------------------------------------------
        */

        "document_prefix_ap",

        "document_prefix_ar",

        "document_prefix_gl",

        "document_prefix_ap_payment",

        "document_prefix_ar_payment",


        /*
        --------------------------------------------------
        BRANDING
        --------------------------------------------------
        */

        "logo_url",

        "primary_color",


        /*
        --------------------------------------------------
        EXTENSION
        --------------------------------------------------
        */

        "extra_config"

    ];


    /*
    ======================================================
    GET CURRENT CONFIG
    ------------------------------------------------------
    Mengambil configuration company aktif.

    Default:
        menggunakan cache.

    forceRefresh = true:
        mengambil ulang dari database.
    ======================================================
    */

    static async getCurrentConfig(
        forceRefresh = false
    ) {

        try {


            /*
            ==================================================
            RETURN CACHE
            ==================================================
            */

            if (
                !forceRefresh
                &&
                this._configCache
            ) {

                return this._configCache;

            }


            /*
            ==================================================
            PREVENT DUPLICATE REQUEST
            --------------------------------------------------
            Jika beberapa module meminta config pada waktu
            yang sama, hanya satu request Supabase yang
            dijalankan.
            ==================================================
            */

            if (
                !forceRefresh
                &&
                this._configPromise
            ) {

                return await this._configPromise;

            }


            /*
            ==================================================
            CREATE REQUEST
            ==================================================
            */

            this._configPromise =
                this._loadCurrentConfig();


            const config =
                await this._configPromise;


            /*
            ==================================================
            SAVE CACHE
            ==================================================
            */

            this._configCache =
                config;


            return config;


        }
        catch (error) {


            console.error(
                "CustomerConfigService.getCurrentConfig:",
                error
            );


            throw error;


        }
        finally {


            /*
            ==================================================
            CLEAR ACTIVE PROMISE
            ==================================================
            */

            this._configPromise = null;


        }

    }


    /*
    ======================================================
    LOAD CURRENT CONFIG
    ------------------------------------------------------
    Internal method.

    Mengambil configuration melalui RPC:
        finova_current_company_config()
    ======================================================
    */

    static async _loadCurrentConfig() {

        try {


            const {
                data,
                error
            } = await supabase.rpc(
                "finova_current_company_config"
            );


            /*
            ==================================================
            SUPABASE ERROR
            ==================================================
            */

            if (error) {

                console.error(
                    "CustomerConfigService._loadCurrentConfig RPC:",
                    error
                );

                throw error;

            }


            /*
            ==================================================
            CONFIG NOT FOUND
            ==================================================
            */

            if (
                data === null
                ||
                data === undefined
            ) {

                throw new Error(
                    "Customer configuration not found for current company."
                );

            }


            /*
            ==================================================
            NORMALIZE RESPONSE
            --------------------------------------------------
            PostgreSQL JSONB RPC biasanya langsung mengembalikan
            object.

            Tetapi kita tetap mengantisipasi response array.
            ==================================================
            */

            let config = data;


            if (
                Array.isArray(config)
            ) {

                config =
                    config.length > 0
                        ? config[0]
                        : null;

            }


            if (!config) {

                throw new Error(
                    "Customer configuration response is empty."
                );

            }


            /*
            ==================================================
            VALIDATE CONFIG
            ==================================================
            */

            this._validateConfig(
                config
            );


            return config;


        }
        catch (error) {


            console.error(
                "CustomerConfigService._loadCurrentConfig:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    VALIDATE CONFIG
    ------------------------------------------------------
    Validasi minimum supaya configuration yang rusak tidak
    diam-diam digunakan oleh seluruh FINOVA.
    ======================================================
    */

    static _validateConfig(
        config
    ) {


        if (
            typeof config !== "object"
            ||
            Array.isArray(config)
        ) {

            throw new Error(
                "Invalid customer configuration format."
            );

        }


        /*
        ==================================================
        COMPANY
        ==================================================
        */

        if (
            !config.company
            ||
            typeof config.company !== "object"
        ) {

            throw new Error(
                "Customer configuration is missing company information."
            );

        }


        if (
            !config.company.id
        ) {

            throw new Error(
                "Customer configuration is missing company id."
            );

        }


        /*
        ==================================================
        ACCOUNTING
        ==================================================
        */

        if (
            !config.accounting
            ||
            typeof config.accounting !== "object"
        ) {

            throw new Error(
                "Customer configuration is missing accounting configuration."
            );

        }


        /*
        ==================================================
        LOCALIZATION
        ==================================================
        */

        if (
            !config.localization
            ||
            typeof config.localization !== "object"
        ) {

            throw new Error(
                "Customer configuration is missing localization configuration."
            );

        }


        /*
        ==================================================
        FEATURES
        ==================================================
        */

        if (
            !config.features
            ||
            typeof config.features !== "object"
        ) {

            throw new Error(
                "Customer configuration is missing feature configuration."
            );

        }


        /*
        ==================================================
        NUMBERING
        ==================================================
        */

        if (
            !config.numbering
            ||
            typeof config.numbering !== "object"
        ) {

            throw new Error(
                "Customer configuration is missing numbering configuration."
            );

        }


        /*
        ==================================================
        BRANDING
        ==================================================
        */

        if (
            !config.branding
            ||
            typeof config.branding !== "object"
        ) {

            throw new Error(
                "Customer configuration is missing branding configuration."
            );

        }

    }


    /*
    ======================================================
    REFRESH
    ------------------------------------------------------
    Force reload configuration dari database.
    ======================================================
    */

    static async refresh() {

        try {


            this.clearCache();


            return await this.getCurrentConfig(
                true
            );


        }
        catch (error) {


            console.error(
                "CustomerConfigService.refresh:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    CLEAR CACHE
    ------------------------------------------------------
    WAJIB digunakan ketika:

    - Logout
    - Login user lain
    - Company context berubah
    - Settings berhasil diupdate
    ======================================================
    */

    static clearCache() {


        this._configCache = null;

        this._configPromise = null;


    }


    /*
    ======================================================
    GET CURRENT SETTINGS
    ------------------------------------------------------
    Mengambil raw row dari:

        finova_company_settings

    Digunakan terutama untuk halaman Customer Settings.

    Business module sebaiknya menggunakan:
        getCurrentConfig()

    bukan method ini.
    ======================================================
    */

    static async getCurrentSettings() {

        try {


            /*
            ==================================================
            GET CURRENT CONFIG FIRST
            --------------------------------------------------
            Ini memberikan company_id yang berasal dari
            server-side RPC / tenant context.
            ==================================================
            */

            const config =
                await this.getCurrentConfig();


            const companyId =
                config?.company?.id;


            if (!companyId) {

                throw new Error(
                    "Current company id is not available."
                );

            }


            /*
            ==================================================
            LOAD RAW SETTINGS
            ==================================================
            */

            const {
                data,
                error
            } = await supabase
                .from(
                    "finova_company_settings"
                )
                .select("*")
                .eq(
                    "company_id",
                    companyId
                )
                .single();


            if (error) {

                console.error(
                    "CustomerConfigService.getCurrentSettings query:",
                    error
                );

                throw error;

            }


            if (!data) {

                throw new Error(
                    "Customer settings not found."
                );

            }


            return data;


        }
        catch (error) {


            console.error(
                "CustomerConfigService.getCurrentSettings:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    UPDATE CURRENT SETTINGS
    ------------------------------------------------------
    Update settings untuk company aktif.

    RLS database tetap menjadi security boundary utama.

    Hanya field pada ALLOWED_UPDATE_FIELDS yang akan
    dikirim ke Supabase.
    ======================================================
    */

    static async updateCurrentSettings(
        changes = {}
    ) {

        try {


            /*
            ==================================================
            VALIDATE INPUT
            ==================================================
            */

            if (
                !changes
                ||
                typeof changes !== "object"
                ||
                Array.isArray(changes)
            ) {

                throw new Error(
                    "Invalid customer settings update payload."
                );

            }


            /*
            ==================================================
            GET CURRENT COMPANY
            ==================================================
            */

            const config =
                await this.getCurrentConfig();


            const companyId =
                config?.company?.id;


            if (!companyId) {

                throw new Error(
                    "Current company id is not available."
                );

            }


            /*
            ==================================================
            SANITIZE UPDATE PAYLOAD
            ==================================================
            */

            const payload = {};


            for (
                const field
                of this.ALLOWED_UPDATE_FIELDS
            ) {


                if (
                    Object.prototype.hasOwnProperty.call(
                        changes,
                        field
                    )
                ) {

                    payload[field] =
                        changes[field];

                }

            }


            /*
            ==================================================
            NOTHING TO UPDATE
            ==================================================
            */

            if (
                Object.keys(payload).length === 0
            ) {

                throw new Error(
                    "No valid customer configuration fields to update."
                );

            }


            /*
            ==================================================
            UPDATE DATABASE
            ==================================================
            */

            const {
                data,
                error
            } = await supabase
                .from(
                    "finova_company_settings"
                )
                .update(
                    payload
                )
                .eq(
                    "company_id",
                    companyId
                )
                .select("*")
                .single();


            if (error) {

                console.error(
                    "CustomerConfigService.updateCurrentSettings query:",
                    error
                );

                throw error;

            }


            /*
            ==================================================
            CLEAR OLD CACHE
            ==================================================
            */

            this.clearCache();


            /*
            ==================================================
            LOAD NEW CONFIG
            ==================================================
            */

            const refreshedConfig =
                await this.getCurrentConfig(
                    true
                );


            /*
            ==================================================
            RETURN RESULT
            ==================================================
            */

            return {

                settings: data,

                config: refreshedConfig

            };


        }
        catch (error) {


            console.error(
                "CustomerConfigService.updateCurrentSettings:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    GET COMPANY ID
    ------------------------------------------------------
    Convenience method.
    ======================================================
    */

    static async getCompanyId() {


        const config =
            await this.getCurrentConfig();


        return (
            config?.company?.id
            ??
            null
        );

    }


    /*
    ======================================================
    GET COMPANY CODE
    ======================================================
    */

    static async getCompanyCode() {


        const config =
            await this.getCurrentConfig();


        return (
            config?.company?.code
            ??
            null
        );

    }


    /*
    ======================================================
    GET COMPANY NAME
    ======================================================
    */

    static async getCompanyName() {


        const config =
            await this.getCurrentConfig();


        return (
            config?.company?.name
            ??
            null
        );

    }


    /*
    ======================================================
    HAS CONFIG
    ------------------------------------------------------
    Mengecek apakah configuration dapat dimuat.

    Berguna untuk bootstrap / diagnostic.

    Method ini tidak melempar error ke caller.
    ======================================================
    */

    static async hasConfig() {

        try {


            const config =
                await this.getCurrentConfig();


            return Boolean(
                config?.company?.id
            );


        }
        catch (error) {


            console.warn(
                "CustomerConfigService.hasConfig:",
                error
            );


            return false;

        }

    }


}


/*
==========================================================
DEFAULT EXPORT
==========================================================
*/

export default CustomerConfigService;