/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Module  : General Journal
Version : Enterprise 3.0
Author  : FINOVA Development Team
==========================================================
*/

import {
    supabase,
    TABLE
} from "../../assets/js/core/supabase.js";

import {
    GeneralJournalService
} from "../../service/journal.service.js";

export class GeneralJournal {

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
        new GeneralJournalService();

    /*
    ======================================================
    JOURNAL STATE
    ======================================================
    */

    this.journals = [];

    this.currentJournal = null;

    this.currentMode = "add";

    /*
    ======================================================
    PAGINATION
    ======================================================
    */

    this.currentPage = 1;

    this.pageSize = 20;

    this.totalRows = 0;

    this.totalPages = 1;

    /*
    ======================================================
    MODAL
    ======================================================
    */

    this.modal = null;

    this.modalElement = null;

    this.modalContainer = null;

    this.modalLoaded = false;

    /*
    ======================================================
    MASTER DATA
    ======================================================
    */

    this.coaList = [];

    this.businessPartnerList = [];

    /*
    ======================================================
    DETAIL
    ======================================================
    */

    this.detailLines = [];

}

    /*
==========================================================
CACHE DOM
==========================================================
*/

cacheDom() {

    /*
    ======================================================
    HEADER
    ======================================================
    */

    this.btnAddJournal =
        document.getElementById("btn-add-journal");

    this.btnRefreshJournal =
        document.getElementById("btn-refresh-journal");

    this.btnDownloadJournal =
        document.getElementById("btn-download-journal");
        

    /*
    ======================================================
    FILTER
    ======================================================
    */

    this.filterDateFrom =
        document.getElementById("filter-date-from");

    this.filterDateTo =
        document.getElementById("filter-date-to");

    this.filterStatus =
        document.getElementById("filter-status");

    this.filterFindBy =
        document.getElementById("filter-find-by");

    this.filterKeyword =
        document.getElementById("filter-keyword");

    this.btnFindJournal =
        document.getElementById("btn-find-journal");

    /*
    ======================================================
    TABLE
    ======================================================
    */

    this.tableWrapper =
        document.getElementById(
            "gl-journal-table-wrapper"
        );

    this.table =
        document.getElementById(
            "gl-journal-table"
        );

    this.tableBody =
        document.getElementById(
            "gl-journal-tbody"
        );

    /*
    ======================================================
    PAGINATION
    ======================================================
    */

    this.btnFirstPage =
        document.getElementById("btn-first-page");

    this.btnPreviousPage =
        document.getElementById("btn-prev-page");

    this.btnNextPage =
        document.getElementById("btn-next-page");

    this.btnLastPage =
        document.getElementById("btn-last-page");

    this.currentPageInput =
        document.getElementById("current-page");

    this.totalPageLabel =
        document.getElementById("total-pages");

    this.displayRecord =
        document.getElementById("display-record");

    /*
    ======================================================
    MODAL CONTAINER
    ======================================================
    */

    this.modalContainer =
        document.getElementById(
            "gl-journal-modal-container"
        );

}

    /*
    ==========================================================
    INITIALIZE
    ==========================================================
    */

    async init() {

        console.log(
            "FINOVA General Journal Enterprise v3 Loaded"
        );

        this.cacheDom();

        this.bindEvents();

        await this.loadData();

    }
        /*
    ==========================================================
    BIND ALL EVENTS
    ==========================================================
    */

    bindEvents() {

        /*
==========================================================
HEADER
==========================================================
*/

this.btnAddJournal?.addEventListener(
    "click",
    async () => {

        console.log("BTN ADD JOURNAL CLICKED");

        await this.openAddJournal();

    }
);

        /*
        ======================================================
        SUB EVENTS
        ======================================================
        */

        this.bindFilterEvents();

        this.bindPaginationEvents();

        this.bindTableEvents();

    }

    /*
    ==========================================================
    FILTER EVENTS
    ==========================================================
    */

    bindFilterEvents() {

        this.btnFindJournal?.addEventListener(
            "click",
            () => this.search()
        );

        this.filterKeyword?.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    this.search();

                }

            }
        );

        this.filterStatus?.addEventListener(
            "change",
            () => this.search()
        );

        this.filterFindBy?.addEventListener(
            "change",
            () => this.search()
        );

        this.filterDateFrom?.addEventListener(
            "change",
            () => this.search()
        );

        this.filterDateTo?.addEventListener(
            "change",
            () => this.search()
        );

    }

    /*
    ==========================================================
    PAGINATION EVENTS
    ==========================================================
    */

    bindPaginationEvents() {

        this.btnFirstPage?.addEventListener(
            "click",
            () => this.firstPage()
        );

        this.btnPreviousPage?.addEventListener(
            "click",
            () => this.previousPage()
        );

        this.btnNextPage?.addEventListener(
            "click",
            () => this.nextPage()
        );

        this.btnLastPage?.addEventListener(
            "click",
            () => this.lastPage()
        );

        this.currentPageInput?.addEventListener(
            "change",
            () => this.goToPage()
        );

    }

    /*
    ==========================================================
    TABLE EVENTS
    ==========================================================
    */

    bindTableEvents() {

        this.tableBody?.addEventListener(
            "click",
            (event) => this.handleTableAction(event)
        );

    }
    /*
==========================================================
LOAD GENERAL JOURNAL
==========================================================
*/

