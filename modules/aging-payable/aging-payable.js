/* ==========================================================
FINOVA ACCOUNTING SYSTEM
Module : Aging Payable
Version: 1.0 Enterprise
========================================================== */

import { AccountPayableService } from "../../service/account-payable.service.js";
import { ExcelExportService } from "../../service/excel-export.service.js";

export class AgingPayable {

    /*
==========================================================
CONSTRUCTOR
==========================================================
*/

constructor() {

    /*
    ======================================================
    SERVICE
    ======================================================
    */

    this.service =
        new AccountPayableService();


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

    Aging is calculated against today's date.
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

        /*
        ======================================================
        LOADING
        ======================================================
        */

        window.App?.showLoading?.();


        /*
        ======================================================
        CACHE DOM
        ======================================================
        */

        this.cacheDom();


        /*
        ======================================================
        DEFAULT DATES
        ======================================================
        */

        this.setDefaultFilterDates();


        /*
        ======================================================
        EVENTS
        ======================================================
        */

        this.bindEvents();


        /*
        ======================================================
        LOAD DATA
        ======================================================
        */

        await this.loadData(
            false
        );

    }

    catch (
        error
    ) {

        console.error(
            "AgingPayable.init",
            error
        );


        window.App?.showError?.(

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
    FILTER DATE
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


    /*
    ======================================================
    FILTER
    ======================================================
    */

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


    /*
    ======================================================
    FILTER ACTION
    ======================================================
    */

    this.btnFind =
        document.getElementById(
            "btn-find-aging-payable"
        );


    /*
    ======================================================
    HEADER ACTION
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
SET DEFAULT FILTER DATES
==========================================================
*/

setDefaultFilterDates() {

    /*
    ======================================================
    TODAY
    ======================================================
    */

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
    USED FOR AGING CALCULATION
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

    Default blank so all AP is shown.
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
    ENTER KEY
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
    CURRENT PAGE INPUT
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

    async loadData(showLoading = true) {
        try {
            if (showLoading) window.App?.showLoading?.();
            this.showTableLoading();

            const rows = await this.service.getAll();
            const source = Array.isArray(rows) ? rows : [];

            this.data = source
                .filter(row => {
                    const status = String(row.status || "").trim().toLowerCase();
                    return status !== "paid" && status !== "void";
                })
                .map(row => this.normalizeRow(row));

            this.applyFilter();
        } catch (error) {
            console.error("AgingPayable.loadData", error);
            this.data = [];
            this.filteredData = [];
            this.renderTable();
            throw error;
        } finally {
            if (showLoading) window.App?.hideLoading?.();
        }
    }

    normalizeRow(row) {
        const vendor = row.mst_business_partner || row.vendor || {};
        const invoiceTotal = Number(row.total_amount ?? row.grand_total ?? row.invoice_amount ?? row.amount ?? 0);
        const paidAmount = Number(row.paid_amount ?? row.payment_amount ?? row.total_paid ?? 0);
        const outstanding = Math.max(0, Number(row.outstanding_amount ?? (invoiceTotal - paidAmount)) || 0);

        return {
            ...row,
            vendor_name: vendor.bp_name || row.vendor_name || row.business_partner_name || "-",
            invoice_no: row.invoice_no || "-",
            po_no: row.po_no || "-",
            invoice_date: row.invoice_date || null,
            due_date: row.due_date || null,
            outstanding_amount: outstanding,
            ...this.calculateBucket(row.due_date, outstanding)
        };
    }

    rebuildAging() {
        this.data = this.data.map(row => ({
            ...row,
            ...this.calculateBucket(row.due_date, row.outstanding_amount)
        }));
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

    /*
    ======================================================
    DEFAULT RESULT
    ======================================================
    */

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


    /*
    ======================================================
    AMOUNT
    ======================================================
    */

    const amount =
        Number(
            outstanding
            ||
            0
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
    DAYS
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
FINAL
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
        this.filterStatus?.value
        ||
        "all";


    /*
    ======================================================
    FIND BY
    ======================================================
    */

    const findBy =
        this.filterFindBy?.value
        ||
        "invoice";


    /*
    ======================================================
    KEYWORD
    ======================================================
    */

    const keyword =
        String(
            this.filterKeyword?.value
            ||
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
                        ||
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
                        row?.vendor_name
                        ||
                        "";

                }


                /*
                ==============================================
                KEYWORD MATCH
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
    REFRESH VIEW
    ======================================================
    */

    this.refreshView();

}

    refreshView() {
        this.totalRows = this.filteredData.length;
        this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
        this.currentPage = Math.min(Math.max(this.currentPage, 1), this.totalPages);
        this.renderTable();
        this.renderTotals();
        this.updatePagination();
    }

    renderTable() {
        if (!this.tableBody) return;
        this.tableBody.innerHTML = "";

        const start = (this.currentPage - 1) * this.pageSize;
        const rows = this.filteredData.slice(start, start + this.pageSize);

        if (!rows.length) {
            this.tableBody.innerHTML = `<tr><td colspan="12" class="text-center py-5 text-muted">No Aging Payable record found.</td></tr>`;
            return;
        }

        rows.forEach((row, index) => {
            this.tableBody.insertAdjacentHTML("beforeend", this.createRow(row, start + index + 1));
        });
    }

    createRow(row, number) {
        return `
            <tr>
                <td class="finova-table-index">${number}</td>
                <td class="finova-table-name">${this.escapeHTML(row.vendor_name)}</td>
                <td class="finova-table-code">${this.escapeHTML(row.invoice_no)}</td>
                <td class="finova-table-date">${this.formatDate(row.invoice_date)}</td>
                <td class="finova-table-date">${this.formatDate(row.due_date)}</td>
                <td class="finova-table-number">${this.formatAmount(row.outstanding_amount)}</td>
                <td class="finova-table-number">${this.formatAmount(row.current)}</td>
                <td class="finova-table-number">${this.formatAmount(row.days_1_30)}</td>
                <td class="finova-table-number">${this.formatAmount(row.days_31_60)}</td>
                <td class="finova-table-number">${this.formatAmount(row.days_61_90)}</td>
                <td class="finova-table-number aging-payable-overdue">${this.formatAmount(row.days_90_plus)}</td>
                <td class="finova-table-status">${this.renderStatus(row.status)}</td>
            </tr>`;
    }

    renderTotals() {
        const totals = this.filteredData.reduce((t, r) => {
            t.outstanding += Number(r.outstanding_amount || 0);
            t.current += Number(r.current || 0);
            t.a += Number(r.days_1_30 || 0);
            t.b += Number(r.days_31_60 || 0);
            t.c += Number(r.days_61_90 || 0);
            t.d += Number(r.days_90_plus || 0);
            return t;
        }, { outstanding: 0, current: 0, a: 0, b: 0, c: 0, d: 0 });

        if (this.totalOutstanding) this.totalOutstanding.textContent = this.formatAmount(totals.outstanding);
        if (this.totalCurrent) this.totalCurrent.textContent = this.formatAmount(totals.current);
        if (this.total1to30) this.total1to30.textContent = this.formatAmount(totals.a);
        if (this.total31to60) this.total31to60.textContent = this.formatAmount(totals.b);
        if (this.total61to90) this.total61to90.textContent = this.formatAmount(totals.c);
        if (this.total90plus) this.total90plus.textContent = this.formatAmount(totals.d);
    }

    updatePagination() {
        const start = this.totalRows ? ((this.currentPage - 1) * this.pageSize) + 1 : 0;
        const end = Math.min(this.currentPage * this.pageSize, this.totalRows);
        if (this.currentPageInput) this.currentPageInput.value = this.currentPage;
        if (this.totalPagesLabel) this.totalPagesLabel.textContent = this.totalPages;
        if (this.displayRecord) this.displayRecord.textContent = this.totalRows ? `Records ${start} - ${end} of ${this.totalRows}` : "Records 0 - 0 of 0";
        if (this.btnFirst) this.btnFirst.disabled = this.currentPage <= 1;
        if (this.btnPrev) this.btnPrev.disabled = this.currentPage <= 1;
        if (this.btnNext) this.btnNext.disabled = this.currentPage >= this.totalPages;
        if (this.btnLast) this.btnLast.disabled = this.currentPage >= this.totalPages;
    }

    goToPage(page) {
        this.currentPage = Math.min(Math.max(Number(page) || 1, 1), this.totalPages);
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
        UPDATE AGING AS OF DATE
        ======================================================
        */

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


        /*
        ======================================================
        LOAD
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
            "AgingPayable.refresh",
            error
        );

    }

}

    showTableLoading() {
        if (!this.tableBody) return;
        this.tableBody.innerHTML = `<tr><td colspan="12" class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary" role="status"></div><div class="small text-muted mt-2">Loading Aging Payable...</div></td></tr>`;
    }

   /*
==========================================================
PREVIEW HTML
AGING PAYABLE
FINAL
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
        VALIDATION
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
        OPEN PREVIEW WINDOW
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
        TEMPORARY LOADING
        ======================================================
        */

        previewWindow.document.open();

        previewWindow.document.write(`

            <!DOCTYPE html>

            <html lang="id">

            <head>

                <meta charset="UTF-8">

                <title>
                    Aging Payable - Preview
                </title>

            </head>

            <body
                style="
                    font-family:Arial,sans-serif;
                    padding:30px;
                    color:#6b7280;
                "
            >

                Loading Aging Payable Preview...

            </body>

            </html>

        `);

        previewWindow.document.close();


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
        BUILD REPORT ROWS
        ======================================================
        */

        const reportRows =
            rowsData
                .map(

                    (
                        row,
                        index
                    ) => {

                        /*
                        ==========================================
                        PO NO
                        ==========================================
                        */

                        const poNo =
                            row?.po_no
                            ||
                            "-";


                        /*
                        ==========================================
                        INVOICE NO
                        ==========================================
                        */

                        const invoiceNo =
                            row?.invoice_no
                            ||
                            "-";


                        /*
                        ==========================================
                        DESCRIPTION
                        ==========================================
                        */

                        const description =
                            row?.description
                            ||
                            "-";


                        /*
                        ==========================================
                        RETURN ROW
                        ==========================================
                        */

                        return `

                            <tr>

                                <!-- ==============================
                                     NO
                                =============================== -->

                                <td class="center col-no">

                                    ${index + 1}

                                </td>


                                <!-- ==============================
                                     VENDOR
                                =============================== -->

                                <td class="vendor">

                                    ${
                                        this.escapeHTML(
                                            row?.vendor_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     PO NO
                                =============================== -->

                                <td class="po-no">

                                    ${
                                        this.escapeHTML(
                                            poNo
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     INVOICE NO
                                =============================== -->

                                <td class="invoice-no">

                                    ${
                                        this.escapeHTML(
                                            invoiceNo
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     DESCRIPTION
                                =============================== -->

                                <td class="description">

                                    ${
                                        this.escapeHTML(
                                            description
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     INVOICE DATE
                                =============================== -->

                                <td class="center date-column">

                                    ${
                                        this.formatDate(
                                            row?.invoice_date
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     DUE DATE
                                =============================== -->

                                <td class="center date-column">

                                    ${
                                        this.formatDate(
                                            row?.due_date
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     OUTSTANDING
                                =============================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.outstanding_amount
                                            ||
                                            0
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     CURRENT
                                =============================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.current
                                            ||
                                            0
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     1 - 30
                                =============================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.days_1_30
                                            ||
                                            0
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     31 - 60
                                =============================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.days_31_60
                                            ||
                                            0
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     61 - 90
                                =============================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.days_61_90
                                            ||
                                            0
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     > 90
                                =============================== -->

                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row?.days_90_plus
                                            ||
                                            0
                                        )
                                    }

                                </td>


                                <!-- ==============================
                                     STATUS
                                =============================== -->

                                <td class="center status-column">

                                    ${
                                        this.escapeHTML(
                                            row?.status
                                            ||
                                            "-"
                                        )
                                    }

                                </td>

                            </tr>

                        `;

                    }

                )
                .join("");


        /*
        ======================================================
        TOTALS
        ======================================================
        */

        const totals =
            rowsData.reduce(

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
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Aging Payable - Preview
    </title>


    <style>

        /*
        ======================================================
        GLOBAL
        ======================================================
        */

        * {

            box-sizing:
                border-box;

        }


        /*
        ======================================================
        HTML
        PAGE HANDLES SCROLL
        ======================================================
        */

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


        /*
        ======================================================
        BODY
        IMPORTANT:
        WIDTH FOLLOWS CONTENT
        ======================================================
        */

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
                #ffffff;

            color:
                #1f2937;

            font-family:
                Tahoma,
                Arial,
                sans-serif;

            font-size:
                12px;

        }


        /*
        ======================================================
        REPORT
        ======================================================
        */

        .report {

            width:
                max-content;

            min-width:
                calc(100vw - 64px);

        }


        /*
        ======================================================
        REPORT HEADER
        ======================================================
        */

        .report-header {

            width:
                100%;

            padding-bottom:
                16px;

            margin-bottom:
                20px;

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

            font-size:
                16px;

            font-weight:
                700;

            color:
                #244494;

        }


        .report-description {

            margin-top:
                5px;

            color:
                #6b7280;

        }


        .report-date {

            margin-top:
                6px;

            font-size:
                11px;

            color:
                #6b7280;

        }


        /*
        ======================================================
        TABLE CONTAINER
        NO INTERNAL SCROLL
        ======================================================
        */

        .table-container {

            width:
                max-content;

            min-width:
                100%;

            border:
                1px solid #d1d5db;

            border-radius:
                4px;

            background:
                #ffffff;

            overflow:
                visible;

        }


        /*
        ======================================================
        TABLE WRAPPER
        NO INTERNAL HORIZONTAL SCROLLBAR
        ======================================================
        */

        .table-wrapper {

            width:
                max-content;

            min-width:
                100%;

            overflow:
                visible !important;

        }


        /*
        ======================================================
        TABLE
        ======================================================
        */

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


        /*
        ======================================================
        TABLE HEADER
        ======================================================
        */

        th {

            padding:
                10px 9px;

            background:
                #244494;

            color:
                #ffffff;

            border:
                1px solid #d1d5db;

            font-size:
                11px;

            font-weight:
                700;

            text-align:
                center;

            vertical-align:
                middle;

            white-space:
                nowrap;

        }


        /*
        ======================================================
        TABLE BODY
        ======================================================
        */

        td {

            padding:
                9px;

            border:
                1px solid #d1d5db;

            vertical-align:
                middle;

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


        /*
        ======================================================
        ALIGNMENT
        ======================================================
        */

        .center {

            text-align:
                center;

        }


        /*
        ======================================================
        NO
        ======================================================
        */

        .col-no {

            width:
                45px;

            min-width:
                45px;

        }


        /*
        ======================================================
        VENDOR
        ======================================================
        */

        .vendor {

            min-width:
                220px;

        }


        /*
        ======================================================
        PO NO
        ======================================================
        */

        .po-no {

            min-width:
                180px;

        }


        /*
        ======================================================
        INVOICE NO
        ======================================================
        */

        .invoice-no {

            min-width:
                160px;

        }


        /*
        ======================================================
        DESCRIPTION
        ======================================================
        */

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

            vertical-align:
                top;

        }


        /*
        ======================================================
        DATE
        ======================================================
        */

        .date-column {

            min-width:
                105px;

        }


        /*
        ======================================================
        AMOUNT
        ======================================================
        */

        .amount {

            min-width:
                120px;

            text-align:
                right;

            white-space:
                nowrap;

        }


        /*
        ======================================================
        STATUS
        ======================================================
        */

        .status-column {

            min-width:
                90px;

        }


        /*
        ======================================================
        TOTAL
        ======================================================
        */

        tfoot
        td {

            background:
                #f8fafc;

            font-weight:
                700;

        }


        /*
        ======================================================
        REPORT FOOTER
        ======================================================
        */

        .report-footer {

            display:
                flex;

            justify-content:
                space-between;

            align-items:
                center;

            width:
                100%;

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

            white-space:
                nowrap;

        }


        /*
        ======================================================
        PRINT
        ======================================================
        */

        @media print {

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
                    10px;

            }


            .report {

                width:
                    100%;

                min-width:
                    0;

            }


            .table-container,
            .table-wrapper {

                width:
                    100%;

                min-width:
                    0;

                overflow:
                    visible;

            }


            table {

                width:
                    100%;

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

                ${previewDate}

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

                            <th>
                                No
                            </th>

                            <th>
                                Vendor
                            </th>

                            <th>
                                PO No
                            </th>

                            <th>
                                Invoice No
                            </th>

                            <th>
                                Description
                            </th>

                            <th>
                                Invoice Date
                            </th>

                            <th>
                                Due Date
                            </th>

                            <th>
                                Outstanding
                            </th>

                            <th>
                                Current
                            </th>

                            <th>
                                1 - 30
                            </th>

                            <th>
                                31 - 60
                            </th>

                            <th>
                                61 - 90
                            </th>

                            <th>
                                &gt; 90
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${reportRows}

                    </tbody>


                    <tfoot>

                        <tr>

                            <td
                                colspan="7"
                                style="
                                    text-align:right;
                                "
                            >

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


                            <td>
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

                Total Record :

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
        WRITE FINAL PREVIEW
        ======================================================
        */

        previewWindow.document.open();

        previewWindow.document.write(
            html
        );

        previewWindow.document.close();

        previewWindow.document.title =
            "Aging Payable - Preview";


        /*
        ======================================================
        FOCUS
        ======================================================
        */

        previewWindow.focus();

    }

    catch (
        error
    ) {

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

    downloadExcel() {

        try {

            const rows =
                Array.isArray(this.filteredData)
                    ? this.filteredData
                    : [];

            if (!rows.length) {
                this.showError("No Aging Payable data available to export.");
                return;
            }

            const data =
                rows.map((row, index) => ({
                    "No": index + 1,
                    "Vendor": row.vendor_name || "",
                    "Invoice No": row.invoice_no || "",
                    "PO No": row.po_no || "",
                    "Invoice Date": row.invoice_date || "",
                    "Due Date": row.due_date || "",
                    "Aging Days": Number(row.aging_days || 0),
                    "Outstanding": Number(row.outstanding_amount || 0),
                    "Current": Number(row.current || 0),
                    "1 - 30": Number(row.days_1_30 || 0),
                    "31 - 60": Number(row.days_31_60 || 0),
                    "61 - 90": Number(row.days_61_90 || 0),
                    "> 90": Number(row.days_90_plus || 0),
                    "Status": row.status || ""
                }));

            ExcelExportService.export(
                data,
                "Aging Payable",
                "Aging Payable"
            );

        }
        catch (error) {
            console.error("AgingPayable.downloadExcel", error);
            this.showError(error?.message || "Failed to download Aging Payable Excel.");
        }

    }

    showError(message) {
        if (window.App?.showError) {
            window.App.showError(message);
            return;
        }
        alert(message);
    }

    renderStatus(status) {
        const value = String(status || "-");
        const key = value.toLowerCase();
        const cls = key === "partial paid" ? "bg-warning text-dark" : key === "posted" ? "bg-success" : "bg-secondary";
        return `<span class="badge ${cls}">${this.escapeHTML(value)}</span>`;
    }

    parseDate(value) {
        if (!value) return null;
        const d = new Date(`${String(value).slice(0, 10)}T00:00:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    formatDate(value) {
        const d = this.parseDate(value);
        if (!d) return "-";
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }

    formatAmount(value) {
        return Math.round(Number(value || 0)).toLocaleString("id-ID");
    }

    escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}
