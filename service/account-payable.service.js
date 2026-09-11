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


/*
==============================================
ACCOUNT PAYABLE PAYMENT BATCH
BULK / GROUP PAYMENT HEADER
==============================================
*/

this.paymentBatchTable =
    "trx_ap_payment_batch";

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


        /*
        ==================================================
        NORMALIZE DOCUMENT NUMBER
        ==================================================
        */

        const invoiceNo =
            String(
                header.invoice_no
                || ""
            )
            .trim();


        if (
            !invoiceNo
        ) {

            throw new Error(
                "Document No. is required."
            );

        }


        /*
        ==================================================
        CHECK DUPLICATE DOCUMENT NUMBER
        ==================================================
        */

        const {

            data:
                existingInvoice,

            error:
                duplicateCheckError

        } = await supabase

            .from(
                this.table
            )

            .select(`
                id,
                invoice_no,
                vendor_id,
                status
            `)

            .eq(
                "invoice_no",
                invoiceNo
            )

            .maybeSingle();


        /*
        ==================================================
        DUPLICATE CHECK ERROR
        ==================================================
        */

        if (
            duplicateCheckError
        ) {

            console.error(
                "CHECK AP DUPLICATE DOCUMENT NO ERROR:",
                duplicateCheckError
            );

            throw duplicateCheckError;

        }


        /*
        ==================================================
        DUPLICATE DOCUMENT FOUND
        ==================================================
        */

        if (
            existingInvoice
        ) {

            const validationError =
                new Error(
                    `Document No. "${invoiceNo}" already exists. Please use a different Document No.`
                );


            validationError.name =
                "BusinessValidationError";


            throw validationError;

        }


        /*
        ==================================================
        USE NORMALIZED DOCUMENT NUMBER
        ==================================================
        */

        header.invoice_no =
            invoiceNo;


        /*
        ==================================================
        INVOICE DATE
        ==================================================
        */

        if (!header.invoice_date) {

            throw new Error(
                "Invoice Date is required."
            );

        }


        /*
        ==================================================
        DATE RECEIVED
        ==================================================
        */

        if (!header.date_received) {

            throw new Error(
                "Date Received is required."
            );

        }


        /*
        ==================================================
        DETAIL VALIDATION
        ==================================================
        */

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


            /*
            ==================================================
            DUPLICATE DATABASE FALLBACK
            POSTGRES UNIQUE VIOLATION
            ==================================================
            */

            if (
                invoiceError.code ===
                    "23505"
            ) {

                const validationError =
                    new Error(
                        `Document No. "${invoiceNo}" already exists. Please use a different Document No.`
                    );


                validationError.name =
                    "BusinessValidationError";


                throw validationError;

            }


            throw invoiceError;

        }


        /*
        ==================================================
        VALIDATE CREATED HEADER
        ==================================================
        */

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

        /*
        ==================================================
        BUSINESS VALIDATION
        DO NOT LOG AS SYSTEM ERROR
        ==================================================
        */

        if (
            error?.name ===
            "BusinessValidationError"
        ) {

            throw error;

        }


        /*
        ==================================================
        REAL SYSTEM ERROR
        ==================================================
        */

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
async deletePaymentHistoryForAP(
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
        GET AP PAYMENT HISTORY
        ==================================================
        */

        const {

            data:
                paymentData,

            error:
                paymentFindError

        } = await supabase

            .from(
                this.paymentTable
            )

            .select(`
                id,
                account_payable_id,
                gl_journal_id
            `)

            .eq(
                "account_payable_id",
                accountPayableId
            );


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (
            paymentFindError
        ) {

            console.error(
                "GET AP PAYMENT HISTORY ERROR:",
                paymentFindError
            );


            throw paymentFindError;

        }


        /*
        ==================================================
        NORMALIZE PAYMENT DATA
        ==================================================
        */

        const payments =
            Array.isArray(
                paymentData
            )
                ? paymentData
                : [];


        /*
        ==================================================
        NO PAYMENT HISTORY
        ==================================================
        */

        if (
            payments.length ===
                0
        ) {

            return true;

        }


        /*
        ==================================================
        PROCESS EACH PAYMENT
        ==================================================
        */

        for (
            const payment
            of payments
        ) {

            const paymentId =
                payment?.id
                || null;


            const journalId =
                payment?.gl_journal_id
                || null;


            /*
            ==================================================
            PAYMENT WITHOUT GL JOURNAL

            DELETE PAYMENT ROW ONLY
            ==================================================
            */

            if (
                !journalId
            ) {

                const {

                    error:
                        paymentDeleteError

                } = await supabase

                    .from(
                        this.paymentTable
                    )

                    .delete()

                    .eq(
                        "id",
                        paymentId
                    )

                    .eq(
                        "account_payable_id",
                        accountPayableId
                    );


                if (
                    paymentDeleteError
                ) {

                    throw paymentDeleteError;

                }


                continue;

            }


            /*
            ==================================================
            GET PAYMENT GL JOURNAL
            ==================================================
            */

            const {

                data:
                    journal,

                error:
                    journalFindError

            } = await supabase

                .from(
                    "trx_gl_journal"
                )

                .select(`
                    id,
                    journal_no,
                    status,
                    source_module,
                    source_document_type,
                    source_document_id
                `)

                .eq(
                    "id",
                    journalId
                )

                .maybeSingle();


            if (
                journalFindError
            ) {

                console.error(
                    "GET AP PAYMENT GL JOURNAL ERROR:",
                    journalFindError
                );


                throw journalFindError;

            }


            /*
            ==================================================
            JOURNAL NOT FOUND

            PAYMENT ROW CAN BE REMOVED
            ==================================================
            */

            if (
                !journal
            ) {

                const {

                    error:
                        paymentDeleteError

                } = await supabase

                    .from(
                        this.paymentTable
                    )

                    .delete()

                    .eq(
                        "id",
                        paymentId
                    );


                if (
                    paymentDeleteError
                ) {

                    throw paymentDeleteError;

                }


                continue;

            }


            /*
            ==================================================
            SAFETY CHECK

            JOURNAL MUST BELONG TO
            THIS AP PAYMENT
            ==================================================
            */

            const isAPPaymentJournal =
                journal.source_module ===
                    "AP"
                &&
                journal.source_document_type ===
                    "AP_PAYMENT"
                &&
                String(
                    journal.source_document_id
                )
                ===
                String(
                    accountPayableId
                );


            if (
                !isAPPaymentJournal
            ) {

                const validationError =
                    new Error(
                        "AP Payment GL Journal does not match the Account Payable transaction."
                    );


                validationError.name =
                    "BusinessValidationError";


                throw validationError;

            }


            /*
            ==================================================
            NORMALIZE JOURNAL STATUS
            ==================================================
            */

            const journalStatus =
                String(
                    journal.status
                    ||
                    ""
                )
                .trim();


            /*
            ==================================================
            DEBUG
            ==================================================
            */

            console.log(
                "AP PAYMENT DELETE PROCESS:",
                {

                    account_payable_id:
                        accountPayableId,

                    payment_id:
                        paymentId,

                    gl_journal_id:
                        journalId,

                    journal_no:
                        journal.journal_no,

                    journal_status:
                        journalStatus

                }
            );


            /*
            ==================================================
            DRAFT JOURNAL

            FLOW:
            1. DETACH PAYMENT FROM JOURNAL
            2. DELETE JOURNAL DETAIL
            3. DELETE JOURNAL HEADER
            4. DELETE PAYMENT ROW
            ==================================================
            */

            if (
                journalStatus ===
                    "Draft"
            ) {

                /*
                ==============================================
                DETACH GL JOURNAL FROM PAYMENT
                ==============================================
                */

                const {

                    error:
                        detachError

                } = await supabase

                    .from(
                        this.paymentTable
                    )

                    .update({

                        gl_journal_id:
                            null

                    })

                    .eq(
                        "id",
                        paymentId
                    )

                    .eq(
                        "account_payable_id",
                        accountPayableId
                    );


                if (
                    detachError
                ) {

                    console.error(
                        "DETACH AP PAYMENT GL JOURNAL ERROR:",
                        detachError
                    );


                    throw detachError;

                }


                /*
                ==============================================
                DELETE JOURNAL DETAIL
                ==============================================
                */

                const {

                    error:
                        detailDeleteError

                } = await supabase

                    .from(
                        "trx_gl_journal_detail"
                    )

                    .delete()

                    .eq(
                        "journal_id",
                        journalId
                    );


                if (
                    detailDeleteError
                ) {

                    console.error(
                        "DELETE AP PAYMENT GL DETAIL ERROR:",
                        detailDeleteError
                    );


                    throw detailDeleteError;

                }


                /*
                ==============================================
                DELETE JOURNAL HEADER
                ==============================================
                */

                const {

                    error:
                        journalDeleteError

                } = await supabase

                    .from(
                        "trx_gl_journal"
                    )

                    .delete()

                    .eq(
                        "id",
                        journalId
                    )

                    .eq(
                        "source_module",
                        "AP"
                    )

                    .eq(
                        "source_document_type",
                        "AP_PAYMENT"
                    )

                    .eq(
                        "source_document_id",
                        accountPayableId
                    );


                if (
                    journalDeleteError
                ) {

                    console.error(
                        "DELETE AP PAYMENT GL JOURNAL ERROR:",
                        journalDeleteError
                    );


                    throw journalDeleteError;

                }


                /*
                ==============================================
                DELETE PAYMENT ROW
                ==============================================
                */

                const {

                    error:
                        paymentDeleteError

                } = await supabase

                    .from(
                        this.paymentTable
                    )

                    .delete()

                    .eq(
                        "id",
                        paymentId
                    );


                if (
                    paymentDeleteError
                ) {

                    throw paymentDeleteError;

                }


                continue;

            }


            /*
            ==================================================
            POSTED JOURNAL

            DO NOT DELETE ACCOUNTING HISTORY

            CHANGE JOURNAL TO VOID
            THEN DELETE PAYMENT REFERENCE
            ==================================================
            */

            if (
                journalStatus ===
                    "Posted"
            ) {

                const {

                    error:
                        journalVoidError

                } = await supabase

                    .from(
                        "trx_gl_journal"
                    )

                    .update({

                        status:
                            "Void"

                    })

                    .eq(
                        "id",
                        journalId
                    )

                    .eq(
                        "source_module",
                        "AP"
                    )

                    .eq(
                        "source_document_type",
                        "AP_PAYMENT"
                    )

                    .eq(
                        "source_document_id",
                        accountPayableId
                    );


                if (
                    journalVoidError
                ) {

                    console.error(
                        "VOID AP PAYMENT GL JOURNAL ERROR:",
                        journalVoidError
                    );


                    throw journalVoidError;

                }


                /*
                ==============================================
                DELETE PAYMENT ROW
                ==============================================
                */

                const {

                    error:
                        paymentDeleteError

                } = await supabase

                    .from(
                        this.paymentTable
                    )

                    .delete()

                    .eq(
                        "id",
                        paymentId
                    );


                if (
                    paymentDeleteError
                ) {

                    throw paymentDeleteError;

                }


                continue;

            }


            /*
            ==================================================
            VOID JOURNAL

            KEEP JOURNAL AS AUDIT HISTORY
            DELETE PAYMENT REFERENCE
            ==================================================
            */

            if (
                journalStatus ===
                    "Void"
            ) {

                const {

                    error:
                        paymentDeleteError

                } = await supabase

                    .from(
                        this.paymentTable
                    )

                    .delete()

                    .eq(
                        "id",
                        paymentId
                    );


                if (
                    paymentDeleteError
                ) {

                    throw paymentDeleteError;

                }


                continue;

            }


            /*
            ==================================================
            UNKNOWN JOURNAL STATUS

            SAFETY BLOCK
            ==================================================
            */

            const validationError =
                new Error(
                    `AP Payment GL Journal status "${journalStatus}" cannot be processed.`
                );


            validationError.name =
                "BusinessValidationError";


            throw validationError;

        }


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        console.log(
            "AP PAYMENT HISTORY CLEANUP SUCCESS:",
            {

                account_payable_id:
                    accountPayableId,

                payment_count:
                    payments.length

            }
        );


        return true;

    }

    catch (error) {

        /*
        ==================================================
        BUSINESS VALIDATION
        ==================================================
        */

        if (
            error?.name ===
            "BusinessValidationError"
        ) {

            throw error;

        }


        /*
        ==================================================
        REAL SYSTEM ERROR
        ==================================================
        */

        console.error(
            "AccountPayableService.deletePaymentHistoryForAP:",
            error
        );


        throw error;

    }

}
async cleanupInvoiceJournalForAP(
    accountPayableId,
    glJournalId
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
        FIND AP INVOICE GL JOURNAL
        ==================================================
        */

        let query =
            supabase

                .from(
                    "trx_gl_journal"
                )

                .select(`
                    id,
                    journal_no,
                    journal_date,
                    status,
                    source_module,
                    source_document_type,
                    source_document_id
                `)

                .eq(
                    "source_module",
                    "AP"
                )

                .eq(
                    "source_document_type",
                    "AP_INVOICE"
                )

                .eq(
                    "source_document_id",
                    accountPayableId
                );


        /*
        ==================================================
        USE LINKED JOURNAL ID
        IF AVAILABLE
        ==================================================
        */

        if (
            glJournalId
        ) {

            query =
                query.eq(
                    "id",
                    glJournalId
                );

        }


        const {

            data:
                journal,

            error:
                journalFindError

        } = await query

            .maybeSingle();


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (
            journalFindError
        ) {

            console.error(
                "GET AP INVOICE GL JOURNAL ERROR:",
                journalFindError
            );


            throw journalFindError;

        }


        /*
        ==================================================
        JOURNAL NOT FOUND
        ==================================================
        */

        if (
            !journal
        ) {

            console.log(
                "AP INVOICE GL JOURNAL NOT FOUND:",
                {

                    account_payable_id:
                        accountPayableId,

                    gl_journal_id:
                        glJournalId
                        ||
                        null

                }
            );


            return true;

        }


        /*
        ==================================================
        NORMALIZE JOURNAL STATUS
        ==================================================
        */

        const journalStatus =
            String(
                journal.status
                ||
                ""
            )
            .trim();


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP INVOICE GL JOURNAL CLEANUP:",
            {

                account_payable_id:
                    accountPayableId,

                gl_journal_id:
                    journal.id,

                journal_no:
                    journal.journal_no,

                journal_status:
                    journalStatus

            }
        );


        /*
        ==================================================
        DRAFT JOURNAL

        DRAFT HAS NOT BECOME
        FINAL ACCOUNTING HISTORY

        FLOW:
        1. DELETE JOURNAL DETAIL
        2. DETACH AP FROM JOURNAL
        3. DELETE JOURNAL HEADER
        ==================================================
        */

        if (
            journalStatus ===
                "Draft"
        ) {

            /*
            ==================================================
            DELETE JOURNAL DETAIL
            ==================================================
            */

            const {

                error:
                    detailDeleteError

            } = await supabase

                .from(
                    "trx_gl_journal_detail"
                )

                .delete()

                .eq(
                    "journal_id",
                    journal.id
                );


            if (
                detailDeleteError
            ) {

                console.error(
                    "DELETE AP INVOICE GL DETAIL ERROR:",
                    detailDeleteError
                );


                throw detailDeleteError;

            }


            /*
            ==================================================
            DETACH AP FROM GL JOURNAL

            IMPORTANT:
            trx_account_payable.gl_journal_id
            MUST NO LONGER REFERENCE JOURNAL
            ==================================================
            */

            const {

                error:
                    detachError

            } = await supabase

                .from(
                    this.table
                )

                .update({

                    gl_journal_id:
                        null

                })

                .eq(
                    "id",
                    accountPayableId
                )

                .eq(
                    "gl_journal_id",
                    journal.id
                );


            if (
                detachError
            ) {

                console.error(
                    "DETACH AP INVOICE GL JOURNAL ERROR:",
                    detachError
                );


                throw detachError;

            }


            /*
            ==================================================
            DELETE JOURNAL HEADER

            SAFETY FILTER:
            AP / AP_INVOICE / THIS AP
            ==================================================
            */

            const {

                error:
                    journalDeleteError

            } = await supabase

                .from(
                    "trx_gl_journal"
                )

                .delete()

                .eq(
                    "id",
                    journal.id
                )

                .eq(
                    "source_module",
                    "AP"
                )

                .eq(
                    "source_document_type",
                    "AP_INVOICE"
                )

                .eq(
                    "source_document_id",
                    accountPayableId
                );


            if (
                journalDeleteError
            ) {

                console.error(
                    "DELETE AP INVOICE GL JOURNAL ERROR:",
                    journalDeleteError
                );


                throw journalDeleteError;

            }


            /*
            ==================================================
            SUCCESS
            ==================================================
            */

            console.log(
                "AP INVOICE DRAFT JOURNAL DELETED:",
                {

                    account_payable_id:
                        accountPayableId,

                    journal_id:
                        journal.id,

                    journal_no:
                        journal.journal_no

                }
            );


            return true;

        }


        /*
        ==================================================
        POSTED JOURNAL

        DO NOT PHYSICALLY DELETE
        ACCOUNTING HISTORY

        CHANGE STATUS TO VOID
        ==================================================
        */

        if (
            journalStatus ===
                "Posted"
        ) {

            const {

                error:
                    journalVoidError

            } = await supabase

                .from(
                    "trx_gl_journal"
                )

                .update({

                    status:
                        "Void"

                })

                .eq(
                    "id",
                    journal.id
                )

                .eq(
                    "source_module",
                    "AP"
                )

                .eq(
                    "source_document_type",
                    "AP_INVOICE"
                )

                .eq(
                    "source_document_id",
                    accountPayableId
                );


            if (
                journalVoidError
            ) {

                console.error(
                    "VOID AP INVOICE GL JOURNAL ERROR:",
                    journalVoidError
                );


                throw journalVoidError;

            }


            /*
            ==================================================
            SUCCESS
            ==================================================
            */

            console.log(
                "AP INVOICE POSTED JOURNAL VOIDED:",
                {

                    account_payable_id:
                        accountPayableId,

                    journal_id:
                        journal.id,

                    journal_no:
                        journal.journal_no

                }
            );


            return true;

        }


        /*
        ==================================================
        VOID JOURNAL

        ALREADY VOID
        KEEP FOR AUDIT HISTORY
        ==================================================
        */

        if (
            journalStatus ===
                "Void"
        ) {

            console.log(
                "AP INVOICE GL JOURNAL ALREADY VOID:",
                {

                    account_payable_id:
                        accountPayableId,

                    journal_id:
                        journal.id,

                    journal_no:
                        journal.journal_no

                }
            );


            return true;

        }


        /*
        ==================================================
        UNKNOWN STATUS
        ==================================================
        */

        const validationError =
            new Error(
                `AP Invoice GL Journal status "${journalStatus}" cannot be processed for deletion.`
            );


        validationError.name =
            "BusinessValidationError";


        throw validationError;

    }

    catch (error) {

        /*
        ==================================================
        BUSINESS VALIDATION
        ==================================================
        */

        if (
            error?.name ===
            "BusinessValidationError"
        ) {

            throw error;

        }


        /*
        ==================================================
        REAL SYSTEM ERROR
        ==================================================
        */

        console.error(
            "AccountPayableService.cleanupInvoiceJournalForAP:",
            error
        );


        throw error;

    }

}
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


        if (
            !invoice
        ) {

            throw new Error(
                "Account Payable not found."
            );

        }


        /*
        ==================================================
        NORMALIZE STATUS
        ==================================================
        */

        const status =
            String(
                invoice.status
                ||
                ""
            )
            .trim();


        /*
        ==================================================
        ACCOUNTING PERIOD LOCK
        ==================================================
        */

        await this.validateAccountingPeriod(
            invoice.date_received
        );


        /*
        ==================================================
        ONLY DRAFT / VOID CAN BE DELETED

        DRAFT + PAYMENT = ALLOWED
        VOID  + PAYMENT = ALLOWED
        ==================================================
        */

        if (
            status !==
                this.STATUS.DRAFT
            &&
            status !==
                this.STATUS.VOID
        ) {

            const validationError =
                new Error(
                    "Only Draft or Void Account Payable can be deleted."
                );


            validationError.name =
                "BusinessValidationError";


            throw validationError;

        }


        /*
        ==================================================
        DEBUG TARGET
        ==================================================
        */

        console.log(
            "DELETE ACCOUNT PAYABLE TARGET:",
            {

                id:
                    invoice.id,

                invoice_no:
                    invoice.invoice_no,

                status:
                    status,

                date_received:
                    invoice.date_received,

                gl_journal_id:
                    invoice.gl_journal_id
                    ||
                    null

            }
        );


        /*
        ==================================================
        STEP 1
        CLEAN AP PAYMENT HISTORY
        ==================================================
        */

        await this.deletePaymentHistoryForAP(
            id
        );


        /*
        ==================================================
        STEP 2
        CLEAN AP INVOICE GL JOURNAL
        ==================================================
        */

        await this.cleanupInvoiceJournalForAP(
            id,
            invoice.gl_journal_id
        );


        /*
        ==================================================
        STEP 3
        DELETE ACCOUNT PAYABLE DETAIL

        EXPLICIT DELETE
        DO NOT RELY ON DATABASE CASCADE
        ==================================================
        */

        const {

            error:
                detailDeleteError

        } = await supabase

            .from(
                this.detailTable
            )

            .delete()

            .eq(
                "account_payable_id",
                id
            );


        /*
        ==================================================
        DETAIL DELETE ERROR
        ==================================================
        */

        if (
            detailDeleteError
        ) {

            console.error(
                "DELETE ACCOUNT PAYABLE DETAIL ERROR:",
                detailDeleteError
            );


            if (
                detailDeleteError.code ===
                    "23503"
            ) {

                const validationError =
                    new Error(
                        "Account Payable detail cannot be deleted because it is still referenced by another transaction."
                    );


                validationError.name =
                    "BusinessValidationError";


                throw validationError;

            }


            throw detailDeleteError;

        }


        /*
        ==================================================
        STEP 4
        DELETE ACCOUNT PAYABLE HEADER
        ==================================================
        */

        const {

            error:
                deleteError

        } = await supabase

            .from(
                this.table
            )

            .delete()

            .eq(
                "id",
                id
            );


        /*
        ==================================================
        HEADER DELETE ERROR
        ==================================================
        */

        if (
            deleteError
        ) {

            console.error(
                "DELETE ACCOUNT PAYABLE DATABASE ERROR:",
                deleteError
            );


            if (
                deleteError.code ===
                    "23503"
            ) {

                const validationError =
                    new Error(
                        "Account Payable cannot be deleted because it is still referenced by another transaction."
                    );


                validationError.name =
                    "BusinessValidationError";


                throw validationError;

            }


            throw deleteError;

        }


        /*
        ==================================================
        SUCCESS
        ==================================================
        */

        console.log(
            "ACCOUNT PAYABLE DELETED SUCCESSFULLY:",
            {

                id:
                    invoice.id,

                invoice_no:
                    invoice.invoice_no,

                status:
                    status

            }
        );


        return true;

    }

    catch (error) {

        /*
        ==================================================
        BUSINESS VALIDATION
        ==================================================
        */

        if (
            error?.name ===
            "BusinessValidationError"
        ) {

            throw error;

        }


        /*
        ==================================================
        REAL SYSTEM / DATABASE ERROR
        ==================================================
        */

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
GET OUTSTANDING AP BY VENDOR
BULK AP PAYMENT
======================================================
*/

async getOutstandingInvoicesByVendor(
    vendorId
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        const normalizedVendorId =
            Number(
                vendorId
                || 0
            );


        if (
            !Number.isFinite(
                normalizedVendorId
            )
            ||
            normalizedVendorId <= 0
        ) {

            throw new Error(
                "Vendor ID is required."
            );

        }


        /*
        ==================================================
        VALIDATE VENDOR
        ONLY ACTIVE VENDOR
        ==================================================
        */

        const vendor =
            await this.getVendorById(
                normalizedVendorId
            );


        if (
            !vendor
        ) {

            throw new Error(
                "Vendor not found or inactive."
            );

        }


        /*
        ==================================================
        GET AP INVOICES

        ELIGIBLE STATUS:
        - Complete
        - Partial Paid

        EXCLUDED:
        - Draft
        - Paid
        - Void
        ==================================================
        */

        const {

            data,
            error

        } = await supabase

            .from(
                this.table
            )

            .select(`
                id,
                vendor_id,
                invoice_no,
                po_no,
                invoice_date,
                date_received,
                due_date,
                description,
                total_amount,
                paid_amount,
                outstanding_amount,
                status,
                gl_journal_id,
                created_at
            `)

            .eq(
                "vendor_id",
                normalizedVendorId
            )

            .in(
                "status",
                [
                    this.STATUS.COMPLETE,
                    this.STATUS.PARTIAL_PAID
                ]
            )

            .gt(
                "outstanding_amount",
                0
            )

            .order(
                "due_date",
                {
                    ascending:
                        true,
                    nullsFirst:
                        false
                }
            )

            .order(
                "invoice_date",
                {
                    ascending:
                        true
                }
            )

            .order(
                "created_at",
                {
                    ascending:
                        true
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
                "AP OUTSTANDING BY VENDOR ERROR:",
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
        NORMALIZE DATA
        ==================================================
        */

        const invoices =
            (
                Array.isArray(
                    data
                )
                    ? data
                    : []
            )
            .map(
                invoice => {

                    const totalAmount =
                        Math.round(
                            Number(
                                invoice?.total_amount
                                || 0
                            )
                        );


                    const paidAmount =
                        Math.round(
                            Number(
                                invoice?.paid_amount
                                || 0
                            )
                        );


                    const outstandingAmount =
                        Math.round(
                            Number(
                                invoice?.outstanding_amount
                                || 0
                            )
                        );


                    return {

                        ...invoice,

                        total_amount:
                            totalAmount,

                        paid_amount:
                            paidAmount,

                        outstanding_amount:
                            outstandingAmount,

                        /*
                        ======================================
                        DEFAULT BULK PAYMENT UI VALUES

                        NOT DATABASE FIELDS.
                        USED LATER BY MODAL.
                        ======================================
                        */

                        selected:
                            false,

                        payment_amount:
                            0

                    };

                }
            )

            /*
            ==================================================
            DEFENSIVE FILTER

            DO NOT SHOW INVALID / ZERO OUTSTANDING
            ==================================================
            */

            .filter(
                invoice => {

                    return (
                        invoice.outstanding_amount > 0
                        &&
                        (
                            invoice.status ===
                                this.STATUS.COMPLETE
                            ||
                            invoice.status ===
                                this.STATUS.PARTIAL_PAID
                        )
                    );

                }
            );


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AP OUTSTANDING BY VENDOR:",
            {
                vendor_id:
                    normalizedVendorId,

                vendor:
                    vendor?.bp_name
                    || null,

                invoice_count:
                    invoices.length,

                invoices:
                    invoices
            }
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return {

            vendor:
                vendor,

            invoices:
                invoices

        };

    }
    catch (
        error
    ) {

        console.error(
            "AccountPayableService.getOutstandingInvoicesByVendor:",
            error
        );


        throw error;

    }

}

/*
======================================================
CREATE AP PAYMENT BATCH
BULK PAYMENT HEADER
======================================================
*/

async createPaymentBatch(
    batch
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !batch
        ) {

            throw new Error(
                "AP Payment Batch data is required."
            );

        }


        /*
        ==================================================
        PAYMENT NUMBER
        ==================================================
        */

        const paymentNo =
            String(
                batch.payment_no
                || ""
            )
            .trim();


        if (
            !paymentNo
        ) {

            throw new Error(
                "Payment Number is required."
            );

        }


        /*
        ==================================================
        PAYMENT DATE
        ==================================================
        */

        const paymentDate =
            String(
                batch.payment_date
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
        ACCOUNTING PERIOD
        ==================================================
        */

        await this.validatePaymentAccountingPeriod(
            paymentDate
        );


        /*
        ==================================================
        VENDOR
        ==================================================
        */

        const vendorId =
            Number(
                batch.vendor_id
                || 0
            );


        if (
            !Number.isFinite(
                vendorId
            )
            ||
            vendorId <= 0
        ) {

            throw new Error(
                "Vendor is required."
            );

        }


        /*
        ==================================================
        BANK ACCOUNT
        ==================================================
        */

        const bankAccountId =
            Number(
                batch.bank_account_id
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
        TOTAL PAYMENT
        ==================================================
        */

        const totalPayment =
            Number(
                batch.total_payment
                || 0
            );


        if (
            !Number.isFinite(
                totalPayment
            )
            ||
            totalPayment < 0
        ) {

            throw new Error(
                "Total Payment is invalid."
            );

        }


        /*
        ==================================================
        STATUS
        ==================================================
        */

        const rawStatus =
            String(
                batch.status
                || "Draft"
            )
            .trim();


        const validStatuses = [
            "Draft",
            "Posted",
            "Void"
        ];


        if (
            !validStatuses.includes(
                rawStatus
            )
        ) {

            throw new Error(
                "AP Payment Batch status is invalid."
            );

        }


        /*
        ==================================================
        REFERENCE
        ==================================================
        */

        const referenceNo =
            batch.reference_no
                ? String(
                    batch.reference_no
                )
                .trim()
                : null;


        /*
        ==================================================
        DESCRIPTION
        ==================================================
        */

        const description =
            batch.description
                ? String(
                    batch.description
                )
                .trim()
                : null;


        /*
        ==================================================
        GL JOURNAL
        DRAFT MAY NOT HAVE GL JOURNAL YET
        ==================================================
        */

        const glJournalId =
            batch.gl_journal_id
            || null;


        /*
        ==================================================
        PREPARE PAYLOAD
        ==================================================
        */

        const payload = {

            payment_no:
                paymentNo,

            payment_date:
                paymentDate,

            vendor_id:
                vendorId,

            bank_account_id:
                bankAccountId,

            reference_no:
                referenceNo,

            description:
                description,

            total_payment:
                Number(
                    totalPayment.toFixed(
                        2
                    )
                ),

            status:
                rawStatus,

            gl_journal_id:
                glJournalId,

            updated_at:
                new Date()
                    .toISOString()

        };


        /*
        ==================================================
        INSERT
        ==================================================
        */

        const {

            data,
            error

        } = await supabase

            .from(
                this.paymentBatchTable
            )

            .insert(
                payload
            )

            .select(`
                id,
                payment_no,
                payment_date,
                vendor_id,
                bank_account_id,
                reference_no,
                description,
                total_payment,
                status,
                gl_journal_id,
                void_reason,
                void_at,
                created_at,
                updated_at
            `)

            .single();


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
    error
) {

    const errorDetail = {

        message:
            error?.message
            || null,

        details:
            error?.details
            || null,

        hint:
            error?.hint
            || null,

        code:
            error?.code
            || null

    };


    console.error(
        "AP PAYMENT BATCH CREATE ERROR:"
    );


    console.error(
        JSON.stringify(
            errorDetail,
            null,
            2
        )
    );


    console.error(
        "AP PAYMENT BATCH RAW ERROR:",
        error
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
                "AP Payment Batch was not created."
            );

        }


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return data;

    }
    catch (
        error
    ) {

        console.error(
    "AccountPayableService.createPaymentBatch:",
    JSON.stringify(
        {
            message:
                error?.message
                || null,

            details:
                error?.details
                || null,

            hint:
                error?.hint
                || null,

            code:
                error?.code
                || null
        },
        null,
        2
    )
);


        throw error;

    }

}
/*
======================================================
GET AP PAYMENT BATCH BY ID
======================================================
*/

async getPaymentBatchById(
    batchId
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !batchId
        ) {

            throw new Error(
                "AP Payment Batch ID is required."
            );

        }


        /*
        ==================================================
        GET BATCH
        ==================================================
        */

        const {

            data,
            error

        } = await supabase

            .from(
                this.paymentBatchTable
            )

            .select(`
                id,
                payment_no,
                payment_date,
                vendor_id,
                bank_account_id,
                reference_no,
                description,
                total_payment,
                status,
                gl_journal_id,
                void_reason,
                void_at,
                created_at,
                updated_at
            `)

            .eq(
                "id",
                batchId
            )

            .maybeSingle();


        if (
            error
        ) {

            throw error;

        }


        return (
            data
            ||
            null
        );

    }
    catch (
        error
    ) {

        console.error(
            "AccountPayableService.getPaymentBatchById:",
            error
        );


        throw error;

    }

}
/*
======================================================
UPDATE AP PAYMENT BATCH
======================================================
*/

