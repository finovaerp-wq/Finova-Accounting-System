/*
==========================================================
FINOVA ACCOUNTING SYSTEM
SERVICE : CASH FLOW FORECAST
FILE    : cash-flow-forecast.service.js
VERSION : 2.0.0 ENTERPRISE TREASURY FINAL
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";

import {
    AccountReceivableService
} from "./account-receivable.service.js";

import {
    AccountPayableService
} from "./account-payable.service.js";

import {
    FinancialReportService
} from "./financial-report.service.js";


export class CashFlowForecastService {

    constructor() {

        this.arService =
            new AccountReceivableService();

        this.apService =
            new AccountPayableService();

        this.manualTable =
            "trx_cash_flow_forecast_manual";

    }


    /* ======================================================
       NUMBER
    ====================================================== */

    toNumber(value) {

        const n =
            Number(value ?? 0);

        return Number.isFinite(n)
            ? n
            : 0;

    }


    /* ======================================================
       DATE
    ====================================================== */

    parseDate(value) {

        if (!value) {
            return null;
        }

        const d =
            new Date(
                `${String(value).slice(0, 10)}T00:00:00`
            );

        return Number.isNaN(d.getTime())
            ? null
            : d;

    }


    formatISO(date) {

        const y =
            date.getFullYear();

        const m =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const d =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${y}-${m}-${d}`;

    }


    addDays(date, days) {

        const result =
            new Date(date);

        result.setDate(
            result.getDate() + days
        );

        return result;

    }


    startOfWeek(date) {

        const d =
            new Date(date);

        const day =
            d.getDay();

        const diff =
            day === 0
                ? -6
                : 1 - day;

        d.setDate(
            d.getDate() + diff
        );

        d.setHours(
            0,
            0,
            0,
            0
        );

        return d;

    }


    /* ======================================================
       EFFECTIVE COMPANY
    ====================================================== */

    async getEffectiveCompanyId() {

        const {
            data,
            error
        } = await supabase.rpc(
            "finova_effective_company_id"
        );

        if (error) {

            console.error(
                "CASH FLOW FORECAST EFFECTIVE COMPANY ERROR:",
                error
            );

            throw error;

        }

        if (!data) {

            throw new Error(
                "Company Context is required."
            );

        }

        return data;

    }


    /* ======================================================
       BUSINESS PARTNERS
    ====================================================== */

    async getBusinessPartners() {

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
                is_active
            `)

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

            console.error(
                "CASH FLOW FORECAST BUSINESS PARTNER ERROR:",
                error
            );

            throw error;

        }


        return Array.isArray(data)
            ? data
            : [];

    }


    /* ======================================================
       MANUAL FORECAST - GET ALL
    ====================================================== */

    async getManualForecasts() {

        const {
            data,
            error
        } = await supabase

            .from(
                this.manualTable
            )

            .select(`
                *,
                mst_business_partner (
                    id,
                    bp_code,
                    bp_name,
                    bp_type
                )
            `)

            .eq(
                "status",
                "Active"
            )

            .order(
                "forecast_date",
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


        if (error) {

            console.error(
                "CASH FLOW FORECAST MANUAL GET ALL ERROR:",
                error
            );

            throw error;

        }


        return Array.isArray(data)
            ? data
            : [];

    }


    /* ======================================================
       MANUAL FORECAST - CREATE
    ====================================================== */

    async createManualForecast(payload) {

        const companyId =
            await this.getEffectiveCompanyId();


        const row = {

            company_id:
                companyId,

            forecast_type:
                payload.forecast_type,

            forecast_date:
                payload.forecast_date,

            category:
                String(
                    payload.category || ""
                ).trim(),

            description:
                String(
                    payload.description || ""
                ).trim(),

            business_partner_id:
                payload.business_partner_id
                    ? payload.business_partner_id
                    : null,

            amount:
                this.toNumber(
                    payload.amount
                ),

            notes:
                String(
                    payload.notes || ""
                ).trim() || null,

            status:
                "Active"

        };


        if (
            ![
                "CASH_IN",
                "CASH_OUT"
            ].includes(
                row.forecast_type
            )
        ) {

            throw new Error(
                "Manual Forecast Type is invalid."
            );

        }


        if (!row.forecast_date) {

            throw new Error(
                "Forecast Date is required."
            );

        }


        if (!row.category) {

            throw new Error(
                "Category is required."
            );

        }


        if (!row.description) {

            throw new Error(
                "Description is required."
            );

        }


        if (row.amount <= 0) {

            throw new Error(
                "Amount must be greater than 0."
            );

        }


        const {
            data,
            error
        } = await supabase

            .from(
                this.manualTable
            )

            .insert(
                row
            )

            .select()

            .single();


        if (error) {

            console.error(
                "CASH FLOW FORECAST MANUAL CREATE ERROR:",
                error
            );

            throw error;

        }


        return data;

    }


    /* ======================================================
       MANUAL FORECAST - UPDATE
    ====================================================== */

    async updateManualForecast(
        id,
        payload
    ) {

        if (!id) {

            throw new Error(
                "Manual Forecast ID is required."
            );

        }


        const row = {

            forecast_type:
                payload.forecast_type,

            forecast_date:
                payload.forecast_date,

            category:
                String(
                    payload.category || ""
                ).trim(),

            description:
                String(
                    payload.description || ""
                ).trim(),

            business_partner_id:
                payload.business_partner_id
                    ? payload.business_partner_id
                    : null,

            amount:
                this.toNumber(
                    payload.amount
                ),

            notes:
                String(
                    payload.notes || ""
                ).trim() || null

        };


        if (
            ![
                "CASH_IN",
                "CASH_OUT"
            ].includes(
                row.forecast_type
            )
        ) {

            throw new Error(
                "Manual Forecast Type is invalid."
            );

        }


        if (!row.forecast_date) {

            throw new Error(
                "Forecast Date is required."
            );

        }


        if (!row.category) {

            throw new Error(
                "Category is required."
            );

        }


        if (!row.description) {

            throw new Error(
                "Description is required."
            );

        }


        if (row.amount <= 0) {

            throw new Error(
                "Amount must be greater than 0."
            );

        }


        const {
            data,
            error
        } = await supabase

            .from(
                this.manualTable
            )

            .update(
                row
            )

            .eq(
                "id",
                id
            )

            .select()

            .single();


        if (error) {

            console.error(
                "CASH FLOW FORECAST MANUAL UPDATE ERROR:",
                error
            );

            throw error;

        }


        return data;

    }


    /* ======================================================
       MANUAL FORECAST - DELETE
    ====================================================== */

    async deleteManualForecast(id) {

        if (!id) {

            throw new Error(
                "Manual Forecast ID is required."
            );

        }


        const {
            error
        } = await supabase

            .from(
                this.manualTable
            )

            .delete()

            .eq(
                "id",
                id
            );


        if (error) {

            console.error(
                "CASH FLOW FORECAST MANUAL DELETE ERROR:",
                error
            );

            throw error;

        }


        return true;

    }


    /* ======================================================
       BUILD WEEKS
    ====================================================== */

    buildWeeks(
        startDate,
        numberOfWeeks = 8
    ) {

        const start =
            this.startOfWeek(
                this.parseDate(startDate)
                ??
                new Date()
            );


        const count =
            Math.min(
                Math.max(
                    Number(numberOfWeeks) || 8,
                    1
                ),
                26
            );


        return Array.from(
            {
                length: count
            },
            (
                _,
                index
            ) => {

                const dateFrom =
                    this.addDays(
                        start,
                        index * 7
                    );

                const dateTo =
                    this.addDays(
                        dateFrom,
                        6
                    );


                return {

                    index,

                    key:
                        `W${index + 1}`,

                    label:
                        `Week ${index + 1}`,

                    dateFrom:
                        this.formatISO(
                            dateFrom
                        ),

                    dateTo:
                        this.formatISO(
                            dateTo
                        ),

                    autoCashIn:
                        0,

                    manualCashIn:
                        0,

                    cashIn:
                        0,

                    autoCashOut:
                        0,

                    manualCashOut:
                        0,

                    cashOut:
                        0,

                    netCashFlow:
                        0,

                    openingCash:
                        0,

                    endingCash:
                        0,

                    arItems:
                        [],

                    apItems:
                        [],

                    manualCashInItems:
                        [],

                    manualCashOutItems:
                        []

                };

            }
        );

    }


    /* ======================================================
       NORMALIZE AR
    ====================================================== */

    normalizeReceivable(row) {

        const status =
            String(
                row?.status ?? ""
            )
                .trim()
                .toLowerCase();


        if (
            [
                "draft",
                "paid",
                "void"
            ].includes(status)
        ) {

            return null;

        }


        const total =
            this.toNumber(
                row?.total_amount
            );

        const paid =
            this.toNumber(
                row?.paid_amount
            );


        const outstanding =
            row?.outstanding_amount !== null
            &&
            row?.outstanding_amount !== undefined

                ? this.toNumber(
                    row.outstanding_amount
                )

                : Math.max(
                    total - paid,
                    0
                );


        if (outstanding <= 0) {

            return null;

        }


        const customer =
            row?.mst_business_partner
            ??
            row?.customer
            ??
            {};


        return {

            id:
                row?.id ?? null,

            partnerName:
                customer?.bp_name
                ??
                row?.customer_name
                ??
                row?.business_partner_name
                ??
                "-",

            invoiceNo:
                row?.invoice_no
                ??
                "-",

            invoiceDate:
                row?.invoice_date
                ??
                null,

            dueDate:
                row?.due_date
                ??
                null,

            description:
                row?.description
                ??
                "-",

            totalAmount:
                total,

            paidAmount:
                paid,

            outstandingAmount:
                outstanding,

            status:
                row?.status
                ??
                "-",

            source:
                "AR"

        };

    }


    /* ======================================================
       NORMALIZE AP
    ====================================================== */

    normalizePayable(row) {

        const status =
            String(
                row?.status ?? ""
            )
                .trim()
                .toLowerCase();


        if (
            [
                "paid",
                "void"
            ].includes(status)
        ) {

            return null;

        }


        const total =
            this.toNumber(
                row?.total_amount
            );

        const paid =
            this.toNumber(
                row?.paid_amount
            );


        const outstanding =
            row?.outstanding_amount !== null
            &&
            row?.outstanding_amount !== undefined

                ? this.toNumber(
                    row.outstanding_amount
                )

                : Math.max(
                    total - paid,
                    0
                );


        if (outstanding <= 0) {

            return null;

        }


        const vendor =
            row?.mst_business_partner
            ??
            row?.vendor
            ??
            {};


        return {

            id:
                row?.id ?? null,

            partnerName:
                vendor?.bp_name
                ??
                row?.vendor_name
                ??
                "-",

            invoiceNo:
                row?.invoice_no
                ??
                "-",

            invoiceDate:
                row?.invoice_date
                ??
                null,

            dueDate:
                row?.due_date
                ??
                null,

            description:
                row?.description
                ??
                "-",

            totalAmount:
                total,

            paidAmount:
                paid,

            outstandingAmount:
                outstanding,

            status:
                row?.status
                ??
                "-",

            source:
                "AP"

        };

    }


    /* ======================================================
       NORMALIZE MANUAL
    ====================================================== */

    normalizeManualForecast(row) {

        if (!row) {
            return null;
        }


        const amount =
            this.toNumber(
                row.amount
            );


        if (amount <= 0) {
            return null;
        }


        return {

            id:
                row.id,

            forecastType:
                row.forecast_type,

            forecastDate:
                row.forecast_date,

            category:
                row.category || "-",

            description:
                row.description || "-",

            businessPartnerId:
                row.business_partner_id || null,

            partnerName:
                row
                    ?.mst_business_partner
                    ?.bp_name
                ||
                "-",

            amount,

            notes:
                row.notes || "",

            status:
                row.status || "Active",

            source:
                "MANUAL"

        };

    }


    /* ======================================================
       LOAD AR
    ====================================================== */

    async loadOutstandingReceivables() {

        const result =
            await this.arService.getAll();


        const rows =
            Array.isArray(result)

                ? result

                : Array.isArray(
                    result?.data
                )

                    ? result.data

                    : [];


        return rows

            .map(
                row =>
                    this.normalizeReceivable(
                        row
                    )
            )

            .filter(Boolean);

    }


    /* ======================================================
       LOAD AP
    ====================================================== */

    async loadOutstandingPayables() {

        const result =
            await this.apService.getAll();


        const rows =
            Array.isArray(result)

                ? result

                : Array.isArray(
                    result?.data
                )

                    ? result.data

                    : [];


        return rows

            .map(
                row =>
                    this.normalizePayable(
                        row
                    )
            )

            .filter(Boolean);

    }


    /* ======================================================
       LOAD MANUAL
    ====================================================== */

    async loadManualForecasts() {

        const rows =
            await this.getManualForecasts();


        return rows

            .map(
                row =>
                    this.normalizeManualForecast(
                        row
                    )
            )

            .filter(Boolean);

    }


    /* ======================================================
       CASH / BANK ACCOUNT
    ====================================================== */

    isCashBankAccount(account) {

        const code =
            String(
                account?.account_code ?? ""
            ).trim();

        const name =
            String(
                account?.account_name ?? ""
            )
                .trim()
                .toLowerCase();

        const transaction =
            account?.allow_transaction !== false;

        const active =
            account?.status === undefined
            ||
            account?.status === null
            ||
            account?.status === true
            ||
            String(
                account?.status
            ).toLowerCase() === "active";


        const keyword =
            /(^|\s)(cash|kas|bank|petty cash|pettycash)(\s|$)/i
                .test(name);


        const excludes =
            /(cash flow|cashflow|cash advance|advance|deposit|deposits|receivable|payable|clearing)/i
                .test(name);


        return Boolean(
            code
            &&
            transaction
            &&
            active
            &&
            keyword
            &&
            !excludes
        );

    }


    /* ======================================================
       OPENING CASH
    ====================================================== */

    async loadOpeningCash(asOfDate) {

        const accounts =
            await FinancialReportService
                .loadAccounts(true);


        const candidates =
            accounts.filter(
                account =>
                    this.isCashBankAccount(
                        account
                    )
            );


        if (!candidates.length) {

            return {

                amount:
                    0,

                accounts:
                    [],

                warning:
                    "No transactional Cash/Bank COA was detected. Opening Cash is shown as 0 until Cash/Bank COA naming is configured."

            };

        }


        const journals =
            await FinancialReportService
                .loadPostedJournals(
                    null,
                    asOfDate
                );


        const details =
            await FinancialReportService
                .loadJournalDetails(
                    journals
                );


        const postings =
            FinancialReportService
                .normalizePostings(
                    details
                );


        const balances =
            FinancialReportService
                .calculateAccountBalances(
                    accounts,
                    postings
                );


        const ids =
            new Set(
                candidates.map(
                    account =>
                        String(account.id)
                )
            );


        const cashBalances =
            balances.filter(
                row =>
                    ids.has(
                        String(
                            row.account_id
                        )
                    )
            );


        return {

            amount:
                cashBalances.reduce(
                    (
                        sum,
                        row
                    ) =>
                        sum
                        +
                        this.toNumber(
                            row.balance
                        ),
                    0
                ),

            accounts:
                cashBalances,

            warning:
                null

        };

    }


    /* ======================================================
       PLACE AUTO ITEMS
    ====================================================== */

    placeItemsInWeeks(
        weeks,
        items,
        type
    ) {

        const firstStart =
            this.parseDate(
                weeks[0]?.dateFrom
            );

        const lastEnd =
            this.parseDate(
                weeks[
                    weeks.length - 1
                ]?.dateTo
            );


        const overdue =
            [];

        const outside =
            [];


        for (
            const item
            of items
        ) {

            const due =
                this.parseDate(
                    item.dueDate
                );


            if (!due) {

                outside.push(item);

                continue;

            }


            let target =
                null;


            if (
                firstStart
                &&
                due < firstStart
            ) {

                target =
                    weeks[0];

                overdue.push(
                    item
                );

            }

            else if (
                lastEnd
                &&
                due > lastEnd
            ) {

                outside.push(
                    item
                );

                continue;

            }

            else {

                target =
                    weeks.find(
                        week =>
                            due >=
                                this.parseDate(
                                    week.dateFrom
                                )
                            &&
                            due <=
                                this.parseDate(
                                    week.dateTo
                                )
                    );

            }


            if (!target) {

                outside.push(
                    item
                );

                continue;

            }


            if (
                type === "AR"
            ) {

                target.arItems.push(
                    item
                );

                target.autoCashIn +=
                    item.outstandingAmount;

            }

            else {

                target.apItems.push(
                    item
                );

                target.autoCashOut +=
                    item.outstandingAmount;

            }

        }


        return {

            overdue,
            outside

        };

    }


    /* ======================================================
       PLACE MANUAL ITEMS
    ====================================================== */

    placeManualItemsInWeeks(
        weeks,
        items
    ) {

        const outside =
            [];


        for (
            const item
            of items
        ) {

            const date =
                this.parseDate(
                    item.forecastDate
                );


            if (!date) {

                outside.push(
                    item
                );

                continue;

            }


            const target =
                weeks.find(
                    week => {

                        const from =
                            this.parseDate(
                                week.dateFrom
                            );

                        const to =
                            this.parseDate(
                                week.dateTo
                            );

                        return (
                            date >= from
                            &&
                            date <= to
                        );

                    }
                );


            if (!target) {

                outside.push(
                    item
                );

                continue;

            }


            if (
                item.forecastType ===
                "CASH_IN"
            ) {

                target
                    .manualCashInItems
                    .push(
                        item
                    );

                target.manualCashIn +=
                    item.amount;

            }


            else if (
                item.forecastType ===
                "CASH_OUT"
            ) {

                target
                    .manualCashOutItems
                    .push(
                        item
                    );

                target.manualCashOut +=
                    item.amount;

            }

        }


        return {

            outside

        };

    }


    /* ======================================================
       BUILD FORECAST DATASET
    ====================================================== */

    async buildForecastDataset(
        startDate,
        numberOfWeeks = 8
    ) {

        const weeks =
            this.buildWeeks(
                startDate,
                numberOfWeeks
            );


        const openingAsOf =
            this.formatISO(
                this.addDays(
                    this.parseDate(
                        weeks[0].dateFrom
                    ),
                    -1
                )
            );


        const [
            receivables,
            payables,
            manualForecasts,
            opening
        ] =
            await Promise.all([

                this.loadOutstandingReceivables(),

                this.loadOutstandingPayables(),

                this.loadManualForecasts(),

                this.loadOpeningCash(
                    openingAsOf
                )

            ]);


        const arPlacement =
            this.placeItemsInWeeks(
                weeks,
                receivables,
                "AR"
            );


        const apPlacement =
            this.placeItemsInWeeks(
                weeks,
                payables,
                "AP"
            );


        const manualPlacement =
            this.placeManualItemsInWeeks(
                weeks,
                manualForecasts
            );


        let runningCash =
            opening.amount;


        weeks.forEach(
            week => {

                week.cashIn =
                    week.autoCashIn
                    +
                    week.manualCashIn;


                week.cashOut =
                    week.autoCashOut
                    +
                    week.manualCashOut;


                week.openingCash =
                    runningCash;


                week.netCashFlow =
                    week.cashIn
                    -
                    week.cashOut;


                week.endingCash =
                    week.openingCash
                    +
                    week.netCashFlow;


                runningCash =
                    week.endingCash;

            }
        );


        const totalAutoCashIn =
            weeks.reduce(
                (
                    sum,
                    week
                ) =>
                    sum
                    +
                    week.autoCashIn,
                0
            );


        const totalManualCashIn =
            weeks.reduce(
                (
                    sum,
                    week
                ) =>
                    sum
                    +
                    week.manualCashIn,
                0
            );


        const totalAutoCashOut =
            weeks.reduce(
                (
                    sum,
                    week
                ) =>
                    sum
                    +
                    week.autoCashOut,
                0
            );


        const totalManualCashOut =
            weeks.reduce(
                (
                    sum,
                    week
                ) =>
                    sum
                    +
                    week.manualCashOut,
                0
            );


        const totalCashIn =
            totalAutoCashIn
            +
            totalManualCashIn;


        const totalCashOut =
            totalAutoCashOut
            +
            totalManualCashOut;


        return {

            generatedAt:
                new Date()
                    .toISOString(),

            startDate:
                weeks[0].dateFrom,

            endDate:
                weeks[
                    weeks.length - 1
                ].dateTo,

            numberOfWeeks:
                weeks.length,

            openingCash:
                opening.amount,

            endingCash:
                weeks[
                    weeks.length - 1
                ].endingCash,

            totalAutoCashIn,

            totalManualCashIn,

            totalCashIn,

            totalAutoCashOut,

            totalManualCashOut,

            totalCashOut,

            netCashFlow:
                totalCashIn
                -
                totalCashOut,

            weeks,

            receivables,

            payables,

            manualForecasts,

            cashAccounts:
                opening.accounts,

            warning:
                opening.warning,

            overdueAR:
                arPlacement.overdue,

            overdueAP:
                apPlacement.overdue,

            outsideAR:
                arPlacement.outside,

            outsideAP:
                apPlacement.outside,

            outsideManual:
                manualPlacement.outside

        };

    }

}