/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : AGING PAYABLE
FILE    : aging-payable.js
VERSION : 4.1.0 FINAL
==========================================================
*/

import {
    AccountPayableService
} from "../../service/account-payable.service.js";

import {
    ExcelExportService
} from "../../service/excel-export.service.js";

import {
    BusinessPartnerBankService
} from "../../service/business-partner-bank.service.js";

import {
    BankService
} from "../../service/bank.service.js";


export class AgingPayable {


    /*
    ==========================================================
    CONSTRUCTOR
    ==========================================================
    */

    constructor() {

        this.service =
            new AccountPayableService();

        


        /*
        ======================================================
        BANK CACHE
        ======================================================
        */

        this.bankMasterMap =
            new Map();

        this.vendorBankCache =
            new Map();
        /*
        ==========================================================
        LOAD CONTROL
        ==========================================================
        */

        this.loadVersion = 0;

        this.destroyed = false;


        /*
        ======================================================
        DATA
        ======================================================
        */

        this.data =
            [];

        this.filteredData =
            [];


        /*
        ======================================================
        PAGINATION
        ======================================================
        */

        this.currentPage =
            1;

        this.pageSize =
            10;

        this.totalPages =
            1;

        this.totalRows =
            0;


        /*
        ======================================================
        AS OF DATE
        ======================================================
        */

        this.asOfDateValue =
            null;


        /*
        ======================================================
        INITIALIZE
        ======================================================
        */

        this.init();

    }

/*
==========================================================
INITIALIZE
==========================================================
*/

async init() {

    try {

        console.log(
            "AgingPayable: INIT START"
        );


        /*
        ======================================================
        CACHE DOM
        ======================================================
        */

        this.cacheDom();


        /*
        ======================================================
        DEFAULT FILTER
        ======================================================
        */

        this.setDefaultFilterDates();


        /*
        ======================================================
        BIND EVENTS
        ======================================================
        */

        this.bindEvents();


        /*
        ======================================================
        INITIAL LOAD

        IMPORTANT:
        Hanya menggunakan TABLE LOADING.
        Tidak menggunakan window.App.showLoading().
        ======================================================
        */

        await this.loadData(
            true
        );


        console.log(
            "AgingPayable: INIT COMPLETE"
        );

    }

    catch (error) {

        console.error(
            "AgingPayable.init:",
            error
        );


        this.showError(

            error?.message

            ||

            "Failed to initialize Aging Payable."

        );

    }

}
    
    /*
    ==========================================================
    CACHE DOM
    ==========================================================
    */

    cacheDom() {


        /*
        ======================================================
        FILTER
        ======================================================
        */

        this.filterDateFrom =
            document.getElementById(
                "aging-payable-date-from"
            );


        this.filterDateTo =
            document.getElementById(
                "aging-payable-date-to"
            );


        this.filterStatus =
            document.getElementById(
                "aging-payable-status"
            );


        this.filterFindBy =
            document.getElementById(
                "aging-payable-find-by"
            );


        this.filterKeyword =
            document.getElementById(
                "aging-payable-keyword"
            );


        this.btnFind =
            document.getElementById(
                "btn-find-aging-payable"
            );


        /*
        ======================================================
        HEADER
        ======================================================
        */

        this.btnRefresh =
            document.getElementById(
                "btn-refresh-aging-payable"
            );


        this.btnDownload =
            document.getElementById(
                "btn-download-excel-aging-payable"
            );


        this.btnPreview =
            document.getElementById(
                "btn-preview-html-aging-payable"
            );


        /*
        ======================================================
        TABLE
        ======================================================
        */

        this.tableBody =
            document.getElementById(
                "aging-payable-tbody"
            );


        /*
        ======================================================
        AGING TOTAL
        ======================================================
        */

        this.totalOutstanding =
            document.getElementById(
                "aging-total-outstanding"
            );


        this.totalCurrent =
            document.getElementById(
                "aging-total-current"
            );


        this.total1to30 =
            document.getElementById(
                "aging-total-1-30"
            );


        this.total31to60 =
            document.getElementById(
                "aging-total-31-60"
            );


        this.total61to90 =
            document.getElementById(
                "aging-total-61-90"
            );


        this.total90plus =
            document.getElementById(
                "aging-total-90-plus"
            );


        /*
        ======================================================
        AMOUNT TOTAL
        ======================================================
        */

        this.totalAmount =
            document.getElementById(
                "aging-total-amount"
            );


        this.totalBeforeTax =
            document.getElementById(
                "aging-total-before-tax"
            );


        this.totalTaxPlus =
            document.getElementById(
                "aging-total-tax-plus"
            );


        this.totalTaxMinus =
            document.getElementById(
                "aging-total-tax-minus"
            );


        /*
        ======================================================
        PAGINATION
        ======================================================
        */

        this.btnFirst =
            document.getElementById(
                "aging-page-first"
            );


        this.btnPrev =
            document.getElementById(
                "aging-page-prev"
            );


        this.btnNext =
            document.getElementById(
                "aging-page-next"
            );


        this.btnLast =
            document.getElementById(
                "aging-page-last"
            );


        this.currentPageInput =
            document.getElementById(
                "aging-current-page"
            );


        this.totalPagesLabel =
            document.getElementById(
                "aging-total-pages"
            );


        this.displayRecord =
            document.getElementById(
                "aging-record-info"
            );

    }


    /*
    ==========================================================
    DEFAULT FILTER DATE
    ==========================================================
    */

    setDefaultFilterDates() {

        const today =
            new Date();


        /*
        ======================================================
        LOCAL DATE
        ======================================================
        */

        const localToday =
            new Date(

                today.getTime()

                -

                (
                    today.getTimezoneOffset()
                    *
                    60000
                )

            );


        /*
        ======================================================
        AS OF DATE
        ======================================================
        */

        this.asOfDateValue =
            localToday
                .toISOString()
                .slice(
                    0,
                    10
                );


        /*
        ======================================================
        DATE FROM
        ======================================================
        */

        if (
            this.filterDateFrom
        ) {

            this.filterDateFrom.value =
                "";

        }


        /*
        ======================================================
        DATE TO
        ======================================================
        */

        if (
            this.filterDateTo
        ) {

            this.filterDateTo.value =
                "";

        }

    }


    /*
    ==========================================================
    BIND EVENTS
    ==========================================================
    */

    bindEvents() {


        /*
        ======================================================
        FIND
        ======================================================
        */

        this.btnFind?.addEventListener(

            "click",

            event => {

                event.preventDefault();

                this.applyFilter();

            }

        );


        /*
        ======================================================
        KEYWORD ENTER
        ======================================================
        */

        this.filterKeyword?.addEventListener(

            "keydown",

            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    this.applyFilter();

                }

            }

        );


        /*
        ======================================================
        DATE FROM
        ======================================================
        */

        this.filterDateFrom?.addEventListener(

            "change",

            () => {

                this.applyFilter();

            }

        );


        /*
        ======================================================
        DATE TO
        ======================================================
        */

        this.filterDateTo?.addEventListener(

            "change",

            () => {

                this.applyFilter();

            }

        );


        /*
        ======================================================
        STATUS
        ======================================================
        */

        this.filterStatus?.addEventListener(

            "change",

            () => {

                this.applyFilter();

            }

        );


        /*
        ======================================================
        REFRESH
        ======================================================
        */

        this.btnRefresh?.addEventListener(

            "click",

            async event => {

                event.preventDefault();

                await this.resetAndReload();

            }

        );


        /*
        ======================================================
        PREVIEW
        ======================================================
        */

        this.btnPreview?.addEventListener(

            "click",

            event => {

                event.preventDefault();

                this.previewHTML();

            }

        );


        /*
        ======================================================
        DOWNLOAD EXCEL
        ======================================================
        */

        this.btnDownload?.addEventListener(

            "click",

            event => {

                event.preventDefault();

                this.downloadExcel();

            }

        );


        /*
        ======================================================
        FIRST PAGE
        ======================================================
        */

        this.btnFirst?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    1
                );

            }

        );


        /*
        ======================================================
        PREVIOUS PAGE
        ======================================================
        */

        this.btnPrev?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    this.currentPage - 1
                );

            }

        );


        /*
        ======================================================
        NEXT PAGE
        ======================================================
        */

        this.btnNext?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    this.currentPage + 1
                );

            }

        );


        /*
        ======================================================
        LAST PAGE
        ======================================================
        */

        this.btnLast?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    this.totalPages
                );

            }

        );


        /*
        ======================================================
        PAGE INPUT
        ======================================================
        */

        this.currentPageInput?.addEventListener(

            "change",

            () => {

                this.goToPage(

                    Number(
                        this.currentPageInput.value
                        ||
                        1
                    )

                );

            }

        );

    }


  /*
==========================================================
LOAD DATA
==========================================================
*/

