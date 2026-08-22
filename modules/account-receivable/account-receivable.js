/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : ACCOUNT RECEIVABLE
FILE    : account-receivable.js
VERSION : 1.0.0
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
    AccountReceivableService
} from "../../service/account-receivable.service.js";


import {
    GeneralJournalService
} from "../../service/journal.service.js";


import {
    TaxService
} from "../../service/tax-service.js";


import {
    ExcelExportService
} from "../../service/excel-export.service.js";


import {
    PreviewService
} from "../../service/preview.service.js";


/*
==========================================================
ACCOUNT RECEIVABLE
==========================================================
*/

export class AccountReceivable {


    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor() {

        /*
        ==================================================
        SERVICE
        ==================================================
        */

        this.service =
            new AccountReceivableService();


        this.journalService =
            new GeneralJournalService();


        this.taxService =
            new TaxService();


        /*
        ==================================================
        DATA
        ==================================================
        */

        this.data = [];

        this.filteredData = [];

        this.invoiceDetails = [];

        this.customerData = [];

        this.currentCOA = [];

        this.taxPlusData = [];

        this.taxMinusData = [];


        /*
        ==================================================
        STATE
        ==================================================
        */

        this.currentInvoiceId = null;

        this.currentDetailId = null;

        this.currentMode = "add";

        this.pendingDeleteInvoiceId = null;

        this.pendingDeleteDetailId = null;

        /*
==================================================
PAYMENT STATE
==================================================
*/

this.paymentModalLoaded = false;

this.accountReceivablePaymentModal = null;

this.currentPaymentARId = null;


/*
==================================================
PAYMENT DOM
==================================================
*/

this.arPaymentARId = null;

this.arPaymentInvoiceNo = null;

this.arPaymentCustomer = null;

this.arPaymentTotal = null;

this.arPaymentPaid = null;

this.arPaymentOutstanding = null;

this.arPaymentDate = null;

this.arPaymentAccount = null;

this.arPaymentAmount = null;

this.arPaymentReferenceNo = null;

this.arPaymentDescription = null;

this.btnSaveARPayment = null;


        /*
        ==================================================
        PAGINATION
        ==================================================
        */

        this.pageSize =
            CONFIG.PAGE_SIZE
            || 20;

        this.currentPage = 1;


        /*
        ==================================================
        MODAL STATE
        ==================================================
        */

        this.modalLoaded = false;

        this.detailModalLoaded = false;

        this.accountReceivableModal = null;

        this.accountReceivableDetailModal = null;


        /*
        ==================================================
        SEARCHABLE SELECT
        ==================================================
        */

        this.arDetailCOASelect = null;


        /*
        ==================================================
        TABLE
        ==================================================
        */

        this.tableBody = null;


        /*
        ==================================================
        FILTER
        ==================================================
        */

        this.dateFrom = null;

        this.dateTo = null;

        this.statusFilter = null;

        this.findBy = null;

        this.keyword = null;


        /*
        ==================================================
        TOOLBAR
        ==================================================
        */

        this.btnFind = null;

        this.btnAdd = null;

        this.btnRefresh = null;

        this.btnDownloadExcel = null;

        this.btnPreviewHTML = null;


        /*
        ==================================================
        PAGINATION DOM
        ==================================================
        */

        this.btnFirstPage = null;

        this.btnPrevPage = null;

        this.currentPageInput = null;

        this.totalPagesElement = null;

        this.btnNextPage = null;

        this.btnLastPage = null;

        this.recordInfo = null;


        /*
        ==================================================
        HEADER FORM
        ==================================================
        */

        this.arFormId = null;

        this.arFormCustomer = null;

        this.arFormTop = null;

        this.arFormInvoiceNo = null;

        this.arFormPoNo = null;

        this.arFormInvoiceDate = null;

        this.arFormDateReceived = null;

        this.arFormDueDate = null;

        this.arFormJournalNo = null;

        this.arFormStatus = null;

        this.arFormDescription = null;


        /*
        ==================================================
        DETAIL
        ==================================================
        */

        this.btnAddDetail = null;

        this.btnSaveARDetail = null;

        this.arDetailCOA = null;

        this.arDetailQuantity = null;

        this.arDetailUnitPrice = null;

        this.arDetailTaxOutputRate = null;

        this.arDetailWithholdingTaxRate = null;

        this.arDetailLineAmount = null;

        this.arDetailTaxOutputAmount = null;

        this.arDetailWithholdingTaxAmount = null;

        this.arDetailTotalAmount = null;


        /*
        ==================================================
        SAVE
        ==================================================
        */

        this.btnSaveDraft = null;


        /*
        ==================================================
        SUMMARY
        ==================================================
        */

        this.arFormSubtotal = null;

        this.arFormTax = null;

        this.arFormWHT = null;

        this.arFormTotal = null;

    }


    /*
    ======================================================
    INIT
    ======================================================
    */

    async init() {

        try {

            await this.loadModalHTML();

            await this.loadDetailModalHTML();
            await this.loadPaymentModalHTML();

            this.cacheDOM();

            await this.loadCustomers();

            await this.loadDetailCOA();

            await this.loadTaxMaster();

            this.bindEvents();

            await this.loadData();


            console.log(
                "Account Receivable initialized."
            );

        }

        catch (error) {

            console.error(
                "AccountReceivable.init:",
                error
            );


            this.showError(
                "Failed to initialize Account Receivable."
            );

        }

    }

