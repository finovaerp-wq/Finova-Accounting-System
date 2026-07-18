/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Module : GL Journal
Version : 1.0.0
==========================================================
*/

import {
    ChartOfAccountsService
} from "../../service/chart-of-accounts.service.js";
import {
    JournalService
} from "../../service/journal.service.js";

import {
    BusinessPartnerService
} from "../../service/business-partner.service.js";
export class GLJournal {




    /*
    ==========================================================
    CONSTRUCTOR
    ==========================================================
    */

    constructor() {

    this.modal = null;

    this.detailRows = [];

    this.chartOfAccounts = [];

    this.businessPartners = [];

    this.initialize();

}
    /*
    ==========================================================
    INITIALIZE
    ==========================================================
    */

    async initialize() {

        console.log("GL Journal Initialized");

        await this.loadModal();
        await this.loadChartOfAccounts();
        await this.loadBusinessPartners();

        this.cacheElement();
        await this.loadJournalList();

        this.bindEvents();

    }

    /*
==========================================================
LOAD MODAL
==========================================================
*/

async loadModal() {

    /*
    ==========================================
    LOAD HTML
    ==========================================
    */

    const response = await fetch(

        "modules/gl-journal/gl-journal-modal.html"

    );

    const html = await response.text();

    /*
    ==========================================
    RENDER
    ==========================================
    */

    document.getElementById(

        "journal-modal-container"

    ).innerHTML = html;

    /*
    ==========================================
    INIT MODAL
    ==========================================
    */

    this.modal =

        new bootstrap.Modal(

            document.getElementById(

                "glJournalModal"

            )

        );

}

    /*
    ==========================================================
    CACHE ELEMENT
    ==========================================================
    */

    cacheElement() {

    this.tableBody =
        document.getElementById(
            "journal-table-body"
        );

    this.detailBody =
        document.getElementById(
            "journal-detail-body"
        );

}