async loadData() {

    try {

        /*
        ======================================================
        SHOW LOADING
        ======================================================
        */

        window.App?.showLoading?.();

        /*
        ======================================================
        GET DATA
        ======================================================
        */

        this.journals =
            await this.service.getAll();

        if (!Array.isArray(this.journals)) {

            this.journals = [];

        }

        /*
        ======================================================
        PAGINATION
        ======================================================
        */

        this.totalRows =
            this.journals.length;

        this.totalPages =
            Math.max(
                1,
                Math.ceil(
                    this.totalRows /
                    this.pageSize
                )
            );

        this.currentPage = 1;

        /*
        ======================================================
        RENDER
        ======================================================
        */

        this.refreshView();

    }

    catch (error) {

        console.error(error);

        this.showError(error);

    }

    finally {

        window.App?.hideLoading?.();

    }

}

/*
==========================================================
REFRESH
==========================================================
*/

async refresh() {

    this.resetFilter();

    await this.loadData();

}

/*
==========================================================
SEARCH
==========================================================
*/

async search() {

    try {

        const filter = {

            dateFrom:
                this.filterDateFrom?.value ?? "",

            dateTo:
                this.filterDateTo?.value ?? "",

            status:
                this.filterStatus?.value ?? "all",

            findBy:
                this.filterFindBy?.value ?? "journal_no",

            keyword:
                this.filterKeyword?.value.trim() ?? ""

        };

        this.journals =
            await this.service.search(filter);

        if (!Array.isArray(this.journals)) {

            this.journals = [];

        }

        this.totalRows =
            this.journals.length;

        this.totalPages =
            Math.max(
                1,
                Math.ceil(
                    this.totalRows /
                    this.pageSize
                )
            );

        this.currentPage = 1;

        this.refreshView();

    }

    catch (error) {

        console.error(error);

        this.showError(error);

    }

}

/*
==========================================================
REFRESH VIEW
==========================================================
*/

refreshView() {

    this.renderTable();

    this.renderPagination();

    this.updateRecordInformation();

}

/*
==========================================================
RESET FILTER
==========================================================
*/

resetFilter() {

    if (this.filterDateFrom)
        this.filterDateFrom.value = "";

    if (this.filterDateTo)
        this.filterDateTo.value = "";

    if (this.filterStatus)
        this.filterStatus.value = "all";

    if (this.filterFindBy)
        this.filterFindBy.value = "journal_no";

    if (this.filterKeyword)
        this.filterKeyword.value = "";

}

/*
==========================================================
UPDATE RECORD INFORMATION
==========================================================
*/

updateRecordInformation() {

    if (!this.displayRecord) {

        return;

    }

    if (this.totalRows === 0) {

        this.displayRecord.textContent =
            "Records 0 - 0 of 0";

        return;

    }

    const start =
        ((this.currentPage - 1) * this.pageSize) + 1;

    const end =
        Math.min(
            this.currentPage * this.pageSize,
            this.totalRows
        );

    this.displayRecord.textContent =
        `Records ${start} - ${end} of ${this.totalRows}`;

}
/*
==========================================================
RENDER TABLE
==========================================================
*/

renderTable() {

    if (!this.tableBody) {

        return;

    }

    this.tableBody.innerHTML = "";

    /*
    ======================================================
    NO DATA
    ======================================================
    */

    if (this.journals.length === 0) {

        this.tableBody.innerHTML = `

            <tr>

                <td colspan="8"
                    class="text-center py-5 text-muted">

                    No General Journal Found

                </td>

            </tr>

        `;

        return;

    }

    /*
    ======================================================
    PAGINATION
    ======================================================
    */

    const startIndex =
        (this.currentPage - 1) *
        this.pageSize;

    const endIndex =
        startIndex +
        this.pageSize;

    const rows =
        this.journals.slice(
            startIndex,
            endIndex
        );

    /*
    ======================================================
    RENDER ROW
    ======================================================
    */

    rows.forEach((journal, index) => {

        this.tableBody.insertAdjacentHTML(

            "beforeend",

            this.createTableRow(

                journal,

                startIndex + index + 1

            )

        );

    });

}