    /*
======================================================
LOAD PAYMENT MODAL HTML
======================================================
*/

async loadPaymentModalHTML() {

    try {

        const existing =
            document.getElementById(
                "accountReceivablePaymentModal"
            );


        if (existing) {

            this.accountReceivablePaymentModal =
                existing;

            this.paymentModalLoaded =
                true;

            return;

        }


        const response =
            await fetch(
                new URL(
                    "./account-receivable-payment-modal.html",
                    import.meta.url
                )
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load AR Payment Modal: ${response.status}`
            );

        }


        const html =
            await response.text();


        if (!html.trim()) {

            throw new Error(
                "AR Payment Modal HTML is empty."
            );

        }


        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );


        this.accountReceivablePaymentModal =
            document.getElementById(
                "accountReceivablePaymentModal"
            );


        this.paymentModalLoaded =
            true;

    }

    catch (error) {

        console.error(
            "AccountReceivable.loadPaymentModalHTML:",
            error
        );


        throw error;

    }

}
    /*
    ======================================================
    LOAD MAIN MODAL
    ======================================================
    */

    async loadModalHTML() {

        try {

            const existing =
                document.getElementById(
                    "accountReceivableModal"
                );


            if (existing) {

                this.accountReceivableModal =
                    existing;

                this.modalLoaded =
                    true;

                return;

            }


            const response =
                await fetch(
                    new URL(
                        "./account-receivable-modal.html",
                        import.meta.url
                    )
                );


            if (!response.ok) {

                throw new Error(
                    `Failed to load Account Receivable modal: ${response.status}`
                );

            }


            const html =
                await response.text();


            if (!html.trim()) {

                throw new Error(
                    "Account Receivable modal HTML is empty."
                );

            }


            document.body.insertAdjacentHTML(
                "beforeend",
                html
            );


            this.accountReceivableModal =
                document.getElementById(
                    "accountReceivableModal"
                );


            this.modalLoaded =
                true;

        }

        catch (error) {

            console.error(
                "AccountReceivable.loadModalHTML:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    LOAD DETAIL MODAL
    ======================================================
    */

    async loadDetailModalHTML() {

        try {

            const existing =
                document.getElementById(
                    "accountReceivableDetailModal"
                );


            if (existing) {

                this.accountReceivableDetailModal =
                    existing;

                this.detailModalLoaded =
                    true;

                return;

            }


            const response =
                await fetch(
                    new URL(
                        "./account-receivable-detail-modal.html",
                        import.meta.url
                    )
                );


            if (!response.ok) {

                throw new Error(
                    `Failed to load Account Receivable Detail Modal: ${response.status}`
                );

            }


            const html =
                await response.text();


            if (!html.trim()) {

                throw new Error(
                    "Account Receivable Detail Modal HTML is empty."
                );

            }


            document.body.insertAdjacentHTML(
                "beforeend",
                html
            );


            this.accountReceivableDetailModal =
                document.getElementById(
                    "accountReceivableDetailModal"
                );


            this.detailModalLoaded =
                true;

        }

        catch (error) {

            console.error(
                "AccountReceivable.loadDetailModalHTML:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    CACHE DOM
    ======================================================
    */

    cacheDOM() {

        /*
        ==================================================
        TABLE
        ==================================================
        */

        this.tableBody =
            document.getElementById(
                "account-receivable-table-body"
            );


        /*
        ==================================================
        FILTER
        ==================================================
        */

        this.dateFrom =
            document.getElementById(
                "ar-date-from"
            );


        this.dateTo =
            document.getElementById(
                "ar-date-to"
            );


        this.statusFilter =
            document.getElementById(
                "ar-status"
            );


        this.findBy =
            document.getElementById(
                "ar-find-by"
            );


        this.keyword =
            document.getElementById(
                "ar-keyword"
            );
        
        /*
==================================================
PAYMENT
==================================================
*/

this.arPaymentARId =
    document.getElementById(
        "ar-payment-ar-id"
    );


this.arPaymentInvoiceNo =
    document.getElementById(
        "ar-payment-invoice-no"
    );


this.arPaymentCustomer =
    document.getElementById(
        "ar-payment-customer"
    );


this.arPaymentTotal =
    document.getElementById(
        "ar-payment-total"
    );


this.arPaymentPaid =
    document.getElementById(
        "ar-payment-paid"
    );


this.arPaymentOutstanding =
    document.getElementById(
        "ar-payment-outstanding"
    );


this.arPaymentDate =
    document.getElementById(
        "ar-payment-date"
    );


this.arPaymentAccount =
    document.getElementById(
        "ar-payment-account"
    );


this.arPaymentAmount =
    document.getElementById(
        "ar-payment-amount"
    );


this.arPaymentReferenceNo =
    document.getElementById(
        "ar-payment-reference-no"
    );


this.arPaymentDescription =
    document.getElementById(
        "ar-payment-description"
    );


this.btnSaveARPayment =
    document.getElementById(
        "btn-save-ar-payment"
    );

        /*
        ==================================================
        TOOLBAR
        ==================================================
        */

        this.btnFind =
            document.getElementById(
                "btn-ar-find"
            );


        this.btnAdd =
            document.getElementById(
                "btn-add-ar"
            );


        this.btnRefresh =
            document.getElementById(
                "btn-refresh-ar"
            );


        this.btnDownloadExcel =
            document.getElementById(
                "btn-download-excel-ar"
            );


        this.btnPreviewHTML =
            document.getElementById(
                "btn-preview-html-ar"
            );


        /*
        ==================================================
        PAGINATION
        ==================================================
        */

        this.btnFirstPage =
            document.getElementById(
                "ar-page-first"
            );


        this.btnPrevPage =
            document.getElementById(
                "ar-page-prev"
            );


        this.currentPageInput =
            document.getElementById(
                "ar-current-page"
            );


        this.totalPagesElement =
            document.getElementById(
                "ar-total-pages"
            );


        this.btnNextPage =
            document.getElementById(
                "ar-page-next"
            );


        this.btnLastPage =
            document.getElementById(
                "ar-page-last"
            );


        this.recordInfo =
            document.getElementById(
                "ar-record-info"
            );


        /*
        ==================================================
        HEADER FORM
        ==================================================
        */

        this.arFormId =
            document.getElementById(
                "ar-form-id"
            );


        this.arFormCustomer =
            document.getElementById(
                "ar-form-customer"
            );


        this.arFormTop =
            document.getElementById(
                "ar-form-top"
            );


        this.arFormInvoiceNo =
            document.getElementById(
                "ar-form-invoice-no"
            );


        this.arFormPoNo =
            document.getElementById(
                "ar-form-po-no"
            );


        this.arFormInvoiceDate =
            document.getElementById(
                "ar-form-invoice-date"
            );


        this.arFormDateReceived =
            document.getElementById(
                "ar-form-date-received"
            );


        this.arFormDueDate =
            document.getElementById(
                "ar-form-due-date"
            );


        this.arFormJournalNo =
            document.getElementById(
                "ar-form-journal-no"
            );


        this.arFormStatus =
            document.getElementById(
                "ar-form-status"
            );


        this.arFormDescription =
            document.getElementById(
                "ar-form-description"
            );


        /*
        ==================================================
        DETAIL
        ==================================================
        */

        this.btnAddDetail =
            document.getElementById(
                "btn-add-ar-detail"
            );


        this.btnSaveARDetail =
            document.getElementById(
                "btn-save-ar-detail"
            );


        this.arDetailCOA =
            document.getElementById(
                "ar-detail-coa"
            );


        this.arDetailQuantity =
            document.getElementById(
                "ar-detail-quantity"
            );


        this.arDetailUnitPrice =
            document.getElementById(
                "ar-detail-unit-price"
            );


        this.arDetailTaxOutputRate =
            document.getElementById(
                "ar-detail-tax-output-rate"
            );


        this.arDetailWithholdingTaxRate =
            document.getElementById(
                "ar-detail-withholding-tax-rate"
            );


        this.arDetailLineAmount =
            document.getElementById(
                "ar-detail-line-amount"
            );


        this.arDetailTaxOutputAmount =
            document.getElementById(
                "ar-detail-tax-output-amount"
            );


        this.arDetailWithholdingTaxAmount =
            document.getElementById(
                "ar-detail-withholding-tax-amount"
            );


        this.arDetailTotalAmount =
            document.getElementById(
                "ar-detail-total-amount"
            );


        /*
        ==================================================
        SAVE
        ==================================================
        */

        this.btnSaveDraft =
            document.getElementById(
                "btn-save-ar-draft"
            );


        /*
        ==================================================
        SUMMARY
        ==================================================
        */

        this.arFormSubtotal =
            document.getElementById(
                "ar-form-subtotal"
            );


        this.arFormTax =
            document.getElementById(
                "ar-form-tax"
            );


        this.arFormWHT =
            document.getElementById(
                "ar-form-wht"
            );


        this.arFormTotal =
            document.getElementById(
                "ar-form-total"
            );


        console.log(
            "Account Receivable DOM cached."
        );

    }
    /*
======================================================
LOAD PAYMENT ACCOUNTS
======================================================
*/

async loadPaymentAccounts() {

    try {

        if (
            !this.arPaymentAccount
        ) {

            return;

        }


        const {
            data,
            error
        } =
            await supabase

                .from(
                    "mst_chart_of_accounts"
                )

                .select(`
                    id,
                    account_code,
                    account_name,
                    normal_balance,
                    is_header,
                    allow_transaction,
                    status
                `)

                .eq(
                    "status",
                    true
                )

                .eq(
                    "is_header",
                    false
                )

                .eq(
                    "allow_transaction",
                    true
                )

                .order(
                    "account_code",
                    {
                        ascending:
                            true
                    }
                );


        if (error) {

            throw error;

        }


        this.arPaymentAccount.innerHTML = `

            <option value="">
                Select Bank / Cash Account
            </option>

        `;


        (data || [])
            .filter(
                account => {

                    const name =
                        String(
                            account.account_name
                            || ""
                        )
                        .trim()
                        .toUpperCase();


                    return (
                        name.includes(
                            "BANK"
                        )
                        ||
                        name.includes(
                            "KAS"
                        )
                    );

                }
            )
            .forEach(
                account => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        account.id;


                    option.textContent =
                        `${account.account_code} - ${account.account_name}`;


                    this.arPaymentAccount
                        .appendChild(
                            option
                        );

                }
            );

    }

    catch (error) {

        console.error(
            "AccountReceivable.loadPaymentAccounts:",
            error
        );


        throw error;

    }

}
/*
======================================================
RECEIVE PAYMENT
======================================================
*/

async receivePayment(id) {

    try {

        if (!id) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        const result =
            await this.service.getById(
                id
            );


        if (
            !result
            ||
            !result.header
        ) {

            throw new Error(
                "Account Receivable not found."
            );

        }


        const header =
            result.header;


        const status =
            String(
                header.status
                || ""
            )
            .trim()
            .toLowerCase();


        if (
            status !== "unpaid"
        ) {

            throw new Error(
                "Only Unpaid Account Receivable can receive payment."
            );

        }


        this.currentPaymentARId =
            id;


        await this.loadPaymentAccounts();


        if (
            this.arPaymentARId
        ) {

            this.arPaymentARId.value =
                id;

        }


        if (
            this.arPaymentInvoiceNo
        ) {

            this.arPaymentInvoiceNo.value =
                header.invoice_no
                || "";

        }


        if (
            this.arPaymentCustomer
        ) {

            this.arPaymentCustomer.value =
                header
                    .mst_business_partner
                    ?.bp_name
                || "";

        }


        if (
            this.arPaymentTotal
        ) {

            this.arPaymentTotal.value =
                this.formatCurrency(
                    Number(
                        header.total_amount
                        || 0
                    )
                );

        }


        if (
            this.arPaymentPaid
        ) {

            this.arPaymentPaid.value =
                this.formatCurrency(
                    Number(
                        header.paid_amount
                        || 0
                    )
                );

        }


        if (
            this.arPaymentOutstanding
        ) {

            this.arPaymentOutstanding.value =
                this.formatCurrency(
                    Number(
                        header.outstanding_amount
                        || 0
                    )
                );

        }


        if (
            this.arPaymentDate
        ) {

            this.arPaymentDate.value =
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10
                    );

        }


        if (
            this.arPaymentAccount
        ) {

            this.arPaymentAccount.value =
                "";

        }


        if (
            this.arPaymentAmount
        ) {

            this.arPaymentAmount.value =
                this.formatCurrency(
                    Number(
                        header.outstanding_amount
                        || 0
                    )
                );

        }


        if (
            this.arPaymentReferenceNo
        ) {

            this.arPaymentReferenceNo.value =
                "";

        }


        if (
            this.arPaymentDescription
        ) {

            this.arPaymentDescription.value =
                `Payment AR ${header.invoice_no || ""}`;

        }


        bootstrap.Modal
            .getOrCreateInstance(
                this.accountReceivablePaymentModal
            )
            .show();

    }

    catch (error) {

        console.error(
            "AccountReceivable.receivePayment:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to open AR payment."
        );

    }

}
/*
======================================================
GENERATE AR PAYMENT JOURNAL
======================================================
*/

async generateARPaymentJournal(
    invoice,
    payment
) {

    try {

        const receivableAccountId =
            155;


        const paymentAccountId =
            Number(
                payment.payment_account_id
                || 0
            );


        const amount =
            Number(
                payment.amount
                || 0
            );


        if (!paymentAccountId) {

            throw new Error(
                "Bank / Cash Account is required."
            );

        }


        if (
            amount <= 0
        ) {

            throw new Error(
                "Payment Amount must be greater than 0."
            );

        }


        /*
        ==================================================
        JOURNAL DETAIL

        DR BANK / CASH
        CR PIUTANG USAHA
        ==================================================
        */

        const journalDetails = [

            {

                debit_account_id:
                    paymentAccountId,

                credit_account_id:
                    receivableAccountId,

                business_partner_id:
                    invoice.customer_id
                        ? Number(
                            invoice.customer_id
                        )
                        : null,

                description:
                    payment.description
                    ||
                    `Payment AR ${invoice.invoice_no || ""}`,

                amount:
                    amount

            }

        ];


        const journalHeader = {

            journal_no:
                "",

            journal_date:
                payment.payment_date,

            posting_period:
                payment.payment_date
                    ? payment.payment_date.substring(
                        0,
                        7
                    )
                    : "",

            description:
                payment.description
                ||
                `Payment AR ${invoice.invoice_no || ""}`,

            source_module:
                "AR",

            source_document_type:
                "AR_PAYMENT",

            source_document_id:
                invoice.id,

            source_invoice_no:
                invoice.invoice_no
                || null,

            source_po_no:
                invoice.po_no
                || null,

            status:
                "Draft"

        };


        const journal =
            await this.journalService.create(
                journalHeader,
                journalDetails
            );


        if (!journal) {

            throw new Error(
                "Failed to create AR Payment Journal."
            );

        }


        return journal;

    }

    catch (error) {

        console.error(
            "AccountReceivable.generateARPaymentJournal:",
            error
        );


        throw error;

    }

}
/*
======================================================
SAVE AR PAYMENT
======================================================
*/

async savePayment() {

    try {

        const id =
            this.currentPaymentARId
            ||
            this.arPaymentARId?.value;


        if (!id) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        const paymentDate =
            this.arPaymentDate?.value
            || "";


        const paymentAccountId =
            Number(
                this.arPaymentAccount?.value
                || 0
            );


        const paymentAmount =
            this.parseNumber(
                this.arPaymentAmount?.value
            );


        const referenceNo =
            this.arPaymentReferenceNo
                ?.value
                ?.trim()
            || null;


        const description =
            this.arPaymentDescription
                ?.value
                ?.trim()
            || null;


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!paymentDate) {

            throw new Error(
                "Payment Date is required."
            );

        }


        if (!paymentAccountId) {

            throw new Error(
                "Bank / Cash Account is required."
            );

        }


        if (
            paymentAmount <= 0
        ) {

            throw new Error(
                "Payment Amount must be greater than 0."
            );

        }


        /*
        ==================================================
        LOAD AR
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        const invoice =
            result?.header;


        if (!invoice) {

            throw new Error(
                "Account Receivable not found."
            );

        }


        const currentPaid =
            Number(
                invoice.paid_amount
                || 0
            );


        const outstanding =
            Number(
                invoice.outstanding_amount
                || 0
            );


        if (
            paymentAmount
            >
            outstanding
        ) {

            throw new Error(
                "Payment Amount cannot exceed Outstanding Amount."
            );

        }


        /*
        ==================================================
        GENERATE PAYMENT JOURNAL
        ==================================================
        */

        const journal =
            await this.generateARPaymentJournal(
                invoice,
                {

                    payment_date:
                        paymentDate,

                    payment_account_id:
                        paymentAccountId,

                    amount:
                        paymentAmount,

                    reference_no:
                        referenceNo,

                    description:
                        description

                }
            );


        /*
        ==================================================
        INSERT PAYMENT
        ==================================================
        */

        const {
            error: paymentError
        } =
            await supabase

                .from(
                    "trx_account_receivable_payment"
                )

                .insert({

                    account_receivable_id:
                        id,

                    payment_date:
                        paymentDate,

                    payment_account_id:
                        paymentAccountId,

                    amount:
                        paymentAmount,

                    reference_no:
                        referenceNo,

                    description:
                        description,

                    gl_journal_id:
                        journal.id

                });


        if (paymentError) {

            throw paymentError;

        }


        /*
        ==================================================
        UPDATE AR TOTAL PAID
        ==================================================
        */

        const newPaidAmount =
            currentPaid
            +
            paymentAmount;


        await this.service.markPaid(
            id,
            newPaidAmount
        );


        /*
        ==================================================
        CLOSE PAYMENT MODAL
        ==================================================
        */

        bootstrap.Modal
            .getInstance(
                this.accountReceivablePaymentModal
            )
            ?.hide();


        this.currentPaymentARId =
            null;


        /*
        ==================================================
        RELOAD
        ==================================================
        */

        await this.loadData();


        console.log(
            "AR Payment saved:",
            {
                ar_id:
                    id,

                amount:
                    paymentAmount,

                gl_journal_id:
                    journal.id
            }
        );

    }

    catch (error) {

        console.error(
            "AccountReceivable.savePayment:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to save AR Payment."
        );

    }

}

    /*
    ======================================================
    LOAD CUSTOMERS
    ======================================================
    */

    async loadCustomers() {

        try {

            const {
                data,
                error
            } =
                await supabase

                    .from(
                        "mst_business_partner"
                    )

                    .select(`
                        id,
                        bp_code,
                        bp_name,
                        bp_type,
                        top_id,
                        is_active
                    `)

                    .eq(
                        "is_active",
                        true
                    )

                    .order(
                        "bp_name",
                        {
                            ascending:
                                true
                        }
                    );


            if (error) {

                throw error;

            }


            this.customerData =
                (data || [])
                .filter(
                    item => {

                        const type =
                            String(
                                item.bp_type
                                || ""
                            )
                            .trim()
                            .toLowerCase();


                        return (
                            type === "customer"
                            ||
                            type === "both"
                        );

                    }
                );


            if (
                this.arFormCustomer
            ) {

                this.arFormCustomer.innerHTML = `

                    <option value="">
                        Select Customer
                    </option>

                `;


                this.customerData.forEach(
                    customer => {

                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            customer.id;


                        option.textContent =
                            `${
                                customer.bp_code
                                || ""
                            } - ${
                                customer.bp_name
                                || ""
                            }`;


                        this.arFormCustomer
                            .appendChild(
                                option
                            );

                    }
                );

            }

        }

        catch (error) {

            console.error(
                "AccountReceivable.loadCustomers:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    LOAD DETAIL COA
    ======================================================
    */

    async loadDetailCOA() {

        try {

            if (
                !this.arDetailCOA
            ) {

                return;

            }


            const {
                data,
                error
            } =
                await supabase

                    .from(
                        "mst_chart_of_accounts"
                    )

                    .select(`
                        id,
                        account_code,
                        account_name,
                        normal_balance,
                        is_header,
                        allow_transaction,
                        status
                    `)

                    .eq(
                        "status",
                        true
                    )

                    .eq(
                        "is_header",
                        false
                    )

                    .eq(
                        "allow_transaction",
                        true
                    )

                    .order(
                        "account_code",
                        {
                            ascending:
                                true
                        }
                    );


            if (error) {

                throw error;

            }


            this.currentCOA =
                data || [];


            this.arDetailCOA.innerHTML = `

                <option value="">
                    Select Revenue Account
                </option>

            `;


            this.currentCOA.forEach(
                account => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        account.id;


                    option.textContent =
                        `${
                            account.account_code
                        } - ${
                            account.account_name
                        }`;


                    this.arDetailCOA
                        .appendChild(
                            option
                        );

                }
            );


            this.initializeDetailCOASearch();

        }

        catch (error) {

            console.error(
                "AccountReceivable.loadDetailCOA:",
                error
            );


            throw error;

        }

    }


    /*
======================================================
INITIALIZE DETAIL COA SEARCH
SAFE TOM SELECT INITIALIZATION
======================================================
*/

initializeDetailCOASearch() {

    try {

        /*
        ==================================================
        VALIDATE ELEMENT
        ==================================================
        */

        if (
            !this.arDetailCOA
        ) {

            return;

        }


        /*
        ==================================================
        VALIDATE TOM SELECT
        ==================================================
        */

        if (
            typeof TomSelect
            === "undefined"
        ) {

            console.warn(
                "TomSelect library is not loaded."
            );

            return;

        }


        /*
        ==================================================
        DESTROY EXISTING INSTANCE FROM CLASS
        ==================================================
        */

        if (
            this.arDetailCOASelect
        ) {

            try {

                this.arDetailCOASelect.destroy();

            }

            catch (error) {

                console.warn(
                    "Failed to destroy previous AR COA TomSelect:",
                    error
                );

            }


            this.arDetailCOASelect =
                null;

        }


        /*
        ==================================================
        DESTROY INSTANCE ATTACHED TO DOM ELEMENT

        IMPORTANT:
        Tom Select stores instance in element.tomselect
        ==================================================
        */

        if (
            this.arDetailCOA.tomselect
        ) {

            try {

                this.arDetailCOA.tomselect.destroy();

            }

            catch (error) {

                console.warn(
                    "Failed to destroy existing TomSelect from DOM:",
                    error
                );

            }

        }


        /*
        ==================================================
        RE-CHECK ELEMENT
        ==================================================
        */

        this.arDetailCOA =
            document.getElementById(
                "ar-detail-coa"
            );


        if (
            !this.arDetailCOA
        ) {

            return;

        }


        /*
        ==================================================
        INITIALIZE
        ==================================================
        */

        this.arDetailCOASelect =
            new TomSelect(
                this.arDetailCOA,
                {

                    create:
                        false,

                    allowEmptyOption:
                        true,

                    placeholder:
                        "Select Credit Account",

                    searchField: [
                        "text"
                    ],

                    maxOptions:
                        100,

                    closeAfterSelect:
                        true,

                    hideSelected:
                        false,

                    persist:
                        false

                }
            );


        console.log(
            "AR Detail COA TomSelect initialized."
        );

    }

    catch (error) {

        console.error(
            "AccountReceivable.initializeDetailCOASearch:",
            error
        );


        throw error;

    }

}
/*
======================================================
HANDLE CUSTOMER CHANGE
======================================================
*/

async handleCustomerChange() {

    try {

        const customerId =
            this.arFormCustomer?.value;


        /*
        ==================================================
        EMPTY CUSTOMER
        ==================================================
        */

        if (!customerId) {

            if (
                this.arFormTop
            ) {

                this.arFormTop.value =
                    "";

            }


            if (
                this.arFormDueDate
            ) {

                this.arFormDueDate.value =
                    "";

            }


            return;

        }


        /*
        ==================================================
        GET CUSTOMER
        ==================================================
        */

        const customer =
            await this.service.getCustomerById(
                customerId
            );


        if (!customer) {

            throw new Error(
                "Customer not found."
            );

        }


        /*
        ==================================================
        TERM OF PAYMENT
        ==================================================
        */

        const top =
            customer.mst_term_of_payment;


        if (
            this.arFormTop
        ) {

            if (top) {

                this.arFormTop.value =
                    `${
                        top.top_code
                        || ""
                    } - ${
                        top.top_name
                        || ""
                    }`;

            }

            else {

                this.arFormTop.value =
                    "";

            }

        }


        /*
        ==================================================
        CALCULATE DUE DATE
        ==================================================
        */

        this.calculateARDueDate();

    }

    catch (error) {

        console.error(
            "AccountReceivable.handleCustomerChange:",
            error
        );


        if (
            this.arFormTop
        ) {

            this.arFormTop.value =
                "";

        }


        if (
            this.arFormDueDate
        ) {

            this.arFormDueDate.value =
                "";

        }

    }

}

/*
======================================================
CALCULATE AR DUE DATE
======================================================
*/

async calculateARDueDate() {

    try {

        const customerId =
            this.arFormCustomer?.value;


        const dateReceived =
            this.arFormDateReceived?.value;


        /*
        ==================================================
        VALIDATE
        ==================================================
        */

        if (
            !customerId
            ||
            !dateReceived
        ) {

            if (
                this.arFormDueDate
            ) {

                this.arFormDueDate.value =
                    "";

            }


            return;

        }


        /*
        ==================================================
        GET CUSTOMER + TOP
        ==================================================
        */

        const customer =
            await this.service.getCustomerById(
                customerId
            );


        if (!customer) {

            throw new Error(
                "Customer not found."
            );

        }


        /*
        ==================================================
        CALCULATE FROM SERVICE
        ==================================================
        */

        const dueDate =
            this.service.calculateDueDate(
                dateReceived,
                customer
            );


        /*
        ==================================================
        SET DUE DATE
        ==================================================
        */

        if (
            this.arFormDueDate
        ) {

            this.arFormDueDate.value =
                dueDate
                || "";

        }


        /*
        ==================================================
        TOP DISPLAY
        ==================================================
        */

        const top =
            customer.mst_term_of_payment;


        if (
            this.arFormTop
        ) {

            this.arFormTop.value =
                top
                    ? `${
                        top.top_code
                        || ""
                    } - ${
                        top.top_name
                        || ""
                    }`
                    : "";

        }


        console.log(
            "AR DUE DATE:",
            {
                customer_id:
                    customerId,

                date_received:
                    dateReceived,

                top_days:
                    Number(
                        top?.days
                        || 0
                    ),

                due_date:
                    dueDate
            }
        );

    }

    catch (error) {

        console.error(
            "AccountReceivable.calculateARDueDate:",
            error
        );


        if (
            this.arFormDueDate
        ) {

            this.arFormDueDate.value =
                "";

        }

    }

}

    /*
    ======================================================
    LOAD TAX MASTER
    ======================================================
    */

    async loadTaxMaster() {

        try {

            const taxes =
                await this.taxService.getAll();


            this.taxPlusData =
                (taxes || [])
                .filter(
                    tax =>
                        String(
                            tax.tax_type
                            || ""
                        )
                        .trim()
                        .toUpperCase()
                        === "PLUS"
                        &&
                        Boolean(
                            tax.status
                        )
                );


            this.taxMinusData =
                (taxes || [])
                .filter(
                    tax =>
                        String(
                            tax.tax_type
                            || ""
                        )
                        .trim()
                        .toUpperCase()
                        === "MINUS"
                        &&
                        Boolean(
                            tax.status
                        )
                );


            this.renderTaxMasterOptions();

        }

        catch (error) {

            console.error(
                "AccountReceivable.loadTaxMaster:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    RENDER TAX MASTER
    ======================================================
    */

    renderTaxMasterOptions() {

        /*
        ==================================================
        TAX (+)
        ==================================================
        */

        if (
            this.arDetailTaxOutputRate
        ) {

            this.arDetailTaxOutputRate.innerHTML = `

                <option value="">
                    No Tax
                </option>

            `;


            this.taxPlusData.forEach(
                tax => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        tax.id;


                    option.dataset.rate =
                        Number(
                            tax.tax_rate
                            || 0
                        );


                    option.dataset.taxName =
                        tax.tax_name
                        || "";


                    option.dataset.accountId =
                        tax.tax_account_id
                        || "";


                    option.dataset.offsetAccountId =
                        tax.offset_account_id
                        || "";


                    option.textContent =
                        tax.tax_name
                        || "Tax (+)";


                    this.arDetailTaxOutputRate
                        .appendChild(
                            option
                        );

                }
            );

        }


        /*
        ==================================================
        TAX (-)
        ==================================================
        */

        if (
            this.arDetailWithholdingTaxRate
        ) {

            this.arDetailWithholdingTaxRate.innerHTML = `

                <option value="">
                    No Tax
                </option>

            `;


            this.taxMinusData.forEach(
                tax => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        tax.id;


                    option.dataset.rate =
                        Number(
                            tax.tax_rate
                            || 0
                        );


                    option.dataset.taxName =
                        tax.tax_name
                        || "";


                    option.dataset.accountId =
                        tax.tax_account_id
                        || "";


                    option.dataset.offsetAccountId =
                        tax.offset_account_id
                        || "";


                    option.textContent =
                        tax.tax_name
                        || "Tax (-)";


                    this.arDetailWithholdingTaxRate
                        .appendChild(
                            option
                        );

                }
            );

        }

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
                Array.isArray(
                    data
                )
                    ? data
                    : [];


            this.filteredData =
                [...this.data];


            this.currentPage =
                1;


            this.renderTable();

        }

        catch (error) {

            console.error(
                "AccountReceivable.loadData:",
                error
            );


            this.showError(
                "Failed to load Account Receivable."
            );

        }

    }


    /*
    ======================================================
    SEARCH
    ======================================================
    */

    search() {

        const dateFrom =
            this.dateFrom?.value
            || "";


        const dateTo =
            this.dateTo?.value
            || "";


        const status =
            String(
                this.statusFilter?.value
                || ""
            )
            .trim()
            .toLowerCase();


        const findBy =
            this.findBy?.value
            || "invoice_no";


        const keyword =
            String(
                this.keyword?.value
                || ""
            )
            .trim()
            .toLowerCase();


        this.filteredData =
            this.data.filter(
                item => {

                    /*
                    ======================================
                    DATE FROM
                    ======================================
                    */

                    if (
                        dateFrom
                        &&
                        item.invoice_date
                        &&
                        item.invoice_date < dateFrom
                    ) {

                        return false;

                    }


                    /*
                    ======================================
                    DATE TO
                    ======================================
                    */

                    if (
                        dateTo
                        &&
                        item.invoice_date
                        &&
                        item.invoice_date > dateTo
                    ) {

                        return false;

                    }


                    /*
                    ======================================
                    STATUS
                    ======================================
                    */

                    if (
                        status
                        &&
                        String(
                            item.status
                            || ""
                        )
                        .trim()
                        .toLowerCase()
                        !== status
                    ) {

                        return false;

                    }


                    /*
                    ======================================
                    KEYWORD
                    ======================================
                    */

                    if (
                        keyword
                    ) {

                        let value =
                            "";


                        switch (findBy) {

                            case "customer":

                                value =
                                    item
                                        .mst_business_partner
                                        ?.bp_name
                                    || "";

                                break;


                            case "po_no":

                                value =
                                    item.po_no
                                    || "";

                                break;


                            case "description":

                                value =
                                    item.description
                                    || "";

                                break;


                            case "invoice_no":

                            default:

                                value =
                                    item.invoice_no
                                    || "";

                                break;

                        }


                        if (
                            !String(value)
                                .toLowerCase()
                                .includes(
                                    keyword
                                )
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );


        this.currentPage =
            1;


        this.renderTable();

    }


    /*
    ======================================================
    TOTAL PAGES
    ======================================================
    */

    getTotalPages() {

        const total =
            this.filteredData.length;


        return Math.max(
            1,
            Math.ceil(
                total
                /
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


        let nextPage =
            Number(
                page
                || 1
            );


        if (
            Number.isNaN(
                nextPage
            )
        ) {

            nextPage =
                1;

        }


        nextPage =
            Math.max(
                1,
                Math.min(
                    nextPage,
                    totalPages
                )
            );


        this.currentPage =
            nextPage;


        this.renderTable();

    }


    /*
    ======================================================
    RENDER TABLE
    ======================================================
    */

    renderTable() {

        if (
            !this.tableBody
        ) {

            return;

        }


        const totalRecords =
            this.filteredData.length;


        const totalPages =
            this.getTotalPages();


        if (
            this.currentPage
            >
            totalPages
        ) {

            this.currentPage =
                totalPages;

        }


        const start =
            (
                this.currentPage
                -
                1
            )
            *
            this.pageSize;


        const end =
            start
            +
            this.pageSize;


        const pageData =
            this.filteredData.slice(
                start,
                end
            );


        /*
        ==================================================
        EMPTY
        ==================================================
        */

        if (
            !pageData.length
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="11"
                        class="text-center text-muted py-4">

                        No Account Receivable data.

                    </td>

                </tr>

            `;

        }
        else {

            this.tableBody.innerHTML =
                pageData
                    .map(
                        (
                            item,
                            index
                        ) =>
                            this.createTableRow(
                                item,
                                start
                                +
                                index
                                +
                                1
                            )
                    )
                    .join("");

        }


        /*
        ==================================================
        PAGINATION INFO
        ==================================================
        */

        if (
            this.currentPageInput
        ) {

            this.currentPageInput.value =
                this.currentPage;

        }


        if (
            this.totalPagesElement
        ) {

            this.totalPagesElement.textContent =
                totalPages;

        }


        if (
            this.recordInfo
        ) {

            this.recordInfo.textContent =
                totalRecords;

        }


        if (
            this.btnFirstPage
        ) {

            this.btnFirstPage.disabled =
                this.currentPage <= 1;

        }


        if (
            this.btnPrevPage
        ) {

            this.btnPrevPage.disabled =
                this.currentPage <= 1;

        }


        if (
            this.btnNextPage
        ) {

            this.btnNextPage.disabled =
                this.currentPage
                >= totalPages;

        }


        if (
            this.btnLastPage
        ) {

            this.btnLastPage.disabled =
                this.currentPage
                >= totalPages;

        }

    }


    /*
    ======================================================
    CREATE TABLE ROW
    ======================================================
    */

    createTableRow(
        item,
        rowNumber
    ) {

        const customerName =
            item
                .mst_business_partner
                ?.bp_name
            || "-";


        return `

            <tr>

                <td class="text-center">

                    ${rowNumber}

                </td>


                <td>

                    ${
                        item.invoice_date
                        || "-"
                    }

                </td>


                <td>

                    ${
                        item.invoice_no
                        || "-"
                    }

                </td>


                <td>

                    ${customerName}

                </td>


                <td>

                    ${
                        item.po_no
                        || "-"
                    }

                </td>


                <td>

                    ${
                        item.due_date
                        || "-"
                    }

                </td>


                <td class="text-end">

                    ${this.formatCurrency(
                        Number(
                            item.total_amount
                            || 0
                        )
                    )}

                </td>


                <td class="text-end">

                    ${this.formatCurrency(
                        Number(
                            item.paid_amount
                            || 0
                        )
                    )}

                </td>


                <td class="text-end">

                    ${this.formatCurrency(
                        Number(
                            item.outstanding_amount
                            || 0
                        )
                    )}

                </td>


                <td class="text-center">

                    ${this.renderStatusBadge(
                        item.status
                    )}

                </td>


                <td class="text-center">

                    ${this.renderActionButtons(
                        item
                    )}

                </td>

            </tr>

        `;

    }


    /*
    ======================================================
    STATUS BADGE
    ======================================================
    */

    renderStatusBadge(status) {

        const value =
            String(
                status
                || ""
            )
            .trim()
            .toLowerCase();


        if (
            value === "draft"
        ) {

            return `

                <span class="badge bg-secondary">
                    Draft
                </span>

            `;

        }


        if (
            value === "unpaid"
        ) {

            return `

                <span class="badge bg-warning text-dark">
                    Unpaid
                </span>

            `;

        }


        if (
            value === "paid"
        ) {

            return `

                <span class="badge bg-success">
                    Paid
                </span>

            `;

        }


        if (
            value === "void"
        ) {

            return `

                <span class="badge bg-danger">
                    Void
                </span>

            `;

        }


        return `

            <span class="badge bg-light text-dark">
                ${status || "-"}
            </span>

        `;

    }


    /*
======================================================
RENDER ACTION BUTTONS
======================================================
*/

renderActionButtons(item) {

    const id =
        item.id;


    const status =
        String(
            item.status
            || ""
        )
        .trim()
        .toLowerCase();


    /*
    ==================================================
    DRAFT
    ==================================================
    */

    if (
        status === "draft"
    ) {

        return `

            <div class="btn-group btn-group-sm">


                <button
                    type="button"
                    class="btn btn-outline-primary"
                    data-action="edit"
                    data-id="${id}"
                    title="Edit">

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    class="btn btn-outline-danger"
                    data-action="delete"
                    data-id="${id}"
                    title="Delete">

                    <i class="fa-solid fa-trash"></i>

                </button>


                <button
                    type="button"
                    class="btn btn-outline-success"
                    data-action="complete"
                    data-id="${id}"
                    title="Complete">

                    <i class="fa-solid fa-check"></i>

                </button>
                <button
    type="button"
    class="btn btn-outline-info"
    data-action="payment-history"
    data-id="${id}"
    title="Payment History">

    <i class="fa-solid fa-clock-rotate-left"></i>

</button>


            </div>

        `;

    }


    /*
    ==================================================
    UNPAID
    ==================================================
    */

    if (
        status === "unpaid"
    ) {

        return `

            <div class="btn-group btn-group-sm">


                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    data-action="view"
                    data-id="${id}"
                    title="View">

                    <i class="fa-regular fa-eye"></i>

                </button>


                <button
                    type="button"
                    class="btn btn-outline-dark"
                    data-action="print"
                    data-id="${id}"
                    title="Print Invoice">

                    <i class="fa-solid fa-print"></i>

                </button>


                <button
                    type="button"
                    class="btn btn-outline-success"
                    data-action="payment"
                    data-id="${id}"
                    title="Receive Payment">

                    <i class="fa-solid fa-money-bill-wave"></i>

                </button>


                <button
                    type="button"
                    class="btn btn-outline-danger"
                    data-action="void"
                    data-id="${id}"
                    title="Void">

                    <i class="fa-solid fa-ban"></i>

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
        status === "paid"
    ) {

        return `

            <div class="btn-group btn-group-sm">


                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    data-action="view"
                    data-id="${id}"
                    title="View">

                    <i class="fa-regular fa-eye"></i>

                </button>


                <button
                    type="button"
                    class="btn btn-outline-dark"
                    data-action="print"
                    data-id="${id}"
                    title="Print Invoice">

                    <i class="fa-solid fa-print"></i>

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
        status === "void"
    ) {

        return `

            <div class="btn-group btn-group-sm">


                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    data-action="view"
                    data-id="${id}"
                    title="View">

                    <i class="fa-regular fa-eye"></i>

                </button>


                <button
                    type="button"
                    class="btn btn-outline-dark"
                    data-action="print"
                    data-id="${id}"
                    title="Print Invoice">

                    <i class="fa-solid fa-print"></i>

                </button>


            </div>

        `;

    }


    /*
    ==================================================
    FALLBACK
    ==================================================
    */

    return `

        <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            data-action="view"
            data-id="${id}"
            title="View">

            <i class="fa-regular fa-eye"></i>

        </button>

    `;

}
    /*
    ======================================================
    ADD AR
    ======================================================
    */

    async addInvoice() {

        try {

            this.currentInvoiceId =
                null;

            this.currentDetailId =
                null;

            this.currentMode =
                "add";

            this.invoiceDetails =
                [];


            this.resetForm();


            await this.loadDetailCOA();

            await this.loadTaxMaster();


            if (
                this.arFormStatus
            ) {

                this.arFormStatus.value =
                    "Draft";

            }


            this.renderInvoiceDetails();

            this.renderTaxPlus();

            this.renderTaxMinus();

            this.updateInvoiceSummary();


            const modal =
                bootstrap.Modal
                    .getOrCreateInstance(
                        this.accountReceivableModal
                    );


            modal.show();

        }

        catch (error) {

            console.error(
                "AccountReceivable.addInvoice:",
                error
            );


            this.showError(
                "Failed to open Account Receivable."
            );

        }

    }


    /*
    ======================================================
    RESET FORM
    ======================================================
    */

    resetForm() {

        if (
            this.arFormId
        ) {

            this.arFormId.value =
                "";

        }


        if (
            this.arFormCustomer
        ) {

            this.arFormCustomer.value =
                "";

        }


        if (
            this.arFormTop
        ) {

            this.arFormTop.value =
                "";

        }


        if (
            this.arFormInvoiceNo
        ) {

            this.arFormInvoiceNo.value =
                "";

        }


        if (
            this.arFormPoNo
        ) {

            this.arFormPoNo.value =
                "";

        }


        if (
            this.arFormInvoiceDate
        ) {

            this.arFormInvoiceDate.value =
                "";

        }


        if (
            this.arFormDateReceived
        ) {

            this.arFormDateReceived.value =
                "";

        }


        if (
            this.arFormDueDate
        ) {

            this.arFormDueDate.value =
                "";

        }


        if (
            this.arFormJournalNo
        ) {

            this.arFormJournalNo.value =
                "";

        }


        if (
            this.arFormStatus
        ) {

            this.arFormStatus.value =
                "Draft";

        }


        if (
            this.arFormDescription
        ) {

            this.arFormDescription.value =
                "";

        }


        this.invoiceDetails =
            [];


        this.currentDetailId =
            null;


        this.updateInvoiceSummary();

    }


    /*
    ======================================================
    ADD INVOICE DETAIL
    ======================================================
    */

    addInvoiceDetail() {

        this.currentDetailId =
            null;


        this.resetInvoiceDetailForm();


        const title =
            document.getElementById(
                "account-receivable-detail-modal-title"
            );


        if (
            title
        ) {

            title.textContent =
                "Add AR Detail";

        }


        const modal =
            bootstrap.Modal
                .getOrCreateInstance(
                    this.accountReceivableDetailModal
                );


        modal.show();

    }


    /*
    ======================================================
    RESET DETAIL FORM
    ======================================================
    */

    resetInvoiceDetailForm() {

        const detailId =
            document.getElementById(
                "ar-detail-id"
            );


        const description =
            document.getElementById(
                "ar-detail-description"
            );


        if (
            detailId
        ) {

            detailId.value =
                "";

        }


        if (
            this.arDetailCOASelect
        ) {

            this.arDetailCOASelect.clear(
                true
            );

        }
        else if (
            this.arDetailCOA
        ) {

            this.arDetailCOA.value =
                "";

        }


        if (
            description
        ) {

            description.value =
                "";

        }


        if (
            this.arDetailQuantity
        ) {

            this.arDetailQuantity.value =
                1;

        }


        if (
            this.arDetailUnitPrice
        ) {

            this.arDetailUnitPrice.value =
                "0";

        }


        if (
            this.arDetailTaxOutputRate
        ) {

            this.arDetailTaxOutputRate.value =
                "";

        }


        if (
            this.arDetailWithholdingTaxRate
        ) {

            this.arDetailWithholdingTaxRate.value =
                "";

        }


        if (
            this.arDetailLineAmount
        ) {

            this.arDetailLineAmount.value =
                "0";

        }


        if (
            this.arDetailTaxOutputAmount
        ) {

            this.arDetailTaxOutputAmount.value =
                "0";

        }


        if (
            this.arDetailWithholdingTaxAmount
        ) {

            this.arDetailWithholdingTaxAmount.value =
                "0";

        }


        if (
            this.arDetailTotalAmount
        ) {

            this.arDetailTotalAmount.value =
                "0";

        }

    }


    /*
    ======================================================
    CALCULATE DETAIL
    ======================================================
    */

    calculateDetail() {

        const quantity =
            Number(
                this.arDetailQuantity?.value
                || 0
            );


        const unitPrice =
            this.parseNumber(
                this.arDetailUnitPrice?.value
            );


        const taxPlusOption =
            this.arDetailTaxOutputRate
                ?.selectedOptions?.[0];


        const taxMinusOption =
            this.arDetailWithholdingTaxRate
                ?.selectedOptions?.[0];


        const taxOutputRate =
            Number(
                taxPlusOption
                    ?.dataset
                    ?.rate
                || 0
            );


        const withholdingTaxRate =
            Number(
                taxMinusOption
                    ?.dataset
                    ?.rate
                || 0
            );


        const calculated =
            this.service
                .calculateDetailAmount({

                    quantity,

                    unit_price:
                        unitPrice,

                    tax_output_rate:
                        taxOutputRate,

                    withholding_tax_rate:
                        withholdingTaxRate

                });


        if (
            this.arDetailLineAmount
        ) {

            this.arDetailLineAmount.value =
                this.formatCurrency(
                    calculated.line_amount
                );

        }


        if (
            this.arDetailTaxOutputAmount
        ) {

            this.arDetailTaxOutputAmount.value =
                this.formatCurrency(
                    calculated.tax_output_amount
                );

        }


        if (
            this.arDetailWithholdingTaxAmount
        ) {

            this.arDetailWithholdingTaxAmount.value =
                this.formatCurrency(
                    calculated.withholding_tax_amount
                );

        }


        if (
            this.arDetailTotalAmount
        ) {

            this.arDetailTotalAmount.value =
                this.formatCurrency(
                    calculated.total_amount
                );

        }

    }


    /*
    ======================================================
    FORMAT UNIT PRICE
    ======================================================
    */

    formatUnitPrice() {

        if (
            !this.arDetailUnitPrice
        ) {

            return;

        }


        const value =
            this.parseNumber(
                this.arDetailUnitPrice.value
            );


        this.arDetailUnitPrice.value =
            Number(
                value
                || 0
            )
            .toLocaleString(
                "id-ID"
            );

    }


    /*
    ======================================================
    SAVE DETAIL
    ======================================================
    */

    saveInvoiceDetail() {

        try {

            const coaId =
                this.arDetailCOA?.value
                || "";


            const description =
                document
                    .getElementById(
                        "ar-detail-description"
                    )
                    ?.value
                    ?.trim()
                || "";


            const quantity =
                Number(
                    this.arDetailQuantity?.value
                    || 0
                );


            const unitPrice =
                this.parseNumber(
                    this.arDetailUnitPrice?.value
                );


            /*
            ==============================================
            TAX (+)
            ==============================================
            */

            const taxPlusId =
                this.arDetailTaxOutputRate?.value
                || null;


            const taxPlusOption =
                this.arDetailTaxOutputRate
                    ?.selectedOptions?.[0];


            const taxOutputRate =
                Number(
                    taxPlusOption
                        ?.dataset
                        ?.rate
                    || 0
                );


            /*
            ==============================================
            TAX (-)
            ==============================================
            */

            const taxMinusId =
                this.arDetailWithholdingTaxRate?.value
                || null;


            const taxMinusOption =
                this.arDetailWithholdingTaxRate
                    ?.selectedOptions?.[0];


            const withholdingTaxRate =
                Number(
                    taxMinusOption
                        ?.dataset
                        ?.rate
                    || 0
                );


            /*
            ==============================================
            VALIDATION
            ==============================================
            */

            if (!coaId) {

                this.showError(
                    "Revenue Account is required."
                );

                return;

            }


            if (
                quantity <= 0
            ) {

                this.showError(
                    "Quantity must be greater than 0."
                );

                return;

            }


            if (
                unitPrice < 0
            ) {

                this.showError(
                    "Unit Price cannot be negative."
                );

                return;

            }


            /*
            ==============================================
            COA
            ==============================================
            */

            const coa =
                this.currentCOA.find(
                    account =>
                        String(
                            account.id
                        )
                        ===
                        String(
                            coaId
                        )
                )
                || null;


            /*
            ==============================================
            CALCULATE
            ==============================================
            */

            const calculated =
                this.service
                    .calculateDetailAmount({

                        quantity,

                        unit_price:
                            unitPrice,

                        tax_output_rate:
                            taxOutputRate,

                        withholding_tax_rate:
                            withholdingTaxRate

                    });


            /*
            ==============================================
            DETAIL OBJECT
            ==============================================
            */

            const detail = {

                id:
                    this.currentDetailId
                    ||
                    crypto.randomUUID(),

                revenue_account_id:
                    Number(
                        coaId
                    ),

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

                line_amount:
                    calculated.line_amount,


                /*
                ==========================================
                TAX (+)
                ==========================================
                */

                tax_plus_id:
                    taxPlusId
                        ? Number(
                            taxPlusId
                        )
                        : null,

                tax_plus_name:
                    taxPlusOption
                        ?.dataset
                        ?.taxName
                    || "",

                tax_plus_account_id:
                    taxPlusOption
                        ?.dataset
                        ?.accountId

                        ? Number(
                            taxPlusOption
                                .dataset
                                .accountId
                        )

                        : null,

                tax_output_rate:
                    taxOutputRate,

                tax_output_amount:
                    calculated
                        .tax_output_amount,


                /*
                ==========================================
                TAX (-)
                ==========================================
                */

                tax_minus_id:
                    taxMinusId
                        ? Number(
                            taxMinusId
                        )
                        : null,

                tax_minus_name:
                    taxMinusOption
                        ?.dataset
                        ?.taxName
                    || "",

                tax_minus_account_id:
                    taxMinusOption
                        ?.dataset
                        ?.accountId

                        ? Number(
                            taxMinusOption
                                .dataset
                                .accountId
                        )

                        : null,

                withholding_tax_rate:
                    withholdingTaxRate,

                withholding_tax_amount:
                    calculated
                        .withholding_tax_amount,


                /*
                ==========================================
                TOTAL
                ==========================================
                */

                total_amount:
                    calculated.total_amount

            };


            /*
            ==============================================
            UPDATE
            ==============================================
            */

            if (
                this.currentDetailId
            ) {

                const index =
                    this.invoiceDetails
                        .findIndex(
                            item =>
                                String(
                                    item.id
                                )
                                ===
                                String(
                                    this.currentDetailId
                                )
                        );


                if (
                    index === -1
                ) {

                    throw new Error(
                        "Invoice detail not found."
                    );

                }


                this.invoiceDetails[index] =
                    detail;

            }

            else {

                this.invoiceDetails.push(
                    detail
                );

            }


            /*
            ==============================================
            RENDER
            ==============================================
            */

            this.renderInvoiceDetails();

            this.renderTaxPlus();

            this.renderTaxMinus();

            this.updateInvoiceSummary();


            /*
            ==============================================
            CLOSE DETAIL MODAL
            ==============================================
            */

            bootstrap.Modal
                .getInstance(
                    this.accountReceivableDetailModal
                )
                ?.hide();


            this.resetInvoiceDetailForm();


            this.currentDetailId =
                null;

        }

        catch (error) {

            console.error(
                "AccountReceivable.saveInvoiceDetail:",
                error
            );


            this.showError(
                error.message
                ||
                "Failed to save AR detail."
            );

        }

    }


    /*
    ======================================================
    RENDER INVOICE DETAILS
    ======================================================
    */

    renderInvoiceDetails() {

        const body =
            document.getElementById(
                "ar-detail-body"
            );


        if (!body) {

            return;

        }


        if (
            !this.invoiceDetails.length
        ) {

            body.innerHTML = `

                <tr>

                    <td
                        colspan="10"
                        class="text-center text-muted py-4">

                        No invoice detail.

                    </td>

                </tr>

            `;


            return;

        }


        body.innerHTML =
            this.invoiceDetails
                .map(
                    (
                        detail,
                        index
                    ) => `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>


                            <td>

                                ${
                                    detail.account_code
                                    || ""
                                }

                                -

                                ${
                                    detail.account_name
                                    || ""
                                }

                            </td>


                            <td>

                                ${
                                    detail.description
                                    || "-"
                                }

                            </td>


                            <td class="text-end">

                                ${detail.quantity}

                            </td>


                            <td class="text-end">

                                ${this.formatCurrency(
                                    detail.unit_price
                                )}

                            </td>


                            <td class="text-end">

                                ${this.formatCurrency(
                                    detail.line_amount
                                )}

                            </td>


                            <td class="text-center">

                                ${
                                    detail.tax_plus_name
                                    || "No Tax"
                                }

                            </td>


                            <td class="text-center">

                                ${
                                    detail.tax_minus_name
                                    || "No Tax"
                                }

                            </td>


                            <td class="text-end">

                                ${this.formatCurrency(
                                    detail.total_amount
                                )}

                            </td>


                            <td class="text-center">

                                <div class="btn-group btn-group-sm">


                                    <button
                                        type="button"
                                        class="btn btn-outline-primary"
                                        data-detail-action="edit"
                                        data-detail-id="${detail.id}"
                                        title="Edit">

                                        <i class="fa-solid fa-pen"></i>

                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-outline-danger"
                                        data-detail-action="delete"
                                        data-detail-id="${detail.id}"
                                        title="Delete">

                                        <i class="fa-solid fa-trash"></i>

                                    </button>


                                </div>

                            </td>

                        </tr>

                    `
                )
                .join("");

    }


    /*
    ======================================================
    EDIT DETAIL
    ======================================================
    */

    async editInvoiceDetail(id) {

        const detail =
            this.invoiceDetails.find(
                item =>
                    String(
                        item.id
                    )
                    ===
                    String(
                        id
                    )
            );


        if (!detail) {

            return;

        }


        this.currentDetailId =
            id;


        await this.loadDetailCOA();

        await this.loadTaxMaster();


        const description =
            document.getElementById(
                "ar-detail-description"
            );


        if (
            this.arDetailCOASelect
        ) {

            this.arDetailCOASelect.setValue(
                String(
                    detail.revenue_account_id
                    || ""
                ),
                true
            );

        }


        if (
            description
        ) {

            description.value =
                detail.description
                || "";

        }


        this.arDetailQuantity.value =
            detail.quantity
            || 1;


        this.arDetailUnitPrice.value =
            Number(
                detail.unit_price
                || 0
            )
            .toLocaleString(
                "id-ID"
            );


        this.arDetailTaxOutputRate.value =
            detail.tax_plus_id
                ? String(
                    detail.tax_plus_id
                )
                : "";


        this.arDetailWithholdingTaxRate.value =
            detail.tax_minus_id
                ? String(
                    detail.tax_minus_id
                )
                : "";


        this.calculateDetail();


        const title =
            document.getElementById(
                "account-receivable-detail-modal-title"
            );


        if (
            title
        ) {

            title.textContent =
                "Edit AR Detail";

        }


        bootstrap.Modal
            .getOrCreateInstance(
                this.accountReceivableDetailModal
            )
            .show();

    }


    /*
    ======================================================
    DELETE DETAIL
    ======================================================
    */

    deleteInvoiceDetail(id) {

        this.invoiceDetails =
            this.invoiceDetails.filter(
                item =>
                    String(
                        item.id
                    )
                    !==
                    String(
                        id
                    )
            );


        this.renderInvoiceDetails();

        this.renderTaxPlus();

        this.renderTaxMinus();

        this.updateInvoiceSummary();

    }


    /*
    ======================================================
    RENDER TAX (+)
    ======================================================
    */

    renderTaxPlus() {

        const body =
            document.getElementById(
                "ar-tax-plus-body"
            );


        if (!body) {

            return;

        }


        const details =
            this.invoiceDetails.filter(
                item =>
                    Number(
                        item.tax_output_amount
                        || 0
                    )
                    >
                    0
            );


        if (
            !details.length
        ) {

            body.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center text-muted py-4">

                        No Tax (+) found from Invoice Details.

                    </td>

                </tr>

            `;


            return;

        }


        body.innerHTML =
            details
                .map(
                    (
                        detail,
                        index
                    ) => `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>


                            <td>
                                Tax (+)
                            </td>


                            <td>
                                ${
                                    detail.tax_plus_name
                                    || "-"
                                }
                            </td>


                            <td>

                                ${
                                    detail.tax_plus_account_id
                                    || "-"
                                }

                            </td>


                            <td class="text-end">

                                ${this.formatCurrency(
                                    detail.line_amount
                                )}

                            </td>


                            <td class="text-end">

                                ${
                                    Number(
                                        detail.tax_output_rate
                                        || 0
                                    )
                                }%

                            </td>


                            <td class="text-end">

                                ${this.formatCurrency(
                                    detail.tax_output_amount
                                )}

                            </td>

                        </tr>

                    `
                )
                .join("");

    }


    /*
    ======================================================
    RENDER TAX (-)
    ======================================================
    */

    renderTaxMinus() {

        const body =
            document.getElementById(
                "ar-tax-minus-body"
            );


        if (!body) {

            return;

        }


        const details =
            this.invoiceDetails.filter(
                item =>
                    Number(
                        item.withholding_tax_amount
                        || 0
                    )
                    >
                    0
            );


        if (
            !details.length
        ) {

            body.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center text-muted py-4">

                        No Tax (-) found from Invoice Details.

                    </td>

                </tr>

            `;


            return;

        }


        body.innerHTML =
            details
                .map(
                    (
                        detail,
                        index
                    ) => `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>


                            <td>
                                Tax (-)
                            </td>


                            <td>

                                ${
                                    detail.tax_minus_name
                                    || "-"
                                }

                            </td>


                            <td>

                                ${
                                    detail.tax_minus_account_id
                                    || "-"
                                }

                            </td>


                            <td class="text-end">

                                ${this.formatCurrency(
                                    detail.line_amount
                                )}

                            </td>


                            <td class="text-end">

                                ${
                                    Number(
                                        detail.withholding_tax_rate
                                        || 0
                                    )
                                }%

                            </td>


                            <td class="text-end">

                                ${this.formatCurrency(
                                    detail.withholding_tax_amount
                                )}

                            </td>

                        </tr>

                    `
                )
                .join("");

    }


    /*
======================================================
UPDATE INVOICE SUMMARY
======================================================
*/

updateInvoiceSummary() {

    try {

        const totals =
            this.service.calculateTotals(
                this.invoiceDetails
                || []
            );


        if (
            this.arFormSubtotal
        ) {

            this.arFormSubtotal.textContent =
                this.formatCurrency(
                    totals.subtotal
                    || 0
                );

        }


        if (
            this.arFormTax
        ) {

            this.arFormTax.textContent =
                this.formatCurrency(
                    totals.tax_output_amount
                    || 0
                );

        }


        if (
            this.arFormWHT
        ) {

            this.arFormWHT.textContent =
                this.formatCurrency(
                    totals.withholding_tax_amount
                    || 0
                );

        }


        if (
            this.arFormTotal
        ) {

            this.arFormTotal.textContent =
                this.formatCurrency(
                    totals.total_amount
                    || 0
                );

        }

    }

    catch (error) {

        console.error(
            "AccountReceivable.updateInvoiceSummary:",
            error
        );

    }

}

    /*
    ======================================================
    SAVE DRAFT
    ======================================================
    */

    async saveDraft() {

        try {

            if (
                !this.arFormCustomer?.value
            ) {

                return this.showError(
                    "Customer is required."
                );

            }


            if (
                !this.arFormInvoiceNo
                    ?.value
                    ?.trim()
            ) {

                return this.showError(
                    "Invoice No is required."
                );

            }


            if (
                !this.arFormInvoiceDate?.value
            ) {

                return this.showError(
                    "Invoice Date is required."
                );

            }


            if (
                !this.arFormDueDate?.value
            ) {

                return this.showError(
                    "Due Date is required."
                );

            }


            if (
                !this.invoiceDetails.length
            ) {

                return this.showError(
                    "Please add at least one invoice detail."
                );

            }


            const header = {

                customer_id:
                    Number(
                        this.arFormCustomer.value
                    ),

                po_no:
                    this.arFormPoNo
                        ?.value
                        ?.trim()
                    || null,

                invoice_no:
                    this.arFormInvoiceNo
                        .value
                        .trim(),

                invoice_date:
                    this.arFormInvoiceDate.value,

                date_received:
                    this.arFormDateReceived?.value
                    || null,

                due_date:
                    this.arFormDueDate.value,

                description:
                    this.arFormDescription
                        ?.value
                        ?.trim()
                    || null

            };


            const details =
                this.invoiceDetails.map(
                    item => ({

                        revenue_account_id:
                            Number(
                                item.revenue_account_id
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

                        line_amount:
                            Number(
                                item.line_amount
                                || 0
                            ),

                        tax_plus_id:
                            item.tax_plus_id
                            || null,

                        tax_plus_account_id:
                            item.tax_plus_account_id
                            || null,

                        tax_output_rate:
                            Number(
                                item.tax_output_rate
                                || 0
                            ),

                        tax_output_amount:
                            Number(
                                item.tax_output_amount
                                || 0
                            ),

                        tax_minus_id:
                            item.tax_minus_id
                            || null,

                        tax_minus_account_id:
                            item.tax_minus_account_id
                            || null,

                        withholding_tax_rate:
                            Number(
                                item.withholding_tax_rate
                                || 0
                            ),

                        withholding_tax_amount:
                            Number(
                                item.withholding_tax_amount
                                || 0
                            ),

                        total_amount:
                            Number(
                                item.total_amount
                                || 0
                            )

                    })
                );


            await this.service.create(
                header,
                details
            );


            bootstrap.Modal
                .getInstance(
                    this.accountReceivableModal
                )
                ?.hide();


            this.resetForm();


            await this.loadData();

        }

        catch (error) {

            console.error(
                "AccountReceivable.saveDraft:",
                error
            );


            this.showError(
                error.message
                ||
                "Failed to save Account Receivable."
            );

        }

    }


    /*
    ======================================================
    EDIT INVOICE
    ======================================================
    */

    async editInvoice(id) {

        try {

            const result =
                await this.service.getById(
                    id
                );


            const header =
                result.header;


            const details =
                result.details
                || [];


            this.currentInvoiceId =
                id;


            this.currentMode =
                "edit";


            this.arFormCustomer.value =
                String(
                    header.customer_id
                    || ""
                );


            this.arFormPoNo.value =
                header.po_no
                || "";


            this.arFormInvoiceNo.value =
                header.invoice_no
                || "";


            this.arFormInvoiceDate.value =
                header.invoice_date
                || "";


            this.arFormDateReceived.value =
                header.date_received
                || "";


            this.arFormDueDate.value =
                header.due_date
                || "";


            this.arFormDescription.value =
                header.description
                || "";


            this.arFormStatus.value =
                header.status
                || "Draft";


            this.arFormJournalNo.value =
                header.gl_journal
                    ?.journal_no
                || "";


            this.invoiceDetails =
                details.map(
                    item => ({

                        id:
                            item.id,

                        revenue_account_id:
                            Number(
                                item.revenue_account_id
                            ),

                        account_code:
                            item.revenue_account
                                ?.account_code
                            || "",

                        account_name:
                            item.revenue_account
                                ?.account_name
                            || "",

                        description:
                            item.description
                            || "",

                        quantity:
                            Number(
                                item.quantity
                                || 0
                            ),

                        unit_price:
                            Number(
                                item.unit_price
                                || 0
                            ),

                        line_amount:
                            Number(
                                item.line_amount
                                || 0
                            ),

                        tax_plus_id:
                            item.tax_plus_id
                            || null,

                        tax_plus_account_id:
                            item.tax_plus_account_id
                            || null,

                        tax_output_rate:
                            Number(
                                item.tax_output_rate
                                || 0
                            ),

                        tax_output_amount:
                            Number(
                                item.tax_output_amount
                                || 0
                            ),

                        tax_minus_id:
                            item.tax_minus_id
                            || null,

                        tax_minus_account_id:
                            item.tax_minus_account_id
                            || null,

                        withholding_tax_rate:
                            Number(
                                item.withholding_tax_rate
                                || 0
                            ),

                        withholding_tax_amount:
                            Number(
                                item.withholding_tax_amount
                                || 0
                            ),

                        total_amount:
                            Number(
                                item.total_amount
                                || 0
                            )

                    })
                );


            this.renderInvoiceDetails();

            this.renderTaxPlus();

            this.renderTaxMinus();

            this.updateInvoiceSummary();


            bootstrap.Modal
                .getOrCreateInstance(
                    this.accountReceivableModal
                )
                .show();

        }

        catch (error) {

            console.error(
                "AccountReceivable.editInvoice:",
                error
            );


            this.showError(
                error.message
            );

        }

    }


    /*
    ======================================================
    SAVE EDIT
    ======================================================
    */

    async saveEdit() {

        try {

            if (
                !this.currentInvoiceId
            ) {

                throw new Error(
                    "Account Receivable ID is required."
                );

            }


            const header = {

                customer_id:
                    Number(
                        this.arFormCustomer.value
                    ),

                po_no:
                    this.arFormPoNo
                        ?.value
                        ?.trim()
                    || null,

                invoice_no:
                    this.arFormInvoiceNo
                        .value
                        .trim(),

                invoice_date:
                    this.arFormInvoiceDate.value,

                date_received:
                    this.arFormDateReceived?.value
                    || null,

                due_date:
                    this.arFormDueDate.value,

                description:
                    this.arFormDescription
                        ?.value
                        ?.trim()
                    || null

            };


            const details =
                this.invoiceDetails.map(
                    item => ({

                        revenue_account_id:
                            Number(
                                item.revenue_account_id
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

                        line_amount:
                            Number(
                                item.line_amount
                                || 0
                            ),

                        tax_plus_id:
                            item.tax_plus_id
                            || null,

                        tax_plus_account_id:
                            item.tax_plus_account_id
                            || null,

                        tax_output_rate:
                            Number(
                                item.tax_output_rate
                                || 0
                            ),

                        tax_output_amount:
                            Number(
                                item.tax_output_amount
                                || 0
                            ),

                        tax_minus_id:
                            item.tax_minus_id
                            || null,

                        tax_minus_account_id:
                            item.tax_minus_account_id
                            || null,

                        withholding_tax_rate:
                            Number(
                                item.withholding_tax_rate
                                || 0
                            ),

                        withholding_tax_amount:
                            Number(
                                item.withholding_tax_amount
                                || 0
                            ),

                        total_amount:
                            Number(
                                item.total_amount
                                || 0
                            )

                    })
                );


            await this.service.update(
                this.currentInvoiceId,
                header,
                details
            );


            bootstrap.Modal
                .getInstance(
                    this.accountReceivableModal
                )
                ?.hide();


            this.currentInvoiceId =
                null;


            this.currentMode =
                "add";


            await this.loadData();

        }

        catch (error) {

            console.error(
                "AccountReceivable.saveEdit:",
                error
            );


            this.showError(
                error.message
            );

        }

    }


    /*
    ======================================================
    VIEW
    ======================================================
    */

    async viewInvoice(id) {

        try {

            await this.editInvoice(
                id
            );


            this.currentMode =
                "view";


            const fields = [

                this.arFormCustomer,
                this.arFormPoNo,
                this.arFormInvoiceNo,
                this.arFormInvoiceDate,
                this.arFormDateReceived,
                this.arFormDueDate,
                this.arFormDescription

            ];


            fields.forEach(
                field => {

                    if (
                        field
                    ) {

                        field.disabled =
                            true;

                    }

                }
            );


            if (
                this.btnAddDetail
            ) {

                this.btnAddDetail.disabled =
                    true;

            }


            if (
                this.btnSaveDraft
            ) {

                this.btnSaveDraft.disabled =
                    true;

            }

        }

        catch (error) {

            console.error(
                "AccountReceivable.viewInvoice:",
                error
            );

        }

    }


    /*
    ======================================================
    DELETE
    ======================================================
    */

    async deleteInvoice(id) {

        try {

            if (
                !confirm(
                    "Delete this Account Receivable?"
                )
            ) {

                return;

            }


            await this.service.delete(
                id
            );


            await this.loadData();

        }

        catch (error) {

            console.error(
                "AccountReceivable.deleteInvoice:",
                error
            );


            this.showError(
                error.message
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

            if (
                this.dateFrom
            ) {

                this.dateFrom.value =
                    "";

            }


            if (
                this.dateTo
            ) {

                this.dateTo.value =
                    "";

            }


            if (
                this.statusFilter
            ) {

                this.statusFilter.value =
                    "";

            }


            if (
                this.keyword
            ) {

                this.keyword.value =
                    "";

            }


            this.currentPage =
                1;


            await this.loadData();

        }

        catch (error) {

            console.error(
                "AccountReceivable.refresh:",
                error
            );

        }

    }


    /*
    ======================================================
    BIND EVENTS
    ======================================================
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
==================================================
CUSTOMER CHANGE
==================================================
*/

this.arFormCustomer?.addEventListener(
    "change",
    async () => {

        await this.handleCustomerChange();

    }
);


/*
==================================================
DATE RECEIVED CHANGE
==================================================
*/

this.arFormDateReceived?.addEventListener(
    "change",
    async () => {

        await this.calculateARDueDate();

    }
);
        /*
==================================================
DOWNLOAD EXCEL
==================================================
*/

this.btnDownloadExcel?.addEventListener(
    "click",
    () => {

        this.exportExcel();

    }
);


/*
==================================================
PREVIEW HTML
==================================================
*/

this.btnPreviewHTML?.addEventListener(
    "click",
    () => {

        this.previewHTML();

    }
);
        /*
==================================================
SAVE AR PAYMENT
==================================================
*/

this.btnSaveARPayment?.addEventListener(
    "click",
    async () => {

        await this.savePayment();

    }
);


        /*
        ==================================================
        ENTER SEARCH
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
        ADD AR
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
        ADD DETAIL
        ==================================================
        */

        this.btnAddDetail?.addEventListener(
            "click",
            () => {

                this.addInvoiceDetail();

            }
        );


        /*
        ==================================================
        SAVE DETAIL
        ==================================================
        */

        this.btnSaveARDetail?.addEventListener(
            "click",
            () => {

                this.saveInvoiceDetail();

            }
        );


        /*
        ==================================================
        SAVE DRAFT / EDIT
        ==================================================
        */

        this.btnSaveDraft?.addEventListener(
            "click",
            async () => {

                if (
                    this.currentMode
                    === "edit"
                ) {

                    await this.saveEdit();

                    return;

                }


                await this.saveDraft();

            }
        );


        /*
        ==================================================
        DETAIL CALCULATION
        ==================================================
        */

        this.arDetailQuantity?.addEventListener(
            "input",
            () => {

                this.calculateDetail();

            }
        );


        this.arDetailUnitPrice?.addEventListener(
            "input",
            () => {

                this.formatUnitPrice();

                this.calculateDetail();

            }
        );


        this.arDetailTaxOutputRate?.addEventListener(
            "change",
            () => {

                this.calculateDetail();

            }
        );


        this.arDetailWithholdingTaxRate?.addEventListener(
            "change",
            () => {

                this.calculateDetail();

            }
        );


        /*
        ==================================================
        DETAIL ACTION
        ==================================================
        */

        document
            .getElementById(
                "ar-detail-body"
            )
            ?.addEventListener(
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


                    if (
                        action === "edit"
                    ) {

                        this.editInvoiceDetail(
                            id
                        );

                    }


                    if (
                        action === "delete"
                    ) {

                        this.deleteInvoiceDetail(
                            id
                        );

                    }

                }
            );


       /*
==================================================
TABLE ACTION
==================================================
*/

this.tableBody?.addEventListener(
    "click",
    async event => {

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


        /*
        ==============================================
        VIEW
        ==============================================
        */

        if (
            action === "view"
        ) {

            await this.viewInvoice(
                id
            );

            return;

        }
        /*
==============================================
PAYMENT HISTORY
==============================================
*/

if (
    action === "payment-history"
) {

    await this.paymentHistory(
        id
    );

    return;

}


        /*
        ==============================================
        EDIT
        ==============================================
        */

        if (
            action === "edit"
        ) {

            await this.editInvoice(
                id
            );

            return;

        }


        /*
        ==============================================
        DELETE
        ==============================================
        */

        if (
            action === "delete"
        ) {

            await this.deleteInvoice(
                id
            );

            return;

        }


        /*
        ==============================================
        COMPLETE
        ==============================================
        */

        if (
            action === "complete"
        ) {

            await this.completeInvoice(
                id
            );

            return;

        }


        /*
        ==============================================
        PRINT
        ==============================================
        */

        if (
            action === "print"
        ) {

            await this.printInvoice(
                id
            );

            return;

        }


        /*
        ==============================================
        RECEIVE PAYMENT
        ==============================================
        */

        if (
            action === "payment"
        ) {

            await this.receivePayment(
                id
            );

            return;

        }


        /*
        ==============================================
        VOID
        ==============================================
        */

        if (
            action === "void"
        ) {

            await this.voidInvoice(
                id
            );

            return;

        }


        /*
        ==============================================
        UNKNOWN ACTION
        ==============================================
        */

        console.warn(
            "Unknown AR action:",
            action
        );

    }
);

        /*
        ==================================================
        PAGINATION
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


        this.btnPrevPage?.addEventListener(
            "click",
            () => {

                this.goToPage(
                    this.currentPage
                    -
                    1
                );

            }
        );


        this.currentPageInput?.addEventListener(
            "change",
            () => {

                this.goToPage(
                    this.currentPageInput.value
                );

            }
        );


        this.btnNextPage?.addEventListener(
            "click",
            () => {

                this.goToPage(
                    this.currentPage
                    +
                    1
                );

            }
        );


        this.btnLastPage?.addEventListener(
            "click",
            () => {

                this.goToPage(
                    this.getTotalPages()
                );

            }
        );

    }
    /*
======================================================
GET FILTERED DATA
======================================================
*/

getFilteredData() {

    return Array.isArray(
        this.filteredData
    )
        ? this.filteredData
        : [];

}
/*
======================================================
EXPORT EXCEL
======================================================
*/

exportExcel() {

    try {

        const rows =
            this.getFilteredData();


        if (
            !rows.length
        ) {

            this.showError(
                "No Account Receivable data available."
            );

            return;

        }


        const data =
            rows.map(
                (
                    item,
                    index
                ) => ({

                    No:
                        index + 1,

                    "Invoice Date":
                        item.invoice_date
                        || "",

                    "Invoice No":
                        item.invoice_no
                        || "",

                    Customer:
                        item
                            .mst_business_partner
                            ?.bp_name
                        || "",

                    "PO No":
                        item.po_no
                        || "",

                    "Due Date":
                        item.due_date
                        || "",

                    Description:
                        item.description
                        || "",

                    "Total Amount":
                        Number(
                            item.total_amount
                            || 0
                        ),

                    "Paid Amount":
                        Number(
                            item.paid_amount
                            || 0
                        ),

                    Outstanding:
                        Number(
                            item.outstanding_amount
                            || 0
                        ),

                    Status:
                        item.status
                        || ""

                })
            );


        ExcelExportService.export(
            data,
            "Account Receivable",
            "Account Receivable"
        );

    }

    catch (error) {

        console.error(
            "AccountReceivable.exportExcel:",
            error
        );


        this.showError(
            "Export Excel failed."
        );

    }

}
/*
======================================================
PREVIEW HTML
======================================================
*/

previewHTML() {

    try {

        const data =
            this.getFilteredData();


        if (
            !data.length
        ) {

            this.showError(
                "No Account Receivable data available."
            );

            return;

        }


        const columns = [

            {
                title:
                    "No",

                width:
                    "45px",

                align:
                    "center"
            },

            {
                title:
                    "Invoice Date",

                width:
                    "100px"
            },

            {
                title:
                    "Invoice No",

                width:
                    "120px"
            },

            {
                title:
                    "Customer"
            },

            {
                title:
                    "PO No",

                width:
                    "120px"
            },

            {
                title:
                    "Due Date",

                width:
                    "100px"
            },

            {
                title:
                    "Total Amount",

                width:
                    "120px",

                align:
                    "right"
            },

            {
                title:
                    "Paid Amount",

                width:
                    "120px",

                align:
                    "right"
            },

            {
                title:
                    "Outstanding",

                width:
                    "120px",

                align:
                    "right"
            },

            {
                title:
                    "Status",

                width:
                    "80px",

                align:
                    "center"
            }

        ];


        const rows =
            data.map(
                (
                    item,
                    index
                ) => `

                    <tr>

                        <td style="text-align:center">
                            ${index + 1}
                        </td>


                        <td>
                            ${item.invoice_date || "-"}
                        </td>


                        <td>
                            ${item.invoice_no || "-"}
                        </td>


                        <td>
                            ${
                                item
                                    .mst_business_partner
                                    ?.bp_name
                                || "-"
                            }
                        </td>


                        <td>
                            ${item.po_no || "-"}
                        </td>


                        <td>
                            ${item.due_date || "-"}
                        </td>


                        <td style="text-align:right">
                            ${this.formatCurrency(
                                Number(
                                    item.total_amount
                                    || 0
                                )
                            )}
                        </td>


                        <td style="text-align:right">
                            ${this.formatCurrency(
                                Number(
                                    item.paid_amount
                                    || 0
                                )
                            )}
                        </td>


                        <td style="text-align:right">
                            ${this.formatCurrency(
                                Number(
                                    item.outstanding_amount
                                    || 0
                                )
                            )}
                        </td>


                        <td style="text-align:center">
                            ${item.status || "-"}
                        </td>

                    </tr>

                `
            );


        PreviewService.open({

            title:
                "Account Receivable",

            subtitle:
                "Account Receivable Report",

            columns,

            rows,

            orientation:
                "landscape",

            paperSize:
                "A4"

        });

    }

    catch (error) {

        console.error(
            "AccountReceivable.previewHTML:",
            error
        );


        this.showError(
            "Preview HTML failed."
        );

    }

}
    /*
======================================================
VOID ACCOUNT RECEIVABLE
======================================================
*/

async voidInvoice(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        LOAD CURRENT AR
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        if (
            !result
            ||
            !result.header
        ) {

            throw new Error(
                "Account Receivable not found."
            );

        }


        const header =
            result.header;


        /*
        ==================================================
        STATUS VALIDATION
        ==================================================
        */

        const status =
            String(
                header.status
                || ""
            )
            .trim()
            .toLowerCase();


        if (
            status === "draft"
        ) {

            throw new Error(
                "Draft Account Receivable does not need to be voided. Delete it instead."
            );

        }


        if (
            status === "void"
        ) {

            throw new Error(
                "Account Receivable is already Void."
            );

        }


        /*
        ==================================================
        PAID VALIDATION
        ==================================================
        */

        const paidAmount =
            Number(
                header.paid_amount
                || 0
            );


        if (
            paidAmount > 0
        ) {

            throw new Error(
                "Account Receivable with payment cannot be voided."
            );

        }


        /*
        ==================================================
        CONFIRMATION
        ==================================================
        */

        const confirmed =
            window.confirm(
                `Void Account Receivable ${
                    header.invoice_no
                    || ""
                }?`
            );


        if (!confirmed) {

            return;

        }


        /*
        ==================================================
        VOID GL JOURNAL
        ==================================================
        */

        if (
            header.gl_journal_id
        ) {

            const {
                error: glError
            } =
                await supabase

                    .from(
                        "trx_gl_journal"
                    )

                    .update({

                        status:
                            "Void"

                    })

                    .eq(
                        "id",
                        header.gl_journal_id
                    );


            if (glError) {

                throw glError;

            }

        }


        /*
        ==================================================
        VOID ACCOUNT RECEIVABLE
        ==================================================
        */

        await this.service.void(
            id
        );


        /*
        ==================================================
        RELOAD
        ==================================================
        */

        await this.loadData();


        console.log(
            "Account Receivable voided:",
            id
        );

    }

    catch (error) {

        console.error(
            "AccountReceivable.voidInvoice:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to void Account Receivable."
        );

    }

}

/*
======================================================
PRINT ACCOUNT RECEIVABLE INVOICE
======================================================
*/

async printInvoice(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        LOAD DATA
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        if (
            !result
            ||
            !result.header
        ) {

            throw new Error(
                "Account Receivable not found."
            );

        }


        const header =
            result.header;


        const details =
            Array.isArray(
                result.details
            )
                ? result.details
                : [];


        /*
        ==================================================
        CUSTOMER
        ==================================================
        */

        const customerName =
            header
                .mst_business_partner
                ?.bp_name
            ||
            "-";


        /*
        ==================================================
        TOTALS
        ==================================================
        */

        const subtotal =
            details.reduce(
                (
                    total,
                    item
                ) =>
                    total
                    +
                    Number(
                        item.line_amount
                        || 0
                    ),
                0
            );


        const taxPlus =
            details.reduce(
                (
                    total,
                    item
                ) =>
                    total
                    +
                    Number(
                        item.tax_output_amount
                        || 0
                    ),
                0
            );


        const taxMinus =
            details.reduce(
                (
                    total,
                    item
                ) =>
                    total
                    +
                    Number(
                        item.withholding_tax_amount
                        || 0
                    ),
                0
            );


        const totalReceivable =
            subtotal
            +
            taxPlus
            -
            taxMinus;


        /*
        ==================================================
        DETAIL ROWS
        ==================================================
        */

        const detailRows =
            details
            .map(
                (
                    item,
                    index
                ) => {

                    const accountCode =
                        item
                            .revenue_account
                            ?.account_code
                        || "";


                    const accountName =
                        item
                            .revenue_account
                            ?.account_name
                        || "";


                    return `

                        <tr>

                            <td class="center">
                                ${index + 1}
                            </td>


                            <td>

                                ${
                                    accountCode
                                        ? `${accountCode} - ${accountName}`
                                        : accountName || "-"
                                }

                            </td>


                            <td>

                                ${item.description || "-"}

                            </td>


                            <td class="right">

                                ${Number(
                                    item.quantity
                                    || 0
                                ).toLocaleString(
                                    "id-ID"
                                )}

                            </td>


                            <td class="right">

                                ${this.formatCurrency(
                                    Number(
                                        item.unit_price
                                        || 0
                                    )
                                )}

                            </td>


                            <td class="right">

                                ${this.formatCurrency(
                                    Number(
                                        item.line_amount
                                        || 0
                                    )
                                )}

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


        /*
        ==================================================
        OPEN WINDOW
        ==================================================
        */

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=1100,height=750"
            );


        if (!printWindow) {

            throw new Error(
                "Print window blocked by browser."
            );

        }


        /*
        ==================================================
        DOCUMENT
        ==================================================
        */

        printWindow.document.write(`

            <!DOCTYPE html>

            <html>

            <head>

                <meta charset="UTF-8">

                <title>
                    AR Invoice - ${header.invoice_no || ""}
                </title>


                <style>

                    * {
                        box-sizing: border-box;
                    }


                    body {

                        margin: 0;

                        padding: 30px;

                        font-family:
                            Arial,
                            sans-serif;

                        font-size: 12px;

                        color: #111827;

                    }


                    h1 {

                        margin: 0;

                        text-align: center;

                        font-size: 20px;

                    }


                    h2 {

                        margin:
                            4px
                            0
                            24px;

                        text-align: center;

                        font-size: 15px;

                    }


                    .info {

                        width: 100%;

                        margin-bottom: 20px;

                        border-collapse: collapse;

                    }


                    .info td {

                        padding: 4px 6px;

                        vertical-align: top;

                    }


                    .label {

                        width: 120px;

                        font-weight: bold;

                    }


                    .detail {

                        width: 100%;

                        border-collapse: collapse;

                    }


                    .detail th,
                    .detail td {

                        padding: 8px;

                        border: 1px solid #CBD5E1;

                    }


                    .detail th {

                        background: #F8FAFC;

                    }


                    .center {

                        text-align: center;

                    }


                    .right {

                        text-align: right;

                    }


                    .summary {

                        width: 340px;

                        margin-top: 20px;

                        margin-left: auto;

                        border-collapse: collapse;

                    }


                    .summary td {

                        padding: 6px 8px;

                    }


                    .summary-total td {

                        padding-top: 10px;

                        border-top: 1px solid #94A3B8;

                        font-size: 14px;

                        font-weight: bold;

                    }


                    @media print {

                        body {
                            padding: 0;
                        }

                    }

                </style>

            </head>


            <body>


                <h1>
                    FINOVA ACCOUNTING SYSTEM
                </h1>


                <h2>
                    ACCOUNT RECEIVABLE INVOICE
                </h2>


                <table class="info">


                    <tr>

                        <td class="label">
                            Invoice No
                        </td>

                        <td>
                            : ${header.invoice_no || "-"}
                        </td>


                        <td class="label">
                            Invoice Date
                        </td>

                        <td>
                            : ${header.invoice_date || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td class="label">
                            Customer
                        </td>

                        <td>
                            : ${customerName}
                        </td>


                        <td class="label">
                            Due Date
                        </td>

                        <td>
                            : ${header.due_date || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td class="label">
                            PO No
                        </td>

                        <td>
                            : ${header.po_no || "-"}
                        </td>


                        <td class="label">
                            Status
                        </td>

                        <td>
                            : ${header.status || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td class="label">
                            Description
                        </td>

                        <td colspan="3">
                            : ${header.description || "-"}
                        </td>

                    </tr>


                </table>


                <table class="detail">


                    <thead>

                        <tr>

                            <th style="width:45px">
                                No
                            </th>

                            <th>
                                Revenue Account
                            </th>

                            <th>
                                Description
                            </th>

                            <th style="width:80px">
                                Qty
                            </th>

                            <th style="width:130px">
                                Unit Price
                            </th>

                            <th style="width:140px">
                                Amount
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${detailRows}

                    </tbody>


                </table>


                <table class="summary">


                    <tr>

                        <td>
                            Subtotal
                        </td>

                        <td class="right">

                            ${this.formatCurrency(
                                subtotal
                            )}

                        </td>

                    </tr>


                    <tr>

                        <td>
                            Tax (+)
                        </td>

                        <td class="right">

                            ${this.formatCurrency(
                                taxPlus
                            )}

                        </td>

                    </tr>


                    <tr>

                        <td>
                            Tax (-)
                        </td>

                        <td class="right">

                            ${this.formatCurrency(
                                taxMinus
                            )}

                        </td>

                    </tr>


                    <tr class="summary-total">

                        <td>
                            Total Receivable
                        </td>

                        <td class="right">

                            ${this.formatCurrency(
                                totalReceivable
                            )}

                        </td>

                    </tr>


                </table>


                <script>

                    window.onload = () => {

                        window.focus();

                        window.print();

                    };

                <\/script>


            </body>

            </html>

        `);


        printWindow.document.close();

    }

    catch (error) {

        console.error(
            "AccountReceivable.printInvoice:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to print Account Receivable."
        );

    }

}
    /*
    ======================================================
    PARSE NUMBER
    ======================================================
    */

    parseNumber(value) {

        return Number(
            String(
                value
                || "0"
            )
            .replace(
                /\./g,
                ""
            )
            .replace(
                /,/g,
                "."
            )
        )
        || 0;

    }


    /*
    ======================================================
    FORMAT CURRENCY
    ======================================================
    */

    formatCurrency(value) {

        return Number(
            value
            || 0
        )
        .toLocaleString(
            "id-ID",
            {
                minimumFractionDigits:
                    0,

                maximumFractionDigits:
                    2
            }
        );

    }


    /*
    ======================================================
    SHOW ERROR
    ======================================================
    */

    showError(message) {

        console.error(
            "Account Receivable:",
            message
        );


        alert(
            message
        );

    }
    /*
======================================================
GENERATE GL JOURNAL FROM ACCOUNT RECEIVABLE
======================================================
*/

async generateARJournal(
    invoice,
    details
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!invoice) {

            throw new Error(
                "Account Receivable header is required."
            );

        }


        if (
            !Array.isArray(details)
            ||
            !details.length
        ) {

            throw new Error(
                "Account Receivable detail cannot be empty."
            );

        }


        /*
        ==================================================
        PIUTANG USAHA ACCOUNT
        ==================================================
        */

        const receivableAccountId =
    155;


        /*
        ==================================================
        BUSINESS PARTNER
        ==================================================
        */

        const businessPartnerId =
            invoice.customer_id
                ? Number(
                    invoice.customer_id
                )
                : null;


        /*
        ==================================================
        JOURNAL DETAILS
        ==================================================
        */

        const journalDetails = [];


        for (
            const detail
            of details
        ) {

            /*
            ==============================================
            BASE TRANSACTION
            ==============================================
            */

            const revenueAccountId =
                Number(
                    detail.revenue_account_id
                    || 0
                );


            const lineAmount =
                Number(
                    detail.line_amount
                    || 0
                );


            if (!revenueAccountId) {

                throw new Error(
                    `Revenue Account is missing on AR detail: ${
                        detail.description
                        || ""
                    }`
                );

            }


            /*
            ==============================================
            BASE JOURNAL

            DR PIUTANG USAHA
            CR REVENUE
            ==============================================
            */

            if (
                lineAmount > 0
            ) {

                journalDetails.push({

                    debit_account_id:
                        receivableAccountId,

                    credit_account_id:
                        revenueAccountId,

                    business_partner_id:
                        businessPartnerId,

                    description:
                        detail.description
                        ||
                        invoice.invoice_no,

                    amount:
                        lineAmount

                });

            }


            /*
            ==============================================
            TAX (+)

            DR PIUTANG USAHA
            CR TAX OUTPUT
            ==============================================
            */

            const taxPlusAmount =
                Number(
                    detail.tax_output_amount
                    || 0
                );


            const taxPlusAccountId =
                Number(
                    detail.tax_plus_account_id
                    || 0
                );


            if (
                taxPlusAmount > 0
            ) {

                if (!taxPlusAccountId) {

                    throw new Error(
                        `Tax (+) Account is missing for ${
                            detail.tax_plus_name
                            || "Tax (+)"
                        }.`
                    );

                }


                journalDetails.push({

                    debit_account_id:
                        receivableAccountId,

                    credit_account_id:
                        taxPlusAccountId,

                    business_partner_id:
                        businessPartnerId,

                    description:
                        detail.tax_plus_name
                        ||
                        "Tax (+)",

                    amount:
                        taxPlusAmount

                });

            }


            /*
            ==============================================
            TAX (-)

            DR TAX RECEIVABLE
            CR PIUTANG USAHA
            ==============================================
            */

            const taxMinusAmount =
                Number(
                    detail.withholding_tax_amount
                    || 0
                );


            const taxMinusAccountId =
                Number(
                    detail.tax_minus_account_id
                    || 0
                );


            if (
                taxMinusAmount > 0
            ) {

                if (!taxMinusAccountId) {

                    throw new Error(
                        `Tax (-) Account is missing for ${
                            detail.tax_minus_name
                            || "Tax (-)"
                        }.`
                    );

                }


                journalDetails.push({

                    debit_account_id:
                        taxMinusAccountId,

                    credit_account_id:
                        receivableAccountId,

                    business_partner_id:
                        businessPartnerId,

                    description:
                        detail.tax_minus_name
                        ||
                        "Tax (-)",

                    amount:
                        taxMinusAmount

                });

            }

        }


        /*
        ==================================================
        VALIDATE JOURNAL
        ==================================================
        */

        if (
            !journalDetails.length
        ) {

            throw new Error(
                "No valid AR detail available for GL Journal."
            );

        }


        /*
        ==================================================
        JOURNAL HEADER
        ==================================================
        */

        const journalHeader = {

            journal_no:
                "",

            journal_date:
                invoice.invoice_date,

            posting_period:
                invoice.invoice_date
                    ? invoice.invoice_date.substring(
                        0,
                        7
                    )
                    : "",

            description:
                invoice.description
                ||
                `AR Invoice ${
                    invoice.invoice_no
                    || ""
                }`,

            source_module:
                "AR",

            source_document_type:
                "AR_INVOICE",

            source_document_id:
                invoice.id,

            source_invoice_no:
                invoice.invoice_no
                || null,

            source_po_no:
                invoice.po_no
                || null,

            status:
                "Draft"

        };


        /*
        ==================================================
        CREATE GL
        ==================================================
        */

        const journal =
            await this.journalService.create(
                journalHeader,
                journalDetails
            );


        if (!journal) {

            throw new Error(
                "Failed to generate AR GL Journal."
            );

        }


        return journal;

    }

    catch (error) {

        console.error(
            "AccountReceivable.generateARJournal:",
            error
        );


        throw error;

    }

}
/*
======================================================
COMPLETE ACCOUNT RECEIVABLE
======================================================
*/

async completeInvoice(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        LOAD AR
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        if (
            !result
            ||
            !result.header
        ) {

            throw new Error(
                "Account Receivable not found."
            );

        }


        const invoice =
            result.header;


        const details =
            Array.isArray(
                result.details
            )
                ? result.details
                : [];


        /*
        ==================================================
        STATUS
        ==================================================
        */

        const currentStatus =
            String(
                invoice.status
                || ""
            )
            .trim();


        if (
            currentStatus !== "Draft"
        ) {

            throw new Error(
                "Only Draft Account Receivable can be completed."
            );

        }


        /*
        ==================================================
        GENERATE GL JOURNAL
        ==================================================
        */

        const journal =
            await this.generateARJournal(
                invoice,
                details
            );


        /*
        ==================================================
        SAVE GL JOURNAL ID
        ==================================================
        */

        await this.service.updateGLJournalId(
            id,
            journal.id
        );


        /*
        ==================================================
        COMPLETE AR
        Draft -> Unpaid
        ==================================================
        */

        await this.service.complete(
            id
        );


        /*
        ==================================================
        RELOAD
        ==================================================
        */

        await this.loadData();


        console.log(
            "Account Receivable completed:",
            {
                ar_id:
                    id,

                gl_journal_id:
                    journal.id,

                journal_no:
                    journal.journal_no
            }
        );

    }

    catch (error) {

        console.error(
            "AccountReceivable.completeInvoice:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to complete Account Receivable."
        );

    }

}

}