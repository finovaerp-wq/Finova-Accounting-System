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


/*
==================================================
PAYMENT SUMMARY
==================================================
*/

this.arPaymentDPP = null;

this.arPaymentTaxPlus = null;

this.arPaymentTaxMinus = null;


/*
==================================================
PAYMENT INPUT
==================================================
*/

this.arPaymentDate = null;

this.arPaymentAccount = null;

this.arPaymentAmount = null;

this.arPaymentReferenceNo = null;

this.arPaymentDescription = null;


/*
==================================================
PAYMENT JOURNAL PREVIEW
==================================================
*/

this.arPaymentPreviewDebit = null;


/*
==================================================
SAVE PAYMENT
==================================================
*/

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
        this.init();

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


    /*
    ==================================================
    PAYMENT SUMMARY
    SAME AS ACCOUNT PAYABLE

    DPP
    TAX (+)
    TAX (-)
    ==================================================
    */

    this.arPaymentDPP =
        document.getElementById(
            "ar-payment-dpp"
        );


    this.arPaymentTaxPlus =
        document.getElementById(
            "ar-payment-tax-plus"
        );


    this.arPaymentTaxMinus =
        document.getElementById(
            "ar-payment-tax-minus"
        );


    /*
    ==================================================
    PAYMENT DATE
    ==================================================
    */

    this.arPaymentDate =
        document.getElementById(
            "ar-payment-date"
        );


    /*
    ==================================================
    PAYMENT ACCOUNT
    ==================================================
    */

    this.arPaymentAccount =
        document.getElementById(
            "ar-payment-account"
        );


    /*
    ==================================================
    PAYMENT AMOUNT
    ==================================================
    */

    this.arPaymentAmount =
        document.getElementById(
            "ar-payment-amount"
        );


    /*
    ==================================================
    REFERENCE NO
    ==================================================
    */

    this.arPaymentReferenceNo =
        document.getElementById(
            "ar-payment-reference-no"
        );


    /*
    ==================================================
    DESCRIPTION
    ==================================================
    */

    this.arPaymentDescription =
        document.getElementById(
            "ar-payment-description"
        );


    /*
    ==================================================
    JOURNAL PREVIEW
    ==================================================
    */

    this.arPaymentPreviewDebit =
        document.getElementById(
            "ar-payment-preview-debit"
        );


    /*
    ==================================================
    SAVE PAYMENT
    ==================================================
    */

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
    AR FORM
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


    /*
    ==================================================
    DEBUG
    ==================================================
    */

    console.log(
        "Account Receivable DOM cached.",
        {

            tableBody:
                Boolean(
                    this.tableBody
                ),

            paymentModalFields: {

                arId:
                    Boolean(
                        this.arPaymentARId
                    ),

                invoiceNo:
                    Boolean(
                        this.arPaymentInvoiceNo
                    ),

                customer:
                    Boolean(
                        this.arPaymentCustomer
                    ),

                dpp:
                    Boolean(
                        this.arPaymentDPP
                    ),

                taxPlus:
                    Boolean(
                        this.arPaymentTaxPlus
                    ),

                taxMinus:
                    Boolean(
                        this.arPaymentTaxMinus
                    ),

                paymentDate:
                    Boolean(
                        this.arPaymentDate
                    ),

                paymentAccount:
                    Boolean(
                        this.arPaymentAccount
                    ),

                paymentAmount:
                    Boolean(
                        this.arPaymentAmount
                    ),

                referenceNo:
                    Boolean(
                        this.arPaymentReferenceNo
                    ),

                description:
                    Boolean(
                        this.arPaymentDescription
                    ),

                saveButton:
                    Boolean(
                        this.btnSaveARPayment
                    )

            }

        }
    );

}
    /*
======================================================
LOAD PAYMENT ACCOUNTS
BANK / CASH
======================================================
*/

async loadPaymentAccounts() {

    try {

        /*
        ==================================================
        VALIDATE SELECT
        ==================================================
        */

        if (
            !this.arPaymentAccount
        ) {

            throw new Error(
                "AR Payment Account select not found."
            );

        }


        /*
        ==================================================
        RESET
        ==================================================
        */

        this.arPaymentAccount.innerHTML = `

            <option value="">

                Select Bank Account

            </option>

        `;


        /*
        ==================================================
        LOAD COA

        IMPORTANT:
        ONLY ACTIVE + ALLOW TRANSACTION
        ==================================================
        */

        const {

            data,

            error

        } = await supabase

            .from(
                "mst_chart_of_accounts"
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
                    ascending:
                        true
                }
            );


        if (
            error
        ) {

            throw error;

        }


        const accounts =
            Array.isArray(
                data
            )
                ? data
                : [];


        /*
        ==================================================
        FILTER BANK / CASH

        TEMPORARY RULE:
        account name contains
        BANK / CASH / KAS
        ==================================================
        */

        const paymentAccounts =
            accounts.filter(
                account => {

                    const text =
                        `${account.account_code || ""} ${account.account_name || ""}`
                            .toLowerCase();


                    return (
                        text.includes(
                            "bank"
                        )
                        ||
                        text.includes(
                            "cash"
                        )
                        ||
                        text.includes(
                            "kas"
                        )
                    );

                }
            );


        /*
        ==================================================
        BUILD OPTION
        ==================================================
        */

        paymentAccounts.forEach(
            account => {

                const option =
                    document.createElement(
                        "option"
                    );


                /*
                ==========================================
                IMPORTANT

                VALUE MUST BE COA ID
                ==========================================
                */

                option.value =
                    String(
                        account.id
                    );


                option.textContent =
                    `${account.account_code} :: ${account.account_name}`;


                this.arPaymentAccount.appendChild(
                    option
                );

            }
        );


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR PAYMENT ACCOUNTS:",
            {

                totalCOA:
                    accounts.length,

                paymentAccounts:
                    paymentAccounts.length,

                select:
                    this.arPaymentAccount,

                options:
                    [
                        ...this.arPaymentAccount.options
                    ].map(
                        item => ({
                            value:
                                item.value,

                            text:
                                item.textContent
                        })
                    )

            }
        );


        /*
        ==================================================
        NO ACCOUNT
        ==================================================
        */

        if (
            paymentAccounts.length ===
            0
        ) {

            console.warn(
                "No Bank / Cash Account found."
            );

        }

    }

    catch (
        error
    ) {

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
ACCOUNT RECEIVABLE

FINAL - SAME LOGIC AS ACCOUNT PAYABLE

RULE :
- AR MUST ALREADY BE COMPLETED
- COMPLETED = gl_journal_id EXISTS
- GL JOURNAL MUST EXIST
- GL JOURNAL MUST BE POSTED
- OUTSTANDING MUST BE > 0
- PAID / VOID CANNOT RECEIVE PAYMENT
- PAYMENT SUMMARY SAME AS AP
======================================================
*/

async receivePayment(
    id
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !id
        ) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        LOAD FRESH ACCOUNT RECEIVABLE
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


        /*
        ==================================================
        DETAILS
        ==================================================
        */

        const details =
            Array.isArray(
                result.details
            )
                ? result.details
                : [];


        /*
        ==================================================
        AR STATUS
        ==================================================
        */

        const status =
            String(
                invoice.status
                ||
                ""
            )
            .trim()
            .toLowerCase();


        /*
        ==================================================
        PAID VALIDATION
        ==================================================
        */

        if (
            status ===
            "paid"
        ) {

            throw new Error(
                "Account Receivable is already fully paid."
            );

        }


        /*
        ==================================================
        VOID VALIDATION
        ==================================================
        */

        if (
            status ===
            "void"
        ) {

            throw new Error(
                "Void Account Receivable cannot receive payment."
            );

        }


        /*
        ==================================================
        GL JOURNAL ID

        SAME LOGIC AS AP

        gl_journal_id EXISTS
        =
        ACCOUNT RECEIVABLE ALREADY COMPLETED
        ==================================================
        */

        const glJournalId =
            invoice.gl_journal_id
            ||
            null;


        /*
        ==================================================
        NOT COMPLETED
        ==================================================
        */

        if (
            !glJournalId
        ) {

            throw new Error(
                "Account Receivable must be completed before receiving payment."
            );

        }


        /*
        ==================================================
        LOAD FRESH GL JOURNAL

        DO NOT RELY ON TABLE JOIN DATA
        ==================================================
        */

        const {

            data:
                glJournal,

            error:
                glJournalError

        } =
            await supabase

                .from(
                    "trx_gl_journal"
                )

                .select(`
                    id,
                    journal_no,
                    journal_date,
                    status
                `)

                .eq(
                    "id",
                    glJournalId
                )

                .maybeSingle();


        /*
        ==================================================
        GL JOURNAL QUERY ERROR
        ==================================================
        */

        if (
            glJournalError
        ) {

            throw glJournalError;

        }


        /*
        ==================================================
        GL JOURNAL NOT FOUND
        ==================================================
        */

        if (
            !glJournal
        ) {

            throw new Error(
                "Account Receivable GL Journal was not found."
            );

        }


        /*
        ==================================================
        GL JOURNAL STATUS
        ==================================================
        */

        const glJournalStatus =
            String(
                glJournal.status
                ||
                ""
            )
            .trim()
            .toLowerCase();


        /*
        ==================================================
        JOURNAL MUST BE POSTED
        ==================================================
        */

        if (
            glJournalStatus !==
            "posted"
        ) {

            throw new Error(
                `GL Journal ${glJournal.journal_no || ""} must be Posted before receiving payment.`
            );

        }


        /*
        ==================================================
        TOTAL AMOUNT
        ==================================================
        */

        const totalAmount =
            Number(
                invoice.total_amount
                ||
                0
            );


        if (
            totalAmount <= 0
        ) {

            throw new Error(
                "Account Receivable Total Amount is invalid."
            );

        }


        /*
        ==================================================
        PAID AMOUNT
        ==================================================
        */

        const paidAmount =
            Number(
                invoice.paid_amount
                ||
                0
            );


        /*
        ==================================================
        OUTSTANDING AMOUNT
        ==================================================
        */

        const outstandingAmount =
            Number(
                invoice.outstanding_amount
                ??
                (
                    totalAmount
                    -
                    
                    paidAmount
                )
            );


        /*
        ==================================================
        OUTSTANDING VALIDATION
        ==================================================
        */

        if (
            outstandingAmount <= 0
        ) {

            throw new Error(
                "Account Receivable is already fully paid."
            );

        }


        /*
        ==================================================
        DPP

        FIRST TRY HEADER VALUE.

        IF HEADER DOES NOT HAVE DPP,
        CALCULATE FROM DETAILS.
        ==================================================
        */

        let dppAmount =
            Number(
                invoice.dpp_amount
                ??
                invoice.subtotal
                ??
                invoice.sub_total
                ??
                0
            );


        if (
            dppAmount === 0
            &&
            details.length
        ) {

            dppAmount =
                details.reduce(
                    (
                        total,
                        detail
                    ) => {

                        return (
                            total
                            +
                            Number(
                                detail.line_amount
                                ??
                                detail.amount
                                ??
                                detail.dpp_amount
                                ??
                                0
                            )
                        );

                    },
                    0
                );

        }


        /*
==================================================
TAX (+)
ACCOUNT RECEIVABLE
==================================================
*/

let taxPlusAmount =
    Number(
        invoice.tax_plus_amount
        ??
        invoice.tax_output_amount
        ??
        invoice.tax_amount
        ??
        0
    );


/*
==================================================
CALCULATE FROM DETAILS
==================================================
*/

if (
    taxPlusAmount === 0
    &&
    details.length
) {

    taxPlusAmount =
        details.reduce(
            (
                total,
                detail
            ) => {

                return (
                    total
                    +
                    Number(
                        detail.tax_output_amount
                        ??
                        detail.tax_plus_amount
                        ??
                        0
                    )
                );

            },
            0
        );

}

        /*
        ==================================================
        TAX (-)

        FIRST TRY HEADER VALUE.

        IF HEADER DOES NOT HAVE TAX (-),
        CALCULATE FROM DETAILS.
        ==================================================
        */

        let taxMinusAmount =
            Number(
                invoice.tax_minus_amount
                ??
                invoice.withholding_tax_amount
                ??
                invoice.wht_amount
                ??
                0
            );


        if (
            taxMinusAmount === 0
            &&
            details.length
        ) {

            taxMinusAmount =
                details.reduce(
                    (
                        total,
                        detail
                    ) => {

                        return (
                            total
                            +
                            Number(
                                detail.tax_minus_amount
                                ??
                                detail.withholding_tax_amount
                                ??
                                detail.wht_amount
                                ??
                                0
                            )
                        );

                    },
                    0
                );

        }


        /*
        ==================================================
        FALLBACK DPP

        IF AR DATA DOES NOT STORE DPP SEPARATELY,
        DERIVE IT FROM:

        TOTAL = DPP + TAX (+) - TAX (-)

        DPP = TOTAL - TAX (+) + TAX (-)
        ==================================================
        */

        if (
            dppAmount === 0
            &&
            totalAmount > 0
        ) {

            dppAmount =
                totalAmount
                -
                taxPlusAmount
                +
                taxMinusAmount;

        }


        /*
        ==================================================
        SET CURRENT PAYMENT AR
        ==================================================
        */

        this.currentPaymentARId =
            id;


        /*
        ==================================================
        LOAD BANK / CASH PAYMENT ACCOUNTS
        ==================================================
        */

        await this.loadPaymentAccounts();


        /*
        ==================================================
        AR ID
        ==================================================
        */

        if (
            this.arPaymentARId
        ) {

            this.arPaymentARId.value =
                id;

        }


        /*
        ==================================================
        INVOICE NO
        ==================================================
        */

        if (
            this.arPaymentInvoiceNo
        ) {

            this.arPaymentInvoiceNo.value =
                invoice.invoice_no
                ||
                "";

        }


        /*
        ==================================================
        CUSTOMER
        ==================================================
        */

        if (
            this.arPaymentCustomer
        ) {

            this.arPaymentCustomer.value =
                invoice
                    ?.mst_business_partner
                    ?.bp_name
                ||
                "";

        }


        /*
        ==================================================
        DPP
        ==================================================
        */

        if (
            this.arPaymentDPP
        ) {

            this.arPaymentDPP.textContent =
                this.formatCurrency(
                    dppAmount
                );

        }


        /*
        ==================================================
        TAX (+)
        ==================================================
        */

        if (
            this.arPaymentTaxPlus
        ) {

            this.arPaymentTaxPlus.textContent =
                this.formatCurrency(
                    taxPlusAmount
                );

        }


        /*
        ==================================================
        TAX (-)
        ==================================================
        */

        if (
            this.arPaymentTaxMinus
        ) {

            this.arPaymentTaxMinus.textContent =
                this.formatCurrency(
                    taxMinusAmount
                );

        }


        /*
        ==================================================
        PAYMENT DATE
        ==================================================
        */

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


        /*
        ==================================================
        PAYMENT ACCOUNT
        ==================================================
        */

        if (
            this.arPaymentAccount
        ) {

            this.arPaymentAccount.value =
                "";

        }


        /*
        ==================================================
        PAYMENT AMOUNT

        DEFAULT =
        CURRENT OUTSTANDING
        ==================================================
        */

        if (
            this.arPaymentAmount
        ) {

            this.arPaymentAmount.value =
                this.formatCurrency(
                    outstandingAmount
                );

        }


        /*
        ==================================================
        REFERENCE NO
        ==================================================
        */

        if (
            this.arPaymentReferenceNo
        ) {

            this.arPaymentReferenceNo.value =
                "";

        }


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        if (
            this.arPaymentDescription
        ) {

            this.arPaymentDescription.value =
                invoice.description
                ||
                "";

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR PAYMENT VALIDATION:",
            {

                ar_id:
                    id,

                invoice_no:
                    invoice.invoice_no,

                ar_status:
                    invoice.status,

                completed:
                    true,

                gl_journal_id:
                    glJournal.id,

                journal_no:
                    glJournal.journal_no,

                journal_status:
                    glJournal.status,

                dpp:
                    dppAmount,

                tax_plus:
                    taxPlusAmount,

                tax_minus:
                    taxMinusAmount,

                total_amount:
                    totalAmount,

                paid_amount:
                    paidAmount,

                outstanding_amount:
                    outstandingAmount

            }
        );


        /*
        ==================================================
        PAYMENT MODAL VALIDATION
        ==================================================
        */

        if (
            !this.accountReceivablePaymentModal
        ) {

            throw new Error(
                "Account Receivable Payment Modal not found."
            );

        }


        /*
        ==================================================
        SHOW PAYMENT MODAL
        ==================================================
        */

        bootstrap.Modal
            .getOrCreateInstance(
                this.accountReceivablePaymentModal
            )
            .show();

    }

    catch (
        error
    ) {

        console.error(
            "AccountReceivable.receivePayment:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to open AR Payment."
        );

    }

}
/*
======================================================
GENERATE AR PAYMENT JOURNAL
SAME PATTERN AS AP PAYMENT

HEADER DESCRIPTION FORMAT:

[AUTO] PAYMENT AR
<DESCRIPTION PAYMENT AR>
======================================================
*/

