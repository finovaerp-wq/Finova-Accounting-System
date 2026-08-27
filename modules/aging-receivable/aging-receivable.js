/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE : AGING RECEIVABLE
Version : 3.0 Enterprise
==========================================================
*/

import {
    AccountReceivableService
} from "../../service/account-receivable.service.js";


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


        this.data = [];

        this.filteredData = [];


        this.currentPage = 1;

        this.pageSize = 10;

        this.totalPages = 1;

        this.totalRows = 0;


        /*
        ======================================================
        AGING REFERENCE DATE
        ======================================================
        */

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
        TOTAL
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

        this.btnFind?.addEventListener(

            "click",

            event => {

                event.preventDefault();

                this.applyFilter();

            }

        );


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


        this.filterDateFrom?.addEventListener(

            "change",

            () => {

                this.applyFilter();

            }

        );


        this.filterDateTo?.addEventListener(

            "change",

            () => {

                this.applyFilter();

            }

        );


        this.filterStatus?.addEventListener(

            "change",

            () => {

                this.applyFilter();

            }

        );


        this.btnRefresh?.addEventListener(

            "click",

            event => {

                event.preventDefault();

                this.resetAndReload();

            }

        );


        this.btnPreview?.addEventListener(

            "click",

            event => {

                event.preventDefault();

                this.previewHTML();

            }

        );


        this.btnDownload?.addEventListener(

            "click",

            event => {

                event.preventDefault();

                this.downloadExcel();

            }

        );


        this.btnFirst?.addEventListener(
            "click",
            () => this.goToPage(1)
        );


        this.btnPrev?.addEventListener(
            "click",
            () => this.goToPage(
                this.currentPage - 1
            )
        );


        this.btnNext?.addEventListener(
            "click",
            () => this.goToPage(
                this.currentPage + 1
            )
        );


        this.btnLast?.addEventListener(
            "click",
            () => this.goToPage(
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


            const rows =
                await this.service.getAll();


            const source =
                Array.isArray(
                    rows
                )
                    ? rows
                    : [];


            /*
            ======================================================
            ONLY OUTSTANDING AR

            Draft = not valid receivable yet
            Paid  = no outstanding
            Void  = cancelled
            ======================================================
            */

            this.data =
                source
                    .filter(

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
                                Number(
                                    row?.total_amount
                                    ||
                                    0
                                );


                            const paid =
                                Number(
                                    row?.paid_amount
                                    ||
                                    0
                                );


                            const outstanding =
                                Number(

                                    row?.outstanding_amount
                                    ??
                                    (
                                        total
                                        -
                                        paid
                                    )

                                );


                            return outstanding > 0;

                        }

                    )
                    .map(

                        row =>
                            this.normalizeRow(
                                row
                            )

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


            throw error;

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
        TOTAL
        ======================================================
        */

        const invoiceTotal =
            Number(

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
        PAID
        ======================================================
        */

        const paidAmount =
            Number(

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

        const outstanding =
            Math.max(

                0,

                Number(

                    row?.outstanding_amount
                    ??
                    (
                        invoiceTotal
                        -
                        paidAmount
                    )

                )
                ||
                0

            );


        return {

            ...row,


            customer_name:

                customer?.bp_name
                ||
                row?.customer_name
                ||
                row?.business_partner_name
                ||
                "-",


            invoice_no:

                row?.invoice_no
                ||
                "-",


            po_no:

                row?.po_no
                ||
                "-",


            invoice_date:

                row?.invoice_date
                ||
                null,


            due_date:

                row?.due_date
                ||
                null,


            outstanding_amount:

                outstanding,


            ...this.calculateBucket(
                row?.due_date,
                outstanding
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

            aging_days: 0,

            bucket:
                "current",

            current: 0,

            days_1_30: 0,

            days_31_60: 0,

            days_61_90: 0,

            days_90_plus: 0

        };


        const amount =
            Number(
                outstanding
                ||
                0
            );


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


        if (
            days <= 0
        ) {

            result.current =
                amount;

            result.bucket =
                "current";

        }

        else if (
            days <= 30
        ) {

            result.days_1_30 =
                amount;

            result.bucket =
                "1-30";

        }

        else if (
            days <= 60
        ) {

            result.days_31_60 =
                amount;

            result.bucket =
                "31-60";

        }

        else if (
            days <= 90
        ) {

            result.days_61_90 =
                amount;

            result.bucket =
                "61-90";

        }

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
                    DATE
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


        if (
            !rows.length
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="12"
                        class="text-center py-5 text-muted">

                        No Aging Receivable record found.

                    </td>

                </tr>

            `;

            return;

        }


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

                <td class="finova-table-index">

                    ${number}

                </td>


                <td class="finova-table-name">

                    ${
                        this.escapeHTML(
                            row?.customer_name
                        )
                    }

                </td>


                <td class="finova-table-code">

                    ${
                        this.escapeHTML(
                            row?.invoice_no
                        )
                    }

                </td>


                <td class="finova-table-date">

                    ${
                        this.formatDate(
                            row?.invoice_date
                        )
                    }

                </td>


                <td class="finova-table-date">

                    ${
                        this.formatDate(
                            row?.due_date
                        )
                    }

                </td>


                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.outstanding_amount
                        )
                    }

                </td>


                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.current
                        )
                    }

                </td>


                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.days_1_30
                        )
                    }

                </td>


                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.days_31_60
                        )
                    }

                </td>


                <td class="finova-table-number">

                    ${
                        this.formatAmount(
                            row?.days_61_90
                        )
                    }

                </td>


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


                <td class="finova-table-status">

                    ${
                        this.renderStatus(
                            row?.status
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

                    total.outstanding +=
                        Number(
                            row?.outstanding_amount
                            ||
                            0
                        );


                    total.current +=
                        Number(
                            row?.current
                            ||
                            0
                        );


                    total.d1 +=
                        Number(
                            row?.days_1_30
                            ||
                            0
                        );


                    total.d31 +=
                        Number(
                            row?.days_31_60
                            ||
                            0
                        );


                    total.d61 +=
                        Number(
                            row?.days_61_90
                            ||
                            0
                        );


                    total.d90 +=
                        Number(
                            row?.days_90_plus
                            ||
                            0
                        );


                    return total;

                },

                {

                    outstanding: 0,

                    current: 0,

                    d1: 0,

                    d31: 0,

                    d61: 0,

                    d90: 0

                }

            );


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

                    ? `Records ${start} - ${end} of ${this.totalRows}`

                    : "Records 0 - 0 of 0";

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
                    Number(page)
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
    RESET
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


            this.setDefaultFilterDates();


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
                    colspan="12"
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

                        "Invoice Date":
                            row?.invoice_date
                            ||
                            "",

                        "Due Date":
                            row?.due_date
                            ||
                            "",

                        "Aging Days":
                            Number(
                                row?.aging_days
                                ||
                                0
                            ),

                        "Outstanding":
                            Number(
                                row?.outstanding_amount
                                ||
                                0
                            ),

                        "Current":
                            Number(
                                row?.current
                                ||
                                0
                            ),

                        "1 - 30":
                            Number(
                                row?.days_1_30
                                ||
                                0
                            ),

                        "31 - 60":
                            Number(
                                row?.days_31_60
                                ||
                                0
                            ),

                        "61 - 90":
                            Number(
                                row?.days_61_90
                                ||
                                0
                            ),

                        "> 90":
                            Number(
                                row?.days_90_plus
                                ||
                                0
                            ),

                        "Status":
                            row?.status
                            ||
                            ""

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


            const previewDate =
                new Date()
                    .toLocaleString(
                        "id-ID"
                    );


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
                                    ${this.escapeHTML(row?.customer_name || "-")}
                                </td>

                                <td>
                                    ${this.escapeHTML(row?.po_no || "-")}
                                </td>

                                <td>
                                    ${this.escapeHTML(row?.invoice_no || "-")}
                                </td>

                                <td class="description">
                                    ${this.escapeHTML(row?.description || "-")}
                                </td>

                                <td class="center">
                                    ${this.formatDate(row?.invoice_date)}
                                </td>

                                <td class="center">
                                    ${this.formatDate(row?.due_date)}
                                </td>

                                <td class="amount">
                                    ${this.formatAmount(row?.outstanding_amount)}
                                </td>

                                <td class="amount">
                                    ${this.formatAmount(row?.current)}
                                </td>

                                <td class="amount">
                                    ${this.formatAmount(row?.days_1_30)}
                                </td>

                                <td class="amount">
                                    ${this.formatAmount(row?.days_31_60)}
                                </td>

                                <td class="amount">
                                    ${this.formatAmount(row?.days_61_90)}
                                </td>

                                <td class="amount">
                                    ${this.formatAmount(row?.days_90_plus)}
                                </td>

                                <td class="center">
                                    ${this.escapeHTML(row?.status || "-")}
                                </td>

                            </tr>

                        `

                    )
                    .join("");


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
    font-family: Tahoma, Arial, sans-serif;
    font-size: 12px;
}

.report {
    width: max-content;
    min-width: calc(100vw - 64px);
}

.report-header {
    width: 100%;
    padding-bottom: 16px;
    margin-bottom: 20px;
    border-bottom: 2px solid #244494;
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

.table-container,
.table-wrapper {
    width: max-content;
    min-width: 100%;
    overflow: visible;
}

table {
    width: max-content;
    min-width: 100%;
    border-collapse: collapse;
}

th {
    padding: 10px 9px;
    background: #244494;
    color: #ffffff;
    border: 1px solid #d1d5db;
    font-size: 11px;
    text-align: center;
    white-space: nowrap;
}

td {
    padding: 9px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    white-space: nowrap;
}

tbody tr:nth-child(even) td {
    background: #f8fafc;
}

.center {
    text-align: center;
}

.amount {
    min-width: 120px;
    text-align: right;
}

.description {
    min-width: 300px;
    max-width: 450px;
    white-space: normal;
    word-break: break-word;
    line-height: 1.5;
}

.report-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 18px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 11px;
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
            Aging Receivable
        </div>

        <div class="report-description">
            Accounting / Aging Receivable
        </div>

        <div class="report-date">

            As Of Date :
            ${this.formatDate(this.asOfDateValue)}

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

                        <th>Customer</th>

                        <th>PO No</th>

                        <th>Invoice No</th>

                        <th>Description</th>

                        <th>Invoice Date</th>

                        <th>Due Date</th>

                        <th>Outstanding</th>

                        <th>Current</th>

                        <th>1 - 30</th>

                        <th>31 - 60</th>

                        <th>61 - 90</th>

                        <th>&gt; 90</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    ${reportRows}

                </tbody>

            </table>

        </div>

    </div>


    <div class="report-footer">

        <div>
            Total Record : ${rows.length}
        </div>

        <div>
            Generated by FINOVA Accounting System
        </div>

    </div>

</div>

</body>

</html>

            `;


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
    STATUS
    ==========================================================
    */

    renderStatus(
        status
    ) {

        const value =
            String(
                status
                ||
                "-"
            );


        const key =
            value
                .trim()
                .toLowerCase();


        let cssClass =
            "bg-secondary";


        if (
            key === "complete"
        ) {

            cssClass =
                "bg-success";

        }


        else if (
            key === "partial paid"
        ) {

            cssClass =
                "bg-warning text-dark";

        }


        return `

            <span class="badge ${cssClass}">

                ${this.escapeHTML(value)}

            </span>

        `;

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
                    String(value)
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
    AMOUNT
    ==========================================================
    */

    formatAmount(
        value
    ) {

        return Math
            .round(
                Number(
                    value
                    ||
                    0
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