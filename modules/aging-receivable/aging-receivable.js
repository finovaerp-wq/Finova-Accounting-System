/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : AGING RECEIVABLE
FILE    : aging-receivable.js
VERSION : 4.1.0 FINAL
STANDARD: AGING PAYABLE
==========================================================
*/

import {
    AccountReceivableService
} from "../../service/account-receivable.service.js";


import {
    BusinessPartnerBankService
} from "../../service/business-partner-bank.service.js";


import {
    BankService
} from "../../service/bank.service.js";


import {
    ExcelExportService
} from "../../service/excel-export.service.js";


export class AgingReceivable {


    /*
    ==========================================================
    CONSTRUCTOR
    ==========================================================
    */

    constructor() {

        this.service =
            new AccountReceivableService();


        /*
        ======================================================
        DATA
        ======================================================
        */

        this.data = [];

        this.filteredData = [];


        /*
        ======================================================
        PAGINATION
        ======================================================
        */

        this.currentPage = 1;

        this.pageSize = 10;

        this.totalPages = 1;

        this.totalRows = 0;


        /*
        ======================================================
        AGING REFERENCE DATE
        ======================================================
        */

        this.asOfDateValue = null;


        /*
        ======================================================
        BANK CACHE
        ======================================================
        */

        this.bankMasterMap =
            new Map();

        this.customerBankCache =
            new Map();


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

            window.App?.showLoading?.();


            this.cacheDom();

            this.setDefaultFilterDates();

            this.bindEvents();


            await this.loadData(
                false
            );

        }

        catch (
            error
        ) {

            console.error(
                "AgingReceivable.init",
                error
            );


            this.showError(

                error?.message
                ||
                "Failed to initialize Aging Receivable."

            );

        }

        finally {

            window.App?.hideLoading?.();

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
                "aging-receivable-date-from"
            );


        this.filterDateTo =
            document.getElementById(
                "aging-receivable-date-to"
            );


        this.filterStatus =
            document.getElementById(
                "aging-receivable-status"
            );


        this.filterFindBy =
            document.getElementById(
                "aging-receivable-find-by"
            );


        this.filterKeyword =
            document.getElementById(
                "aging-receivable-keyword"
            );


        this.btnFind =
            document.getElementById(
                "btn-find-aging-receivable"
            );


        /*
        ======================================================
        HEADER ACTION
        ======================================================
        */

        this.btnRefresh =
            document.getElementById(
                "btn-refresh-aging-receivable"
            );


        this.btnDownload =
            document.getElementById(
                "btn-download-excel-aging-receivable"
            );


        this.btnPreview =
            document.getElementById(
                "btn-preview-html-aging-receivable"
            );


        /*
        ======================================================
        TABLE
        ======================================================
        */

        this.tableBody =
            document.getElementById(
                "aging-receivable-tbody"
            );


        /*
        ======================================================
        TOTAL - AGING
        ======================================================
        */

        this.totalOutstanding =
            document.getElementById(
                "aging-ar-total-outstanding"
            );


        this.totalCurrent =
            document.getElementById(
                "aging-ar-total-current"
            );


        this.total1to30 =
            document.getElementById(
                "aging-ar-total-1-30"
            );


        this.total31to60 =
            document.getElementById(
                "aging-ar-total-31-60"
            );


        this.total61to90 =
            document.getElementById(
                "aging-ar-total-61-90"
            );


        this.total90plus =
            document.getElementById(
                "aging-ar-total-90-plus"
            );


        /*
        ======================================================
        TOTAL - INVOICE
        ======================================================
        */

        this.totalAmount =
            document.getElementById(
                "aging-ar-total-amount"
            );


        this.totalBeforeTax =
            document.getElementById(
                "aging-ar-total-before-tax"
            );


        this.totalTaxPlus =
            document.getElementById(
                "aging-ar-total-tax-plus"
            );


        this.totalTaxMinus =
            document.getElementById(
                "aging-ar-total-tax-minus"
            );


        /*
        ======================================================
        PAGINATION
        ======================================================
        */

        this.btnFirst =
            document.getElementById(
                "aging-ar-page-first"
            );


        this.btnPrev =
            document.getElementById(
                "aging-ar-page-prev"
            );


        this.btnNext =
            document.getElementById(
                "aging-ar-page-next"
            );


        this.btnLast =
            document.getElementById(
                "aging-ar-page-last"
            );


        this.currentPageInput =
            document.getElementById(
                "aging-ar-current-page"
            );


        this.totalPagesLabel =
            document.getElementById(
                "aging-ar-total-pages"
            );


