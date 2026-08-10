/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Module  : General Journal
Version : Enterprise 3.0
Author  : FINOVA Development Team
==========================================================
*/


/*
==========================================================
SERVICES
==========================================================
*/

import {
    GeneralJournalService
} from "../../service/journal.service.js";

import {
    supabase,
    TABLE
} from "../../assets/js/core/supabase.js";

import { PreviewService }
from "../../service/preview.service.js";
import { ExcelExportService } from "../../service/excel-export.service.js";
/*
==========================================================
GENERAL JOURNAL
==========================================================
*/


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
    DATA SOURCE
    ======================================================
    */

    this.journals = [];

    this.filteredJournals = [];

    this.detailLines = [];

    this.summary = {

    totalDebit : 0,

    totalCredit : 0,

    difference : 0,

    isBalanced : true

};


    this.coaList = [];

    this.businessPartnerList = [];

    /*
    ======================================================
    CURRENT STATE
    ======================================================
    */

    this.currentMode = "add";

    this.currentJournal = null;

    this.selectedDetailIndex = -1;

    /*
    ======================================================
    PAGINATION
    ======================================================
    */

    this.pageSize = 10;

    this.currentPage = 1;

    this.totalPages = 1;

    this.totalRows = 0;

    /*
    ======================================================
    JOURNAL MODAL
    ======================================================
    */

    this.modal = null;

    this.modalElement = null;

    this.modalLoaded = false;

    /*
    ======================================================
    DETAIL MODAL
    ======================================================
    */

    this.detailModal = null;

    this.detailModalElement = null;

    this.detailModalLoaded = false;

    /*
    ======================================================
    EVENT FLAG
    ======================================================
    */

    this.modalEventsBound = false;

    this.detailModalEventsBound = false;
    this.editDetailIndex = -1;

}
/*
==========================================================
INITIALIZE MODULE
==========================================================
*/

async init() {

    try {

        /*
        ======================================================
        SHOW LOADING
        ======================================================
        */

        window.App?.showLoading?.();

        console.group(
            "GL Journal Initialization"
        );

        /*
        ======================================================
        CACHE MAIN PAGE DOM
        ======================================================
        */

        this.cacheDom();

        /*
        ======================================================
        LOAD JOURNAL MODAL
        ======================================================
        */

        await this.loadJournalModal();

        /*
        ======================================================
        CREATE DELETE MODAL
        ======================================================
        */

        this.createDeleteJournalModal();

        /*
        ======================================================
        BIND ALL EVENTS
        ======================================================
        */

        this.bindEvents();

        /*
        ======================================================
        LOAD JOURNAL DATA
        ======================================================
        */

        await this.loadData();

        console.log(
            "GL Journal initialized successfully."
        );

        console.groupEnd();

    }

    catch (error) {

        console.error(
            "GL Journal initialization failed.",
            error
        );

        throw error;

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
    HEADER
    ======================================================
    */

    this.btnAddJournal =
        document.getElementById(
            "btn-add-journal"
        );

    this.btnRefreshJournal =
        document.getElementById(
            "btn-refresh-journal"
        );

    this.btnDownloadJournal =
        document.getElementById(
            "btn-download-journal"
        );
    this.btnPreviewJournal =
    document.getElementById(
        "btn-preview-journal"
    );
    

    /*
    ======================================================
    FILTER
    ======================================================
    */

    this.filterDateFrom =
        document.getElementById(
            "filter-date-from"
        );

    this.filterDateTo =
        document.getElementById(
            "filter-date-to"
        );

    this.filterStatus =
        document.getElementById(
            "filter-status"
        );

    this.filterFindBy =
        document.getElementById(
            "filter-find-by"
        );

    this.filterKeyword =
        document.getElementById(
            "filter-keyword"
        );

    this.btnFindJournal =
        document.getElementById(
            "btn-find-journal"
        );

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
        document.getElementById(
            "btn-first-page"
        );

    this.btnPreviousPage =
        document.getElementById(
            "btn-prev-page"
        );

    this.btnNextPage =
        document.getElementById(
            "btn-next-page"
        );

    this.btnLastPage =
        document.getElementById(
            "btn-last-page"
        );

    this.currentPageInput =
        document.getElementById(
            "current-page"
        );

    this.totalPageLabel =
        document.getElementById(
            "total-pages"
        );

    this.displayRecord =
        document.getElementById(
            "display-record"
        );

    /*
    ======================================================
    MODAL CONTAINER
    ======================================================
    */

    this.modalContainer =
        document.getElementById(
            "gl-journal-modal-container"
        );

    this.detailModalContainer =
        document.getElementById(
            "journal-detail-modal-container"
        );

    /*
    ======================================================
    CACHE VALIDATION
    ======================================================
    */

    console.groupCollapsed(
        "GL Journal DOM Cache"
    );

    console.log(
        "Add Journal :",
        Boolean(this.btnAddJournal)
    );

    console.log(
        "Refresh Journal :",
        Boolean(this.btnRefreshJournal)
    );

    console.log(
        "Download Journal :",
        Boolean(this.btnDownloadJournal)
    );

    console.log(
        "Filter Date From :",
        Boolean(this.filterDateFrom)
    );

    console.log(
        "Filter Date To :",
        Boolean(this.filterDateTo)
    );

    console.log(
        "Filter Status :",
        Boolean(this.filterStatus)
    );

    console.log(
        "Filter Find By :",
        Boolean(this.filterFindBy)
    );

    console.log(
        "Filter Keyword :",
        Boolean(this.filterKeyword)
    );

    console.log(
        "Find Button :",
        Boolean(this.btnFindJournal)
    );

    console.log(
        "Table :",
        Boolean(this.table)
    );

    console.log(
        "Table Body :",
        Boolean(this.tableBody)
    );

    console.log(
        "Modal Container :",
        Boolean(this.modalContainer)
    );

    console.log(
        "Detail Modal Container :",
        Boolean(this.detailModalContainer)
    );
    console.log(
    "Preview Button :",
    this.btnPreview
    );

    console.groupEnd();
        /*
    ==========================================================
    SUMMARY
    ==========================================================
    */

    this.summaryTotalLine =
        document.getElementById(
            "summary-total-line"
        );

    this.summaryTotalAmount =
        document.getElementById(
            "summary-total-amount"
        );
      
  
}
/*
==========================================================
CACHE DETAIL MODAL DOM
==========================================================
*/

cacheDetailModalDom() {
    console.log(this.btnSaveLine);

    /*
    ======================================================
    MODAL
    ======================================================
    */

    this.detailModalElement =
        document.getElementById(
            "journalDetailModal"
        );

    /*
    ======================================================
    HIDDEN FIELD
    ======================================================
    */

    this.detailId =
        document.getElementById(
            "detail-id"
        );

    this.detailMode =
        document.getElementById(
            "detail-mode"
        );

    /*
    ======================================================
    DETAIL FORM
    ======================================================
    */

    this.detailDescription =
        document.getElementById(
            "detail-description"
        );

    this.detailDebitAccount =
        document.getElementById(
            "detail-debit-account"
        );

    this.detailCreditAccount =
        document.getElementById(
            "detail-credit-account"
        );

    this.detailAmount =
        document.getElementById(
            "detail-amount"
        );

    this.detailBusinessPartner =
        document.getElementById(
            "detail-business-partner"
        );

    /*
    ======================================================
    FOOTER
    ======================================================
    */

    this.btnSaveLine =
        document.getElementById(
            "btn-save-detail-line"
        );

    /*
    ======================================================
    CACHE VALIDATION
    ======================================================
    */

    console.groupCollapsed(
        "Journal Detail Modal Cache"
    );

    console.table({

        modal :
            Boolean(this.detailModalElement),

        detailId :
            Boolean(this.detailId),

        detailMode :
            Boolean(this.detailMode),

        description :
            Boolean(this.detailDescription),

        debitAccount :
            Boolean(this.detailDebitAccount),

        creditAccount :
            Boolean(this.detailCreditAccount),

        amount :
            Boolean(this.detailAmount),

        businessPartner :
            Boolean(this.detailBusinessPartner),

        saveLineButton :
            Boolean(this.btnSaveLine)

    });

    console.groupEnd();

}
/*
==========================================================
UPDATE SUMMARY DISPLAY
==========================================================
*/

updateSummaryDisplay() {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!this.summary) {

        return;

    }

    /*
    ======================================================
    TOTAL LINE
    ======================================================
    */

    if (this.summaryTotalLine) {

        this.summaryTotalLine.value =
            this.detailLines.length;

    }

    /*
    ======================================================
    TOTAL AMOUNT
    ======================================================
    */

    if (this.summaryTotalAmount) {

        this.summaryTotalAmount.value =
            this.formatCurrency(

                this.summary.totalDebit

            );

    }

}
/*
==========================================================
CACHE JOURNAL MODAL DOM
==========================================================
*/

