/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : ACCOUNT PAYABLE
FILE    : account-payable.js
==========================================================
*/


/*
==========================================================
IMPORT
==========================================================
*/

import {
    CONFIG,
    supabase
} from "../../assets/js/core/supabase.js";

import {
    AccountPayableService
} from "../../service/account-payable.service.js";
import {
    GeneralJournalService
} from "../../service/journal.service.js";
import {
    TaxService
} from "../../service/tax-service.js";
import {
    ExcelExportService
} from "../../service/excel-export.service.js";


import {
    PreviewService
} from "../../service/preview.service.js";


/*
==========================================================
ACCOUNT PAYABLE
==========================================================
*/

export class AccountPayable {


    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor() {

         /*
        ==================================================
        DELETE STATE
        ==================================================
        */

        this.deleteInvoiceId = null;
        /*
        ==============================================
        SERVICE
        ==============================================
        */

        this.service =
            new AccountPayableService();
        window.apService =
        this.service;

        this.journalService =
        new GeneralJournalService();
        this.taxService =
    new TaxService();

this.taxPlusData = [];
this.taxMinusData = [];

        /*
        ==============================================
        DATA
        ==============================================
        */

        this.data = [];

        this.filteredData = [];
        this.invoiceDetails = [];
        this.currentCOA = [];
        this.currentInvoiceId = null;
        this.currentMode = "add";
        this.currentDetailId = null;
        
        this.pendingDeleteDetailId = null;


        /*
        ==============================================
        PAGINATION
        ==============================================
        */

        this.pageSize =
            CONFIG.PAGE_SIZE || 20;

        this.currentPage = 1;


        /*
        ==============================================
        DOM
        ==============================================
        */
        this.accountPayableModal = null;
        this.btnAddDetail = null;
        this.btnSaveAPDetail = null;
        this.accountPayableDetailModal = null;
        this.apDetailCOA = null;
        this.apDetailQuantity = null;
        this.btnSaveDraft = null;
       
        this.pendingPostId = null;
        this.pendingVoidId = null;
        this.apDetailUnitPrice = null;
        this.accountPayableCompleteModal = null;
        this.apDetailCOASelect = null;

        this.pendingCompleteAPId = null;
        this.currentPaymentAPId = null;

this.accountPayablePaymentModal = null;

this.apPaymentAPId = null;

this.apPaymentInvoiceNo = null;

this.apPaymentVendor = null;

this.apPaymentDate = null;

this.apPaymentBankAccount = null;

this.apPaymentDPP = null;

this.apPaymentTaxPlus = null;

this.apPaymentTaxMinus = null;

this.apPaymentAmount = null;

this.apPaymentReferenceNo = null;

this.apPaymentDescription = null;

this.btnSaveAPPayment = null;


        this.apDetailTaxInputRate = null;

        this.apDetailWithholdingTaxRate = null;

        this.apDetailLineAmount = null;

        this.apDetailTaxInputAmount = null;

        this.apDetailWithholdingTaxAmount = null;

        this.apDetailTotalAmount = null;

        this.modalLoaded = false;
        this.apFormVendor = null;
        this.apFormTop = null;

        this.apFormDateReceived = null;

        this.apFormDueDate = null;
        this.apFormJournalNo = null;

        this.vendorData = [];
        this.selectedVendor = null;
        this.selectedTopId = null;

        this.tableBody = null;

        this.dateFrom = null;

        this.dateTo = null;

        this.statusFilter = null;

        this.findBy = null;

        this.keyword = null;

        this.btnFind = null;

        this.btnAdd = null;

        this.btnRefresh = null;

        this.btnDownloadExcel = null;

        this.btnPreviewHTML = null;

        this.btnFirstPage = null;

        this.btnPrevPage = null;

        this.currentPageInput = null;

        this.totalPagesElement = null;

        this.btnNextPage = null;

        this.btnLastPage = null;

        this.recordInfo = null;

    }
    /*
======================================================
INITIALIZE SEARCHABLE DETAIL COA
======================================================
*/

initializeDetailCOASearch() {

    try {

        /*
        ==================================================
        CHECK DOM
        ==================================================
        */

        if (!this.apDetailCOA) {

            console.warn(
                "AP Detail COA element not found."
            );

            return;

        }


        /*
        ==================================================
        CHECK TOM SELECT
        ==================================================
        */

        if (
            typeof TomSelect
            ===
            "undefined"
        ) {

            console.error(
                "TomSelect library is not loaded."
            );

            return;

        }


        /*
        ==================================================
        DESTROY EXISTING INSTANCE
        ==================================================
        */

        if (
            this.apDetailCOASelect
        ) {

            this.apDetailCOASelect.destroy();

            this.apDetailCOASelect =
                null;

        }


        /*
        ==================================================
        INITIALIZE TOM SELECT
        ==================================================
        */

        this.apDetailCOASelect =
            new TomSelect(
                this.apDetailCOA,
                {

                    create:
                        false,

                    allowEmptyOption:
                        true,

                    placeholder:
                        "Select Chart of Account",

                    searchField: [
                        "text"
                    ],

                    maxOptions:
                        100,

                    closeAfterSelect:
                        true,

                    hideSelected:
                        false,

                    selectOnTab:
                        true,

                    /*
                    ======================================
                    CLEAR SEARCH AFTER SELECT
                    ======================================
                    */

                    onItemAdd() {

                        this.setTextboxValue(
                            ""
                        );

                    }

                }
            );


        /*
        ==================================================
        CLEAR INITIAL VALUE
        KEEP PLACEHOLDER ONLY
        ==================================================
        */

        this.apDetailCOASelect.clear(
            true
        );


        this.apDetailCOASelect.setTextboxValue(
            ""
        );


        console.log(
            "AP Searchable COA initialized."
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.initializeDetailCOASearch:",
            error
        );

    }

}
    /*
======================================================
LOAD ACCOUNT PAYABLE MODAL
======================================================
*/

async loadModalHTML() {

    /*
    ==================================================
    PREVENT DUPLICATE LOAD
    ==================================================
    */

    if (
        this.modalLoaded &&
        document.getElementById(
            "accountPayableModal"
        )
    ) {

        return;

    }


    try {

        /*
        ==================================================
        MODAL URL
        ==================================================
        */

        const modalURL =
            new URL(
                "./account-payable-modal.html",
                import.meta.url
            );


        /*
        ==================================================
        FETCH MODAL
        ==================================================
        */

        const response =
            await fetch(
                modalURL
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load Account Payable modal: ${response.status}`
            );

        }


        /*
        ==================================================
        GET HTML
        ==================================================
        */

        const html =
            await response.text();


        /*
        ==================================================
        INSERT MODAL
        ==================================================
        */

        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );


        /*
        ==================================================
        MARK AS LOADED
        ==================================================
        */

        this.modalLoaded = true;


        console.log(
            "Account Payable modal loaded."
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.loadModalHTML:",
            error
        );

        throw error;

    }

}
/*
======================================================
LOAD ACCOUNT PAYABLE PAYMENT MODAL
======================================================
*/

async loadPaymentModalHTML() {

    try {

        /*
        ==================================================
        PREVENT DUPLICATE
        ==================================================
        */

        const existing =
            document.getElementById(
                "accountPayablePaymentModal"
            );


        if (existing) {

            return;

        }


        /*
        ==================================================
        URL
        ==================================================
        */

        const modalURL =
            new URL(
                "./account-payable-payment-modal.html",
                import.meta.url
            );


        /*
        ==================================================
        FETCH
        ==================================================
        */

        const response =
            await fetch(
                modalURL
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load AP Payment Modal: ${response.status}`
            );

        }


        /*
        ==================================================
        HTML
        ==================================================
        */

        const html =
            await response.text();


        /*
        ==================================================
        INSERT
        ==================================================
        */

        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );


        console.log(
            "Account Payable Payment Modal loaded."
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.loadPaymentModalHTML:",
            error
        );


        throw error;

    }

}
/*
======================================================
LOAD TAX MASTER
======================================================
*/

async loadTaxMaster() {

    try {

        const [
            plusTaxes,
            minusTaxes
        ] = await Promise.all([

            this.taxService.getByType("PLUS"),

            this.taxService.getByType("MINUS")

        ]);


        this.taxPlusData =
            Array.isArray(plusTaxes)
                ? plusTaxes
                : [];


        this.taxMinusData =
            Array.isArray(minusTaxes)
                ? minusTaxes
                : [];


        this.renderTaxMasterOptions();


        console.log(
            "AP TAX PLUS:",
            this.taxPlusData
        );

        console.log(
            "AP TAX MINUS:",
            this.taxMinusData
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.loadTaxMaster:",
            error
        );

        this.taxPlusData = [];
        this.taxMinusData = [];

        this.renderTaxMasterOptions();

    }

}


/*
======================================================
RENDER TAX MASTER OPTIONS
======================================================
*/

renderTaxMasterOptions() {

    /*
    ==================================================
    TAX (+)
    ==================================================
    */

    if (this.apDetailTaxInputRate) {

        this.apDetailTaxInputRate.innerHTML = `
            <option value="">
                No Tax
            </option>
        `;


        this.taxPlusData.forEach(
            tax => {

                const option =
                    document.createElement(
                        "option"
                    );


                /*
                ==========================================
                TAX MASTER ID
                ==========================================
                */

                option.value =
                    tax.id;


                /*
                ==========================================
                TAX RATE
                ==========================================
                */

                option.dataset.rate =
                    Number(
                        tax.tax_rate
                        || 0
                    );


                /*
                ==========================================
                TAX CODE
                INTERNAL ONLY
                ==========================================
                */

                option.dataset.taxCode =
                    tax.tax_code
                    || "";


                /*
                ==========================================
                TAX NAME
                ==========================================
                */

                option.dataset.taxName =
                    tax.tax_name
                    || "";


                /*
                ==========================================
                TAX ACCOUNT
                ==========================================
                */

                option.dataset.accountId =
                    tax.tax_account_id
                    || "";


                /*
                ==========================================
                OFFSET ACCOUNT
                ==========================================
                */

                option.dataset.offsetAccountId =
                    tax.offset_account_id
                    || "";


                /*
                ==========================================
                DISPLAY
                ONLY TAX NAME
                ==========================================
                */

                option.textContent =
                    tax.tax_name
                    || "";


                this.apDetailTaxInputRate
                    .appendChild(
                        option
                    );

            }
        );

    }


    /*
    ==================================================
    TAX (-)
    ==================================================
    */

    if (
        this.apDetailWithholdingTaxRate
    ) {

        this.apDetailWithholdingTaxRate.innerHTML = `
            <option value="">
                No Tax
            </option>
        `;


        this.taxMinusData.forEach(
            tax => {

                const option =
                    document.createElement(
                        "option"
                    );


                /*
                ==========================================
                TAX MASTER ID
                ==========================================
                */

                option.value =
                    tax.id;


                /*
                ==========================================
                TAX RATE
                ==========================================
                */

                option.dataset.rate =
                    Number(
                        tax.tax_rate
                        || 0
                    );


                /*
                ==========================================
                TAX CODE
                INTERNAL ONLY
                ==========================================
                */

                option.dataset.taxCode =
                    tax.tax_code
                    || "";


                /*
                ==========================================
                TAX NAME
                ==========================================
                */

                option.dataset.taxName =
                    tax.tax_name
                    || "";


                /*
                ==========================================
                TAX ACCOUNT
                ==========================================
                */

                option.dataset.accountId =
                    tax.tax_account_id
                    || "";


                /*
                ==========================================
                OFFSET ACCOUNT
                ==========================================
                */

                option.dataset.offsetAccountId =
                    tax.offset_account_id
                    || "";


                /*
                ==========================================
                DISPLAY
                ONLY TAX NAME
                ==========================================
                */

                option.textContent =
                    tax.tax_name
                    || "";


                this.apDetailWithholdingTaxRate
                    .appendChild(
                        option
                    );

            }
        );

    }

}
/*
======================================================
INIT
======================================================
*/

async init() {

    try {

        console.log(
            "AccountPayable: INIT START"
        );


        /*
        ==============================================
        LOAD MAIN AP MODAL
        ==============================================
        */

        await this.loadModalHTML();

        await this.loadPaymentModalHTML();


        /*
        ==============================================
        LOAD AP DETAIL MODAL
        ==============================================
        */

        await this.loadDetailModalHTML();

        await this.loadCompleteModalHTML();


        /*
        ==============================================
        CACHE DOM
        ==============================================
        */

        this.cacheDOM();


        /*
        ==============================================
        LOAD TAX MASTER
        ==============================================
        */

        await this.loadTaxMaster();


        /*
        ==============================================
        LOAD VENDORS
        ==============================================
        */

        try {

            await this.loadVendors();

        }

        catch (error) {

            console.error(
                "AccountPayable - loadVendors:",
                error
            );

        }


        /*
        ==============================================
        BIND MAIN EVENTS
        ==============================================
        */

        this.bindEvents();


        /*
        ==============================================
        BIND REPORT EVENTS
        DOWNLOAD EXCEL / PREVIEW HTML
        ==============================================
        */

        this.bindReportEvents();


        /*
        ==============================================
        LOAD ACCOUNT PAYABLE
        INITIAL LOADING
        ==============================================
        */

        await this.loadData(
            true
        );


        console.log(
            "AccountPayable: INIT COMPLETE"
        );

    }

    catch (error) {

        console.error(
            "AccountPayable - INIT ERROR:",
            error
        );


        this.showError(
            "Failed to initialize Account Payable."
        );

    }


    /*
    ======================================================
    CONFIRM POSTING BUTTON
    ======================================================
    */

    const confirmPostButton =
        document.getElementById(
            "ap-confirm-post-btn"
        );


    if (
        confirmPostButton
    ) {

        confirmPostButton.addEventListener(
            "click",
            async () => {

                try {

                    const id =
                        this.pendingPostId;


                    if (
                        !id
                    ) {

                        throw new Error(
                            "Account Payable ID for posting is missing."
                        );

                    }


                    /*
                    ==========================================
                    CLOSE MODAL
                    ==========================================
                    */

                    const modalElement =
                        document.getElementById(
                            "ap-post-confirm-modal"
                        );


                    const modal =
                        bootstrap.Modal.getInstance(
                            modalElement
                        );


                    if (
                        modal
                    ) {

                        modal.hide();

                    }


                    /*
                    ==========================================
                    GET ACCOUNT PAYABLE
                    ==========================================
                    */

                    const result =
                        await this.service.getById(
                            id
                        );


                    if (
                        !result
                    ) {

                        throw new Error(
                            "Account Payable not found."
                        );

                    }


                    const invoice =
                        result.header;


                    const details =
                        Array.isArray(
                            result.details
                        )
                            ? result.details
                            : [];


                    /*
                    ==========================================
                    CHECK / GENERATE GL JOURNAL
                    ==========================================
                    */

                    let journalId =
                        invoice.gl_journal_id;


                    if (
                        !journalId
                    ) {

                        const journal =
                            await this.generateAPJournal(
                                invoice,
                                details
                            );


                        if (
                            !journal
                        ) {

                            throw new Error(
                                "Failed to generate GL Journal."
                            );

                        }


                        journalId =
                            journal.id;


                        await this.service.linkGLJournal(
                            id,
                            journalId
                        );

                    }


                    /*
                    ==========================================
                    COMPLETE ACCOUNT PAYABLE
                    ==========================================
                    */

                    await this.service.completeInvoice(
                        id
                    );


                    /*
                    ==========================================
                    GENERATE GL JOURNAL
                    ==========================================
                    */

                    const journal =
                        await this.generateAPJournal(
                            invoice,
                            details
                        );


                    if (
                        !journal
                    ) {

                        throw new Error(
                            "Failed to generate GL Journal."
                        );

                    }


                    /*
                    ==========================================
                    LINK GL JOURNAL
                    ==========================================
                    */

                    await this.service.linkGLJournal(
                        id,
                        journal.id
                    );


                    /*
                    ==========================================
                    POST ACCOUNT PAYABLE
                    ==========================================
                    */

                    await this.service.postInvoice(
                        id
                    );


                    /*
                    ==========================================
                    CLEAR STATE
                    ==========================================
                    */

                    this.pendingPostId =
                        null;


                    /*
                    ==========================================
                    RELOAD
                    NO LOADING
                    ==========================================
                    */

                    await this.loadData(
                        false
                    );


                    /*
                    ==========================================
                    SUCCESS
                    ==========================================
                    */

                    this.showSuccess(
                        "Account Payable successfully posted."
                    );

                }

                catch (error) {

                    console.error(
                        "AccountPayable.confirmPost:",
                        error
                    );


                    this.showError(
                        error.message
                        ||
                        "Failed to post Account Payable."
                    );

                }

            }
        );

    }


    /*
    ======================================================
    CONFIRM VOID BUTTON
    ======================================================
    */

    const confirmVoidButton =
        document.getElementById(
            "ap-confirm-void-btn"
        );


    if (
        confirmVoidButton
    ) {

        confirmVoidButton.addEventListener(
            "click",
            async () => {

                try {

                    const id =
                        this.pendingVoidId;


                    if (
                        !id
                    ) {

                        throw new Error(
                            "Account Payable ID for Void is missing."
                        );

                    }


                    /*
                    ==========================================
                    GET VOID REASON
                    ==========================================
                    */

                    const reasonElement =
                        document.getElementById(
                            "ap-void-reason"
                        );


                    const reason =
                        reasonElement
                            ?.value
                            ?.trim();


                    if (
                        !reason
                    ) {

                        reasonElement?.focus();


                        this.showError(
                            "Void reason is required."
                        );


                        return;

                    }


                    /*
                    ==========================================
                    CLOSE MODAL
                    ==========================================
                    */

                    const modalElement =
                        document.getElementById(
                            "ap-void-confirm-modal"
                        );


                    const modal =
                        bootstrap.Modal.getInstance(
                            modalElement
                        );


                    if (
                        modal
                    ) {

                        modal.hide();

                    }


                    /*
                    ==========================================
                    EXECUTE VOID
                    ==========================================
                    */

                    await this.service.voidInvoice(
                        id,
                        reason
                    );


                    /*
                    ==========================================
                    CLEAR STATE
                    ==========================================
                    */

                    this.pendingVoidId =
                        null;


                    /*
                    ==========================================
                    RELOAD DATA
                    NO LOADING
                    ==========================================
                    */

                    await this.loadData(
                        false
                    );


                    /*
                    ==========================================
                    SUCCESS
                    ==========================================
                    */

                    this.showSuccess(
                        "Account Payable successfully voided."
                    );

                }

                catch (error) {

                    console.error(
                        "AccountPayable.confirmVoid:",
                        error
                    );


                    this.showError(
                        error.message
                        ||
                        "Failed to void Account Payable."
                    );

                }

            }
        );

    }

}
/*
======================================================
BIND REPORT EVENTS
DOWNLOAD EXCEL
PREVIEW HTML
======================================================
*/

bindReportEvents() {

    /*
    ==================================================
    DOWNLOAD EXCEL
    ==================================================
    */

    this.btnDownloadExcel?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            this.downloadExcel();

        }
    );


    /*
    ==================================================
    PREVIEW HTML
    OPEN NEW BROWSER TAB
    ==================================================
    */

    this.btnPreviewHTML?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            this.previewHTML();

        }
    );

}
/*
======================================================
DOWNLOAD ACCOUNT PAYABLE EXCEL
======================================================
*/

downloadExcel() {

    try {

        /*
        ==================================================
        GET CURRENT FILTERED DATA
        ==================================================
        */

        const invoices =
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
            invoices.length === 0
        ) {

            this.showError(
                "No Account Payable data available to export."
            );

            return;

        }


        /*
        ==================================================
        PREPARE EXCEL DATA
        ==================================================
        */

        const data =
            invoices.map(
                (
                    invoice,
                    index
                ) => {

                    const vendor =
                        invoice?.mst_business_partner
                        || {};


                    const journal =
                        invoice?.trx_gl_journal
                        || {};


                    const totalAmount =
                        Number(
                            invoice?.total_amount
                            || 0
                        );


                    const paidAmount =
                        Number(
                            invoice?.paid_amount
                            || 0
                        );


                    const outstandingAmount =
                        Number(
                            invoice?.outstanding_amount
                            ??
                            totalAmount
                        );


                    const journalStatus =
                        String(
                            journal?.status
                            || ""
                        )
                        .trim();


                    const paymentStatus =
                        this.getPaymentStatus(
                            invoice
                        );


                    return {

                        "No":
                            index + 1,

                        "Invoice No":
                            invoice?.invoice_no
                            || "",

                        "PO No":
                            invoice?.po_no
                            || "",

                        "Vendor":
                            vendor?.bp_name
                            || "",

                        "Invoice Date":
                            invoice?.invoice_date
                            || "",

                        "Received Date":
                            invoice?.date_received
                            || "",

                        "Due Date":
                            invoice?.due_date
                            || "",

                        "Description":
                            invoice?.description
                            || "",

                        "Total":
                            totalAmount,

                        "Paid":
                            paidAmount,

                        "Outstanding":
                            outstandingAmount,

                        "Payment Status":
                            paymentStatus,

                        "AP Status":
                            invoice?.status
                            || "",

                        "Journal No":
                            journal?.journal_no
                            ||
                            invoice?.journal_no
                            ||
                            "",

                        "Journal Status":
                            journalStatus
                            || "Not Posted"

                    };

                }
            );


        /*
        ==================================================
        EXPORT
        ==================================================
        */

        ExcelExportService.export(

            data,

            "Account Payable",

            "Account Payable"

        );

    }

    catch (error) {

        console.error(
            "AccountPayable.downloadExcel:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to download Account Payable Excel."
        );

    }

}
/*
======================================================
PREVIEW ACCOUNT PAYABLE HTML
NEW TAB
TAHOMA FONT
NO TOOLBAR
NO LOGO
DESCRIPTION LAST COLUMN
LONG TEXT NO WRAP

FINAL :
- FIXED HORIZONTAL SCROLLBAR
- ALWAYS AVAILABLE AT BOTTOM OF BROWSER
- SYNCHRONIZED WITH TABLE
======================================================
*/

previewHTML() {

    try {

        /*
        ==================================================
        CURRENT FILTERED DATA
        ==================================================
        */

        const invoices =
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
            invoices.length === 0
        ) {

            this.showError(
                "No Account Payable data available to preview."
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
        TABLE ROWS
        ==================================================
        */

        const rows =
            invoices
                .map(
                    (
                        invoice,
                        index
                    ) => {

                        /*
                        ======================================
                        VENDOR
                        ======================================
                        */

                        const vendor =
                            invoice
                                ?.mst_business_partner
                            ||
                            {};


                        /*
                        ======================================
                        JOURNAL
                        ======================================
                        */

                        const journal =
                            invoice
                                ?.trx_gl_journal
                            ||
                            {};


                        /*
                        ======================================
                        AMOUNT
                        ======================================
                        */

                        const totalAmount =
                            Number(
                                invoice?.total_amount
                                ||
                                0
                            );


                        const paidAmount =
                            Number(
                                invoice?.paid_amount
                                ||
                                0
                            );


                        const outstandingAmount =
                            Number(
                                invoice?.outstanding_amount
                                ??
                                totalAmount
                            );


                        /*
                        ======================================
                        PAYMENT STATUS
                        ======================================
                        */

                        const paymentStatus =
                            this.getPaymentStatus(
                                invoice
                            );


                        /*
                        ======================================
                        JOURNAL NO
                        ======================================
                        */

                        const journalNo =
                            journal?.journal_no
                            ||
                            invoice?.journal_no
                            ||
                            "-";


                        /*
                        ======================================
                        PO NO
                        ======================================
                        */

                        const poNo =
                            invoice?.po_no
                            ||
                            "-";


                        /*
                        ======================================
                        DESCRIPTION
                        ======================================
                        */

                        const description =
                            invoice?.description
                            ||
                            "-";


                        /*
                        ======================================
                        RETURN ROW
                        ======================================
                        */

                        return `

                            <tr>


                                <!-- NO -->

                                <td class="center">

                                    ${index + 1}

                                </td>


                                <!-- INVOICE NO -->

                                <td>

                                    ${
                                        escapeHTML(
                                            invoice?.invoice_no
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- PO NO -->

                                <td>

                                    ${
                                        escapeHTML(
                                            poNo
                                        )
                                    }

                                </td>


                                <!-- VENDOR -->

                                <td>

                                    ${
                                        escapeHTML(
                                            vendor?.bp_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- INVOICE DATE -->

                                <td class="center">

                                    ${
                                        escapeHTML(
                                            invoice?.invoice_date
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- DUE DATE -->

                                <td class="center">

                                    ${
                                        escapeHTML(
                                            invoice?.due_date
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- TOTAL -->

                                <td class="amount">

                                    ${
                                        this.formatCurrency(
                                            totalAmount
                                        )
                                    }

                                </td>


                                <!-- PAID -->

                                <td class="amount">

                                    ${
                                        this.formatCurrency(
                                            paidAmount
                                        )
                                    }

                                </td>


                                <!-- OUTSTANDING -->

                                <td class="amount">

                                    ${
                                        this.formatCurrency(
                                            outstandingAmount
                                        )
                                    }

                                </td>


                                <!-- STATUS -->

                                <td class="center">

                                    ${
                                        escapeHTML(
                                            paymentStatus
                                        )
                                    }

                                </td>


                                <!-- JOURNAL -->

                                <td>

                                    ${
                                        escapeHTML(
                                            journalNo
                                        )
                                    }

                                </td>


                                <!-- DESCRIPTION -->

                                <td class="description">

                                    ${
                                        escapeHTML(
                                            description
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
                    Account Payable - Preview
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

                        margin:
                            0;

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
                    ORIGINAL SCROLLBAR HIDDEN
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


                    .amount {

                        text-align:
                            right;

                        white-space:
                            nowrap;

                    }


                    /*
                    ==========================================
                    DESCRIPTION
                    LAST + WIDE
                    ==========================================
                    */

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
                    COLUMN WIDTH
                    ==========================================
                    */

                    .col-no {

                        width:
                            45px;

                        min-width:
                            45px;

                    }


                    .col-invoice {

                        min-width:
                            145px;

                    }


                    .col-po {

                        min-width:
                            160px;

                    }


                    .col-vendor {

                        min-width:
                            220px;

                    }


                    .col-date {

                        min-width:
                            105px;

                    }


                    .col-amount {

                        min-width:
                            120px;

                    }


                    .col-status {

                        min-width:
                            100px;

                    }


                    .col-journal {

                        min-width:
                            155px;

                    }


                    .col-description {

                        min-width:
                            420px;

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
                    FAKE CONTENT WIDTH
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
                    CHROME / EDGE
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

                            Account Payable

                        </div>


                        <div class="report-description">

                            Account Payable Transaction Report

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
                            id="ap-table-scroll"
                        >


                            <table
                                id="ap-preview-table"
                            >


                                <colgroup>

                                    <col class="col-no">

                                    <col class="col-invoice">

                                    <col class="col-po">

                                    <col class="col-vendor">

                                    <col class="col-date">

                                    <col class="col-date">

                                    <col class="col-amount">

                                    <col class="col-amount">

                                    <col class="col-amount">

                                    <col class="col-status">

                                    <col class="col-journal">

                                    <col class="col-description">

                                </colgroup>


                                <thead>

                                    <tr>

                                        <th>
                                            No
                                        </th>

                                        <th>
                                            Invoice No
                                        </th>

                                        <th>
                                            PO No
                                        </th>

                                        <th>
                                            Vendor
                                        </th>

                                        <th>
                                            Invoice Date
                                        </th>

                                        <th>
                                            Due Date
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                        <th>
                                            Paid
                                        </th>

                                        <th>
                                            Outstanding
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Journal
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
                            ${invoices.length}

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
                    id="ap-fixed-scroll-container"
                >

                    <div
                        class="fixed-horizontal-scroll-inner"
                        id="ap-fixed-scroll"
                    >

                        <div
                            class="fixed-horizontal-scroll-content"
                            id="ap-fixed-scroll-content"
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
            "Account Payable - Preview";


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
                    "ap-table-scroll"
                );


            const table =
                doc.getElementById(
                    "ap-preview-table"
                );


            const fixedScrollContainer =
                doc.getElementById(
                    "ap-fixed-scroll-container"
                );


            const fixedScroll =
                doc.getElementById(
                    "ap-fixed-scroll"
                );


            const fixedScrollContent =
                doc.getElementById(
                    "ap-fixed-scroll-content"
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
                SHOW ONLY WHEN NEEDED
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
            "AccountPayable.previewHTML:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to preview Account Payable."
        );

    }

}
/*
======================================================
LOAD COMPLETE ACCOUNT PAYABLE MODAL HTML
======================================================
*/

async loadCompleteModalHTML() {

    try {

        const existingModal =
            document.getElementById(
                "accountPayableCompleteModal"
            );


        if (existingModal) {

            this.accountPayableCompleteModal =
                existingModal;

            return;

        }


        const response =
            await fetch(
                new URL(
                    "./account-payable-complete-modal.html",
                    import.meta.url
                )
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load Account Payable Complete Modal: ${response.status}`
            );

        }


        const html =
            await response.text();


        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );


        this.accountPayableCompleteModal =
            document.getElementById(
                "accountPayableCompleteModal"
            );


        if (
            !this.accountPayableCompleteModal
        ) {

            throw new Error(
                "Account Payable Complete Modal not found."
            );

        }


        console.log(
            "Account Payable Complete Modal loaded."
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.loadCompleteModalHTML:",
            error
        );

        throw error;

    }

}
/*
======================================================
GENERATE GL JOURNAL FROM ACCOUNT PAYABLE
======================================================
*/