        this.displayRecord =
            document.getElementById(
                "aging-ar-record-info"
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
        AGING AS OF
        ======================================================
        */

        this.asOfDateValue =
            localToday
                .toISOString()
                .slice(
                    0,
                    10
                );


        if (
            this.filterDateFrom
        ) {

            this.filterDateFrom.value =
                "";

        }


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

            event => {

                event.preventDefault();

                this.resetAndReload();

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
        DOWNLOAD
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
        PAGINATION
        ======================================================
        */

        this.btnFirst?.addEventListener(

            "click",

            () =>
                this.goToPage(
                    1
                )

        );


        this.btnPrev?.addEventListener(

            "click",

            () =>
                this.goToPage(
                    this.currentPage - 1
                )

        );


        this.btnNext?.addEventListener(

            "click",

            () =>
                this.goToPage(
                    this.currentPage + 1
                )

        );


        this.btnLast?.addEventListener(

            "click",

            () =>
                this.goToPage(
                    this.totalPages
                )

        );


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
        showLoading = true
    ) {

        try {

            if (
                showLoading
            ) {

                window.App?.showLoading?.();

            }


            this.showTableLoading();


            /*
            ======================================================
            LOAD ACCOUNT RECEIVABLE
            ======================================================
            */

            const result =
                await this.service.getAll();


            const source =
                Array.isArray(
                    result
                )
                    ? result

                    : Array.isArray(
                        result?.data
                    )
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
            RESET CUSTOMER BANK CACHE
            ======================================================
            */

            this.customerBankCache.clear();


            /*
            ======================================================
            FILTER VALID RECEIVABLE
            ======================================================

            Draft = belum menjadi receivable resmi
            Paid  = outstanding sudah habis
            Void  = dibatalkan

            ======================================================
            */

            const validRows =
                source.filter(

                    row => {

                        const status =
                            String(
                                row?.status
                                ||
                                ""
                            )
                                .trim()
                                .toLowerCase();


                        if (
                            status === "draft"
                            ||
                            status === "paid"
                            ||
                            status === "void"
                        ) {

                            return false;

                        }


                        const total =
                            this.toNumber(
                                row?.total_amount
                            );


                        const paid =
                            this.toNumber(
                                row?.paid_amount
                            );


                        const explicitOutstanding =
                            row?.outstanding_amount;


                        const outstanding =
                            explicitOutstanding !== null
                            &&
                            explicitOutstanding !== undefined

                                ? this.toNumber(
                                    explicitOutstanding
                                )

                                : Math.max(
                                    total - paid,
                                    0
                                );


                        return outstanding > 0;

                    }

                );


            /*
            ======================================================
            LOAD CUSTOMER BANK
            ======================================================
            */

            const normalizedRows = [];


            for (
                const row
                of validRows
            ) {

                const customer =
                    row?.mst_business_partner
                    ||
                    row?.customer
                    ||
                    {};


                const customerId =
                    row?.customer_id
                    ??
                    row?.business_partner_id
                    ??
                    customer?.id
                    ??
                    null;


                const bankInfo =
                    await this.getCustomerBankInfo(
                        customerId
                    );


                normalizedRows.push(

                    this.normalizeRow(
                        row,
                        bankInfo
                    )

                );

            }


            this.data =
                normalizedRows;


            console.log(
                "AGING RECEIVABLE FINAL DATA:",
                this.data
            );


            this.applyFilter();

        }

        catch (
            error
        ) {

            console.error(
                "AgingReceivable.loadData",
                error
            );


            this.data = [];

            this.filteredData = [];


            this.refreshView();


            this.showError(

                error?.message
                ||
                "Failed to load Aging Receivable."

            );

        }

        finally {

            if (
                showLoading
            ) {

                window.App?.hideLoading?.();

            }

        }

    }


    /*
    ==========================================================
    LOAD BANK MASTER
    ==========================================================
    */

    async loadBankMaster() {

        this.bankMasterMap =
            new Map();


        try {

            const result =
                await BankService.getAll();


            const rows =
                Array.isArray(
                    result
                )
                    ? result

                    : Array.isArray(
                        result?.data
                    )
                        ? result.data

                        : [];


            rows.forEach(

                bank => {

                    const id =
                        bank?.id;


                    if (
                        id !== null
                        &&
                        id !== undefined
                    ) {

                        this.bankMasterMap.set(

                            String(id),

                            bank

                        );

                    }

                }

            );


            console.log(
                "AGING RECEIVABLE BANK MASTER COUNT:",
                this.bankMasterMap.size
            );

        }

        catch (
            error
        ) {

            /*
            ======================================================
            BANK MUST NOT BLOCK AGING RECEIVABLE
            ======================================================
            */

            console.error(
                "AgingReceivable.loadBankMaster",
                error
            );


            this.bankMasterMap =
                new Map();

        }

    }


    /*
    ==========================================================
    GET CUSTOMER BANK INFO
    ==========================================================
    */

    async getCustomerBankInfo(
        customerId
    ) {

        const emptyResult = {

            account_holder:
                "-",

            bank_name:
                "-",

            bank_account:
                "-"

        };


        if (
            customerId === null
            ||
            customerId === undefined
            ||
            customerId === ""
        ) {

            return emptyResult;

        }


        const cacheKey =
            String(
                customerId
            );


        /*
        ======================================================
        RETURN CACHE
        ======================================================
        */

        if (
            this.customerBankCache.has(
                cacheKey
            )
        ) {

            return this.customerBankCache.get(
                cacheKey
            );

        }


        try {

            /*
            ======================================================
            SAME SERVICE USED BY BUSINESS PARTNER MODULE
            ======================================================
            */

            const result =
                await BusinessPartnerBankService
                    .getByBusinessPartner(
                        customerId
                    );


            const banks =
                Array.isArray(
                    result
                )
                    ? result

                    : Array.isArray(
                        result?.data
                    )
                        ? result.data

                        : [];


            /*
            ======================================================
            DEFAULT BANK

            1. is_default = true
            2. fallback first bank
            ======================================================
            */

            const selectedBank =
                banks.find(

                    bank =>
                        bank?.is_default === true

                )
                ||
                banks[0]
                ||
                null;


            if (
                !selectedBank
            ) {

                this.customerBankCache.set(

                    cacheKey,

                    emptyResult

                );


                return emptyResult;

            }


            /*
            ======================================================
            BANK MASTER
            ======================================================
            */

            const bankId =
                selectedBank?.bank_id
                ??
                selectedBank?.mst_bank_id
                ??
                null;


            const bankMaster =
                bankId !== null
                &&
                bankId !== undefined

                    ? this.bankMasterMap.get(
                        String(bankId)
                    )

                    : null;


            const bankInfo = {

                account_holder:

                    selectedBank?.account_name
                    ||
                    selectedBank?.account_holder
                    ||
                    "-",


                bank_name:

                    bankMaster?.bank_name
                    ||
                    selectedBank?.bank_name
                    ||
                    selectedBank?.mst_bank?.bank_name
                    ||
                    "-",


                bank_account:

                    selectedBank?.account_number
                    ||
                    selectedBank?.bank_account
                    ||
                    "-"

            };


            this.customerBankCache.set(

                cacheKey,

                bankInfo

            );


            console.log(
                "AGING RECEIVABLE BANK MAPPING:",
                {

                    customer_id:
                        customerId,

                    bank_id:
                        bankId,

                    account_holder:
                        bankInfo.account_holder,

                    bank_name:
                        bankInfo.bank_name,

                    bank_account:
                        bankInfo.bank_account,

                    is_default:
                        selectedBank?.is_default

                }
            );


            return bankInfo;

        }

        catch (
            error
        ) {

            /*
            ======================================================
            BANK ERROR MUST NOT BLOCK AGING RECEIVABLE
            ======================================================
            */

            console.error(
                "AgingReceivable.getCustomerBankInfo",
                {

                    customerId,

                    message:
                        error?.message,

                    details:
                        error?.details,

                    hint:
                        error?.hint,

                    code:
                        error?.code,

                    error

                }
            );


            this.customerBankCache.set(

                cacheKey,

                emptyResult

            );


            return emptyResult;

        }

    }


    /*
    ==========================================================
    NORMALIZE ROW
    ==========================================================
    */

    normalizeRow(
        row,
        bankInfo = {}
    ) {


        /*
        ======================================================
        CUSTOMER
        ======================================================
        */

        const customer =
            row?.mst_business_partner
            ||
            row?.customer
            ||
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
                row?.grand_total
                ??
                row?.invoice_amount
                ??
                row?.amount
                ??
                0

            );


        /*
        ======================================================
        BEFORE TAX AMOUNT
        ======================================================
        */

        const beforeTaxAmount =
            this.toNumber(

                row?.subtotal
                ??
                row?.before_tax_amount
                ??
                row?.dpp_amount
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

                row?.tax_output_amount
                ??
                row?.tax_input_amount
                ??
                row?.tax_plus_amount
                ??
                row?.vat_amount
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
                row?.wht_amount
                ??
                0

            );


        /*
        ======================================================
        PAID
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

        Important:
        Payment rollback / payment update can change paid_amount.
        Therefore fallback is always:

        Total Amount - Paid Amount
        ======================================================
        */

        const hasExplicitOutstanding =
            row?.outstanding_amount !== null
            &&
            row?.outstanding_amount !== undefined
            &&
            row?.outstanding_amount !== "";


        const outstandingAmount =
            Math.max(

                hasExplicitOutstanding

                    ? this.toNumber(
                        row?.outstanding_amount
                    )

                    : totalAmount
                    -
                    paidAmount,

                0

            );


        /*
        ======================================================
        NORMALIZED RESULT
        ======================================================
        */

        return {

            ...row,


            /*
            ==================================================
            CUSTOMER
            ==================================================
            */

            customer_name:

                customer?.bp_name
                ||
                row?.customer_name
                ||
                row?.business_partner_name
                ||
                "-",


            /*
            ==================================================
            DOCUMENT
            ==================================================
            */

            invoice_no:

                row?.invoice_no
                ||
                "-",


            po_no:

                row?.po_no
                ||
                "-",


            description:

                row?.description
                ||
                "-",


            /*
            ==================================================
            CUSTOMER BANK
            ==================================================
            */

            account_holder:

                bankInfo?.account_holder
                ||
                "-",


            bank_name:

                bankInfo?.bank_name
                ||
                "-",


            bank_account:

                bankInfo?.bank_account
                ||
                "-",


            /*
            ==================================================
            DATE
            ==================================================
            */

            invoice_date:

                row?.invoice_date
                ||
                null,


            due_date:

                row?.due_date
                ||
                null,


            /*
            ==================================================
            AMOUNT
            ==================================================
            */

            total_amount:

                totalAmount,


            before_tax_amount:

                beforeTaxAmount,


            tax_plus_amount:

                taxPlusAmount,


            tax_minus_amount:

                taxMinusAmount,


            paid_amount:

                paidAmount,


            outstanding_amount:

                outstandingAmount,


            /*
            ==================================================
            AGING BUCKET
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

                        row?.due_date,

                        row?.outstanding_amount

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


        const amount =
            this.toNumber(
                outstanding
            );


        /*
        ======================================================
        NO DUE DATE
        ======================================================
        */

        if (
            !dueDate
            ||
            amount <= 0
        ) {

            result.current =
                amount;


            return result;

        }


        /*
        ======================================================
        PARSE DATE
        ======================================================
        */

        const asOf =
            this.parseDate(
                this.asOfDateValue
            );


        const due =
            this.parseDate(
                dueDate
            );


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
        DIFFERENCE DAYS
        ======================================================
        */

        const days =
            Math.floor(

                (
                    asOf
                    -
                    due
                )
                /
                86400000

            );


        result.aging_days =
            Math.max(
                0,
                days
            );


        /*
        ======================================================
        CURRENT
        ======================================================
        */

        if (
            days <= 0
        ) {

            result.current =
                amount;


            result.bucket =
                "current";

        }


        /*
        ======================================================
        1 - 30
        ======================================================
        */

        else if (
            days <= 30
        ) {

            result.days_1_30 =
                amount;


            result.bucket =
                "1-30";

        }


        /*
        ======================================================
        31 - 60
        ======================================================
        */

        else if (
            days <= 60
        ) {

            result.days_31_60 =
                amount;


            result.bucket =
                "31-60";

        }


        /*
        ======================================================
        61 - 90
        ======================================================
        */

        else if (
            days <= 90
        ) {

            result.days_61_90 =
                amount;


            result.bucket =
                "61-90";

        }


        /*
        ======================================================
        > 90
        ======================================================
        */

        else {

            result.days_90_plus =
                amount;


            result.bucket =
                "90+";

        }


        return result;

    }


    /*
    ==========================================================
    APPLY FILTER
    ==========================================================
    */

    applyFilter() {

        const dateFrom =
            this.filterDateFrom?.value
            ||
            "";


        const dateTo =
            this.filterDateTo?.value
            ||
            "";


        const status =
            this.filterStatus?.value
            ||
            "all";


        const findBy =
            this.filterFindBy?.value
            ||
            "invoice";


        const keyword =
            String(
                this.filterKeyword?.value
                ||
                ""
            )
                .trim()
                .toLowerCase();


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


                    if (
                        dateFrom
                        &&
                        invoiceDate
                        &&
                        invoiceDate < dateFrom
                    ) {

                        return false;

                    }


                    if (
                        dateTo
                        &&
                        invoiceDate
                        &&
                        invoiceDate > dateTo
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
                        &&
                        String(
                            row?.status
                            ||
                            ""
                        )
                            .trim()
                            .toLowerCase()
                        !==
                        String(
                            status
                        )
                            .trim()
                            .toLowerCase()
                    ) {

                        return false;

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
                    FIND VALUE
                    ==============================================
                    */

                    let value =
                        "";


                    if (
                        findBy === "invoice"
                    ) {

                        value =
                            row?.invoice_no
                            ||
                            "";

                    }


                    else if (
                        findBy === "po"
                    ) {

                        value =
                            row?.po_no
                            ||
                            "";

                    }


                    else {

                        value =
                            row?.customer_name
                            ||
                            "";

                    }


                    return String(
                        value
                    )
                        .toLowerCase()
                        .includes(
                            keyword
                        );

                }

            );


        this.currentPage =
            1;


        this.refreshView();

    }


