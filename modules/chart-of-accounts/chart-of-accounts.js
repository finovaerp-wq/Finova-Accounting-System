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

        const response = await fetch(

            "modules/chart-of-accounts/chart-of-accounts-modal.html"

        );

        if (!response.ok) {

            throw new Error(

                "Failed to load Chart Of Accounts modal."

            );

        }

        const html = await response.text();

        /*
        ======================================================
        MODAL CONTAINER
        ======================================================
        */

        const container = document.getElementById(

            "modal-container"

        );

        if (!container) {

            throw new Error(

                "Modal container not found."

            );

        }

        container.innerHTML = html;

        /*
        ======================================================
        INITIALIZE MODAL
        ======================================================
        */

        const modalElement = document.getElementById(

            "coa-modal"

        );

        if (!modalElement) {

            throw new Error(

                "Chart Of Accounts modal not found."

            );

        }

        this.modal = bootstrap.Modal.getOrCreateInstance(

            modalElement

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
    ======================================================
    ACCOUNT
    ======================================================
    */

    this.parentId =
        document.getElementById("parent-id");

    this.accountCode =
        document.getElementById("account-code");

    this.accountName =
        document.getElementById("account-name");

    this.currency =
        document.getElementById("currency");

    this.postingType =
        document.getElementById("posting-type");

    this.isHeader =
        document.getElementById("is-header");

    this.allowTransaction =
        document.getElementById("allow-transaction");

    this.status =
        document.getElementById("status");

    this.description =
        document.getElementById("description");

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

    this.btnSearch?.addEventListener(

        "click",

        () => this.search()

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
    BUTTON SAVE
    ======================================================
    */

    this.btnSave =

        document.getElementById(

            "btn-save-chart-of-accounts"

        );

    this.btnSave?.addEventListener(

        "click",

        () => this.save()

    );

    /*
    ======================================================
    RESET FORM
    ======================================================
    */

    this.modalElement?.addEventListener(

        "hidden.bs.modal",

        () => {

            this.coaForm?.reset();

            this.selectedId = null;

            if (this.coaId) {

                this.coaId.value = "";

            }

            this.closeModal();

        }

    );

}
/*
==========================================================
PREVIEW
==========================================================
*/

preview() {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!this.filteredData.length) {

            this.showError(

                "No data available."

            );

            return;

        }

        /*
        ======================================================
        COLUMNS
        ======================================================
        */

        const columns = [

            "Account Code",

            "Account Name",

            "Parent",

            "Currency",

            "Normal Balance",

            "Posting Type",

            "Header",

            "Status"

        ];

        /*
        ======================================================
        ROWS
        ======================================================
        */

        const rows = this.filteredData.map(item => `

            <tr>

                <td>${item.account_code ?? "-"}</td>

                <td>${item.account_name ?? "-"}</td>

                <td>${item.parent_name ?? "-"}</td>

                <td>${item.currency ?? "-"}</td>

                <td>${item.normal_balance ?? "-"}</td>

                <td>${item.posting_type ?? "-"}</td>

                <td>${item.is_header ? "Yes" : "No"}</td>

                <td>${item.status ? "Active" : "Inactive"}</td>

            </tr>

        `);

        /*
        ======================================================
        OPEN PREVIEW
        ======================================================
        */

        PreviewService.open({

            title: "Chart Of Accounts",

            subtitle: "Master Data",

            columns,

            rows

        });

    }

    catch (error) {

        console.error(error);

        this.showError(

            "Preview failed."

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

                    ${account.account_code} - ${account.account_name}

                </option>

                `

            );

        });

    }

    catch (error) {

        console.error(error);

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

    <td>${item.account_code ?? "-"}</td>

    <td>${item.account_name ?? "-"}</td>

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

        /*
        ======================================================
        RESET FORM
        ======================================================
        */

        this.coaForm?.reset();

        this.selectedId = null;

        this.coaId.value = "";

        /*
        ======================================================
        LOAD PARENT ACCOUNT
        ======================================================
        */

        await this.loadParentAccounts();

        /*
        ======================================================
        DEFAULT VALUE
        ======================================================
        */

        this.parentId.value = "";

        this.accountCode.value = "";

        this.accountName.value = "";

        this.currency.value = "IDR";

        this.postingType.value = "Manual & Auto";

        document.getElementById(

            "normal-debit"

        ).checked = true;

        this.isHeader.checked = false;

        this.allowTransaction.checked = true;

        this.status.checked = true;

        this.description.value = "";

        /*
        ======================================================
        RESET PARENT INFO
        ======================================================
        */

        this.parentName.textContent = "-";

        this.parentLevel.textContent = "-";

        this.parentChildCount.textContent = "-";

        /*
        ======================================================
        TITLE
        ======================================================
        */

        this.modalTitle.textContent =

            "Add Chart Of Account";

        /*
        ======================================================
        SHOW MODAL
        ======================================================
        */

        this.modal.show();

    }

    catch (error) {

        console.error(error);

        this.showError(

            "Failed to open Chart Of Account."

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
        LOAD PARENT
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

        this.coaId.value =

            item.id ?? "";

        /*
        ======================================================
        ACCOUNT
        ======================================================
        */

        this.parentId.value =

            item.parent_id ?? "";

        this.accountCode.value =

            item.account_code ?? "";

        this.accountName.value =

            item.account_name ?? "";

        this.currency.value =

            item.currency ?? "IDR";

        this.postingType.value =

            item.posting_type ?? "Manual & Auto";

        /*
        ======================================================
        NORMAL BALANCE
        ======================================================
        */

        document.getElementById(

            item.normal_balance === "Credit"

            ? "normal-credit"

            : "normal-debit"

        ).checked = true;

        /*
        ======================================================
        OPTION
        ======================================================
        */

        this.isHeader.checked =

            item.is_header ?? false;

        this.allowTransaction.checked =

            item.allow_transaction ?? true;

        this.status.checked =

            item.status ?? true;

        this.description.value =

            item.description ?? "";

        /*
        ======================================================
        PARENT INFORMATION
        ======================================================
        */

        this.parentName.textContent =

            item.parent_name ?? "-";

        this.parentLevel.textContent =

            this.parentLevel.textContent =
            item.level ?? "-";

        this.parentChildCount.textContent =

            item.child_count


        /*
        ======================================================
        TITLE
        ======================================================
        */

        this.modalTitle.textContent =

            "Edit Chart Of Account";

        /*
        ======================================================
        SHOW
        ======================================================
        */

        this.modal.show();

    }

    catch (error) {

        console.error(error);

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

        currency:

            this.currency.value,

        posting_type:

            this.postingType.value,

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
DELETE
==========================================================
*/

async delete(id) {

    const confirmDelete = confirm(

        "Delete this Chart Of Account?"

    );

    if (!confirmDelete) {

        return;

    }

    try {

        const used =

            await ChartOfAccountsService.isUsed(id);

        if (used) {

            this.showError(

                "This account is already used in transactions."

            );

            return;

        }

        await ChartOfAccountsService.delete(id);

        this.currentPage = 1;

        await this.loadData();

        await this.loadParentAccounts();

        this.showSuccess(

            "Chart Of Account successfully deleted."

        );

    }

    catch (error) {

        console.error(error);

        this.showError(

            error.message ??

            "Failed to delete Chart Of Account."

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
==========================================================
*/

showSuccess(message) {

    if (window.Toast) {

        Toast.fire({

            icon: "success",

            title: message

        });

        return;

    }

    alert(message);

}
/*
==========================================================
SHOW ERROR
==========================================================
*/

showError(message) {

    if (window.Toast) {

        Toast.fire({

            icon: "error",

            title: message

        });

        return;

    }

    alert(message);

}



}