cacheModalDom() {

    /*
    ======================================================
    JOURNAL HEADER
    ======================================================
    */

    this.txtAccountingDate =
        document.getElementById(
            "journal-accounting-date"
        );
            
    this.txtPostingPeriod =
    document.getElementById(
        "journal-posting-period"
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
    this.journalHeaderStatus =
    document.getElementById(
        "journal-header-status"
    );

    /*
    ======================================================
    JOURNAL DETAIL
    ======================================================
    */

    this.detailTable =
        document.getElementById(
            "journal-detail-table"
        );

    this.detailTableBody =
        document.getElementById(
            "journal-detail-tbody"
        );

    this.emptyRow =
        document.getElementById(
            "journal-empty-row"
        );

    /*
    ======================================================
    DETAIL TOOLBAR
    ======================================================
    */

    this.btnAddLine =
        document.getElementById(
            "btn-add-line"
        );

    /*
    ======================================================
    SUMMARY
    ======================================================
    */

    this.summaryTotalLine =
        document.getElementById(
            "summary-total-line"
        );

    this.summaryTotalAmount =
        document.getElementById(
            "summary-total-amount"
        );

    /*
    ======================================================
    FOOTER
    ======================================================
    */

    this.btnSaveJournal =
        document.getElementById(
            "btn-save-journal"
        );

    this.btnPostJournal =
        document.getElementById(
            "btn-post-journal"
        );

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    const controls = {

        accountingDate:
            this.txtAccountingDate,

        journalNo:
            this.txtJournalNo,

        description:
            this.txtDescription,

        status:
            this.cboStatus,

        detailTable:
            this.detailTable,

        detailTableBody:
            this.detailTableBody,

        addLineButton:
            this.btnAddLine,

        summaryTotalLine:
            this.summaryTotalLine,

        summaryTotalAmount:
            this.summaryTotalAmount,

        saveJournalButton:
            this.btnSaveJournal,

        postJournalButton:
            this.btnPostJournal

    };

    console.group("GL JOURNAL CACHE");

    console.table(

        Object.fromEntries(

            Object.entries(controls).map(

                ([key, value]) => [

                    key,

                    Boolean(value)

                ]

            )

        )

    );

    console.groupEnd();

}
/*
==========================================================
BIND ALL EVENTS
==========================================================
*/

bindEvents() {

    /*
    ======================================================
    HEADER
    ======================================================
    */

 this.btnAddJournal?.addEventListener(

    "click",

    () => this.openAddJournal()

);

this.btnRefreshJournal?.addEventListener(

    "click",

    async () => {

        await this.resetFilter();

    }

);

this.btnDownloadJournal?.addEventListener(

    "click",

    () => this.exportExcel()

);

this.btnPreviewJournal?.addEventListener(
    "click",
    () => {
        console.log("PREVIEW CLICK");
        this.previewHTML();
    }
);
/*
==========================================================
CONFIRM DELETE JOURNAL
==========================================================
*/

const btnDelete =

    document.getElementById(

        "btn-confirm-delete-journal"

    );

btnDelete?.addEventListener(

    "click",

    async () => {

        btnDelete.disabled = true;

        try {

            await this.deleteJournal(

                this.selectedDeleteJournalId

            );

        }

        finally {

            btnDelete.disabled = false;

        }

    }

);

/*
==========================================================
DETAIL TABLE EVENT
==========================================================
*/

if (this.gridBody) {

    this.gridBody.addEventListener(

        "click",

        (event) => {


            const editButton =

                event.target.closest(

                    ".btn-edit-detail"

                );


            if (editButton) {

                this.openEditDetailModal(

                    Number(

                        editButton.dataset.index

                    )

                );

                return;

            }



            const deleteButton =

                event.target.closest(

                    ".btn-delete-detail"

                );


            if (deleteButton) {

                this.deleteDetail(

                    Number(

                        deleteButton.dataset.index

                    )

                );

            }


        }

    );

}

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
RESET FILTER & REFRESH DATA
==========================================================
*/

resetFilter(){

    if(this.filterDateFrom){

        this.filterDateFrom.value = "";

    }


    if(this.filterDateTo){

        this.filterDateTo.value = "";

    }


    if(this.filterStatus){

        this.filterStatus.value = "all";

    }


    if(this.filterKeyword){

        this.filterKeyword.value = "";

    }


    if(this.filterFindBy){

        this.filterFindBy.value = "journal_no";

    }


    this.currentPage = 1;


    this.loadData();

}

/*
==========================================================
BIND FILTER EVENTS
==========================================================
*/

bindFilterEvents() {

    /*
    ======================================================
    FIND BUTTON
    ======================================================
    */

    this.btnFindJournal?.addEventListener(

        "click",

        () => this.search()

    );

    /*
    ======================================================
    KEYWORD
    ======================================================
    */

    this.filterKeyword?.addEventListener(

        "keydown",

        (event) => {

            if (event.key === "Enter") {

                this.search();

            }

        }

    );

    /*
    ======================================================
    STATUS
    ======================================================
    */

    this.filterStatus?.addEventListener(

        "change",

        () => this.search()

    );

    /*
    ======================================================
    FIND BY
    ======================================================
    */

    this.filterFindBy?.addEventListener(

        "change",

        () => this.search()

    );

    /*
    ======================================================
    DATE FROM
    ======================================================
    */

    this.filterDateFrom?.addEventListener(

        "change",

        () => this.search()

    );

    /*
    ======================================================
    DATE TO
    ======================================================
    */

    this.filterDateTo?.addEventListener(

        "change",

        () => this.search()

    );
    

}
/*
==========================================================
BIND PAGINATION EVENTS
==========================================================
*/

bindPaginationEvents() {

    /*
    ======================================================
    FIRST PAGE
    ======================================================
    */

    this.btnFirstPage?.addEventListener(

        "click",

        () => this.firstPage()

    );

    /*
    ======================================================
    PREVIOUS PAGE
    ======================================================
    */

    this.btnPreviousPage?.addEventListener(

        "click",

        () => this.previousPage()

    );

    /*
    ======================================================
    NEXT PAGE
    ======================================================
    */

    this.btnNextPage?.addEventListener(

        "click",

        () => this.nextPage()

    );

    /*
    ======================================================
    LAST PAGE
    ======================================================
    */

    this.btnLastPage?.addEventListener(

        "click",

        () => this.lastPage()

    );

    /*
    ======================================================
    GO TO PAGE
    ======================================================
    */

    this.currentPageInput?.addEventListener(

        "change",

        () => this.goToPage()

    );

    /*
    ======================================================
    ENTER PAGE NUMBER
    ======================================================
    */

    this.currentPageInput?.addEventListener(

        "keydown",

        (event) => {

            if (event.key === "Enter") {

                this.goToPage();

            }

        }

    );

}

/*
==========================================================
SHOW DELETE JOURNAL MODAL
==========================================================
*/

showDeleteJournalModal(id) {

    /*
    ======================================================
    FIND JOURNAL
    ======================================================
    */

    const journal =

        this.journals.find(

            x => String(x.id) === String(id)

        );

    if (!journal) {

        return;

    }

    /*
    ======================================================
    FILL INFORMATION
    ======================================================
    */

    document.getElementById(

        "delete-journal-no"

    ).textContent =

        journal.journal_no || "-";

    document.getElementById(

    "delete-accounting-date"

    ).textContent =

    journal.journal_date || "-";

    document.getElementById(

        "delete-description"

    ).textContent =

        journal.description || "-";

    /*
    ======================================================
    SAVE ID
    ======================================================
    */

    this.selectedDeleteJournalId = id;

    /*
    ======================================================
    SHOW MODAL
    ======================================================
    */

    this.deleteJournalModal.show();

}
/*
==========================================================
BIND TABLE EVENTS
==========================================================
*/

bindTableEvents() {

    /*
    ======================================================
    TABLE ACTION
    ======================================================
    */

    this.tableBody?.addEventListener(

        "click",

        (event) => {

            this.handleTableAction(event);

        }

    );

}
/*
==========================================================
BIND JOURNAL MODAL EVENTS
==========================================================
*/

bindModalEvents() {

    console.log("BIND JOURNAL MODAL EVENTS");

    /*
    ======================================================
    PREVENT DOUBLE BINDING
    ======================================================
    */

    if (this.modalEventsBound) {

        return;

    }

    this.modalEventsBound = true;

        /*
    ======================================================
    ACCOUNTING DATE → POSTING PERIOD
    ======================================================
    */

    this.txtAccountingDate?.addEventListener(
        "change",
        () => {

            if (!this.txtPostingPeriod) {

                return;

            }

            this.txtPostingPeriod.value =
                this.getPostingPeriod(
                    this.txtAccountingDate.value
                );

        }
    );

    /*
    ======================================================
    ADD DETAIL
    ======================================================
    */

    this.btnAddLine?.addEventListener(

        "click",

        () => this.openAddDetailModal()

    );

    /*
    ======================================================
    DETAIL TABLE
    ======================================================
    */

    this.detailTableBody?.addEventListener(

        "click",

        (event) => this.handleDetailTableAction(event)

    );

   /*
==========================================================
SAVE DRAFT
==========================================================
*/

if (!this.btnSaveJournal) {

    console.error("BTN SAVE JOURNAL NOT FOUND");

}
else {

    console.log("REGISTER SAVE DRAFT EVENT");

    this.btnSaveJournal.addEventListener(

        "click",

        async (event) => {

            event.preventDefault();

            console.log("SAVE DRAFT CLICK");

            console.log("CURRENT MODE :", this.currentMode);

            console.log("DETAIL :", this.detailLines);

            await this.saveJournal("Draft");

        }

    );

}

   /*
==========================================================
SAVE & POST
==========================================================
*/

console.log(
    "BTN POST :",
    this.btnPostJournal
);

this.btnPostJournal?.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();

        console.log(
            "POST CLICK - SHOW CONFIRMATION MODAL"
        );

        /*
        ======================================================
        SHOW BOOTSTRAP CONFIRMATION
        ======================================================
        */

        const confirmed =
            await this.showPostConfirmation();

        /*
        ======================================================
        CANCEL
        ======================================================
        */

        if (!confirmed) {

            console.log(
                "POST CANCELLED"
            );

            return;

        }

        /*
        ======================================================
        CONFIRMED
        ======================================================
        */

        console.log(
            "POST CONFIRMED"
        );

        /*
        ======================================================
        POST JOURNAL
        ======================================================
        */

        await this.saveJournal(
            "Posted"
        );

    }
);
}
/*
==========================================================
LOAD DETAIL MODAL
==========================================================
*/

async loadDetailModal() {

    if (this.detailModalLoaded) {

        return;

    }

    const response = await fetch(

        "modules/gl-journal/journal-detail-modal.html"

    );

    if (!response.ok) {

        throw new Error(

            "Failed to load Journal Detail Modal."

        );

    }

    this.detailModalContainer.innerHTML =

        await response.text();

    this.detailModal =

        new bootstrap.Modal(

            document.getElementById(

                "journalDetailModal"

            )

        );

    this.cacheDetailModalDom();

    this.bindDetailModalEvents();

    this.detailModalLoaded = true;
    

}
/*
==========================================================
LOAD JOURNAL MODAL
==========================================================
*/

async loadJournalModal() {

    /*
    ======================================================
    ALREADY LOADED
    ======================================================
    */

    if (this.modalLoaded) {

        return;

    }

    /*
    ======================================================
    LOAD HTML
    ======================================================
    */

    const response =
        await fetch(
            "modules/gl-journal/gl-journal-modal.html"
        );

    if (!response.ok) {

        throw new Error(
            "Failed to load Journal Modal."
        );

    }

    const html =
        await response.text();

    this.modalContainer.innerHTML =
        html;

    /*
    ======================================================
    INITIALIZE MODAL
    ======================================================
    */

    this.modalElement =
        document.getElementById(
            "glJournalModal"
        );

    this.modal =
        new bootstrap.Modal(
            this.modalElement
        );

    /*
    ======================================================
    CACHE MODAL DOM
    ======================================================
    */

    this.cacheModalDom();

    /*
    ======================================================
    LOAD DETAIL MODAL
    ======================================================
    */

    await this.loadDetailModal();
    await this.populateCOA();

    await this.populateBusinessPartners();

    /*
    ======================================================
    BIND MODAL EVENTS
    ======================================================
    */

    this.bindModalEvents();

    /*
    ======================================================
    MARK AS LOADED
    ======================================================
    */

    this.modalLoaded = true;

        
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
LOAD HEADER
======================================================
*/

const headers =
    await this.service.getAll();

/*
======================================================
LOAD DETAIL EACH JOURNAL
======================================================
*/

const result = await Promise.all(

    (headers || []).map(async journal => {

        const fullJournal =
            await this.service.getById(
                journal.id
            );

        return fullJournal;

    })

);
            /*
            ======================================================
            VALIDATE RESULT
            ======================================================
            */

            this.journals =
                Array.isArray(result)
                    ? result
                    : [];

            /*
            ======================================================
            INITIAL FILTER
            ======================================================
            */

            this.filteredJournals =
                [...this.journals];

            /*
            ======================================================
            PAGINATION
            ======================================================
            */

            this.totalRows =
                this.filteredJournals.length;

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
            REFRESH VIEW
            ======================================================
            */

            this.refreshView();

        }

        catch (error) {

            console.error(
                "Failed to load journal.",
                error
            );

            this.journals = [];

            this.filteredJournals = [];

            this.totalRows = 0;

            this.totalPages = 1;

            this.currentPage = 1;

            throw error;

        }

        finally {

            window.App?.hideLoading?.();

        }

    }
/*
==========================================================
REFRESH VIEW
==========================================================
*/

refreshView() {

    /*
    ======================================================
    RECALCULATE PAGINATION
    ======================================================
    */

    this.totalRows =
        this.filteredJournals.length;

    this.totalPages =
        Math.max(
            1,
            Math.ceil(
                this.totalRows /
                this.pageSize
            )
        );

    /*
    ======================================================
    VALIDATE CURRENT PAGE
    ======================================================
    */

    if (this.currentPage < 1) {

        this.currentPage = 1;

    }

    if (this.currentPage > this.totalPages) {

        this.currentPage =
            this.totalPages;

    }

    /*
    ======================================================
    RENDER TABLE
    ======================================================
    */

    this.renderTable();

    /*
    ======================================================
    UPDATE PAGINATION
    ======================================================
    */

    this.updatePagination();

}
/*
==========================================================
RENDER TABLE
==========================================================
*/

renderTable() {

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
    CLEAR TABLE
    ======================================================
    */

    this.tableBody.innerHTML = "";

    /*
    ======================================================
    PAGINATION
    ======================================================
    */

    const start =
        (this.currentPage - 1) *
        this.pageSize;

    const end =
        start + this.pageSize;

    const journals =
        this.filteredJournals.slice(
            start,
            end
        );

    /*
    ======================================================
    EMPTY DATA
    ======================================================
    */

    if (journals.length === 0) {

        this.tableBody.innerHTML = `

            <tr>

                <td colspan="8"
                    class="text-center text-muted py-5">

                    No General Journal found.

                </td>

            </tr>

        `;

        return;

    }

    /*
    ======================================================
    RENDER ROW
    ======================================================
    */

    journals.forEach(

    (journal, index) => {

        this.tableBody.insertAdjacentHTML(

            "beforeend",

            this.createTableRow(

                journal,

                start + index + 1

            )

        );

    }

);

}
/*
==========================================================
CREATE TABLE ROW
==========================================================
*/

createTableRow(journal, rowNumber) {

    return `

        <tr>

            <!-- ==========================================
                 NO
            =========================================== -->

            <td class="text-center">

                ${rowNumber}

            </td>

            <!-- ==========================================
                 ACCOUNTING DATE
            =========================================== -->

            <td>

                ${journal.journal_date ?? "-"}

            </td>

            <!-- ==========================================
                 JOURNAL NO
            =========================================== -->

            <td>

                ${journal.journal_no ?? "-"}

            </td>

            <!-- ==========================================
                 DESCRIPTION
            =========================================== -->

            <td>

                ${journal.description ?? "-"}

            </td>

            <!-- ==========================================
                 TOTAL DEBIT
            =========================================== -->

            <td class="text-end">

                ${this.formatCurrency(

                    Number(
                        journal.total_debit ?? 0
                    )

                )}

            </td>

            <!-- ==========================================
                 TOTAL CREDIT
            =========================================== -->

            <td class="text-end">

                ${this.formatCurrency(

                    Number(
                        journal.total_credit ?? 0
                    )

                )}

            </td>

            <!-- ==========================================
                 STATUS
            =========================================== -->

            <td class="text-center">

                ${this.renderStatusBadge(

                    journal.status

                )}

            </td>

            <!-- ==========================================
                 ACTION
            =========================================== -->

            <td class="text-center">

                ${this.renderActionButtons(

                    journal

                )}

            </td>

        </tr>

    `;

}

/*
==========================================================
RENDER STATUS BADGE
==========================================================
*/

renderStatusBadge(status) {

    const value =
        (status || "")
            .toString()
            .trim()
            .toLowerCase();

    /*
    ======================================================
    POSTED
    ======================================================
    */

    if (value === "posted") {

        return `
            <span class="badge bg-success">
                Posted
            </span>
        `;

    }

    /*
    ======================================================
    VOID
    ======================================================
    */

    if (value === "void") {

        return `
            <span class="badge bg-danger">
                Void
            </span>
        `;

    }

    /*
    ======================================================
    DRAFT
    ======================================================
    */

    return `
        <span class="badge bg-secondary">
            Draft
        </span>
    `;

}
/*
==========================================================
RENDER ACTION BUTTONS
==========================================================
*/

