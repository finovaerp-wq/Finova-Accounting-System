/*
==========================================================
FINOVA ACCOUNTING SYSTEM
CUSTOMER CONFIGURATION CORE
Version : 1.0.0
==========================================================

PURPOSE
----------------------------------------------------------
Configuration facade untuk seluruh aplikasi FINOVA.

Layer ini berada di atas:

    customer-config.service.js

Tujuannya supaya seluruh module FINOVA menggunakan API
configuration yang konsisten tanpa mengetahui:

- Struktur database
- Nama tabel
- RPC Supabase
- Cache service
- Bentuk raw settings

ARCHITECTURE
----------------------------------------------------------

Supabase
   ↓
finova_company_settings
   ↓
finova_current_company_config()
   ↓
CustomerConfigService
   ↓
CustomerConfig
   ↓
AP / AR / GL / Payment / Reports / UI

==========================================================
*/


/*
==========================================================
IMPORT
==========================================================
*/

import {
    CustomerConfigService
} from "../../../service/customer-config.service.js";


/*
==========================================================
CUSTOMER CONFIG
==========================================================
*/

export class CustomerConfig {


    /*
    ======================================================
    INTERNAL STATE
    ======================================================
    */

    static _config = null;

    static _initialized = false;

    static _initializingPromise = null;


    /*
    ======================================================
    INITIALIZE
    ------------------------------------------------------
    WAJIB dipanggil saat bootstrap aplikasi.

    Contoh:

        await CustomerConfig.initialize();

    Setelah initialize berhasil, getter synchronous
    dapat digunakan.
    ======================================================
    */

    static async initialize(
        forceRefresh = false
    ) {

        try {


            /*
            ==================================================
            ALREADY INITIALIZED
            ==================================================
            */

            if (
                this._initialized
                &&
                this._config
                &&
                !forceRefresh
            ) {

                return this._config;

            }


            /*
            ==================================================
            PREVENT DUPLICATE INITIALIZATION
            ==================================================
            */

            if (
                this._initializingPromise
                &&
                !forceRefresh
            ) {

                return await this._initializingPromise;

            }


            /*
            ==================================================
            LOAD CONFIGURATION
            ==================================================
            */

            this._initializingPromise =
                this._load(
                    forceRefresh
                );


            const config =
                await this._initializingPromise;


            this._config =
                config;


            this._initialized =
                true;


            return config;


        }
        catch (error) {


            this._initialized =
                false;


            this._config =
                null;


            console.error(
                "CustomerConfig.initialize:",
                error
            );


            throw error;


        }
        finally {


            this._initializingPromise =
                null;


        }

    }


    /*
    ======================================================
    INTERNAL LOAD
    ======================================================
    */

    static async _load(
        forceRefresh = false
    ) {


        const config =
            await CustomerConfigService.getCurrentConfig(
                forceRefresh
            );


        if (!config) {

            throw new Error(
                "FINOVA customer configuration could not be loaded."
            );

        }


        return config;

    }


    /*
    ======================================================
    ENSURE INITIALIZED
    ------------------------------------------------------
    Digunakan oleh getter synchronous.

    Getter tidak akan query database sendiri.
    ======================================================
    */

    static _ensureInitialized() {


        if (
            !this._initialized
            ||
            !this._config
        ) {

            throw new Error(
                "CustomerConfig has not been initialized. Call await CustomerConfig.initialize() during application bootstrap."
            );

        }

    }


    /*
    ======================================================
    GET FULL CONFIG
    ======================================================
    */

    static getConfig() {


        this._ensureInitialized();


        return this._config;

    }


    /*
    ======================================================
    REFRESH
    ------------------------------------------------------
    Digunakan setelah customer settings berubah.
    ======================================================
    */

