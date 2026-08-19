/*
======================================================
FINOVA ACCOUNTING SYSTEM
MODULE : TAX MASTER
======================================================
*/

import {
    TaxService
} from "../../service/tax-service.js";

import {
    supabase,
    TABLE
} from "../../assets/js/core/supabase.js";



/*
======================================================
TAX MASTER
======================================================
*/

export class Tax {

    constructor() {

        console.log(
            "Tax module constructor..."
        );

        /*
        ==============================================
        SERVICE
        ==============================================
        */

        this.service =
            new TaxService();


        /*
        ==============================================
        DATA
        ==============================================
        */

        this.taxes = [];

        this.currentTax = null;

        this.currentTaxId = null;


        /*
        ==============================================
        MODE
        ==============================================
        */

        this.currentMode = "add";


        /*
        ==============================================
        PAGINATION
        ==============================================
        */

        this.currentPage = 1;

        this.pageSize = 20;


        /*
        ==============================================
        FILTER
        ==============================================
        */

        this.keyword = "";

        this.taxType = "";

        this.status = "";


        /*
        ==============================================
        DOM
        ==============================================
        */

        this.cacheDOM();

    }


    /*
    ==================================================
    CACHE DOM
    ==================================================
    */

    cacheDOM() {

        this.tableBody =
            document.getElementById(
                "tax-table-body"
            );


        this.keywordInput =
            document.getElementById(
                "tax-filter-keyword"
            );


        this.typeFilter =
            document.getElementById(
                "tax-filter-type"
            );


        this.statusFilter =
            document.getElementById(
                "tax-filter-status"
            );


        this.btnAdd =
            document.getElementById(
                "btn-add-tax"
            );


        this.btnSearch =
            document.getElementById(
                "btn-find-tax"
            );


        this.btnRefresh =
            document.getElementById(
                "btn-refresh-tax"
            );


        this.pagination =
            document.getElementById(
                "tax-pagination"
            );


        /*
        ==============================================
        FORM
        ==============================================
        */

        this.taxModal =
            document.getElementById(
                "taxModal"
            );


        this.taxForm =
            document.getElementById(
                "tax-form"
            );


        this.taxId =
            document.getElementById(
                "tax-form-id"
            );


        this.taxCode =
            document.getElementById(
                "tax-form-code"
            );


        this.taxName =
            document.getElementById(
                "tax-form-name"
            );


        this.taxTypeInput =
            document.getElementById(
                "tax-form-type"
            );


        this.taxRate =
            document.getElementById(
                "tax-form-rate"
            );


        this.taxAccount =
            document.getElementById(
                "tax-form-account"
            );


        this.offsetAccount =
            document.getElementById(
                "tax-form-offset-account"
            );


        this.description =
            document.getElementById(
                "tax-form-description"
            );


        this.statusInput =
            document.getElementById(
                "tax-form-status"
            );


        this.btnSave =
            document.getElementById(
                "btn-save-tax"
            );


        this.modalTitle =
            document.getElementById(
                "taxModalLabel"
            );

    }


    /*
    ==================================================
    INIT
    ==================================================
    */

    async init() {

        try {

            console.log(
                "Tax Master initializing..."
            );


            this.bindEvents();


            await this.loadCOA();


            await this.loadData();


            console.log(
                "Tax Master initialized."
            );

        }

        catch (error) {

            console.error(
                "Tax.init:",
                error
            );

            this.showError(
                error.message
                ||
                "Failed to initialize Tax Master."
            );

        }

    }


    /*
    ==================================================
    BIND EVENTS
    ==================================================
    */

    bindEvents() {

        /*
        ==============================================
        ADD
        ==============================================
        */

        this.btnAdd?.addEventListener(
            "click",
            () => {

                this.openAddModal();

            }
        );


        /*
        ==============================================
        SEARCH
        ==============================================
        */

        this.btnSearch?.addEventListener(
            "click",
            () => {

                this.search();

            }
        );


        /*
        ==============================================
        ENTER SEARCH
        ==============================================
        */

        this.keywordInput?.addEventListener(
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
        ==============================================
        TYPE FILTER
        ==============================================
        */

        this.typeFilter?.addEventListener(
            "change",
            () => {

                this.search();

            }
        );


        /*
        ==============================================
        STATUS FILTER
        ==============================================
        */

        this.statusFilter?.addEventListener(
            "change",
            () => {

                this.search();

            }
        );


        /*
        ==============================================
        REFRESH
        ==============================================
        */

        this.btnRefresh?.addEventListener(
            "click",
            () => {

                this.refresh();

            }
        );


        /*
        ==============================================
        SAVE
        ==============================================
        */

        this.btnSave?.addEventListener(
            "click",
            () => {

                this.save();

            }
        );


        /*
        ==============================================
        TABLE ACTION
        ==============================================
        */

        this.tableBody?.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-tax-action]"
                    );


