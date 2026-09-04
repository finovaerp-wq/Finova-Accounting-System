/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Module : Business Partner
Version : 2.0.0
==========================================================
*/

import { BusinessPartnerService } from "../../service/business-partner.service.js";
import { BusinessPartnerBankService }
from "../../service/business-partner-bank.service.js";
import { TermOfPaymentService } from "../../service/term-of-payment.service.js";
import { ExcelExportService } from "../../service/excel-export.service.js";
import { PreviewService } from "../../service/preview.service.js";
import { BankGrid } from "./bank-grid.js";
export class BusinessPartner {
    

    constructor() {

    /* Bootstrap */

    this.modal = null;

    /* DOM */

    this.tableBody = null;
    this.form = null;

    /* Components */

    this.bankGrid = null;

    /* Data */

    this.data = [];
    this.filteredData = [];

    /* Pagination */

    this.currentPage = 1;
    this.pageSize = 10;

    /* Initialize */

    this.initialize();

}

    /*
==========================================================
INITIALIZE
==========================================================
*/

async initialize() {

    console.log("Business Partner Initialized");

    try {

        /* ==========================================
           LOAD MODAL
        ========================================== */

        await this.loadModal();

        /* ==========================================
           CACHE DOM
        ========================================== */

        this.cacheElement();

        /* ==========================================
           BOOTSTRAP MODAL
        ========================================== */

        this.modal = new bootstrap.Modal(
            this.modalElement
        );

        /* ==========================================
           COMPONENT
        ========================================== */

        this.bankGrid = new BankGrid();

        /* ==========================================
           EVENTS
        ========================================== */

        this.bindEvents();

        this.bindTableEvents();

        /* ==========================================
           MASTER DATA
        ========================================== */

        await this.loadTermOfPayment();

        /* ==========================================
           TABLE
        ========================================== */

        await this.loadData();

        console.log(
            "Business Partner Ready"
        );
        console.log("Initialize Finished");

    }

    catch (error) {

        console.error(
            "Business Partner Initialization Failed",
            error
        );

        this.showError(
            "Failed to initialize Business Partner Module."
        );

    }

}
    /*
    ==========================================================
    LOAD MODAL
    ==========================================================
    */

    async loadModal() {

    const oldModal =
        document.getElementById("businessPartnerModal");

    if (oldModal) {
        oldModal.remove();
    }

    const response = await fetch(
        `modules/business-partner/business-partner-modal.html?v=${Date.now()}`
    );

    const html = await response.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

}
/*
==========================================================
FORMAT NPWP
Format:
XX.XXX.XXX.X-XXX.XXX
==========================================================
*/

formatNPWP(value) {

    const digits =
        String(value || "")
            .replace(/\D/g, "")
            .slice(0, 15);

    let result = "";

    if (digits.length > 0) {
        result += digits.substring(0, 2);
    }

    if (digits.length > 2) {
        result += ".";
        result += digits.substring(2, 5);
    }

    if (digits.length > 5) {
        result += ".";
        result += digits.substring(5, 8);
    }

    if (digits.length > 8) {
        result += ".";
        result += digits.substring(8, 9);
    }

    if (digits.length > 9) {
        result += "-";
        result += digits.substring(9, 12);
    }

    if (digits.length > 12) {
        result += ".";
        result += digits.substring(12, 15);
    }

    return result;

}

