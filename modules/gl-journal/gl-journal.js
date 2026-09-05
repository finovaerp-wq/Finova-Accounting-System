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
    this.init();

}
/*
==========================================================
INITIALIZE MODULE
==========================================================
*/

async init() {

    try {

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
        INITIAL TABLE LOADING
        SAME AS ACCOUNT PAYABLE
        ======================================================
        */

        await this.loadData(
            true
        );


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
FINAL
==========================================================
*/

updateSummaryDisplay() {

    /*
    ======================================================
    VALIDATE SUMMARY
    ======================================================
    */

    if (
        !this.summary
    ) {

        return;

    }


    /*
    ======================================================
    TOTAL LINE
    ======================================================
    */

    if (
        this.summaryTotalLine
    ) {

        const totalLine =
            Number(
                this.summary.totalLine
                || 0
            );


        /*
        ==================================================
        SUPPORT INPUT OR NORMAL ELEMENT
        ==================================================
        */

        if (
            "value"
            in
            this.summaryTotalLine
        ) {

            this.summaryTotalLine.value =
                totalLine;

        }


        this.summaryTotalLine.textContent =
            totalLine;

    }


    /*
    ======================================================
    TOTAL AMOUNT
    ======================================================
    */

    if (
        this.summaryTotalAmount
    ) {

        const totalAmount =
            this.formatCurrency(
                Number(
                    this.summary.totalDebit
                    || 0
                )
            );


        /*
        ==================================================
        SUPPORT INPUT OR NORMAL ELEMENT
        ==================================================
        */

        if (
            "value"
            in
            this.summaryTotalAmount
        ) {

            this.summaryTotalAmount.value =
                totalAmount;

        }


        this.summaryTotalAmount.textContent =
            totalAmount;

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

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Journal ID is required."
            );

        }


        /*
        ==================================================
        FIND JOURNAL
        ==================================================
        */

        const journal =
            this.journals.find(
                x =>
                    String(x.id)
                    ===
                    String(id)
            );


        if (!journal) {

            throw new Error(
                "Journal not found."
            );

        }


        /*
        ==================================================
        FILL JOURNAL INFORMATION
        ==================================================
        */

        const journalNo =
            document.getElementById(
                "delete-journal-no"
            );

        if (journalNo) {

            journalNo.textContent =
                journal.journal_no
                || "-";

        }


        const accountingDate =
            document.getElementById(
                "delete-accounting-date"
            );

        if (accountingDate) {

            accountingDate.textContent =
                journal.journal_date
                || "-";

        }


        const description =
            document.getElementById(
                "delete-description"
            );

        if (description) {

            description.textContent =
                journal.description
                || "-";

        }


        /*
        ==================================================
        SAVE DELETE ID
        ==================================================
        */

        this.selectedDeleteJournalId =
            id;


        /*
        ==================================================
        GET MODAL
        ==================================================
        */

        const modalElement =
            document.getElementById(
                "confirmDeleteJournalModal"
            );


        if (!modalElement) {

            throw new Error(
                "Confirm Delete Journal Modal not found."
            );

        }


        /*
        ==================================================
        INITIALIZE / REUSE BOOTSTRAP MODAL
        ==================================================
        */

        this.deleteJournalModal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        /*
        ==================================================
        SHOW MODAL
        ==================================================
        */

        this.deleteJournalModal.show();

    }

    catch (error) {

        console.error(
            "GeneralJournal.showDeleteJournalModal:",
            error
        );

        this.showError(
    error?.message
    ||
    "Failed to open delete confirmation."
);

    }

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
ACCOUNTING DATE
UPDATE POSTING PERIOD + VALIDATE ACCOUNTING PERIOD
======================================================
*/

this.txtAccountingDate?.addEventListener(

    "change",

    async () => {

        /*
        ==================================================
        VALIDATE ACCOUNTING PERIOD
        ==================================================
        */

        await this.validateAccountingDatePeriod();

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
FINAL
==========================================================
*/

async loadDetailModal() {

    /*
    ======================================================
    ALREADY LOADED
    ======================================================
    */

    if (
        this.detailModalLoaded
    ) {

        return;

    }


    /*
    ======================================================
    LOAD HTML
    ======================================================
    */

    const response =
        await fetch(
            "modules/gl-journal/journal-detail-modal.html"
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "Failed to load Journal Detail Modal."
        );

    }


    /*
    ======================================================
    INJECT HTML
    ======================================================
    */

    this.detailModalContainer.innerHTML =
        await response.text();


    /*
    ======================================================
    CREATE BOOTSTRAP MODAL
    ======================================================
    */

    this.detailModalElement =
        document.getElementById(
            "journalDetailModal"
        );


    this.detailModal =
        new bootstrap.Modal(
            this.detailModalElement
        );


    /*
    ======================================================
    CACHE DOM
    ======================================================
    */

    this.cacheDetailModalDom();


    /*
    ======================================================
    BIND EVENTS
    ======================================================
    */

    this.bindDetailModalEvents();


    /*
    ======================================================
    MARK LOADED
    ======================================================
    */

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
FINAL
ITEMS = UI JOURNAL TRANSACTION TOTAL LINE
==========================================================
*/

async loadData(
    showLoading = true
) {

    try {

        /*
        ======================================================
        RE-CACHE ACTIVE TABLE BODY
        ======================================================
        */

        const activeTableBody =
            document.getElementById(
                "gl-journal-tbody"
            );


        if (
            activeTableBody
        ) {

            this.tableBody =
                activeTableBody;

        }


        /*
        ======================================================
        TABLE BODY NOT FOUND
        ======================================================
        */

        if (
            !this.tableBody
        ) {

            console.warn(
                "GeneralJournal.loadData: active table body not found."
            );

            return;

        }


        /*
        ======================================================
        LOADING
        ======================================================
        */

        if (
            showLoading
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
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

                                <span class="visually-hidden">

                                    Loading...

                                </span>

                            </div>


                            <div
                                class="
                                    text-muted
                                    small
                                "
                            >

                                Loading General Journal...

                            </div>

                        </div>

                    </td>

                </tr>

            `;

        }


        /*
        ======================================================
        LOAD JOURNAL HEADER
        ======================================================
        */

        const headers =
            await this.service.getAll();


        const journalHeaders =
            Array.isArray(
                headers
            )
                ? headers
                : [];


        /*
        ======================================================
        LOAD FULL JOURNAL
        HEADER + DATABASE DETAIL
        ======================================================
        */

        const result =
            await Promise.all(

                journalHeaders.map(

                    async journal => {

                        try {

                            const fullJournal =
                                await this.service.getById(
                                    journal.id
                                );


                            /*
                            ==========================================
                            DATABASE DETAIL

                            DB FORMAT:
                            Debit row
                            Credit row
                            ==========================================
                            */

                            const databaseDetails =
                                Array.isArray(
                                    fullJournal?.details
                                )
                                    ? fullJournal.details
                                    : [];


                            /*
                            ==========================================
                            MERGE DATABASE DETAIL

                            Debit + Credit
                            =
                            ONE UI TRANSACTION
                            ==========================================
                            */

                            const transactionDetails =
                                this.service.mergeJournalDetail(
                                    databaseDetails
                                );


                            /*
                            ==========================================
                            TOTAL LINE / ITEMS

                            SAME AS JOURNAL DETAIL MODAL
                            ==========================================
                            */

                            const totalLine =
                                Array.isArray(
                                    transactionDetails
                                )
                                    ? transactionDetails.length
                                    : 0;


                            /*
                            ==========================================
                            RETURN
                            ==========================================
                            */

                            return {

                                ...journal,

                                ...(fullJournal || {}),

                                /*
                                ======================================
                                KEEP DATABASE DETAIL IF NEEDED
                                ======================================
                                */

                                database_details:
                                    databaseDetails,

                                /*
                                ======================================
                                UI TRANSACTION DETAIL
                                ======================================
                                */

                                details:
                                    transactionDetails,

                                /*
                                ======================================
                                TOTAL LINE
                                ======================================
                                */

                                total_line:
                                    totalLine,

                                transaction_count:
                                    totalLine

                            };

                        }

                        catch (
                            journalError
                        ) {

                            console.error(
                                "Failed to load journal:",
                                journal.id,
                                journalError
                            );


                            /*
                            ==========================================
                            KEEP HEADER
                            ==========================================
                            */

                            return {

                                ...journal,

                                database_details: [],

                                details: [],

                                total_line: 0,

                                transaction_count: 0

                            };

                        }

                    }

                )

            );


        /*
        ======================================================
        NORMALIZE JOURNAL
        ======================================================
        */

        this.journals =
            result.map(

                journal => {

                    /*
                    ==============================================
                    SOURCE MODULE
                    ==============================================
                    */

                    let sourceModule =
                        String(
                            journal.source_module
                            ||
                            journal.source
                            ||
                            "GLJ"
                        )
                        .trim()
                        .toUpperCase();


                    /*
                    ==============================================
                    NORMALIZE GL
                    ==============================================
                    */

                    if (
                        sourceModule === "GENERAL"
                        ||
                        sourceModule === "GL"
                        ||
                        sourceModule === "GENERAL JOURNAL"
                    ) {

                        sourceModule =
                            "GLJ";

                    }


                    /*
                    ==============================================
                    NORMALIZE AP
                    ==============================================
                    */

                    if (
                        sourceModule === "ACCOUNT PAYABLE"
                        ||
                        sourceModule === "PAYABLE"
                    ) {

                        sourceModule =
                            "AP";

                    }


                    /*
                    ==============================================
                    NORMALIZE AR
                    ==============================================
                    */

                    if (
                        sourceModule === "ACCOUNT RECEIVABLE"
                        ||
                        sourceModule === "RECEIVABLE"
                    ) {

                        sourceModule =
                            "AR";

                    }


                    /*
                    ==============================================
                    TOTAL LINE

                    USE UI TRANSACTION COUNT
                    NOT DATABASE ROW COUNT
                    ==============================================
                    */

                    const totalLine =
                        Array.isArray(
                            journal.details
                        )
                            ? journal.details.length
                            : 0;


                    /*
                    ==============================================
                    TOTAL DEBIT
                    ==============================================
                    */

                    const totalDebit =
                        Number(
                            journal.total_debit
                            || 0
                        );


                    /*
                    ==============================================
                    TOTAL CREDIT
                    ==============================================
                    */

                    const totalCredit =
                        Number(
                            journal.total_credit
                            || 0
                        );


                    /*
                    ==============================================
                    RETURN
                    ==============================================
                    */

                    return {

                        ...journal,

                        source_module:
                            sourceModule,

                        total_line:
                            totalLine,

                        transaction_count:
                            totalLine,

                        total_debit:
                            totalDebit,

                        total_credit:
                            totalCredit

                    };

                }

            );


        /*
        ======================================================
        DEBUG
        ======================================================
        */

        console.table(

            this.journals.map(

                journal => ({

                    journal_no:
                        journal.journal_no,

                    database_rows:
                        journal.database_details?.length
                        || 0,

                    ui_transactions:
                        journal.details?.length
                        || 0,

                    items:
                        journal.total_line

                })

            )

        );


        /*
        ======================================================
        FILTER DATA
        ======================================================
        */

        this.filteredJournals =
            [
                ...this.journals
            ];


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

                    this.totalRows
                    /
                    this.pageSize

                )

            );


        /*
        ======================================================
        CURRENT PAGE
        ======================================================
        */

        this.currentPage =
            Math.min(

                Math.max(

                    Number(
                        this.currentPage
                    )
                    || 1,

                    1

                ),

                this.totalPages

            );


        /*
        ======================================================
        REFRESH VIEW
        ======================================================
        */

        this.refreshView();

    }

    catch (
        error
    ) {

        console.error(
            "Failed to load General Journal.",
            error
        );


        /*
        ======================================================
        RESET
        ======================================================
        */

        this.journals = [];

        this.filteredJournals = [];

        this.totalRows = 0;

        this.totalPages = 1;

        this.currentPage = 1;


        /*
        ======================================================
        ERROR DISPLAY
        ======================================================
        */

        if (
            this.tableBody
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="
                            text-center
                            py-5
                            text-danger
                        "
                    >

                        Failed to load General Journal.

                    </td>

                </tr>

            `;

        }


        /*
        ======================================================
        PAGINATION
        ======================================================
        */

        if (
            typeof this.updatePagination
            === "function"
        ) {

            this.updatePagination();

        }


        throw error;

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
        (this.currentPage - 1)
        *
        this.pageSize;


    const end =
        start
        +
        this.pageSize;


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

    if (!journals.length) {

        this.tableBody.innerHTML = `

            <tr class="finova-empty-row">

                <td
                    colspan="8"
                    class="text-center text-muted py-4">

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
GET JOURNAL SOURCE INFO
FINAL
==========================================================
*/

getJournalSourceInfo(
    journal
) {

    /*
    ======================================================
    SOURCE MODULE
    ======================================================
    */

    let sourceModule =
        String(
            journal?.source_module
            ||
            journal?.source
            ||
            "GLJ"
        )
        .trim()
        .toUpperCase();


    /*
    ======================================================
    NORMALIZE SOURCE MODULE
    ======================================================
    */

    if (
        sourceModule === "GENERAL"
        ||
        sourceModule === "GL"
        ||
        sourceModule === "GENERAL JOURNAL"
    ) {

        sourceModule =
            "GLJ";

    }


    if (
        sourceModule === "ACCOUNT PAYABLE"
        ||
        sourceModule === "PAYABLE"
    ) {

        sourceModule =
            "AP";

    }


    if (
        sourceModule === "ACCOUNT RECEIVABLE"
        ||
        sourceModule === "RECEIVABLE"
    ) {

        sourceModule =
            "AR";

    }


    /*
    ======================================================
    SOURCE DOCUMENT TYPE
    ======================================================
    */

    const sourceDocumentType =
        String(
            journal?.source_document_type
            ||
            ""
        )
        .trim()
        .toUpperCase();


    /*
    ======================================================
    AP INVOICE
    ======================================================
    */

    if (
        sourceModule === "AP"
        &&
        sourceDocumentType === "AP_INVOICE"
    ) {

        return {

            module:
                "AP",

            documentType:
                "AP_INVOICE",

            code:
                "AP",

            label:
                "AP Invoice",

            category:
                "invoice",

            badgeClass:
                "gl-source-ap-invoice"

        };

    }


    /*
    ======================================================
    AP PAYMENT
    ======================================================
    */

    if (
        sourceModule === "AP"
        &&
        sourceDocumentType === "AP_PAYMENT"
    ) {

        return {

            module:
                "AP",

            documentType:
                "AP_PAYMENT",

            code:
                "AP",

            label:
                "AP Payment",

            category:
                "payment",

            badgeClass:
                "gl-source-ap-payment"

        };

    }


    /*
    ======================================================
    AR INVOICE
    ======================================================
    */

    if (
        sourceModule === "AR"
        &&
        sourceDocumentType === "AR_INVOICE"
    ) {

        return {

            module:
                "AR",

            documentType:
                "AR_INVOICE",

            code:
                "AR",

            label:
                "AR Invoice",

            category:
                "invoice",

            badgeClass:
                "gl-source-ar-invoice"

        };

    }


    /*
    ======================================================
    AR PAYMENT
    ======================================================
    */

    if (
        sourceModule === "AR"
        &&
        sourceDocumentType === "AR_PAYMENT"
    ) {

        return {

            module:
                "AR",

            documentType:
                "AR_PAYMENT",

            code:
                "AR",

            label:
                "AR Payment",

            category:
                "payment",

            badgeClass:
                "gl-source-ar-payment"

        };

    }


    /*
    ======================================================
    GENERAL JOURNAL
    ======================================================
    */

    if (
        sourceModule === "GLJ"
    ) {

        return {

            module:
                "GLJ",

            documentType:
                sourceDocumentType
                ||
                "MANUAL_JOURNAL",

            code:
                "GLJ",

            label:
                "GL Journal",

            category:
                "manual",

            badgeClass:
                "gl-source-glj"

        };

    }


    /*
    ======================================================
    AP FALLBACK
    ======================================================
    */

    if (
        sourceModule === "AP"
    ) {

        return {

            module:
                "AP",

            documentType:
                sourceDocumentType,

            code:
                "AP",

            label:
                "AP",

            category:
                "other",

            badgeClass:
                "gl-source-ap-invoice"

        };

    }


    /*
    ======================================================
    AR FALLBACK
    ======================================================
    */

    if (
        sourceModule === "AR"
    ) {

        return {

            module:
                "AR",

            documentType:
                sourceDocumentType,

            code:
                "AR",

            label:
                "AR",

            category:
                "other",

            badgeClass:
                "gl-source-ar-invoice"

        };

    }


    /*
    ======================================================
    DEFAULT
    ======================================================
    */

    return {

        module:
            sourceModule
            ||
            "GLJ",

        documentType:
            sourceDocumentType,

        code:
            sourceModule
            ||
            "GLJ",

        label:
            sourceModule
            ||
            "GL Journal",

        category:
            "other",

        badgeClass:
            "gl-source-glj"

    };

}

createTableRow(
    journal,
    rowNumber
) {

    /*
    ======================================================
    DATE
    ======================================================
    */

    const journalDate =
        this.formatDisplayDate(
            journal?.journal_date
        );


    /*
    ======================================================
    JOURNAL NUMBER
    ======================================================
    */

    const journalNo =
        journal?.journal_no
        ||
        "-";


    /*
    ======================================================
    SOURCE INFO
    ======================================================
    */

    const sourceInfo =
        this.getJournalSourceInfo(
            journal
        );


    /*
    ======================================================
    SOURCE MODULE
    ======================================================
    */

    const sourceModule =
        String(
            journal?.source_module
            ||
            ""
        )
        .trim()
        .toUpperCase();


    /*
    ======================================================
    SOURCE DOCUMENT TYPE
    ======================================================
    */

    const sourceDocumentType =
        String(
            journal?.source_document_type
            ||
            ""
        )
        .trim()
        .toUpperCase();


    /*
    ======================================================
    INVOICE NUMBER
    ======================================================
    */

    const invoiceNo =
        journal?.source_invoice_no
        ||
        "";


    /*
    ======================================================
    PO NUMBER
    DISPLAY EXACTLY AS SOURCE
    ======================================================
    */

    const poNo =
        String(
            journal?.source_po_no
            ||
            ""
        )
        .trim();


    /*
    ======================================================
    RAW DESCRIPTION
    ======================================================
    */

    const rawDescription =
        String(
            journal?.description
            ||
            ""
        )
        .trim();


    /*
    ======================================================
    DESCRIPTION DISPLAY
    ======================================================

    AP INVOICE:

    [AUTO] INV AP
    DESCRIPTION HEADER AP

    IMPORTANT:

    Support journal baru:
    [AUTO] INV AP sudah tersimpan di DB

    Support journal lama:
    prefix belum tersimpan di DB
    ======================================================
    */

    let description =
        rawDescription;


    /*
    ======================================================
    AUTO DESCRIPTION BY SOURCE
    ======================================================
    */


    /*
    ======================================================
    AP INVOICE
    ======================================================
    */

    if (
        sourceModule === "AP"
        &&
        sourceDocumentType === "AP_INVOICE"
    ) {

        const hasAutoPrefix =
            /^\[AUTO\]\s*INV\s*AP/i
                .test(
                    rawDescription
                );


        if (
            !hasAutoPrefix
        ) {

            description =
                rawDescription
                    ? `[AUTO] INV AP\n${rawDescription}`
                    : `[AUTO] INV AP`;

        }

    }


    /*
    ======================================================
    AP PAYMENT
    ======================================================
    */

    else if (
        sourceModule === "AP"
        &&
        sourceDocumentType === "AP_PAYMENT"
    ) {

        const hasAutoPrefix =
            /^\[AUTO\]\s*PAYMENT\s*AP/i
                .test(
                    rawDescription
                );


        if (
            !hasAutoPrefix
        ) {

            description =
                rawDescription
                    ? `[AUTO] PAYMENT AP\n${rawDescription}`
                    : `[AUTO] PAYMENT AP`;

        }

    }


    /*
    ======================================================
    AR INVOICE
    ======================================================
    */

    else if (
        sourceModule === "AR"
        &&
        sourceDocumentType === "AR_INVOICE"
    ) {

        const hasAutoPrefix =
            /^\[AUTO\]\s*INV\s*AR/i
                .test(
                    rawDescription
                );


        if (
            !hasAutoPrefix
        ) {

            description =
                rawDescription
                    ? `[AUTO] INV AR\n${rawDescription}`
                    : `[AUTO] INV AR`;

        }

    }


    /*
    ======================================================
    AR PAYMENT
    ======================================================
    */

    else if (
        sourceModule === "AR"
        &&
        sourceDocumentType === "AR_PAYMENT"
    ) {

        const hasAutoPrefix =
            /^\[AUTO\]\s*PAYMENT\s*AR/i
                .test(
                    rawDescription
                );


        if (
            !hasAutoPrefix
        ) {

            description =
                rawDescription
                    ? `[AUTO] PAYMENT AR\n${rawDescription}`
                    : `[AUTO] PAYMENT AR`;

        }

    }


    /*
    ======================================================
    ROW STATUS
    ======================================================
    */

    const rowStatus =
        String(
            journal?.status
            ||
            ""
        )
        .trim()
        .toLowerCase();


    /*
    ======================================================
    EMPTY DESCRIPTION
    ======================================================
    */

    if (
        !description
    ) {

        description =
            "-";

    }


    /*
    ======================================================
    DESCRIPTION HTML
    ======================================================

    ESCAPE HTML FIRST.

    THEN CONVERT:
    \n
    \r\n

    INTO:
    <br>
    ======================================================
    */

    const descriptionHTML =
        this.escapeHTML(
            description
        )
        .replace(
            /\r?\n/g,
            "<br>"
        );


    /*
    ======================================================
    DESCRIPTION TITLE
    ======================================================
    */

    const descriptionTitle =
        this.escapeHTML(
            description
        );


    /*
    ======================================================
    ITEMS / TOTAL LINE
    ======================================================
    */

    const totalLine =
        Number(
            journal?.total_line
            ||
            0
        );


    /*
    ======================================================
    TOTAL DEBIT
    ======================================================
    */

    const totalDebit =
        Number(
            journal?.total_debit
            ||
            0
        );


    /*
    ======================================================
    TOTAL CREDIT
    ======================================================
    */

    const totalCredit =
        Number(
            journal?.total_credit
            ||
            0
        );


    /*
    ======================================================
    CREATED
    ======================================================
    */

    const createdAt =
        this.formatCreatedDateTime(
            journal?.created_at
        );


    /*
    ======================================================
    RETURN ROW
    ======================================================
    */

    return `

        <tr
            class="gl-journal-row"
            data-id="${journal.id}"
            data-status="${rowStatus}"
        >


            <!-- ==========================================
                 NO
            =========================================== -->

            <td class="gl-journal-no-cell">

                ${rowNumber}

            </td>


            <!-- ==========================================
                 DATE
            =========================================== -->

            <td class="gl-journal-date-cell">

                <div class="gl-journal-date">

                    ${journalDate}

                </div>

            </td>


            <!-- ==========================================
                 JOURNAL INFORMATION
            =========================================== -->

            <td class="gl-journal-info-cell">

                <div class="gl-journal-info">


                    <!-- ==================================
                         ITEMS
                    =================================== -->

                    <div
                        class="
                            gl-journal-info-line
                            gl-journal-transaction-line
                        "
                    >

                        <span
                            class="gl-journal-info-label"
                        >

                            Items

                        </span>


                        <span
                            class="gl-journal-info-separator"
                        >

                            :

                        </span>


                        <strong
                            class="
                                gl-journal-info-value
                                gl-journal-transaction-count
                            "
                        >

                            ${totalLine}

                            ${
                                totalLine === 1
                                    ? "Transaction"
                                    : "Transactions"
                            }

                        </strong>

                    </div>


                    <!-- ==================================
                         JOURNAL NO
                    =================================== -->

                    <div
                        class="gl-journal-info-line"
                    >

                        <span
                            class="gl-journal-info-label"
                        >

                            No

                        </span>


                        <span
                            class="gl-journal-info-separator"
                        >

                            :

                        </span>


                        <strong
                            class="
                                gl-journal-info-value
                                gl-journal-number
                            "
                        >

                            ${
                                this.escapeHTML(
                                    journalNo
                                )
                            }

                        </strong>

                    </div>


                    <!-- ==================================
                         INVOICE NO
                    =================================== -->

                    <div
                        class="gl-journal-info-line"
                    >

                        <span
                            class="gl-journal-info-label"
                        >

                            Inv No

                        </span>


                        <span
                            class="gl-journal-info-separator"
                        >

                            :

                        </span>


                        <span
                            class="gl-journal-info-value"
                        >

                            ${
                                invoiceNo
                                    ? this.escapeHTML(
                                        invoiceNo
                                    )
                                    : "-"
                            }

                        </span>

                    </div>


                    <!-- ==================================
                         PO NO
                    =================================== -->

                    <div
                        class="gl-journal-info-line"
                    >

                        <span
                            class="gl-journal-info-label"
                        >

                            PO No

                        </span>


                        <span
                            class="gl-journal-info-separator"
                        >

                            :

                        </span>


                        <span
                            class="gl-journal-info-value"
                        >

                            ${
                                poNo
                                    ? this.escapeHTML(
                                        poNo
                                    )
                                    : "-"
                            }

                        </span>

                    </div>


                    <!-- ==================================
                         DESCRIPTION
                    =================================== -->

                    <div
                        class="
                            gl-journal-info-line
                            gl-journal-description-line
                        "
                    >

                        <span
                            class="gl-journal-info-label"
                        >

                            Desc

                        </span>


                        <span
                            class="gl-journal-info-separator"
                        >

                            :

                        </span>


                        <span
                            class="
                                gl-journal-info-value
                                gl-journal-description
                            "
                            title="${descriptionTitle}"
                        >

                            ${descriptionHTML}

                        </span>

                    </div>


                </div>

            </td>


            <!-- ==========================================
                 SOURCE
            =========================================== -->

            <td class="gl-journal-source-cell">

                <div
                    class="gl-journal-source-wrapper"
                >

                    <span
                        class="
                            gl-journal-source-badge
                            ${sourceInfo.badgeClass}
                        "
                        title="${
                            this.escapeHTML(
                                sourceInfo.label
                            )
                        }"
                    >

                        ${
                            this.escapeHTML(
                                sourceInfo.label
                            )
                        }

                    </span>

                </div>

            </td>


            <!-- ==========================================
                 AMOUNT
            =========================================== -->

            <td class="gl-journal-amount-cell">


                <!-- DEBIT -->

                <div
                    class="gl-journal-summary-line"
                >

                    <span
                        class="gl-journal-summary-label"
                    >

                        Debits

                    </span>


                    <span
                        class="gl-journal-summary-separator"
                    >

                        :

                    </span>


                    <strong
                        class="gl-journal-summary-value"
                    >

                        ${
                            this.formatCurrency(
                                totalDebit
                            )
                        }

                    </strong>

                </div>


                <!-- CREDIT -->

                <div
                    class="gl-journal-summary-line"
                >

                    <span
                        class="gl-journal-summary-label"
                    >

                        Credits

                    </span>


                    <span
                        class="gl-journal-summary-separator"
                    >

                        :

                    </span>


                    <strong
                        class="gl-journal-summary-value"
                    >

                        ${
                            this.formatCurrency(
                                totalCredit
                            )
                        }

                    </strong>

                </div>


            </td>


            <!-- ==========================================
                 CREATED
            =========================================== -->

            <td class="gl-journal-created-cell">

                ${createdAt}

            </td>


            <!-- ==========================================
                 STATUS
            =========================================== -->

            <td class="gl-journal-status-cell">

                ${
                    this.renderStatusBadge(
                        journal?.status
                    )
                }

            </td>


            <!-- ==========================================
                 ACTION
            =========================================== -->

            <td class="gl-journal-action-cell">

                <div
                    class="
                        dropdown
                        gl-action-dropdown
                    "
                >

                    <button
                        type="button"
                        class="
                            btn
                            btn-sm
                            gl-action-trigger
                        "
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="outside"
                        aria-expanded="false"
                        title="Actions"
                    >

                        <i
                            class="fa-solid fa-gear"
                        ></i>

                    </button>


                    <div
                        class="
                            dropdown-menu
                            dropdown-menu-end
                            gl-action-menu
                        "
                    >

                        ${
                            this.renderActionButtons(
                                journal
                            )
                        }

                    </div>

                </div>

            </td>


        </tr>

    `;

}
/*
==========================================================
FORMAT DISPLAY DATE
==========================================================
*/

formatDisplayDate(
    value
) {

    if (
        !value
    ) {

        return "-";

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "en-GB",
        {

            day: "numeric",

            month: "short",

            year: "numeric"

        }
    );

}


/*
==========================================================
FORMAT CREATED DATE TIME
==========================================================
*/

formatCreatedDateTime(
    value
) {

    if (
        !value
    ) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    const datePart =
        date.toLocaleDateString(
            "sv-SE"
        );


    const timePart =
        date.toLocaleTimeString(
            "en-GB",
            {

                hour: "2-digit",

                minute: "2-digit",

                second: "2-digit",

                hour12: false

            }
        );


    return `

        <div class="gl-created-date">

            ${datePart}

        </div>

        <div class="gl-created-time">

            ${timePart}

        </div>

    `;

}


/*
==========================================================
ESCAPE HTML
==========================================================
*/

escapeHTML(
    value
) {

    return String(
        value
        ?? ""
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

}
/*
==========================================================
RENDER SOURCE BADGE
==========================================================
*/

renderSourceBadge(journal) {

    let source =
        String(
            journal?.source_module || ""
        )
        .trim()
        .toUpperCase();


    /*
    ======================================================
    LEGACY DATA
    ======================================================
    */

    if (
        source === "GENERAL"
    ) {

        source = "GLJ";

    }


    if (
        source === "ACCOUNT PAYABLE"
    ) {

        source = "AP";

    }


    if (
        source === "ACCOUNT RECEIVABLE"
    ) {

        source = "AR";

    }


    /*
    ======================================================
    AP
    ======================================================
    */

    if (source === "AP") {

        return `
            <span class="badge bg-warning text-dark">
                AP
            </span>
        `;

    }


    /*
    ======================================================
    AR
    ======================================================
    */

    if (source === "AR") {

        return `
            <span class="badge bg-success">
                AR
            </span>
        `;

    }


    /*
    ======================================================
    GL JOURNAL
    ======================================================
    */

    return `
        <span class="badge bg-primary">
            GLJ
        </span>
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
FINAL
VOID SAME AS DRAFT
==========================================================
*/

renderActionButtons(
    journal
) {

    /*
    ======================================================
    STATUS
    ======================================================
    */

    const status =
        String(
            journal.status
            || "Draft"
        )
        .trim()
        .toLowerCase();


    /*
    ======================================================
    DRAFT
    ======================================================
    */

    if (
        status === "draft"
    ) {

        return `

            <button
                type="button"
                class="
                    dropdown-item
                    btn-edit-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-pen"></i>

                Edit

            </button>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-post-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-check"></i>

                Post

            </button>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-view-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-eye"></i>

                View

            </button>


            <div class="dropdown-divider"></div>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-duplicate-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-copy"></i>

                Duplicate

            </button>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-delete-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-trash"></i>

                Delete

            </button>

        `;

    }


    /*
    ======================================================
    POSTED
    ======================================================
    */

    if (
        status === "posted"
    ) {

        return `

            <button
                type="button"
                class="
                    dropdown-item
                    btn-view-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-eye"></i>

                View

            </button>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-voucher-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-file-invoice"></i>

                Voucher

            </button>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-duplicate-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-copy"></i>

                Duplicate

            </button>


            <div class="dropdown-divider"></div>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-void-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-ban"></i>

                Void

            </button>

        `;

    }


    /*
    ======================================================
    VOID
    SAME ACTION AS DRAFT
    ======================================================
    */

    if (
        status === "void"
    ) {

        return `

            <button
                type="button"
                class="
                    dropdown-item
                    btn-edit-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-pen"></i>

                Edit

            </button>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-post-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-check"></i>

                Post

            </button>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-view-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-eye"></i>

                View

            </button>


            <div class="dropdown-divider"></div>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-duplicate-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-copy"></i>

                Duplicate

            </button>


            <button
                type="button"
                class="
                    dropdown-item
                    btn-delete-journal
                "
                data-id="${journal.id}"
            >

                <i class="fa-solid fa-trash"></i>

                Delete

            </button>

        `;

    }


    /*
    ======================================================
    FALLBACK
    ======================================================
    */

    return `

        <button
            type="button"
            class="
                dropdown-item
                btn-view-journal
            "
            data-id="${journal.id}"
        >

            <i class="fa-solid fa-eye"></i>

            View

        </button>

    `;

}
/*
==========================================================
INITIALIZE DETAIL ACCOUNT TOM SELECT
==========================================================
*/

initializeDetailAccountTomSelect() {

    /*
    ======================================================
    DESTROY OLD INSTANCE
    ======================================================
    */

    if (
        this.debitAccountTomSelect
    ) {

        this.debitAccountTomSelect.destroy();

        this.debitAccountTomSelect = null;

    }


    if (
        this.creditAccountTomSelect
    ) {

        this.creditAccountTomSelect.destroy();

        this.creditAccountTomSelect = null;

    }


    /*
    ======================================================
    DEBIT ACCOUNT
    ======================================================
    */

    const debitElement =
        document.getElementById(
            "detail-debit-account"
        );


    if (
        debitElement
    ) {

        this.debitAccountTomSelect =
            new TomSelect(

                debitElement,

                {

                    create: false,

                    allowEmptyOption: true,

                    placeholder:
                        "Select Chart of Account",

                    searchField: [
                        "text"
                    ],

                    sortField: {
                        field: "text",
                        direction: "asc"
                    },

                    maxOptions: 500

                }

            );

    }


    /*
    ======================================================
    CREDIT ACCOUNT
    ======================================================
    */

    const creditElement =
        document.getElementById(
            "detail-credit-account"
        );


    if (
        creditElement
    ) {

        this.creditAccountTomSelect =
            new TomSelect(

                creditElement,

                {

                    create: false,

                    allowEmptyOption: true,

                    placeholder:
                        "Select Chart of Account",

                    searchField: [
                        "text"
                    ],

                    sortField: {
                        field: "text",
                        direction: "asc"
                    },

                    maxOptions: 500

                }

            );

    }

}
/*
==========================================================
GET JOURNAL DETAIL CATEGORY
FINAL
DPP / TAX (+) / TAX (-)
==========================================================
*/

getJournalDetailCategory(
    detail
) {

    /*
    ======================================================
    EXPLICIT TYPE
    ======================================================
    */

    const rawType =
        String(
            detail.line_type
            ??
            detail.detail_type
            ??
            detail.tax_type
            ??
            detail.source_line_type
            ??
            ""
        )
        .trim()
        .toUpperCase();


    /*
    ======================================================
    DPP
    ======================================================
    */

    if (
        rawType === "DPP"
        ||
        rawType === "BASE"
        ||
        rawType === "PRINCIPAL"
    ) {

        return "DPP";

    }


    /*
    ======================================================
    TAX PLUS
    ======================================================
    */

    if (
        rawType === "PLUS"
        ||
        rawType === "TAX_PLUS"
        ||
        rawType === "TAX (+)"
        ||
        rawType === "INPUT TAX"
        ||
        rawType === "VAT INPUT"
    ) {

        return "TAX (+)";

    }


    /*
    ======================================================
    TAX MINUS
    ======================================================
    */

    if (
        rawType === "MINUS"
        ||
        rawType === "TAX_MINUS"
        ||
        rawType === "TAX (-)"
        ||
        rawType === "WITHHOLDING TAX"
        ||
        rawType === "WHT"
    ) {

        return "TAX (-)";

    }


    /*
    ======================================================
    DESCRIPTION FALLBACK
    ======================================================
    */

    const description =
        String(
            detail.description
            || ""
        )
        .trim()
        .toUpperCase();


    /*
======================================================
TAX MINUS FALLBACK
======================================================
*/

if (
    description.includes("TAX (-)")
    ||
    description.includes("TAX_MINUS")
    ||
    description.includes("PPH")
    ||
    description.includes("WITHHOLDING")
    ||
    description.includes("WHT")
) {

    return "TAX (-)";

}


    /*
======================================================
TAX PLUS FALLBACK
======================================================
*/

if (
    description.includes("TAX (+)")
    ||
    description.includes("TAX_PLUS")
    ||
    description.includes("PPN")
    ||
    description.includes("PAJAK MASUKAN")
    ||
    description.includes("PAJAK KELUARAN")
    ||
    description.includes("VAT INPUT")
    ||
    description.includes("VAT OUTPUT")
) {

    return "TAX (+)";

}


    /*
    ======================================================
    DEFAULT
    ======================================================
    */

    return "DPP";

}
/*
==========================================================
GET JOURNAL DETAIL DESCRIPTION
FINAL

RULE:
AP / AR
- DPP     = Header Description
- TAX (+) = Header Description
- TAX (-) = Header Description

GLJ MANUAL
- Use Detail Description
==========================================================
*/

getJournalDetailDescription(
    detail
) {

    /*
    ======================================================
    SOURCE MODULE
    ======================================================
    */

    const source =
        String(
            this.currentJournal?.source_module
            ||
            this.currentJournal?.source
            ||
            "GLJ"
        )
        .trim()
        .toUpperCase();


    /*
    ======================================================
    CHECK AP
    ======================================================
    */

    const isAP =
        source === "AP"
        ||
        source === "ACCOUNT PAYABLE"
        ||
        source === "PAYABLE";


    /*
    ======================================================
    CHECK AR
    ======================================================
    */

    const isAR =
        source === "AR"
        ||
        source === "ACCOUNT RECEIVABLE"
        ||
        source === "RECEIVABLE";


    /*
    ======================================================
    AP / AR GENERATED JOURNAL

    ALL DETAIL DESCRIPTION FOLLOW HEADER DESCRIPTION.

    DPP
    TAX (+)
    TAX (-)

    Tax information is NOT appended to description.
    ======================================================
    */

    if (
        isAP
        ||
        isAR
    ) {

        const headerDescription =
            String(
                this.currentJournal?.source_description
                ||
                this.currentJournal?.header_description
                ||
                this.currentJournal?.description
                ||
                ""
            )
            .trim();


        return (
            headerDescription
            ||
            "-"
        );

    }


    /*
    ======================================================
    MANUAL GL JOURNAL

    KEEP ORIGINAL DETAIL DESCRIPTION
    ======================================================
    */

    const detailDescription =
        String(
            detail?.description
            ||
            ""
        )
        .trim();


    return (
        detailDescription
        ||
        "-"
    );

}
/*
==========================================================
RENDER DETAIL TABLE
FINAL
==========================================================
*/

renderDetailTable() {

    /*
    ======================================================
    VALIDATE TABLE BODY
    ======================================================
    */

    if (
        !this.detailTableBody
    ) {

        return;

    }


    /*
    ======================================================
    CLEAR TABLE
    ======================================================
    */

    this.detailTableBody.innerHTML =
        "";


    /*
    ======================================================
    EMPTY DETAIL
    ======================================================
    */

    if (
        !Array.isArray(
            this.detailLines
        )
        ||
        this.detailLines.length === 0
    ) {

        this.detailTableBody.innerHTML = `

            <tr id="journal-empty-row">

                <td
                    colspan="6"
                    class="
                        text-center
                        py-5
                        text-muted
                    "
                >

                    No journal detail available.

                </td>

            </tr>

        `;


        /*
        ======================================================
        SUMMARY
        ======================================================
        */

        this.calculateSummary();

        return;

    }


    /*
    ======================================================
    RENDER DETAIL
    ======================================================
    */

    this.detailLines.forEach(

        (
            detail,
            index
        ) => {

            this.detailTableBody.insertAdjacentHTML(

                "beforeend",

                this.createDetailRow(
                    detail,
                    index
                )

            );

        }

    );


    /*
    ======================================================
    SUMMARY
    ======================================================
    */

    this.calculateSummary();

}
/*
==========================================================
CREATE DETAIL ROW
FINAL

ACCOUNT ROW FIRST
DESCRIPTION BELOW

DRAFT / VOID
- EDIT
- DELETE

POSTED
- READ ONLY
==========================================================
*/

createDetailRow(
    detail,
    index
) {

    /*
    ======================================================
    CATEGORY
    ======================================================
    */

    const category =
        this.getJournalDetailCategory(
            detail
        );


    /*
    ======================================================
    CATEGORY CLASS
    ======================================================
    */

    let categoryClass =
        "journal-detail-category-dpp";


    if (
        category === "TAX (+)"
    ) {

        categoryClass =
            "journal-detail-category-plus";

    }


    if (
        category === "TAX (-)"
    ) {

        categoryClass =
            "journal-detail-category-minus";

    }


    /*
    ======================================================
    FINAL DESCRIPTION
    ======================================================
    */

    const description =
        this.getJournalDetailDescription(
            detail
        );


    /*
    ======================================================
    DEBIT ACCOUNT
    ======================================================
    */

    const debitAccount =
        detail.debit_account_code

            ? `${
                detail.debit_account_code
            } - ${
                detail.debit_account_name
                || ""
            }`

            : (
                detail.debit_account_name
                ||
                detail.debit_account
                ||
                "-"
            );


    /*
    ======================================================
    CREDIT ACCOUNT
    ======================================================
    */

    const creditAccount =
        detail.credit_account_code

            ? `${
                detail.credit_account_code
            } - ${
                detail.credit_account_name
                || ""
            }`

            : (
                detail.credit_account_name
                ||
                detail.credit_account
                ||
                "-"
            );


    /*
    ======================================================
    BUSINESS PARTNER
    ======================================================
    */

    const businessPartner =
        detail.business_partner_name
        ||
        detail.bp_name
        ||
        "-";


    /*
    ======================================================
    AMOUNT
    ======================================================
    */

    const amount =
        Number(
            detail.amount
            || 0
        );


    /*
    ======================================================
    JOURNAL STATUS
    ======================================================
    */

    const journalStatus =
        String(
            this.currentJournal?.status
            || "Draft"
        )
        .trim()
        .toLowerCase();


    /*
    ======================================================
    ALLOW EDIT

    DRAFT = EDITABLE
    VOID  = EDITABLE
    POSTED = READ ONLY
    ======================================================
    */

    const allowEdit =
        journalStatus === "draft"
        ||
        journalStatus === "void";


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return `


        <!-- ==========================================
             ACCOUNT JOURNAL ROW
        =========================================== -->

        <tr
            class="journal-detail-account-row"
            data-index="${index}"
        >


            <!-- NO -->

            <td class="journal-detail-no-cell">

                ${index + 1}

            </td>


            <!-- DEBIT ACCOUNT -->

            <td class="journal-detail-debit-cell">

                ${this.escapeHTML(
                    debitAccount
                )}

            </td>


            <!-- CREDIT ACCOUNT -->

            <td class="journal-detail-credit-cell">

                ${this.escapeHTML(
                    creditAccount
                )}

            </td>


            <!-- AMOUNT -->

            <td class="journal-detail-amount-cell">

                ${this.formatCurrency(
                    amount
                )}

            </td>


            <!-- BUSINESS PARTNER -->

            <td class="journal-detail-bp-cell">

                ${this.escapeHTML(
                    businessPartner
                )}

            </td>


            <!-- ACTION -->

            <td class="journal-detail-action-cell">

                ${
                    allowEdit

                        ? `

                            <div
                                class="
                                    btn-group
                                    btn-group-sm
                                "
                            >

                                <!-- EDIT -->

                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-outline-primary
                                        btn-edit-detail
                                    "
                                    data-index="${index}"
                                    title="Edit"
                                >

                                    <i class="fa-solid fa-pen"></i>

                                </button>


                                <!-- DELETE -->

                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-outline-danger
                                        btn-delete-detail
                                    "
                                    data-index="${index}"
                                    title="Delete"
                                >

                                    <i class="fa-solid fa-trash"></i>

                                </button>

                            </div>

                        `

                        : `

                            <span
                                class="text-muted"
                                title="Posted journal is read only"
                            >

                                <i class="fa-solid fa-lock"></i>

                            </span>

                        `
                }

            </td>


        </tr>


        <!-- ==========================================
             DESCRIPTION BELOW ACCOUNT
        =========================================== -->

        <tr
            class="journal-detail-description-row"
            data-index="${index}"
        >

            <td
                colspan="6"
                class="journal-detail-description-cell"
            >

                <div class="journal-detail-description-wrap">


                    <!-- CATEGORY -->

                    <span
                        class="
                            journal-detail-category
                            ${categoryClass}
                        "
                    >

                        ${category}

                    </span>


                    <!-- LABEL -->

                    <span class="journal-detail-description-label">

                        Description

                    </span>


                    <!-- SEPARATOR -->

                    <span class="journal-detail-description-separator">

                        :

                    </span>


                    <!-- DESCRIPTION -->

                    <span class="journal-detail-description-value">

                        ${this.escapeHTML(
                            description
                        )}

                    </span>


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
FINAL
==========================================================
*/

async openAddJournal() {

    try {

        /*
        ======================================================
        MODE
        ======================================================
        */

        this.currentMode =
            "add";


        /*
        ======================================================
        RESET CURRENT JOURNAL
        ======================================================
        */

        this.currentJournal =
            null;


        /*
        ======================================================
        IMPORTANT
        RESET READ ONLY STATE

        IF PREVIOUSLY OPENED FROM VIEW MODE,
        BUTTONS MAY STILL HAVE display:none
        ======================================================
        */

        this.setJournalReadOnly(
            false
        );


        /*
        ======================================================
        RESET DETAIL
        ======================================================
        */

        this.detailLines =
            [];


        this.currentDetail =
            null;


        this.currentDetailIndex =
            -1;


        /*
        ======================================================
        CLEAR FORM
        ======================================================
        */

        this.clearJournalForm();


        /*
        ======================================================
        LOAD MASTER DATA
        ======================================================
        */

        await this.loadMasterData();


        /*
        ======================================================
        INITIALIZE HEADER
        ======================================================
        */

        await this.initializeJournalHeader();


        /*
        ======================================================
        FORCE DRAFT STATUS
        ======================================================
        */

        if (
            this.cboStatus
        ) {

            this.cboStatus.value =
                "Draft";

        }


        this.updateJournalHeaderStatus(
            "Draft"
        );


        /*
        ======================================================
        ENABLE HEADER INPUT
        ======================================================
        */

        if (
            this.txtAccountingDate
        ) {

            this.txtAccountingDate.disabled =
                false;

            this.txtAccountingDate.readOnly =
                false;

        }


        if (
            this.txtDescription
        ) {

            this.txtDescription.disabled =
                false;

            this.txtDescription.readOnly =
                false;

        }


        const referenceNo =
            document.getElementById(
                "journal-reference-no"
            );


        if (
            referenceNo
        ) {

            referenceNo.disabled =
                false;

            referenceNo.readOnly =
                false;

        }


        /*
        ======================================================
        FORCE BUTTON VISIBILITY
        ======================================================
        */

        if (
            this.btnAddLine
        ) {

            this.btnAddLine.style.display =
                "";

            this.btnAddLine.disabled =
                false;

        }


        if (
            this.btnSaveJournal
        ) {

            this.btnSaveJournal.style.display =
                "";

            this.btnSaveJournal.disabled =
                false;

        }


        if (
            this.btnPostJournal
        ) {

            this.btnPostJournal.style.display =
                "";

            this.btnPostJournal.disabled =
                false;

        }


        /*
        ======================================================
        REFRESH DETAIL
        ======================================================
        */

        this.refreshDetailView();


        /*
        ======================================================
        SHOW MODAL
        ======================================================
        */

        this.modal.show();

    }

    catch (
        error
    ) {

        console.error(
            "GeneralJournal.openAddJournal:",
            error
        );


        window.App?.showError?.(
            error?.message
            ||
            "Failed to open Add Journal."
        );

    }

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
VALIDATE ACCOUNTING DATE PERIOD
GL JOURNAL
BASED ON ACCOUNTING DATE
FINAL
==========================================================
*/

async validateAccountingDatePeriod() {

    try {

        /*
        ======================================================
        ACCOUNTING DATE
        ======================================================
        */

        const accountingDate =
            String(
                this.txtAccountingDate?.value
                ||
                ""
            )
            .trim();


        /*
        ======================================================
        EMPTY DATE
        ======================================================
        */

        if (
            !accountingDate
        ) {

            if (
                this.txtPostingPeriod
            ) {

                this.txtPostingPeriod.value =
                    "";

            }


            if (
                this.btnAddLine
            ) {

                this.btnAddLine.disabled =
                    true;

            }


            if (
                this.btnSaveJournal
            ) {

                this.btnSaveJournal.disabled =
                    true;

            }


            if (
                this.btnPostJournal
            ) {

                this.btnPostJournal.disabled =
                    true;

            }


            return false;

        }


        /*
        ======================================================
        POSTING PERIOD
        ALWAYS BASED ON ACCOUNTING DATE
        ======================================================
        */

        if (
            this.txtPostingPeriod
        ) {

            this.txtPostingPeriod.value =
                this.getPostingPeriod(
                    accountingDate
                );

        }


        /*
        ======================================================
        GET ACCOUNTING PERIOD
        ======================================================
        */

        const {

            data:
                accountingPeriod,

            error:
                accountingPeriodError

        } =
            await supabase

                .from(
                    "mst_accounting_period"
                )

                .select(`
                    id,
                    period,
                    month,
                    year,
                    start_date,
                    end_date,
                    status
                `)

                .lte(
                    "start_date",
                    accountingDate
                )

                .gte(
                    "end_date",
                    accountingDate
                )

                .maybeSingle();


        /*
        ======================================================
        DATABASE ERROR
        ======================================================
        */

        if (
            accountingPeriodError
        ) {

            throw accountingPeriodError;

        }


        /*
        ======================================================
        PERIOD NOT AVAILABLE
        ======================================================
        */

        if (
            !accountingPeriod
        ) {

            /*
            ==================================================
            BLOCK JOURNAL INPUT
            ==================================================
            */

            if (
                this.btnAddLine
            ) {

                this.btnAddLine.disabled =
                    true;

            }


            if (
                this.btnSaveJournal
            ) {

                this.btnSaveJournal.disabled =
                    true;

            }


            if (
                this.btnPostJournal
            ) {

                this.btnPostJournal.disabled =
                    true;

            }


            this.showError(
                `Accounting Period for ${accountingDate} is not available or has not been opened.`
            );


            return false;

        }


        /*
        ======================================================
        NORMALIZE STATUS
        ======================================================
        */

        const periodStatus =
            String(
                accountingPeriod.status
                ||
                ""
            )
            .trim()
            .toLowerCase();


        /*
        ======================================================
        CLOSED PERIOD
        ======================================================
        */

        if (
            periodStatus !==
            "open"
        ) {

            /*
            ==================================================
            BLOCK JOURNAL INPUT
            ==================================================
            */

            if (
                this.btnAddLine
            ) {

                this.btnAddLine.disabled =
                    true;

            }


            if (
                this.btnSaveJournal
            ) {

                this.btnSaveJournal.disabled =
                    true;

            }


            if (
                this.btnPostJournal
            ) {

                this.btnPostJournal.disabled =
                    true;

            }


            this.showError(
                `Accounting Period ${accountingPeriod.period} is Closed. Journal cannot be entered.`
            );


            return false;

        }


        /*
        ======================================================
        PERIOD OPEN
        ENABLE JOURNAL INPUT
        ======================================================
        */

        if (
            this.btnAddLine
        ) {

            this.btnAddLine.disabled =
                false;

        }


        if (
            this.btnSaveJournal
        ) {

            this.btnSaveJournal.disabled =
                false;

        }


        if (
            this.btnPostJournal
        ) {

            this.btnPostJournal.disabled =
                false;

        }


        /*
        ======================================================
        DEBUG
        ======================================================
        */

        console.log(
            "GL JOURNAL ACCOUNTING DATE PERIOD:",
            {

                accounting_date:
                    accountingDate,

                period:
                    accountingPeriod.period,

                status:
                    accountingPeriod.status

            }
        );


        return true;

    }

    catch (
        error
    ) {

        console.error(
            "GeneralJournal.validateAccountingDatePeriod:",
            error
        );


        /*
        ======================================================
        BLOCK BUTTON WHEN VALIDATION FAILED
        ======================================================
        */

        if (
            this.btnAddLine
        ) {

            this.btnAddLine.disabled =
                true;

        }


        if (
            this.btnSaveJournal
        ) {

            this.btnSaveJournal.disabled =
                true;

        }


        if (
            this.btnPostJournal
        ) {

            this.btnPostJournal.disabled =
                true;

        }


        this.showError(
            error?.message
            ||
            "Failed to validate Accounting Period."
        );


        return false;

    }

}
/*
==========================================================
INITIALIZE JOURNAL HEADER
FINAL WITH ACCOUNTING PERIOD VALIDATION
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

    if (
        this.currentMode ===
        "add"
    ) {

        /*
        ==================================================
        DOCUMENT NUMBER
        ==================================================
        */

        this.txtJournalNo.value =
            await this.service
                .generateDocumentNumber();


        /*
        ==================================================
        ACCOUNTING DATE
        ==================================================
        */

        this.txtAccountingDate.value =
            new Date()
                .toISOString()
                .substring(
                    0,
                    10
                );


        /*
        ==================================================
        POSTING PERIOD
        ==================================================
        */

        if (
            this.txtPostingPeriod
        ) {

            this.txtPostingPeriod.value =
                this.getPostingPeriod(
                    this.txtAccountingDate.value
                );

        }


        /*
        ==================================================
        STATUS
        ==================================================
        */

        this.cboStatus.value =
            "Draft";


        this.updateJournalHeaderStatus(
            "Draft"
        );


        /*
        ==================================================
        VALIDATE ACCOUNTING PERIOD
        BASED ON DEFAULT ACCOUNTING DATE
        ==================================================
        */

        await this.validateAccountingDatePeriod();


        return;

    }


    /*
    ======================================================
    EDIT MODE
    ======================================================
    */

    if (
        !this.currentJournal
    ) {

        return;

    }


    /*
    ======================================================
    DOCUMENT NUMBER
    ======================================================
    */

    this.txtJournalNo.value =
        this.currentJournal
            .journal_no
        ??
        "";


    /*
    ======================================================
    ACCOUNTING DATE
    ======================================================
    */

    this.txtAccountingDate.value =
        this.currentJournal
            .journal_date
        ??
        "";


    /*
    ======================================================
    POSTING PERIOD
    ======================================================
    */

    if (
        this.txtPostingPeriod
    ) {

        this.txtPostingPeriod.value =

            this.currentJournal
                .posting_period

            ||

            this.getPostingPeriod(
                this.currentJournal
                    .journal_date
            );

    }


    /*
    ======================================================
    DESCRIPTION
    ======================================================
    */

    if (
        this.txtDescription
    ) {

        this.txtDescription.value =
            this.currentJournal
                .description
        ??
        "";

    }


    /*
    ======================================================
    STATUS
    ======================================================
    */

    if (
        this.cboStatus
    ) {

        const status =
            this.currentJournal
                .status
        ??
        "Draft";


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
FINAL
==========================================================
*/

async openEditJournal(
    id
) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (
            !id
        ) {

            return;

        }


        /*
        ======================================================
        MODE
        ======================================================
        */

        this.currentMode =
            "edit";


        /*
        ======================================================
        LOAD MASTER
        ======================================================
        */

        await this.loadMasterData();


        /*
        ======================================================
        LOAD JOURNAL
        ======================================================
        */

        await this.loadJournal(
            id
        );


        /*
        ======================================================
        FILL FORM
        ======================================================
        */

        this.fillJournalForm();


        /*
        ======================================================
        RESET READ ONLY BEFORE SHOW
        ======================================================
        */

        this.setJournalReadOnly(
            false
        );


        /*
        ======================================================
        SHOW
        ======================================================
        */

        this.modal.show();

    }

    catch (
        error
    ) {

        console.error(
            "GeneralJournal.openEditJournal:",
            error
        );


        window.App?.showError?.(
            error?.message
            ||
            "Failed to open Journal."
        );

    }

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
HANDLE AP INVOICE / AP PAYMENT / AR PAYMENT
==========================================================
*/

async deleteJournal(id) {

    if (!id) {
        return;
    }

    try {

        /*
        ==================================================
        GET JOURNAL BEFORE DELETE
        ==================================================
        */

        const journal =
            await this.service.getById(id);


        if (!journal) {

            throw new Error(
                "GL Journal not found."
            );

        }


        /*
        ==================================================
        NORMALIZE JOURNAL HEADER
        ==================================================
        */

        const journalHeader =
            journal?.header
            ||
            journal;


        const sourceModule =
            String(
                journalHeader?.source_module
                ||
                ""
            )
            .trim()
            .toUpperCase();


        const sourceDocumentType =
            String(
                journalHeader?.source_document_type
                ||
                ""
            )
            .trim()
            .toUpperCase();


        const sourceDocumentId =
            journalHeader?.source_document_id
            ||
            null;


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "========== DELETE GL JOURNAL =========="
        );

        console.log({

            journal_id:
                id,

            journal_no:
                journalHeader?.journal_no,

            source_module:
                sourceModule,

            source_document_type:
                sourceDocumentType,

            source_document_id:
                sourceDocumentId

        });

        console.log(
            "======================================="
        );


        /*
        ==================================================
        AP PAYMENT
        GET PAYMENT BEFORE DELETE
        ==================================================
        */

        let apPayment =
            null;


        if (
            sourceModule === "AP"
            &&
            sourceDocumentType === "AP_PAYMENT"
        ) {

            const {

                data,

                error

            } = await supabase

                .from(
                    "trx_ap_payment"
                )

                .select(`
                    id,
                    account_payable_id,
                    payment_amount,
                    gl_journal_id
                `)

                .eq(
                    "gl_journal_id",
                    id
                )

                .maybeSingle();


            if (error) {

                throw error;

            }


            apPayment =
                data
                ||
                null;

        }


        /*
        ==================================================
        AR PAYMENT
        GET PAYMENT BEFORE DELETE

        IMPORTANT:
        AR PAYMENT TABLE:
        trx_account_receivable_payment

        AMOUNT FIELD:
        amount
        ==================================================
        */

        let arPayment =
            null;


        if (
            sourceModule === "AR"
            &&
            sourceDocumentType === "AR_PAYMENT"
        ) {

            const {

                data,

                error

            } = await supabase

                .from(
                    "trx_account_receivable_payment"
                )

                .select(`
                    id,
                    account_receivable_id,
                    payment_date,
                    payment_account_id,
                    amount,
                    reference_no,
                    description,
                    gl_journal_id
                `)

                .eq(
                    "gl_journal_id",
                    id
                )

                .maybeSingle();


            if (error) {

                console.error(
                    "GET AR PAYMENT ERROR:",
                    error
                );

                throw error;

            }


            arPayment =
                data
                ||
                null;


            console.log(
                "AR PAYMENT BEFORE JOURNAL DELETE:",
                arPayment
            );

        }


        /*
==========================================================
AP INVOICE
VALIDATE BEFORE DELETE
FINAL
==========================================================
*/

let apInvoiceBeforeDelete =
    null;


let apInvoicePayments =
    [];


if (
    sourceModule === "AP"
    &&
    sourceDocumentType === "AP_INVOICE"
    &&
    sourceDocumentId
) {

    /*
    ======================================================
    GET AP INVOICE
    ======================================================
    */

    const {

        data: apInvoice,

        error: apInvoiceError

    } = await supabase

        .from(
            "trx_account_payable"
        )

        .select(`
            id,
            invoice_no,
            total_amount,
            paid_amount,
            outstanding_amount,
            status,
            gl_journal_id
        `)

        .eq(
            "id",
            sourceDocumentId
        )

        .maybeSingle();


    if (
        apInvoiceError
    ) {

        throw apInvoiceError;

    }


    if (
        !apInvoice
    ) {

        throw new Error(
            "Account Payable invoice not found."
        );

    }


    apInvoiceBeforeDelete =
        apInvoice;


    /*
    ======================================================
    GET ACTIVE AP PAYMENTS

    IMPORTANT:
    Do not depend only on paid_amount.

    Payment transaction is the actual source
    for determining whether AP already has payment.
    ======================================================
    */

    const {

        data: payments,

        error: paymentsError

    } = await supabase

        .from(
            "trx_ap_payment"
        )

        .select(`
            id,
            account_payable_id,
            payment_amount,
            gl_journal_id
        `)

        .eq(
            "account_payable_id",
            sourceDocumentId
        );


    if (
        paymentsError
    ) {

        throw paymentsError;

    }


    apInvoicePayments =
        (
            payments
            ||
            []
        )
        .filter(

            payment =>

                payment?.gl_journal_id

        );


    /*
    ======================================================
    DEBUG
    ======================================================
    */

    console.log(
        "AP INVOICE BEFORE DELETE:",
        apInvoiceBeforeDelete
    );


    console.log(
        "AP ACTIVE PAYMENTS:",
        apInvoicePayments
    );


    /*
    ======================================================
    PAYMENT EXISTS

    Invoice journal cannot be deleted before
    its payment journals are removed.
    ======================================================
    */

    if (
        apInvoicePayments.length > 0
    ) {

        const paymentCount =
            apInvoicePayments.length;


        const paymentAmount =
            apInvoicePayments.reduce(

                (
                    total,
                    payment
                ) => {

                    return (
                        total
                        +
                        Number(
                            payment?.payment_amount
                            ||
                            0
                        )
                    );

                },

                0

            );


        throw new Error(

            `Journal invoice AP tidak dapat dihapus karena terdapat ${paymentCount} pembayaran aktif sebesar ${this.formatCurrency(paymentAmount)}. Hapus Journal AP Payment terlebih dahulu.`

        );

    }

}

        /*
        ==================================================
        DELETE GL JOURNAL
        ==================================================
        */

        await this.service.delete(id);


        /*
        ==================================================
        AP INVOICE
        RETURN TO DRAFT
        ==================================================
        */

        if (
            sourceModule === "AP"
            &&
            sourceDocumentType === "AP_INVOICE"
            &&
            sourceDocumentId
        ) {

            const totalAmount =
                Number(
                    apInvoiceBeforeDelete?.total_amount
                    ||
                    0
                );


            const {

                error: resetAPError

            } = await supabase

                .from(
                    "trx_account_payable"
                )

                .update({

                    status:
                        "Draft",

                    gl_journal_id:
                        null,

                    paid_amount:
                        0,

                    outstanding_amount:
                        totalAmount

                })

                .eq(
                    "id",
                    sourceDocumentId
                );


            if (resetAPError) {

                throw resetAPError;

            }

        }


        /*
        ==================================================
        AP PAYMENT
        DELETE PAYMENT RECORD
        ==================================================
        */

        if (
            sourceModule === "AP"
            &&
            sourceDocumentType === "AP_PAYMENT"
            &&
            apPayment
        ) {

            const {

                error: deletePaymentError

            } = await supabase

                .from(
                    "trx_ap_payment"
                )

                .delete()

                .eq(
                    "id",
                    apPayment.id
                );


            if (deletePaymentError) {

                throw deletePaymentError;

            }


            /*
            ==================================================
            RECALCULATE AP
            ==================================================
            */

            const apService =
                window.apService;


            if (
                apService
                &&
                typeof apService.updatePaymentStatus
                ===
                "function"
            ) {

                await apService.updatePaymentStatus(
                    apPayment.account_payable_id
                );

            }

            else {

                /*
                ==============================================
                GET AP INVOICE
                ==============================================
                */

                const {

                    data: apInvoice,

                    error: apInvoiceError

                } = await supabase

                    .from(
                        "trx_account_payable"
                    )

                    .select(`
                        id,
                        total_amount
                    `)

                    .eq(
                        "id",
                        apPayment.account_payable_id
                    )

                    .maybeSingle();


                if (apInvoiceError) {

                    throw apInvoiceError;

                }


                /*
                ==============================================
                GET REMAINING AP PAYMENTS
                ==============================================
                */

                const {

                    data: remainingPayments,

                    error: remainingPaymentsError

                } = await supabase

                    .from(
                        "trx_ap_payment"
                    )

                    .select(`
                        payment_amount,
                        gl_journal_id
                    `)

                    .eq(
                        "account_payable_id",
                        apPayment.account_payable_id
                    )

                    .not(
                        "gl_journal_id",
                        "is",
                        null
                    );


                if (remainingPaymentsError) {

                    throw remainingPaymentsError;

                }


                /*
                ==============================================
                CALCULATE AP
                ==============================================
                */

                const totalAmount =
                    Number(
                        apInvoice?.total_amount
                        ||
                        0
                    );


                const paidAmount =
                    (
                        remainingPayments
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


                const outstandingAmount =
                    Math.max(
                        totalAmount
                        -
                        paidAmount,
                        0
                    );


                let status =
                    "Complete";


                if (
                    paidAmount > 0
                    &&
                    paidAmount < totalAmount
                ) {

                    status =
                        "Partial Paid";

                }


                if (
                    totalAmount > 0
                    &&
                    paidAmount >= totalAmount
                ) {

                    status =
                        "Paid";

                }


                /*
                ==============================================
                UPDATE AP
                ==============================================
                */

                const {

                    error: updateAPError

                } = await supabase

                    .from(
                        "trx_account_payable"
                    )

                    .update({

                        paid_amount:
                            paidAmount,

                        outstanding_amount:
                            outstandingAmount,

                        status:
                            status

                    })

                    .eq(
                        "id",
                        apPayment.account_payable_id
                    );


                if (updateAPError) {

                    throw updateAPError;

                }

            }

        }


        /*
        ==================================================
        AR PAYMENT
        DELETE PAYMENT RECORD
        AND RESTORE AR PAYMENT STATUS
        ==================================================
        */

        if (
            sourceModule === "AR"
            &&
            sourceDocumentType === "AR_PAYMENT"
            &&
            arPayment
        ) {

            /*
            ==============================================
            ACCOUNT RECEIVABLE ID
            ==============================================
            */

            const accountReceivableId =
                arPayment.account_receivable_id;


            if (!accountReceivableId) {

                throw new Error(
                    "Account Receivable ID was not found on AR Payment."
                );

            }


            console.log(
                "========== AR PAYMENT ROLLBACK =========="
            );

            console.log(
                "PAYMENT:",
                arPayment
            );


            /*
            ==============================================
            DELETE AR PAYMENT
            ==============================================
            */

            const {

                error:
                    deleteARPaymentError

            } = await supabase

                .from(
                    "trx_account_receivable_payment"
                )

                .delete()

                .eq(
                    "id",
                    arPayment.id
                );


            if (
                deleteARPaymentError
            ) {

                console.error(
                    "DELETE AR PAYMENT ERROR:",
                    deleteARPaymentError
                );

                throw deleteARPaymentError;

            }


            console.log(
                "AR PAYMENT DELETED:",
                arPayment.id
            );


            /*
            ==============================================
            GET ACCOUNT RECEIVABLE
            ==============================================
            */

            const {

                data:
                    arInvoice,

                error:
                    arInvoiceError

            } = await supabase

                .from(
                    "trx_account_receivable"
                )

                .select(`
                    id,
                    invoice_no,
                    total_amount,
                    paid_amount,
                    outstanding_amount,
                    status,
                    gl_journal_id
                `)

                .eq(
                    "id",
                    accountReceivableId
                )

                .maybeSingle();


            if (
                arInvoiceError
            ) {

                throw arInvoiceError;

            }


            if (
                !arInvoice
            ) {

                throw new Error(
                    "Account Receivable not found."
                );

            }


            /*
            ==============================================
            GET REMAINING AR PAYMENTS
            ==============================================
            */

            const {

                data:
                    remainingARPayments,

                error:
                    remainingARPaymentsError

            } = await supabase

                .from(
                    "trx_account_receivable_payment"
                )

                .select(`
                    id,
                    amount,
                    gl_journal_id
                `)

                .eq(
                    "account_receivable_id",
                    accountReceivableId
                );


            if (
                remainingARPaymentsError
            ) {

                throw remainingARPaymentsError;

            }


            /*
            ==============================================
            TOTAL AR
            ==============================================
            */

            const totalAmount =
                Number(
                    arInvoice.total_amount
                    ||
                    0
                );


            /*
            ==============================================
            CALCULATE REMAINING PAYMENT
            ==============================================
            */

            const paidAmount =
                (
                    remainingARPayments
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
                                payment.amount
                                ||
                                0
                            )
                        );

                    },
                    0
                );


            /*
            ==============================================
            OUTSTANDING
            ==============================================
            */

            const outstandingAmount =
                Math.max(
                    totalAmount
                    -
                    paidAmount,
                    0
                );


            /*
            ==============================================
            AR TECHNICAL STATUS

            NO PAYMENT
            = COMPLETE

            PARTIAL PAYMENT
            = PARTIAL PAID

            FULL PAYMENT
            = PAID

            UI CAN DISPLAY COMPLETE + PAID 0
            AS "UNPAID"
            ==============================================
            */

            let arStatus =
                "Complete";


            if (
                paidAmount > 0
                &&
                outstandingAmount > 0
            ) {

                arStatus =
                    "Partial Paid";

            }


            if (
                totalAmount > 0
                &&
                paidAmount >= totalAmount
            ) {

                arStatus =
                    "Paid";

            }


            /*
            ==============================================
            UPDATE ACCOUNT RECEIVABLE
            ==============================================
            */

            const {

                data:
                    updatedAR,

                error:
                    updateARError

            } = await supabase

                .from(
                    "trx_account_receivable"
                )

                .update({

                    paid_amount:
                        paidAmount,

                    outstanding_amount:
                        outstandingAmount,

                    status:
                        arStatus

                })

                .eq(
                    "id",
                    accountReceivableId
                )

                .select(`
                    id,
                    invoice_no,
                    total_amount,
                    paid_amount,
                    outstanding_amount,
                    status,
                    gl_journal_id
                `)

                .single();


            if (
                updateARError
            ) {

                throw updateARError;

            }


            /*
            ==============================================
            DEBUG
            ==============================================
            */

            console.log(
                "AR PAYMENT ROLLBACK RESULT:",
                {

                    account_receivable_id:
                        accountReceivableId,

                    invoice_no:
                        updatedAR.invoice_no,

                    total_amount:
                        updatedAR.total_amount,

                    paid_amount:
                        updatedAR.paid_amount,

                    outstanding_amount:
                        updatedAR.outstanding_amount,

                    status:
                        updatedAR.status,

                    original_gl_journal_id:
                        updatedAR.gl_journal_id,

                    remaining_payment_count:
                        remainingARPayments?.length
                        ||
                        0

                }
            );


            console.log(
                "========================================="
            );

        }


        /*
        ==================================================
        CLOSE DELETE MODAL
        ==================================================
        */

        if (
            this.deleteJournalModal
        ) {

            this.deleteJournalModal.hide();

        }


        /*
        ==================================================
        RESET DELETE ID
        ==================================================
        */

        this.selectedDeleteJournalId =
            null;


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        if (
            sourceModule === "AR"
            &&
            sourceDocumentType === "AR_PAYMENT"
        ) {

            this.showSuccess(
                "AR Payment Journal deleted. Account Receivable payment status restored."
            );

        }

        else {

            this.showSuccess(
                "Journal deleted successfully."
            );

        }


        /*
        ==================================================
        RELOAD GL JOURNAL
        ==================================================
        */

        await this.loadData();

    }

    catch (error) {

        console.error(
            "DELETE JOURNAL ERROR:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to delete journal."
        );

    }

}
/*
==========================================================
SHOW SUCCESS
BOOTSTRAP ALERT
GENERAL JOURNAL
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
        "Operation completed successfully.";


    /*
    ==================================================
    REMOVE EXISTING SUCCESS ALERT
    ==================================================
    */

    const existingAlert =
        document.getElementById(
            "gl-bootstrap-success-alert"
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
        "gl-bootstrap-success-alert";


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
    CONTENT
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

            ${this.escapeHTML(
                successMessage
            )}

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
    CHECK ACTIVE JOURNAL MODAL
    ==================================================
    */

    const modal =
        document.getElementById(
            "glJournalModal"
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
                    "gl-bootstrap-success-alert"
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
GENERAL JOURNAL
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
        "An error occurred.";


    /*
    ==================================================
    REMOVE EXISTING ERROR ALERT
    ==================================================
    */

    const existingAlert =
        document.getElementById(
            "gl-bootstrap-error-alert"
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
        "gl-bootstrap-error-alert";


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
    CONTENT
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

            ${this.escapeHTML(
                errorMessage
            )}

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
    CHECK ACTIVE JOURNAL MODAL
    ==================================================
    */

    const modal =
        document.getElementById(
            "glJournalModal"
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
                    "gl-bootstrap-error-alert"
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
FINAL
==========================================================
*/

async openAddDetailModal() {

    /*
    ======================================================
    LOAD MODAL
    ======================================================
    */

    await this.loadDetailModal();


    /*
    ======================================================
    ENSURE MASTER DATA
    ======================================================
    */

    if (
        !Array.isArray(
            this.coaList
        )
        ||
        this.coaList.length === 0
    ) {

        await this.loadCOA();

    }

    else {

        this.populateCOA();

    }


    if (
        !Array.isArray(
            this.businessPartnerList
        )
        ||
        this.businessPartnerList.length === 0
    ) {

        await this.loadBusinessPartners();

    }

    else {

        this.populateBusinessPartners();

    }


    /*
    ======================================================
    CLEAR FORM
    ======================================================
    */

    this.clearDetailForm();


    /*
    ======================================================
    MODE
    ======================================================
    */

    this.detailMode.value =
        "add";


    this.detailId.value =
        "";


    this.currentDetail =
        null;


    this.currentDetailIndex =
        -1;


    /*
    ======================================================
    SHOW
    ======================================================
    */

    this.detailModal.show();

}

/*
==========================================================
FILL DETAIL FORM
FINAL
==========================================================
*/

fillDetailForm() {

    /*
    ======================================================
    VALIDATE CURRENT DETAIL
    ======================================================
    */

    if (
        !this.currentDetail
    ) {

        return;

    }


    /*
    ======================================================
    DESCRIPTION
    ======================================================
    */

    if (
        this.detailDescription
    ) {

        this.detailDescription.value =
            this.currentDetail.description
            ?? "";

    }


    /*
    ======================================================
    DEBIT ACCOUNT
    ======================================================
    */

    const debitAccountId =
        this.currentDetail.debit_account_id
        ?? "";


    if (
        this.debitAccountTomSelect
    ) {

        this.debitAccountTomSelect.setValue(
            String(
                debitAccountId
            ),
            true
        );

    }

    else if (
        this.detailDebitAccount
    ) {

        this.detailDebitAccount.value =
            debitAccountId;

    }


    /*
    ======================================================
    CREDIT ACCOUNT
    ======================================================
    */

    const creditAccountId =
        this.currentDetail.credit_account_id
        ?? "";


    if (
        this.creditAccountTomSelect
    ) {

        this.creditAccountTomSelect.setValue(
            String(
                creditAccountId
            ),
            true
        );

    }

    else if (
        this.detailCreditAccount
    ) {

        this.detailCreditAccount.value =
            creditAccountId;

    }


    /*
    ======================================================
    BUSINESS PARTNER
    ======================================================
    */

    if (
        this.detailBusinessPartner
    ) {

        this.detailBusinessPartner.value =
            this.currentDetail.business_partner_id
            ?? "";

    }


    /*
    ======================================================
    AMOUNT
    ======================================================
    */

    const amount =
        Number(
            this.currentDetail.amount
            ?? 0
        );


    if (
        this.detailAmount
    ) {

        this.detailAmount.value =
            this.formatDetailAmount(
                Number.isFinite(amount)
                    ? amount
                    : 0
            );

    }

}
/*
==========================================================
COLLECT DETAIL FORM
FINAL
==========================================================
*/

collectDetailForm() {

    /*
    ======================================================
    ACCOUNT ID
    ======================================================
    */

    const debitAccountId =
        this.debitAccountTomSelect
            ? this.debitAccountTomSelect.getValue()
            : (
                this.detailDebitAccount?.value
                || ""
            );


    const creditAccountId =
        this.creditAccountTomSelect
            ? this.creditAccountTomSelect.getValue()
            : (
                this.detailCreditAccount?.value
                || ""
            );


    /*
    ======================================================
    ACCOUNT MASTER
    ======================================================
    */

    const debitAccount =
        this.coaList.find(

            account =>
                String(
                    account.id
                )
                ===
                String(
                    debitAccountId
                )

        );


    const creditAccount =
        this.coaList.find(

            account =>
                String(
                    account.id
                )
                ===
                String(
                    creditAccountId
                )

        );


    /*
    ======================================================
    BUSINESS PARTNER
    ======================================================
    */

    const businessPartnerId =
        this.detailBusinessPartner?.value
        || null;


    const businessPartner =
        this.businessPartnerList.find(

            bp =>
                String(
                    bp.id
                )
                ===
                String(
                    businessPartnerId
                )

        );


    /*
    ======================================================
    AMOUNT
    REMOVE THOUSAND SEPARATOR
    ======================================================
    */

    const amount =
        Number(

            String(
                this.detailAmount?.value
                || "0"
            )
            .replace(
                /\./g,
                ""
            )
            .replace(
                /,/g,
                ""
            )

        );


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return {

        description:
            this.detailDescription?.value
                .trim()
            || "",


        debit_account_id:
            debitAccountId,


        debit_account_code:
            debitAccount?.account_code
            || "",


        debit_account_name:
            debitAccount?.account_name
            || "",


        credit_account_id:
            creditAccountId,


        credit_account_code:
            creditAccount?.account_code
            || "",


        credit_account_name:
            creditAccount?.account_name
            || "",


        business_partner_id:
            businessPartnerId,


        business_partner_name:
            businessPartner?.bp_name
            || "",


        amount:
            Number.isFinite(
                amount
            )
                ? amount
                : 0

    };

}
/*
==========================================================
SAVE DETAIL LINE
FINAL
==========================================================
*/

saveDetailLine() {

    /*
    ======================================================
    COLLECT FORM
    ======================================================
    */

    const detail =
        this.collectDetailForm();


    /*
    ======================================================
    VALIDATE DEBIT ACCOUNT
    ======================================================
    */

    if (
        !detail.debit_account_id
    ) {

        this.showError(
    "Debit Account is required."
);

        return;

    }


    /*
    ======================================================
    VALIDATE CREDIT ACCOUNT
    ======================================================
    */

    if (
        !detail.credit_account_id
    ) {

        this.showError(
    "Credit Account is required."
);

        return;

    }


    /*
    ======================================================
    SAME ACCOUNT VALIDATION
    ======================================================
    */

    if (
        String(
            detail.debit_account_id
        )
        ===
        String(
            detail.credit_account_id
        )
    ) {

        this.showError(
    "Debit Account and Credit Account cannot be the same."
);

        return;

    }


    /*
    ======================================================
    VALIDATE AMOUNT
    ======================================================
    */

    if (
        !Number.isFinite(
            detail.amount
        )
        ||
        detail.amount <= 0
    ) {

        this.showError(
    "Amount must be greater than zero."
);

        return;

    }


    /*
    ======================================================
    EDIT MODE
    ======================================================
    */

    if (
        this.detailMode?.value === "edit"
    ) {

        const index =
            Number(
                this.detailId?.value
            );


        if (
            Number.isInteger(
                index
            )
            &&
            index >= 0
            &&
            index < this.detailLines.length
        ) {

            /*
            ==================================================
            PRESERVE EXISTING DATA
            ==================================================
            */

            this.detailLines[index] = {

                ...this.detailLines[index],

                ...detail

            };

        }

    }


    /*
    ======================================================
    ADD MODE
    ======================================================
    */

    else {

        this.detailLines.push(
            detail
        );

    }


    /*
    ======================================================
    RENDER
    ======================================================
    */

    this.renderDetailTable();


    /*
    ======================================================
    CALCULATE SUMMARY
    ======================================================
    */

    this.calculateSummary();


    /*
    ======================================================
    CLOSE DETAIL MODAL
    ======================================================
    */

    this.detailModal?.hide();

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
        this.totalPages;

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
FINAL
==========================================================
*/

populateCOA() {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (
        !this.detailDebitAccount
        ||
        !this.detailCreditAccount
    ) {

        return;

    }


    /*
    ======================================================
    DESTROY OLD TOM SELECT
    BEFORE REBUILDING OPTIONS
    ======================================================
    */

    if (
        this.debitAccountTomSelect
    ) {

        this.debitAccountTomSelect.destroy();

        this.debitAccountTomSelect = null;

    }


    if (
        this.creditAccountTomSelect
    ) {

        this.creditAccountTomSelect.destroy();

        this.creditAccountTomSelect = null;

    }


    /*
    ======================================================
    RESET NATIVE SELECT
    ======================================================
    */

    this.detailDebitAccount.innerHTML = `

        <option value="">
            Select Chart of Account
        </option>

    `;


    this.detailCreditAccount.innerHTML = `

        <option value="">
            Select Chart of Account
        </option>

    `;


    /*
    ======================================================
    BUILD OPTIONS
    ======================================================
    */

    this.coaList.forEach(

        account => {

            const debitOption =
                document.createElement(
                    "option"
                );


            debitOption.value =
                account.id;


            debitOption.textContent =
                `${
                    account.account_code
                } :: ${
                    account.account_name
                }`;


            debitOption.dataset.code =
                account.account_code;


            debitOption.dataset.name =
                account.account_name;


            /*
            ==================================================
            CREDIT OPTION
            ==================================================
            */

            const creditOption =
                debitOption.cloneNode(
                    true
                );


            this.detailDebitAccount.appendChild(
                debitOption
            );


            this.detailCreditAccount.appendChild(
                creditOption
            );

        }

    );


    /*
    ======================================================
    INITIALIZE SEARCHABLE SELECT
    ======================================================
    */

    this.initializeDetailAccountTomSelect();

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
FINAL
==========================================================
*/

setJournalReadOnly(
    readOnly = true
) {

    /*
    ======================================================
    HEADER CONTROLS
    ======================================================
    */

    const controls = [

        "journal-accounting-date",

        "journal-reference-no",

        "journal-description"

    ];


    controls.forEach(

        id => {

            const element =
                document.getElementById(
                    id
                );


            if (
                !element
            ) {

                return;

            }


            element.disabled =
                readOnly;


            element.readOnly =
                readOnly;

        }

    );


    /*
    ======================================================
    POSTING PERIOD
    ALWAYS READ ONLY
    ======================================================
    */

    const postingPeriod =
        document.getElementById(
            "journal-posting-period"
        );


    if (
        postingPeriod
    ) {

        postingPeriod.disabled =
            false;

        postingPeriod.readOnly =
            true;

    }


    /*
    ======================================================
    JOURNAL NUMBER
    ALWAYS READ ONLY
    ======================================================
    */

    const journalNo =
        document.getElementById(
            "journal-journal-no"
        );


    if (
        journalNo
    ) {

        journalNo.disabled =
            false;

        journalNo.readOnly =
            true;

    }


    /*
    ======================================================
    STATUS
    ALWAYS READ ONLY
    ======================================================
    */

    const status =
        document.getElementById(
            "journal-status"
        );


    if (
        status
    ) {

        status.disabled =
            false;

        status.readOnly =
            true;

    }


    /*
    ======================================================
    ADD LINE
    ======================================================
    */

    const btnAddLine =
        document.getElementById(
            "btn-add-line"
        );


    if (
        btnAddLine
    ) {

        btnAddLine.style.display =
            readOnly
                ? "none"
                : "";


        btnAddLine.disabled =
            readOnly;

    }


    /*
    ======================================================
    SAVE DRAFT
    ======================================================
    */

    const btnSave =
        document.getElementById(
            "btn-save-journal"
        );


    if (
        btnSave
    ) {

        btnSave.style.display =
            readOnly
                ? "none"
                : "";


        btnSave.disabled =
            readOnly;

    }


    /*
    ======================================================
    SAVE & POST
    ======================================================
    */

    const btnPost =
        document.getElementById(
            "btn-post-journal"
        );


    if (
        btnPost
    ) {

        btnPost.style.display =
            readOnly
                ? "none"
                : "";


        btnPost.disabled =
            readOnly;

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
        .forEach(

            button => {

                button.style.display =
                    readOnly
                        ? "none"
                        : "";


                button.disabled =
                    readOnly;

            }

        );

}

/*
==========================================================
PREVIEW HTML
==========================================================
*/

previewHTML() {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (
            !Array.isArray(
                this.filteredJournals
            )
            ||
            this.filteredJournals.length === 0
        ) {

            this.showError(
                "No journal available."
            );

            return;

        }


        /*
        ======================================================
        OPEN PREVIEW TAB
        ======================================================
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
        ======================================================
        PREVIEW DATE
        ======================================================
        */

        const previewDate =
            new Date()
                .toLocaleString(
                    "id-ID"
                );


        /*
        ======================================================
        ESCAPE HTML
        ======================================================
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
==========================================================
BUILD ROWS
FINAL
MERGED JOURNAL DETAIL
==========================================================
*/

const rows = [];


/*
==========================================================
LOOP JOURNAL
==========================================================
*/

this.filteredJournals.forEach(

    journal => {

        /*
        ======================================================
        JOURNAL DETAILS

        CURRENT FORMAT:
        Debit Account + Credit Account
        already merged into one transaction.
        ======================================================
        */

        const details =
            Array.isArray(
                journal?.details
            )
                ? journal.details
                : [];


        /*
        ======================================================
        LOOP TRANSACTION
        ======================================================
        */

        details.forEach(

            detail => {

                /*
                ==================================================
                DEBIT ACCOUNT
                ==================================================
                */

                const debitAccountCode =
                    detail?.debit_account_code
                    ||
                    "-";


                const debitAccountName =
                    detail?.debit_account_name
                    ||
                    "-";


                /*
                ==================================================
                CREDIT ACCOUNT
                ==================================================
                */

                const creditAccountCode =
                    detail?.credit_account_code
                    ||
                    "-";


                const creditAccountName =
                    detail?.credit_account_name
                    ||
                    "-";


                /*
                ==================================================
                AMOUNT
                ==================================================
                */

                const amount =
                    Number(
                        detail?.amount
                        ||
                        0
                    );


                /*
                ==================================================
                DESCRIPTION
                ==================================================
                */

                const description =
                journal?.description
                ||
                "-";


                /*
                ==================================================
                DEBIT ROW
                ==================================================
                */

                rows.push(`

                    <tr>

                        <!-- ACCOUNTING DATE -->

                        <td class="center">

                            ${
                                escapeHTML(
                                    journal?.journal_date
                                    ||
                                    "-"
                                )
                            }

                        </td>


                        <!-- JOURNAL NO -->

                        <td>

                            ${
                                escapeHTML(
                                    journal?.journal_no
                                    ||
                                    "-"
                                )
                            }

                        </td>


                        <!-- ACCOUNT CODE -->

                        <td>

                            ${
                                escapeHTML(
                                    debitAccountCode
                                )
                            }

                        </td>


                        <!-- ACCOUNT NAME -->

                        <td>

                            ${
                                escapeHTML(
                                    debitAccountName
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


                        <!-- DEBIT -->

                        <td class="amount">

                            ${
                                this.formatCurrency(
                                    amount
                                )
                            }

                        </td>


                        <!-- CREDIT -->

                        <td class="amount">

                            ${this.formatCurrency(0)}

                        </td>

                    </tr>

                `);


                /*
                ==================================================
                CREDIT ROW
                ==================================================
                */

                rows.push(`

                    <tr>

                        <!-- ACCOUNTING DATE -->

                        <td class="center">

                            ${
                                escapeHTML(
                                    journal?.journal_date
                                    ||
                                    "-"
                                )
                            }

                        </td>


                        <!-- JOURNAL NO -->

                        <td>

                            ${
                                escapeHTML(
                                    journal?.journal_no
                                    ||
                                    "-"
                                )
                            }

                        </td>


                        <!-- ACCOUNT CODE -->

                        <td>

                            ${
                                escapeHTML(
                                    creditAccountCode
                                )
                            }

                        </td>


                        <!-- ACCOUNT NAME -->

                        <td>

                            ${
                                escapeHTML(
                                    creditAccountName
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


                        <!-- DEBIT -->

                        <td class="amount">

                            ${this.formatCurrency(0)}

                        </td>


                        <!-- CREDIT -->

                        <td class="amount">

                            ${
                                this.formatCurrency(
                                    amount
                                )
                            }

                        </td>

                    </tr>

                `);

            }

        );

    }

);

        /*
        ======================================================
        HTML
        ======================================================
        */

        const html = `

            <!DOCTYPE html>

            <html lang="id">

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

                <title>
                    General Journal - Preview
                </title>


                <style>

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


                    .report {

                        width:
                            100%;

                        max-width:
                            100%;

                    }


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


                    .table-container {

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


                    .table-wrapper {

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


                    table {

                        width:
                            max-content;

                        min-width:
                            100%;

                        margin:
                            0;

                        border-collapse:
                            collapse;

                        table-layout:
                            auto;

                    }


                    th {

                        padding:
                            10px 9px;

                        background:
                            #244494;

                        color:
                            #ffffff;

                        border:
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


                    td {

                        padding:
                            9px;

                        border:
                            1px solid #d1d5db;

                        vertical-align:
                            middle;

                        background:
                            #ffffff;

                        white-space:
                            nowrap;

                    }


                    tbody tr:nth-child(even) td {

                        background:
                            #f8fafc;

                    }


                    tbody tr:hover td {

                        background:
                            #f1f5f9;

                    }


                    .center {

                        text-align:
                            center;

                    }


                    .amount {

                        min-width:
                            140px;

                        text-align:
                            right;

                        white-space:
                            nowrap;

                    }


                    .description {

                        min-width:
                            420px;

                        text-align:
                            left;

                        white-space:
                            nowrap;

                    }


                    .col-date {

                        min-width:
                            120px;

                    }


                    .col-journal {

                        min-width:
                            170px;

                    }


                    .col-code {

                        min-width:
                            130px;

                    }


                    .col-name {

                        min-width:
                            260px;

                    }


                    .col-description {

                        min-width:
                            420px;

                    }


                    .col-amount {

                        min-width:
                            140px;

                    }


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


                    .fixed-horizontal-scroll-inner {

                        width:
                            100%;

                        height:
                            21px;

                        overflow-x:
                            auto;

                        overflow-y:
                            hidden;

                    }


                    .fixed-horizontal-scroll-content {

                        width:
                            100%;

                        height:
                            1px;

                        min-height:
                            1px;

                    }


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


                    <div class="report-header">

                        <h1 class="report-title">

                            FINOVA ACCOUNTING SYSTEM

                        </h1>


                        <div class="report-subtitle">

                            General Journal

                        </div>


                        <div class="report-description">

                            Accounting / General Journal

                        </div>


                        <div class="report-date">

                            Preview Date :
                            ${previewDate}

                        </div>

                    </div>


                    <div class="table-container">

                        <div
                            class="table-wrapper"
                            id="gl-table-scroll"
                        >

                            <table
                                id="gl-preview-table"
                            >

                                <colgroup>

                                    <col class="col-date">

                                    <col class="col-journal">

                                    <col class="col-code">

                                    <col class="col-name">

                                    <col class="col-description">

                                    <col class="col-amount">

                                    <col class="col-amount">

                                </colgroup>


                                <thead>

                                    <tr>

                                        <th>
                                            Accounting Date
                                        </th>

                                        <th>
                                            Journal No
                                        </th>

                                        <th>
                                            Account Code
                                        </th>

                                        <th>
                                            Account Name
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                        <th>
                                            Debit
                                        </th>

                                        <th>
                                            Credit
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    ${rows.join("")}

                                </tbody>

                            </table>

                        </div>

                    </div>


                    <div class="report-footer">

                        <div>

                            Total Journal :
                            ${this.filteredJournals.length}

                        </div>


                        <div>

                            Generated by FINOVA Accounting System

                        </div>

                    </div>


                </div>


                <div
                    class="fixed-horizontal-scroll"
                    id="gl-fixed-scroll-container"
                >

                    <div
                        class="fixed-horizontal-scroll-inner"
                        id="gl-fixed-scroll"
                    >

                        <div
                            class="fixed-horizontal-scroll-content"
                            id="gl-fixed-scroll-content"
                        >
                        </div>

                    </div>

                </div>


            </body>

            </html>

        `;


        /*
        ======================================================
        WRITE NEW TAB
        ======================================================
        */

        previewWindow.document.open();

        previewWindow.document.write(
            html
        );

        previewWindow.document.close();


        previewWindow.document.title =
            "General Journal - Preview";


        /*
        ======================================================
        SETUP FIXED HORIZONTAL SCROLL
        ======================================================
        */

        const setupScrollSync = () => {

            const doc =
                previewWindow.document;


            const tableScroll =
                doc.getElementById(
                    "gl-table-scroll"
                );


            const table =
                doc.getElementById(
                    "gl-preview-table"
                );


            const fixedScrollContainer =
                doc.getElementById(
                    "gl-fixed-scroll-container"
                );


            const fixedScroll =
                doc.getElementById(
                    "gl-fixed-scroll"
                );


            const fixedScrollContent =
                doc.getElementById(
                    "gl-fixed-scroll-content"
                );


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
            WIDTH
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
            SCROLL FIXED -> TABLE
            ==============================================
            */

            fixedScroll.addEventListener(
                "scroll",
                () => {

                    tableScroll.scrollLeft =
                        fixedScroll.scrollLeft;

                }
            );


            /*
            ==============================================
            SCROLL TABLE -> FIXED
            ==============================================
            */

            tableScroll.addEventListener(
                "scroll",
                () => {

                    fixedScroll.scrollLeft =
                        tableScroll.scrollLeft;

                }
            );


            updateScrollWidth();


            requestAnimationFrame(
                updateScrollWidth
            );


            previewWindow.addEventListener(
                "resize",
                updateScrollWidth
            );

        };


        /*
        ======================================================
        RUN
        ======================================================
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
        ======================================================
        FOCUS
        ======================================================
        */

        previewWindow.focus();

    }

    catch (error) {

        console.error(
            "GeneralJournal.previewHTML:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to preview General Journal."
        );

    }

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
FINAL
==========================================================
*/

calculateSummary() {

    /*
    ======================================================
    DETAILS
    ======================================================
    */

    const details =
        Array.isArray(
            this.detailLines
        )
            ? this.detailLines
            : [];


    /*
    ======================================================
    TOTAL LINE
    ======================================================
    */

    const totalLine =
        details.length;


    /*
    ======================================================
    TOTAL DEBIT
    ======================================================
    */

    const totalDebit =
        details.reduce(

            (
                total,
                detail
            ) => {

                const amount =
                    Number(
                        detail.amount
                        || 0
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
    ======================================================
    TOTAL CREDIT

    Current GL detail structure:
    one detail contains debit + credit pair
    with the same amount.
    ======================================================
    */

    const totalCredit =
        totalDebit;


    /*
    ======================================================
    DIFFERENCE
    ======================================================
    */

    const difference =
        totalDebit
        -
        totalCredit;


    /*
    ======================================================
    SUMMARY
    ======================================================
    */

    this.summary = {

        totalLine:
            totalLine,

        totalDebit:
            totalDebit,

        totalCredit:
            totalCredit,

        difference:
            difference,

        isBalanced:
            difference === 0

    };


    /*
    ======================================================
    UPDATE DISPLAY
    ======================================================
    */

    this.updateSummaryDisplay();

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

        this.showError(
    "Debit / Credit cannot be negative."
);

        return false;

    }

    if (

        detail.debit > 0 &&

        detail.credit > 0

    ) {

        this.showError(
    "Only Debit or Credit may contain a value."
);

        return false;

    }

    if (

        detail.debit === 0 &&

        detail.credit === 0

    ) {

        this.showError(
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
FINAL
==========================================================
*/

clearDetailForm() {

    /*
    ======================================================
    HIDDEN
    ======================================================
    */

    if (
        this.detailId
    ) {

        this.detailId.value =
            "";

    }


    if (
        this.detailMode
    ) {

        this.detailMode.value =
            "add";

    }


    /*
    ======================================================
    DESCRIPTION
    ======================================================
    */

    if (
        this.detailDescription
    ) {

        this.detailDescription.value =
            "";

    }


    /*
    ======================================================
    DEBIT
    ======================================================
    */

    if (
        this.debitAccountTomSelect
    ) {

        this.debitAccountTomSelect.clear(
            true
        );

    }

    else if (
        this.detailDebitAccount
    ) {

        this.detailDebitAccount.value =
            "";

    }


    /*
    ======================================================
    CREDIT
    ======================================================
    */

    if (
        this.creditAccountTomSelect
    ) {

        this.creditAccountTomSelect.clear(
            true
        );

    }

    else if (
        this.detailCreditAccount
    ) {

        this.detailCreditAccount.value =
            "";

    }


    /*
    ======================================================
    BUSINESS PARTNER
    ======================================================
    */

    if (
        this.detailBusinessPartner
    ) {

        this.detailBusinessPartner.value =
            "";

    }


    /*
    ======================================================
    AMOUNT
    ======================================================
    */

    if (
        this.detailAmount
    ) {

        this.detailAmount.value =
            "";

    }

}
/*
==========================================================
OPEN EDIT DETAIL MODAL
FINAL
==========================================================
*/

async openEditDetailModal(
    index
) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (
        index === undefined
        ||
        index === null
        ||
        !this.detailLines[index]
    ) {

        return;

    }


    /*
    ======================================================
    LOAD MODAL
    ======================================================
    */

    await this.loadDetailModal();


    /*
    ======================================================
    MASTER DATA
    ======================================================
    */

    if (
        !Array.isArray(
            this.coaList
        )
        ||
        this.coaList.length === 0
    ) {

        await this.loadCOA();

    }

    else {

        this.populateCOA();

    }


    if (
        !Array.isArray(
            this.businessPartnerList
        )
        ||
        this.businessPartnerList.length === 0
    ) {

        await this.loadBusinessPartners();

    }

    else {

        this.populateBusinessPartners();

    }


    /*
    ======================================================
    DETAIL
    ======================================================
    */

    const detail =
        this.detailLines[index];


    /*
    ======================================================
    MODE
    ======================================================
    */

    this.detailMode.value =
        "edit";


    this.detailId.value =
        index;


    /*
    ======================================================
    DESCRIPTION
    ======================================================
    */

    this.detailDescription.value =
        detail.description
        || "";


    /*
    ======================================================
    DEBIT ACCOUNT
    ======================================================
    */

    this.debitAccountTomSelect?.setValue(

        detail.debit_account_id
        || "",

        true

    );


    /*
    ======================================================
    CREDIT ACCOUNT
    ======================================================
    */

    this.creditAccountTomSelect?.setValue(

        detail.credit_account_id
        || "",

        true

    );


    /*
    ======================================================
    AMOUNT
    ======================================================
    */

    this.detailAmount.value =
        this.formatDetailAmount(
            detail.amount
            || 0
        );


    /*
    ======================================================
    BUSINESS PARTNER
    ======================================================
    */

    this.detailBusinessPartner.value =
        detail.business_partner_id
        || "";


    /*
    ======================================================
    SHOW
    ======================================================
    */

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
FORMAT DETAIL AMOUNT
==========================================================
*/

formatDetailAmount(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";

    }

    const number =
        Number(
            String(value)
                .replace(/\./g, "")
                .replace(/,/g, "")
        );

    if (!Number.isFinite(number)) {

        return "";

    }

    return Math.round(number)
        .toLocaleString("id-ID");

}
/*
==========================================================
BIND DETAIL MODAL EVENTS
FINAL
==========================================================
*/

bindDetailModalEvents() {

    /*
    ======================================================
    PREVENT DOUBLE BIND
    ======================================================
    */

    if (
        this.detailModalEventsBound
    ) {

        return;

    }


    this.detailModalEventsBound =
        true;


    /*
    ======================================================
    SAVE LINE
    ======================================================
    */

    this.btnSaveLine?.addEventListener(

        "click",

        () => {

            this.saveDetailLine();

        }

    );


    /*
    ======================================================
    AMOUNT INPUT FORMAT
    ======================================================
    */

    this.detailAmount?.addEventListener(

        "input",

        () => {

            const rawValue =
                this.detailAmount.value
                    .replace(
                        /\D/g,
                        ""
                    );


            if (
                !rawValue
            ) {

                this.detailAmount.value =
                    "";

                return;

            }


            this.detailAmount.value =
                Number(
                    rawValue
                )
                .toLocaleString(
                    "id-ID"
                );

        }

    );


    /*
    ======================================================
    ENTER = SAVE
    ======================================================
    */

    this.detailModalElement?.addEventListener(

        "keydown",

        event => {

            if (
                event.key !== "Enter"
            ) {

                return;

            }


            if (
                event.target.tagName ===
                "TEXTAREA"
            ) {

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
ACCOUNTING PERIOD BASED ON ACCOUNTING DATE
FINAL
==========================================================
*/

async saveJournal(
    status = "Draft"
) {

    try {

        /*
        ======================================================
        VALIDATE JOURNAL FORM
        ======================================================
        */

        if (
            !this.validateJournal(
                status
            )
        ) {

            return;

        }


        /*
        ======================================================
        ACCOUNTING DATE
        THIS IS THE ONLY PERIOD BASIS FOR GL JOURNAL
        ======================================================
        */

        const accountingDate =
            String(
                this.txtAccountingDate
                    ?.value
                ||
                ""
            )
            .trim();


        /*
        ======================================================
        VALIDATE ACCOUNTING DATE
        ======================================================
        */

        if (
            !accountingDate
        ) {

            this.showError(
                "Accounting Date is required."
            );

            return;

        }


        /*
        ======================================================
        GET ACCOUNTING PERIOD
        BASED ON ACCOUNTING DATE
        ======================================================
        */

        const {

            data:
                accountingPeriod,

            error:
                accountingPeriodError

        } =
            await supabase

                .from(
                    "mst_accounting_period"
                )

                .select(`
                    id,
                    period,
                    month,
                    year,
                    start_date,
                    end_date,
                    status
                `)

                .lte(
                    "start_date",
                    accountingDate
                )

                .gte(
                    "end_date",
                    accountingDate
                )

                .maybeSingle();


        /*
        ======================================================
        ACCOUNTING PERIOD QUERY ERROR
        ======================================================
        */

        if (
            accountingPeriodError
        ) {

            console.error(
                "GL JOURNAL ACCOUNTING PERIOD ERROR:",
                accountingPeriodError
            );


            throw accountingPeriodError;

        }


        /*
        ======================================================
        PERIOD NOT CONFIGURED
        FUTURE PERIOD / UNKNOWN PERIOD
        ======================================================
        */

        if (
            !accountingPeriod
        ) {

            this.showError(
                `Accounting Period for ${accountingDate} is not available or has not been opened.`
            );

            return;

        }


        /*
        ======================================================
        NORMALIZE PERIOD STATUS
        ======================================================
        */

        const periodStatus =
            String(
                accountingPeriod.status
                ||
                ""
            )
            .trim()
            .toLowerCase();


        /*
        ======================================================
        CLOSED PERIOD
        ======================================================
        */

        if (
            periodStatus !==
            "open"
        ) {

            this.showError(
                `Accounting Period ${accountingPeriod.period} is Closed. Journal cannot be saved.`
            );

            return;

        }


        /*
        ======================================================
        DEBUG ACCOUNTING PERIOD
        ======================================================
        */

        console.log(
            "GL JOURNAL ACCOUNTING PERIOD:",
            {

                accounting_date:
                    accountingDate,

                period:
                    accountingPeriod.period,

                status:
                    accountingPeriod.status

            }
        );


        /*
        ======================================================
        HEADER
        ======================================================
        */

        const header = {

            journal_no:
                this.txtJournalNo
                    .value
                    .trim(),

            /*
            ==================================================
            IMPORTANT
            GL JOURNAL PERIOD BASIS
            =
            ACCOUNTING DATE
            ==================================================
            */

            journal_date:
                accountingDate,


            /*
            ==================================================
            POSTING PERIOD
            ALWAYS DERIVED FROM ACCOUNTING DATE
            ==================================================
            */

            posting_period:
                this.getPostingPeriod(
                    accountingDate
                ),


            description:
                this.txtDescription
                    .value
                    .trim(),


            /*
            ==================================================
            SOURCE DOCUMENT
            MANUAL GENERAL JOURNAL
            ==================================================
            */

            source_module:
                "GLJ",

            source_document_type:
                "MANUAL_JOURNAL",

            source_document_id:
                null,


            /*
            ==================================================
            STATUS
            ==================================================
            */

            status

        };


        /*
        ======================================================
        EDIT MODE
        ======================================================
        */

        if (
            this.currentMode ===
                "edit"
            &&
            this.currentJournal?.id
        ) {

            header.id =
                this.currentJournal.id;

        }


        /*
        ======================================================
        DETAIL
        ======================================================
        */

        const details =
            this.detailLines.map(

                (
                    line,
                    index
                ) => ({

                    line_no:
                        index + 1,

                    description:
                        line.description,

                    debit_account_id:
                        line.debit_account_id,

                    credit_account_id:
                        line.credit_account_id,

                    business_partner_id:
                        line.business_partner_id
                        ||
                        null,

                    amount:
                        Number(
                            line.amount
                        )

                })

            );


        /*
        ======================================================
        SAVE
        ======================================================
        */

        if (
            this.currentMode ===
            "add"
        ) {

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

        await this.loadData(
            false
        );


        /*
        ======================================================
        CLOSE MODAL
        ======================================================
        */

        this.modal.hide();


        /*
        ======================================================
        SUCCESS
        ======================================================
        */

        this.showSuccess(
            status ===
                "Posted"
                ? "Journal posted successfully."
                : "Journal saved as Draft successfully."
        );

    }

    catch (
        error
    ) {

        console.error(
            "GeneralJournal.saveJournal:",
            error
        );


        /*
        ======================================================
        ERROR
        ======================================================
        */

        this.showError(
            error?.message
            ||
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

        this.showError(
    error?.message
    ||
    "Failed to post Journal."
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
            reasonInput?.value?.trim()
            ||
            "";


        if (!reason) {

            this.showError(
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
        RELOAD
        ======================================================
        */

        await this.loadData();


        /*
        ======================================================
        SUCCESS
        BOOTSTRAP ALERT
        ======================================================
        */

        this.showSuccess(
            "Journal voided successfully."
        );

    }

    catch (error) {

        console.error(
            "Void Journal Error",
            error
        );


        this.showError(
            error?.message
            ||
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