async generateAPJournal(
    invoice,
    details
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!invoice) {

            throw new Error(
                "Account Payable header is required."
            );

        }


        if (
            !Array.isArray(details)
            ||
            !details.length
        ) {

            throw new Error(
                "Account Payable detail cannot be empty."
            );

        }


        /*
        ==================================================
        ACCOUNT PAYABLE
        HUTANG USAHA
        ==================================================
        */

        const payableAccountId =
            39;


        if (!payableAccountId) {

            throw new Error(
                "Account Payable account is not configured."
            );

        }


        /*
        ==================================================
        BUSINESS PARTNER
        ==================================================
        */

        const businessPartnerId =
            invoice.vendor_id
                ? Number(
                    invoice.vendor_id
                )
                : null;


        /*
        ==================================================
        IMPORTANT
        FORCE RELOAD TAX MASTER FROM DATABASE

        DO NOT RELY ON OLD CACHE
        ==================================================
        */

        await this.loadTaxMaster();


        /*
        ==================================================
        DEBUG TAX MASTER
        ==================================================
        */

        console.log(
            "AP JOURNAL TAX PLUS MASTER:",
            JSON.stringify(
                this.taxPlusData,
                null,
                2
            )
        );


        console.log(
            "AP JOURNAL TAX MINUS MASTER:",
            JSON.stringify(
                this.taxMinusData,
                null,
                2
            )
        );


        /*
        ==================================================
        JOURNAL DETAILS
        ==================================================
        */

        const journalDetails =
            [];


        /*
        ==================================================
        LOOP AP DETAILS
        ==================================================
        */

        for (
            const detail
            of details
        ) {

            /*
            ==============================================
            DEBUG CURRENT DETAIL
            ==============================================
            */

            console.log(
                "AP JOURNAL CURRENT DETAIL:",
                JSON.stringify(
                    detail,
                    null,
                    2
                )
            );


            /*
            ==============================================
            BASE TRANSACTION
            ==============================================
            */

            const chargeAccountId =
                Number(
                    detail.charge_account_id
                    || 0
                );


            const lineAmount =
                Number(
                    detail.line_amount
                    || 0
                );


            if (!chargeAccountId) {

                throw new Error(
                    `Debit Account is missing on AP detail: ${
                        detail.description
                        || ""
                    }`
                );

            }


            /*
            ==============================================
            BASE JOURNAL

            DR CHARGE ACCOUNT
            CR HUTANG USAHA
            ==============================================
            */

            if (
                lineAmount > 0
            ) {

                journalDetails.push({

                    debit_account_id:
                        chargeAccountId,

                    credit_account_id:
                        payableAccountId,

                    business_partner_id:
                        businessPartnerId,

                    description:
                        detail.description
                        ||
                        invoice.invoice_no
                        ||
                        "AP Invoice",

                    amount:
                        lineAmount

                });

            }


            /*
            ==================================================
            TAX (+)
            ==================================================
            */

            const taxPlusAmount =
                Number(
                    detail.tax_input_amount
                    || 0
                );


            const taxPlusRate =
                Number(
                    detail.tax_input_rate
                    || 0
                );


            let taxPlusId =
                detail.tax_plus_id
                || null;


            let taxPlusAccountId =
                Number(
                    detail.tax_plus_account_id
                    || 0
                );


            let taxPlusName =
                detail.tax_plus_name
                || "Tax (+)";


            /*
            ==============================================
            TAX (+)
            FIND MASTER BY TAX ID
            ==============================================
            */

            let taxPlusMaster =
                null;


            if (
                taxPlusId
            ) {

                taxPlusMaster =
                    this.taxPlusData.find(
                        tax =>
                            String(tax.id)
                            ===
                            String(taxPlusId)
                    )
                    || null;

            }


            /*
            ==============================================
            TAX (+)
            FALLBACK BY RATE

            OLD AP DATA SUPPORT
            ==============================================
            */

            if (
                !taxPlusMaster
                &&
                taxPlusRate > 0
            ) {

                taxPlusMaster =
                    this.taxPlusData.find(
                        tax =>
                            Number(
                                tax.tax_rate
                                || 0
                            )
                            ===
                            taxPlusRate
                    )
                    || null;

            }


            /*
            ==============================================
            TAX (+)
            USE TAX MASTER
            ==============================================
            */

            if (
                taxPlusMaster
            ) {

                taxPlusId =
                    taxPlusMaster.id
                    || taxPlusId;


                /*
                ==========================================
                IMPORTANT

                TAX MASTER IS SOURCE OF TRUTH
                ==========================================
                */

                taxPlusAccountId =
                    Number(
                        taxPlusMaster.tax_account_id
                        ||
                        taxPlusAccountId
                        ||
                        0
                    );


                taxPlusName =
                    taxPlusMaster.tax_name
                    ||
                    taxPlusName;

            }


            /*
            ==============================================
            TAX (+)
            LAST FALLBACK DIRECT DATABASE BY ID
            ==============================================
            */

            if (
                taxPlusAmount > 0
                &&
                !taxPlusAccountId
                &&
                taxPlusId
            ) {

                const freshTax =
                    await this.taxService.getById(
                        taxPlusId
                    );


                if (freshTax) {

                    taxPlusAccountId =
                        Number(
                            freshTax.tax_account_id
                            || 0
                        );


                    taxPlusName =
                        freshTax.tax_name
                        || taxPlusName;

                }

            }


            /*
            ==============================================
            TAX (+)
            DEBUG FINAL RESOLUTION
            ==============================================
            */

            console.log(
                "AP TAX (+) FINAL RESOLUTION:",
                {

                    detail_tax_plus_id:
                        detail.tax_plus_id,

                    resolved_tax_plus_id:
                        taxPlusId,

                    rate:
                        taxPlusRate,

                    amount:
                        taxPlusAmount,

                    account_id:
                        taxPlusAccountId,

                    tax_name:
                        taxPlusName,

                    master:
                        taxPlusMaster

                }
            );


            /*
            ==============================================
            TAX (+)
            VALIDATION
            ==============================================
            */

            if (
                taxPlusAmount > 0
                &&
                !taxPlusAccountId
            ) {

                console.error(
                    "AP TAX (+) ACCOUNT RESOLUTION FAILED:",
                    {

                        detail,

                        tax_plus_id:
                            taxPlusId,

                        tax_input_rate:
                            taxPlusRate,

                        tax_input_amount:
                            taxPlusAmount,

                        tax_plus_account_id:
                            taxPlusAccountId,

                        tax_master:
                            taxPlusMaster,

                        taxPlusData:
                            this.taxPlusData

                    }
                );


                throw new Error(
                    `Tax (+) Account is missing for ${taxPlusName}. Check Tax Master configuration.`
                );

            }


            /*
            ==============================================
            TAX (+) JOURNAL

            DR PPN MASUKAN
            CR HUTANG USAHA
            ==============================================
            */

            if (
                taxPlusAmount > 0
            ) {

                journalDetails.push({

                    debit_account_id:
                        taxPlusAccountId,

                    credit_account_id:
                        payableAccountId,

                    business_partner_id:
                        businessPartnerId,

                    description:
                        `${taxPlusName} - ${
                            invoice.invoice_no
                            || ""
                        }`,

                    amount:
                        taxPlusAmount

                });

            }


            /*
            ==================================================
            TAX (-)
            ==================================================
            */

            const taxMinusAmount =
                Number(
                    detail.withholding_tax_amount
                    || 0
                );


            const taxMinusRate =
                Number(
                    detail.withholding_tax_rate
                    || 0
                );


            let taxMinusId =
                detail.tax_minus_id
                || null;


            let taxMinusAccountId =
                Number(
                    detail.tax_minus_account_id
                    || 0
                );


            let taxMinusName =
                detail.tax_minus_name
                || "Tax (-)";


            /*
            ==============================================
            TAX (-)
            FIND MASTER BY TAX ID
            ==============================================
            */

            let taxMinusMaster =
                null;


            if (
                taxMinusId
            ) {

                taxMinusMaster =
                    this.taxMinusData.find(
                        tax =>
                            String(tax.id)
                            ===
                            String(taxMinusId)
                    )
                    || null;

            }


            /*
            ==============================================
            TAX (-)
            FALLBACK BY RATE

            OLD AP DATA SUPPORT
            ==============================================
            */

            if (
                !taxMinusMaster
                &&
                taxMinusRate > 0
            ) {

                taxMinusMaster =
                    this.taxMinusData.find(
                        tax =>
                            Number(
                                tax.tax_rate
                                || 0
                            )
                            ===
                            taxMinusRate
                    )
                    || null;

            }


            /*
            ==============================================
            TAX (-)
            USE TAX MASTER
            ==============================================
            */

            if (
                taxMinusMaster
            ) {

                taxMinusId =
                    taxMinusMaster.id
                    || taxMinusId;


                taxMinusAccountId =
                    Number(
                        taxMinusMaster.tax_account_id
                        ||
                        taxMinusAccountId
                        ||
                        0
                    );


                taxMinusName =
                    taxMinusMaster.tax_name
                    ||
                    taxMinusName;

            }


            /*
            ==============================================
            TAX (-)
            LAST FALLBACK DIRECT DATABASE BY ID
            ==============================================
            */

            if (
                taxMinusAmount > 0
                &&
                !taxMinusAccountId
                &&
                taxMinusId
            ) {

                const freshTax =
                    await this.taxService.getById(
                        taxMinusId
                    );


                if (freshTax) {

                    taxMinusAccountId =
                        Number(
                            freshTax.tax_account_id
                            || 0
                        );


                    taxMinusName =
                        freshTax.tax_name
                        || taxMinusName;

                }

            }


            /*
            ==============================================
            TAX (-)
            DEBUG FINAL RESOLUTION
            ==============================================
            */

            console.log(
                "AP TAX (-) FINAL RESOLUTION:",
                {

                    detail_tax_minus_id:
                        detail.tax_minus_id,

                    resolved_tax_minus_id:
                        taxMinusId,

                    rate:
                        taxMinusRate,

                    amount:
                        taxMinusAmount,

                    account_id:
                        taxMinusAccountId,

                    tax_name:
                        taxMinusName,

                    master:
                        taxMinusMaster

                }
            );


            /*
            ==============================================
            TAX (-)
            VALIDATION
            ==============================================
            */

            if (
                taxMinusAmount > 0
                &&
                !taxMinusAccountId
            ) {

                console.error(
                    "AP TAX (-) ACCOUNT RESOLUTION FAILED:",
                    {

                        detail,

                        tax_minus_id:
                            taxMinusId,

                        withholding_tax_rate:
                            taxMinusRate,

                        withholding_tax_amount:
                            taxMinusAmount,

                        tax_minus_account_id:
                            taxMinusAccountId,

                        tax_master:
                            taxMinusMaster,

                        taxMinusData:
                            this.taxMinusData

                    }
                );


                throw new Error(
                    `Tax (-) Account is missing for ${taxMinusName}. Check Tax Master configuration.`
                );

            }


            /*
            ==============================================
            TAX (-) JOURNAL

            DR HUTANG USAHA
            CR HUTANG PPH
            ==============================================
            */

            if (
                taxMinusAmount > 0
            ) {

                journalDetails.push({

                    debit_account_id:
                        payableAccountId,

                    credit_account_id:
                        taxMinusAccountId,

                    business_partner_id:
                        businessPartnerId,

                    description:
                        `${taxMinusName} - ${
                            invoice.invoice_no
                            || ""
                        }`,

                    amount:
                        taxMinusAmount

                });

            }

        }


        /*
        ==================================================
        VALIDATE JOURNAL DETAIL
        ==================================================
        */

        if (
            !journalDetails.length
        ) {

            throw new Error(
                "No valid AP detail available for GL Journal."
            );

        }


/*
==================================================
JOURNAL HEADER
==================================================
*/

const journalHeader = {

    /*
    ==============================================
    JOURNAL NO
    AUTO GENERATED BY GL SERVICE
    ==============================================
    */

    journal_no:
        "",


    /*
    ==============================================
    ACCOUNTING DATE
    ==============================================
    */

    journal_date:
        invoice.invoice_date,


    /*
    ==============================================
    POSTING PERIOD
    ==============================================
    */

    posting_period:
        invoice.invoice_date
            ? invoice.invoice_date.substring(
                0,
                7
            )
            : "",


    /*
    ==============================================
    DESCRIPTION
    ==============================================
    */

    description:
        invoice.description
        ||
        `AP Invoice ${
            invoice.invoice_no
            || ""
        }`,


    /*
    ==============================================
    SOURCE MODULE
    ==============================================
    */

    source_module:
        "AP",


    /*
    ==============================================
    SOURCE DOCUMENT TYPE
    ==============================================
    */

    source_document_type:
        "AP_INVOICE",


    /*
    ==============================================
    SOURCE DOCUMENT ID
    ==============================================
    */

    source_document_id:
        invoice.id,


    /*
    ==============================================
    AP INVOICE NO
    ==============================================
    */

    source_invoice_no:
        invoice.invoice_no
        || null,


    /*
    ==============================================
    PO NO
    ==============================================
    */

    source_po_no:
        invoice.po_no
        || null,


    /*
    ==============================================
    STATUS
    ==============================================
    */

    status:
        "Draft"

};


        /*
        ==================================================
        DEBUG FINAL JOURNAL
        ==================================================
        */

        console.log(
            "AP JOURNAL HEADER:",
            journalHeader
        );


        console.table(
            journalDetails
        );


        /*
        ==================================================
        CREATE GL JOURNAL
        ==================================================
        */

        const journal =
            await this.journalService.create(

                journalHeader,

                journalDetails

            );


        if (!journal) {

            throw new Error(
                "Failed to generate GL Journal."
            );

        }


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        console.log(
            "AP GL JOURNAL CREATED:",
            journal
        );


        return journal;

    }

    catch (error) {

        console.error(
            "AccountPayable.generateAPJournal:",
            error
        );


        throw error;

    }

}
/*
======================================================
GENERATE AP PAYMENT GL JOURNAL
SUPPORT FULL / PARTIAL PAYMENT
======================================================
*/

async generateAPPaymentJournal(
    invoice,
    details,
    payment
) {

    try {

        /*
        ==================================================
        VALIDATE INVOICE
        ==================================================
        */

        if (!invoice) {

            throw new Error(
                "Account Payable header is required."
            );

        }


        /*
        ==================================================
        VALIDATE PAYMENT
        ==================================================
        */

        if (!payment) {

            throw new Error(
                "Payment data is required."
            );

        }


        /*
        ==================================================
        HUTANG USAHA
        ==================================================
        */

        const payableAccountId =
            39;


        if (
            !payableAccountId
        ) {

            throw new Error(
                "Account Payable account is not configured."
            );

        }


        /*
        ==================================================
        BANK ACCOUNT
        ==================================================
        */

        const bankAccountId =
            Number(
                payment.bank_account_id
                || 0
            );


        if (
            !bankAccountId
        ) {

            throw new Error(
                "Bank Account is required."
            );

        }


        /*
        ==================================================
        BUSINESS PARTNER
        ==================================================
        */

        const businessPartnerId =
            invoice.vendor_id
                ? Number(
                    invoice.vendor_id
                )
                : null;


        /*
        ==================================================
        PAYMENT COMPONENT

        THESE VALUES HAVE ALREADY BEEN ALLOCATED
        BY saveAPPayment()
        ==================================================
        */

        const dppAmount =
            Number(
                payment.dpp_amount
                || 0
            );


        const taxPlusAmount =
            Number(
                payment.tax_plus_amount
                || 0
            );


        const taxMinusAmount =
            Number(
                payment.tax_minus_amount
                || 0
            );


        const paymentAmount =
            Number(
                payment.amount
                || 0
            );


        /*
        ==================================================
        PAYMENT DATE
        ==================================================
        */

        const paymentDate =
            payment.payment_date
            || "";


        if (
            !paymentDate
        ) {

            throw new Error(
                "Payment Date is required."
            );

        }


        /*
        ==================================================
        PAYMENT AMOUNT
        ==================================================
        */

        if (
            paymentAmount <= 0
        ) {

            throw new Error(
                "Payment Amount must be greater than 0."
            );

        }


        /*
        ==================================================
        VALIDATE COMPONENT TOTAL

        DPP + TAX (+) - TAX (-)
        MUST EQUAL PAYMENT AMOUNT
        ==================================================
        */

        const componentTotal =
            Number(
                (
                    dppAmount
                    +
                    taxPlusAmount
                    -
                    taxMinusAmount
                ).toFixed(2)
            );


        if (
            Math.abs(
                componentTotal
                -
                paymentAmount
            ) > 0.01
        ) {

            throw new Error(
                "AP Payment journal components do not match Payment Amount."
            );

        }


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        const description =
            payment.description
            ||
            invoice.description
            ||
            `AP Payment ${
                invoice.invoice_no
                || ""
            }`;


        /*
        ==================================================
        JOURNAL DETAILS
        ==================================================
        */

        const journalDetails =
            [];


        /*
        ==================================================
        DPP PAYMENT

        DR HUTANG USAHA
        CR BANK
        ==================================================
        */

        if (
            dppAmount > 0
        ) {

            journalDetails.push({

                debit_account_id:
                    payableAccountId,

                credit_account_id:
                    bankAccountId,

                business_partner_id:
                    businessPartnerId,

                description:
                    `${description} - DPP`,

                amount:
                    dppAmount

            });

        }


        /*
        ==================================================
        TAX (+) PAYMENT

        DR HUTANG USAHA
        CR BANK
        ==================================================
        */

        if (
            taxPlusAmount > 0
        ) {

            journalDetails.push({

                debit_account_id:
                    payableAccountId,

                credit_account_id:
                    bankAccountId,

                business_partner_id:
                    businessPartnerId,

                description:
                    `${description} - Tax (+)`,

                amount:
                    taxPlusAmount

            });

        }


        /*
        ==================================================
        TAX (-) PAYMENT

        DR BANK
        CR HUTANG USAHA
        ==================================================
        */

        if (
            taxMinusAmount > 0
        ) {

            journalDetails.push({

                debit_account_id:
                    bankAccountId,

                credit_account_id:
                    payableAccountId,

                business_partner_id:
                    businessPartnerId,

                description:
                    `${description} - Tax (-)`,

                amount:
                    taxMinusAmount

            });

        }


        /*
        ==================================================
        VALIDATE JOURNAL
        ==================================================
        */

        if (
            !journalDetails.length
        ) {

            throw new Error(
                "No valid AP Payment Journal detail."
            );

        }


        /*
        ==================================================
        JOURNAL HEADER
        ==================================================
        */

        const journalHeader = {

            /*
            ==============================================
            AUTO JOURNAL NUMBER
            ==============================================
            */

            journal_no:
                "",


            /*
            ==============================================
            ACCOUNTING DATE
            ==============================================
            */

            journal_date:
                paymentDate,


            /*
            ==============================================
            POSTING PERIOD
            ==============================================
            */

            posting_period:
                paymentDate.substring(
                    0,
                    7
                ),


            /*
            ==============================================
            DESCRIPTION
            ==============================================
            */

            description:
                description,


            /*
            ==============================================
            SOURCE MODULE
            ==============================================
            */

            source_module:
                "AP",


            /*
            ==============================================
            SOURCE DOCUMENT TYPE
            ==============================================
            */

            source_document_type:
                "AP_PAYMENT",


            /*
            ==============================================
            SOURCE DOCUMENT ID
            ==============================================
            */

            source_document_id:
                invoice.id,


            /*
            ==============================================
            SOURCE INVOICE
            ==============================================
            */

            source_invoice_no:
                invoice.invoice_no
                || null,


            /*
            ==============================================
            SOURCE PO
            ==============================================
            */

            source_po_no:
                invoice.po_no
                || null,


            /*
            ==============================================
            STATUS
            ==============================================
            */

            status:
                "Draft"

        };


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP PAYMENT JOURNAL HEADER:",
            journalHeader
        );


        console.log(
            "AP PAYMENT JOURNAL COMPONENT:",
            {

                dpp_amount:
                    dppAmount,

                tax_plus_amount:
                    taxPlusAmount,

                tax_minus_amount:
                    taxMinusAmount,

                payment_amount:
                    paymentAmount

            }
        );


        console.table(
            journalDetails
        );


        /*
        ==================================================
        CREATE JOURNAL
        ==================================================
        */

        const journal =
            await this.journalService.create(
                journalHeader,
                journalDetails
            );


        if (
            !journal
            ||
            !journal.id
        ) {

            throw new Error(
                "Failed to create AP Payment GL Journal."
            );

        }


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        console.log(
            "AP PAYMENT GL JOURNAL CREATED:",
            journal
        );


        return journal;

    }

    catch (error) {

        console.error(
            "AccountPayable.generateAPPaymentJournal:",
            error
        );


        throw error;

    }

}
/*
======================================================
SHOW COMPLETE ACCOUNT PAYABLE CONFIRMATION
======================================================
*/

showCompleteConfirmation(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        GET MODAL
        ==================================================
        */

        const modalElement =
            document.getElementById(
                "accountPayableCompleteModal"
            );


        if (!modalElement) {

            throw new Error(
                "Account Payable Complete Modal not found."
            );

        }


        /*
        ==================================================
        STORE PENDING ID
        ==================================================
        */

        this.pendingCompleteAPId =
            id;


        /*
        ==================================================
        CREATE / GET BOOTSTRAP MODAL
        ==================================================
        */

        this.accountPayableCompleteModal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        /*
        ==================================================
        SHOW MODAL
        ==================================================
        */

        this.accountPayableCompleteModal.show();

    }

    catch (error) {

        console.error(
            "AccountPayable.showCompleteConfirmation:",
            error
        );

        this.showError(
            error.message
            || "Failed to open complete confirmation."
        );

    }

}
/*
======================================================
COMPLETE ACCOUNT PAYABLE
GENERATE GL JOURNAL AS DRAFT
======================================================
*/

async completeInvoice(id) {

    try {

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        LOAD ACCOUNT PAYABLE
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        if (!result) {

            throw new Error(
                "Account Payable not found."
            );

        }


        const invoice =
            result.header;


        const details =
            Array.isArray(
                result.details
            )
                ? result.details
                : [];


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "========== COMPLETE AP DEBUG =========="
        );

        console.log(
            "AP ID:",
            id
        );

        console.log(
            "AP INVOICE:",
            invoice?.invoice_no
        );

        console.log(
            "AP STATUS:",
            invoice?.status
        );

        console.log(
            "AP GL JOURNAL ID:",
            invoice?.gl_journal_id
        );

        console.log(
            "AP DETAIL COUNT:",
            details.length
        );

        console.log(
            "======================================="
        );


        /*
        ==================================================
        CHECK STATUS
        ONLY DRAFT CAN BE COMPLETED
        ==================================================
        */

        const currentStatus =
            String(
                invoice?.status
                || ""
            )
            .trim();


        if (
            currentStatus !== "Draft"
        ) {

            throw new Error(
                `Account Payable status is "${currentStatus}". Only Draft Account Payable can be completed.`
            );

        }


        /*
        ==================================================
        EXISTING GL JOURNAL
        ==================================================
        */

        let journal = null;

        let journalId =
            invoice?.gl_journal_id
            || null;


        /*
        ==================================================
        GENERATE GL JOURNAL
        ONLY IF NOT EXISTS
        ==================================================
        */

        if (!journalId) {

            console.log(
                "AP COMPLETE: GENERATING GL JOURNAL..."
            );


            journal =
                await this.generateAPJournal(
                    invoice,
                    details
                );


            /*
            ==============================================
            VALIDATE JOURNAL RESULT
            ==============================================
            */

            if (!journal) {

                throw new Error(
                    "Failed to generate GL Journal."
                );

            }


            console.log(
                "AP GENERATED JOURNAL:",
                journal
            );


            journalId =
                journal?.id
                || null;


            if (!journalId) {

                throw new Error(
                    "GL Journal was created but Journal ID is missing."
                );

            }


            /*
            ==============================================
            LINK GL JOURNAL
            ==============================================
            */

            console.log(
                "AP LINK GL JOURNAL:",
                {
                    apId: id,
                    journalId
                }
            );


            const linked =
                await this.service.linkGLJournal(
                    id,
                    journalId
                );


            /*
            ==============================================
            VALIDATE LINK RESULT
            ==============================================
            */

            if (!linked) {

                throw new Error(
                    "GL Journal was created but could not be linked to Account Payable."
                );

            }


            console.log(
                "AP GL LINK RESULT:",
                linked
            );

        }


        /*
        ==================================================
        VERIFY AP → GL LINK
        ==================================================
        */

        const verifyLink =
            await this.service.getById(
                id
            );


        const linkedJournalId =
            verifyLink?.header?.gl_journal_id
            || null;


        console.log(
            "========== VERIFY AP GL LINK =========="
        );

        console.log(
            "AP ID:",
            id
        );

        console.log(
            "EXPECTED GL ID:",
            journalId
        );

        console.log(
            "DATABASE GL ID:",
            linkedJournalId
        );

        console.log(
            "========================================"
        );


        /*
        ==================================================
        LINK MUST EXIST
        ==================================================
        */

        if (
            !linkedJournalId
        ) {

            throw new Error(
                "GL Journal was generated, but the Account Payable was not linked to the GL Journal."
            );

        }


        /*
        ==================================================
        VERIFY SAME JOURNAL
        ==================================================
        */

        if (
            String(linkedJournalId)
            !==
            String(journalId)
        ) {

            throw new Error(
                "Account Payable GL Journal link is invalid."
            );

        }


        /*
        ==================================================
        COMPLETE ACCOUNT PAYABLE
        ==================================================
        */

        console.log(
            "AP LINK VERIFIED. COMPLETING AP..."
        );


        const completed =
            await this.service.completeInvoice(
                id
            );


        if (!completed) {

            throw new Error(
                "Failed to complete Account Payable."
            );

        }


        /*
        ==================================================
        LOG
        ==================================================
        */

        console.log(
            "========== AP COMPLETED =========="
        );

        console.log(
            {
                ap_id:
                    id,

                invoice_no:
                    invoice?.invoice_no,

                gl_journal_id:
                    journalId,

                journal_no:
                    journal?.journal_no
                    || null,

                status:
                    completed?.status
            }
        );


        /*
        ==================================================
        RELOAD AP DATA
        ==================================================
        */

        await this.loadData(
    false
);


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return {

            ap:
                completed,

            journal:
                journal

        };

    }
    catch (error) {

        console.error(
            "AccountPayable.completeInvoice:",
            error
        );

        throw error;

    }

}
/*
======================================================
LOAD ACCOUNT PAYABLE DETAIL MODAL HTML
======================================================
*/

