/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : ACCOUNT PAYABLE
FILE    : account-payable.service.js
VERSION : 1.0.0
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";


/*
==========================================================
ACCOUNT PAYABLE SERVICE
==========================================================
*/

export class AccountPayableService {


   constructor() {

    /*
    ==============================================
    ACCOUNT PAYABLE HEADER
    ==============================================
    */

    this.table =
        TABLE.ACCOUNT_PAYABLE;


    /*
    ==============================================
    ACCOUNT PAYABLE DETAIL
    ==============================================
    */

    this.detailTable =
        TABLE.ACCOUNT_PAYABLE_DETAIL;


    /*
    ==============================================
    ACCOUNT PAYABLE PAYMENT
    ==============================================
    */

    this.paymentTable =
        TABLE.AP_PAYMENT;

}
/*
==========================================================
GET ACCOUNTING PERIOD
ACCOUNT PAYABLE
DATE RECEIVED = ACCOUNTING DATE
==========================================================
*/

async getAccountingPeriod(dateReceived) {

    /*
    ======================================================
    VALIDATE DATE RECEIVED
    ======================================================
    */

    if (!dateReceived) {

        throw new Error(
            "Date Received is required."
        );

    }


    /*
    ======================================================
    GET ACCOUNTING PERIOD
    ======================================================
    */

    const {

        data,
        error

    } = await supabase

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
            dateReceived
        )

        .gte(
            "end_date",
            dateReceived
        )

        .maybeSingle();


    /*
    ======================================================
    DATABASE ERROR
    ======================================================
    */

    if (error) {

        console.error(
            "AccountPayableService.getAccountingPeriod:",
            error
        );

        throw error;

    }


    /*
    ======================================================
    PERIOD NOT CONFIGURED
    ======================================================
    */

    if (!data) {

        throw new Error(
            `Accounting Period for Date Received ${dateReceived} is not configured.`
        );

    }


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return data;

}


/*
==========================================================
VALIDATE ACCOUNTING PERIOD
ACCOUNT PAYABLE

DATE RECEIVED = ACCOUNTING DATE
==========================================================
*/

async validateAccountingPeriod(dateReceived) {

    /*
    ======================================================
    GET PERIOD
    ======================================================
    */

    const period =
        await this.getAccountingPeriod(
            dateReceived
        );


    /*
    ======================================================
    NORMALIZE STATUS
    ======================================================
    */

    const status =
        String(
            period.status || ""
        )
        .trim()
        .toLowerCase();


    /*
    ======================================================
    CLOSED PERIOD
    ======================================================
    */

    if (
        status === "closed"
    ) {

        throw new Error(

            `Accounting Period ${period.period} is Closed. ` +

            `Account Payable with Date Received ${dateReceived} cannot be processed.`

        );

    }


    /*
    ======================================================
    UNKNOWN STATUS
    FAIL CLOSED
    ======================================================
    */

    if (
        status !== "open"
    ) {

        throw new Error(
            `Accounting Period ${period.period} is not Open.`
        );

    }


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return period;

}
/*
==========================================================
GET ACCOUNTING PERIOD
AP PAYMENT
PAYMENT DATE = ACCOUNTING DATE
==========================================================
*/

async getPaymentAccountingPeriod(paymentDate) {

    /*
    ======================================================
    VALIDATE PAYMENT DATE
    ======================================================
    */

    if (!paymentDate) {

        throw new Error(
            "Payment Date is required."
        );

    }


    /*
    ======================================================
    GET ACCOUNTING PERIOD
    ======================================================
    */

    const {
        data,
        error
    } = await supabase

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
            paymentDate
        )

        .gte(
            "end_date",
            paymentDate
        )

        .maybeSingle();


    /*
    ======================================================
    DATABASE ERROR
    ======================================================
    */

    if (error) {

        console.error(
            "AccountPayableService.getPaymentAccountingPeriod:",
            error
        );

        throw error;

    }


    /*
    ======================================================
    PERIOD NOT CONFIGURED
    ======================================================
    */

    if (!data) {

        throw new Error(
            `Accounting Period for Payment Date ${paymentDate} is not configured.`
        );

    }


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return data;

}


/*
==========================================================
VALIDATE ACCOUNTING PERIOD
AP PAYMENT

PAYMENT DATE = ACCOUNTING DATE
==========================================================
*/

async validatePaymentAccountingPeriod(paymentDate) {

    /*
    ======================================================
    GET PERIOD
    ======================================================
    */

    const period =
        await this.getPaymentAccountingPeriod(
            paymentDate
        );


    /*
    ======================================================
    NORMALIZE STATUS
    ======================================================
    */

    const status =
        String(
            period.status || ""
        )
        .trim()
        .toLowerCase();


    /*
    ======================================================
    CLOSED PERIOD
    ======================================================
    */

    if (
        status === "closed"
    ) {

        throw new Error(

            `Accounting Period ${period.period} is Closed. ` +

            `AP Payment with Payment Date ${paymentDate} cannot be processed.`

        );

    }


    /*
    ======================================================
    UNKNOWN STATUS
    FAIL CLOSED
    ======================================================
    */

    if (
        status !== "open"
    ) {

        throw new Error(
            `Accounting Period ${period.period} is not Open.`
        );

    }


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return period;

}

   /*
======================================================
STATUS
======================================================
*/

get STATUS() {

    return {

        /*
        ==============================================
        ACTIVE AP STATUS
        ==============================================
        */

        DRAFT:
            "Draft",

        COMPLETE:
            "Complete",

        PARTIAL_PAID:
            "Partial Paid",

        PAID:
            "Paid",

        VOID:
            "Void",


        /*
        ==============================================
        LEGACY STATUS
        ==============================================
        */

        POSTED:
            "Posted"

    };

}

   async getAll() {

    try {

        /*
        ======================================================
        GET ACCOUNT PAYABLE
        WITH BUSINESS PARTNER
        WITH GL JOURNAL
        ======================================================
        */

        const {

            data,

            error

        } = await supabase

            .from(
                this.table
            )

            .select(`

                *,

                mst_business_partner (
                    id,
                    bp_code,
                    bp_name,
                    bp_type,
                    top_id,
                    is_active
                ),

                trx_gl_journal (
                    id,
                    journal_no,
                    journal_date,
                    status
                )

            `)

            /*
            ==================================================
            ORDER
            NEWEST CREATED AP AT BOTTOM
            ==================================================
            */

            .order(
                "created_at",
                {
                    ascending:
                        true
                }
            );


        /*
        ======================================================
        DATABASE ERROR
        ======================================================
        */

        if (
            error
        ) {

            console.error(
                "AccountPayableService.getAll:",
                error
            );

            throw error;

        }


        /*
        ======================================================
        DEBUG
        ======================================================
        */

        console.log(
            "ACCOUNT PAYABLE GET ALL:",
            data
        );


        /*
        ======================================================
        RETURN
        ======================================================
        */

        return (
            data
            ||
            []
        );

    }

    catch (
        error
    ) {

        console.error(
            "AccountPayableService.getAll:",
            error
        );


        throw error;

    }

}
    /*
======================================================
GET BY ID
======================================================
*/

