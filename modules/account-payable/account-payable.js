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
    CONFIG
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
    INIT
    ======================================================
    */

    async init() {

        try {

            /*
            ==============================================
            CACHE DOM
            ==============================================
            */

            this.cacheDOM();


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
    CACHE DOM
    ======================================================
    */

    cacheDOM() {

        /*
        ==============================================
        TABLE
        ==============================================
        */

        this.tableBody =
            document.getElementById(
                "ap-table-body"
            );


        /*
        ==============================================
        FILTER
        ==============================================
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
        ==============================================
        BUTTON
        ==============================================
        */

        this.btnFind =
            document.getElementById(
                "btn-ap-find"
            );

        this.btnAdd =
            document.getElementById(
                "btn-ap-add"
            );

        this.btnRefresh =
            document.getElementById(
                "btn-ap-refresh"
            );

        this.btnDownloadExcel =
            document.getElementById(
                "btn-ap-download-excel"
            );

        this.btnPreviewHTML =
            document.getElementById(
                "btn-ap-preview-html"
            );


        /*
        ==============================================
        PAGINATION
        ==============================================
        */

        this.btnFirstPage =
            document.getElementById(
                "ap-first-page"
            );

        this.btnPrevPage =
            document.getElementById(
                "ap-prev-page"
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
                "ap-next-page"
            );

        this.btnLastPage =
            document.getElementById(
                "ap-last-page"
            );


        /*
        ==============================================
        RECORD INFO
        ==============================================
        */

        this.recordInfo =
            document.getElementById(
                "ap-record-info"
            );

    }


    /*
    ======================================================
    BIND EVENTS
    ======================================================
    */

    bindEvents() {

        /*
        ==============================================
        FIND
        ==============================================
        */

        if (this.btnFind) {

            this.btnFind.addEventListener(
                "click",
                () => {

                    this.search();

                }
            );

        }


        /*
        ==============================================
        ENTER KEYWORD
        ==============================================
        */

        if (this.keyword) {

            this.keyword.addEventListener(
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

        }


        /*
        ==============================================
        REFRESH
        ==============================================
        */

        if (this.btnRefresh) {

            this.btnRefresh.addEventListener(
                "click",
                () => {

                    this.refresh();

                }
            );

        }


        /*
        ==============================================
        F5
        ==============================================
        */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "F5"
                ) {

                    event.preventDefault();

                    this.refresh();

                }

            }
        );


        /*
        ==============================================
        STATUS FILTER
        ==============================================
        */

        if (this.statusFilter) {

            this.statusFilter.addEventListener(
                "change",
                () => {

                    this.search();

                }
            );

        }


        /*
        ==============================================
        PAGINATION
        ==============================================
        */

        if (this.btnFirstPage) {

            this.btnFirstPage.addEventListener(
                "click",
                () => {

                    this.goToPage(1);

                }
            );

        }


        if (this.btnPrevPage) {

            this.btnPrevPage.addEventListener(
                "click",
                () => {

                    this.goToPage(
                        this.currentPage - 1
                    );

                }
            );

        }


        if (this.btnNextPage) {

            this.btnNextPage.addEventListener(
                "click",
                () => {

                    this.goToPage(
                        this.currentPage + 1
                    );

                }
            );

        }


        if (this.btnLastPage) {

            this.btnLastPage.addEventListener(
                "click",
                () => {

                    const totalPages =
                        this.getTotalPages();

                    this.goToPage(
                        totalPages
                    );

                }
            );

        }


        /*
        ==============================================
        CUSTOM PAGE INPUT
        ==============================================
        */

        if (this.currentPageInput) {

            this.currentPageInput.addEventListener(
                "change",
                () => {

                    const page =
                        Number(
                            this.currentPageInput.value
                        );

                    this.goToPage(page);

                }
            );


            this.currentPageInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        const page =
                            Number(
                                this.currentPageInput.value
                            );

                        this.goToPage(page);

                    }

                }
            );

        }


        /*
        ==============================================
        ADD
        ==============================================
        */

        if (this.btnAdd) {

            this.btnAdd.addEventListener(
                "click",
                () => {

                    this.openAdd();

                }
            );

        }


        /*
        ==============================================
        DOWNLOAD EXCEL
        ==============================================
        */

        if (this.btnDownloadExcel) {

            this.btnDownloadExcel.addEventListener(
                "click",
                () => {

                    this.downloadExcel();

                }
            );

        }


        /*
        ==============================================
        PREVIEW HTML
        ==============================================
        */

        if (this.btnPreviewHTML) {

            this.btnPreviewHTML.addEventListener(
                "click",
                () => {

                    this.previewHTML();

                }
            );

        }

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

        console.log(
            "Edit Account Payable:",
            id
        );

    }


    /*
    ======================================================
    DELETE
    ======================================================
    */

    async deleteInvoice(id) {

        console.log(
            "Delete Account Payable:",
            id
        );

    }
    


    /*
    ======================================================
    POST
    ======================================================
    */

    async postInvoice(id) {

        console.log(
            "Post Account Payable:",
            id
        );

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

        const vendor =
            invoice?.mst_business_partner;


        const vendorName =
            vendor?.bp_name
            || "-";


        const invoiceNo =
            invoice?.invoice_no
            || "-";


        const invoiceDate =
            invoice?.invoice_date
            || "-";


        const poNo =
            invoice?.po_no
            || "-";


        const description =
            invoice?.description
            || "-";


        const totalAmount =
            this.formatCurrency(
                invoice?.total_amount || 0
            );


        const paidAmount =
            this.formatCurrency(
                invoice?.paid_amount || 0
            );


        const outstandingAmount =
            this.formatCurrency(
                invoice?.outstanding_amount || 0
            );


        const status =
            invoice?.status
            || "Draft";


        return `

            <tr>

                <!-- ======================================
                     NO
                ======================================= -->

                <td>

                    ${number}

                </td>


                <!-- ======================================
                     INVOICE DATE
                ======================================= -->

                <td>

                    ${invoiceDate}

                </td>


                <!-- ======================================
                     DOCUMENT NO
                ======================================= -->

                <td>

                    ${invoiceNo}

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
                     DESCRIPTION
                ======================================= -->

                <td>

                    ${description}

                </td>


                <!-- ======================================
                     TOTAL
                ======================================= -->

                <td class="text-end">

                    ${totalAmount}

                </td>


                <!-- ======================================
                     PAID
                ======================================= -->

                <td class="text-end">

                    ${paidAmount}

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

                    ${this.renderActionButtons(
                        invoice
                    )}

                </td>

            </tr>

        `;

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
                maximumFractionDigits: 2
            }
        ).format(amount);

    }
    
}