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


    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor() {

        this.table = TABLE.ACCOUNT_PAYABLE;

        this.detailTable =
            TABLE.ACCOUNT_PAYABLE_DETAIL;

    }


    /*
    ======================================================
    STATUS
    ======================================================
    */

    get STATUS() {

        return {

            DRAFT: "Draft",

            POSTED: "Posted",

            PARTIAL_PAID: "Partial Paid",

            PAID: "Paid",

            VOID: "Void"

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

                .from(this.table)

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

                .order(
                    "invoice_date",
                    {
                        ascending: false
                    }
                );


            if (error) {

                throw error;

            }


            return data || [];

        }

        catch (error) {

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

                .from(this.table)

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

                throw headerError;

            }


            /*
            ==================================================
            DETAIL
            ==================================================
            */

            const {

                data: details,

                error: detailError

            } = await supabase

                .from(this.detailTable)

                .select(`
                    *,
                    mst_chart_of_accounts (
                        id,
                        account_code,
                        account_name,
                        parent_id,
                        level,
                        normal_balance,
                        is_header,
                        allow_transaction,
                        status
                    )
                `)

                .eq(
                    "account_payable_id",
                    id
                )

                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


            if (detailError) {

                throw detailError;

            }


            return {

                header,

                details:
                    details || []

            };

        }

        catch (error) {

            console.error(
                "AccountPayableService.getById:",
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

    async search(filters = {}) {

        try {

            let query = supabase

                .from(this.table)

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

                query = query.gte(
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

                query = query.lte(
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
                filters.status &&
                filters.status !== "all"
            ) {

                if (
                    filters.status ===
                    "not_completed"
                ) {

                    query = query.in(
                        "status",
                        [
                            this.STATUS.DRAFT,
                            this.STATUS.POSTED,
                            this.STATUS.PARTIAL_PAID
                        ]
                    );

                }

                else if (
                    filters.status ===
                    "completed"
                ) {

                    query = query.eq(
                        "status",
                        this.STATUS.PAID
                    );

                }

                else {

                    query = query.eq(
                        "status",
                        filters.status
                    );

                }

            }


            /*
            ==================================================
            ORDER
            ==================================================
            */

            query = query.order(
                "invoice_date",
                {
                    ascending: false
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


            let result = data || [];


            /*
            ==================================================
            KEYWORD
            ==================================================
            */

            if (
                filters.keyword &&
                filters.keyword.trim()
            ) {

                const keyword =

                    filters.keyword
                        .trim()
                        .toLowerCase();


                result = result.filter(
                    invoice => {

                        const invoiceNo =

                            String(
                                invoice.invoice_no
                                || ""
                            )
                            .toLowerCase();


                        const vendorName =

                            String(
                                invoice
                                    .mst_business_partner
                                    ?.bp_name
                                || ""
                            )
                            .toLowerCase();


                        const vendorCode =

                            String(
                                invoice
                                    .mst_business_partner
                                    ?.bp_code
                                || ""
                            )
                            .toLowerCase();


                        return (

                            invoiceNo.includes(
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

                        );

                    }
                );

            }


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


            if (!details.length) {

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

                .from(this.table)

                .insert({

                    ...header,

                    ...totals,

                    status:
                        header.status
                        || this.STATUS.DRAFT

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

                        account_payable_id:
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

                .from(this.detailTable)

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

                    .from(this.table)

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
                    insertedDetails || []

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
                    "Account Payable ID is required."
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
            UPDATE HEADER
            ==================================================
            */

            const {

                data: invoice,

                error: invoiceError

            } = await supabase

                .from(this.table)

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

                .from(this.detailTable)

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

                    .from(this.detailTable)

                    .insert(
                        detailRows
                    );


                if (insertError) {

                    throw insertError;

                }

            }


            return this.getById(id);

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
DELETE
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
        CHECK INVOICE
        ==================================================
        */

        const {

            data: invoice,

            error: findError

        } = await supabase

            .from(this.table)

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
                "Account Payable not found."
            );

        }


        console.log(
            "DELETE TARGET:",
            invoice
        );


        /*
        ==================================================
        CHECK STATUS
        ==================================================
        */

        if (
            invoice.status !==
            this.STATUS.DRAFT
        ) {

            throw new Error(
                "Only Draft Account Payable can be deleted."
            );

        }


        /*
        ==================================================
        DELETE HEADER
        ==================================================
        */

        const {

            data: deletedInvoice,

            error: deleteError

        } = await supabase

            .from(this.table)

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
        DEBUG RESULT
        ==================================================
        */

        console.log(
            "DELETE RESULT:",
            deletedInvoice
        );


        /*
        ==================================================
        VERIFY DELETE
        ==================================================
        */

        if (
            !deletedInvoice ||
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

        const {
            data: invoice,
            error: findError
        } = await supabase

            .from(this.table)

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
                "Account Payable not found."
            );

        }
        console.log(
    "AP VOID BEFORE UPDATE:",
    {
        id: invoice?.id,
        invoice_no: invoice?.invoice_no,
        status: invoice?.status,
        total_amount: invoice?.total_amount,
        outstanding_amount:
            invoice?.outstanding_amount
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
        UPDATE STATUS
        ==================================================
        */

        const {
            data,
            error: updateError
        } = await supabase

            .from(this.table)

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
POST ACCOUNT PAYABLE
======================================================
*/

async postInvoice(id) {

    try {

        if (!id) {

            throw new Error(
                "Account Payable ID is required."
            );

        }


        const {
            data,
            error
        } = await supabase

            .from(this.table)

            .update({

                status: "Posted"

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
            "AccountPayableService.postInvoice:",
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