async loadDetailModalHTML() {

    try {

        /*
        ==================================================
        CHECK IF ALREADY LOADED
        ==================================================
        */

        const existingModal =
            document.getElementById(
                "accountPayableDetailModal"
            );


        if (existingModal) {

            this.accountPayableDetailModal =
                existingModal;

            return;

        }


        /*
        ==================================================
        FETCH MODAL HTML
        ==================================================
        */

        const response =
            await fetch(
                new URL(
                    "./account-payable-detail-modal.html",
                    import.meta.url
                )
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load Account Payable Detail Modal: ${response.status}`
            );

        }


        /*
        ==================================================
        READ HTML
        ==================================================
        */

        const html =
            await response.text();


        if (!html.trim()) {

            throw new Error(
                "Account Payable Detail Modal HTML is empty."
            );

        }


        /*
        ==================================================
        INSERT INTO BODY
        ==================================================
        */

        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );


        /*
        ==================================================
        CACHE MODAL
        ==================================================
        */

        this.accountPayableDetailModal =
            document.getElementById(
                "accountPayableDetailModal"
            );


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !this.accountPayableDetailModal
        ) {

            throw new Error(
                "Account Payable Detail Modal element not found."
            );

        }


        console.log(
            "Account Payable Detail Modal loaded."
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.loadDetailModalHTML:",
            error
        );

        throw error;

    }

}

  /*
==================================================
CACHE DOM
==================================================
*/

cacheDOM() {

    /*
    ==================================================
    TABLE
    ==================================================
    */

    this.tableBody =
        document.getElementById(
            "ap-table-body"
        );

    /*
======================================================
DELETE INVOICE MODAL
======================================================
*/

this.apDeleteInvoiceModal =
    document.getElementById(
        "apDeleteInvoiceModal"
    );


this.apDeleteInvoiceNo =
    document.getElementById(
        "ap-delete-invoice-no"
    );


this.apDeleteVendor =
    document.getElementById(
        "ap-delete-vendor"
    );


this.apDeletePoNo =
    document.getElementById(
        "ap-delete-po-no"
    );


this.btnConfirmApDeleteInvoice =
    document.getElementById(
        "btn-confirm-ap-delete-invoice"
    );
    /*
    ==================================================
    ACCOUNT PAYABLE MODAL
    ==================================================
    */

    this.accountPayableModal =
        document.getElementById(
            "accountPayableModal"
        );


    /*
    ==================================================
    ACCOUNT PAYABLE DETAIL MODAL
    ==================================================
    */

    this.accountPayableDetailModal =
        document.getElementById(
            "accountPayableDetailModal"
        );


    /*
    ==================================================
    ADD AP FORM
    ==================================================
    */

    this.apFormVendor =
        document.getElementById(
            "ap-form-vendor"
        );


    this.apFormPoNo =
        document.getElementById(
            "ap-form-po-no"
        );


    this.apFormInvoiceNo =
        document.getElementById(
            "ap-form-invoice-no"
        );
    this.apFormJournalNo =
    document.getElementById(
        "ap-form-journal-no"
    );

    this.apFormInvoiceDate =
        document.getElementById(
            "ap-form-invoice-date"
        );


    this.apFormDateReceived =
        document.getElementById(
            "ap-form-date-received"
        );


    this.apFormTop =
        document.getElementById(
            "ap-form-top"
        );


    this.apFormDueDate =
        document.getElementById(
            "ap-form-due-date"
        );


    this.apFormDescription =
        document.getElementById(
            "ap-form-description"
        );


    /*
    ==================================================
    AP DETAIL TABLE
    ==================================================
    */

    this.apDetailBody =
        document.getElementById(
            "ap-detail-body"
        );


    /*
    ==================================================
    AP TOTAL
    ==================================================
    */

    this.apFormSubtotal =
        document.getElementById(
            "ap-form-subtotal"
        );


    this.apFormTax =
        document.getElementById(
            "ap-form-tax"
        );


    this.apFormWht =
        document.getElementById(
            "ap-form-wht"
        );


    this.apFormTotal =
        document.getElementById(
            "ap-form-total"
        );


    /*
    ==================================================
    SAVE DRAFT
    ==================================================
    */

    this.btnSaveDraft =
        document.getElementById(
            "btn-save-ap-draft"
        );


    /*
    ==================================================
    ADD INVOICE DETAIL
    ==================================================
    */

    this.btnAddDetail =
        document.getElementById(
            "btn-add-ap-detail"
        );


    /*
    ==================================================
    SAVE INVOICE DETAIL
    ==================================================
    */

    this.btnSaveAPDetail =
        document.getElementById(
            "btn-save-ap-detail"
        );


    /*
    ==================================================
    DETAIL COA
    ==================================================
    */

    this.apDetailCOA =
        document.getElementById(
            "ap-detail-coa"
        );


    /*
    ==================================================
    DETAIL CALCULATION
    ==================================================
    */

    this.apDetailQuantity =
        document.getElementById(
            "ap-detail-quantity"
        );


    this.apDetailUnitPrice =
        document.getElementById(
            "ap-detail-unit-price"
        );


    this.apDetailTaxInputRate =
        document.getElementById(
            "ap-detail-tax-input-rate"
        );


    this.apDetailWithholdingTaxRate =
        document.getElementById(
            "ap-detail-withholding-tax-rate"
        );


    this.apDetailLineAmount =
        document.getElementById(
            "ap-detail-line-amount"
        );


    this.apDetailTaxInputAmount =
        document.getElementById(
            "ap-detail-tax-input-amount"
        );


    this.apDetailWithholdingTaxAmount =
        document.getElementById(
            "ap-detail-withholding-tax-amount"
        );


    this.apDetailTotalAmount =
        document.getElementById(
            "ap-detail-total-amount"
        );


    /*
    ==================================================
    FILTER
    ==================================================
    */

    this.dateFrom =
        document.getElementById(
            "ap-date-from"
        );


    this.dateTo =
        document.getElementById(
            "ap-date-to"
        );


   /*
==================================================
STATUS FILTER
==================================================
*/

this.statusFilter =
    document.getElementById(
        "ap-status-filter"
    );


/*
==================================================
FIND BY
==================================================
*/

this.findBy =
    document.getElementById(
        "ap-find-by"
    );


/*
==================================================
KEYWORD
==================================================
*/

this.keyword =
    document.getElementById(
        "ap-keyword"
    );


/*
==================================================
FIND BUTTON
==================================================
*/

this.btnFind =
    document.getElementById(
        "btn-find-ap"
    );

    this.btnAdd =
        document.getElementById(
            "btn-add-ap"
        );


    this.btnRefresh =
        document.getElementById(
            "btn-refresh-ap"
        );


    this.btnDownloadExcel =
        document.getElementById(
            "btn-download-excel-ap"
        );


    this.btnPreviewHTML =
        document.getElementById(
            "btn-preview-html-ap"
        );


    /*
    ==================================================
    PAGINATION
    ==================================================
    */

    this.btnFirstPage =
        document.getElementById(
            "ap-page-first"
        );


    this.btnPrevPage =
        document.getElementById(
            "ap-page-prev"
        );


    this.currentPageInput =
        document.getElementById(
            "ap-current-page"
        );


    this.totalPagesElement =
        document.getElementById(
            "ap-total-pages"
        );


    this.btnNextPage =
        document.getElementById(
            "ap-page-next"
        );


    this.btnLastPage =
        document.getElementById(
            "ap-page-last"
        );
    
    


    /*
    ==================================================
    RECORD INFORMATION
    ==================================================
    */

    this.recordInfo =
        document.getElementById(
            "ap-record-info"
        );


    /*
    ==================================================
    DEBUG DOM
    ==================================================
    */

    console.log(
        "Account Payable DOM cached."
    );
    /*
==================================================
AP PAYMENT
==================================================
*/

this.accountPayablePaymentModal =
    document.getElementById(
        "accountPayablePaymentModal"
    );


this.apPaymentAPId =
    document.getElementById(
        "ap-payment-ap-id"
    );


this.apPaymentInvoiceNo =
    document.getElementById(
        "ap-payment-invoice-no"
    );


this.apPaymentVendor =
    document.getElementById(
        "ap-payment-vendor"
    );


this.apPaymentDate =
    document.getElementById(
        "ap-payment-date"
    );


this.apPaymentBankAccount =
    document.getElementById(
        "ap-payment-bank-account"
    );


this.apPaymentDPP =
    document.getElementById(
        "ap-payment-dpp"
    );


this.apPaymentTaxPlus =
    document.getElementById(
        "ap-payment-tax-plus"
    );


this.apPaymentTaxMinus =
    document.getElementById(
        "ap-payment-tax-minus"
    );


this.apPaymentAmount =
    document.getElementById(
        "ap-payment-amount"
    );


this.apPaymentReferenceNo =
    document.getElementById(
        "ap-payment-reference-no"
    );


this.apPaymentDescription =
    document.getElementById(
        "ap-payment-description"
    );


this.btnSaveAPPayment =
    document.getElementById(
        "btn-save-ap-payment"
    );

}
   /*
======================================================
LOAD DETAIL COA
======================================================
*/

async loadDetailCOA() {

    try {

        /*
        ==================================================
        CHECK DOM
        ==================================================
        */

        if (!this.apDetailCOA) {

            console.warn(
                "AP Detail COA element not found."
            );

            return;

        }


        /*
        ==================================================
        DESTROY EXISTING TOM SELECT
        BEFORE REBUILD OPTIONS
        ==================================================
        */

        if (
            this.apDetailCOASelect
        ) {

            this.apDetailCOASelect.destroy();

            this.apDetailCOASelect =
                null;

        }


        /*
        ==================================================
        LOAD COA
        ==================================================
        */

        const coa =
            await this.service.getCOA();


        /*
        ==================================================
        STORE COA
        ==================================================
        */

        this.currentCOA =
            Array.isArray(coa)
                ? coa
                : [];


        /*
        ==================================================
        RESET DROPDOWN
        ==================================================
        */
this.apDetailCOA.innerHTML = `
    <option value=""></option>
`;


        /*
        ==================================================
        EMPTY
        ==================================================
        */

        if (
            !this.currentCOA.length
        ) {

            return;

        }


        /*
        ==================================================
        RENDER OPTIONS
        ==================================================
        */

        this.currentCOA.forEach(
            account => {

                /*
                ==========================================
                ONLY TRANSACTION ACCOUNT
                ==========================================
                */

                if (
                    account.is_header === true
                    ||
                    account.allow_transaction === false
                    ||
                    account.status === false
                ) {

                    return;

                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    account.id;


                option.textContent =
                    `${account.account_code} - ${account.account_name}`;


                this.apDetailCOA.appendChild(
                    option
                );

            }
        );


        /*
        ==================================================
        INITIALIZE SEARCHABLE DROPDOWN
        ==================================================
        */

        this.initializeDetailCOASearch();


        console.log(
            "AP currentCOA:",
            this.currentCOA
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.loadDetailCOA:",
            error
        );


        this.currentCOA =
            [];


        this.showError(
            "Failed to load Chart of Accounts."
        );

    }

}
    /*
======================================================
LOAD ACTIVE VENDORS
======================================================
*/

async loadVendors() {

    try {

        /*
        ==================================================
        LOAD BUSINESS PARTNER
        ==================================================
        */

        const data =
            await this.service.getVendors();

        console.log(
            "AP Vendors:",
            data
        );


        /*
        ==================================================
        NORMALIZE DATA
        ==================================================
        */

        this.vendorData =
            Array.isArray(data)
                ? data
                : [];


        /*
        ==================================================
        RENDER VENDOR
        ==================================================
        */

        this.renderVendorOptions();

    }

    catch (error) {

        console.error(
            "AccountPayable.loadVendors:",
            error
        );

        this.vendorData = [];

        this.renderVendorOptions();

        this.showError(
            "Failed to load Vendor."
        );

    }

}
/*
======================================================
RENDER VENDOR OPTIONS
======================================================
*/

renderVendorOptions() {

    if (!this.apFormVendor) {

        return;

    }


    /*
    ==================================================
    DEFAULT OPTION
    ==================================================
    */

    let options = `

        <option value="">
            Select Vendor
        </option>

    `;


    /*
    ==================================================
    VENDOR OPTIONS
    ==================================================
    */

    this.vendorData.forEach(
        vendor => {

            const id =
                vendor?.id;

            const code =
                vendor?.bp_code
                || "";

            const name =
                vendor?.bp_name
                || "";


            if (!id) {

                return;

            }


            options += `

                <option
                    value="${id}">

                    ${code}
                    :: 
                    ${name}

                </option>

            `;

        }
    );


    /*
    ==================================================
    SET OPTIONS
    ==================================================
    */

    this.apFormVendor.innerHTML =
        options;

}

  /*
==================================================
BIND EVENTS
==================================================
*/

bindEvents() {

    /*
    ==================================================
    FIND
    ==================================================
    */

    this.btnFind?.addEventListener(
        "click",
        () => {

            this.search();

        }
    );
    const btnConfirmCompleteAP =
    document.getElementById(
        "btn-confirm-complete-ap"
    );


if (btnConfirmCompleteAP) {

    btnConfirmCompleteAP.addEventListener(
        "click",
        async () => {

            const id =
                this.pendingCompleteAPId;


            if (!id) {

                return;

            }


            /*
            ==========================================
            CLOSE MODAL
            ==========================================
            */

            if (
                this.accountPayableCompleteModal
            ) {

                this.accountPayableCompleteModal.hide();

            }


            /*
            ==========================================
            COMPLETE AP
            ==========================================
            */

            await this.completeInvoice(
                id
            );

        }
    );

}

    /*
======================================================
CONFIRM DELETE DETAIL
======================================================
*/

const btnConfirmDelete =
    document.getElementById(
        "btn-confirm-ap-delete"
    );


btnConfirmDelete?.addEventListener(
    "click",
    () => {

        const id =
            this.pendingDeleteDetailId;


        if (!id) {

            return;

        }


        const index =
            this.invoiceDetails.findIndex(
                item =>
                    String(item.id)
                    ===
                    String(id)
            );


        if (index === -1) {

            this.showError(
                "Invoice detail not found."
            );

            return;

        }


        /*
        ==============================================
        REMOVE DETAIL FROM ARRAY
        ==============================================
        */

        this.invoiceDetails.splice(
            index,
            1
        );


        /*
        ==============================================
        CLEAR PENDING ID
        ==============================================
        */

        this.pendingDeleteDetailId =
            null;


        /*
        ==============================================
        RENDER
        ==============================================
        */

        this.renderInvoiceDetails();


        /*
        ==============================================
        CLOSE CONFIRM MODAL
        ==============================================
        */

        const modalElement =
            document.getElementById(
                "apDeleteDetailModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        modal?.hide();


        console.log(
            "AP Invoice Detail deleted:",
            id
        );

    }
);
    /*
    ==================================================
    DETAIL CALCULATION
    ==================================================
    */

    this.apDetailQuantity?.addEventListener(
        "input",
        () => {

            this.calculateDetail();

        }
    );


    this.apDetailUnitPrice?.addEventListener(
        "input",
        () => {

            this.formatUnitPrice();

            this.calculateDetail();

        }
    );


    this.apDetailTaxInputRate?.addEventListener(
        "input",
        () => {

            this.calculateDetail();

        }
    );


    this.apDetailWithholdingTaxRate?.addEventListener(
        "input",
        () => {

            this.calculateDetail();

        }
    );


    /*
    ==================================================
    SAVE INVOICE DETAIL
    ==================================================
    */

    this.btnSaveAPDetail?.addEventListener(
        "click",
        () => {

            this.saveInvoiceDetail();

        }
    );


    /*
    ==================================================
    SAVE DRAFT
    ==================================================
    */

    this.btnSaveDraft?.addEventListener(
    "click",
    async () => {

        if (
            this.currentMode === "edit"
        ) {

            await this.saveEdit();

            return;

        }

        await this.saveDraft();

    }
);


    /*
    ==================================================
    ADD INVOICE DETAIL
    ==================================================
    */

    this.btnAddDetail?.addEventListener(
        "click",
        () => {

            this.addInvoiceDetail();

        }
    );
    /*
======================================================
INVOICE DETAIL ACTION
======================================================
*/

const detailBody =
    document.getElementById(
        "ap-detail-body"
    );


detailBody?.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-detail-action]"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.detailAction;


        const id =
            button.dataset.detailId;


        if (!id) {

            return;

        }


        if (
            action === "edit"
        ) {

            this.editInvoiceDetail(id);

            return;

        }


        if (
            action === "delete"
        ) {

            this.deleteInvoiceDetail(id);

        }

    }
);


    /*
    ==================================================
    VENDOR CHANGE
    ==================================================
    */

    this.apFormVendor?.addEventListener(
        "change",
        () => {

            this.handleVendorChange();

        }
    );


    /*
    ==================================================
    DATE RECEIVED CHANGE
    ==================================================
    */

    this.apFormDateReceived?.addEventListener(
        "change",
        () => {

            this.calculateAPDueDate();

        }
    );


    /*
    ==================================================
    ENTER KEYWORD
    ==================================================
    */

    this.keyword?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                this.search();

            }

        }
    );


    /*
    ==================================================
    ADD ACCOUNT PAYABLE
    ==================================================
    */

    this.btnAdd?.addEventListener(
        "click",
        () => {

            this.addInvoice();

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
    FIRST PAGE
    ==================================================
    */

    this.btnFirstPage?.addEventListener(
        "click",
        () => {

            this.goToPage(
                1
            );

        }
    );


    /*
    ==================================================
    PREVIOUS PAGE
    ==================================================
    */

    this.btnPrevPage?.addEventListener(
        "click",
        () => {

            this.goToPage(
                this.currentPage - 1
            );

        }
    );


    /*
    ==================================================
    PAGE INPUT
    ==================================================
    */

    this.currentPageInput?.addEventListener(
        "change",
        () => {

            this.goToPage(
                this.currentPageInput.value
            );

        }
    );


    /*
    ==================================================
    NEXT PAGE
    ==================================================
    */

    this.btnNextPage?.addEventListener(
        "click",
        () => {

            this.goToPage(
                this.currentPage + 1
            );

        }
    );


    /*
    ==================================================
    LAST PAGE
    ==================================================
    */

    this.btnLastPage?.addEventListener(
        "click",
        () => {

            this.goToPage(
                this.getTotalPages()
            );

        }
    );
        /*
    ==================================================
    CONFIRM DELETE ACCOUNT PAYABLE
    ==================================================
    */

    this.btnConfirmApDeleteInvoice?.addEventListener(
        "click",
        async () => {

            await this.confirmDelete();

        }
    );
    /*
==================================================
SAVE AP PAYMENT
==================================================
*/

this.btnSaveAPPayment?.addEventListener(
    "click",
    async () => {

        await this.saveAPPayment();

    }
);


/*
==================================================
TABLE ACTION
==================================================
*/

this.bindTableActions();

}

        /*
    ======================================================
    BIND TABLE ACTION
    ======================================================
    */

    bindTableActions() {

        if (!this.tableBody) {

            return;

        }


        this.tableBody.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) {

                    return;

                }


                const action =
                    button.dataset.action;


                const id =
                    button.dataset.id;


                if (!id) {

                    return;

                }


                this.handleTableAction(
                    action,
                    id
                );

            }
        );

    }
 /*
======================================================
SAVE AP PAYMENT
FULL / PARTIAL PAYMENT
ANTI DUPLICATE
SAFE ROLLBACK
ACTIVE PAYMENT ONLY
FORCE UI REFRESH
======================================================
*/

async saveAPPayment() {

    /*
    ==================================================
    INTERNAL PROCESS LOCK
    ==================================================
    */

    if (
        this.isSavingAPPayment === true
    ) {

        console.warn(
            "AP PAYMENT IGNORED: payment is already processing."
        );

        return null;

    }


    /*
    ==================================================
    BUTTON PROCESS LOCK
    ==================================================
    */

    if (
        this.btnSaveAPPayment
        &&
        this.btnSaveAPPayment.dataset.processing
        ===
        "true"
    ) {

        console.warn(
            "AP PAYMENT IGNORED: payment button is already processing."
        );

        return null;

    }


    /*
    ==================================================
    LOCK
    ==================================================
    */

    this.isSavingAPPayment =
        true;


    if (
        this.btnSaveAPPayment
    ) {

        this.btnSaveAPPayment.dataset.processing =
            "true";

        this.btnSaveAPPayment.disabled =
            true;

    }


    /*
    ==================================================
    TRANSACTION STATE
    ==================================================
    */

    let createdJournal =
        null;


    let createdPayment =
        null;


    let currentAPId =
        null;


    try {

        /*
        ==================================================
        AP ID
        ==================================================
        */

        const id =
            this.currentPaymentAPId
            ||
            this.apPaymentAPId?.value;


        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        currentAPId =
            id;


        /*
        ==================================================
        PAYMENT DATE
        ==================================================
        */

        const paymentDate =
            this.apPaymentDate?.value
            || "";


        if (
            !paymentDate
        ) {

            throw new Error(
                "Payment Date is required."
            );

        }


        /*
        ==================================================
        BANK ACCOUNT
        ==================================================
        */

        const bankAccountId =
            Number(
                this.apPaymentBankAccount?.value
                ||
                0
            );


        if (
            !bankAccountId
        ) {

            throw new Error(
                "Bank Account is required."
            );

        }


        /*
        ==================================================
        PAYMENT AMOUNT
        ==================================================
        */

        const paymentAmount =
            this.parseAPPaymentAmount(
                this.apPaymentAmount?.value
            );


        if (
            !Number.isFinite(
                paymentAmount
            )
            ||
            paymentAmount <= 0
        ) {

            throw new Error(
                "Payment Amount must be greater than 0."
            );

        }


        /*
        ==================================================
        REFERENCE NO
        ==================================================
        */

        const referenceNo =
            this.apPaymentReferenceNo
                ?.value
                ?.trim()
            ||
            null;


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        const description =
            this.apPaymentDescription
                ?.value
                ?.trim()
            ||
            null;


        /*
        ==================================================
        LOAD FRESH ACCOUNT PAYABLE
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        if (
            !result
            ||
            !result.header
        ) {

            throw new Error(
                "Account Payable not found."
            );

        }


        const invoice =
            result.header;


        const details =
            Array.isArray(
                result.details
            )
                ? result.details
                : [];


        /*
        ==================================================
        STATUS
        ==================================================
        */

        const currentStatus =
            String(
                invoice.status
                ||
                ""
            )
            .trim();


        if (
            currentStatus !== "Complete"
            &&
            currentStatus !== "Partial Paid"
        ) {

            throw new Error(
                `Account Payable status is "${currentStatus}". Payment is only allowed for Complete or Partial Paid Account Payable.`
            );

        }


        /*
        ==================================================
        TOTAL AMOUNT
        ==================================================
        */

        const totalAmount =
            Number(
                invoice.total_amount
                ||
                0
            );


        if (
            !Number.isFinite(
                totalAmount
            )
            ||
            totalAmount <= 0
        ) {

            throw new Error(
                "Account Payable Total Amount is invalid."
            );

        }


        /*
        ==================================================
        GET ACTIVE PAYMENT ONLY
        ==================================================
        */

        const {

            data: existingPayments,

            error: existingPaymentsError

        } = await supabase

            .from(
                "trx_ap_payment"
            )

            .select(`
                id,
                payment_amount,
                gl_journal_id,
                payment_date,
                created_at
            `)

            .eq(
                "account_payable_id",
                id
            )

            .not(
                "gl_journal_id",
                "is",
                null
            );


        if (
            existingPaymentsError
        ) {

            throw existingPaymentsError;

        }


        /*
        ==================================================
        ACTUAL PAID
        ==================================================
        */

        const actualPaidAmount =
            (
                existingPayments
                ||
                []
            )
            .reduce(
                (
                    total,
                    payment
                ) => {

                    return (
                        total
                        +
                        Number(
                            payment.payment_amount
                            ||
                            0
                        )
                    );

                },
                0
            );


        /*
        ==================================================
        ACTUAL OUTSTANDING
        ==================================================
        */

        const actualOutstandingAmount =
            Math.max(
                totalAmount
                -
                actualPaidAmount,
                0
            );


        /*
        ==================================================
        ALREADY PAID
        ==================================================
        */

        if (
            actualOutstandingAmount <= 0
            ||
            actualPaidAmount >= totalAmount
        ) {

            await this.service.updatePaymentStatus(
                id
            );


            await this.loadData(
                false
            );


            throw new Error(
                "Account Payable is already fully paid."
            );

        }


        /*
        ==================================================
        PREVENT OVERPAYMENT
        ==================================================
        */

        if (
            paymentAmount
            >
            actualOutstandingAmount
        ) {

            throw new Error(
                `Payment Amount cannot exceed Outstanding Amount (${this.formatCurrency(
                    actualOutstandingAmount
                )}).`
            );

        }


        /*
        ==================================================
        ORIGINAL COMPONENT
        ==================================================
        */

        const originalTaxPlus =
            Number(
                invoice.tax_input_amount
                ||
                0
            );


        const originalTaxMinus =
            Number(
                invoice.withholding_tax_amount
                ||
                0
            );


        /*
        ==================================================
        PAYMENT RATIO
        ==================================================
        */

        const paymentRatio =
            paymentAmount
            /
            totalAmount;


        /*
        ==================================================
        TAX (+)
        ==================================================
        */

        const paymentTaxPlus =
            Number(
                (
                    originalTaxPlus
                    *
                    paymentRatio
                )
                .toFixed(
                    2
                )
            );


        /*
        ==================================================
        TAX (-)
        ==================================================
        */

        const paymentTaxMinus =
            Number(
                (
                    originalTaxMinus
                    *
                    paymentRatio
                )
                .toFixed(
                    2
                )
            );


        /*
        ==================================================
        DPP
        ==================================================
        */

        const paymentDPP =
            Number(
                (
                    paymentAmount
                    -
                    paymentTaxPlus
                    +
                    paymentTaxMinus
                )
                .toFixed(
                    2
                )
            );


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        const paymentDescription =
            description
            ||
            invoice.description
            ||
            `Payment AP ${
                invoice.invoice_no
                ||
                ""
            }`;


        /*
        ==================================================
        FINAL ACTIVE PAYMENT CHECK
        ==================================================
        */

        const {

            data: finalPayments,

            error: finalPaymentsError

        } = await supabase

            .from(
                "trx_ap_payment"
            )

            .select(`
                id,
                payment_amount,
                gl_journal_id
            `)

            .eq(
                "account_payable_id",
                id
            )

            .not(
                "gl_journal_id",
                "is",
                null
            );


        if (
            finalPaymentsError
        ) {

            throw finalPaymentsError;

        }


        const finalPaidBeforeInsert =
            (
                finalPayments
                ||
                []
            )
            .reduce(
                (
                    total,
                    payment
                ) => {

                    return (
                        total
                        +
                        Number(
                            payment.payment_amount
                            ||
                            0
                        )
                    );

                },
                0
            );


        const finalOutstandingBeforeInsert =
            Math.max(
                totalAmount
                -
                finalPaidBeforeInsert,
                0
            );


        if (
            finalOutstandingBeforeInsert <= 0
        ) {

            throw new Error(
                "Account Payable has already been fully paid."
            );

        }


        if (
            paymentAmount
            >
            finalOutstandingBeforeInsert
        ) {

            throw new Error(
                `Payment Amount cannot exceed current Outstanding Amount (${this.formatCurrency(
                    finalOutstandingBeforeInsert
                )}).`
            );

        }


        /*
        ==================================================
        GENERATE PAYMENT GL JOURNAL
        ==================================================
        */

        createdJournal =
            await this.generateAPPaymentJournal(
                invoice,
                details,
                {

                    payment_date:
                        paymentDate,

                    bank_account_id:
                        bankAccountId,

                    amount:
                        paymentAmount,

                    dpp_amount:
                        paymentDPP,

                    tax_plus_amount:
                        paymentTaxPlus,

                    tax_minus_amount:
                        paymentTaxMinus,

                    reference_no:
                        referenceNo,

                    description:
                        paymentDescription

                }
            );


        if (
            !createdJournal
            ||
            !createdJournal.id
        ) {

            throw new Error(
                "Failed to generate AP Payment GL Journal."
            );

        }


        /*
        ==================================================
        PAYMENT DATA
        ==================================================
        */

        const paymentData = {

            account_payable_id:
                id,

            payment_date:
                paymentDate,

            bank_account_id:
                bankAccountId,

            dpp_amount:
                paymentDPP,

            tax_plus_amount:
                paymentTaxPlus,

            tax_minus_amount:
                paymentTaxMinus,

            payment_amount:
                paymentAmount,

            reference_no:
                referenceNo,

            description:
                paymentDescription,

            gl_journal_id:
                createdJournal.id

        };


        /*
        ==================================================
        INSERT PAYMENT
        ==================================================
        */

        createdPayment =
            await this.service.createPayment(
                paymentData
            );


        if (
            !createdPayment
            ||
            !createdPayment.id
        ) {

            throw new Error(
                "Failed to save Account Payable Payment."
            );

        }


        /*
        ==================================================
        VERIFY GL LINK
        ==================================================
        */

        if (
            !createdPayment.gl_journal_id
            ||
            String(
                createdPayment.gl_journal_id
            )
            !==
            String(
                createdJournal.id
            )
        ) {

            throw new Error(
                "AP Payment GL Journal link is invalid."
            );

        }


        /*
        ==================================================
        UPDATE PAYMENT STATUS
        ==================================================
        */

        await this.service.updatePaymentStatus(
            id
        );


        /*
        ==================================================
        GET FINAL FRESH AP
        ==================================================
        */

        const finalResult =
            await this.service.getById(
                id
            );


        const updatedInvoice =
            finalResult?.header
            ||
            null;


        if (
            !updatedInvoice
        ) {

            throw new Error(
                "Failed to verify Account Payable after payment."
            );

        }


        /*
        ==================================================
        FORCE REFRESH LIST DATA
        ==================================================
        */

        const freshData =
            await this.service.getAll();


        this.data =
            Array.isArray(
                freshData
            )
                ? freshData
                : [];


        this.filteredData =
            [
                ...this.data
            ];


        /*
        ==================================================
        KEEP CURRENT PAGE VALID
        ==================================================
        */

        const totalPages =
            Math.max(
                Math.ceil(
                    this.filteredData.length
                    /
                    this.pageSize
                ),
                1
            );


        if (
            this.currentPage
            >
            totalPages
        ) {

            this.currentPage =
                totalPages;

        }


        /*
        ==================================================
        RENDER TABLE DIRECTLY
        ==================================================
        */

        if (
            typeof this.renderTable
            ===
            "function"
        ) {

            this.renderTable();

        }

        else {

            await this.loadData(
                false
            );

        }


        /*
        ==================================================
        CLOSE PAYMENT MODAL
        ==================================================
        */

        if (
            this.accountPayablePaymentModal
        ) {

            const paymentModal =
                bootstrap.Modal.getInstance(
                    this.accountPayablePaymentModal
                )
                ||
                bootstrap.Modal.getOrCreateInstance(
                    this.accountPayablePaymentModal
                );


            paymentModal.hide();

        }


        /*
        ==================================================
        CLEAR STATE
        ==================================================
        */

        this.currentPaymentAPId =
            null;


        if (
            this.apPaymentAPId
        ) {

            this.apPaymentAPId.value =
                "";

        }


        if (
            this.apPaymentAmount
        ) {

            this.apPaymentAmount.value =
                "";

        }


        if (
            this.apPaymentReferenceNo
        ) {

            this.apPaymentReferenceNo.value =
                "";

        }


        if (
            this.apPaymentDescription
        ) {

            this.apPaymentDescription.value =
                "";

        }


        /*
        ==================================================
        REFRESH ACCOUNT PAYABLE
        NO LOADING
        ==================================================
        */

        await this.loadData(
            false
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return {

            payment:
                createdPayment,

            journal:
                createdJournal,

            accountPayable:
                updatedInvoice

        };

    }

    catch (error) {

        console.error(
            "AccountPayable.saveAPPayment:",
            error
        );


        /*
        ==================================================
        ROLLBACK PAYMENT
        ==================================================
        */

        if (
            createdPayment?.id
        ) {

            try {

                await supabase

                    .from(
                        "trx_ap_payment"
                    )

                    .delete()

                    .eq(
                        "id",
                        createdPayment.id
                    );


                createdPayment =
                    null;

            }

            catch (
                rollbackPaymentException
            ) {

                console.error(
                    "AP PAYMENT ROLLBACK EXCEPTION:",
                    rollbackPaymentException
                );

            }

        }


        /*
        ==================================================
        ROLLBACK JOURNAL
        ==================================================
        */

        if (
            createdJournal?.id
        ) {

            try {

                await supabase

                    .from(
                        "trx_gl_journal"
                    )

                    .delete()

                    .eq(
                        "id",
                        createdJournal.id
                    );


                createdJournal =
                    null;

            }

            catch (
                rollbackJournalException
            ) {

                console.error(
                    "AP PAYMENT JOURNAL ROLLBACK EXCEPTION:",
                    rollbackJournalException
                );

            }

        }


        /*
        ==================================================
        RESYNC STATUS
        ==================================================
        */

        if (
            currentAPId
        ) {

            try {

                await this.service.updatePaymentStatus(
                    currentAPId
                );


                /*
                ==============================================
                FORCE REFRESH EVEN AFTER ERROR
                ==============================================
                */

                await this.loadData(
                    false
                );

            }

            catch (
                syncError
            ) {

                console.error(
                    "AP PAYMENT STATUS RESYNC ERROR:",
                    syncError
                );

            }

        }


        /*
        ==================================================
        ERROR
        ==================================================
        */

        this.showError(
            error.message
            ||
            "Failed to save AP Payment."
        );


        return null;

    }

    finally {

        /*
        ==================================================
        RELEASE INTERNAL LOCK
        ==================================================
        */

        this.isSavingAPPayment =
            false;


        /*
        ==================================================
        RELEASE BUTTON LOCK
        ==================================================
        */

        if (
            this.btnSaveAPPayment
        ) {

            this.btnSaveAPPayment.dataset.processing =
                "false";

            this.btnSaveAPPayment.disabled =
                false;

        }

    }

}
/*
======================================================
EDIT INVOICE DETAIL
======================================================
*/

async editInvoiceDetail(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Invoice Detail ID is required."
            );

        }


        /*
        ==================================================
        FIND DETAIL
        ==================================================
        */

        const detail =
            this.invoiceDetails.find(
                item =>
                    String(item.id)
                    ===
                    String(id)
            );


        if (!detail) {

            this.showError(
                "Invoice detail not found."
            );

            return;

        }


        /*
        ==================================================
        SET EDIT DETAIL STATE
        ==================================================
        */

        this.currentDetailId =
            id;


        /*
        ==================================================
        LOAD COA
        REBUILD TOM SELECT
        ==================================================
        */

        await this.loadDetailCOA();


        /*
        ==================================================
        ENSURE TAX MASTER READY
        ==================================================
        */

        if (
            !Array.isArray(this.taxPlusData)
            ||
            !Array.isArray(this.taxMinusData)
        ) {

            await this.loadTaxMaster();

        }
        else {

            this.renderTaxMasterOptions();

        }


        /*
        ==================================================
        GET FORM ELEMENT
        ==================================================
        */

        const detailId =
            document.getElementById(
                "ap-detail-id"
            );


        const description =
            document.getElementById(
                "ap-detail-description"
            );


        /*
        ==================================================
        DETAIL ID
        ==================================================
        */

        if (detailId) {

            detailId.value =
                detail.id
                || "";

        }


        /*
        ==================================================
        DEBIT / CHARGE ACCOUNT
        TOM SELECT
        ==================================================
        */

        const selectedCOAId =
            String(
                detail.charge_account_id
                || ""
            );


        if (
            this.apDetailCOASelect
        ) {

            this.apDetailCOASelect.setValue(
                selectedCOAId,
                true
            );


            this.apDetailCOASelect.setTextboxValue(
                ""
            );

        }
        else if (
            this.apDetailCOA
        ) {

            this.apDetailCOA.value =
                selectedCOAId;

        }


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        if (description) {

            description.value =
                detail.description
                || "";

        }


        /*
        ==================================================
        QUANTITY
        ==================================================
        */

        if (
            this.apDetailQuantity
        ) {

            this.apDetailQuantity.value =
                Number(
                    detail.quantity
                    || 1
                );

        }


        /*
        ==================================================
        UNIT PRICE
        ==================================================
        */

        if (
            this.apDetailUnitPrice
        ) {

            this.apDetailUnitPrice.value =
                Number(
                    detail.unit_price
                    || 0
                )
                .toLocaleString(
                    "id-ID"
                );

        }


        /*
        ==================================================
        TAX (+)
        FIND TAX MASTER ID
        ==================================================
        */

        let taxPlusId =
            detail.tax_plus_id
            || null;


        /*
        ==================================================
        FALLBACK FOR OLD AP DATA
        ==================================================
        */

        if (
            !taxPlusId
            &&
            Number(
                detail.tax_input_rate
                || 0
            ) > 0
        ) {

            const taxPlus =
                this.taxPlusData.find(
                    tax => {

                        /*
                        ==================================
                        PRIORITY NAME
                        ==================================
                        */

                        if (
                            detail.tax_plus_name
                            &&
                            String(tax.tax_name)
                            ===
                            String(
                                detail.tax_plus_name
                            )
                        ) {

                            return true;

                        }


                        /*
                        ==================================
                        PRIORITY CODE
                        ==================================
                        */

                        if (
                            detail.tax_plus_code
                            &&
                            String(tax.tax_code)
                            ===
                            String(
                                detail.tax_plus_code
                            )
                        ) {

                            return true;

                        }


                        /*
                        ==================================
                        FALLBACK RATE
                        ==================================
                        */

                        return (
                            Number(
                                tax.tax_rate
                                || 0
                            )
                            ===
                            Number(
                                detail.tax_input_rate
                                || 0
                            )
                        );

                    }
                );


            taxPlusId =
                taxPlus?.id
                || null;

        }


        /*
        ==================================================
        SET TAX (+)
        ==================================================
        */

        if (
            this.apDetailTaxInputRate
        ) {

            this.apDetailTaxInputRate.value =
                taxPlusId
                    ? String(taxPlusId)
                    : "";

        }


        /*
        ==================================================
        TAX (-)
        FIND TAX MASTER ID
        ==================================================
        */

        let taxMinusId =
            detail.tax_minus_id
            || null;


        /*
        ==================================================
        FALLBACK FOR OLD AP DATA
        ==================================================
        */

        if (
            !taxMinusId
            &&
            Number(
                detail.withholding_tax_rate
                || 0
            ) > 0
        ) {

            const taxMinus =
                this.taxMinusData.find(
                    tax => {

                        /*
                        ==================================
                        PRIORITY NAME
                        ==================================
                        */

                        if (
                            detail.tax_minus_name
                            &&
                            String(tax.tax_name)
                            ===
                            String(
                                detail.tax_minus_name
                            )
                        ) {

                            return true;

                        }


                        /*
                        ==================================
                        PRIORITY CODE
                        ==================================
                        */

                        if (
                            detail.tax_minus_code
                            &&
                            String(tax.tax_code)
                            ===
                            String(
                                detail.tax_minus_code
                            )
                        ) {

                            return true;

                        }


                        /*
                        ==================================
                        FALLBACK RATE
                        ==================================
                        */

                        return (
                            Number(
                                tax.tax_rate
                                || 0
                            )
                            ===
                            Number(
                                detail.withholding_tax_rate
                                || 0
                            )
                        );

                    }
                );


            taxMinusId =
                taxMinus?.id
                || null;

        }


        /*
        ==================================================
        SET TAX (-)
        ==================================================
        */

        if (
            this.apDetailWithholdingTaxRate
        ) {

            this.apDetailWithholdingTaxRate.value =
                taxMinusId
                    ? String(taxMinusId)
                    : "";

        }


        /*
        ==================================================
        CALCULATE DETAIL
        ==================================================
        */

        this.calculateDetail();


        /*
        ==================================================
        CHANGE BUTTON TO UPDATE
        ==================================================
        */

        if (
            this.btnSaveAPDetail
        ) {

            this.btnSaveAPDetail.innerHTML = `
                <i class="fa-solid fa-floppy-disk me-1"></i>
                Update Detail
            `;

        }


        /*
        ==================================================
        VALIDATE DETAIL MODAL
        ==================================================
        */

        if (
            !this.accountPayableDetailModal
        ) {

            throw new Error(
                "Account Payable Detail Modal not found."
            );

        }


        /*
        ==================================================
        SHOW DETAIL MODAL
        ==================================================
        */

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                this.accountPayableDetailModal
            );


        modal.show();


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP Edit Detail:",
            {
                id:
                    detail.id,

                charge_account_id:
                    detail.charge_account_id,

                tax_plus_id:
                    taxPlusId,

                tax_minus_id:
                    taxMinusId,

                detail
            }
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.editInvoiceDetail:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to edit invoice detail."
        );

    }

}
/*
======================================================
SHOW SUCCESS
======================================================
*/

showSuccess(message) {

    /*
    ==================================================
    VALIDATION
    ==================================================
    */

    if (!message) {

        message =
            "Operation completed successfully.";

    }


    /*
    ==================================================
    CONSOLE
    ==================================================
    */

    console.log(
        "Account Payable SUCCESS:",
        message
    );


    /*
    ==================================================
    USE EXISTING ALERT SYSTEM
    ==================================================
    */

    if (
        typeof window.showSuccess ===
        "function"
    ) {

        window.showSuccess(
            message
        );

        return;

    }


    /*
    ==================================================
    FALLBACK
    ==================================================
    */

    alert(message);

}
/*
======================================================
CONFIRM DELETE ACCOUNT PAYABLE
======================================================
*/

async confirmDelete() {

    try {

        /*
        ==================================================
        GET DELETE ID
        ==================================================
        */

        const id =
            this.deleteInvoiceId;


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            this.showError(
                "Account Payable ID is missing."
            );

            return;

        }


        /*
        ==================================================
        DISABLE CONFIRM BUTTON
        ==================================================
        */

        if (
            this.btnConfirmApDeleteInvoice
        ) {

            this.btnConfirmApDeleteInvoice.disabled =
                true;

        }


        /*
        ==================================================
        DELETE
        ==================================================
        */

        await this.service.delete(
            id
        );


        /*
        ==================================================
        CLEAR DELETE ID
        ==================================================
        */

        this.deleteInvoiceId =
            null;


        /*
        ==================================================
        CLOSE DELETE MODAL
        ==================================================
        */

        if (
            this.apDeleteInvoiceModal
        ) {

            const modal =
                bootstrap.Modal.getInstance(
                    this.apDeleteInvoiceModal
                );


            modal?.hide();

        }


        /*
        ==================================================
        REFRESH DATA
        ==================================================
        */

        await this.refresh();


        /*
        ==================================================
        SUCCESS ALERT
        ==================================================
        */

        this.showSuccess(
            "Account Payable deleted successfully."
        );

    }

    catch (error) {

        /*
        ==================================================
        ERROR
        ==================================================
        */

        console.error(
            "AccountPayable.confirmDelete:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to delete Account Payable."
        );

    }

    finally {

        /*
        ==================================================
        ENABLE CONFIRM BUTTON
        ==================================================
        */

        if (
            this.btnConfirmApDeleteInvoice
        ) {

            this.btnConfirmApDeleteInvoice.disabled =
                false;

        }

    }

}
/*
======================================================
DELETE INVOICE DETAIL
======================================================
*/

deleteInvoiceDetail(id) {

    try {

        const detail =
            this.invoiceDetails.find(
                item =>
                    String(item.id)
                    ===
                    String(id)
            );


        if (!detail) {

            this.showError(
                "Invoice detail not found."
            );

            return;

        }


        /*
        ==================================================
        STORE PENDING DELETE
        ==================================================
        */

        this.pendingDeleteDetailId =
            id;


        /*
        ==================================================
        DETAIL NAME
        ==================================================
        */

        const detailName =
            document.getElementById(
                "ap-delete-detail-name"
            );


        if (detailName) {

            detailName.textContent =
                detail.description
                ||
                detail.account_name
                ||
                "Invoice Detail";

        }


        /*
        ==================================================
        SHOW BOOTSTRAP MODAL
        ==================================================
        */

        const modalElement =
            document.getElementById(
                "apDeleteDetailModal"
            );


        if (!modalElement) {

            this.showError(
                "Delete confirmation modal not found."
            );

            return;

        }


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    }

    catch (error) {

        console.error(
            "AccountPayable.deleteInvoiceDetail:",
            error
        );

        this.showError(
            error.message
            ||
            "Failed to prepare delete action."
        );

    }

}
    /*
======================================================
SAVE INVOICE DETAIL
======================================================
*/

saveInvoiceDetail() {

    try {

        /*
        ==================================================
        GET FORM VALUES
        ==================================================
        */

        const coaId =
            this.apDetailCOA?.value
            || "";

        const descriptionElement =
            document.getElementById(
                "ap-detail-description"
            );

        const description =
            descriptionElement?.value
            ?.trim()
            || "";


        const quantity =
            Number(
                this.apDetailQuantity?.value
                || 0
            );


        const unitPrice =
    Number(
        (
            this.apDetailUnitPrice?.value
            || "0"
        ).replace(
            /\./g,
            ""
        )
    );


        /*
==================================================
TAX (+)
FROM TAX MASTER
==================================================
*/

const taxPlusId =
    this.apDetailTaxInputRate?.value
    || null;


const taxPlusOption =
    this.apDetailTaxInputRate
        ?.selectedOptions?.[0];


const taxInputRate =
    Number(
        taxPlusOption
            ?.dataset
            ?.rate
        || 0
    );


        /*
==================================================
TAX (-)
FROM TAX MASTER
==================================================
*/

const taxMinusId =
    this.apDetailWithholdingTaxRate?.value
    || null;


const taxMinusOption =
    this.apDetailWithholdingTaxRate
        ?.selectedOptions?.[0];


const withholdingTaxRate =
    Number(
        taxMinusOption
            ?.dataset
            ?.rate
        || 0
    );


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!coaId) {

            this.showError(
                "Chart of Account is required."
            );

            this.apDetailCOA?.focus();

            return;

        }


        if (
            quantity <= 0
        ) {

            this.showError(
                "Quantity must be greater than 0."
            );

            this.apDetailQuantity?.focus();

            return;

        }


        if (
            unitPrice < 0
        ) {

            this.showError(
                "Unit Price cannot be negative."
            );

            this.apDetailUnitPrice?.focus();

            return;

        }


        if (
            taxInputRate < 0
        ) {

            this.showError(
                "Tax Input Rate cannot be negative."
            );

            this.apDetailTaxInputRate?.focus();

            return;

        }


        if (
            withholdingTaxRate < 0
        ) {

            this.showError(
                "Withholding Tax Rate cannot be negative."
            );

            this.apDetailWithholdingTaxRate?.focus();

            return;

        }


        /*
        ==================================================
        FIND COA
        ==================================================
        */

        const coa =
            this.currentCOA?.find(
                account =>
                    String(account.id)
                    ===
                    String(coaId)
            )
            || null;


        /*
        ==================================================
        CALCULATE
        ==================================================
        */

        const calculated =
            this.service.calculateDetailAmount({

                quantity,

                unit_price:
                    unitPrice,

                tax_input_rate:
                    taxInputRate,

                withholding_tax_rate:
                    withholdingTaxRate

            });


       /*
==================================================
CREATE / UPDATE DETAIL
==================================================
*/

const detail = {

    id:
        this.currentDetailId
        ||
        crypto.randomUUID(),

    charge_account_id:
        Number(
            coaId
        ),

    account_code:
        coa?.account_code
        || "",

    account_name:
        coa?.account_name
        || "",

    description,

    quantity,

    unit_price:
        unitPrice,


    /*
    ==============================================
    TAX (+)
    ==============================================
    */

    tax_plus_id:
        taxPlusId
            ? Number(taxPlusId)
            : null,

    tax_plus_code:
        taxPlusOption?.dataset?.taxCode
        || "",

    tax_plus_name:
        taxPlusOption?.dataset?.taxName
        || "",

    tax_plus_account_id:
        taxPlusOption?.dataset?.accountId
            ? Number(
                taxPlusOption.dataset.accountId
            )
            : null,

    tax_input_rate:
        taxInputRate,

    tax_input_amount:
        calculated.tax_input_amount,


    /*
    ==============================================
    TAX (-)
    ==============================================
    */

    tax_minus_id:
        taxMinusId
            ? Number(taxMinusId)
            : null,

    tax_minus_code:
        taxMinusOption?.dataset?.taxCode
        || "",

    tax_minus_name:
        taxMinusOption?.dataset?.taxName
        || "",

    tax_minus_account_id:
        taxMinusOption?.dataset?.accountId
            ? Number(
                taxMinusOption.dataset.accountId
            )
            : null,

    withholding_tax_rate:
        withholdingTaxRate,

    withholding_tax_amount:
        calculated.withholding_tax_amount,


    /*
    ==============================================
    AMOUNT
    ==============================================
    */

    line_amount:
        calculated.line_amount,

    total_amount:
        calculated.total_amount

};

/*
==================================================
ADD / UPDATE ARRAY
==================================================
*/

if (
    this.currentDetailId
) {

    const index =
        this.invoiceDetails.findIndex(
            item =>
                String(item.id)
                ===
                String(
                    this.currentDetailId
                )
        );


    if (index === -1) {

        throw new Error(
            "Invoice detail to update was not found."
        );

    }


    this.invoiceDetails[index] =
        detail;


    console.log(
        "AP Invoice Detail updated:",
        JSON.stringify(
            detail,
            null,
            2
        )
    );

}

else {

    this.invoiceDetails.push(
        detail
    );


    console.log(
        "AP Invoice Detail added:",
        JSON.stringify(
            detail,
            null,
            2
        )
    );

}

        /*
        ==================================================
        RENDER DETAIL TABLE
        ==================================================
        */

       this.renderInvoiceDetails();


/*
==================================================
RENDER TAX (+)
==================================================
*/

this.renderTaxPlus();


/*
==================================================
RENDER TAX (-)
==================================================
*/

this.renderTaxMinus();


        /*
        ==================================================
        CLOSE MODAL
        ==================================================
        */

        const modal =
            bootstrap.Modal.getInstance(
                this.accountPayableDetailModal
            );


        modal?.hide();


        /*
        ==================================================
        RESET FORM
        ==================================================
        */

        this.resetInvoiceDetailForm();


        console.log(
    "AP Invoice Detail added:",
    JSON.stringify(
        detail,
        null,
        2
    )
);
    }

    catch (error) {

        console.error(
            "AccountPayable.saveInvoiceDetail:",
            error
        );

        this.showError(
            error.message
            || "Failed to save invoice detail."
        );

    }

}
/*
======================================================
UPDATE INVOICE SUMMARY
======================================================
*/

updateInvoiceSummary() {

    /*
    ==================================================
    GET DETAILS
    ==================================================
    */

    const details =
        Array.isArray(this.invoiceDetails)
            ? this.invoiceDetails
            : [];


    /*
    ==================================================
    CALCULATE SUMMARY
    ==================================================
    */

    let subtotal = 0;
    let tax = 0;
    let wht = 0;


    details.forEach(detail => {

        subtotal +=
            Number(
                detail.line_amount
                || 0
            );

        tax +=
            Number(
                detail.tax_input_amount
                || 0
            );

        wht +=
            Number(
                detail.withholding_tax_amount
                || 0
            );

    });


    /*
    ==================================================
    TOTAL
    ==================================================
    */

    const total =
        subtotal
        + tax
        - wht;


    /*
    ==================================================
    RENDER SUMMARY
    ==================================================
    */

    if (this.apFormSubtotal) {

        this.apFormSubtotal.textContent =
            this.formatCurrency(
                subtotal
            );

    }


    if (this.apFormTax) {

        this.apFormTax.textContent =
            this.formatCurrency(
                tax
            );

    }


    if (this.apFormWht) {

        this.apFormWht.textContent =
            this.formatCurrency(
                wht
            );

    }


    if (this.apFormTotal) {

        this.apFormTotal.textContent =
            this.formatCurrency(
                total
            );

    }


    /*
    ==================================================
    DEBUG
    ==================================================
    */

    console.log(
        "AP SUMMARY:",
        {
            subtotal,
            tax,
            wht,
            total
        }
    );
    /*
==================================================
SYNC TAX TABS
==================================================
*/

this.renderTaxPlus();

this.renderTaxMinus();


/*
==================================================
DEBUG
==================================================
*/

console.log(
    "AP SUMMARY:",
    {
        subtotal,
        tax,
        wht,
        total
    }
);

}
/*
======================================================
FORMAT CURRENCY
======================================================
*/

formatCurrency(value) {

    const amount =
        Number(value || 0);

    return new Intl.NumberFormat(
        "id-ID",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(amount);

}
/*
======================================================
RENDER INVOICE DETAILS
======================================================
*/

renderInvoiceDetails() {

    const tableBody =
        document.getElementById(
            "ap-detail-body"
        );


    if (!tableBody) {

        console.warn(
            "AP detail body not found."
        );

        return;

    }


    /*
    ==================================================
    EMPTY DETAIL
    ==================================================
    */

    if (
        !Array.isArray(
            this.invoiceDetails
        )
        ||
        !this.invoiceDetails.length
    ) {

        tableBody.innerHTML = `

            <tr
                id="ap-detail-empty">

                <td
                    colspan="9"
                    class="text-center
                           text-muted
                           py-4">

                    No detail added.

                </td>

            </tr>

        `;


        /*
        ==================================================
        UPDATE SUMMARY
        ==================================================
        */

        this.updateInvoiceSummary();


        return;

    }


    /*
    ==================================================
    RENDER DETAIL
    ==================================================
    */

    tableBody.innerHTML =
        this.invoiceDetails
            .map(
                (detail, index) => {

                    return `

                        <tr>

                            <!-- ==================================
                                 NO
                            =================================== -->

                            <td>

                                ${index + 1}

                            </td>


                            <!-- ==================================
                                 ACCOUNT
                            =================================== -->

                            <td>

                                <div
                                    class="fw-semibold">

                                    ${detail.account_code || "-"}

                                </div>

                                <div
                                    class="small text-muted">

                                    ${detail.account_name || "-"}

                                </div>

                            </td>


                            <!-- ==================================
                                 DESCRIPTION
                            =================================== -->

                            <td>

                                ${detail.description || "-"}

                            </td>


                            <!-- ==================================
                                 QUANTITY
                            =================================== -->

                            <td
                                class="text-end">

                                ${detail.quantity}

                            </td>


                            <!-- ==================================
                                 UNIT PRICE
                            =================================== -->

                            <td
                                class="text-end">

                                ${this.formatCurrency(
                                    detail.unit_price
                                )}

                            </td>


                            <!-- ==================================
                                 TAX
                            =================================== -->

                            <td
                                class="text-end">

                                ${this.formatCurrency(
                                    detail.tax_input_amount
                                )}

                            </td>


                            <!-- ==================================
                                 WHT
                            =================================== -->

                            <td
                                class="text-end">

                                ${this.formatCurrency(
                                    detail.withholding_tax_amount
                                )}

                            </td>


                            <!-- ==================================
                                 AMOUNT
                            =================================== -->

                            <td
                                class="text-end fw-semibold">

                                ${this.formatCurrency(
                                    detail.total_amount
                                )}

                            </td>


                            <!-- ==================================
                                 ACTION
                            ================================== -->

                            <td
                                class="text-center">

                                <div
                                    class="btn-group btn-group-sm"
                                    role="group">

                                    <!-- EDIT -->

                                   <button
                                    type="button"
                                    class="btn btn-outline-primary"
                                    title="Edit Detail"
                                    data-detail-action="edit"
                                    data-detail-id="${detail.id}">

                                    <i class="fa-solid fa-pen"></i>

                                </button>

                                <button
                                    type="button"
                                    class="btn btn-outline-danger"
                                    title="Remove Detail"
                                    data-detail-action="delete"
                                    data-detail-id="${detail.id}">

                                    <i class="fa-solid fa-trash"></i>

                                </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    /*
    ==================================================
    UPDATE SUMMARY
    ==================================================
    */

    this.updateInvoiceSummary();

}
/*
======================================================
RENDER TAX (+)
AUTO FROM INVOICE DETAILS
======================================================
*/

renderTaxPlus() {

    try {

        /*
        ==================================================
        GET BODY
        ==================================================
        */

        const body =
            document.getElementById(
                "ap-tax-plus-body"
            );


        if (!body) {

            console.warn(
                "Tax (+) table body not found."
            );

            return;

        }


        /*
        ==================================================
        FILTER DETAILS WITH TAX (+)
        ==================================================
        */

        const taxDetails =
            (this.invoiceDetails || [])
                .filter(
                    detail =>
                        Number(
                            detail.tax_input_amount
                            || 0
                        ) > 0
                );


        /*
        ==================================================
        JOURNAL PREVIEW ELEMENTS
        ==================================================
        */

        const previewDebit =
            document.getElementById(
                "ap-tax-plus-preview-debit"
            );


        const previewCredit =
            document.getElementById(
                "ap-tax-plus-preview-credit"
            );


        /*
        ==================================================
        EMPTY
        ==================================================
        */

        if (
            taxDetails.length === 0
        ) {

            body.innerHTML = `

                <tr
                    id="ap-tax-plus-empty">

                    <td
                        colspan="7"
                        class="text-center text-muted py-4">

                        No Tax (+) found from Invoice Details.

                    </td>

                </tr>

            `;


            if (
                previewDebit
            ) {

                previewDebit.textContent =
                    "-";

            }


            if (
                previewCredit
            ) {

                previewCredit.textContent =
                    "-";

            }


            return;

        }


        /*
        ==================================================
        RENDER ROWS
        ==================================================
        */

        body.innerHTML =
            taxDetails
                .map(
                    (
                        detail,
                        index
                    ) => {

                        /*
                        ==========================================
                        TAX BASE
                        ==========================================
                        */

                        const taxBase =
                            Number(
                                detail.line_amount
                                || 0
                            );


                        /*
                        ==========================================
                        TAX RATE
                        ==========================================
                        */

                        const taxRate =
                            Number(
                                detail.tax_input_rate
                                || 0
                            );


                        /*
                        ==========================================
                        TAX AMOUNT
                        ==========================================
                        */

                        const taxAmount =
                            Number(
                                detail.tax_input_amount
                                || 0
                            );


                        /*
                        ==========================================
                        FIND TAX MASTER
                        PRIORITY 1 : TAX ID
                        ==========================================
                        */

                        let taxMaster =
                            null;


                        if (
                            detail.tax_plus_id
                            &&
                            Array.isArray(
                                this.taxPlusData
                            )
                        ) {

                            taxMaster =
                                this.taxPlusData.find(
                                    tax =>
                                        String(
                                            tax.id
                                        )
                                        ===
                                        String(
                                            detail.tax_plus_id
                                        )
                                )
                                || null;

                        }


                        /*
                        ==========================================
                        FALLBACK TAX MASTER BY RATE
                        ==========================================
                        */

                        if (
                            !taxMaster
                            &&
                            Array.isArray(
                                this.taxPlusData
                            )
                        ) {

                            taxMaster =
                                this.taxPlusData.find(
                                    tax =>
                                        Number(
                                            tax.tax_rate
                                            || 0
                                        )
                                        ===
                                        taxRate
                                )
                                || null;

                        }


                        /*
                        ==========================================
                        TAX CODE
                        ==========================================
                        */

                        const taxCode =
                            detail.tax_plus_code
                            ||
                            taxMaster?.tax_code
                            ||
                            "TAX (+)";


                        /*
                        ==========================================
                        TAX NAME
                        ==========================================
                        */

                        const taxName =
                            detail.tax_plus_name
                            ||
                            taxMaster?.tax_name
                            ||
                            "Tax Input";


                        /*
                        ==========================================
                        TAX ACCOUNT ID
                        ==========================================
                        */

                        const taxAccountId =
                            Number(
                                detail.tax_plus_account_id
                                ||
                                taxMaster?.tax_account_id
                                ||
                                0
                            );


                        /*
                        ==========================================
                        FIND TAX COA
                        ==========================================
                        */

                        const taxCOA =
                            Array.isArray(
                                this.currentCOA
                            )
                                ? this.currentCOA.find(
                                    account =>
                                        Number(
                                            account.id
                                        )
                                        ===
                                        taxAccountId
                                )
                                : null;


                        /*
                        ==========================================
                        TAX ACCOUNT NAME
                        ==========================================
                        */

                        const taxAccountName =
                            taxCOA?.account_name
                            ||
                            "PPN MASUKAN";


                        /*
                        ==========================================
                        RENDER ROW
                        ==========================================
                        */

                        return `

                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    ${taxCode}
                                </td>

                                <td>
                                    ${taxName}
                                </td>

                                <td>
                                    ${taxAccountName}
                                </td>

                                <td class="text-end">

                                    ${this.formatCurrency(
                                        taxBase
                                    )}

                                </td>

                                <td class="text-end">

                                    ${taxRate}%

                                </td>

                                <td
                                    class="text-end fw-semibold">

                                    ${this.formatCurrency(
                                        taxAmount
                                    )}

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");


        /*
        ==================================================
        JOURNAL PREVIEW
        ==================================================
        */

        const firstDetail =
            taxDetails[0];


        const firstTaxRate =
            Number(
                firstDetail.tax_input_rate
                || 0
            );


        let previewTaxMaster =
            null;


        /*
        ==================================================
        FIND TAX MASTER BY ID
        ==================================================
        */

        if (
            firstDetail.tax_plus_id
            &&
            Array.isArray(
                this.taxPlusData
            )
        ) {

            previewTaxMaster =
                this.taxPlusData.find(
                    tax =>
                        String(
                            tax.id
                        )
                        ===
                        String(
                            firstDetail.tax_plus_id
                        )
                )
                || null;

        }


        /*
        ==================================================
        FALLBACK BY RATE
        ==================================================
        */

        if (
            !previewTaxMaster
            &&
            Array.isArray(
                this.taxPlusData
            )
        ) {

            previewTaxMaster =
                this.taxPlusData.find(
                    tax =>
                        Number(
                            tax.tax_rate
                            || 0
                        )
                        ===
                        firstTaxRate
                )
                || null;

        }


        /*
        ==================================================
        TAX ACCOUNT ID
        ==================================================
        */

        const previewTaxAccountId =
            Number(
                firstDetail.tax_plus_account_id
                ||
                previewTaxMaster?.tax_account_id
                ||
                0
            );


        /*
        ==================================================
        FIND TAX COA
        ==================================================
        */

        const previewTaxCOA =
            Array.isArray(
                this.currentCOA
            )
                ? this.currentCOA.find(
                    account =>
                        Number(
                            account.id
                        )
                        ===
                        previewTaxAccountId
                )
                : null;


        /*
        ==================================================
        TAX ACCOUNT NAME
        ==================================================
        */

        const previewTaxAccountName =
            previewTaxCOA?.account_name
            ||
            "PPN MASUKAN";


        /*
        ==================================================
        SET JOURNAL PREVIEW
        ==================================================
        */

        if (
            previewDebit
        ) {

            previewDebit.textContent =
                previewTaxAccountName;

        }


        if (
            previewCredit
        ) {

            previewCredit.textContent =
                "HUTANG USAHA";

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP TAX (+) JOURNAL PREVIEW:",
            {
                debit:
                    previewTaxAccountName,

                credit:
                    "HUTANG USAHA",

                tax_account_id:
                    previewTaxAccountId,

                tax_master:
                    previewTaxMaster
            }
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.renderTaxPlus:",
            error
        );

    }

}
/*
======================================================
RENDER TAX (-)
AUTO FROM INVOICE DETAILS
======================================================
*/

renderTaxMinus() {

    try {

        /*
        ==================================================
        GET BODY
        ==================================================
        */

        const body =
            document.getElementById(
                "ap-tax-minus-body"
            );


        if (!body) {

            console.warn(
                "Tax (-) table body not found."
            );

            return;

        }


        /*
        ==================================================
        FILTER DETAILS WITH TAX (-)
        ==================================================
        */

        const taxDetails =
            (this.invoiceDetails || [])
            .filter(
                detail =>
                    Number(
                        detail.withholding_tax_amount
                        || 0
                    ) > 0
            );


        /*
        ==================================================
        EMPTY
        ==================================================
        */

        if (
            taxDetails.length === 0
        ) {

            body.innerHTML = `
                <tr
                    id="ap-tax-minus-empty">

                    <td
                        colspan="7"
                        class="text-center
                               text-muted
                               py-4">

                        No Tax (-) found from Invoice Details.

                    </td>

                </tr>
            `;

            return;

        }


        /*
        ==================================================
        RENDER ROWS
        ==================================================
        */

        body.innerHTML =
            taxDetails
            .map(
                (
                    detail,
                    index
                ) => {

                    const taxBase =
                        Number(
                            detail.line_amount
                            || 0
                        );


                    const taxRate =
                        Number(
                            detail.withholding_tax_rate
                            || 0
                        );


                    const taxAmount =
                        Number(
                            detail.withholding_tax_amount
                            || 0
                        );


                    return `

                        <tr>

                            <!-- NO -->

                            <td>

                                ${index + 1}

                            </td>


                            <!-- TAX CODE -->

                            <td>

                                WHT

                            </td>


                            <!-- TAX NAME -->

                            <td>

                                Withholding Tax

                            </td>


                            <!-- TAX ACCOUNT -->

                            <td>

                                HUTANG PPH 22/23

                            </td>


                            <!-- TAX BASE -->

                            <td
                                class="text-end">

                                ${this.formatCurrency(
                                    taxBase
                                )}

                            </td>


                            <!-- RATE -->

                            <td
                                class="text-end">

                                ${taxRate}%

                            </td>


                            <!-- TAX AMOUNT -->

                            <td
                                class="text-end
                                       fw-semibold">

                                ${this.formatCurrency(
                                    taxAmount
                                )}

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

    }

    catch (error) {

        console.error(
            "AccountPayable.renderTaxMinus:",
            error
        );

    }

}
/*
======================================================
BOOTSTRAP CONFIRM MODAL
======================================================
*/

showConfirmModal({

    title = "Confirmation",

    message = "Are you sure?",

    confirmText = "Confirm",

    confirmClass = "btn-primary",

    icon = "fa-solid fa-circle-question",

    onConfirm = null

} = {}) {


    /*
    ==================================================
    REMOVE EXISTING MODAL
    ==================================================
    */

    const existing =
        document.getElementById(
            "ap-confirm-modal"
        );


    if (existing) {

        existing.remove();

    }


    /*
    ==================================================
    CREATE MODAL
    ==================================================
    */

    const modalHTML = `

        <div
            class="modal fade"
            id="ap-confirm-modal"
            tabindex="-1"
            aria-hidden="true"
        >

            <div
                class="modal-dialog modal-dialog-centered"
            >

                <div class="modal-content shadow-lg">


                    <!-- ==================================
                    HEADER
                    ================================== -->

                    <div class="modal-header">

                        <h5 class="modal-title">

                            <i
                                class="${icon} me-2"
                            ></i>

                            ${title}

                        </h5>


                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>

                    </div>


                    <!-- ==================================
                    BODY
                    ================================== -->

                    <div class="modal-body">

                        <div class="text-muted">

                            ${message}

                        </div>

                    </div>


                    <!-- ==================================
                    FOOTER
                    ================================== -->

                    <div class="modal-footer">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >

                            <i
                                class="fa-solid fa-xmark me-1"
                            ></i>

                            Cancel

                        </button>


                        <button
                            type="button"
                            class="btn ${confirmClass}"
                            id="ap-confirm-button"
                        >

                            <i
                                class="${icon} me-1"
                            ></i>

                            ${confirmText}

                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;


    /*
    ==================================================
    APPEND
    ==================================================
    */

    document.body.insertAdjacentHTML(
        "beforeend",
        modalHTML
    );


    /*
    ==================================================
    GET ELEMENT
    ==================================================
    */

    const modalElement =
        document.getElementById(
            "ap-confirm-modal"
        );


    const confirmButton =
        document.getElementById(
            "ap-confirm-button"
        );


    /*
    ==================================================
    BOOTSTRAP MODAL
    ==================================================
    */

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    /*
    ==================================================
    CONFIRM ACTION
    ==================================================
    */

    confirmButton.addEventListener(
        "click",
        async () => {

            /*
            ==========================================
            DISABLE BUTTON
            ==========================================
            */

            confirmButton.disabled =
                true;


            try {

                if (
                    typeof onConfirm
                    ===
                    "function"
                ) {

                    await onConfirm();

                }


                modal.hide();

            }

            catch (error) {

                console.error(
                    "AccountPayable.showConfirmModal:",
                    error
                );

                this.showError(
                    error.message
                    ||
                    "Action failed."
                );

            }

        }
    );


    /*
    ==================================================
    SHOW
    ==================================================
    */

    modal.show();

}
/*
======================================================
SHOW ERROR
======================================================
*/

showError(message) {

    console.error(
        "Account Payable:",
        message
    );


    /*
    ==================================================
    BOOTSTRAP ALERT
    ==================================================
    */

    const existingAlert =
        document.getElementById(
            "ap-error-alert"
        );


    if (existingAlert) {

        existingAlert.remove();

    }


    const alert =
        document.createElement(
            "div"
        );


    alert.id =
        "ap-error-alert";


    alert.className =
        "alert alert-danger alert-dismissible fade show position-fixed";


    alert.style.top =
        "80px";


    alert.style.right =
        "20px";


    alert.style.zIndex =
        "9999";


    alert.innerHTML = `

        <strong>Error:</strong>

        ${message}

        <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert">
        </button>

    `;


    document.body.appendChild(
        alert
    );


    /*
    ==================================================
    AUTO HIDE
    ==================================================
    */

    setTimeout(
        () => {

            alert.remove();

        },
        4000
    );

}
/*
======================================================
FORMAT UNIT PRICE
======================================================
*/

formatUnitPrice() {

    if (!this.apDetailUnitPrice) {

        return;

    }


    /*
    ==================================================
    GET RAW VALUE
    ==================================================
    */

    let value =
        this.apDetailUnitPrice.value
        || "";


    /*
    ==================================================
    REMOVE NON NUMERIC CHARACTER
    ==================================================
    */

    value =
        value.replace(
            /\D/g,
            ""
        );


    /*
    ==================================================
    EMPTY VALUE
    ==================================================
    */

    if (!value) {

        this.apDetailUnitPrice.value = "0";

        return;

    }


    /*
    ==================================================
    FORMAT THOUSANDS
    ==================================================
    */

    this.apDetailUnitPrice.value =
        Number(value).toLocaleString(
            "id-ID"
        );

}
    /*
======================================================
CALCULATE DETAIL
======================================================
*/

calculateDetail() {

    const detail = {

        quantity:
            Number(
                this.apDetailQuantity?.value
                || 0
            ),

        unit_price:
            Number(
                (
                    this.apDetailUnitPrice?.value
                    || "0"
                ).replace(
                    /\./g,
                    ""
                )
            ),
        tax_input_rate:
            Number(
                this.apDetailTaxInputRate?.value
                || 0
            ),

        withholding_tax_rate:
            Number(
                this.apDetailWithholdingTaxRate?.value
                || 0
            )

    };


    /*
    ==================================================
    CALCULATE USING SERVICE
    ==================================================
    */

    const calculated =
        this.service.calculateDetailAmount(
            detail
        );


    /*
    ==================================================
    DISPLAY RESULT
    ==================================================
    */

    if (this.apDetailLineAmount) {

        this.apDetailLineAmount.textContent =
            this.formatCurrency(
                calculated.line_amount
            );

    }


    if (this.apDetailTaxInputAmount) {

        this.apDetailTaxInputAmount.textContent =
            this.formatCurrency(
                calculated.tax_input_amount
            );

    }


    if (
        this.apDetailWithholdingTaxAmount
    ) {

        this.apDetailWithholdingTaxAmount.textContent =
            this.formatCurrency(
                calculated.withholding_tax_amount
            );

    }


    if (this.apDetailTotalAmount) {

        this.apDetailTotalAmount.textContent =
            this.formatCurrency(
                calculated.total_amount
            );

    }

}
   /*
======================================================
ADD INVOICE DETAIL
======================================================
*/

async addInvoiceDetail() {

    try {

        console.log(
            "Add Invoice Detail clicked."
        );


        /*
        ==================================================
        CHECK DETAIL MODAL
        ==================================================
        */

        if (
            !this.accountPayableDetailModal
        ) {

            console.error(
                "Account Payable Detail Modal not found."
            );

            return;

        }


        /*
        ==================================================
        RESET DETAIL MODE
        ==================================================
        */

        this.currentDetailId =
            null;


        /*
        ==================================================
        LOAD / REBUILD COA FIRST
        ==================================================
        */

        await this.loadDetailCOA();


        /*
        ==================================================
        RESET FORM AFTER COA READY
        ==================================================
        */

        this.resetInvoiceDetailForm();


        /*
        ==================================================
        FORCE COA EMPTY
        ==================================================
        */

        if (
            this.apDetailCOASelect
        ) {

            this.apDetailCOASelect.clear(
                true
            );


            this.apDetailCOASelect.setTextboxValue(
                ""
            );


            this.apDetailCOASelect.refreshOptions(
                false
            );

        }
        else if (
            this.apDetailCOA
        ) {

            this.apDetailCOA.value =
                "";

        }


        /*
        ==================================================
        TAX (+)
        DEFAULT NO TAX
        ==================================================
        */

        if (
            this.apDetailTaxInputRate
        ) {

            this.apDetailTaxInputRate.value =
                "";

        }


        /*
        ==================================================
        TAX (-)
        DEFAULT NO TAX
        ==================================================
        */

        if (
            this.apDetailWithholdingTaxRate
        ) {

            this.apDetailWithholdingTaxRate.value =
                "";

        }


        /*
        ==================================================
        RESET DESCRIPTION
        ==================================================
        */

        const description =
            document.getElementById(
                "ap-detail-description"
            );


        if (description) {

            description.value =
                "";

        }


        /*
        ==================================================
        RESET QUANTITY
        ==================================================
        */

        if (
            this.apDetailQuantity
        ) {

            this.apDetailQuantity.value =
                "1";

        }


        /*
        ==================================================
        RESET UNIT PRICE
        ==================================================
        */

        if (
            this.apDetailUnitPrice
        ) {

            this.apDetailUnitPrice.value =
                "0";

        }


        /*
        ==================================================
        RESET CALCULATION
        ==================================================
        */

        if (
            this.apDetailLineAmount
        ) {

            this.apDetailLineAmount.textContent =
                "0";

        }


        if (
            this.apDetailTaxInputAmount
        ) {

            this.apDetailTaxInputAmount.textContent =
                "0";

        }


        if (
            this.apDetailWithholdingTaxAmount
        ) {

            this.apDetailWithholdingTaxAmount.textContent =
                "0";

        }


        if (
            this.apDetailTotalAmount
        ) {

            this.apDetailTotalAmount.textContent =
                "0";

        }


        /*
        ==================================================
        SAVE BUTTON
        ==================================================
        */

        if (
            this.btnSaveAPDetail
        ) {

            this.btnSaveAPDetail.innerHTML = `
                <i class="fa-solid fa-floppy-disk me-1"></i>
                Save Detail
            `;

        }


        /*
        ==================================================
        SHOW MODAL
        ==================================================
        */

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                this.accountPayableDetailModal
            );


        modal.show();


        console.log(
            "AP New Detail form reset."
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.addInvoiceDetail:",
            error
        );


        this.showError(
            "Failed to open Invoice Detail."
        );

    }

}
/*
======================================================
RESET INVOICE DETAIL FORM
======================================================
*/

resetInvoiceDetailForm() {

    const fields = [

        "ap-detail-id",

        "ap-detail-description",

        "ap-detail-quantity",

        "ap-detail-unit-price",

        "ap-detail-tax-input-rate",

        "ap-detail-withholding-tax-rate"

    ];


    fields.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;

            }


            /*
            ==========================================
            QUANTITY
            ==========================================
            */

            if (
                id ===
                "ap-detail-quantity"
            ) {

                element.value =
                    "1";

                return;

            }


            /*
            ==========================================
            UNIT PRICE
            ==========================================
            */

            if (
                id ===
                "ap-detail-unit-price"
            ) {

                element.value =
                    "0";

                return;

            }


            /*
            ==========================================
            TAX (+)
            DEFAULT = NO TAX
            ==========================================
            */

            if (
                id ===
                "ap-detail-tax-input-rate"
            ) {

                element.value =
                    "";

                return;

            }


            /*
            ==========================================
            TAX (-)
            DEFAULT = NO TAX
            ==========================================
            */

            if (
                id ===
                "ap-detail-withholding-tax-rate"
            ) {

                element.value =
                    "";

                return;

            }


            /*
            ==========================================
            OTHER FIELD
            ==========================================
            */

            element.value =
                "";

        }
    );


    /*
    ==================================================
    RESET COA
    ==================================================
    */

    if (
        this.apDetailCOASelect
    ) {

        this.apDetailCOASelect.clear(
            true
        );

        this.apDetailCOASelect.setTextboxValue(
            ""
        );

    }
    else if (
        this.apDetailCOA
    ) {

        this.apDetailCOA.value =
            "";

    }


    /*
    ==================================================
    RESET CALCULATION
    ==================================================
    */

    if (
        this.apDetailLineAmount
    ) {

        this.apDetailLineAmount.textContent =
            "0";

    }


    if (
        this.apDetailTaxInputAmount
    ) {

        this.apDetailTaxInputAmount.textContent =
            "0";

    }


    if (
        this.apDetailWithholdingTaxAmount
    ) {

        this.apDetailWithholdingTaxAmount.textContent =
            "0";

    }


    if (
        this.apDetailTotalAmount
    ) {

        this.apDetailTotalAmount.textContent =
            "0";

    }


    /*
    ==================================================
    RESET DETAIL STATE
    ==================================================
    */

    this.currentDetailId =
        null;

}
    /*
======================================================
HANDLE VENDOR CHANGE
======================================================
*/

handleVendorChange() {

    const vendorId =
        this.apFormVendor?.value
        || "";


    /*
    ==================================================
    NO VENDOR
    ==================================================
    */

    if (!vendorId) {

        this.clearVendorTerms();

        return;

    }


    /*
    ==================================================
    FIND VENDOR
    ==================================================
    */

    const vendor =
        this.vendorData.find(
            item =>
                String(item.id) ===
                String(vendorId)
        );


    /*
    ==================================================
    VENDOR NOT FOUND
    ==================================================
    */

    if (!vendor) {

        this.clearVendorTerms();

        return;

    }


    /*
    ==================================================
    STORE ACTIVE VENDOR
    ==================================================
    */

    this.selectedVendor =
        vendor;


    /*
    ==================================================
    RENDER TOP
    ==================================================
    */

    this.renderVendorTOP(
        vendor
    );


    /*
    ==================================================
    CALCULATE DUE DATE
    ==================================================
    */

    this.calculateAPDueDate();

}
/*
======================================================
RENDER VENDOR TOP
======================================================
*/

renderVendorTOP(vendor) {

    if (!this.apFormTop) {

        return;

    }


    const top =
        vendor?.mst_term_of_payment;


    /*
    ==================================================
    NO TOP
    ==================================================
    */

    if (!top) {

        this.apFormTop.value =
            "No Term of Payment";

        return;

    }


    /*
    ==================================================
    CHECK TOP STATUS
    ==================================================
    */

    if (
        top.status !== true &&
        top.status !== "Active"
    ) {

        this.apFormTop.value =
            "No Active Term of Payment";

        return;

    }


    /*
    ==================================================
    DISPLAY TOP
    ==================================================
    */

    this.apFormTop.value =

        `${top.top_code} :: ${top.top_name} (${top.days} Days)`;


    /*
    ==================================================
    STORE TOP ID
    ==================================================
    */

    this.selectedTopId =
        top.id;

}
/*
======================================================
CALCULATE AP DUE DATE
======================================================
*/

calculateAPDueDate() {

    if (!this.apFormDueDate) {

        return;

    }


    const dateReceived =
        this.apFormDateReceived?.value
        || "";


    const vendorId =
        this.apFormVendor?.value
        || "";


    /*
    ==================================================
    VALIDATION
    ==================================================
    */

    if (
        !dateReceived ||
        !vendorId
    ) {

        this.apFormDueDate.value =
            "";

        return;

    }


    /*
    ==================================================
    FIND VENDOR
    ==================================================
    */

    const vendor =
        this.vendorData.find(
            item =>
                String(item.id) ===
                String(vendorId)
        );


    if (!vendor) {

        this.apFormDueDate.value =
            "";

        return;

    }


    /*
    ==================================================
    CALCULATE
    ==================================================
    */

    const dueDate =
        this.service.calculateDueDate(
            dateReceived,
            vendor
        );


    /*
    ==================================================
    SET DUE DATE
    ==================================================
    */

    this.apFormDueDate.value =
        dueDate || "";

}
/*
======================================================
CLEAR VENDOR TERMS
======================================================
*/

clearVendorTerms() {

    this.selectedVendor = null;

    this.selectedTopId = null;


    if (this.apFormTop) {

        this.apFormTop.value = "";

    }


    if (this.apFormDueDate) {

        this.apFormDueDate.value = "";

    }

}

/*
======================================================
ADD ACCOUNT PAYABLE
======================================================
*/

addInvoice() {

    this.currentInvoiceId = null;

    this.currentMode = "add";


    /*
    ==================================================
    CHECK MODAL
    ==================================================
    */

    if (!this.accountPayableModal) {

        console.error(
            "Account Payable modal not found."
        );

        return;

    }


    /*
    ==================================================
    RESET FORM
    ==================================================
    */

    this.resetAddForm();


    /*
    ==================================================
    RESET TAB
    ==================================================
    */

    this.resetAPModalTab();


    /*
    ==================================================
    SHOW MODAL
    ==================================================
    */

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            this.accountPayableModal
        );


    modal.show();

}
/*
======================================================
RESET ADD AP FORM
======================================================
*/

resetAddForm() {

    /*
    ==================================================
    RESET TRANSACTION STATE
    ==================================================
    */

    this.currentInvoiceId =
        null;

    this.currentMode =
        "add";

    this.currentDetailId =
        null;

    this.pendingDeleteDetailId =
        null;

    this.pendingCompleteAPId =
        null;

    this.pendingPostId =
        null;

    this.pendingVoidId =
        null;


    /*
    ==================================================
    RESET SELECTED VENDOR / TOP
    ==================================================
    */

    this.selectedVendor =
        null;

    this.selectedTopId =
        null;


    /*
    ==================================================
    IMPORTANT
    RESTORE ADD MODE

    View mode sebelumnya mengubah field menjadi:
    disabled = true
    readOnly = true

    Saat Add AP dibuka kembali semua field harus
    dikembalikan ke kondisi editable.
    ==================================================
    */

    const editableFields = [

        this.apFormVendor,

        this.apFormPoNo,

        this.apFormInvoiceNo,

        this.apFormInvoiceDate,

        this.apFormDateReceived,

        this.apFormDescription

    ];


    editableFields.forEach(

        field => {

            if (!field) {

                return;

            }


            field.disabled =
                false;

            field.readOnly =
                false;

        }

    );


    /*
    ==================================================
    TERM OF PAYMENT
    AUTO FROM VENDOR
    ==================================================
    */

    if (
        this.apFormTop
    ) {

        this.apFormTop.disabled =
            false;

        this.apFormTop.readOnly =
            true;

        this.apFormTop.value =
            "";

    }


    /*
    ==================================================
    DUE DATE
    AUTO CALCULATED
    ==================================================
    */

    if (
        this.apFormDueDate
    ) {

        this.apFormDueDate.disabled =
            false;

        this.apFormDueDate.readOnly =
            true;

        this.apFormDueDate.value =
            "";

    }


    /*
    ==================================================
    JOURNAL NUMBER
    AUTO GENERATED
    ==================================================
    */

    if (
        this.apFormJournalNo
    ) {

        this.apFormJournalNo.disabled =
            false;

        this.apFormJournalNo.readOnly =
            true;

        this.apFormJournalNo.value =
            "";

    }


    /*
    ==================================================
    ENABLE ADD DETAIL BUTTON
    ==================================================
    */

    if (
        this.btnAddDetail
    ) {

        this.btnAddDetail.disabled =
            false;

    }


    /*
    ==================================================
    ENABLE SAVE DRAFT BUTTON
    ==================================================
    */

    if (
        this.btnSaveDraft
    ) {

        this.btnSaveDraft.disabled =
            false;

        this.btnSaveDraft.innerHTML = `

            <i class="fa-solid fa-floppy-disk me-1"></i>

            Save Draft

        `;

    }


    /*
    ==================================================
    VENDOR
    ==================================================
    */

    if (
        this.apFormVendor
    ) {

        this.apFormVendor.value =
            "";

    }


    /*
    ==================================================
    PO NUMBER
    ==================================================
    */

    if (
        this.apFormPoNo
    ) {

        this.apFormPoNo.value =
            "";

    }


    /*
    ==================================================
    INVOICE NUMBER
    ==================================================
    */

    if (
        this.apFormInvoiceNo
    ) {

        this.apFormInvoiceNo.value =
            "";

    }


    /*
    ==================================================
    INVOICE DATE
    ==================================================
    */

    if (
        this.apFormInvoiceDate
    ) {

        this.apFormInvoiceDate.value =
            "";

    }


    /*
    ==================================================
    DATE RECEIVED
    ==================================================
    */

    if (
        this.apFormDateReceived
    ) {

        this.apFormDateReceived.value =
            "";

    }


    /*
    ==================================================
    DESCRIPTION
    ==================================================
    */

    if (
        this.apFormDescription
    ) {

        this.apFormDescription.value =
            "";

    }


    /*
    ==================================================
    RESET INVOICE DETAIL ARRAY
    ==================================================
    */

    this.invoiceDetails =
        [];


    /*
    ==================================================
    RESET DETAIL FORM
    ==================================================
    */

    this.resetInvoiceDetailForm();


    /*
    ==================================================
    RESET INVOICE DETAIL TABLE
    ==================================================
    */

    if (
        this.apDetailBody
    ) {

        this.apDetailBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-muted py-4">

                    No detail added.

                </td>

            </tr>

        `;

    }


    /*
    ==================================================
    RESET TAX (+) / TAX (-)
    ==================================================
    */

    this.resetAPTaxTables();


    /*
    ==================================================
    RESET TOTAL
    ==================================================
    */

    if (
        this.apFormSubtotal
    ) {

        this.apFormSubtotal.textContent =
            "0";

    }


    if (
        this.apFormTax
    ) {

        this.apFormTax.textContent =
            "0";

    }


    if (
        this.apFormWht
    ) {

        this.apFormWht.textContent =
            "0";

    }


    if (
        this.apFormTotal
    ) {

        this.apFormTotal.textContent =
            "0";

    }


    /*
    ==================================================
    RESET MODAL TITLE
    ==================================================
    */

    const modalTitle =
        document.querySelector(
            "#accountPayableModal .modal-title"
        );


    if (
        modalTitle
    ) {

        modalTitle.textContent =
            "Add Account Payable";

    }


    /*
    ==================================================
    RESET MODAL SUBTITLE
    ==================================================
    */

    const modalSubtitle =
        document.querySelector(
            "#accountPayableModal .modal-subtitle"
        );


    if (
        modalSubtitle
    ) {

        modalSubtitle.textContent =
            "Create new Account Payable";

    }


    /*
    ==================================================
    RESET MODAL TAB
    ==================================================
    */

    this.resetAPModalTab();


    /*
    ==================================================
    DEBUG
    ==================================================
    */

    console.log(
        "AP Add Form completely reset to ADD MODE."
    );

}
/*
======================================================
RESET AP TAX TABLES
Membersihkan history Tax (+) dan Tax (-)
======================================================
*/

resetAPTaxTables() {

    /*
    ==================================================
    TAX (+)
    ==================================================
    */

    const taxPlusBody =
        document.getElementById(
            "ap-tax-plus-body"
        );


    if (taxPlusBody) {

        taxPlusBody.innerHTML = `

            <tr id="ap-tax-plus-empty">

                <td
                    colspan="7"
                    class="text-center
                           text-muted
                           py-4">

                    No Tax (+) found from Invoice Details.

                </td>

            </tr>

        `;

    }


    /*
    ==================================================
    TAX (-)
    ==================================================
    */

    const taxMinusBody =
        document.getElementById(
            "ap-tax-minus-body"
        );


    if (taxMinusBody) {

        taxMinusBody.innerHTML = `

            <tr id="ap-tax-minus-empty">

                <td
                    colspan="7"
                    class="text-center
                           text-muted
                           py-4">

                    No Tax (-) found from Invoice Details.

                </td>

            </tr>

        `;

    }

}

/*
======================================================
RESET AP MODAL TAB
Always start from Header Info
======================================================
*/

resetAPModalTab() {

    const headerTab =
        document.getElementById(
            "ap-header-info-tab"
        );


    const tabs = [
        "ap-header-info-tab",
        "ap-invoice-details-tab",
        "ap-tax-plus-tab",
        "ap-tax-minus-tab"
    ];


    const panes = [
        "ap-header-info-pane",
        "ap-invoice-details-pane",
        "ap-tax-plus-pane",
        "ap-tax-minus-pane"
    ];


    /*
    ==================================================
    RESET TAB BUTTON
    ==================================================
    */

    tabs.forEach(
        id => {

            const element =
                document.getElementById(id);


            if (!element) {

                return;

            }


            element.classList.remove("active");

            element.setAttribute(
                "aria-selected",
                "false"
            );

        }
    );


    /*
    ==================================================
    RESET TAB PANE
    ==================================================
    */

    panes.forEach(
        id => {

            const element =
                document.getElementById(id);


            if (!element) {

                return;

            }


            element.classList.remove(
                "active",
                "show"
            );

        }
    );


    /*
    ==================================================
    FORCE BOOTSTRAP HEADER TAB
    ==================================================
    */

    if (headerTab) {

        const tab =
            bootstrap.Tab.getOrCreateInstance(
                headerTab
            );


        tab.show();

    }

}
  /*
======================================================
SAVE DRAFT
======================================================
*/

async saveDraft() {

    try {

        console.log(
            "SAVE DRAFT CLICKED"
        );


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!this.apFormVendor?.value) {

            return this.showError(
                "Vendor is required."
            );

        }


        if (
            !this.apFormInvoiceNo?.value.trim()
        ) {

            return this.showError(
                "Invoice No is required."
            );

        }


        if (
            !this.apFormInvoiceDate?.value
        ) {

            return this.showError(
                "Invoice Date is required."
            );

        }


        if (
            !this.apFormDateReceived?.value
        ) {

            return this.showError(
                "Date Received is required."
            );

        }


        if (
            !this.apFormDueDate?.value
        ) {

            return this.showError(
                "Due Date is required."
            );

        }


        if (
            !Array.isArray(
                this.invoiceDetails
            )
            ||
            !this.invoiceDetails.length
        ) {

            return this.showError(
                "Please add at least one invoice detail."
            );

        }


        /*
        ==================================================
        HEADER
        ==================================================
        */

        const header = {

            vendor_id:
                this.apFormVendor.value,

            po_no:
                this.apFormPoNo?.value
                    ?.trim()
                || null,

            invoice_no:
                this.apFormInvoiceNo.value
                    .trim(),

            invoice_date:
                this.apFormInvoiceDate.value,

            date_received:
                this.apFormDateReceived.value,

            due_date:
                this.apFormDueDate.value,

            description:
                this.apFormDescription?.value
                    ?.trim()
                || null,

            status:
                "Draft"

        };


        /*
        ==================================================
        DETAILS
        ONLY DATABASE COLUMNS
        ==================================================
        */

        const details =
            this.invoiceDetails.map(
                item => {

                    const chargeAccountId =
                        Number(
                            item.account_id
                            ||
                            item.charge_account_id
                            ||
                            0
                        );


                    return {

                        /*
                        ======================================
                        CHARGE ACCOUNT
                        ======================================
                        */

                        charge_account_id:
                            chargeAccountId,


                        /*
                        ======================================
                        DESCRIPTION
                        ======================================
                        */

                        description:
                            item.description
                            || null,


                        /*
                        ======================================
                        QUANTITY
                        ======================================
                        */

                        quantity:
                            Number(
                                item.quantity
                                || 1
                            ),


                        /*
                        ======================================
                        UNIT PRICE
                        ======================================
                        */

                        unit_price:
                            Number(
                                item.unit_price
                                || 0
                            ),


                        /*
                        ======================================
                        TAX (+)
                        ======================================
                        */

                        tax_plus_id:
                            item.tax_plus_id
                                ? Number(
                                    item.tax_plus_id
                                )
                                : null,

                        tax_plus_account_id:
                            item.tax_plus_account_id
                                ? Number(
                                    item.tax_plus_account_id
                                )
                                : null,

                        tax_input_rate:
                            Number(
                                item.tax_input_rate
                                || 0
                            ),

                        tax_input_amount:
                            Number(
                                item.tax_input_amount
                                || 0
                            ),


                        /*
                        ======================================
                        TAX (-)
                        ======================================
                        */

                        tax_minus_id:
                            item.tax_minus_id
                                ? Number(
                                    item.tax_minus_id
                                )
                                : null,

                        tax_minus_account_id:
                            item.tax_minus_account_id
                                ? Number(
                                    item.tax_minus_account_id
                                )
                                : null,

                        withholding_tax_rate:
                            Number(
                                item.withholding_tax_rate
                                || 0
                            ),

                        withholding_tax_amount:
                            Number(
                                item.withholding_tax_amount
                                || 0
                            ),


                        /*
                        ======================================
                        AMOUNT
                        ======================================
                        */

                        line_amount:
                            Number(
                                item.line_amount
                                || 0
                            ),

                        total_amount:
                            Number(
                                item.total_amount
                                || 0
                            )

                    };

                }
            );


        /*
        ==================================================
        VALIDATE COA
        ==================================================
        */

        const invalidDetail =
            details.find(
                detail =>
                    !Number.isInteger(
                        detail.charge_account_id
                    )
                    ||
                    detail.charge_account_id <= 0
            );


        if (
            invalidDetail
        ) {

            console.error(
                "INVALID AP DETAIL:",
                invalidDetail
            );


            return this.showError(
                "Chart of Account is required for every detail."
            );

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP SAVE DRAFT HEADER:",
            header
        );


        console.log(
            "AP SAVE DRAFT DETAILS:",
            JSON.stringify(
                details,
                null,
                2
            )
        );


        /*
        ==================================================
        CHECK SUPABASE SESSION
        ==================================================
        */

        const {
            data: {
                session
            }
        } =
            await supabase.auth.getSession();


        console.log(
            "AP SAVE SESSION:",
            session
        );


        console.log(
            "AP SAVE ROLE:",
            session?.user?.role
        );


        /*
        ==================================================
        SAVE
        ==================================================
        */

        const result =
            await this.service.create(

                header,

                details

            );


        if (
            !result
        ) {

            throw new Error(
                "Failed to create Account Payable."
            );

        }


        console.log(
            "AP SAVED:",
            result
        );


        /*
        ==================================================
        CLOSE MODAL
        ==================================================
        */

        const modalElement =
            document.getElementById(
                "accountPayableModal"
            );


        if (
            modalElement
        ) {

            bootstrap.Modal
                .getInstance(
                    modalElement
                )
                ?.hide();

        }


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
MOVE TO LAST PAGE
SHOW NEW AP
==================================================
*/

const totalPages =
    Math.max(
        1,
        Math.ceil(
            this.filteredData.length
            /
            this.pageSize
        )
    );


this.currentPage =
    totalPages;


/*
==================================================
RENDER LAST PAGE
==================================================
*/

this.render();


        /*
        ==================================================
        RESET FORM
        ==================================================
        */

        this.resetAddForm();


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        if (
            typeof this.showSuccess
            ===
            "function"
        ) {

            this.showSuccess(
                "Account Payable saved as Draft."
            );

        }
        else {

            alert(
                "Account Payable saved as Draft."
            );

        }

    }

    catch (error) {

        console.error(
            "AccountPayable.saveDraft:",
            error
        );


        if (
            typeof this.showError
            ===
            "function"
        ) {

            this.showError(
                error.message
                ||
                "Failed to save Account Payable."
            );

        }
        else {

            alert(
                error.message
                ||
                "Failed to save Account Payable."
            );

        }

    }

}
/*
======================================================
SAVE EDIT
======================================================
*/

async saveEdit() {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!this.currentInvoiceId) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        if (!this.apFormVendor?.value) {

            return this.showError(
                "Vendor is required."
            );

        }


        if (
            !this.apFormInvoiceNo?.value.trim()
        ) {

            return this.showError(
                "Invoice No is required."
            );

        }


        if (!this.apFormInvoiceDate?.value) {

            return this.showError(
                "Invoice Date is required."
            );

        }


        if (!this.apFormDateReceived?.value) {

            return this.showError(
                "Date Received is required."
            );

        }


        if (!this.apFormDueDate?.value) {

            return this.showError(
                "Due Date is required."
            );

        }


        if (
            !Array.isArray(
                this.invoiceDetails
            )
            ||
            !this.invoiceDetails.length
        ) {

            return this.showError(
                "Please add at least one invoice detail."
            );

        }


        /*
        ==================================================
        GET CURRENT DOCUMENT STATUS
        ==================================================
        */

        const currentInvoice =
            this.data.find(
                item =>
                    String(item.id)
                    ===
                    String(
                        this.currentInvoiceId
                    )
            );


        const currentStatus =
            String(
                currentInvoice?.status
                || "Draft"
            )
            .trim();


        /*
        ==================================================
        PRESERVE VOID STATUS
        ==================================================
        */

        const editStatus =
            currentStatus === "Void"
                ? "Void"
                : "Draft";


        /*
        ==================================================
        HEADER
        ==================================================
        */

        const header = {

            vendor_id:
                this.apFormVendor.value,

            po_no:
                this.apFormPoNo?.value
                    ?.trim()
                || null,

            invoice_no:
                this.apFormInvoiceNo.value
                    .trim(),

            invoice_date:
                this.apFormInvoiceDate.value,

            date_received:
                this.apFormDateReceived.value,

            due_date:
                this.apFormDueDate.value,

            description:
                this.apFormDescription?.value
                    ?.trim()
                || null,

            status:
                editStatus

        };


        /*
        ==================================================
        DETAILS
        ONLY DATABASE COLUMNS
        ==================================================
        */

        const details =
            this.invoiceDetails.map(
                item => {

                    const chargeAccountId =
                        Number(
                            item.account_id
                            ||
                            item.charge_account_id
                            ||
                            0
                        );


                    return {

                        /*
                        ======================================
                        CHARGE ACCOUNT
                        ======================================
                        */

                        charge_account_id:
                            chargeAccountId,


                        /*
                        ======================================
                        DESCRIPTION
                        ======================================
                        */

                        description:
                            item.description
                            || null,


                        /*
                        ======================================
                        QUANTITY
                        ======================================
                        */

                        quantity:
                            Number(
                                item.quantity
                                || 1
                            ),


                        /*
                        ======================================
                        UNIT PRICE
                        ======================================
                        */

                        unit_price:
                            Number(
                                item.unit_price
                                || 0
                            ),


                        /*
                        ======================================
                        TAX (+)
                        ======================================
                        */

                        tax_plus_id:
                            item.tax_plus_id
                                ? Number(
                                    item.tax_plus_id
                                )
                                : null,

                        tax_plus_account_id:
                            item.tax_plus_account_id
                                ? Number(
                                    item.tax_plus_account_id
                                )
                                : null,

                        tax_input_rate:
                            Number(
                                item.tax_input_rate
                                || 0
                            ),

                        tax_input_amount:
                            Number(
                                item.tax_input_amount
                                || 0
                            ),


                        /*
                        ======================================
                        TAX (-)
                        ======================================
                        */

                        tax_minus_id:
                            item.tax_minus_id
                                ? Number(
                                    item.tax_minus_id
                                )
                                : null,

                        tax_minus_account_id:
                            item.tax_minus_account_id
                                ? Number(
                                    item.tax_minus_account_id
                                )
                                : null,

                        withholding_tax_rate:
                            Number(
                                item.withholding_tax_rate
                                || 0
                            ),

                        withholding_tax_amount:
                            Number(
                                item.withholding_tax_amount
                                || 0
                            ),


                        /*
                        ======================================
                        AMOUNT
                        ======================================
                        */

                        line_amount:
                            Number(
                                item.line_amount
                                || 0
                            ),

                        total_amount:
                            Number(
                                item.total_amount
                                || 0
                            )

                    };

                }
            );


        /*
        ==================================================
        VALIDATE CHARGE ACCOUNT
        ==================================================
        */

        const invalidDetail =
            details.find(
                detail =>
                    !Number.isInteger(
                        detail.charge_account_id
                    )
                    ||
                    detail.charge_account_id <= 0
            );


        if (invalidDetail) {

            return this.showError(
                "Chart of Account is required for every detail."
            );

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP UPDATE HEADER:",
            header
        );


        console.log(
            "AP UPDATE DETAILS:",
            JSON.stringify(
                details,
                null,
                2
            )
        );


        /*
        ==================================================
        UPDATE
        ==================================================
        */

        const result =
            await this.service.update(

                this.currentInvoiceId,

                header,

                details

            );


        if (!result) {

            throw new Error(
                "Failed to update Account Payable."
            );

        }


        /*
        ==================================================
        CLOSE MODAL
        ==================================================
        */

        const modalElement =
            document.getElementById(
                "accountPayableModal"
            );


        if (modalElement) {

            bootstrap.Modal
                .getInstance(
                    modalElement
                )
                ?.hide();

        }


        /*
        ==================================================
        RESET STATE
        ==================================================
        */

        this.currentInvoiceId =
            null;

        this.currentMode =
            "add";

        this.currentDetailId =
            null;


        /*
        ==================================================
        RESET BUTTON
        ==================================================
        */

        if (
            this.btnSaveDraft
        ) {

            this.btnSaveDraft.innerHTML = `
                <i class="fa-solid fa-floppy-disk me-1"></i>
                Save Draft
            `;

        }


        /*
        ==================================================
        RELOAD
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
            "Account Payable updated successfully."
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.saveEdit:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to update Account Payable."
        );

    }

}
    /*
======================================================
HANDLE TABLE ACTION
ACCOUNT PAYABLE
======================================================
*/

async handleTableAction(
    action,
    id
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        ACTION
        ==================================================
        */

        switch (action) {


            /*
            ==============================================
            VIEW
            ==============================================
            */

            case "view":

                await this.viewInvoice(
                    id
                );

                break;


            /*
            ==============================================
            EDIT
            ==============================================
            */

            case "edit":

                await this.editInvoice(
                    id
                );

                break;


            /*
            ==============================================
            DELETE
            ==============================================
            */

            case "delete":

                await this.deleteInvoice(
                    id
                );

                break;


            /*
            ==============================================
            COMPLETE
            ==============================================
            */

            case "complete":

                this.showCompleteConfirmation(
                    id
                );

                break;


            /*
            ==============================================
            PRINT
            ==============================================
            */

            case "print":

                await this.printInvoice(
                    id
                );

                break;


            /*
            ==============================================
            PAYMENT
            ==============================================
            */

            case "payment":

                await this.createPayment(
                    id
                );

                break;


            /*
            ==============================================
            VIEW PAYMENT
            ==============================================
            */

            case "view-payment":

                await this.viewPayment(
                    id
                );

                break;


            /*
            ==============================================
            LEGACY PAYMENT HISTORY
            ==============================================
            */

            case "payment-history":

                await this.viewPayment(
                    id
                );

                break;


            /*
            ==============================================
            VOID
            ==============================================
            */

            case "void":

                await this.voidInvoice(
                    id
                );

                break;


            /*
            ==============================================
            DUPLICATE
            ==============================================
            */

            case "duplicate":

                await this.duplicateInvoice(
                    id
                );

                break;


            /*
            ==============================================
            UNKNOWN
            ==============================================
            */

            default:

                console.warn(
                    "Unknown AP action:",
                    action
                );

                break;

        }

    }

    catch (error) {

        console.error(
            "AccountPayable.handleTableAction:",
            error
        );


        this.showError(
            error.message
            ||
            "Action failed."
        );

    }

}
/*
======================================================
PRINT ACCOUNT PAYABLE INVOICE
======================================================
*/

async printInvoice(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        LOAD DATA
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        if (
            !result
            ||
            !result.header
        ) {

            throw new Error(
                "Account Payable not found."
            );

        }


        const header =
            result.header;


        const details =
            Array.isArray(
                result.details
            )
                ? result.details
                : [];


        /*
        ==================================================
        STATUS VALIDATION
        ==================================================
        */

        const status =
            String(
                header.status
                || ""
            )
            .trim()
            .toLowerCase();


        if (
            status === "draft"
        ) {

            throw new Error(
                "Draft Account Payable cannot be printed."
            );

        }


        /*
        ==================================================
        VENDOR
        ==================================================
        */

        const vendorName =
            header.mst_business_partner
                ?.bp_name
            ||
            header.vendor_name
            ||
            "-";


        /*
        ==================================================
        CALCULATE TOTAL
        ==================================================
        */

        const subtotal =
            details.reduce(
                (
                    total,
                    item
                ) => {

                    return total
                        +
                        Number(
                            item.line_amount
                            || 0
                        );

                },
                0
            );


        const taxPlus =
            details.reduce(
                (
                    total,
                    item
                ) => {

                    return total
                        +
                        Number(
                            item.tax_input_amount
                            || 0
                        );

                },
                0
            );


        const taxMinus =
            details.reduce(
                (
                    total,
                    item
                ) => {

                    return total
                        +
                        Number(
                            item.withholding_tax_amount
                            || 0
                        );

                },
                0
            );


        const totalPayable =
            subtotal
            +
            taxPlus
            -
            taxMinus;


        /*
        ==================================================
        DETAIL ROW
        ==================================================
        */

        const detailRows =
            details
            .map(
                (
                    item,
                    index
                ) => {

                    const coa =
                        item.charge_account
                        ||
                        item.mst_chart_of_accounts
                        ||
                        {};


                    const accountCode =
                        item.account_code
                        ||
                        coa.account_code
                        ||
                        "";


                    const accountName =
                        item.account_name
                        ||
                        coa.account_name
                        ||
                        "";


                    return `

                        <tr>

                            <td class="text-center">
                                ${index + 1}
                            </td>

                            <td>

                                ${
                                    accountCode
                                        ? `${accountCode} - ${accountName}`
                                        : accountName || "-"
                                }

                            </td>

                            <td>

                                ${item.description || "-"}

                            </td>

                            <td class="text-end">

                                ${Number(
                                    item.quantity
                                    || 0
                                ).toLocaleString(
                                    "id-ID"
                                )}

                            </td>

                            <td class="text-end">

                                ${this.formatCurrency(
                                    Number(
                                        item.unit_price
                                        || 0
                                    )
                                )}

                            </td>

                            <td class="text-end">

                                ${this.formatCurrency(
                                    Number(
                                        item.line_amount
                                        || 0
                                    )
                                )}

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


        /*
        ==================================================
        OPEN PRINT WINDOW
        ==================================================
        */

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=1100,height=750"
            );


        if (!printWindow) {

            throw new Error(
                "Print window blocked by browser."
            );

        }


        /*
        ==================================================
        PRINT HTML
        ==================================================
        */

        printWindow.document.write(`

            <!DOCTYPE html>

            <html>

            <head>

                <meta charset="UTF-8">

                <title>
                    ${header.invoice_no || "Account Payable"}
                </title>


                <style>

                    * {
                        box-sizing: border-box;
                    }

                    body {

                        font-family:
                            Arial,
                            sans-serif;

                        padding: 30px;

                        color: #111827;

                        font-size: 12px;

                    }


                    h1 {

                        margin: 0;

                        text-align: center;

                        font-size: 20px;

                    }


                    h2 {

                        margin: 4px 0 25px;

                        text-align: center;

                        font-size: 15px;

                    }


                    .info {

                        width: 100%;

                        margin-bottom: 20px;

                        border-collapse: collapse;

                    }


                    .info td {

                        padding: 4px 6px;

                        vertical-align: top;

                    }


                    .label {

                        width: 120px;

                        font-weight: bold;

                    }


                    .detail {

                        width: 100%;

                        border-collapse: collapse;

                    }


                    .detail th,
                    .detail td {

                        border: 1px solid #CBD5E1;

                        padding: 8px;

                    }


                    .detail th {

                        background: #F8FAFC;

                    }


                    .text-center {
                        text-align: center;
                    }


                    .text-end {
                        text-align: right;
                    }


                    .summary {

                        width: 320px;

                        margin-left: auto;

                        margin-top: 20px;

                        border-collapse: collapse;

                    }


                    .summary td {

                        padding: 6px 8px;

                    }


                    .summary-total td {

                        border-top: 1px solid #94A3B8;

                        font-weight: bold;

                        font-size: 14px;

                        padding-top: 10px;

                    }


                    @media print {

                        body {
                            padding: 0;
                        }

                    }

                </style>

            </head>


            <body>

                <h1>
                    FINOVA ACCOUNTING SYSTEM
                </h1>

                <h2>
                    ACCOUNT PAYABLE INVOICE
                </h2>


                <table class="info">

                    <tr>

                        <td class="label">
                            Invoice No
                        </td>

                        <td>
                            : ${header.invoice_no || "-"}
                        </td>

                        <td class="label">
                            Invoice Date
                        </td>

                        <td>
                            : ${header.invoice_date || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td class="label">
                            Vendor
                        </td>

                        <td>
                            : ${vendorName}
                        </td>

                        <td class="label">
                            Due Date
                        </td>

                        <td>
                            : ${header.due_date || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td class="label">
                            PO No
                        </td>

                        <td>
                            : ${header.po_no || "-"}
                        </td>

                        <td class="label">
                            Status
                        </td>

                        <td>
                            : ${header.status || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td class="label">
                            Description
                        </td>

                        <td colspan="3">
                            : ${header.description || "-"}
                        </td>

                    </tr>

                </table>


                <table class="detail">

                    <thead>

                        <tr>

                            <th style="width:45px">
                                No
                            </th>

                            <th>
                                Account
                            </th>

                            <th>
                                Description
                            </th>

                            <th style="width:80px">
                                Qty
                            </th>

                            <th style="width:130px">
                                Unit Price
                            </th>

                            <th style="width:140px">
                                Amount
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${detailRows}

                    </tbody>

                </table>


                <table class="summary">

                    <tr>

                        <td>
                            Subtotal
                        </td>

                        <td class="text-end">

                            ${this.formatCurrency(
                                subtotal
                            )}

                        </td>

                    </tr>


                    <tr>

                        <td>
                            Tax (+)
                        </td>

                        <td class="text-end">

                            ${this.formatCurrency(
                                taxPlus
                            )}

                        </td>

                    </tr>


                    <tr>

                        <td>
                            Tax (-)
                        </td>

                        <td class="text-end">

                            ${this.formatCurrency(
                                taxMinus
                            )}

                        </td>

                    </tr>


                    <tr class="summary-total">

                        <td>
                            Total Payable
                        </td>

                        <td class="text-end">

                            ${this.formatCurrency(
                                totalPayable
                            )}

                        </td>

                    </tr>

                </table>


                <script>

                    window.onload = () => {

                        window.focus();

                        window.print();

                    };

                <\/script>

            </body>

            </html>

        `);


        printWindow.document.close();

    }

    catch (error) {

        console.error(
            "AccountPayable.printInvoice:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to print Account Payable."
        );

    }

}
    /*
======================================================
POST ACCOUNT PAYABLE
======================================================
*/

async postInvoice(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        FIND INVOICE
        ==================================================
        */

        const invoice =
            this.data.find(
                item =>
                    String(item.id) === String(id)
            );


        if (!invoice) {

            throw new Error(
                "Account Payable not found."
            );

        }


        /*
        ==================================================
        CHECK CURRENT STATUS
        Draft / Void CAN BE POSTED
        ==================================================
        */

        const currentStatus =
            String(
                invoice.status || "Draft"
            )
            .trim();


        if (
            currentStatus !== "Draft"
            &&
            currentStatus !== "Void"
        ) {

            throw new Error(
                "Only Draft or Void Account Payable can be posted."
            );

        }


        /*
        ==================================================
        OPEN POSTING CONFIRMATION MODAL
        ==================================================
        */

        this.pendingPostId = id;


        const modalElement =
            document.getElementById(
                "ap-post-confirm-modal"
            );


        if (!modalElement) {

            throw new Error(
                "Posting confirmation modal not found."
            );

        }


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    }
    catch (error) {

        console.error(
            "AccountPayable.postInvoice:",
            error
        );

        this.showError(
            error.message
            ||
            "Failed to post Account Payable."
        );

    }

}

     /*
======================================================
VIEW ACCOUNT PAYABLE
READ ONLY
======================================================
*/

async viewInvoice(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        LOAD MODALS
        ==================================================
        */

        await this.loadModalHTML();

        await this.loadDetailModalHTML();


        /*
        ==================================================
        CACHE DOM
        ==================================================
        */

        this.cacheDOM();


        /*
        ==================================================
        RESET PREVIOUS VIEW STATE
        IMPORTANT
        ==================================================
        */

        this.currentInvoiceId =
            null;

        this.currentDetailId =
            null;

        this.currentMode =
            "view";

        this.invoiceDetails =
            [];

        this.selectedVendor =
            null;

        this.selectedTopId =
            null;


        /*
        ==================================================
        CLEAR HEADER FORM
        ==================================================
        */

        if (this.apFormVendor) {

            this.apFormVendor.value =
                "";

        }


        if (this.apFormPoNo) {

            this.apFormPoNo.value =
                "";

        }


        if (this.apFormInvoiceNo) {

            this.apFormInvoiceNo.value =
                "";

        }


        if (this.apFormJournalNo) {

            this.apFormJournalNo.value =
                "";

        }


        if (this.apFormInvoiceDate) {

            this.apFormInvoiceDate.value =
                "";

        }


        if (this.apFormDateReceived) {

            this.apFormDateReceived.value =
                "";

        }


        if (this.apFormTop) {

            this.apFormTop.value =
                "";

        }


        if (this.apFormDueDate) {

            this.apFormDueDate.value =
                "";

        }


        if (this.apFormDescription) {

            this.apFormDescription.value =
                "";

        }


        /*
        ==================================================
        CLEAR DETAIL TABLE
        ==================================================
        */

        if (this.apDetailBody) {

            this.apDetailBody.innerHTML = `

                <tr>

                    <td
                        colspan="9"
                        class="text-center text-muted py-4">

                        Loading...

                    </td>

                </tr>

            `;

        }


        /*
        ==================================================
        RESET TAX TABLE
        ==================================================
        */

        this.resetAPTaxTables?.();


        /*
        ==================================================
        RESET TOTAL
        ==================================================
        */

        if (this.apFormSubtotal) {

            this.apFormSubtotal.textContent =
                "0";

        }


        if (this.apFormTax) {

            this.apFormTax.textContent =
                "0";

        }


        if (this.apFormWht) {

            this.apFormWht.textContent =
                "0";

        }


        if (this.apFormTotal) {

            this.apFormTotal.textContent =
                "0";

        }


        /*
        ==================================================
        LOAD VENDORS
        ==================================================
        */

        if (
            !Array.isArray(
                this.vendorData
            )
            ||
            !this.vendorData.length
        ) {

            await this.loadVendors();

        }


        /*
        ==================================================
        LOAD CHART OF ACCOUNTS
        ==================================================
        */

        await this.loadDetailCOA();


        /*
        ==================================================
        LOAD TAX MASTER
        ==================================================
        */

        await this.loadTaxMaster();


        /*
        ==================================================
        LOAD ACCOUNT PAYABLE
        ALWAYS USE CURRENT CLICKED ID
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        if (!result) {

            throw new Error(
                "Account Payable not found."
            );

        }


        const header =
            result.header;


        const details =
            Array.isArray(
                result.details
            )
                ? result.details
                : [];


        if (!header) {

            throw new Error(
                "Account Payable header not found."
            );

        }


        /*
        ==================================================
        SET CURRENT VIEW ID
        ONLY AFTER DATA SUCCESSFULLY LOADED
        ==================================================
        */

        this.currentInvoiceId =
            id;


        /*
        ==================================================
        GL JOURNAL REFERENCE
        ==================================================
        */

        const journalId =
            header.gl_journal_id
            || null;


        let journalNo =
            "";


        if (
            journalId
        ) {

            journalNo =
                await this.getAPJournalNo(
                    journalId
                );

        }


        if (
            this.apFormJournalNo
        ) {

            this.apFormJournalNo.value =
                journalNo;

        }


        /*
        ==================================================
        MAP INVOICE DETAILS
        ==================================================
        */

        this.invoiceDetails =
            details.map(
                detail => {

                    /*
                    ==========================================
                    COA RELATION
                    ==========================================
                    */

                    const relationCOA =
                        detail.charge_account
                        || {};


                    /*
                    ==========================================
                    FALLBACK COA MASTER
                    ==========================================
                    */

                    const masterCOA =
                        Array.isArray(
                            this.currentCOA
                        )
                            ? this.currentCOA.find(
                                account =>
                                    String(account.id)
                                    ===
                                    String(
                                        detail.charge_account_id
                                    )
                            )
                            : null;


                    return {

                        id:
                            detail.id
                            ||
                            crypto.randomUUID(),

                        charge_account_id:
                            Number(
                                detail.charge_account_id
                                ||
                                relationCOA.id
                                ||
                                masterCOA?.id
                                ||
                                0
                            ),

                        account_code:
                            detail.account_code
                            ||
                            relationCOA.account_code
                            ||
                            masterCOA?.account_code
                            ||
                            "",

                        account_name:
                            detail.account_name
                            ||
                            relationCOA.account_name
                            ||
                            masterCOA?.account_name
                            ||
                            "",

                        description:
                            detail.description
                            || "",

                        quantity:
                            Number(
                                detail.quantity
                                || 0
                            ),

                        unit_price:
                            Number(
                                detail.unit_price
                                || 0
                            ),


                        /*
                        ======================================
                        TAX (+)
                        ======================================
                        */

                        tax_plus_id:
                            detail.tax_plus_id
                                ? Number(
                                    detail.tax_plus_id
                                )
                                : null,

                        tax_plus_account_id:
                            detail.tax_plus_account_id
                                ? Number(
                                    detail.tax_plus_account_id
                                )
                                : null,

                        tax_input_rate:
                            Number(
                                detail.tax_input_rate
                                || 0
                            ),

                        tax_input_amount:
                            Number(
                                detail.tax_input_amount
                                || 0
                            ),


                        /*
                        ======================================
                        TAX (-)
                        ======================================
                        */

                        tax_minus_id:
                            detail.tax_minus_id
                                ? Number(
                                    detail.tax_minus_id
                                )
                                : null,

                        tax_minus_account_id:
                            detail.tax_minus_account_id
                                ? Number(
                                    detail.tax_minus_account_id
                                )
                                : null,

                        withholding_tax_rate:
                            Number(
                                detail.withholding_tax_rate
                                || 0
                            ),

                        withholding_tax_amount:
                            Number(
                                detail.withholding_tax_amount
                                || 0
                            ),


                        /*
                        ======================================
                        AMOUNT
                        ======================================
                        */

                        line_amount:
                            Number(
                                detail.line_amount
                                || 0
                            ),

                        total_amount:
                            Number(
                                detail.total_amount
                                || 0
                            )

                    };

                }
            );


        /*
        ==================================================
        VENDOR
        ==================================================
        */

        if (
            this.apFormVendor
        ) {

            this.apFormVendor.value =
                String(
                    header.vendor_id
                    || ""
                );

        }


        /*
        ==================================================
        TERM OF PAYMENT
        ==================================================
        */

        const vendor =
            this.vendorData.find(
                item =>
                    String(item.id)
                    ===
                    String(
                        header.vendor_id
                    )
            )
            || null;


        if (
            vendor
        ) {

            this.selectedVendor =
                vendor;


            this.renderVendorTOP(
                vendor
            );

        }
        else if (
            this.apFormTop
        ) {

            this.selectedVendor =
                null;

            this.selectedTopId =
                null;

            this.apFormTop.value =
                "No Term of Payment";

        }


        /*
        ==================================================
        PO NO
        ==================================================
        */

        if (
            this.apFormPoNo
        ) {

            this.apFormPoNo.value =
                header.po_no
                || "";

        }


        /*
        ==================================================
        INVOICE NO
        ==================================================
        */

        if (
            this.apFormInvoiceNo
        ) {

            this.apFormInvoiceNo.value =
                header.invoice_no
                || "";

        }


        /*
        ==================================================
        INVOICE DATE
        ==================================================
        */

        if (
            this.apFormInvoiceDate
        ) {

            this.apFormInvoiceDate.value =
                header.invoice_date
                || "";

        }


        /*
        ==================================================
        DATE RECEIVED
        ==================================================
        */

        if (
            this.apFormDateReceived
        ) {

            this.apFormDateReceived.value =
                header.date_received
                || "";

        }


        /*
        ==================================================
        DUE DATE
        ==================================================
        */

        if (
            this.apFormDueDate
        ) {

            this.apFormDueDate.value =
                header.due_date
                || "";

        }


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        if (
            this.apFormDescription
        ) {

            this.apFormDescription.value =
                header.description
                || "";

        }


        /*
        ==================================================
        RENDER DETAILS
        ==================================================
        */

        this.renderInvoiceDetails();


        /*
        ==================================================
        RENDER TAX (+)
        ==================================================
        */

        this.renderTaxPlus();


        /*
        ==================================================
        RENDER TAX (-)
        ==================================================
        */

        this.renderTaxMinus();


        /*
        ==================================================
        UPDATE SUMMARY
        ==================================================
        */

        this.updateInvoiceSummary();


        /*
        ==================================================
        READ ONLY
        ==================================================
        */

        const viewFields = [

            this.apFormVendor,
            this.apFormPoNo,
            this.apFormInvoiceNo,
            this.apFormInvoiceDate,
            this.apFormDateReceived,
            this.apFormTop,
            this.apFormDueDate,
            this.apFormDescription

        ];


        viewFields.forEach(
            field => {

                if (!field) {

                    return;

                }


                field.disabled =
                    true;


                field.readOnly =
                    true;

            }
        );


        /*
        ==================================================
        DISABLE DETAIL ACTION
        ==================================================
        */

        document
            .querySelectorAll(
                "#ap-detail-body [data-detail-action]"
            )
            .forEach(
                button => {

                    button.disabled =
                        true;

                }
            );


        /*
        ==================================================
        DISABLE ADD DETAIL
        ==================================================
        */

        if (
            this.btnAddDetail
        ) {

            this.btnAddDetail.disabled =
                true;

        }


        /*
        ==================================================
        DISABLE SAVE
        ==================================================
        */

        if (
            this.btnSaveDraft
        ) {

            this.btnSaveDraft.disabled =
                true;

        }


        /*
        ==================================================
        RESET TAB TO HEADER
        ==================================================
        */

        this.resetAPModalTab();


        /*
        ==================================================
        MODAL TITLE
        ==================================================
        */

        const modalElement =
            document.getElementById(
                "accountPayableModal"
            );


        const titleElement =
            modalElement?.querySelector(
                ".modal-title"
            );


        if (
            titleElement
        ) {

            titleElement.innerHTML = `
                <i class="fa-solid fa-eye me-2"></i>
                View Account Payable
            `;

        }


        const subtitleElement =
            modalElement?.querySelector(
                ".modal-subtitle"
            );


        if (
            subtitleElement
        ) {

            subtitleElement.textContent =
                "View Account Payable";

        }


        /*
        ==================================================
        SHOW MODAL
        ==================================================
        */

        if (
            modalElement
        ) {

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );


            modal.show();

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP VIEW LOADED:",
            {
                requested_id:
                    id,

                loaded_id:
                    header.id,

                invoice_no:
                    header.invoice_no,

                detail_count:
                    this.invoiceDetails.length
            }
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.viewInvoice:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to view Account Payable."
        );

    }

}
/*
======================================================
GET GL JOURNAL NUMBER
======================================================
*/

async getAPJournalNo(
    glJournalId
) {

    try {

        if (!glJournalId) {

            return "";

        }


        const {
            data,
            error
        } = await supabase

            .from(
                "trx_gl_journal"
            )

            .select(
                "journal_no"
            )

            .eq(
                "id",
                glJournalId
            )

            .maybeSingle();


        if (error) {

            throw error;

        }


        return data?.journal_no
            || "";

    }
    catch (error) {

        console.error(
            "AccountPayable.getAPJournalNo:",
            error
        );

        throw error;

    }

}

/*
======================================================
EDIT ACCOUNT PAYABLE
======================================================
*/

async editInvoice(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        LOAD MODALS
        ==================================================
        */

        await this.loadModalHTML();

        await this.loadDetailModalHTML();


        /*
        ==================================================
        CACHE DOM
        ==================================================
        */

        this.cacheDOM();


        /*
        ==================================================
        LOAD VENDORS
        ==================================================
        */

        if (
            !Array.isArray(
                this.vendorData
            )
            ||
            !this.vendorData.length
        ) {

            await this.loadVendors();

        }


        /*
        ==================================================
        LOAD COA
        REQUIRED FOR ACCOUNT DISPLAY / EDIT DETAIL
        ==================================================
        */

        await this.loadDetailCOA();


        /*
        ==================================================
        LOAD TAX MASTER
        ==================================================
        */

        await this.loadTaxMaster();


        /*
        ==================================================
        LOAD ACCOUNT PAYABLE
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        if (!result) {

            throw new Error(
                "Account Payable not found."
            );

        }


        const header =
            result.header;


        const details =
            Array.isArray(
                result.details
            )
                ? result.details
                : [];


        /*
        ==================================================
        VALIDATE HEADER
        ==================================================
        */

        if (!header) {

            throw new Error(
                "Account Payable header not found."
            );

        }


        /*
        ==================================================
        CHECK CURRENT STATUS
        Draft / Void CAN BE EDITED
        ==================================================
        */

        const currentStatus =
            String(
                header.status
                || "Draft"
            )
            .trim();


        if (
            currentStatus !== "Draft"
            &&
            currentStatus !== "Void"
        ) {

            throw new Error(
                "Only Draft or Void Account Payable can be edited."
            );

        }


        /*
        ==================================================
        SET EDIT STATE
        ==================================================
        */

        this.currentInvoiceId =
            id;


        this.currentMode =
            "edit";


        this.currentDetailId =
            null;


        this.pendingDeleteDetailId =
            null;


        /*
        ==================================================
        VENDOR
        ==================================================
        */

        if (
            this.apFormVendor
        ) {

            this.apFormVendor.value =
                String(
                    header.vendor_id
                    || ""
                );

        }


        /*
        ==================================================
        FIND VENDOR
        ==================================================
        */

        const editVendor =
            this.vendorData.find(
                item =>
                    String(item.id)
                    ===
                    String(
                        header.vendor_id
                    )
            )
            || null;


        /*
        ==================================================
        TERM OF PAYMENT
        ==================================================
        */

        if (
            editVendor
        ) {

            this.selectedVendor =
                editVendor;


            this.renderVendorTOP(
                editVendor
            );

        }
        else {

            this.selectedVendor =
                null;


            this.selectedTopId =
                null;


            if (
                this.apFormTop
            ) {

                this.apFormTop.value =
                    "No Term of Payment";

            }

        }


        /*
        ==================================================
        PO NO
        ==================================================
        */

        if (
            this.apFormPoNo
        ) {

            this.apFormPoNo.value =
                header.po_no
                || "";

        }


        /*
        ==================================================
        INVOICE NO
        ==================================================
        */

        if (
            this.apFormInvoiceNo
        ) {

            this.apFormInvoiceNo.value =
                header.invoice_no
                || "";

        }


        /*
        ==================================================
        GL JOURNAL NO
        ==================================================
        */

        const journalId =
            header.gl_journal_id
            || null;


        let journalNo =
            "";


        if (
            journalId
        ) {

            journalNo =
                await this.getAPJournalNo(
                    journalId
                );

        }


        if (
            this.apFormJournalNo
        ) {

            this.apFormJournalNo.value =
                journalNo
                || "";

        }


        /*
        ==================================================
        INVOICE DATE
        ==================================================
        */

        if (
            this.apFormInvoiceDate
        ) {

            this.apFormInvoiceDate.value =
                header.invoice_date
                || "";

        }


        /*
        ==================================================
        DATE RECEIVED
        ==================================================
        */

        if (
            this.apFormDateReceived
        ) {

            this.apFormDateReceived.value =
                header.date_received
                || "";

        }


        /*
        ==================================================
        DUE DATE
        ==================================================
        */

        if (
            this.apFormDueDate
        ) {

            this.apFormDueDate.value =
                header.due_date
                || "";

        }


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        if (
            this.apFormDescription
        ) {

            this.apFormDescription.value =
                header.description
                || "";

        }


        /*
        ==================================================
        MAP DETAILS
        ==================================================
        */

        this.invoiceDetails =
            details.map(
                detail => {

                    /*
                    ==========================================
                    COA FROM EXPLICIT RELATION
                    ==========================================
                    */

                    const relationCOA =
                        detail.charge_account
                        || {};


                    /*
                    ==========================================
                    FALLBACK COA FROM MASTER
                    ==========================================
                    */

                    const masterCOA =
                        this.currentCOA.find(
                            account =>
                                String(account.id)
                                ===
                                String(
                                    detail.charge_account_id
                                )
                        )
                        || {};


                    /*
                    ==========================================
                    FINAL COA
                    ==========================================
                    */

                    const accountCode =
                        detail.account_code
                        ||
                        relationCOA.account_code
                        ||
                        masterCOA.account_code
                        ||
                        "";


                    const accountName =
                        detail.account_name
                        ||
                        relationCOA.account_name
                        ||
                        masterCOA.account_name
                        ||
                        "";


                    return {

                        /*
                        ======================================
                        ID
                        ======================================
                        */

                        id:
                            detail.id
                            ||
                            crypto.randomUUID(),


                        /*
                        ======================================
                        CHARGE ACCOUNT
                        ======================================
                        */

                        charge_account_id:
                            Number(
                                detail.charge_account_id
                                ||
                                relationCOA.id
                                ||
                                masterCOA.id
                                ||
                                0
                            ),

                        account_code:
                            accountCode,

                        account_name:
                            accountName,


                        /*
                        ======================================
                        DESCRIPTION
                        ======================================
                        */

                        description:
                            detail.description
                            || "",


                        /*
                        ======================================
                        QUANTITY
                        ======================================
                        */

                        quantity:
                            Number(
                                detail.quantity
                                || 1
                            ),


                        /*
                        ======================================
                        UNIT PRICE
                        ======================================
                        */

                        unit_price:
                            Number(
                                detail.unit_price
                                || 0
                            ),


                        /*
                        ======================================
                        TAX (+)
                        ======================================
                        */

                        tax_plus_id:
                            detail.tax_plus_id
                                ? Number(
                                    detail.tax_plus_id
                                )
                                : null,

                        tax_plus_code:
                            detail.tax_plus_code
                            || "",

                        tax_plus_name:
                            detail.tax_plus_name
                            || "",

                        tax_plus_account_id:
                            detail.tax_plus_account_id
                                ? Number(
                                    detail.tax_plus_account_id
                                )
                                : null,

                        tax_input_rate:
                            Number(
                                detail.tax_input_rate
                                || 0
                            ),

                        tax_input_amount:
                            Number(
                                detail.tax_input_amount
                                || 0
                            ),


                        /*
                        ======================================
                        TAX (-)
                        ======================================
                        */

                        tax_minus_id:
                            detail.tax_minus_id
                                ? Number(
                                    detail.tax_minus_id
                                )
                                : null,

                        tax_minus_code:
                            detail.tax_minus_code
                            || "",

                        tax_minus_name:
                            detail.tax_minus_name
                            || "",

                        tax_minus_account_id:
                            detail.tax_minus_account_id
                                ? Number(
                                    detail.tax_minus_account_id
                                )
                                : null,

                        withholding_tax_rate:
                            Number(
                                detail.withholding_tax_rate
                                || 0
                            ),

                        withholding_tax_amount:
                            Number(
                                detail.withholding_tax_amount
                                || 0
                            ),


                        /*
                        ======================================
                        AMOUNT
                        ======================================
                        */

                        line_amount:
                            Number(
                                detail.line_amount
                                || 0
                            ),

                        total_amount:
                            Number(
                                detail.total_amount
                                || 0
                            )

                    };

                }
            );


        /*
        ==================================================
        DEBUG MAPPED DETAILS
        ==================================================
        */

        console.log(
            "AP EDIT DETAILS MAPPED:",
            JSON.stringify(
                this.invoiceDetails,
                null,
                2
            )
        );


        /*
        ==================================================
        RENDER DETAILS
        ==================================================
        */

        this.renderInvoiceDetails();


        /*
        ==================================================
        RENDER TAX (+)
        ==================================================
        */

        this.renderTaxPlus();


        /*
        ==================================================
        RENDER TAX (-)
        ==================================================
        */

        this.renderTaxMinus();


        /*
        ==================================================
        RESET DETAIL FORM
        PREVENT PREVIOUS EDIT DETAIL HISTORY
        ==================================================
        */

        this.resetInvoiceDetailForm();


        /*
        ==================================================
        RESET TAB
        START FROM HEADER INFO
        ==================================================
        */

        this.resetAPModalTab();


        /*
        ==================================================
        BUTTON MODE
        ==================================================
        */

        if (
            this.btnSaveDraft
        ) {

            this.btnSaveDraft.innerHTML = `
                <i class="fa-solid fa-floppy-disk me-1"></i>
                Save Changes
            `;

        }


        /*
        ==================================================
        SHOW MODAL
        ==================================================
        */

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                this.accountPayableModal
            );


        modal.show();


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP EDIT LOADED:",
            {
                id,
                header,
                details:
                    this.invoiceDetails
            }
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.editInvoice:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to load Account Payable."
        );

    }

}


  /*
==================================================
DELETE INVOICE
==================================================
*/

async deleteInvoice(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        STORE DELETE ID
        ==================================================
        */

        this.deleteInvoiceId =
            id;


        /*
        ==================================================
        FIND INVOICE
        ==================================================
        */

        const data =
            Array.isArray(this.data)
                ? this.data
                : [];


        const invoice =
            data.find(
                item =>
                    String(item.id)
                    ===
                    String(id)
            );


        if (!invoice) {

            throw new Error(
                "Account Payable not found."
            );

        }


        console.log(
            "DELETE INVOICE:",
            invoice
        );


        /*
        ==================================================
        FIND VENDOR ID
        ==================================================
        */

        const vendorId =
            invoice.vendor_id
            ||
            invoice.bp_id
            ||
            invoice.business_partner_id;


        console.log(
            "VENDOR ID:",
            vendorId
        );


        /*
        ==================================================
        FIND VENDOR FROM VENDOR DATA
        ==================================================
        */

        let vendorObject = null;


        if (
            vendorId
            &&
            Array.isArray(
                this.vendorData
            )
        ) {

            vendorObject =
                this.vendorData.find(
                    vendor => {

                        return String(
                            vendor.id
                        )
                        ===
                        String(
                            vendorId
                        );

                    }
                );

        }


        console.log(
            "VENDOR OBJECT:",
            vendorObject
        );


        /*
        ==================================================
        DEBUG VENDOR OBJECT
        ==================================================
        */

        if (vendorObject) {

            console.log(
                "VENDOR OBJECT JSON:",
                JSON.stringify(
                    vendorObject,
                    null,
                    2
                )
            );

        }


        /*
        ==================================================
        GET VENDOR NAME
        ==================================================
        */

        const vendorName =
            vendorObject?.bp_name
            ||
            invoice.vendor_name
            ||
            "-";


        console.log(
            "VENDOR NAME:",
            vendorName
        );


        /*
        ==================================================
        SET DELETE MODAL INFORMATION
        ==================================================
        */

        if (
            this.apDeleteInvoiceNo
        ) {

            this.apDeleteInvoiceNo.textContent =
                invoice.invoice_no
                ||
                "-";

        }


        /*
        ==================================================
        VENDOR
        ==================================================
        */

        if (
            this.apDeleteVendor
        ) {

            this.apDeleteVendor.textContent =
                vendorName;

        }


        /*
        ==================================================
        PO NUMBER
        ==================================================
        */

        if (
            this.apDeletePoNo
        ) {

            this.apDeletePoNo.textContent =
                invoice.po_no
                ||
                "-";

        }


        /*
        ==================================================
        VALIDATE DELETE MODAL
        ==================================================
        */

        if (
            !this.apDeleteInvoiceModal
        ) {

            throw new Error(
                "Delete confirmation modal not found."
            );

        }


        /*
        ==================================================
        SHOW DELETE CONFIRMATION MODAL
        ==================================================
        */

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                this.apDeleteInvoiceModal
            );


        modal.show();


        console.log(
            "DELETE CONFIRMATION MODAL OPENED"
        );

    }


    catch (error) {

        console.error(
            "AccountPayable.deleteInvoice:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to delete Account Payable."
        );

    }

}
/*
======================================================
PARSE AP PAYMENT AMOUNT
======================================================
*/

parseAPPaymentAmount(
    value
) {

    /*
    ==================================================
    NORMALIZE VALUE
    EXAMPLE:
    10.900.000
    →
    10900000
    ==================================================
    */

    const normalized =
        String(
            value
            || ""
        )
        .replace(
            /[^\d]/g,
            ""
        );


    return Number(
        normalized
        || 0
    );

}
/*
======================================================
FORMAT AP PAYMENT AMOUNT INPUT
======================================================
*/

formatAPPaymentAmount() {

    /*
    ==================================================
    CHECK DOM
    ==================================================
    */

    if (
        !this.apPaymentAmount
    ) {

        return;

    }


    /*
    ==================================================
    GET RAW VALUE
    ==================================================
    */

    const amount =
        this.parseAPPaymentAmount(
            this.apPaymentAmount.value
        );


    /*
    ==================================================
    EMPTY
    ==================================================
    */

    if (
        amount <= 0
    ) {

        this.apPaymentAmount.value =
            "";

        return;

    }


    /*
    ==================================================
    FORMAT
    ==================================================
    */

    this.apPaymentAmount.value =
        this.formatCurrency(
            amount
        );

}

   /*
======================================================
CREATE AP PAYMENT
OPEN PAYMENT MODAL
ONLY POSTED GL JOURNAL
SUPPORT PARTIAL PAYMENT
======================================================
*/

async createPayment(
    id
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        LOAD ACCOUNT PAYABLE
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        if (
            !result
            ||
            !result.header
        ) {

            throw new Error(
                "Account Payable not found."
            );

        }


        /*
        ==================================================
        HEADER
        ==================================================
        */

        const invoice =
            result.header;


        /*
        ==================================================
        GL JOURNAL
        ==================================================
        */

        const glJournal =
            invoice?.gl_journal
            || null;


        /*
        ==================================================
        AP STATUS
        ==================================================
        */

        const status =
            String(
                invoice.status
                || ""
            )
            .trim();


        /*
        ==================================================
        PAYMENT ALLOWED STATUS

        Complete
        Partial Paid
        ==================================================
        */

        if (
            status !== "Complete"
            &&
            status !== "Partial Paid"
        ) {

            throw new Error(
                `Account Payable status is "${status}". Payment is only allowed for Complete or Partial Paid Account Payable.`
            );

        }


        /*
        ==================================================
        GL JOURNAL LINK REQUIRED
        ==================================================
        */

        if (
            !invoice.gl_journal_id
        ) {

            throw new Error(
                "Account Payable GL Journal is not linked."
            );

        }


        /*
        ==================================================
        GL JOURNAL REQUIRED
        ==================================================
        */

        if (
            !glJournal
        ) {

            throw new Error(
                "Account Payable GL Journal was not found."
            );

        }


        /*
        ==================================================
        GL JOURNAL STATUS
        ==================================================
        */

        const glJournalStatus =
            String(
                glJournal.status
                || ""
            )
            .trim();


        /*
        ==================================================
        PAYMENT ONLY IF JOURNAL POSTED
        ==================================================
        */

        if (
            glJournalStatus !== "Posted"
        ) {

            throw new Error(
                `Payment cannot be processed. GL Journal ${glJournal.journal_no || ""} is still "${glJournalStatus || "Draft"}". Please post the GL Journal first.`
            );

        }


        /*
        ==================================================
        TOTAL AMOUNT
        ==================================================
        */

        const totalAmount =
            Number(
                invoice.total_amount
                || 0
            );


        if (
            totalAmount <= 0
        ) {

            throw new Error(
                "Account Payable Total Amount is invalid."
            );

        }


        /*
        ==================================================
        OUTSTANDING
        ==================================================
        */

        const outstandingAmount =
            Number(
                invoice.outstanding_amount
                ??
                totalAmount
            );


        if (
            outstandingAmount <= 0
        ) {

            throw new Error(
                "Account Payable is already fully paid."
            );

        }


        /*
        ==================================================
        STORE CURRENT AP
        ==================================================
        */

        this.currentPaymentAPId =
            id;


        /*
        ==================================================
        ORIGINAL AP COMPONENT
        ==================================================
        */

        const dpp =
            Number(
                invoice.subtotal
                || 0
            );


        const taxPlus =
            Number(
                invoice.tax_input_amount
                || 0
            );


        const taxMinus =
            Number(
                invoice.withholding_tax_amount
                || 0
            );


        /*
        ==================================================
        AP ID
        ==================================================
        */

        if (
            this.apPaymentAPId
        ) {

            this.apPaymentAPId.value =
                id;

        }


        /*
        ==================================================
        INVOICE NO
        ==================================================
        */

        if (
            this.apPaymentInvoiceNo
        ) {

            this.apPaymentInvoiceNo.value =
                invoice.invoice_no
                || "";

        }


        /*
        ==================================================
        VENDOR
        ==================================================
        */

        if (
            this.apPaymentVendor
        ) {

            this.apPaymentVendor.value =
                invoice
                    .mst_business_partner
                    ?.bp_name
                || "";

        }


        /*
        ==================================================
        PAYMENT DATE
        ==================================================
        */

        if (
            this.apPaymentDate
        ) {

            this.apPaymentDate.value =
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10
                    );

        }


        /*
        ==================================================
        DPP
        ==================================================
        */

        if (
            this.apPaymentDPP
        ) {

            this.apPaymentDPP.textContent =
                this.formatCurrency(
                    dpp
                );

        }


        /*
        ==================================================
        TAX (+)
        ==================================================
        */

        if (
            this.apPaymentTaxPlus
        ) {

            this.apPaymentTaxPlus.textContent =
                this.formatCurrency(
                    taxPlus
                );

        }


        /*
        ==================================================
        TAX (-)
        ==================================================
        */

        if (
            this.apPaymentTaxMinus
        ) {

            this.apPaymentTaxMinus.textContent =
                this.formatCurrency(
                    taxMinus
                );

        }


        /*
        ==================================================
        PAYMENT AMOUNT
        DEFAULT = OUTSTANDING
        ==================================================
        */

        if (
            this.apPaymentAmount
        ) {

            this.apPaymentAmount.value =
                this.formatCurrency(
                    outstandingAmount
                );


            this.apPaymentAmount.oninput =
                () => {

                    this.formatAPPaymentAmount();

                };

        }


        /*
        ==================================================
        REFERENCE NO
        ==================================================
        */

        if (
            this.apPaymentReferenceNo
        ) {

            this.apPaymentReferenceNo.value =
                "";

        }


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        if (
            this.apPaymentDescription
        ) {

            this.apPaymentDescription.value =
                invoice.description
                || "";

        }


        /*
        ==================================================
        LOAD BANK ACCOUNTS
        ==================================================
        */

        await this.loadAPPaymentBankAccounts();


        /*
        ==================================================
        RESET BANK
        ==================================================
        */

        if (
            this.apPaymentBankAccount
        ) {

            this.apPaymentBankAccount.value =
                "";

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP PAYMENT MODAL:",
            {

                id:
                    id,

                invoice_no:
                    invoice.invoice_no,

                ap_status:
                    status,

                gl_journal_id:
                    invoice.gl_journal_id,

                gl_journal_no:
                    glJournal.journal_no,

                gl_journal_status:
                    glJournalStatus,

                outstanding_amount:
                    outstandingAmount

            }
        );


        /*
        ==================================================
        SHOW PAYMENT MODAL
        ==================================================
        */

        if (
            !this.accountPayablePaymentModal
        ) {

            throw new Error(
                "Account Payable Payment Modal not found."
            );

        }


        const paymentModal =
            bootstrap.Modal.getOrCreateInstance(
                this.accountPayablePaymentModal
            );


        paymentModal.show();

    }

    catch (error) {

        console.error(
            "AccountPayable.createPayment:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to open AP Payment."
        );

    }

}
/*
======================================================
LOAD AP PAYMENT BANK ACCOUNTS
======================================================
*/

async loadAPPaymentBankAccounts() {

    try {

        if (
            !this.apPaymentBankAccount
        ) {

            return;

        }


        const coa =
            await this.service.getCOA();


        const accounts =
            Array.isArray(
                coa
            )
                ? coa
                : [];


        this.apPaymentBankAccount.innerHTML = `

            <option value="">
                Select Bank Account
            </option>

        `;


        accounts

            .filter(
                account => {

                    const name =
                        String(
                            account.account_name
                            || ""
                        )
                        .toUpperCase();


                    return (
                        name.includes("BANK")
                        ||
                        name.includes("KAS")
                    );

                }
            )

            .forEach(
                account => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        account.id;


                    option.textContent =
                        `${account.account_code} - ${account.account_name}`;


                    this.apPaymentBankAccount
                        .appendChild(
                            option
                        );

                }
            );

    }

    catch (error) {

        console.error(
            "AccountPayable.loadAPPaymentBankAccounts:",
            error
        );


        throw error;

    }

}


    /*
======================================================
PAYMENT HISTORY
LEGACY COMPATIBILITY
======================================================
*/

async paymentHistory(
    id
) {

    return this.viewPayment(
        id
    );

}


   /*
======================================================
VOID ACCOUNT PAYABLE
======================================================
*/

async voidInvoice(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        FIND INVOICE
        ==================================================
        */

        const invoice =
            this.data.find(
                item =>
                    String(item.id)
                    ===
                    String(id)
            );


        if (!invoice) {

            throw new Error(
                "Account Payable not found."
            );

        }


        /*
        ==================================================
        CHECK STATUS
        ==================================================
        */

        const currentStatus =
            String(
                invoice.status || ""
            )
            .trim();


        if (
            currentStatus !== "Posted"
            &&
            currentStatus !== "Partial Paid"
        ) {

            throw new Error(
                "Only Posted or Partial Paid Account Payable can be voided."
            );

        }


        /*
        ==================================================
        STORE PENDING ID
        ==================================================
        */

        this.pendingVoidId =
            id;


        /*
        ==================================================
        RESET VOID REASON
        ==================================================
        */

        const reasonElement =
            document.getElementById(
                "void-ap-reason"
            );


        if (reasonElement) {

            reasonElement.value = "";

        }


        /*
        ==================================================
        SHOW VOID CONFIRMATION
        ==================================================
        */

        const result =
            await this.showVoidConfirmation();


        /*
        ==================================================
        CANCEL
        ==================================================
        */

        if (
            !result
            ||
            !result.confirmed
        ) {

            this.pendingVoidId =
                null;

            return;

        }


        /*
        ==================================================
        GET VOID REASON
        ==================================================
        */

        const reason =
            String(
                result.reason || ""
            )
            .trim();


        if (!reason) {

            throw new Error(
                "Void reason is required."
            );

        }


        /*
        ==================================================
        EXECUTE VOID
        ==================================================
        */

        await this.service.voidInvoice(
            id,
            reason
        );


        /*
        ==================================================
        CLEAR PENDING ID
        ==================================================
        */

        this.pendingVoidId =
            null;


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
            "Account Payable voided successfully."
        );


    }
    catch (error) {

        console.error(
            "AccountPayable.voidInvoice:",
            error
        );


        this.pendingVoidId =
            null;


        this.showError(
            error?.message
            ||
            "Failed to void Account Payable."
        );

    }

}
/*
======================================================
SHOW VOID CONFIRMATION
======================================================
*/

showVoidConfirmation() {

    return new Promise((resolve) => {

        /*
        ==================================================
        REMOVE OLD MODAL
        ==================================================
        */

        const oldModal =
            document.getElementById(
                "ap-void-modal"
            );


        if (oldModal) {

            oldModal.remove();

        }


        /*
        ==================================================
        CREATE MODAL
        ==================================================
        */

        const modalHTML = `

            <div
                class="modal fade"
                id="ap-void-modal"
                tabindex="-1"
                aria-hidden="true">

                <div
                    class="modal-dialog modal-dialog-centered">

                    <div
                        class="modal-content">

                        <!-- ==================================
                             HEADER
                        =================================== -->

                        <div
                            class="modal-header">

                            <h5
                                class="modal-title fw-semibold">

                                <i
                                    class="fa-solid fa-ban text-danger me-2">
                                </i>

                                Confirm Void Account Payable

                            </h5>


                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close">
                            </button>

                        </div>


                        <!-- ==================================
                             BODY
                        =================================== -->

                        <div
                            class="modal-body">

                            <!-- QUESTION ICON -->

                            <div
                                class="text-center mb-3">

                                <div
                                    class="d-inline-flex
                                           align-items-center
                                           justify-content-center
                                           rounded-circle
                                           bg-danger
                                           text-white"
                                    style="
                                        width:52px;
                                        height:52px;
                                        font-size:26px;
                                    ">

                                    ?

                                </div>

                            </div>


                            <!-- QUESTION -->

                            <div
                                class="text-center mb-3">

                                <span>

                                    Apakah Anda yakin ingin

                                    <strong>
                                        VOID Account Payable
                                    </strong>

                                    ini?

                                </span>

                            </div>


                            <!-- WARNING -->

                            <div
                                class="alert alert-danger
                                       d-flex align-items-start"
                                role="alert">

                                <i
                                    class="fa-solid fa-triangle-exclamation
                                           me-2 mt-1">
                                </i>

                                <div>

                                    Account Payable yang
                                    di-VOID tidak dapat
                                    dianggap sebagai transaksi
                                    <strong>Posted</strong>.

                                </div>

                            </div>


                            <!-- REASON -->

                            <div
                                class="mb-2">

                                <label
                                for="void-ap-reason"
                                class="form-label fw-semibold">

                                Alasan Void
                                <span class="text-danger">*</span>

                            </label>


                            <textarea
                                id="void-ap-reason"
                                class="form-control"
                                rows="3"
                                placeholder="Masukkan alasan Void..."
                                required></textarea>
                            </div>

                        </div>


                        <!-- ==================================
                             FOOTER
                        =================================== -->

                        <div
                            class="modal-footer">

                            <button
                                type="button"
                                class="btn btn-secondary"
                                id="btn-cancel-ap-void"
                                data-bs-dismiss="modal">

                                <i
                                    class="fa-solid fa-xmark me-1">
                                </i>

                                Batal

                            </button>


                            <button
                                type="button"
                                class="btn btn-danger"
                                id="btn-confirm-ap-void">

                                <i
                                    class="fa-solid fa-ban me-1">
                                </i>

                                Ya, Void

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;


        /*
        ==================================================
        APPEND MODAL
        ==================================================
        */

        document.body.insertAdjacentHTML(
            "beforeend",
            modalHTML
        );


        /*
        ==================================================
        GET ELEMENT
        ==================================================
        */

        const modalElement =
            document.getElementById(
                "ap-void-modal"
            );


        const reasonElement =
            document.getElementById(
                "void-ap-reason"
            );


        const confirmButton =
            document.getElementById(
                "btn-confirm-ap-void"
            );


        /*
        ==================================================
        BOOTSTRAP MODAL
        ==================================================
        */

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        /*
        ==================================================
        CONFIRM
        ==================================================
        */

        confirmButton.addEventListener(
            "click",
            () => {

                const reason =
                    String(
                        reasonElement?.value || ""
                    ).trim();


                /*
                ==========================================
                VALIDATION
                ==========================================
                */

                if (!reason) {

                    reasonElement.classList.add(
                        "is-invalid"
                    );

                    reasonElement.focus();

                    return;

                }


                /*
                ==========================================
                REMOVE VALIDATION
                ==========================================
                */

                reasonElement.classList.remove(
                    "is-invalid"
                );


                /*
                ==========================================
                CLOSE
                ==========================================
                */

                modal.hide();


                resolve({
                    confirmed: true,
                    reason: reason
                });

            }
        );


        /*
        ==================================================
        CANCEL
        ==================================================
        */

        modalElement.addEventListener(
            "hidden.bs.modal",
            () => {

                modalElement.remove();


                /*
                ==========================================
                IF NOT CONFIRMED
                ==========================================
                */

                resolve({
                    confirmed: false,
                    reason: ""
                });

            },
            {
                once: true
            }
        );


        /*
        ==================================================
        SHOW
        ==================================================
        */

        modal.show();

    });

}
    /*
    ======================================================
    DUPLICATE
    ======================================================
    */

    async duplicateInvoice(id) {

        console.log(
            "Duplicate Account Payable:",
            id
        );

    }

    
    
  /*
======================================================
LOAD DATA
OPTIONAL LOADING
======================================================
*/

async loadData(
    showLoading = true
) {

    try {

        /*
        ==================================================
        RE-CACHE ACTIVE TABLE BODY
        ==================================================
        */

        this.tableBody =
            document.getElementById(
                "ap-table-body"
            );


        if (
            !this.tableBody
        ) {

            console.warn(
                "AP TABLE BODY NOT FOUND."
            );

            return;

        }


        /*
        ==================================================
        SHOW LOADING
        ONLY WHEN REQUESTED
        ==================================================
        */

        if (
            showLoading
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
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
                                class="spinner-border text-primary"
                                role="status">

                                <span class="visually-hidden">

                                    Loading...

                                </span>

                            </div>


                            <div
                                class="text-muted small">

                                Loading Account Payable...

                            </div>

                        </div>

                    </td>

                </tr>

            `;

        }


        /*
        ==================================================
        LOAD ACCOUNT PAYABLE
        ==================================================
        */

        let data =
            await this.service.getAll();


        data =
            Array.isArray(
                data
            )
                ? data
                : [];


        /*
        ==================================================
        SYNC PAYMENT STATUS
        ==================================================
        */

        for (
            const invoice
            of data
        ) {

            const currentStatus =
                String(
                    invoice?.status
                    ||
                    ""
                )
                .trim();


            if (
                currentStatus === "Complete"
                ||
                currentStatus === "Paid"
                ||
                currentStatus === "Partial Paid"
            ) {

                try {

                    await this.service
                        .updatePaymentStatus(
                            invoice.id
                        );

                }

                catch (
                    syncError
                ) {

                    console.error(
                        "AP PAYMENT STATUS SYNC ERROR:",
                        syncError
                    );

                }

            }

        }


        /*
        ==================================================
        RELOAD AFTER STATUS SYNC
        ==================================================
        */

        data =
            await this.service.getAll();


        data =
            Array.isArray(
                data
            )
                ? data
                : [];


        /*
        ==================================================
        STORE DATA
        ==================================================
        */

        this.data =
            data;


        this.filteredData =
            [
                ...data
            ];


        /*
        ==================================================
        KEEP CURRENT PAGE
        ==================================================
        */

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    this.filteredData.length
                    /
                    this.pageSize
                )
            );


        this.currentPage =
            Math.min(
                Math.max(
                    Number(
                        this.currentPage
                    )
                    ||
                    1,
                    1
                ),
                totalPages
            );


        /*
        ==================================================
        RE-CACHE ACTIVE BODY
        ==================================================
        */

        this.tableBody =
            document.getElementById(
                "ap-table-body"
            );


        /*
        ==================================================
        RENDER
        ==================================================
        */

        this.render();

    }

    catch (error) {

        console.error(
            "AccountPayable.loadData:",
            error
        );


        this.showError(
            "Failed to load Account Payable."
        );

    }

}
/*
======================================================
SEARCH ACCOUNT PAYABLE
======================================================
*/

async search() {

    try {

        const filters = {

            dateFrom:
                this.dateFrom?.value
                || "",

            dateTo:
                this.dateTo?.value
                || "",

            status:
                this.statusFilter?.value
                || "all",

            findBy:
                this.findBy?.value
                || "invoice_no",

            keyword:
                this.keyword?.value
                    ?.trim()
                || ""

        };


        console.log(
            "AP SEARCH FILTER:",
            filters
        );


        this.filteredData =
            await this.service.search(
                filters
            );


        this.currentPage =
            1;


        this.render();

    }

    catch (error) {

        console.error(
            "AccountPayable.search:",
            error
        );


        this.showError(
            "Failed to search Account Payable."
        );

    }

}

    /*
======================================================
REFRESH
WITH LOADING
======================================================
*/

async refresh() {

    try {

        await this.loadData(
            true
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.refresh:",
            error
        );

    }

}

/*
======================================================
GET TOTAL PAGES
======================================================
*/

getTotalPages() {

    /*
    ==================================================
    TOTAL RECORDS
    ==================================================
    */

    const totalRecords =
        Array.isArray(
            this.filteredData
        )
            ? this.filteredData.length
            : 0;


    /*
    ==================================================
    PAGE SIZE
    ==================================================
    */

    const pageSize =
        Number(
            this.pageSize
        )
        || 20;


    /*
    ==================================================
    TOTAL PAGES
    MINIMUM = 1
    ==================================================
    */

    return Math.max(
        1,
        Math.ceil(
            totalRecords
            /
            pageSize
        )
    );

}
    /*
    ======================================================
    GO TO PAGE
    ======================================================
    */

    goToPage(page) {

        const totalPages =
            this.getTotalPages();


        page =
            Number(page) || 1;


        page =
            Math.max(
                1,
                Math.min(
                    page,
                    totalPages
                )
            );


        this.currentPage =
            page;


        this.render();

    }


    /*
    ======================================================
    RENDER
    ======================================================
    */

    render() {

        this.renderTable();

        this.renderPagination();

    }


    /*
======================================================
RENDER TABLE
ALWAYS USE ACTIVE DOM
======================================================
*/

renderTable() {

    /*
    ==================================================
    ALWAYS GET CURRENT TABLE BODY
    ==================================================
    */

    const activeTableBody =
        document.getElementById(
            "ap-table-body"
        );


    /*
    ==================================================
    TABLE BODY NOT AVAILABLE
    ==================================================
    */

    if (
        !activeTableBody
    ) {

        console.warn(
            "AccountPayable.renderTable: active table body not found."
        );

        return;

    }


    /*
    ==================================================
    UPDATE CACHE
    ==================================================
    */

    this.tableBody =
        activeTableBody;


    /*
    ==================================================
    START INDEX
    ==================================================
    */

    const startIndex =
        (
            this.currentPage
            -
            1
        )
        *
        this.pageSize;


    /*
    ==================================================
    END INDEX
    ==================================================
    */

    const endIndex =
        startIndex
        +
        this.pageSize;


    /*
    ==================================================
    PAGE DATA
    ==================================================
    */

    const pageData =
        (
            Array.isArray(
                this.filteredData
            )
                ? this.filteredData
                : []
        )
        .slice(
            startIndex,
            endIndex
        );


    /*
    ==================================================
    EMPTY
    ==================================================
    */

    if (
        pageData.length === 0
    ) {

        activeTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="
                        text-center
                        py-5
                        text-muted
                    ">

                    No Account Payable found.

                </td>

            </tr>

        `;


        return;

    }


    /*
    ==================================================
    DEBUG CURRENT RENDER
    ==================================================
    */

    console.log(
        "AP RENDER TABLE:",
        pageData.map(
            invoice => ({
                invoice_no:
                    invoice.invoice_no,

                status:
                    invoice.status,

                paid_amount:
                    invoice.paid_amount,

                outstanding_amount:
                    invoice.outstanding_amount
            })
        )
    );


    /*
    ==================================================
    RENDER ROW
    ==================================================
    */

    activeTableBody.innerHTML =
        pageData
            .map(
                (
                    invoice,
                    index
                ) => {

                    return this.createTableRow(
                        invoice,
                        startIndex
                        +
                        index
                        +
                        1
                    );

                }
            )
            .join("");

}
    /*
    ======================================================
    RENDER PAGINATION
    ======================================================
    */

    renderPagination() {

        const totalRecords =
            this.filteredData.length;

        const totalPages =
            this.getTotalPages();


        this.currentPage =
            Math.max(
                1,
                Math.min(
                    this.currentPage,
                    totalPages
                )
            );


        if (this.currentPageInput) {

            this.currentPageInput.value =
                this.currentPage;

        }


        if (this.totalPagesElement) {

            this.totalPagesElement.textContent =
                totalPages;

        }


        if (this.recordInfo) {

            if (!totalRecords) {

                this.recordInfo.textContent =
                    "Records 0 - 0 of 0";

            }

            else {

                const start =
                    (
                        this.currentPage - 1
                    ) *
                    this.pageSize + 1;


                const end =
                    Math.min(
                        this.currentPage *
                        this.pageSize,
                        totalRecords
                    );


                this.recordInfo.textContent =
                    `Records ${start} - ${end} of ${totalRecords}`;

            }

        }


        if (this.btnFirstPage) {

            this.btnFirstPage.disabled =
                this.currentPage <= 1;

        }


        if (this.btnPrevPage) {

            this.btnPrevPage.disabled =
                this.currentPage <= 1;

        }


        if (this.btnNextPage) {

            this.btnNextPage.disabled =
                this.currentPage >= totalPages;

        }


        if (this.btnLastPage) {

            this.btnLastPage.disabled =
                this.currentPage >= totalPages;

        }

    }
/*
======================================================
CREATE TABLE ROW
ACCOUNT PAYABLE
NEW COMPACT BODY LAYOUT
WITH VIEW PAYMENT
COMPLETE / NOT COMPLETE VISUAL
WITH JOURNAL POSTING STATUS
======================================================
*/

createTableRow(
    invoice,
    number
) {

    /*
    ==================================================
    VENDOR
    ==================================================
    */

    const vendor =
        invoice?.mst_business_partner;


    const vendorName =
        vendor?.bp_name
        || "-";


    /*
    ==================================================
    DOCUMENT DATA
    ==================================================
    */

    const invoiceNo =
        invoice?.invoice_no
        || "-";


    const poNo =
        invoice?.po_no
        || "-";


    /*
    ==================================================
    JOURNAL NO
    ==================================================
    */

    const journalNo =
        invoice?.trx_gl_journal?.journal_no
        ||
        invoice?.journal_no
        ||
        (
            invoice?.gl_journal_id
                ? "Linked"
                : "Not Set"
        );


    /*
    ==================================================
    JOURNAL STATUS
    ==================================================
    */

    const journalStatus =
        String(
            invoice
                ?.trx_gl_journal
                ?.status
            ||
            ""
        )
        .trim();


    /*
    ==================================================
    JOURNAL POSTED
    ==================================================
    */

    const isJournalPosted =
        journalStatus === "Posted";


    /*
    ==================================================
    JOURNAL LINK EXISTS
    ==================================================
    */

    const hasJournal =
        Boolean(
            invoice?.gl_journal_id
            ||
            invoice?.trx_gl_journal?.id
        );


    /*
    ==================================================
    JOURNAL STATUS TEXT
    ==================================================
    */

    const journalStatusText =
        isJournalPosted
            ? "Journal POSTED"
            : "Journal NOT POSTED";


    /*
    ==================================================
    JOURNAL STATUS CLASS
    ==================================================
    */

    const journalStatusClass =
        isJournalPosted
            ? "ap-journal-posted"
            : "ap-journal-not-posted";


    /*
    ==================================================
    DESCRIPTION
    ==================================================
    */

    const description =
        invoice?.description
        || "-";


    /*
    ==================================================
    DATE DATA
    ==================================================
    */

    const invoiceDate =
        invoice?.invoice_date
        || "-";


    const dateReceived =
        invoice?.date_received
        || "-";


    const dueDate =
        invoice?.due_date
        || "-";


    /*
    ==================================================
    TOTAL AMOUNT
    ==================================================
    */

    const totalValue =
        Number(
            invoice?.total_amount
            ??
            invoice?.total
            ??
            0
        );


    /*
    ==================================================
    PAID AMOUNT
    ==================================================
    */

    const paidValue =
        Number(
            invoice?.paid_amount
            ??
            0
        );


    /*
    ==================================================
    OUTSTANDING AMOUNT
    ==================================================
    */

    const outstandingValue =
        Number(
            invoice?.outstanding_amount
            ??
            invoice?.outstanding
            ??
            totalValue
        );


    /*
    ==================================================
    FORMAT AMOUNT
    ==================================================
    */

    const totalAmount =
        this.formatCurrency(
            totalValue
        );


    const paidAmount =
        this.formatCurrency(
            paidValue
        );


    const outstandingAmount =
        this.formatCurrency(
            outstandingValue
        );


    /*
    ==================================================
    TECHNICAL STATUS
    ==================================================
    */

    const technicalStatus =
        String(
            invoice?.status
            || "Draft"
        )
        .trim()
        .toLowerCase();


    /*
    ==================================================
    PAYMENT STATUS
    ==================================================
    */

    const paymentStatus =
        this.getPaymentStatus(
            invoice
        );


    /*
    ==================================================
    COMPLETE / NOT COMPLETE

    NOT COMPLETE:
    Draft

    COMPLETE:
    Complete
    Partial Paid
    Paid
    ==================================================
    */

    const isCompleted =
        (
            technicalStatus === "complete"
            ||
            technicalStatus === "partial paid"
            ||
            technicalStatus === "paid"
        );


    /*
    ==================================================
    ROW CLASS
    ==================================================
    */

    const rowClass =
        isCompleted
            ? "ap-row-completed"
            : "ap-row-not-completed";


    /*
    ==================================================
    DEBUG
    ==================================================
    */

    console.log(
        "AP ROW:",
        {

            invoice_no:
                invoiceNo,

            vendor:
                vendorName,

            status:
                invoice?.status,

            technical_status:
                technicalStatus,

            payment_status:
                paymentStatus,

            completed:
                isCompleted,

            row_class:
                rowClass,

            total:
                totalValue,

            paid:
                paidValue,

            outstanding:
                outstandingValue,

            journal:
                journalNo,

            journal_status:
                journalStatus,

            journal_posted:
                isJournalPosted

        }
    );


    /*
    ==================================================
    RETURN ROW
    ==================================================
    */

    return `

        <tr
            class="
                ap-data-row
                ${rowClass}
            "
            data-status="${technicalStatus}"
            data-id="${invoice?.id || ""}">


            <!-- ======================================
                 NO
            ======================================= -->

            <td
                class="
                    finova-table-index
                    ap-cell-no
                ">

                ${number}

            </td>


            <!-- ======================================
                 DOCUMENT
            ======================================= -->

            <td class="ap-cell-document">

                <div class="ap-document-wrap">


                    <!-- ==================================
                         TYPE BADGE
                    =================================== -->

                    <div class="ap-document-badges">

                        <span
                            class="
                                ap-document-badge
                                ap-document-badge-payable
                            ">

                            PAYABLE

                        </span>


                        <span
                            class="
                                ap-document-badge
                                ap-document-badge-invoice
                            ">

                            INV

                        </span>

                    </div>


                    <!-- ==================================
                         INVOICE NO
                    =================================== -->

                    <div class="ap-info-line">

                        <span class="ap-info-label">

                            Inv No

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span
                            class="
                                ap-info-value
                                fw-semibold
                            ">

                            ${invoiceNo}

                        </span>

                    </div>


                    <!-- ==================================
                         PO NO
                    =================================== -->

                    <div class="ap-info-line">

                        <span class="ap-info-label">

                            PO No

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span class="ap-info-value">

                            ${poNo}

                        </span>

                    </div>


                    <!-- ==================================
                         JOURNAL
                    =================================== -->

                    <div class="ap-info-line">

                        <span class="ap-info-label">

                            Journal

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span
                            class="
                                ap-info-value
                                fw-semibold
                            ">

                            ${journalNo}

                        </span>

                    </div>


                    <!-- ==================================
                         JOURNAL POSTING STATUS
                    =================================== -->

                    ${
                        hasJournal

                            ? `

                                <div
                                    class="
                                        ap-journal-status
                                        ${journalStatusClass}
                                    ">

                                    ${journalStatusText}

                                </div>

                            `

                            : ""
                    }


                </div>

            </td>


            <!-- ======================================
                 VENDOR / DESCRIPTION
            ======================================= -->

            <td class="ap-cell-vendor">

                <div class="ap-vendor-wrap">


                    <!-- VENDOR -->

                    <div class="ap-vendor-name">

                        ${vendorName}

                    </div>


                    <!-- DESCRIPTION -->

                    <div class="ap-description-line">

                        <span class="ap-info-label">

                            Description

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span class="ap-description-value">

                            ${description}

                        </span>

                    </div>


                </div>

            </td>


            <!-- ======================================
                 DATE INFORMATION
            ======================================= -->

            <td class="ap-cell-date-info">

                <div class="ap-date-wrap">


                    <!-- INVOICE DATE -->

                    <div class="ap-info-line">

                        <span class="ap-info-label">

                            Inv Date

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span class="ap-info-value">

                            ${invoiceDate}

                        </span>

                    </div>


                    <!-- RECEIVED -->

                    <div class="ap-info-line">

                        <span class="ap-info-label">

                            Received

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span class="ap-info-value">

                            ${dateReceived}

                        </span>

                    </div>


                    <!-- DUE DATE -->

                    <div class="ap-info-line">

                        <span class="ap-info-label">

                            Due Date

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span class="ap-info-value">

                            ${dueDate}

                        </span>

                    </div>


                </div>

            </td>


            <!-- ======================================
                 AMOUNT / STATUS
            ======================================= -->

            <td class="ap-cell-amount-status">

                <div class="ap-amount-wrap">


                    <!-- TOTAL -->

                    <div class="ap-info-line">

                        <span class="ap-info-label">

                            Total

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span
                            class="
                                ap-info-value
                                ap-amount-value
                            ">

                            ${totalAmount}

                        </span>

                    </div>


                    <!-- PAID -->

                    <div class="ap-info-line">

                        <span class="ap-info-label">

                            Paid

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span
                            class="
                                ap-info-value
                                ap-amount-value
                            ">

                            ${paidAmount}

                        </span>

                    </div>


                    <!-- OUTSTANDING -->

                    <div class="ap-info-line">

                        <span class="ap-info-label">

                            Outstanding

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span
                            class="
                                ap-info-value
                                ap-amount-value
                            ">

                            ${outstandingAmount}

                        </span>

                    </div>


                    <!-- STATUS -->

                    <div
                        class="
                            ap-info-line
                            ap-status-line
                        ">

                        <span class="ap-info-label">

                            Status

                        </span>


                        <span class="ap-info-separator">

                            :

                        </span>


                        <span class="ap-info-value">

                            ${this.renderStatus(
                                paymentStatus
                            )}

                        </span>

                    </div>


                    <!-- ==================================
                         VIEW PAYMENT
                    =================================== -->

                    ${
                        paidValue > 0

                            ? `

                                <div
                                    class="
                                        ap-info-line
                                        ap-payment-view-line
                                    ">

                                    <span class="ap-info-label">

                                        Payment

                                    </span>


                                    <span class="ap-info-separator">

                                        :

                                    </span>


                                    <span class="ap-info-value">

                                        ${this.renderViewPayment(
                                            invoice
                                        )}

                                    </span>

                                </div>

                            `

                            : ""
                    }


                </div>

            </td>


            <!-- ======================================
                 ACTION
            ======================================= -->

            <td
                class="
                    finova-table-action
                    ap-cell-action
                ">

                ${this.renderActionButtons(
                    invoice
                )}

            </td>


        </tr>

    `;

}
/*
======================================================
GET AP PAYMENT STATUS
FINAL
======================================================
*/

getPaymentStatus(
    invoice
) {

    /*
    ==================================================
    VALIDATION
    ==================================================
    */

    if (
        !invoice
    ) {

        return "Unpaid";

    }


    /*
    ==================================================
    TECHNICAL STATUS
    ==================================================
    */

    const technicalStatus =
        String(
            invoice.status
            ||
            "Draft"
        )
        .trim();


    /*
    ==================================================
    DRAFT / NOT COMPLETE

    PAYMENT STATUS MUST ALWAYS BE UNPAID

    IMPORTANT:
    Jika journal invoice dihapus dan AP kembali Draft,
    badge tidak boleh masih menampilkan Paid.
    ==================================================
    */

    if (
        technicalStatus === "Draft"
    ) {

        return "Unpaid";

    }


    /*
    ==================================================
    VOID
    ==================================================
    */

    if (
        technicalStatus === "Void"
    ) {

        return "Void";

    }


    /*
    ==================================================
    TOTAL
    ==================================================
    */

    const totalAmount =
        Number(
            invoice.total_amount
            ??
            invoice.total
            ??
            0
        );


    /*
    ==================================================
    PAID
    ==================================================
    */

    const paidAmount =
        Number(
            invoice.paid_amount
            ??
            0
        );


    /*
    ==================================================
    OUTSTANDING
    ==================================================
    */

    const outstandingAmount =
        Number(
            invoice.outstanding_amount
            ??
            totalAmount
        );


    /*
    ==================================================
    PAID
    ==================================================
    */

    if (
        totalAmount > 0
        &&
        paidAmount >= totalAmount
        &&
        outstandingAmount <= 0
    ) {

        return "Paid";

    }


    /*
    ==================================================
    PARTIAL PAID
    ==================================================
    */

    if (
        paidAmount > 0
        &&
        paidAmount < totalAmount
    ) {

        return "Partial Paid";

    }


    /*
    ==================================================
    UNPAID
    ==================================================
    */

    return "Unpaid";

}
/*
======================================================
RENDER VIEW PAYMENT
ACCOUNT PAYABLE
FINAL
======================================================
*/

renderViewPayment(
    invoice
) {

    /*
    ==================================================
    VALIDATION
    ==================================================
    */

    if (
        !invoice
    ) {

        return "";

    }


    /*
    ==================================================
    AP ID
    ==================================================
    */

    const id =
        invoice?.id;


    if (
        !id
    ) {

        return "";

    }


    /*
    ==================================================
    TECHNICAL STATUS
    ==================================================
    */

    const technicalStatus =
        String(
            invoice?.status
            ||
            "Draft"
        )
        .trim();


    /*
    ==================================================
    DRAFT

    IF AP RETURNS TO DRAFT,
    PAYMENT HISTORY MUST NOT BE SHOWN
    ==================================================
    */

    if (
        technicalStatus === "Draft"
    ) {

        return "";

    }


    /*
    ==================================================
    VOID
    ==================================================
    */

    if (
        technicalStatus === "Void"
    ) {

        return "";

    }


    /*
    ==================================================
    PAID AMOUNT
    ==================================================
    */

    const paidAmount =
        Number(
            invoice?.paid_amount
            ||
            0
        );


    /*
    ==================================================
    NO PAYMENT
    ==================================================
    */

    if (
        !Number.isFinite(
            paidAmount
        )
        ||
        paidAmount <= 0
    ) {

        return "";

    }


    /*
    ==================================================
    BUTTON
    ==================================================
    */

    return `

        <button
            type="button"
            class="
                btn
                btn-link
                p-0
                ap-view-payment
            "
            data-action="view-payment"
            data-id="${id}"
            title="View Payment">

            <i
                class="
                    fa-regular
                    fa-eye
                    me-1
                ">
            </i>

            View Payment

        </button>

    `;

}
/*
======================================================
VIEW AP PAYMENT
ONLY ACTIVE PAYMENT
WITH BANK / PAYMENT ACCOUNT
======================================================
*/

async viewPayment(
    id
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !id
        ) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        GET ACCOUNT PAYABLE
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        const invoice =
            result?.header
            || null;


        if (
            !invoice
        ) {

            throw new Error(
                "Account Payable not found."
            );

        }


        /*
        ==================================================
        GET ACTIVE PAYMENT HISTORY

        ACTIVE PAYMENT =
        gl_journal_id IS NOT NULL
        ==================================================
        */

        const {

            data: payments,

            error

        } = await supabase

            .from(
                "trx_ap_payment"
            )

            .select(`

                id,
                account_payable_id,
                payment_date,
                bank_account_id,

                dpp_amount,
                tax_plus_amount,
                tax_minus_amount,
                payment_amount,

                reference_no,
                description,

                gl_journal_id,

                created_at,
                updated_at,

                trx_gl_journal (
                    id,
                    journal_no,
                    journal_date,
                    status
                )

            `)

            .eq(
                "account_payable_id",
                id
            )

            .not(
                "gl_journal_id",
                "is",
                null
            )

            .order(
                "payment_date",
                {
                    ascending:
                        false
                }
            )

            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "AP PAYMENT HISTORY ERROR:",
                {

                    message:
                        error.message,

                    details:
                        error.details,

                    hint:
                        error.hint,

                    code:
                        error.code

                }
            );


            throw error;

        }


        /*
        ==================================================
        VALIDATE PAYMENT
        ==================================================
        */

        if (
            !Array.isArray(
                payments
            )
            ||
            payments.length === 0
        ) {

            throw new Error(
                "Active payment history not found."
            );

        }


        /*
        ==================================================
        VALIDATE JOURNAL LINK
        ==================================================
        */

        const validPayments =
            payments.filter(
                payment => {

                    return (
                        payment
                        &&
                        payment.gl_journal_id
                    );

                }
            );


        if (
            validPayments.length === 0
        ) {

            throw new Error(
                "No active payment with GL Journal found."
            );

        }


        /*
        ==================================================
        GET UNIQUE BANK ACCOUNT IDS

        BANK ACCOUNT =
        CHART OF ACCOUNTS
        ==================================================
        */

        const bankAccountIds =
            [
                ...new Set(
                    validPayments

                        .map(
                            payment =>
                                Number(
                                    payment.bank_account_id
                                    || 0
                                )
                        )

                        .filter(
                            bankAccountId =>
                                bankAccountId > 0
                        )
                )
            ];


        /*
        ==================================================
        LOAD BANK / PAYMENT ACCOUNTS
        ==================================================
        */

        let bankAccounts =
            [];


        if (
            bankAccountIds.length > 0
        ) {

            const {

                data: bankData,

                error: bankError

            } = await supabase

                .from(
                    "mst_chart_of_accounts"
                )

                .select(`
                    id,
                    account_code,
                    account_name
                `)

                .in(
                    "id",
                    bankAccountIds
                );


            if (
                bankError
            ) {

                console.error(
                    "AP PAYMENT BANK ACCOUNT ERROR:",
                    {

                        message:
                            bankError.message,

                        details:
                            bankError.details,

                        hint:
                            bankError.hint,

                        code:
                            bankError.code

                    }
                );


                throw bankError;

            }


            bankAccounts =
                Array.isArray(
                    bankData
                )
                    ? bankData
                    : [];

        }


        /*
        ==================================================
        MAP BANK ACCOUNT TO PAYMENT
        ==================================================
        */

        const paymentHistory =
            validPayments.map(
                payment => {

                    const bankAccount =
                        bankAccounts.find(
                            account => {

                                return (
                                    String(
                                        account.id
                                    )
                                    ===
                                    String(
                                        payment.bank_account_id
                                    )
                                );

                            }
                        )
                        || null;


                    return {

                        ...payment,

                        bank_account:
                            bankAccount

                    };

                }
            );


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP ACTIVE PAYMENT HISTORY:",
            {

                account_payable_id:
                    id,

                invoice_no:
                    invoice.invoice_no,

                payment_count:
                    paymentHistory.length,

                payments:
                    paymentHistory

            }
        );


        /*
        ==================================================
        OPEN MODAL
        ==================================================
        */

        this.openPaymentHistoryModal(
            invoice,
            paymentHistory
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.viewPayment:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to load payment history."
        );

    }

}
/*
======================================================
OPEN AP PAYMENT HISTORY MODAL
ONLY ACTIVE PAYMENT
WITH BANK / PAYMENT ACCOUNT
DESCRIPTION FULL WIDTH
======================================================
*/