async getById(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        HEADER
        ==================================================
        */

        const {

            data: header,

            error: headerError

        } = await supabase

            .from(
                this.table
            )

            .select(`
                *,
                mst_business_partner (
                    id,
                    bp_code,
                    bp_name,
                    bp_type,
                    top_id,
                    is_active
                )
            `)

            .eq(
                "id",
                id
            )

            .single();


        if (headerError) {

            console.error(
                "AP GET BY ID HEADER ERROR:",
                {
                    message:
                        headerError.message,

                    details:
                        headerError.details,

                    hint:
                        headerError.hint,

                    code:
                        headerError.code
                }
            );


            throw headerError;

        }


        /*
        ==================================================
        GL JOURNAL
        ==================================================
        */

        let glJournal =
            null;


        if (
            header?.gl_journal_id
        ) {

            const {

                data,

                error

            } = await supabase

                .from(
                    TABLE.GL_JOURNAL
                )

                .select(`
                    id,
                    journal_no,
                    journal_date,
                    description,
                    status
                `)

                .eq(
                    "id",
                    header.gl_journal_id
                )

                .maybeSingle();


            if (error) {

                console.error(
                    "AP GET BY ID GL JOURNAL ERROR:",
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


            glJournal =
                data
                || null;

        }


        /*
        ==================================================
        DETAIL
        ==================================================

        IMPORTANT:
        DO NOT EMBED mst_chart_of_accounts HERE.

        trx_account_payable_detail now has multiple
        references to mst_chart_of_accounts:

        - charge_account_id
        - tax_plus_account_id
        - tax_minus_account_id

        Using:

        mst_chart_of_accounts (...)

        can become ambiguous in PostgREST.
        ==================================================
        */

        const {

            data: details,

            error: detailError

        } = await supabase

            .from(
                this.detailTable
            )

            .select(
                "*"
            )

            .eq(
                "account_payable_id",
                id
            )

            .order(
                "created_at",
                {
                    ascending:
                        true
                }
            );


        if (detailError) {

            console.error(
                "AP GET BY ID DETAIL ERROR:",
                {
                    message:
                        detailError.message,

                    details:
                        detailError.details,

                    hint:
                        detailError.hint,

                    code:
                        detailError.code
                }
            );


            throw detailError;

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP GET BY ID HEADER:",
            header
        );


        console.log(
            "AP GET BY ID GL JOURNAL:",
            glJournal
        );


        console.log(
            "AP GET BY ID DETAILS:",
            details
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return {

            header: {

                ...header,

                gl_journal:
                    glJournal

            },

            details:
                details
                || []

        };

    }

    catch (error) {

        console.error(
            "AccountPayableService.getById ERROR:",
            {
                message:
                    error?.message,

                details:
                    error?.details,

                hint:
                    error?.hint,

                code:
                    error?.code,

                raw:
                    error
            }
        );


        throw error;

    }

}
   /*
======================================================
COMPLETE ACCOUNT PAYABLE
Draft → Complete
WITH ACCOUNTING PERIOD LOCK
======================================================
*/

async completeInvoice(id) {

    try {

        /*
        ==================================================
        VALIDATE ID
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        GET EXISTING ACCOUNT PAYABLE
        ==================================================
        */

        const result =
            await this.getById(
                id
            );


        const invoice =
            result?.header
            || null;


        if (!invoice) {

            throw new Error(
                "Account Payable not found."
            );

        }


        /*
        ==================================================
        VALIDATE STATUS
        ==================================================
        */

        if (
            invoice.status !==
            this.STATUS.DRAFT
        ) {

            throw new Error(
                "Only Draft Account Payable can be completed."
            );

        }


        /*
        ==================================================
        ACCOUNTING PERIOD LOCK
        DATE RECEIVED = ACCOUNTING DATE
        ==================================================
        */

        await this.validateAccountingPeriod(
            invoice.date_received
        );


        /*
        ==================================================
        UPDATE STATUS
        Draft → Complete
        ==================================================
        */

        const {

            data,
            error

        } = await supabase

            .from(
                this.table
            )

            .update({

                status:
                    this.STATUS.COMPLETE

            })

            .eq(
                "id",
                id
            )

            .eq(
                "status",
                this.STATUS.DRAFT
            )

            .select();


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (error) {

            throw error;

        }


        /*
        ==================================================
        VALIDATE RESULT
        ==================================================
        */

        if (
            !Array.isArray(data)
            ||
            data.length === 0
        ) {

            throw new Error(
                "Account Payable could not be completed. The document is no longer in Draft status."
            );

        }


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return data[0];

    }

    catch (error) {

        console.error(
            "AccountPayableService.completeInvoice:",
            error
        );

        throw error;

    }

}
/*
======================================================
LINK GL JOURNAL
======================================================
*/

async linkGLJournal(
    apId,
    journalId
) {

    try {

        console.log(
            "========== LINK GL JOURNAL =========="
        );

        console.log(
            "AP ID      :",
            apId
        );

        console.log(
            "JOURNAL ID :",
            journalId
        );

        if (!apId) {

            throw new Error(
                "Account Payable ID is required."
            );

        }

        if (!journalId) {

            throw new Error(
                "GL Journal ID is required."
            );

        }

        /*
        ==================================================
        UPDATE AP
        ==================================================
        */

        const {
            data,
            error
        } = await supabase

            .from(
                this.table
            )

            .update({

                gl_journal_id:
                    journalId

            })

            .eq(
                "id",
                apId
            )

            .select()
            .single();


        console.log(
            "LINK GL RESULT:",
            data
        );

        console.log(
            "LINK GL ERROR:",
            error
        );


        if (error) {

            throw error;

        }


        if (!data) {

            throw new Error(
                "Failed to link GL Journal to Account Payable."
            );

        }


        console.log(
            "========== LINK GL SUCCESS =========="
        );


        return data;

    }

    catch (error) {

        console.error(
            "AccountPayableService.linkGLJournal:",
            error
        );

        throw error;

    }

}
/*
======================================================
RESET AP AFTER GL JOURNAL DELETE
GL JOURNAL AP_INVOICE DELETED
======================================================
*/

async resetAfterJournalDelete(
    accountPayableId
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !accountPayableId
        ) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        GET ACCOUNT PAYABLE
        ==================================================
        */

        const {

            data: invoice,

            error: findError

        } = await supabase

            .from(
                this.table
            )

            .select(`
                id,
                invoice_no,
                status,
                total_amount,
                paid_amount,
                outstanding_amount,
                gl_journal_id
            `)

            .eq(
                "id",
                accountPayableId
            )

            .maybeSingle();


        if (
            findError
        ) {

            throw findError;

        }


        if (
            !invoice
        ) {

            throw new Error(
                "Account Payable not found."
            );

        }


        /*
        ==================================================
        ACTIVE PAYMENT CHECK
        ==================================================
        */

        const paidAmount =
            Number(
                await this.getPaymentTotal(
                    accountPayableId
                )
                || 0
            );


        /*
        ==================================================
        PREVENT RESET IF PAYMENT EXISTS
        ==================================================
        */

        if (
            paidAmount > 0
        ) {

            throw new Error(
                "Account Payable GL Journal cannot be deleted because an active payment already exists."
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
                || 0
            );


        /*
        ==================================================
        RESET AP TO DRAFT
        ==================================================
        */

        const {

            data,

            error

        } = await supabase

            .from(
                this.table
            )

            .update({

                status:
                    this.STATUS.DRAFT,

                gl_journal_id:
                    null,

                paid_amount:
                    0,

                outstanding_amount:
                    totalAmount

            })

            .eq(
                "id",
                accountPayableId
            )

            .select()

            .single();


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "AP RESET AFTER JOURNAL DELETE ERROR:",
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
        VALIDATE RESULT
        ==================================================
        */

        if (
            !data
        ) {

            throw new Error(
                "Account Payable could not be reset after GL Journal deletion."
            );

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP RESET AFTER JOURNAL DELETE:",
            {

                account_payable_id:
                    accountPayableId,

                invoice_no:
                    data.invoice_no,

                status:
                    data.status,

                gl_journal_id:
                    data.gl_journal_id,

                paid_amount:
                    data.paid_amount,

                outstanding_amount:
                    data.outstanding_amount

            }
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return data;

    }

    catch (error) {

        console.error(
            "AccountPayableService.resetAfterJournalDelete:",
            error
        );


        throw error;

    }

}


   /*
======================================================
SEARCH
======================================================
*/

async search(
    filters = {}
) {

    try {

        /*
        ==================================================
        NORMALIZE FILTER
        ==================================================
        */

        const dateFrom =
            String(
                filters?.dateFrom
                || ""
            )
            .trim();


        const dateTo =
            String(
                filters?.dateTo
                || ""
            )
            .trim();


        const status =
            String(
                filters?.status
                || "all"
            )
            .trim();


        const findBy =
            String(
                filters?.findBy
                || "invoice_no"
            )
            .trim()
            .toLowerCase();


        const keyword =
            String(
                filters?.keyword
                || ""
            )
            .trim()
            .toLowerCase();


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

            throw new Error(
                "Invoice Date From cannot be greater than Invoice Date To."
            );

        }


        /*
        ==================================================
        BASE QUERY
        ==================================================
        */

        let query =
            supabase

                .from(
                    this.table
                )

                .select(`

                    *,

                    mst_business_partner (
                        id,
                        bp_code,
                        bp_name,
                        bp_type,
                        top_id,
                        is_active
                    ),

                    trx_gl_journal (
                        id,
                        journal_no,
                        journal_date,
                        status
                    )

                `);


        /*
        ==================================================
        INVOICE DATE FROM
        ==================================================
        */

        if (
            dateFrom
        ) {

            query =
                query.gte(
                    "invoice_date",
                    dateFrom
                );

        }


        /*
        ==================================================
        INVOICE DATE TO
        ==================================================
        */

        if (
            dateTo
        ) {

            query =
                query.lte(
                    "invoice_date",
                    dateTo
                );

        }


        /*
        ==================================================
        STATUS
        ==================================================
        */

        if (
            status
            &&
            status !== "all"
        ) {

            /*
            ==============================================
            NOT COMPLETED
            ==============================================
            */

            if (
                status ===
                "not_completed"
            ) {

                query =
                    query.in(
                        "status",
                        [
                            this.STATUS.DRAFT,
                            this.STATUS.POSTED,
                            this.STATUS.PARTIAL_PAID
                        ]
                    );

            }


            /*
            ==============================================
            COMPLETED
            ==============================================
            */

            else if (
                status ===
                "completed"
            ) {

                query =
                    query.eq(
                        "status",
                        this.STATUS.PAID
                    );

            }


            /*
            ==============================================
            OTHER STATUS
            ==============================================
            */

            else {

                query =
                    query.eq(
                        "status",
                        status
                    );

            }

        }


        /*
        ==================================================
        ORDER
        ==================================================
        */

        query =
            query.order(
                "created_at",
                {
                    ascending:
                        true
                }
            );


        /*
        ==================================================
        EXECUTE
        ==================================================
        */

        const {

            data,

            error

        } =
            await query;


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (
            error
        ) {

            throw error;

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        let result =
            Array.isArray(
                data
            )
                ? data
                : [];


        /*
        ==================================================
        KEYWORD
        ==================================================
        */

        if (
            keyword
        ) {

            result =
                result.filter(
                    invoice => {

                        /*
                        ======================================
                        VALUES
                        ======================================
                        */

                        const invoiceNo =
                            String(
                                invoice?.invoice_no
                                || ""
                            )
                            .trim()
                            .toLowerCase();


                        const poNo =
                            String(
                                invoice?.po_no
                                || ""
                            )
                            .trim()
                            .toLowerCase();


                        const description =
                            String(
                                invoice?.description
                                || ""
                            )
                            .trim()
                            .toLowerCase();


                        const vendorName =
                            String(
                                invoice
                                    ?.mst_business_partner
                                    ?.bp_name
                                || ""
                            )
                            .trim()
                            .toLowerCase();


                        const vendorCode =
                            String(
                                invoice
                                    ?.mst_business_partner
                                    ?.bp_code
                                || ""
                            )
                            .trim()
                            .toLowerCase();


                        /*
                        ======================================
                        FIND BY
                        ======================================
                        */

                        switch (
                            findBy
                        ) {

                            case "invoice_no":

                                return invoiceNo.includes(
                                    keyword
                                );


                            case "po_no":

                                return poNo.includes(
                                    keyword
                                );


                            case "vendor":

                            case "vendor_name":

                                return (
                                    vendorName.includes(
                                        keyword
                                    )
                                    ||
                                    vendorCode.includes(
                                        keyword
                                    )
                                );


                            case "description":

                                return description.includes(
                                    keyword
                                );


                            default:

                                return (
                                    invoiceNo.includes(
                                        keyword
                                    )
                                    ||
                                    poNo.includes(
                                        keyword
                                    )
                                    ||
                                    vendorName.includes(
                                        keyword
                                    )
                                    ||
                                    vendorCode.includes(
                                        keyword
                                    )
                                    ||
                                    description.includes(
                                        keyword
                                    )
                                );

                        }

                    }
                );

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP SERVICE SEARCH RESULT:",
            {

                filters: {
                    dateFrom,
                    dateTo,
                    status,
                    findBy,
                    keyword
                },

                total:
                    result.length,

                invoice_dates:
                    result.map(
                        item =>
                            item.invoice_date
                    )

            }
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return result;

    }

    catch (error) {

        console.error(
            "AccountPayableService.search:",
            error
        );


        throw error;

    }

}

    /*
    ======================================================
    GET VENDORS
    ======================================================
    */

    async getVendors() {

        try {

            const {

                data,

                error

            } = await supabase

                .from(
                    TABLE.BUSINESS_PARTNER
                )

                .select(`
                    id,
                    bp_code,
                    bp_name,
                    bp_type,
                    top_id,
                    is_active,
                    mst_term_of_payment (
                        id,
                        top_code,
                        top_name,
                        days,
                        status
                    )
                `)

                .eq(
                    "bp_type",
                    "Vendor"
                )

                .eq(
                    "is_active",
                    true
                )

                .order(
                    "bp_name",
                    {
                        ascending: true
                    }
                );


            if (error) {

                throw error;

            }


            return data || [];

        }

        catch (error) {

            console.error(
                "AccountPayableService.getVendors:",
                error
            );

            throw error;

        }

    }


    /*
    ======================================================
    GET VENDOR BY ID
    ======================================================
    */

    async getVendorById(id) {

        try {

            if (!id) {

                throw new Error(
                    "Vendor ID is required."
                );

            }


            const {

                data,

                error

            } = await supabase

                .from(
                    TABLE.BUSINESS_PARTNER
                )

                .select(`
                    id,
                    bp_code,
                    bp_name,
                    bp_type,
                    top_id,
                    is_active,
                    mst_term_of_payment (
                        id,
                        top_code,
                        top_name,
                        days,
                        status
                    )
                `)

                .eq(
                    "id",
                    id
                )

                .eq(
                    "bp_type",
                    "Vendor"
                )

                .eq(
                    "is_active",
                    true
                )

                .single();


            if (error) {

                throw error;

            }


            return data;

        }

        catch (error) {

            console.error(
                "AccountPayableService.getVendorById:",
                error
            );

            throw error;

        }

    }


    /*
    ======================================================
    GET CHART OF ACCOUNTS
    ======================================================
    */

    async getCOA() {

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
                    parent_id,
                    level,
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


            return data || [];

        }

        catch (error) {

            console.error(
                "AccountPayableService.getCOA:",
                error
            );

            throw error;

        }

    }


    /*
    ======================================================
    CALCULATE DUE DATE
    ======================================================
    */

    calculateDueDate(
        dateReceived,
        vendor
    ) {

        if (!dateReceived) {

            return "";

        }


        const top =

            vendor?.mst_term_of_payment;


        const days =

            Number(
                top?.days || 0
            );


        const date =

            new Date(
                `${dateReceived}T00:00:00`
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        date.setDate(
            date.getDate() + days
        );


        return date
            .toISOString()
            .split("T")[0];

    }


    /*
    ======================================================
    CALCULATE DETAIL
    ======================================================
    */

    calculateDetailAmount(detail = {}) {

        const quantity =

            Number(
                detail.quantity || 0
            );


        const unitPrice =

            Number(
                detail.unit_price || 0
            );


        const taxInputRate =

            Number(
                detail.tax_input_rate || 0
            );


        const withholdingRate =

            Number(
                detail.withholding_tax_rate || 0
            );


        const lineAmount =

            quantity * unitPrice;


        const taxInputAmount =

            lineAmount *
            taxInputRate /
            100;


        const withholdingTaxAmount =

            lineAmount *
            withholdingRate /
            100;


        const totalAmount =

            lineAmount
            + taxInputAmount
            - withholdingTaxAmount;


        return {

            line_amount:
                Number(
                    lineAmount.toFixed(2)
                ),

            tax_input_amount:
                Number(
                    taxInputAmount.toFixed(2)
                ),

            withholding_tax_amount:
                Number(
                    withholdingTaxAmount.toFixed(2)
                ),

            total_amount:
                Number(
                    totalAmount.toFixed(2)
                )

        };

    }


    /*
    ======================================================
    CALCULATE HEADER TOTAL
    ======================================================
    */

    calculateTotals(details = []) {

        let subtotal = 0;

        let taxInputAmount = 0;

        let withholdingTaxAmount = 0;


        details.forEach(
            detail => {

                const calculated =

                    this.calculateDetailAmount(
                        detail
                    );


                subtotal +=
                    calculated.line_amount;


                taxInputAmount +=
                    calculated.tax_input_amount;


                withholdingTaxAmount +=
                    calculated.withholding_tax_amount;

            }
        );


        const totalAmount =

            subtotal
            + taxInputAmount
            - withholdingTaxAmount;


        return {

            subtotal:
                Number(
                    subtotal.toFixed(2)
                ),

            tax_input_amount:
                Number(
                    taxInputAmount.toFixed(2)
                ),

            withholding_tax_amount:
                Number(
                    withholdingTaxAmount.toFixed(2)
                ),

            total_amount:
                Number(
                    totalAmount.toFixed(2)
                ),

            paid_amount: 0,

            outstanding_amount:
                Number(
                    totalAmount.toFixed(2)
                )

        };

    }


    /*
======================================================
CREATE ACCOUNT PAYABLE
======================================================
*/

async create(
    header,
    details = []
) {

    try {

        /*
        ==================================================
        VALIDATE HEADER
        ==================================================
        */

        if (!header) {

            throw new Error(
                "Account Payable header is required."
            );

        }


        if (!header.vendor_id) {

            throw new Error(
                "Vendor is required."
            );

        }


        if (!header.invoice_no) {

            throw new Error(
                "Document No. is required."
            );

        }


        if (!header.invoice_date) {

            throw new Error(
                "Invoice Date is required."
            );

        }


        if (!header.date_received) {

            throw new Error(
                "Date Received is required."
            );

        }


        if (
            !Array.isArray(details)
            ||
            !details.length
        ) {

            throw new Error(
                "At least one invoice detail is required."
            );

        }


        /*
        ==================================================
        ACCOUNTING PERIOD LOCK
        DATE RECEIVED = ACCOUNTING DATE
        ==================================================
        */

        await this.validateAccountingPeriod(
            header.date_received
        );


        /*
        ==================================================
        CALCULATE DETAILS
        ==================================================
        */

        const calculatedDetails =
            details.map(
                detail => {

                    const calculated =
                        this.calculateDetailAmount(
                            detail
                        );


                    return {

                        ...detail,

                        ...calculated

                    };

                }
            );


        /*
        ==================================================
        CALCULATE HEADER TOTAL
        ==================================================
        */

        const totals =
            this.calculateTotals(
                calculatedDetails
            );


        /*
        ==================================================
        PREPARE HEADER PAYLOAD
        ==================================================
        */

        const headerPayload = {

            ...header,

            subtotal:
                Number(
                    totals.subtotal
                    || 0
                ),

            tax_input_amount:
                Number(
                    totals.tax_input_amount
                    || 0
                ),

            withholding_tax_amount:
                Number(
                    totals.withholding_tax_amount
                    || 0
                ),

            total_amount:
                Number(
                    totals.total_amount
                    || 0
                ),

            paid_amount:
                0,

            outstanding_amount:
                Number(
                    totals.total_amount
                    || 0
                ),

            status:
                header.status
                ||
                this.STATUS.DRAFT

        };


        /*
        ==================================================
        REMOVE UNSAFE / EMPTY HEADER VALUES
        ==================================================
        */

        if (
            headerPayload.id == null
            ||
            headerPayload.id === ""
        ) {

            delete headerPayload.id;

        }


        if (
            headerPayload.gl_journal_id === ""
        ) {

            headerPayload.gl_journal_id =
                null;

        }


        /*
        ==================================================
        DEBUG HEADER
        ==================================================
        */

        console.log(
            "========== AP CREATE HEADER =========="
        );


        console.log(
            headerPayload
        );


        console.log(
            "======================================"
        );


        /*
        ==================================================
        INSERT HEADER
        ==================================================
        */

        const {

            data: invoice,

            error: invoiceError

        } = await supabase

            .from(
                this.table
            )

            .insert(
                headerPayload
            )

            .select()

            .single();


        /*
        ==================================================
        HEADER ERROR
        ==================================================
        */

        if (invoiceError) {

            console.error(
                "========== AP HEADER INSERT ERROR =========="
            );


            console.error(
                "MESSAGE:",
                invoiceError.message
            );


            console.error(
                "DETAILS:",
                invoiceError.details
            );


            console.error(
                "HINT:",
                invoiceError.hint
            );


            console.error(
                "CODE:",
                invoiceError.code
            );


            console.error(
                "FULL ERROR:",
                invoiceError
            );


            console.error(
                "============================================"
            );


            throw invoiceError;

        }


        if (
            !invoice?.id
        ) {

            throw new Error(
                "Account Payable header was created but ID is missing."
            );

        }


        /*
        ==================================================
        PREPARE DETAILS
        ==================================================
        */

        const detailRows =
            calculatedDetails.map(
                detail => {

                    const row = {

                        ...detail,

                        account_payable_id:
                            invoice.id

                    };


                    /*
                    ==========================================
                    REMOVE TEMPORARY UI ID
                    DATABASE GENERATES DETAIL ID
                    ==========================================
                    */

                    delete row.id;


                    /*
                    ==========================================
                    NORMALIZE OPTIONAL TAX REFERENCES
                    ==========================================
                    */

                    row.tax_plus_id =
                        row.tax_plus_id
                        ? Number(
                            row.tax_plus_id
                        )
                        : null;


                    row.tax_plus_account_id =
                        row.tax_plus_account_id
                        ? Number(
                            row.tax_plus_account_id
                        )
                        : null;


                    row.tax_minus_id =
                        row.tax_minus_id
                        ? Number(
                            row.tax_minus_id
                        )
                        : null;


                    row.tax_minus_account_id =
                        row.tax_minus_account_id
                        ? Number(
                            row.tax_minus_account_id
                        )
                        : null;


                    /*
                    ==========================================
                    NORMALIZE CHARGE ACCOUNT
                    ==========================================
                    */

                    row.charge_account_id =
                        Number(
                            row.charge_account_id
                            || 0
                        );


                    return row;

                }
            );


        /*
        ==================================================
        VALIDATE DETAIL ACCOUNT
        ==================================================
        */

        for (
            const detail
            of detailRows
        ) {

            if (
                !detail.charge_account_id
            ) {

                /*
                ==============================================
                ROLLBACK HEADER
                ==============================================
                */

                await supabase

                    .from(
                        this.table
                    )

                    .delete()

                    .eq(
                        "id",
                        invoice.id
                    );


                throw new Error(
                    "Charge Account is required on every Account Payable detail."
                );

            }

        }


        /*
        ==================================================
        DEBUG DETAIL
        ==================================================
        */

        console.log(
            "========== AP CREATE DETAILS =========="
        );


        console.table(
            detailRows
        );


        console.log(
            "========================================"
        );


        /*
        ==================================================
        INSERT DETAILS
        ==================================================
        */

        const {

            data: insertedDetails,

            error: detailError

        } = await supabase

            .from(
                this.detailTable
            )

            .insert(
                detailRows
            )

            .select();


        /*
        ==================================================
        DETAIL ERROR
        ==================================================
        */

        if (detailError) {

            console.error(
                "========== AP DETAIL INSERT ERROR =========="
            );


            console.error(
                "MESSAGE:",
                detailError.message
            );


            console.error(
                "DETAILS:",
                detailError.details
            );


            console.error(
                "HINT:",
                detailError.hint
            );


            console.error(
                "CODE:",
                detailError.code
            );


            console.error(
                "FULL ERROR:",
                detailError
            );


            console.error(
                "============================================"
            );


            /*
            ==================================================
            ROLLBACK HEADER
            ==================================================
            */

            const {

                error: rollbackError

            } = await supabase

                .from(
                    this.table
                )

                .delete()

                .eq(
                    "id",
                    invoice.id
                );


            if (rollbackError) {

                console.error(
                    "AP CREATE ROLLBACK ERROR:",
                    rollbackError
                );

            }


            throw detailError;

        }


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        console.log(
            "ACCOUNT PAYABLE CREATED:",
            {

                header:
                    invoice,

                detail_count:
                    insertedDetails?.length
                    || 0

            }
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return {

            ...invoice,

            details:
                insertedDetails
                || []

        };

    }

    catch (error) {

        console.error(
            "AccountPayableService.create:",
            error
        );


        throw error;

    }

}
    /*
======================================================
UPDATE ACCOUNT PAYABLE
WITH ACCOUNTING PERIOD LOCK
======================================================
*/

async update(
    id,
    header,
    details = []
) {

    try {

        /*
        ==================================================
        VALIDATE ID
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        VALIDATE HEADER
        ==================================================
        */

        if (!header) {

            throw new Error(
                "Account Payable header is required."
            );

        }


        if (!header.date_received) {

            throw new Error(
                "Date Received is required."
            );

        }


        /*
        ==================================================
        GET EXISTING ACCOUNT PAYABLE
        ==================================================

        IMPORTANT:

        We must validate the ORIGINAL Date Received first.

        Example:

        Original Date Received:
        31-08-2026

        Period:
        2026-08 CLOSED

        User must NOT be allowed to change it to:

        01-09-2026

        just to bypass Accounting Period Lock.
        ==================================================
        */

        const existingResult =
            await this.getById(
                id
            );


        const existingInvoice =
            existingResult?.header
            || null;


        if (!existingInvoice) {

            throw new Error(
                "Account Payable not found."
            );

        }


        /*
        ==================================================
        ACCOUNTING PERIOD LOCK
        ORIGINAL DATE RECEIVED
        ==================================================
        */

        await this.validateAccountingPeriod(
            existingInvoice.date_received
        );


        /*
        ==================================================
        ACCOUNTING PERIOD LOCK
        NEW DATE RECEIVED
        ==================================================
        */

        await this.validateAccountingPeriod(
            header.date_received
        );


        /*
        ==================================================
        CALCULATE DETAILS
        ==================================================
        */

        const calculatedDetails =

            details.map(
                detail => {

                    const calculated =

                        this.calculateDetailAmount(
                            detail
                        );


                    return {

                        ...detail,

                        ...calculated

                    };

                }
            );


        /*
        ==================================================
        CALCULATE TOTALS
        ==================================================
        */

        const totals =

            this.calculateTotals(
                calculatedDetails
            );


        /*
        ==================================================
        UPDATE HEADER
        ==================================================
        */

        const {

            data: invoice,

            error: invoiceError

        } = await supabase

            .from(
                this.table
            )

            .update({

                ...header,

                ...totals

            })

            .eq(
                "id",
                id
            )

            .select()

            .single();


        if (invoiceError) {

            throw invoiceError;

        }


        /*
        ==================================================
        DELETE OLD DETAILS
        ==================================================
        */

        const {

            error: deleteError

        } = await supabase

            .from(
                this.detailTable
            )

            .delete()

            .eq(
                "account_payable_id",
                id
            );


        if (deleteError) {

            throw deleteError;

        }


        /*
        ==================================================
        INSERT NEW DETAILS
        ==================================================
        */

        if (
            calculatedDetails.length
        ) {

            const detailRows =

                calculatedDetails.map(
                    detail => ({

                        ...detail,

                        account_payable_id:
                            id

                    })
                );


            const {

                error: insertError

            } = await supabase

                .from(
                    this.detailTable
                )

                .insert(
                    detailRows
                );


            if (insertError) {

                throw insertError;

            }

        }


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return this.getById(
            id
        );

    }

    catch (error) {

        console.error(
            "AccountPayableService.update:",
            error
        );

        throw error;

    }

}


 /*
======================================================
DELETE ACCOUNT PAYABLE
WITH ACCOUNTING PERIOD LOCK
======================================================
*/

async delete(id) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        GET ACCOUNT PAYABLE
        ==================================================
        */

        const result =
            await this.getById(
                id
            );


        const invoice =
            result?.header
            || null;


        if (!invoice) {

            throw new Error(
                "Account Payable not found."
            );

        }


        /*
        ==================================================
        ACCOUNTING PERIOD LOCK
        DATE RECEIVED = ACCOUNTING DATE
        ==================================================
        */

        await this.validateAccountingPeriod(
            invoice.date_received
        );


        /*
        ==================================================
        ONLY DRAFT / VOID CAN BE DELETED
        ==================================================
        */

        if (
            invoice.status !== this.STATUS.DRAFT
            &&
            invoice.status !== this.STATUS.VOID
        ) {

            throw new Error(
                "Only Draft or Void Account Payable can be deleted."
            );

        }


        console.log(
            "DELETE TARGET:",
            {
                id:
                    invoice.id,

                invoice_no:
                    invoice.invoice_no,

                status:
                    invoice.status,

                date_received:
                    invoice.date_received
            }
        );


        /*
        ==================================================
        DELETE HEADER
        ==================================================
        */

        const {

            data: deletedInvoice,

            error: deleteError

        } = await supabase

            .from(
                this.table
            )

            .delete()

            .eq(
                "id",
                id
            )

            .select(`
                id,
                invoice_no
            `);


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (deleteError) {

            console.error(
                "DELETE DATABASE ERROR:",
                deleteError
            );

            throw deleteError;

        }


        /*
        ==================================================
        VERIFY DELETE
        ==================================================
        */

        if (
            !deletedInvoice
            ||
            deletedInvoice.length === 0
        ) {

            throw new Error(
                "Account Payable was not deleted from database."
            );

        }


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        console.log(
            "ACCOUNT PAYABLE DELETED SUCCESSFULLY:",
            deletedInvoice[0]
        );


        return true;

    }

    catch (error) {

        console.error(
            "AccountPayableService.delete:",
            error
        );

        throw error;

    }

}
/*
======================================================
VOID ACCOUNT PAYABLE
WITH ACCOUNTING PERIOD LOCK
======================================================
*/

async voidInvoice(
    id,
    reason
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        if (
            !reason ||
            !reason.trim()
        ) {

            throw new Error(
                "Void reason is required."
            );

        }


        /*
        ==================================================
        GET INVOICE
        ==================================================
        */

        const result =
            await this.getById(
                id
            );


        const invoice =
            result?.header
            || null;


        if (!invoice) {

            throw new Error(
                "Account Payable not found."
            );

        }


        console.log(
            "AP VOID BEFORE UPDATE:",
            {
                id:
                    invoice?.id,

                invoice_no:
                    invoice?.invoice_no,

                status:
                    invoice?.status,

                total_amount:
                    invoice?.total_amount,

                outstanding_amount:
                    invoice?.outstanding_amount,

                date_received:
                    invoice?.date_received
            }
        );


        /*
        ==================================================
        ONLY POSTED CAN BE VOIDED
        ==================================================
        */

        if (
            invoice.status !==
            this.STATUS.POSTED
        ) {

            throw new Error(
                "Only Posted Account Payable can be voided."
            );

        }


        /*
        ==================================================
        ACCOUNTING PERIOD LOCK
        DATE RECEIVED = ACCOUNTING DATE
        ==================================================
        */

        await this.validateAccountingPeriod(
            invoice.date_received
        );


        /*
        ==================================================
        UPDATE STATUS
        ==================================================
        */

        const {

            data,
            error: updateError

        } = await supabase

            .from(
                this.table
            )

            .update({

                status:
                    this.STATUS.VOID

            })

            .eq(
                "id",
                id
            )

            .select()

            .single();


        if (updateError) {

            throw updateError;

        }


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return data;

    }

    catch (error) {

        console.error(
            "AccountPayableService.voidInvoice:",
            error
        );

        throw error;

    }

}
/*
======================================================
LINK GL JOURNAL
======================================================
*/

async linkGLJournal(
    id,
    journalId
) {

    try {

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }

        if (!journalId) {

            throw new Error(
                "GL Journal ID is required."
            );

        }


        const {
            data,
            error
        } = await supabase

            .from(
                this.table
            )

            .update({

                gl_journal_id:
                    journalId

            })

            .eq(
                "id",
                id
            )

            .select()
            .single();


        if (error) {

            throw error;

        }


        return data;

    }
    catch (error) {

        console.error(
            "AccountPayableService.linkGLJournal:",
            error
        );

        throw error;

    }
}


