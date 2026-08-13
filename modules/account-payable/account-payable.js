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
        this.resetInvoiceDetailForm();
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

        this.apDetailUnitPrice = null;

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
INIT
======================================================
*/

async init() {

    try {
        console.log(
            "AccountPayable methods:",
            Object.getOwnPropertyNames(
                AccountPayable.prototype
            )
        );

        /*
        ==============================================
        LOAD MAIN AP MODAL
        ==============================================
        */

        await this.loadModalHTML();


        /*
        ==============================================
        LOAD AP DETAIL MODAL
        ==============================================
        */

        await this.loadDetailModalHTML();


        /*
        ==============================================
        CACHE DOM
        ==============================================
        */

        this.cacheDOM();


        /*
        ==============================================
        LOAD VENDORS
        ==============================================
        */

        await this.loadVendors();


        /*
        ==============================================
        BIND EVENTS
        ==============================================
        */

        this.bindEvents();


        /*
        ==============================================
        LOAD DATA
        ==============================================
        */

        await this.loadData();

    }

    catch (error) {

        console.error(
            "AccountPayable.init:",
            error
        );

        this.showError(
            "Failed to initialize Account Payable."
        );

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


    this.statusFilter =
        document.getElementById(
            "ap-status"
        );


    this.findBy =
        document.getElementById(
            "ap-find-by"
        );


    this.keyword =
        document.getElementById(
            "ap-keyword"
        );


    /*
    ==================================================
    TOOLBAR
    ==================================================
    */

    this.btnFind =
        document.getElementById(
            "btn-ap-find"
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

            <option value="">
                Select Chart of Account
            </option>

        `;


        /*
        ==================================================
        EMPTY COA
        ==================================================
        */

        if (
            !this.currentCOA.length
        ) {

            return;

        }


        /*
        ==================================================
        RENDER COA
        ==================================================
        */

        this.currentCOA.forEach(
            account => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    account.id;


                option.textContent =
                    `${account.account_code} :: ${account.account_name}`;


                this.apDetailCOA.appendChild(
                    option
                );

            }
        );


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

        this.currentCOA = [];

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
EDIT INVOICE DETAIL
======================================================
*/

async editInvoiceDetail(id) {

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
        SET EDIT DETAIL
        ==================================================
        */

        this.currentDetailId =
            id;


        /*
        ==================================================
        LOAD COA
        ==================================================
        */

        await this.loadDetailCOA();


        /*
        ==================================================
        SET FORM VALUES
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


        if (detailId) {

            detailId.value =
                detail.id || "";

        }


        if (this.apDetailCOA) {

            this.apDetailCOA.value =
                String(
                    detail.charge_account_id
                    || ""
                );

        }


        if (description) {

            description.value =
                detail.description
                || "";

        }


        if (this.apDetailQuantity) {

            this.apDetailQuantity.value =
                detail.quantity
                ?? 1;

        }


        if (this.apDetailUnitPrice) {

            this.apDetailUnitPrice.value =
                Number(
                    detail.unit_price
                    || 0
                ).toLocaleString(
                    "id-ID"
                );

        }


        if (this.apDetailTaxInputRate) {

            this.apDetailTaxInputRate.value =
                Number(
                    detail.tax_input_rate
                    || 0
                );

        }


        if (
            this.apDetailWithholdingTaxRate
        ) {

            this.apDetailWithholdingTaxRate.value =
                Number(
                    detail.withholding_tax_rate
                    || 0
                );

        }


        /*
        ==================================================
        CALCULATE
        ==================================================
        */

        this.calculateDetail();


        /*
        ==================================================
        CHANGE BUTTON TEXT
        ==================================================
        */

        if (this.btnSaveAPDetail) {

            this.btnSaveAPDetail.innerHTML = `
                <i class="fa-solid fa-floppy-disk me-1"></i>
                Update Detail
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
            "AP Edit Detail:",
            detail
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.editInvoiceDetail:",
            error
        );

        this.showError(
            error.message
            || "Failed to edit invoice detail."
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


        const taxInputRate =
            Number(
                this.apDetailTaxInputRate?.value
                || 0
            );


        const withholdingTaxRate =
            Number(
                this.apDetailWithholdingTaxRate?.value
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
        CREATE DETAIL OBJECT
        ==================================================
        */

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
        Number(coaId),

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

    tax_input_rate:
        taxInputRate,

    tax_input_amount:
        calculated.tax_input_amount,

    withholding_tax_rate:
        withholdingTaxRate,

    withholding_tax_amount:
        calculated.withholding_tax_amount,

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

                                        <i
                                            class="fa-solid fa-pen">
                                        </i>

                                    </button>


                                    <!-- DELETE -->

                                    <button
                                        type="button"
                                        class="btn btn-outline-danger"
                                        title="Remove Detail"
                                        data-detail-action="delete"
                                        data-detail-id="${detail.id}">

                                        <i
                                            class="fa-solid fa-trash">
                                        </i>

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
        RESET FORM
        ==================================================
        */

        this.resetInvoiceDetailForm();
        this.currentDetailId = null;
        if (this.btnSaveAPDetail) {

    this.btnSaveAPDetail.innerHTML = `
        <i class="fa-solid fa-floppy-disk me-1"></i>
        Save Detail
    `;

}


        /*
        ==================================================
        LOAD COA
        ==================================================
        */

        await this.loadDetailCOA();


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
            document.getElementById(id);


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

            element.value = "1";

            return;

        }


        /*
        ==========================================
        TAX (+)
        ==========================================
        */

        if (
            id ===
            "ap-detail-tax-input-rate"
        ) {

            element.value = "0";

            return;

        }


        /*
        ==========================================
        TAX (-)
        ==========================================
        */

        if (
            id ===
            "ap-detail-withholding-tax-rate"
        ) {

            element.value = "0";

            return;

        }


        /*
        ==========================================
        OTHER FIELD
        ==========================================
        */

        element.value = "";

    }
);


    /*
    ==================================================
    RESET COA
    ==================================================
    */

    const coa =
        document.getElementById(
            "ap-detail-coa"
        );


    if (coa) {

        coa.value = "";

    }


    /*
    ==================================================
    RESET CALCULATION
    ==================================================
    */

    const amounts = [

        "ap-detail-line-amount",

        "ap-detail-tax-input-amount",

        "ap-detail-withholding-tax-amount",

        "ap-detail-total-amount"

    ];


    amounts.forEach(
        id => {

            const element =
                document.getElementById(id);


            if (element) {

                element.textContent = "0";

            }

        }
    );

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
    SELECTED VENDOR
    ==================================================
    */

    this.selectedVendor = null;


    /*
    ==================================================
    VENDOR
    ==================================================
    */

    if (this.apFormVendor) {

        this.apFormVendor.value = "";

    }


    /*
    ==================================================
    TERM OF PAYMENT
    ==================================================
    */

    this.selectedTopId = null;

    if (this.apFormTop) {

        this.apFormTop.value = "";

    }


    /*
    ==================================================
    DATE RECEIVED
    ==================================================
    */

    if (this.apFormDateReceived) {

        this.apFormDateReceived.value = "";

    }


    /*
    ==================================================
    DUE DATE
    ==================================================
    */

    if (this.apFormDueDate) {

        this.apFormDueDate.value = "";

    }


    /*
    ==================================================
    PO NUMBER
    ==================================================
    */

    if (this.apFormPoNo) {

        this.apFormPoNo.value = "";

    }


    /*
    ==================================================
    INVOICE NUMBER
    ==================================================
    */

    if (this.apFormInvoiceNo) {

        this.apFormInvoiceNo.value = "";

    }


    /*
    ==================================================
    INVOICE DATE
    ==================================================
    */

    if (this.apFormInvoiceDate) {

        this.apFormInvoiceDate.value = "";

    }


    /*
    ==================================================
    DESCRIPTION
    ==================================================
    */

    if (this.apFormDescription) {

        this.apFormDescription.value = "";

    }


        /*
    ==================================================
    DETAIL
    ==================================================
    */

    this.invoiceDetails = [];

    if (this.apDetailBody) {

        this.apDetailBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center
                        text-muted
                        py-4">

                    No detail added.

                </td>

            </tr>

        `;

    }

    /*
    ==================================================
    TOTAL
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

        console.log(
            "AP VENDOR ELEMENT:",
            this.apFormVendor
        );

        console.log(
            "AP VENDOR VALUE:",
            this.apFormVendor?.value
        );

        console.log(
            "AP VENDOR SELECTED:",
            this.apFormVendor?.selectedOptions?.[0]
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
            !this.invoiceDetails ||
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
                ?.trim() || null,

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
                this.apFormDescription
                    ?.value
                    ?.trim() || null,

            status:
                "Draft"

        };


        console.log(
            "AP HEADER:",
            header
        );


        /*
==================================================
DETAILS
==================================================
*/

const details =
    this.invoiceDetails.map(
        item => {

            const chargeAccountId =
                Number(
                    item.account_id
                    || item.charge_account_id
                    || 0
                );


            return {

                charge_account_id:
                    chargeAccountId,

                description:
                    item.description
                    || null,

                quantity:
                    Number(
                        item.quantity || 1
                    ),

                unit_price:
                    Number(
                        item.unit_price || 0
                    ),

                tax_input_rate:
                    Number(
                        item.tax_input_rate || 0
                    ),

                withholding_tax_rate:
                    Number(
                        item.withholding_tax_rate || 0
                    )

            };

        }
    );


/*
==================================================
DEBUG DETAILS
==================================================
*/

console.log(
    "AP DETAILS BEFORE SAVE:",
    JSON.stringify(
        details,
        null,
        2
    )
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


if (invalidDetail) {

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
CHECK SUPABASE SESSION
==================================================
*/

const {
    data: {
        session
    }
} = await supabase.auth.getSession();
const {
    data: {
        user
    }
} = await supabase.auth.getUser();

console.log(
    "SUPABASE SESSION:",
    session
);

console.log(
    "SUPABASE USER:",
    user
);

console.log(
    "AP SAVE SESSION:",
    session
);

console.log(
    "AP SAVE USER:",
    session?.user
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


        if (modalElement) {

            const modal =
                bootstrap.Modal
                    .getInstance(
                        modalElement
                    );

            modal?.hide();

        }


        /*
==================================================
RELOAD DATA
==================================================
*/

await this.loadData();


/*
==================================================
RESET FORM AFTER SUCCESS
==================================================
*/

this.resetAddForm();


/*
==================================================
SUCCESS
==================================================
*/

if (
    typeof this.showSuccess ===
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
            typeof this.showError ===
            "function"
        ) {

            this.showError(
                error.message ||
                "Failed to save Account Payable."
            );

        }

        else {

            alert(
                error.message ||
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
            !Array.isArray(this.invoiceDetails)
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
        ==================================================
        */

        const details =
            this.invoiceDetails.map(
                item => ({

                    charge_account_id:
                        Number(
                            item.account_id
                            ||
                            item.charge_account_id
                            ||
                            0
                        ),

                    description:
                        item.description
                        || null,

                    quantity:
                        Number(
                            item.quantity
                            || 1
                        ),

                    unit_price:
                        Number(
                            item.unit_price
                            || 0
                        ),

                    tax_input_rate:
                        Number(
                            item.tax_input_rate
                            || 0
                        ),

                    withholding_tax_rate:
                        Number(
                            item.withholding_tax_rate
                            || 0
                        )

                })
            );


        console.log(
            "AP UPDATE HEADER:",
            header
        );

        console.log(
            "AP UPDATE DETAILS:",
            details
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


        console.log(
            "AP UPDATED:",
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


        /*
        ==================================================
        RESET BUTTON
        ==================================================
        */

        if (this.btnSaveDraft) {

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

        await this.loadData();


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        console.log(
            "Account Payable draft updated successfully."
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.saveEdit:",
            error
        );

        this.showError(
            error.message
            || "Failed to update Account Payable."
        );

    }

}
    /*
    ======================================================
    HANDLE TABLE ACTION
    ======================================================
    */

    async handleTableAction(
        action,
        id
    ) {

        try {

            switch (action) {

                case "view":

                    await this.viewInvoice(id);

                    break;


                case "edit":

                    await this.editInvoice(id);

                    break;


                case "delete":

                    await this.deleteInvoice(id);

                    break;


                case "post":

                    await this.postInvoice(id);

                    break;


                case "payment":

                    await this.createPayment(id);

                    break;


                case "payment-history":

                    await this.paymentHistory(id);

                    break;


                case "void":

                    await this.voidInvoice(id);

                    break;


                case "duplicate":

                    await this.duplicateInvoice(id);

                    break;


                default:

                    console.warn(
                        "Unknown AP action:",
                        action
                    );

            }

        }

        catch (error) {

            console.error(
                "AccountPayable.handleTableAction:",
                error
            );

            this.showError(
                error.message
                || "Action failed."
            );

        }

    }
        /*
    ======================================================
    VIEW
    ======================================================
    */

    async viewInvoice(id) {

        console.log(
            "View Account Payable:",
            id
        );

    }


    /*
======================================================
EDIT
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
        LOAD MODAL
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
            !Array.isArray(this.vendorData)
            ||
            !this.vendorData.length
        ) {

            await this.loadVendors();

        }


        /*
        ==================================================
        LOAD INVOICE
        ==================================================
        */

        const result =
            await this.service.getById(id);


        if (!result) {

            throw new Error(
                "Account Payable not found."
            );

        }


        const header =
            result.header;

        const details =
            Array.isArray(result.details)
                ? result.details
                : [];


        /*
        ==================================================
        CHECK STATUS
        ==================================================
        */

        if (
            header.status !==
            this.service.STATUS.DRAFT
        ) {

            throw new Error(
                "Only Draft Account Payable can be edited."
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


        /*
        ==================================================
        HEADER FORM
        ==================================================
        */

        if (this.apFormVendor) {

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

        if (this.apFormTop) {

            this.apFormTop.value =
                String(
                    header.top_id
                    || ""
                );

        }


        /*
        ==================================================
        PO NO
        ==================================================
        */

        if (this.apFormPoNo) {

            this.apFormPoNo.value =
                header.po_no
                || "";

        }


        /*
        ==================================================
        INVOICE NO
        ==================================================
        */

        if (this.apFormInvoiceNo) {

            this.apFormInvoiceNo.value =
                header.invoice_no
                || "";

        }


        /*
        ==================================================
        INVOICE DATE
        ==================================================
        */

        if (this.apFormInvoiceDate) {

            this.apFormInvoiceDate.value =
                header.invoice_date
                || "";

        }


        /*
        ==================================================
        DATE RECEIVED
        ==================================================
        */

        if (this.apFormDateReceived) {

            this.apFormDateReceived.value =
                header.date_received
                || "";

        }


        /*
        ==================================================
        DUE DATE
        ==================================================
        */

        if (this.apFormDueDate) {

            this.apFormDueDate.value =
                header.due_date
                || "";

        }


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        if (this.apFormDescription) {

            this.apFormDescription.value =
                header.description
                || "";

        }


        /*
        ==================================================
        DETAILS
        ==================================================
        */

        this.invoiceDetails =
            details.map(
                detail => {

                    const coa =
                        detail.mst_chart_of_accounts
                        || {};

                    return {

                        id:
                            detail.id
                            || crypto.randomUUID(),

                        charge_account_id:
                            Number(
                                detail.charge_account_id
                                || 0
                            ),

                        account_code:
                            detail.account_code
                            || coa.account_code
                            || "",

                        account_name:
                            detail.account_name
                            || coa.account_name
                            || "",

                        description:
                            detail.description
                            || "",

                        quantity:
                            Number(
                                detail.quantity
                                || 1
                            ),

                        unit_price:
                            Number(
                                detail.unit_price
                                || 0
                            ),

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
        RENDER DETAILS
        ==================================================
        */

        this.renderInvoiceDetails();


        /*
        ==================================================
        BUTTON MODE
        ==================================================
        */

        if (this.btnSaveDraft) {

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


        console.log(
            "AP EDIT LOADED:",
            result
        );

    }

    catch (error) {

        console.error(
            "AccountPayable.editInvoice:",
            error
        );

        this.showError(
            error.message
            || "Failed to load Account Payable."
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
    PAYMENT
    ======================================================
    */

    async createPayment(id) {

        console.log(
            "Create AP Payment:",
            id
        );

    }


    /*
    ======================================================
    PAYMENT HISTORY
    ======================================================
    */

    async paymentHistory(id) {

        console.log(
            "AP Payment History:",
            id
        );

    }


    /*
    ======================================================
    VOID
    ======================================================
    */

    async voidInvoice(id) {

        console.log(
            "Void Account Payable:",
            id
        );

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
    ======================================================
    */

    async loadData() {

        try {

            const data =
                await this.service.getAll();


            this.data =
                Array.isArray(data)
                    ? data
                    : [];


            this.filteredData =
                [...this.data];


            this.currentPage = 1;


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
    SEARCH
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

                keyword:
                    this.keyword?.value
                    || ""

            };


            this.filteredData =
                await this.service.search(
                    filters
                );


            this.currentPage = 1;


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
    ======================================================
    */

    async refresh() {

        try {

            await this.loadData();

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

        return Math.max(
            1,
            Math.ceil(
                this.filteredData.length /
                this.pageSize
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
    ======================================================
    */

    renderTable() {

        if (!this.tableBody) {

            return;

        }


        const startIndex =
            (
                this.currentPage - 1
            ) *
            this.pageSize;


        const endIndex =
            startIndex +
            this.pageSize;


        const pageData =
            this.filteredData.slice(
                startIndex,
                endIndex
            );


        if (!pageData.length) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="text-center py-5 text-muted">

                        No Account Payable found.

                    </td>

                </tr>

            `;

            return;

        }


        this.tableBody.innerHTML =
            pageData.map(
                (invoice, index) => {

                    return this.createTableRow(
                        invoice,
                        startIndex + index + 1
                    );

                }
            ).join("");

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
======================================================
*/

createTableRow(invoice, number) {

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
    HEADER DATA
    ==================================================
    */

    const invoiceNo =
        invoice?.invoice_no
        || "-";


    const poNo =
        invoice?.po_no
        || "-";


    const invoiceDate =
        invoice?.invoice_date
        || "-";


    const dueDate =
        invoice?.due_date
        || "-";


    /*
    ==================================================
    AMOUNT
    ==================================================
    */

    const totalAmount =
        this.formatCurrency(
            invoice?.total_amount || 0
        );


    const outstandingAmount =
        this.formatCurrency(
            invoice?.outstanding_amount || 0
        );


    /*
    ==================================================
    STATUS
    ==================================================
    */

    const status =
        invoice?.status
        || "Draft";


    /*
    ==================================================
    RETURN ROW
    ==================================================
    */

    return `

        <tr>

            <!-- ======================================
                 NO
            ======================================= -->

            <td>
                ${number}
            </td>


            <!-- ======================================
                 INVOICE NO
            ======================================= -->

            <td>

                <div class="fw-semibold">

                    ${invoiceNo}

                </div>

            </td>


            <!-- ======================================
                 VENDOR
            ======================================= -->

            <td>

                <div class="fw-semibold">

                    ${vendorName}

                </div>

            </td>


            <!-- ======================================
                 PO NO
            ======================================= -->

            <td>

                ${poNo}

            </td>


            <!-- ======================================
                 INVOICE DATE
            ======================================= -->

            <td>

                ${invoiceDate}

            </td>


            <!-- ======================================
                 DUE DATE
            ======================================= -->

            <td>

                ${dueDate}

            </td>


            <!-- ======================================
                 TOTAL AMOUNT
            ======================================= -->

            <td class="text-end">

                ${totalAmount}

            </td>


            <!-- ======================================
                 OUTSTANDING
            ======================================= -->

            <td class="text-end">

                ${outstandingAmount}

            </td>


            <!-- ======================================
                 STATUS
            ======================================= -->

            <td class="text-center">

                ${this.renderStatus(status)}

            </td>


            <!-- ======================================
                 ACTION
            ======================================= -->

            <td class="text-center">

                ${this.renderActionButtons(invoice)}

            </td>

        </tr>

    `;

}
/*
======================================================
RENDER STATUS
======================================================
*/

renderStatus(status) {

    const normalizedStatus =
        String(
            status || "Draft"
        )
        .trim()
        .toLowerCase();


    switch (normalizedStatus) {

        case "posted":

            return `
                <span class="badge bg-success">
                    Posted
                </span>
            `;


        case "partial paid":

            return `
                <span class="badge bg-warning text-dark">
                    Partial Paid
                </span>
            `;


        case "paid":

            return `
                <span class="badge bg-primary">
                    Paid
                </span>
            `;


        case "void":

            return `
                <span class="badge bg-danger">
                    Void
                </span>
            `;


        case "draft":

        default:

            return `
                <span class="badge bg-secondary">
                    Draft
                </span>
            `;

    }

}

        /*
    ======================================================
    RENDER ACTION BUTTONS
    ======================================================
    */

    renderActionButtons(invoice) {

        const id =
            invoice?.id;


        const status =
            invoice?.status
            || "Draft";


        if (!id) {

            return "";

        }


        /*
        ==================================================
        DRAFT
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


                    <!-- POST -->

                    <button
                        type="button"
                        class="btn btn-outline-success"
                        title="Post"
                        data-action="post"
                        data-id="${id}">

                        <i class="fa-solid fa-upload"></i>

                    </button>


                    <!-- DUPLICATE -->

                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        title="Duplicate"
                        data-action="duplicate"
                        data-id="${id}">

                        <i class="fa-regular fa-copy"></i>

                    </button>


                    <!-- VIEW -->

                    <button
                        type="button"
                        class="btn btn-outline-info"
                        title="View"
                        data-action="view"
                        data-id="${id}">

                        <i class="fa-regular fa-file-lines"></i>

                    </button>

                </div>

            `;

        }


        /*
        ==================================================
        POSTED
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


                    <!-- PAYMENT -->

                    <button
                        type="button"
                        class="btn btn-outline-info"
                        title="Create Payment"
                        data-action="payment"
                        data-id="${id}">

                        <i class="fa-solid fa-money-bill-wave"></i>

                    </button>


                    <!-- VOID -->

                    <button
                        type="button"
                        class="btn btn-outline-danger"
                        title="Void"
                        data-action="void"
                        data-id="${id}">

                        <i class="fa-solid fa-ban"></i>

                    </button>


                    <!-- DUPLICATE -->

                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        title="Duplicate"
                        data-action="duplicate"
                        data-id="${id}">

                        <i class="fa-regular fa-copy"></i>

                    </button>

                </div>

            `;

        }


        /*
        ==================================================
        PARTIAL PAID
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


                    <!-- PAYMENT -->

                    <button
                        type="button"
                        class="btn btn-outline-info"
                        title="Create Payment"
                        data-action="payment"
                        data-id="${id}">

                        <i class="fa-solid fa-money-bill-wave"></i>

                    </button>


                    <!-- VOID -->

                    <button
                        type="button"
                        class="btn btn-outline-danger"
                        title="Void"
                        data-action="void"
                        data-id="${id}">

                        <i class="fa-solid fa-ban"></i>

                    </button>


                    <!-- DUPLICATE -->

                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        title="Duplicate"
                        data-action="duplicate"
                        data-id="${id}">

                        <i class="fa-regular fa-copy"></i>

                    </button>

                </div>

            `;

        }


        /*
        ==================================================
        PAID
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


                    <!-- PAYMENT HISTORY -->

                    <button
                        type="button"
                        class="btn btn-outline-info"
                        title="Payment History"
                        data-action="payment-history"
                        data-id="${id}">

                        <i class="fa-solid fa-file-invoice-dollar"></i>

                    </button>


                    <!-- DUPLICATE -->

                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        title="Duplicate"
                        data-action="duplicate"
                        data-id="${id}">

                        <i class="fa-regular fa-copy"></i>

                    </button>

                </div>

            `;

        }


        /*
        ==================================================
        VOID
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


                    <!-- DUPLICATE -->

                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        title="Duplicate"
                        data-action="duplicate"
                        data-id="${id}">

                        <i class="fa-regular fa-copy"></i>

                    </button>

                </div>

            `;

        }


        return "";

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
    
}