    /*
==========================================================
CACHE ELEMENT
==========================================================
*/

cacheElement() {

    /* ==========================================
       TABLE
    ========================================== */

    this.tableBody =
        document.getElementById("business-partner-table");
    

    /* ==========================================
       FORM
    ========================================== */

    this.form =
    document.getElementById("businessPartnerForm");
    

    /* ==========================================
       MODAL
    ========================================== */

    this.modalElement =
        document.getElementById("businessPartnerModal");

    this.modalTitle =
        document.getElementById("businessPartnerModalTitle");

    /* ==========================================
       FORM CONTROLS
    ========================================== */

    this.bpId =
        document.getElementById("bp-id");

    this.bpName =
        document.getElementById("bp-name");

    this.bpType =
        document.getElementById("bp-type-form");

    this.bpTop =
        document.getElementById("bp-top-id");

    this.bpPhone =
        document.getElementById("bp-phone");

    this.bpEmail =
        document.getElementById("bp-email");

    this.bpAddress =
        document.getElementById("bp-address");

    this.bpCity =
        document.getElementById("bp-city");

    this.bpCountry =
        document.getElementById("bp-country");

    this.bpTaxNumber =
        document.getElementById("bp-tax-number");

    this.bpStatus =
        document.getElementById("bp-status-form");

    /* ==========================================
       SEARCH
    ========================================== */

    this.searchInput =
        document.getElementById("bp-search");

    this.typeFilter =
        document.getElementById("bp-type");

    this.statusFilter =
        document.getElementById("bp-status");

    /* ==========================================
       BUTTONS
    ========================================== */

    this.btnAdd =
        document.getElementById("btn-add");

    this.btnSave =
        document.getElementById("btn-save-business-partner");
    this.btnConfirmDelete =
    document.getElementById(
        "btn-confirm-bp-delete"
    );

    
    this.btnRefresh =
        document.getElementById("btn-refresh");

    this.btnExportExcel =
        document.getElementById("btn-export-excel");

    this.btnPreview =
        document.getElementById("btn-preview");

    /* ==========================================
       PAGINATION
    ========================================== */

    this.btnFirst =
    document.getElementById("pagination-first");

this.btnPrev =
    document.getElementById("pagination-prev");

this.btnNext =
    document.getElementById("pagination-next");

this.btnLast =
    document.getElementById("pagination-last");

this.btnPaginationRefresh =
    document.getElementById("pagination-refresh");

this.txtPage =
    document.getElementById("pagination-page-input");

this.lblTotalPages =
    document.getElementById("pagination-total-pages");

this.lblPaginationInfo =
    document.getElementById("pagination-info");

    /* ==========================================
       TOTAL RECORD
    ========================================== */

    this.totalRecord =
        document.getElementById(
            "bp-total-record"
        );

    /* ==========================================
       DEBUG
    ========================================== */

    console.log({

        tableBody: this.tableBody,

        form: this.form,

        modal: this.modalElement,

        btnAdd: this.btnAdd,

        btnSave: this.btnSave,

        searchInput: this.searchInput,

        pagination: this.pagination,

        paginationInfo: this.paginationInfo,

        totalRecord: this.totalRecord

    });

}
/*
==========================================================
EVENTS
==========================================================
*/

bindEvents() {

    /* ======================================================
       ADD
    ====================================================== */

    this.btnAdd?.addEventListener(
        "click",
        () => this.openAddModal()
    );

    /* ======================================================
       SAVE
    ====================================================== */

    this.btnSave?.addEventListener(
        "click",
        () => this.save()
    );
    /* ======================================================
   BUSINESS PARTNER NAME - AUTO UPPERCASE
====================================================== */

this.bpName?.addEventListener(
    "input",
    () => {

        this.bpName.value =
            this.bpName.value.toUpperCase();

    }
);
/*
==========================================================
BUSINESS PARTNER NAME CLICK
==========================================================
*/

document
    .querySelector("#bp-table-body")
    ?.addEventListener(
        "click",
        (event) => {

            const cell =
                event.target.closest(
                    ".bp-name-link"
                );

            if (!cell) return;

            const id =
                cell.dataset.id;

            if (!id) return;

            this.editBusinessPartner(id);

        }
    );
/*
==========================================================
NPWP AUTO FORMAT
==========================================================
*/

if (this.bpTaxNumber) {

    this.bpTaxNumber.addEventListener(
        "input",
        () => {

            this.bpTaxNumber.value =
                this.formatNPWP(
                    this.bpTaxNumber.value
                );

        }
    );

}
    
    
    /* ======================================================
    CONFIRM DELETE
    ====================================================== */

    this.btnConfirmDelete?.addEventListener(
        "click",
        async () => {

            await this.confirmDeleteBusinessPartner();

        }
    );

    /* ======================================================
       SEARCH
    ====================================================== */

    this.btnSearch?.addEventListener(
        "click",
        () => this.search()
    );

    /*
==========================================================
REALTIME SEARCH
==========================================================
*/

this.searchInput?.addEventListener(
    "input",
    () => {

        this.search();

    }
);

    /* ======================================================
       FILTER
    ====================================================== */

    this.typeFilter?.addEventListener(
        "change",
        () => this.search()
    );

    this.statusFilter?.addEventListener(
        "change",
        () => this.search()
    );

    /* ======================================================
       REFRESH
    ====================================================== */

    this.btnRefresh?.addEventListener(
        "click",
        () => this.refresh()
    );

    /* ======================================================
       EXPORT
    ====================================================== */

    this.btnExportExcel?.addEventListener(
        "click",
        () => this.exportExcel()
    );

    /* ======================================================
       PREVIEW
    ====================================================== */

    this.btnPreview?.addEventListener(
        "click",
        () => this.preview()
    );
    /*
==========================================================
PAGINATION
==========================================================
*/

this.btnFirst?.addEventListener("click", () => {

    this.currentPage = 1;

    this.renderTable();

});

this.btnPrev?.addEventListener("click", () => {

    if (this.currentPage > 1) {

        this.currentPage--;

        this.renderTable();

    }

});

this.btnNext?.addEventListener("click", () => {

    const totalPages = Math.ceil(

        this.filteredData.length /

        this.pageSize

    );

    if (this.currentPage < totalPages) {

        this.currentPage++;

        this.renderTable();

    }

});

this.btnLast?.addEventListener("click", () => {

    this.currentPage = Math.max(

        1,

        Math.ceil(

            this.filteredData.length /

            this.pageSize

        )

    );

    this.renderTable();

});

this.btnPaginationRefresh?.addEventListener(

    "click",

    () => this.refresh()

);

this.txtPage?.addEventListener(

    "change",

    () => {

        const totalPages = Math.max(

            1,

            Math.ceil(

                this.filteredData.length /

                this.pageSize

            )

        );

        let page = parseInt(

            this.txtPage.value,

            10

        );

        if (isNaN(page))

            page = 1;

        page = Math.min(

            Math.max(page, 1),

            totalPages

        );

        this.currentPage = page;

        this.renderTable();

    }

);

    
}
/*
==========================================================
PREVIEW BUSINESS PARTNER
NEW TAB
TAHOMA FONT
NO TOOLBAR
NO LOGO
LONG TEXT NO WRAP

FINAL :
- ADDRESS LAST COLUMN
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
        CURRENT FILTERED DATA
        ==================================================
        */

