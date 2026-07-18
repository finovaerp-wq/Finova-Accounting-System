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

    this.btnSearch =
        document.getElementById("btn-search");

    this.btnRefresh =
        document.getElementById("btn-refresh");

    this.btnExportExcel =
        document.getElementById("btn-export-excel");

    this.btnPreview =
        document.getElementById("btn-preview");

        /* ==========================================
       PAGINATION
    ========================================== */

    this.pagination =
        document.querySelector(".finova-pagination");

    this.paginationInfo =
        document.getElementById(
            "bp-pagination-info"
        );

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
       SEARCH
    ====================================================== */

    this.btnSearch?.addEventListener(
        "click",
        () => this.search()
    );

    this.searchInput?.addEventListener(
    "keyup",
        (event) => {

            if (event.key === "Enter") {

                this.search();

            }

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

    
}
/*
==========================================================
PREVIEW
==========================================================
*/

preview() {

    try {

        if (!this.filteredData.length) {

            this.showError("No data available.");

            return;

        }

        const columns = [

            "Code",
            "Name",
            "Type",
            "Term Of Payment",
            "Phone",
            "Status"

        ];

        const rows = this.filteredData.map(item => `

<tr>

<td>${item.bp_code}</td>

<td>${item.bp_name}</td>

<td>${item.bp_type}</td>

<td>${item.mst_term_of_payment?.top_code ?? ""}</td>

<td>${item.phone ?? ""}</td>

<td>${item.status ? "Active" : "Inactive"}</td>

</tr>

`);

        PreviewService.open({

            title: "Business Partner",

            columns,

            rows

        });

    }

    catch (error) {

        console.error(error);

        this.showError("Preview failed.");

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

        this.renderPagination();

        this.updatePaginationInfo();

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

    this.renderPagination();

    this.updatePaginationInfo();

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

            <td>${item.bp_code}</td>

            <td>${item.bp_name}</td>

            <td>${item.bp_type}</td>

            <td>${item.phone || "-"}</td>

            <td>${item.email ?? ""}</td>

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

    /*
    ==========================================================
    COLLECT FORM DATA
    ==========================================================
    */

    collectFormData() {

    return {

        bp_name:
            this.bpName.value.trim(),

        bp_type:
            this.bpType.value,

        top_id:
            this.bpTop.value || null,

        phone:
            this.bpPhone.value.trim(),

        email:
            this.bpEmail.value.trim(),

        address:
            this.bpAddress.value.trim(),

        city:
            this.bpCity.value.trim(),

        country:
            this.bpCountry.value.trim(),

        tax_number:
            this.bpTaxNumber.value.trim(),

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

    /*
==========================================================
UPDATE
==========================================================
*/

async update(id) {

    try {

        /*
        ==========================================
        COLLECT FORM DATA
        ==========================================
        */

        const payload = this.collectFormData();

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
        REFRESH
        ==========================================
        */

        this.closeModal();

        await this.loadData();

        this.showSuccess(
            "Business Partner successfully updated."
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

        const confirmDelete = confirm(

            "Delete this Business Partner?"

        );

        if (!confirmDelete) {

            return;

        }

        try {

            await BusinessPartnerService.delete(id);

            this.currentPage = 1;

            await this.loadData();

            this.showSuccess(

                "Business Partner successfully deleted."

            );

        }

        catch (error) {

            console.error(error);

            this.showError(error.message);

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
    SUCCESS MESSAGE
    ==========================================================
    */

    showSuccess(message) {

        /*
            Sprint berikutnya kita ganti
            menggunakan Notification Component.
        */

        alert(message);

    }

    /*
    ==========================================================
    ERROR MESSAGE
    ==========================================================
    */

    showError(message) {

        /*
            Sprint berikutnya kita ganti
            menggunakan Notification Component.
        */

        alert(message);

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