/*
==========================================================
CREATE TABLE ROW
==========================================================
*/

createTableRow(journal, no) {

    const isDraft =
    journal.status === "Draft";

const isPosted =
    journal.status === "Posted";

const isVoid =
    journal.status === "Void";
console.log("Journal", journal.journal_no, "Status =", journal.status);

    return `

<tr>

    <td>${no}</td>

    <td>${journal.journal_date ?? "-"}</td>

    <td>${journal.journal_no ?? "-"}</td>

    <td>${journal.description ?? "-"}</td>

    <td class="text-end">

        ${this.formatCurrency(journal.total_debit)}

    </td>

    <td class="text-end">

        ${this.formatCurrency(journal.total_credit)}

    </td>

    <td class="text-center">

        ${this.renderStatus(journal.status)}

    </td>

    <td class="text-center">

        <div class="btn-group btn-group-sm">

            ${
isDraft
? `
<button
class="btn btn-outline-primary btn-edit-journal"
data-id="${journal.id}"
title="Edit">
<i class="fa-solid fa-pen"></i>
</button>

<button
class="btn btn-outline-danger btn-delete-journal"
data-id="${journal.id}"
title="Delete">
<i class="fa-solid fa-trash"></i>
</button>

<button
class="btn btn-outline-dark btn-post-journal"
data-id="${journal.id}"
title="Post This Journal">
<i class="fa-solid fa-check"></i>
</button>

<button
class="btn btn-outline-success btn-duplicate-journal"
data-id="${journal.id}"
title="Duplicate">
<i class="fa-regular fa-copy"></i>
</button>
`
: ""
}
           ${
isPosted
? `
<button
class="btn btn-outline-secondary btn-view-journal"
data-id="${journal.id}"
title="View This Entry">
<i class="fa-solid fa-eye"></i>
</button>

<button
class="btn btn-outline-info btn-voucher-journal"
data-id="${journal.id}"
title="Voucher">
<i class="fa-solid fa-file-invoice"></i>
</button>

<button
class="btn btn-outline-warning btn-void-journal"
data-id="${journal.id}"
title="Void">
<i class="fa-solid fa-ban"></i>
</button>

<button
class="btn btn-outline-success btn-duplicate-journal"
data-id="${journal.id}"
title="Duplicate">
<i class="fa-regular fa-copy"></i>
</button>
`
: ""
}
${
isVoid
? `
<button
class="btn btn-outline-secondary btn-view-journal"
data-id="${journal.id}"
title="View This Entry">
<i class="fa-solid fa-eye"></i>
</button>

<button
class="btn btn-outline-info btn-voucher-journal"
data-id="${journal.id}"
title="Voucher">
<i class="fa-solid fa-file-invoice"></i>
</button>

<button
class="btn btn-outline-success btn-duplicate-journal"
data-id="${journal.id}"
title="Duplicate">
<i class="fa-regular fa-copy"></i>
</button>
`
: ""
}

            
        </div>

    </td>

</tr>

`;

}

handleTableAction(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const id = button.dataset.id;

    if (!id) return;

    if (button.classList.contains("btn-view-journal")) {

    return this.viewJournal(id);

}

if (button.classList.contains("btn-voucher-journal")) {

    return this.printVoucher(id);

}

if (button.classList.contains("btn-edit-journal")) {

    return this.openEditJournal(id);

}

if (button.classList.contains("btn-delete-journal")) {

    return this.deleteJournal(id);

}

if (button.classList.contains("btn-post-journal")) {

    return this.postJournal(id);

}

if (button.classList.contains("btn-void-journal")) {

    return this.voidJournal(id);

}

if (button.classList.contains("btn-duplicate-journal")) {

    return this.duplicateJournal(id);

}

}
/*
==========================================================
RENDER STATUS
==========================================================
*/

renderStatus(status) {

    switch (String(status).trim().toLowerCase()) {

    case "draft":

        return `
            <span class="badge bg-warning text-dark">
                Draft
            </span>
        `;

    case "posted":

        return `
            <span class="badge bg-success">
                Posted
            </span>
        `;

    case "cancelled":

        return `
            <span class="badge bg-danger">
                Cancelled
            </span>
        `;

    case "reversed":

        return `
            <span class="badge bg-info text-dark">
                Reversed
            </span>
        `;

    default:

        return `
            <span class="badge bg-secondary">
                ${status}
            </span>
        `;

}
}

/*
==========================================================
FORMAT CURRENCY
==========================================================
*/

formatCurrency(value) {

    return Number(
        value ?? 0
    ).toLocaleString(

        "id-ID",

        {

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        }

    );

}
/*
==========================================================
OPEN ADD JOURNAL
==========================================================
*/