        const businessPartners =
            Array.isArray(
                this.filteredData
            )
                ? this.filteredData
                : [];


        /*
        ==================================================
        VALIDATE DATA
        ==================================================
        */

        if (
            businessPartners.length === 0
        ) {

            this.showError(
                "No Business Partner data available to preview."
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
            businessPartners
                .map(
                    (
                        item,
                        index
                    ) => {

                        /*
                        ======================================
                        TOP
                        ======================================
                        */

                        const topCode =
                            item
                                ?.mst_term_of_payment
                                ?.top_code
                            ||
                            "-";


                        /*
                        ======================================
                        STATUS
                        ======================================
                        */

                        const status =
                            item?.status
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
                                            item?.bp_code
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            item?.bp_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="center">

                                    ${
                                        escapeHTML(
                                            item?.bp_type
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="center">

                                    ${
                                        escapeHTML(
                                            topCode
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            item?.phone
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            item?.email
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            item?.tax_number
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            item?.city
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            item?.country
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


                                <td class="address">

                                    ${
                                        escapeHTML(
                                            item?.address
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
                    Business Partner - Preview
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

                    NATIVE HORIZONTAL SCROLLBAR HIDDEN
                    BECAUSE FIXED SCROLLBAR IS USED
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
                    HEADER
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
                    BODY
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
                            120px;

                    }


                    .col-name {

                        min-width:
                            240px;

                    }


                    .col-type {

                        min-width:
                            110px;

                    }


                    .col-top {

                        min-width:
                            110px;

                    }


                    .col-phone {

                        min-width:
                            140px;

                    }


                    .col-email {

                        min-width:
                            220px;

                    }


                    .col-tax {

                        min-width:
                            170px;

                    }


                    .col-city {

                        min-width:
                            140px;

                    }


                    .col-country {

                        min-width:
                            120px;

                    }


                    .col-status {

                        min-width:
                            90px;

                    }


                    /*
                    ==========================================
                    ADDRESS
                    LAST COLUMN + WIDE
                    ==========================================
                    */

                    .col-address {

                        min-width:
                            420px;

                    }


                    .address {

                        min-width:
                            420px;

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
                    ALWAYS AVAILABLE AT BOTTOM OF BROWSER
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

                            Business Partner

                        </div>


                        <div class="report-description">

                            Business Partner Master Data

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
                            id="bp-table-scroll"
                        >


                            <table
                                id="bp-preview-table"
                            >


                                <colgroup>

                                    <col class="col-no">

                                    <col class="col-code">

                                    <col class="col-name">

                                    <col class="col-type">

                                    <col class="col-top">

                                    <col class="col-phone">

                                    <col class="col-email">

                                    <col class="col-tax">

                                    <col class="col-city">

                                    <col class="col-country">

                                    <col class="col-status">

                                    <col class="col-address">

                                </colgroup>


                                <thead>

                                    <tr>

                                        <th>
                                            No
                                        </th>

                                        <th>
                                            Code
                                        </th>

                                        <th>
                                            Business Partner
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            TOP
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Tax Number
                                        </th>

                                        <th>
                                            City
                                        </th>

                                        <th>
                                            Country
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Address
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
                            ${businessPartners.length}

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
                    id="bp-fixed-scroll-container"
                >

                    <div
                        class="fixed-horizontal-scroll-inner"
                        id="bp-fixed-scroll"
                    >

                        <div
                            class="fixed-horizontal-scroll-content"
                            id="bp-fixed-scroll-content"
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
            "Business Partner - Preview";


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
                    "bp-table-scroll"
                );


            const table =
                doc.getElementById(
                    "bp-preview-table"
                );


            const fixedScrollContainer =
                doc.getElementById(
                    "bp-fixed-scroll-container"
                );


            const fixedScroll =
                doc.getElementById(
                    "bp-fixed-scroll"
                );


            const fixedScrollContent =
                doc.getElementById(
                    "bp-fixed-scroll-content"
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
                SHOW ONLY WHEN TABLE IS WIDER
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
            "BusinessPartner.preview:",
            error
        );


        this.showError(
            error?.message
            ||
            "Preview Business Partner failed."
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

        if (!this.filteredData.length) {

            this.showError("No data available to export.");

            return;

        }

        const data = this.filteredData.map(item => ({

            "Code": item.bp_code,

            "Name": item.bp_name,

            "Type": item.bp_type,
            
            "TOP Name": item.mst_term_of_payment?.top_name ?? "",

            "Phone": item.phone ?? "",

            "Email": item.email ?? "",

            "Address": item.address ?? "",

            "City": item.city ?? "",

            "Country": item.country ?? "",

            "Tax Number": item.tax_number ?? "",

            "Status": item.status ? "Active" : "Inactive"
            

        }));

        ExcelExportService.export(

            data,

            "Business Partner",

            "Business Partner"

        );

    }

    catch (error) {

        console.error(error);

        this.showError("Export Excel failed.");

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

        this.data = await BusinessPartnerService.getAll();

        this.filteredData = [...this.data];

        this.currentPage = 1;

        this.renderTable(this.filteredData);

    } catch (error) {

        console.error(error);

        this.showError(error.message);

    }

}
/*
==========================================================
LOAD TERM OF PAYMENT
==========================================================
*/

async loadTermOfPayment() {

    try {

        const list =
            await TermOfPaymentService.getAll();

        if (!this.bpTop) {

            console.warn(
                "bp-top-id element not found."
            );

            return;

        }

        this.bpTop.innerHTML = `
            <option value="">
                -- Select TOP --
            </option>
        `;

        list.forEach(item => {

            this.bpTop.innerHTML += `
                <option value="${item.id}">
                    ${item.top_code} - ${item.top_name}
                </option>
            `;

        });

    }

    catch (error) {

        console.error(error);

        this.showError(
            "Failed to load Term Of Payment."
        );

    }

}
   /*
==========================================================
RENDER TABLE
==========================================================
*/

renderTable(data) {

    if (!this.tableBody) {
        return;
    }

    /* ==========================================
       STORE FILTERED DATA
    ========================================== */

    this.filteredData = data ?? this.filteredData;

    /* ==========================================
       EMPTY STATE
    ========================================== */

    if (this.filteredData.length === 0) {

        this.renderEmptyState();

        
        this.updatePagination();

        return;

    }

    /* ==========================================
       PAGINATION
    ========================================== */

    const start =
        (this.currentPage - 1) * this.pageSize;

    const end =
        start + this.pageSize;

    const pageData =
        this.filteredData.slice(start, end);

    /* ==========================================
       RENDER ROWS
    ========================================== */

    this.tableBody.innerHTML = pageData
        .map((item, index) =>
            this.renderRow(
                item,
                start + index
            )
        )
        .join("");

    /* ==========================================
       UPDATE UI
    ========================================== */

    this.updatePagination();

}
/*
==========================================================
UPDATE PAGINATION
==========================================================
*/

updatePagination() {

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

    if (this.currentPage > totalPages) {

        this.currentPage = totalPages;

    }

    if (this.txtPage) {

        this.txtPage.value =
            this.currentPage;

        this.txtPage.max =
            totalPages;

    }

    if (this.lblTotalPages) {

        this.lblTotalPages.textContent =
            totalPages;

    }

    const start =
        totalRecords === 0
            ? 0
            : (this.currentPage - 1) *
              this.pageSize + 1;

    const end =
        Math.min(
            this.currentPage *
            this.pageSize,
            totalRecords
        );

    if (this.lblPaginationInfo) {

        this.lblPaginationInfo.textContent =
            `Displaying Record ${start} - ${end} of ${totalRecords}`;

    }

    if (this.btnFirst)
        this.btnFirst.disabled =
            this.currentPage === 1;

    if (this.btnPrev)
        this.btnPrev.disabled =
            this.currentPage === 1;

    if (this.btnNext)
        this.btnNext.disabled =
            this.currentPage >= totalPages;

    if (this.btnLast)
        this.btnLast.disabled =
            this.currentPage >= totalPages;

}
/*
==========================================================
RENDER PAGINATION
==========================================================
*/

renderPagination() {

    if (!this.pagination) {
        return;
    }

    const totalRows =
        this.filteredData.length;

    const totalPages =
        Math.ceil(totalRows / this.pageSize);

    let html = "";

    /* ==========================================
       PREVIOUS
    ========================================== */

    html += `

        <li class="page-item ${this.currentPage === 1 ? "disabled" : ""}">

            <button
                type="button"
                class="page-link btn-page-prev">

                Previous

            </button>

        </li>

    `;

    /* ==========================================
       PAGE NUMBER
    ========================================== */

    for (let i = 1; i <= totalPages; i++) {

        html += `

            <li class="page-item ${i === this.currentPage ? "active" : ""}">

                <button
                    type="button"
                    class="page-link btn-page-number"
                    data-page="${i}">

                    ${i}

                </button>

            </li>

        `;

    }

    /* ==========================================
       NEXT
    ========================================== */

    html += `

        <li class="page-item ${

            this.currentPage === totalPages ||

            totalPages === 0

                ? "disabled"

                : ""

        }">

            <button
                type="button"
                class="page-link btn-page-next">

                Next

            </button>

        </li>

    `;

    this.pagination.innerHTML = html;
    this.bindPaginationEvents();

}
/*
==========================================================
UPDATE PAGINATION INFO
==========================================================
*/

updatePaginationInfo() {

    if (!this.paginationInfo) {
        return;
    }

    const total =
        this.filteredData.length;

    if (total === 0) {

        this.paginationInfo.textContent =
            "Showing 0 of 0 records";

        if (this.totalRecord) {

            this.totalRecord.textContent = "0";

        }

        return;

    }

    const start =
        ((this.currentPage - 1) * this.pageSize) + 1;

    const end =
        Math.min(
            this.currentPage * this.pageSize,
            total
        );

    this.paginationInfo.textContent =
        `Showing ${start}-${end} of ${total} records`;

    if (this.totalRecord) {

        this.totalRecord.textContent = total;

    }

}
/*
==========================================================
PAGINATION EVENTS
==========================================================
*/

bindPaginationEvents() {

    if (!this.pagination) {
        return;
    }

    this.pagination.onclick = (event) => {

        /* ==========================================
           PAGE NUMBER
        ========================================== */

        const pageButton =
            event.target.closest(".btn-page-number");

        if (pageButton) {

            this.currentPage =
                Number(pageButton.dataset.page);

            this.renderTable(this.filteredData);

            return;

        }

        /* ==========================================
           PREVIOUS
        ========================================== */

        const previousButton =
            event.target.closest(".btn-page-prev");

        if (previousButton) {

            if (this.currentPage > 1) {

                this.currentPage--;

                this.renderTable(this.filteredData);

            }

            return;

        }

        /* ==========================================
           NEXT
        ========================================== */

        const nextButton =
            event.target.closest(".btn-page-next");

        if (nextButton) {

            const totalPages =
                Math.ceil(
                    this.filteredData.length /
                    this.pageSize
                );

            if (this.currentPage < totalPages) {

                this.currentPage++;

                this.renderTable(this.filteredData);

            }

        }

    };

}
    /*
==========================================================
RENDER EMPTY STATE
==========================================================
*/

renderEmptyState() {

    this.tableBody.innerHTML = `

        <tr>

            <td colspan="8">

                <div class="finova-empty">

                    <i class="fa-regular fa-folder-open"></i>

                    <h5>No Business Partner</h5>

                    <p>
                        Click Add Business Partner
                        to create your first data.
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

            <td colspan="100">

                <div class="text-center py-5">

                    <div
                        class="spinner-border text-primary mb-3"
                        role="status">

                    </div>

                    <div>

                        Loading Business Partner...

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

    // Tidak perlu isi apa pun.
    // renderTable() akan langsung mengganti isi tabel.

}
/*
==========================================================
RENDER ROW
==========================================================
*/

renderRow(item, index) {

    return `

        <tr>

           <td>${index + 1}</td>

<td>
    ${item.bp_code}
</td>

<td
    class="bp-name-link"
    data-id="${item.id}"
    style="cursor: pointer;"
>
    ${item.bp_name}
</td>

<td>${item.bp_type}</td>

            <td>${item.phone || "-"}</td>

            <td>
    ${
        item.email
            ? `
                <a
                    href="mailto:${item.email}"
                    class="text-primary text-decoration-none">
                    ${item.email}
                </a>
              `
            : "-"
    }
</td>
<td>
    ${item.tax_number || "-"}
</td>


            <td>

                ${
                    item.status
                        ? `
                            <span class="badge badge-success">
                                <i class="fa-solid fa-circle-check"></i>
                                Active
                            </span>
                        `
                        : `
                            <span class="badge badge-danger">
                                <i class="fa-solid fa-circle-xmark"></i>
                                Inactive
                            </span>
                        `
                }

            </td>

            <td>

                <div class="finova-action">

                    <button

                        class="btn-action btn-action-edit"

                        data-id="${item.id}"

                        title="Edit">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button

                        class="btn-action btn-action-delete"

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

openAddModal() {

    if (!this.form) return;

    this.form.reset();

    this.bpId.value = "";

    this.bpType.value = "Customer";

    this.bpTop.value = "";

    this.bpStatus.value = "true";

    this.bankGrid.clear();

    this.modalTitle.textContent =
        "Add Business Partner";

    this.modal.show();

}    /*
    ==========================================================
    OPEN EDIT MODAL
    ==========================================================
    */

    async openEditModal(id) {

    try {

        /*
        ==========================================
        LOAD BUSINESS PARTNER
        ==========================================
        */

        const item =
            await BusinessPartnerService.getById(id);

        /*
        ==========================================
        HIDDEN ID
        ==========================================
        */

       this.bpId.value =
    item.id;
        /*
        ==========================================
        BASIC INFORMATION
        ==========================================
        */

        this.bpName.value =
                item.bp_name ?? "";

        this.bpType.value =
                 item.bp_type ?? "Customer";

        this.bpTop.value =
                item.top_id ?? "";

        this.bpPhone.value =
                  item.phone ?? "";

        this.bpEmail.value =
                item.email ?? "";

        this.bpAddress.value =
    item.address ?? "";

        this.bpCity.value =
    item.city ?? "";

     this.bpCountry.value =
    item.country ?? "Indonesia";

        this.bpTaxNumber.value =
    item.tax_number ?? "";

        this.bpStatus.value =
    item.status ? "true" : "false";

        /*
        ==========================================
        LOAD BANK ACCOUNT
        ==========================================
        */

        this.bankGrid.clear();

        const banks =
            await BusinessPartnerBankService
                .getByBusinessPartner(id);

        banks.forEach(bank => {

            this.bankGrid.addRow(bank);

        });

        /*
        ==========================================
        MODAL TITLE
        ==========================================
        */

        this.modalTitle.textContent =
    "Edit Business Partner";

        /*
        ==========================================
        SHOW MODAL
        ==========================================
        */

        this.modal.show();

    }

    catch (error) {

        console.error(error);

        this.showError(
            "Failed to load Business Partner."
        );

    }

}
    /*
    ==========================================================
    SEARCH
    ==========================================================
    */

    async search() {

    const keyword =
        this.searchInput.value.trim();

    const type =
        this.typeFilter.value;

    const status =
        this.statusFilter.value;

    try {

       this.filteredData =
await BusinessPartnerService.search(
    keyword,
    type,
    status
);

this.currentPage = 1;

this.renderTable();

    }

    catch (error) {

        console.error(error);

        this.showError(
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

    this.searchInput.value = "";

    this.typeFilter.value = "";

    this.statusFilter.value = "";

    this.currentPage = 1;

    await this.loadData();

}

    collectFormData() {

    return {

        bp_name:
            this.bpName.value
                .trim()
                .toUpperCase(),

        bp_type:
            this.bpType.value,

        top_id:
            this.bpTop.value || null,

        phone:
            this.bpPhone.value
                .trim(),

        email:
            this.bpEmail.value
                .trim(),

        address:
            this.bpAddress.value
                .trim(),

        city:
            this.bpCity.value
                .trim(),

        country:
            "Indonesia",

        tax_number:
            this.bpTaxNumber.value
                .trim(),

        status:
            this.bpStatus.value === "true"

    };

}

    /*
==========================================================
VALIDATE
==========================================================
*/

validate() {

    /*
    ==========================================================
    BUSINESS PARTNER NAME
    ==========================================================
    */

    if (this.bpName.value.trim() === "") {

        this.showError(
            "Business Partner Name is required."
        );

        this.bpName.focus();

        return false;

    }
    /*
    ==========================================
    BANK VALIDATION
    ==========================================
    */

    if (this.bpType.value !== "Employee") {

        try {

            this.bankGrid.validate();

        }

        catch (error) {

            this.showError(error.message);

            return false;

        }

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

        const id = this.bpId.value;

        if (id === "") {

            await this.insert();

        }

        else {

            await this.update(id);

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

        /*
        ==========================================
        GENERATE BUSINESS PARTNER CODE
        ==========================================
        */

        payload.bp_code =
            await BusinessPartnerService.generateCode(
                payload.bp_type
            );

        /*
        ==========================================
        INSERT BUSINESS PARTNER
        ==========================================
        */

        const businessPartner =
            await BusinessPartnerService.insert(
                payload
            );

        /*
        ==========================================
        SAVE BANK ACCOUNT
        ==========================================
        */

        const banks =
            this.bankGrid.getData();

        await BusinessPartnerBankService.saveBanks(

            businessPartner.id,

            banks

        );

        /*
        ==========================================
        REFRESH
        ==========================================
        */

        this.closeModal();
        this.currentPage = 1;

        await this.loadData();

        this.showSuccess(

            "Business Partner successfully created."

        );

    }

    catch (error) {

        console.error(error);

        this.showError(

            error.message

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

        /*
        ==========================================
        LOAD CURRENT BUSINESS PARTNER
        ==========================================
        */

        const current =
            await BusinessPartnerService.getById(id);


        if (!current) {

            throw new Error(
                "Business Partner not found."
            );

        }


        /*
        ==========================================
        COLLECT FORM DATA
        ==========================================
        */

        const payload =
            this.collectFormData();


        /*
        ==========================================
        CHECK BUSINESS PARTNER TYPE
        ==========================================
        */

        const oldType =
            current.bp_type;

        const newType =
            payload.bp_type;


        /*
        ==========================================
        GENERATE NEW CODE
        ONLY WHEN TYPE CHANGES
        ==========================================
        */

        if (
            oldType !== newType
        ) {

            payload.bp_code =
                await BusinessPartnerService.generateCode(
                    newType
                );

        }


        /*
        ==========================================
        UPDATE BUSINESS PARTNER
        ==========================================
        */

        await BusinessPartnerService.update(
            id,
            payload
        );


        /*
        ==========================================
        UPDATE BANK ACCOUNT
        ==========================================
        */

        const banks =
            this.bankGrid.getData();


        await BusinessPartnerBankService.saveBanks(
            id,
            banks
        );


        /*
        ==========================================
        CLOSE MODAL
        ==========================================
        */

        this.closeModal();


        /*
        ==========================================
        RELOAD DATA
        ==========================================
        */

        await this.loadData();


        /*
        ==========================================
        SUCCESS
        ==========================================
        */

        this.showSuccess(

            oldType !== newType

                ? `Business Partner successfully updated. New code: ${payload.bp_code}`

                : "Business Partner successfully updated."

        );

    }

    catch (error) {

        console.error(error);

        this.showError(
            error.message
        );

    }

}
    /*
==========================================================
DELETE
==========================================================
*/

async delete(id) {

    try {

        /*
        ==============================================
        FIND BUSINESS PARTNER
        ==============================================
        */

        const businessPartner =
            this.data.find(
                item =>
                    String(item.id) === String(id)
            );


        if (!businessPartner) {

            console.error(
                "Business Partner not found:",
                id
            );

            this.showError(
                "Business Partner not found."
            );

            return;

        }


        /*
        ==============================================
        STORE DELETE ID
        ==============================================
        */

        this.deleteBusinessPartnerId = id;


        /*
        ==============================================
        FILL DELETE MODAL
        ==============================================
        */

        const deleteCode =
            document.getElementById(
                "bp-delete-code"
            );

        const deleteName =
            document.getElementById(
                "bp-delete-name"
            );

        const deleteType =
            document.getElementById(
                "bp-delete-type"
            );


        if (deleteCode) {

            deleteCode.textContent =
                businessPartner.bp_code || "-";

        }


        if (deleteName) {

            deleteName.textContent =
                businessPartner.bp_name || "-";

        }


        if (deleteType) {

            deleteType.textContent =
                businessPartner.bp_type || "-";

        }


        /*
        ==============================================
        GET DELETE MODAL
        ==============================================
        */

        const modalElement =
            document.getElementById(
                "bpDeleteModal"
            );


        if (!modalElement) {

            console.error(
                "BP Delete Modal not found."
            );

            return;

        }


        /*
        ==============================================
        BOOTSTRAP MODAL
        ==============================================
        */

        this.bpDeleteModal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        this.bpDeleteModal.show();

    }

    catch (error) {

        console.error(
            "Failed to open delete confirmation:",
            error
        );

        this.showError(
            error.message
        );

    }

}
/*
==========================================================
CONFIRM DELETE BUSINESS PARTNER
==========================================================
*/

async confirmDeleteBusinessPartner() {

    const id =
        this.deleteBusinessPartnerId;


    /*
    ==============================================
    VALIDATE ID
    ==============================================
    */

    if (!id) {

        console.error(
            "Business Partner delete ID is empty."
        );

        return;

    }


    try {

        /*
        ==============================================
        DELETE BUSINESS PARTNER
        ==============================================
        */

        await BusinessPartnerService.delete(
            id
        );


        /*
        ==============================================
        CLOSE DELETE MODAL
        ==============================================
        */

        if (this.bpDeleteModal) {

            this.bpDeleteModal.hide();

        }


        /*
        ==============================================
        RESET DELETE ID
        ==============================================
        */

        this.deleteBusinessPartnerId =
            null;


        /*
        ==============================================
        RESET PAGE
        ==============================================
        */

        this.currentPage = 1;


        /*
        ==============================================
        RELOAD DATA
        ==============================================
        */

        await this.loadData();


        /*
        ==============================================
        SUCCESS
        ==============================================
        */

        this.showSuccess(
            "Business Partner successfully deleted."
        );

    }

    catch (error) {

        console.error(
            "Failed to delete Business Partner:",
            error
        );

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

    this.modal.hide();

    this.form.reset();

    this.bpId.value = "";

}

    /*
==========================================================
SHOW SUCCESS
BOOTSTRAP ALERT
BUSINESS PARTNER
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
            "bp-bootstrap-success-alert"
        );


    if (
        existingAlert
    ) {

        existingAlert.remove();

    }


    /*
    ==================================================
    CREATE ALERT
    ==================================================
    */

    const alertElement =
        document.createElement(
            "div"
        );


    alertElement.id =
        "bp-bootstrap-success-alert";


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
    CHECK BUSINESS PARTNER MODAL
    ==================================================
    */

    const modal =
        document.getElementById(
            "businessPartnerModal"
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
    IF MODAL STILL OPEN
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
                    "bp-bootstrap-success-alert"
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
BUSINESS PARTNER
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
            "bp-bootstrap-error-alert"
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
        "bp-bootstrap-error-alert";


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
    CHECK BUSINESS PARTNER MODAL
    ==================================================
    */

    const modal =
        document.getElementById(
            "businessPartnerModal"
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
                    "bp-bootstrap-error-alert"
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
    EVENT DELEGATION
    ==========================================================
    */

    /*
==========================================================
TABLE EVENTS
==========================================================
*/

bindTableEvents() {

    if (!this.tableBody) {
        return;
    }

    this.tableBody.addEventListener(
        "click",
        async (event) => {

            /* ==========================================
               EDIT
            ========================================== */

            const editButton =
                event.target.closest(".btn-action-edit");

            if (editButton) {

                await this.openEditModal(
                    editButton.dataset.id
                );

                return;

            }

            /* ==========================================
               DELETE
            ========================================== */

            const deleteButton =
                event.target.closest(".btn-action-delete");

            if (deleteButton) {

                await this.delete(
                    deleteButton.dataset.id
                );

            }

        }
    );

}

}