async generateARPaymentJournal(
    invoice,
    payment
) {

    try {

        /*
        ==================================================
        VALIDATE INVOICE
        ==================================================
        */

        if (!invoice) {

            throw new Error(
                "Account Receivable header is required."
            );

        }


        /*
        ==================================================
        VALIDATE PAYMENT
        ==================================================
        */

        if (!payment) {

            throw new Error(
                "Payment data is required."
            );

        }


        /*
        ==================================================
        PIUTANG USAHA
        ==================================================
        */

        const receivableAccountId =
            155;


        /*
        ==================================================
        BANK / CASH
        ==================================================
        */

        const paymentAccountId =
            Number(
                payment.payment_account_id
                || 0
            );


        if (
            !paymentAccountId
        ) {

            throw new Error(
                "Bank / Cash Account is required."
            );

        }


        /*
        ==================================================
        PAYMENT AMOUNT
        ==================================================
        */

        const amount =
            Number(
                payment.amount
                || 0
            );


        if (
            amount <= 0
        ) {

            throw new Error(
                "Payment Amount must be greater than 0."
            );

        }


        /*
        ==================================================
        PAYMENT DATE
        ==================================================
        */

        const paymentDate =
            payment.payment_date
            || "";


        if (
            !paymentDate
        ) {

            throw new Error(
                "Payment Date is required."
            );

        }


        /*
        ==================================================
        PAYMENT DESCRIPTION
        USED BY JOURNAL DETAIL
        ==================================================
        */

        const paymentDescription =
            String(
                payment.description
                ||
                invoice.description
                ||
                `Payment AR ${
                    invoice.invoice_no
                    || ""
                }`
            )
            .trim();


        /*
        ==================================================
        JOURNAL HEADER DESCRIPTION

        FORMAT:

        [AUTO] PAYMENT AR
        DESCRIPTION PAYMENT AR
        ==================================================
        */

        const journalDescription =
            paymentDescription
                ? `[AUTO] PAYMENT AR\n${paymentDescription}`
                : `[AUTO] PAYMENT AR`;


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
                    businessPartnerId,

                description:
                    paymentDescription,

                amount:
                    amount

            }

        ];


        /*
        ==================================================
        JOURNAL HEADER
        ==================================================
        */

        const journalHeader = {


            /*
            ==============================================
            JOURNAL NUMBER
            AUTO GENERATED BY GL SERVICE
            ==============================================
            */

            journal_no:
                "",


            /*
            ==============================================
            ACCOUNTING DATE
            ==============================================
            */

            journal_date:
                paymentDate,


            /*
            ==============================================
            POSTING PERIOD
            ==============================================
            */

            posting_period:
                paymentDate.substring(
                    0,
                    7
                ),


            /*
            ==============================================
            DESCRIPTION
            ==============================================
            */

            description:
                journalDescription,


            /*
            ==============================================
            SOURCE MODULE
            ==============================================
            */

            source_module:
                "AR",


            /*
            ==============================================
            SOURCE DOCUMENT TYPE
            ==============================================
            */

            source_document_type:
                "AR_PAYMENT",


            /*
            ==============================================
            SOURCE DOCUMENT ID
            ==============================================
            */

            source_document_id:
                invoice.id,


            /*
            ==============================================
            SOURCE INVOICE NO
            ==============================================
            */

            source_invoice_no:
                invoice.invoice_no
                || null,


            /*
            ==============================================
            SOURCE PO NO
            ==============================================
            */

            source_po_no:
                invoice.po_no
                || null,


            /*
            ==============================================
            STATUS
            ==============================================
            */

            status:
                "Draft"

        };


        /*
        ==================================================
        DEBUG JOURNAL HEADER
        ==================================================
        */

        console.log(
            "AR PAYMENT JOURNAL HEADER:",
            journalHeader
        );


        /*
        ==================================================
        DEBUG JOURNAL DETAIL
        ==================================================
        */

        console.table(
            journalDetails
        );


        /*
        ==================================================
        CREATE JOURNAL
        ==================================================
        */

        const journal =
            await this.journalService.create(
                journalHeader,
                journalDetails
            );


        if (
            !journal
            ||
            !journal.id
        ) {

            throw new Error(
                "Failed to create AR Payment GL Journal."
            );

        }


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        console.log(
            "AR PAYMENT GL JOURNAL CREATED:",
            journal
        );


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
FULL / PARTIAL PAYMENT

FINAL - SAME LOGIC AS ACCOUNT PAYABLE

RULE :
- PREVENT DOUBLE CLICK
- AR MUST ALREADY BE COMPLETED
- COMPLETED = gl_journal_id EXISTS
- ORIGINAL AR GL JOURNAL MUST EXIST
- ORIGINAL AR GL JOURNAL MUST BE POSTED
- PAID / VOID CANNOT RECEIVE PAYMENT
- OUTSTANDING MUST BE > 0
- PREVENT OVERPAYMENT
- GENERATE PAYMENT GL JOURNAL
- PAYMENT GL JOURNAL = DRAFT
- NO LOADING AFTER ACTION
======================================================
*/