renderActionButtons(journal) {

    const status =
        (journal.status || "")
            .toString()
            .trim()
            .toLowerCase();

    /*
    ======================================================
    DRAFT
    ======================================================
    */

    if (status === "draft") {

        return `

            <div class="btn-group btn-group-sm">

                <button
                    type="button"
                    class="btn btn-outline-primary btn-edit-journal"
                    data-id="${journal.id}"
                    title="Edit">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    type="button"
                    class="btn btn-outline-danger btn-delete-journal"
                    data-id="${journal.id}"
                    title="Delete">

                    <i class="fa-solid fa-trash"></i>

                </button>

                <button
                    type="button"
                    class="btn btn-outline-success btn-post-journal"
                    data-id="${journal.id}"
                    title="Post">

                    <i class="fa-solid fa-upload"></i>

                </button>

                <button
                    type="button"
                    class="btn btn-outline-secondary btn-duplicate-journal"
                    data-id="${journal.id}"
                    title="Duplicate">

                    <i class="fa-solid fa-copy"></i>

                </button>
                </button>

                <button
                    type="button"
                    class="btn btn-outline-info btn-voucher-journal"
                    data-id="${journal.id}"
                    title="Voucher">

                    <i class="fa-solid fa-file-lines"></i>

                </button>

            </div>

        `;

    }

    /*
    ======================================================
    POSTED
    ======================================================
    */

    if (status === "posted") {

        return `

            <div class="btn-group btn-group-sm">

                <button
                    type="button"
                    class="btn btn-outline-secondary btn-view-journal"
                    data-id="${journal.id}"
                    title="View">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button
                    type="button"
                    class="btn btn-outline-info btn-voucher-journal"
                    data-id="${journal.id}"
                    title="Voucher">

                    <i class="fa-solid fa-file-lines"></i>

                </button>

                <button
                    type="button"
                    class="btn btn-outline-dark btn-void-journal"
                    data-id="${journal.id}"
                    title="Void">

                    <i class="fa-solid fa-ban"></i>

                </button>

                <button
                    type="button"
                    class="btn btn-outline-secondary btn-duplicate-journal"
                    data-id="${journal.id}"
                    title="Duplicate">

                    <i class="fa-solid fa-copy"></i>

                </button>

            </div>

        `;

    }

    /*
==========================================================
VOID
SAME ACTION AS DRAFT
==========================================================
*/

if (status === "void") {

    return `
        <div class="btn-group btn-group-sm">

            <!-- EDIT -->
            <button
                type="button"
                class="btn btn-outline-primary btn-edit-journal"
                data-id="${journal.id}"
                title="Edit">

                <i class="fa-solid fa-pen"></i>

            </button>

            <!-- DELETE -->
            <button
                type="button"
                class="btn btn-outline-danger btn-delete-journal"
                data-id="${journal.id}"
                title="Delete">

                <i class="fa-solid fa-trash"></i>

            </button>

            <!-- POST -->
            <button
                type="button"
                class="btn btn-outline-success btn-post-journal"
                data-id="${journal.id}"
                title="Post">

                <i class="fa-solid fa-upload"></i>

            </button>

            <!-- DUPLICATE -->
            <button
                type="button"
                class="btn btn-outline-secondary btn-duplicate-journal"
                data-id="${journal.id}"
                title="Duplicate">

                <i class="fa-solid fa-copy"></i>

            </button>

            <!-- VOUCHER -->
            <button
                type="button"
                class="btn btn-outline-info btn-voucher-journal"
                data-id="${journal.id}"
                title="Voucher">

                <i class="fa-solid fa-file-lines"></i>

            </button>

        </div>
    `;

}
}
/*
==========================================================
RENDER DETAIL TABLE
==========================================================
*/

renderDetailTable() {

    if (!this.detailTableBody) {

        return;

    }

    this.detailTableBody.innerHTML = "";

    if (
        !Array.isArray(this.detailLines) ||
        this.detailLines.length === 0
    ) {

        this.detailTableBody.innerHTML = `
            <tr id="journal-empty-row">
                <td colspan="7"
                    class="text-center py-5 text-muted">

                    No journal detail available.

                </td>
            </tr>
        `;

        return;

    }

    this.detailLines.forEach((detail, index) => {

        this.detailTableBody.insertAdjacentHTML(

            "beforeend",

            this.createDetailRow(
                detail,
                index
            )

        );

    });

}
/*
==========================================================
CREATE DETAIL ROW
==========================================================
*/

createDetailRow(detail, index) {

    /*
    ======================================================
    ACCOUNT DISPLAY
    ======================================================
    */

    const debitAccount =

        detail.debit_account_code && detail.debit_account_name

            ? `${detail.debit_account_code} - ${detail.debit_account_name}`

            : (

                detail.debit_account_name ||

                detail.debit_account ||

                "-"

            );

    const creditAccount =

        detail.credit_account_code && detail.credit_account_name

            ? `${detail.credit_account_code} - ${detail.credit_account_name}`

            : (

                detail.credit_account_name ||

                detail.credit_account ||

                "-"

            );

    /*
    ======================================================
    BUSINESS PARTNER
    ======================================================
    */

    const businessPartner =

        detail.business_partner_name ||

        detail.bp_name ||

        "-";

    /*
    ======================================================
    AMOUNT
    ======================================================
    */

    const amount =

        Number(detail.amount || 0);

    /*
    ======================================================
    RETURN
    ======================================================
    */

    return `

        <tr data-index="${index}">

            <td class="text-center">

                ${index + 1}

            </td>

            <td>

                ${detail.description || "-"}

            </td>

            <td>

                ${debitAccount}

            </td>

            <td>

                ${creditAccount}

            </td>

            <td class="text-end">

                ${this.formatCurrency(amount)}

            </td>

            <td>

                ${businessPartner}

            </td>

            <td class="text-center">

                <div class="btn-group btn-group-sm">

                    <button
                        type="button"
                        class="btn btn-outline-primary btn-edit-detail"
                        data-index="${index}"
                        title="Edit">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        type="button"
                        class="btn btn-outline-danger btn-delete-detail"
                        data-index="${index}"
                        title="Delete">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}
/*
======================================================
CREATE DELETE JOURNAL MODAL
======================================================
*/

createDeleteJournalModal() {

    /*
    ======================================================
    ALREADY EXISTS
    ======================================================
    */

    if (
        document.getElementById(
            "confirmDeleteJournalModal"
        )
    ) {

        return;

    }

    /*
    ======================================================
    CREATE MODAL
    ======================================================
    */

    const modalHtml = `

        <div
            class="modal fade"
            id="confirmDeleteJournalModal"
            tabindex="-1"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            aria-labelledby="confirmDeleteJournalModalLabel"
            aria-hidden="true">

            <div
                class="modal-dialog modal-dialog-centered">

                <div class="modal-content">

                    <!-- HEADER -->

                    <div class="modal-header">

                        <h5
                            class="modal-title"
                            id="confirmDeleteJournalModalLabel">

                            <i
                                class="fa-solid fa-trash-can text-danger me-2">
                            </i>

                            Confirm Delete Journal

                        </h5>

                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close">
                        </button>

                    </div>

                    <!-- BODY -->

                    <div class="modal-body">

                        <div
                            class="text-center py-2">

                            <i
                                class="fa-solid fa-trash-can text-danger"
                                style="font-size:42px;">
                            </i>

                        </div>

                        <p
                            class="text-center mb-4">

                            Apakah Anda yakin ingin
                            <strong>menghapus Journal</strong>
                            ini?

                        </p>

                        <table
                            class="table table-bordered table-sm">

                            <tbody>

                                <tr>

                                    <th width="150">

                                        Journal No

                                    </th>

                                    <td
                                        id="delete-journal-no">

                                        -

                                    </td>

                                </tr>

                                <tr>

                                    <th>

                                        Accounting Date

                                    </th>

                                    <td
                                        id="delete-accounting-date">

                                        -

                                    </td>

                                </tr>

                                <tr>

                                    <th>

                                        Description

                                    </th>

                                    <td
                                        id="delete-description">

                                        -

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                        <div
                            class="alert alert-danger">

                            <i
                                class="fa-solid fa-triangle-exclamation me-2">
                            </i>

                            Journal yang dihapus tidak dapat
                            dikembalikan.

                        </div>

                    </div>

                    <!-- FOOTER -->

                    <div
                        class="modal-footer">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            data-bs-dismiss="modal">

                            <i
                                class="fa-solid fa-xmark me-1">
                            </i>

                            Batal

                        </button>

                        <button
                            type="button"
                            id="btn-confirm-delete-journal"
                            class="btn btn-danger">

                            <i
                                class="fa-solid fa-trash-can me-1">
                            </i>

                            Ya, Hapus

                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;

    /*
    ======================================================
    APPEND MODAL
    ======================================================
    */

    document.body.insertAdjacentHTML(

        "beforeend",

        modalHtml

    );

    /*
    ======================================================
    BOOTSTRAP MODAL
    ======================================================
    */

    this.deleteJournalModal =
        new bootstrap.Modal(

            document.getElementById(
                "confirmDeleteJournalModal"
            )

        );

}
/*
==========================================================
SEARCH JOURNAL
==========================================================
*/

search() {

    /*
    ======================================================
    GET FILTER VALUE
    ======================================================
    */

    const keyword =
        (this.filterKeyword?.value || "")
            .trim()
            .toLowerCase();

    const findBy =
        this.filterFindBy?.value || "";

    /*
======================================================
DEBUG SEARCH
======================================================
*/

console.log("FIND BY :", findBy);
console.log("KEYWORD :", keyword);
console.log(
    "DATA DETAIL :",
    JSON.stringify(
        this.journals[0],
        null,
        2
    )
);

    const status =
        this.filterStatus?.value || "";
    
    const dateFrom =
        this.filterDateFrom?.value || "";

    const dateTo =
        this.filterDateTo?.value || "";
    console.log("STATUS :", status);
    console.log("DATE FROM :", dateFrom);
    console.log("DATE TO :", dateTo);


    /*
    ======================================================
    FILTER DATA
    ======================================================
    */

    this.filteredJournals =
        this.journals.filter(

            (journal) => {

                /*
                ==========================================
                STATUS
                ==========================================
                */
                console.log({
    journalNo: journal.journal_no,
    journalStatus: journal.status,
    filterStatus: status,
    journalDate: journal.journal_date
});
                if (

                status &&
                status !== "all" &&

                (journal.status || "")
                    .toLowerCase() !==
                status.toLowerCase()

            ) {

                return false;

            }
                            /*
                ==========================================
                DATE FROM
                ==========================================
                */

                if (
                    dateFrom &&
                    journal.journal_date < dateFrom
                ) {

                    return false;

                }

                /*
                ==========================================
                DATE TO
                ==========================================
                */

                if (
                    dateTo &&
                    journal.journal_date > dateTo
                ) {

                    return false;

                }

                /*
                ==========================================
                KEYWORD
                ==========================================
                */

                if (!keyword) {

                    return true;

                }
                console.log(
                "COMPARE :",
                journal.journal_no,
                journal.description
            );

                /*
                ==========================================
                SEARCH BY FIELD
                ==========================================
                */
console.log(
    "FIND BY =",
    `"${findBy}"`
);

console.log(
    "KEYWORD =",
    `"${keyword}"`
);
                switch (findBy) {

                    case "journal_no":

    console.log(
        "COMPARE JOURNAL NO :",
        journal.journal_no
    );

    return (
        journal.journal_no || ""
    )
    .toLowerCase()
    .includes(keyword);


                case "description":

                    return (

                        journal.description ||

                        journal.journal_description ||

                        journal.memo ||

                        journal.remark ||

                        ""

                    )
                    .toString()
                    .toLowerCase()
                    .includes(keyword);
                    case "status":

                        return (
                            journal.status || ""
                        )
                        .toLowerCase()
                        .includes(keyword);

                    default:

                       return [

                        journal.journal_no,

                        journal.journal_number,

                        journal.document_no,

                        journal.description,

                        journal.journal_description,

                        journal.memo,

                        journal.remark,

                        journal.status

                    ]

                        .join(" ")

                        .toLowerCase()

                        .includes(keyword);

                }

            }

        );
        console.log(
    "FILTER RESULT :",
    this.filteredJournals
);
        

    /*
    ======================================================
    RESET PAGE
    ======================================================
    */

    this.currentPage = 1;

    /*
    ======================================================
    REFRESH VIEW
    ======================================================
    */

    this.refreshView();

}
/*
==========================================================
HANDLE TABLE ACTION
==========================================================
*/

handleTableAction(event) {

    /*
    ======================================================
    BUTTON
    ======================================================
    */

    const button =

        event.target.closest("button");

    if (!button) {

        return;

    }

    /*
    ======================================================
    JOURNAL ID
    ======================================================
    */

    const id =

        button.dataset.id;

    if (!id) {

        return;

    }

    /*
    ======================================================
    EDIT
    ======================================================
    */

    if (

        button.classList.contains(

            "btn-edit-journal"

        )

    ) {

        this.openEditJournal(id);

        return;

    }

    /*
    ======================================================
    DELETE
    ======================================================
    */

    if (

    button.classList.contains(

        "btn-delete-journal"

    )

) {

    this.showDeleteJournalModal(id);

    return;

}

    /*
    ======================================================
    POST
    ======================================================
    */

    if (

        button.classList.contains(

            "btn-post-journal"

        )

    ) {

        this.postJournal(id);

        return;

    }

    /*
    ======================================================
    DUPLICATE
    ======================================================
    */

    if (

        button.classList.contains(

            "btn-duplicate-journal"

        )

    ) {

        this.duplicateJournal(id);

        return;

    }

    /*
    ======================================================
    VIEW
    ======================================================
    */

    if (

        button.classList.contains(

            "btn-view-journal"

        )

    ) {

        this.openViewJournal(id);

        return;

    }

    /*
    ======================================================
    VOUCHER
    ======================================================
    */

    if (

        button.classList.contains(

            "btn-voucher-journal"

        )

    ) {

        this.openVoucher(id);

        return;

    }

    /*
    ======================================================
    VOID
    ======================================================
    */

    if (

        button.classList.contains(

            "btn-void-journal"

        )

    ) {

        this.voidJournal(id);

        return;

    }

}
/*
==========================================================
OPEN ADD JOURNAL
==========================================================
*/