                if (!button) {

                    return;

                }


                const action =
                    button.dataset.taxAction;


                const id =
                    button.dataset.taxId;


                this.handleAction(
                    action,
                    id
                );

            }
        );

    }


    /*
    ==================================================
    LOAD DATA
    ==================================================
    */

    async loadData() {

        try {

            const data =
                await this.service.getAll();


            this.taxes =
                Array.isArray(data)
                    ? data
                    : [];


            this.currentPage =
                1;


            this.render();

        }

        catch (error) {

            console.error(
                "Tax.loadData:",
                error
            );

            throw error;

        }

    }


    /*
    ==================================================
    SEARCH
    ==================================================
    */

    search() {

        this.keyword =
            this.keywordInput?.value
            ?.trim()
            .toLowerCase()
            || "";


        this.taxType =
            this.typeFilter?.value
            || "";


        this.status =
            this.statusFilter?.value
            || "";


        this.currentPage =
            1;


        this.render();

    }


    /*
    ==================================================
    GET FILTERED DATA
    ==================================================
    */

    getFilteredData() {

        return this.taxes.filter(
            tax => {

                /*
                ======================================
                KEYWORD
                ======================================
                */

                if (
                    this.keyword
                ) {

                    const text =
                        [
                            tax.tax_code,
                            tax.tax_name,
                            tax.description
                        ]
                        .join(" ")
                        .toLowerCase();


                    if (
                        !text.includes(
                            this.keyword
                        )
                    ) {

                        return false;

                    }

                }


                /*
                ======================================
                TYPE
                ======================================
                */

                if (
                    this.taxType
                    &&
                    tax.tax_type
                    !==
                    this.taxType
                ) {

                    return false;

                }


                /*
                ======================================
                STATUS
                ======================================
                */

                if (
                    this.status !== ""
                    &&
                    String(
                        tax.status
                    )
                    !==
                    this.status
                ) {

                    return false;

                }


                return true;

            }
        );

    }


    /*
    ==================================================
    RENDER
    ==================================================
    */

    render() {

        if (!this.tableBody) {

            return;

        }


        const filtered =
            this.getFilteredData();


        const start =
            (
                this.currentPage
                - 1
            )
            *
            this.pageSize;


        const end =
            start
            +
            this.pageSize;


        const rows =
            filtered.slice(
                start,
                end
            );


        /*
        ==============================================
        EMPTY
        ==============================================
        */

        if (!rows.length) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="text-center text-muted py-4">

                        No tax data found.

                    </td>

                </tr>

            `;


            this.renderPagination(
                filtered.length
            );


            return;

        }


        /*
        ==============================================
        ROWS
        ==============================================
        */

        this.tableBody.innerHTML =
            rows.map(
                (tax, index) => {

                    const number =
                        start
                        +
                        index
                        +
                        1;


                    const typeBadge =
                        tax.tax_type
                        === "PLUS"

                            ? `
                                <span
                                    class="badge bg-success">
                                    PLUS
                                </span>
                              `

                            : `
                                <span
                                    class="badge bg-warning text-dark">
                                    MINUS
                                </span>
                              `;


                    const statusBadge =
                        tax.status

                            ? `
                                <span
                                    class="badge bg-success">
                                    Active
                                </span>
                              `

                            : `
                                <span
                                    class="badge bg-secondary">
                                    Inactive
                                </span>
                              `;


                    const taxAccount =
                        tax.tax_account
                        ? `
                            ${tax.tax_account.account_code}
                            -
                            ${tax.tax_account.account_name}
                          `
                        : "-";


                    const offsetAccount =
                        tax.offset_account
                        ? `
                            ${tax.offset_account.account_code}
                            -
                            ${tax.offset_account.account_name}
                          `
                        : "-";


                    return `

                        <tr>

                            <td>
                                ${number}
                            </td>

                            <td>
                                <strong>
                                    ${tax.tax_code || "-"}
                                </strong>
                            </td>

                            <td>
                                ${tax.tax_name || "-"}
                            </td>

                            <td>
                                ${typeBadge}
                            </td>

                            <td class="text-end">
                                ${this.formatRate(
                                    tax.tax_rate
                                )}
                            </td>

                            <td>
                                ${taxAccount}
                            </td>

                            <td>
                                ${offsetAccount}
                            </td>

                            <td class="text-center">
                                ${statusBadge}
                            </td>

                            <td class="text-center">

                                <div
                                    class="btn-group btn-group-sm">

                                    <button
                                        type="button"
                                        class="btn btn-outline-primary"
                                        title="Edit"
                                        data-tax-action="edit"
                                        data-tax-id="${tax.id}">

                                        <i
                                            class="fa-solid fa-pen">
                                        </i>

                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-outline-danger"
                                        title="Delete"
                                        data-tax-action="delete"
                                        data-tax-id="${tax.id}">

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


        this.renderPagination(
            filtered.length
        );

    }


    /*
    ==================================================
    PAGINATION
    ==================================================
    */

    renderPagination(
        total
    ) {

        if (!this.pagination) {

            return;

        }


        const totalPages =
            Math.ceil(
                total
                /
                this.pageSize
            );


        if (
            totalPages <= 1
        ) {

            this.pagination.innerHTML =
                "";

            return;

        }


        let html = "";


        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            html += `

                <button
                    type="button"
                    class="
                        btn
                        btn-sm
                        ${
                            page
                            ===
                            this.currentPage
                                ? "btn-primary"
                                : "btn-light border"
                        }
                    "
                    data-tax-page="${page}">

                    ${page}

                </button>

            `;

        }


        this.pagination.innerHTML =
            html;


        this.pagination
            .querySelectorAll(
                "[data-tax-page]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            this.currentPage =
                                Number(
                                    button.dataset.taxPage
                                );


                            this.render();

                        }
                    );

                }
            );

    }


    /*
    ==================================================
    OPEN ADD MODAL
    ==================================================
    */

    openAddModal() {

        this.currentMode =
            "add";


        this.currentTaxId =
            null;


        this.currentTax =
            null;


        this.resetForm();


        if (this.modalTitle) {

            this.modalTitle.textContent =
                "Add Tax";

        }


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                this.taxModal
            );


        modal.show();

    }


    /*
    ==================================================
    OPEN EDIT MODAL
    ==================================================
    */

    async openEditModal(id) {

        try {

            const tax =
                await this.service.getById(
                    id
                );


            if (!tax) {

                throw new Error(
                    "Tax not found."
                );

            }


            this.currentMode =
                "edit";


            this.currentTaxId =
                id;


            this.currentTax =
                tax;


            this.fillForm(
                tax
            );


            if (this.modalTitle) {

                this.modalTitle.textContent =
                    "Edit Tax";

            }


            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    this.taxModal
                );


            modal.show();

        }

        catch (error) {

            console.error(
                "Tax.openEditModal:",
                error
            );

            this.showError(
                error.message
                ||
                "Failed to open Tax."
            );

        }

    }


    /*
    ==================================================
    FILL FORM
    ==================================================
    */

    fillForm(
        tax
    ) {

        if (this.taxId) {

            this.taxId.value =
                tax.id
                || "";

        }


        if (this.taxCode) {

            this.taxCode.value =
                tax.tax_code
                || "";

        }


        if (this.taxName) {

            this.taxName.value =
                tax.tax_name
                || "";

        }


        if (this.taxTypeInput) {

            this.taxTypeInput.value =
                tax.tax_type
                || "";

        }


        if (this.taxRate) {

            this.taxRate.value =
                tax.tax_rate
                ?? "";

        }


        if (this.taxAccount) {

            this.taxAccount.value =
                tax.tax_account_id
                || "";

        }


        if (this.offsetAccount) {

            this.offsetAccount.value =
                tax.offset_account_id
                || "";

        }


        if (this.description) {

            this.description.value =
                tax.description
                || "";

        }


        if (this.statusInput) {

            this.statusInput.checked =
                Boolean(
                    tax.status
                );

        }

    }


    /*
    ==================================================
    RESET FORM
    ==================================================
    */

    resetForm() {

        this.taxForm?.reset();


        if (this.taxId) {

            this.taxId.value =
                "";

        }


        if (this.statusInput) {

            this.statusInput.checked =
                true;

        }

    }


    /*
    ==================================================
    SAVE
    ==================================================
    */

    async save() {

        try {

            const payload = {

                tax_code:
                    this.taxCode?.value
                    ?.trim()
                    || "",

                tax_name:
                    this.taxName?.value
                    ?.trim()
                    || "",

                tax_type:
                    this.taxTypeInput?.value
                    || "",

                tax_rate:
                    Number(
                        this.taxRate?.value
                        || 0
                    ),

                tax_account_id:
                    Number(
                        this.taxAccount?.value
                        || 0
                    ),

                offset_account_id:
                    Number(
                        this.offsetAccount?.value
                        || 0
                    ),

                description:
                    this.description?.value
                    ?.trim()
                    || null,

                status:
                    this.statusInput
                        ? this.statusInput.checked
                        : true

            };


            if (
                this.currentMode
                ===
                "edit"
            ) {

                await this.service.update(
                    this.currentTaxId,
                    payload
                );

            }
            else {

                await this.service.create(
                    payload
                );

            }


            const modal =
                bootstrap.Modal.getInstance(
                    this.taxModal
                );


            modal?.hide();


            await this.loadData();


            this.showSuccess(
                this.currentMode
                ===
                "edit"
                    ? "Tax updated successfully."
                    : "Tax created successfully."
            );

        }

        catch (error) {

            console.error(
                "Tax.save:",
                error
            );

            this.showError(
                error.message
                ||
                "Failed to save Tax."
            );

        }

    }


    /*
    ==================================================
    HANDLE ACTION
    ==================================================
    */

    handleAction(
        action,
        id
    ) {

        switch (
            action
        ) {

            case "edit":

                this.openEditModal(
                    id
                );

                break;


            case "delete":

                this.deleteTax(
                    id
                );

                break;

        }

    }


    /*
    ==================================================
    DELETE
    ==================================================
    */

    async deleteTax(id) {

        try {

            const tax =
                this.taxes.find(
                    item =>
                        String(
                            item.id
                        )
                        ===
                        String(id)
                );


            if (!tax) {

                throw new Error(
                    "Tax not found."
                );

            }


            const confirmed =
                window.confirm(
                    `Delete Tax "${tax.tax_name}"?`
                );


            if (!confirmed) {

                return;

            }


            await this.service.delete(
                id
            );


            await this.loadData();


            this.showSuccess(
                "Tax deleted successfully."
            );

        }

        catch (error) {

            console.error(
                "Tax.deleteTax:",
                error
            );

            this.showError(
                error.message
                ||
                "Failed to delete Tax."
            );

        }

    }


    /*
    ==================================================
    LOAD COA
    ==================================================
    */

    async loadCOA() {

        try {

            const {
                data,
                error
            } = await supabase

                .from(
                    TABLE.CHART_OF_ACCOUNTS
                )

                .select(`
                    id,
                    account_code,
                    account_name,
                    status,
                    allow_transaction
                `)

                .eq(
                    "status",
                    true
                )

                .eq(
                    "allow_transaction",
                    true
                )

                .order(
                    "account_code",
                    {
                        ascending: true
                    }
                );


            if (error) {

                throw error;

            }


            const accounts =
                data || [];


            this.populateCOA(
                accounts
            );

        }

        catch (error) {

            console.error(
                "Tax.loadCOA:",
                error
            );

            throw error;

        }

    }


    /*
    ==================================================
    POPULATE COA
    ==================================================
    */

    populateCOA(
        accounts
    ) {

        if (!this.taxAccount) {

            return;

        }


        const currentTaxAccount =
            this.taxAccount.value;


        const currentOffsetAccount =
            this.offsetAccount?.value;


        const options = accounts
            .map(
                account => `

                    <option
                        value="${account.id}">

                        ${account.account_code}
                        -
                        ${account.account_name}

                    </option>

                `
            )
            .join("");


        this.taxAccount.innerHTML = `

            <option value="">
                Select Tax Account
            </option>

            ${options}

        `;


        if (this.offsetAccount) {

            this.offsetAccount.innerHTML = `

                <option value="">
                    Select Offset Account
                </option>

                ${options}

            `;

        }


        if (currentTaxAccount) {

            this.taxAccount.value =
                currentTaxAccount;

        }


        if (
            this.offsetAccount
            &&
            currentOffsetAccount
        ) {

            this.offsetAccount.value =
                currentOffsetAccount;

        }

    }


    /*
    ==================================================
    REFRESH
    ==================================================
    */

    async refresh() {

        try {

            await this.loadData();

        }

        catch (error) {

            console.error(
                "Tax.refresh:",
                error
            );

        }

    }


    /*
    ==================================================
    FORMAT RATE
    ==================================================
    */

    formatRate(
        rate
    ) {

        const value =
            Number(
                rate || 0
            );


        return `${value}%`;

    }


    /*
    ==================================================
    FORMAT MESSAGE
    ==================================================
    */

    showSuccess(
        message
    ) {

        console.log(
            "SUCCESS:",
            message
        );

        /*
        ==============================================
        Gunakan mekanisme notification FINOVA
        Anda di sini jika sudah tersedia.
        ==============================================
        */

    }


    showError(
        message
    ) {

        console.error(
            "ERROR:",
            message
        );

        /*
        ==============================================
        Gunakan mekanisme notification FINOVA
        Anda di sini jika sudah tersedia.
        ==============================================
        */

    }

}