async openAddJournal() {

    console.log("========== OPEN ADD ==========");

    this.currentMode = "add";

    this.currentJournal = null;

    console.log("Current Journal :", this.currentJournal);

    await this.loadJournalModal();

    this.clearJournalForm();

    console.log("Form Cleared");

    await this.loadMasterData();

    await this.initializeJournalHeader();

    await this.addDetailLine();

    console.log("Detail Row :", this.detailBody.children.length);

    this.modal.show();

}
/*
==========================================================
OPEN EDIT JOURNAL
==========================================================
*/

async openEditJournal(id) {

    try {

        this.currentMode = "edit";

        this.currentJournal =
            await this.service.getById(id);

        if (!this.currentJournal) {

            this.showMessage(
                "Journal not found.",
                "warning"
            );

            return;

        }

        await this.loadJournalModal();

this.clearJournalForm();

await this.loadMasterData();

await this.initializeJournalHeader();

await this.loadJournalData();

this.modal.show();
    }

    catch (error) {

        console.error(error);

        this.showError(error);

    }

}
/*
==========================================================
VIEW JOURNAL (READ ONLY)
==========================================================
*/

async viewJournal(id) {

    try {

        this.currentMode = "view";

        this.currentJournal =
            await this.service.getById(id);

        if (!this.currentJournal) {

            this.showMessage(
                "Journal not found.",
                "warning"
            );

            return;

        }

        await this.loadJournalModal();

        this.clearJournalForm();

        await this.loadMasterData();

        await this.initializeJournalHeader();

        await this.loadJournalData();

        this.setReadOnly(true);

        this.modal.show();

    }

    catch (error) {

        console.error(error);

        this.showError(error);

    }

}
/*
==========================================================
PRINT VOUCHER
==========================================================
*/

async printVoucher(id) {

    console.log("Voucher :", id);

    /*
    nanti kita arahkan
    ke PDF Voucher
    */

}
/*
==========================================================
LOAD JOURNAL MODAL
==========================================================
*/

async loadJournalModal() {

    if (this.modalLoaded) {

        return;

    }

    const response =
        await fetch(
            "modules/gl-journal/gl-journal-modal.html"
        );

    if (!response.ok) {

        throw new Error(
            "Cannot load Journal Modal."
        );

    }

    const html =
        await response.text();

    this.modalContainer.innerHTML =
        html;

    this.modalElement =
        document.getElementById(
            "glJournalModal"
        );

    this.modal =
        new bootstrap.Modal(
            this.modalElement
        );

    this.cacheModalDom();

    this.bindModalEvents();

    this.modalLoaded = true;

}
/*
==========================================================
CACHE MODAL DOM
==========================================================
*/

cacheModalDom() {

    this.txtAccountingDate =
        document.getElementById(
            "journal-accounting-date"
        );

    this.txtJournalNo =
        document.getElementById(
            "journal-journal-no"
        );

    this.txtDescription =
        document.getElementById(
            "journal-description"
        );

    this.cboStatus =
        document.getElementById(
            "journal-status"
        );

    this.detailBody =
        document.getElementById(
            "journal-detail-body"
        );

    this.detailTemplate =
        document.getElementById(
            "journal-detail-template"
        );

    this.btnAddDetail =
        document.getElementById(
            "btn-add-detail"
        );

    this.btnDeleteDetail =
        document.getElementById(
            "btn-delete-detail"
        );

    this.btnSaveJournal =
        document.getElementById(
            "btn-save-journal"
        );

    this.btnPostJournal =
        document.getElementById(
            "btn-post-journal"
        );

}

/*
==========================================================
BIND MODAL EVENTS
==========================================================
*/

bindModalEvents() {

    /*
    ======================================================
    ADD DETAIL
    ======================================================
    */

    this.btnAddDetail?.addEventListener(

        "click",

        () => {

            this.addDetailLine();

        }

    );

    /*
    ======================================================
    DELETE SELECTED DETAIL
    ======================================================
    */

    this.btnDeleteDetail?.addEventListener(

        "click",

        () => {

            this.deleteSelectedLines();

        }

    );


    /*
    ======================================================
    SAVE
    ======================================================
    */

    this.btnSaveJournal?.addEventListener(

    "click",

    () => {

        console.log("========== SAVE BUTTON ==========");

        console.log("Mode :", this.currentMode);

        console.log("Journal :", this.currentJournal);

        this.saveJournal("Draft");

    }

);

    /*
    ======================================================
    POST
    ======================================================
    */

    this.btnPostJournal?.addEventListener(

    "click",

    () => {

        console.log("========== POST BUTTON ==========");

        console.log("Mode :", this.currentMode);

        console.log("Journal :", this.currentJournal);

        this.saveJournal("Posted");

    }

);

}
/*
==========================================================
BIND DETAIL ROW EVENTS
==========================================================
*/