/*
======================================================
CREATE AP PAYMENT
FINAL
======================================================
*/

async createPayment(
    payment
) {

    try {

        /*
        ==================================================
        VALIDATE PAYMENT OBJECT
        ==================================================
        */

        if (!payment) {

            throw new Error(
                "AP Payment data is required."
            );

        }


        /*
        ==================================================
        ACCOUNT PAYABLE ID
        ==================================================
        */

        const accountPayableId =
            payment.account_payable_id
            || null;


        if (
            !accountPayableId
        ) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        PAYMENT DATE
        ==================================================
        */

        const paymentDate =
            String(
                payment.payment_date
                || ""
            )
            .trim();


        if (
            !paymentDate
        ) {

            throw new Error(
                "Payment Date is required."
            );

        }
        /*
        ==================================================
        ACCOUNTING PERIOD LOCK
        PAYMENT DATE = ACCOUNTING DATE
        ==================================================
        */

        await this.validatePaymentAccountingPeriod(
            paymentDate
        );


        /*
        ==================================================
        BANK ACCOUNT
        ==================================================
        */

        const bankAccountId =
            Number(
                payment.bank_account_id
                || 0
            );


        if (
            !Number.isFinite(
                bankAccountId
            )
            ||
            bankAccountId <= 0
        ) {

            throw new Error(
                "Bank Account is required."
            );

        }


        /*
        ==================================================
        PAYMENT COMPONENT
        ==================================================
        */

        const dppAmount =
            Number(
                payment.dpp_amount
                || 0
            );


        const taxPlusAmount =
            Number(
                payment.tax_plus_amount
                || 0
            );


        const taxMinusAmount =
            Number(
                payment.tax_minus_amount
                || 0
            );


        const paymentAmount =
            Number(
                payment.payment_amount
                || 0
            );


        /*
        ==================================================
        VALIDATE PAYMENT AMOUNT
        ==================================================
        */

        if (
            !Number.isFinite(
                paymentAmount
            )
            ||
            paymentAmount <= 0
        ) {

            throw new Error(
                "Payment Amount must be greater than 0."
            );

        }


        /*
        ==================================================
        VALIDATE COMPONENT
        ==================================================
        */

        if (
            !Number.isFinite(
                dppAmount
            )
            ||
            !Number.isFinite(
                taxPlusAmount
            )
            ||
            !Number.isFinite(
                taxMinusAmount
            )
        ) {

            throw new Error(
                "AP Payment component is invalid."
            );

        }


        /*
        ==================================================
        GL JOURNAL ID
        ==================================================
        */

        const glJournalId =
            payment.gl_journal_id
            || null;


        if (
            !glJournalId
        ) {

            throw new Error(
                "AP Payment GL Journal ID is required."
            );

        }


        /*
        ==================================================
        REFERENCE
        ==================================================
        */

        const referenceNo =
            payment.reference_no
                ? String(
                    payment.reference_no
                )
                .trim()
                : null;


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        const description =
            payment.description
                ? String(
                    payment.description
                )
                .trim()
                : null;


        /*
        ==================================================
        PREPARE PAYLOAD
        ==================================================
        */

        const payload = {

            account_payable_id:
                accountPayableId,

            payment_date:
                paymentDate,

            bank_account_id:
                bankAccountId,

            dpp_amount:
                Number(
                    dppAmount.toFixed(
                        2
                    )
                ),

            tax_plus_amount:
                Number(
                    taxPlusAmount.toFixed(
                        2
                    )
                ),

            tax_minus_amount:
                Number(
                    taxMinusAmount.toFixed(
                        2
                    )
                ),

            payment_amount:
                Number(
                    paymentAmount.toFixed(
                        2
                    )
                ),

            reference_no:
                referenceNo
                || null,

            description:
                description
                || null,

            gl_journal_id:
                glJournalId

        };


        /*
        ==================================================
        DEBUG BEFORE INSERT
        ==================================================
        */

        console.log(
            "========== AP PAYMENT INSERT =========="
        );


        console.log(
            "PAYLOAD:",
            payload
        );


        console.log(
            "ACCOUNT PAYABLE ID:",
            accountPayableId
        );


        console.log(
            "GL JOURNAL ID:",
            glJournalId
        );


        console.log(
            "PAYMENT AMOUNT:",
            paymentAmount
        );


        console.log(
            "======================================="
        );


        /*
        ==================================================
        INSERT PAYMENT
        ==================================================
        */

        const {

            data,

            error

        } = await supabase

            .from(
                this.paymentTable
            )

            .insert(
                payload
            )

            .select(`
                id,
                account_payable_id,
                payment_date,
                bank_account_id,
                dpp_amount,
                tax_plus_amount,
                tax_minus_amount,
                payment_amount,
                reference_no,
                description,
                gl_journal_id,
                created_at,
                updated_at
            `)

            .single();


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "========== AP PAYMENT INSERT ERROR =========="
            );


            console.error(
                "MESSAGE:",
                error.message
            );


            console.error(
                "DETAILS:",
                error.details
            );


            console.error(
                "HINT:",
                error.hint
            );


            console.error(
                "CODE:",
                error.code
            );


            console.error(
                "FULL ERROR:",
                error
            );


            console.error(
                "============================================"
            );


            throw error;

        }


        /*
        ==================================================
        VALIDATE RESULT
        ==================================================
        */

        if (
            !data
            ||
            !data.id
        ) {

            throw new Error(
                "AP Payment was not created."
            );

        }


        /*
        ==================================================
        VERIFY ACCOUNT PAYABLE LINK
        ==================================================
        */

        if (
            String(
                data.account_payable_id
            )
            !==
            String(
                accountPayableId
            )
        ) {

            throw new Error(
                "AP Payment Account Payable link is invalid."
            );

        }


        /*
        ==================================================
        VERIFY GL JOURNAL LINK
        ==================================================
        */

        if (
            !data.gl_journal_id
        ) {

            throw new Error(
                "AP Payment was created without GL Journal link."
            );

        }


        if (
            String(
                data.gl_journal_id
            )
            !==
            String(
                glJournalId
            )
        ) {

            throw new Error(
                "AP Payment GL Journal link is invalid."
            );

        }


        /*
        ==================================================
        DEBUG SUCCESS
        ==================================================
        */

        console.log(
            "========== AP PAYMENT CREATED =========="
        );


        console.log(
            {
                payment_id:
                    data.id,

                account_payable_id:
                    data.account_payable_id,

                payment_amount:
                    data.payment_amount,

                gl_journal_id:
                    data.gl_journal_id
            }
        );


        console.log(
            "========================================"
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return data;

    }

    catch (error) {

        console.error(
            "AccountPayableService.createPayment:",
            error
        );


        throw error;

    }

}