openPaymentHistoryModal(
    invoice,
    payments = []
) {

    /*
    ==================================================
    VALIDATE INVOICE
    ==================================================
    */

    if (
        !invoice
    ) {

        this.showError(
            "Account Payable data is required."
        );

        return;

    }


    /*
    ==================================================
    FILTER ACTIVE PAYMENT

    ACTIVE PAYMENT =
    gl_journal_id IS NOT NULL
    ==================================================
    */

    const activePayments =
        (
            Array.isArray(
                payments
            )
                ? payments
                : []
        )
        .filter(
            payment => {

                return (
                    payment
                    &&
                    payment.gl_journal_id
                );

            }
        );


    /*
    ==================================================
    NO ACTIVE PAYMENT
    ==================================================
    */

    if (
        activePayments.length === 0
    ) {

        this.showError(
            "Active payment history not found."
        );

        return;

    }


    /*
    ==================================================
    REMOVE OLD MODAL
    ==================================================
    */

    const oldModal =
        document.getElementById(
            "apPaymentHistoryModal"
        );


    if (
        oldModal
    ) {

        const oldInstance =
            bootstrap.Modal.getInstance(
                oldModal
            );


        if (
            oldInstance
        ) {

            oldInstance.dispose();

        }


        oldModal.remove();

    }


    /*
    ==================================================
    VENDOR
    ==================================================
    */

    const vendorName =
        invoice
            ?.mst_business_partner
            ?.bp_name
        ||
        "-";


    /*
    ==================================================
    TOTAL PAID
    ONLY ACTIVE PAYMENT
    ==================================================
    */

    const totalPaid =
        activePayments.reduce(
            (
                total,
                payment
            ) => {

                const amount =
                    Number(
                        payment?.payment_amount
                        ||
                        0
                    );


                return (
                    total
                    +
                    (
                        Number.isFinite(
                            amount
                        )
                            ? amount
                            : 0
                    )
                );

            },
            0
        );


    /*
    ==================================================
    NORMALIZE TOTAL PAID
    ==================================================
    */

    const normalizedTotalPaid =
        Number(
            totalPaid.toFixed(
                2
            )
        );


    /*
    ==================================================
    PAYMENT ROWS
    ==================================================
    */

    const rows =
        activePayments
            .map(
                (
                    payment,
                    index
                ) => {

                    /*
                    ======================================
                    PAYMENT AMOUNT
                    ======================================
                    */

                    const paymentAmount =
                        Number(
                            payment?.payment_amount
                            ||
                            0
                        );


                    /*
                    ======================================
                    BANK / PAYMENT ACCOUNT
                    ======================================
                    */

                    const bankAccount =
                        payment?.bank_account
                        ||
                        null;


                    const bankAccountCode =
                        String(
                            bankAccount?.account_code
                            ||
                            ""
                        )
                        .trim();


                    const bankAccountName =
                        String(
                            bankAccount?.account_name
                            ||
                            ""
                        )
                        .trim();


                    let bankAccountDisplay =
                        "-";


                    if (
                        bankAccountCode
                        &&
                        bankAccountName
                    ) {

                        bankAccountDisplay =
                            `${bankAccountCode} - ${bankAccountName}`;

                    }

                    else if (
                        bankAccountName
                    ) {

                        bankAccountDisplay =
                            bankAccountName;

                    }

                    else if (
                        bankAccountCode
                    ) {

                        bankAccountDisplay =
                            bankAccountCode;

                    }


                    /*
                    ======================================
                    DESCRIPTION
                    ======================================
                    */

                    const paymentDescription =
                        String(
                            payment?.description
                            ||
                            "-"
                        )
                        .trim();


                    /*
                    ======================================
                    JOURNAL
                    ======================================
                    */

                    const journal =
                        payment
                            ?.trx_gl_journal
                        ||
                        null;


                    /*
                    ======================================
                    JOURNAL NO
                    ======================================
                    */

                    const journalNo =
                        journal?.journal_no
                        ||
                        "-";


                    /*
                    ======================================
                    JOURNAL STATUS
                    ======================================
                    */

                    const journalStatus =
                        String(
                            journal?.status
                            ||
                            ""
                        )
                        .trim();


                    /*
                    ======================================
                    JOURNAL BADGE
                    ======================================
                    */

                    let journalStatusBadge =
                        "";


                    if (
                        journalStatus
                    ) {

                        let badgeClass =
                            "bg-secondary";


                        if (
                            journalStatus ===
                            "Posted"
                        ) {

                            badgeClass =
                                "bg-success";

                        }

                        else if (
                            journalStatus ===
                            "Draft"
                        ) {

                            badgeClass =
                                "bg-warning text-dark";

                        }

                        else if (
                            journalStatus ===
                            "Void"
                        ) {

                            badgeClass =
                                "bg-danger";

                        }


                        journalStatusBadge = `

                            <span
                                class="
                                    badge
                                    ${badgeClass}
                                    ap-payment-journal-status
                                ">

                                ${journalStatus}

                            </span>

                        `;

                    }


                    /*
                    ======================================
                    RETURN ROW
                    ======================================
                    */

                    return `

                        <!-- ==============================
                             MAIN PAYMENT ROW
                        =============================== -->

                        <tr>


                            <!-- NO -->

                            <td
                                class="
                                    text-center
                                    align-middle
                                ">

                                ${index + 1}

                            </td>


                            <!-- PAYMENT DATE -->

                            <td
                                class="
                                    text-center
                                    align-middle
                                ">

                                ${
                                    payment?.payment_date
                                    ||
                                    "-"
                                }

                            </td>


                            <!-- BANK / PAYMENT ACCOUNT -->

                            <td
                                class="
                                    align-middle
                                "
                                style="
                                    white-space:normal;
                                    overflow-wrap:anywhere;
                                    word-break:normal;
                                    line-height:1.5;
                                ">

                                <div
                                    class="
                                        ap-payment-bank-account
                                        fw-medium
                                    ">

                                    ${bankAccountDisplay}

                                </div>

                            </td>


                            <!-- AMOUNT -->

                            <td
                                class="
                                    text-end
                                    fw-semibold
                                    align-middle
                                ">

                                ${
                                    this.formatCurrency(
                                        paymentAmount
                                    )
                                }

                            </td>


                            <!-- JOURNAL -->

                            <td
                                class="
                                    text-center
                                    align-middle
                                    ap-payment-journal-cell
                                ">

                                <div
                                    class="
                                        ap-payment-journal-wrap
                                    ">

                                    <div
                                        class="
                                            ap-payment-journal-no
                                        ">

                                        ${journalNo}

                                    </div>


                                    ${journalStatusBadge}

                                </div>

                            </td>


                        </tr>


                        <!-- ==============================
                             DESCRIPTION ROW
                        =============================== -->

                        <tr
                            class="
                                ap-payment-description-row
                            ">


                            <!-- EMPTY UNDER NO -->

                            <td></td>


                            <!-- DESCRIPTION FULL WIDTH -->

                            <td
                                colspan="4"
                                class="
                                    ap-payment-description-cell
                                ">

                                <div
                                    class="
                                        ap-payment-description-wrap
                                    ">

                                    <span
                                        class="
                                            ap-payment-description-label
                                        ">

                                        Description

                                    </span>


                                    <span
                                        class="
                                            ap-payment-description-separator
                                        ">

                                        :

                                    </span>


                                    <span
                                        class="
                                            ap-payment-description-value
                                        ">

                                        ${paymentDescription}

                                    </span>

                                </div>

                            </td>


                        </tr>

                    `;

                }
            )
            .join("");


    /*
    ==================================================
    MODAL HTML
    ==================================================
    */

    const modalHTML = `

        <div
            class="modal fade"
            id="apPaymentHistoryModal"
            tabindex="-1"
            aria-hidden="true">

            <div
                class="
                    modal-dialog
                    modal-xl
                    modal-dialog-centered
                    modal-dialog-scrollable
                ">

                <div class="modal-content">


                    <!-- ==================================
                         HEADER
                    =================================== -->

                    <div class="modal-header">

                        <div>

                            <h5
                                class="
                                    modal-title
                                    fw-semibold
                                ">

                                <i
                                    class="
                                        fa-solid
                                        fa-money-bill-transfer
                                        me-2
                                    ">
                                </i>

                                View Payment

                            </h5>


                            <div
                                class="
                                    text-muted
                                    small
                                    mt-1
                                ">

                                Account Payable Payment History

                            </div>

                        </div>


                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close">
                        </button>

                    </div>


                    <!-- ==================================
                         BODY
                    =================================== -->

                    <div class="modal-body">


                        <!-- ==================================
                             HEADER INFORMATION
                        =================================== -->

                        <div class="row g-3 mb-4">


                            <!-- INVOICE NO -->

                            <div class="col-md-4">

                                <label class="form-label">

                                    Invoice No

                                </label>


                                <input
                                    type="text"
                                    class="form-control"
                                    value="${
                                        invoice?.invoice_no
                                        ||
                                        ""
                                    }"
                                    readonly>

                            </div>


                            <!-- VENDOR -->

                            <div class="col-md-5">

                                <label class="form-label">

                                    Vendor

                                </label>


                                <input
                                    type="text"
                                    class="form-control"
                                    value="${vendorName}"
                                    readonly>

                            </div>


                            <!-- TOTAL PAID -->

                            <div class="col-md-3">

                                <label class="form-label">

                                    Total Paid

                                </label>


                                <input
                                    type="text"
                                    class="
                                        form-control
                                        text-end
                                        fw-semibold
                                    "
                                    value="${
                                        this.formatCurrency(
                                            normalizedTotalPaid
                                        )
                                    }"
                                    readonly>

                            </div>


                        </div>


                        <!-- ==================================
                             PAYMENT TABLE
                        =================================== -->

                        <div class="table-responsive">

                            <table
                                class="
                                    table
                                    table-bordered
                                    table-hover
                                    align-middle
                                    mb-0
                                "
                                style="
                                    width:100%;
                                    table-layout:fixed;
                                ">


                                <!-- ==========================
                                     COLUMN WIDTH
                                =========================== -->

                                <colgroup>

                                    <!-- NO -->

                                    <col
                                        style="
                                            width:45px;
                                        ">


                                    <!-- PAYMENT DATE -->

                                    <col
                                        style="
                                            width:110px;
                                        ">


                                    <!-- BANK / PAYMENT ACCOUNT -->

                                    <col
                                        style="
                                            width:320px;
                                        ">


                                    <!-- AMOUNT -->

                                    <col
                                        style="
                                            width:130px;
                                        ">


                                    <!-- JOURNAL -->

                                    <col
                                        style="
                                            width:170px;
                                        ">

                                </colgroup>


                                <!-- ==========================
                                     TABLE HEADER
                                =========================== -->

                                <thead>

                                    <tr>


                                        <th
                                            class="
                                                text-center
                                            ">

                                            No

                                        </th>


                                        <th
                                            class="
                                                text-center
                                            ">

                                            Payment Date

                                        </th>


                                        <th>

                                            Bank / Payment Account

                                        </th>


                                        <th
                                            class="
                                                text-end
                                            ">

                                            Amount

                                        </th>


                                        <th
                                            class="
                                                text-center
                                            ">

                                            Journal

                                        </th>


                                    </tr>

                                </thead>


                                <!-- ==========================
                                     TABLE BODY
                                =========================== -->

                                <tbody>

                                    ${rows}

                                </tbody>


                                <!-- ==========================
                                     TABLE FOOTER
                                =========================== -->

                                <tfoot>

                                    <tr>


                                        <!-- TOTAL LABEL -->

                                        <td
                                            colspan="3"
                                            class="
                                                text-end
                                                fw-semibold
                                            ">

                                            Total Paid

                                        </td>


                                        <!-- TOTAL AMOUNT -->

                                        <td
                                            class="
                                                text-end
                                                fw-bold
                                            ">

                                            ${
                                                this.formatCurrency(
                                                    normalizedTotalPaid
                                                )
                                            }

                                        </td>


                                        <!-- JOURNAL -->

                                        <td></td>


                                    </tr>

                                </tfoot>


                            </table>

                        </div>


                    </div>


                    <!-- ==================================
                         FOOTER
                    =================================== -->

                    <div class="modal-footer">

                        <div
                            class="
                                me-auto
                                text-muted
                                small
                            ">

                            ${
                                activePayments.length
                            }
                            payment transaction${
                                activePayments.length > 1
                                    ? "s"
                                    : ""
                            }

                        </div>


                        <button
                            type="button"
                            class="
                                btn
                                btn-secondary
                            "
                            data-bs-dismiss="modal">

                            Close

                        </button>

                    </div>


                </div>

            </div>

        </div>

    `;


    /*
    ==================================================
    APPEND MODAL
    ==================================================
    */

    document.body.insertAdjacentHTML(
        "beforeend",
        modalHTML
    );


    /*
    ==================================================
    GET MODAL
    ==================================================
    */

    const modalElement =
        document.getElementById(
            "apPaymentHistoryModal"
        );


    if (
        !modalElement
    ) {

        this.showError(
            "Payment History Modal could not be created."
        );

        return;

    }


    /*
    ==================================================
    CREATE BOOTSTRAP MODAL
    ==================================================
    */

    const modal =
        bootstrap.Modal
            .getOrCreateInstance(
                modalElement
            );


    /*
    ==================================================
    SHOW
    ==================================================
    */

    modal.show();


    /*
    ==================================================
    CLEAN AFTER CLOSE
    ==================================================
    */

    modalElement.addEventListener(
        "hidden.bs.modal",
        () => {

            modal.dispose();

            modalElement.remove();

        },
        {
            once:
                true
        }
    );

}
/*
======================================================
RENDER PAYMENT STATUS
======================================================
*/