bindDetailRowEvents(row) {

    if (!row) return;

    /*
    ======================================================
    RECALCULATE
    ======================================================
    */

    row.querySelectorAll(

    ".detail-debit-account, " +
    ".detail-credit-account"

).forEach(element => {

    element.addEventListener(

        "change",

        () => {

            const debitAccount =
                row.querySelector(
                    ".detail-debit-account"
                )?.value;

            const creditAccount =
                row.querySelector(
                    ".detail-credit-account"
                )?.value;

            /*
            ==========================================
            DEBIT & CREDIT CANNOT BE SAME
            ==========================================
            */

            if (

                debitAccount &&
                creditAccount &&
                debitAccount === creditAccount

            ) {

                this.showMessage(

                    "Debit Account dan Credit Account tidak boleh sama.",

                    "warning"

                );

                element.value = "";

            }

            this.calculateSummary();

        }

    );

});

/*
======================================================
AMOUNT INPUT
======================================================
*/

const amountInput =

    row.querySelector(

        ".detail-amount"

    );

amountInput?.addEventListener(

    "input",

    () => {

        /*
        ==========================================
        POSITIVE NUMBER ONLY
        ==========================================
        */

        if (

            Number(amountInput.value) < 0

        ) {

            amountInput.value = 0;

        }

        this.calculateSummary();

    }

);
    /*
    ======================================================
    DESCRIPTION
    ======================================================
    */

    row.querySelector(

        ".detail-description"

    )?.addEventListener(

        "input",

        () => {

            // reserved

        }

    );
    /*
======================================================
DELETE CURRENT LINE
======================================================
*/

row.querySelector(

    ".btn-delete-detail"

)?.addEventListener(

    "click",

    () => {

        row.remove();

        /*
        ==========================================
        MINIMUM 1 ROW
        ==========================================
        */

        if (

            this.detailBody.querySelectorAll(

                ".journal-detail-row"

            ).length === 0

        ) {

            this.addDetailLine();

        }

        this.renumberDetailLines();

        this.calculateSummary();

    }

);

}

/*
==========================================================
INITIALIZE JOURNAL HEADER
==========================================================
*/

async initializeJournalHeader() {

    /*
    ==========================================
    DOCUMENT NUMBER
    ==========================================
    */

    if (this.currentMode === "add") {

        this.txtJournalNo.value =
            await this.service.generateDocumentNumber();

    }
    else {

        this.txtJournalNo.value =
    this.currentJournal.journal_no;
    }

    /*
    ==========================================
    ACCOUNTING DATE
    ==========================================
    */

    if (this.currentMode === "add") {

        this.txtAccountingDate.value =
            new Date()
            .toISOString()
            .substring(0,10);

    }
    else {

        this.txtAccountingDate.value =
    this.currentJournal.journal_date;

    }

    /*
    ==========================================
    STATUS
    ==========================================
    */

    this.cboStatus.value =
        this.currentMode === "add"
        ? "Draft"
        : this.currentJournal.status;

}
/*
==========================================================
LOAD JOURNAL DATA
==========================================================
*/

async loadJournalData() {

    if (!this.currentJournal) {

        return;

    }

    /*
    ======================================================
    HEADER
    ======================================================
    */

    this.txtDescription.value =
        this.currentJournal.description ?? "";

    this.cboStatus.value =
        this.currentJournal.status ?? "Draft";

    /*
    ======================================================
    DETAIL
    ======================================================
    */

    this.detailBody.innerHTML = "";

    if (!Array.isArray(this.currentJournal.details)) {

        return;

    }

    const details =
    this.currentJournal.details;

const debitDetails =
    details.filter(
        detail =>
            Number(
                detail.debit
            ) > 0
    );

const creditDetails =
    details.filter(
        detail =>
            Number(
                detail.credit
            ) > 0
    );

for (
    let i = 0;
    i < debitDetails.length;
    i++
) {

    const debit =
        debitDetails[i];

    const credit =
        creditDetails[i];

    await this.addDetailLine({

        description:
            debit.description
            ??
            credit?.description
            ??
            "",

        debit_account_id:
            debit.account_id,

        credit_account_id:
            credit?.account_id
            ?? "",

        amount:
            Number(
                debit.debit
            ),

        business_partner_id:
            debit.business_partner_id
            ??
            credit?.business_partner_id
            ??
            null

    });

}

    this.calculateSummary();

}
/*
==========================================================
ADD DETAIL LINE
==========================================================
*/

