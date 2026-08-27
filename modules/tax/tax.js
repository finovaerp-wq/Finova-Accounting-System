/*
======================================================
FINOVA ACCOUNTING SYSTEM
MODULE : TAX MASTER
======================================================
*/

import {
    TaxService
} from "../../service/tax-service.js";

import {
    supabase,
    TABLE
} from "../../assets/js/core/supabase.js";
import {
    ExcelExportService
} from "../../service/excel-export.service.js";

import {
    PreviewService
} from "../../service/preview.service.js";


/*
======================================================
TAX MASTER
======================================================
*/

export class Tax {

    constructor() {

        console.log(
            "Tax module constructor..."
        );

        /*
        ==============================================
        SERVICE
        ==============================================
        */

        this.service =
            new TaxService();


        /*
        ==============================================
        DATA
        ==============================================
        */

        this.taxes = [];

        this.currentTax = null;

        this.currentTaxId = null;


        /*
        ==============================================
        MODE
        ==============================================
        */

        this.currentMode = "add";


       /*
======================================================
PAGINATION
======================================================
*/

this.currentPage = 1;

this.pageSize = 10;


        /*
        ==============================================
        FILTER
        ==============================================
        */

        this.keyword = "";

        this.taxType = "";

        this.status = "";


        /*
        ==============================================
        DOM
        ==============================================
        */

        this.cacheDOM();

    }


    /*
======================================================
CACHE DOM
======================================================
*/

cacheDOM() {

    /*
    ==================================================
    TABLE
    ==================================================
    */

    this.tableBody =
        document.getElementById(
            "tax-table-body"
        );


    /*
    ==================================================
    FILTER
    ==================================================
    */

    this.keywordInput =
        document.getElementById(
            "tax-filter-keyword"
        );

    this.typeFilter =
        document.getElementById(
            "tax-filter-type"
        );

    this.statusFilter =
        document.getElementById(
            "tax-filter-status"
        );


    /*
    ==================================================
    HEADER BUTTON
    ==================================================
    */

    this.btnAdd =
        document.getElementById(
            "btn-add-tax"
        );

    this.btnExport =
        document.getElementById(
            "btn-export-tax"
        );

    this.btnPreview =
        document.getElementById(
            "btn-preview-tax"
        );

    this.btnRefresh =
        document.getElementById(
            "btn-refresh-tax"
        );


    /*
    ==================================================
    PAGINATION
    ==================================================
    */

    this.btnFirst =
        document.getElementById(
            "tax-pagination-first"
        );

    this.btnPrev =
        document.getElementById(
            "tax-pagination-prev"
        );

    this.btnNext =
        document.getElementById(
            "tax-pagination-next"
        );

    this.btnLast =
        document.getElementById(
            "tax-pagination-last"
        );

    this.txtPage =
        document.getElementById(
            "tax-pagination-page-input"
        );

    this.lblTotalPages =
        document.getElementById(
            "tax-pagination-total-pages"
        );

    this.lblPaginationInfo =
        document.getElementById(
            "tax-pagination-info"
        );


    /*
    ==================================================
    MODAL
    ==================================================
    */

    this.taxModal =
        document.getElementById(
            "taxModal"
        );

    this.taxForm =
        document.getElementById(
            "tax-form"
        );

    this.taxId =
        document.getElementById(
            "tax-form-id"
        );

    this.taxCode =
        document.getElementById(
            "tax-form-code"
        );

    this.taxName =
        document.getElementById(
            "tax-form-name"
        );

    this.taxTypeInput =
        document.getElementById(
            "tax-form-type"
        );

    this.taxRate =
        document.getElementById(
            "tax-form-rate"
        );

    this.taxAccount =
        document.getElementById(
            "tax-form-account"
        );

    this.offsetAccount =
        document.getElementById(
            "tax-form-offset-account"
        );

    this.description =
        document.getElementById(
            "tax-form-description"
        );

    this.statusInput =
        document.getElementById(
            "tax-form-status"
        );

    this.btnSave =
        document.getElementById(
            "btn-save-tax"
        );

    this.modalTitle =
        document.getElementById(
            "taxModalLabel"
        );

}
    /*
    ==================================================
    INIT
    ==================================================
    */

    async init() {

        try {

            console.log(
                "Tax Master initializing..."
            );


            this.bindEvents();


            await this.loadCOA();


            await this.loadData(
    true,
    true
);


            console.log(
                "Tax Master initialized."
            );

        }

        catch (error) {

            console.error(
                "Tax.init:",
                error
            );

            this.showError(
                error.message
                ||
                "Failed to initialize Tax Master."
            );

        }

    }