async updatePaymentBatch(
    batchId,
    updates = {}
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !batchId
        ) {

            throw new Error(
                "AP Payment Batch ID is required."
            );

        }


        if (
            !updates
            ||
            typeof updates !== "object"
        ) {

            throw new Error(
                "AP Payment Batch update data is required."
            );

        }


        /*
        ==================================================
        SAFE PAYLOAD
        ==================================================
        */

        const payload = {};


        if (
            updates.payment_no !== undefined
        ) {

            payload.payment_no =
                String(
                    updates.payment_no
                    || ""
                )
                .trim();

        }


        if (
            updates.payment_date !== undefined
        ) {

            const paymentDate =
                String(
                    updates.payment_date
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


            await this.validatePaymentAccountingPeriod(
                paymentDate
            );


            payload.payment_date =
                paymentDate;

        }


        if (
            updates.vendor_id !== undefined
        ) {

            const vendorId =
                Number(
                    updates.vendor_id
                    || 0
                );


            if (
                !Number.isFinite(
                    vendorId
                )
                ||
                vendorId <= 0
            ) {

                throw new Error(
                    "Vendor is required."
                );

            }


            payload.vendor_id =
                vendorId;

        }


        if (
            updates.bank_account_id !== undefined
        ) {

            const bankAccountId =
                Number(
                    updates.bank_account_id
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


            payload.bank_account_id =
                bankAccountId;

        }


        if (
            updates.reference_no !== undefined
        ) {

            payload.reference_no =
                updates.reference_no
                    ? String(
                        updates.reference_no
                    )
                    .trim()
                    : null;

        }


        if (
            updates.description !== undefined
        ) {

            payload.description =
                updates.description
                    ? String(
                        updates.description
                    )
                    .trim()
                    : null;

        }


        if (
            updates.total_payment !== undefined
        ) {

            const totalPayment =
                Number(
                    updates.total_payment
                    || 0
                );


            if (
                !Number.isFinite(
                    totalPayment
                )
                ||
                totalPayment < 0
            ) {

                throw new Error(
                    "Total Payment is invalid."
                );

            }


            payload.total_payment =
                Number(
                    totalPayment.toFixed(
                        2
                    )
                );

        }


        if (
            updates.status !== undefined
        ) {

            const status =
                String(
                    updates.status
                    || ""
                )
                .trim();


            const validStatuses = [
                "Draft",
                "Posted",
                "Void"
            ];


            if (
                !validStatuses.includes(
                    status
                )
            ) {

                throw new Error(
                    "AP Payment Batch status is invalid."
                );

            }


            payload.status =
                status;

        }


        if (
            updates.gl_journal_id !== undefined
        ) {

            payload.gl_journal_id =
                updates.gl_journal_id
                || null;

        }


        if (
            updates.void_reason !== undefined
        ) {

            payload.void_reason =
                updates.void_reason
                    ? String(
                        updates.void_reason
                    )
                    .trim()
                    : null;

        }


        if (
            updates.void_at !== undefined
        ) {

            payload.void_at =
                updates.void_at
                || null;

        }


        /*
        ==================================================
        UPDATED DATE
        ==================================================
        */

        payload.updated_at =
            new Date()
                .toISOString();


        /*
        ==================================================
        UPDATE
        ==================================================
        */

        const {

            data,
            error

        } = await supabase

            .from(
                this.paymentBatchTable
            )

            .update(
                payload
            )

            .eq(
                "id",
                batchId
            )

            .select(`
                id,
                payment_no,
                payment_date,
                vendor_id,
                bank_account_id,
                reference_no,
                description,
                total_payment,
                status,
                gl_journal_id,
                void_reason,
                void_at,
                created_at,
                updated_at
            `)

            .single();


        if (
            error
        ) {

            throw error;

        }


        return data;

    }
    catch (
        error
    ) {

        console.error(
            "AccountPayableService.updatePaymentBatch:",
            error
        );


        throw error;

    }

}
/*
======================================================
GET AP PAYMENT BATCH ALLOCATIONS
======================================================
*/