async addDetailLine(data = {}) {

    const template =
        this.detailTemplate;

    if (!template) {

        console.error(
            "Template journal-detail-template tidak ditemukan"
        );

        return;

    }

    if (!this.detailBody) {

        console.error(
            "journal-detail-body tidak ditemukan"
        );

        return;

    }

    /*
    ======================================================
    CLONE TEMPLATE
    ======================================================
    */

    const clone =
        template.content.cloneNode(true);

    /*
    ======================================================
    APPEND ROW
    ======================================================
    */

    this.detailBody.appendChild(
        clone
    );

    const addedRow =
        this.detailBody.lastElementChild;

    if (!addedRow) {

        console.error(
            "Detail row gagal dibuat."
        );

        return;

    }

    /*
    ======================================================
    GET ELEMENT
    ======================================================
    */

    const debitAccount =
        addedRow.querySelector(
            ".detail-debit-account"
        );

    const creditAccount =
        addedRow.querySelector(
            ".detail-credit-account"
        );

    const businessPartner =
        addedRow.querySelector(
            ".detail-business-partner"
        );

    const description =
        addedRow.querySelector(
            ".detail-description"
        );

    const amount =
        addedRow.querySelector(
            ".detail-amount"
        );

    /*
    ======================================================
    LOAD COA
    ======================================================
    */

    this.loadCOA(
        debitAccount
    );

    this.loadCOA(
        creditAccount
    );

    /*
    ======================================================
    LOAD BUSINESS PARTNER
    ======================================================
    */

    this.loadBusinessPartner(
        businessPartner
    );

    /*
    ======================================================
    SET VALUE
    ======================================================
    */

    if (description) {

        description.value =
            data.description ?? "";

    }

    if (debitAccount) {

        debitAccount.value =
            data.debit_account_id ?? "";

    }

    if (creditAccount) {

        creditAccount.value =
            data.credit_account_id ?? "";

    }

    if (amount) {

        amount.value =
            data.amount ?? 0;

    }

    if (businessPartner) {

        businessPartner.value =
            data.business_partner_id ?? "";

    }

    /*
    ======================================================
    BIND ROW EVENTS
    ======================================================
    */

    this.bindDetailRowEvents(
        addedRow
    );

    /*
    ======================================================
    RENUMBER
    ======================================================
    */

    this.renumberDetailLines();

    /*
    ======================================================
    CALCULATE
    ======================================================
    */

    this.calculateSummary();

}
/*
==========================================================
LOAD COA
==========================================================
*/

loadCOA(selectElement) {

    if (!selectElement) {

        console.error(
            "COA select tidak ditemukan."
        );

        return;

    }

    selectElement.innerHTML = "";

    const defaultOption =
        document.createElement(
            "option"
        );

    defaultOption.value = "";

    defaultOption.textContent =
        "-- Select Account --";

    selectElement.appendChild(
        defaultOption
    );

    if (
        !Array.isArray(
            this.coaList
        )
    ) {

        console.warn(
            "COA list kosong."
        );

        return;

    }

    this.coaList.forEach(
        account => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                account.id;

            option.textContent =
                `${account.account_code} - ${account.account_name}`;

            selectElement.appendChild(
                option
            );

        }
    );

}
/*
==========================================================
LOAD MASTER DATA
==========================================================
*/

async loadMasterData() {

    try {

        /*
        ==================================================
        LOAD COA
        ==================================================
        */

        this.coaList =
            await this.service.getCOA();

        /*
        ==================================================
        LOAD BUSINESS PARTNER
        ==================================================
        */

        this.businessPartnerList =
            await this.service.getBusinessPartner();

        /*
        ==================================================
        VALIDATE COA
        ==================================================
        */

        if (
            !Array.isArray(
                this.coaList
            )
        ) {

            this.coaList = [];

        }

        /*
        ==================================================
        VALIDATE BUSINESS PARTNER
        ==================================================
        */

        if (
            !Array.isArray(
                this.businessPartnerList
            )
        ) {

            this.businessPartnerList = [];

        }

        console.log(
            "COA loaded:",
            this.coaList.length
        );

        console.log(
            "Business Partner loaded:",
            this.businessPartnerList.length
        );

    }

    catch (error) {

        console.error(
            "Failed to load master data:",
            error
        );

        this.coaList = [];

        this.businessPartnerList = [];

        throw error;

    }

}

/*
==========================================================
LOAD BUSINESS PARTNER
==========================================================
*/

/*
==========================================================
LOAD BUSINESS PARTNER
==========================================================
*/