    /*
======================================================
BIND EVENTS
======================================================
*/

bindEvents() {

    /*
    ==================================================
    ADD
    ==================================================
    */

    this.btnAdd?.addEventListener(
        "click",
        () => {

            this.openAddModal();

        }
    );


    /*
    ==================================================
    REALTIME SEARCH
    ==================================================
    */

    this.keywordInput?.addEventListener(
        "input",
        () => {

            this.search();

        }
    );


    /*
    ==================================================
    TYPE FILTER
    ==================================================
    */

    this.typeFilter?.addEventListener(
        "change",
        () => {

            this.search();

        }
    );


    /*
    ==================================================
    STATUS FILTER
    ==================================================
    */

    this.statusFilter?.addEventListener(
        "change",
        () => {

            this.search();

        }
    );


    /*
    ==================================================
    REFRESH
    ==================================================
    */

    this.btnRefresh?.addEventListener(
        "click",
        () => {

            this.refresh();

        }
    );


    /*
    ==================================================
    EXPORT
    ==================================================
    */

    this.btnExport?.addEventListener(
        "click",
        () => {

            this.exportExcel();

        }
    );


    /*
    ==================================================
    PREVIEW
    ==================================================
    */

    this.btnPreview?.addEventListener(
        "click",
        () => {

            this.preview();

        }
    );


    /*
    ==================================================
    SAVE
    ==================================================
    */

    this.btnSave?.addEventListener(
        "click",
        () => {

            this.save();

        }
    );


    /*
    ==================================================
    TABLE ACTION
    ==================================================
    */

    this.tableBody?.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-tax-action]"
                );

            if (!button) {

                return;

            }

            const action =
                button.dataset.taxAction;

            const id =
                button.dataset.taxId;

            this.handleAction(
                action,
                id
            );

        }
    );


    /*
    ==================================================
    PAGINATION FIRST
    ==================================================
    */

    this.btnFirst?.addEventListener(
        "click",
        () => {

            this.currentPage = 1;

            this.render();

        }
    );


    /*
    ==================================================
    PAGINATION PREVIOUS
    ==================================================
    */

    this.btnPrev?.addEventListener(
        "click",
        () => {

            if (
                this.currentPage > 1
            ) {

                this.currentPage--;

                this.render();

            }

        }
    );


    /*
    ==================================================
    PAGINATION NEXT
    ==================================================
    */

    this.btnNext?.addEventListener(
        "click",
        () => {

            const totalPages =
                this.getTotalPages();

            if (
                this.currentPage <
                totalPages
            ) {

                this.currentPage++;

                this.render();

            }

        }
    );


    /*
    ==================================================
    PAGINATION LAST
    ==================================================
    */

    this.btnLast?.addEventListener(
        "click",
        () => {

            this.currentPage =
                this.getTotalPages();

            this.render();

        }
    );


    /*
    ==================================================
    PAGE INPUT
    ==================================================
    */

    this.txtPage?.addEventListener(
        "change",
        () => {

            const totalPages =
                this.getTotalPages();

            let page =
                parseInt(
                    this.txtPage.value,
                    10
                );

            if (
                Number.isNaN(page)
            ) {

                page = 1;

            }

            page =
                Math.min(
                    Math.max(
                        page,
                        1
                    ),
                    totalPages
                );

            this.currentPage =
                page;

            this.render();

        }
    );

}
/*
======================================================
GET TOTAL PAGES
======================================================
*/

getTotalPages() {

    const totalRecords =
        this.getFilteredData().length;

    return Math.max(
        1,
        Math.ceil(
            totalRecords /
            this.pageSize
        )
    );

}


   /*
======================================================
LOAD DATA
======================================================
*/

async loadData(
    resetPage = true,
    showLoading = true
) {

    try {

        /*
        ==================================================
        RE-CACHE ACTIVE TABLE BODY
        ==================================================
        */

        const activeTableBody =
            document.getElementById(
                "tax-table-body"
            );


        if (
            activeTableBody
        ) {

            this.tableBody =
                activeTableBody;

        }


        /*
        ==================================================
        TABLE BODY NOT FOUND
        ==================================================
        */

        if (
            !this.tableBody
        ) {

            console.warn(
                "Tax.loadData: active table body not found."
            );

            return;

        }


        /*
        ==================================================
        LOADING
        ONLY INITIAL LOAD / REFRESH
        SAME AS ACCOUNT PAYABLE
        ==================================================
        */

        if (
            showLoading
            &&
            this.tableBody
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="9"
                        class="text-center py-5"
                    >

                        <div
                            class="
                                d-flex
                                flex-column
                                align-items-center
                                justify-content-center
                                gap-2
                            "
                        >

                            <div
                                class="
                                    spinner-border
                                    spinner-border-sm
                                    text-primary
                                "
                                role="status"
                            >

                                <span
                                    class="visually-hidden"
                                >
                                    Loading...
                                </span>

                            </div>


                            <div
                                class="
                                    text-muted
                                    small
                                "
                            >

                                Loading Tax Master...

                            </div>

                        </div>

                    </td>

                </tr>

            `;

        }


        /*
        ==================================================
        LOAD TAX MASTER
        ==================================================
        */

        const data =
            await this.service.getAll();


        /*
        ==================================================
        NORMALIZE DATA
        ==================================================
        */

        this.taxes =
            Array.isArray(
                data
            )
                ? data
                : [];


        /*
        ==================================================
        RESET PAGE
        ==================================================
        */

        if (
            resetPage
        ) {

            this.currentPage = 1;

        }


        /*
        ==================================================
        RENDER
        ==================================================
        */

        this.render();

    }

    catch (
        error
    ) {

        console.error(
            "Tax.loadData:",
            error
        );


        /*
        ==================================================
        SHOW LOAD ERROR
        ==================================================
        */

        if (
            this.tableBody
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="9"
                        class="text-center py-5 text-danger"
                    >

                        Failed to load Tax Master.

                    </td>

                </tr>

            `;

        }


        throw error;

    }

}

    /*
    ==================================================
    SEARCH
    ==================================================
    */

    search() {

        this.keyword =
            this.keywordInput?.value
            ?.trim()
            .toLowerCase()
            || "";


        this.taxType =
            this.typeFilter?.value
            || "";


        this.status =
            this.statusFilter?.value
            || "";


        this.currentPage =
            1;


        this.render();

    }


    /*
    ==================================================
    GET FILTERED DATA
    ==================================================
    */

    getFilteredData() {

        return this.taxes.filter(
            tax => {

                /*
                ======================================
                KEYWORD
                ======================================
                */

                if (
                    this.keyword
                ) {

                    const text =
                        [
                            tax.tax_code,
                            tax.tax_name,
                            tax.description
                        ]
                        .join(" ")
                        .toLowerCase();


                    if (
                        !text.includes(
                            this.keyword
                        )
                    ) {

                        return false;

                    }

                }


                /*
                ======================================
                TYPE
                ======================================
                */

                if (
                    this.taxType
                    &&
                    tax.tax_type
                    !==
                    this.taxType
                ) {

                    return false;

                }


                /*
                ======================================
                STATUS
                ======================================
                */

                if (
                    this.status !== ""
                    &&
                    String(
                        tax.status
                    )
                    !==
                    this.status
                ) {

                    return false;

                }


                return true;

            }
        );

    }


    /*
======================================================
RENDER
======================================================
*/