async getPaymentBatchAllocations(
    batchId
) {

    try {

        if (
            !batchId
        ) {

            throw new Error(
                "AP Payment Batch ID is required."
            );

        }


        const {

            data,
            error

        } = await supabase

            .from(
                this.paymentTable
            )

            .select(`
                id,
                payment_batch_id,
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
                "payment_batch_id",
                batchId
            )

            .order(
                "created_at",
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


        return (
            Array.isArray(
                data
            )
                ? data
                : []
        );

    }
    catch (
        error
    ) {

        console.error(
            "AccountPayableService.getPaymentBatchAllocations:",
            error
        );


        throw error;

    }

}
/*
======================================================
DELETE AP PAYMENT BATCH
DRAFT ONLY
======================================================
*/

async deletePaymentBatch(
    batchId
) {

    try {

        if (
            !batchId
        ) {

            throw new Error(
                "AP Payment Batch ID is required."
            );

        }


        /*
        ==================================================
        GET CURRENT BATCH
        ==================================================
        */

        const batch =
            await this.getPaymentBatchById(
                batchId
            );


        if (
            !batch
        ) {

            throw new Error(
                "AP Payment Batch not found."
            );

        }


        /*
        ==================================================
        ONLY DRAFT
        ==================================================
        */

        if (
            String(
                batch.status
                || ""
            )
            .toUpperCase()
            !==
            "DRAFT"
        ) {

            throw new Error(
                "Only Draft AP Payment Batch can be deleted."
            );

        }


        /*
        ==================================================
        DELETE
        ==================================================
        */

        const {

            error

        } = await supabase

            .from(
                this.paymentBatchTable
            )

            .delete()

            .eq(
                "id",
                batchId
            );


        if (
            error
        ) {

            throw error;

        }


        return true;

    }
    catch (
        error
    ) {

        console.error(
            "AccountPayableService.deletePaymentBatch:",
            error
        );


        throw error;

    }

}
/*
======================================================
CREATE AP PAYMENT BATCH ALLOCATIONS
DRAFT BULK PAYMENT
======================================================
*/

async createPaymentBatchAllocations(
    batchId,
    allocations
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !batchId
        ) {

            throw new Error(
                "AP Payment Batch ID is required."
            );

        }


        if (
            !Array.isArray(
                allocations
            )
            ||
            allocations.length === 0
        ) {

            throw new Error(
                "At least one AP Payment allocation is required."
            );

        }


        /*
        ==================================================
        GET BATCH
        ==================================================
        */

        const batch =
            await this.getPaymentBatchById(
                batchId
            );


        if (
            !batch
        ) {

            throw new Error(
                "AP Payment Batch not found."
            );

        }


        /*
        ==================================================
        DRAFT ONLY
        ==================================================
        */

        if (
            String(
                batch.status
                || ""
            )
            .trim()
            .toUpperCase()
            !==
            "DRAFT"
        ) {

            throw new Error(
                "AP Payment allocations can only be created for Draft batch."
            );

        }


        /*
        ==================================================
        NORMALIZE ALLOCATIONS
        ==================================================
        */

        const rows =
            [];


        for (
            const allocation
            of allocations
        ) {

            const accountPayableId =
                allocation?.account_payable_id
                || null;


            const paymentAmount =
                Math.round(
                    Number(
                        allocation?.payment_amount
                        || 0
                    )
                );


            if (
                !accountPayableId
            ) {

                throw new Error(
                    "Account Payable ID is required in allocation."
                );

            }


            if (
                !Number.isFinite(
                    paymentAmount
                )
                ||
                paymentAmount <= 0
            ) {

                throw new Error(
                    "Allocation Payment Amount must be greater than 0."
                );

            }


            /*
            ==============================================
            GET FRESH AP
            ==============================================
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
                    "Account Payable allocation not found."
                );

            }


            /*
            ==============================================
            SAME VENDOR ONLY
            ==============================================
            */

            if (
                Number(
                    invoice.vendor_id
                    || 0
                )
                !==
                Number(
                    batch.vendor_id
                    || 0
                )
            ) {

                throw new Error(
                    `Invoice ${invoice.invoice_no || ""} does not belong to selected Vendor.`
                );

            }


            /*
            ==============================================
            PAYMENT STATUS
            ==============================================
            */

            if (
                invoice.status !==
                    this.STATUS.COMPLETE
                &&
                invoice.status !==
                    this.STATUS.PARTIAL_PAID
            ) {

                throw new Error(
                    `Invoice ${invoice.invoice_no || ""} is not available for payment.`
                );

            }


            /*
            ==============================================
            INVOICE GL MUST ALREADY BE POSTED
            ==============================================
            */

            if (
                !invoice.gl_journal_id
                ||
                String(
                    invoice
                        ?.gl_journal
                        ?.status
                    || ""
                )
                !==
                "Posted"
            ) {

                throw new Error(
                    `Invoice ${invoice.invoice_no || ""} GL Journal must be Posted before payment.`
                );

            }


            /*
            ==============================================
            FRESH ACTIVE PAYMENT TOTAL

            IMPORTANT:
            DRAFT BULK ALLOCATION HAS gl_journal_id NULL,
            SO IT DOES NOT AFFECT ACTIVE PAID AMOUNT YET.
            ==============================================
            */

            const activePaid =
                Number(
                    await this.getPaymentTotal(
                        accountPayableId
                    )
                    || 0
                );


            const totalAmount =
                Math.round(
                    Number(
                        invoice.total_amount
                        || 0
                    )
                );


            const freshOutstanding =
                Math.max(
                    totalAmount
                    -
                    Math.round(
                        activePaid
                    ),
                    0
                );


            if (
                freshOutstanding <= 0
            ) {

                throw new Error(
                    `Invoice ${invoice.invoice_no || ""} is already fully paid.`
                );

            }


            if (
                paymentAmount
                >
                freshOutstanding
            ) {

                throw new Error(
                    `Payment for Invoice ${invoice.invoice_no || ""} cannot exceed Outstanding Amount.`
                );

            }


            /*
            ==============================================
            PAYMENT COMPONENT

            SAME FORMULA AS LEGACY AP PAYMENT
            ==============================================
            */

            const originalTaxPlus =
                Number(
                    invoice.tax_input_amount
                    || 0
                );


            const originalTaxMinus =
                Number(
                    invoice.withholding_tax_amount
                    || 0
                );


            const ratio =
                totalAmount > 0
                    ? (
                        paymentAmount
                        /
                        totalAmount
                    )
                    : 0;


            const taxPlusAmount =
                Number(
                    (
                        originalTaxPlus
                        *
                        ratio
                    )
                    .toFixed(
                        2
                    )
                );


            const taxMinusAmount =
                Number(
                    (
                        originalTaxMinus
                        *
                        ratio
                    )
                    .toFixed(
                        2
                    )
                );


            const dppAmount =
                Number(
                    (
                        paymentAmount
                        -
                        taxPlusAmount
                        +
                        taxMinusAmount
                    )
                    .toFixed(
                        2
                    )
                );


            /*
            ==============================================
            ROW
            ==============================================
            */

            rows.push({

                payment_batch_id:
                    batch.id,

                account_payable_id:
                    accountPayableId,

                payment_date:
                    batch.payment_date,

                bank_account_id:
                    batch.bank_account_id,

                dpp_amount:
                    dppAmount,

                tax_plus_amount:
                    taxPlusAmount,

                tax_minus_amount:
                    taxMinusAmount,

                payment_amount:
                    paymentAmount,

                reference_no:
                    batch.reference_no
                    || null,

                description:
                    batch.description
                    || (
                        `Payment AP ${
                            invoice.invoice_no
                            || ""
                        }`
                    ),

                /*
                ==========================================
                DRAFT ALLOCATION
                NO ACTIVE GL YET
                ==========================================
                */

                gl_journal_id:
                    null

            });

        }


        /*
        ==================================================
        VALIDATE TOTAL
        ==================================================
        */

        const allocationTotal =
            rows.reduce(
                (
                    total,
                    row
                ) => {

                    return (
                        total
                        +
                        Number(
                            row.payment_amount
                            || 0
                        )
                    );

                },
                0
            );


        if (
            Math.abs(
                allocationTotal
                -
                Number(
                    batch.total_payment
                    || 0
                )
            )
            >
            0.01
        ) {

            throw new Error(
                "Allocation Total does not match AP Payment Batch Total."
            );

        }


        /*
        ==================================================
        PREVENT DUPLICATE ALLOCATION IN SAME BATCH
        ==================================================
        */

        const uniqueInvoiceIds =
            new Set(
                rows.map(
                    row =>
                        String(
                            row.account_payable_id
                        )
                )
            );


        if (
            uniqueInvoiceIds.size
            !==
            rows.length
        ) {

            throw new Error(
                "Duplicate Account Payable invoice found in payment allocation."
            );

        }


        /*
        ==================================================
        INSERT
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
                rows
            )

            .select(`
                id,
                payment_batch_id,
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
            `);


        if (
            error
        ) {

            console.error(
                "AP PAYMENT BATCH ALLOCATION INSERT ERROR:",
                error
            );


            throw error;

        }


        const created =
            Array.isArray(
                data
            )
                ? data
                : [];


        if (
            created.length
            !==
            rows.length
        ) {

            throw new Error(
                "Not all AP Payment allocations were created."
            );

        }


        return created;

    }
    catch (
        error
    ) {

        console.error(
            "AccountPayableService.createPaymentBatchAllocations:",
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
        GET ALL PAYMENT ROWS FOR THIS AP

        FINOVA RULE:

        BULK PAYMENT:
        - Draft batch  = ACTIVE immediately after Save
        - Posted batch = ACTIVE
        - Void batch   = INACTIVE

        LEGACY PAYMENT WITHOUT BATCH:
        - Active only when gl_journal_id IS NOT NULL
        ==================================================
        */

        const {
            data: paymentRows,
            error: paymentError
        } = await supabase

            .from(
                this.paymentTable
            )

            .select(`
                id,
                payment_batch_id,
                payment_amount,
                gl_journal_id
            `)

            .eq(
                "account_payable_id",
                accountPayableId
            );


        if (
            paymentError
        ) {

            console.error(
                "AP PAYMENT TOTAL ERROR:",
                {
                    message:
                        paymentError.message,

                    details:
                        paymentError.details,

                    hint:
                        paymentError.hint,

                    code:
                        paymentError.code
                }
            );

            throw paymentError;

        }


        /*
        ==================================================
        GET BULK PAYMENT BATCH STATUS
        ==================================================
        */

        const batchIds =
            [
                ...new Set(
                    (
                        paymentRows
                        || []
                    )
                    .map(
                        payment =>
                            payment?.payment_batch_id
                    )
                    .filter(
                        Boolean
                    )
                )
            ];


        const batchStatusMap =
            new Map();


        if (
            batchIds.length > 0
        ) {

            const {
                data: batches,
                error: batchError
            } = await supabase

                .from(
                    this.paymentBatchTable
                )

                .select(`
                    id,
                    status
                `)

                .in(
                    "id",
                    batchIds
                );


            if (
                batchError
            ) {

                console.error(
                    "AP PAYMENT BATCH STATUS ERROR:",
                    batchError
                );

                throw batchError;

            }


            for (
                const batch
                of (
                    batches
                    || []
                )
            ) {

                batchStatusMap.set(
                    String(
                        batch.id
                    ),
                    String(
                        batch.status
                        || ""
                    )
                    .trim()
                    .toUpperCase()
                );

            }

        }


        /*
        ==================================================
        FILTER ACTIVE PAYMENTS
        ==================================================
        */

        const activePayments =
            (
                paymentRows
                || []
            )
            .filter(
                payment => {

                    const batchId =
                        payment?.payment_batch_id;


                    /*
                    ======================================
                    BULK PAYMENT
                    Draft + Posted count immediately.
                    Void must not count.
                    ======================================
                    */

                    if (
                        batchId
                    ) {

                        const batchStatus =
                            batchStatusMap.get(
                                String(
                                    batchId
                                )
                            )
                            || "";


                        return (
                            batchStatus !== ""
                            &&
                            batchStatus !== "VOID"
                        );

                    }


                    /*
                    ======================================
                    LEGACY PAYMENT
                    ======================================
                    */

                    return Boolean(
                        payment?.gl_journal_id
                    );

                }
            );


        /*
        ==================================================
        CALCULATE TOTAL PAID
        ==================================================
        */

        const totalPaid =
            activePayments
            .reduce(
                (
                    total,
                    payment
                ) => {

                    const amount =
                        Number(
                            payment?.payment_amount
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


        const normalizedTotalPaid =
            Number(
                totalPaid.toFixed(
                    2
                )
            );


        console.log(
            "AP PAYMENT TOTAL:",
            {
                account_payable_id:
                    accountPayableId,

                payment_row_count:
                    paymentRows?.length
                    || 0,

                active_payment_count:
                    activePayments.length,

                total_paid:
                    normalizedTotalPaid,

                payments:
                    activePayments
            }
        );


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

const rawTotalAmount =
    Number(
        invoice.total_amount
        ||
        0
    );


if (
    !Number.isFinite(
        rawTotalAmount
    )
    ||
    rawTotalAmount <= 0
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

const rawPaidAmount =
    Number(
        await this.getPaymentTotal(
            accountPayableId
        )
        ||
        0
    );


if (
    !Number.isFinite(
        rawPaidAmount
    )
    ||
    rawPaidAmount < 0
) {

    throw new Error(
        "Account Payable Paid Amount is invalid."
    );

}


/*
==================================================
NORMALIZE TO WHOLE RUPIAH
FINOVA DISPLAY = NO DECIMAL
==================================================
*/

const totalAmount =
    Math.round(
        rawTotalAmount
    );


const paidAmount =
    Math.round(
        rawPaidAmount
    );


/*
==================================================
DEBUG
==================================================
*/

console.log(
    "AP PAYMENT STATUS NORMALIZED:",
    {
        raw_total_amount:
            rawTotalAmount,

        raw_paid_amount:
            rawPaidAmount,

        total_amount:
            totalAmount,

        paid_amount:
            paidAmount
    }
);


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
WHOLE RUPIAH
==================================================
*/

const outstandingAmount =
    Math.max(
        totalAmount
        -
        paidAmount,
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
    paidAmount,

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