    /*
    ==========================================================
    REFRESH VIEW
    ==========================================================
    */

    refreshView() {

        this.totalRows =
            this.filteredData.length;


        this.totalPages =
            Math.max(

                1,

                Math.ceil(

                    this.totalRows
                    /
                    this.pageSize

                )

            );


        this.currentPage =
            Math.min(

                Math.max(
                    this.currentPage,
                    1
                ),

                this.totalPages

            );


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


        this.tableBody.innerHTML =
            "";


        const start =
            (
                this.currentPage
                -
                1
            )
            *
            this.pageSize;


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
                        class="text-center py-5 text-muted">

                        No Aging Receivable record found.

                    </td>

                </tr>

            `;


            return;

        }


        /*
        ======================================================
        ROW
        ======================================================
        */

        rows.forEach(

            (
                row,
                index
            ) => {

                this.tableBody
                    .insertAdjacentHTML(

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
                     CUSTOMER
                =========================================== -->

                <td class="finova-table-name">

                    ${
                        this.escapeHTML(
                            row?.customer_name
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
                            row?.invoice_no
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
                            row?.po_no
                            ||
                            "-"
                        )
                    }

                </td>


                <!-- ==========================================
                     DESCRIPTION
                =========================================== -->

                <td class="finova-table-name">

                    ${
                        this.escapeHTML(
                            row?.description
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
                            row?.account_holder
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
                            row?.bank_name
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
                            row?.bank_account
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
                            row?.invoice_date
                        )
                    }

                </td>


                <!-- ==========================================
                     DUE DATE
                =========================================== -->

                <td class="finova-table-date">

                    ${
                        this.formatDate(
                            row?.due_date
                        )
                    }

                </td>


                <!-- ==========================================
                     OUTSTANDING
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.outstanding_amount
                        )
                    }

                </td>


                <!-- ==========================================
                     CURRENT
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.current
                        )
                    }

                </td>


                <!-- ==========================================
                     1 - 30
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.days_1_30
                        )
                    }

                </td>


                <!-- ==========================================
                     31 - 60
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.days_31_60
                        )
                    }

                </td>


                <!-- ==========================================
                     61 - 90
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.days_61_90
                        )
                    }

                </td>


                <!-- ==========================================
                     > 90
                =========================================== -->

                <td
                    class="
                        finova-table-number
                        aging-receivable-overdue
                    ">

                    ${
                        this.formatAmount(
                            row?.days_90_plus
                        )
                    }

                </td>


                <!-- ==========================================
                     TOTAL AMOUNT
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.total_amount
                        )
                    }

                </td>


                <!-- ==========================================
                     BEFORE TAX AMOUNT
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.before_tax_amount
                        )
                    }

                </td>


                <!-- ==========================================
                     TAX (+)
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.tax_plus_amount
                        )
                    }

                </td>


                <!-- ==========================================
                     TAX (-)
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.tax_minus_amount
                        )
                    }

                </td>


            </tr>

        `;

    }