async openAddJournal() {

    /*
    ======================================================
    MODE
    ======================================================
    */

    this.currentMode = "add";

    this.currentJournal = null;

    /*
    ======================================================
    RESET DETAIL
    ======================================================
    */

    this.detailLines = [];

    /*
    ======================================================
    PREPARE FORM
    ======================================================
    */

    this.clearJournalForm();

    /*
    ======================================================
    LOAD MASTER
    ======================================================
    */

    await this.loadMasterData();

    /*
    ======================================================
    INITIALIZE HEADER
    ======================================================
    */

    await this.initializeJournalHeader();

    this.refreshDetailView();

    /*
    ======================================================
    SHOW MODAL
    ======================================================
    */

    this.modal.show();

}
/*
==========================================================
CLEAR JOURNAL FORM
==========================================================
*/

clearJournalForm() {

    /*
    ======================================================
    HEADER
    ======================================================
    */

    if (this.txtAccountingDate) {

        this.txtAccountingDate.value = "";

    }

    if (this.txtPostingPeriod) {

    this.txtPostingPeriod.value = "";

}

    if (this.txtJournalNo) {

        this.txtJournalNo.value = "";

    }

    if (this.txtDescription) {

        this.txtDescription.value = "";

    }

    if (this.cboStatus) {

    this.cboStatus.value =
        "Draft";

    this.updateJournalHeaderStatus(
        "Draft"
    );

}

    /*
    ======================================================
    DETAIL
    ======================================================
    */

    this.detailLines = [];

    this.renderDetailTable();

    /*
    ======================================================
    SUMMARY
    ======================================================
    */

    this.calculateSummary();

}
/*
==========================================================
GET POSTING PERIOD
==========================================================
*/

getPostingPeriod(dateValue) {

    if (!dateValue) {

        return "";

    }

    /*
    ======================================================
    EXPECTED FORMAT
    YYYY-MM-DD
    ======================================================
    */

    const parts =
        String(dateValue).split("-");

    if (parts.length < 2) {

        return "";

    }

    return `${parts[0]}-${parts[1]}`;

}
/*
==========================================================
INITIALIZE JOURNAL HEADER
==========================================================
*/

async initializeJournalHeader() {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (
        !this.txtJournalNo ||
        !this.txtAccountingDate ||
        !this.cboStatus
    ) {

        return;

    }

    /*
    ======================================================
    ADD MODE
    ======================================================
    */

    if (this.currentMode === "add") {

        /*
        ==================================================
        DOCUMENT NUMBER
        ==================================================
        */

        this.txtJournalNo.value =
            await this.service.generateDocumentNumber();

        /*
        ==================================================
        ACCOUNTING DATE
        ==================================================
        */

        this.txtAccountingDate.value =
         new Date()
        .toISOString()
        .substring(0, 10);


        /*
        ======================================================
        POSTING PERIOD
        ======================================================
        */

        if (this.txtPostingPeriod) {

            this.txtPostingPeriod.value =
                this.getPostingPeriod(
                    this.txtAccountingDate.value
                );

        }


        this.cboStatus.value =
            "Draft";

        return;

    }

    /*
    ======================================================
    EDIT MODE
    ======================================================
    */

    if (!this.currentJournal) {

        return;

    }

    /*
    ======================================================
    DOCUMENT NUMBER
    ======================================================
    */

    this.txtJournalNo.value =
        this.currentJournal.journal_no ?? "";

    /*
    ======================================================
    ACCOUNTING DATE
    ======================================================
    */

    this.txtAccountingDate.value =
        this.currentJournal.journal_date ?? "";


        /*
    ======================================================
    POSTING PERIOD
    ======================================================
    */

    if (this.txtPostingPeriod) {

        this.txtPostingPeriod.value =

            this.currentJournal.posting_period ||

            this.getPostingPeriod(
                this.currentJournal.journal_date
            );

    }

    /*
    ======================================================
    DESCRIPTION
    ======================================================
    */

    if (this.txtDescription) {

        this.txtDescription.value =
            this.currentJournal.description ?? "";

    }

    /*
======================================================
STATUS
======================================================
*/

if (this.cboStatus) {

    const status =
        this.currentJournal.status ?? "Draft";

    this.cboStatus.value =
        status;

    this.updateJournalHeaderStatus(
        status
    );

}

}
/*
==========================================================
LOAD MASTER DATA
==========================================================
*/

async loadMasterData() {

    try {

        /*
        ======================================================
        LOAD CHART OF ACCOUNTS
        ======================================================
        */

        await this.loadCOA();

        /*
        ======================================================
        LOAD BUSINESS PARTNERS
        ======================================================
        */

        await this.loadBusinessPartners();

        /*
        ======================================================
        LOAD SUCCESS
        ======================================================
        */

        console.log(

            "Master Data Loaded",

            {

                coa:
                    this.coaList.length,

                businessPartners:
                    this.businessPartnerList.length

            }

        );

    }

    catch (error) {

        console.error(

            "Failed to load master data.",

            error

        );

        throw error;

    }

}
/*
==========================================================
OPEN EDIT JOURNAL
==========================================================
*/

async openEditJournal(id) {

    console.log("OPEN EDIT :", id);

    if (!id) {

        return;

    }

    this.currentMode = "edit";

    console.log("1. Load Master");

    await this.loadMasterData();

    console.log("2. Load Journal");

    await this.loadJournal(id);

    console.log("3. Fill Form");

    this.fillJournalForm();

    console.log("4. Show Modal");

    this.modal.show();

    console.log("5. ReadOnly");

    this.setJournalReadOnly(false);

}
/*
==========================================================
LOAD JOURNAL
==========================================================
*/

async loadJournal(id) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!id) {
        throw new Error(
            "Journal ID is required."
        );
    }

    /*
    ======================================================
    LOAD JOURNAL HEADER
    ======================================================
    */

    const journal =
        await this.service.getById(id);

    if (!journal) {
        throw new Error(
            "Journal not found."
        );
    }

    /*
    ======================================================
    STORE HEADER
    ======================================================
    */

    this.currentJournal =
        journal;

    /*
    ======================================================
    LOAD JOURNAL DETAIL DIRECTLY
    ======================================================
    */

    const {
        data: databaseDetails,
        error: detailError
    } = await supabase

        .from(
            TABLE.GL_JOURNAL_DETAIL
        )

        .select(`
            *,
            mst_chart_of_accounts(
                account_code,
                account_name
            ),
            mst_business_partner(
                bp_name
            )
        `)

        .eq(
            "journal_id",
            id
        )

        .order(
            "line_no",
            {
                ascending: true
            }
        );

    /*
    ======================================================
    DETAIL ERROR
    ======================================================
    */

    if (detailError) {
        console.error(
            "LOAD JOURNAL DETAIL ERROR:",
            detailError
        );

        throw detailError;
    }

    /*
    ======================================================
    CONVERT DETAIL
    ======================================================
    */

    this.detailLines =
        this.convertDatabaseDetail(
            databaseDetails || []
        );

    /*
    ======================================================
    DEBUG
    ======================================================
    */

    console.log(
        "JOURNAL HEADER:",
        journal
    );

    console.log(
        "DATABASE DETAILS:",
        databaseDetails
    );

    console.log(
        "CONVERTED DETAIL LINES:",
        this.detailLines
    );

    /*
    ======================================================
    RENDER
    ======================================================
    */

    this.renderDetailTable();

    this.calculateSummary();

}

/*
==========================================================
FILL JOURNAL FORM
==========================================================
*/

fillJournalForm() {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!this.currentJournal) {

        return;

    }


    /*
    ======================================================
    JOURNAL NO
    ======================================================
    */

    if (this.txtJournalNo) {

        this.txtJournalNo.value =
            this.currentJournal.journal_no ?? "";

    }


    /*
    ======================================================
    ACCOUNTING DATE
    ======================================================
    */

    if (this.txtAccountingDate) {

        this.txtAccountingDate.value =
            this.currentJournal.journal_date ?? "";

    }


    /*
    ======================================================
    POSTING PERIOD
    ======================================================
    */

    if (this.txtPostingPeriod) {

        this.txtPostingPeriod.value =

            this.currentJournal.posting_period ||

            this.getPostingPeriod(
                this.currentJournal.journal_date
            );

    }


    /*
    ======================================================
    DESCRIPTION
    ======================================================
    */

    if (this.txtDescription) {

        this.txtDescription.value =
            this.currentJournal.description ?? "";

    }


    /*
======================================================
STATUS
======================================================
*/

const journalStatus =
    this.currentJournal.status ?? "Draft";

if (this.cboStatus) {

    this.cboStatus.value =
        journalStatus;

}

this.updateJournalHeaderStatus(
    journalStatus
);

    /*
    ======================================================
    REFRESH DETAIL
    ======================================================
    */

    this.refreshDetailView();

}
    /*
    ==========================================================
    VALIDATE JOURNAL
    ==========================================================
    */

    validateJournal(status = "Draft") {

    /*
    ======================================================
    ACCOUNTING DATE
    ======================================================
    */

    if (!this.txtAccountingDate?.value) {

        window.App?.showError?.(
            "Accounting Date is required."
        );

        this.txtAccountingDate?.focus();

        return false;

    }
    

    /*
    ======================================================
    DESCRIPTION
    ======================================================
    */

    if (!this.txtDescription?.value.trim()) {

        window.App?.showError?.(
            "Description is required."
        );

        this.txtDescription?.focus();

        return false;

    }

    /*
==========================================================
DETAIL VALIDATION
==========================================================
*/

// Draft boleh disimpan tanpa detail
if (
    this.detailLines.length === 0 &&
    this.currentSaveStatus !== "Draft"
) {

    window.App?.showError?.(
        "Please add at least one journal detail."
    );

    return false;
}

    /*
    ======================================================
    VALIDATE EACH DETAIL
    ======================================================
    */

    for (const line of this.detailLines) {

        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        if (!line.description?.trim()) {

            window.App?.showError?.(
                "Every detail line must have a description."
            );

            return false;

        }

        /*
==================================================
DEBIT ACCOUNT
==================================================
*/

if (!line.debit_account_id) {

    window.App?.showError?.(
        "Please select Debit Account."
    );

    return false;

}

/*
==================================================
CREDIT ACCOUNT
==================================================
*/

if (!line.credit_account_id) {

    window.App?.showError?.(
        "Please select Credit Account."
    );

    return false;

}

        /*
        ==================================================
        AMOUNT
        ==================================================
        */

        if (Number(line.amount) <= 0) {

            window.App?.showError?.(
                "Amount must be greater than zero."
            );

            return false;

        }

    }

    /*
    ======================================================
    SUCCESS
    ======================================================
    */

    return true;

}
/*
==========================================================
UPDATE JOURNAL HEADER STATUS
==========================================================
*/

updateJournalHeaderStatus(status = "Draft") {

    if (!this.journalHeaderStatus) {

        return;

    }

    const normalizedStatus =
        String(status || "Draft")
            .trim();

    /*
    ======================================================
    TEXT
    ======================================================
    */

    this.journalHeaderStatus.textContent =
        normalizedStatus;

    /*
    ======================================================
    RESET BADGE COLOR
    ======================================================
    */

    this.journalHeaderStatus.classList.remove(
        "bg-primary",
        "bg-success",
        "bg-danger",
        "bg-secondary"
    );

    /*
    ======================================================
    STATUS COLOR
    ======================================================
    */

    switch (normalizedStatus) {

        case "Posted":

            this.journalHeaderStatus.classList.add(
                "bg-success"
            );

            break;

        case "Void":

            this.journalHeaderStatus.classList.add(
                "bg-danger"
            );

            break;

        case "Draft":

        default:

            this.journalHeaderStatus.classList.add(
                "bg-primary"
            );

            break;

    }

}

/*
==========================================================
DELETE JOURNAL
==========================================================
*/

async deleteJournal(id) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!id) {

        return;

    }

    try {

        /*
        ======================================================
        DELETE JOURNAL
        ======================================================
        */

        await this.service.delete(id);

        /*
        ======================================================
        CLOSE DELETE MODAL
        ======================================================
        */

        this.deleteJournalModal.hide();

        /*
        ======================================================
        SUCCESS
        ======================================================
        */

        alert(

            "Journal deleted successfully."

        );

        /*
        ======================================================
        RELOAD DATA
        ======================================================
        */

        await this.loadData();

    }

    catch (error) {

        console.error(

            "DELETE JOURNAL ERROR :",

            error

        );

        alert(

            error.message ||

            "Failed to delete journal."

        );

    }

}
/*
==========================================================
OPEN ADD LINE
==========================================================
*/