loadBusinessPartner(selectElement) {

    if (!selectElement) {

        console.error(
            "Business Partner select tidak ditemukan."
        );

        return;

    }

    selectElement.innerHTML = "";

    const defaultOption =
        document.createElement(
            "option"
        );

    defaultOption.value = "";

    defaultOption.textContent =
        "-- Optional --";

    selectElement.appendChild(
        defaultOption
    );

    if (
        !Array.isArray(
            this.businessPartnerList
        )
    ) {

        console.warn(
            "Business Partner list kosong."
        );

        return;

    }

    this.businessPartnerList.forEach(
        partner => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                partner.id;

            option.textContent =
`${partner.bp_code} - ${partner.bp_name}`;

            selectElement.appendChild(
                option
            );

        }
    );

}
/*
==========================================================
CALCULATE SUMMARY
==========================================================
*/

calculateSummary() {

    let totalDebit = 0;

    let totalCredit = 0;

    const rows =
        this.detailBody.querySelectorAll(
            ".journal-detail-row"
        );

    rows.forEach(row => {

        const debitAccount =
            row.querySelector(
                ".detail-debit-account"
            )?.value;

        const creditAccount =
            row.querySelector(
                ".detail-credit-account"
            )?.value;

        const amount =
            Number(
                row.querySelector(
                    ".detail-amount"
                )?.value || 0
            );

        if (
            debitAccount &&
            amount > 0
        ) {

            totalDebit += amount;

        }

        if (
            creditAccount &&
            amount > 0
        ) {

            totalCredit += amount;

        }

    });

    const difference =
        Math.abs(
            totalDebit -
            totalCredit
        );

    const debitElement =
        document.getElementById(
            "summary-total-debit"
        );

    const creditElement =
        document.getElementById(
            "summary-total-credit"
        );

    const differenceElement =
        document.getElementById(
            "summary-difference"
        );

    if (debitElement) {

        debitElement.value =
            this.formatCurrency(
                totalDebit
            );

    }

    if (creditElement) {

        creditElement.value =
            this.formatCurrency(
                totalCredit
            );

    }

    if (differenceElement) {

        differenceElement.value =
            this.formatCurrency(
                difference
            );

    }

    const statusElement =
        document.getElementById(
            "summary-balance-status"
        );

    if (!statusElement) return;

    if (
        totalDebit === totalCredit &&
        totalDebit > 0
    ) {

        statusElement.textContent =
            "BALANCED";

        statusElement.className =
            "badge bg-success";

    } else {

        statusElement.textContent =
            "NOT BALANCED";

        statusElement.className =
            "badge bg-danger";

    }

}
/*
==========================================================
DELETE SELECTED DETAIL LINE
==========================================================
*/

deleteSelectedLines() {

    const selectedRows =
        this.detailBody.querySelectorAll(
            ".detail-check:checked"
        );

    if (
        selectedRows.length === 0
    ) {

        this.showMessage(
            "Pilih detail jurnal yang akan dihapus.",
            "warning"
        );

        return;

    }

    selectedRows.forEach(
        checkbox => {

            const row =
                checkbox.closest(
                    ".journal-detail-row"
                );

            row?.remove();

        }
    );

    this.renumberDetailLines();

    this.calculateSummary();

}

/*
==========================================================
RENUMBER DETAIL LINE
==========================================================
*/

renumberDetailLines() {

    const rows =
        this.detailBody.querySelectorAll(
            ".journal-detail-row"
        );

    rows.forEach(
        (row, index) => {

            const number =
                row.querySelector(
                    ".detail-line-number"
                );

            if (number) {

                number.textContent =
                    index + 1;

            }

        }
    );

}

/*
==========================================================
COLLECT DETAIL DATA
==========================================================
*/

collectDetailData() {

    const details = [];

    const rows =
        this.detailBody.querySelectorAll(
            ".journal-detail-row"
        );

    rows.forEach(row => {

        const description =
            row.querySelector(
                ".detail-description"
            )?.value.trim() ?? "";

        const debitAccount =
            row.querySelector(
                ".detail-debit-account"
            )?.value ?? "";

        const creditAccount =
            row.querySelector(
                ".detail-credit-account"
            )?.value ?? "";

        const amount =
            Number(
                row.querySelector(
                    ".detail-amount"
                )?.value || 0
            );

        const businessPartner =
            row.querySelector(
                ".detail-business-partner"
            )?.value || null;

        if (
            !debitAccount &&
            !creditAccount &&
            amount === 0
        ) {

            return;

        }

        details.push({

            debit_account_id:
                debitAccount,

            credit_account_id:
                creditAccount,

            amount,

            business_partner_id:
                businessPartner,

            description

        });

    });

    return details;

}

/*
==========================================================
SAVE JOURNAL
==========================================================
*/