/*
======================================================
GET AP PAYMENT TOTAL
ONLY ACTIVE PAYMENT
======================================================
*/

async getPaymentTotal(
    accountPayableId
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !accountPayableId
        ) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        GET ACTIVE PAYMENT

        ACTIVE PAYMENT =
        gl_journal_id IS NOT NULL
        ==================================================
        */

        const {

            data,

            error

        } = await supabase

            .from(
                this.paymentTable
            )

            .select(`
                id,
                payment_amount,
                gl_journal_id
            `)

            .eq(
                "account_payable_id",
                accountPayableId
            )

            .not(
                "gl_journal_id",
                "is",
                null
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
                "AP PAYMENT TOTAL ERROR:",
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
        CALCULATE TOTAL PAID
        ==================================================
        */

        const totalPaid =
            (
                data
                ||
                []
            )
            .reduce(
                (
                    total,
                    payment
                ) => {

                    const amount =
                        Number(
                            payment?.payment_amount
                            ||
                            0
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
        ==================================================
        NORMALIZE TOTAL
        ==================================================
        */

        const normalizedTotalPaid =
            Number(
                totalPaid.toFixed(
                    2
                )
            );


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP ACTIVE PAYMENT TOTAL:",
            {

                account_payable_id:
                    accountPayableId,

                payment_count:
                    data?.length
                    || 0,

                total_paid:
                    normalizedTotalPaid,

                payments:
                    data
                    || []

            }
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return normalizedTotalPaid;

    }

    catch (error) {

        console.error(
            "AccountPayableService.getPaymentTotal:",
            error
        );


        throw error;

    }

}
/*
======================================================
GET ACTIVE AP PAYMENT
ONLY PAYMENT WITH GL JOURNAL
======================================================
*/

async getActivePayment(
    accountPayableId
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !accountPayableId
        ) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        GET LATEST ACTIVE PAYMENT

        ACTIVE PAYMENT =
        gl_journal_id IS NOT NULL
        ==================================================
        */

        const {

            data,

            error

        } = await supabase

            .from(
                this.paymentTable
            )

            .select(`
                id,
                account_payable_id,
                payment_date,
                bank_account_id,
                dpp_amount,
                tax_plus_amount,
                tax_minus_amount,
                payment_amount,
                reference_no,
                description,
                gl_journal_id,
                created_at,
                updated_at
            `)

            .eq(
                "account_payable_id",
                accountPayableId
            )

            .not(
                "gl_journal_id",
                "is",
                null
            )

            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            )

            .limit(
                1
            )

            .maybeSingle();


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "AP ACTIVE PAYMENT ERROR:",
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
        NO ACTIVE PAYMENT
        ==================================================
        */

        if (
            !data
        ) {

            console.log(
                "AP ACTIVE PAYMENT:",
                {

                    account_payable_id:
                        accountPayableId,

                    payment:
                        null

                }
            );


            return null;

        }


        /*
        ==================================================
        VERIFY GL JOURNAL LINK
        ==================================================
        */

        if (
            !data.gl_journal_id
        ) {

            console.warn(
                "AP ACTIVE PAYMENT WITHOUT GL JOURNAL:",
                data
            );


            return null;

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP ACTIVE PAYMENT:",
            {

                account_payable_id:
                    accountPayableId,

                payment_id:
                    data.id,

                payment_amount:
                    Number(
                        data.payment_amount
                        || 0
                    ),

                gl_journal_id:
                    data.gl_journal_id,

                payment_date:
                    data.payment_date

            }
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return data;

    }

    catch (error) {

        console.error(
            "AccountPayableService.getActivePayment:",
            error
        );


        throw error;

    }

}
/*
======================================================
UPDATE AP PAYMENT STATUS
======================================================
*/

