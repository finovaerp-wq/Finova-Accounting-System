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

            .order(
                "created_at",
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
    SEARCH
    ======================================================
    */

    async search(
        filters = {}
    ) {

        try {

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
                        )
                    `);


            /*
            ==================================================
            DATE FROM
            ==================================================
            */

            if (
                filters.dateFrom
            ) {

                query =
                    query.gte(
                        "invoice_date",
                        filters.dateFrom
                    );

            }


            /*
            ==================================================
            DATE TO
            ==================================================
            */

            if (
                filters.dateTo
            ) {

                query =
                    query.lte(
                        "invoice_date",
                        filters.dateTo
                    );

            }


            /*
            ==================================================
            STATUS
            ==================================================
            */

            if (
                filters.status
                &&
                filters.status !== "all"
            ) {

                query =
                    query.eq(
                        "status",
                        filters.status
                    );

            }


            /*
            ==================================================
            ORDER
            ==================================================
            */

            query =
                query.order(
                    "invoice_date",
                    {
                        ascending:
                            false
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

            } = await query;


            if (error) {

                throw error;

            }


            let result =
                data || [];


            /*
            ==================================================
            KEYWORD
            ==================================================
            */

            if (
                filters.keyword
                &&
                filters.keyword.trim()
            ) {

                const keyword =
                    filters.keyword
                        .trim()
                        .toLowerCase();


                result =
                    result.filter(
                        invoice => {

                            const invoiceNo =
                                String(
                                    invoice.invoice_no
                                    || ""
                                )
                                .toLowerCase();


                            const customerName =
                                String(
                                    invoice
                                        .mst_business_partner
                                        ?.bp_name
                                    || ""
                                )
                                .toLowerCase();


                            const customerCode =
                                String(
                                    invoice
                                        .mst_business_partner
                                        ?.bp_code
                                    || ""
                                )
                                .toLowerCase();


                            const poNo =
                                String(
                                    invoice.po_no
                                    || ""
                                )
                                .toLowerCase();


                            const description =
                                String(
                                    invoice.description
                                    || ""
                                )
                                .toLowerCase();


                            return (

                                invoiceNo.includes(
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

                                poNo.includes(
                                    keyword
                                )

                                ||

                                description.includes(
                                    keyword
                                )

                            );

                        }
                    );

            }


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
    ======================================================
    */

    async getCustomers() {

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
                    "Customer"
                )

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


            return data || [];

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
    ======================================================
    */

    async getCustomerById(id) {

        try {

            if (!id) {

                throw new Error(
                    "Customer ID is required."
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
                    "Customer"
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
                "AccountReceivableService.getCustomerById:",
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
    ======================================================
    */

    calculateDueDate(
        dateReceived,
        customer
    ) {

        if (!dateReceived) {

            return "";

        }


        const top =
            customer
                ?.mst_term_of_payment;


        const days =
            Number(
                top?.days
                || 0
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
            date.getDate()
            +
            days
        );


        return date
            .toISOString()
            .split(
                "T"
            )[0];

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

        let subtotal =
            0;

        let taxOutputAmount =
            0;

        let withholdingTaxAmount =
            0;


        details.forEach(
            detail => {

                const calculated =
                    this.calculateDetailAmount(
                        detail
                    );


                subtotal +=
                    calculated.line_amount;


                taxOutputAmount +=
                    calculated.tax_output_amount;


                withholdingTaxAmount +=
                    calculated.withholding_tax_amount;

            }
        );


        const totalAmount =
            subtotal
            +
            taxOutputAmount
            -
            withholdingTaxAmount;


        return {

            subtotal:
                Number(
                    subtotal.toFixed(
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
                ),

            paid_amount:
                0,

            outstanding_amount:
                Number(
                    totalAmount.toFixed(
                        2
                    )
                )

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
    ======================================================
    */

    async create(
        header,
        details = []
    ) {

        try {

            if (!header) {

                throw new Error(
                    "Account Receivable header is required."
                );

            }


            if (
                !header.customer_id
            ) {

                throw new Error(
                    "Customer is required."
                );

            }


            if (
                !header.invoice_no
            ) {

                throw new Error(
                    "Document No. is required."
                );

            }


            if (
                !header.invoice_date
            ) {

                throw new Error(
                    "Invoice Date is required."
                );

            }


            if (
                !header.due_date
            ) {

                throw new Error(
                    "Due Date is required."
                );

            }


            if (
                !details.length
            ) {

                throw new Error(
                    "At least one invoice detail is required."
                );

            }


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

                .insert({

                    ...header,

                    ...totals,

                    status:
                        header.status
                        ||
                        this.STATUS.DRAFT,

                    gl_journal_id:
                        header.gl_journal_id
                        ||
                        null

                })

                .select()

                .single();


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
                    detail => ({

                        ...detail,

                        account_receivable_id:
                            invoice.id

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


            if (detailError) {

                /*
                ==============================================
                CLEAN HEADER IF DETAIL INSERT FAILS
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


                throw detailError;

            }


            return {

                ...invoice,

                details:
                    insertedDetails
                    || []

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
    ======================================================
    */

    async update(
        id,
        header,
        details = []
    ) {

        try {

            if (!id) {

                throw new Error(
                    "Account Receivable ID is required."
                );

            }


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
            CURRENT HEADER
            ==================================================
            */

            const current =
                await this.getById(
                    id
                );


            const currentPaid =
                Number(
                    current?.header?.paid_amount
                    || 0
                );


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

            const {

                data: invoice,

                error: invoiceError

            } = await supabase

                .from(
                    this.table
                )

                .update({

                    ...header,

                    subtotal:
                        totals.subtotal,

                    tax_output_amount:
                        totals.tax_output_amount,

                    withholding_tax_amount:
                        totals.withholding_tax_amount,

                    total_amount:
                        totals.total_amount,

                    paid_amount:
                        currentPaid,

                    outstanding_amount:
                        outstanding

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
                    "account_receivable_id",
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

                            account_receivable_id:
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


            return this.getById(
                id
            );

        }

        catch (error) {

            console.error(
                "AccountReceivableService.update:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    DELETE
    ======================================================
    */

    async delete(id) {

        try {

            if (!id) {

                throw new Error(
                    "Account Receivable ID is required."
                );

            }


            /*
            ==================================================
            CHECK INVOICE
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
                    status
                `)

                .eq(
                    "id",
                    id
                )

                .single();


            if (findError) {

                throw findError;

            }


            if (!invoice) {

                throw new Error(
                    "Account Receivable not found."
                );

            }


            console.log(
                "AR DELETE TARGET:",
                invoice
            );


            /*
            ==================================================
            ONLY DRAFT / VOID CAN BE DELETED
            ==================================================
            */

            if (
                invoice.status
                    !==
                    this.STATUS.DRAFT
                &&
                invoice.status
                    !==
                    this.STATUS.VOID
            ) {

                throw new Error(
                    "Only Draft or Void Account Receivable can be deleted."
                );

            }


            /*
            ==================================================
            DELETE HEADER
            DETAIL AUTO DELETE BY CASCADE
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


            if (deleteError) {

                console.error(
                    "AR DELETE DATABASE ERROR:",
                    deleteError
                );


                throw deleteError;

            }


            if (
                !deletedInvoice
                ||
                deletedInvoice.length === 0
            ) {

                throw new Error(
                    "Account Receivable was not deleted from database."
                );

            }


            console.log(
                "ACCOUNT RECEIVABLE DELETED SUCCESSFULLY:",
                deletedInvoice[0]
            );


            return true;

        }

        catch (error) {

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
    ======================================================
    */

    async voidInvoice(
        id,
        reason = ""
    ) {

        try {

            if (!id) {

                throw new Error(
                    "Account Receivable ID is required."
                );

            }


            /*
            ==================================================
            GET INVOICE
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
                    paid_amount,
                    outstanding_amount
                `)

                .eq(
                    "id",
                    id
                )

                .single();


            if (findError) {

                throw findError;

            }


            if (!invoice) {

                throw new Error(
                    "Account Receivable not found."
                );

            }


            /*
            ==================================================
            ONLY UNPAID CAN BE VOIDED
            ==================================================
            */

            if (
                invoice.status
                !==
                this.STATUS.UNPAID
            ) {

                throw new Error(
                    "Only Unpaid Account Receivable can be voided."
                );

            }


            /*
            ==================================================
            PAYMENT VALIDATION
            ==================================================
            */

            if (
                Number(
                    invoice.paid_amount
                    || 0
                )
                >
                0
            ) {

                throw new Error(
                    "Account Receivable with payment cannot be voided."
                );

            }


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


            console.log(
                "AR VOID:",
                {
                    id,
                    reason,
                    result:
                        data
                }
            );


            return data;

        }

        catch (error) {

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
        GET PAYMENTS
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
                amount
            `)

            .eq(
                "account_receivable_id",
                accountReceivableId
            );


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
        SUM PAYMENT
        ==================================================
        */

        const total =
            (
                data
                ||
                []
            )
            .reduce(
                (
                    sum,
                    payment
                ) => {

                    return (
                        sum
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
        ==================================================
        RETURN
        ==================================================
        */

        return Number(
            total.toFixed(
                2
            )
        );

    }

    catch (error) {

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
    ======================================================
    */

    async getPaymentHistory(id) {

        try {

            if (!id) {

                throw new Error(
                    "Account Receivable ID is required."
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
                    *
                `)

                .eq(
                    "account_receivable_id",
                    id
                )

                .order(
                    "payment_date",
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


            if (error) {

                throw error;

            }


            return data || [];

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
    ======================================================
    */

    async createPayment(
        payment
    ) {

        try {

            if (
                !payment
            ) {

                throw new Error(
                    "Payment data is required."
                );

            }


            if (
                !payment.account_receivable_id
            ) {

                throw new Error(
                    "Account Receivable ID is required."
                );

            }


            if (
                !payment.payment_date
            ) {

                throw new Error(
                    "Payment Date is required."
                );

            }


            if (
                !payment.payment_account_id
            ) {

                throw new Error(
                    "Payment Account is required."
                );

            }


            if (
                Number(
                    payment.amount
                    || 0
                )
                <=
                0
            ) {

                throw new Error(
                    "Payment Amount must be greater than 0."
                );

            }


            const {

                data,

                error

            } = await supabase

                .from(
                    this.paymentTable
                )

                .insert({

                    account_receivable_id:
                        payment.account_receivable_id,

                    payment_date:
                        payment.payment_date,

                    payment_account_id:
                        Number(
                            payment.payment_account_id
                        ),

                    amount:
                        Number(
                            payment.amount
                        ),

                    reference_no:
                        payment.reference_no
                        || null,

                    description:
                        payment.description
                        || null,

                    gl_journal_id:
                        payment.gl_journal_id
                        || null

                })

                .select()

                .single();


            if (error) {

                throw error;

            }


            return data;

        }

        catch (error) {

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