async loadData(
    showLoading = false
) {

    /*
    ======================================================
    CREATE LOAD VERSION
    ======================================================
    */

    const loadVersion =
        ++this.loadVersion;


    try {

        /*
        ======================================================
        LOADING
        ======================================================
        */

        if (
            showLoading
        ) {

            this.showTableLoading();

        }


        /*
        ======================================================
        CLEAR BANK CACHE
        ======================================================
        */

        this.vendorBankCache.clear();


        /*
        ======================================================
        LOAD AP
        ======================================================
        */

        const result =
            await this.service.getAll();


        /*
        ======================================================
        STOP OLD LOAD
        ======================================================
        */

        if (
            loadVersion !== this.loadVersion
        ) {

            return;

        }


        const source =

            Array.isArray(result)

                ? result

                : Array.isArray(result?.data)

                    ? result.data

                    : [];


        /*
        ======================================================
        LOAD BANK MASTER
        ======================================================
        */

        await this.loadBankMaster();


        /*
        ======================================================
        STOP OLD LOAD
        ======================================================
        */

        if (
            loadVersion !== this.loadVersion
        ) {

            return;

        }


        /*
        ======================================================
        TEMP DATA

        IMPORTANT:
        Jangan langsung push ke this.data selama async loop.
        ======================================================
        */

        const normalizedRows =
            [];


        /*
        ======================================================
        PROCESS AP
        ======================================================
        */

        for (
            const row
            of source
        ) {

            /*
            ==================================================
            STOP OLD LOAD
            ==================================================
            */

            if (
                loadVersion !== this.loadVersion
            ) {

                return;

            }


            /*
            ==================================================
            STATUS
            ==================================================
            */

            const status =
                String(
                    row?.status
                    ??
                    ""
                )
                    .trim()
                    .toLowerCase();


            /*
            ==================================================
            SKIP PAID / VOID
            ==================================================
            */

            if (
                status === "paid"
                ||
                status === "void"
            ) {

                continue;

            }


            /*
            ==================================================
            VENDOR
            ==================================================
            */

            const vendor =
                row?.mst_business_partner
                ??
                {};


            const vendorId =

                row?.vendor_id

                ??

                vendor?.id

                ??

                null;


            /*
            ==================================================
            BANK
            ==================================================
            */

            const bankInfo =
                await this.getVendorBankInfo(
                    vendorId
                );


            /*
            ==================================================
            STOP OLD LOAD AFTER ASYNC
            ==================================================
            */

            if (
                loadVersion !== this.loadVersion
            ) {

                return;

            }


            /*
            ==================================================
            NORMALIZE
            ==================================================
            */

            const normalized =
                this.normalizeRow({

                    ...row,

                    account_holder:
                        bankInfo.account_holder,

                    bank_name:
                        bankInfo.bank_name,

                    bank_account:
                        bankInfo.bank_account

                });


            /*
            ==================================================
            ONLY OUTSTANDING
            ==================================================
            */

            if (
                normalized
                &&
                this.toNumber(
                    normalized.outstanding_amount
                ) > 0
            ) {

                normalizedRows.push(
                    normalized
                );

            }

        }


        /*
        ======================================================
        FINAL CHECK
        ======================================================
        */

        if (
            loadVersion !== this.loadVersion
        ) {

            return;

        }


        /*
        ======================================================
        SET DATA ONCE

        Jangan update this.data sedikit-sedikit.
        ======================================================
        */

        this.data =
            normalizedRows;


        this.filteredData =
            [...normalizedRows];


        this.currentPage =
            1;


        /*
        ======================================================
        FILTER / RENDER
        ======================================================
        */

        this.applyFilter();


        console.log(
            "AGING PAYABLE FINAL ROW COUNT:",
            this.data.length
        );

    }

    catch (error) {

        /*
        ======================================================
        IGNORE ERROR FROM OLD LOAD
        ======================================================
        */

        if (
            loadVersion !== this.loadVersion
        ) {

            return;

        }


        console.error(
            "AgingPayable.loadData:",
            error
        );


        this.data =
            [];


        this.filteredData =
            [];


        this.currentPage =
            1;


        this.refreshView();


        this.showError(

            error?.message

            ||

            "Failed to load Aging Payable."

        );

    }

}


    /*
==========================================================
LOAD BANK MASTER
==========================================================
*/

async loadBankMaster() {

    try {

        this.bankMasterMap.clear();


        const result =
            await BankService.getAll();


        const banks =

            Array.isArray(result)

                ? result

                : Array.isArray(result?.data)

                    ? result.data

                    : [];


        banks.forEach(

            bank => {

                if (
                    bank?.id !== null
                    &&
                    bank?.id !== undefined
                ) {

                    this.bankMasterMap.set(

                        String(bank.id),

                        bank

                    );

                }

            }

        );


        console.log(
            "AGING PAYABLE BANK MASTER:",
            banks
        );

    }

    catch (error) {

        console.error(
            "AgingPayable.loadBankMaster:",
            error
        );


        this.bankMasterMap.clear();

    }

}


    /*
==========================================================
GET VENDOR BANK INFORMATION
==========================================================
*/