    static async refresh() {

        try {


            const config =
                await CustomerConfigService.refresh();


            this._config =
                config;


            this._initialized =
                true;


            return config;


        }
        catch (error) {


            console.error(
                "CustomerConfig.refresh:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    RESET
    ------------------------------------------------------
    WAJIB digunakan saat:

    - Logout
    - Login user lain
    - Tenant/company context berubah
    ======================================================
    */

    static reset() {


        this._config =
            null;


        this._initialized =
            false;


        this._initializingPromise =
            null;


        CustomerConfigService.clearCache();

    }


    /*
    ======================================================
    IS INITIALIZED
    ======================================================
    */

    static isInitialized() {


        return Boolean(
            this._initialized
            &&
            this._config
        );

    }


    /*
    ======================================================
    COMPANY
    ======================================================
    */


    /*
    ------------------------------------------------------
    COMPANY ID
    ------------------------------------------------------
    */

    static getCompanyId() {


        this._ensureInitialized();


        return (
            this._config?.company?.id
            ??
            null
        );

    }


    /*
    ------------------------------------------------------
    COMPANY CODE
    ------------------------------------------------------
    */

    static getCompanyCode() {


        this._ensureInitialized();


        return (
            this._config?.company?.code
            ??
            ""
        );

    }


    /*
    ------------------------------------------------------
    COMPANY NAME
    ------------------------------------------------------
    */

    static getCompanyName() {


        this._ensureInitialized();


        return (
            this._config?.company?.name
            ??
            ""
        );

    }


    /*
    ------------------------------------------------------
    LEGAL NAME
    ------------------------------------------------------
    */

    static getLegalName() {


        this._ensureInitialized();


        return (
            this._config?.company?.legalName
            ??
            this.getCompanyName()
        );

    }


    /*
    ------------------------------------------------------
    COMPANY EMAIL
    ------------------------------------------------------
    */

    static getCompanyEmail() {


        this._ensureInitialized();


        return (
            this._config?.company?.email
            ??
            ""
        );

    }


    /*
    ------------------------------------------------------
    COMPANY PHONE
    ------------------------------------------------------
    */

    static getCompanyPhone() {


        this._ensureInitialized();


        return (
            this._config?.company?.phone
            ??
            ""
        );

    }


    /*
    ------------------------------------------------------
    COMPANY ADDRESS
    ------------------------------------------------------
    */

    static getCompanyAddress() {


        this._ensureInitialized();


        return (
            this._config?.company?.address
            ??
            ""
        );

    }


    /*
    ------------------------------------------------------
    COMPANY STATUS
    ------------------------------------------------------
    */

    static getCompanyStatus() {


        this._ensureInitialized();


        return (
            this._config?.company?.status
            ??
            ""
        );

    }


    /*
    ======================================================
    ACCOUNTING
    ======================================================
    */


    /*
    ------------------------------------------------------
    BASE CURRENCY
    ------------------------------------------------------
    */

    static getBaseCurrency() {


        this._ensureInitialized();


        return (
            this._config?.accounting?.baseCurrency
            ??
            "IDR"
        );

    }


    /*
    ------------------------------------------------------
    FISCAL YEAR START MONTH
    ------------------------------------------------------
    */

    static getFiscalYearStartMonth() {


        this._ensureInitialized();


        const month =
            Number(
                this._config
                    ?.accounting
                    ?.fiscalYearStartMonth
            );


        if (
            Number.isNaN(month)
            ||
            month < 1
            ||
            month > 12
        ) {

            return 1;

        }


        return month;

    }


    /*
    ======================================================
    LOCALIZATION
    ======================================================
    */


    /*
    ------------------------------------------------------
    LOCALE
    ------------------------------------------------------
    */

    static getLocale() {


        this._ensureInitialized();


        return (
            this._config?.localization?.locale
            ??
            "id-ID"
        );

    }


    /*
    ------------------------------------------------------
    TIMEZONE
    ------------------------------------------------------
    */

    static getTimezone() {


        this._ensureInitialized();


        return (
            this._config?.localization?.timezone
            ??
            "Asia/Jakarta"
        );

    }


    /*
    ------------------------------------------------------
    DATE FORMAT
    ------------------------------------------------------
    */

    static getDateFormat() {


        this._ensureInitialized();


        return (
            this._config?.localization?.dateFormat
            ??
            "DD/MM/YYYY"
        );

    }


    /*
    ------------------------------------------------------
    NUMBER FORMAT
    ------------------------------------------------------
    */

    static getNumberFormat() {


        this._ensureInitialized();


        return (
            this._config?.localization?.numberFormat
            ??
            "id-ID"
        );

    }


    /*
    ======================================================
    FEATURES
    ======================================================
    */


    /*
    ------------------------------------------------------
    ACCOUNT PAYABLE
    ------------------------------------------------------
    */

    static isAPEnabled() {


        this._ensureInitialized();


        return Boolean(
            this._config?.features?.accountPayable
        );

    }


    /*
    ------------------------------------------------------
    ACCOUNT RECEIVABLE
    ------------------------------------------------------
    */

    static isAREnabled() {


        this._ensureInitialized();


        return Boolean(
            this._config?.features?.accountReceivable
        );

    }


    /*
    ------------------------------------------------------
    TAX
    ------------------------------------------------------
    */

    static isTaxEnabled() {


        this._ensureInitialized();


        return Boolean(
            this._config?.features?.tax
        );

    }


    /*
    ------------------------------------------------------
    MULTI CURRENCY
    ------------------------------------------------------
    */

    static isMultiCurrencyEnabled() {


        this._ensureInitialized();


        return Boolean(
            this._config?.features?.multiCurrency
        );

    }


    /*
    ======================================================
    NUMBERING
    ======================================================
    */


    /*
    ------------------------------------------------------
    AP PREFIX
    ------------------------------------------------------
    */

    static getAPPrefix() {


        this._ensureInitialized();


        return (
            this._config?.numbering?.apPrefix
            ??
            "AP"
        );

    }


    /*
    ------------------------------------------------------
    AR PREFIX
    ------------------------------------------------------
    */

    static getARPrefix() {


        this._ensureInitialized();


        return (
            this._config?.numbering?.arPrefix
            ??
            "AR"
        );

    }


    /*
    ------------------------------------------------------
    GL PREFIX
    ------------------------------------------------------
    */

    static getGLPrefix() {


        this._ensureInitialized();


        return (
            this._config?.numbering?.glPrefix
            ??
            "GLJ"
        );

    }


    /*
    ------------------------------------------------------
    AP PAYMENT PREFIX
    ------------------------------------------------------
    */

    static getAPPaymentPrefix() {


        this._ensureInitialized();


        return (
            this._config
                ?.numbering
                ?.apPaymentPrefix
            ??
            "APP"
        );

    }


    /*
    ------------------------------------------------------
    AR PAYMENT PREFIX
    ------------------------------------------------------
    */

    static getARPaymentPrefix() {


        this._ensureInitialized();


        return (
            this._config
                ?.numbering
                ?.arPaymentPrefix
            ??
            "ARP"
        );

    }


    /*
    ======================================================
    BRANDING
    ======================================================
    */


    /*
    ------------------------------------------------------
    LOGO URL
    ------------------------------------------------------
    */

    static getLogoUrl() {


        this._ensureInitialized();


        return (
            this._config?.branding?.logoUrl
            ??
            null
        );

    }


    /*
    ------------------------------------------------------
    PRIMARY COLOR
    ------------------------------------------------------
    */

    static getPrimaryColor() {


        this._ensureInitialized();


        return (
            this._config?.branding?.primaryColor
            ??
            "#0B1F3A"
        );

    }


    /*
    ======================================================
    EXTRA CONFIG
    ------------------------------------------------------
    Untuk extension configuration tanpa perubahan schema
    cepat.

    Contoh:

        CustomerConfig.getExtra("invoice.approval.enabled")
    ======================================================
    */

    static getExtra(
        path = null,
        fallback = null
    ) {


        this._ensureInitialized();


        const extra =
            this._config?.extra;


        if (
            !path
        ) {

            return (
                extra
                ??
                {}
            );

        }


        if (
            !extra
            ||
            typeof extra !== "object"
        ) {

            return fallback;

        }


        /*
        ==================================================
        SUPPORT DOT NOTATION
        --------------------------------------------------
        Example:
            "invoice.approval.enabled"
        ==================================================
        */

        const keys =
            String(path)
                .split(".")
                .filter(Boolean);


        let value =
            extra;


        for (
            const key
            of keys
        ) {


            if (
                value === null
                ||
                value === undefined
                ||
                typeof value !== "object"
                ||
                !Object.prototype.hasOwnProperty.call(
                    value,
                    key
                )
            ) {

                return fallback;

            }


            value =
                value[key];

        }


        return (
            value
            ??
            fallback
        );

    }


    /*
    ======================================================
    CURRENCY FORMATTER
    ------------------------------------------------------
    Convenience helper awal.

    Catatan:
    Formatting detail dapat dikembangkan di utility khusus
    pada tahap berikutnya.
    ======================================================
    */

    static formatCurrency(
        value,
        options = {}
    ) {


        this._ensureInitialized();


        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            return "0";

        }


        const locale =
            options.locale
            ??
            this.getNumberFormat()
            ??
            this.getLocale();


        const currency =
            options.currency
            ??
            this.getBaseCurrency();


        const minimumFractionDigits =
            options.minimumFractionDigits
            ??
            0;


        const maximumFractionDigits =
            options.maximumFractionDigits
            ??
            0;


        try {


            return new Intl.NumberFormat(
                locale,
                {
                    style: "currency",
                    currency,
                    minimumFractionDigits,
                    maximumFractionDigits
                }
            ).format(
                number
            );


        }
        catch (error) {


            console.warn(
                "CustomerConfig.formatCurrency:",
                error
            );


            return new Intl.NumberFormat(
                "id-ID",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }
            ).format(
                number
            );

        }

    }


    /*
    ======================================================
    NUMBER FORMATTER
    ======================================================
    */

    static formatNumber(
        value,
        options = {}
    ) {


        this._ensureInitialized();


        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            return "0";

        }


        const locale =
            options.locale
            ??
            this.getNumberFormat()
            ??
            this.getLocale();


        const minimumFractionDigits =
            options.minimumFractionDigits
            ??
            0;


        const maximumFractionDigits =
            options.maximumFractionDigits
            ??
            0;


        try {


            return new Intl.NumberFormat(
                locale,
                {
                    minimumFractionDigits,
                    maximumFractionDigits
                }
            ).format(
                number
            );


        }
        catch (error) {


            console.warn(
                "CustomerConfig.formatNumber:",
                error
            );


            return String(
                number
            );

        }

    }