async saveJournal(
    status = "Draft"
) {

    try {

        const header = {

    journal_date:
        this.txtAccountingDate.value,

    journal_no:
        this.txtJournalNo.value,

    description:
        this.txtDescription.value.trim(),

    status

};

        const details =
            this.collectDetailData();

        if (
            details.length === 0
        ) {

            this.showMessage(
                "Journal detail belum diisi.",
                "warning"
            );

            return;

        }

        const journalDetails =
            this.service.buildJournalDetail(
                details
            );

        const total =
            this.service.calculateTotal(
                journalDetails
            );

        if (
            Number(
                total.totalDebit.toFixed(2)
            ) !==
            Number(
                total.totalCredit.toFixed(2)
            )
        ) {

            this.showMessage(
                "Journal belum balance.",
                "warning"
            );

            return;

        }

        if (
            this.currentMode === "add"
        ) {

            await this.service.create(
                header,
                details
            );

        } else {

            await this.service.update(
                this.currentJournal.id,
                header,
                details
            );

        }

        this.showMessage(
            status === "Posted"
                ? "Journal berhasil diposting."
                : "Journal berhasil disimpan."
        );

        this.modal.hide();

        await this.loadData();

    }

    catch (error) {

        console.error(
            "saveJournal error:",
            error
        );

        this.showError(
            error
        );

    }

}
/*
==========================================================
RENDER PAGINATION
==========================================================
*/

renderPagination() {

    if (!this.currentPageInput) return;

    this.currentPageInput.value = this.currentPage;

    if (this.totalPageLabel) {

        this.totalPageLabel.textContent =
            `of ${this.totalPages}`;

    }

    if (this.btnFirstPage)
        this.btnFirstPage.disabled =
            this.currentPage === 1;

    if (this.btnPreviousPage)
        this.btnPreviousPage.disabled =
            this.currentPage === 1;

    if (this.btnNextPage)
        this.btnNextPage.disabled =
            this.currentPage >= this.totalPages;

    if (this.btnLastPage)
        this.btnLastPage.disabled =
            this.currentPage >= this.totalPages;

}
/*
==========================================================
POST JOURNAL
==========================================================
*/

async postJournal(id) {

    try {

        const confirmPost = confirm(
            "Post jurnal ini?"
        );

        if (!confirmPost) {

            return;

        }

        await this.service.post(id);

        this.showMessage(
            "Journal berhasil diposting."
        );

        await this.loadData();

    }

    catch (error) {

        console.error(error);

        this.showError(error);

    }

}
/*
==========================================================
VOID JOURNAL
==========================================================
*/

async voidJournal(id) {

    try {

        const confirmVoid = confirm(
            "Void journal ini?"
        );

        if (!confirmVoid) {

            return;

        }

        await this.service.voidJournal(id, "");

        this.showMessage(
            "Journal berhasil di-void."
        );

        await this.loadData();

    }

    catch (error) {

        console.error(error);

        this.showError(error);

    }

}
/*
==========================================================
DELETE JOURNAL
==========================================================
*/

async deleteJournal(id) {

    try {

        const confirmDelete = confirm(
            "Apakah Anda yakin ingin menghapus journal ini?"
        );

        if (!confirmDelete) {

            return;

        }

        await this.service.delete(id);

        this.showMessage(
            "Journal berhasil dihapus.",
            "success"
        );

        await this.loadData();

    }

    catch (error) {

        console.error(error);

        this.showError(error);

    }

}
/*
==========================================================
DUPLICATE JOURNAL
==========================================================
*/

async duplicateJournal(id) {

    try {

        const confirmDuplicate = confirm(
            "Apakah Anda yakin ingin menduplikasi journal ini?"
        );

        if (!confirmDuplicate) {

            return;

        }

        await this.service.duplicate(id);

        this.showMessage(
            "Journal berhasil diduplikasi.",
            "success"
        );

        await this.loadData();

    }

    catch (error) {

        console.error(error);

        this.showError(error);

    }

}
/*
==========================================================
SHOW MESSAGE
==========================================================
*/

showMessage(
    message,
    type = "success"
) {

    console.log(`[${type.toUpperCase()}]`, message);

    if (window.Toast) {

        window.Toast.show(
            message,
            type
        );

        return;

    }

    alert(message);

}

/*
==========================================================
SHOW ERROR
==========================================================
*/

showError(error) {

    console.error(error);

    const message =
        error?.message ??
        "Unexpected Error";

    this.showMessage(
        message,
        "danger"
    );

}
/*
==========================================================
CLEAR JOURNAL FORM
==========================================================
*/

clearJournalForm(){

    const form =

        document.getElementById("glJournalForm");

    if(form){

        form.reset();

    }

    if(this.detailBody){

        this.detailBody.innerHTML = "";

    }

}



}