openAddLine() {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!this.detailModal) {

        console.error(
            "Detail modal has not been initialized."
        );

        return;

    }

    /*
    ======================================================
    ADD MODE
    ======================================================
    */

    this.detailMode = "add";

    this.currentDetailIndex = -1;

    this.currentDetail = null;

    /*
    ======================================================
    CLEAR FORM
    ======================================================
    */

    this.clearDetailForm();

    /*
    ======================================================
    SHOW MODAL
    ======================================================
    */

    this.detailModal.show();

}
/*
==========================================================
OPEN EDIT LINE
==========================================================
*/

openEditLine(index) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!this.detailModal) {

        console.error(
            "Detail modal has not been initialized."
        );

        return;

    }

    if (

        index < 0 ||

        index >= this.detailLines.length

    ) {

        console.error(
            "Invalid detail line index."
        );

        return;

    }

    /*
    ======================================================
    EDIT MODE
    ======================================================
    */

    this.detailMode = "edit";

    this.currentDetailIndex = index;

    this.currentDetail =
        this.detailLines[index];

    /*
    ======================================================
    FILL FORM
    ======================================================
    */

    this.fillDetailForm();

    /*
    ======================================================
    SHOW MODAL
    ======================================================
    */

    this.detailModal.show();

}
/*
==========================================================
OPEN ADD DETAIL MODAL
==========================================================
*/

async openAddDetailModal() {

    await this.loadDetailModal();

    this.populateCOA();

    this.populateBusinessPartners();

    this.clearDetailForm();

    this.detailMode.value = "add";

    this.detailId.value = "";

    this.currentDetail = null;

    this.currentDetailIndex = -1;

    this.detailModal.show();

}
/*
==========================================================
CLEAR DETAIL FORM
==========================================================
*/

clearDetailForm() {

    if (this.detailId) {

        this.detailId.value = "";

    }

    if (this.detailMode) {

        this.detailMode.value = "add";

    }

    if (this.detailDescription) {

        this.detailDescription.value = "";

    }

    if (this.detailDebitAccount) {

        this.detailDebitAccount.value = "";

    }

    if (this.detailCreditAccount) {

        this.detailCreditAccount.value = "";

    }

    if (this.detailBusinessPartner) {

        this.detailBusinessPartner.value = "";

    }

    if (this.detailAmount) {

        this.detailAmount.value = "0.00";

    }

}
/*
==========================================================
FILL DETAIL FORM
==========================================================
*/

fillDetailForm() {

    if (!this.currentDetail) {
        return;
    }

    this.detailDescription.value =
        this.currentDetail.description ?? "";

    this.detailDebitAccount.value =
        this.currentDetail.debit_account_id ?? "";

    this.detailCreditAccount.value =
        this.currentDetail.credit_account_id ?? "";

    this.detailBusinessPartner.value =
        this.currentDetail.business_partner_id ?? "";

    this.detailAmount.value =
        Number(
            this.currentDetail.amount ?? 0
        ).toFixed(2);

}
/*
==========================================================
COLLECT DETAIL FORM
==========================================================
*/

collectDetailForm() {
    console.log("detailDebitAccount", this.detailDebitAccount);
    console.log("detailCreditAccount", this.detailCreditAccount);
    console.log("detailBusinessPartner", this.detailBusinessPartner);
    /*
    ======================================================
    DEBIT ACCOUNT
    ======================================================
    */

    const debitOption =
        this.detailDebitAccount.selectedOptions[0];

    /*
    ======================================================
    CREDIT ACCOUNT
    ======================================================
    */

    const creditOption =
        this.detailCreditAccount.selectedOptions[0];

    /*
    ======================================================
    BUSINESS PARTNER
    ======================================================
    */

    const bpOption =
        this.detailBusinessPartner.selectedOptions[0];

    /*
    ======================================================
    RETURN
    ======================================================
    */

    return {

        description:

            this.detailDescription.value.trim(),

        debit_account_id:

            this.detailDebitAccount.value,

        debit_account_code:

            debitOption?.dataset.code || "",

        debit_account_name:

            debitOption?.dataset.name || "",

        credit_account_id:

            this.detailCreditAccount.value,

        credit_account_code:

            creditOption?.dataset.code || "",

        credit_account_name:

            creditOption?.dataset.name || "",

        business_partner_id:

            this.detailBusinessPartner.value || null,

        business_partner_name:

            bpOption?.text || "",

        amount:

            Number(
                this.detailAmount.value || 0
            )

    };

}
/*
==========================================================
SAVE DETAIL LINE
==========================================================
*/

saveDetailLine() {
    

     /*
    ======================================================
    COLLECT FORM
    ======================================================
    */

    const detail = this.collectDetailForm();

    console.log("DETAIL SAVE", detail);

    if (!detail) {

        return;

    }

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!detail.description) {

        window.App?.showError?.(
            "Description is required."
        );

        this.detailDescription?.focus();

        return;

    }

    if (!detail.debit_account_id) {

        window.App?.showError?.(
            "Please select Debit Account."
        );

        this.detailDebitAccount?.focus();

        return;

    }

    if (!detail.credit_account_id) {

        window.App?.showError?.(
            "Please select Credit Account."
        );

        this.detailCreditAccount?.focus();

        return;

    }

    if (

        detail.debit_account_id ===
        detail.credit_account_id

    ) {

        window.App?.showError?.(

            "Debit Account and Credit Account cannot be the same."

        );

        this.detailCreditAccount?.focus();

        return;

    }

    if (

        Number(detail.amount) <= 0

    ) {

        window.App?.showError?.(

            "Amount must be greater than zero."

        );

        this.detailAmount?.focus();

        return;

    }

    /*
    ======================================================
    ADD / UPDATE
    ======================================================
    */

    if (

        this.detailMode.value === "add"

    ) {

        this.detailLines.push(detail);

    }
    else {

        const index =

            Number(
                this.detailId.value
            );

        if (

            index >= 0 &&
            index < this.detailLines.length

        ) {

            this.detailLines[index] = detail;

        }

    }
        console.table(this.detailLines);

    /*
    ======================================================
    REFRESH TABLE
    ======================================================
    */

    this.refreshDetailView();

    /*
    ======================================================
    CLOSE MODAL
    ======================================================
    */

    this.detailModal.hide();

}
/*
==========================================================
DELETE DETAIL LINE
==========================================================
*/

deleteDetailLine(index) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (

        index < 0 ||

        index >= this.detailLines.length

    ) {

        return;

    }

    /*
    ======================================================
    CONFIRM DELETE
    ======================================================
    */

    const confirmed = window.confirm(

        "Are you sure you want to delete this journal detail?"

    );

    if (!confirmed) {

        return;

    }

    /*
    ======================================================
    DELETE DETAIL
    ======================================================
    */

    this.detailLines.splice(

        index,

        1

    );

    this.refreshDetailView();

}
/*
==========================================================
RENDER TABLE
==========================================================
*/

renderTable() {

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
    CLEAR TABLE
    ======================================================
    */

    this.tableBody.innerHTML = "";

    /*
    ======================================================
    PAGINATION
    ======================================================
    */

    const start =
        (this.currentPage - 1) *
        this.pageSize;

    const end =
        start + this.pageSize;

    const journals =
        this.filteredJournals.slice(
            start,
            end
        );

    /*
    ======================================================
    EMPTY DATA
    ======================================================
    */

    if (journals.length === 0) {

        this.tableBody.innerHTML = `

            <tr>

                <td colspan="8"
                    class="text-center text-muted py-5">

                    No General Journal found.

                </td>

            </tr>

        `;

        return;

    }

    /*
    ======================================================
    RENDER ROW
    ======================================================
    */

    journals.forEach(

        (journal, index) => {

            this.tableBody.insertAdjacentHTML(

                "beforeend",

                this.createTableRow(

                    journal,

                    start + index + 1

                )

            );

        }

    );

}
/*
==========================================================
FORMAT CURRENCY
==========================================================
*/

formatCurrency(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(
        Number(value || 0)
    );

}

/*
==========================================================
HANDLE DETAIL TABLE ACTION
==========================================================
*/

handleDetailTableAction(event) {

    const button =
        event.target.closest("button");

    if (!button) {

        return;

    }

    const index =
        Number(button.dataset.index);

    /*
    ======================================================
    EDIT
    ======================================================
    */

    if (

        button.classList.contains(
            "btn-edit-detail"
        )

    ) {

        this.openEditDetailModal(index);

        return;

    }

    /*
    ======================================================
    DELETE
    ======================================================
    */

    if (

        button.classList.contains(
            "btn-delete-detail"
        )

    ) {

        this.deleteDetail(index);

        return;

    }

}
/*
==========================================================
UPDATE PAGINATION
==========================================================
*/

updatePagination() {

    /*
    ======================================================
    TOTAL PAGE
    ======================================================
    */

    this.totalPages = Math.max(

        1,

        Math.ceil(

            this.totalRows /

            this.pageSize

        )

    );

    /*
    ======================================================
    CURRENT PAGE
    ======================================================
    */

    this.currentPage = Math.min(

        Math.max(this.currentPage, 1),

        this.totalPages

    );

    /*
    ======================================================
    PAGE INPUT
    ======================================================
    */

    if (this.currentPageInput) {

        this.currentPageInput.value =
            this.currentPage;

    }

    /*
    ======================================================
    TOTAL PAGE LABEL
    ======================================================
    */

    if (this.totalPageLabel) {

        this.totalPageLabel.textContent =
            `of ${this.totalPages}`;

    }

    /*
    ======================================================
    RECORD INFORMATION
    ======================================================
    */

    if (this.displayRecord) {

        const start =

            this.totalRows === 0

                ? 0

                : ((this.currentPage - 1) * this.pageSize) + 1;

        const end =

            Math.min(

                this.currentPage * this.pageSize,

                this.totalRows

            );

        this.displayRecord.textContent =

            `Records ${start} - ${end} of ${this.totalRows}`;

    }

    /*
    ======================================================
    BUTTON STATE
    ======================================================
    */

    const firstPage =
        this.currentPage === 1;

    const lastPage =
        this.currentPage === this.totalPages;

    this.btnFirstPage.disabled =
        firstPage;

    this.btnPreviousPage.disabled =
        firstPage;

    this.btnNextPage.disabled =
        lastPage;

    this.btnLastPage.disabled =
        lastPage;

}
/*
==========================================================
FIRST PAGE
==========================================================
*/

firstPage() {

    if (this.currentPage === 1) {

        return;

    }

    this.currentPage = 1;

    this.refreshView();

}
/*
==========================================================
PREVIOUS PAGE
==========================================================
*/

previousPage() {

    if (this.currentPage <= 1) {

        return;

    }

    this.currentPage--;

    this.refreshView();

}
/*
==========================================================
NEXT PAGE
==========================================================
*/

nextPage() {

    if (this.currentPage >= this.totalPages) {

        return;

    }

    this.currentPage++;

    this.refreshView();

}

/*
==========================================================
LAST PAGE
==========================================================
*/

lastPage() {

    if (this.currentPage === this.totalPages) {

        return;

    }

    this.currentPage =
        this.totalPages;

    this.refreshView();

}
/*
==========================================================
GO TO PAGE
==========================================================
*/

goToPage() {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!this.currentPageInput) {

        return;

    }

    /*
    ======================================================
    GET PAGE
    ======================================================
    */

    let page = Number(

        this.currentPageInput.value

    );

    if (isNaN(page)) {

        page = 1;

    }

    /*
    ======================================================
    LIMIT
    ======================================================
    */

    page = Math.max(

        1,

        Math.min(

            page,

            this.totalPages

        )

    );

    /*
    ======================================================
    REFRESH
    ======================================================
    */

    this.currentPage = page;

    this.refreshView();

}
/*
==========================================================
LOAD CHART OF ACCOUNTS
==========================================================
*/

async loadCOA() {

    try {

        const { data, error } =
            await supabase

                .from(TABLE.CHART_OF_ACCOUNTS)

                .select(`
                    id,
                    account_code,
                    account_name,
                    allow_transaction,
                    status
                `)

                .eq("status", true)

                .eq("allow_transaction", true)

                .order("account_code");

        if (error) {

            throw error;

        }

        this.coaList =
            Array.isArray(data)
                ? data
                : [];

        this.populateCOA();

    }

    catch (error) {

        console.error(

            "Failed to load Chart Of Accounts.",

            error

        );

        this.coaList = [];

    }

}
/*
==========================================================
POPULATE CHART OF ACCOUNTS
==========================================================
*/

populateCOA() {

    if (

        !this.detailDebitAccount ||

        !this.detailCreditAccount

    ) {

        return;

    }

    /*
    ======================================================
    RESET
    ======================================================
    */

    this.detailDebitAccount.innerHTML = `
        <option value="">
            -- Select Debit Account --
        </option>
    `;

    this.detailCreditAccount.innerHTML = `
        <option value="">
            -- Select Credit Account --
        </option>
    `;

    /*
    ======================================================
    OPTION
    ======================================================
    */

    this.coaList.forEach(account => {

        const option = `

            <option
                value="${account.id}"
                data-code="${account.account_code}"
                data-name="${account.account_name}">

                ${account.account_code}
                :: ${account.account_name}

            </option>

        `;

        this.detailDebitAccount.insertAdjacentHTML(

            "beforeend",

            option

        );

        this.detailCreditAccount.insertAdjacentHTML(

            "beforeend",

            option

        );

    });

}
/*
==========================================================
LOAD BUSINESS PARTNERS
==========================================================
*/

