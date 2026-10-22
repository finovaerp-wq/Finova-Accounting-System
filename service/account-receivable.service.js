/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : ACCOUNT RECEIVABLE
FILE    : account-receivable.service.js
VERSION : 1.0.0
==========================================================
*/


/*
==========================================================
IMPORT
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";


/*
==========================================================
ACCOUNT RECEIVABLE SERVICE
==========================================================
*/

export class AccountReceivableService {


    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor() {

        this.table =
            TABLE.ACCOUNT_RECEIVABLE;

        this.detailTable =
            TABLE.ACCOUNT_RECEIVABLE_DETAIL;

        this.paymentTable =
            TABLE.ACCOUNT_RECEIVABLE_PAYMENT
            ||
            "trx_account_receivable_payment";

    }

    /*
======================================================
GET ACCOUNTING PERIOD
ACCOUNT RECEIVABLE
BASIS : INVOICE DATE
======================================================
*/


async getAccountingPeriod(invoiceDate) {
    try {
        if (!invoiceDate) {
            throw new Error("Invoice Date is required.");
        }

        // Ambil tahun dan bulan dari Invoice Date
        const date = new Date(`${invoiceDate}T00:00:00`);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        if (
            Number.isNaN(date.getTime()) ||
            !year ||
            month < 1 ||
            month > 12
        ) {
            throw new Error(
                `Invalid Invoice Date: ${invoiceDate}`
            );
        }

        const {
            data,
            error
        } = await supabase
            .from("mst_accounting_period")
            .select(`
                id,
                period_year,
                period_month,
                period_code,
                status,
                company_id
            `)
            .eq("period_year", year)
            .eq("period_month", month)
            .maybeSingle();

        if (error) {
            console.error(
                "AR GET ACCOUNTING PERIOD ERROR:",
                {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                }
            );

            throw error;
        }

        if (!data) {
            throw new Error(
                `Accounting Period ${year}-${String(month).padStart(2, "0")} is not configured.`
            );
        }

        return data;

    } catch (error) {
        console.error(
            "AccountReceivableService.getAccountingPeriod:",
            error
        );

        throw error;
    }
}



/*
======================================================
VALIDATE ACCOUNTING PERIOD
ACCOUNT RECEIVABLE
BASIS : INVOICE DATE
======================================================
*/


async validateAccountingPeriod(invoiceDate) {
    try {
        const period = await this.getAccountingPeriod(
            invoiceDate
        );

        const status = String(
            period?.status || ""
        ).trim().toLowerCase();

        if (status !== "open") {
            const periodCode =
                period?.period_code ||
                `${period?.period_year}-${String(
                    period?.period_month || ""
                ).padStart(2, "0")}`;

            throw new Error(
                `Accounting Period ${periodCode} is Closed. Invoice Date ${invoiceDate} cannot be processed.`
            );
        }

        return period;

    } catch (error) {
        console.error(
            "AccountReceivableService.validateAccountingPeriod:",
            error
        );

        throw error;
    }
}

/*
======================================================
GET PAYMENT ACCOUNTING PERIOD
ACCOUNT RECEIVABLE PAYMENT
BASIS : PAYMENT DATE
======================================================
*/


async getPaymentAccountingPeriod(paymentDate) {
    try {
        if (!paymentDate) {
            throw new Error("Payment Date is required.");
        }

        const date = new Date(`${paymentDate}T00:00:00`);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        if (
            Number.isNaN(date.getTime()) ||
            !year ||
            month < 1 ||
            month > 12
        ) {
            throw new Error(
                `Invalid Payment Date: ${paymentDate}`
            );
        }

        const {
            data,
            error
        } = await supabase
            .from("mst_accounting_period")
            .select(`
                id,
                period_year,
                period_month,
                period_code,
                status,
                company_id
            `)
            .eq("period_year", year)
            .eq("period_month", month)
            .maybeSingle();

        if (error) {
            console.error(
                "AR PAYMENT GET ACCOUNTING PERIOD ERROR:",
                {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                }
            );

            throw error;
        }

        if (!data) {
            throw new Error(
                `Accounting Period ${year}-${String(month).padStart(2, "0")} is not configured for Payment Date ${paymentDate}.`
            );
        }

        return data;

    } catch (error) {
        console.error(
            "AccountReceivableService.getPaymentAccountingPeriod:",
            error
        );

        throw error;
    }
}



/*
======================================================
VALIDATE PAYMENT ACCOUNTING PERIOD
ACCOUNT RECEIVABLE PAYMENT
BASIS : PAYMENT DATE
======================================================
*/

async validatePaymentAccountingPeriod(
    paymentDate
) {

    try {

        /*
        ==================================================
        GET ACCOUNTING PERIOD
        ==================================================
        */

        const period =
            await this.getPaymentAccountingPeriod(
                paymentDate
            );


        /*
        ==================================================
        NORMALIZE STATUS
        ==================================================
        */

        const status =
            String(
                period?.status
                ||
                ""
            )
            .trim()
            .toLowerCase();


        /*
        ==================================================
        PERIOD MUST BE OPEN
        ==================================================
        */

        if (
            status !== "open"
        ) {

            throw new Error(
                `Accounting Period ${period.period} is Closed. Payment Date ${paymentDate} cannot be processed.`
            );

        }


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return period;

    }

    catch (
        error
    ) {

        console.error(
            "AccountReceivableService.validatePaymentAccountingPeriod:",
            error
        );


        throw error;

    }

}
    /*
======================================================
STATUS
======================================================
*/

get STATUS() {

    return {

        DRAFT:
            "Draft",

        COMPLETE:
            "Complete",

        PARTIAL_PAID:
            "Partial Paid",

        PAID:
            "Paid",

        VOID:
            "Void"

    };

}