async savePayment() {

    /*
    ==================================================
    PREVENT DOUBLE CLICK
    ==================================================
    */

    if (
        this.btnSaveARPayment
        &&
        this.btnSaveARPayment.dataset.processing
        ===
        "true"
    ) {

        return;

    }


    /*
    ==================================================
    LOCK BUTTON
    ==================================================
    */

    if (
        this.btnSaveARPayment
    ) {

        this.btnSaveARPayment.dataset.processing =
            "true";

        this.btnSaveARPayment.disabled =
            true;

    }


    try {

        /*
        ==================================================
        AR ID
        ==================================================
        */

        const id =
            this.currentPaymentARId
            ||
            this.arPaymentARId?.value;


        if (
            !id
        ) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        PAYMENT DATE
        ==================================================
        */

        const paymentDate =
            this.arPaymentDate?.value
            ||
            "";


        if (
            !paymentDate
        ) {

            throw new Error(
                "Payment Date is required."
            );

        }


        /*
        ==================================================
        PAYMENT ACCOUNT
        ==================================================
        */

        const paymentAccountId =
            Number(
                this.arPaymentAccount?.value
                ||
                0
            );


      /*
==================================================
VALIDATE BANK ACCOUNT
SAME AS AP
==================================================
*/

if (!paymentAccountId) {

    this.showError(
        "Bank Account is required."
    );

    return;

}


        /*
        ==================================================
        PAYMENT AMOUNT
        ==================================================
        */

        const paymentAmount =
            this.parseNumber(
                this.arPaymentAmount?.value
            );


        if (
            paymentAmount <= 0
        ) {

            throw new Error(
                "Payment Amount must be greater than 0."
            );

        }


        /*
        ==================================================
        REFERENCE
        ==================================================
        */

        const referenceNo =
            this.arPaymentReferenceNo
                ?.value
                ?.trim()
            ||
            null;


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        const description =
            this.arPaymentDescription
                ?.value
                ?.trim()
            ||
            null;


        /*
        ==================================================
        LOAD FRESH ACCOUNT RECEIVABLE
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


        /*
        ==================================================
        CURRENT AR STATUS
        ==================================================
        */

        const currentStatus =
            String(
                invoice.status
                ||
                ""
            )
            .trim()
            .toLowerCase();


        /*
        ==================================================
        PAID VALIDATION
        ==================================================
        */

        if (
            currentStatus ===
            "paid"
        ) {

            throw new Error(
                "Account Receivable is already fully paid."
            );

        }


        /*
        ==================================================
        VOID VALIDATION
        ==================================================
        */

        if (
            currentStatus ===
            "void"
        ) {

            throw new Error(
                "Void Account Receivable cannot receive payment."
            );

        }


        /*
        ==================================================
        ORIGINAL AR GL JOURNAL ID

        SAME LOGIC AS AP :

        gl_journal_id EXISTS
        =
        AR ALREADY COMPLETED
        ==================================================
        */

        const glJournalId =
            invoice.gl_journal_id
            ||
            null;


        /*
        ==================================================
        AR MUST BE COMPLETED
        ==================================================
        */

        if (
            !glJournalId
        ) {

            throw new Error(
                "Account Receivable must be completed before receiving payment."
            );

        }


        /*
        ==================================================
        LOAD FRESH ORIGINAL AR GL JOURNAL
        ==================================================
        */

        const {

            data:
                arGLJournal,

            error:
                arGLJournalError

        } =
            await supabase

                .from(
                    "trx_gl_journal"
                )

                .select(`
                    id,
                    journal_no,
                    journal_date,
                    status
                `)

                .eq(
                    "id",
                    glJournalId
                )

                .maybeSingle();


        /*
        ==================================================
        JOURNAL QUERY ERROR
        ==================================================
        */

        if (
            arGLJournalError
        ) {

            throw arGLJournalError;

        }


        /*
        ==================================================
        ORIGINAL JOURNAL NOT FOUND
        ==================================================
        */

        if (
            !arGLJournal
        ) {

            throw new Error(
                "Account Receivable GL Journal was not found."
            );

        }


        /*
        ==================================================
        ORIGINAL JOURNAL STATUS
        ==================================================
        */

        const arGLJournalStatus =
            String(
                arGLJournal.status
                ||
                ""
            )
            .trim()
            .toLowerCase();


        /*
        ==================================================
        ORIGINAL JOURNAL MUST BE POSTED
        ==================================================
        */

        if (
            arGLJournalStatus !==
            "posted"
        ) {

            throw new Error(
                `GL Journal ${arGLJournal.journal_no || ""} must be Posted before receiving payment.`
            );

        }


        /*
        ==================================================
        TOTAL AMOUNT
        ==================================================
        */

        const totalAmount =
            Number(
                invoice.total_amount
                ||
                0
            );


        if (
            totalAmount <= 0
        ) {

            throw new Error(
                "Account Receivable Total Amount is invalid."
            );

        }


        /*
        ==================================================
        PAID AMOUNT
        ==================================================
        */

        const paidAmount =
            Number(
                invoice.paid_amount
                ||
                0
            );


        /*
        ==================================================
        OUTSTANDING AMOUNT
        ==================================================
        */

        const outstandingAmount =
            Number(
                invoice.outstanding_amount
                ??
                (
                    totalAmount
                    -
                    paidAmount
                )
            );


        /*
        ==================================================
        OUTSTANDING VALIDATION
        ==================================================
        */

        if (
            outstandingAmount <= 0
        ) {

            throw new Error(
                "Account Receivable is already fully paid."
            );

        }


        /*
        ==================================================
        PREVENT OVERPAYMENT
        ==================================================
        */

        if (
            paymentAmount
            >
            outstandingAmount
        ) {

            throw new Error(
                `Payment Amount cannot exceed Outstanding Amount (${this.formatCurrency(
                    outstandingAmount
                )}).`
            );

        }


        /*
        ==================================================
        FINAL DESCRIPTION
        ==================================================
        */

        const paymentDescription =
            description
            ||
            invoice.description
            ||
            `Payment AR ${
                invoice.invoice_no
                ||
                ""
            }`;


        /*
        ==================================================
        GENERATE AR PAYMENT GL JOURNAL

        PAYMENT JOURNAL :
        DR BANK / CASH
        CR ACCOUNT RECEIVABLE

        STATUS :
        DRAFT
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
                        paymentDescription

                }
            );


        /*
        ==================================================
        VALIDATE PAYMENT JOURNAL
        ==================================================
        */

        if (
            !journal
            ||
            !journal.id
        ) {

            throw new Error(
                "Failed to generate AR Payment GL Journal."
            );

        }


        /*
        ==================================================
        CREATE PAYMENT
        ==================================================
        */

        let payment;


        try {

            payment =
                await this.service.createPayment({

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
                        paymentDescription,

                    gl_journal_id:
                        journal.id

                });

        }

        catch (
            paymentError
        ) {

            /*
            ==================================================
            ROLLBACK PAYMENT GL JOURNAL

            IF PAYMENT INSERT FAILED
            ==================================================
            */

            const {

                error:
                    rollbackError

            } =
                await supabase

                    .from(
                        "trx_gl_journal"
                    )

                    .delete()

                    .eq(
                        "id",
                        journal.id
                    );


            if (
                rollbackError
            ) {

                console.error(
                    "AR PAYMENT JOURNAL ROLLBACK ERROR:",
                    rollbackError
                );

            }


            throw paymentError;

        }


        /*
        ==================================================
        VALIDATE PAYMENT
        ==================================================
        */

        if (
            !payment
            ||
            !payment.id
        ) {

            throw new Error(
                "Failed to save Account Receivable Payment."
            );

        }


        /*
        ==================================================
        UPDATE PAYMENT STATUS

        UNPAID
            ↓
        PARTIAL PAID
            ↓
        PAID
        ==================================================
        */

        const paymentStatus =
            await this.service.updatePaymentStatus(
                id
            );


        if (
            !paymentStatus
        ) {

            throw new Error(
                "Failed to update Account Receivable payment status."
            );

        }


        /*
        ==================================================
        VERIFY FRESH ACCOUNT RECEIVABLE
        ==================================================
        */

        const verifyResult =
            await this.service.getById(
                id
            );


        const updatedInvoice =
            verifyResult?.header;


        if (
            !updatedInvoice
        ) {

            throw new Error(
                "Failed to verify Account Receivable payment."
            );

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR PAYMENT RESULT:",
            {

                ar_id:
                    id,

                invoice_no:
                    updatedInvoice.invoice_no,

                original_gl_journal_id:
                    glJournalId,

                original_journal_no:
                    arGLJournal.journal_no,

                original_journal_status:
                    arGLJournal.status,

                payment_amount:
                    paymentAmount,

                paid_amount:
                    updatedInvoice.paid_amount,

                outstanding_amount:
                    updatedInvoice.outstanding_amount,

                status:
                    updatedInvoice.status,

                payment_id:
                    payment.id,

                payment_gl_journal_id:
                    journal.id

            }
        );


        /*
        ==================================================
        CLOSE PAYMENT MODAL
        ==================================================
        */

        if (
            this.accountReceivablePaymentModal
        ) {

            const modal =
                bootstrap.Modal.getInstance(
                    this.accountReceivablePaymentModal
                )
                ||
                bootstrap.Modal.getOrCreateInstance(
                    this.accountReceivablePaymentModal
                );


            modal.hide();

        }


        /*
        ==================================================
        CLEAR PAYMENT STATE
        ==================================================
        */

        this.currentPaymentARId =
            null;


        if (
            this.arPaymentARId
        ) {

            this.arPaymentARId.value =
                "";

        }


        if (
            this.arPaymentAmount
        ) {

            this.arPaymentAmount.value =
                "";

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
                "";

        }


        /*
        ==================================================
        REFRESH ACCOUNT RECEIVABLE

        NO LOADING AFTER ACTION
        ==================================================
        */

        await this.loadData(
            false
        );


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        const updatedStatus =
            String(
                updatedInvoice.status
                ||
                ""
            )
            .trim()
            .toLowerCase();


        if (
            updatedStatus ===
            "paid"
        ) {

            this.showSuccess(
                "Account Receivable successfully paid."
            );

        }

        else if (
            updatedStatus ===
            "partial paid"
        ) {

            this.showSuccess(
                `Partial payment successfully saved. Outstanding: ${this.formatCurrency(
                    Number(
                        updatedInvoice.outstanding_amount
                        ||
                        0
                    )
                )}`
            );

        }

        else {

            this.showSuccess(
                "Account Receivable payment successfully saved."
            );

        }


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return {

            payment,

            journal,

            accountReceivable:
                updatedInvoice

        };

    }

    catch (
        error
    ) {

        console.error(
            "AccountReceivable.savePayment:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to save AR Payment."
        );


        return null;

    }

    finally {

        /*
        ==================================================
        RELEASE BUTTON
        ==================================================
        */

        if (
            this.btnSaveARPayment
        ) {

            this.btnSaveARPayment.dataset.processing =
                "false";

            this.btnSaveARPayment.disabled =
                false;

        }

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

BASIS:
INVOICE DATE + TERM OF PAYMENT
======================================================
*/

async calculateARDueDate() {

    try {

        /*
        ==================================================
        CUSTOMER
        ==================================================
        */

        const customerId =
            this.arFormCustomer?.value;


        /*
        ==================================================
        INVOICE DATE
        ==================================================
        */

        const invoiceDate =
            this.arFormInvoiceDate?.value;


        /*
        ==================================================
        VALIDATE
        ==================================================
        */

        if (
            !customerId
            ||
            !invoiceDate
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


        if (
            !customer
        ) {

            throw new Error(
                "Customer not found."
            );

        }


        /*
        ==================================================
        CALCULATE FROM SERVICE

        DUE DATE
        =
        INVOICE DATE + TOP DAYS
        ==================================================
        */

        const dueDate =
            this.service.calculateDueDate(
                invoiceDate,
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


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR DUE DATE:",
            {

                customer_id:
                    customerId,

                invoice_date:
                    invoiceDate,

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

    catch (
        error
    ) {

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


        throw error;

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
LOAD ACCOUNT RECEIVABLE
======================================================
*/

async loadData(
    showLoading = true
) {

    try {

        /*
        ==================================================
        RE-CACHE ACTIVE TABLE BODY
        ==================================================
        */

        const activeTableBody =
            document.getElementById(
                "account-receivable-table-body"
            );


        if (
            activeTableBody
        ) {

            this.tableBody =
                activeTableBody;

        }


        /*
        ==================================================
        LOADING
        ONLY INITIAL LOAD / REFRESH
        ==================================================
        */

        if (
            showLoading
            &&
            this.tableBody
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="
                            text-center
                            py-5
                        "
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

                                <span
                                    class="visually-hidden"
                                >

                                    Loading...

                                </span>

                            </div>


                            <div
                                class="
                                    text-muted
                                    small
                                "
                            >

                                Loading Account Receivable...

                            </div>

                        </div>

                    </td>

                </tr>

            `;

        }


        /*
        ==================================================
        LOAD ACCOUNT RECEIVABLE
        ==================================================
        */

        let data =
            await this.service.getAll();


        /*
        ==================================================
        NORMALIZE DATA
        ==================================================
        */

        data =
            Array.isArray(
                data
            )
                ? data
                : [];


        /*
        ==================================================
        STORE DATA
        ==================================================
        */

        this.data =
            data;


        this.filteredData =
            [
                ...data
            ];


        /*
        ==================================================
        PAGE SIZE
        ==================================================
        */

        const pageSize =
            Number(
                this.pageSize
            )
            ||
            20;


        /*
        ==================================================
        TOTAL PAGES
        ==================================================
        */

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    this.filteredData.length
                    /
                    pageSize
                )
            );


        /*
        ==================================================
        KEEP CURRENT PAGE VALID
        ==================================================
        */

        this.currentPage =
            Math.min(
                Math.max(
                    Number(
                        this.currentPage
                    )
                    ||
                    1,
                    1
                ),
                totalPages
            );


        /*
        ==================================================
        RE-CACHE TABLE BODY
        AFTER ASYNC OPERATION
        ==================================================
        */

        this.tableBody =
            document.getElementById(
                "account-receivable-table-body"
            );


        /*
        ==================================================
        RENDER
        ==================================================
        */

        if (
            typeof this.render ===
            "function"
        ) {

            this.render();

        }

        else {

            /*
            ==============================================
            FALLBACK
            ==============================================
            */

            if (
                typeof this.renderTable ===
                "function"
            ) {

                this.renderTable();

            }


            if (
                typeof this.renderPagination ===
                "function"
            ) {

                this.renderPagination();

            }

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "ACCOUNT RECEIVABLE LOAD DATA:",
            {

                total:
                    this.data.length,

                filtered:
                    this.filteredData.length,

                currentPage:
                    this.currentPage,

                pageSize:
                    pageSize,

                totalPages:
                    totalPages,

                showLoading:
                    showLoading

            }
        );

    }

    catch (
        error
    ) {

        /*
        ==================================================
        ERROR LOG
        ==================================================
        */

        console.error(
            "AccountReceivable.loadData:",
            error
        );


        /*
        ==================================================
        RE-CACHE ACTIVE TABLE BODY
        ==================================================
        */

        const activeTableBody =
            document.getElementById(
                "account-receivable-table-body"
            );


        /*
        ==================================================
        ERROR TABLE
        ==================================================
        */

        if (
            activeTableBody
        ) {

            this.tableBody =
                activeTableBody;


            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="
                            text-center
                            text-danger
                            py-5
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-circle-exclamation
                                me-2
                            "
                        >
                        </i>

                        Failed to load Account Receivable.

                    </td>

                </tr>

            `;

        }


        /*
        ==================================================
        ERROR MESSAGE
        ==================================================
        */

        this.showError(
            error?.message
            ||
            "Failed to load Account Receivable."
        );

    }

}
    /*
======================================================
SEARCH ACCOUNT RECEIVABLE
======================================================
*/

async search() {

    try {

        /*
        ==================================================
        GET FILTER VALUE
        ==================================================
        */

        const dateFrom =
            String(
                this.dateFrom?.value
                || ""
            )
            .trim();


        const dateTo =
            String(
                this.dateTo?.value
                || ""
            )
            .trim();


        const status =
            String(
                this.statusFilter?.value
                || "all"
            )
            .trim();


        const findBy =
            String(
                this.findBy?.value
                || "invoice_no"
            )
            .trim();


        const keyword =
            String(
                this.keyword?.value
                || ""
            )
            .trim();


        /*
        ==================================================
        VALIDATE DATE RANGE
        ==================================================
        */

        if (
            dateFrom
            &&
            dateTo
            &&
            dateFrom > dateTo
        ) {

            this.showError(
                "Invoice Date From cannot be greater than Invoice Date To."
            );

            return;

        }


        /*
        ==================================================
        FILTER OBJECT
        ==================================================
        */

        const filters = {

            dateFrom:
                dateFrom,

            dateTo:
                dateTo,

            status:
                status,

            findBy:
                findBy,

            keyword:
                keyword

        };


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR SEARCH FILTER:",
            filters
        );


        /*
        ==================================================
        SEARCH DATABASE
        ==================================================
        */

        const result =
            await this.service.search(
                filters
            );


        /*
        ==================================================
        SET FILTERED DATA
        ==================================================
        */

        this.filteredData =
            Array.isArray(
                result
            )
                ? result
                : [];


        /*
        ==================================================
        RESET PAGE
        ==================================================
        */

        this.currentPage =
            1;


        /*
        ==================================================
        RENDER
        ==================================================
        */

        this.render();


        /*
        ==================================================
        DEBUG RESULT
        ==================================================
        */

        console.log(
            "AR SEARCH RESULT:",
            {

                date_from:
                    dateFrom,

                date_to:
                    dateTo,

                status:
                    status,

                find_by:
                    findBy,

                keyword:
                    keyword,

                total:
                    this.filteredData.length,

                data:
                    this.filteredData

            }
        );

    }

    catch (error) {

        console.error(
            "AccountReceivable.search:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to search Account Receivable."
        );

    }

}

    /*
======================================================
GET TOTAL PAGES
======================================================
*/

getTotalPages() {

    /*
    ==================================================
    TOTAL RECORDS
    ==================================================
    */

    const totalRecords =
        Array.isArray(
            this.filteredData
        )
            ? this.filteredData.length
            : 0;


    /*
    ==================================================
    PAGE SIZE
    ==================================================
    */

    const pageSize =
        Number(
            this.pageSize
        )
        ||
        20;


    /*
    ==================================================
    TOTAL PAGES
    MINIMUM = 1
    ==================================================
    */

    return Math.max(
        1,
        Math.ceil(
            totalRecords
            /
            pageSize
        )
    );

}


/*
======================================================
GO TO PAGE
======================================================
*/

goToPage(page) {

    /*
    ==================================================
    TOTAL PAGES
    ==================================================
    */

    const totalPages =
        this.getTotalPages();


    /*
    ==================================================
    NORMALIZE PAGE
    ==================================================
    */

    let nextPage =
        Number(
            page
        )
        ||
        1;


    nextPage =
        Math.max(
            1,
            Math.min(
                nextPage,
                totalPages
            )
        );


    /*
    ==================================================
    SET CURRENT PAGE
    ==================================================
    */

    this.currentPage =
        nextPage;


    /*
    ==================================================
    RENDER
    ==================================================
    */

    this.render();

}


/*
======================================================
RENDER
======================================================
*/

render() {

    /*
    ==================================================
    TABLE
    ==================================================
    */

    this.renderTable();


    /*
    ==================================================
    PAGINATION
    ==================================================
    */

    this.renderPagination();

}


/*
======================================================
RENDER TABLE
ALWAYS USE ACTIVE DOM
======================================================
*/

renderTable() {

    /*
    ==================================================
    ALWAYS GET CURRENT TABLE BODY
    ==================================================
    */

    const activeTableBody =
        document.getElementById(
            "account-receivable-table-body"
        );


    /*
    ==================================================
    TABLE BODY NOT AVAILABLE
    ==================================================
    */

    if (
        !activeTableBody
    ) {

        console.warn(
            "AccountReceivable.renderTable: active table body not found."
        );

        return;

    }


    /*
    ==================================================
    UPDATE CACHE
    ==================================================
    */

    this.tableBody =
        activeTableBody;


    /*
    ==================================================
    DATA
    ==================================================
    */

    const filteredData =
        Array.isArray(
            this.filteredData
        )
            ? this.filteredData
            : [];


    /*
    ==================================================
    PAGE SIZE
    ==================================================
    */

    const pageSize =
        Number(
            this.pageSize
        )
        ||
        20;


    /*
    ==================================================
    TOTAL PAGES
    ==================================================
    */

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredData.length
                /
                pageSize
            )
        );


    /*
    ==================================================
    KEEP CURRENT PAGE VALID
    ==================================================
    */

    this.currentPage =
        Math.min(
            Math.max(
                Number(
                    this.currentPage
                )
                ||
                1,
                1
            ),
            totalPages
        );


    /*
    ==================================================
    START INDEX
    ==================================================
    */

    const startIndex =
        (
            this.currentPage
            -
            1
        )
        *
        pageSize;


    /*
    ==================================================
    END INDEX
    ==================================================
    */

    const endIndex =
        startIndex
        +
        pageSize;


    /*
    ==================================================
    PAGE DATA
    ==================================================
    */

    const pageData =
        filteredData.slice(
            startIndex,
            endIndex
        );


    /*
    ==================================================
    EMPTY
    ==================================================
    */

    if (
        pageData.length === 0
    ) {

        activeTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="
                        text-center
                        py-5
                        text-muted
                    "
                >

                    No Account Receivable found.

                </td>

            </tr>

        `;

        return;

    }


    /*
    ==================================================
    RENDER ROWS
    ==================================================
    */

    activeTableBody.innerHTML =
        pageData
            .map(
                (
                    invoice,
                    index
                ) => {

                    return this.createTableRow(
                        invoice,
                        startIndex
                        +
                        index
                        +
                        1
                    );

                }
            )
            .join("");


    /*
    ==================================================
    DEBUG
    ==================================================
    */

    console.log(
        "ACCOUNT RECEIVABLE TABLE RENDER:",
        {

            totalFiltered:
                filteredData.length,

            pageSize:
                pageSize,

            currentPage:
                this.currentPage,

            totalPages:
                totalPages,

            startIndex:
                startIndex,

            endIndex:
                Math.min(
                    endIndex,
                    filteredData.length
                ),

            rowsRendered:
                pageData.length

        }
    );

}
/*
======================================================
RENDER PAGINATION
SAME AS ACCOUNT PAYABLE
======================================================
*/

renderPagination() {

    const totalRecords =
        this.filteredData.length;


    const totalPages =
        this.getTotalPages();


    /*
    ==================================================
    KEEP CURRENT PAGE VALID
    ==================================================
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
    ==================================================
    CURRENT PAGE
    ==================================================
    */

    if (
        this.currentPageInput
    ) {

        this.currentPageInput.value =
            this.currentPage;


        this.currentPageInput.min =
            1;


        this.currentPageInput.max =
            totalPages;

    }


    /*
    ==================================================
    TOTAL PAGE
    ==================================================
    */

    if (
        this.totalPagesElement
    ) {

        this.totalPagesElement.textContent =
            totalPages;

    }


    /*
    ==================================================
    RECORD INFO
    ==================================================
    */

    if (
        this.recordInfo
    ) {

        if (
            !totalRecords
        ) {

            this.recordInfo.textContent =
                "Displaying Record 0 - 0 of 0";

        }

        else {

            const start =
                (
                    this.currentPage - 1
                )
                *
                this.pageSize
                +
                1;


            const end =
                Math.min(
                    this.currentPage
                    *
                    this.pageSize,
                    totalRecords
                );


            this.recordInfo.textContent =
                `Displaying Record ${start} - ${end} of ${totalRecords}`;

        }

    }


    /*
    ==================================================
    FIRST
    ==================================================
    */

    if (
        this.btnFirstPage
    ) {

        this.btnFirstPage.disabled =
            this.currentPage <= 1;

    }


    /*
    ==================================================
    PREVIOUS
    ==================================================
    */

    if (
        this.btnPrevPage
    ) {

        this.btnPrevPage.disabled =
            this.currentPage <= 1;

    }


    /*
    ==================================================
    NEXT
    ==================================================
    */

    if (
        this.btnNextPage
    ) {

        this.btnNextPage.disabled =
            this.currentPage >= totalPages;

    }


    /*
    ==================================================
    LAST
    ==================================================
    */

    if (
        this.btnLastPage
    ) {

        this.btnLastPage.disabled =
            this.currentPage >= totalPages;

    }

}
 /*
======================================================
CREATE TABLE ROW
ACCOUNT RECEIVABLE
COMPACT BODY LAYOUT

FINAL :
- JOURNAL NOT SET IF NOT COMPLETED
- JOURNAL NOT POSTED IF GL = DRAFT / OTHER
- JOURNAL POSTED IF GL = POSTED
- SAME DISPLAY LOGIC AS ACCOUNT PAYABLE
- VIEW PAYMENT IF PAYMENT EXISTS
======================================================
*/

createTableRow(
    item,
    rowNumber
) {

    /*
    ==================================================
    CUSTOMER
    ==================================================
    */

    const customer =
        item?.mst_business_partner;


    const customerName =
        customer?.bp_name
        ||
        "-";


    /*
    ==================================================
    DOCUMENT
    ==================================================
    */

    const invoiceNo =
        item?.invoice_no
        ||
        "-";


    const poNo =
        item?.po_no
        ||
        "-";


    /*
    ==================================================
    GL JOURNAL
    ==================================================
    */

    const journalId =
        item?.gl_journal_id
        ||
        item
            ?.trx_gl_journal
            ?.id
        ||
        null;


    const hasJournal =
        Boolean(
            journalId
        );


    const journalNo =
        hasJournal

            ? (
                item
                    ?.trx_gl_journal
                    ?.journal_no
                ||
                item?.journal_no
                ||
                "Linked"
            )

            : "Not Set";


    /*
    ==================================================
    JOURNAL STATUS
    ==================================================
    */

    const journalStatus =
        String(
            item
                ?.trx_gl_journal
                ?.status
            ||
            ""
        )
        .trim()
        .toLowerCase();


    /*
    ==================================================
    JOURNAL POSTED
    ==================================================
    */

    const journalPosted =
        hasJournal
        &&
        journalStatus ===
        "posted";


    /*
    ==================================================
    JOURNAL STATUS HTML

    NO JOURNAL
    -> NOTHING

    JOURNAL EXISTS + POSTED
    -> GREEN

    JOURNAL EXISTS + NOT POSTED
    -> RED
    ==================================================
    */

    const journalStatusHTML =
        !hasJournal

            ? ""

            : journalPosted

                ? `

                    <div
                        class="
                            ar-journal-status
                            text-success
                            fw-semibold
                            mt-1
                        "
                    >

                        Journal POSTED

                    </div>

                `

                : `

                    <div
                        class="
                            ar-journal-status
                            text-danger
                            fw-semibold
                            mt-1
                        "
                    >

                        Journal NOT POSTED

                    </div>

                `;


    /*
    ==================================================
    DESCRIPTION
    ==================================================
    */

    const description =
        item?.description
        ||
        "-";


    /*
    ==================================================
    DATE
    ==================================================
    */

    const invoiceDate =
        item?.invoice_date
        ||
        "-";


    const dueDate =
        item?.due_date
        ||
        "-";


    /*
    ==================================================
    AMOUNT
    ==================================================
    */

    const totalValue =
        Number(
            item?.total_amount
            ||
            0
        );


    const paidValue =
        Number(
            item?.paid_amount
            ||
            0
        );


    const outstandingValue =
        Number(
            item?.outstanding_amount
            ??
            (
                totalValue
                -
                paidValue
            )
        );


    const totalAmount =
        this.formatCurrency(
            totalValue
        );


    const paidAmount =
        this.formatCurrency(
            paidValue
        );


    const outstandingAmount =
        this.formatCurrency(
            outstandingValue
        );


    /*
    ==================================================
    PAYMENT STATUS
    SAME AS ACCOUNT PAYABLE
    ==================================================
    */

    const paymentStatus =
        this.getPaymentStatus(
            item
        );


    /*
    ==================================================
    TECHNICAL STATUS
    ==================================================
    */

    const technicalStatus =
        String(
            item?.status
            ||
            ""
        )
        .trim()
        .toLowerCase();


    /*
    ==================================================
    VIEW PAYMENT
    ==================================================
    */

    const viewPaymentHTML =
        this.renderViewPayment(
            item
        );


    /*
    ==================================================
    DEBUG
    ==================================================
    */

    console.log(
        "AR ROW:",
        {

            invoice_no:
                invoiceNo,

            customer:
                customerName,

            status:
                item?.status,

            total:
                totalValue,

            paid:
                paidValue,

            outstanding:
                outstandingValue,

            gl_journal_id:
                journalId,

            journal_no:
                journalNo,

            journal_status:
                journalStatus,

            journal_posted:
                journalPosted,

            has_payment:
                paidValue > 0

        }
    );


    /*
    ==================================================
    RETURN ROW
    ==================================================
    */

    return `

        <tr
            class="ar-data-row"
            data-id="${item?.id || ""}"
            data-status="${technicalStatus}"
        >


            <!-- ======================================
                 NO
            ======================================= -->

            <td
                class="
                    finova-table-index
                    ar-cell-no
                "
            >

                ${rowNumber}

            </td>


            <!-- ======================================
                 DOCUMENT
            ======================================= -->

            <td class="ar-cell-document">

                <div class="ar-document-wrap">


                    <!-- DOCUMENT TYPE -->

                    <div class="ar-document-badges">

                        <span
                            class="
                                ar-document-badge
                                ar-document-badge-receivable
                            "
                        >

                            RECEIVABLE

                        </span>


                        <span
                            class="
                                ar-document-badge
                                ar-document-badge-invoice
                            "
                        >

                            INV

                        </span>

                    </div>


                    <!-- INVOICE NO -->

                    <div class="ar-info-line">

                        <span class="ar-info-label">

                            Inv No

                        </span>


                        <span class="ar-info-separator">

                            :

                        </span>


                        <span
                            class="
                                ar-info-value
                                fw-semibold
                            "
                        >

                            ${invoiceNo}

                        </span>

                    </div>


                    <!-- PO NO -->

                    <div class="ar-info-line">

                        <span class="ar-info-label">

                            PO No

                        </span>


                        <span class="ar-info-separator">

                            :

                        </span>


                        <span class="ar-info-value">

                            ${poNo}

                        </span>

                    </div>


                    <!-- JOURNAL -->

                    <div class="ar-info-line">

                        <span class="ar-info-label">

                            Journal

                        </span>


                        <span class="ar-info-separator">

                            :

                        </span>


                        <span
                            class="
                                ar-info-value
                                fw-semibold
                            "
                        >

                            ${journalNo}

                        </span>

                    </div>


                    <!-- JOURNAL STATUS -->

                    ${journalStatusHTML}


                </div>

            </td>


            <!-- ======================================
                 CUSTOMER / DESCRIPTION
            ======================================= -->

            <td class="ar-cell-customer">

                <div class="ar-customer-wrap">


                    <!-- CUSTOMER -->

                    <div class="ar-customer-name">

                        ${customerName}

                    </div>


                    <!-- DESCRIPTION -->

                    <div class="ar-description-line">

                        <span class="ar-info-label">

                            Description

                        </span>


                        <span class="ar-info-separator">

                            :

                        </span>


                        <span class="ar-description-value">

                            ${description}

                        </span>

                    </div>


                </div>

            </td>


            <!-- ======================================
                 DATE INFORMATION
            ======================================= -->

            <td class="ar-cell-date-info">

                <div class="ar-date-wrap">


                    <!-- INVOICE DATE -->

                    <div class="ar-info-line">

                        <span class="ar-info-label">

                            Inv Date

                        </span>


                        <span class="ar-info-separator">

                            :

                        </span>


                        <span class="ar-info-value">

                            ${invoiceDate}

                        </span>

                    </div>


                    


                    <!-- DUE DATE -->

                    <div class="ar-info-line">

                        <span class="ar-info-label">

                            Due Date

                        </span>


                        <span class="ar-info-separator">

                            :

                        </span>


                        <span class="ar-info-value">

                            ${dueDate}

                        </span>

                    </div>


                </div>

            </td>


            <!-- ======================================
                 AMOUNT / STATUS
            ======================================= -->

            <td class="ar-cell-amount-status">

                <div class="ar-amount-wrap">


                    <!-- TOTAL -->

                    <div class="ar-info-line">

                        <span class="ar-info-label">

                            Total

                        </span>


                        <span class="ar-info-separator">

                            :

                        </span>


                        <span
                            class="
                                ar-info-value
                                ar-amount-value
                            "
                        >

                            ${totalAmount}

                        </span>

                    </div>


                    <!-- PAID -->

                    <div class="ar-info-line">

                        <span class="ar-info-label">

                            Paid

                        </span>


                        <span class="ar-info-separator">

                            :

                        </span>


                        <span
                            class="
                                ar-info-value
                                ar-amount-value
                            "
                        >

                            ${paidAmount}

                        </span>

                    </div>


                    <!-- OUTSTANDING -->

                    <div class="ar-info-line">

                        <span class="ar-info-label">

                            Outstanding

                        </span>


                        <span class="ar-info-separator">

                            :

                        </span>


                        <span
                            class="
                                ar-info-value
                                ar-amount-value
                            "
                        >

                            ${outstandingAmount}

                        </span>

                    </div>


                    <!-- STATUS -->

                    <div
                        class="
                            ar-info-line
                            ar-status-line
                        "
                    >

                        <span class="ar-info-label">

                            Status

                        </span>


                        <span class="ar-info-separator">

                            :

                        </span>


                        <span class="ar-info-value">

                            ${
                                this.renderStatus(
                                    paymentStatus
                                )
                            }

                        </span>

                    </div>


                    <!-- ==================================
                         VIEW PAYMENT
                    =================================== -->

                    ${
                        viewPaymentHTML

                            ? `

                                <div
                                    class="
                                        ar-info-line
                                        ar-view-payment-line
                                    "
                                >

                                    <span class="ar-info-label">

                                        Payment

                                    </span>


                                    <span class="ar-info-separator">

                                        :

                                    </span>


                                    <span class="ar-info-value">

                                        ${viewPaymentHTML}

                                    </span>

                                </div>

                            `

                            : ""
                    }


                </div>

            </td>


            <!-- ======================================
                 ACTION
            ======================================= -->

            <td
                class="
                    finova-table-action
                    ar-cell-action
                "
            >

                ${
                    this.renderActionButtons(
                        item
                    )
                }

            </td>


        </tr>

    `;

}


/*
======================================================
RENDER VIEW PAYMENT
ACCOUNT RECEIVABLE

RULE :
- DRAFT       = HIDE
- VOID        = HIDE
- PAID = 0    = HIDE
- PAID > 0    = SHOW
======================================================
*/

renderViewPayment(
    invoice
) {

    /*
    ==================================================
    VALIDATION
    ==================================================
    */

    if (
        !invoice
    ) {

        return "";

    }


    /*
    ==================================================
    AR ID
    ==================================================
    */

    const id =
        invoice?.id;


    if (
        !id
    ) {

        return "";

    }


    /*
    ==================================================
    TECHNICAL STATUS
    ==================================================
    */

    const technicalStatus =
        String(
            invoice?.status
            ||
            "Draft"
        )
        .trim()
        .toLowerCase();


    /*
    ==================================================
    DRAFT / VOID
    ==================================================
    */

    if (
        technicalStatus === "draft"
        ||
        technicalStatus === "void"
    ) {

        return "";

    }


    /*
    ==================================================
    PAID AMOUNT
    ==================================================
    */

    const paidAmount =
        Number(
            invoice?.paid_amount
            ||
            0
        );


    /*
    ==================================================
    NO PAYMENT
    ==================================================
    */

    if (
        !Number.isFinite(
            paidAmount
        )
        ||
        paidAmount <= 0
    ) {

        return "";

    }


    /*
    ==================================================
    BUTTON
    ==================================================
    */

    return `

        <button
            type="button"
            class="
                btn
                btn-link
                p-0
                ar-view-payment
            "
            data-action="view-payment"
            data-id="${id}"
            title="View Payment"
        >

            <i
                class="
                    fa-regular
                    fa-eye
                    me-1
                "
            >
            </i>

            View Payment

        </button>

    `;

}


/*
======================================================
VIEW AR PAYMENT
ONLY ACTIVE PAYMENT
WITH BANK / PAYMENT ACCOUNT
======================================================
*/

async viewPayment(
    id
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !id
        ) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        GET ACCOUNT RECEIVABLE
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        const invoice =
            result?.header
            ||
            null;


        if (
            !invoice
        ) {

            throw new Error(
                "Account Receivable not found."
            );

        }


        /*
        ==================================================
        GET ACTIVE PAYMENT HISTORY
        ==================================================
        */

        const {

            data:
                payments,

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

                gl_journal_id,

                created_at,

                trx_gl_journal (
                    id,
                    journal_no,
                    journal_date,
                    status
                )

            `)

            .eq(
                "account_receivable_id",
                id
            )

            .not(
                "gl_journal_id",
                "is",
                null
            )

            .order(
                "payment_date",
                {
                    ascending:
                        false
                }
            )

            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "AR PAYMENT HISTORY ERROR:",
                {

                    message:
                        error.message,

                    details:
                        error.details,

                    hint:
                        error.hint,

                    code:
                        error.code

                }
            );


            throw error;

        }


        /*
        ==================================================
        VALIDATE PAYMENT
        ==================================================
        */

        if (
            !Array.isArray(
                payments
            )
            ||
            payments.length === 0
        ) {

            throw new Error(
                "Active payment history not found."
            );

        }


        /*
        ==================================================
        VALID PAYMENT
        ==================================================
        */

        const validPayments =
            payments.filter(
                payment => {

                    return (
                        payment
                        &&
                        payment.gl_journal_id
                    );

                }
            );


        if (
            validPayments.length === 0
        ) {

            throw new Error(
                "No active payment with GL Journal found."
            );

        }


        /*
        ==================================================
        GET UNIQUE PAYMENT ACCOUNT IDS
        ==================================================
        */

        const paymentAccountIds =
            [
                ...new Set(

                    validPayments

                        .map(
                            payment =>
                                Number(
                                    payment
                                        ?.payment_account_id
                                    ||
                                    0
                                )
                        )

                        .filter(
                            accountId =>
                                accountId > 0
                        )

                )
            ];


        /*
        ==================================================
        LOAD PAYMENT ACCOUNTS
        ==================================================
        */

        let paymentAccounts =
            [];


        if (
            paymentAccountIds.length > 0
        ) {

            const {

                data:
                    accountData,

                error:
                    accountError

            } = await supabase

                .from(
                    "mst_chart_of_accounts"
                )

                .select(`
                    id,
                    account_code,
                    account_name
                `)

                .in(
                    "id",
                    paymentAccountIds
                );


            if (
                accountError
            ) {

                console.error(
                    "AR PAYMENT ACCOUNT ERROR:",
                    accountError
                );


                throw accountError;

            }


            paymentAccounts =
                Array.isArray(
                    accountData
                )
                    ? accountData
                    : [];

        }


        /*
        ==================================================
        MAP PAYMENT ACCOUNT
        ==================================================
        */

        const paymentHistory =
            validPayments.map(
                payment => {

                    const paymentAccount =
                        paymentAccounts.find(
                            account => {

                                return (
                                    String(
                                        account.id
                                    )
                                    ===
                                    String(
                                        payment
                                            .payment_account_id
                                    )
                                );

                            }
                        )
                        ||
                        null;


                    return {

                        ...payment,

                        payment_account:
                            paymentAccount

                    };

                }
            );


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR ACTIVE PAYMENT HISTORY:",
            {

                account_receivable_id:
                    id,

                invoice_no:
                    invoice.invoice_no,

                payment_count:
                    paymentHistory.length,

                payments:
                    paymentHistory

            }
        );


        /*
        ==================================================
        OPEN MODAL
        ==================================================
        */

        this.openPaymentHistoryModal(
            invoice,
            paymentHistory
        );

    }

    catch (
        error
    ) {

        console.error(
            "AccountReceivable.viewPayment:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to load payment history."
        );

    }

}


/*
======================================================
OPEN AR PAYMENT HISTORY MODAL
SAME VISUAL STANDARD AS ACCOUNT PAYABLE

RULE:
- SHOW ACTIVE PAYMENT ONLY
- SHOW BANK / PAYMENT ACCOUNT
- SHOW PAYMENT JOURNAL
- DESCRIPTION FULL WIDTH
- TOTAL PAID
======================================================
*/

openPaymentHistoryModal(
    invoice,
    payments = []
) {

    /*
    ==================================================
    VALIDATE INVOICE
    ==================================================
    */

    if (!invoice) {

        this.showError(
            "Account Receivable data is required."
        );

        return;

    }


    /*
    ==================================================
    ACTIVE PAYMENTS ONLY
    ==================================================
    */

    const activePayments =
        (
            Array.isArray(payments)
                ? payments
                : []
        )
        .filter(
            payment => {

                return Boolean(
                    payment
                    &&
                    payment.gl_journal_id
                );

            }
        );


    /*
    ==================================================
    NO ACTIVE PAYMENT
    ==================================================
    */

    if (
        activePayments.length === 0
    ) {

        this.showError(
            "Active payment history not found."
        );

        return;

    }


    /*
    ==================================================
    REMOVE OLD MODAL
    ==================================================
    */

    const oldModal =
        document.getElementById(
            "arPaymentHistoryModal"
        );


    if (oldModal) {

        const oldInstance =
            bootstrap.Modal.getInstance(
                oldModal
            );


        if (oldInstance) {

            oldInstance.dispose();

        }


        oldModal.remove();

    }


    /*
    ==================================================
    CUSTOMER
    ==================================================
    */

    const customerName =
        String(
            invoice
                ?.mst_business_partner
                ?.bp_name
            ||
            "-"
        )
        .trim();


    /*
    ==================================================
    INVOICE NO
    ==================================================
    */

    const invoiceNo =
        String(
            invoice?.invoice_no
            ||
            "-"
        )
        .trim();


    /*
    ==================================================
    TOTAL PAID
    ==================================================
    */

    const totalPaid =
        activePayments.reduce(
            (
                total,
                payment
            ) => {

                const amount =
                    Number(
                        payment?.amount
                        ||
                        0
                    );


                return (
                    total
                    +
                    (
                        Number.isFinite(amount)
                            ? amount
                            : 0
                    )
                );

            },
            0
        );


    /*
    ==================================================
    BUILD PAYMENT ROWS
    ==================================================
    */

    const rows =
        activePayments
            .map(
                (
                    payment,
                    index
                ) => {

                    /*
                    ======================================
                    PAYMENT AMOUNT
                    ======================================
                    */

                    const paymentAmount =
                        Number(
                            payment?.amount
                            ||
                            0
                        );


                    /*
                    ======================================
                    PAYMENT DATE
                    ======================================
                    */

                    const paymentDate =
                        payment?.payment_date
                        ||
                        "-";


                    /*
                    ======================================
                    PAYMENT ACCOUNT
                    ======================================
                    */

                    const paymentAccount =
                        payment
                            ?.payment_account
                        ||
                        null;


                    const accountCode =
                        String(
                            paymentAccount
                                ?.account_code
                            ||
                            ""
                        )
                        .trim();


                    const accountName =
                        String(
                            paymentAccount
                                ?.account_name
                            ||
                            ""
                        )
                        .trim();


                    let accountDisplay =
                        "-";


                    if (
                        accountCode
                        &&
                        accountName
                    ) {

                        accountDisplay =
                            `${accountCode} - ${accountName}`;

                    }

                    else if (accountName) {

                        accountDisplay =
                            accountName;

                    }

                    else if (accountCode) {

                        accountDisplay =
                            accountCode;

                    }


                    /*
                    ======================================
                    DESCRIPTION
                    ======================================
                    */

                    const paymentDescription =
                        String(
                            payment?.description
                            ||
                            "-"
                        )
                        .trim();


                    /*
                    ======================================
                    JOURNAL
                    ======================================
                    */

                    const journal =
                        payment
                            ?.trx_gl_journal
                        ||
                        null;


                    const journalNo =
                        String(
                            journal?.journal_no
                            ||
                            "-"
                        )
                        .trim();


                    const journalStatus =
                        String(
                            journal?.status
                            ||
                            ""
                        )
                        .trim();


                    /*
                    ======================================
                    JOURNAL STATUS BADGE
                    ======================================
                    */

                    let journalStatusBadge =
                        "";


                    if (journalStatus) {

                        let badgeClass =
                            "bg-secondary";


                        if (
                            journalStatus.toLowerCase()
                            ===
                            "posted"
                        ) {

                            badgeClass =
                                "bg-success";

                        }

                        else if (
                            journalStatus.toLowerCase()
                            ===
                            "draft"
                        ) {

                            badgeClass =
                                "bg-warning text-dark";

                        }

                        else if (
                            journalStatus.toLowerCase()
                            ===
                            "void"
                        ) {

                            badgeClass =
                                "bg-danger";

                        }


                        journalStatusBadge = `

                            <span
                                class="
                                    badge
                                    ${badgeClass}
                                    ar-payment-journal-status
                                "
                            >

                                ${journalStatus}

                            </span>

                        `;

                    }


                    /*
                    ======================================
                    RETURN PAYMENT ROW
                    ======================================
                    */

                    return `

                        <!-- ==============================
                             PAYMENT MAIN ROW
                        =============================== -->

                        <tr
                            class="
                                ar-payment-main-row
                            "
                        >

                            <!-- NO -->

                            <td
                                class="
                                    text-center
                                    align-middle
                                "
                            >

                                ${index + 1}

                            </td>


                            <!-- PAYMENT DATE -->

                            <td
                                class="
                                    text-center
                                    align-middle
                                "
                            >

                                ${paymentDate}

                            </td>


                            <!-- BANK / PAYMENT ACCOUNT -->

                            <td
                                class="
                                    align-middle
                                    ar-payment-account-cell
                                "
                            >

                                <div
                                    class="
                                        ar-payment-account
                                    "
                                >

                                    ${accountDisplay}

                                </div>

                            </td>


                            <!-- AMOUNT -->

                            <td
                                class="
                                    text-end
                                    align-middle
                                    ar-payment-amount-cell
                                "
                            >

                                ${
                                    this.formatCurrency(
                                        paymentAmount
                                    )
                                }

                            </td>


                            <!-- JOURNAL -->

                            <td
                                class="
                                    text-center
                                    align-middle
                                    ar-payment-journal-cell
                                "
                            >

                                <div
                                    class="
                                        ar-payment-journal-wrap
                                    "
                                >

                                    <div
                                        class="
                                            ar-payment-journal-no
                                        "
                                    >

                                        ${journalNo}

                                    </div>


                                    ${journalStatusBadge}

                                </div>

                            </td>

                        </tr>


                        <!-- ==============================
                             DESCRIPTION
                        =============================== -->

                        <tr
                            class="
                                ar-payment-description-row
                            "
                        >

                            <!-- EMPTY NO COLUMN -->

                            <td
                                class="
                                    ar-payment-description-empty
                                "
                            >
                            </td>


                            <!-- DESCRIPTION -->

                            <td
                                colspan="4"
                                class="
                                    ar-payment-description-cell
                                "
                            >

                                <div
                                    class="
                                        ar-payment-description-wrap
                                    "
                                >

                                    <span
                                        class="
                                            ar-payment-description-label
                                        "
                                    >

                                        Description

                                    </span>


                                    <span
                                        class="
                                            ar-payment-description-separator
                                        "
                                    >

                                        :

                                    </span>


                                    <span
                                        class="
                                            ar-payment-description-value
                                        "
                                    >

                                        ${paymentDescription}

                                    </span>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    /*
    ==================================================
    MODAL HTML
    ==================================================
    */

    const modalHTML = `

        <div
            class="
                modal
                fade
            "
            id="arPaymentHistoryModal"
            tabindex="-1"
            aria-hidden="true"
        >

            <div
                class="
                    modal-dialog
                    modal-xl
                    modal-dialog-centered
                    modal-dialog-scrollable
                "
            >

                <div
                    class="
                        modal-content
                    "
                >


                    <!-- ==============================
                         HEADER
                    =============================== -->

                    <div
                        class="
                            modal-header
                        "
                    >

                        <div
                            class="
                                ar-payment-history-heading
                            "
                        >

                            <h5
                                class="
                                    modal-title
                                "
                            >

                                <i
                                    class="
                                        fa-solid
                                        fa-money-bill-transfer
                                        me-2
                                    "
                                >
                                </i>

                                View Payment

                            </h5>


                            <div
                                class="
                                    small
                                    text-muted
                                    mt-1
                                "
                            >

                                Account Receivable Payment History

                            </div>

                        </div>


                        <button
                            type="button"
                            class="
                                btn-close
                            "
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        >
                        </button>

                    </div>


                    <!-- ==============================
                         BODY
                    =============================== -->

                    <div
                        class="
                            modal-body
                        "
                    >


                        <!-- ==========================
                             HEADER INFORMATION
                        =========================== -->

                        <div
                            class="
                                row
                                g-3
                                mb-4
                                ar-payment-history-info
                            "
                        >


                            <!-- INVOICE NO -->

                            <div
                                class="
                                    col-md-4
                                "
                            >

                                <label
                                    class="
                                        form-label
                                    "
                                >

                                    Invoice No

                                </label>


                                <input
                                    type="text"
                                    class="
                                        form-control
                                    "
                                    value="${invoiceNo}"
                                    readonly
                                >

                            </div>


                            <!-- CUSTOMER -->

                            <div
                                class="
                                    col-md-5
                                "
                            >

                                <label
                                    class="
                                        form-label
                                    "
                                >

                                    Customer

                                </label>


                                <input
                                    type="text"
                                    class="
                                        form-control
                                    "
                                    value="${customerName}"
                                    readonly
                                >

                            </div>


                            <!-- TOTAL PAID -->

                            <div
                                class="
                                    col-md-3
                                "
                            >

                                <label
                                    class="
                                        form-label
                                    "
                                >

                                    Total Paid

                                </label>


                                <input
                                    type="text"
                                    class="
                                        form-control
                                        text-end
                                        fw-semibold
                                    "
                                    value="${
                                        this.formatCurrency(
                                            totalPaid
                                        )
                                    }"
                                    readonly
                                >

                            </div>

                        </div>


                        <!-- ==========================
                             PAYMENT TABLE
                        =========================== -->

                        <div
                            class="
                                table-responsive
                                ar-payment-history-table-wrapper
                            "
                        >

                            <table
                                class="
                                    table
                                    table-bordered
                                    table-hover
                                    align-middle
                                    mb-0
                                    ar-payment-history-table
                                "
                            >


                                <!-- ======================
                                     FIXED COLUMN WIDTH
                                ======================= -->

                                <colgroup>

                                    <col
                                        class="
                                            ar-payment-col-no
                                        "
                                    >

                                    <col
                                        class="
                                            ar-payment-col-date
                                        "
                                    >

                                    <col
                                        class="
                                            ar-payment-col-account
                                        "
                                    >

                                    <col
                                        class="
                                            ar-payment-col-amount
                                        "
                                    >

                                    <col
                                        class="
                                            ar-payment-col-journal
                                        "
                                    >

                                </colgroup>


                                <!-- ======================
                                     HEADER
                                ======================= -->

                                <thead>

                                    <tr>

                                        <th
                                            class="
                                                text-center
                                            "
                                        >

                                            No

                                        </th>


                                        <th
                                            class="
                                                text-center
                                            "
                                        >

                                            Payment Date

                                        </th>


                                        <th>

                                            Bank / Payment Account

                                        </th>


                                        <th
                                            class="
                                                text-end
                                            "
                                        >

                                            Amount

                                        </th>


                                        <th
                                            class="
                                                text-center
                                            "
                                        >

                                            Journal

                                        </th>

                                    </tr>

                                </thead>


                                <!-- ======================
                                     BODY
                                ======================= -->

                                <tbody>

                                    ${rows}

                                </tbody>


                                <!-- ======================
                                     FOOTER
                                ======================= -->

                                <tfoot>

                                    <tr>

                                        <th
                                            colspan="3"
                                            class="
                                                text-end
                                            "
                                        >

                                            Total Paid

                                        </th>


                                        <th
                                            class="
                                                text-end
                                                fw-semibold
                                            "
                                        >

                                            ${
                                                this.formatCurrency(
                                                    totalPaid
                                                )
                                            }

                                        </th>


                                        <th>
                                        </th>

                                    </tr>

                                </tfoot>

                            </table>

                        </div>

                    </div>


                    <!-- ==============================
                         FOOTER
                    =============================== -->

                    <div
                        class="
                            modal-footer
                        "
                    >

                        <div
                            class="
                                me-auto
                                text-muted
                                small
                            "
                        >

                            ${
                                activePayments.length
                            }

                            payment transaction${
                                activePayments.length > 1
                                    ? "s"
                                    : ""
                            }

                        </div>


                        <button
                            type="button"
                            class="
                                btn
                                btn-secondary
                            "
                            data-bs-dismiss="modal"
                        >

                            Close

                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;


    /*
    ==================================================
    APPEND MODAL
    ==================================================
    */

    document.body.insertAdjacentHTML(
        "beforeend",
        modalHTML
    );


    /*
    ==================================================
    GET MODAL
    ==================================================
    */

    const modalElement =
        document.getElementById(
            "arPaymentHistoryModal"
        );


    if (!modalElement) {

        this.showError(
            "AR Payment History Modal could not be created."
        );

        return;

    }


    /*
    ==================================================
    CREATE BOOTSTRAP MODAL
    ==================================================
    */

    const modal =
        bootstrap.Modal
            .getOrCreateInstance(
                modalElement
            );


    /*
    ==================================================
    SHOW MODAL
    ==================================================
    */

    modal.show();


    /*
    ==================================================
    CLEAN AFTER CLOSE
    ==================================================
    */

    modalElement.addEventListener(
        "hidden.bs.modal",
        () => {

            modal.dispose();

            modalElement.remove();

        },
        {
            once: true
        }
    );

}
/*
======================================================
GET PAYMENT STATUS
ACCOUNT RECEIVABLE
SAME AS ACCOUNT PAYABLE
======================================================
*/

getPaymentStatus(
    invoice
) {

    const totalAmount =
        Number(
            invoice?.total_amount
            || 0
        );


    const outstandingAmount =
        Number(
            invoice?.outstanding_amount
            ?? totalAmount
        );


    if (
        totalAmount <= 0
    ) {

        return "Unpaid";

    }


    if (
        outstandingAmount < 0
    ) {

        return "Less Paid";

    }


    if (
        outstandingAmount === 0
    ) {

        return "Paid";

    }


    if (
        outstandingAmount >= totalAmount
    ) {

        return "Unpaid";

    }


    return "Partial Paid";

}
/*
======================================================
RENDER VIEW PAYMENT
ACCOUNT RECEIVABLE

SAME LOGIC AS ACCOUNT PAYABLE

RULE :
- DRAFT       = HIDE
- VOID        = HIDE
- PAID = 0    = HIDE
- PAID > 0    = SHOW VIEW PAYMENT
======================================================
*/

renderViewPayment(
    invoice
) {

    /*
    ==================================================
    VALIDATION
    ==================================================
    */

    if (
        !invoice
    ) {

        return "";

    }


    /*
    ==================================================
    AR ID
    ==================================================
    */

    const id =
        invoice?.id;


    if (
        !id
    ) {

        return "";

    }


    /*
    ==================================================
    TECHNICAL STATUS
    ==================================================
    */

    const technicalStatus =
        String(
            invoice?.status
            ||
            "Draft"
        )
        .trim();


    /*
    ==================================================
    DRAFT
    ==================================================
    */

    if (
        technicalStatus ===
        "Draft"
    ) {

        return "";

    }


    /*
    ==================================================
    VOID
    ==================================================
    */

    if (
        technicalStatus ===
        "Void"
    ) {

        return "";

    }


    /*
    ==================================================
    PAID AMOUNT
    ==================================================
    */

    const paidAmount =
        Number(
            invoice?.paid_amount
            ||
            0
        );


    /*
    ==================================================
    NO PAYMENT
    ==================================================
    */

    if (
        !Number.isFinite(
            paidAmount
        )
        ||
        paidAmount <= 0
    ) {

        return "";

    }


    /*
    ==================================================
    VIEW PAYMENT BUTTON
    ==================================================
    */

    return `

        <button
            type="button"
            class="
                btn
                btn-link
                p-0
                ar-view-payment
            "
            data-action="view-payment"
            data-id="${id}"
            title="View Payment"
        >

            <i
                class="
                    fa-regular
                    fa-eye
                    me-1
                "
            >
            </i>

            View Payment

        </button>

    `;

}
/*
======================================================
RENDER PAYMENT STATUS
ACCOUNT RECEIVABLE
SAME AS ACCOUNT PAYABLE
======================================================
*/

renderStatus(
    status
) {

    const normalizedStatus =
        String(
            status
            || "Unpaid"
        )
        .trim()
        .toLowerCase();


    switch (
        normalizedStatus
    ) {

        case "unpaid":

            return `

                <span class="badge bg-danger">

                    Unpaid

                </span>

            `;


        case "partial paid":

            return `

                <span class="badge bg-warning text-dark">

                    Partial Paid

                </span>

            `;


        case "less paid":

            return `

                <span class="badge bg-info text-dark">

                    Less Paid

                </span>

            `;


        case "paid":

            return `

                <span class="badge bg-success">

                    Paid

                </span>

            `;


        default:

            return `

                <span class="badge bg-danger">

                    Unpaid

                </span>

            `;

    }

}

    /*
======================================================
STATUS BADGE
ACCOUNT RECEIVABLE
======================================================
*/

renderStatusBadge(
    status
) {

    const value =
        String(
            status
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
        value === "draft"
    ) {

        return `

            <span class="badge bg-secondary">

                Draft

            </span>

        `;

    }


    /*
    ==================================================
    UNPAID
    ==================================================
    */

    if (
        value === "unpaid"
    ) {

        return `

            <span class="badge bg-warning text-dark">

                Unpaid

            </span>

        `;

    }


    /*
    ==================================================
    PARTIAL PAID
    ==================================================
    */

    if (
        value === "partial paid"
        ||
        value === "partial_paid"
        ||
        value === "partial"
    ) {

        return `

            <span class="badge bg-info text-dark">

                Partial Paid

            </span>

        `;

    }


    /*
    ==================================================
    PAID
    ==================================================
    */

    if (
        value === "paid"
    ) {

        return `

            <span class="badge bg-success">

                Paid

            </span>

        `;

    }


    /*
    ==================================================
    VOID
    ==================================================
    */

    if (
        value === "void"
    ) {

        return `

            <span class="badge bg-danger">

                Void

            </span>

        `;

    }


    /*
    ==================================================
    FALLBACK
    ==================================================
    */

    return `

        <span class="badge bg-light text-dark">

            ${status || "-"}

        </span>

    `;

}


 /*
======================================================
RENDER ACTION BUTTONS
ACCOUNT RECEIVABLE

SAME LOGIC AS ACCOUNT PAYABLE

RULE :

NOT COMPLETED
- gl_journal_id = null
- Edit
- Delete
- Complete

COMPLETED + JOURNAL NOT POSTED
- gl_journal_id exists
- View
- Print
- Payment NOT SHOWN

COMPLETED + JOURNAL POSTED
- gl_journal_id exists
- View
- Print
- Payment SHOWN

PARTIAL PAID
- Original Journal must still be Posted
- Outstanding > 0
- Payment SHOWN

PAID
- View
- Print

VOID
- View
- Print
======================================================
*/

renderActionButtons(
    invoice
) {

    /*
    ==================================================
    ID
    ==================================================
    */

    const id =
        invoice?.id;


    if (
        !id
    ) {

        return "";

    }


    /*
    ==================================================
    STATUS
    ==================================================
    */

    const status =
        String(
            invoice?.status
            ||
            ""
        )
        .trim()
        .toLowerCase();


    /*
    ==================================================
    GL JOURNAL ID

    gl_journal_id EXISTS
    =
    ACCOUNT RECEIVABLE ALREADY COMPLETED
    ==================================================
    */

    const glJournalId =
        invoice?.gl_journal_id
        ||
        invoice
            ?.trx_gl_journal
            ?.id
        ||
        null;


    const hasJournal =
        Boolean(
            glJournalId
        );


    /*
    ==================================================
    GL JOURNAL STATUS
    ==================================================
    */

    const journalStatus =
        String(
            invoice
                ?.trx_gl_journal
                ?.status
            ||
            ""
        )
        .trim()
        .toLowerCase();


    /*
    ==================================================
    JOURNAL POSTED
    ==================================================
    */

    const journalPosted =
        hasJournal
        &&
        journalStatus ===
        "posted";


    /*
    ==================================================
    AMOUNT
    ==================================================
    */

    const totalAmount =
        Number(
            invoice?.total_amount
            ||
            0
        );


    const paidAmount =
        Number(
            invoice?.paid_amount
            ||
            0
        );


    const outstandingAmount =
        Number(
            invoice?.outstanding_amount
            ??
            (
                totalAmount
                -
                paidAmount
            )
        );


    /*
    ==================================================
    PAYMENT ALLOWED

    PAYMENT ONLY APPEARS WHEN:
    - JOURNAL EXISTS
    - JOURNAL POSTED
    - OUTSTANDING > 0
    - NOT PAID
    - NOT VOID
    ==================================================
    */

    const canPayment =
        hasJournal
        &&
        journalPosted
        &&
        outstandingAmount > 0
        &&
        status !== "paid"
        &&
        status !== "void";


    /*
    ==================================================
    PAID

    VIEW
    PRINT
    ==================================================
    */

    if (
        status ===
        "paid"
    ) {

        return `

            <div
                class="
                    btn-group
                    btn-group-sm
                "
                role="group"
            >

                <!-- VIEW -->

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    title="View"
                    data-action="view"
                    data-id="${id}"
                >

                    <i
                        class="
                            fa-regular
                            fa-eye
                        "
                    >
                    </i>

                </button>


                <!-- PRINT -->

                <button
                    type="button"
                    class="btn btn-outline-dark"
                    title="Print"
                    data-action="print"
                    data-id="${id}"
                >

                    <i
                        class="
                            fa-solid
                            fa-print
                        "
                    >
                    </i>

                </button>


            </div>

        `;

    }


    /*
    ==================================================
    VOID

    VIEW
    PRINT
    ==================================================
    */

    if (
        status ===
        "void"
    ) {

        return `

            <div
                class="
                    btn-group
                    btn-group-sm
                "
                role="group"
            >

                <!-- VIEW -->

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    title="View"
                    data-action="view"
                    data-id="${id}"
                >

                    <i
                        class="
                            fa-regular
                            fa-eye
                        "
                    >
                    </i>

                </button>


                <!-- PRINT -->

                <button
                    type="button"
                    class="btn btn-outline-dark"
                    title="Print"
                    data-action="print"
                    data-id="${id}"
                >

                    <i
                        class="
                            fa-solid
                            fa-print
                        "
                    >
                    </i>

                </button>


            </div>

        `;

    }


    /*
    ==================================================
    NOT COMPLETED

    NO GL JOURNAL

    EDIT
    DELETE
    COMPLETE
    ==================================================
    */

    if (
        !hasJournal
    ) {

        return `

            <div
                class="
                    btn-group
                    btn-group-sm
                "
                role="group"
            >

                <!-- EDIT -->

                <button
                    type="button"
                    class="btn btn-outline-primary"
                    title="Edit"
                    data-action="edit"
                    data-id="${id}"
                >

                    <i
                        class="
                            fa-solid
                            fa-pen
                        "
                    >
                    </i>

                </button>


                <!-- DELETE -->

                <button
                    type="button"
                    class="btn btn-outline-danger"
                    title="Delete"
                    data-action="delete"
                    data-id="${id}"
                >

                    <i
                        class="
                            fa-solid
                            fa-trash
                        "
                    >
                    </i>

                </button>


                <!-- COMPLETE -->

                <button
                    type="button"
                    class="btn btn-outline-success"
                    title="Complete"
                    data-action="complete"
                    data-id="${id}"
                >

                    <i
                        class="
                            fa-solid
                            fa-check
                        "
                    >
                    </i>

                </button>


            </div>

        `;

    }


    /*
    ==================================================
    COMPLETED

    JOURNAL EXISTS

    VIEW
    PRINT
    PAYMENT ONLY IF POSTED
    ==================================================
    */

    return `

        <div
            class="
                btn-group
                btn-group-sm
            "
            role="group"
        >

            <!-- VIEW -->

            <button
                type="button"
                class="btn btn-outline-secondary"
                title="View"
                data-action="view"
                data-id="${id}"
            >

                <i
                    class="
                        fa-regular
                        fa-eye
                    "
                >
                </i>

            </button>


            <!-- PRINT -->

            <button
                type="button"
                class="btn btn-outline-dark"
                title="Print"
                data-action="print"
                data-id="${id}"
            >

                <i
                    class="
                        fa-solid
                        fa-print
                    "
                >
                </i>

            </button>


            <!-- RECEIVE PAYMENT -->

            ${
                canPayment

                    ? `

                        <button
                            type="button"
                            class="btn btn-outline-success"
                            title="Receive Payment"
                            data-action="payment"
                            data-id="${id}"
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-money-bill-transfer
                                "
                            >
                            </i>

                        </button>

                    `

                    : ""
            }


        </div>

    `;

}
    /*
======================================================
ADD AR
ALWAYS OPEN HEADER INFO TAB
======================================================
*/

async addInvoice() {

    try {

        /*
        ==============================================
        RESET STATE
        ==============================================
        */

        this.currentInvoiceId =
            null;


        this.currentDetailId =
            null;


        this.currentMode =
            "add";


        this.invoiceDetails =
            [];


        /*
        ==============================================
        RESET FORM
        ==============================================
        */

        this.resetForm();


        /*
        ==============================================
        LOAD MASTER DATA
        ==============================================
        */

        await this.loadDetailCOA();

        await this.loadTaxMaster();


        /*
        ==============================================
        DEFAULT STATUS
        ==============================================
        */

        if (
            this.arFormStatus
        ) {

            this.arFormStatus.value =
                "Draft";

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
        RESET TAB TO HEADER INFO

        IMPORTANT:
        PREVENT PREVIOUS TAB HISTORY
        ==============================================
        */

        const headerInfoTab =
            document.getElementById(
                "ar-header-info-tab"
            );


        if (
            headerInfoTab
        ) {

            const tabInstance =
                bootstrap.Tab
                    .getOrCreateInstance(
                        headerInfoTab
                    );


            tabInstance.show();

        }


        /*
        ==============================================
        RESET MODAL BODY SCROLL
        ==============================================
        */

        const modalBody =
            this.accountReceivableModal
                ?.querySelector(
                    ".modal-body"
                );


        if (
            modalBody
        ) {

            modalBody.scrollTop =
                0;

        }


        /*
        ==============================================
        SHOW MODAL
        ==============================================
        */

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
ACCOUNT RECEIVABLE
======================================================
*/

calculateDetail() {

    try {

        /*
        ==================================================
        QUANTITY
        ==================================================
        */

        const quantity =
            Number(
                this.arDetailQuantity?.value
                || 0
            );


        /*
        ==================================================
        UNIT PRICE
        ==================================================
        */

        const unitPrice =
            this.parseNumber(
                this.arDetailUnitPrice?.value
            );


        /*
        ==================================================
        TAX (+)
        ==================================================
        */

        const taxPlusOption =
            this.arDetailTaxOutputRate
                ?.selectedOptions
                ?.[0];


        const taxOutputRate =
            Number(
                taxPlusOption
                    ?.dataset
                    ?.rate
                || 0
            );


        /*
        ==================================================
        TAX (-)
        ==================================================
        */

        const taxMinusOption =
            this.arDetailWithholdingTaxRate
                ?.selectedOptions
                ?.[0];


        const withholdingTaxRate =
            Number(
                taxMinusOption
                    ?.dataset
                    ?.rate
                || 0
            );


        /*
        ==================================================
        CALCULATE
        ==================================================
        */

        const calculated =
            this.service
                .calculateDetailAmount({

                    quantity:
                        quantity,

                    unit_price:
                        unitPrice,

                    tax_output_rate:
                        taxOutputRate,

                    withholding_tax_rate:
                        withholdingTaxRate

                });


        /*
        ==================================================
        LINE AMOUNT
        ==================================================
        */

        if (
            this.arDetailLineAmount
        ) {

            this.arDetailLineAmount
                .textContent =
                    this.formatCurrency(
                        calculated.line_amount
                        || 0
                    );

        }


        /*
        ==================================================
        TAX (+)
        ==================================================
        */

        if (
            this.arDetailTaxOutputAmount
        ) {

            this.arDetailTaxOutputAmount
                .textContent =
                    this.formatCurrency(
                        calculated.tax_output_amount
                        || 0
                    );

        }


        /*
        ==================================================
        TAX (-)
        ==================================================
        */

        if (
            this.arDetailWithholdingTaxAmount
        ) {

            this.arDetailWithholdingTaxAmount
                .textContent =
                    this.formatCurrency(
                        calculated.withholding_tax_amount
                        || 0
                    );

        }


        /*
        ==================================================
        TOTAL AMOUNT
        ==================================================
        */

        if (
            this.arDetailTotalAmount
        ) {

            this.arDetailTotalAmount
                .textContent =
                    this.formatCurrency(
                        calculated.total_amount
                        || 0
                    );

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR DETAIL CALCULATION:",
            {

                quantity:
                    quantity,

                unit_price:
                    unitPrice,

                tax_output_rate:
                    taxOutputRate,

                withholding_tax_rate:
                    withholdingTaxRate,

                line_amount:
                    calculated.line_amount,

                tax_output_amount:
                    calculated.tax_output_amount,

                withholding_tax_amount:
                    calculated.withholding_tax_amount,

                total_amount:
                    calculated.total_amount

            }
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return calculated;

    }

    catch (error) {

        console.error(
            "AccountReceivable.calculateDetail:",
            error
        );


        return {

            line_amount:
                0,

            tax_output_amount:
                0,

            withholding_tax_amount:
                0,

            total_amount:
                0

        };

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

    const tableBody =
        document.getElementById(
            "ar-detail-body"
        );


    /*
    ==================================================
    VALIDATION
    ==================================================
    */

    if (!tableBody) {

        console.warn(
            "AR detail body not found."
        );

        return;

    }


    /*
    ==================================================
    VIEW MODE
    ==================================================
    */

    const isViewMode =
        this.currentMode ===
        "view";


    /*
    ==================================================
    EMPTY DETAIL
    ==================================================
    */

    if (
        !Array.isArray(
            this.invoiceDetails
        )
        ||
        !this.invoiceDetails.length
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="
                        text-center
                        text-muted
                        py-4
                    ">

                    No detail added.

                </td>

            </tr>

        `;


        this.updateInvoiceSummary();


        return;

    }


    /*
    ==================================================
    RENDER DETAIL
    ==================================================
    */

    tableBody.innerHTML =
        this.invoiceDetails
            .map(
                (
                    detail,
                    index
                ) => {

                    return `

                        <tr>

                            <!-- ==================================
                                 NO
                            =================================== -->

                            <td
                                class="
                                    text-center
                                    align-top
                                ">

                                ${index + 1}

                            </td>


                            <!-- ==================================
                                 ACCOUNT
                            =================================== -->

                            <td
                                class="
                                    align-top
                                    ar-detail-account-cell
                                ">

                                <div class="fw-semibold">

                                    ${
                                        detail.account_code
                                        || "-"
                                    }

                                </div>


                                <div
                                    class="
                                        small
                                        text-muted
                                        mt-1
                                    ">

                                    ${
                                        detail.account_name
                                        || "-"
                                    }

                                </div>

                            </td>


                            <!-- ==================================
                                 DESCRIPTION
                            =================================== -->

                            <td
                                class="
                                    align-top
                                    ar-detail-description-cell
                                ">

                                ${
                                    detail.description
                                    || "-"
                                }

                            </td>


                            <!-- ==================================
                                 QUANTITY
                            =================================== -->

                            <td
                                class="
                                    text-end
                                    align-top
                                ">

                                ${
                                    Number(
                                        detail.quantity
                                        || 0
                                    )
                                    .toLocaleString(
                                        "id-ID"
                                    )
                                }

                            </td>


                            <!-- ==================================
                                 UNIT PRICE
                            =================================== -->

                            <td
                                class="
                                    text-end
                                    align-top
                                ">

                                ${
                                    this.formatCurrency(
                                        Number(
                                            detail.unit_price
                                            || 0
                                        )
                                    )
                                }

                            </td>


                            <!-- ==================================
                                 AMOUNT
                            =================================== -->

                            <td
                                class="
                                    text-end
                                    fw-semibold
                                    align-top
                                ">

                                ${
                                    this.formatCurrency(
                                        Number(
                                            detail.total_amount
                                            || 0
                                        )
                                    )
                                }

                            </td>


                            <!-- ==================================
                                 ACTION
                            =================================== -->

                            <td
                                class="
                                    text-center
                                    align-top
                                ">

                                ${
                                    isViewMode

                                        ? `

                                            <span
                                                class="
                                                    text-muted
                                                    small
                                                ">

                                                -

                                            </span>

                                        `

                                        : `

                                            <div
                                                class="
                                                    btn-group
                                                    btn-group-sm
                                                "
                                                role="group">

                                                <button
                                                    type="button"
                                                    class="
                                                        btn
                                                        btn-outline-primary
                                                    "
                                                    data-detail-action="edit"
                                                    data-detail-id="${detail.id}"
                                                    title="Edit Detail">

                                                    <i
                                                        class="
                                                            fa-solid
                                                            fa-pen
                                                        ">
                                                    </i>

                                                </button>


                                                <button
                                                    type="button"
                                                    class="
                                                        btn
                                                        btn-outline-danger
                                                    "
                                                    data-detail-action="delete"
                                                    data-detail-id="${detail.id}"
                                                    title="Remove Detail">

                                                    <i
                                                        class="
                                                            fa-solid
                                                            fa-trash
                                                        ">
                                                    </i>

                                                </button>

                                            </div>

                                        `
                                }

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    /*
    ==================================================
    UPDATE SUMMARY
    ==================================================
    */

    this.updateInvoiceSummary();

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
ACCOUNT RECEIVABLE
BOOTSTRAP ALERT
======================================================
*/

async saveDraft() {

    try {

        /*
        ==================================================
        VALIDATE CUSTOMER
        ==================================================
        */

        if (
            !this.arFormCustomer?.value
        ) {

            return this.showError(
                "Customer is required."
            );

        }


        /*
        ==================================================
        VALIDATE INVOICE NO
        ==================================================
        */

        if (
            !this.arFormInvoiceNo
                ?.value
                ?.trim()
        ) {

            return this.showError(
                "Invoice No is required."
            );

        }


        /*
        ==================================================
        VALIDATE INVOICE DATE
        ==================================================
        */

        if (
            !this.arFormInvoiceDate?.value
        ) {

            return this.showError(
                "Invoice Date is required."
            );

        }


        /*
        ==================================================
        VALIDATE DUE DATE
        ==================================================
        */

        if (
            !this.arFormDueDate?.value
        ) {

            return this.showError(
                "Due Date is required."
            );

        }


        /*
        ==================================================
        VALIDATE DETAIL
        ==================================================
        */

        if (
            !this.invoiceDetails.length
        ) {

            return this.showError(
                "Please add at least one invoice detail."
            );

        }


        /*
        ==================================================
        HEADER
        ==================================================
        */

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

            due_date:
                this.arFormDueDate.value,

            description:
                this.arFormDescription
                    ?.value
                    ?.trim()
                || null

        };


        /*
        ==================================================
        DETAILS
        ==================================================
        */

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


        /*
        ==================================================
        CREATE ACCOUNT RECEIVABLE
        ==================================================
        */

        await this.service.create(
            header,
            details
        );


        /*
        ==================================================
        CLOSE MODAL
        ==================================================
        */

        bootstrap.Modal
            .getInstance(
                this.accountReceivableModal
            )
            ?.hide();


        /*
        ==================================================
        RESET FORM
        ==================================================
        */

        this.resetForm();


        /*
        ==================================================
        RELOAD DATA
        NO LOADING
        ==================================================
        */

        await this.loadData(
            false
        );


        /*
        ==================================================
        SUCCESS
        BOOTSTRAP ALERT
        ==================================================
        */

        this.showSuccess(
            "Account Receivable saved as Draft."
        );

    }

    catch (
        error
    ) {

        console.error(
            "AccountReceivable.saveDraft:",
            error
        );


        /*
        ==================================================
        ERROR
        BOOTSTRAP ALERT
        ==================================================
        */

        this.showError(
            error?.message
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

        /*
        ==================================================
        GET DATA
        ==================================================
        */

        const result =
            await this.service.getById(
                id
            );


        const header =
            result?.header;


        const details =
            Array.isArray(
                result?.details
            )
                ? result.details
                : [];


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!header) {

            throw new Error(
                "Account Receivable data not found."
            );

        }


        /*
        ==================================================
        STATE
        ==================================================
        */

        this.currentInvoiceId =
            id;


        this.currentMode =
            "edit";


        /*
        ==================================================
        RESTORE EDIT MODE
        ==================================================
        */

        const editableFields = [

            this.arFormCustomer,

            this.arFormPoNo,

            this.arFormInvoiceNo,

            this.arFormInvoiceDate,

           
            this.arFormDueDate,

            this.arFormDescription,

            this.arFormStatus

        ];


        editableFields.forEach(
            field => {

                if (field) {

                    field.disabled =
                        false;

                }

            }
        );


        /*
        ==================================================
        SHOW ADD DETAIL
        ==================================================
        */

        if (
            this.btnAddDetail
        ) {

            this.btnAddDetail
                .classList
                .remove(
                    "d-none"
                );


            this.btnAddDetail.disabled =
                false;

        }


        /*
        ==================================================
        SHOW SAVE BUTTON
        ==================================================
        */

        if (
            this.btnSaveDraft
        ) {

            this.btnSaveDraft
                .classList
                .remove(
                    "d-none"
                );


            this.btnSaveDraft.disabled =
                false;

        }


        /*
        ==================================================
        CUSTOMER
        ==================================================
        */

        if (
            this.arFormCustomer
        ) {

            this.arFormCustomer.value =
                String(
                    header.customer_id
                    || ""
                );

        }


        /*
        ==================================================
        PO NO
        ==================================================
        */

        if (
            this.arFormPoNo
        ) {

            this.arFormPoNo.value =
                header.po_no
                || "";

        }


        /*
        ==================================================
        INVOICE NO
        ==================================================
        */

        if (
            this.arFormInvoiceNo
        ) {

            this.arFormInvoiceNo.value =
                header.invoice_no
                || "";

        }


        /*
        ==================================================
        INVOICE DATE
        ==================================================
        */

        if (
            this.arFormInvoiceDate
        ) {

            this.arFormInvoiceDate.value =
                header.invoice_date
                || "";

        }


        


        /*
        ==================================================
        TERM OF PAYMENT
        ==================================================
        */

        if (
            this.arFormTop
        ) {

            this.arFormTop.value =

                header.term_of_payment
                    ?.top_name

                ||

                header.top
                    ?.top_name

                ||

                header.mst_term_of_payment
                    ?.top_name

                ||

                "";

        }


        /*
        ==================================================
        DUE DATE
        ==================================================
        */

        if (
            this.arFormDueDate
        ) {

            this.arFormDueDate.value =
                header.due_date
                || "";

        }


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        if (
            this.arFormDescription
        ) {

            this.arFormDescription.value =
                header.description
                || "";

        }


        /*
        ==================================================
        JOURNAL NO
        ==================================================
        */

        if (
            this.arFormJournalNo
        ) {

            this.arFormJournalNo.value =

                header.gl_journal
                    ?.journal_no

                ||

                header.journal
                    ?.journal_no

                ||

                header.journal_no

                ||

                "";

        }


        /*
        ==================================================
        STATUS
        ==================================================
        */

        if (
            this.arFormStatus
        ) {

            this.arFormStatus.value =
                header.status
                || "Draft";

        }


        /*
        ==================================================
        DETAIL DATA
        ==================================================
        */

        this.invoiceDetails =
            details.map(
                item => {

                    /*
                    ==========================================
                    REVENUE ACCOUNT ID
                    ==========================================
                    */

                    const revenueAccountId =
                        Number(
                            item.revenue_account_id
                            || 0
                        );


                    /*
                    ==========================================
                    FIND REVENUE ACCOUNT

                    FIRST:
                    use currentCOA

                    FALLBACK:
                    use joined revenue_account
                    ==========================================
                    */

                    const revenueAccount =
                        Array.isArray(
                            this.currentCOA
                        )

                            ? this.currentCOA.find(
                                account =>
                                    Number(
                                        account.id
                                    )
                                    ===
                                    revenueAccountId
                            )

                            : null;


                    /*
                    ==========================================
                    ACCOUNT CODE
                    ==========================================
                    */

                    const accountCode =

                        revenueAccount
                            ?.account_code

                        ||

                        item.revenue_account
                            ?.account_code

                        ||

                        item.account_code

                        ||

                        "";


                    /*
                    ==========================================
                    ACCOUNT NAME
                    ==========================================
                    */

                    const accountName =

                        revenueAccount
                            ?.account_name

                        ||

                        item.revenue_account
                            ?.account_name

                        ||

                        item.account_name

                        ||

                        "";


                    /*
                    ==========================================
                    RETURN DETAIL
                    ==========================================
                    */

                    return {

                        /*
                        ======================================
                        ID
                        ======================================
                        */

                        id:
                            item.id,


                        /*
                        ======================================
                        REVENUE ACCOUNT
                        ======================================
                        */

                        revenue_account_id:
                            revenueAccountId,


                        account_code:
                            accountCode,


                        account_name:
                            accountName,


                        /*
                        ======================================
                        DESCRIPTION
                        ======================================
                        */

                        description:
                            item.description
                            || "",


                        /*
                        ======================================
                        QUANTITY
                        ======================================
                        */

                        quantity:
                            Number(
                                item.quantity
                                || 0
                            ),


                        /*
                        ======================================
                        UNIT PRICE
                        ======================================
                        */

                        unit_price:
                            Number(
                                item.unit_price
                                || 0
                            ),


                        /*
                        ======================================
                        LINE AMOUNT
                        ======================================
                        */

                        line_amount:
                            Number(
                                item.line_amount
                                || 0
                            ),


                        /*
                        ======================================
                        TAX (+)
                        ======================================
                        */

                        tax_plus_id:
                            item.tax_plus_id
                            || null,


                        tax_plus_account_id:
                            item.tax_plus_account_id
                            || null,


                        tax_plus_name:

                            item.tax_plus
                                ?.tax_name

                            ||

                            item.tax_plus_name

                            ||

                            null,


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


                        /*
                        ======================================
                        TAX (-)
                        ======================================
                        */

                        tax_minus_id:
                            item.tax_minus_id
                            || null,


                        tax_minus_account_id:
                            item.tax_minus_account_id
                            || null,


                        tax_minus_name:

                            item.tax_minus
                                ?.tax_name

                            ||

                            item.tax_minus_name

                            ||

                            null,


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


                        /*
                        ======================================
                        TOTAL AMOUNT
                        ======================================
                        */

                        total_amount:
                            Number(
                                item.total_amount
                                || 0
                            )

                    };

                }
            );


        /*
        ==================================================
        DEBUG DETAIL
        ==================================================
        */

        console.log(
            "AR EDIT DETAILS:",
            this.invoiceDetails
        );


        /*
        ==================================================
        RENDER INVOICE DETAIL
        ==================================================
        */

        this.renderInvoiceDetails();


        /*
        ==================================================
        RENDER TAX (+)
        ==================================================
        */

        this.renderTaxPlus();


        /*
        ==================================================
        RENDER TAX (-)
        ==================================================
        */

        this.renderTaxMinus();


        /*
        ==================================================
        UPDATE SUMMARY
        ==================================================
        */

        this.updateInvoiceSummary();


        /*
        ==================================================
        MODAL TITLE
        ==================================================
        */

        const modalTitle =
            document.getElementById(
                "accountReceivableModalLabel"
            );


        if (
            modalTitle
        ) {

            modalTitle.innerHTML = `

                <i class="fa-solid fa-file-invoice-dollar me-2"></i>

                Edit Account Receivable

            `;

        }


        /*
        ==================================================
        SHOW MODAL
        ==================================================
        */

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
            error?.message
            ||
            "Failed to load Account Receivable."
        );

    }

}


    /*
======================================================
SAVE EDIT
ACCOUNT RECEIVABLE
BOOTSTRAP ALERT
======================================================
*/

async saveEdit() {

    try {

        /*
        ==================================================
        VALIDATE ID
        ==================================================
        */

        if (
            !this.currentInvoiceId
        ) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        VALIDATE CUSTOMER
        ==================================================
        */

        if (
            !this.arFormCustomer?.value
        ) {

            return this.showError(
                "Customer is required."
            );

        }


        /*
        ==================================================
        VALIDATE INVOICE NO
        ==================================================
        */

        if (
            !this.arFormInvoiceNo
                ?.value
                ?.trim()
        ) {

            return this.showError(
                "Invoice No is required."
            );

        }


        /*
        ==================================================
        VALIDATE INVOICE DATE
        ==================================================
        */

        if (
            !this.arFormInvoiceDate?.value
        ) {

            return this.showError(
                "Invoice Date is required."
            );

        }


        /*
        ==================================================
        VALIDATE DUE DATE
        ==================================================
        */

        if (
            !this.arFormDueDate?.value
        ) {

            return this.showError(
                "Due Date is required."
            );

        }


        /*
        ==================================================
        VALIDATE DETAIL
        ==================================================
        */

        if (
            !Array.isArray(
                this.invoiceDetails
            )
            ||
            !this.invoiceDetails.length
        ) {

            return this.showError(
                "Please add at least one invoice detail."
            );

        }


        /*
        ==================================================
        HEADER
        ==================================================
        */

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

            due_date:
                this.arFormDueDate.value,

            description:
                this.arFormDescription
                    ?.value
                    ?.trim()
                || null

        };


        /*
        ==================================================
        DETAILS
        ==================================================
        */

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


        /*
        ==================================================
        UPDATE ACCOUNT RECEIVABLE
        ==================================================
        */

        await this.service.update(

            this.currentInvoiceId,

            header,

            details

        );


        /*
        ==================================================
        CLOSE MODAL
        ==================================================
        */

        bootstrap.Modal
            .getInstance(
                this.accountReceivableModal
            )
            ?.hide();


        /*
        ==================================================
        RESET STATE
        ==================================================
        */

        this.currentInvoiceId =
            null;


        this.currentMode =
            "add";


        this.currentDetailId =
            null;


        /*
        ==================================================
        RELOAD DATA
        NO LOADING
        ==================================================
        */

        await this.loadData(
            false
        );


        /*
        ==================================================
        SUCCESS
        BOOTSTRAP ALERT
        ==================================================
        */

        this.showSuccess(
            "Account Receivable updated successfully."
        );

    }

    catch (
        error
    ) {

        console.error(
            "AccountReceivable.saveEdit:",
            error
        );


        /*
        ==================================================
        ERROR
        BOOTSTRAP ALERT
        ==================================================
        */

        this.showError(
            error?.message
            ||
            "Failed to update Account Receivable."
        );

    }

}

    /*
======================================================
VIEW INVOICE
READ ONLY
======================================================
*/

async viewInvoice(id) {

    try {

        /*
        ==================================================
        LOAD INVOICE
        ==================================================
        */

        await this.editInvoice(
            id
        );


        /*
        ==================================================
        SET MODE VIEW
        ==================================================
        */

        this.currentMode =
            "view";


        /*
        ==================================================
        HEADER FIELD
        READ ONLY
        ==================================================
        */

        const fields = [

            this.arFormCustomer,

            this.arFormPoNo,

            this.arFormInvoiceNo,

            this.arFormInvoiceDate,

            

            this.arFormTop,

            this.arFormDueDate,

            this.arFormDescription,

            this.arFormStatus

        ];


        fields.forEach(
            field => {

                if (!field) {

                    return;

                }


                field.disabled =
                    true;

            }
        );


        /*
        ==================================================
        ADD DETAIL
        HIDE
        ==================================================
        */

        if (
            this.btnAddDetail
        ) {

            this.btnAddDetail.classList.add(
                "d-none"
            );

            this.btnAddDetail.disabled =
                true;

        }


        /*
        ==================================================
        SAVE BUTTON
        HIDE
        ==================================================
        */

        if (
            this.btnSaveDraft
        ) {

            this.btnSaveDraft.classList.add(
                "d-none"
            );

            this.btnSaveDraft.disabled =
                true;

        }


        /*
        ==================================================
        RE-RENDER DETAIL
        IMPORTANT:
        REMOVE EDIT / DELETE ACTION
        ==================================================
        */

        this.renderInvoiceDetails();


        /*
        ==================================================
        MODAL TITLE
        ==================================================
        */

        const modalTitle =
            document.getElementById(
                "accountReceivableModalLabel"
            );


        if (
            modalTitle
        ) {

            modalTitle.innerHTML = `

                <i class="fa-solid fa-eye me-2"></i>

                View Account Receivable

            `;

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "ACCOUNT RECEIVABLE VIEW MODE:",
            {

                id:
                    id,

                mode:
                    this.currentMode

            }
        );

    }

    catch (error) {

        console.error(
            "AccountReceivable.viewInvoice:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to view Account Receivable."
        );

    }

}


/*
======================================================
DELETE ACCOUNT RECEIVABLE
BOOTSTRAP CONFIRMATION
SAME DESIGN AS ACCOUNT PAYABLE
======================================================
*/

async deleteInvoice(
    id
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !id
        ) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        FIND ACCOUNT RECEIVABLE
        ==================================================
        */

        const data =
            Array.isArray(
                this.data
            )
                ? this.data
                : [];


        const invoice =
            data.find(
                item =>
                    String(
                        item.id
                    )
                    ===
                    String(
                        id
                    )
            );


        if (
            !invoice
        ) {

            throw new Error(
                "Account Receivable not found."
            );

        }


        /*
        ==================================================
        INVOICE INFORMATION
        ==================================================
        */

        const invoiceNo =
            invoice.invoice_no
            ||
            "-";


        const customerName =
            invoice
                ?.mst_business_partner
                ?.bp_name
            ||
            "-";


        const poNo =
            invoice.po_no
            ||
            "-";


        /*
        ==================================================
        REMOVE OLD MODAL
        ==================================================
        */

        const existingModal =
            document.getElementById(
                "arDeleteInvoiceModal"
            );


        if (
            existingModal
        ) {

            const oldInstance =
                bootstrap.Modal
                    .getInstance(
                        existingModal
                    );


            oldInstance?.dispose();


            existingModal.remove();

        }


        /*
        ==================================================
        CREATE MODAL
        SAME STRUCTURE AS AP
        ==================================================
        */

        const modalHTML = `

            <!-- ==========================================================
                 DELETE ACCOUNT RECEIVABLE CONFIRMATION
            =========================================================== -->

            <div
                class="modal fade"
                id="arDeleteInvoiceModal"
                tabindex="-1"
                aria-labelledby="arDeleteInvoiceModalLabel"
                aria-hidden="true">

                <div
                    class="modal-dialog modal-dialog-centered">

                    <div class="modal-content shadow-lg">


                        <!-- ==================================================
                             HEADER
                        =================================================== -->

                        <div class="modal-header">

                            <h5
                                class="modal-title fw-semibold"
                                id="arDeleteInvoiceModalLabel">

                                <i
                                    class="fa-solid fa-trash text-danger me-2">
                                </i>

                                Confirm Delete Account Receivable

                            </h5>


                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close">
                            </button>

                        </div>


                        <!-- ==================================================
                             BODY
                        =================================================== -->

                        <div class="modal-body">

                            <div class="text-center">


                                <!-- ==========================================
                                     DELETE ICON
                                =========================================== -->

                                <div class="mb-3">

                                    <i
                                        class="fa-solid fa-trash-can text-danger"
                                        style="font-size: 48px;">
                                    </i>

                                </div>


                                <!-- ==========================================
                                     QUESTION
                                =========================================== -->

                                <div
                                    class="mb-3"
                                    style="font-size: 16px;">

                                    Apakah Anda yakin ingin

                                    <strong>
                                        menghapus Account Receivable ini?
                                    </strong>

                                </div>


                                <!-- ==========================================
                                     INVOICE INFORMATION
                                =========================================== -->

                                <div
                                    class="table-responsive text-start mb-3">

                                    <table
                                        class="table table-sm table-bordered mb-0">

                                        <tbody>


                                            <!-- INVOICE NO -->

                                            <tr>

                                                <th
                                                    style="width: 150px;">

                                                    Invoice No

                                                </th>

                                                <td>

                                                    ${
                                                        this.escapeHtml(
                                                            invoiceNo
                                                        )
                                                    }

                                                </td>

                                            </tr>


                                            <!-- CUSTOMER -->

                                            <tr>

                                                <th>

                                                    Customer

                                                </th>

                                                <td>

                                                    ${
                                                        this.escapeHtml(
                                                            customerName
                                                        )
                                                    }

                                                </td>

                                            </tr>


                                            <!-- PO NO -->

                                            <tr>

                                                <th>

                                                    PO No

                                                </th>

                                                <td>

                                                    ${
                                                        this.escapeHtml(
                                                            poNo
                                                        )
                                                    }

                                                </td>

                                            </tr>


                                        </tbody>

                                    </table>

                                </div>


                                <!-- ==========================================
                                     WARNING
                                =========================================== -->

                                <div
                                    class="alert alert-danger text-start mb-0">

                                    <i
                                        class="fa-solid fa-triangle-exclamation me-2">
                                    </i>

                                    Account Receivable yang dihapus
                                    tidak dapat dikembalikan.

                                </div>


                            </div>

                        </div>


                        <!-- ==================================================
                             FOOTER
                        =================================================== -->

                        <div class="modal-footer">

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
                                class="btn btn-danger"
                                id="btn-confirm-ar-delete-invoice">

                                <i
                                    class="fa-solid fa-trash me-1">
                                </i>

                                Ya, Hapus

                            </button>

                        </div>


                    </div>

                </div>

            </div>

        `;


        /*
        ==================================================
        INSERT MODAL
        ==================================================
        */

        document.body.insertAdjacentHTML(
            "beforeend",
            modalHTML
        );


        /*
        ==================================================
        GET MODAL
        ==================================================
        */

        const modalElement =
            document.getElementById(
                "arDeleteInvoiceModal"
            );


        const btnConfirm =
            document.getElementById(
                "btn-confirm-ar-delete-invoice"
            );


        if (
            !modalElement
            ||
            !btnConfirm
        ) {

            throw new Error(
                "Delete confirmation modal not found."
            );

        }


        /*
        ==================================================
        CREATE BOOTSTRAP MODAL
        ==================================================
        */

        const modal =
            bootstrap.Modal
                .getOrCreateInstance(
                    modalElement
                );


        /*
        ==================================================
        CONFIRM DELETE
        ==================================================
        */

        btnConfirm.addEventListener(
            "click",
            async () => {

                /*
                ==============================================
                PREVENT DOUBLE CLICK
                ==============================================
                */

                if (
                    btnConfirm.dataset.processing
                    ===
                    "true"
                ) {

                    return;

                }


                /*
                ==============================================
                LOCK BUTTON
                ==============================================
                */

                btnConfirm.dataset.processing =
                    "true";


                btnConfirm.disabled =
                    true;


                const originalContent =
                    btnConfirm.innerHTML;


                btnConfirm.innerHTML = `

                    <span
                        class="
                            spinner-border
                            spinner-border-sm
                            me-1
                        ">
                    </span>

                    Menghapus...

                `;


                try {

                    /*
                    ==========================================
                    DELETE
                    ==========================================
                    */

                    await this.service.delete(
                        id
                    );


                    /*
                    ==========================================
                    CLOSE DELETE MODAL
                    ==========================================
                    */

                    modal.hide();


                    /*
                    ==========================================
                    RELOAD DATA
                    ==========================================
                    */

                    await this.loadData(
                        false
                    );


                    /*
                    ==========================================
                    SUCCESS BOOTSTRAP ALERT
                    ==========================================
                    */

                    this.showSuccess(
                        "Account Receivable deleted successfully."
                    );

                }

                catch (
                    error
                ) {

                    console.error(
                        "AccountReceivable.deleteInvoice:",
                        error
                    );


                    /*
                    ==========================================
                    CLOSE DELETE MODAL
                    ==========================================
                    */

                    modal.hide();


                    /*
                    ==========================================
                    ERROR BOOTSTRAP ALERT
                    ==========================================
                    */

                    this.showError(
                        error?.message
                        ||
                        "Failed to delete Account Receivable."
                    );

                }

                finally {

                    /*
                    ==========================================
                    RELEASE BUTTON
                    ==========================================
                    */

                    btnConfirm.dataset.processing =
                        "false";


                    btnConfirm.disabled =
                        false;


                    btnConfirm.innerHTML =
                        originalContent;

                }

            },
            {
                once:
                    true
            }
        );


        /*
        ==================================================
        CLEANUP MODAL
        ==================================================
        */

        modalElement.addEventListener(
            "hidden.bs.modal",
            () => {

                const instance =
                    bootstrap.Modal
                        .getInstance(
                            modalElement
                        );


                instance?.dispose();


                modalElement.remove();

            },
            {
                once:
                    true
            }
        );


        /*
        ==================================================
        SHOW MODAL
        ==================================================
        */

        modal.show();

    }

    catch (
        error
    ) {

        console.error(
            "AccountReceivable.deleteInvoice:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to delete Account Receivable."
        );

    }

}

    /*
======================================================
REFRESH ACCOUNT RECEIVABLE
WITH LOADING
======================================================
*/

async refresh() {

    try {

        /*
        ==================================================
        CLEAR DATE FROM
        ==================================================
        */

        if (
            this.dateFrom
        ) {

            this.dateFrom.value =
                "";

        }


        /*
        ==================================================
        CLEAR DATE TO
        ==================================================
        */

        if (
            this.dateTo
        ) {

            this.dateTo.value =
                "";

        }


        /*
        ==================================================
        CLEAR STATUS
        ==================================================
        */

        if (
            this.statusFilter
        ) {

            this.statusFilter.value =
                "";

        }


        /*
        ==================================================
        RESET FIND BY
        ==================================================
        */

        if (
            this.findBy
        ) {

            this.findBy.value =
                "invoice_no";

        }


        /*
        ==================================================
        CLEAR KEYWORD
        ==================================================
        */

        if (
            this.keyword
        ) {

            this.keyword.value =
                "";

        }


        /*
        ==================================================
        RESET PAGE
        ==================================================
        */

        this.currentPage =
            1;


        /*
        ==================================================
        LOAD DATA
        REFRESH = WITH LOADING
        ==================================================
        */

        await this.loadData(
            true
        );

    }

    catch (error) {

        console.error(
            "AccountReceivable.refresh:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to refresh Account Receivable."
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
INVOICE DATE CHANGE

DUE DATE
=
INVOICE DATE + TOP
==================================================
*/

this.arFormInvoiceDate?.addEventListener(
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
PAYMENT AMOUNT FORMAT
FORMAT THOUSANDS WHILE TYPING

11000
→ 11.000

1100000
→ 1.100.000
==================================================
*/

this.arPaymentAmount?.addEventListener(
    "input",
    event => {

        /*
        ==============================================
        GET RAW VALUE
        ==============================================
        */

        let value =
            String(
                event.target.value
                || ""
            );


        /*
        ==============================================
        REMOVE NON NUMERIC
        ==============================================
        */

        value =
            value.replace(
                /[^0-9]/g,
                ""
            );


        /*
        ==============================================
        EMPTY
        ==============================================
        */

        if (
            !value
        ) {

            event.target.value =
                "";

            return;

        }


        /*
        ==============================================
        REMOVE LEADING ZERO
        ==============================================
        */

        value =
            value.replace(
                /^0+(?=\d)/,
                ""
            );


        /*
        ==============================================
        FORMAT INDONESIAN THOUSANDS
        ==============================================
        */

        event.target.value =
            Number(
                value
            )
            .toLocaleString(
                "id-ID",
                {
                    maximumFractionDigits: 0
                }
            );

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
                this.currentMode === "edit"
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


                if (
                    !button
                ) {

                    return;

                }


                const action =
                    button.dataset.detailAction;


                const id =
                    button.dataset.detailId;


                if (
                    !id
                ) {

                    return;

                }


                /*
                ==========================================
                EDIT DETAIL
                ==========================================
                */

                if (
                    action === "edit"
                ) {

                    this.editInvoiceDetail(
                        id
                    );

                    return;

                }


                /*
                ==========================================
                DELETE DETAIL
                ==========================================
                */

                if (
                    action === "delete"
                ) {

                    this.deleteInvoiceDetail(
                        id
                    );

                    return;

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

            /*
            ==============================================
            GET ACTION BUTTON
            ==============================================
            */

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (
                !button
            ) {

                return;

            }


            /*
            ==============================================
            ACTION
            ==============================================
            */

            const action =
                button.dataset.action;


            /*
            ==============================================
            ID
            ==============================================
            */

            const id =
                button.dataset.id;


            if (
                !id
            ) {

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
            VIEW PAYMENT
            ==============================================
            */

            if (
                action === "view-payment"
            ) {

                await this.viewPayment(
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
                this.currentPage - 1
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
                this.currentPage + 1
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
ACCOUNT RECEIVABLE
SAME AS ACCOUNT PAYABLE
======================================================
*/

previewHTML() {

    try {

        /*
        ==================================================
        CURRENT FILTERED DATA
        ==================================================
        */

        const invoices =
            Array.isArray(
                this.filteredData
            )
                ? this.filteredData
                : [];


        /*
        ==================================================
        VALIDATE DATA
        ==================================================
        */

        if (
            invoices.length === 0
        ) {

            this.showError(
                "No Account Receivable data available to preview."
            );

            return;

        }


        /*
        ==================================================
        OPEN NEW TAB
        ==================================================
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
        ==================================================
        PREVIEW DATE
        ==================================================
        */

        const previewDate =
            new Date()
                .toLocaleString(
                    "id-ID"
                );


        /*
        ==================================================
        ESCAPE HTML
        ==================================================
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
        ==================================================
        TABLE ROWS
        ==================================================
        */

        const rows =
            invoices
                .map(
                    (
                        invoice,
                        index
                    ) => {

                        /*
                        ======================================
                        CUSTOMER
                        ======================================
                        */

                        const customer =
                            invoice
                                ?.mst_business_partner
                            ||
                            {};


                        /*
                        ======================================
                        JOURNAL
                        ======================================
                        */

                        const journal =
                            invoice
                                ?.trx_gl_journal
                            ||
                            {};


                        /*
                        ======================================
                        AMOUNT
                        ======================================
                        */

                        const totalAmount =
                            Number(
                                invoice?.total_amount
                                ||
                                0
                            );


                        const paidAmount =
                            Number(
                                invoice?.paid_amount
                                ||
                                0
                            );


                        const outstandingAmount =
                            Number(
                                invoice?.outstanding_amount
                                ??
                                totalAmount
                            );


                        /*
                        ======================================
                        STATUS
                        ======================================
                        */

                        const status =
                            invoice?.status
                            ||
                            "-";


                        /*
                        ======================================
                        JOURNAL NO
                        ======================================
                        */

                        const journalNo =
                            journal?.journal_no
                            ||
                            invoice?.journal_no
                            ||
                            "-";


                        /*
                        ======================================
                        PO NO
                        ======================================
                        */

                        const poNo =
                            invoice?.po_no
                            ||
                            "-";


                        /*
                        ======================================
                        DESCRIPTION
                        ======================================
                        */

                        const description =
                            invoice?.description
                            ||
                            "-";


                        /*
                        ======================================
                        RETURN ROW
                        ======================================
                        */

                        return `

                            <tr>


                                <!-- NO -->

                                <td class="center">

                                    ${index + 1}

                                </td>


                                <!-- INVOICE NO -->

                                <td>

                                    ${
                                        escapeHTML(
                                            invoice?.invoice_no
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- PO NO -->

                                <td>

                                    ${
                                        escapeHTML(
                                            poNo
                                        )
                                    }

                                </td>


                                <!-- CUSTOMER -->

                                <td>

                                    ${
                                        escapeHTML(
                                            customer?.bp_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- INVOICE DATE -->

                                <td class="center">

                                    ${
                                        escapeHTML(
                                            invoice?.invoice_date
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- DUE DATE -->

                                <td class="center">

                                    ${
                                        escapeHTML(
                                            invoice?.due_date
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <!-- TOTAL -->

                                <td class="amount">

                                    ${
                                        this.formatCurrency(
                                            totalAmount
                                        )
                                    }

                                </td>


                                <!-- PAID -->

                                <td class="amount">

                                    ${
                                        this.formatCurrency(
                                            paidAmount
                                        )
                                    }

                                </td>


                                <!-- OUTSTANDING -->

                                <td class="amount">

                                    ${
                                        this.formatCurrency(
                                            outstandingAmount
                                        )
                                    }

                                </td>


                                <!-- STATUS -->

                                <td class="center">

                                    ${
                                        escapeHTML(
                                            status
                                        )
                                    }

                                </td>


                                <!-- JOURNAL -->

                                <td>

                                    ${
                                        escapeHTML(
                                            journalNo
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


                            </tr>

                        `;

                    }
                )
                .join("");


        /*
        ==================================================
        HTML
        ==================================================
        */

        const html = `

            <!DOCTYPE html>

            <html lang="id">

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="
                        width=device-width,
                        initial-scale=1.0
                    "
                >


                <title>
                    Account Receivable - Preview
                </title>


                <style>

                    /*
                    ==========================================
                    RESET
                    ==========================================
                    */

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


                    /*
                    ==========================================
                    BODY
                    ==========================================
                    */

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


                    /*
                    ==========================================
                    REPORT
                    ==========================================
                    */

                    .report {

                        display:
                            block;

                        width:
                            100%;

                        max-width:
                            100%;

                        margin:
                            0;

                    }


                    /*
                    ==========================================
                    HEADER
                    ==========================================
                    */

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


                    /*
                    ==========================================
                    TABLE CONTAINER
                    ==========================================
                    */

                    .table-container {

                        display:
                            block;

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


                    /*
                    ==========================================
                    TABLE WRAPPER
                    ==========================================
                    */

                    .table-wrapper {

                        display:
                            block;

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


                    /*
                    ==========================================
                    TABLE
                    ==========================================
                    */

                    table {

                        width:
                            max-content;

                        min-width:
                            100%;

                        margin:
                            0;

                        border-collapse:
                            collapse;

                        border-spacing:
                            0;

                        table-layout:
                            auto;

                    }


                    /*
                    ==========================================
                    TABLE HEADER
                    ==========================================
                    */

                    thead th {

                        padding:
                            10px 9px;

                        background:
                            #244494;

                        color:
                            #ffffff;

                        border-right:
                            1px solid #d1d5db;

                        border-bottom:
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


                    /*
                    ==========================================
                    TABLE BODY
                    ==========================================
                    */

                    tbody td {

                        padding:
                            9px;

                        border-right:
                            1px solid #d1d5db;

                        border-bottom:
                            1px solid #d1d5db;

                        vertical-align:
                            middle;

                        background:
                            #ffffff;

                        color:
                            #1f2937;

                        font-size:
                            12px;

                        font-weight:
                            400;

                        white-space:
                            nowrap;

                    }


                    thead th:last-child,
                    tbody td:last-child {

                        border-right:
                            0;

                    }


                    tbody tr:last-child td {

                        border-bottom:
                            0;

                    }


                    tbody tr:nth-child(even) td {

                        background:
                            #f8fafc;

                    }


                    tbody tr:hover td {

                        background:
                            #f1f5f9;

                    }


                    /*
                    ==========================================
                    ALIGNMENT
                    ==========================================
                    */

                    .center {

                        text-align:
                            center;

                    }


                    .amount {

                        text-align:
                            right;

                        white-space:
                            nowrap;

                    }


                    /*
                    ==========================================
                    DESCRIPTION
                    ==========================================
                    */

                    .description {

                        min-width:
                            420px;

                        text-align:
                            left;

                        white-space:
                            nowrap;

                    }


                    /*
                    ==========================================
                    COLUMN WIDTH
                    ==========================================
                    */

                    .col-no {

                        width:
                            45px;

                        min-width:
                            45px;

                    }


                    .col-invoice {

                        min-width:
                            145px;

                    }


                    .col-po {

                        min-width:
                            160px;

                    }


                    .col-customer {

                        min-width:
                            220px;

                    }


                    .col-date {

                        min-width:
                            105px;

                    }


                    .col-amount {

                        min-width:
                            120px;

                    }


                    .col-status {

                        min-width:
                            100px;

                    }


                    .col-journal {

                        min-width:
                            155px;

                    }


                    .col-description {

                        min-width:
                            420px;

                    }


                    /*
                    ==========================================
                    FOOTER
                    ==========================================
                    */

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


                    /*
                    ==========================================
                    FIXED SCROLL INNER
                    ==========================================
                    */

                    .fixed-horizontal-scroll-inner {

                        width:
                            100%;

                        height:
                            21px;

                        overflow-x:
                            auto;

                        overflow-y:
                            hidden;

                        scrollbar-width:
                            auto;

                        scrollbar-color:
                            #9aa5b3
                            #eef1f4;

                    }


                    /*
                    ==========================================
                    FAKE CONTENT WIDTH
                    ==========================================
                    */

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


                    <!-- HEADER -->

                    <div class="report-header">

                        <h1 class="report-title">

                            FINOVA ACCOUNTING SYSTEM

                        </h1>


                        <div class="report-subtitle">

                            Account Receivable

                        </div>


                        <div class="report-description">

                            Account Receivable Transaction Report

                        </div>


                        <div class="report-date">

                            Preview Date :
                            ${previewDate}

                        </div>

                    </div>


                    <!-- TABLE -->

                    <div class="table-container">


                        <div
                            class="table-wrapper"
                            id="ar-table-scroll"
                        >


                            <table
                                id="ar-preview-table"
                            >


                                <colgroup>

                                    <col class="col-no">

                                    <col class="col-invoice">

                                    <col class="col-po">

                                    <col class="col-customer">

                                    <col class="col-date">

                                    <col class="col-date">

                                    <col class="col-amount">

                                    <col class="col-amount">

                                    <col class="col-amount">

                                    <col class="col-status">

                                    <col class="col-journal">

                                    <col class="col-description">

                                </colgroup>


                                <thead>

                                    <tr>

                                        <th>
                                            No
                                        </th>

                                        <th>
                                            Invoice No
                                        </th>

                                        <th>
                                            PO No
                                        </th>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Invoice Date
                                        </th>

                                        <th>
                                            Due Date
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                        <th>
                                            Paid
                                        </th>

                                        <th>
                                            Outstanding
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Journal
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    ${rows}

                                </tbody>


                            </table>


                        </div>


                    </div>


                    <!-- FOOTER -->

                    <div class="report-footer">

                        <div>

                            Total Record :
                            ${invoices.length}

                        </div>


                        <div>

                            Generated by FINOVA Accounting System

                        </div>

                    </div>


                </div>


                <!-- FIXED BOTTOM SCROLLBAR -->

                <div
                    class="fixed-horizontal-scroll"
                    id="ar-fixed-scroll-container"
                >

                    <div
                        class="fixed-horizontal-scroll-inner"
                        id="ar-fixed-scroll"
                    >

                        <div
                            class="fixed-horizontal-scroll-content"
                            id="ar-fixed-scroll-content"
                        >
                        </div>

                    </div>

                </div>


            </body>

            </html>

        `;


        /*
        ==================================================
        WRITE NEW TAB
        ==================================================
        */

        previewWindow.document.open();

        previewWindow.document.write(
            html
        );

        previewWindow.document.close();


        /*
        ==================================================
        TAB TITLE
        ==================================================
        */

        previewWindow.document.title =
            "Account Receivable - Preview";


        /*
        ==================================================
        SETUP FIXED BOTTOM SCROLLBAR
        ==================================================
        */

        const setupScrollSync = () => {

            const doc =
                previewWindow.document;


            /*
            ==============================================
            ELEMENTS
            ==============================================
            */

            const tableScroll =
                doc.getElementById(
                    "ar-table-scroll"
                );


            const table =
                doc.getElementById(
                    "ar-preview-table"
                );


            const fixedScrollContainer =
                doc.getElementById(
                    "ar-fixed-scroll-container"
                );


            const fixedScroll =
                doc.getElementById(
                    "ar-fixed-scroll"
                );


            const fixedScrollContent =
                doc.getElementById(
                    "ar-fixed-scroll-content"
                );


            /*
            ==============================================
            VALIDATE
            ==============================================
            */

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
            UPDATE SCROLL WIDTH
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


                /*
                ==========================================
                SHOW ONLY WHEN NEEDED
                ==========================================
                */

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
            SYNC STATE
            ==============================================
            */

            let syncingFixed =
                false;

            let syncingTable =
                false;


            /*
            ==============================================
            FIXED SCROLL -> TABLE
            ==============================================
            */

            fixedScroll.addEventListener(
                "scroll",
                () => {

                    if (
                        syncingTable
                    ) {

                        return;

                    }


                    syncingFixed =
                        true;


                    tableScroll.scrollLeft =
                        fixedScroll.scrollLeft;


                    requestAnimationFrame(
                        () => {

                            syncingFixed =
                                false;

                        }
                    );

                }
            );


            /*
            ==============================================
            TABLE -> FIXED SCROLL
            ==============================================
            */

            tableScroll.addEventListener(
                "scroll",
                () => {

                    if (
                        syncingFixed
                    ) {

                        return;

                    }


                    syncingTable =
                        true;


                    fixedScroll.scrollLeft =
                        tableScroll.scrollLeft;


                    requestAnimationFrame(
                        () => {

                            syncingTable =
                                false;

                        }
                    );

                }
            );


            /*
            ==============================================
            INITIAL WIDTH
            ==============================================
            */

            updateScrollWidth();


            requestAnimationFrame(
                () => {

                    updateScrollWidth();

                }
            );


            /*
            ==============================================
            WINDOW RESIZE
            ==============================================
            */

            previewWindow.addEventListener(
                "resize",
                updateScrollWidth
            );


            /*
            ==============================================
            RESIZE OBSERVER
            ==============================================
            */

            if (
                typeof previewWindow.ResizeObserver
                !==
                "undefined"
            ) {

                const resizeObserver =
                    new previewWindow.ResizeObserver(
                        () => {

                            updateScrollWidth();

                        }
                    );


                resizeObserver.observe(
                    table
                );


                resizeObserver.observe(
                    tableScroll
                );

            }

        };


        /*
        ==================================================
        RUN SCROLL SETUP
        ==================================================
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
        ==================================================
        FOCUS
        ==================================================
        */

        previewWindow.focus();

    }

    catch (error) {

        console.error(
            "AccountReceivable.previewHTML:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to preview Account Receivable."
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

        await this.loadData(
    false
);


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
BOOTSTRAP ALERT
ACCOUNT RECEIVABLE
======================================================
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
    CONSOLE
    ==================================================
    */

    console.error(
        "Account Receivable:",
        errorMessage
    );


    /*
    ==================================================
    REMOVE EXISTING ERROR ALERT
    ==================================================
    */

    const existingAlert =
        document.getElementById(
            "ar-bootstrap-alert"
        );


    if (
        existingAlert
    ) {

        existingAlert.remove();

    }


    /*
    ==================================================
    CREATE BOOTSTRAP ALERT
    ==================================================
    */

    const alertElement =
        document.createElement(
            "div"
        );


    alertElement.id =
        "ar-bootstrap-alert";


    alertElement.className =
        "alert alert-danger alert-dismissible fade show shadow-sm";


    alertElement.setAttribute(
        "role",
        "alert"
    );


    alertElement.innerHTML = `

        <div class="d-flex align-items-start">

            <i
                class="fa-solid fa-circle-exclamation me-2 mt-1">
            </i>

            <div class="flex-grow-1">

                <strong>
                    Account Receivable
                </strong>

                <div>
                    ${this.escapeHtml(
                        errorMessage
                    )}
                </div>

            </div>

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close">
            </button>

        </div>

    `;


    /*
    ==================================================
    FIND ACTIVE AR MODAL
    ==================================================
    */

    const modal =
        document.getElementById(
            "accountReceivableModal"
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
    INSERT ALERT
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

        alertElement.style.minWidth =
            "420px";

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
                    "ar-bootstrap-alert"
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

        7000
    );

}
/*
======================================================
ESCAPE HTML
======================================================
*/

escapeHtml(
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
======================================================
SHOW SUCCESS
BOOTSTRAP ALERT
ACCOUNT RECEIVABLE
======================================================
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
    CONSOLE
    ==================================================
    */

    console.log(
        "Account Receivable SUCCESS:",
        successMessage
    );


    /*
    ==================================================
    REMOVE EXISTING SUCCESS ALERT
    ==================================================
    */

    const existingAlert =
        document.getElementById(
            "ar-bootstrap-success-alert"
        );


    if (
        existingAlert
    ) {

        existingAlert.remove();

    }


    /*
    ==================================================
    CREATE BOOTSTRAP SUCCESS ALERT
    ==================================================
    */

    const alertElement =
        document.createElement(
            "div"
        );


    alertElement.id =
        "ar-bootstrap-success-alert";


    alertElement.className =
        "alert alert-success alert-dismissible fade show shadow-sm";


    alertElement.setAttribute(
        "role",
        "alert"
    );


    alertElement.innerHTML = `

        <div class="d-flex align-items-start">

            <i
                class="fa-solid fa-circle-check me-2 mt-1">
            </i>

            <div class="flex-grow-1">

                <strong>
                    Account Receivable
                </strong>

                <div>
                    ${this.escapeHtml(
                        successMessage
                    )}
                </div>

            </div>

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close">
            </button>

        </div>

    `;


    /*
    ==================================================
    FIND ACTIVE AR MODAL
    ==================================================
    */

    const modal =
        document.getElementById(
            "accountReceivableModal"
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
    INSERT INSIDE MODAL
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
                    "ar-bootstrap-success-alert"
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

        const journalDetails =
            [];


        /*
        ==================================================
        LOOP AR DETAIL
        ==================================================
        */

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


            if (
                !revenueAccountId
            ) {

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

                if (
                    !taxPlusAccountId
                ) {

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

                if (
                    !taxMinusAccountId
                ) {

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
        AR HEADER DESCRIPTION
        ==================================================
        */

        const invoiceHeaderDescription =
            String(
                invoice.description
                || ""
            )
            .trim();


        /*
        ==================================================
        GL JOURNAL DESCRIPTION

        FORMAT:

        [AUTO] INV AR
        DESCRIPTION HEADER AR
        ==================================================
        */

        const journalDescription =
            invoiceHeaderDescription
                ? `[AUTO] INV AR\n${invoiceHeaderDescription}`
                : `[AUTO] INV AR`;


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
                journalDescription,

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
        DEBUG JOURNAL
        ==================================================
        */

        console.log(
            "AR JOURNAL HEADER:",
            journalHeader
        );


        console.table(
            journalDetails
        );


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


        if (
            !journal
            ||
            !journal.id
        ) {

            throw new Error(
                "Failed to generate AR GL Journal."
            );

        }


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        console.log(
            "AR GL JOURNAL CREATED:",
            journal
        );


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
GENERATE GL JOURNAL AS DRAFT

FINAL - SAME FLOW AS ACCOUNT PAYABLE

RULE :

1. DRAFT + NO JOURNAL
   -> GENERATE GL
   -> LINK GL
   -> CHANGE STATUS TO COMPLETE

2. COMPLETE + NO JOURNAL
   -> RECOVERY
   -> GENERATE GL
   -> LINK GL
   -> KEEP STATUS COMPLETE

3. JOURNAL ALREADY EXISTS
   -> DO NOT GENERATE DUPLICATE JOURNAL
======================================================
*/

async completeInvoice(
    id
) {

    try {

        /*
        ==================================================
        VALIDATE ID
        ==================================================
        */

        if (
            !id
        ) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        LOAD FRESH AR
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
        CURRENT STATUS
        ==================================================
        */

        const currentStatus =
            String(
                invoice.status
                ||
                ""
            )
            .trim()
            .toLowerCase();


        /*
        ==================================================
        CURRENT GL JOURNAL ID
        ==================================================
        */

        let journalId =
            invoice.gl_journal_id
            ||
            null;


        /*
        ==================================================
        BLOCK PAID
        ==================================================
        */

        if (
            currentStatus ===
            "paid"
        ) {

            throw new Error(
                "Paid Account Receivable cannot be completed again."
            );

        }


        /*
        ==================================================
        BLOCK VOID
        ==================================================
        */

        if (
            currentStatus ===
            "void"
        ) {

            throw new Error(
                "Void Account Receivable cannot be completed."
            );

        }


        /*
        ==================================================
        ALLOWED STATUS

        DRAFT
        COMPLETE

        COMPLETE IS ALLOWED ONLY FOR RECOVERY
        WHEN GL JOURNAL IS MISSING
        ==================================================
        */

        if (
            currentStatus !== "draft"
            &&
            currentStatus !== "complete"
        ) {

            throw new Error(
                `Account Receivable status is "${invoice.status}". Account Receivable cannot be completed.`
            );

        }


        /*
        ==================================================
        ALREADY COMPLETE
        JOURNAL ALREADY EXISTS
        ==================================================
        */

        if (
            currentStatus === "complete"
            &&
            journalId
        ) {

            throw new Error(
                "Account Receivable has already been completed and GL Journal already exists."
            );

        }


        /*
        ==================================================
        VALIDATE DETAILS
        ==================================================
        */

        if (
            !details.length
        ) {

            throw new Error(
                "Account Receivable detail cannot be empty."
            );

        }


        /*
        ==================================================
        GENERATE GL JOURNAL
        ONLY IF JOURNAL DOES NOT EXIST
        ==================================================
        */

        let journal =
            null;


        if (
            !journalId
        ) {

            /*
            ==============================================
            GENERATE GL
            STATUS GL = DRAFT
            ==============================================
            */

            journal =
                await this.generateARJournal(
                    invoice,
                    details
                );


            if (
                !journal
                ||
                !journal.id
            ) {

                throw new Error(
                    "Failed to generate Account Receivable GL Journal."
                );

            }


            journalId =
                journal.id;


            /*
            ==============================================
            LINK GL JOURNAL TO AR
            ==============================================
            */

            await this.service.updateGLJournalId(
                id,
                journalId
            );

        }


        /*
        ==================================================
        UPDATE AR STATUS

        ONLY DRAFT NEEDS STATUS CHANGE

        DRAFT
        -> COMPLETE

        EXISTING COMPLETE RECOVERY
        -> KEEP COMPLETE
        ==================================================
        */

        let completed =
            invoice;


        if (
            currentStatus ===
            "draft"
        ) {

            completed =
                await this.service.complete(
                    id
                );


            if (
                !completed
            ) {

                /*
                ==========================================
                IMPORTANT

                AR STATUS UPDATE FAILED AFTER GL CREATED.
                KEEP ERROR VISIBLE.
                ==========================================
                */

                throw new Error(
                    "Failed to complete Account Receivable."
                );

            }

        }


        /*
        ==================================================
        VERIFY FINAL AR
        ==================================================
        */

        const verifyResult =
            await this.service.getById(
                id
            );


        const verifiedAR =
            verifyResult?.header;


        if (
            !verifiedAR
        ) {

            throw new Error(
                "Failed to verify completed Account Receivable."
            );

        }


        /*
        ==================================================
        VERIFY GL LINK
        ==================================================
        */

        if (
            !verifiedAR.gl_journal_id
        ) {

            throw new Error(
                "Account Receivable GL Journal was generated but was not linked to Account Receivable."
            );

        }


        /*
        ==================================================
        RELOAD
        NO LOADING
        ==================================================
        */

        await this.loadData(
            false
        );


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "ACCOUNT RECEIVABLE COMPLETE:",
            {

                ar_id:
                    id,

                previous_status:
                    invoice.status,

                final_status:
                    verifiedAR.status,

                recovery:
                    currentStatus ===
                    "complete",

                gl_journal_id:
                    verifiedAR.gl_journal_id,

                journal_no:
                    journal?.journal_no
                    ||
                    verifiedAR
                        ?.trx_gl_journal
                        ?.journal_no
                    ||
                    null

            }
        );


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        if (
            currentStatus ===
            "complete"
        ) {

            this.showSuccess(
                "Account Receivable GL Journal successfully generated."
            );

        }

        else {

            this.showSuccess(
                "Account Receivable successfully completed."
            );

        }


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return {

            ar:
                verifiedAR,

            journal:
                journal,

            gl_journal_id:
                verifiedAR.gl_journal_id

        };

    }

    catch (
        error
    ) {

        console.error(
            "AccountReceivable.completeInvoice:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to complete Account Receivable."
        );


        return null;

    }

}
}