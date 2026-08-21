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

               <td class="finova-table-code">
    ${item.account_code}
</td>

<td class="finova-table-name">
    ${item.account_name}
</td>

<td class="finova-table-name">
    ${item.parent_name ?? "-"}
</td>

<td>
    ${item.currency ?? "-"}
</td>

<td>
    ${item.normal_balance ?? "-"}
</td>

<td>
    ${item.posting_type ?? "-"}
</td>

<td class="finova-table-status">
    ${item.is_header ? "Yes" : "No"}
</td>

<td class="finova-table-status">
    ${item.status ? "Active" : "Inactive"}
</td>

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