render() {

    if (!this.tableBody) {

        return;

    }


    const filtered =
        this.getFilteredData();


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filtered.length /
                this.pageSize
            )
        );


    /*
    ==================================================
    KEEP PAGE VALID
    ==================================================
    */

    if (
        this.currentPage >
        totalPages
    ) {

        this.currentPage =
            totalPages;

    }


    const start =
        (
            this.currentPage - 1
        )
        *
        this.pageSize;


    const end =
        start +
        this.pageSize;


    const rows =
        filtered.slice(
            start,
            end
        );


    /*
    ==================================================
    EMPTY
    ==================================================
    */

    if (!rows.length) {

        this.tableBody.innerHTML = `

            <tr>

                <td colspan="9">

                    <div class="finova-empty">

                        <i class="fas fa-folder-open"></i>

                        <h5>
                            No Tax Data Found
                        </h5>

                        <p>
                            Click
                            <strong>Add Tax</strong>
                            to create your first Tax.
                        </p>

                    </div>

                </td>

            </tr>

        `;


        this.updatePagination(
            filtered.length
        );

        return;

    }


    /*
    ==================================================
    ROWS
    ==================================================
    */

    this.tableBody.innerHTML =
        rows.map(
            (tax, index) => {

                const number =
                    start +
                    index +
                    1;


                /*
                ==========================================
                TYPE
                ==========================================
                */

                const typeBadge =
                    tax.tax_type
                    ===
                    "PLUS"

                        ? `
                            <span class="badge bg-success">
                                PLUS
                            </span>
                          `

                        : `
                            <span class="badge bg-warning text-dark">
                                MINUS
                            </span>
                          `;


                /*
                ==========================================
                STATUS
                ==========================================
                */

                const statusBadge =
                    tax.status

                        ? `
                            <span class="badge bg-success">
                                Active
                            </span>
                          `

                        : `
                            <span class="badge bg-secondary">
                                Inactive
                            </span>
                          `;


                /*
                ==========================================
                TAX ACCOUNT
                ==========================================
                */

                const taxAccount =
                    tax.tax_account

                        ? `
                            ${tax.tax_account.account_code}
                            -
                            ${tax.tax_account.account_name}
                          `

                        : "-";


                /*
                ==========================================
                OFFSET ACCOUNT
                ==========================================
                */

                const offsetAccount =
                    tax.offset_account

                        ? `
                            ${tax.offset_account.account_code}
                            -
                            ${tax.offset_account.account_name}
                          `

                        : "-";


                return `

                    <tr>

                        <td class="text-center">

                            ${number}

                        </td>


                        <td>

                            ${tax.tax_code || "-"}

                        </td>


                        <td>

                            ${tax.tax_name || "-"}

                        </td>


                        <td class="text-center">

                            ${typeBadge}

                        </td>


                        <td class="text-end">

                            ${this.formatRate(
                                tax.tax_rate
                            )}

                        </td>


                        <td>

                            ${taxAccount}

                        </td>


                        <td>

                            ${offsetAccount}

                        </td>


                        <td class="text-center">

                            ${statusBadge}

                        </td>


                        <td class="text-center">

                            <div class="btn-group btn-group-sm">

                                <button
                                    type="button"
                                    class="btn btn-outline-primary"
                                    title="Edit"
                                    data-tax-action="edit"
                                    data-tax-id="${tax.id}">

                                    <i class="fa-solid fa-pen"></i>

                                </button>


                                <button
                                    type="button"
                                    class="btn btn-outline-danger"
                                    title="Delete"
                                    data-tax-action="delete"
                                    data-tax-id="${tax.id}">

                                    <i class="fa-solid fa-trash"></i>

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    this.updatePagination(
        filtered.length
    );

}
    /*
======================================================
UPDATE PAGINATION
======================================================
*/

updatePagination(
    totalRecords
) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalRecords /
                this.pageSize
            )
        );


    /*
    ==================================================
    CURRENT PAGE
    ==================================================
    */

    if (
        this.currentPage >
        totalPages
    ) {

        this.currentPage =
            totalPages;

    }


    /*
    ==================================================
    PAGE INPUT
    ==================================================
    */

    if (this.txtPage) {

        this.txtPage.value =
            this.currentPage;

        this.txtPage.max =
            totalPages;

    }


    /*
    ==================================================
    TOTAL PAGE
    ==================================================
    */

    if (
        this.lblTotalPages
    ) {

        this.lblTotalPages.textContent =
            totalPages;

    }


    /*
    ==================================================
    RECORD RANGE
    ==================================================
    */

    const startRecord =
        totalRecords === 0

            ? 0

            : (
                (
                    this.currentPage - 1
                )
                *
                this.pageSize
            )
            +
            1;


    const endRecord =
        totalRecords === 0

            ? 0

            : Math.min(
                this.currentPage *
                this.pageSize,
                totalRecords
            );


    /*
    ==================================================
    RECORD INFO
    ==================================================
    */

    if (
        this.lblPaginationInfo
    ) {

        this.lblPaginationInfo.textContent =
            `Displaying Record ${startRecord} - ${endRecord} of ${totalRecords}`;

    }


    /*
    ==================================================
    BUTTON STATE
    ==================================================
    */

    const isFirst =
        this.currentPage <= 1;

    const isLast =
        this.currentPage >=
        totalPages;


    if (this.btnFirst) {

        this.btnFirst.disabled =
            isFirst;

    }


    if (this.btnPrev) {

        this.btnPrev.disabled =
            isFirst;

    }


    if (this.btnNext) {

        this.btnNext.disabled =
            isLast;

    }


    if (this.btnLast) {

        this.btnLast.disabled =
            isLast;

    }

}
/*
======================================================
PREVIEW TAX MASTER

FINAL :
- NEW TAB
- TAHOMA FONT
- LONG TEXT NO WRAP
- FIXED HORIZONTAL SCROLLBAR
- SCROLLBAR ALWAYS AVAILABLE AT BOTTOM OF BROWSER
- SYNCHRONIZED WITH TABLE
======================================================
*/

preview() {

    try {

        /*
        ==================================================
        FILTERED DATA
        ==================================================
        */

        const taxes =
            this.getFilteredData();


        /*
        ==================================================
        VALIDATE DATA
        ==================================================
        */

        if (
            !Array.isArray(taxes)
            ||
            taxes.length === 0
        ) {

            this.showError(
                "No Tax data available to preview."
            );

            return;

        }


        /*
        ==================================================
        OPEN NEW TAB
        ==================================================
        */

        const previewWindow =
            window.open(
                "",
                "_blank"
            );


        if (
            !previewWindow
        ) {

            this.showError(
                "Preview tab was blocked by the browser."
            );

            return;

        }


        /*
        ==================================================
        PREVIEW DATE
        ==================================================
        */

        const previewDate =
            new Date()
                .toLocaleString(
                    "id-ID"
                );


        /*
        ==================================================
        ESCAPE HTML
        ==================================================
        */

        const escapeHTML =
            value => {

                return String(
                    value ?? ""
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

            };


        /*
        ==================================================
        ROWS
        ==================================================
        */

        const rows =
            taxes
                .map(
                    (
                        tax,
                        index
                    ) => {

                        /*
                        ======================================
                        TAX ACCOUNT
                        ======================================
                        */

                        const taxAccount =
                            tax.tax_account

                                ? `${
                                    tax.tax_account.account_code
                                } - ${
                                    tax.tax_account.account_name
                                }`

                                : "-";


                        /*
                        ======================================
                        OFFSET ACCOUNT
                        ======================================
                        */

                        const offsetAccount =
                            tax.offset_account

                                ? `${
                                    tax.offset_account.account_code
                                } - ${
                                    tax.offset_account.account_name
                                }`

                                : "-";


                        /*
                        ======================================
                        STATUS
                        ======================================
                        */

                        const status =
                            tax.status
                                ? "Active"
                                : "Inactive";


                        /*
                        ======================================
                        RETURN ROW
                        ======================================
                        */

                        return `

                            <tr>

                                <td class="center">

                                    ${index + 1}

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            tax.tax_code
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            tax.tax_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="center">

                                    ${
                                        escapeHTML(
                                            tax.tax_type
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="right">

                                    ${
                                        escapeHTML(
                                            this.formatRate(
                                                tax.tax_rate
                                            )
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            taxAccount
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            offsetAccount
                                        )
                                    }

                                </td>


                                <td class="description">

                                    ${
                                        escapeHTML(
                                            tax.description
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="center">

                                    ${
                                        escapeHTML(
                                            status
                                        )
                                    }

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");


        /*
        ==================================================
        HTML
        ==================================================
        */

        const html = `

            <!DOCTYPE html>

            <html lang="id">

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="
                        width=device-width,
                        initial-scale=1.0
                    "
                >


                <title>
                    Tax Master - Preview
                </title>


                <style>

                    /*
                    ==========================================
                    RESET
                    ==========================================
                    */

                    * {

                        box-sizing:
                            border-box;

                    }


                    html,
                    body {

                        margin:
                            0;

                        padding:
                            0;

                        width:
                            100%;

                        min-height:
                            100%;

                    }


                    /*
                    ==========================================
                    BODY
                    ==========================================
                    */

                    body {

                        padding:
                            28px 32px 42px 32px;

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
                    ==========================================
                    REPORT
                    ==========================================
                    */

                    .report {

                        display:
                            block;

                        width:
                            100%;

                        max-width:
                            100%;

                    }


                    /*
                    ==========================================
                    HEADER
                    ==========================================
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
                    ==========================================
                    TABLE CONTAINER
                    ==========================================
                    */

                    .table-container {

                        display:
                            block;

                        width:
                            100%;

                        max-width:
                            100%;

                        border:
                            1px solid #d1d5db;

                        border-radius:
                            4px;

                        overflow:
                            hidden;

                        background:
                            #ffffff;

                    }


                    /*
                    ==========================================
                    TABLE WRAPPER
                    NATIVE SCROLLBAR HIDDEN
                    ==========================================
                    */

                    .table-wrapper {

                        display:
                            block;

                        width:
                            100%;

                        max-width:
                            100%;

                        overflow-x:
                            auto;

                        overflow-y:
                            visible;

                        scrollbar-width:
                            none;

                    }


                    .table-wrapper::-webkit-scrollbar {

                        display:
                            none;

                    }


                    /*
                    ==========================================
                    TABLE
                    ==========================================
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

                        border-spacing:
                            0;

                        table-layout:
                            auto;

                    }


                    /*
                    ==========================================
                    TABLE HEADER
                    ==========================================
                    */

                    thead th {

                        padding:
                            10px 9px;

                        background:
                            #244494;

                        color:
                            #ffffff;

                        border-right:
                            1px solid #d1d5db;

                        border-bottom:
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
                    ==========================================
                    TABLE BODY
                    ==========================================
                    */

                    tbody td {

                        padding:
                            9px;

                        border-right:
                            1px solid #d1d5db;

                        border-bottom:
                            1px solid #d1d5db;

                        vertical-align:
                            middle;

                        background:
                            #ffffff;

                        color:
                            #1f2937;

                        font-size:
                            12px;

                        font-weight:
                            400;

                        white-space:
                            nowrap;

                    }


                    thead th:last-child,
                    tbody td:last-child {

                        border-right:
                            0;

                    }


                    tbody tr:last-child td {

                        border-bottom:
                            0;

                    }


                    tbody tr:nth-child(even) td {

                        background:
                            #f8fafc;

                    }


                    tbody tr:hover td {

                        background:
                            #f1f5f9;

                    }


                    /*
                    ==========================================
                    ALIGNMENT
                    ==========================================
                    */

                    .center {

                        text-align:
                            center;

                    }


                    .right {

                        text-align:
                            right;

                    }


                    /*
                    ==========================================
                    COLUMN WIDTH
                    ==========================================
                    */

                    .col-no {

                        width:
                            45px;

                        min-width:
                            45px;

                    }


                    .col-code {

                        min-width:
                            130px;

                    }


                    .col-name {

                        min-width:
                            220px;

                    }


                    .col-type {

                        min-width:
                            100px;

                    }


                    .col-rate {

                        min-width:
                            100px;

                    }


                    .col-tax-account {

                        min-width:
                            300px;

                    }


                    .col-offset-account {

                        min-width:
                            300px;

                    }


                    .col-description {

                        min-width:
                            360px;

                    }


                    .col-status {

                        min-width:
                            100px;

                    }


                    /*
                    ==========================================
                    DESCRIPTION
                    ==========================================
                    */

                    .description {

                        min-width:
                            360px;

                        text-align:
                            left;

                        white-space:
                            nowrap;

                    }


                    /*
                    ==========================================
                    FOOTER
                    ==========================================
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
                    ==========================================
                    FIXED BOTTOM SCROLLBAR
                    ==========================================
                    */

                    .fixed-horizontal-scroll {

                        position:
                            fixed;

                        left:
                            0;

                        right:
                            0;

                        bottom:
                            0;

                        z-index:
                            99999;

                        width:
                            100%;

                        height:
                            22px;

                        padding:
                            0 32px;

                        overflow:
                            hidden;

                        background:
                            #f8fafc;

                        border-top:
                            1px solid #d1d5db;

                        box-shadow:
                            0 -2px 6px
                            rgba(
                                0,
                                0,
                                0,
                                0.08
                            );

                    }


                    /*
                    ==========================================
                    FIXED SCROLL INNER
                    ==========================================
                    */

                    .fixed-horizontal-scroll-inner {

                        width:
                            100%;

                        height:
                            21px;

                        overflow-x:
                            auto;

                        overflow-y:
                            hidden;

                        scrollbar-width:
                            auto;

                        scrollbar-color:
                            #9aa5b3
                            #eef1f4;

                    }


                    /*
                    ==========================================
                    SCROLL WIDTH CONTENT
                    ==========================================
                    */

                    .fixed-horizontal-scroll-content {

                        width:
                            100%;

                        height:
                            1px;

                        min-height:
                            1px;

                    }


                    /*
                    ==========================================
                    CHROME / EDGE SCROLLBAR
                    ==========================================
                    */

                    .fixed-horizontal-scroll-inner::-webkit-scrollbar {

                        height:
                            16px;

                    }


                    .fixed-horizontal-scroll-inner::-webkit-scrollbar-track {

                        background:
                            #eef1f4;

                    }


                    .fixed-horizontal-scroll-inner::-webkit-scrollbar-thumb {

                        background:
                            #9aa5b3;

                        border-radius:
                            10px;

                        border:
                            3px solid #eef1f4;

                    }


                    .fixed-horizontal-scroll-inner::-webkit-scrollbar-thumb:hover {

                        background:
                            #7e8997;

                    }

                </style>

            </head>


            <body>


                <div class="report">


                    <!-- ==================================
                         HEADER
                    =================================== -->

                    <div class="report-header">

                        <h1 class="report-title">

                            FINOVA ACCOUNTING SYSTEM

                        </h1>


                        <div class="report-subtitle">

                            Tax Master

                        </div>


                        <div class="report-description">

                            Tax Master Data

                        </div>


                        <div class="report-date">

                            Preview Date :
                            ${previewDate}

                        </div>

                    </div>


                    <!-- ==================================
                         TABLE
                    =================================== -->

                    <div class="table-container">


                        <div
                            class="table-wrapper"
                            id="tax-table-scroll"
                        >


                            <table
                                id="tax-preview-table"
                            >


                                <colgroup>

                                    <col class="col-no">

                                    <col class="col-code">

                                    <col class="col-name">

                                    <col class="col-type">

                                    <col class="col-rate">

                                    <col class="col-tax-account">

                                    <col class="col-offset-account">

                                    <col class="col-description">

                                    <col class="col-status">

                                </colgroup>


                                <thead>

                                    <tr>

                                        <th>
                                            No
                                        </th>

                                        <th>
                                            Tax Code
                                        </th>

                                        <th>
                                            Tax Name
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Rate
                                        </th>

                                        <th>
                                            Tax Account
                                        </th>

                                        <th>
                                            Offset Account
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    ${rows}

                                </tbody>


                            </table>


                        </div>


                    </div>


                    <!-- ==================================
                         FOOTER
                    =================================== -->

                    <div class="report-footer">

                        <div>

                            Total Record :
                            ${taxes.length}

                        </div>


                        <div>

                            Generated by FINOVA Accounting System

                        </div>

                    </div>


                </div>


                <!-- ==================================
                     FIXED BOTTOM SCROLLBAR
                =================================== -->

                <div
                    class="fixed-horizontal-scroll"
                    id="tax-fixed-scroll-container"
                >

                    <div
                        class="fixed-horizontal-scroll-inner"
                        id="tax-fixed-scroll"
                    >

                        <div
                            class="fixed-horizontal-scroll-content"
                            id="tax-fixed-scroll-content"
                        >
                        </div>

                    </div>

                </div>


            </body>

            </html>

        `;


        /*
        ==================================================
        WRITE NEW TAB
        ==================================================
        */

        previewWindow.document.open();

        previewWindow.document.write(
            html
        );

        previewWindow.document.close();


        /*
        ==================================================
        TAB TITLE
        ==================================================
        */

        previewWindow.document.title =
            "Tax Master - Preview";


        /*
        ==================================================
        SETUP FIXED BOTTOM SCROLLBAR
        ==================================================
        */

        const setupScrollSync = () => {

            const doc =
                previewWindow.document;


            /*
            ==============================================
            ELEMENTS
            ==============================================
            */

            const tableScroll =
                doc.getElementById(
                    "tax-table-scroll"
                );


            const table =
                doc.getElementById(
                    "tax-preview-table"
                );


            const fixedScrollContainer =
                doc.getElementById(
                    "tax-fixed-scroll-container"
                );


            const fixedScroll =
                doc.getElementById(
                    "tax-fixed-scroll"
                );


            const fixedScrollContent =
                doc.getElementById(
                    "tax-fixed-scroll-content"
                );


            /*
            ==============================================
            VALIDATE
            ==============================================
            */

            if (
                !tableScroll
                ||
                !table
                ||
                !fixedScrollContainer
                ||
                !fixedScroll
                ||
                !fixedScrollContent
            ) {

                return;

            }


            /*
            ==============================================
            UPDATE SCROLL WIDTH
            ==============================================
            */

            const updateScrollWidth = () => {

                const tableWidth =
                    Math.max(
                        table.scrollWidth,
                        table.offsetWidth
                    );


                fixedScrollContent.style.width =
                    `${tableWidth}px`;


                /*
                ==========================================
                SHOW SCROLLBAR ONLY IF REQUIRED
                ==========================================
                */

                if (
                    tableWidth <=
                    tableScroll.clientWidth
                ) {

                    fixedScrollContainer.style.display =
                        "none";

                }

                else {

                    fixedScrollContainer.style.display =
                        "block";

                }

            };


            /*
            ==============================================
            SYNC STATE
            ==============================================
            */

            let syncingFixed =
                false;

            let syncingTable =
                false;


            /*
            ==============================================
            FIXED SCROLL -> TABLE
            ==============================================
            */

            fixedScroll.addEventListener(
                "scroll",
                () => {

                    if (
                        syncingTable
                    ) {

                        return;

                    }


                    syncingFixed =
                        true;


                    tableScroll.scrollLeft =
                        fixedScroll.scrollLeft;


                    requestAnimationFrame(
                        () => {

                            syncingFixed =
                                false;

                        }
                    );

                }
            );


            /*
            ==============================================
            TABLE -> FIXED SCROLL
            ==============================================
            */

            tableScroll.addEventListener(
                "scroll",
                () => {

                    if (
                        syncingFixed
                    ) {

                        return;

                    }


                    syncingTable =
                        true;


                    fixedScroll.scrollLeft =
                        tableScroll.scrollLeft;


                    requestAnimationFrame(
                        () => {

                            syncingTable =
                                false;

                        }
                    );

                }
            );


            /*
            ==============================================
            INITIAL WIDTH
            ==============================================
            */

            updateScrollWidth();


            requestAnimationFrame(
                () => {

                    updateScrollWidth();

                }
            );


            /*
            ==============================================
            WINDOW RESIZE
            ==============================================
            */

            previewWindow.addEventListener(
                "resize",
                updateScrollWidth
            );


            /*
            ==============================================
            RESIZE OBSERVER
            ==============================================
            */

            if (
                typeof previewWindow.ResizeObserver
                !==
                "undefined"
            ) {

                const resizeObserver =
                    new previewWindow.ResizeObserver(
                        () => {

                            updateScrollWidth();

                        }
                    );


                resizeObserver.observe(
                    table
                );


                resizeObserver.observe(
                    tableScroll
                );

            }

        };


        /*
        ==================================================
        RUN SCROLL SETUP
        ==================================================
        */

        if (
            previewWindow.document.readyState ===
            "complete"
        ) {

            setupScrollSync();

        }

        else {

            previewWindow.addEventListener(
                "load",
                setupScrollSync,
                {
                    once:
                        true
                }
            );

        }


        /*
        ==================================================
        FOCUS
        ==================================================
        */

        previewWindow.focus();

    }


    catch (error) {

        console.error(
            "Tax.preview:",
            error
        );


        this.showError(
            error?.message
            ||
            "Preview Tax Master failed."
        );

    }

}
/*
======================================================
EXPORT EXCEL
======================================================
*/

exportExcel() {

    try {

        const taxes =
            this.getFilteredData();


        if (!taxes.length) {

            this.showError(
                "No data available to export."
            );

            return;

        }


        const data =
            taxes.map(
                tax => ({

                    "Tax Code":
                        tax.tax_code || "",

                    "Tax Name":
                        tax.tax_name || "",

                    "Tax Type":
                        tax.tax_type || "",

                    "Tax Rate (%)":
                        Number(
                            tax.tax_rate || 0
                        ),

                    "Tax Account":
                        tax.tax_account
                            ? `${tax.tax_account.account_code} - ${tax.tax_account.account_name}`
                            : "",

                    "Offset Account":
                        tax.offset_account
                            ? `${tax.offset_account.account_code} - ${tax.offset_account.account_name}`
                            : "",

                    "Description":
                        tax.description || "",

                    "Status":
                        tax.status
                            ? "Active"
                            : "Inactive"

                })
            );


        ExcelExportService.export(

            data,

            "Tax Master",

            "Tax Master"

        );

    }

    catch (error) {

        console.error(
            "Tax.exportExcel:",
            error
        );

        this.showError(
            "Export Excel failed."
        );

    }

}

    /*
    ==================================================
    OPEN ADD MODAL
    ==================================================
    */

    openAddModal() {

        this.currentMode =
            "add";


        this.currentTaxId =
            null;


        this.currentTax =
            null;


        this.resetForm();


        if (this.modalTitle) {

            this.modalTitle.textContent =
                "Add Tax";

        }


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                this.taxModal
            );


        modal.show();

    }


    /*
    ==================================================
    OPEN EDIT MODAL
    ==================================================
    */

    async openEditModal(id) {

        try {

            const tax =
                await this.service.getById(
                    id
                );


            if (!tax) {

                throw new Error(
                    "Tax not found."
                );

            }


            this.currentMode =
                "edit";


            this.currentTaxId =
                id;


            this.currentTax =
                tax;


            this.fillForm(
                tax
            );


            if (this.modalTitle) {

                this.modalTitle.textContent =
                    "Edit Tax";

            }


            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    this.taxModal
                );


            modal.show();

        }

        catch (error) {

            console.error(
                "Tax.openEditModal:",
                error
            );

            this.showError(
                error.message
                ||
                "Failed to open Tax."
            );

        }

    }


    /*
    ==================================================
    FILL FORM
    ==================================================
    */

    fillForm(
        tax
    ) {

        if (this.taxId) {

            this.taxId.value =
                tax.id
                || "";

        }


        if (this.taxCode) {

            this.taxCode.value =
                tax.tax_code
                || "";

        }


        if (this.taxName) {

            this.taxName.value =
                tax.tax_name
                || "";

        }


        if (this.taxTypeInput) {

            this.taxTypeInput.value =
                tax.tax_type
                || "";

        }


        if (this.taxRate) {

            this.taxRate.value =
                tax.tax_rate
                ?? "";

        }


        if (this.taxAccount) {

            this.taxAccount.value =
                tax.tax_account_id
                || "";

        }


        if (this.offsetAccount) {

            this.offsetAccount.value =
                tax.offset_account_id
                || "";

        }


        if (this.description) {

            this.description.value =
                tax.description
                || "";

        }


        if (this.statusInput) {

            this.statusInput.checked =
                Boolean(
                    tax.status
                );

        }

    }


    /*
    ==================================================
    RESET FORM
    ==================================================
    */

    resetForm() {

        this.taxForm?.reset();


        if (this.taxId) {

            this.taxId.value =
                "";

        }


        if (this.statusInput) {

            this.statusInput.checked =
                true;

        }

    }


   /*
======================================================
SAVE TAX
======================================================
*/

async save() {

    try {

        /*
        ==================================================
        CHECK AUTH SESSION
        ==================================================
        */

        const {
            data: {
                session
            },
            error: sessionError
        } =
            await supabase.auth.getSession();


        if (sessionError) {

            throw sessionError;

        }


        if (
            !session
            ||
            !session.user
        ) {

            throw new Error(
                "User session not found. Please login again."
            );

        }


        console.log(
            "TAX AUTH USER:",
            session.user
        );


        console.log(
            "TAX AUTH ROLE:",
            session.user.role
            || "authenticated"
        );


        /*
        ==================================================
        TAX TYPE
        ==================================================
        */

        const taxType =
            String(
                this.taxTypeInput?.value
                || ""
            )
            .trim()
            .toUpperCase();


        /*
        ==================================================
        TAX CODE
        ==================================================
        */

        const taxCode =
            String(
                this.taxCode?.value
                || ""
            )
            .trim()
            .toUpperCase();


        if (!taxCode) {

            throw new Error(
                "Tax Code is required."
            );

        }


        /*
        ==================================================
        TAX NAME
        ==================================================
        */

        const taxName =
            String(
                this.taxName?.value
                || ""
            )
            .trim();


        if (!taxName) {

            throw new Error(
                "Tax Name is required."
            );

        }


        /*
        ==================================================
        TAX TYPE VALIDATION
        ==================================================
        */

        if (
            ![
                "PLUS",
                "MINUS"
            ].includes(
                taxType
            )
        ) {

            throw new Error(
                "Please select Tax Type PLUS or MINUS."
            );

        }


        /*
        ==================================================
        TAX RATE
        ==================================================
        */

        const taxRate =
            Number(
                this.taxRate?.value
                || 0
            );


        if (
            Number.isNaN(
                taxRate
            )
            ||
            taxRate < 0
            ||
            taxRate > 100
        ) {

            throw new Error(
                "Tax Rate must be between 0 and 100."
            );

        }


        /*
        ==================================================
        TAX ACCOUNT
        REQUIRED
        ==================================================
        */

        const taxAccountId =
            String(
                this.taxAccount?.value
                || ""
            )
            .trim();


        if (!taxAccountId) {

            throw new Error(
                "Tax Account is required."
            );

        }


        /*
        ==================================================
        OFFSET ACCOUNT
        OPTIONAL
        ==================================================
        */

        const offsetAccountId =
            String(
                this.offsetAccount?.value
                || ""
            )
            .trim();


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        const description =
            String(
                this.description?.value
                || ""
            )
            .trim();


        /*
        ==================================================
        PAYLOAD
        ==================================================
        */

        const payload = {

            tax_code:
                taxCode,

            tax_name:
                taxName,

            tax_type:
                taxType,

            tax_rate:
                taxRate,

            tax_account_id:
                taxAccountId,

            offset_account_id:
                offsetAccountId
                    || null,

            description:
                description
                    || null,

            status:
                this.statusInput
                    ? this.statusInput.checked
                    : true

        };


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "Tax.save payload:",
            payload
        );


        /*
        ==================================================
        UPDATE
        ==================================================
        */

        if (
            this.currentMode
            ===
            "edit"
        ) {

            await this.service.update(

                this.currentTaxId,

                payload

            );

        }


        /*
        ==================================================
        CREATE
        ==================================================
        */

        else {

            await this.service.create(
                payload
            );

        }


        /*
        ==================================================
        CLOSE MODAL
        ==================================================
        */

        const modal =
            bootstrap.Modal.getInstance(
                this.taxModal
            );


        modal?.hide();


        /*
        ==================================================
        RELOAD DATA
        ==================================================
        */

        await this.loadData(
            false
        );


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        this.showSuccess(

            this.currentMode
            ===
            "edit"

                ? "Tax updated successfully."

                : "Tax created successfully."

        );

    }

    catch (error) {

        console.error(
            "Tax.save:",
            error
        );


        this.showError(

            error.message
            ||
            "Failed to save Tax."

        );

    }

}


    /*
    ==================================================
    HANDLE ACTION
    ==================================================
    */

    handleAction(
        action,
        id
    ) {

        switch (
            action
        ) {

            case "edit":

                this.openEditModal(
                    id
                );

                break;


            case "delete":

                this.deleteTax(
                    id
                );

                break;

        }

    }


    /*
    ==================================================
    DELETE
    ==================================================
    */

    async deleteTax(id) {

        try {

            const tax =
                this.taxes.find(
                    item =>
                        String(
                            item.id
                        )
                        ===
                        String(id)
                );


            if (!tax) {

                throw new Error(
                    "Tax not found."
                );

            }


            const confirmed =
                window.confirm(
                    `Delete Tax "${tax.tax_name}"?`
                );


            if (!confirmed) {

                return;

            }


            await this.service.delete(
                id
            );


            await this.loadData(false);


            this.showSuccess(
                "Tax deleted successfully."
            );

        }

        catch (error) {

            console.error(
                "Tax.deleteTax:",
                error
            );

            this.showError(
                error.message
                ||
                "Failed to delete Tax."
            );

        }

    }


    /*
    ==================================================
    LOAD COA
    ==================================================
    */

    async loadCOA() {

        try {

            const {
                data,
                error
            } = await supabase

                .from(
                    TABLE.CHART_OF_ACCOUNTS
                )

                .select(`
                    id,
                    account_code,
                    account_name,
                    status,
                    allow_transaction
                `)

                .eq(
                    "status",
                    true
                )

                .eq(
                    "allow_transaction",
                    true
                )

                .order(
                    "account_code",
                    {
                        ascending: true
                    }
                );


            if (error) {

                throw error;

            }


            const accounts =
                data || [];


            this.populateCOA(
                accounts
            );

        }

        catch (error) {

            console.error(
                "Tax.loadCOA:",
                error
            );

            throw error;

        }

    }


    /*
    ==================================================
    POPULATE COA
    ==================================================
    */

    populateCOA(
        accounts
    ) {

        if (!this.taxAccount) {

            return;

        }


        const currentTaxAccount =
            this.taxAccount.value;


        const currentOffsetAccount =
            this.offsetAccount?.value;


        const options = accounts
            .map(
                account => `

                    <option
                        value="${account.id}">

                        ${account.account_code}
                        -
                        ${account.account_name}

                    </option>

                `
            )
            .join("");


        this.taxAccount.innerHTML = `

            <option value="">
                Select Tax Account
            </option>

            ${options}

        `;


        if (this.offsetAccount) {

            this.offsetAccount.innerHTML = `

                <option value="">
                    Select Offset Account
                </option>

                ${options}

            `;

        }


        if (currentTaxAccount) {

            this.taxAccount.value =
                currentTaxAccount;

        }


        if (
            this.offsetAccount
            &&
            currentOffsetAccount
        ) {

            this.offsetAccount.value =
                currentOffsetAccount;

        }

    }


    /*
    ==================================================
    REFRESH
    ==================================================
    */

    async refresh() {

        try {

            await this.loadData();

        }

        catch (error) {

            console.error(
                "Tax.refresh:",
                error
            );

        }

    }


    /*
    ==================================================
    FORMAT RATE
    ==================================================
    */

    formatRate(
        rate
    ) {

        const value =
            Number(
                rate || 0
            );


        return `${value}%`;

    }


    /*
    ==================================================
    FORMAT MESSAGE
    ==================================================
    */

    showSuccess(
        message
    ) {

        console.log(
            "SUCCESS:",
            message
        );

        /*
        ==============================================
        Gunakan mekanisme notification FINOVA
        Anda di sini jika sudah tersedia.
        ==============================================
        */

    }


    showError(
        message
    ) {

        console.error(
            "ERROR:",
            message
        );

        /*
        ==============================================
        Gunakan mekanisme notification FINOVA
        Anda di sini jika sudah tersedia.
        ==============================================
        */

    }

}