renderStatus(status) {

    const normalizedStatus =
        String(
            status || "Unpaid"
        )
        .trim()
        .toLowerCase();


    switch (normalizedStatus) {


        /*
        ==============================================
        UNPAID
        ==============================================
        */

        case "unpaid":

            return `
                <span class="badge bg-danger">
                    Unpaid
                </span>
            `;


        /*
        ==============================================
        PARTIAL PAID
        ==============================================
        */

        case "partial paid":

            return `
                <span class="badge bg-warning text-dark">
                    Partial Paid
                </span>
            `;


        /*
        ==============================================
        LESS PAID
        ==============================================
        */

        case "less paid":

            return `
                <span class="badge bg-info text-dark">
                    Less Paid
                </span>
            `;


        /*
        ==============================================
        PAID
        ==============================================
        */

        case "paid":

            return `
                <span class="badge bg-success">
                    Paid
                </span>
            `;
        /*
==================================================
PAID
==================================================
*/

if (
    normalizedStatus === "paid"
) {

    return `

        <span class="badge bg-success">

            Paid

        </span>

    `;

}

        /*
        ==============================================
        DEFAULT
        ==============================================
        */

        default:

            return `
                <span class="badge bg-danger">
                    Unpaid
                </span>
            `;

    }

}
/*
======================================================
RENDER ACTION BUTTONS
ACCOUNT PAYABLE

PAYMENT RULE:
PAYMENT ONLY AVAILABLE WHEN
GL JOURNAL STATUS = POSTED
======================================================
*/