    /*
==========================================================
BIND EVENTS
==========================================================
*/

bindEvents() {

    this.bindHeaderEvents();

    this.bindDetailEvents();

    this.bindFooterEvents();


}
/*
==========================================================
BIND HEADER EVENTS
==========================================================
*/

bindHeaderEvents() {

    document

        .getElementById("btn-add-journal")

        ?.addEventListener(

            "click",

            () => this.openAddModal()

        );

}
/*
==========================================================
BIND DETAIL EVENTS
==========================================================
*/

bindDetailEvents() {

    document

        .getElementById("btn-add-line")

        ?.addEventListener(

            "click",

            () => this.addDetailRow()

        );

}
/*
==========================================================
BIND FOOTER EVENTS
==========================================================
*/

bindFooterEvents() {

    console.log("bindFooterEvents()");
    const btnSaveDraft = document.getElementById("btn-save-draft");

console.log("btnSaveDraft =", btnSaveDraft);

btnSaveDraft?.addEventListener("click", () => {

    console.log("CLICK SAVE DRAFT");

    const valid = this.validateJournal();

    console.log("validateJournal =", valid);

    if (!valid) {

        return;

    }

    this.saveDraft();

});

    document

        .getElementById("btn-post-journal")

        ?.addEventListener(

            "click",

            () => {

                this.postJournal();

            }

        );

}

/*
==========================================================
LOAD CHART OF ACCOUNTS
==========================================================
*/

async loadChartOfAccounts() {

    try {

        const accounts =

            await ChartOfAccountsService.getAll();

        this.chartOfAccounts =

            accounts.filter(

                account =>

                    account.status === true &&

                    account.is_header === false &&

                    account.allow_transaction === true

            );

    }

    catch (error) {

        console.error(

            "Failed to load Chart Of Accounts",

            error

        );

        this.chartOfAccounts = [];

    }

}
/*
==========================================================
GET COA OPTIONS
==========================================================
*/

getChartOfAccountsOptions() {

    let options = `

        <option value="">

            -- Select Account --

        </option>

    `;

    this.chartOfAccounts.forEach(account => {

        options += `

            <option value="${account.id}">

                ${account.account_code} - ${account.account_name}

            </option>

        `;

    });

    return options;

}
/*
==========================================================
LOAD BUSINESS PARTNERS
==========================================================
*/

async loadBusinessPartners() {

    try {

        this.businessPartners =

            await BusinessPartnerService.getAll();

    }

    catch (error) {

        console.error(

            "Failed to load Business Partner",

            error

        );

        this.businessPartners = [];

    }

}

/*
==========================================================
GET BUSINESS PARTNER OPTIONS
==========================================================
*/

getBusinessPartnerOptions() {

    let options = `

        <option value="">

            -- None --

        </option>

    `;

    this.businessPartners.forEach(bp => {

        options += `

            <option value="${bp.id}">

                ${bp.bp_code} - ${bp.bp_name}

            </option>

        `;

    });

    return options;

}
/*
==========================================================
ADD DETAIL ROW
==========================================================
*/

addDetailRow() {

    const tbody = this.detailBody;

    if (!tbody) {

        console.error("journal-detail-body tidak ditemukan.");

        return;

    }

    const index = tbody.rows.length + 1;

    const row = document.createElement("tr");

    row.innerHTML = `

        <td class="text-center">

            ${index}

        </td>

        <td>

            <select class="form-select coa-select">

                ${this.getChartOfAccountsOptions()}

            </select>

        </td>

        <td>

            <select class="form-select bp-select">

                ${this.getBusinessPartnerOptions()}

            </select>

        </td>

        <td>

            <input
                type="text"
                class="form-control description">

        </td>

        <td>

            <input
                type="number"
                class="form-control debit text-end"
                value="0">

        </td>

        <td>

            <input
                type="number"
                class="form-control credit text-end"
                value="0">

        </td>

        <td class="text-center">

            <button
                type="button"
                class="btn btn-sm btn-danger btn-remove-line">

                <i class="fa-solid fa-trash"></i>

            </button>

        </td>

    `;

    tbody.appendChild(row);
    row

    .querySelector(

        ".btn-remove-line"

    )

    .addEventListener(

        "click",

        (event) =>

            this.removeDetailRow(

                event.currentTarget

            )

    );
    /*
==========================================
AUTO DEBIT
==========================================
*/

const debit =

    row.querySelector(

        ".debit"

    );

const credit =

    row.querySelector(

        ".credit"

    );

debit.addEventListener(

    "input",

    () => {

        if (

            Number(debit.value) > 0

        ) {

            credit.value = 0;

        }

        this.calculateTotal();

    }

);
/*
==========================================
AUTO CREDIT
==========================================
*/

credit.addEventListener(

    "input",

    () => {

        if (

            Number(credit.value) > 0

        ) {

            debit.value = 0;

        }

        this.calculateTotal();

    }

);
}

/*
==========================================================
REMOVE DETAIL ROW
==========================================================
*/

removeDetailRow(button) {

    /*
    ==========================================
    REMOVE ROW
    ==========================================
    */

    button

        .closest("tr")

        .remove();

    /*
    ==========================================
    RENUMBER
    ==========================================
    */

    this.renumberRows();
    this.calculateTotal();

}
/*
==========================================================
CALCULATE TOTAL
==========================================================
*/

calculateTotal() {

    let totalDebit = 0;

    let totalCredit = 0;

    this.detailBody

        .querySelectorAll("tr")

        .forEach(row => {

            const debit = Number(

                row.querySelector(".debit")?.value || 0

            );

            const credit = Number(

                row.querySelector(".credit")?.value || 0

            );

            totalDebit += debit;

            totalCredit += credit;

        });
        /*
==========================================
BALANCE
==========================================
*/

const difference =

    totalDebit - totalCredit;

const balanced =

    difference === 0;
    /*
==========================================
SAVE STATUS
==========================================
*/

this.isBalanced = balanced;

    /*
    ==========================================
    DISPLAY
    ==========================================
    */

    document.getElementById(

        "total-debit"

    ).textContent =

        totalDebit.toLocaleString();

    document.getElementById(

        "total-credit"

    ).textContent =

        totalCredit.toLocaleString();

    document.getElementById(

    "total-difference"

).textContent =

    difference.toLocaleString();

/*
==========================================
STATUS
==========================================
*/

const status =

    document.getElementById(

        "journal-balance-status"

    );

if (!status) return;

status.textContent =

    balanced

        ? "BALANCED"

        : "NOT BALANCED";

status.className =

    balanced

        ? "badge bg-success"

        : "badge bg-danger";

}
/*
==========================================================
OPEN ADD MODAL
==========================================================
*/

async openAddModal() {

    /*
    ==========================================
    RESET GRID
    ==========================================
    */

    this.detailBody.innerHTML = "";

    /*
    ==========================================
    FIRST LINE
    ==========================================
    */

    this.addDetailRow();
    this.calculateTotal();

    /*
==========================================
DEFAULT DATE
==========================================
*/

document.getElementById(
    "journal-date"
).value = new Date()
    .toISOString()
    .split("T")[0];
    /*
    ==========================================
    SHOW MODAL
    ==========================================
    */

    this.modal.show();

}
/*
==========================================================
RENUMBER ROW
==========================================================
*/

renumberRows() {

    const rows =

        this.detailBody.querySelectorAll("tr");

    rows.forEach(

        (row, index) => {

            row.cells[0].textContent =

                index + 1;

        }

    );

}
/*
==========================================================
VALIDATE JOURNAL
==========================================================
*/

validateJournal() {

    /*
    ==========================================
    NO DETAIL
    ==========================================
    */

    if (

        this.detailBody.rows.length === 0

    ) {

        alert(

            "Journal detail is empty."

        );

        return false;

    }

    /*
    ==========================================
    BALANCE
    ==========================================
    */

    if (

        !this.isBalanced

    ) {

        alert(

            "Journal is not balanced."

        );

        return false;

    }

    return true;
    

}
/*
/*
==========================================================
SAVE DRAFT
==========================================================
*/

async saveDraft() {

    try {

        /*
        ==========================================
        COLLECT DATA
        ==========================================
        */

        const header =
            this.collectJournalHeader();

        const details =
            this.collectJournalDetail();

        /*
        ==========================================
        CHECK MODE
        ==========================================
        */

        const journalId =
            document.getElementById("journal-id").value;

        if (journalId) {

            await JournalService.update(

                journalId,

                header,

                details

            );

            alert("Journal Updated.");

        }

        else {

            await JournalService.insert(

                header,

                details

            );

            alert("Journal Saved.");

        }

        /*
        ==========================================
        REFRESH
        ==========================================
        */

        this.modal.hide();

        await this.loadJournalList();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}
/*
==========================================================
LOAD JOURNAL LIST
==========================================================
*/

async loadJournalList() {

    try {

        this.journals =
            await JournalService.getAll();

        this.renderJournalTable();

    }

    catch (error) {

        console.error(
            "Failed Load Journal",
            error
        );

    }

}
/*
/*
==========================================================
RENDER JOURNAL TABLE
==========================================================
*/

renderJournalTable() {

    if (!this.tableBody) {

        console.error("journal-table-body tidak ditemukan.");

        return;

    }

    this.tableBody.innerHTML = "";

    if (!this.journals || this.journals.length === 0) {

        this.tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted">

                    No Journal Found

                </td>

            </tr>

        `;

        return;

    }

    this.journals.forEach((journal) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>

                ${journal.journal_no ?? "-"}

            </td>

            <td>

                ${journal.journal_date ?? "-"}

            </td>

            <td>

                ${journal.reference_no ?? "-"}

            </td>

            <td>

                ${journal.description ?? "-"}

            </td>

            <td class="text-center">

                <span class="badge ${journal.status === "Posted"
                    ? "bg-success"
                    : "bg-secondary"}">

                    ${journal.status ?? "Draft"}

                </span>

            </td>

            <td class="text-end">

                ${Number(
                    journal.total_debit ?? 0
                ).toLocaleString()}

            </td>

            <td class="text-end">

                ${Number(
                    journal.total_credit ?? 0
                ).toLocaleString()}

            </td>

            <td class="text-center">

                <button
                    type="button"
                    class="btn btn-sm btn-warning btn-edit">

                    <i class="fa-solid fa-pen"></i>

                </button>

            </td>

        `;

        this.tableBody.appendChild(row);

        /*
        ==========================================
        EDIT
        ==========================================
        */

       row.querySelector(".btn-edit").onclick = () => {

    this.openEditModal(journal.id);

};
    });

}
/*
==========================================================
OPEN EDIT MODAL
==========================================================
*/

async openEditModal(id) {

    console.log("STEP 1");

    try {

        console.log("STEP 2");

        const result = await JournalService.getById(id);

        console.log("STEP 3", result);

        const header = result.header;

        console.log("STEP 4");

        document.getElementById("journal-id").value =
            header.id;

        document.getElementById("journal-no").value =
            header.journal_no;

        document.getElementById("journal-date").value =
            header.journal_date;

        document.getElementById("reference-no").value =
            header.reference_no ?? "";

        document.getElementById("journal-description").value =
            header.description ?? "";

        document.getElementById("journal-posting-status").value =
            header.status;

        console.log("STEP 5");
        this.loadJournalDetail(result.details);

        this.modal.show();

        console.log("STEP 6");

    }

    catch (error) {

        console.error("OPEN EDIT ERROR", error);

    }

}
/*
==========================================================
LOAD JOURNAL DETAIL
==========================================================
*/

loadJournalDetail(details) {

    /*
    ==========================================
    CLEAR GRID
    ==========================================
    */

    this.detailBody.innerHTML = "";

    /*
    ==========================================
    LOOP DETAIL
    ==========================================
    */

    details.forEach((detail, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td class="text-center">

                ${index + 1}

            </td>

            <td>

                <select class="form-select coa-select">

                    ${this.getChartOfAccountsOptions()}

                </select>

            </td>

            <td>

                <select class="form-select bp-select">

                    ${this.getBusinessPartnerOptions()}

                </select>

            </td>

            <td>

                <input
                    type="text"
                    class="form-control description">

            </td>

            <td>

                <input
                    type="number"
                    class="form-control debit text-end">

            </td>

            <td>

                <input
                    type="number"
                    class="form-control credit text-end">

            </td>

            <td class="text-center">

                <button
                    type="button"
                    class="btn btn-sm btn-danger btn-remove-line">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        `;

        /*
        ==========================================
        SET VALUE
        ==========================================
        */

        row.querySelector(".coa-select").value =
            detail.account_id;

        row.querySelector(".bp-select").value =
            detail.business_partner_id ?? "";

        row.querySelector(".description").value =
            detail.description ?? "";

        row.querySelector(".debit").value =
            detail.debit;

        row.querySelector(".credit").value =
            detail.credit;

        /*
        ==========================================
        REMOVE
        ==========================================
        */

        row.querySelector(".btn-remove-line")

            .addEventListener(

                "click",

                () => this.removeDetailRow(

                    row.querySelector(".btn-remove-line")

                )

            );

        /*
        ==========================================
        AUTO DEBIT
        ==========================================
        */

        row.querySelector(".debit")

            .addEventListener(

                "input",

                () => this.calculateTotal()

            );

        /*
        ==========================================
        AUTO CREDIT
        ==========================================
        */

        row.querySelector(".credit")

            .addEventListener(

                "input",

                () => this.calculateTotal()

            );

        this.detailBody.appendChild(row);

    });

    /*
    ==========================================
    RECALCULATE
    ==========================================
    */

    this.calculateTotal();

}
/*
==========================================================
POST JOURNAL
==========================================================
*/

postJournal() {

    console.log("Post Journal");

}
/*
==========================================================
COLLECT JOURNAL HEADER
==========================================================
*/

collectJournalHeader() {

    return {

        journal_no:
            document.getElementById(
                "journal-no"
            ).value.trim(),

        journal_date:
            document.getElementById(
                "journal-date"
            ).value,

        reference_no:
            document.getElementById(
                "reference-no"
            ).value.trim(),

        description:
            document.getElementById(
                "journal-description"
            ).value.trim(),

        status:
    document.getElementById(
        "journal-posting-status"
    ).value

    };

}
/*
/*
==========================================================
COLLECT JOURNAL DETAIL
==========================================================
*/

collectJournalDetail() {

    const rows = document.querySelectorAll(
        "#journal-detail-body tr"
    );

    const details = [];

    rows.forEach(row => {

        console.log(
            "COA VALUE =",
            row.querySelector(".coa-select")?.value
        );

        console.log(
            row.querySelector(".coa-select")
        );

        details.push({

            account_id:
                row.querySelector(".coa-select")?.value || null,

            business_partner_id:
                row.querySelector(".bp-select")?.value || null,

            description:
                row.querySelector(".description")?.value.trim() || "",

            debit:
                parseFloat(
                    row.querySelector(".debit")?.value || 0
                ),

            credit:
                parseFloat(
                    row.querySelector(".credit")?.value || 0
                )

        });

    });

    console.log("DETAIL =", details);

    return details;

}
}