    /*
======================================================
GET ALL
======================================================
*/

async getAll() {

    try {

        /*
        ==================================================
        QUERY
        ==================================================
        */

        const {

            data,

            error

        } =
            await supabase

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

                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ACCOUNT RECEIVABLE GET ALL ERROR:",
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
        DEBUG
        ==================================================
        */

        console.log(
            "ACCOUNT RECEIVABLE GET ALL:",
            data
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return Array.isArray(
            data
        )
            ? data
            : [];

    }

    catch (error) {

        console.error(
            "AccountReceivableService.getAll:",
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
                    "Account Receivable ID is required."
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
                    "AR GET BY ID HEADER ERROR:",
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
                        "AR GET BY ID GL JOURNAL ERROR:",
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
                    data || null;

            }


            /*
            ==================================================
            DETAIL

            IMPORTANT:
            DO NOT EMBED mst_chart_of_accounts HERE.

            trx_account_receivable_detail has multiple
            references to mst_chart_of_accounts:

            - revenue_account_id
            - tax_plus_account_id
            - tax_minus_account_id

            Direct embedding can become ambiguous in PostgREST.
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
                    "account_receivable_id",
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
                    "AR GET BY ID DETAIL ERROR:",
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
                "AR GET BY ID HEADER:",
                header
            );


            console.log(
                "AR GET BY ID GL JOURNAL:",
                glJournal
            );


            console.log(
                "AR GET BY ID DETAILS:",
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
                    details || []

            };

        }

        catch (error) {

            console.error(
                "AccountReceivableService.getById ERROR:",
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
COMPLETE ACCOUNT RECEIVABLE
DRAFT -> COMPLETE
======================================================
*/

async completeInvoice(
    id
) {

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
        UPDATE STATUS
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
            !Array.isArray(
                data
            )
            ||
            data.length === 0
        ) {

            throw new Error(
                "Account Receivable could not be completed. The document is no longer in Draft status."
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
            "AccountReceivableService.completeInvoice:",
            error
        );


        throw error;

    }

}
/*
======================================================
COMPLETE
COMPATIBILITY ALIAS
======================================================
*/

async complete(
    id
) {

    return this.completeInvoice(
        id
    );

}
    /*
    ======================================================
    LINK GL JOURNAL
    ======================================================
    */

    async linkGLJournal(
        arId,
        journalId
    ) {

        try {

            console.log(
                "========== LINK AR GL JOURNAL =========="
            );


            console.log(
                "AR ID      :",
                arId
            );


            console.log(
                "JOURNAL ID :",
                journalId
            );


            if (!arId) {

                throw new Error(
                    "Account Receivable ID is required."
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
                    arId
                )

                .select()

                .single();


            if (error) {

                throw error;

            }


            if (!data) {

                throw new Error(
                    "Failed to link GL Journal to Account Receivable."
                );

            }


            console.log(
                "AR GL JOURNAL LINKED:",
                data
            );


            return data;

        }

        catch (error) {

            console.error(
                "AccountReceivableService.linkGLJournal:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    UPDATE GL JOURNAL ID
    ALIAS FOR COMPATIBILITY
    ======================================================
    */

    async updateGLJournalId(
        id,
        journalId
    ) {

        return this.linkGLJournal(
            id,
            journalId
        );

    }


    /*
======================================================
SEARCH ACCOUNT RECEIVABLE
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
            status.toLowerCase() !== "all"
        ) {

            const normalizedStatus =
                status.toLowerCase();


            /*
            ==============================================
            NOT COMPLETED
            COMPATIBILITY WITH AP LOGIC
            ==============================================
            */

            if (
                normalizedStatus ===
                "not_completed"
            ) {

                query =
                    query.eq(
                        "status",
                        this.STATUS.DRAFT
                    );

            }


            /*
            ==============================================
            COMPLETED
            COMPATIBILITY WITH AP LOGIC
            ==============================================
            */
            else if (
                normalizedStatus ===
                "completed"
            ) {

                query =
                    query.eq(
                        "status",
                        this.STATUS.COMPLETE
                    );

            }


            /*
            ==============================================
            AR STANDARD STATUS
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
        NEWEST CREATED AR AT BOTTOM
        SAME PATTERN AS AP
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

            console.error(
                "AR SEARCH DATABASE ERROR:",
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
        FOLLOW FIND BY
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
                        INVOICE NO
                        ======================================
                        */

                        const invoiceNo =
                            String(
                                invoice?.invoice_no
                                || ""
                            )
                            .trim()
                            .toLowerCase();


                        /*
                        ======================================
                        PO NO
                        ======================================
                        */

                        const poNo =
                            String(
                                invoice?.po_no
                                || ""
                            )
                            .trim()
                            .toLowerCase();


                        /*
                        ======================================
                        DESCRIPTION
                        ======================================
                        */

                        const description =
                            String(
                                invoice?.description
                                || ""
                            )
                            .trim()
                            .toLowerCase();


                        /*
                        ======================================
                        CUSTOMER NAME
                        ======================================
                        */

                        const customerName =
                            String(
                                invoice
                                    ?.mst_business_partner
                                    ?.bp_name
                                || ""
                            )
                            .trim()
                            .toLowerCase();


                        /*
                        ======================================
                        CUSTOMER CODE
                        ======================================
                        */

                        const customerCode =
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

                            /*
                            ==================================
                            INVOICE NO
                            ==================================
                            */

                            case "invoice_no":

                                return invoiceNo.includes(
                                    keyword
                                );


                            /*
                            ==================================
                            CUSTOMER
                            ==================================
                            */

                            case "customer":

                            case "customer_name":

                                return (
                                    customerName.includes(
                                        keyword
                                    )
                                    ||
                                    customerCode.includes(
                                        keyword
                                    )
                                );


                            /*
                            ==================================
                            PO NO
                            ==================================
                            */

                            case "po_no":

                                return poNo.includes(
                                    keyword
                                );


                            /*
                            ==================================
                            DESCRIPTION
                            ==================================
                            */

                            case "description":

                                return description.includes(
                                    keyword
                                );


                            /*
                            ==================================
                            DEFAULT
                            SEARCH ALL
                            ==================================
                            */

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

                                    customerName.includes(
                                        keyword
                                    )

                                    ||

                                    customerCode.includes(
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
            "AR SERVICE SEARCH RESULT:",
            {

                filters: {

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

                },

                total:
                    result.length,

                invoice_dates:
                    result.map(
                        invoice =>
                            invoice?.invoice_date
                    ),

                data:
                    result

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
            "AccountReceivableService.search:",
            error
        );


        throw error;

    }

}
    /*
======================================================
GET CUSTOMERS
MULTI COMPANY SAFE
======================================================
*/

async getCustomers() {

    try {

        /*
        ==================================================
        GET ACTIVE CUSTOMER

        IMPORTANT:
        - COMPANY FILTER IS HANDLED BY SUPABASE RLS
        - DO NOT HARDCODE COMPANY_ID
        - DO NOT EMBED TOP HERE
        ==================================================
        */

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
                company_id
            `)

            .eq(
                "bp_type",
                "Customer"
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


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (error) {

            console.error(
                "AR GET CUSTOMERS ERROR:",
                {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                }
            );

            throw error;

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR CUSTOMERS LOADED:",
            {
                total:
                    Array.isArray(data)
                        ? data.length
                        : 0,

                customers:
                    data || []
            }
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return Array.isArray(data)
            ? data
            : [];

    }

    catch (error) {

        console.error(
            "AccountReceivableService.getCustomers:",
            error
        );

        throw error;

    }

}


/*
======================================================
GET CUSTOMER BY ID
WITH TERM OF PAYMENT
======================================================
*/

async getCustomerById(id) {
    try {
        if (!id) {
            throw new Error("Customer ID is required.");
        }

        // GET CUSTOMER
        const {
            data: customer,
            error: customerError
        } = await supabase
            .from(TABLE.BUSINESS_PARTNER)
            .select(`
                id,
                bp_code,
                bp_name,
                bp_type,
                top_id,
                is_active
            `)
            .eq("id", id)
            .eq("bp_type", "Customer")
            .eq("is_active", true)
            .single();

        if (customerError) {
            console.error(
                "AR GET CUSTOMER ERROR:",
                customerError
            );

            throw customerError;
        }

        // CUSTOMER TANPA TOP
        if (!customer.top_id) {
            console.warn(
                "AR CUSTOMER HAS NO TOP:",
                {
                    customerId: customer.id,
                    customerName: customer.bp_name
                }
            );

            return {
                ...customer,
                mst_term_of_payment: null
            };
        }

        // GET TOP BERDASARKAN top_id
        const {
            data: top,
            error: topError
        } = await supabase
            .from("mst_term_of_payment")
            .select(`
                id,
                top_code,
                top_name,
                days
            `)
            .eq("id", customer.top_id)
            .maybeSingle();

        if (topError) {
            console.error(
                "AR GET TOP ERROR:",
                {
                    message: topError.message,
                    details: topError.details,
                    hint: topError.hint,
                    code: topError.code
                }
            );

            throw topError;
        }

        // DEBUG CUSTOMER DAN TOP
        console.log("AR CUSTOMER TOP DEBUG", {
            customerId: customer.id,
            customerName: customer.bp_name,
            topId: customer.top_id,
            topData: top,
            topDays: top?.days
        });

        return {
            ...customer,
            mst_term_of_payment: top || null
        };

    } catch (error) {
        console.error(
            "AccountReceivableService.getCustomerById:",
            {
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code,
                raw: error
            }
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
                        ascending:
                            true
                    }
                );


            if (error) {

                throw error;

            }


            return data || [];

        }

        catch (error) {

            console.error(
                "AccountReceivableService.getCOA:",
                error
            );


            throw error;

        }

    }


    /*
======================================================
CALCULATE DUE DATE
ACCOUNT RECEIVABLE

BASIS:
INVOICE DATE + TERM OF PAYMENT DAYS
======================================================
*/

calculateDueDate(
    invoiceDate,
    customer
) {

    /*
    ==================================================
    VALIDATE INVOICE DATE
    ==================================================
    */

    if (
        !invoiceDate
    ) {

        return "";

    }


    /*
    ==================================================
    TERM OF PAYMENT
    ==================================================
    */

    const topRelation =
        customer?.mst_term_of_payment;

    // PostgREST relations can be returned as an object or a one-item array.
    const top =
        Array.isArray(topRelation)
            ? topRelation[0]
            : topRelation;

    const rawDays = top?.days;
    const days = Number(rawDays ?? 0);

    if (!Number.isFinite(days) || days < 0) {
        return "";
    }


    /*
    ==================================================
    CREATE DATE
    ==================================================
    */

    // Use UTC components so YYYY-MM-DD does not shift to the previous day
    // when the browser timezone is ahead of UTC (e.g. Indonesia).
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(invoiceDate);
    if (!match) {
        return "";
    }

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const dayOfMonth = Number(match[3]);
    const date = new Date(Date.UTC(year, monthIndex, dayOfMonth));

    if (
        Number.isNaN(date.getTime()) ||
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== monthIndex ||
        date.getUTCDate() !== dayOfMonth
    ) {
        return "";
    }


    /*
    ==================================================
    ADD TOP DAYS
    ==================================================
    */

    date.setUTCDate(
        date.getUTCDate() + days
    );


    /*
    ==================================================
    RETURN YYYY-MM-DD
    ==================================================
    */

    return date.toISOString().slice(0, 10);

}


    /*
    ======================================================
    CALCULATE DETAIL
    ======================================================
    */

    calculateDetailAmount(
        detail = {}
    ) {

        const quantity =
            Number(
                detail.quantity
                || 0
            );


        const unitPrice =
            Number(
                detail.unit_price
                || 0
            );


        const taxOutputRate =
            Number(
                detail.tax_output_rate
                || 0
            );


        const withholdingRate =
            Number(
                detail.withholding_tax_rate
                || 0
            );


        const lineAmount =
            quantity
            *
            unitPrice;


        const taxOutputAmount =
            lineAmount
            *
            taxOutputRate
            /
            100;


        const withholdingTaxAmount =
            lineAmount
            *
            withholdingRate
            /
            100;


        const totalAmount =
            lineAmount
            +
            taxOutputAmount
            -
            withholdingTaxAmount;


        return {

            line_amount:
                Number(
                    lineAmount.toFixed(
                        2
                    )
                ),

            tax_output_amount:
                Number(
                    taxOutputAmount.toFixed(
                        2
                    )
                ),

            withholding_tax_amount:
                Number(
                    withholdingTaxAmount.toFixed(
                        2
                    )
                ),

            total_amount:
                Number(
                    totalAmount.toFixed(
                        2
                    )
                )

        };

    }


    /*
    ======================================================
    CALCULATE TOTALS
    ======================================================
    */

    calculateTotals(
        details = []
    ) {

        let subtotal = 0;
        let taxOutputAmount = 0;
        let withholdingTaxAmount = 0;

        details.forEach(detail => {

            const calculated = this.calculateDetailAmount(detail);

            // Existing AR rows use database columns `amount` and `tax_id`;
            // some legacy rows do not have quantity/unit_price populated.
            // Preserve stored amounts when recalculation would otherwise zero them.
            const storedLineAmount = Number(
                detail?.line_amount ?? detail?.amount ?? 0
            );
            const storedTaxOutput = Number(
                detail?.tax_output_amount ?? detail?.tax_plus_amount ?? 0
            );
            const storedWithholding = Number(
                detail?.withholding_tax_amount ?? detail?.tax_minus_amount ?? 0
            );

            const lineAmount = calculated.line_amount > 0
                ? calculated.line_amount
                : storedLineAmount;
            const lineTaxOutput = calculated.tax_output_amount > 0
                ? calculated.tax_output_amount
                : storedTaxOutput;
            const lineWithholding = calculated.withholding_tax_amount > 0
                ? calculated.withholding_tax_amount
                : storedWithholding;

            subtotal += lineAmount;
            taxOutputAmount += lineTaxOutput;
            withholdingTaxAmount += lineWithholding;
        });

        const totalAmount = subtotal + taxOutputAmount - withholdingTaxAmount;

        return {
            subtotal: Number(subtotal.toFixed(2)),
            tax_output_amount: Number(taxOutputAmount.toFixed(2)),
            withholding_tax_amount: Number(withholdingTaxAmount.toFixed(2)),
            total_amount: Number(totalAmount.toFixed(2)),
            paid_amount: 0,
            outstanding_amount: Number(totalAmount.toFixed(2))
        };

    }

    /*
======================================================
CALCULATE HEADER TOTALS
COMPATIBILITY ALIAS
======================================================
*/

calculateHeaderTotals(
    details = []
) {

    return this.calculateTotals(
        details
    );

}
/*
======================================================
EXPORT ACCOUNT RECEIVABLE TO EXCEL
======================================================
*/

exportExcel() {

    try {

        /*
        ==================================================
        DATA
        ==================================================
        */

        const sourceData =
            Array.isArray(
                this.filteredData
            )
                ? this.filteredData
                : [];


        if (
            !sourceData.length
        ) {

            this.showError(
                "No Account Receivable data available."
            );

            return;

        }


        /*
        ==================================================
        PREPARE DATA
        ==================================================
        */

        const rows =
            sourceData.map(
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

                    "Customer Code":
                        item
                            .mst_business_partner
                            ?.bp_code
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

                    Subtotal:
                        Number(
                            item.subtotal
                            || 0
                        ),

                    "Tax (+)":
                        Number(
                            item.tax_output_amount
                            || 0
                        ),

                    "Tax (-)":
                        Number(
                            item.withholding_tax_amount
                            || 0
                        ),

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


        /*
        ==================================================
        EXPORT
        ==================================================
        */

        ExcelExportService.export(
            rows,
            "Account Receivable",
            "Account Receivable"
        );


        console.log(
            "Account Receivable Excel exported."
        );

    }

    catch (error) {

        console.error(
            "AccountReceivable.exportExcel:",
            error
        );


        this.showError(
            error.message
            ||
            "Failed to export Account Receivable."
        );

    }

}
    /*
======================================================
CREATE
ACCOUNT RECEIVABLE
WITH ACCOUNTING PERIOD VALIDATION
BASIS : INVOICE DATE
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
                "Account Receivable header is required."
            );

        }

        if (!header.customer_id) {

            throw new Error(
                "Customer is required."
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

        if (!header.due_date) {

            throw new Error(
                "Due Date is required."
            );

        }

        if (!details.length) {

            throw new Error(
                "At least one invoice detail is required."
            );

        }

        /*
        ==================================================
        ACCOUNTING PERIOD VALIDATION
        AR ACCOUNTING DATE = INVOICE DATE
        ==================================================
        */

        await this.validateAccountingPeriod(
            header.invoice_date
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
        CALCULATE HEADER
        ==================================================
        */

        const totals =
            this.calculateTotals(
                calculatedDetails
            );

        /*
        ==================================================
        RESOLVE ACTIVE COMPANY CONTEXT
        ==================================================
        */

        const {
            data: effectiveCompanyId,
            error: companyContextError
        } = await supabase.rpc(
            "finova_effective_company_id"
        );

        if (companyContextError) {
            console.error(
                "AR EFFECTIVE COMPANY CONTEXT ERROR:",
                companyContextError
            );
            throw companyContextError;
        }

        if (!effectiveCompanyId) {
            throw new Error(
                "FINOVA: active company context is required before saving Account Receivable."
            );
        }

        /*
        ==================================================
        PREPARE HEADER USING ACTUAL DATABASE COLUMNS
        trx_account_receivable has dpp_amount, not subtotal.
        It has no po_no or withholding_tax_amount column.
        ==================================================
        */

        const paidAmount = Number(header.paid_amount || 0);
        const totalAmount = Number(totals.total_amount || 0);

        const headerPayload = {
            company_id: effectiveCompanyId,
            customer_id: header.customer_id,
            invoice_no: header.invoice_no,
            invoice_date: header.invoice_date || null,
            due_date: header.due_date || null,
            source_po_no: header.po_no ?? header.source_po_no ?? null,
            reference_no: header.reference_no || null,
            description: header.description || null,
            currency: header.currency || "IDR",
            dpp_amount: Number(totals.subtotal || 0),
            tax_output_amount: Number(totals.tax_output_amount || 0),
            total_amount: totalAmount,
            paid_amount: paidAmount,
            outstanding_amount: Math.max(0, totalAmount - paidAmount),
            status: header.status || this.STATUS.DRAFT,
            gl_journal_id: header.gl_journal_id || null,
            created_by: header.created_by || null
        };

        /*
        ==================================================
        INSERT HEADER
        ==================================================
        */

        const {
            data: invoice,
            error: invoiceError
        } = await supabase
            .from(this.table)
            .insert(headerPayload)
            .select()
            .single();

        /*
        ==================================================
        HEADER ERROR
        ==================================================
        */

        if (invoiceError) {

            throw invoiceError;

        }

        /*
        ==================================================
        PREPARE DETAILS
        ==================================================
        */

        const detailRows =
            calculatedDetails.map(
                (detail, index) => ({
                    // Explicitly map to the real columns in
                    // trx_account_receivable_detail.
                    company_id: effectiveCompanyId,
                    account_receivable_id: invoice.id,
                    line_no: Number(detail.line_no || index + 1),
                    description: detail.description || null,
                    account_id: detail.revenue_account_id ?? detail.account_id ?? null,
                    quantity: Number(detail.quantity || 0),
                    unit_price: Number(detail.unit_price || 0),
                    amount: Number(
                        (detail.line_amount ?? detail.amount ?? 0)
                    ),
                    // Persist Tax (+) and Tax (-) independently.
                    tax_id: detail.tax_id ?? detail.tax_plus_id ?? detail.tax_minus_id ?? null,
                    tax_plus_id: detail.tax_plus_id ?? null,
                    tax_minus_id: detail.tax_minus_id ?? null,
                    tax_plus_rate: Number(detail.tax_plus_rate ?? detail.tax_output_rate ?? 0),
                    tax_minus_rate: Number(detail.tax_minus_rate ?? detail.withholding_tax_rate ?? 0),
                    tax_plus_amount: Number(detail.tax_plus_amount ?? detail.tax_output_amount ?? 0),
                    tax_minus_amount: Number(detail.tax_minus_amount ?? detail.withholding_tax_amount ?? 0)
                })
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
        CLEAN HEADER
        ==================================================
        */

        if (detailError) {

            await supabase

                .from(
                    this.table
                )

                .delete()

                .eq(
                    "id",
                    invoice.id
                );

            throw detailError;

        }

        /*
        ==================================================
        RETURN
        ==================================================
        */

        return {

            ...invoice,

            details:
                insertedDetails
                ||
                []

        };

    }

    catch (error) {

        console.error(
            "AccountReceivableService.create:",
            error
        );

        throw error;

    }

}


    /*
======================================================
UPDATE
ACCOUNT RECEIVABLE
WITH ACCOUNTING PERIOD VALIDATION
BASIS : INVOICE DATE
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

        if (
            !id
        ) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        VALIDATE HEADER
        ==================================================
        */

        if (
            !header
        ) {

            throw new Error(
                "Account Receivable header is required."
            );

        }


        /*
        ==================================================
        GET CURRENT ACCOUNT RECEIVABLE
        ==================================================
        */

        const current =
            await this.getById(
                id
            );


        const currentHeader =
            current?.header
            ||
            null;


        if (
            !currentHeader
        ) {

            throw new Error(
                "Account Receivable not found."
            );

        }


        /*
        ==================================================
        STATUS GUARD

        ACCOUNT RECEIVABLE MAY ONLY BE EDITED WHILE DRAFT.
        THIS RULE IS ENFORCED IN THE SERVICE LAYER SO IT
        CANNOT BE BYPASSED BY CALLING update() DIRECTLY.
        ==================================================
        */

        const currentStatus =
            String(currentHeader.status || "Draft")
                .trim()
                .toLowerCase();

        if (currentStatus !== "draft") {
            throw new Error(
                "Only Draft Account Receivable can be edited."
            );
        }


        /*
        ==================================================
        OLD INVOICE DATE
        ==================================================
        */

        const oldInvoiceDate =
            currentHeader.invoice_date;


        if (
            !oldInvoiceDate
        ) {

            throw new Error(
                "Current Account Receivable Invoice Date is required."
            );

        }


        /*
        ==================================================
        NEW INVOICE DATE

        If invoice_date is not supplied in header,
        keep current invoice date.
        ==================================================
        */

        const newInvoiceDate =
            header.invoice_date
            ||
            oldInvoiceDate;


        /*
        ==================================================
        VALIDATE OLD ACCOUNTING PERIOD

        IMPORTANT:
        Prevent editing an AR that already belongs
        to a Closed accounting period.
        ==================================================
        */

        await this.validateAccountingPeriod(
            oldInvoiceDate
        );


        /*
        ==================================================
        VALIDATE NEW ACCOUNTING PERIOD

        IMPORTANT:
        Prevent moving AR into Closed or
        unconfigured accounting period.
        ==================================================
        */

        await this.validateAccountingPeriod(
            newInvoiceDate
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
        VALIDATE DETAIL COA IDS BEFORE WRITING
        Database stores the revenue COA FK as account_id.
        Do this before updating the header or deleting old details.
        ==================================================
        */

        const detailAccountIds = calculatedDetails.map((detail) =>
            Number(detail.revenue_account_id ?? detail.account_id ?? detail.revenue_account?.id ?? 0)
        );

        if (detailAccountIds.some((accountId) => !Number.isInteger(accountId) || accountId <= 0)) {
            throw new Error(
                "Revenue Account tidak valid pada detail AR. Pilih kembali akun pendapatan sebelum Save Edit."
            );
        }

        const uniqueDetailAccountIds = [...new Set(detailAccountIds)];
        const { data: validAccounts, error: accountValidationError } = await supabase
            .from("mst_chart_of_accounts")
            .select("id")
            .in("id", uniqueDetailAccountIds);

        if (accountValidationError) {
            throw accountValidationError;
        }

        const validAccountIds = new Set((validAccounts || []).map((account) => Number(account.id)));
        const invalidAccountId = uniqueDetailAccountIds.find((accountId) => !validAccountIds.has(accountId));

        if (invalidAccountId) {
            throw new Error(
                `Revenue Account ID ${invalidAccountId} tidak ditemukan di mst_chart_of_accounts. Pilih kembali akun pendapatan sebelum Save Edit.`
            );
        }

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
        CURRENT PAID AMOUNT
        ==================================================
        */

        const currentPaid =
            Number(
                currentHeader.paid_amount
                ||
                0
            );


        /*
        ==================================================
        OUTSTANDING
        ==================================================
        */

        const outstanding =
            Math.max(
                Number(
                    totals.total_amount
                )
                -
                currentPaid,
                0
            );


        /*
        ==================================================
        UPDATE HEADER
        ==================================================
        */

        /*
        ==================================================
        PREPARE UPDATE HEADER USING DATABASE COLUMNS
        Do not spread `header`: it can contain UI-only
        fields such as po_no and subtotal that are not
        columns in trx_account_receivable.
        ==================================================
        */

        const updateHeaderPayload = {
            customer_id: header.customer_id ?? currentHeader.customer_id,
            invoice_no: header.invoice_no ?? currentHeader.invoice_no,
            invoice_date: newInvoiceDate,
            due_date: header.due_date ?? currentHeader.due_date,
            source_po_no: header.po_no ?? header.source_po_no ?? currentHeader.source_po_no ?? null,
            reference_no: header.reference_no ?? currentHeader.reference_no ?? null,
            description: header.description ?? currentHeader.description ?? null,
            currency: header.currency ?? currentHeader.currency ?? "IDR",
            dpp_amount: Number(totals.subtotal || 0),
            tax_output_amount: Number(totals.tax_output_amount || 0),
            total_amount: Number(totals.total_amount || 0),
            paid_amount: currentPaid,
            outstanding_amount: outstanding
        };

        const {
            data: invoice,
            error: invoiceError
        } = await supabase
            .from(this.table)
            .update(updateHeaderPayload)
            .eq("id", id)
            .select()
            .single();


        /*
        ==================================================
        HEADER UPDATE ERROR
        ==================================================
        */

        if (
            invoiceError
        ) {

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
                "account_receivable_id",
                id
            );


        if (
            deleteError
        ) {

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
                    (detail, index) => ({
                        // Match the actual detail table schema; do not send
                        // calculated UI-only fields such as line_amount.
                        company_id: currentHeader.company_id,
                        account_receivable_id: id,
                        line_no: Number(detail.line_no || index + 1),
                        description: detail.description || null,
                        account_id: Number(detail.revenue_account_id ?? detail.account_id ?? detail.revenue_account?.id),
                        quantity: Number(detail.quantity || 0),
                        unit_price: Number(detail.unit_price || 0),
                        amount: Number(
                            (detail.line_amount ?? detail.amount ?? 0)
                        ),
                        // Persist Tax (+) and Tax (-) independently.
                        tax_id: detail.tax_id ?? detail.tax_plus_id ?? detail.tax_minus_id ?? null,
                        tax_plus_id: detail.tax_plus_id ?? null,
                        tax_minus_id: detail.tax_minus_id ?? null,
                        tax_plus_rate: Number(detail.tax_plus_rate ?? detail.tax_output_rate ?? 0),
                        tax_minus_rate: Number(detail.tax_minus_rate ?? detail.withholding_tax_rate ?? 0),
                        tax_plus_amount: Number(detail.tax_plus_amount ?? detail.tax_output_amount ?? 0),
                        tax_minus_amount: Number(detail.tax_minus_amount ?? detail.withholding_tax_amount ?? 0)
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


            if (
                insertError
            ) {

                throw insertError;

            }

        }


        /*
        ==================================================
        RETURN UPDATED ACCOUNT RECEIVABLE
        ==================================================
        */

        return this.getById(
            id
        );

    }

    catch (
        error
    ) {

        console.error(
            "AccountReceivableService.update:",
            error
        );


        throw error;

    }

}

/*
======================================================
DELETE PAYMENT HISTORY FOR AR
SAME RULE AS ACCOUNT PAYABLE
======================================================
*/

async deletePaymentHistoryForAR(
    accountReceivableId
) {

    if (
        !accountReceivableId
    ) {

        throw new Error(
            "Account Receivable ID is required."
        );

    }


    /*
    ==================================================
    GET AR PAYMENT HISTORY
    ==================================================
    */

    const {
        data: payments,
        error: paymentError
    } =
        await supabase

            .from(
                this.paymentTable
            )

            .select(`
                id,
                account_receivable_id,
                gl_journal_id
            `)

            .eq(
                "account_receivable_id",
                accountReceivableId
            );


    if (
        paymentError
    ) {

        throw paymentError;

    }


    const paymentRows =
        Array.isArray(
            payments
        )
            ? payments
            : [];


    /*
    ==================================================
    PROCESS EACH PAYMENT
    ==================================================
    */

    for (
        const payment
        of paymentRows
    ) {

        const paymentId =
            payment?.id
            ||
            null;


        const journalId =
            payment?.gl_journal_id
            ||
            null;


        /*
        ==================================================
        PAYMENT WITHOUT GL JOURNAL
        ==================================================
        */

        if (
            !journalId
        ) {

            const {
                error
            } =
                await supabase

                    .from(
                        this.paymentTable
                    )

                    .delete()

                    .eq(
                        "id",
                        paymentId
                    );


            if (
                error
            ) {

                throw error;

            }


            continue;

        }


        /*
        ==================================================
        GET PAYMENT GL JOURNAL
        ==================================================
        */

        const {
            data: journal,
            error: journalError
        } =
            await supabase

                .from(
                    TABLE.GL_JOURNAL
                )

                .select(`
                    id,
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
            journalError
        ) {

            throw journalError;

        }


        /*
        ==================================================
        JOURNAL ALREADY MISSING
        DELETE PAYMENT ROW
        ==================================================
        */

        if (
            !journal
        ) {

            const {
                error
            } =
                await supabase

                    .from(
                        this.paymentTable
                    )

                    .delete()

                    .eq(
                        "id",
                        paymentId
                    );


            if (
                error
            ) {

                throw error;

            }


            continue;

        }


        /*
        ==================================================
        SAFETY VALIDATION
        ==================================================
        */

        const sourceModule =
            String(
                journal.source_module
                ||
                ""
            )
            .trim()
            .toUpperCase();


        const sourceDocumentType =
            String(
                journal.source_document_type
                ||
                ""
            )
            .trim()
            .toUpperCase();


        if (
            sourceModule !== "AR"
            ||
            sourceDocumentType !== "AR_PAYMENT"
            ||
            String(
                journal.source_document_id
            )
            !==
            String(
                accountReceivableId
            )
        ) {

            const validationError =
                new Error(
                    "AR Payment GL Journal source does not match this Account Receivable."
                );


            validationError.name =
                "BusinessValidationError";


            throw validationError;

        }


        /*
        ==================================================
        JOURNAL STATUS
        ==================================================
        */

        const journalStatus =
            String(
                journal.status
                ||
                ""
            )
            .trim()
            .toUpperCase();


        /*
        ==================================================
        DRAFT JOURNAL
        DELETE DETAIL + HEADER
        ==================================================
        */

        if (
            journalStatus ===
            "DRAFT"
        ) {

            /*
            ==============================================
            DETACH PAYMENT FIRST
            ==============================================
            */

            const {
                error: detachError
            } =
                await supabase

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
                    );


            if (
                detachError
            ) {

                throw detachError;

            }


            /*
            ==============================================
            DELETE GL DETAIL
            ==============================================
            */

            const {
                error: detailError
            } =
                await supabase

                    .from(
                        TABLE.GL_JOURNAL_DETAIL
                    )

                    .delete()

                    .eq(
                        "journal_id",
                        journalId
                    );


            if (
                detailError
            ) {

                throw detailError;

            }


            /*
            ==============================================
            DELETE GL HEADER
            ==============================================
            */

            const {
                error: journalDeleteError
            } =
                await supabase

                    .from(
                        TABLE.GL_JOURNAL
                    )

                    .delete()

                    .eq(
                        "id",
                        journalId
                    );


            if (
                journalDeleteError
            ) {

                throw journalDeleteError;

            }

        }


        /*
        ==================================================
        POSTED JOURNAL

        KEEP AUDIT TRAIL
        CHANGE TO VOID
        ==================================================
        */

        else if (
            journalStatus ===
            "POSTED"
        ) {

            const {
                error: voidError
            } =
                await supabase

                    .from(
                        TABLE.GL_JOURNAL
                    )

                    .update({
                        status:
                            "Void"
                    })

                    .eq(
                        "id",
                        journalId
                    );


            if (
                voidError
            ) {

                throw voidError;

            }

        }


        /*
        ==================================================
        VOID JOURNAL
        KEEP JOURNAL
        ==================================================
        */

        else if (
            journalStatus ===
            "VOID"
        ) {

            /*
            NO ACTION TO JOURNAL
            */

        }


        else {

            const validationError =
                new Error(
                    `AR Payment GL Journal status "${journal.status || ""}" cannot be processed for deletion.`
                );


            validationError.name =
                "BusinessValidationError";


            throw validationError;

        }


        /*
        ==================================================
        DELETE AR PAYMENT ROW
        ==================================================
        */

        const {
            error: deletePaymentError
        } =
            await supabase

                .from(
                    this.paymentTable
                )

                .delete()

                .eq(
                    "id",
                    paymentId
                );


        if (
            deletePaymentError
        ) {

            throw deletePaymentError;

        }

    }

}
/*
======================================================
CLEANUP AR INVOICE GL JOURNAL
SAME PATTERN AS AP
======================================================
*/

async cleanupInvoiceJournalForAR(
    accountReceivableId,
    linkedJournalId = null
) {

    if (
        !accountReceivableId
    ) {

        throw new Error(
            "Account Receivable ID is required."
        );

    }


    /*
    ==================================================
    FIND AR INVOICE JOURNAL
    ==================================================
    */

    let query =
        supabase

            .from(
                TABLE.GL_JOURNAL
            )

            .select(`
                id,
                status,
                source_module,
                source_document_type,
                source_document_id
            `)

            .eq(
                "source_module",
                "AR"
            )

            .eq(
                "source_document_type",
                "AR_INVOICE"
            )

            .eq(
                "source_document_id",
                accountReceivableId
            );


    if (
        linkedJournalId
    ) {

        query =
            query.eq(
                "id",
                linkedJournalId
            );

    }


    const {
        data: journal,
        error
    } =
        await query
            .maybeSingle();


    if (
        error
    ) {

        throw error;

    }


    if (
        !journal
    ) {

        return;

    }


    const journalStatus =
        String(
            journal.status
            ||
            ""
        )
        .trim()
        .toUpperCase();


    /*
    ==================================================
    DRAFT
    DELETE JOURNAL
    ==================================================
    */

    if (
        journalStatus ===
        "DRAFT"
    ) {

        /*
        ==============================================
        DETACH AR HEADER
        ==============================================
        */

        const {
            error: detachError
        } =
            await supabase

                .from(
                    this.table
                )

                .update({
                    gl_journal_id:
                        null
                })

                .eq(
                    "id",
                    accountReceivableId
                );


        if (
            detachError
        ) {

            throw detachError;

        }


        /*
        ==============================================
        DELETE DETAIL
        ==============================================
        */

        const {
            error: detailError
        } =
            await supabase

                .from(
                    TABLE.GL_JOURNAL_DETAIL
                )

                .delete()

                .eq(
                    "journal_id",
                    journal.id
                );


        if (
            detailError
        ) {

            throw detailError;

        }


        /*
        ==============================================
        DELETE HEADER
        ==============================================
        */

        const {
            error: journalDeleteError
        } =
            await supabase

                .from(
                    TABLE.GL_JOURNAL
                )

                .delete()

                .eq(
                    "id",
                    journal.id
                );


        if (
            journalDeleteError
        ) {

            throw journalDeleteError;

        }

    }


    /*
    ==================================================
    POSTED
    KEEP AUDIT TRAIL
    ==================================================
    */

    else if (
        journalStatus ===
        "POSTED"
    ) {

        const {
            error: voidError
        } =
            await supabase

                .from(
                    TABLE.GL_JOURNAL
                )

                .update({
                    status:
                        "Void"
                })

                .eq(
                    "id",
                    journal.id
                );


        if (
            voidError
        ) {

            throw voidError;

        }

    }


    /*
    ==================================================
    VOID
    KEEP JOURNAL
    ==================================================
    */

    else if (
        journalStatus ===
        "VOID"
    ) {

        return;

    }


    else {

        const validationError =
            new Error(
                `AR Invoice GL Journal status "${journal.status || ""}" cannot be processed for deletion.`
            );


        validationError.name =
            "BusinessValidationError";


        throw validationError;

    }

}


    /*
======================================================
DELETE ACCOUNT RECEIVABLE
FINAL
SAME BEHAVIOR AS ACCOUNT PAYABLE
======================================================
*/

async delete(id) {

    try {

        /*
        ==================================================
        VALIDATE ID
        ==================================================
        */

        if (!id) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        GET ACCOUNT RECEIVABLE
        ==================================================
        */

        const {
            data: invoice,
            error: findError
        } =
            await supabase

                .from(
                    this.table
                )

                .select(`
                    id,
                    invoice_no,
                    invoice_date,
                    status,
                    gl_journal_id
                `)

                .eq(
                    "id",
                    id
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
                "Account Receivable not found."
            );

        }


        /*
        ==================================================
        ACCOUNTING PERIOD
        ==================================================
        */

        if (
            !invoice.invoice_date
        ) {

            throw new Error(
                "Account Receivable Invoice Date is required."
            );

        }


        await this.validateAccountingPeriod(
            invoice.invoice_date
        );


        /*
        ==================================================
        STATUS
        DRAFT ONLY

        VOID MUST REMAIN AS AUDIT TRAIL
        ==================================================
        */

        const status =
            String(
                invoice.status
                ||
                ""
            )
            .trim()
            .toUpperCase();


        if (
            status !== "DRAFT"
        ) {

            const validationError =
                new Error(
                    "Only Draft Account Receivable can be deleted."
                );


            validationError.name =
                "BusinessValidationError";


            throw validationError;

        }


        /*
        ==================================================
        STEP 1
        DELETE AR PAYMENT HISTORY
        ==================================================
        */

        await this.deletePaymentHistoryForAR(
            id
        );


        /*
        ==================================================
        STEP 2
        CLEANUP AR INVOICE GL JOURNAL
        ==================================================
        */

        await this.cleanupInvoiceJournalForAR(
            id,
            invoice.gl_journal_id
        );


        /*
        ==================================================
        STEP 3
        DELETE AR DETAILS
        ==================================================
        */

        const {
            error: detailDeleteError
        } =
            await supabase

                .from(
                    this.detailTable
                )

                .delete()

                .eq(
                    "account_receivable_id",
                    id
                );


        if (
            detailDeleteError
        ) {

            throw detailDeleteError;

        }


        /*
        ==================================================
        STEP 4
        DELETE AR HEADER
        ==================================================
        */

        const {
            error: deleteError
        } =
            await supabase

                .from(
                    this.table
                )

                .delete()

                .eq(
                    "id",
                    id
                );


        if (
            deleteError
        ) {

            if (
                deleteError.code ===
                "23503"
            ) {

                const validationError =
                    new Error(
                        "Account Receivable cannot be deleted because it is still used by another transaction."
                    );


                validationError.name =
                    "BusinessValidationError";


                throw validationError;

            }


            throw deleteError;

        }


        console.log(
            "ACCOUNT RECEIVABLE DELETED SUCCESSFULLY:",
            {
                id:
                    invoice.id,

                invoice_no:
                    invoice.invoice_no
            }
        );


        return true;

    }

    catch (error) {

        /*
        ==================================================
        EXPECTED BUSINESS VALIDATION
        ==================================================
        */

        if (
            error?.name ===
            "BusinessValidationError"
        ) {

            throw error;

        }


        console.error(
            "AccountReceivableService.delete:",
            error
        );


        throw error;

    }

}

/*
======================================================
VOID ACCOUNT RECEIVABLE
FINAL
SAME BEHAVIOR AS ACCOUNT PAYABLE
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
                "Account Receivable ID is required."
            );

        }


        if (
            !reason
            ||
            !String(reason).trim()
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
        CURRENT STATUS
        ==================================================
        */

        const currentStatus =
            String(
                invoice.status
                ||
                ""
            )
            .trim();


        /*
        ==================================================
        SAME STATUS RULE AS AP

        POSTED
        PARTIAL PAID
        ==================================================
        */

        if (
            currentStatus !== "Posted"
            &&
            currentStatus !== "Partial Paid"
        ) {

            throw new Error(
                "Only Posted or Partial Paid Account Receivable can be voided."
            );

        }


        /*
        ==================================================
        ACCOUNTING PERIOD LOCK
        INVOICE DATE = ACCOUNTING DATE
        ==================================================
        */

        await this.validateAccountingPeriod(
            invoice.invoice_date
        );


        /*
        ==================================================
        UPDATE AR STATUS
        SAME AS AP
        ==================================================
        */

        const {

            data,

            error:
                updateError

        } = await supabase

            .from(
                this.table
            )

            .update({

                status:
                    this.STATUS.VOID,

                void_reason:
                    String(reason).trim(),

                void_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                id
            )

            .select()

            .single();


        if (
            updateError
        ) {

            throw updateError;

        }


        /*
        ==================================================
        LINKED GL JOURNAL
        ==================================================
        */

        const glJournalId =
            invoice.gl_journal_id
            ||
            null;


        /*
        ==================================================
        VOID LINKED AR INVOICE JOURNAL

        AR STILL NEEDS GL REALTIME CONSISTENCY.
        ==================================================
        */

        if (
            glJournalId
        ) {

            const {

                data:
                    glJournal,

                error:
                    glFindError

            } = await supabase

                .from(
                    TABLE.GL_JOURNAL
                )

                .select(`
                    id,
                    status,
                    source_module,
                    source_document_type,
                    source_document_id
                `)

                .eq(
                    "id",
                    glJournalId
                )

                .maybeSingle();


            if (
                glFindError
            ) {

                throw glFindError;

            }


            if (
                glJournal
            ) {

                /*
                ==============================================
                SOURCE VALIDATION
                ==============================================
                */

                const sourceModule =
                    String(
                        glJournal.source_module
                        ||
                        ""
                    )
                    .trim()
                    .toUpperCase();


                const sourceDocumentType =
                    String(
                        glJournal.source_document_type
                        ||
                        ""
                    )
                    .trim()
                    .toUpperCase();


                if (
                    sourceModule !== "AR"
                    ||
                    sourceDocumentType !== "AR_INVOICE"
                    ||
                    String(
                        glJournal.source_document_id
                    )
                    !==
                    String(
                        id
                    )
                ) {

                    throw new Error(
                        "Linked GL Journal does not belong to this Account Receivable."
                    );

                }


                /*
                ==============================================
                VOID GL JOURNAL
                ==============================================
                */

                const {

                    error:
                        journalVoidError

                } = await supabase

                    .from(
                        TABLE.GL_JOURNAL
                    )

                    .update({

                        status:
                            "Void",

                        void_reason:
                            String(
                                reason
                            )
                            .trim()

                    })

                    .eq(
                        "id",
                        glJournalId
                    );


                if (
                    journalVoidError
                ) {

                    throw journalVoidError;

                }

            }

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
            "AccountReceivableService.voidInvoice:",
            error
        );


        throw error;

    }

}
/*
======================================================
GET PAYMENT TOTAL
FINAL

ACCOUNT RECEIVABLE PAYMENT LIFECYCLE

ACTIVE PAYMENT:
- DRAFT GL JOURNAL
- POSTED GL JOURNAL

INACTIVE PAYMENT:
- VOID GL JOURNAL
- NULL gl_journal_id
- MISSING GL JOURNAL
- UNKNOWN JOURNAL STATUS

IMPORTANT:
PAYMENT <-> GL JOURNAL RELATION IS PRESERVED
WHEN JOURNAL BECOMES VOID.

VOID -> POSTED
WILL AUTOMATICALLY REACTIVATE PAYMENT.
======================================================
*/

async getPaymentTotal(
    accountReceivableId
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !accountReceivableId
        ) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        GET AR PAYMENT ROWS

        IMPORTANT:
        ONLY PAYMENT WITH JOURNAL RELATION
        CAN POSSIBLY BE ACTIVE.

        NULL gl_journal_id
        =
        INACTIVE / ORPHAN PAYMENT
        ==================================================
        */

        const {

            data:
                payments,

            error:
                paymentError

        } = await supabase

            .from(
                this.paymentTable
            )

            .select(`
                id,
                account_receivable_id,
                payment_amount,
                gl_journal_id
            `)

            .eq(
                "account_receivable_id",
                accountReceivableId
            )

            .not(
                "gl_journal_id",
                "is",
                null
            );


        /*
        ==================================================
        PAYMENT QUERY ERROR
        ==================================================
        */

        if (
            paymentError
        ) {

            console.error(
                "AR GET PAYMENT TOTAL - PAYMENT ERROR:",
                {
                    account_receivable_id:
                        accountReceivableId,

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
        NORMALIZE PAYMENT ROWS
        ==================================================
        */

        const paymentRows =
            Array.isArray(
                payments
            )
                ? payments
                : [];


        /*
        ==================================================
        NO PAYMENT
        ==================================================
        */

        if (
            paymentRows.length ===
            0
        ) {

            console.log(
                "AR ACTIVE PAYMENT TOTAL:",
                {
                    account_receivable_id:
                        accountReceivableId,

                    payment_count:
                        0,

                    active_payment_count:
                        0,

                    inactive_payment_count:
                        0,

                    total_payment:
                        0
                }
            );


            return 0;

        }


        /*
        ==================================================
        GET UNIQUE GL JOURNAL IDS
        ==================================================
        */

        const journalIds =
            [
                ...new Set(

                    paymentRows

                        .map(
                            payment =>
                                payment?.gl_journal_id
                        )

                        .filter(
                            Boolean
                        )

                )
            ];


        /*
        ==================================================
        NO VALID JOURNAL IDS

        SAFETY:
        NO JOURNAL
        =
        NO ACTIVE PAYMENT
        ==================================================
        */

        if (
            journalIds.length ===
            0
        ) {

            return 0;

        }


        /*
        ==================================================
        GET GL JOURNAL STATUS

        DO NOT USE ONLY gl_journal_id != NULL.

        JOURNAL STATUS DETERMINES
        WHETHER PAYMENT IS ACTIVE.
        ==================================================
        */

        const {

            data:
                journals,

            error:
                journalError

        } = await supabase

            .from(
                TABLE.GL_JOURNAL
            )

            .select(`
                id,
                status,
                source_module,
                source_document_type,
                source_document_id
            `)

            .in(
                "id",
                journalIds
            );


        /*
        ==================================================
        JOURNAL QUERY ERROR
        ==================================================
        */

        if (
            journalError
        ) {

            console.error(
                "AR GET PAYMENT TOTAL - JOURNAL ERROR:",
                {
                    account_receivable_id:
                        accountReceivableId,

                    journal_ids:
                        journalIds,

                    message:
                        journalError.message,

                    details:
                        journalError.details,

                    hint:
                        journalError.hint,

                    code:
                        journalError.code
                }
            );


            throw journalError;

        }


        /*
        ==================================================
        NORMALIZE JOURNAL ROWS
        ==================================================
        */

        const journalRows =
            Array.isArray(
                journals
            )
                ? journals
                : [];


        /*
        ==================================================
        BUILD JOURNAL MAP

        KEY:
        JOURNAL ID

        VALUE:
        COMPLETE JOURNAL INFORMATION
        ==================================================
        */

        const journalMap =
            new Map();


        journalRows.forEach(
            journal => {

                if (
                    !journal?.id
                ) {

                    return;

                }


                journalMap.set(
                    String(
                        journal.id
                    ),
                    journal
                );

            }
        );


        /*
        ==================================================
        ACTIVE PAYMENT FILTER

        RULE:

        PAYMENT MUST:
        1. HAVE GL JOURNAL
        2. JOURNAL MUST EXIST
        3. SOURCE MODULE MUST BE AR
        4. DOCUMENT TYPE MUST BE AR_PAYMENT
        5. SOURCE DOCUMENT ID MUST MATCH AR
        6. STATUS MUST BE DRAFT OR POSTED

        VOID
        =
        INACTIVE
        ==================================================
        */

        const activePayments =
            paymentRows.filter(
                payment => {

                    /*
                    ==========================================
                    PAYMENT VALIDATION
                    ==========================================
                    */

                    if (
                        !payment
                        ||
                        !payment.gl_journal_id
                    ) {

                        return false;

                    }


                    /*
                    ==========================================
                    GET LINKED JOURNAL
                    ==========================================
                    */

                    const journal =
                        journalMap.get(
                            String(
                                payment.gl_journal_id
                            )
                        );


                    /*
                    ==========================================
                    JOURNAL MUST EXIST
                    ==========================================
                    */

                    if (
                        !journal
                    ) {

                        console.warn(
                            "AR PAYMENT JOURNAL NOT FOUND:",
                            {
                                payment_id:
                                    payment.id,

                                gl_journal_id:
                                    payment.gl_journal_id,

                                account_receivable_id:
                                    accountReceivableId
                            }
                        );


                        return false;

                    }


                    /*
                    ==========================================
                    NORMALIZE SOURCE
                    ==========================================
                    */

                    const sourceModule =
                        String(
                            journal.source_module
                            ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    const sourceDocumentType =
                        String(
                            journal.source_document_type
                            ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    const journalStatus =
                        String(
                            journal.status
                            ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    /*
                    ==========================================
                    SAFETY:
                    MUST BELONG TO AR
                    ==========================================
                    */

                    if (
                        sourceModule !==
                        "AR"
                    ) {

                        console.warn(
                            "AR PAYMENT INVALID SOURCE MODULE:",
                            {
                                payment_id:
                                    payment.id,

                                journal_id:
                                    journal.id,

                                source_module:
                                    sourceModule
                            }
                        );


                        return false;

                    }


                    /*
                    ==========================================
                    SAFETY:
                    MUST BE AR PAYMENT JOURNAL
                    ==========================================
                    */

                    if (
                        sourceDocumentType !==
                        "AR_PAYMENT"
                    ) {

                        console.warn(
                            "AR PAYMENT INVALID SOURCE DOCUMENT TYPE:",
                            {
                                payment_id:
                                    payment.id,

                                journal_id:
                                    journal.id,

                                source_document_type:
                                    sourceDocumentType
                            }
                        );


                        return false;

                    }


                    /*
                    ==========================================
                    SAFETY:
                    JOURNAL MUST BELONG TO SAME AR
                    ==========================================
                    */

                    if (
                        String(
                            journal.source_document_id
                            ||
                            ""
                        )
                        !==
                        String(
                            accountReceivableId
                        )
                    ) {

                        console.warn(
                            "AR PAYMENT SOURCE DOCUMENT MISMATCH:",
                            {
                                payment_id:
                                    payment.id,

                                journal_id:
                                    journal.id,

                                journal_source_document_id:
                                    journal.source_document_id,

                                account_receivable_id:
                                    accountReceivableId
                            }
                        );


                        return false;

                    }


                    /*
                    ==========================================
                    ACTIVE STATUS

                    DRAFT
                    =
                    ACTIVE

                    POSTED
                    =
                    ACTIVE

                    VOID
                    =
                    INACTIVE
                    ==========================================
                    */

                    return (
                        journalStatus ===
                            "DRAFT"
                        ||
                        journalStatus ===
                            "POSTED"
                    );

                }
            );


        /*
        ==================================================
        CALCULATE ACTIVE PAYMENT TOTAL
        ==================================================
        */

        const total =
            activePayments.reduce(

                (
                    sum,
                    payment
                ) => {

                    return (
                        sum
                        +
                        Number(
                            payment.payment_amount
                            ??
                            payment.amount
                            ??
                            0
                        )
                    );

                },

                0

            );


        /*
        ==================================================
        ROUND
        ==================================================
        */

        const finalTotal =
            Number(
                total.toFixed(
                    2
                )
            );


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR ACTIVE PAYMENT TOTAL:",
            {
                account_receivable_id:
                    accountReceivableId,

                payment_count:
                    paymentRows.length,

                active_payment_count:
                    activePayments.length,

                inactive_payment_count:
                    (
                        paymentRows.length
                        -
                        activePayments.length
                    ),

                total_payment:
                    finalTotal,

                active_payments:
                    activePayments.map(
                        payment => {

                            const journal =
                                journalMap.get(
                                    String(
                                        payment.gl_journal_id
                                    )
                                );


                            return {

                                payment_id:
                                    payment.id,

                                amount:
                                    Number(
                                        payment.payment_amount
                                        ??
                                        payment.amount
                                        ??
                                        0
                                    ),

                                gl_journal_id:
                                    payment.gl_journal_id,

                                journal_status:
                                    journal?.status
                                    ||
                                    null

                            };

                        }
                    )
            }
        );


        /*
        ==================================================
        RETURN
        ==================================================
        */

        return finalTotal;

    }

    catch (
        error
    ) {

        console.error(
            "AccountReceivableService.getPaymentTotal:",
            error
        );


        throw error;

    }

}
/*
======================================================
UPDATE AR PAYMENT STATUS
SAME LOGIC AS ACCOUNT PAYABLE
======================================================
*/

async updatePaymentStatus(
    accountReceivableId
) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !accountReceivableId
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
            await this.getById(
                accountReceivableId
            );


        const invoice =
            result?.header;


        if (!invoice) {

            throw new Error(
                "Account Receivable not found."
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
        TOTAL PAYMENT
        ==================================================
        */

        const paidAmount =
            await this.getPaymentTotal(
                accountReceivableId
            );


        /*
        ==================================================
        OUTSTANDING
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
        DEFAULT STATUS
        NO PAYMENT YET
        ==================================================
        */

        let status =
            this.STATUS.COMPLETE;


        /*
        ==================================================
        PARTIAL PAYMENT
        ==================================================
        */

        if (
            paidAmount > 0
            &&
            outstandingAmount > 0
        ) {

            status =
                this.STATUS.PARTIAL_PAID;

        }


        /*
        ==================================================
        FULL PAYMENT
        ==================================================
        */

        if (
            paidAmount >=
            totalAmount
        ) {

            status =
                this.STATUS.PAID;

        }


        /*
        ==================================================
        UPDATE ACCOUNT RECEIVABLE
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
                accountReceivableId
            )

            .select()

            .single();


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (error) {

            throw error;

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR PAYMENT STATUS UPDATED:",
            {

                account_receivable_id:
                    accountReceivableId,

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
            "AccountReceivableService.updatePaymentStatus:",
            error
        );


        throw error;

    }

}

    /*
======================================================
MARK PAID
COMPATIBILITY ALIAS
======================================================
*/

async markPaid(
    id,
    paidAmount = null
) {

    /*
    ==================================================
    IMPORTANT

    paidAmount parameter kept only for compatibility.
    Actual total payment is always calculated from
    trx_account_receivable_payment.
    ==================================================
    */

    return this.updatePaymentStatus(
        id
    );

}


    /*
======================================================
GET PAYMENT HISTORY
ACCOUNT RECEIVABLE
FINAL

SHOW COMPLETE PAYMENT HISTORY

INCLUDING:
- DRAFT JOURNAL
- POSTED JOURNAL
- VOID JOURNAL

PAYMENT -> GL JOURNAL RELATION
MUST BE PRESERVED FOR AUDIT
======================================================
*/


async getCustomerPaymentTrace(
    customerId,
    dateFrom = null,
    dateTo = null
) {

    const normalizedCustomerId =
        Number(customerId);

    if (
        !Number.isFinite(normalizedCustomerId)
        ||
        normalizedCustomerId <= 0
    ) {
        throw new Error("Customer is required.");
    }

    const {
        data: invoices,
        error: invoiceError
    } =
        await supabase
            .from(this.table)
            .select(`
                id,
                customer_id,
                invoice_no,
                invoice_date,
                due_date,
                total_amount,
                paid_amount,
                outstanding_amount,
                status,
                gl_journal_id
            `)
            .eq("customer_id", normalizedCustomerId)
            .order("invoice_date", { ascending: true });

    if (invoiceError) {
        throw invoiceError;
    }

    const invoiceRows =
        Array.isArray(invoices)
            ? invoices
            : [];

    if (invoiceRows.length === 0) {
        return [];
    }

    const invoiceIds =
        invoiceRows
            .map(invoice => invoice.id)
            .filter(Boolean);

    let paymentQuery =
        supabase
            .from(this.paymentTable)
            .select(`
                id,
                account_receivable_id,
                ar_payment_id,
                payment_date,
                payment_amount,
                reference_no,
                gl_journal_id,
                created_at,
                trx_gl_journal (
                    id,
                    journal_no,
                    journal_date,
                    status,
                    source_module,
                    source_document_type,
                    source_document_id
                )
            `)
            .in("account_receivable_id", invoiceIds);

    if (dateFrom) {
        paymentQuery =
            paymentQuery.gte("payment_date", dateFrom);
    }

    if (dateTo) {
        paymentQuery =
            paymentQuery.lte("payment_date", dateTo);
    }

    const {
        data: payments,
        error: paymentError
    } =
        await paymentQuery
            .order("payment_date", { ascending: false })
            .order("created_at", { ascending: false });

    if (paymentError) {
        throw paymentError;
    }

    const invoiceMap =
        new Map(
            invoiceRows.map(
                invoice => [
                    String(invoice.id),
                    invoice
                ]
            )
        );

    return (
        Array.isArray(payments)
            ? payments
            : []
    ).map(
        payment => ({
            ...payment,
            invoice:
                invoiceMap.get(
                    String(payment.account_receivable_id)
                )
                || null
        })
    );
}


/*
======================================================
GET PAYMENT HISTORY
ACCOUNT RECEIVABLE
FINAL
======================================================
*/

async recalculateActivePaymentStatus(id) {

    if (!id) {
        throw new Error(
            "Account Receivable ID is required."
        );
    }

    const {
        data: invoice,
        error: invoiceError
    } =
        await supabase
            .from(this.table)
            .select(`
                id,
                total_amount,
                status
            `)
            .eq("id", id)
            .maybeSingle();

    if (invoiceError) {
        throw invoiceError;
    }

    if (!invoice) {
        throw new Error(
            "Account Receivable not found."
        );
    }

    const history =
        await this.getPaymentHistory(id);

    const activePayments =
        (Array.isArray(history) ? history : [])
            .filter(payment => {

                const journal =
                    payment?.trx_gl_journal
                    ||
                    null;

                const journalStatus =
                    String(
                        journal?.status
                        ||
                        ""
                    )
                    .trim()
                    .toLowerCase();

                const sourceModule =
                    String(journal?.source_module || "")
                        .trim()
                        .toUpperCase();

                const sourceDocumentType =
                    String(journal?.source_document_type || "")
                        .trim()
                        .toUpperCase();

                const sourceDocumentId =
                    String(journal?.source_document_id || "");

                return (
                    Boolean(payment?.gl_journal_id)
                    &&
                    Boolean(journal?.id)
                    &&
                    (
                        journalStatus === "draft"
                        ||
                        journalStatus === "posted"
                    )
                    &&
                    sourceModule === "AR"
                    &&
                    sourceDocumentType === "AR_PAYMENT"
                    &&
                    sourceDocumentId === String(id)
                );

            });

    const activePaid =
        activePayments.reduce(
            (total, payment) =>
                total
                +
                Number(
                    payment?.payment_amount
                    ??
                    payment?.amount
                    ??
                    0
                ),
            0
        );

    const total =
        Number(
            invoice.total_amount
            ||
            0
        );

    const outstanding =
        Math.max(
            0,
            total - activePaid
        );

    let status =
        "Complete";

    if (
        activePaid > 0
        &&
        outstanding > 0
    ) {
        status =
            "Partial Paid";
    }
    else if (
        total > 0
        &&
        outstanding <= 0
    ) {
        status =
            "Paid";
    }

    const {
        data: updated,
        error: updateError
    } =
        await supabase
            .from(this.table)
            .update({
                paid_amount:
                    activePaid,

                outstanding_amount:
                    outstanding,

                status:
                    status
            })
            .eq("id", id)
            .select()
            .maybeSingle();

    if (updateError) {
        throw updateError;
    }

    return (
        updated
        ||
        {
            ...invoice,
            paid_amount:
                activePaid,
            outstanding_amount:
                outstanding,
            status:
                status
        }
    );

}


/*
======================================================
GET PAYMENT HISTORY
ACCOUNT RECEIVABLE
FINAL
======================================================
*/

async getPaymentHistory(id) {

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
        GET PAYMENT HISTORY
        WITH PAYMENT ACCOUNT + GL JOURNAL
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
                *,
                trx_gl_journal (
                    id,
                    journal_no,
                    journal_date,
                    status,
                    source_module,
                    source_document_type,
                    source_document_id
                )
            `)

            .eq(
                "account_receivable_id",
                id
            )

            .order(
                "payment_date",
                {
                    ascending: true
                }
            )

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (error) {

            console.error(
                "AR GET PAYMENT HISTORY ERROR:",
                {
                    account_receivable_id:
                        id,

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
        NORMALIZE
        ==================================================
        */

        const payments =
            Array.isArray(data)
                ? data
                : [];


        /*
        ==================================================
        LOAD PAYMENT ACCOUNT WITHOUT FK RELATIONSHIP

        IMPORTANT:
        Do not depend on a PostgREST relationship between
        trx_account_receivable_payment and
        mst_chart_of_accounts because that relationship is
        not present in the current schema cache.
        ==================================================
        */

        const paymentAccountIds =
            [
                ...new Set(
                    payments
                        .map(
                            payment =>
                                payment?.payment_account_id
                        )
                        .filter(
                            Boolean
                        )
                )
            ];


        let paymentAccountMap =
            new Map();


        if (
            paymentAccountIds.length > 0
        ) {

            const {
                data: paymentAccounts,
                error: paymentAccountError
            } =
                await supabase

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
                paymentAccountError
            ) {

                console.error(
                    "AR GET PAYMENT ACCOUNT ERROR:",
                    paymentAccountError
                );

                throw paymentAccountError;

            }


            paymentAccountMap =
                new Map(
                    (
                        paymentAccounts
                        ||
                        []
                    )
                    .map(
                        account => [
                            String(
                                account.id
                            ),
                            account
                        ]
                    )
                );

        }


        const normalizedPayments =
            payments.map(
                payment => ({
                    ...payment,

                    payment_account:
                        paymentAccountMap.get(
                            String(
                                payment?.payment_account_id
                                ||
                                ""
                            )
                        )
                        ||
                        null
                })
            );


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "AR PAYMENT HISTORY:",
            {
                account_receivable_id:
                    id,

                payment_count:
                    payments.length,

                payments:
                    payments.map(
                        payment => ({
                            payment_id:
                                payment.id,

                            amount:
                                Number(
                                    payment.payment_amount
                                    ??
                                    payment.amount
                                    ??
                                    0
                                ),

                            gl_journal_id:
                                payment.gl_journal_id
                                ||
                                null,

                            journal_no:
                                payment
                                    ?.trx_gl_journal
                                    ?.journal_no
                                ||
                                null,

                            journal_status:
                                payment
                                    ?.trx_gl_journal
                                    ?.status
                                ||
                                null
                        })
                    )
            }
        );


        return normalizedPayments;

    }

    catch (error) {

        console.error(
            "AccountReceivableService.getPaymentHistory:",
            error
        );


        throw error;

    }

}
    /*
======================================================
CREATE PAYMENT
ACCOUNT RECEIVABLE
WITH ACCOUNTING PERIOD VALIDATION
BASIS : PAYMENT DATE
======================================================
*/

async createPayment(
    payment
) {

    try {

        /*
        ==================================================
        VALIDATE PAYMENT DATA
        ==================================================
        */

        if (
            !payment
        ) {

            throw new Error(
                "Payment data is required."
            );

        }


        /*
        ==================================================
        VALIDATE ACCOUNT RECEIVABLE
        ==================================================
        */

        if (
            !payment.account_receivable_id
        ) {

            throw new Error(
                "Account Receivable ID is required."
            );

        }


        /*
        ==================================================
        VALIDATE PAYMENT DATE
        ==================================================
        */

        if (
            !payment.payment_date
        ) {

            throw new Error(
                "Payment Date is required."
            );

        }


        /*
        ==================================================
        VALIDATE PAYMENT ACCOUNT
        ==================================================
        */

        if (
            !payment.payment_account_id
        ) {

            throw new Error(
                "Payment Account is required."
            );

        }


        /*
        ==================================================
        VALIDATE PAYMENT AMOUNT
        Database column is payment_amount, not amount.
        Accept amount as an input alias for compatibility.
        ==================================================
        */

        const paymentAmount = Number(
            payment.payment_amount ?? payment.amount ?? 0
        );

        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
            throw new Error(
                "Payment Amount must be greater than 0."
            );
        }

        /*
        ==================================================
        RESOLVE COMPANY CONTEXT
        trx_account_receivable_payment is company-scoped.
        ==================================================
        */

        const {
            data: effectiveCompanyId,
            error: companyContextError
        } = await supabase.rpc(
            "finova_effective_company_id"
        );

        if (companyContextError) {
            console.error(
                "AR PAYMENT EFFECTIVE COMPANY CONTEXT ERROR:",
                companyContextError
            );
            throw companyContextError;
        }

        if (!effectiveCompanyId) {
            throw new Error(
                "FINOVA: active company context is required before saving AR payment."
            );
        }

        /*
        ==================================================
        ACCOUNTING PERIOD VALIDATION

        AR PAYMENT ACCOUNTING DATE
        =
        PAYMENT DATE
        ==================================================
        */

        await this.validatePaymentAccountingPeriod(
            payment.payment_date
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

            .insert({
                company_id:
                    effectiveCompanyId,

                account_receivable_id:
                    payment.account_receivable_id,

                ar_payment_id:
                    payment.ar_payment_id || null,

                payment_date:
                    payment.payment_date,

                payment_amount:
                    paymentAmount,

                reference_no:
                    payment.reference_no || null,

                gl_journal_id:
                    payment.gl_journal_id || null
            })

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

            throw error;

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
            "AccountReceivableService.createPayment:",
            error
        );


        throw error;

    }

}


    /*
    ======================================================
    RECOVER ACCOUNT RECEIVABLE TOTALS
    ======================================================
    */

    async recoverTotals(id) {

        try {

            if (!id) {

                throw new Error(
                    "Account Receivable ID is required."
                );

            }


            /*
            ==================================================
            GET DETAILS
            ==================================================
            */

            const {

                data: details,

                error: detailError

            } = await supabase

                .from(
                    this.detailTable
                )

                .select(`
                    quantity,
                    unit_price,
                    tax_output_rate,
                    withholding_tax_rate
                `)

                .eq(
                    "account_receivable_id",
                    id
                );


            if (detailError) {

                throw detailError;

            }


            if (
                !Array.isArray(
                    details
                )
                ||
                !details.length
            ) {

                throw new Error(
                    "No Account Receivable detail found."
                );

            }


            const totals =
                this.calculateTotals(
                    details
                );


            console.log(
                "AR RECOVER TOTALS:",
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
                "AccountReceivableService.recoverTotals:",
                error
            );


            throw error;

        }

    }

}