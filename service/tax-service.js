/*
======================================================
FINOVA ACCOUNTING SYSTEM
SERVICE : TAX
TABLE   : mst_taxes
======================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";


export class TaxService {

    /*
    ==================================================
    CONSTRUCTOR
    ==================================================
    */

    constructor() {

        this.table =
            TABLE.TAX;

    }



    /*
    ==================================================
    TAX USAGE CHECK
    Prevent deactivation/deletion when a tax is referenced
    by AP or AR invoice detail rows.
    ==================================================
    */

    async assertTaxNotInUse(id) {

        if (!id) {
            throw new Error("Tax ID is required.");
        }

        const taxId = Number(id);
        if (!Number.isInteger(taxId) || taxId <= 0) {
            throw new Error("Invalid Tax ID.");
        }

        const references = [
            {
                table: "trx_account_payable_detail",
                label: "Invoice AP"
            },
            {
                table: "trx_account_receivable_detail",
                label: "Invoice AR"
            }
        ];

        for (const reference of references) {
            for (const column of ["tax_plus_id", "tax_minus_id"]) {
                const { data, error } = await supabase
                    .from(reference.table)
                    .select("id")
                    .eq(column, taxId)
                    .limit(1);

                // Fail closed: if schema/table access cannot be checked,
                // do not permit a destructive/status change silently.
                if (error) {
                    throw new Error(
                        `Tidak dapat memeriksa penggunaan Tax pada ${reference.label} (${column}). ` +
                        `Perubahan dibatalkan demi keamanan. Detail: ${error.message || "query gagal"}`
                    );
                }

                if (Array.isArray(data) && data.length > 0) {
                    throw new Error(
                        `Tax tidak dapat dinonaktifkan atau dihapus karena sudah digunakan pada ${reference.label}.`
                    );
                }
            }
        }

        return true;
    }


    /*
    ==================================================
    GET ALL TAX
    ==================================================
    */

    async getAll() {

        try {

            const {
                data,
                error
            } = await supabase

                .from(this.table)

                .select(`
                    id,
                    tax_code,
                    tax_name,
                    tax_type,
                    rate,
                    tax_account_id,
                    offset_account_id,
                    description,
                    is_active,
                    created_at,
                    updated_at,

                    tax_account:mst_chart_of_accounts!fk_mst_taxes_tax_account (
                        id,
                        account_code,
                        account_name
                    ),

                    offset_account:mst_chart_of_accounts!fk_mst_taxes_offset_account (
                        id,
                        account_code,
                        account_name
                    )
                `)

                .order(
                    "tax_code",
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
                "TaxService.getAll:",
                error
            );

            throw error;

        }

    }


    /*
    ==================================================
    GET TAX BY ID
    ==================================================
    */

    async getById(id) {

        try {

            if (!id) {

                throw new Error(
                    "Tax ID is required."
                );

            }


            const {
                data,
                error
            } = await supabase

                .from(this.table)

                .select(`
                    id,
                    tax_code,
                    tax_name,
                    tax_type,
                    rate,
                    tax_account_id,
                    offset_account_id,
                    description,
                    is_active,

                    tax_account:mst_chart_of_accounts!fk_mst_taxes_tax_account (
                        id,
                        account_code,
                        account_name
                    ),

                    offset_account:mst_chart_of_accounts!fk_mst_taxes_offset_account (
                        id,
                        account_code,
                        account_name
                    )
                `)

                .eq(
                    "id",
                    id
                )

                .single();


            if (error) {

                throw error;

            }


            return data;

        }

        catch (error) {

            console.error(
                "TaxService.getById:",
                error
            );

            throw error;

        }

    }


    /*
    ==================================================
    GET ACTIVE TAX
    ==================================================
    */

    async getActive() {

        try {

            const {
                data,
                error
            } = await supabase

                .from(this.table)

                .select(`
                    id,
                    tax_code,
                    tax_name,
                    tax_type,
                    rate,
                    tax_account_id,
                    offset_account_id,
                    description,
                    is_active
                `)

                .eq(
                    "is_active",
                    true
                )

                .order(
                    "tax_code",
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
                "TaxService.getActive:",
                error
            );

            throw error;

        }

    }


    /*
    ==================================================
    GET TAX BY TYPE
    ==================================================
    */

    async getByType(
        taxType
    ) {

        try {

            const type =
                String(
                    taxType || ""
                )
                .trim()
                .toUpperCase();


            if (
                ![
                    "PLUS",
                    "MINUS"
                ].includes(type)
            ) {

                throw new Error(
                    "Invalid tax type."
                );

            }


            const {
                data,
                error
            } = await supabase

                .from(this.table)

                .select(`
                    id,
                    tax_code,
                    tax_name,
                    tax_type,
                    rate,
                    tax_account_id,
                    offset_account_id,
                    description,
                    is_active
                `)

                .eq(
                    "tax_type",
                    type
                )

                .eq(
                    "is_active",
                    true
                )

                .order(
                    "tax_code",
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
                "TaxService.getByType:",
                error
            );

            throw error;

        }

    }


    /*
    ==================================================
    CREATE TAX
    ==================================================
    */

    async create(payload) {

        try {

            if (!payload) {

                throw new Error(
                    "Tax data is required."
                );

            }


            const taxCode =
                String(
                    payload.tax_code || ""
                )
                .trim()
                .toUpperCase();


            const taxName =
                String(
                    payload.tax_name || ""
                )
                .trim();


            const taxType =
                String(
                    payload.tax_type || ""
                )
                .trim()
                .toUpperCase();


            const taxRate =
                Number(
                    payload.rate || 0
                );


            const taxAccountId =
                payload.tax_account_id
                || null;


            const offsetAccountId =
                payload.offset_account_id
                || null;


            /*
            ==========================================
            VALIDATION
            ==========================================
            */

            if (!taxCode) {

                throw new Error(
                    "Tax Code is required."
                );

            }


            if (!taxName) {

                throw new Error(
                    "Tax Name is required."
                );

            }


            if (
                ![
                    "PLUS",
                    "MINUS"
                ].includes(taxType)
            ) {

                throw new Error(
                    "Tax Type must be PLUS or MINUS."
                );

            }


            if (
                taxRate < 0
                ||
                taxRate > 100
            ) {

                throw new Error(
                    "Tax Rate must be between 0 and 100."
                );

            }


            if (!taxAccountId) {

                throw new Error(
                    "Tax Account is required."
                );

            }


           


            /*
            ==========================================
            INSERT
            ==========================================
            */

            const {
                data,
                error
            } = await supabase

                .from(this.table)

                .insert({

                    tax_code:
                        taxCode,

                    tax_name:
                        taxName,

                    tax_type:
                        taxType,

                    rate:
                        taxRate,

                    tax_account_id:
                        taxAccountId,

                    offset_account_id:
                        offsetAccountId,

                    description:
                        payload.description
                        || null,

                    is_active:
                        payload.is_active
                        !== undefined
                            ? Boolean(
                                payload.is_active
                            )
                            : true

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
                "TaxService.create:",
                error
            );

            throw error;

        }

    }


   /*
==================================================
UPDATE TAX
==================================================
*/

async update(
    id,
    payload
) {

    try {

        /*
        ==============================================
        VALIDATE ID
        ==============================================
        */

        if (!id) {

            throw new Error(
                "Tax ID is required."
            );

        }


        /*
        ==============================================
        VALIDATE PAYLOAD
        ==============================================
        */

        if (!payload) {

            throw new Error(
                "Tax data is required."
            );

        }


        /*
        ==============================================
        PREVENT DEACTIVATION OF TAX ALREADY IN USE
        ==============================================
        */

        if (payload.is_active === false) {
            const { data: currentTax, error: currentTaxError } = await supabase
                .from(this.table)
                .select("id, is_active")
                .eq("id", id)
                .maybeSingle();

            if (currentTaxError) {
                throw currentTaxError;
            }

            if (!currentTax) {
                throw new Error("Tax tidak ditemukan.");
            }

            if (currentTax.is_active === true) {
                await this.assertTaxNotInUse(id);
            }
        }

        /*
        ==============================================
        UPDATE DATA
        ==============================================
        */

        const updateData = {};


        /*
        ==============================================
        TAX CODE
        ==============================================
        */

        if (
            payload.tax_code
            !== undefined
        ) {

            const taxCode =
                String(
                    payload.tax_code
                    || ""
                )
                .trim()
                .toUpperCase();


            if (!taxCode) {

                throw new Error(
                    "Tax Code is required."
                );

            }


            updateData.tax_code =
                taxCode;

        }


        /*
        ==============================================
        TAX NAME
        ==============================================
        */

        if (
            payload.tax_name
            !== undefined
        ) {

            const taxName =
                String(
                    payload.tax_name
                    || ""
                )
                .trim();


            if (!taxName) {

                throw new Error(
                    "Tax Name is required."
                );

            }


            updateData.tax_name =
                taxName;

        }


        /*
        ==============================================
        TAX TYPE
        ==============================================
        */

        if (
            payload.tax_type
            !== undefined
        ) {

            const type =
                String(
                    payload.tax_type
                    || ""
                )
                .trim()
                .toUpperCase();


            if (
                ![
                    "PLUS",
                    "MINUS"
                ].includes(type)
            ) {

                throw new Error(
                    "Tax Type must be PLUS or MINUS."
                );

            }


            updateData.tax_type =
                type;

        }


        /*
        ==============================================
        TAX RATE
        ==============================================
        */

        if (
            payload.rate
            !== undefined
        ) {

            const rate =
                Number(
                    payload.rate
                );


            if (
                Number.isNaN(rate)
                ||
                rate < 0
                ||
                rate > 100
            ) {

                throw new Error(
                    "Tax Rate must be between 0 and 100."
                );

            }


            updateData.rate =
                rate;

        }


        /*
        ==============================================
        TAX ACCOUNT
        REQUIRED
        ==============================================
        */

        if (
            payload.tax_account_id
            !== undefined
        ) {

            const taxAccountId =
                Number(
                    payload.tax_account_id
                    || 0
                );


            if (
                !Number.isInteger(
                    taxAccountId
                )
                ||
                taxAccountId <= 0
            ) {

                throw new Error(
                    "Tax Account is required."
                );

            }


            updateData.tax_account_id =
                taxAccountId;

        }


        /*
        ==============================================
        OFFSET ACCOUNT
        OPTIONAL
        ==============================================
        */

        if (
            payload.offset_account_id
            !== undefined
        ) {

            const offsetAccountId =
                Number(
                    payload.offset_account_id
                    || 0
                );


            updateData.offset_account_id =
                offsetAccountId > 0
                    ? offsetAccountId
                    : null;

        }


        /*
        ==============================================
        DESCRIPTION
        ==============================================
        */

        if (
            payload.description
            !== undefined
        ) {

            const description =
                String(
                    payload.description
                    || ""
                )
                .trim();


            updateData.description =
                description
                    || null;

        }


        /*
        ==============================================
        STATUS
        ==============================================
        */

        if (
            payload.is_active
            !== undefined
        ) {

            updateData.is_active =
                Boolean(
                    payload.is_active
                );

        }


        /*
        ==============================================
        VALIDATE UPDATE DATA
        ==============================================
        */

        if (
            !Object.keys(
                updateData
            ).length
        ) {

            throw new Error(
                "No Tax data to update."
            );

        }


        /*
        ==============================================
        DEBUG
        ==============================================
        */

        console.log(
            "TaxService.update DATA:",
            updateData
        );


        /*
        ==============================================
        UPDATE DATABASE
        ==============================================
        */

        const {
            data,
            error
        } = await supabase

            .from(
                this.table
            )

            .update(
                updateData
            )

            .eq(
                "id",
                id
            )

            .select()

            .single();


        /*
        ==============================================
        ERROR
        ==============================================
        */

        if (error) {

            throw error;

        }


        /*
        ==============================================
        RETURN
        ==============================================
        */

        return data;

    }

    catch (error) {

        console.error(
            "TaxService.update:",
            error
        );


        throw error;

    }

}

    /*
    ==================================================
    DELETE TAX
    ==================================================
    */

    async delete(id) {

        try {

            if (!id) {
                throw new Error("Tax ID is required.");
            }

            // Prevent deleting taxes that are used by AP/AR invoice details.
            await this.assertTaxNotInUse(id);

            const {
                data,
                error
            } = await supabase
                .from(this.table)
                .delete()
                .eq("id", id)
                .select("id");

            if (error) {
                throw error;
            }

            // Supabase can return no error when RLS filters the row out.
            // Do not report success unless a row was actually deleted.
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error(
                    "Tax tidak terhapus. Data tidak ditemukan atau akses ditolak oleh kebijakan keamanan (RLS)."
                );
            }

            return true;

        } catch (error) {

            console.error("TaxService.delete:", error);
            throw error;

        }

    }

    /*
    ==================================================
    CALCULATE TAX
    ==================================================
    */

    calculateTax(
        amount,
        rate
    ) {

        const base =
            Number(
                amount || 0
            );


        const percentage =
            Number(
                rate || 0
            );


        if (
            base <= 0
            ||
            percentage <= 0
        ) {

            return 0;

        }


        return (
            base
            * percentage
            / 100
        );

    }

}