    /*
    ======================================================
    DEBUG SNAPSHOT
    ------------------------------------------------------
    Membantu testing saat development.

    Tidak mengubah configuration.
    ======================================================
    */

    static debug() {


        this._ensureInitialized();


        const snapshot = {

            company: {

                id:
                    this.getCompanyId(),

                code:
                    this.getCompanyCode(),

                name:
                    this.getCompanyName()

            },

            accounting: {

                baseCurrency:
                    this.getBaseCurrency(),

                fiscalYearStartMonth:
                    this.getFiscalYearStartMonth()

            },

            localization: {

                locale:
                    this.getLocale(),

                timezone:
                    this.getTimezone(),

                dateFormat:
                    this.getDateFormat(),

                numberFormat:
                    this.getNumberFormat()

            },

            features: {

                accountPayable:
                    this.isAPEnabled(),

                accountReceivable:
                    this.isAREnabled(),

                tax:
                    this.isTaxEnabled(),

                multiCurrency:
                    this.isMultiCurrencyEnabled()

            },

            numbering: {

                ap:
                    this.getAPPrefix(),

                ar:
                    this.getARPrefix(),

                gl:
                    this.getGLPrefix(),

                apPayment:
                    this.getAPPaymentPrefix(),

                arPayment:
                    this.getARPaymentPrefix()

            },

            branding: {

                logoUrl:
                    this.getLogoUrl(),

                primaryColor:
                    this.getPrimaryColor()

            }

        };


        console.log(
            "=========================================="
        );

        console.log(
            "FINOVA CUSTOMER CONFIG"
        );

        console.table(
            snapshot.company
        );

        console.log(
            snapshot
        );

        console.log(
            "=========================================="
        );


        return snapshot;

    }


}


/*
==========================================================
DEFAULT EXPORT
==========================================================
*/

export default CustomerConfig;