async getVendorBankInfo(
    vendorId
) {

    const empty = {

        account_holder:
            "-",

        bank_name:
            "-",

        bank_account:
            "-"

    };


    /*
    ======================================================
    VALIDATE VENDOR
    ======================================================
    */

    if (
        vendorId === null
        ||
        vendorId === undefined
        ||
        vendorId === ""
    ) {

        return empty;

    }


    const cacheKey =
        String(
            vendorId
        );


    /*
    ======================================================
    RETURN CACHE
    ======================================================
    */

    if (
        this.vendorBankCache.has(
            cacheKey
        )
    ) {

        return this.vendorBankCache.get(
            cacheKey
        );

    }


    try {

        /*
        ======================================================
        LOAD BANK FROM BUSINESS PARTNER
        ======================================================
        */

        const result =
            await BusinessPartnerBankService
                .getByBusinessPartner(
                    vendorId
                );


        const banks =

            Array.isArray(result)

                ? result

                : Array.isArray(result?.data)

                    ? result.data

                    : [];


        console.log(
            `AGING PAYABLE BANK VENDOR ${vendorId}:`,
            banks
        );


        /*
        ======================================================
        NO BANK
        ======================================================
        */

        if (
            !banks.length
        ) {

            this.vendorBankCache.set(
                cacheKey,
                empty
            );


            return empty;

        }


        /*
        ======================================================
        SELECT DEFAULT BANK

        Business Partner:
        - use is_default = true
        - fallback first bank
        ======================================================
        */

        const bank =

            banks.find(

                item =>
                    item?.is_default === true

            )

            ??

            banks[0];


        /*
        ======================================================
        GET MASTER BANK
        ======================================================
        */

        const bankId =
            bank?.bank_id
            ??
            null;


        const bankMaster =

            bankId !== null
            &&
            bankId !== undefined

                ? this.bankMasterMap.get(
                    String(
                        bankId
                    )
                )

                : null;


        /*
        ======================================================
        BUILD BANK INFORMATION
        ======================================================
        */

        const bankInfo = {

            /*
            Business Partner Bank:
            account_name = Account Holder
            */

            account_holder:

                bank?.account_name
                ??
                "-",


            /*
            Master Bank:
            bank_name
            */

            bank_name:

                bankMaster?.bank_name
                ??
                "-",


            /*
            Business Partner Bank:
            account_number = Bank Account
            */

            bank_account:

                bank?.account_number
                ??
                "-"

        };


        console.log(
            `AGING PAYABLE SELECTED BANK ${vendorId}:`,
            {
                bank,
                bankMaster,
                bankInfo
            }
        );


        /*
        ======================================================
        CACHE
        ======================================================
        */

        this.vendorBankCache.set(
            cacheKey,
            bankInfo
        );


        return bankInfo;

    }

    catch (error) {

        console.error(
            `AGING PAYABLE BANK ERROR VENDOR ${vendorId}:`,
            error
        );


        this.vendorBankCache.set(
            cacheKey,
            empty
        );


        return empty;

    }

}
    /*
    ==========================================================
    NORMALIZE ROW
    ==========================================================
    */

    normalizeRow(
        row
    ) {


        /*
        ======================================================
        BUSINESS PARTNER
        ======================================================
        */

        const vendor =
            row?.mst_business_partner
            ??
            {};


        /*
        ======================================================
        TOTAL AMOUNT
        ======================================================
        */

        const totalAmount =
            this.toNumber(

                row?.total_amount

                ??

                0

            );


        /*
        ======================================================
        BEFORE TAX
        ======================================================
        */

        const beforeTaxAmount =
            this.toNumber(

                row?.subtotal

                ??

                row?.before_tax_amount

                ??

                0

            );


        /*
        ======================================================
        TAX (+)
        ======================================================
        */

        const taxPlusAmount =
            this.toNumber(

                row?.tax_input_amount

                ??

                row?.tax_plus_amount

                ??

                row?.total_tax_plus

                ??

                0

            );


        /*
        ======================================================
        TAX (-)
        ======================================================
        */

        const taxMinusAmount =
            this.toNumber(

                row?.withholding_tax_amount

                ??

                row?.tax_minus_amount

                ??

                row?.total_tax_minus

                ??

                0

            );


        /*
        ======================================================
        PAID AMOUNT
        ======================================================
        */

        const paidAmount =
            this.toNumber(

                row?.paid_amount

                ??

                row?.payment_amount

                ??

                row?.total_paid

                ??

                0

            );


        /*
        ======================================================
        OUTSTANDING
        ======================================================
        */

        const outstandingAmount =

            this.hasValue(
                row?.outstanding_amount
            )

                ? Math.max(

                    0,

                    this.toNumber(
                        row.outstanding_amount
                    )

                )

                : Math.max(

                    0,

                    totalAmount
                    -
                    paidAmount

                );


        /*
        ======================================================
        RESULT
        ======================================================
        */

        return {

            ...row,


            /*
            ==================================================
            VENDOR
            ==================================================
            */

            vendor_name:

                vendor?.bp_name

                ??

                "-",


            /*
            ==================================================
            DOCUMENT
            ==================================================
            */

            invoice_no:

                row?.invoice_no

                ??

                "-",


            po_no:

                row?.po_no

                ??

                "-",


            description:

                row?.description

                ??

                "-",


            /*
            ==================================================
            BANK
            ==================================================
            */

            account_holder:

                row?.account_holder

                ??

                "-",


            bank_name:

                row?.bank_name

                ??

                "-",


            bank_account:

                row?.bank_account

                ??

                "-",


            /*
            ==================================================
            DATE
            ==================================================
            */

            invoice_date:

                row?.invoice_date

                ??

                null,


            due_date:

                row?.due_date

                ??

                null,


            /*
            ==================================================
            AMOUNT
            ==================================================
            */

            total_amount:

                this.cleanNumber(
                    totalAmount
                ),


            before_tax_amount:

                this.cleanNumber(
                    beforeTaxAmount
                ),


            tax_plus_amount:

                this.cleanNumber(
                    taxPlusAmount
                ),


            tax_minus_amount:

                this.cleanNumber(
                    taxMinusAmount
                ),


            paid_amount:

                this.cleanNumber(
                    paidAmount
                ),


            outstanding_amount:

                this.cleanNumber(
                    outstandingAmount
                ),


            /*
            ==================================================
            AGING
            ==================================================
            */

            ...this.calculateBucket(

                row?.due_date,

                outstandingAmount

            )

        };

    }
        /*
    ==========================================================
    REBUILD AGING
    ==========================================================
    */

    rebuildAging() {

        this.data =
            this.data.map(

                row => ({

                    ...row,

                    ...this.calculateBucket(

                        row.due_date,

                        row.outstanding_amount

                    )

                })

            );


        this.applyFilter();

    }


    /*
    ==========================================================
    CALCULATE AGING BUCKET
    ==========================================================
    */

    calculateBucket(
        dueDate,
        outstanding
    ) {

        const result = {

            aging_days:
                0,

            bucket:
                "current",

            current:
                0,

            days_1_30:
                0,

            days_31_60:
                0,

            days_61_90:
                0,

            days_90_plus:
                0

        };


        /*
        ======================================================
        AMOUNT
        ======================================================
        */

        const amount =
            this.toNumber(
                outstanding
            );


        /*
        ======================================================
        NO OUTSTANDING
        ======================================================
        */

        if (
            amount <= 0
        ) {

            return result;

        }


        /*
        ======================================================
        NO DUE DATE
        ======================================================
        */

        if (
            !dueDate
        ) {

            result.current =
                amount;


            return result;

        }


        /*
        ======================================================
        AS OF DATE
        ======================================================
        */

        const asOf =
            this.parseDate(
                this.asOfDateValue
            );


        /*
        ======================================================
        DUE DATE
        ======================================================
        */

        const due =
            this.parseDate(
                dueDate
            );


        /*
        ======================================================
        INVALID DATE
        ======================================================
        */

        if (
            !asOf
            ||
            !due
        ) {

            result.current =
                amount;


            return result;

        }


        /*
        ======================================================
        AGING DAYS
        ======================================================
        */

        const days =
            Math.floor(

                (
                    asOf.getTime()
                    -
                    due.getTime()
                )

                /

                86400000

            );


        /*
        ======================================================
        CURRENT
        ======================================================
        */

        if (
            days <= 0
        ) {

            result.aging_days =
                0;


            result.bucket =
                "current";


            result.current =
                amount;


            return result;

        }


        /*
        ======================================================
        OVERDUE DAYS
        ======================================================
        */

        result.aging_days =
            days;


        /*
        ======================================================
        1 - 30
        ======================================================
        */

        if (
            days <= 30
        ) {

            result.bucket =
                "1-30";


            result.days_1_30 =
                amount;


            return result;

        }


        /*
        ======================================================
        31 - 60
        ======================================================
        */

        if (
            days <= 60
        ) {

            result.bucket =
                "31-60";


            result.days_31_60 =
                amount;


            return result;

        }


        /*
        ======================================================
        61 - 90
        ======================================================
        */

        if (
            days <= 90
        ) {

            result.bucket =
                "61-90";


            result.days_61_90 =
                amount;


            return result;

        }


        /*
        ======================================================
        > 90
        ======================================================
        */

        result.bucket =
            "90+";


        result.days_90_plus =
            amount;


        return result;

    }


    /*
    ==========================================================
    APPLY FILTER
    ==========================================================
    */

    applyFilter() {

        /*
        ======================================================
        DATE FROM
        ======================================================
        */

        const dateFrom =
            this.filterDateFrom?.value
            ||
            "";


        /*
        ======================================================
        DATE TO
        ======================================================
        */

        const dateTo =
            this.filterDateTo?.value
            ||
            "";


        /*
        ======================================================
        STATUS
        ======================================================
        */

        const status =
            String(
                this.filterStatus?.value
                ||
                "all"
            )
                .trim()
                .toLowerCase();


        /*
        ======================================================
        FIND BY
        ======================================================
        */

        const findBy =
            String(
                this.filterFindBy?.value
                ||
                "invoice"
            )
                .trim()
                .toLowerCase();


        /*
        ======================================================
        KEYWORD
        ======================================================
        */

        const keyword =
            String(
                this.filterKeyword?.value
                ??
                ""
            )
                .trim()
                .toLowerCase();


        /*
        ======================================================
        FILTER DATA
        ======================================================
        */

        this.filteredData =
            this.data.filter(

                row => {


                    /*
                    ==============================================
                    INVOICE DATE
                    ==============================================
                    */

                    const invoiceDate =
                        row?.invoice_date

                            ? String(
                                row.invoice_date
                            )
                                .slice(
                                    0,
                                    10
                                )

                            : "";


                    /*
                    ==============================================
                    DATE FROM
                    ==============================================
                    */

                    if (
                        dateFrom
                        &&
                        (
                            !invoiceDate
                            ||
                            invoiceDate < dateFrom
                        )
                    ) {

                        return false;

                    }


                    /*
                    ==============================================
                    DATE TO
                    ==============================================
                    */

                    if (
                        dateTo
                        &&
                        (
                            !invoiceDate
                            ||
                            invoiceDate > dateTo
                        )
                    ) {

                        return false;

                    }


                    /*
                    ==============================================
                    STATUS
                    ==============================================
                    */

                    if (
                        status !== "all"
                    ) {

                        const rowStatus =
                            String(
                                row?.status
                                ??
                                ""
                            )
                                .trim()
                                .toLowerCase();


                        if (
                            rowStatus !== status
                        ) {

                            return false;

                        }

                    }


                    /*
                    ==============================================
                    NO KEYWORD
                    ==============================================
                    */

                    if (
                        !keyword
                    ) {

                        return true;

                    }


                    /*
                    ==============================================
                    SEARCH VALUE
                    ==============================================
                    */

                    let value =
                        "";


                    /*
                    ==============================================
                    INVOICE
                    ==============================================
                    */

                    if (
                        findBy === "invoice"
                    ) {

                        value =
                            row?.invoice_no
                            ??
                            "";

                    }


                    /*
                    ==============================================
                    PO
                    ==============================================
                    */

                    else if (
                        findBy === "po"
                    ) {

                        value =
                            row?.po_no
                            ??
                            "";

                    }


                    /*
                    ==============================================
                    VENDOR
                    ==============================================
                    */

                    else if (
                        findBy === "vendor"
                    ) {

                        value =
                            row?.vendor_name
                            ??
                            "";

                    }


                    /*
                    ==============================================
                    FALLBACK SEARCH
                    ==============================================
                    */

                    else {

                        value = [

                            row?.invoice_no,

                            row?.po_no,

                            row?.vendor_name,

                            row?.description,

                            row?.account_holder,

                            row?.bank_name,

                            row?.bank_account

                        ]
                            .filter(
                                item =>
                                    item !== null
                                    &&
                                    item !== undefined
                            )
                            .join(
                                " "
                            );

                    }


                    /*
                    ==============================================
                    MATCH
                    ==============================================
                    */

                    return String(
                        value
                    )
                        .toLowerCase()
                        .includes(
                            keyword
                        );

                }

            );


        /*
        ======================================================
        RESET PAGE
        ======================================================
        */

        this.currentPage =
            1;


        /*
        ======================================================
        REFRESH
        ======================================================
        */

        this.refreshView();

    }


    /*
    ==========================================================
    REFRESH VIEW
    ==========================================================
    */

    refreshView() {

        /*
        ======================================================
        TOTAL ROWS
        ======================================================
        */

        this.totalRows =
            this.filteredData.length;


        /*
        ======================================================
        TOTAL PAGES
        ======================================================
        */

        this.totalPages =
            Math.max(

                1,

                Math.ceil(

                    this.totalRows

                    /

                    this.pageSize

                )

            );


        /*
        ======================================================
        VALIDATE CURRENT PAGE
        ======================================================
        */

        this.currentPage =
            Math.min(

                Math.max(
                    this.currentPage,
                    1
                ),

                this.totalPages

            );


        /*
        ======================================================
        RENDER
        ======================================================
        */

        this.renderTable();


        this.renderTotals();


        this.updatePagination();

    }


    /*
    ==========================================================
    RENDER TABLE
    ==========================================================
    */

    renderTable() {

        if (
            !this.tableBody
        ) {

            return;

        }


        /*
        ======================================================
        CLEAR
        ======================================================
        */

        this.tableBody.innerHTML =
            "";


        /*
        ======================================================
        START INDEX
        ======================================================
        */

        const start =

            (
                this.currentPage - 1
            )

            *

            this.pageSize;


        /*
        ======================================================
        PAGE DATA
        ======================================================
        */

        const rows =
            this.filteredData.slice(

                start,

                start
                +
                this.pageSize

            );


        /*
        ======================================================
        EMPTY
        ======================================================
        */

        if (
            !rows.length
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="20"
                        class="
                            text-center
                            py-5
                            text-muted
                        ">

                        No Aging Payable record found.

                    </td>

                </tr>

            `;


            return;

        }


        /*
        ======================================================
        ROWS
        ======================================================
        */

        rows.forEach(

            (
                row,
                index
            ) => {

                this.tableBody.insertAdjacentHTML(

                    "beforeend",

                    this.createRow(

                        row,

                        start
                        +
                        index
                        +
                        1

                    )

                );

            }

        );

    }


    /*
    ==========================================================
    CREATE ROW
    ==========================================================
    */

    createRow(
        row,
        number
    ) {

        return `

            <tr>


                <!-- ==========================================
                     NO
                =========================================== -->

                <td class="finova-table-index">

                    ${number}

                </td>


                <!-- ==========================================
                     VENDOR
                =========================================== -->

                <td class="finova-table-name">

                    ${
                        this.escapeHTML(
                            row.vendor_name
                            ||
                            "-"
                        )
                    }

                </td>


                <!-- ==========================================
                     INVOICE NO
                =========================================== -->

                <td class="finova-table-code">

                    ${
                        this.escapeHTML(
                            row.invoice_no
                            ||
                            "-"
                        )
                    }

                </td>


                <!-- ==========================================
                     PO NO
                =========================================== -->

                <td class="finova-table-code">

                    ${
                        this.escapeHTML(
                            row.po_no
                            ||
                            "-"
                        )
                    }

                </td>


                <!-- ==========================================
                     DESCRIPTION
                =========================================== -->

                <td
                    class="
                        finova-table-name
                        aging-payable-description
                    ">

                    ${
                        this.escapeHTML(
                            row.description
                            ||
                            "-"
                        )
                    }

                </td>


                <!-- ==========================================
                     ACCOUNT HOLDER
                =========================================== -->

                <td class="finova-table-name">

                    ${
                        this.escapeHTML(
                            row.account_holder
                            ||
                            "-"
                        )
                    }

                </td>


                <!-- ==========================================
                     BANK NAME
                =========================================== -->

                <td class="finova-table-name">

                    ${
                        this.escapeHTML(
                            row.bank_name
                            ||
                            "-"
                        )
                    }

                </td>


                <!-- ==========================================
                     BANK ACCOUNT
                =========================================== -->

                <td class="finova-table-code">

                    ${
                        this.escapeHTML(
                            row.bank_account
                            ||
                            "-"
                        )
                    }

                </td>


                <!-- ==========================================
                     INVOICE DATE
                =========================================== -->

                <td class="finova-table-date">

                    ${
                        this.formatDate(
                            row.invoice_date
                        )
                    }

                </td>


                <!-- ==========================================
                     DUE DATE
                =========================================== -->

                <td class="finova-table-date">

                    ${
                        this.formatDate(
                            row.due_date
                        )
                    }

                </td>


                <!-- ==========================================
                     OUTSTANDING
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row.outstanding_amount
                        )
                    }

                </td>


                <!-- ==========================================
                     CURRENT
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row.current
                        )
                    }

                </td>


                <!-- ==========================================
                     1 - 30
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row.days_1_30
                        )
                    }

                </td>


                <!-- ==========================================
                     31 - 60
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row.days_31_60
                        )
                    }

                </td>


                <!-- ==========================================
                     61 - 90
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row.days_61_90
                        )
                    }

                </td>


                <!-- ==========================================
                     > 90
                =========================================== -->

                <td
                    class="
                        finova-table-number
                        aging-payable-overdue
                    ">

                    ${
                        this.formatAmount(
                            row.days_90_plus
                        )
                    }

                </td>


                <!-- ==========================================
                     TOTAL AMOUNT
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row.total_amount
                        )
                    }

                </td>


                <!-- ==========================================
                     BEFORE TAX
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row.before_tax_amount
                        )
                    }

                </td>


                <!-- ==========================================
                     TAX (+)
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row.tax_plus_amount
                        )
                    }

                </td>


                <!-- ==========================================
                     TAX (-)
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row.tax_minus_amount
                        )
                    }

                </td>


            </tr>

        `;

    }


    /*
    ==========================================================
    CALCULATE TOTALS
    ==========================================================
    */

    calculateTotals() {

        return this.filteredData.reduce(

            (
                total,
                row
            ) => {


                /*
                ==============================================
                OUTSTANDING
                ==============================================
                */

                total.outstanding +=
                    this.toNumber(
                        row.outstanding_amount
                    );


                /*
                ==============================================
                CURRENT
                ==============================================
                */

                total.current +=
                    this.toNumber(
                        row.current
                    );


                /*
                ==============================================
                1 - 30
                ==============================================
                */

                total.d1 +=
                    this.toNumber(
                        row.days_1_30
                    );


                /*
                ==============================================
                31 - 60
                ==============================================
                */

                total.d31 +=
                    this.toNumber(
                        row.days_31_60
                    );


                /*
                ==============================================
                61 - 90
                ==============================================
                */

                total.d61 +=
                    this.toNumber(
                        row.days_61_90
                    );


                /*
                ==============================================
                > 90
                ==============================================
                */

                total.d90 +=
                    this.toNumber(
                        row.days_90_plus
                    );


                /*
                ==============================================
                TOTAL AMOUNT
                ==============================================
                */

                total.totalAmount +=
                    this.toNumber(
                        row.total_amount
                    );


                /*
                ==============================================
                BEFORE TAX
                ==============================================
                */

                total.beforeTax +=
                    this.toNumber(
                        row.before_tax_amount
                    );


                /*
                ==============================================
                TAX (+)
                ==============================================
                */

                total.taxPlus +=
                    this.toNumber(
                        row.tax_plus_amount
                    );


                /*
                ==============================================
                TAX (-)
                ==============================================
                */

                total.taxMinus +=
                    this.toNumber(
                        row.tax_minus_amount
                    );


                return total;

            },

            {

                outstanding:
                    0,

                current:
                    0,

                d1:
                    0,

                d31:
                    0,

                d61:
                    0,

                d90:
                    0,

                totalAmount:
                    0,

                beforeTax:
                    0,

                taxPlus:
                    0,

                taxMinus:
                    0

            }

        );

    }


    /*
    ==========================================================
    RENDER TOTALS
    ==========================================================
    */

    renderTotals() {

        const totals =
            this.calculateTotals();


        /*
        ======================================================
        OUTSTANDING
        ======================================================
        */

        if (
            this.totalOutstanding
        ) {

            this.totalOutstanding.textContent =
                this.formatAmount(
                    totals.outstanding
                );

        }


        /*
        ======================================================
        CURRENT
        ======================================================
        */

        if (
            this.totalCurrent
        ) {

            this.totalCurrent.textContent =
                this.formatAmount(
                    totals.current
                );

        }


        /*
        ======================================================
        1 - 30
        ======================================================
        */

        if (
            this.total1to30
        ) {

            this.total1to30.textContent =
                this.formatAmount(
                    totals.d1
                );

        }


        /*
        ======================================================
        31 - 60
        ======================================================
        */

        if (
            this.total31to60
        ) {

            this.total31to60.textContent =
                this.formatAmount(
                    totals.d31
                );

        }


        /*
        ======================================================
        61 - 90
        ======================================================
        */

        if (
            this.total61to90
        ) {

            this.total61to90.textContent =
                this.formatAmount(
                    totals.d61
                );

        }


        /*
        ======================================================
        > 90
        ======================================================
        */

        if (
            this.total90plus
        ) {

            this.total90plus.textContent =
                this.formatAmount(
                    totals.d90
                );

        }


        /*
        ======================================================
        TOTAL AMOUNT
        ======================================================
        */

        if (
            this.totalAmount
        ) {

            this.totalAmount.textContent =
                this.formatAmount(
                    totals.totalAmount
                );

        }


        /*
        ======================================================
        BEFORE TAX
        ======================================================
        */

        if (
            this.totalBeforeTax
        ) {

            this.totalBeforeTax.textContent =
                this.formatAmount(
                    totals.beforeTax
                );

        }


        /*
        ======================================================
        TAX (+)
        ======================================================
        */

        if (
            this.totalTaxPlus
        ) {

            this.totalTaxPlus.textContent =
                this.formatAmount(
                    totals.taxPlus
                );

        }


        /*
        ======================================================
        TAX (-)
        ======================================================
        */

        if (
            this.totalTaxMinus
        ) {

            this.totalTaxMinus.textContent =
                this.formatAmount(
                    totals.taxMinus
                );

        }

    }


    /*
    ==========================================================
    UPDATE PAGINATION
    ==========================================================
    */

    updatePagination() {

        /*
        ======================================================
        START
        ======================================================
        */

        const start =

            this.totalRows

                ? (

                    (
                        this.currentPage - 1
                    )

                    *

                    this.pageSize

                )

                +

                1

                : 0;


        /*
        ======================================================
        END
        ======================================================
        */

        const end =
            Math.min(

                this.currentPage
                *
                this.pageSize,

                this.totalRows

            );


        /*
        ======================================================
        PAGE INPUT
        ======================================================
        */

        if (
            this.currentPageInput
        ) {

            this.currentPageInput.value =
                this.currentPage;

        }


        /*
        ======================================================
        TOTAL PAGE
        ======================================================
        */

        if (
            this.totalPagesLabel
        ) {

            this.totalPagesLabel.textContent =
                this.totalPages;

        }


        /*
        ======================================================
        RECORD INFO
        ======================================================
        */

        if (
            this.displayRecord
        ) {

            this.displayRecord.textContent =

                this.totalRows

                    ? `Displaying Record ${start} - ${end} of ${this.totalRows}`

                    : "Displaying Record 0 - 0 of 0";

        }


        /*
        ======================================================
        FIRST
        ======================================================
        */

        if (
            this.btnFirst
        ) {

            this.btnFirst.disabled =
                this.currentPage <= 1;

        }


        /*
        ======================================================
        PREVIOUS
        ======================================================
        */

        if (
            this.btnPrev
        ) {

            this.btnPrev.disabled =
                this.currentPage <= 1;

        }


        /*
        ======================================================
        NEXT
        ======================================================
        */

        if (
            this.btnNext
        ) {

            this.btnNext.disabled =
                this.currentPage
                >=
                this.totalPages;

        }


        /*
        ======================================================
        LAST
        ======================================================
        */

        if (
            this.btnLast
        ) {

            this.btnLast.disabled =
                this.currentPage
                >=
                this.totalPages;

        }

    }


    /*
    ==========================================================
    GO TO PAGE
    ==========================================================
    */

    goToPage(
        page
    ) {

        /*
        ======================================================
        VALIDATE
        ======================================================
        */

        this.currentPage =
            Math.min(

                Math.max(

                    Number(
                        page
                    )
                    ||
                    1,

                    1

                ),

                this.totalPages

            );


        /*
        ======================================================
        RENDER CURRENT PAGE
        ======================================================
        */

        this.renderTable();


        /*
        ======================================================
        PAGINATION
        ======================================================
        */

        this.updatePagination();

    }


    /*
    ==========================================================
    RESET AND RELOAD
    ==========================================================
    */

    async resetAndReload() {

        try {


            /*
            ==================================================
            DATE FROM
            ==================================================
            */

            if (
                this.filterDateFrom
            ) {

                this.filterDateFrom.value =
                    "";

            }


            /*
            ==================================================
            DATE TO
            ==================================================
            */

            if (
                this.filterDateTo
            ) {

                this.filterDateTo.value =
                    "";

            }


            /*
            ==================================================
            STATUS
            ==================================================
            */

            if (
                this.filterStatus
            ) {

                this.filterStatus.value =
                    "all";

            }


            /*
            ==================================================
            FIND BY
            ==================================================
            */

            if (
                this.filterFindBy
            ) {

                this.filterFindBy.value =
                    "invoice";

            }


            /*
            ==================================================
            KEYWORD
            ==================================================
            */

            if (
                this.filterKeyword
            ) {

                this.filterKeyword.value =
                    "";

            }


            /*
            ==================================================
            RESET AS OF DATE
            ==================================================
            */

            this.setDefaultFilterDates();


            /*
            ==================================================
            CLEAR BANK CACHE
            ==================================================
            */

            this.vendorBankCache.clear();


            /*
            ==================================================
            RELOAD
            ==================================================
            */

            await this.loadData(
                true
            );

        }

        catch (error) {

            console.error(
                "AgingPayable.resetAndReload:",
                error
            );


            this.showError(

                error?.message

                ||

                "Failed to refresh Aging Payable."

            );

        }

    }


    /*
    ==========================================================
    SHOW TABLE LOADING
    ==========================================================
    */

    showTableLoading() {

        if (
            !this.tableBody
        ) {

            return;

        }


        /*
        ======================================================
        TABLE LOADING
        ======================================================
        */

        this.tableBody.innerHTML = `

            <tr>

                <td
                    colspan="20"
                    class="text-center py-5">

                    <div
                        class="
                            d-flex
                            flex-column
                            align-items-center
                            justify-content-center
                            gap-2
                        ">

                        <div
                            class="
                                spinner-border
                                spinner-border-sm
                                text-primary
                            "
                            role="status">

                            <span class="visually-hidden">
                                Loading...
                            </span>

                        </div>


                        <div
                            class="
                                small
                                text-muted
                            ">

                            Loading Aging Payable...

                        </div>

                    </div>

                </td>

            </tr>

        `;


        /*
        ======================================================
        RESET TOTAL
        ======================================================
        */

        const totalElements = [

            this.totalOutstanding,

            this.totalCurrent,

            this.total1to30,

            this.total31to60,

            this.total61to90,

            this.total90plus,

            this.totalAmount,

            this.totalBeforeTax,

            this.totalTaxPlus,

            this.totalTaxMinus

        ];


        totalElements.forEach(

            element => {

                if (
                    element
                ) {

                    element.textContent =
                        "0";

                }

            }

        );


        /*
        ======================================================
        RESET PAGINATION DISPLAY
        ======================================================
        */

        if (
            this.currentPageInput
        ) {

            this.currentPageInput.value =
                1;

        }


        if (
            this.totalPagesLabel
        ) {

            this.totalPagesLabel.textContent =
                "1";

        }


        if (
            this.displayRecord
        ) {

            this.displayRecord.textContent =
                "Loading data...";

        }


        /*
        ======================================================
        DISABLE PAGINATION
        ======================================================
        */

        if (
            this.btnFirst
        ) {

            this.btnFirst.disabled =
                true;

        }


        if (
            this.btnPrev
        ) {

            this.btnPrev.disabled =
                true;

        }


        if (
            this.btnNext
        ) {

            this.btnNext.disabled =
                true;

        }


        if (
            this.btnLast
        ) {

            this.btnLast.disabled =
                true;

        }

    }
        /*
    ==========================================================
    PREVIEW HTML
    ==========================================================
    */

    previewHTML() {

        try {

            /*
            ======================================================
            DATA
            ======================================================
            */

            const rowsData =

                Array.isArray(
                    this.filteredData
                )

                    ? this.filteredData

                    : [];


            /*
            ======================================================
            VALIDATE
            ======================================================
            */

            if (
                !rowsData.length
            ) {

                this.showError(
                    "No Aging Payable data available to preview."
                );

                return;

            }


            /*
            ======================================================
            OPEN WINDOW FIRST
            AVOID POPUP BLOCK
            ======================================================
            */

            const previewWindow =
                window.open(

                    "about:blank",

                    "finova-aging-payable-preview"

                );


            if (
                !previewWindow
            ) {

                this.showError(
                    "Browser blocked the preview window. Please allow pop-ups for FINOVA."
                );

                return;

            }


            /*
            ======================================================
            PREVIEW DATE
            ======================================================
            */

            const previewDate =
                new Date()
                    .toLocaleString(
                        "id-ID"
                    );


            /*
            ======================================================
            REPORT ROW
            ======================================================
            */

            const reportRows =
                rowsData

                    .map(

                        (
                            row,
                            index
                        ) => `

                            <tr>


                                <!-- ==========================
                                     NO
                                =========================== -->

                                <td class="center">

                                    ${index + 1}

                                </td>


                                <!-- ==========================
                                     VENDOR
                                =========================== -->

                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.vendor_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     INVOICE NO
                                =========================== -->

                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.invoice_no
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     PO NO
                                =========================== -->

                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.po_no
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     DESCRIPTION
                                =========================== -->

                                <td class="description">

                                    ${
                                        this.escapeHTML(
                                            row.description
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     ACCOUNT HOLDER
                                =========================== -->

                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.account_holder
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     BANK NAME
                                =========================== -->

                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.bank_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     BANK ACCOUNT
                                =========================== -->

                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.bank_account
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     INVOICE DATE
                                =========================== -->

                                <td class="center">

                                    ${
                                        this.formatDate(
                                            row.invoice_date
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     DUE DATE
                                =========================== -->

                                <td class="center">

                                    ${
                                        this.formatDate(
                                            row.due_date
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     OUTSTANDING
                                =========================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.outstanding_amount
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     CURRENT
                                =========================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.current
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     1 - 30
                                =========================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.days_1_30
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     31 - 60
                                =========================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.days_31_60
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     61 - 90
                                =========================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.days_61_90
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     > 90
                                =========================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.days_90_plus
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     TOTAL AMOUNT
                                =========================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.total_amount
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     BEFORE TAX
                                =========================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.before_tax_amount
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     TAX (+)
                                =========================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.tax_plus_amount
                                        )
                                    }

                                </td>


                                <!-- ==========================
                                     TAX (-)
                                =========================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.tax_minus_amount
                                        )
                                    }

                                </td>


                            </tr>

                        `

                    )

                    .join("");


            /*
            ======================================================
            TOTAL
            ======================================================
            */

            const totals =
                this.calculateTotals();


            /*
            ======================================================
            HTML
            ======================================================
            */

            const html = `

<!DOCTYPE html>

<html lang="id">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0">

<title>
    Aging Payable
</title>


<style>

* {

    box-sizing:
        border-box;

}


html {

    margin:
        0;

    padding:
        0;

    width:
        100%;

    min-height:
        100%;

    overflow-x:
        auto;

    overflow-y:
        auto;

}


body {

    margin:
        0;

    padding:
        28px 32px 42px;

    width:
        max-content;

    min-width:
        100%;

    min-height:
        100vh;

    background:
        #FFFFFF;

    color:
        #1F2937;

    font-family:
        Tahoma,
        Arial,
        sans-serif;

    font-size:
        11px;

}


.report {

    width:
        max-content;

    min-width:
        calc(100vw - 64px);

}


.report-header {

    width:
        100%;

    margin-bottom:
        20px;

    padding-bottom:
        16px;

    border-bottom:
        2px solid #244494;

}


.report-title {

    margin:
        0;

    font-size:
        22px;

    font-weight:
        700;

}


.report-subtitle {

    margin-top:
        6px;

    color:
        #244494;

    font-size:
        16px;

    font-weight:
        700;

}


.report-description {

    margin-top:
        5px;

    color:
        #6B7280;

}


.report-date {

    margin-top:
        6px;

    color:
        #6B7280;

    font-size:
        11px;

}


.table-container {

    width:
        max-content;

    min-width:
        100%;

    border:
        1px solid #D1D5DB;

    border-radius:
        4px;

    background:
        #FFFFFF;

    overflow:
        visible;

}


.table-wrapper {

    width:
        max-content;

    min-width:
        100%;

    overflow:
        visible !important;

}


table {

    width:
        max-content;

    min-width:
        100%;

    margin:
        0;

    border-collapse:
        collapse;

    table-layout:
        auto;

}


th {

    padding:
        9px;

    background:
        #244494;

    color:
        #FFFFFF;

    border:
        1px solid #D1D5DB;

    text-align:
        center;

    font-size:
        10px;

    font-weight:
        700;

    white-space:
        nowrap;

}


td {

    padding:
        8px 9px;

    border:
        1px solid #D1D5DB;

    background:
        #FFFFFF;

    vertical-align:
        middle;

    white-space:
        nowrap;

}


tbody tr:nth-child(even) td {

    background:
        #F8FAFC;

}


.center {

    text-align:
        center;

}


.description {

    min-width:
        280px;

    max-width:
        420px;

    white-space:
        normal;

    word-break:
        break-word;

}


.amount {

    min-width:
        120px;

    text-align:
        right;

    font-variant-numeric:
        tabular-nums;

}


tfoot td {

    background:
        #EEF2FF;

    color:
        #111827;

    font-weight:
        700;

}


.total-label {

    text-align:
        right;

}


.report-footer {

    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        30px;

    width:
        100%;

    margin-top:
        18px;

    padding-top:
        12px;

    border-top:
        1px solid #E5E7EB;

    color:
        #6B7280;

    font-size:
        10px;

}


@media print {

    @page {

        size:
            landscape;

        margin:
            7mm;

    }


    html,
    body {

        overflow:
            visible;

    }


    body {

        width:
            auto;

        min-width:
            0;

        padding:
            0;

        font-size:
            7px;

    }


    th,
    td {

        padding:
            4px;

    }

}

</style>

</head>


<body>


<div class="report">


    <!-- ==============================================
         REPORT HEADER
    =============================================== -->

    <div class="report-header">


        <h1 class="report-title">

            FINOVA ACCOUNTING SYSTEM

        </h1>


        <div class="report-subtitle">

            Aging Payable

        </div>


        <div class="report-description">

            Accounting / Aging Payable

        </div>


        <div class="report-date">

            As Of Date :

            ${
                this.formatDate(
                    this.asOfDateValue
                )
            }

            &nbsp; | &nbsp;

            Preview Date :

            ${this.escapeHTML(previewDate)}

        </div>


    </div>


    <!-- ==============================================
         TABLE
    =============================================== -->

    <div class="table-container">

        <div class="table-wrapper">

            <table>


                <thead>

                    <tr>

                        <th>No</th>

                        <th>Vendor</th>

                        <th>Invoice No</th>

                        <th>PO No</th>

                        <th>Description</th>

                        <th>Account Holder</th>

                        <th>Bank Name</th>

                        <th>Bank Account</th>

                        <th>Invoice Date</th>

                        <th>Due Date</th>

                        <th>Outstanding</th>

                        <th>Current</th>

                        <th>1 - 30</th>

                        <th>31 - 60</th>

                        <th>61 - 90</th>

                        <th>&gt; 90</th>

                        <th>Total Amount</th>

                        <th>Before Tax Amount</th>

                        <th>Tax (+)</th>

                        <th>Tax (-)</th>

                    </tr>

                </thead>


                <tbody>

                    ${reportRows}

                </tbody>


                <tfoot>

                    <tr>


                        <!--
                        ==========================================
                        FIRST 10 NON-AMOUNT COLUMNS
                        ==========================================
                        -->

                        <td
                            colspan="10"
                            class="
                                amount
                                total-label
                            ">

                            TOTAL

                        </td>


                        <!-- OUTSTANDING -->

                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.outstanding
                                )
                            }

                        </td>


                        <!-- CURRENT -->

                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.current
                                )
                            }

                        </td>


                        <!-- 1 - 30 -->

                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.d1
                                )
                            }

                        </td>


                        <!-- 31 - 60 -->

                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.d31
                                )
                            }

                        </td>


                        <!-- 61 - 90 -->

                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.d61
                                )
                            }

                        </td>


                        <!-- > 90 -->

                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.d90
                                )
                            }

                        </td>


                        <!-- TOTAL AMOUNT -->

                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.totalAmount
                                )
                            }

                        </td>


                        <!-- BEFORE TAX -->

                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.beforeTax
                                )
                            }

                        </td>


                        <!-- TAX (+) -->

                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.taxPlus
                                )
                            }

                        </td>


                        <!-- TAX (-) -->

                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.taxMinus
                                )
                            }

                        </td>


                    </tr>

                </tfoot>


            </table>

        </div>

    </div>


    <!-- ==============================================
         REPORT FOOTER
    =============================================== -->

    <div class="report-footer">

        <div>

            Total Records :
            ${rowsData.length}

        </div>


        <div>

            Generated by FINOVA Accounting System

        </div>

    </div>