async loadBusinessPartners() {

    try {

        const { data, error } =
            await supabase

                .from(TABLE.BUSINESS_PARTNER)

                .select(`
                    id,
                    bp_code,
                    bp_name,
                    status
                `)

                .eq("status", true)

                .order("bp_name");

        if (error) {

            throw error;

        }

        this.businessPartnerList =
            Array.isArray(data)
                ? data
                : [];

        this.populateBusinessPartners();

    }

    catch (error) {

        console.error(

            "Failed to load Business Partner.",

            error

        );

        this.businessPartnerList = [];

    }

}
/*
==========================================================
POPULATE BUSINESS PARTNERS
==========================================================
*/

populateBusinessPartners() {

    if (!this.detailBusinessPartner) {

        return;

    }

    this.detailBusinessPartner.innerHTML = `

        <option value="">

            -- Optional --

        </option>

    `;

    this.businessPartnerList.forEach(bp => {

        this.detailBusinessPartner.insertAdjacentHTML(

            "beforeend",

            `

            <option value="${bp.id}">

                ${bp.bp_code}
                :: ${bp.bp_name}

            </option>

            `

        );

    });

}
/*
==========================================================
REFRESH DETAIL VIEW
==========================================================
*/

refreshDetailView() {

    this.renderDetailTable();

    this.calculateSummary();

}
/*
==========================================================
RESET DETAIL STATE
==========================================================
*/

resetDetailState() {

    this.detailMode = "add";

    this.currentDetail = null;

    this.currentDetailIndex = -1;

}
/*
==========================================================
SET READ ONLY
==========================================================
*/

setReadOnly(readOnly = true) {

    [
        this.txtAccountingDate,
        this.txtDescription

    ].forEach(control => {

        if (control) {

            control.readOnly = readOnly;

        }

    });

    [
        this.btnAddLine,
        this.btnSaveJournal,
        this.btnPostJournal

    ].forEach(button => {

        if (button) {

            button.disabled = readOnly;

        }

    });

}
/*
==========================================================
OPEN VIEW JOURNAL
==========================================================
*/

async openViewJournal(id) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!id) {

            return;

        }

        /*
        ======================================================
        OPEN EDIT MODE
        ======================================================
        */

        await this.openEditJournal(id);

        /*
        ======================================================
        MODE
        ======================================================
        */

        this.currentMode = "view";

        /*
        ======================================================
        SET READ ONLY
        ======================================================
        */

        this.setJournalReadOnly(true);

    }

    catch (error) {

        console.error(

            "Open View Journal Error",

            error

        );

        alert(

            error.message

        );

    }

}
/*
==========================================================
SET JOURNAL READ ONLY
==========================================================
*/

setJournalReadOnly(readOnly = true) {

    /*
    ======================================================
    HEADER
    ======================================================
    */

    [
    "journal-accounting-date",
    "journal-posting-period",
    "journal-reference-no",
    "journal-description"
    ]
    
    .forEach(id => {

        const element =

            document.getElementById(id);

        if (!element) {

            return;

        }

        element.disabled = readOnly;

        element.readOnly = readOnly;

    });

    /*
    ======================================================
    BUTTON
    ======================================================
    */

    const btnAddLine =

        document.getElementById(

            "btn-add-line"

        );

    if (btnAddLine) {

        btnAddLine.style.display =

            readOnly

                ? "none"

                : "";

    }

    const btnSave =

        document.getElementById(

            "btn-save-journal"

        );

    if (btnSave) {

        btnSave.style.display =

            readOnly

                ? "none"

                : "";

    }

    const btnPost =

        document.getElementById(

            "btn-post-journal"

        );

    if (btnPost) {

        btnPost.style.display =

            readOnly

                ? "none"

                : "";

    }

    /*
    ======================================================
    DETAIL ACTION
    ======================================================
    */

    document

        .querySelectorAll(

            ".btn-edit-detail, .btn-delete-detail"

        )

        .forEach(button => {

            button.style.display =

                readOnly

                    ? "none"

                    : "";

        });

}
/*
==========================================================
PREVIEW HTML
==========================================================
*/

previewHTML() {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!this.filteredJournals.length) {

    this.showError(
        "No journal available."
    );

    return;

}
console.log("===== PREVIEW DATA =====");

console.log(this.filteredJournals);

console.log(
    this.filteredJournals[0]
);

console.log(
    this.filteredJournals[0]?.details
);

    /*
    ======================================================
    BUILD ROWS
    ======================================================
    */

    const rows = [];

this.filteredJournals.forEach(journal => {

    (journal.details || []).forEach(detail => {

        rows.push(`

            <tr>

                <td>${journal.journal_date ?? "-"}</td>

                <td>${journal.journal_no ?? "-"}</td>

                <td>

                    ${detail.mst_chart_of_accounts?.account_code ?? "-"}

                </td>

                <td>

                    ${detail.mst_chart_of_accounts?.account_name ?? "-"}

                </td>

                <td>

                    ${detail.description ?? "-"}

                </td>

                <td style="text-align:right">

                    ${this.formatCurrency(detail.debit)}

                </td>

                <td style="text-align:right">

                    ${this.formatCurrency(detail.credit)}

                </td>

            </tr>

        `);

    });

});

    PreviewService.open({

        title: "General Journal",

        subtitle: "Accounting / General Journal",

       columns: [

    "Accounting Date",

    "Journal No",

    "Account Code",

    "Account Name",

    "Description",

    "Debit",

    "Credit"

],

        rows

    });

}
/*
==========================================================
EXPORT EXCEL
==========================================================
*/

async exportExcel() {

    if (!this.filteredJournals.length) {

        window.App?.showWarning?.(

            "No journal available."

        );

        return;

    }

    console.log(

        "EXPORT DATA :",

        this.filteredJournals

    );
    /*
==========================================================
BUILD EXPORT DATA
==========================================================
*/

const exportData = [];

this.filteredJournals.forEach(journal => {

    (journal.details || []).forEach(detail => {

        exportData.push({

            "Accounting Date": journal.journal_date,

            "Journal No": journal.journal_no,

            "Account Code": detail.mst_chart_of_accounts?.account_code ?? "",

            "Account Name": detail.mst_chart_of_accounts?.account_name ?? "",

            "Description": detail.description ?? "",

            "Debit": detail.debit ?? 0,

            "Credit": detail.credit ?? 0,

            "Status": journal.status

        });

    });

});

/*
==========================================================
EXPORT TO EXCEL
==========================================================
*/

ExcelExportService.export(

    exportData,

    "General Journal",

    "General Journal"

);

}

/*
==========================================================
CALCULATE SUMMARY
==========================================================
*/

calculateSummary() {

    if (!Array.isArray(this.detailLines)) {

        this.detailLines = [];

    }

    let totalAmount = 0;

    this.detailLines.forEach(line => {

        totalAmount +=
            Number(line.amount || 0);

    });

    totalAmount =
    Math.round(totalAmount);

    this.summary = {

        totalLine:
            this.detailLines.length,

        totalDebit:
            totalAmount,

        totalCredit:
            totalAmount,

        difference:
            0,

        isBalanced:
            true

    };

    console.log(
        "JOURNAL SUMMARY :",
        this.summary
    );

    this.updateSummaryDisplay();

}


/*
==========================================================
UPDATE SUMMARY DISPLAY
==========================================================
*/

updateSummaryDisplay() {

    if (!this.summary) {

        return;

    }

    /*
    ======================================================
    TOTAL LINE
    ======================================================
    */

    if (this.summaryTotalLine) {

        this.summaryTotalLine.value =
            this.summary.totalLine;

        this.summaryTotalLine.textContent =
            this.summary.totalLine;

    }

    /*
    ======================================================
    TOTAL AMOUNT
    ======================================================
    */

    if (this.summaryTotalAmount) {

        const amount =
            this.formatCurrency(
                this.summary.totalDebit
            );

        this.summaryTotalAmount.value =
            amount;

        this.summaryTotalAmount.textContent =
            amount;

    }

}
/*
==========================================================
SAVE DETAIL
==========================================================
*/

saveDetail(detail) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!detail) {

        console.error(
            "Detail data is required."
        );

        return false;

    }

    /*
    ======================================================
    DEFAULT VALUE
    ======================================================
    */

    detail.debit = Number(
        detail.debit ?? 0
    );

    detail.credit = Number(
        detail.credit ?? 0
    );

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (

        detail.debit < 0 ||

        detail.credit < 0

    ) {

        alert(
            "Debit / Credit cannot be negative."
        );

        return false;

    }

    if (

        detail.debit > 0 &&

        detail.credit > 0

    ) {

        alert(
            "Only Debit or Credit may contain a value."
        );

        return false;

    }

    if (

        detail.debit === 0 &&

        detail.credit === 0

    ) {

        alert(
            "Debit or Credit must be greater than zero."
        );

        return false;

    }

    /*
    ======================================================
    EDIT / ADD
    ======================================================
    */

    if (

        Number.isInteger(
            this.editDetailIndex
        ) &&

        this.editDetailIndex >= 0

    ) {

        this.detailLines[
            this.editDetailIndex
        ] = detail;

    }

    else {

        this.detailLines.push(
            detail
        );

    }

    /*
    ======================================================
    RESET EDIT INDEX
    ======================================================
    */

    this.editDetailIndex = -1;

    /*
    ======================================================
    REFRESH
    ======================================================
    */

    this.renderDetailTable();

    this.calculateSummary();

    return true;

}
/*
==========================================================
COLLECT DETAIL FORM
==========================================================
*/

collectDetailForm() {

    /*
    ======================================================
    DEBIT ACCOUNT
    ======================================================
    */

    const debitOption =
        this.detailDebitAccount?.selectedOptions?.[0];

    /*
    ======================================================
    CREDIT ACCOUNT
    ======================================================
    */

    const creditOption =
        this.detailCreditAccount?.selectedOptions?.[0];

    /*
    ======================================================
    BUSINESS PARTNER
    ======================================================
    */

    const bpOption =
        this.detailBusinessPartner?.selectedOptions?.[0];

    /*
    ======================================================
    RETURN
    ======================================================
    */

    return {

        description:
            this.detailDescription?.value.trim() || "",

        debit_account_id:
            this.detailDebitAccount?.value || "",

        debit_account_code:
            debitOption?.dataset.code || "",

        debit_account_name:
            debitOption?.dataset.name || "",

        credit_account_id:
            this.detailCreditAccount?.value || "",

        credit_account_code:
            creditOption?.dataset.code || "",

        credit_account_name:
            creditOption?.dataset.name || "",

        amount:
            Number(
                this.detailAmount?.value || 0
            ),

        business_partner_id:
            this.detailBusinessPartner?.value || null,

        business_partner_name:
            bpOption?.dataset.name ||
            bpOption?.text ||
            ""

    };

}

/*
==========================================================
SAVE DETAIL
==========================================================
*/

saveDetail() {

    /*
    ======================================================
    COLLECT DATA
    ======================================================
    */

    const detail =
        this.collectDetailForm();

    if (!detail) {

        return;

    }

    /*
    ======================================================
    MODE
    ======================================================
    */

    const mode =
        this.detailMode?.value || "add";

    /*
    ======================================================
    EDIT
    ======================================================
    */

    if (mode === "edit") {

        const index = Number(

            this.detailId?.value

        );

        if (

            !Number.isNaN(index) &&

            this.detailLines[index]

        ) {

            this.detailLines[index] = detail;

        }

    }

    /*
    ======================================================
    ADD
    ======================================================
    */

    else {

        this.detailLines.push(

            detail

        );

    }

    /*
    ======================================================
    RENDER TABLE
    ======================================================
    */

    this.renderDetailTable();

    /*
    ======================================================
    SUMMARY
    ======================================================
    */

    this.calculateSummary();

    /*
    ======================================================
    CLEAR FORM
    ======================================================
    */

    this.clearDetailForm();

    /*
    ======================================================
    CLOSE MODAL
    ======================================================
    */

    if (this.detailModal) {

        this.detailModal.hide();

    }

}
/*
==========================================================
CLEAR DETAIL FORM
==========================================================
*/

clearDetailForm() {

    if (this.detailId) {

        this.detailId.value = "";

    }

    if (this.detailMode) {

        this.detailMode.value = "add";

    }

    if (this.detailDescription) {

        this.detailDescription.value = "";

    }

    if (this.detailDebitAccount) {

        this.detailDebitAccount.selectedIndex = 0;

    }

    if (this.detailCreditAccount) {

        this.detailCreditAccount.selectedIndex = 0;

    }

    if (this.detailBusinessPartner) {

        this.detailBusinessPartner.selectedIndex = 0;

    }

    if (this.detailAmount) {

        this.detailAmount.value = 0;

    }

}
/*
==========================================================
OPEN EDIT DETAIL MODAL
==========================================================
*/

async openEditDetailModal(index) {

    if (

        index === undefined ||

        index === null ||

        !this.detailLines[index]

    ) {

        return;

    }

    await this.loadDetailModal();

    this.populateCOA();

    this.populateBusinessPartners();

    const detail =

        this.detailLines[index];

    this.detailMode.value = "edit";

    this.detailId.value = index;

    this.detailDescription.value =
        detail.description || "";

    this.detailDebitAccount.value =
        detail.debit_account_id || "";

    this.detailCreditAccount.value =
        detail.credit_account_id || "";

    this.detailAmount.value =
        Number(detail.amount || 0).toFixed(2);

    this.detailBusinessPartner.value =
        detail.business_partner_id || "";

    this.detailModal.show();

}
/*
==========================================================
DELETE DETAIL
==========================================================
*/

