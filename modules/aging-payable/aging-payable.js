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

        this.data =
            [];

        this.filteredData =
            [];

        this.currentPage =
            1;

        this.pageSize =
            10;

        this.totalPages =
            1;

        this.totalRows =
            0;

        this.asOfDateValue =
            null;

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

        catch (error) {

            console.error(
                "AgingPayable.init",
                error
            );

            this.showError(
                error?.message
                ||
                "Failed to initialize Aging Payable."
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
        HEADER BUTTON
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
        TOTAL
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
    BUSINESS PARTNER + DEFAULT BANK
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
            ==================================================
            LOAD ACCOUNT PAYABLE
            ==================================================
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
            ==================================================
            LOAD BANK MASTER
            ==================================================
            */

            let masterBanks =
                [];

            try {

                masterBanks =
                    await BankService.getAll();

            }

            catch (error) {

                console.error(
                    "AGING PAYABLE LOAD MASTER BANK ERROR:",
                    error
                );

                masterBanks =
                    [];

            }


            /*
            ==================================================
            BANK MASTER MAP
            ==================================================
            */

            const masterBankMap =
                new Map();

            (
                Array.isArray(
                    masterBanks
                )

                    ? masterBanks

                    : []
            )
            .forEach(

                bank => {

                    masterBankMap.set(

                        String(
                            bank?.id
                            ??
                            ""
                        ),

                        bank

                    );

                }

            );


            /*
            ==================================================
            BANK CACHE

            vendor_id -> bank[]
            ==================================================
            */

            const bankCache =
                new Map();


            /*
            ==================================================
            RESULT
            ==================================================
            */

            const normalizedRows =
                [];


            /*
            ==================================================
            LOOP AP
            ==================================================
            */

            for (
                const row of source
            ) {

                /*
                ==============================================
                STATUS
                ==============================================
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
                ==============================================
                PAID / VOID NOT AGING
                ==============================================
                */

                if (
                    status === "paid"
                    ||
                    status === "void"
                ) {

                    continue;

                }


                /*
                ==============================================
                VENDOR ID
                ==============================================
                */

                const vendorId =

                    row?.vendor_id

                    ??

                    row?.mst_business_partner?.id

                    ??

                    null;


                /*
                ==============================================
                LOAD BUSINESS PARTNER BANK
                ==============================================
                */

                let vendorBanks =
                    [];


                if (
                    vendorId !== null
                    &&
                    vendorId !== undefined
                    &&
                    vendorId !== ""
                ) {

                    const cacheKey =
                        String(
                            vendorId
                        );


                    /*
                    ==========================================
                    FROM CACHE
                    ==========================================
                    */

                    if (
                        bankCache.has(
                            cacheKey
                        )
                    ) {

                        vendorBanks =
                            bankCache.get(
                                cacheKey
                            );

                    }

                    /*
                    ==========================================
                    LOAD DATABASE
                    ==========================================
                    */

                    else {

                        try {

                            const bankResult =
                                await BusinessPartnerBankService
                                    .getByBusinessPartner(
                                        vendorId
                                    );

                            vendorBanks =

                                Array.isArray(
                                    bankResult
                                )

                                    ? bankResult

                                    : [];


                            /*
                            ======================================
                            ATTACH BANK MASTER
                            ======================================
                            */

                            vendorBanks =
                                vendorBanks.map(

                                    bank => {

                                        const masterBank =
                                            masterBankMap.get(

                                                String(
                                                    bank?.bank_id
                                                    ??
                                                    ""
                                                )

                                            )

                                            ??

                                            null;


                                        return {

                                            ...bank,

                                            mst_bank:
                                                masterBank

                                        };

                                    }

                                );


                            /*
                            ======================================
                            SAVE CACHE
                            ======================================
                            */

                            bankCache.set(
                                cacheKey,
                                vendorBanks
                            );

                        }

                        catch (
                            bankError
                        ) {

                            console.error(
                                `AGING PAYABLE BANK ERROR VENDOR ${vendorId}:`,
                                bankError
                            );

                            vendorBanks =
                                [];

                            bankCache.set(
                                cacheKey,
                                []
                            );

                        }

                    }

                }


                /*
                ==============================================
                BUSINESS PARTNER
                ==============================================
                */

                const vendor =
                    row?.mst_business_partner
                    ??
                    {};


                /*
                ==============================================
                ENRICH ROW
                ==============================================
                */

                const enrichedRow = {

                    ...row,

                    mst_business_partner: {

                        ...vendor,

                        mst_business_partner_bank:
                            vendorBanks

                    }

                };


                /*
                ==============================================
                NORMALIZE
                ==============================================
                */

                normalizedRows.push(

                    this.normalizeRow(
                        enrichedRow
                    )

                );

            }


            /*
            ==================================================
            SAVE DATA
            ==================================================
            */

            this.data =
                normalizedRows;


            console.log(
                "AGING PAYABLE FINAL DATA:",
                this.data
            );


            /*
            ==================================================
            APPLY FILTER
            ==================================================
            */

            this.applyFilter();

        }

        catch (error) {

            console.error(
                "AgingPayable.loadData",
                error
            );

            this.data =
                [];

            this.filteredData =
                [];

            this.refreshView();

            this.showError(
                error?.message
                ||
                "Failed to load Aging Payable."
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
    NORMALIZE ROW
    ==========================================================
    */

    normalizeRow(
        row
    ) {

        /*
        ======================================================
        VENDOR
        ======================================================
        */

        const vendor =
            row?.mst_business_partner
            ??
            {};


        /*
        ======================================================
        BANK LIST
        ======================================================
        */

        const bankList =

            Array.isArray(
                vendor?.mst_business_partner_bank
            )

                ? vendor.mst_business_partner_bank

                : [];


        /*
        ======================================================
        DEFAULT BANK
        ======================================================
        */

        const bank =

            bankList.find(

                item =>
                    item?.is_default === true

            )

            ??

            bankList[0]

            ??

            {};


        /*
        ======================================================
        BANK MASTER
        ======================================================
        */

        const bankMaster =
            bank?.mst_bank
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

                row?.grand_total

                ??

                row?.invoice_amount

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

                row?.subtotal_amount

                ??

                row?.dpp_amount

                ??

                0

            );


        /*
        ======================================================
        TAX +
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
        TAX -
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
        RETURN
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

                row?.vendor_name

                ??

                "-",


            /*
            ==================================================
            INVOICE NO
            ==================================================
            */

            invoice_no:

                row?.invoice_no

                ??

                "-",


            /*
            ==================================================
            PO NO
            ==================================================
            */

            po_no:

                row?.po_no

                ??

                "-",


            /*
            ==================================================
            DESCRIPTION
            ==================================================
            */

            description:

                row?.description

                ??

                "-",


            /*
            ==================================================
            BANK

            Account Holder =
            mst_business_partner_bank.account_name

            Bank Account =
            mst_business_partner_bank.account_number

            Bank Name =
            mst_bank.bank_name
            ==================================================
            */

            account_holder:

                bank?.account_name

                ??

                "-",


            bank_name:

                bankMaster?.bank_name

                ??

                bank?.bank_name

                ??

                "-",


            bank_account:

                bank?.account_number

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


        const amount =
            this.toNumber(
                outstanding
            );


        /*
        ======================================================
        NO DUE DATE / NO OUTSTANDING
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


        const days =
            Math.floor(

                (
                    asOf - due
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
                ??
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


                    /*
                    ==============================================
                    DATE FROM
                    ==============================================
                    */

                    if (
                        dateFrom
                        &&
                        invoiceDate
                        &&
                        invoiceDate < dateFrom
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
                            ??
                            ""
                        )
                        .toLowerCase()

                        !==

                        String(
                            status
                        )
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
                            ||
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
                            ||
                            "";

                    }


                    /*
                    ==============================================
                    VENDOR
                    ==============================================
                    */

                    else {

                        value =
                            row?.vendor_name
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
                this.currentPage - 1
            )

            *

            this.pageSize;


        const rows =
            this.filteredData.slice(

                start,

                start + this.pageSize

            );


        /*
        ======================================================
        EMPTY
        20 COLUMNS
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
        ROW
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
    20 COLUMNS
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
                     TAX +
                =========================================== -->

                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row.tax_plus_amount
                        )
                    }

                </td>


                <!-- ==========================================
                     TAX -
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

                total.outstanding +=
                    this.toNumber(
                        row.outstanding_amount
                    );

                total.current +=
                    this.toNumber(
                        row.current
                    );

                total.d1 +=
                    this.toNumber(
                        row.days_1_30
                    );

                total.d31 +=
                    this.toNumber(
                        row.days_31_60
                    );

                total.d61 +=
                    this.toNumber(
                        row.days_61_90
                    );

                total.d90 +=
                    this.toNumber(
                        row.days_90_plus
                    );

                total.totalAmount +=
                    this.toNumber(
                        row.total_amount
                    );

                total.beforeTax +=
                    this.toNumber(
                        row.before_tax_amount
                    );

                total.taxPlus +=
                    this.toNumber(
                        row.tax_plus_amount
                    );

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
    UPDATE PAGINATION
    ==========================================================
    */

    updatePagination() {

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


        const end =
            Math.min(

                this.currentPage
                *
                this.pageSize,

                this.totalRows

            );


        if (
            this.currentPageInput
        ) {

            this.currentPageInput.value =
                this.currentPage;

        }


        if (
            this.totalPagesLabel
        ) {

            this.totalPagesLabel.textContent =
                this.totalPages;

        }


        if (
            this.displayRecord
        ) {

            this.displayRecord.textContent =

                this.totalRows

                    ? `Displaying Record ${start} - ${end} of ${this.totalRows}`

                    : "Displaying Record 0 - 0 of 0";

        }


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


            if (
                this.filterStatus
            ) {

                this.filterStatus.value =
                    "all";

            }


            if (
                this.filterFindBy
            ) {

                this.filterFindBy.value =
                    "invoice";

            }


            if (
                this.filterKeyword
            ) {

                this.filterKeyword.value =
                    "";

            }


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


            this.asOfDateValue =
                localToday

                    .toISOString()

                    .slice(
                        0,
                        10
                    );


            await this.loadData(
                true
            );

        }

        catch (error) {

            console.error(
                "AgingPayable.resetAndReload",
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
    20 COLUMNS
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

                        Loading Aging Payable...

                    </div>

                </td>

            </tr>

        `;

    }


    /*
    ==========================================================
    PREVIEW HTML
    ==========================================================
    */

    previewHTML() {

        try {

            const rowsData =

                Array.isArray(
                    this.filteredData
                )

                    ? this.filteredData

                    : [];


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


            const previewDate =
                new Date()
                    .toLocaleString(
                        "id-ID"
                    );


            /*
            ======================================================
            ROWS
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

                                <td class="center">
                                    ${index + 1}
                                </td>


                                <td>
                                    ${
                                        this.escapeHTML(
                                            row.vendor_name
                                            ||
                                            "-"
                                        )
                                    }
                                </td>


                                <td>
                                    ${
                                        this.escapeHTML(
                                            row.invoice_no
                                            ||
                                            "-"
                                        )
                                    }
                                </td>


                                <!-- PO NO -->

                                <td>
                                    ${
                                        this.escapeHTML(
                                            row.po_no
                                            ||
                                            "-"
                                        )
                                    }
                                </td>


                                <td class="description">
                                    ${
                                        this.escapeHTML(
                                            row.description
                                            ||
                                            "-"
                                        )
                                    }
                                </td>


                                <td>
                                    ${
                                        this.escapeHTML(
                                            row.account_holder
                                            ||
                                            "-"
                                        )
                                    }
                                </td>


                                <td>
                                    ${
                                        this.escapeHTML(
                                            row.bank_name
                                            ||
                                            "-"
                                        )
                                    }
                                </td>


                                <td>
                                    ${
                                        this.escapeHTML(
                                            row.bank_account
                                            ||
                                            "-"
                                        )
                                    }
                                </td>


                                <td class="center">
                                    ${
                                        this.formatDate(
                                            row.invoice_date
                                        )
                                    }
                                </td>


                                <td class="center">
                                    ${
                                        this.formatDate(
                                            row.due_date
                                        )
                                    }
                                </td>


                                <td class="amount">
                                    ${
                                        this.formatAmount(
                                            row.outstanding_amount
                                        )
                                    }
                                </td>


                                <td class="amount">
                                    ${
                                        this.formatAmount(
                                            row.current
                                        )
                                    }
                                </td>


                                <td class="amount">
                                    ${
                                        this.formatAmount(
                                            row.days_1_30
                                        )
                                    }
                                </td>


                                <td class="amount">
                                    ${
                                        this.formatAmount(
                                            row.days_31_60
                                        )
                                    }
                                </td>


                                <td class="amount">
                                    ${
                                        this.formatAmount(
                                            row.days_61_90
                                        )
                                    }
                                </td>


                                <td class="amount">
                                    ${
                                        this.formatAmount(
                                            row.days_90_plus
                                        )
                                    }
                                </td>


                                <td class="amount">
                                    ${
                                        this.formatAmount(
                                            row.total_amount
                                        )
                                    }
                                </td>


                                <td class="amount">
                                    ${
                                        this.formatAmount(
                                            row.before_tax_amount
                                        )
                                    }
                                </td>


                                <td class="amount">
                                    ${
                                        this.formatAmount(
                                            row.tax_plus_amount
                                        )
                                    }
                                </td>


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

    background: #FFFFFF;

    color: #1F2937;

    font-family:
        Tahoma,
        Arial,
        sans-serif;

    font-size: 11px;

}


.report {

    width: max-content;

    min-width: calc(100vw - 64px);

}


.report-header {

    width: 100%;

    margin-bottom: 20px;

    padding-bottom: 16px;

    border-bottom: 2px solid #244494;

}


.report-title {

    margin: 0;

    font-size: 22px;

    font-weight: 700;

}


.report-subtitle {

    margin-top: 6px;

    color: #244494;

    font-size: 16px;

    font-weight: 700;

}


.report-description {

    margin-top: 5px;

    color: #6B7280;

}


.report-date {

    margin-top: 6px;

    color: #6B7280;

    font-size: 11px;

}


.table-container {

    width: max-content;

    min-width: 100%;

    border: 1px solid #D1D5DB;

    border-radius: 4px;

    background: #FFFFFF;

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

    padding: 9px;

    background: #244494;

    color: #FFFFFF;

    border: 1px solid #D1D5DB;

    text-align: center;

    font-size: 10px;

    font-weight: 700;

    white-space: nowrap;

}


td {

    padding: 8px 9px;

    border: 1px solid #D1D5DB;

    background: #FFFFFF;

    vertical-align: middle;

    white-space: nowrap;

}


tbody tr:nth-child(even) td {

    background: #F8FAFC;

}


.center {

    text-align: center;

}


.description {

    min-width: 280px;

    max-width: 420px;

    white-space: normal;

    word-break: break-word;

}


.amount {

    min-width: 120px;

    text-align: right;

    font-variant-numeric: tabular-nums;

}


tfoot td {

    background: #EEF2FF;

    color: #111827;

    font-weight: 700;

}


.report-footer {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 30px;

    width: 100%;

    margin-top: 18px;

    padding-top: 12px;

    border-top: 1px solid #E5E7EB;

    color: #6B7280;

    font-size: 10px;

}


@media print {

    @page {

        size: landscape;

        margin: 7mm;

    }


    html,
    body {

        overflow: visible;

    }


    body {

        width: auto;

        min-width: 0;

        padding: 0;

        font-size: 7px;

    }


    th,
    td {

        padding: 4px;

    }

}

</style>

</head>


<body>


<div class="report">


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

            ${previewDate}

        </div>


    </div>


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
                        10 COLUMNS BEFORE OUTSTANDING

                        No
                        Vendor
                        Invoice No
                        PO No
                        Description
                        Account Holder
                        Bank Name
                        Bank Account
                        Invoice Date
                        Due Date
                        -->

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

            previewWindow.document.title =
                "Aging Payable - Preview";

            previewWindow.focus();

        }

        catch (error) {

            console.error(
                "AgingPayable.previewHTML",
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
                    "No Aging Payable data available to export."
                );

                return;

            }


            const data =
                rows.map(

                    (
                        row,
                        index
                    ) => ({

                        "No":
                            index + 1,


                        "Vendor":
                            row.vendor_name
                            ||
                            "",


                        "Invoice No":
                            row.invoice_no
                            ||
                            "",


                        "PO No":
                            row.po_no
                            ||
                            "",


                        "Description":
                            row.description
                            ||
                            "",


                        "Account Holder":
                            row.account_holder
                            ||
                            "",


                        "Bank Name":
                            row.bank_name
                            ||
                            "",


                        "Bank Account":
                            row.bank_account
                            ||
                            "",


                        "Invoice Date":
                            row.invoice_date
                            ||
                            "",


                        "Due Date":
                            row.due_date
                            ||
                            "",


                        "Aging Days":
                            Number(
                                row.aging_days
                                ||
                                0
                            ),


                        "Outstanding":
                            this.toNumber(
                                row.outstanding_amount
                            ),


                        "Current":
                            this.toNumber(
                                row.current
                            ),


                        "1 - 30":
                            this.toNumber(
                                row.days_1_30
                            ),


                        "31 - 60":
                            this.toNumber(
                                row.days_31_60
                            ),


                        "61 - 90":
                            this.toNumber(
                                row.days_61_90
                            ),


                        "> 90":
                            this.toNumber(
                                row.days_90_plus
                            ),


                        "Total Amount":
                            this.toNumber(
                                row.total_amount
                            ),


                        "Before Tax Amount":
                            this.toNumber(
                                row.before_tax_amount
                            ),


                        "Tax (+)":
                            this.toNumber(
                                row.tax_plus_amount
                            ),


                        "Tax (-)":
                            this.toNumber(
                                row.tax_minus_amount
                            )

                    })

                );


            ExcelExportService.export(

                data,

                "Aging Payable",

                "Aging Payable"

            );

        }

        catch (error) {

            console.error(
                "AgingPayable.downloadExcel",
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

        if (
            value === null
            ||
            value === undefined
            ||
            value === ""
        ) {

            return 0;

        }


        if (
            typeof value === "number"
        ) {

            return Number.isFinite(
                value
            )

                ? value

                : 0;

        }


        const text =
            String(
                value
            )
            .trim();


        /*
        ======================================================
        NORMAL DATABASE DECIMAL
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


        const text =
            String(
                value
            )
            .slice(
                0,
                10
            );


        const date =
            new Date(
                `${text}T00:00:00`
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

        return Math

            .round(

                this.cleanNumber(
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
    SHOW ERROR
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