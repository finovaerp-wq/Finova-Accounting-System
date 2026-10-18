/* ==========================================================
   FINOVA ACCOUNTING SYSTEM
   FIXED ASSET SERVICE
   Version : 1.1.0 FINAL

   TABLES
   ----------------------------------------------------------
   mst_fixed_asset_category
   mst_fixed_asset
   trx_fixed_asset_depreciation

   JOURNAL
   ----------------------------------------------------------
   trx_gl_journal
   trx_gl_journal_detail

   TENANT
   ----------------------------------------------------------
   finova_effective_company_id()
========================================================== */

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";

import {
    GeneralJournalService
} from "./journal.service.js";


export class FixedAssetService {


    /* ======================================================
       CONSTRUCTOR
    ====================================================== */

    constructor() {

        this.journalService =
            new GeneralJournalService();


        this.TABLE_CATEGORY =
            "mst_fixed_asset_category";


        this.TABLE_ASSET =
            "mst_fixed_asset";


        this.TABLE_DEPRECIATION =
            "trx_fixed_asset_depreciation";

    }


    /* ======================================================
       EFFECTIVE COMPANY
    ====================================================== */

    async companyId() {

        const {
            data,
            error
        } =
            await supabase.rpc(
                "finova_effective_company_id"
            );


        if (
            error
        ) {

            throw error;

        }


        if (
            !data
        ) {

            throw new Error(
                "Company Context is required."
            );

        }


        return data;

    }


    /* ======================================================
       CURRENT AUTH USER
    ====================================================== */

    async currentUserId() {

        const {
            data,
            error
        } =
            await supabase.auth.getUser();


        if (
            error
        ) {

            throw error;

        }


        return (
            data?.user?.id
            ||
            null
        );

    }


    /* ======================================================
       GET COA
    ====================================================== */