deleteDetail(index) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (

        index === undefined ||

        index === null ||

        !Array.isArray(this.detailLines) ||

        !this.detailLines[index]

    ) {

        return;

    }

    /*
    ======================================================
    CONFIRMATION
    ======================================================
    */

    const confirmed = window.confirm(

        "Are you sure you want to delete this journal detail?"

    );

    if (!confirmed) {

        return;

    }

    /*
    ======================================================
    REMOVE DETAIL
    ======================================================
    */

    this.detailLines.splice(

        index,

        1

    );

    /*
    ======================================================
    RENDER TABLE
    ======================================================
    */

    this.renderDetailTable();

    /*
    ======================================================
    RECALCULATE SUMMARY
    ======================================================
    */

    this.calculateSummary();

}
/*
==========================================================
BIND DETAIL MODAL EVENTS
==========================================================
*/

bindDetailModalEvents() {

    /*
    ======================================================
    PREVENT DOUBLE BIND
    ======================================================
    */

    if (this.detailModalEventsBound) {

        return;

    }

    this.detailModalEventsBound = true;

    console.log("BIND DETAIL EVENTS");

    /*
    ======================================================
    SAVE LINE
    ======================================================
    */

    this.btnSaveLine?.addEventListener(

        "click",

        () => {

            console.log("SAVE LINE CLICK");

            this.saveDetailLine();

        }

    );

    /*
    ======================================================
    FORMAT AMOUNT
    ======================================================
    */

    this.detailAmount?.addEventListener(

        "blur",

        () => {

            const amount = Number(

                this.detailAmount.value || 0

            );

            this.detailAmount.value =
                amount.toFixed(2);

        }

    );

    /*
    ======================================================
    ENTER = SAVE
    ======================================================
    */

    this.detailModalElement?.addEventListener(

        "keydown",

        (event) => {

            if (event.key !== "Enter") {

                return;

            }

            if (event.target.tagName === "TEXTAREA") {

                return;

            }

            event.preventDefault();

            this.saveDetailLine();

        }

    );

    /*
    ======================================================
    RESET
    ======================================================
    */

    this.detailModalElement?.addEventListener(

        "hidden.bs.modal",

        () => {

            this.clearDetailForm();

        }

    );

}
/*
==========================================================
COLLECT JOURNAL DETAIL
==========================================================
*/

collectJournalDetail(journalId) {

    /*
    ======================================================
    RESULT
    ======================================================
    */

    const details = [];

    /*
    ======================================================
    LINE NUMBER
    ======================================================
    */

    let lineNo = 1;

    /*
    ======================================================
    LOOP DETAIL
    ======================================================
    */

    this.detailLines.forEach(

        detail => {

            /*
            ===============================================
            DEBIT LINE
            ===============================================
            */

            details.push({

                journal_id:

                    journalId,

                line_no:

                    lineNo++,

                account_id:

                    Number(

                        detail.debit_account_id

                    ),

                business_partner_id:

                    detail.business_partner_id ||

                    null,

                description:

                    detail.description ||

                    null,

                debit:

                    Number(

                        detail.amount || 0

                    ),

                credit:

                    0

            });

            /*
            ===============================================
            CREDIT LINE
            ===============================================
            */

            details.push({

                journal_id:

                    journalId,

                line_no:

                    lineNo++,

                account_id:

                    Number(

                        detail.credit_account_id

                    ),

                business_partner_id:

                    detail.business_partner_id ||

                    null,

                description:

                    detail.description ||

                    null,

                debit:

                    0,

                credit:

                    Number(

                        detail.amount || 0

                    )

            });

        }

    );

    /*
    ======================================================
    RETURN
    ======================================================
    */

    return details;

}
/*
==========================================================
POST CONFIRMATION MODAL
==========================================================
*/

showPostConfirmation() {

    return new Promise((resolve) => {

        /*
        ======================================================
        REMOVE OLD MODAL
        ======================================================
        */

        const oldModal =
            document.getElementById(
                "confirmPostJournalModal"
            );

        if (oldModal) {

            oldModal.remove();

        }

        /*
        ======================================================
        CREATE MODAL
        ======================================================
        */

        const modalHtml = `

            <div
                class="modal fade"
                id="confirmPostJournalModal"
                tabindex="-1"
                aria-labelledby="confirmPostJournalModalLabel"
                aria-hidden="true"
            >

                <div
                    class="modal-dialog modal-dialog-centered"
                >

                    <div class="modal-content">

                        <!-- HEADER -->

                        <div class="modal-header">

                            <h5
                                class="modal-title"
                                id="confirmPostJournalModalLabel"
                            >

                                <i
                                    class="fa-solid fa-circle-check text-success me-2"
                                ></i>

                                Confirm Posting Journal

                            </h5>

                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>

                        </div>


                        <!-- BODY -->

                        <div class="modal-body">

                            <div
                                class="text-center py-2"
                            >

                                <i
                                    class="fa-solid fa-circle-question text-warning"
                                    style="font-size: 42px;"
                                ></i>

                            </div>

                            <p
                                class="text-center mb-2"
                            >

                                Apakah Anda yakin ingin
                                <strong>Posting Journal</strong>
                                ini?

                            </p>

                            <div
                                class="alert alert-warning mb-0"
                            >

                                <i
                                    class="fa-solid fa-triangle-exclamation me-2"
                                ></i>

                                Setelah Journal di-post,
                                status akan berubah menjadi
                                <strong>Posted</strong>.

                            </div>

                        </div>


                        <!-- FOOTER -->

                        <div
                            class="modal-footer"
                        >

                            <button
                                type="button"
                                class="btn btn-secondary"
                                id="btn-cancel-post-journal"
                            >

                                <i
                                    class="fa-solid fa-xmark me-1"
                                ></i>

                                Batal

                            </button>

                            <button
                                type="button"
                                class="btn btn-success"
                                id="btn-confirm-post-journal"
                            >

                                <i
                                    class="fa-solid fa-check me-1"
                                ></i>

                                Ya, Posting

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;

        /*
        ======================================================
        INSERT MODAL
        ======================================================
        */

        document.body.insertAdjacentHTML(
            "beforeend",
            modalHtml
        );

        /*
        ======================================================
        GET ELEMENT
        ======================================================
        */

        const modalElement =
            document.getElementById(
                "confirmPostJournalModal"
            );

        const btnConfirm =
            document.getElementById(
                "btn-confirm-post-journal"
            );

        const btnCancel =
            document.getElementById(
                "btn-cancel-post-journal"
            );

        /*
        ======================================================
        BOOTSTRAP MODAL
        ======================================================
        */

        const modal =
            new bootstrap.Modal(
                modalElement
            );

        let completed = false;

        /*
        ======================================================
        CONFIRM
        ======================================================
        */

        btnConfirm.addEventListener(
            "click",
            () => {

                completed = true;

                modal.hide();

                resolve(true);

            }
        );

        /*
        ======================================================
        CANCEL
        ======================================================
        */

        btnCancel.addEventListener(
            "click",
            () => {

                completed = true;

                modal.hide();

                resolve(false);

            }
        );

        /*
        ======================================================
        CLOSE / BACKDROP / ESC
        ======================================================
        */

        modalElement.addEventListener(
            "hidden.bs.modal",
            () => {

                if (!completed) {

                    resolve(false);

                }

                modalElement.remove();

            },
            {
                once: true
            }
        );

        /*
        ======================================================
        SHOW
        ======================================================
        */

        modal.show();

    });

}
/*
==========================================================
SAVE JOURNAL
==========================================================
*/

async saveJournal(status = "Draft") {

    try {

        if (!this.validateJournal(status)) {
            return;
        }
/*
======================================================
HEADER
======================================================
*/

const header = {

    journal_no:
        this.txtJournalNo.value.trim(),

    journal_date:
        this.txtAccountingDate.value,

    posting_period:
        this.txtPostingPeriod?.value ||

        this.getPostingPeriod(
            this.txtAccountingDate.value
        ),

    description:
        this.txtDescription.value.trim(),

    source_module:
        "GENERAL",

    status

};

/*
======================================================
EDIT MODE
======================================================
*/

if (

    this.currentMode === "edit" &&

    this.currentJournal?.id

) {

    header.id = this.currentJournal.id;

}

        /*
        ======================================================
        DETAIL
        ======================================================
        */

        const details = this.detailLines.map(
    (line, index) => ({

        line_no:
            index + 1,

        description:
            line.description,

        debit_account_id:
            line.debit_account_id,

        credit_account_id:
            line.credit_account_id,

        business_partner_id:
            line.business_partner_id || null,

        amount:
            Number(line.amount)

    })
);

        /*
        ======================================================
        SAVE
        ======================================================
        */

        if (this.currentMode === "add") {

            await this.service.create(

                header,

                details

            );

        }
        else {

            await this.service.update(

                header.id,

                header,

                details

            );

        }

        /*
        ======================================================
        RELOAD
        ======================================================
        */

        await this.loadData();

        /*
        ======================================================
        CLOSE
        ======================================================
        */

        this.modal.hide();

        /*
        ======================================================
        SUCCESS
        ======================================================
        */

        window.App?.showSuccess?.(

            `Journal ${status} successfully.`

        );

    }

    catch (error) {

        console.error(

            "Save Journal",

            error

        );

        window.App?.showError?.(

            error.message ||

            "Failed to save journal."

        );

    }

}
/*
==========================================================
SAVE JOURNAL DETAIL
==========================================================
*/

async saveJournalDetail(journalId) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!journalId) {

        throw new Error(

            "Journal ID is required."

        );

    }

    /*
    ======================================================
    COLLECT DETAIL
    ======================================================
    */

    const details =

        this.collectJournalDetail(

            journalId

        );

    /*
    ======================================================
    EMPTY DETAIL
    ======================================================
    */

    if (!details.length) {

        throw new Error(

            "Journal detail cannot be empty."

        );

    }

    /*
    ======================================================
    INSERT DETAIL
    ======================================================
    */

    const {

        error

    } = await supabase

        .from(

            TABLE.GL_JOURNAL_DETAIL

        )

        .insert(

            details

        );

    /*
    ======================================================
    ERROR
    ======================================================
    */

    if (error) {

        throw error;

    }

}
/*
==========================================================
DUPLICATE JOURNAL
==========================================================
*/

async duplicateJournal(id) {

    try {

        /*
        ======================================================
        LOAD HEADER
        ======================================================
        */

        const {

            data: header,

            error: headerError

        } = await supabase

            .from(TABLE.GL_JOURNAL)

            .select("*")

            .eq("id", id)

            .single();

        if (headerError) {

            throw headerError;

        }

        /*
        ======================================================
        LOAD DETAIL
        ======================================================
        */

        const {

            data: details,

            error: detailError

        } = await supabase

            .from(TABLE.GL_JOURNAL_DETAIL)

            .select(`
                *,
                mst_chart_of_accounts (
                    id,
                    account_code,
                    account_name
                ),
                mst_business_partner (
                    id,
                    bp_code,
                    bp_name
                )
            `)

            .eq(

                "journal_id",

                id

            )

            .order(

                "line_no",

                {

                    ascending: true

                }

            );

        if (detailError) {

            throw detailError;

        }

        /*
        ======================================================
        OPEN ADD MODE
        ======================================================
        */

        await this.openAddJournal();

        /*
        ======================================================
        MODE
        ======================================================
        */

        this.currentMode = "add";

        this.currentJournal = null;

        /*
        ======================================================
        HEADER
        ======================================================
        */

        document.getElementById(

            "journal-accounting-date"

        ).value =

            header.journal_date;

        document.getElementById(

            "journal-reference-no"

        ).value =

            header.reference_no || "";

        document.getElementById(

            "journal-description"

        ).value =

            header.description || "";

        document.getElementById(

            "journal-status"

        ).value =

            "Draft";

        /*
        ======================================================
        JOURNAL NUMBER
        ======================================================
        */

        document.getElementById(

            "journal-journal-no"

        ).value = "";

        /*
        ======================================================
        DETAIL
        ======================================================
        */

        this.detailLines =

            this.convertDatabaseDetail(

                details

            );

        /*
        ======================================================
        REFRESH
        ======================================================
        */

        this.renderDetailTable();

        this.calculateSummary();

    }

    catch (error) {

        console.error(

            "Duplicate Journal Error",

            error

        );

        alert(

            error.message

        );

    }

}
/*
==========================================================
CONVERT DATABASE DETAIL
==========================================================
*/

convertDatabaseDetail(databaseDetails = []) {

    /*
    ======================================================
    RESULT
    ======================================================
    */

    const result = [];

    /*
    ======================================================
    LOOP EVERY 2 ROWS
    ======================================================
    */

    for (

        let i = 0;

        i < databaseDetails.length;

        i += 2

    ) {

        const debitLine =

            databaseDetails[i];

        const creditLine =

            databaseDetails[i + 1];

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (

            !debitLine ||

            !creditLine

        ) {

            continue;

        }

        /*
        ==================================================
        PUSH
        ==================================================
        */

        result.push({

            description:

                debitLine.description ||

                creditLine.description ||

                "",

            amount:

                Number(

                    debitLine.debit || 0

                ),

            debit_account_id:

                debitLine.account_id,

            credit_account_id:

                creditLine.account_id,

            business_partner_id:

                debitLine.business_partner_id ||

                creditLine.business_partner_id ||

                null,

            /*
            ===============================================
            DISPLAY DATA
            ===============================================
            */

            debit_account_code:

                debitLine.mst_chart_of_accounts
                ?.account_code ||

                "",

            debit_account_name:

                debitLine.mst_chart_of_accounts
                ?.account_name ||

                "",

            credit_account_code:

                creditLine.mst_chart_of_accounts
                ?.account_code ||

                "",

            credit_account_name:

                creditLine.mst_chart_of_accounts
                ?.account_name ||

                "",

            business_partner_name:

                debitLine.mst_business_partner
                ?.bp_name ||

                creditLine.mst_business_partner
                ?.bp_name ||

                ""

        });

    }

    /*
    ======================================================
    RETURN
    ======================================================
    */

    return result;

}
/*
==========================================================
POST JOURNAL
==========================================================
*/

async postJournal(id) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!id) {

            return;

        }
        /*
        ======================================================
        BOOTSTRAP CONFIRMATION
        ======================================================
        */

        const confirmed =
            await this.showPostConfirmation();

        if (!confirmed) {

            return;

        }

        

        /*
        ======================================================
        LOAD DETAIL
        ======================================================
        */

        const {

            data: details,

            error

        } = await supabase

            .from(

                TABLE.GL_JOURNAL_DETAIL

            )

            .select("*")

            .eq(

                "journal_id",

                id

            );

        if (error) {

            throw error;

        }

        /*
        ======================================================
        NO DETAIL
        ======================================================
        */

        if (

            !details ||

            details.length === 0

        ) {

            alert(

                "Journal detail is empty."

            );

            return;

        }

        /*
        ======================================================
        CALCULATE
        ======================================================
        */

        let totalDebit = 0;

        let totalCredit = 0;

        details.forEach(

            row => {

                totalDebit += Number(

                    row.debit || 0

                );

                totalCredit += Number(

                    row.credit || 0

                );

            }

        );

        /*
        ======================================================
        BALANCED
        ======================================================
        */

        if (

            Math.abs(

                totalDebit - totalCredit

            ) > 0.01

        ) {

            alert(

                "Journal is not balanced."

            );

            return;

        }

        /*
        ======================================================
        UPDATE STATUS
        ======================================================
        */

        const {

            error: updateError

        } = await supabase

            .from(

                TABLE.GL_JOURNAL

            )

            .update({

                status: "Posted"

            })

            .eq(

                "id",

                id

            );

        if (updateError) {

            throw updateError;

        }

        /*
        ======================================================
        SUCCESS
        ======================================================
        */

        alert(

            "Journal posted successfully."

        );

        /*
        ======================================================
        RELOAD
        ======================================================
        */

        await this.loadData();

    }

    catch (error) {

        console.error(

            "Post Journal Error",

            error

        );

        alert(

            error.message

        );

    }

}
/*
==========================================================
VOID JOURNAL
==========================================================
*/

async voidJournal(id) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!id) {

            return;

        }

        /*
        ======================================================
        BOOTSTRAP CONFIRMATION
        ======================================================
        */

        const confirmed =
            await this.showVoidConfirmation();

        if (!confirmed) {

            return;

        }

        /*
        ======================================================
        GET VOID REASON
        ======================================================
        */

        const reasonInput =
            document.getElementById(
                "void-journal-reason"
            );

        const reason =
            reasonInput?.value?.trim() || "";

        if (!reason) {

            alert(
                "Alasan Void wajib diisi."
            );

            return;

        }

        /*
        ======================================================
        UPDATE STATUS
        ======================================================
        */

        await this.service.voidJournal(
            id,
            reason
        );

        /*
        ======================================================
        SUCCESS
        ======================================================
        */

        alert(
            "Journal berhasil di-VOID."
        );

        /*
        ======================================================
        RELOAD
        ======================================================
        */

        await this.loadData();

    }

    catch (error) {

        console.error(
            "Void Journal Error",
            error
        );

        alert(
            error?.message ||
            "Gagal melakukan Void Journal."
        );

    }

}

/*
==========================================================
VOID CONFIRMATION MODAL
==========================================================
*/

showVoidConfirmation() {

    return new Promise((resolve) => {

        /*
        ======================================================
        REMOVE OLD MODAL
        ======================================================
        */

        const oldModal =
            document.getElementById(
                "confirmVoidJournalModal"
            );

        if (oldModal) {

            oldModal.remove();

        }

        /*
        ======================================================
        CREATE MODAL
        ======================================================
        */

        const modalHtml = `

            <div
                class="modal fade"
                id="confirmVoidJournalModal"
                tabindex="-1"
                aria-labelledby="confirmVoidJournalModalLabel"
                aria-hidden="true"
            >

                <div
                    class="modal-dialog modal-dialog-centered"
                >

                    <div class="modal-content">

                        <!-- HEADER -->

                        <div class="modal-header">

                            <h5
                                class="modal-title"
                                id="confirmVoidJournalModalLabel"
                            >

                                <i
                                    class="fa-solid fa-ban text-danger me-2"
                                ></i>

                                Confirm Void Journal

                            </h5>

                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>

                        </div>


                        <!-- BODY -->

                        <div class="modal-body">

                            <div
                                class="text-center py-2"
                            >

                                <i
                                    class="fa-solid fa-circle-question text-danger"
                                    style="font-size:42px;"
                                ></i>

                            </div>


                            <p
                                class="text-center mb-3"
                            >

                                Apakah Anda yakin ingin
                                <strong>VOID Journal</strong>
                                ini?

                            </p>


                            <div
                                class="alert alert-danger"
                            >

                                <i
                                    class="fa-solid fa-triangle-exclamation me-2"
                                ></i>

                                Journal yang di-VOID tidak
                                dapat dianggap sebagai
                                transaksi Posted.

                            </div>


                            <!-- VOID REASON -->

                            <div class="mb-2">

                                <label
                                    for="void-journal-reason"
                                    class="form-label fw-semibold"
                                >

                                    Alasan Void
                                    <span class="text-danger">
                                        *
                                    </span>

                                </label>

                                <textarea
                                    id="void-journal-reason"
                                    class="form-control"
                                    rows="3"
                                    placeholder="Masukkan alasan Void..."
                                ></textarea>

                            </div>

                        </div>


                        <!-- FOOTER -->

                        <div
                            class="modal-footer"
                        >

                            <button
                                type="button"
                                class="btn btn-secondary"
                                id="btn-cancel-void-journal"
                            >

                                <i
                                    class="fa-solid fa-xmark me-1"
                                ></i>

                                Batal

                            </button>


                            <button
                                type="button"
                                class="btn btn-danger"
                                id="btn-confirm-void-journal"
                            >

                                <i
                                    class="fa-solid fa-ban me-1"
                                ></i>

                                Ya, Void

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;
        

        /*
        ======================================================
        INSERT
        ======================================================
        */

        document.body.insertAdjacentHTML(
            "beforeend",
            modalHtml
        );

        /*
        ======================================================
        ELEMENT
        ======================================================
        */

        const modalElement =
            document.getElementById(
                "confirmVoidJournalModal"
            );

        const btnConfirm =
            document.getElementById(
                "btn-confirm-void-journal"
            );

        const btnCancel =
            document.getElementById(
                "btn-cancel-void-journal"
            );

        /*
        ======================================================
        BOOTSTRAP
        ======================================================
        */

        const modal =
            new bootstrap.Modal(
                modalElement
            );

        let completed = false;

        /*
        ======================================================
        CONFIRM
        ======================================================
        */

        btnConfirm.addEventListener(
            "click",
            () => {

                const reason =
                    document
                        .getElementById(
                            "void-journal-reason"
                        )
                        ?.value
                        ?.trim();

                if (!reason) {

                    document
                        .getElementById(
                            "void-journal-reason"
                        )
                        ?.focus();

                    return;

                }

                completed = true;

                modal.hide();

                resolve(true);

            }
        );

        /*
        ======================================================
        CANCEL
        ======================================================
        */

        btnCancel.addEventListener(
            "click",
            () => {

                completed = true;

                modal.hide();

                resolve(false);

            }
        );

        /*
        ======================================================
        CLOSE / ESC / BACKDROP
        ======================================================
        */

        modalElement.addEventListener(
            "hidden.bs.modal",
            () => {

                if (!completed) {

                    resolve(false);

                }

                modalElement.remove();

            },
            {
                once: true
            }
        );

        /*
        ======================================================
        SHOW
        ======================================================
        */

        modal.show();

    });

}
/*
==========================================================
OPEN VOUCHER
==========================================================
*/