renderActionButtons(invoice) {

    /*
    ==================================================
    GET ID
    ==================================================
    */

    const id =
        invoice?.id;


    if (!id) {

        return "";

    }


    /*
    ==================================================
    AP STATUS
    ==================================================
    */

    const status =
        String(
            invoice?.status
            || "Draft"
        )
        .trim();


    /*
    ==================================================
    GL JOURNAL
    ==================================================
    */

    const glJournal =
        invoice?.trx_gl_journal
        || null;


    /*
    ==================================================
    GL JOURNAL STATUS
    ==================================================
    */

    const glJournalStatus =
        String(
            glJournal?.status
            || ""
        )
        .trim();


    /*
    ==================================================
    JOURNAL POSTED
    ==================================================
    */

    const isJournalPosted =
        glJournalStatus === "Posted";


    /*
    ==================================================
    DEBUG
    ==================================================
    */

    console.log(
        "AP ACTION:",
        {

            id:
                id,

            invoice_no:
                invoice?.invoice_no,

            ap_status:
                status,

            gl_journal_id:
                invoice?.gl_journal_id
                || null,

            gl_journal_no:
                glJournal?.journal_no
                || null,

            gl_journal_status:
                glJournalStatus
                || null,

            payment_allowed:
                isJournalPosted

        }
    );


    /*
    ==================================================
    DRAFT

    EDIT
    DELETE
    COMPLETE
    ==================================================
    */

    if (
        status === "Draft"
    ) {

        return `

            <div
                class="btn-group btn-group-sm"
                role="group">


                <!-- EDIT -->

                <button
                    type="button"
                    class="btn btn-outline-primary"
                    title="Edit"
                    data-action="edit"
                    data-id="${id}">

                    <i class="fa-solid fa-pen"></i>

                </button>


                <!-- DELETE -->

                <button
                    type="button"
                    class="btn btn-outline-danger"
                    title="Delete"
                    data-action="delete"
                    data-id="${id}">

                    <i class="fa-solid fa-trash"></i>

                </button>


                <!-- COMPLETE -->

                <button
                    type="button"
                    class="btn btn-outline-success"
                    title="Complete"
                    data-action="complete"
                    data-id="${id}">

                    <i class="fa-solid fa-check"></i>

                </button>


            </div>

        `;

    }


    /*
    ==================================================
    COMPLETE

    VIEW
    PRINT

    PAYMENT:
    ONLY IF GL JOURNAL POSTED
    ==================================================
    */

    if (
        status === "Complete"
    ) {

        return `

            <div
                class="btn-group btn-group-sm"
                role="group">


                <!-- VIEW -->

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    title="View"
                    data-action="view"
                    data-id="${id}">

                    <i class="fa-regular fa-eye"></i>

                </button>


                <!-- PRINT -->

                <button
                    type="button"
                    class="btn btn-outline-dark"
                    title="Print"
                    data-action="print"
                    data-id="${id}">

                    <i class="fa-solid fa-print"></i>

                </button>


                <!-- PAYMENT -->

                ${
                    isJournalPosted

                        ? `

                            <button
                                type="button"
                                class="btn btn-outline-success"
                                title="Payment"
                                data-action="payment"
                                data-id="${id}">

                                <i class="fa-solid fa-money-bill-transfer"></i>

                            </button>

                        `

                        : ""
                }


            </div>

        `;

    }


    /*
    ==================================================
    PARTIAL PAID

    VIEW
    PRINT
    PAYMENT

    PAYMENT ONLY IF JOURNAL POSTED
    ==================================================
    */

    if (
        status === "Partial Paid"
    ) {

        return `

            <div
                class="btn-group btn-group-sm"
                role="group">


                <!-- VIEW -->

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    title="View"
                    data-action="view"
                    data-id="${id}">

                    <i class="fa-regular fa-eye"></i>

                </button>


                <!-- PRINT -->

                <button
                    type="button"
                    class="btn btn-outline-dark"
                    title="Print"
                    data-action="print"
                    data-id="${id}">

                    <i class="fa-solid fa-print"></i>

                </button>


                <!-- PAYMENT -->

                ${
                    isJournalPosted

                        ? `

                            <button
                                type="button"
                                class="btn btn-outline-success"
                                title="Payment"
                                data-action="payment"
                                data-id="${id}">

                                <i class="fa-solid fa-money-bill-transfer"></i>

                            </button>

                        `

                        : ""
                }


            </div>

        `;

    }


    /*
    ==================================================
    PAID

    VIEW
    PRINT

    PAYMENT MUST DISAPPEAR
    ==================================================
    */

    if (
        status === "Paid"
    ) {

        return `

            <div
                class="btn-group btn-group-sm"
                role="group">


                <!-- VIEW -->

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    title="View"
                    data-action="view"
                    data-id="${id}">

                    <i class="fa-regular fa-eye"></i>

                </button>


                <!-- PRINT -->

                <button
                    type="button"
                    class="btn btn-outline-dark"
                    title="Print"
                    data-action="print"
                    data-id="${id}">

                    <i class="fa-solid fa-print"></i>

                </button>


            </div>

        `;

    }


    /*
    ==================================================
    LEGACY POSTED
    VIEW | PRINT
    ==================================================
    */

    if (
        status === "Posted"
    ) {

        return `

            <div
                class="btn-group btn-group-sm"
                role="group">


                <!-- VIEW -->

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    title="View"
                    data-action="view"
                    data-id="${id}">

                    <i class="fa-regular fa-eye"></i>

                </button>


                <!-- PRINT -->

                <button
                    type="button"
                    class="btn btn-outline-dark"
                    title="Print"
                    data-action="print"
                    data-id="${id}">

                    <i class="fa-solid fa-print"></i>

                </button>


            </div>

        `;

    }


    /*
    ==================================================
    VOID
    VIEW | PRINT
    ==================================================
    */

    if (
        status === "Void"
    ) {

        return `

            <div
                class="btn-group btn-group-sm"
                role="group">


                <!-- VIEW -->

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    title="View"
                    data-action="view"
                    data-id="${id}">

                    <i class="fa-regular fa-eye"></i>

                </button>


                <!-- PRINT -->

                <button
                    type="button"
                    class="btn btn-outline-dark"
                    title="Print"
                    data-action="print"
                    data-id="${id}">

                    <i class="fa-solid fa-print"></i>

                </button>


            </div>

        `;

    }


    /*
    ==================================================
    UNKNOWN STATUS
    ==================================================
    */

    console.warn(
        "AP ACTION - UNKNOWN STATUS:",
        status,
        invoice
    );


    return "";

}
}