    async getCOA() {

        const {
            data,
            error
        } =
            await supabase
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
            data
            ||
            []
        );

    }


    /* ======================================================
       GET CATEGORIES
    ====================================================== */

    /* ======================================================
       FISCAL ASSET COMPATIBILITY
       Allows frontend deployment before optional fiscal DB
       columns are installed. Existing commercial functions
       remain operational.
    ====================================================== */

    fiscalPayload(
        payload = {}
    ) {

        const fiscalKeys =
            new Set([
                "fiscal_enabled",
                "fiscal_classification",
                "fiscal_group",
                "fiscal_method",
                "fiscal_start_date",
                "fiscal_useful_life_months",
                "fiscal_rate",
                "fiscal_reference"
            ]);


        return Object.fromEntries(
            Object.entries(
                payload
            ).filter(
                ([key]) =>
                    fiscalKeys.has(
                        key
                    )
            )
        );

    }




    async getCategories() {

        const {
            data,
            error
        } =
            await supabase
                .from(
                    this.TABLE_CATEGORY
                )
                .select("*")
                .order(
                    "category_code",
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
            data
            ||
            []
        );

    }


    /* ======================================================
       SAVE CATEGORY
    ====================================================== */

    async saveCategory(
        payload,
        id = null
    ) {

        const companyId =
            await this.companyId();


        const userId =
            await this.currentUserId();


        const now =
            new Date()
                .toISOString();


        const dataPayload = {

            category_code:
                String(
                    payload.category_code
                    ||
                    ""
                )
                    .trim()
                    .toUpperCase(),

            category_name:
                String(
                    payload.category_name
                    ||
                    ""
                )
                    .trim(),

            useful_life_months:
                Number(
                    payload.useful_life_months
                    ||
                    0
                ),

            asset_account_id:
                Number(
                    payload.asset_account_id
                ),

            accumulated_depreciation_account_id:
                Number(
                    payload.accumulated_depreciation_account_id
                ),

            depreciation_expense_account_id:
                Number(
                    payload.depreciation_expense_account_id
                ),

            disposal_gain_account_id:
                payload.disposal_gain_account_id
                    ? Number(
                        payload.disposal_gain_account_id
                    )
                    : null,

            disposal_loss_account_id:
                payload.disposal_loss_account_id
                    ? Number(
                        payload.disposal_loss_account_id
                    )
                    : null,

            description:
                payload.description
                    ? String(
                        payload.description
                    ).trim()
                    : null,

            /*
             * DATABASE COLUMN:
             * status BOOLEAN
             *
             * UI may still send is_active.
             */

            status:
                payload.status !== undefined
                    ? Boolean(
                        payload.status
                    )
                    :
                payload.is_active !== undefined
                    ? Boolean(
                        payload.is_active
                    )
                    :
                    true,

            company_id:
                companyId,

            updated_at:
                now,

            updated_by:
                userId

        };


        /* ==================================================
           VALIDATION
        ================================================== */

        if (
            !dataPayload.category_code
        ) {

            throw new Error(
                "Category Code is required."
            );

        }


        if (
            !dataPayload.category_name
        ) {

            throw new Error(
                "Category Name is required."
            );

        }


        if (
            dataPayload.useful_life_months <
            1
        ) {

            throw new Error(
                "Useful Life must be greater than 0 month."
            );

        }


        if (
            !dataPayload.asset_account_id
        ) {

            throw new Error(
                "Asset Account is required."
            );

        }


        if (
            !dataPayload
                .accumulated_depreciation_account_id
        ) {

            throw new Error(
                "Accumulated Depreciation Account is required."
            );

        }


        if (
            !dataPayload
                .depreciation_expense_account_id
        ) {

            throw new Error(
                "Depreciation Expense Account is required."
            );

        }


        /* ==================================================
           UPDATE
        ================================================== */

        if (
            id
        ) {

            const {
                data,
                error
            } =
                await supabase
                    .from(
                        this.TABLE_CATEGORY
                    )
                    .update(
                        dataPayload
                    )
                    .eq(
                        "id",
                        Number(
                            id
                        )
                    )
                    .select()
                    .single();


            if (
                error
            ) {

                throw error;

            }


            return data;

        }


        /* ==================================================
           INSERT
        ================================================== */

        dataPayload.created_at =
            now;


        dataPayload.created_by =
            userId;


        const {
            data,
            error
        } =
            await supabase
                .from(
                    this.TABLE_CATEGORY
                )
                .insert(
                    dataPayload
                )
                .select()
                .single();


        if (
            error
        ) {

            throw error;

        }


        return data;

    }


    /* ======================================================
       GET ASSETS
    ====================================================== */

    async getAssets() {

        const {
            data,
            error
        } =
            await supabase
                .from(
                    this.TABLE_ASSET
                )
                .select(`
                    *,
                    category:mst_fixed_asset_category(*)
                `)
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
            data
            ||
            []
        );

    }


    /* ======================================================
       GET ASSET BY ID
    ====================================================== */

    async getAssetById(
        id
    ) {

        const {
            data,
            error
        } =
            await supabase
                .from(
                    this.TABLE_ASSET
                )
                .select(`
                    *,
                    category:mst_fixed_asset_category(*)
                `)
                .eq(
                    "id",
                    Number(
                        id
                    )
                )
                .single();


        if (
            error
        ) {

            throw error;

        }


        return data;

    }


    /* ======================================================
       SAVE ASSET
    ====================================================== */

    async saveAsset(
        payload,
        id = null
    ) {

        const companyId =
            await this.companyId();


        const userId =
            await this.currentUserId();


        const now =
            new Date()
                .toISOString();


        const dataPayload = {

            asset_no:
                String(
                    payload.asset_no
                    ||
                    ""
                )
                    .trim()
                    .toUpperCase(),

            asset_name:
                String(
                    payload.asset_name
                    ||
                    ""
                )
                    .trim(),

            category_id:
                Number(
                    payload.category_id
                ),

            acquisition_date:
                payload.acquisition_date,

            acquisition_cost:
                Number(
                    payload.acquisition_cost
                    ||
                    0
                ),

            salvage_value:
                Number(
                    payload.salvage_value
                    ||
                    0
                ),

            useful_life_months:
                Number(
                    payload.useful_life_months
                    ||
                    0
                ),

            depreciation_start_date:
                payload.depreciation_start_date,

            depreciation_method:
                payload.depreciation_method
                ||
                "STRAIGHT_LINE",

            business_partner_id:
                payload.business_partner_id
                    ? Number(
                        payload.business_partner_id
                    )
                    : null,

            location:
                payload.location
                    ? String(
                        payload.location
                    ).trim()
                    : null,

            description:
                payload.description
                    ? String(
                        payload.description
                    ).trim()
                    : null,

            status:
                payload.status
                ||
                "Active",

            company_id:
                companyId,

            updated_at:
                now,

            updated_by:
                userId

        };


        /* ==================================================
           VALIDATION
        ================================================== */

        if (
            !dataPayload.asset_no
        ) {

            throw new Error(
                "Asset No is required."
            );

        }


        if (
            !dataPayload.asset_name
        ) {

            throw new Error(
                "Asset Name is required."
            );

        }


        if (
            !dataPayload.category_id
        ) {

            throw new Error(
                "Asset Category is required."
            );

        }


        if (
            !dataPayload.acquisition_date
        ) {

            throw new Error(
                "Acquisition Date is required."
            );

        }


        if (
            !dataPayload.depreciation_start_date
        ) {

            throw new Error(
                "Depreciation Start Date is required."
            );

        }


        if (
            dataPayload.acquisition_cost <
            0
        ) {

            throw new Error(
                "Acquisition Cost cannot be negative."
            );

        }


        if (
            dataPayload.salvage_value <
            0
        ) {

            throw new Error(
                "Salvage Value cannot be negative."
            );

        }


        if (
            dataPayload.salvage_value >
            dataPayload.acquisition_cost
        ) {

            throw new Error(
                "Salvage Value cannot exceed Acquisition Cost."
            );

        }


        if (
            dataPayload.useful_life_months <
            1
        ) {

            throw new Error(
                "Useful Life must be greater than 0 month."
            );

        }


        /* ==================================================
           UPDATE
        ================================================== */

        if (
            id
        ) {

            const current =
                await this.getAssetById(
                    id
                );


            if (
                current.status ===
                "Disposed"
            ) {

                throw new Error(
                    "Disposed Fixed Asset cannot be edited."
                );

            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        this.TABLE_ASSET
                    )
                    .update(
                        dataPayload
                    )
                    .eq(
                        "id",
                        Number(
                            id
                        )
                    )
                    .select(`
                        *,
                        category:mst_fixed_asset_category(*)
                    `)
                    .single();


            if (
                error
            ) {

                throw error;

            }


            return data;

        }


        /* ==================================================
           INSERT
        ================================================== */

        dataPayload.created_at =
            now;


        dataPayload.created_by =
            userId;


        const {
            data,
            error
        } =
            await supabase
                .from(
                    this.TABLE_ASSET
                )
                .insert(
                    dataPayload
                )
                .select(`
                    *,
                    category:mst_fixed_asset_category(*)
                `)
                .single();


        if (
            error
        ) {

            throw error;

        }


        return data;

    }


    /* ======================================================
       DELETE ASSET
    ====================================================== */

    async deleteAsset(
        id
    ) {

        const assetId =
            Number(
                id
            );


        if (
            !Number.isFinite(
                assetId
            )
            ||
            assetId <= 0
        ) {

            throw new Error(
                "Invalid Fixed Asset ID."
            );

        }


        const companyId =
            await this.companyId();


        const asset =
            await this.getAssetById(
                assetId
            );


        if (
            !asset?.id
        ) {

            throw new Error(
                "Fixed Asset not found."
            );

        }


        if (
            asset.status ===
            "Disposed"
        ) {

            throw new Error(
                "Disposed Fixed Asset cannot be deleted."
            );

        }


        if (
            asset.disposal_journal_id
        ) {

            throw new Error(
                "Fixed Asset already has a Disposal Journal and cannot be deleted."
            );

        }


        const {
            data: depreciations,
            error: depreciationError
        } =
            await supabase
                .from(
                    this.TABLE_DEPRECIATION
                )
                .select(`
                    id,
                    status,
                    gl_journal_id
                `)
                .eq(
                    "asset_id",
                    assetId
                );


        if (
            depreciationError
        ) {

            throw depreciationError;

        }


        if (
            depreciations?.length
        ) {

            const linkedJournal =
                depreciations.find(
                    row =>
                        row.gl_journal_id
                );


            if (
                linkedJournal
            ) {

                throw new Error(
                    "Asset has depreciation linked to a GL Journal and cannot be deleted."
                );

            }


            const nonVoid =
                depreciations.filter(
                    row =>
                        row.status !==
                        "Void"
                );


            if (
                nonVoid.length
            ) {

                throw new Error(
                    "Asset has depreciation history. Delete/void its depreciation first before deleting the asset."
                );

            }


            const voidIds =
                depreciations
                    .map(
                        row =>
                            Number(
                                row.id
                            )
                    )
                    .filter(
                        Number.isFinite
                    );


            if (
                voidIds.length
            ) {

                const {
                    error: voidDeleteError
                } =
                    await supabase
                        .from(
                            this.TABLE_DEPRECIATION
                        )
                        .delete()
                        .in(
                            "id",
                            voidIds
                        );


                if (
                    voidDeleteError
                ) {

                    throw voidDeleteError;

                }

            }

        }


        let query =
            supabase
                .from(
                    this.TABLE_ASSET
                )
                .delete()
                .eq(
                    "id",
                    assetId
                );


        if (
            companyId
        ) {

            query =
                query.eq(
                    "company_id",
                    companyId
                );

        }


        const {
            data: deleted,
            error
        } =
            await query
                .select(
                    "id, asset_no, asset_name"
                )
                .maybeSingle();


        if (
            error
        ) {

            console.error(
                "FixedAssetService.deleteAsset",
                {
                    message: error?.message,
                    details: error?.details,
                    hint: error?.hint,
                    code: error?.code,
                    assetId,
                    companyId
                }
            );

            throw error;

        }


        if (
            !deleted?.id
        ) {

            throw new Error(
                "Fixed Asset was not deleted. Check company access / RLS policy."
            );

        }


        return deleted;

    }

    /* ======================================================
       GET DEPRECIATIONS
    ====================================================== */

    async getDepreciations(
        assetId = null
    ) {

        let query =
            supabase
                .from(
                    this.TABLE_DEPRECIATION
                )
                .select(`
                    *,
                    asset:mst_fixed_asset(
                        id,
                        asset_no,
                        asset_name,
                        acquisition_cost,
                        salvage_value,
                        useful_life_months,
                        depreciation_start_date,
                        depreciation_method,
                        status
                    )
                `)
                .order(
                    "depreciation_date",
                    {
                        ascending:
                            true
                    }
                )
                .order(
                    "id",
                    {
                        ascending:
                            true
                    }
                );


        if (
            assetId !== null
            &&
            assetId !== undefined
        ) {

            query =
                query.eq(
                    "asset_id",
                    Number(
                        assetId
                    )
                );

        }


        const {
            data,
            error
        } =
            await query;


        if (
            error
        ) {

            throw error;

        }


        return (
            data
            ||
            []
        );

    }


    /* ======================================================
       DELETE DEPRECIATION HISTORY
       ONLY DRAFT + NO GL JOURNAL
    ====================================================== */

    async deleteDepreciation(
        id
    ) {

        const depreciationId =
            Number(
                id
            );


        if (
            !Number.isFinite(
                depreciationId
            )
            ||
            depreciationId <= 0
        ) {

            throw new Error(
                "Invalid depreciation transaction ID."
            );

        }


        const {
            data: depreciation,
            error: readError
        } =
            await supabase
                .from(
                    this.TABLE_DEPRECIATION
                )
                .select(`
                    id,
                    asset_id,
                    period_key,
                    status,
                    gl_journal_id
                `)
                .eq(
                    "id",
                    depreciationId
                )
                .maybeSingle();


        if (
            readError
        ) {

            throw readError;

        }


        if (
            !depreciation?.id
        ) {

            throw new Error(
                "Depreciation history not found."
            );

        }


        if (
            depreciation.status !==
            "Draft"
        ) {

            throw new Error(
                "Only Draft depreciation history can be deleted."
            );

        }


        if (
            depreciation.gl_journal_id
        ) {

            throw new Error(
                "Depreciation already has a GL Journal and cannot be deleted."
            );

        }


        const {
            data: deleted,
            error
        } =
            await supabase
                .from(
                    this.TABLE_DEPRECIATION
                )
                .delete()
                .eq(
                    "id",
                    depreciationId
                )
                .eq(
                    "status",
                    "Draft"
                )
                .is(
                    "gl_journal_id",
                    null
                )
                .select(
                    "id, asset_id, period_key"
                )
                .maybeSingle();


        if (
            error
        ) {

            console.error(
                "FixedAssetService.deleteDepreciation",
                {
                    message: error?.message,
                    details: error?.details,
                    hint: error?.hint,
                    code: error?.code,
                    depreciationId
                }
            );

            throw error;

        }


        if (
            !deleted?.id
        ) {

            throw new Error(
                "Depreciation history was not deleted. It may already be linked to a GL Journal or blocked by RLS."
            );

        }


        return deleted;

    }


    /* ======================================================
       MONTHLY DEPRECIATION
       STRAIGHT LINE
    ====================================================== */

    monthly(
        asset
    ) {

        const cost =
            Number(
                asset?.acquisition_cost
                ||
                0
            );


        const salvage =
            Number(
                asset?.salvage_value
                ||
                0
            );


        const life =
            Number(
                asset?.useful_life_months
                ||
                0
            );


        if (
            life <=
            0
        ) {

            return 0;

        }


        const depreciableAmount =
            Math.max(
                0,
                cost
                -
                salvage
            );


        return (
            depreciableAmount
            /
            life
        );

    }


    /* ======================================================
       CREATE DRAFT DEPRECIATION
    ====================================================== */

    async createDepreciation(
        asset,
        depreciationDate
    ) {

        if (
            !asset?.id
        ) {

            throw new Error(
                "Fixed Asset is required."
            );

        }


        if (
            asset.status !==
            "Active"
        ) {

            throw new Error(
                "Only Active Fixed Asset can be depreciated."
            );

        }


        if (
            !depreciationDate
        ) {

            throw new Error(
                "Depreciation Date is required."
            );

        }


        const depreciationStartDate =
            asset.depreciation_start_date
            ||
            asset.acquisition_date;


        if (
            !depreciationStartDate
        ) {

            throw new Error(
                "Depreciation Start Date is required."
            );

        }


        if (
            depreciationDate <
            depreciationStartDate
        ) {

            throw new Error(
                "Depreciation Date cannot be before Depreciation Start Date."
            );

        }


        const periodKey =
            String(
                depreciationDate
            )
                .slice(
                    0,
                    7
                );


        const all =
            await this.getDepreciations(
                asset.id
            );


        /* ==================================================
           PREVENT DUPLICATE PERIOD
        ================================================== */

        const duplicate =
            all.find(
                row =>
                    row.period_key ===
                        periodKey
                    &&
                    row.status !==
                        "Void"
            );


        if (
            duplicate
        ) {

            throw new Error(
                `Depreciation for period ${periodKey} already exists.`
            );

        }


        /* ==================================================
           POSTED ACCUMULATED
        ================================================== */

        const postedAccumulated =
            all
                .filter(
                    row =>
                        row.status ===
                        "Posted"
                )
                .reduce(
                    (
                        total,
                        row
                    ) =>
                        total
                        +
                        Number(
                            row.depreciation_amount
                            ||
                            0
                        ),

                    0
                );


        const cost =
            Number(
                asset.acquisition_cost
                ||
                0
            );


        const salvage =
            Number(
                asset.salvage_value
                ||
                0
            );


        const depreciableAmount =
            Math.max(
                0,
                cost
                -
                salvage
            );


        const remaining =
            Math.max(
                0,
                depreciableAmount
                -
                postedAccumulated
            );


        if (
            remaining <=
            0
        ) {

            throw new Error(
                "Asset is fully depreciated."
            );

        }


        const depreciationAmount =
            Math.round(
                Math.min(
                    this.monthly(
                        asset
                    ),
                    remaining
                )
            );


        if (
            depreciationAmount <=
            0
        ) {

            throw new Error(
                "Depreciation Amount must be greater than 0."
            );

        }


        const accumulated =
            postedAccumulated
            +
            depreciationAmount;


        const bookValue =
            Math.max(
                salvage,
                cost
                -
                accumulated
            );


        const companyId =
            await this.companyId();


        const userId =
            await this.currentUserId();


        const now =
            new Date()
                .toISOString();


        const payload = {

            company_id:
                companyId,

            asset_id:
                Number(
                    asset.id
                ),

            depreciation_date:
                depreciationDate,

            period_key:
                periodKey,

            depreciation_amount:
                depreciationAmount,

            accumulated_depreciation:
                accumulated,

            book_value:
                bookValue,

            status:
                "Draft",

            gl_journal_id:
                null,

            created_at:
                now,

            created_by:
                userId,

            updated_at:
                now,

            updated_by:
                userId

        };


        const {
            data,
            error
        } =
            await supabase
                .from(
                    this.TABLE_DEPRECIATION
                )
                .insert(
                    payload
                )
                .select()
                .single();


        if (
            error
        ) {

            console.error(
                "FixedAssetService.createDepreciation",
                {
                    message: error?.message,
                    details: error?.details,
                    hint: error?.hint,
                    code: error?.code,
                    payload
                }
            );

            throw error;

        }


        if (
            !data?.id
        ) {

            throw new Error(
                "Depreciation draft insert returned no transaction ID."
            );

        }


        return data;

    }


    /* ======================================================
       POST DEPRECIATION JOURNAL
    ====================================================== */

    async postDepreciationJournal(
        depreciation,
        asset
    ) {

        if (
            !depreciation?.id
        ) {

            throw new Error(
                "Depreciation transaction is required."
            );

        }


        if (
            !asset?.id
        ) {

            throw new Error(
                "Fixed Asset is required."
            );

        }


        if (
            depreciation.status !==
            "Draft"
        ) {

            throw new Error(
                "Only Draft depreciation can be posted."
            );

        }


        if (
            depreciation.gl_journal_id
        ) {

            throw new Error(
                "Depreciation already has a GL Journal."
            );

        }


        const category =
            asset.category;


        if (
            !category
        ) {

            throw new Error(
                "Asset Category is not available."
            );

        }


        if (
            !category.depreciation_expense_account_id
        ) {

            throw new Error(
                "Depreciation Expense Account is not configured in Asset Category."
            );

        }


        if (
            !category.accumulated_depreciation_account_id
        ) {

            throw new Error(
                "Accumulated Depreciation Account is not configured in Asset Category."
            );

        }


        const amount =
            Number(
                depreciation.depreciation_amount
                ||
                0
            );


        if (
            amount <=
            0
        ) {

            throw new Error(
                "Depreciation Amount must be greater than 0."
            );

        }


        /* ==================================================
           JOURNAL DETAIL

           DR Depreciation Expense
           CR Accumulated Depreciation
        ================================================== */

        const details = [

            {

                debit_account_id:
                    Number(
                        category
                            .depreciation_expense_account_id
                    ),

                credit_account_id:
                    Number(
                        category
                            .accumulated_depreciation_account_id
                    ),

                business_partner_id:
                    null,

                description:
                    `Depreciation ${asset.asset_no}`,

                amount:
                    amount

            }

        ];


        /* ==================================================
           CREATE GL JOURNAL
        ================================================== */

        let journal;


        try {

            journal =
                await this.journalService
                    .create(
                    {

                        journal_date:
                            depreciation
                                .depreciation_date,

                        accounting_date:
                            depreciation
                                .depreciation_date,

                        description:
                            `[AUTO] FIXED ASSET DEPRECIATION\n${asset.asset_no} - ${asset.asset_name}`,

                        status:
                            "Draft",

                        source_module:
                            "FA",

                        source_document_type:
                            "FA_DEPRECIATION",

                        /*
                         * trx_gl_journal.source_document_id
                         * is UUID in current DB.
                         *
                         * Fixed Asset depreciation ID is BIGINT,
                         * therefore it MUST NOT be written there.
                         */

                        source_document_id:
                            null,

                        source_invoice_no:
                            asset.asset_no

                    },

                    details
                );

        }

        catch (error) {

            console.error(
                "FixedAssetService.postDepreciationJournal.create",
                {
                    message: error?.message,
                    details: error?.details,
                    hint: error?.hint,
                    code: error?.code
                }
            );

            throw error;

        }


        if (
            !journal?.id
        ) {

            throw new Error(
                "GL Journal was created without Journal ID."
            );

        }


        const userId =
            await this.currentUserId();


        /* ==================================================
           UPDATE DEPRECIATION

           gl_journal_id = UUID
        ================================================== */

        const {
            data,
            error
        } =
            await supabase
                .from(
                    this.TABLE_DEPRECIATION
                )
                .update({

                    status:
                        "Draft",

                    gl_journal_id:
                        journal.id,

                    updated_at:
                        new Date()
                            .toISOString(),

                    updated_by:
                        userId

                })
                .eq(
                    "id",
                    Number(
                        depreciation.id
                    )
                )
                .eq(
                    "status",
                    "Draft"
                )
                .select()
                .single();


        if (
            error
        ) {

            throw error;

        }


        if (
            !data
        ) {

            throw new Error(
                "Depreciation GL Journal link could not be updated."
            );

        }


        return journal;

    }


    /* ======================================================
       DISPOSE ASSET
    ====================================================== */

    async disposeAsset(
        asset,
        disposalDate,
        amount,
        accountId
    ) {

        if (
            !asset?.id
        ) {

            throw new Error(
                "Fixed Asset is required."
            );

        }


        if (
            asset.status ===
            "Disposed"
        ) {

            throw new Error(
                "Fixed Asset is already disposed."
            );

        }


        if (
            asset.status !==
            "Active"
        ) {

            throw new Error(
                "Only Active Fixed Asset can be disposed."
            );

        }


        if (
            !disposalDate
        ) {

            throw new Error(
                "Disposal Date is required."
            );

        }


        if (
            disposalDate <
            asset.acquisition_date
        ) {

            throw new Error(
                "Disposal Date cannot be before Acquisition Date."
            );

        }


        const proceeds =
            Number(
                amount
                ||
                0
            );


        if (
            proceeds <
            0
        ) {

            throw new Error(
                "Disposal Proceeds cannot be negative."
            );

        }


        const proceedsAccountId =
            Number(
                accountId
            );


        if (
            proceeds >
            0
            &&
            !proceedsAccountId
        ) {

            throw new Error(
                "Cash / Bank / Disposal Proceeds Account is required."
            );

        }


        const category =
            asset.category;


        if (
            !category
        ) {

            throw new Error(
                "Asset Category is not available."
            );

        }


        if (
            !category.asset_account_id
        ) {

            throw new Error(
                "Asset Account is not configured in Asset Category."
            );

        }


        if (
            !category.accumulated_depreciation_account_id
        ) {

            throw new Error(
                "Accumulated Depreciation Account is not configured in Asset Category."
            );

        }


        /* ==================================================
           GET POSTED DEPRECIATION
        ================================================== */

        const depreciations =
            await this.getDepreciations(
                asset.id
            );


        const accumulatedDepreciation =
            depreciations
                .filter(
                    row =>
                        row.status ===
                        "Posted"
                )
                .reduce(
                    (
                        total,
                        row
                    ) =>
                        total
                        +
                        Number(
                            row.depreciation_amount
                            ||
                            0
                        ),

                    0
                );


        const cost =
            Number(
                asset.acquisition_cost
                ||
                0
            );


        const bookValue =
            Math.max(
                0,
                cost
                -
                accumulatedDepreciation
            );


        const gainLoss =
            proceeds
            -
            bookValue;


        /* ==================================================
           BUILD BALANCED DISPOSAL JOURNAL

           DR Cash/Bank                  proceeds
           DR Accumulated Depreciation  accumulated
           DR Loss                      if loss
               CR Fixed Asset           cost
               CR Gain                  if gain
        ================================================== */

        const details =
            [];


        /* ==================================================
           CASH / BANK
        ================================================== */

        if (
            proceeds >
            0
        ) {

            details.push({

                debit_account_id:
                    proceedsAccountId,

                credit_account_id:
                    null,

                business_partner_id:
                    asset.business_partner_id
                        ? Number(
                            asset.business_partner_id
                        )
                        : null,

                description:
                    `Disposal proceeds ${asset.asset_no}`,

                amount:
                    proceeds

            });

        }


        /* ==================================================
           CLEAR ACCUMULATED DEPRECIATION
        ================================================== */

        if (
            accumulatedDepreciation >
            0
        ) {

            details.push({

                debit_account_id:
                    Number(
                        category
                            .accumulated_depreciation_account_id
                    ),

                credit_account_id:
                    null,

                business_partner_id:
                    null,

                description:
                    `Clear accumulated depreciation ${asset.asset_no}`,

                amount:
                    accumulatedDepreciation

            });

        }


        /* ==================================================
           LOSS
        ================================================== */

        if (
            gainLoss <
            0
        ) {

            if (
                !category
                    .disposal_loss_account_id
            ) {

                throw new Error(
                    "Disposal Loss Account is not configured in Asset Category."
                );

            }


            details.push({

                debit_account_id:
                    Number(
                        category
                            .disposal_loss_account_id
                    ),

                credit_account_id:
                    null,

                business_partner_id:
                    null,

                description:
                    `Loss on disposal ${asset.asset_no}`,

                amount:
                    Math.abs(
                        gainLoss
                    )

            });

        }


        /* ==================================================
           REMOVE FIXED ASSET COST
        ================================================== */

        if (
            cost >
            0
        ) {

            details.push({

                debit_account_id:
                    null,

                credit_account_id:
                    Number(
                        category
                            .asset_account_id
                    ),

                business_partner_id:
                    null,

                description:
                    `Remove fixed asset ${asset.asset_no}`,

                amount:
                    cost

            });

        }


        /* ==================================================
           GAIN
        ================================================== */

        if (
            gainLoss >
            0
        ) {

            if (
                !category
                    .disposal_gain_account_id
            ) {

                throw new Error(
                    "Disposal Gain Account is not configured in Asset Category."
                );

            }


            details.push({

                debit_account_id:
                    null,

                credit_account_id:
                    Number(
                        category
                            .disposal_gain_account_id
                    ),

                business_partner_id:
                    null,

                description:
                    `Gain on disposal ${asset.asset_no}`,

                amount:
                    gainLoss

            });

        }


        if (
            !details.length
        ) {

            throw new Error(
                "Disposal Journal has no amount."
            );

        }


        /* ==================================================
           VALIDATE JOURNAL BALANCE
        ================================================== */

        const totalDebit =
            details.reduce(
                (
                    total,
                    row
                ) =>
                    total
                    +
                    (
                        row.debit_account_id
                            ? Number(
                                row.amount
                                ||
                                0
                            )
                            : 0
                    ),

                0
            );


        const totalCredit =
            details.reduce(
                (
                    total,
                    row
                ) =>
                    total
                    +
                    (
                        row.credit_account_id
                            ? Number(
                                row.amount
                                ||
                                0
                            )
                            : 0
                    ),

                0
            );


        if (
            Math.abs(
                totalDebit
                -
                totalCredit
            )
            >
            0.01
        ) {

            throw new Error(
                `Disposal Journal is not balanced. Debit ${totalDebit}, Credit ${totalCredit}.`
            );

        }


        /* ==================================================
           CREATE JOURNAL
        ================================================== */

        let journal;


        try {

            journal =
                await this.journalService
                    .create(
                    {

                        journal_date:
                            disposalDate,

                        accounting_date:
                            disposalDate,

                        description:
                            `[AUTO] FIXED ASSET DISPOSAL\n${asset.asset_no} - ${asset.asset_name}`,

                        status:
                            "Draft",

                        source_module:
                            "FA",

                        source_document_type:
                            "FA_DISPOSAL",

                        /*
                         * trx_gl_journal.source_document_id = UUID
                         * mst_fixed_asset.id = BIGINT
                         *
                         * therefore leave null.
                         */

                        source_document_id:
                            null,

                        source_invoice_no:
                            asset.asset_no

                    },

                    details
                );

        }

        catch (error) {

            console.error(
                "FixedAssetService.disposeAsset.createJournal",
                {
                    message: error?.message,
                    details: error?.details,
                    hint: error?.hint,
                    code: error?.code
                }
            );

            throw error;

        }


        if (
            !journal?.id
        ) {

            throw new Error(
                "Disposal GL Journal was created without Journal ID."
            );

        }


        const userId =
            await this.currentUserId();


        /* ==================================================
           UPDATE ASSET
        ================================================== */

        const {
            data,
            error
        } =
            await supabase
                .from(
                    this.TABLE_ASSET
                )
                .update({

                    status:
                        "Disposed",

                    disposal_date:
                        disposalDate,

                    disposal_amount:
                        proceeds,

                    disposal_account_id:
                        proceedsAccountId
                        ||
                        null,

                    /*
                     * UUID -> UUID
                     */

                    disposal_journal_id:
                        journal.id,

                    updated_at:
                        new Date()
                            .toISOString(),

                    updated_by:
                        userId

                })
                .eq(
                    "id",
                    Number(
                        asset.id
                    )
                )
                .eq(
                    "status",
                    "Active"
                )
                .select()
                .single();


        if (
            error
        ) {

            throw error;

        }


        if (
            !data
        ) {

            throw new Error(
                "Fixed Asset disposal status could not be updated."
            );

        }


        return journal;

    }

}