</div>


</body>

</html>

            `;


            /*
            ======================================================
            WRITE PREVIEW
            ======================================================
            */

            previewWindow.document.open();


            previewWindow.document.write(
                html
            );


            previewWindow.document.close();


            /*
            ======================================================
            TITLE
            ======================================================
            */

            previewWindow.document.title =
                "Aging Payable - Preview";


            /*
            ======================================================
            FOCUS
            ======================================================
            */

            previewWindow.focus();

        }

        catch (error) {

            console.error(
                "AgingPayable.previewHTML:",
                error
            );


            this.showError(

                error?.message

                ||

                "Failed to preview Aging Payable."

            );

        }

    }


    /*
    ==========================================================
    DOWNLOAD EXCEL
    ==========================================================
    */

    downloadExcel() {

        try {


            /*
            ======================================================
            DATA
            ======================================================
            */

            const rows =

                Array.isArray(
                    this.filteredData
                )

                    ? this.filteredData

                    : [];


            /*
            ======================================================
            VALIDATE
            ======================================================
            */

            if (
                !rows.length
            ) {

                this.showError(
                    "No Aging Payable data available to export."
                );

                return;

            }


            /*
            ======================================================
            EXCEL DATA
            ======================================================
            */

            const data =
                rows.map(

                    (
                        row,
                        index
                    ) => ({


                        /*
                        ==========================================
                        NO
                        ==========================================
                        */

                        "No":

                            index
                            +
                            1,


                        /*
                        ==========================================
                        VENDOR
                        ==========================================
                        */

                        "Vendor":

                            row.vendor_name
                            ||
                            "",


                        /*
                        ==========================================
                        INVOICE
                        ==========================================
                        */

                        "Invoice No":

                            row.invoice_no
                            ||
                            "",


                        /*
                        ==========================================
                        PO NO
                        ==========================================
                        */

                        "PO No":

                            row.po_no
                            ||
                            "",


                        /*
                        ==========================================
                        DESCRIPTION
                        ==========================================
                        */

                        "Description":

                            row.description
                            ||
                            "",


                        /*
                        ==========================================
                        ACCOUNT HOLDER
                        ==========================================
                        */

                        "Account Holder":

                            row.account_holder
                            ||
                            "",


                        /*
                        ==========================================
                        BANK NAME
                        ==========================================
                        */

                        "Bank Name":

                            row.bank_name
                            ||
                            "",


                        /*
                        ==========================================
                        BANK ACCOUNT
                        ==========================================
                        */

                        "Bank Account":

                            row.bank_account
                            ||
                            "",


                        /*
                        ==========================================
                        INVOICE DATE
                        ==========================================
                        */

                        "Invoice Date":

                            row.invoice_date
                            ||
                            "",


                        /*
                        ==========================================
                        DUE DATE
                        ==========================================
                        */

                        "Due Date":

                            row.due_date
                            ||
                            "",


                        /*
                        ==========================================
                        AGING DAYS
                        ==========================================
                        */

                        "Aging Days":

                            Number(
                                row.aging_days
                                ||
                                0
                            ),


                        /*
                        ==========================================
                        OUTSTANDING
                        ==========================================
                        */

                        "Outstanding":

                            this.toNumber(
                                row.outstanding_amount
                            ),


                        /*
                        ==========================================
                        CURRENT
                        ==========================================
                        */

                        "Current":

                            this.toNumber(
                                row.current
                            ),


                        /*
                        ==========================================
                        1 - 30
                        ==========================================
                        */

                        "1 - 30":

                            this.toNumber(
                                row.days_1_30
                            ),


                        /*
                        ==========================================
                        31 - 60
                        ==========================================
                        */

                        "31 - 60":

                            this.toNumber(
                                row.days_31_60
                            ),


                        /*
                        ==========================================
                        61 - 90
                        ==========================================
                        */

                        "61 - 90":

                            this.toNumber(
                                row.days_61_90
                            ),


                        /*
                        ==========================================
                        > 90
                        ==========================================
                        */

                        "> 90":

                            this.toNumber(
                                row.days_90_plus
                            ),


                        /*
                        ==========================================
                        TOTAL AMOUNT
                        ==========================================
                        */

                        "Total Amount":

                            this.toNumber(
                                row.total_amount
                            ),


                        /*
                        ==========================================
                        BEFORE TAX
                        ==========================================
                        */

                        "Before Tax Amount":

                            this.toNumber(
                                row.before_tax_amount
                            ),


                        /*
                        ==========================================
                        TAX (+)
                        ==========================================
                        */

                        "Tax (+)":

                            this.toNumber(
                                row.tax_plus_amount
                            ),


                        /*
                        ==========================================
                        TAX (-)
                        ==========================================
                        */

                        "Tax (-)":

                            this.toNumber(
                                row.tax_minus_amount
                            )

                    })

                );


            /*
            ======================================================
            EXPORT
            ======================================================
            */

            ExcelExportService.export(

                data,

                "Aging Payable",

                "Aging Payable"

            );

        }

        catch (error) {

            console.error(
                "AgingPayable.downloadExcel:",
                error
            );


            this.showError(

                error?.message

                ||

                "Failed to download Aging Payable Excel."

            );

        }

    }


    /*
    ==========================================================
    HAS VALUE
    ==========================================================
    */

    hasValue(
        value
    ) {

        return (

            value !== null

            &&

            value !== undefined

            &&

            value !== ""

        );

    }


    /*
    ==========================================================
    TO NUMBER
    ==========================================================
    */

    toNumber(
        value
    ) {


        /*
        ======================================================
        EMPTY
        ======================================================
        */

        if (
            value === null
            ||
            value === undefined
            ||
            value === ""
        ) {

            return 0;

        }


        /*
        ======================================================
        NUMBER
        ======================================================
        */

        if (
            typeof value === "number"
        ) {

            return Number.isFinite(
                value
            )

                ? value

                : 0;

        }


        /*
        ======================================================
        TEXT
        ======================================================
        */

        const text =
            String(
                value
            )
                .trim();


        if (
            !text
        ) {

            return 0;

        }


        /*
        ======================================================
        NORMAL DATABASE NUMBER

        Examples:
        50000000
        50000000.00
        -50000000.00
        ======================================================
        */

        if (
            /^-?\d+(\.\d+)?$/.test(
                text
            )
        ) {

            const number =
                Number(
                    text
                );


            return Number.isFinite(
                number
            )

                ? number

                : 0;

        }


        /*
        ======================================================
        INDONESIAN FORMATTED NUMBER

        Examples:
        50.000.000
        50.000.000,50
        ======================================================
        */

        const normalized =
            text

                .replace(
                    /\s/g,
                    ""
                )

                .replace(
                    /\./g,
                    ""
                )

                .replace(
                    ",",
                    "."
                );


        const number =
            Number(
                normalized
            );


        return Number.isFinite(
            number
        )

            ? number

            : 0;

    }


    /*
    ==========================================================
    CLEAN NUMBER
    ==========================================================
    */

    cleanNumber(
        value
    ) {

        const number =
            this.toNumber(
                value
            );


        /*
        ======================================================
        AVOID -0 / FLOATING NOISE
        ======================================================
        */

        return Math.abs(
            number
        )
        <
        0.0001

            ? 0

            : number;

    }


    /*
    ==========================================================
    PARSE DATE
    ==========================================================
    */

    parseDate(
        value
    ) {

        if (
            !value
        ) {

            return null;

        }


        /*
        ======================================================
        NORMALIZE YYYY-MM-DD
        ======================================================
        */

        const text =
            String(
                value
            )
                .slice(
                    0,
                    10
                );


        /*
        ======================================================
        VALIDATE BASIC DATE
        ======================================================
        */

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                text
            )
        ) {

            return null;

        }


        /*
        ======================================================
        CREATE LOCAL DATE
        ======================================================
        */

        const date =
            new Date(
                `${text}T00:00:00`
            );


        /*
        ======================================================
        VALIDATE
        ======================================================
        */

        return Number.isNaN(
            date.getTime()
        )

            ? null

            : date;

    }


    /*
    ==========================================================
    FORMAT DATE
    ==========================================================
    */

    formatDate(
        value
    ) {

        const date =
            this.parseDate(
                value
            );


        if (
            !date
        ) {

            return "-";

        }


        return date.toLocaleDateString(

            "en-GB",

            {

                day:
                    "numeric",

                month:
                    "short",

                year:
                    "numeric"

            }

        );

    }


    /*
    ==========================================================
    FORMAT AMOUNT
    ==========================================================
    */

    formatAmount(
        value
    ) {

        /*
        ======================================================
        NUMBER
        ======================================================
        */

        const amount =
            Math.round(

                this.cleanNumber(
                    value
                )

            );


        /*
        ======================================================
        IDR STYLE
        50000000 -> 50.000.000
        ======================================================
        */

        return amount.toLocaleString(
            "id-ID"
        );

    }


    /*
    ==========================================================
    ESCAPE HTML
    ==========================================================
    */

    escapeHTML(
        value
    ) {

        return String(

            value

            ??

            ""

        )

            .replaceAll(
                "&",
                "&amp;"
            )

            .replaceAll(
                "<",
                "&lt;"
            )

            .replaceAll(
                ">",
                "&gt;"
            )

            .replaceAll(
                '"',
                "&quot;"
            )

            .replaceAll(
                "'",
                "&#039;"
            );

    }


    /*
    ==========================================================
    SHOW ERROR
    ==========================================================
    */

    showError(
        message
    ) {

        /*
        ======================================================
        FINOVA GLOBAL ERROR
        ======================================================
        */

        if (
            window.App?.showError
        ) {

            window.App.showError(
                message
            );

            return;

        }


        /*
        ======================================================
        FALLBACK
        ======================================================
        */

        alert(
            message
        );

    }



}