async openVoucher(id) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!id) {

            return;

        }

        /*
        ======================================================
        LOAD HEADER
        ======================================================
        */

        const {

            data: header,

            error: headerError

        } = await supabase

            .from(

                TABLE.GL_JOURNAL

            )

            .select("*")

            .eq(

                "id",

                id

            )

            .single();

        if (headerError) {

            throw headerError;

        }

        /*
        ======================================================
        LOAD DETAIL
        ======================================================
        */

        const {

            data: details,

            error: detailError

        } = await supabase

            .from(

                TABLE.GL_JOURNAL_DETAIL

            )

            .select(`

                *,

                mst_chart_of_accounts(

                    account_code,

                    account_name

                ),

                mst_business_partner(

                    bp_name

                )

            `)

            .eq(

                "journal_id",

                id

            )

            .order(

                "line_no",

                {

                    ascending: true

                }

            );

        if (detailError) {

            throw detailError;

        }

        /*
        ======================================================
        GENERATE HTML
        ======================================================
        */

        const html =

            this.generateVoucherHTML(

                header,

                details

            );

        /*
        ======================================================
        PRINT WINDOW
        ======================================================
        */

        const printWindow =

            window.open(

                "",

                "_blank"

            );

        printWindow.document.write(

            html

        );

        printWindow.document.close();

    }

    catch (error) {

        console.error(

            "Voucher Error",

            error

        );

        alert(

            error.message

        );

    }

}
/*
==========================================================
GENERATE VOUCHER HTML
==========================================================
*/

generateVoucherHTML(header, details) {

    /*
    ======================================================
    CALCULATE TOTAL
    ======================================================
    */

    let totalDebit = 0;

    let totalCredit = 0;

    details.forEach(detail => {

        totalDebit += Number(

            detail.debit || 0

        );

        totalCredit += Number(

            detail.credit || 0

        );

    });

    /*
    ======================================================
    DETAIL HTML
    ======================================================
    */

    const detailHtml =

        details.map((detail, index) => `

            <tr>

                <td>

                    ${index + 1}

                </td>

                <td>

                    ${detail.mst_chart_of_accounts?.account_code || ""}

                </td>

                <td>

                    ${detail.mst_chart_of_accounts?.account_name || ""}

                </td>

                <td>

                    ${detail.description || ""}

                </td>

                <td style="text-align:right">

                    ${this.formatCurrency(

                        Number(

                            detail.debit || 0

                        )

                    )}

                </td>

                <td style="text-align:right">

                    ${this.formatCurrency(

                        Number(

                            detail.credit || 0

                        )

                    )}

                </td>

            </tr>

        `).join("");

    /*
    ======================================================
    HTML
    ======================================================
    */

    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="utf-8">

<title>

Journal Voucher

</title>

<style>

body{

    font-family:Arial,sans-serif;

    margin:40px;

    color:#333;

}

h2{

    margin-bottom:0;

}

.header{

    margin-bottom:30px;

}

table{

    width:100%;

    border-collapse:collapse;

    margin-top:20px;

}

th{

    background:#f5f5f5;

}

th,td{

    border:1px solid #ccc;

    padding:8px;

    font-size:13px;

}

.total{

    font-weight:bold;

    background:#fafafa;

}

.footer{

    margin-top:60px;

}

.signature{

    width:200px;

    display:inline-block;

    text-align:center;

}

.watermark{

    position:fixed;

    top:35%;

    left:15%;

    font-size:90px;

    color:#000;

    opacity:.05;

    transform:rotate(-30deg);

    font-weight:bold;

}

@media print{

button{

display:none;

}

}

</style>

</head>

<body>

<div class="watermark">

POSTED

</div>

<div class="header">

<h2>

FINOVA ACCOUNTING SYSTEM

</h2>

<h3>

GENERAL JOURNAL VOUCHER

</h3>

</div>

<table>

<tr>

<td width="180">

Journal No

</td>

<td>

${header.journal_no}

</td>

<td width="180">

Status

</td>

<td>

${header.status}

</td>

</tr>

<tr>

<td>

Accounting Date

</td>

<td>

${header.journal_date}

</td>

<td>

Reference No

</td>

<td>

${header.reference_no || "-"}

</td>

</tr>

<tr>

<td>

Description

</td>

<td colspan="3">

${header.description || "-"}

</td>

</tr>

</table>

<table>

<thead>

<tr>

<th width="60">

No

</th>

<th width="120">

Code

</th>

<th>

Account

</th>

<th>

Description

</th>

<th width="150">

Debit

</th>

<th width="150">

Credit

</th>

</tr>

</thead>

<tbody>

${detailHtml}

<tr class="total">

<td colspan="4">

TOTAL

</td>

<td style="text-align:right">

${this.formatCurrency(

    totalDebit

)}

</td>

<td style="text-align:right">

${this.formatCurrency(

    totalCredit

)}

</td>

</tr>

</tbody>

</table>

<div class="footer">

<div class="signature">

Prepared By

<br><br><br><br>

____________________

</div>

<div class="signature">

Posted By

<br><br><br><br>

____________________

</div>

</div>

<script>

window.onload=function(){

window.print();

};

</script>

</body>

</html>

`;

}

}