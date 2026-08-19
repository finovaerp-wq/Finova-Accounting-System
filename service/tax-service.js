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
                    tax_rate,
                    tax_account_id,
                    offset_account_id,
                    description,
                    status,
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
                    tax_rate,
                    tax_account_id,
                    offset_account_id,
                    description,
                    status,

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
                    tax_rate,
                    tax_account_id,
                    offset_account_id,
                    description,
                    status
                `)

                .eq(
                    "status",
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
                    tax_rate,
                    tax_account_id,
                    offset_account_id,
                    description,
                    status
                `)

                .eq(
                    "tax_type",
                    type
                )

                .eq(
                    "status",
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
                    payload.tax_rate || 0
                );


            const taxAccountId =
                Number(
                    payload.tax_account_id || 0
                );


            const offsetAccountId =
                Number(
                    payload.offset_account_id || 0
                );


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


            if (!offsetAccountId) {

                throw new Error(
                    "Offset Account is required."
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

                    tax_rate:
                        taxRate,

                    tax_account_id:
                        taxAccountId,

                    offset_account_id:
                        offsetAccountId,

                    description:
                        payload.description
                        || null,

                    status:
                        payload.status
                        !== undefined
                            ? Boolean(
                                payload.status
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

            if (!id) {

                throw new Error(
                    "Tax ID is required."
                );

            }


            if (!payload) {

                throw new Error(
                    "Tax data is required."
                );

            }


            const updateData = {};


            if (
                payload.tax_code
                !== undefined
            ) {

                updateData.tax_code =
                    String(
                        payload.tax_code
                    )
                    .trim()
                    .toUpperCase();

            }


            if (
                payload.tax_name
                !== undefined
            ) {

                updateData.tax_name =
                    String(
                        payload.tax_name
                    )
                    .trim();

            }


            if (
                payload.tax_type
                !== undefined
            ) {

                const type =
                    String(
                        payload.tax_type
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


            if (
                payload.tax_rate
                !== undefined
            ) {

                const rate =
                    Number(
                        payload.tax_rate
                    );


                if (
                    rate < 0
                    ||
                    rate > 100
                ) {

                    throw new Error(
                        "Tax Rate must be between 0 and 100."
                    );

                }


                updateData.tax_rate =
                    rate;

            }


            if (
                payload.tax_account_id
                !== undefined
            ) {

                updateData.tax_account_id =
                    Number(
                        payload.tax_account_id
                    );

            }


            if (
                payload.offset_account_id
                !== undefined
            ) {

                updateData.offset_account_id =
                    Number(
                        payload.offset_account_id
                    );

            }


            if (
                payload.description
                !== undefined
            ) {

                updateData.description =
                    payload.description
                    || null;

            }


            if (
                payload.status
                !== undefined
            ) {

                updateData.status =
                    Boolean(
                        payload.status
                    );

            }


            const {
                data,
                error
            } = await supabase

                .from(this.table)

                .update(
                    updateData
                )

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

                throw new Error(
                    "Tax ID is required."
                );

            }


            const {
                error
            } = await supabase

                .from(this.table)

                .delete()

                .eq(
                    "id",
                    id
                );


            if (error) {

                throw error;

            }


            return true;

        }

        catch (error) {

            console.error(
                "TaxService.delete:",
                error
            );

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