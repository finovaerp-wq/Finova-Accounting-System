/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Module : Chart Of Accounts
Version : 2.0.0
==========================================================
*/

import { ChartOfAccountsService } from "../../service/chart-of-accounts.service.js";
import { PreviewService } from "../../service/preview.service.js";
import { ExcelExportService } from "../../service/excel-export.service.js";

export class ChartOfAccounts {

/*
==========================================================
CONSTRUCTOR
==========================================================
*/

constructor() {

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

    /*
    ======================================================
    SELECTED DATA
    ======================================================
    */

    this.selectedId = null;

    /*
    ======================================================
    MODAL
    ======================================================
    */

    this.modal = null;
    this.deleteChartOfAccountId = null;

    this.coaDeleteModal = null;

    /*
    ======================================================
    LOADING
    ======================================================
    */

    this.isLoading = false;

    /*
    ======================================================
    INITIALIZE
    ======================================================
    */

    this.initialize();

}
/*
==========================================================
INITIALIZE
==========================================================
*/

async initialize() {

    try {

        /*
        ======================================================
        LOAD MODAL
        ======================================================
        */

        await this.loadModal();

        /*
        ======================================================
        CACHE ELEMENTS
        ======================================================
        */

        this.cacheElements();

        /*
        ======================================================
        REGISTER EVENTS
        ======================================================
        */

        this.bindEvents();

        /*
        ======================================================
        LOAD MASTER DATA
        ======================================================
        */

        await this.loadParentAccounts();

        /*
        ======================================================
        LOAD TABLE
        ======================================================
        */

        await this.loadData();

    }

    catch (error) {

        console.error(error);

        this.showError(

            "Failed to initialize Chart Of Accounts."

        );

    }

}
/*
==========================================================
LOAD MODAL
==========================================================
*/

async loadModal() {

    try {

        /*
        ======================================================
        LOAD HTML
        ======================================================
        */

        const response =
            await fetch(
                `modules/chart-of-accounts/chart-of-accounts-modal.html?v=${Date.now()}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load Chart Of Accounts modal."
            );

        }


        const html =
            await response.text();


        /*
        ======================================================
        MODAL CONTAINER
        ======================================================
        */

        const container =
            document.getElementById(
                "modal-container"
            );


        if (!container) {

            throw new Error(
                "Modal container not found."
            );

        }


        /*
        ======================================================
        LOAD HTML
        ======================================================
        */

        container.innerHTML =
            html;


        /*
        ======================================================
        MAIN COA MODAL
        ======================================================
        */

        const modalElement =
            container.querySelector(
                "#coa-modal"
            );


        if (!modalElement) {

            throw new Error(
                "Chart Of Accounts modal not found."
            );

        }


        this.modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        /*
        ======================================================
        DELETE COA MODAL
        ======================================================
        */

        const deleteModalElement =
            container.querySelector(
                "#coaDeleteModal"
            );


        if (!deleteModalElement) {

            throw new Error(
                "COA Delete Modal not found."
            );

        }


        this.coaDeleteModal =
            bootstrap.Modal.getOrCreateInstance(
                deleteModalElement
            );


        console.log(
            "Chart Of Accounts modal loaded."
        );


        console.log(
            "COA Delete Modal loaded."
        );

    }

    catch (error) {

        console.error(error);

        throw error;

    }

}
/*
==========================================================
CACHE ELEMENTS
==========================================================
*/

cacheElements() {

    /*
    ======================================================
    TOOLBAR
    ======================================================
    */

    this.btnAdd =
        document.getElementById("btn-add-account");

    this.btnRefresh =
        document.getElementById("btn-refresh");

    this.btnPreview =
        document.getElementById("btn-preview");

    this.btnExport =
        document.getElementById("btn-export");

    this.btnSearch =
        document.getElementById("btn-search");

    /*
    ======================================================
    SEARCH
    ======================================================
    */

    this.searchInput =
        document.getElementById("coa-search");

    this.statusFilter =
        document.getElementById("coa-status-filter");

    /*
    ======================================================
    TABLE
    ======================================================
    */

    this.tableBody =
        document.getElementById("coa-table-body");

    /*
    ======================================================
    PAGINATION
    ======================================================
    */

    this.pagination =
        document.getElementById("pagination");

    this.paginationInfo =
        document.getElementById("pagination-info");

    this.totalRecord =
        document.getElementById("total-record");

    /*
    ======================================================
    MODAL
    ======================================================
    */

    this.modalElement =
        document.getElementById("coa-modal");
    this.deleteModalElement =
    document.getElementById(
        "coaDeleteModal"
    );

this.btnConfirmDelete =
    document.getElementById(
        "btn-confirm-coa-delete"
    );

    this.modalTitle =
        document.getElementById("coa-modal-title");

    /*
    ======================================================
    FORM
    ======================================================
    */

    this.coaForm =
        document.getElementById("coa-form");

    this.coaId =
        document.getElementById("coa-id");

    /*
==========================================================
ACCOUNT FORM ELEMENTS
==========================================================
*/

this.parentId =
    document.getElementById("coa-parent");

this.accountCode =
    document.getElementById("coa-code");

this.accountName =
    document.getElementById("coa-name");

this.currency =
    document.getElementById("currency");

this.postingType =
    document.getElementById("coa-posting-type");

this.isHeader =
    document.getElementById("is-header");

this.allowTransaction =
    document.getElementById("allow-transaction");

this.status =
    document.getElementById("status");

this.description =
    document.getElementById("coa-description");

    /*
    ======================================================
    PARENT INFORMATION
    ======================================================
    */

    this.parentInformation =
        document.getElementById("parent-information");

    this.parentName =
        document.getElementById("parent-name");

    this.parentLevel =
        document.getElementById("parent-level");

    this.parentChildCount =
        document.getElementById("parent-child-count");

}
/*
==========================================================
BIND EVENTS
==========================================================
*/

bindEvents() {

    /*
    ======================================================
    TOOLBAR
    ======================================================
    */

    this.btnAdd?.addEventListener(

        "click",

        () => this.openAddModal()

    );

    this.btnRefresh?.addEventListener(

        "click",

        () => this.refresh()

    );

    this.btnPreview?.addEventListener(

        "click",

        () => this.preview()

    );

    this.btnExport?.addEventListener(

        "click",

        () => this.exportExcel()

    );

    /*
==========================================================
REAL-TIME SEARCH
==========================================================
*/

this.searchInput?.addEventListener(
    "input",
    () => {

        this.handleSearch();

    }
);


    /*
    ======================================================
    SEARCH
    ======================================================
    */

    this.searchInput?.addEventListener(

        "keypress",

        (event) => {

            if (event.key === "Enter") {

                this.search();

            }

        }

    );

    /*
    ======================================================
    STATUS FILTER
    ======================================================
    */

    this.statusFilter?.addEventListener(

        "change",

        () => this.search()

    );

    /*
    ======================================================
    PARENT ACCOUNT
    ======================================================
    */

    this.parentId?.addEventListener(

        "change",

        () => this.parentChanged()

    );

    /*
    ======================================================
    TABLE
    ======================================================
    */

    this.bindTableEvents();

    /*
    ======================================================
    MODAL
    ======================================================
    */

    this.bindModalEvents();

}
/*
==========================================================
HANDLE REAL-TIME SEARCH
==========================================================
*/

handleSearch() {

    const keyword =
        this.searchInput
            ?.value
            .trim()
            .toLowerCase() || "";

    if (!keyword) {

        this.filteredData =
            [...this.data];

    } else {

        this.filteredData =
            this.data.filter(account => {

                const code =
                    String(
                        account.account_code || ""
                    ).toLowerCase();

                const name =
                    String(
                        account.account_name || ""
                    ).toLowerCase();

                return (

                    code.includes(keyword) ||

                    name.includes(keyword)

                );

            });

    }

    /*
    ======================================================
    RESET PAGE
    ======================================================
    */

    this.currentPage = 1;

    /*
    ======================================================
    RENDER
    ======================================================
    */

    this.renderTable();

    this.renderPagination();

}

/*
==========================================================
PARENT ACCOUNT CHANGED
==========================================================
*/

async parentChanged() {

    try {

        if (!this.parentId?.value) {

            this.parentName.textContent = "-";
            this.parentLevel.textContent = "-";
            this.parentChildCount.textContent = "-";

            return;

        }

        const parent =

            await ChartOfAccountsService.getParentInformation(

                this.parentId.value

            );

        if (!parent) {

            return;

        }

        this.parentName.textContent =
            parent.account_name ?? "-";

        this.parentLevel.textContent =
            parent.level ?? "-";

        this.parentChildCount.textContent =
            parent.child_count ?? "0";

    }

    catch (error) {

        console.error(error);

        this.showError(

            "Failed to load parent account."

        );

    }

}

/*
==========================================================
BIND MODAL EVENTS
==========================================================
*/

bindModalEvents() {

    /*
    ======================================================
    MODAL ELEMENT
    ======================================================
    */

    this.modalElement =
        document.getElementById(
            "coa-modal"
        );


    this.form =
        document.getElementById(
            "coa-form"
        );


    /*
    ======================================================
    SAVE BUTTON
    ======================================================
    */

    this.btnSave =
        document.getElementById(
            "btn-save-coa"
        );


    /*
    ======================================================
    CONFIRM DELETE BUTTON
    ======================================================
    */

    this.btnConfirmDelete =
    document.getElementById(
        "btn-confirm-delete-coa"
    );


    /*
    ======================================================
    SAVE EVENT
    ======================================================
    */

    this.btnSave?.addEventListener(
        "click",
        () => this.save()
    );


    /*
    ======================================================
    CONFIRM DELETE EVENT
    ======================================================
    */

    this.btnConfirmDelete?.addEventListener(
        "click",
        async () => {

            console.log(
                "COA CONFIRM DELETE BUTTON CLICKED"
            );


            await this.confirmDeleteChartOfAccount();

        }
    );

}
/*
==========================================================
PREVIEW CHART OF ACCOUNTS
NEW TAB
TAHOMA FONT
NO PRINT
NO PDF
NO LOGO
NO CLOSE BUTTON
LONG TEXT NO WRAP
DESCRIPTION LAST COLUMN

FINAL :
- HORIZONTAL SCROLLBAR ALWAYS AVAILABLE
  AT BOTTOM OF BROWSER
- FIXED BOTTOM SCROLLBAR
- SYNCHRONIZED WITH TABLE
==========================================================
*/

preview() {

    try {

        /*
        ==================================================
        DATA
        ==================================================
        */

        const accounts =
            Array.isArray(
                this.filteredData
            )
                ? this.filteredData
                : [];


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            accounts.length === 0
        ) {

            this.showError(
                "No Chart Of Accounts data available to preview."
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
        BUILD ROWS
        ==================================================
        */

        const rows =
            accounts
                .map(
                    (
                        item,
                        index
                    ) => {

                        const isHeader =
                            item?.is_header
                                ? "Yes"
                                : "No";


                        const allowTransaction =
                            item?.allow_transaction
                                ? "Yes"
                                : "No";


                        const status =
                            item?.status
                                ? "Active"
                                : "Inactive";


                        return `

                            <tr>

                                <td class="text-center">

                                    ${index + 1}

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            item?.account_code
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            item?.account_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            item?.parent_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="text-center">

                                    ${
                                        escapeHTML(
                                            item?.currency
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="text-center">

                                    ${
                                        escapeHTML(
                                            item?.normal_balance
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="text-center">

                                    ${
                                        escapeHTML(
                                            item?.posting_type
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="text-center">

                                    ${
                                        escapeHTML(
                                            isHeader
                                        )
                                    }

                                </td>


                                <td class="text-center">

                                    ${
                                        escapeHTML(
                                            allowTransaction
                                        )
                                    }

                                </td>


                                <td class="text-center">

                                    ${
                                        escapeHTML(
                                            status
                                        )
                                    }

                                </td>


                                <td class="description">

                                    ${
                                        escapeHTML(
                                            item?.description
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
                    Chart Of Accounts - Preview
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
                            28px 32px 40px 32px;

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


                    .report-module {

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

                    HORIZONTAL SCROLL IS CONTROLLED
                    BY FIXED BOTTOM SCROLLBAR
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

                        /*
                        hide native horizontal scrollbar
                        because fixed scrollbar is used
                        */

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
                            10px 10px;

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
                            9px 10px;

                        border-right:
                            1px solid #d1d5db;

                        border-bottom:
                            1px solid #d1d5db;

                        background:
                            #ffffff;

                        color:
                            #1f2937;

                        font-size:
                            12px;

                        font-weight:
                            400;

                        vertical-align:
                            middle;

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

                    .text-center {

                        text-align:
                            center;

                    }


                    /*
                    ==========================================
                    COLUMN WIDTH
                    ==========================================
                    */

                    .col-no {

                        width:
                            48px;

                        min-width:
                            48px;

                    }


                    .col-code {

                        min-width:
                            130px;

                    }


                    .col-name {

                        min-width:
                            250px;

                    }


                    .col-parent {

                        min-width:
                            240px;

                    }


                    .col-currency {

                        min-width:
                            90px;

                    }


                    .col-normal {

                        min-width:
                            125px;

                    }


                    .col-posting {

                        min-width:
                            145px;

                    }


                    .col-header {

                        min-width:
                            80px;

                    }


                    .col-transaction {

                        min-width:
                            135px;

                    }


                    .col-status {

                        min-width:
                            90px;

                    }


                    /*
                    ==========================================
                    DESCRIPTION
                    LAST COLUMN
                    ==========================================
                    */

                    .col-description {

                        min-width:
                            420px;

                    }


                    .description {

                        min-width:
                            420px;

                        text-align:
                            left;

                        white-space:
                            nowrap;

                    }


                    /*
                    ==========================================
                    REPORT FOOTER
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
                    ALWAYS VISIBLE AT BOTTOM OF BROWSER
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
                    FAKE WIDTH
                    ==========================================
                    */

                    .fixed-horizontal-scroll-content {

                        height:
                            1px;

                        min-height:
                            1px;

                        width:
                            100%;

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
                         REPORT HEADER
                    =================================== -->

                    <div class="report-header">

                        <h1 class="report-title">

                            FINOVA ACCOUNTING SYSTEM

                        </h1>


                        <div class="report-module">

                            Chart Of Accounts

                        </div>


                        <div class="report-description">

                            Chart Of Accounts Master Data

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
                            id="coa-table-scroll"
                        >


                            <table
                                id="coa-preview-table"
                            >


                                <colgroup>

                                    <col class="col-no">

                                    <col class="col-code">

                                    <col class="col-name">

                                    <col class="col-parent">

                                    <col class="col-currency">

                                    <col class="col-normal">

                                    <col class="col-posting">

                                    <col class="col-header">

                                    <col class="col-transaction">

                                    <col class="col-status">

                                    <col class="col-description">

                                </colgroup>


                                <thead>

                                    <tr>

                                        <th>
                                            No
                                        </th>

                                        <th>
                                            Account Code
                                        </th>

                                        <th>
                                            Account Name
                                        </th>

                                        <th>
                                            Parent
                                        </th>

                                        <th>
                                            Currency
                                        </th>

                                        <th>
                                            Normal Balance
                                        </th>

                                        <th>
                                            Posting Type
                                        </th>

                                        <th>
                                            Header
                                        </th>

                                        <th>
                                            Allow Transaction
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Description
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
                            ${accounts.length}

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
                    id="coa-fixed-scroll-container"
                >

                    <div
                        class="fixed-horizontal-scroll-inner"
                        id="coa-fixed-scroll"
                    >

                        <div
                            class="fixed-horizontal-scroll-content"
                            id="coa-fixed-scroll-content"
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
        DOCUMENT TITLE
        ==================================================
        */

        previewWindow.document.title =
            "Chart Of Accounts - Preview";


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
                    "coa-table-scroll"
                );


            const table =
                doc.getElementById(
                    "coa-preview-table"
                );


            const fixedScrollContainer =
                doc.getElementById(
                    "coa-fixed-scroll-container"
                );


            const fixedScroll =
                doc.getElementById(
                    "coa-fixed-scroll"
                );


            const fixedScrollContent =
                doc.getElementById(
                    "coa-fixed-scroll-content"
                );


            /*
            ==============================================
            VALIDATION
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
                HIDE FIXED SCROLL IF TABLE FITS SCREEN
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
            TABLE RESIZE OBSERVER
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
            "ChartOfAccounts.preview:",
            error
        );


        this.showError(
            error?.message
            ||
            "Preview Chart Of Accounts failed."
        );

    }

}
/*
==========================================================
EXPORT EXCEL
==========================================================
*/

exportExcel() {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!this.filteredData.length) {

            this.showError(

                "No data available to export."

            );

            return;

        }

        /*
        ======================================================
        BUILD DATA
        ======================================================
        */

        const data = this.filteredData.map(item => ({

            "Account Code": item.account_code,

            "Account Name": item.account_name,

            "Parent": item.parent_name ?? "-",

            "Currency": item.currency,

            "Normal Balance": item.normal_balance,

            "Posting Type": item.posting_type,

            "Header": item.is_header ? "Yes" : "No",

            "Status": item.status ? "Active" : "Inactive"

        }));

        /*
        ======================================================
        EXPORT
        ======================================================
        */

        ExcelExportService.export(

            data,

            "Chart Of Accounts",

            "Chart Of Accounts"

        );

    }

    catch (error) {

        console.error(error);

        this.showError(

            "Export Excel failed."

        );

    }

}
/*
==========================================================
LOAD DATA
==========================================================
*/

async loadData() {
    this.showLoading();
    try {

        this.isLoading = true;

        /*
        ======================================================
        FILTER
        ======================================================
        */

        const keyword =

            this.searchInput?.value.trim() ?? "";

        const status =

            this.statusFilter?.value ?? "";

        /*
        ======================================================
        LOAD DATA
        ======================================================
        */

        if (keyword || status) {

            this.data =

                await ChartOfAccountsService.search(

                    keyword,

                    status

                );

        }

        else {

            this.data =

                await ChartOfAccountsService.getAll();

        }

        /*
        ======================================================
        STORE DATA
        ======================================================
        */

        this.filteredData = [...this.data];

        /*
        ======================================================
        RENDER
        ======================================================
        */

        this.renderTable();

        /*
        ======================================================
        RENDER
        ======================================================
        */

        this.renderTable();

    }

    catch (error) {

        console.error(error);

        this.showError(

            error.message ??

            "Failed to load Chart Of Accounts."

        );

    }

    finally {

        this.isLoading = false;
        this.hideLoading();

    }

}
/*
==========================================================
LOAD PARENT ACCOUNTS
==========================================================
*/

async loadParentAccounts() {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!this.parentId) {

            console.error(
                "Parent Account element #coa-parent not found."
            );

            return;

        }

        /*
        ======================================================
        LOAD DATA
        ======================================================
        */

        const accounts =
            await ChartOfAccountsService.getHeaderAccounts();

        /*
        ======================================================
        RESET OPTION
        ======================================================
        */

        this.parentId.innerHTML = `

            <option value="">

                -- None --

            </option>

        `;

        /*
        ======================================================
        BUILD OPTION
        ======================================================
        */

        accounts.forEach(account => {

            this.parentId.insertAdjacentHTML(

                "beforeend",

                `

                <option value="${account.id}">

                    ${account.account_code}
                    -
                    ${account.account_name}

                </option>

                `

            );

        });

    }

    catch (error) {

        console.error(
            "Failed to load parent accounts:",
            error
        );

        this.showError(
            "Failed to load parent accounts."
        );

    }

}
/*
==========================================================
RENDER TABLE
==========================================================
*/

renderTable(data = null) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!this.tableBody) {
        return;
    }


    /*
    ======================================================
    UPDATE DATA
    ======================================================
    */

    if (Array.isArray(data)) {
        this.filteredData = data;
    }


    /*
    ======================================================
    TOTAL DATA
    ======================================================
    */

    const totalRecords =
        this.filteredData.length;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalRecords /
                this.pageSize
            )
        );


    /*
    ======================================================
    NORMALIZE CURRENT PAGE
    ======================================================
    */

    this.currentPage =
        Math.max(
            1,
            Math.min(
                this.currentPage,
                totalPages
            )
        );


    /*
    ======================================================
    EMPTY STATE
    ======================================================
    */

    if (!totalRecords) {

        this.renderEmptyState();

        this.renderPagination();

        return;

    }


    /*
    ======================================================
    CALCULATE PAGE DATA
    ======================================================
    */

    const start =
        (this.currentPage - 1) *
        this.pageSize;

    const end =
        start +
        this.pageSize;

    const pageData =
        this.filteredData.slice(
            start,
            end
        );


    /*
    ======================================================
    RENDER ROWS
    ======================================================
    */

    this.tableBody.innerHTML =
        pageData
            .map(item =>
                this.renderRow(item)
            )
            .join("");


    /*
    ======================================================
    RENDER PAGINATION
    ======================================================
    */

    this.renderPagination();

}


/*
==========================================================
RENDER PAGINATION
==========================================================
*/

renderPagination() {

    const totalRecords = this.filteredData.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalRecords / this.pageSize)
    );

    this.currentPage = Math.max(
        1,
        Math.min(
            this.currentPage,
            totalPages
        )
    );


    /*
    ======================================================
    FIND ELEMENTS
    ======================================================
    */

    const paginationInfo =
        document.getElementById(
            "pagination-info"
        );

    const firstButton =
        document.getElementById(
            "pagination-first"
        );

    const previousButton =
        document.getElementById(
            "pagination-prev"
        );

    const nextButton =
        document.getElementById(
            "pagination-next"
        );

    const lastButton =
        document.getElementById(
            "pagination-last"
        );

    const refreshButton =
        document.getElementById(
            "pagination-refresh"
        );

    const pageInput =
        document.getElementById(
            "pagination-page-input"
        );

    const totalPagesElement =
        document.getElementById(
            "pagination-total-pages"
        );


    

    /*
    ======================================================
    PAGE INPUT
    ======================================================
    */

    if (pageInput) {

        pageInput.value =
            this.currentPage;

        pageInput.min = 1;

        pageInput.max =
            totalPages;

    }


 /*
======================================================
TOTAL PAGES
======================================================
*/

if (totalPagesElement) {

    totalPagesElement.textContent =
        totalPages;

}

    /*
    ======================================================
    BUTTON STATE
    ======================================================
    */

    if (firstButton) {

        firstButton.disabled =
            this.currentPage <= 1;

    }

    if (previousButton) {

        previousButton.disabled =
            this.currentPage <= 1;

    }

    if (nextButton) {

        nextButton.disabled =
            this.currentPage >= totalPages;

    }

    if (lastButton) {

        lastButton.disabled =
            this.currentPage >= totalPages;

    }


    /*
    ======================================================
    RECORD INFORMATION
    ======================================================
    */

    if (paginationInfo) {

        if (totalRecords === 0) {

            paginationInfo.textContent =
                "Displaying Record 0 - 0 of 0";

        }

        else {

            const startRecord =
                (
                    (this.currentPage - 1)
                    * this.pageSize
                ) + 1;

            const endRecord =
                Math.min(

                    this.currentPage
                    * this.pageSize,

                    totalRecords

                );

            paginationInfo.textContent =

                `Displaying Record ${startRecord} - ${endRecord} of ${totalRecords}`;

        }

    }


    /*
    ======================================================
    FIRST PAGE
    ======================================================
    */

    if (firstButton) {

        firstButton.onclick = () => {

            if (this.currentPage <= 1) {

                return;

            }

            this.currentPage = 1;

            this.renderTable();

        };

    }


    /*
    ======================================================
    PREVIOUS PAGE
    ======================================================
    */

    if (previousButton) {

        previousButton.onclick = () => {

            if (this.currentPage <= 1) {

                return;

            }

            this.currentPage--;

            this.renderTable();

        };

    }


    /*
    ======================================================
    NEXT PAGE
    ======================================================
    */

    if (nextButton) {

        nextButton.onclick = () => {

            if (
                this.currentPage >=
                totalPages
            ) {

                return;

            }

            this.currentPage++;

            this.renderTable();

        };

    }


    /*
    ======================================================
    LAST PAGE
    ======================================================
    */

    if (lastButton) {

        lastButton.onclick = () => {

            if (
                this.currentPage >=
                totalPages
            ) {

                return;

            }

            this.currentPage =
                totalPages;

            this.renderTable();

        };

    }


    /*
    ======================================================
    DIRECT PAGE INPUT
    ======================================================
    */

    if (pageInput) {

        pageInput.onkeydown =
            (event) => {

                if (
                    event.key !== "Enter"
                ) {

                    return;

                }

                event.preventDefault();

                let page =
                    parseInt(
                        pageInput.value,
                        10
                    );

                if (isNaN(page)) {

                    page =
                        this.currentPage;

                }

                page = Math.max(

                    1,

                    Math.min(
                        page,
                        totalPages
                    )

                );

                this.currentPage =
                    page;

                this.renderTable();

                pageInput.blur();

            };


        pageInput.onclick = () => {

            pageInput.select();

        };

    }


    /*
    ======================================================
    REFRESH
    ======================================================
    */

    if (refreshButton) {

        refreshButton.onclick =
            async () => {

                await this.loadData();

            };

    }

}
/*
==========================================================
RENDER EMPTY STATE
==========================================================
*/

renderEmptyState() {

    this.tableBody.innerHTML = `

<tr>

    <td colspan="9">

        <div class="finova-empty">

            <i class="fa-solid fa-book"></i>

            <h5>No Chart Of Accounts</h5>

            <p>

                Click Add Account
                to create your first account.

            </p>

        </div>

    </td>

</tr>

`;

}
/*
==========================================================
SHOW LOADING
==========================================================
*/

showLoading() {

    if (!this.tableBody) {

        return;

    }

    this.tableBody.innerHTML = `

        <tr>

            <td colspan="9">

                <div class="text-center py-5">

                    <div
                        class="spinner-border text-primary mb-3"
                        role="status">
                    </div>

                    <div>

                        Loading Chart Of Accounts...

                    </div>

                </div>

            </td>

        </tr>

    `;

}

/*
==========================================================
HIDE LOADING
==========================================================
*/

hideLoading() {

    // renderTable() akan mengganti isi tabel.

}

/*
==========================================================
RENDER ROW
==========================================================
*/

renderRow(item) {

    return `

<tr>

    <td>
        <strong style="color: #000000;">
            ${item.account_code ?? "-"}
        </strong>
    </td>

    <td>
        <strong style="color: #000000;">
            ${item.account_name ?? "-"}
        </strong>
    </td>

    <td>${item.parent_name ?? "-"}</td>

    <td>${item.currency ?? "-"}</td>

    <td>${item.normal_balance ?? "-"}</td>

    <td>${item.posting_type ?? "-"}</td>

    <td class="text-center">

        ${item.is_header
            ? `<span class="badge badge-primary">Yes</span>`
            : `<span class="badge bg-secondary">No</span>`}

    </td>

    <td class="text-center">

        ${item.status
            ? `
            <span class="badge badge-success">
                <i class="fa-solid fa-circle-check me-1"></i>
                Active
            </span>`
            : `
            <span class="badge badge-danger">
                <i class="fa-solid fa-circle-xmark me-1"></i>
                Inactive
            </span>`}

    </td>

    <td>

        <div class="finova-action">

            <button
                class="btn-action btn-action-edit"
                data-action="edit"
                data-id="${item.id}"
                title="Edit">

                <i class="fa-solid fa-pen"></i>

            </button>

            <button
                class="btn-action btn-action-delete"
                data-action="delete"
                data-id="${item.id}"
                title="Delete">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

    </td>

</tr>

`;

}
/*
==========================================================
OPEN ADD MODAL
==========================================================
*/

async openAddModal() {

    try {

        if (this.form) {
            this.form.reset();
        }

        if (this.coaId) {
            this.coaId.value = "";
        }

        if (this.parentId) {
            this.parentId.value = "";
        }

        if (this.accountCode) {
            this.accountCode.value = "";
        }

        if (this.accountName) {
            this.accountName.value = "";
        }

        if (this.accountCategory) {
            this.accountCategory.value = "";
        }

        if (this.currency) {
            this.currency.value = "IDR";
        }

        if (this.normalBalance) {
            this.normalBalance.value = "Debit";
        }

        if (this.description) {
            this.description.value = "";
        }

        const parentChildCount =
            document.getElementById(
                "parent-child-count"
            );

        if (parentChildCount) {
            parentChildCount.textContent = "-";
        }

        await this.loadParentAccounts();

        if (this.modalTitle) {
            this.modalTitle.textContent =
                "Add Chart Of Account";
        }

        if (this.modal) {
            this.modal.show();
        }

    }

    catch (error) {

        console.error(
            "Failed to open Add Chart Of Account modal:",
            error
        );

        this.showError(
            error.message
        );

    }

}

/*
==========================================================
OPEN EDIT MODAL
==========================================================
*/

async openEditModal(id) {

    try {

        /*
        ======================================================
        LOAD PARENT ACCOUNT
        ======================================================
        */

        await this.loadParentAccounts();


        /*
        ======================================================
        LOAD DATA
        ======================================================
        */

        const item =
            await ChartOfAccountsService.getById(id);


        if (!item) {

            this.showError(
                "Chart Of Account not found."
            );

            return;

        }


        /*
        ======================================================
        ID
        ======================================================
        */

        if (this.coaId) {

            this.coaId.value =
                item.id ?? "";

        }


        /*
        ======================================================
        ACCOUNT
        ======================================================
        */

        if (this.parentId) {

            this.parentId.value =
                item.parent_id ?? "";

        }


        if (this.accountCode) {

            this.accountCode.value =
                item.account_code ?? "";

        }


        if (this.accountName) {

            this.accountName.value =
                item.account_name ?? "";

        }


        if (this.currency) {

            this.currency.value =
                item.currency ?? "IDR";

        }


        if (this.postingType) {

            this.postingType.value =
                item.posting_type ?? "Manual & Auto";

        }


        /*
        ======================================================
        NORMAL BALANCE
        ======================================================
        */

        const normalDebit =
            document.getElementById(
                "normal-debit"
            );

        const normalCredit =
            document.getElementById(
                "normal-credit"
            );


        if (normalDebit) {

            normalDebit.checked =
                item.normal_balance !== "Credit";

        }


        if (normalCredit) {

            normalCredit.checked =
                item.normal_balance === "Credit";

        }


        /*
        ======================================================
        OPTIONS
        ======================================================
        */

        if (this.isHeader) {

            this.isHeader.checked =
                item.is_header ?? false;

        }


        if (this.allowTransaction) {

            this.allowTransaction.checked =
                item.allow_transaction ?? true;

        }


        if (this.status) {

            this.status.checked =
                item.status ?? true;

        }


        if (this.description) {

            this.description.value =
                item.description ?? "";

        }


        /*
        ======================================================
        PARENT INFORMATION
        ======================================================
        */

        if (this.parentName) {

            this.parentName.textContent =
                item.parent_name ?? "-";

        }


        if (this.parentLevel) {

            this.parentLevel.textContent =
                item.level ?? "-";

        }


        if (this.parentChildCount) {

            this.parentChildCount.textContent =
                item.child_count ?? "-";

        }


        /*
        ======================================================
        TITLE
        ======================================================
        */

        if (this.modalTitle) {

            this.modalTitle.textContent =
                "Edit Chart Of Account";

        }


        /*
        ======================================================
        SHOW MODAL
        ======================================================
        */

        if (this.modal) {

            this.modal.show();

        }

    }

    catch (error) {

        console.error(
            "Failed to load Chart Of Account:",
            error
        );

        this.showError(
            "Failed to load Chart Of Account."
        );

    }

}
/*
==========================================================
SEARCH
==========================================================
*/

async search() {

    try {

        /*
        ======================================================
        FILTER
        ======================================================
        */

        const keyword =

            this.searchInput?.value.trim() ?? "";

        const status =

            this.statusFilter?.value ?? "";

        /*
        ======================================================
        SEARCH
        ======================================================
        */

        this.filteredData =

            await ChartOfAccountsService.search(

                keyword,

                status

            );

        /*
        ======================================================
        RESET PAGE
        ======================================================
        */

        this.currentPage = 1;

        /*
        ======================================================
        RENDER
        ======================================================
        */

        this.renderTable();

    }

    catch (error) {

        console.error(error);

        this.showError(

            error.message ??

            "Search failed."

        );

    }

}

/*
==========================================================
REFRESH
==========================================================
*/

async refresh() {

    try {

        /*
        ======================================================
        RESET SEARCH
        ======================================================
        */

        if (this.searchInput) {

            this.searchInput.value = "";

        }


        /*
        ======================================================
        RESET FILTER
        ======================================================
        */

        if (this.statusFilter) {

            this.statusFilter.value = "";

        }


        /*
        ======================================================
        RESET PAGINATION
        ======================================================
        */

        this.currentPage = 1;


        /*
        ======================================================
        RELOAD
        ======================================================
        */

        await this.loadData();

    }

    catch (error) {

        console.error(error);

        this.showError(

            "Failed to refresh data."

        );

    }

}
/*
==========================================================
COLLECT FORM DATA
==========================================================
*/

collectFormData() {

    return {

        account_code:
            this.accountCode.value.trim(),

        account_name:
            this.accountName.value.trim(),

        parent_id:
            this.parentId.value || null,

        level:
            null,

        account_class:
            document.getElementById(
                "coa-type"
            ).value,

        normal_balance:
            document.querySelector(
                'input[name="normal-balance"]:checked'
            )?.value ?? "Debit",

        is_header:
            this.isHeader.checked,

        allow_transaction:
            this.allowTransaction.checked,

        status:
            this.status.checked,

        posting_type:
            this.postingType.value,

        currency:
            this.currency.value,

        description:
            this.description.value.trim()

    };

}

/*
==========================================================
VALIDATE
==========================================================
*/

validate() {

    if (!this.accountCode.value.trim()) {

        this.showError(
            "Account Code is required."
        );

        this.accountCode.focus();

        return false;

    }

    if (!this.accountName.value.trim()) {

        this.showError(
            "Account Name is required."
        );

        this.accountName.focus();

        return false;

    }

    if (!this.postingType.value) {

        this.showError(
            "Posting Type is required."
        );

        this.postingType.focus();

        return false;

    }

    return true;

}
/*
==========================================================
SAVE
==========================================================
*/

async save() {

    if (!this.validate()) {

        return;

    }

    try {

        this.btnSave.disabled = true;

        const id =
            this.coaId.value.trim();

        if (!id) {

            await this.insert();

        }

        else {

            await this.update(id);

        }

    }

    finally {

        this.btnSave.disabled = false;

    }

}
/*
==========================================================
INSERT
==========================================================
*/

async insert() {

    try {

        const payload =
            this.collectFormData();

        await ChartOfAccountsService.insert(
            payload
        );

        this.closeModal();

        this.currentPage = 1;

        await this.loadData();

        await this.loadParentAccounts();

        this.showSuccess(
            "Chart Of Account successfully created."
        );

    }

    catch (error) {

        console.error(error);

        this.showError(

            error.message ??

            "Failed to create Chart Of Account."

        );

    }

}
/*
==========================================================
UPDATE
==========================================================
*/

async update(id) {

    try {

        const payload =
            this.collectFormData();

        await ChartOfAccountsService.update(

            id,

            payload

        );

        this.closeModal();

        await this.loadData();

        await this.loadParentAccounts();

        this.showSuccess(

            "Chart Of Account successfully updated."

        );

    }

    catch (error) {

        console.error(error);

        this.showError(

            error.message ??

            "Failed to update Chart Of Account."

        );

    }

}
/*
==========================================================
DELETE CHART OF ACCOUNT
==========================================================
*/

async delete(id) {

    try {

        /*
        ==============================================
        FIND ACCOUNT
        ==============================================
        */

        const account =
            this.data.find(
                item =>
                    String(item.id) === String(id)
            );


        if (!account) {

            console.error(
                "Chart Of Account not found:",
                id
            );

            this.showError(
                "Chart Of Account not found."
            );

            return;

        }


        /*
        ==============================================
        STORE DELETE ID
        ==============================================
        */

        this.deleteChartOfAccountId =
            id;


        /*
==========================================================
FILL DELETE MODAL
==========================================================
*/

const deleteCode =
    document.getElementById(
        "coa-delete-code"
    );

const deleteName =
    document.getElementById(
        "coa-delete-name"
    );

const deleteParent =
    document.getElementById(
        "coa-delete-parent"
    );


/*
==========================================================
ACCOUNT CODE
==========================================================
*/

if (deleteCode) {

    deleteCode.textContent =
        account.account_code || "-";

}


/*
==========================================================
ACCOUNT NAME
==========================================================
*/

if (deleteName) {

    deleteName.textContent =
        account.account_name || "-";

}


/*
==========================================================
PARENT ACCOUNT
==========================================================
*/

if (deleteParent) {

    if (!account.parent_id) {

        deleteParent.textContent =
            "-- None --";

    } else {

        const parentAccount =
            this.data.find(

                item =>
                    String(item.id) ===
                    String(account.parent_id)

            );

        if (parentAccount) {

            deleteParent.textContent =
                parentAccount.account_name || "-";

        } else {

            deleteParent.textContent =
                "-- None --";

        }

    }

}

        /*
        ==============================================
        GET DELETE MODAL
        ==============================================
        */

        const modalElement =
            document.getElementById(
                "coaDeleteModal"
            );


        console.log(
            "DELETE BUTTON CLICKED - ID:",
            id
        );

        console.log(
            "COA DELETE MODAL ELEMENT:",
            modalElement
        );


        if (!modalElement) {

            console.error(
                "COA Delete Modal element not found."
            );

            return;

        }


        /*
        ==============================================
        BOOTSTRAP DELETE MODAL
        ==============================================
        */

        this.coaDeleteModal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        console.log(
            "SHOWING COA DELETE MODAL"
        );


        this.coaDeleteModal.show();

    }

    catch (error) {

        console.error(
            "Failed to open COA delete confirmation:",
            error
        );

        this.showError(
            error.message
        );

    }

}
/*
==========================================================
CONFIRM DELETE CHART OF ACCOUNT
==========================================================
*/

async confirmDeleteChartOfAccount() {

    const id =
        this.deleteChartOfAccountId;


    console.log(
        "CONFIRM DELETE COA ID:",
        id
    );


    if (!id) {

        console.error(
            "Chart Of Account delete ID is empty."
        );

        return;

    }


    try {

        /*
        ==================================================
        CHECK ACCOUNT USAGE
        ==================================================
        */

        const isUsed =
            await ChartOfAccountsService.isUsed(
                id
            );


        console.log(
            "COA IS USED:",
            isUsed
        );


        if (isUsed) {

            if (this.coaDeleteModal) {

                this.coaDeleteModal.hide();

            }


            this.deleteChartOfAccountId =
                null;


            this.showError(
                "Chart Of Account cannot be deleted because it is still being used."
            );

            return;

        }


        /*
        ==================================================
        DELETE
        ==================================================
        */

        await ChartOfAccountsService.delete(
            id
        );


        /*
        ==================================================
        CLOSE MODAL
        ==================================================
        */

        if (this.coaDeleteModal) {

            this.coaDeleteModal.hide();

        }


        /*
        ==================================================
        RESET DELETE ID
        ==================================================
        */

        this.deleteChartOfAccountId =
            null;


        /*
        ==================================================
        RELOAD DATA
        ==================================================
        */

        this.currentPage = 1;

        await this.loadData();

        await this.loadParentAccounts();


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        this.showSuccess(
            "Chart Of Account successfully deleted."
        );

    }

    catch (error) {

        console.error(
            "Failed to delete Chart Of Account:",
            error
        );


        if (this.coaDeleteModal) {

            this.coaDeleteModal.hide();

        }


        this.deleteChartOfAccountId =
            null;


        this.showError(
            error.message
        );

    }

}
/*
==========================================================
CLOSE MODAL
==========================================================
*/

closeModal() {

    /*
    ======================================================
    HIDE MODAL
    ======================================================
    */

    this.modal?.hide();

    /*
    ======================================================
    RESET FORM
    ======================================================
    */

    this.coaForm?.reset();

    /*
    ======================================================
    RESET SELECTED ID
    ======================================================
    */

    this.selectedId = null;

    if (this.coaId) {

        this.coaId.value = "";

    }

    /*
    ======================================================
    RESET PARENT INFORMATION
    ======================================================
    */

    if (this.parentId) {

        this.parentId.value = "";

    }

    if (this.parentName) {

        this.parentName.textContent = "-";

    }

    if (this.parentLevel) {

        this.parentLevel.textContent = "-";

    }

    if (this.parentChildCount) {

        this.parentChildCount.textContent = "-";

    }

}
/*
==========================================================
BIND TABLE EVENTS
==========================================================
*/

bindTableEvents() {

    if (!this.tableBody) {

        return;

    }

    this.tableBody.onclick = async (event) => {

        /*
        ==============================================
        EDIT
        ==============================================
        */

        const editButton = event.target.closest(

            "[data-action='edit']"

        );

        if (editButton) {

            event.preventDefault();

            const id =
                editButton.dataset.id;

            if (id) {

                await this.openEditModal(id);

            }

            return;

        }

        /*
        ==============================================
        DELETE
        ==============================================
        */

        const deleteButton = event.target.closest(

            "[data-action='delete']"

        );

        if (deleteButton) {

            event.preventDefault();

            const id =
                deleteButton.dataset.id;

            if (id) {

                await this.delete(id);

            }

        }

    };

}
/*
==========================================================
SHOW SUCCESS
BOOTSTRAP ALERT
CHART OF ACCOUNTS
SAME STYLE AS ACCOUNT PAYABLE
==========================================================
*/

showSuccess(
    message
) {

    /*
    ==================================================
    NORMALIZE MESSAGE
    ==================================================
    */

    const successMessage =
        message
        ||
        "Action completed successfully.";


    /*
    ==================================================
    REMOVE EXISTING SUCCESS ALERT
    ==================================================
    */

    const existingAlert =
        document.getElementById(
            "coa-bootstrap-success-alert"
        );


    if (
        existingAlert
    ) {

        existingAlert.remove();

    }


    /*
    ==================================================
    CREATE BOOTSTRAP ALERT
    ==================================================
    */

    const alertElement =
        document.createElement(
            "div"
        );


    alertElement.id =
        "coa-bootstrap-success-alert";


    alertElement.className = `
        alert
        alert-success
        alert-dismissible
        fade
        show
        d-flex
        align-items-center
        shadow-sm
        mb-0
    `;


    alertElement.setAttribute(
        "role",
        "alert"
    );


    /*
    ==================================================
    ESCAPE MESSAGE
    ==================================================
    */

    const safeMessage =
        String(
            successMessage
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


    /*
    ==================================================
    ALERT CONTENT
    ==================================================
    */

    alertElement.innerHTML = `

        <i
            class="
                fa-solid
                fa-circle-check
                me-2
            ">
        </i>


        <div class="flex-grow-1">

            ${safeMessage}

        </div>


        <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close">
        </button>

    `;


    /*
    ==================================================
    CHECK COA MODAL
    ==================================================
    */

    const modal =
        document.getElementById(
            "coa-modal"
        );


    const modalIsVisible =
        modal
        &&
        modal.classList.contains(
            "show"
        );


    const modalBody =
        modalIsVisible
            ? modal.querySelector(
                ".modal-body"
            )
            : null;


    /*
    ==================================================
    SHOW INSIDE MODAL
    ==================================================
    */

    if (
        modalBody
    ) {

        modalBody.insertBefore(
            alertElement,
            modalBody.firstChild
        );

    }

    else {

        /*
        ==============================================
        PAGE LEVEL ALERT
        SAME AS ACCOUNT PAYABLE
        ==============================================
        */

        alertElement.style.position =
            "fixed";


        alertElement.style.top =
            "20px";


        alertElement.style.left =
            "50%";


        alertElement.style.transform =
            "translateX(-50%)";


        alertElement.style.zIndex =
            "99999";


        alertElement.style.width =
            "auto";


        alertElement.style.minWidth =
            "380px";


        alertElement.style.maxWidth =
            "90vw";


        document.body.appendChild(
            alertElement
        );

    }


    /*
    ==================================================
    AUTO CLOSE
    ==================================================
    */

    setTimeout(
        () => {

            const currentAlert =
                document.getElementById(
                    "coa-bootstrap-success-alert"
                );


            if (
                !currentAlert
            ) {

                return;

            }


            if (
                window.bootstrap
                &&
                bootstrap.Alert
            ) {

                bootstrap.Alert
                    .getOrCreateInstance(
                        currentAlert
                    )
                    .close();

            }

            else {

                currentAlert.remove();

            }

        },

        5000

    );

}
/*
==========================================================
SHOW ERROR
BOOTSTRAP ALERT
CHART OF ACCOUNTS
SAME STYLE AS ACCOUNT PAYABLE
==========================================================
*/

showError(
    message
) {

    /*
    ==================================================
    NORMALIZE MESSAGE
    ==================================================
    */

    const errorMessage =
        message
        ||
        "An unexpected error occurred.";


    /*
    ==================================================
    REMOVE EXISTING ERROR ALERT
    ==================================================
    */

    const existingAlert =
        document.getElementById(
            "coa-bootstrap-error-alert"
        );


    if (
        existingAlert
    ) {

        existingAlert.remove();

    }


    /*
    ==================================================
    CREATE BOOTSTRAP ALERT
    ==================================================
    */

    const alertElement =
        document.createElement(
            "div"
        );


    alertElement.id =
        "coa-bootstrap-error-alert";


    alertElement.className = `
        alert
        alert-danger
        alert-dismissible
        fade
        show
        d-flex
        align-items-center
        shadow-sm
        mb-0
    `;


    alertElement.setAttribute(
        "role",
        "alert"
    );


    /*
    ==================================================
    ESCAPE MESSAGE
    ==================================================
    */

    const safeMessage =
        String(
            errorMessage
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


    /*
    ==================================================
    ALERT CONTENT
    ==================================================
    */

    alertElement.innerHTML = `

        <i
            class="
                fa-solid
                fa-circle-exclamation
                me-2
            ">
        </i>


        <div class="flex-grow-1">

            ${safeMessage}

        </div>


        <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close">
        </button>

    `;


    /*
    ==================================================
    CHECK COA MODAL
    ==================================================
    */

    const modal =
        document.getElementById(
            "coa-modal"
        );


    const modalIsVisible =
        modal
        &&
        modal.classList.contains(
            "show"
        );


    const modalBody =
        modalIsVisible
            ? modal.querySelector(
                ".modal-body"
            )
            : null;


    /*
    ==================================================
    SHOW INSIDE ACTIVE MODAL
    ==================================================
    */

    if (
        modalBody
    ) {

        modalBody.insertBefore(
            alertElement,
            modalBody.firstChild
        );

    }

    else {

        /*
        ==============================================
        PAGE LEVEL ALERT
        SAME CONCEPT AS ACCOUNT PAYABLE
        ==============================================
        */

        alertElement.style.position =
            "fixed";


        alertElement.style.top =
            "20px";


        alertElement.style.left =
            "50%";


        alertElement.style.transform =
            "translateX(-50%)";


        alertElement.style.zIndex =
            "99999";


        alertElement.style.width =
            "auto";


        alertElement.style.minWidth =
            "380px";


        alertElement.style.maxWidth =
            "90vw";


        document.body.appendChild(
            alertElement
        );

    }


    /*
    ==================================================
    AUTO CLOSE
    ==================================================
    */

    setTimeout(
        () => {

            const currentAlert =
                document.getElementById(
                    "coa-bootstrap-error-alert"
                );


            if (
                !currentAlert
            ) {

                return;

            }


            if (
                window.bootstrap
                &&
                bootstrap.Alert
            ) {

                bootstrap.Alert
                    .getOrCreateInstance(
                        currentAlert
                    )
                    .close();

            }

            else {

                currentAlert.remove();

            }

        },

        5000

    );

}


}