async updatePaymentStatus(
    accountPayableId
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !accountPayableId
        ) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==================================================
        GET ACCOUNT PAYABLE
        ==================================================
        */

        const result =
            await this.getById(
                accountPayableId
            );


        const invoice =
            result?.header
            || null;


        if (
            !invoice
        ) {

            throw new Error(
                "Account Payable not found."
            );

        }


        /*
        ==================================================
        TOTAL INVOICE
        ==================================================
        */

        const totalAmount =
            Number(
                invoice.total_amount
                ||
                0
            );


        if (
            !Number.isFinite(
                totalAmount
            )
            ||
            totalAmount <= 0
        ) {

            throw new Error(
                "Account Payable Total Amount is invalid."
            );

        }


        /*
        ==================================================
        TOTAL ACTIVE PAYMENT
        ==================================================
        */

        const paidAmount =
            Number(
                await this.getPaymentTotal(
                    accountPayableId
                )
                ||
                0
            );


        if (
            !Number.isFinite(
                paidAmount
            )
            ||
            paidAmount < 0
        ) {

            throw new Error(
                "Account Payable Paid Amount is invalid."
            );

        }


        /*
        ==================================================
        PREVENT OVERPAYMENT
        ==================================================
        */

        if (
            paidAmount
            >
            totalAmount
        ) {

            throw new Error(
                "Total payment cannot exceed Account Payable Total Amount."
            );

        }


        /*
        ==================================================
        OUTSTANDING
        ==================================================
        */

        const outstandingAmount =
            Math.max(
                Number(
                    (
                        totalAmount
                        -
                        paidAmount
                    )
                    .toFixed(
                        2
                    )
                ),
                0
            );


        /*
        ==================================================
        DETERMINE STATUS
        ==================================================
        */

        let status =
            this.STATUS.COMPLETE;


        /*
        ==============================================
        PARTIAL PAID
        ==============================================
        */

        if (
            paidAmount > 0
            &&
            paidAmount < totalAmount
        ) {

            status =
                this.STATUS.PARTIAL_PAID;

        }


        /*
        ==============================================
        FULLY PAID
        ==============================================
        */

        if (
            paidAmount >= totalAmount
            &&
            totalAmount > 0
        ) {

            status =
                this.STATUS.PAID;

        }


        /*
        ==================================================
        UPDATE ACCOUNT PAYABLE
        ==================================================
        */

        const {

            data,

            error

        } = await supabase

            .from(
                this.table
            )

            .update({

                paid_amount:
                    Number(
                        paidAmount.toFixed(
                            2
                        )
                    ),

                outstanding_amount:
                    outstandingAmount,

                status:
                    status

            })

            .eq(
                "id",
                accountPayableId
            )

            .select()

            .single();


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "AP PAYMENT STATUS UPDATE ERROR:",
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
        VALIDATE RESULT
        ==================================================
        */

        if (
            !data
        ) {

            throw new Error(
                "Account Payable payment status was not updated."
            );

        }


        /*
        ==================================================
        VERIFY RESULT
        ==================================================
        */

        if (
            Number(
                data.paid_amount
                ||
                0
            )
            !==
            Number(
                paidAmount.toFixed(
                    2
                )
            )
        ) {

            throw new Error(
                "Account Payable Paid Amount verification failed."
            );

        }


        if (
            Number(
                data.outstanding_amount
                ||
                0
            )
            !==
            outstandingAmount
        ) {

            throw new Error(
                "Account Payable Outstanding Amount verification failed."
            );

        }


        if (
            String(
                data.status
                ||
                ""
            )
            !==
            String(
                status
            )
        ) {

            throw new Error(
                "Account Payable payment status verification failed."
            );

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP PAYMENT STATUS UPDATED:",
            {

                account_payable_id:
                    accountPayableId,

                total_amount:
                    totalAmount,

                paid_amount:
                    paidAmount,

                outstanding_amount:
                    outstandingAmount,

                status:
                    status

            }
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return data;

    }

    catch (error) {

        console.error(
            "AccountPayableService.updatePaymentStatus:",
            error
        );


        throw error;

    }

}
/*
======================================================
RECOVER ACCOUNT PAYABLE TOTALS
======================================================
*/

async recoverTotals(id) {

    try {

        /*
        ==============================================
        VALIDATION
        ==============================================
        */

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        /*
        ==============================================
        GET DETAILS
        ==============================================
        */

        const {
            data: details,
            error: detailError
        } = await supabase

            .from(this.detailTable)

            .select(`
                quantity,
                unit_price,
                tax_input_rate,
                withholding_tax_rate
            `)

            .eq(
                "account_payable_id",
                id
            );


        if (detailError) {

            throw detailError;

        }


        /*
        ==============================================
        VALIDATE DETAILS
        ==============================================
        */

        if (
            !Array.isArray(details)
            ||
            !details.length
        ) {

            throw new Error(
                "No Account Payable detail found."
            );

        }


        /*
        ==============================================
        CALCULATE TOTAL
        ==============================================
        */

        const totals =
            this.calculateTotals(
                details
            );


        console.log(
            "AP RECOVER TOTALS:",
            {
                id,
                details,
                totals
            }
        );


        return totals;

    }

    catch (error) {

        console.error(
            "AccountPayableService.recoverTotals:",
            error
        );

        throw error;

    }

}
}