    /*
    ==========================================================
    TOTAL
    ==========================================================
    */

    renderTotals() {

        const totals =
            this.filteredData.reduce(

                (
                    total,
                    row
                ) => {


                    /*
                    ==============================================
                    AGING
                    ==============================================
                    */

                    total.outstanding +=
                        this.toNumber(
                            row?.outstanding_amount
                        );


                    total.current +=
                        this.toNumber(
                            row?.current
                        );


                    total.d1 +=
                        this.toNumber(
                            row?.days_1_30
                        );


                    total.d31 +=
                        this.toNumber(
                            row?.days_31_60
                        );


                    total.d61 +=
                        this.toNumber(
                            row?.days_61_90
                        );


                    total.d90 +=
                        this.toNumber(
                            row?.days_90_plus
                        );


                    /*
                    ==============================================
                    INVOICE
                    ==============================================
                    */

                    total.totalAmount +=
                        this.toNumber(
                            row?.total_amount
                        );


                    total.beforeTax +=
                        this.toNumber(
                            row?.before_tax_amount
                        );


                    total.taxPlus +=
                        this.toNumber(
                            row?.tax_plus_amount
                        );


                    total.taxMinus +=
                        this.toNumber(
                            row?.tax_minus_amount
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


        /*
        ======================================================
        AGING TOTAL
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


        if (
            this.totalCurrent
        ) {

            this.totalCurrent.textContent =
                this.formatAmount(
                    totals.current
                );

        }


        if (
            this.total1to30
        ) {

            this.total1to30.textContent =
                this.formatAmount(
                    totals.d1
                );

        }


        if (
            this.total31to60
        ) {

            this.total31to60.textContent =
                this.formatAmount(
                    totals.d31
                );

        }


        if (
            this.total61to90
        ) {

            this.total61to90.textContent =
                this.formatAmount(
                    totals.d61
                );

        }


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
        INVOICE TOTAL
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


        if (
            this.totalBeforeTax
        ) {

            this.totalBeforeTax.textContent =
                this.formatAmount(
                    totals.beforeTax
                );

        }


        if (
            this.totalTaxPlus
        ) {

            this.totalTaxPlus.textContent =
                this.formatAmount(
                    totals.taxPlus
                );

        }


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
    PAGINATION
    ==========================================================
    */

    updatePagination() {

        const start =
            this.totalRows

                ? (
                    (
                        this.currentPage
                        -
                        1
                    )
                    *
                    this.pageSize
                )
                +
                1

                : 0;


        const end =
            Math.min(

                this.currentPage
                *
                this.pageSize,

                this.totalRows

            );


        /*
        ======================================================
        CURRENT PAGE
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
        BUTTON STATE
        ======================================================
        */

        if (
            this.btnFirst
        ) {

            this.btnFirst.disabled =
                this.currentPage <= 1;

        }


        if (
            this.btnPrev
        ) {

            this.btnPrev.disabled =
                this.currentPage <= 1;

        }


        if (
            this.btnNext
        ) {

            this.btnNext.disabled =
                this.currentPage
                >=
                this.totalPages;

        }


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


        this.renderTable();

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
            ======================================================
            RESET DATE
            ======================================================
            */

            if (
                this.filterDateFrom
            ) {

                this.filterDateFrom.value =
                    "";

            }


            if (
                this.filterDateTo
            ) {

                this.filterDateTo.value =
                    "";

            }


            /*
            ======================================================
            RESET STATUS
            ======================================================
            */

            if (
                this.filterStatus
            ) {

                this.filterStatus.value =
                    "all";

            }


            /*
            ======================================================
            RESET FIND BY
            ======================================================
            */

            if (
                this.filterFindBy
            ) {

                this.filterFindBy.value =
                    "invoice";

            }


            /*
            ======================================================
            RESET KEYWORD
            ======================================================
            */

            if (
                this.filterKeyword
            ) {

                this.filterKeyword.value =
                    "";

            }


            /*
            ======================================================
            RESET AGING DATE
            ======================================================
            */

            this.setDefaultFilterDates();


            /*
            ======================================================
            RELOAD
            ======================================================
            */

            await this.loadData(
                true
            );

        }

        catch (
            error
        ) {

            console.error(
                "AgingReceivable.refresh",
                error
            );

        }

    }


    /*
    ==========================================================
    TABLE LOADING
    ==========================================================
    */

    showTableLoading() {

        if (
            !this.tableBody
        ) {

            return;

        }


        this.tableBody.innerHTML = `

            <tr>

                <td
                    colspan="20"
                    class="text-center py-5">

                    <div
                        class="
                            spinner-border
                            spinner-border-sm
                            text-primary
                        "
                        role="status">
                    </div>

                    <div class="small text-muted mt-2">

                        Loading Aging Receivable...

                    </div>

                </td>

            </tr>

        `;

    }


    /*
    ==========================================================
    DOWNLOAD EXCEL
    ==========================================================
    */

    downloadExcel() {

        try {

            const rows =
                Array.isArray(
                    this.filteredData
                )
                    ? this.filteredData
                    : [];


            if (
                !rows.length
            ) {

                this.showError(
                    "No Aging Receivable data available to export."
                );


                return;

            }


            /*
            ======================================================
            EXPORT DATA
            ======================================================
            */

            const data =
                rows.map(

                    (
                        row,
                        index
                    ) => ({

                        "No":
                            index + 1,


                        "Customer":
                            row?.customer_name
                            ||
                            "",


                        "Invoice No":
                            row?.invoice_no
                            ||
                            "",


                        "PO No":
                            row?.po_no
                            ||
                            "",


                        "Description":
                            row?.description
                            ||
                            "",


                        "Account Holder":
                            row?.account_holder
                            ||
                            "",


                        "Bank Name":
                            row?.bank_name
                            ||
                            "",


                        "Bank Account":
                            row?.bank_account
                            ||
                            "",


                        "Invoice Date":
                            row?.invoice_date
                            ||
                            "",


                        "Due Date":
                            row?.due_date
                            ||
                            "",


                        "Outstanding":
                            this.toNumber(
                                row?.outstanding_amount
                            ),


                        "Current":
                            this.toNumber(
                                row?.current
                            ),


                        "1 - 30":
                            this.toNumber(
                                row?.days_1_30
                            ),


                        "31 - 60":
                            this.toNumber(
                                row?.days_31_60
                            ),


                        "61 - 90":
                            this.toNumber(
                                row?.days_61_90
                            ),


                        "> 90":
                            this.toNumber(
                                row?.days_90_plus
                            ),


                        "Total Amount":
                            this.toNumber(
                                row?.total_amount
                            ),


                        "Before Tax Amount":
                            this.toNumber(
                                row?.before_tax_amount
                            ),


                        "Tax (+)":
                            this.toNumber(
                                row?.tax_plus_amount
                            ),


                        "Tax (-)":
                            this.toNumber(
                                row?.tax_minus_amount
                            )

                    })

                );


            ExcelExportService.export(

                data,

                "Aging Receivable",

                "Aging Receivable"

            );

        }

        catch (
            error
        ) {

            console.error(
                "AgingReceivable.downloadExcel",
                error
            );


            this.showError(

                error?.message
                ||
                "Failed to download Aging Receivable Excel."

            );

        }

    }


    /*
    ==========================================================
    PREVIEW HTML
    ==========================================================
    */

    previewHTML() {

        try {

            const rows =
                Array.isArray(
                    this.filteredData
                )
                    ? this.filteredData
                    : [];


            if (
                !rows.length
            ) {

                this.showError(
                    "No Aging Receivable data available to preview."
                );


                return;

            }


            /*
            ======================================================
            OPEN WINDOW FIRST
            POPUP SAFE
            ======================================================
            */

            const previewWindow =
                window.open(

                    "about:blank",

                    "finova-aging-receivable-preview"

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
            TOTAL
            ======================================================
            */

            const totals =
                rows.reduce(

                    (
                        total,
                        row
                    ) => {

                        total.outstanding +=
                            this.toNumber(
                                row?.outstanding_amount
                            );


                        total.current +=
                            this.toNumber(
                                row?.current
                            );


                        total.d1 +=
                            this.toNumber(
                                row?.days_1_30
                            );


                        total.d31 +=
                            this.toNumber(
                                row?.days_31_60
                            );


                        total.d61 +=
                            this.toNumber(
                                row?.days_61_90
                            );


                        total.d90 +=
                            this.toNumber(
                                row?.days_90_plus
                            );


                        total.totalAmount +=
                            this.toNumber(
                                row?.total_amount
                            );


                        total.beforeTax +=
                            this.toNumber(
                                row?.before_tax_amount
                            );


                        total.taxPlus +=
                            this.toNumber(
                                row?.tax_plus_amount
                            );


                        total.taxMinus +=
                            this.toNumber(
                                row?.tax_minus_amount
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


            /*
            ======================================================
            REPORT ROWS
            ======================================================
            */

            const reportRows =
                rows
                    .map(

                        (
                            row,
                            index
                        ) => `

                            <tr>

                                <td class="center">

                                    ${index + 1}

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row?.customer_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row?.invoice_no
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row?.po_no
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="description">

                                    ${
                                        this.escapeHTML(
                                            row?.description
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row?.account_holder
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row?.bank_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row?.bank_account
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="center">

                                    ${
                                        this.formatDate(
                                            row?.invoice_date
                                        )
                                    }

                                </td>


                                <td class="center">

                                    ${
                                        this.formatDate(
                                            row?.due_date
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.outstanding_amount
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.current
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.days_1_30
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.days_31_60
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.days_61_90
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.days_90_plus
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.total_amount
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.before_tax_amount
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.tax_plus_amount
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.tax_minus_amount
                                        )
                                    }

                                </td>

                            </tr>

                        `

                    )
                    .join("");


            /*
            ======================================================
            PREVIEW HTML
            ======================================================
            */

            const html = `

<!DOCTYPE html>

<html lang="id">

<head>

<meta charset="UTF-8">

<title>Aging Receivable - Preview</title>

<style>

* {
    box-sizing: border-box;
}


html {

    margin: 0;

    padding: 0;

    width: 100%;

    min-height: 100%;

    overflow-x: auto;

    overflow-y: auto;

}


body {

    margin: 0;

    padding: 28px 32px 42px;

    width: max-content;

    min-width: 100%;

    min-height: 100vh;

    background: #ffffff;

    color: #1f2937;

    font-family:
        Tahoma,
        Arial,
        sans-serif;

    font-size: 12px;

}


.report {

    width: max-content;

    min-width:
        calc(
            100vw - 64px
        );

}


.report-header {

    width: 100%;

    padding-bottom: 16px;

    margin-bottom: 20px;

    border-bottom:
        2px solid #244494;

}


.report-title {

    margin: 0;

    font-size: 22px;

    font-weight: 700;

}


.report-subtitle {

    margin-top: 6px;

    font-size: 16px;

    font-weight: 700;

    color: #244494;

}


.report-description {

    margin-top: 5px;

    color: #6b7280;

}


.report-date {

    margin-top: 6px;

    font-size: 11px;

    color: #6b7280;

}


.table-container {

    width: max-content;

    min-width: 100%;

    border:
        1px solid #d1d5db;

    border-radius: 4px;

    background: #ffffff;

    overflow: visible;

}


.table-wrapper {

    width: max-content;

    min-width: 100%;

    overflow: visible !important;

}


table {

    width: max-content;

    min-width: 100%;

    margin: 0;

    border-collapse: collapse;

    table-layout: auto;

}


th {

    padding:
        10px
        9px;

    background:
        #244494;

    color:
        #ffffff;

    border:
        1px solid #d1d5db;

    font-size:
        11px;

    text-align:
        center;

    white-space:
        nowrap;

}


td {

    padding:
        9px;

    border:
        1px solid #d1d5db;

    background:
        #ffffff;

    white-space:
        nowrap;

}


tbody
tr:nth-child(even)
td {

    background:
        #f8fafc;

}


tfoot
td {

    background:
        #f1f5f9;

    font-weight:
        700;

}


.center {

    text-align:
        center;

}


.amount {

    min-width:
        120px;

    text-align:
        right;

}


.description {

    min-width:
        300px;

    max-width:
        450px;

    white-space:
        normal;

    word-break:
        break-word;

    line-height:
        1.5;

}


.report-footer {

    display:
        flex;

    justify-content:
        space-between;

    margin-top:
        18px;

    padding-top:
        12px;

    border-top:
        1px solid #e5e7eb;

    color:
        #6b7280;

    font-size:
        11px;

}

</style>

</head>


<body>


<div class="report">


    <!-- ==============================================
         HEADER
    =============================================== -->

    <div class="report-header">

        <h1 class="report-title">

            FINOVA ACCOUNTING SYSTEM

        </h1>


        <div class="report-subtitle">

            Aging Receivable

        </div>


        <div class="report-description">

            Accounting / Aging Receivable

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
            ${previewDate}

        </div>

    </div>


    <!-- ==============================================
         TABLE
    =============================================== -->

    <div class="table-container">

        <div class="table-wrapper">

            <table>


                <!-- ==================================
                     HEADER
                =================================== -->

                <thead>

                    <tr>

                        <th>No</th>

                        <th>Customer</th>

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


                <!-- ==================================
                     BODY
                =================================== -->

                <tbody>

                    ${reportRows}

                </tbody>


                <!-- ==================================
                     TOTAL
                =================================== -->

                <tfoot>

                    <tr>

                        <td
                            colspan="10"
                            class="amount">

                            TOTAL

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.outstanding
                                )
                            }

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.current
                                )
                            }

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.d1
                                )
                            }

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.d31
                                )
                            }

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.d61
                                )
                            }

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.d90
                                )
                            }

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.totalAmount
                                )
                            }

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.beforeTax
                                )
                            }

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.taxPlus
                                )
                            }

                        </td>


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
         FOOTER
    =============================================== -->

    <div class="report-footer">

        <div>

            Total Record :
            ${rows.length}

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


            previewWindow.document.title =
                "Aging Receivable - Preview";


            previewWindow.focus();

        }

        catch (
            error
        ) {

            console.error(
                "AgingReceivable.previewHTML",
                error
            );


            this.showError(

                error?.message
                ||
                "Failed to preview Aging Receivable."

            );

        }

    }


    /*
    ==========================================================
    TO NUMBER
    ==========================================================
    */

    toNumber(
        value
    ) {

        if (
            typeof value === "number"
        ) {

            return Number.isFinite(
                value
            )
                ? value
                : 0;

        }


        if (
            value === null
            ||
            value === undefined
            ||
            value === ""
        ) {

            return 0;

        }


        const text =
            String(
                value
            )
                .trim();


        /*
        ======================================================
        NORMAL DATABASE NUMBER

        Example:
        50000000
        50000000.50
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
        INDONESIAN FORMAT

        Example:
        50.000.000
        50.000.000,50
        ======================================================
        */

        const normalized =
            text
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
    DATE
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


        const date =
            new Date(

                `${
                    String(
                        value
                    )
                        .slice(
                            0,
                            10
                        )
                }T00:00:00`

            );


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


        return date
            .toLocaleDateString(

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

        return Math
            .round(
                this.toNumber(
                    value
                )
            )
            .toLocaleString(
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
    ERROR
    ==========================================================
    */

    showError(
        message
    ) {

        if (
            window.App?.showError
        ) {

            window.App.showError(
                message
            );


            return;

        }


        alert(
            message
        );

    }

}