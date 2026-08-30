/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Module  : Dashboard
Version : 2.0.0 Executive Summary
==========================================================
*/

import {
    supabase,
    TABLE
} from "../../assets/js/core/supabase.js";


export class Dashboard {

constructor() {

    /*
    ======================================================
    CLOCK
    ======================================================
    */

    this.clockTimer = null;


    /*
    ======================================================
    SUPABASE REALTIME
    ======================================================
    */

    this.realtimeChannel = null;

    this.realtimeReloadTimer = null;

    this.isRealtimeReloading = false;

    this.realtimeReloadPending = false;


    /*
    ======================================================
    DASHBOARD DATA
    ======================================================
    */

    this.dashboardData = {

        totalAsset: 0,

        totalLiability: 0,

        equity: 0,

        revenue: 0,

        expense: 0,

        netProfit: 0,

        arOutstanding: 0,

        apOutstanding: 0,

        arOverdueCount: 0,

        apOverdueCount: 0,

        draftJournalCount: 0,

        activeBusinessPartnerCount: 0,

        monthly: [],

        activities: []

    };


    /*
    ======================================================
    INITIALIZE
    ======================================================
    */

    this.initialize();

}

    async initialize() {

    console.log(
        "Dashboard: Initialized"
    );


    /*
    ======================================================
    CACHE DOM
    ======================================================
    */

    this.cacheDom();


    /*
    ======================================================
    SYSTEM INFORMATION
    ======================================================
    */

    this.loadSystemInformation();


    /*
    ======================================================
    CLOCK
    ======================================================
    */

    this.startClock();


    /*
    ======================================================
    INITIAL RENDER
    ======================================================
    */

    this.renderDashboard();


    /*
    ======================================================
    LOAD INITIAL DASHBOARD DATA
    ======================================================
    */

    await this.loadDashboardData();


    /*
    ======================================================
    START SUPABASE REALTIME
    ======================================================
    */

    this.subscribeRealtime();

}
    /* ========================================================
       CACHE DOM
    ======================================================== */
    cacheDom() {

        this.el = {};

        const ids = [
            "dashboard-period-label",
            "dashboard-header-date",
            "dashboard-total-asset",
            "dashboard-total-liability",
            "dashboard-equity",
            "dashboard-net-profit",
            "dashboard-net-profit-status",
            "dashboard-net-margin",
            "dashboard-performance-chart",
            "dashboard-position-donut",
            "dashboard-donut-total",
            "dashboard-position-asset",
            "dashboard-position-liability",
            "dashboard-position-equity",
            "dashboard-bs-asset",
            "dashboard-bs-liability",
            "dashboard-bs-equity",
            "dashboard-bs-difference",
            "dashboard-pl-revenue",
            "dashboard-pl-expense",
            "dashboard-pl-profit",
            "dashboard-pl-margin",
            "dashboard-insight-list",
            "dashboard-ar-outstanding",
            "dashboard-ap-outstanding",
            "dashboard-ar-overdue",
            "dashboard-ap-overdue",
            "dashboard-draft-journal",
            "dashboard-active-bp",
            "dashboard-activity-tbody",
            "dashboard-current-time",
            "dashboard-period",
            "dashboard-branch",
            "dashboard-currency"
        ];

        ids.forEach(id => {
            this.el[id] = document.getElementById(id);
        });
    }

    /* ========================================================
       PUBLIC DATA ENTRY
       Later Supabase/service layer can call this method.
    ======================================================== */
    setDashboardData(data = {}) {

        this.dashboardData = {
            ...this.dashboardData,
            ...data,
            monthly: Array.isArray(data.monthly)
                ? data.monthly
                : this.dashboardData.monthly,
            activities: Array.isArray(data.activities)
                ? data.activities
                : this.dashboardData.activities
        };

        this.renderDashboard();
    }

    /*
==========================================================
LOAD DASHBOARD DATA
Source of truth = same Supabase tables used by modules.
==========================================================
*/

async loadDashboardData() {

    try {

        const today =
            this.getTodayISO();

        const year =
            Number(
                today.slice(
                    0,
                    4
                )
            );


        /*
        ======================================================
        LOAD SOURCE DATA
        ======================================================
        */

        const [

            accounts,

            journals,

            details,

            accountPayables,

            accountReceivables,

            businessPartners

        ] = await Promise.all([


            /*
            ==================================================
            CHART OF ACCOUNTS
            ==================================================
            */

            this.safeFetchAllRows(
                TABLE.CHART_OF_ACCOUNTS,
                "Chart Of Accounts"
            ),


            /*
            ==================================================
            GL JOURNAL
            ==================================================
            */

            this.safeFetchAllRows(
                TABLE.GL_JOURNAL,
                "GL Journal"
            ),


            /*
            ==================================================
            GL JOURNAL DETAIL
            ==================================================
            */

            this.safeFetchAllRows(
                TABLE.GL_JOURNAL_DETAIL,
                "GL Journal Detail"
            ),


            /*
            ==================================================
            ACCOUNT PAYABLE
            ==================================================
            */

            this.safeFetchAllRows(
                TABLE.ACCOUNT_PAYABLE,
                "Account Payable"
            ),


            /*
            ==================================================
            ACCOUNT RECEIVABLE
            ==================================================
            */

            this.safeFetchAllRows(
                TABLE.ACCOUNT_RECEIVABLE,
                "Account Receivable"
            ),


            /*
            ==================================================
            BUSINESS PARTNER
            ==================================================
            */

            this.safeFetchAllRows(
                TABLE.BUSINESS_PARTNER,
                "Business Partner"
            )

        ]);


        /*
        ======================================================
        FINANCIAL SUMMARY
        ======================================================
        */

        const financial =
            this.buildFinancialSummary({

                accounts,

                journals,

                details,

                year,

                today

            });


        /*
        ======================================================
        ACCOUNT PAYABLE SUMMARY
        ======================================================
        */

        const apSummary =
            this.buildOutstandingSummary(
                accountPayables,
                today
            );


        /*
        ======================================================
        ACCOUNT RECEIVABLE SUMMARY
        ======================================================
        */

        const arSummary =
            this.buildOutstandingSummary(
                accountReceivables,
                today
            );


        /*
        ======================================================
        DRAFT JOURNAL
        ======================================================
        */

        const draftJournalCount =
            journals.filter(
                row =>
                    this.normalizeStatus(
                        row?.status
                    )
                    === "draft"
            ).length;


        /*
        ======================================================
        ACTIVE BUSINESS PARTNER
        ======================================================
        */

        const activeBusinessPartnerCount =
            businessPartners.filter(
                row =>
                    row?.is_active === true
                    ||
                    String(
                        row?.status || ""
                    )
                    .trim()
                    .toLowerCase()
                    === "active"
            ).length;


        /*
        ======================================================
        RECENT ACTIVITY

        SOURCE:
        - ACCOUNT PAYABLE
        - ACCOUNT RECEIVABLE
        - GL JOURNAL
        ======================================================
        */

        const activities =
            this.buildRecentActivities(

                accountPayables,

                accountReceivables,

                journals,

                details

            );


        /*
        ======================================================
        UPDATE DASHBOARD
        ======================================================
        */

        this.setDashboardData({

            totalAsset:
                financial.totalAsset,

            totalLiability:
                financial.totalLiability,

            equity:
                financial.equity,

            revenue:
                financial.revenue,

            expense:
                financial.expense,

            netProfit:
                financial.netProfit,

            arOutstanding:
                arSummary.outstanding,

            apOutstanding:
                apSummary.outstanding,

            arOverdueCount:
                arSummary.overdueCount,

            apOverdueCount:
                apSummary.overdueCount,

            draftJournalCount,

            activeBusinessPartnerCount,

            monthly:
                financial.monthly,

            activities

        });


        /*
        ======================================================
        LOG
        ======================================================
        */

        console.log(
            "Dashboard: live data loaded",
            this.dashboardData
        );

    }

    catch (
        error
    ) {

        console.error(
            "Dashboard.loadDashboardData:",
            error
        );

    }

}
    /*
==========================================================
SUPABASE REALTIME
==========================================================
*/

subscribeRealtime() {

    /*
    ======================================================
    REMOVE PREVIOUS CHANNEL
    ======================================================
    */

    if (
        this.realtimeChannel
    ) {

        supabase.removeChannel(
            this.realtimeChannel
        );

        this.realtimeChannel = null;

    }


    /*
    ======================================================
    CREATE CHANNEL
    ======================================================
    */

    this.realtimeChannel =
        supabase.channel(
            "finova-dashboard-realtime"
        );


    /*
    ======================================================
    GL JOURNAL HEADER
    INSERT / UPDATE / DELETE
    ======================================================
    */

    this.realtimeChannel.on(

        "postgres_changes",

        {

            event: "*",

            schema: "public",

            table:
                TABLE.GL_JOURNAL

        },

        payload => {

            console.log(
                "Dashboard Realtime GL Journal:",
                payload
            );


            this.scheduleRealtimeReload();

        }

    );


    /*
    ======================================================
    GL JOURNAL DETAIL
    INSERT / UPDATE / DELETE
    ======================================================
    */

    this.realtimeChannel.on(

        "postgres_changes",

        {

            event: "*",

            schema: "public",

            table:
                TABLE.GL_JOURNAL_DETAIL

        },

        payload => {

            console.log(
                "Dashboard Realtime GL Detail:",
                payload
            );


            this.scheduleRealtimeReload();

        }

    );


    /*
    ======================================================
    ACCOUNT PAYABLE
    OUTSTANDING / OVERDUE
    ======================================================
    */

    this.realtimeChannel.on(

        "postgres_changes",

        {

            event: "*",

            schema: "public",

            table:
                TABLE.ACCOUNT_PAYABLE

        },

        payload => {

            console.log(
                "Dashboard Realtime AP:",
                payload
            );


            this.scheduleRealtimeReload();

        }

    );


    /*
    ======================================================
    ACCOUNT RECEIVABLE
    OUTSTANDING / OVERDUE
    ======================================================
    */

    this.realtimeChannel.on(

        "postgres_changes",

        {

            event: "*",

            schema: "public",

            table:
                TABLE.ACCOUNT_RECEIVABLE

        },

        payload => {

            console.log(
                "Dashboard Realtime AR:",
                payload
            );


            this.scheduleRealtimeReload();

        }

    );


    /*
    ======================================================
    BUSINESS PARTNER
    ACTIVE BP COUNT
    ======================================================
    */

    this.realtimeChannel.on(

        "postgres_changes",

        {

            event: "*",

            schema: "public",

            table:
                TABLE.BUSINESS_PARTNER

        },

        payload => {

            console.log(
                "Dashboard Realtime Business Partner:",
                payload
            );


            this.scheduleRealtimeReload();

        }

    );


    /*
    ======================================================
    SUBSCRIBE
    ======================================================
    */

    this.realtimeChannel.subscribe(
        status => {

            console.log(
                "Dashboard Realtime Status:",
                status
            );

        }
    );

}
/*
==========================================================
SCHEDULE REALTIME RELOAD
==========================================================
*/

scheduleRealtimeReload() {

    /*
    ======================================================
    CLEAR PREVIOUS TIMER
    ======================================================
    */

    if (
        this.realtimeReloadTimer
    ) {

        clearTimeout(
            this.realtimeReloadTimer
        );

    }


    /*
    ======================================================
    DEBOUNCE DATABASE EVENTS
    ======================================================
    */

    this.realtimeReloadTimer =
        setTimeout(
            () => {

                this.realtimeReloadTimer =
                    null;


                this.reloadDashboardRealtime();

            },
            350
        );

}
/*
==========================================================
RELOAD DASHBOARD REALTIME
==========================================================
*/

async reloadDashboardRealtime() {

    /*
    ======================================================
    PREVENT PARALLEL RELOAD
    ======================================================
    */

    if (
        this.isRealtimeReloading
    ) {

        this.realtimeReloadPending =
            true;

        return;

    }


    /*
    ======================================================
    START
    ======================================================
    */

    this.isRealtimeReloading =
        true;


    try {

        console.log(
            "Dashboard: Realtime refresh"
        );


        /*
        ==================================================
        LOAD LATEST DATA
        ==================================================
        */

        await this.loadDashboardData();

    }

    catch (
        error
    ) {

        console.error(
            "Dashboard.reloadDashboardRealtime:",
            error
        );

    }

    finally {

        /*
        ==================================================
        FINISH
        ==================================================
        */

        this.isRealtimeReloading =
            false;


        /*
        ==================================================
        EVENT RECEIVED WHILE RELOADING
        ==================================================
        */

        if (
            this.realtimeReloadPending
        ) {

            this.realtimeReloadPending =
                false;


            this.scheduleRealtimeReload();

        }

    }

}

    /* ========================================================
       SAFE PAGED SUPABASE READER
       Prevent Supabase default row limit from truncating data.
    ======================================================== */
    async safeFetchAllRows(table, label = table) {

        try {
            return await this.fetchAllRows(table);
        }
        catch (error) {
            console.error(
                `Dashboard ${label} load failed:`,
                error
            );
            return [];
        }
    }

    async fetchAllRows(table) {

        const result = [];
        const pageSize = 1000;
        let from = 0;

        while (true) {

            const { data, error } = await supabase
                .from(table)
                .select("*")
                .range(
                    from,
                    from + pageSize - 1
                );

            if (error) {
                throw error;
            }

            const rows = Array.isArray(data)
                ? data
                : [];

            result.push(...rows);

            if (rows.length < pageSize) {
                break;
            }

            from += pageSize;
        }

        return result;
    }

    /* ========================================================
       FINANCIAL SUMMARY
       Balance Sheet : Posted GL up to today.
       Profit & Loss : Posted GL in current year.
    ======================================================== */
    buildFinancialSummary({
        accounts = [],
        journals = [],
        details = [],
        year,
        today
    }) {

        /*
        ======================================================
        ACCOUNT LOOKUP
        ======================================================
        */

        const accountMap =
            new Map();


        accounts.forEach(
            account => {

                if (
                    account?.id === null
                    ||
                    account?.id === undefined
                ) {
                    return;
                }


                accountMap.set(
                    String(
                        account.id
                    ),
                    account
                );

            }
        );


        /*
        ======================================================
        POSTED JOURNAL ONLY

        Same accounting source used by Balance Sheet:
        Draft / Void are excluded.
        ======================================================
        */

        const postedJournals =
            journals.filter(
                journal => {

                    if (
                        this.normalizeStatus(
                            journal?.status
                        )
                        !==
                        "posted"
                    ) {
                        return false;
                    }


                    const journalDate =
                        this.getJournalDate(
                            journal
                        );


                    return (
                        journalDate
                        &&
                        journalDate <= today
                    );

                }
            );


        const postedJournalMap =
            new Map(

                postedJournals.map(
                    journal => [
                        String(
                            journal.id
                        ),
                        journal
                    ]
                )

            );


        /*
        ======================================================
        NORMALIZED GL POSTINGS
        ======================================================
        */

        const postings =
            this.normalizePostings(
                details
            );


        /*
        ======================================================
        FINANCIAL TOTALS
        ======================================================
        */

        let totalAsset = 0;

        let totalLiability = 0;

        let equity = 0;

        let revenue = 0;

        let expense = 0;


        const monthly =
            Array.from(

                {
                    length: 12
                },

                (
                    _,
                    index
                ) => ({

                    month:
                        index + 1,

                    revenue:
                        0,

                    expense:
                        0,

                    profit:
                        0

                })

            );


        /*
        ======================================================
        CALCULATE USING COA HIERARCHY

        IMPORTANT:
        - No account-code prefix is used.
        - No account_category/account_type is required.
        - Each transaction account is traced through parent_id
          until the top-level COA root is found.
        - The top-level root determines the financial group.
        ======================================================
        */

        postings.forEach(
            posting => {

                const journal =
                    postedJournalMap.get(
                        String(
                            posting.journal_id
                        )
                    );


                if (
                    !journal
                ) {
                    return;
                }


                const account =
                    accountMap.get(
                        String(
                            posting.account_id
                        )
                    );


                if (
                    !account
                ) {
                    return;
                }


                const group =
                    this.resolveAccountGroup(
                        account,
                        accountMap
                    );


                if (
                    !group
                ) {
                    return;
                }


                const amount =
                    this.getPresentationAmount(
                        posting,
                        account,
                        group
                    );


                const journalDate =
                    this.getJournalDate(
                        journal
                    );


                /*
                ==================================================
                BALANCE SHEET POSITION

                Point-in-time balance up to today.
                ==================================================
                */

                if (
                    group === "asset"
                ) {

                    totalAsset +=
                        amount;

                }

                else if (
                    group === "liability"
                ) {

                    totalLiability +=
                        amount;

                }

                else if (
                    group === "equity"
                ) {

                    equity +=
                        amount;

                }


                /*
                ==================================================
                PROFIT & LOSS

                Current-year Posted GL activity only.
                ==================================================
                */

                if (
                    journalDate
                    &&
                    Number(
                        journalDate.slice(
                            0,
                            4
                        )
                    )
                    ===
                    year
                ) {

                    const month =
                        Number(
                            journalDate.slice(
                                5,
                                7
                            )
                        );


                    if (
                        group === "revenue"
                    ) {

                        revenue +=
                            amount;


                        if (
                            month >= 1
                            &&
                            month <= 12
                        ) {

                            monthly[
                                month - 1
                            ].revenue +=
                                amount;

                        }

                    }

                    else if (
                        group === "expense"
                    ) {

                        expense +=
                            amount;


                        if (
                            month >= 1
                            &&
                            month <= 12
                        ) {

                            monthly[
                                month - 1
                            ].expense +=
                                amount;

                        }

                    }

                }

            }
        );


        /*
        ======================================================
        MONTHLY PROFIT
        ======================================================
        */

        monthly.forEach(
            row => {

                row.profit =
                    this.cleanFinancialNumber(

                        this.toNumber(
                            row.revenue
                        )
                        -
                        this.toNumber(
                            row.expense
                        )

                    );

            }
        );


        /*
        ======================================================
        RESULT
        ======================================================
        */

        return {

            totalAsset:
                this.cleanFinancialNumber(
                    totalAsset
                ),

            totalLiability:
                this.cleanFinancialNumber(
                    totalLiability
                ),

            equity:
                this.cleanFinancialNumber(
                    equity
                ),

            revenue:
                this.cleanFinancialNumber(
                    revenue
                ),

            expense:
                this.cleanFinancialNumber(
                    expense
                ),

            netProfit:
                this.cleanFinancialNumber(
                    revenue - expense
                ),

            monthly

        };

    }

    /* ========================================================
       NORMALIZE GL DETAIL
       Supports current account_id/debit/credit structure and
       legacy debit_account_id/credit_account_id/amount structure.
    ======================================================== */
    normalizePostings(details = []) {

        const postings = [];

        details.forEach(detail => {

            const journalId =
                detail?.journal_id;

            if (
                journalId === null
                || journalId === undefined
            ) {
                return;
            }

            if (
                detail?.account_id !== null
                && detail?.account_id !== undefined
            ) {

                postings.push({
                    journal_id:
                        journalId,
                    account_id:
                        detail.account_id,
                    debit:
                        this.toNumber(detail.debit),
                    credit:
                        this.toNumber(detail.credit)
                });

                return;
            }

            const amount = this.toNumber(
                detail?.amount
            );

            if (
                detail?.debit_account_id !== null
                && detail?.debit_account_id !== undefined
            ) {
                postings.push({
                    journal_id:
                        journalId,
                    account_id:
                        detail.debit_account_id,
                    debit:
                        amount,
                    credit:
                        0
                });
            }

            if (
                detail?.credit_account_id !== null
                && detail?.credit_account_id !== undefined
            ) {
                postings.push({
                    journal_id:
                        journalId,
                    account_id:
                        detail.credit_account_id,
                    debit:
                        0,
                    credit:
                        amount
                });
            }
        });

        return postings;
    }

    /* ========================================================
       ACCOUNT CLASSIFICATION

       Source of truth = COA hierarchy.
       The transaction account is traced to its top-level root.
       No account-code prefix is used.
    ======================================================== */
    resolveAccountGroup(
        account,
        accountMap
    ) {

        if (
            !account
        ) {
            return null;
        }


        let current =
            account;


        const visited =
            new Set();


        while (
            current
        ) {

            const currentId =
                String(
                    current?.id
                    ??
                    ""
                );


            if (
                currentId
                &&
                visited.has(
                    currentId
                )
            ) {
                break;
            }


            if (
                currentId
            ) {
                visited.add(
                    currentId
                );
            }


            /*
            ==================================================
            1. EXPLICIT FINANCIAL GROUP ON THIS LEVEL
            ==================================================
            */

            const explicitCandidates = [
                current?.report_group,
                current?.financial_group,
                current?.account_group,
                current?.account_category,
                current?.category,
                current?.account_type
            ];


            for (
                const candidate
                of
                explicitCandidates
            ) {

                const explicitGroup =
                    this.matchAccountGroup(
                        candidate
                    );


                if (
                    explicitGroup
                ) {
                    return explicitGroup;
                }

            }


            /*
            ==================================================
            2. ACCOUNT NAME ON THIS HIERARCHY LEVEL

            IMPORTANT:
            We do NOT jump directly to the absolute root.
            Some COA structures have a common super-root above
            ASSET / LIABILITY / EQUITY / REVENUE / EXPENSE.
            Therefore every ancestor is checked.
            ==================================================
            */

            const nameGroup =
                this.matchAccountGroup(
                    current?.account_name
                    ??
                    current?.name
                    ??
                    ""
                );


            if (
                nameGroup
            ) {
                return nameGroup;
            }


            const parentId =
                this.getAccountParentId(
                    current
                );


            if (
                parentId === null
                ||
                parentId === undefined
                ||
                parentId === ""
            ) {
                break;
            }


            const parent =
                accountMap.get(
                    String(
                        parentId
                    )
                );


            if (
                !parent
            ) {
                break;
            }


            current =
                parent;

        }


        return null;

    }

    /* ========================================================
       GET ROOT ACCOUNT

       Same hierarchy principle used by Balance Sheet:
       child -> parent -> parent -> root.
    ======================================================== */
    getRootAccount(
        account,
        accountMap
    ) {

        if (
            !account
        ) {
            return null;
        }


        let current =
            account;


        const visited =
            new Set();


        while (
            current
        ) {

            const currentId =
                String(
                    current?.id
                    ??
                    ""
                );


            if (
                currentId
                &&
                visited.has(
                    currentId
                )
            ) {
                break;
            }


            if (
                currentId
            ) {

                visited.add(
                    currentId
                );

            }


            const parentId =
                this.getAccountParentId(
                    current
                );


            if (
                parentId === null
                ||
                parentId === undefined
                ||
                parentId === ""
            ) {
                break;
            }


            const parent =
                accountMap.get(
                    String(
                        parentId
                    )
                );


            if (
                !parent
            ) {
                break;
            }


            current =
                parent;

        }


        return current;

    }


    /* ========================================================
       GET ACCOUNT PARENT ID

       Mirrors Balance Sheet compatibility for possible
       parent-column names.
    ======================================================== */
    getAccountParentId(
        account
    ) {

        return (

            account?.parent_id

            ??

            account?.parent_account_id

            ??

            account?.parent_coa_id

            ??

            account?.parent_account

            ??

            null

        );

    }


    /* ========================================================
       MATCH ROOT ACCOUNT GROUP

       IMPORTANT:
       Strict root-name matching only.
       This does NOT inspect account-code prefixes and does NOT
       classify child account names by partial keyword.
    ======================================================== */
    matchAccountGroup(
        value
    ) {

        const text =
            String(
                value
                ||
                ""
            )
            .trim()
            .toLowerCase()
            .replace(
                /[_\-]+/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            );


        if (
            !text
        ) {
            return null;
        }


        const containsAny =
            words =>
                words.some(
                    word =>
                        text.includes(
                            word
                        )
                );


        if (
            containsAny([
                "asset",
                "assets",
                "aset",
                "aktiva"
            ])
        ) {
            return "asset";
        }


        if (
            containsAny([
                "liability",
                "liabilities",
                "kewajiban",
                "liabilitas",
                "hutang",
                "utang"
            ])
        ) {
            return "liability";
        }


        if (
            containsAny([
                "equity",
                "ekuitas",
                "modal"
            ])
        ) {
            return "equity";
        }


        if (
            containsAny([
                "revenue",
                "income",
                "pendapatan",
                "sales",
                "penjualan"
            ])
        ) {
            return "revenue";
        }


        if (
            containsAny([
                "expense",
                "expenses",
                "cost",
                "cogs",
                "beban",
                "biaya",
                "hpp"
            ])
        ) {
            return "expense";
        }


        return null;

    }

    /* ========================================================
       PRESENTATION AMOUNT

       Balance Sheet engine stores direct GL movement as
       Debit - Credit. Dashboard presents credit-normal groups
       as positive balances.
    ======================================================== */
    getPresentationAmount(
        posting,
        account,
        group
    ) {

        const debit =
            this.toNumber(
                posting?.debit
            );


        const credit =
            this.toNumber(
                posting?.credit
            );


        const normalBalance =
            String(
                account?.normal_balance
                ||
                ""
            )
            .trim()
            .toLowerCase();


        if (
            normalBalance === "credit"
        ) {

            return credit - debit;

        }


        if (
            normalBalance === "debit"
        ) {

            return debit - credit;

        }


        if (
            group === "liability"
            ||
            group === "equity"
            ||
            group === "revenue"
        ) {

            return credit - debit;

        }


        return debit - credit;

    }


    /* ========================================================
       AP / AR OUTSTANDING SUMMARY
    ======================================================== */
    buildOutstandingSummary(rows = [], today) {

        let outstanding = 0;
        let overdueCount = 0;

        rows.forEach(row => {

            const status = this.normalizeStatus(
                row?.status
            );

            if ([
                "draft",
                "void",
                "paid",
                "cancelled",
                "canceled"
            ].includes(status)) {
                return;
            }

            const amount = Math.max(
                0,
                this.toNumber(
                    row?.outstanding_amount
                    ?? row?.total_amount
                )
            );

            if (amount <= 0) {
                return;
            }

            outstanding += amount;

            const dueDate = String(
                row?.due_date
                || ""
            ).slice(0, 10);

            if (
                dueDate
                && dueDate < today
            ) {
                overdueCount += 1;
            }
        });

        return {
            outstanding:
                this.cleanFinancialNumber(outstanding),
            overdueCount
        };
    }

    /*
==========================================================
RECENT FINANCIAL ACTIVITY

SOURCE:
- ACCOUNT PAYABLE
- ACCOUNT RECEIVABLE
- GL JOURNAL
==========================================================
*/

buildRecentActivities(

    accountPayables = [],

    accountReceivables = [],

    journals = [],

    details = []

) {

    /*
    ======================================================
    RESULT
    ======================================================
    */

    const activities = [];


    /*
    ======================================================
    GL JOURNAL TOTAL
    ======================================================
    */

    const totalByJournal =
        new Map();


    this.normalizePostings(
        details
    )
    .forEach(
        posting => {

            const key =
                String(
                    posting.journal_id
                );


            const current =
                totalByJournal.get(
                    key
                )
                || 0;


            /*
            ==================================================
            TOTAL JOURNAL USE DEBIT SIDE
            ==================================================
            */

            totalByJournal.set(

                key,

                current
                +
                this.toNumber(
                    posting.debit
                )

            );

        }
    );


    /*
    ======================================================
    ACCOUNT PAYABLE
    ======================================================
    */

    accountPayables.forEach(
        ap => {

            /*
            ==================================================
            DISPLAY DATE
            ==================================================
            */

            const displayDate =
                String(

                    ap?.invoice_date

                    ||

                    ap?.date_received

                    ||

                    ap?.created_at

                    ||

                    ""

                )
                .slice(
                    0,
                    10
                );


            /*
            ==================================================
            ACTIVITY TIMESTAMP

            CREATED_AT HAS PRIORITY BECAUSE THIS IS
            RECENT ACTIVITY, NOT REPORTING PERIOD SORT.
            ==================================================
            */

            const activityTimestamp =
                ap?.created_at

                ||

                ap?.updated_at

                ||

                ap?.invoice_date

                ||

                ap?.date_received

                ||

                "";


            /*
            ==================================================
            DOCUMENT NUMBER
            ==================================================
            */

            const document =
                ap?.invoice_no

                ||

                ap?.ap_no

                ||

                ap?.document_no

                ||

                ap?.po_no

                ||

                "-";


            /*
            ==================================================
            DESCRIPTION
            ==================================================
            */

            const description =
                ap?.description

                ||

                `Account Payable ${document}`;


            /*
            ==================================================
            AMOUNT
            ==================================================
            */

            const amount =
                this.toNumber(

                    ap?.total_amount

                    ??

                    ap?.grand_total

                    ??

                    ap?.invoice_amount

                    ??

                    ap?.amount

                    ??

                    0

                );


            /*
            ==================================================
            PUSH AP ACTIVITY
            ==================================================
            */

            activities.push({

                date:
                    displayDate,

                activityTimestamp,

                module:
                    "AP",

                document,

                description,

                amount,

                status:
                    ap?.status
                    || "-"

            });

        }
    );


    /*
    ======================================================
    ACCOUNT RECEIVABLE
    ======================================================
    */

    accountReceivables.forEach(
        ar => {

            /*
            ==================================================
            DISPLAY DATE
            ==================================================
            */

            const displayDate =
                String(

                    ar?.invoice_date

                    ||

                    ar?.date_received

                    ||

                    ar?.created_at

                    ||

                    ""

                )
                .slice(
                    0,
                    10
                );


            /*
            ==================================================
            ACTIVITY TIMESTAMP
            ==================================================
            */

            const activityTimestamp =
                ar?.created_at

                ||

                ar?.updated_at

                ||

                ar?.invoice_date

                ||

                "";


            /*
            ==================================================
            DOCUMENT NUMBER
            ==================================================
            */

            const document =
                ar?.invoice_no

                ||

                ar?.ar_no

                ||

                ar?.document_no

                ||

                "-";


            /*
            ==================================================
            DESCRIPTION
            ==================================================
            */

            const description =
                ar?.description

                ||

                `Account Receivable ${document}`;


            /*
            ==================================================
            AMOUNT
            ==================================================
            */

            const amount =
                this.toNumber(

                    ar?.total_amount

                    ??

                    ar?.grand_total

                    ??

                    ar?.invoice_amount

                    ??

                    ar?.amount

                    ??

                    0

                );


            /*
            ==================================================
            PUSH AR ACTIVITY
            ==================================================
            */

            activities.push({

                date:
                    displayDate,

                activityTimestamp,

                module:
                    "AR",

                document,

                description,

                amount,

                status:
                    ar?.status
                    || "-"

            });

        }
    );


    /*
    ======================================================
    GL JOURNAL
    ======================================================
    */

    journals.forEach(
        journal => {

            /*
            ==================================================
            JOURNAL DATE
            ==================================================
            */

            const displayDate =
                this.getJournalDate(
                    journal
                );


            /*
            ==================================================
            ACTIVITY TIMESTAMP
            ==================================================
            */

            const activityTimestamp =
                journal?.created_at

                ||

                journal?.updated_at

                ||

                journal?.journal_date

                ||

                journal?.accounting_date

                ||

                "";


            /*
            ==================================================
            JOURNAL NUMBER
            ==================================================
            */

            const document =
                journal?.journal_no
                || "-";


            /*
            ==================================================
            DESCRIPTION
            ==================================================
            */

            const description =
                journal?.description
                || "-";


            /*
            ==================================================
            AMOUNT
            ==================================================
            */

            const amount =
                totalByJournal.get(
                    String(
                        journal?.id
                    )
                )
                || 0;


            /*
            ==================================================
            PUSH GL JOURNAL ACTIVITY
            ==================================================
            */

            activities.push({

                date:
                    displayDate,

                activityTimestamp,

                module:
                    "GLJ",

                document,

                description,

                amount,

                status:
                    journal?.status
                    || "-"

            });

        }
    );


    /*
    ======================================================
    SORT

    NEWEST ACTIVITY FIRST
    ======================================================
    */

    activities.sort(
        (
            a,
            b
        ) => {

            const timeA =
                new Date(
                    a?.activityTimestamp
                    || 0
                )
                .getTime();


            const timeB =
                new Date(
                    b?.activityTimestamp
                    || 0
                )
                .getTime();


            /*
            ==================================================
            NEWEST FIRST
            ==================================================
            */

            if (
                timeA !== timeB
            ) {

                return (
                    timeB
                    -
                    timeA
                );

            }


            /*
            ==================================================
            FALLBACK DOCUMENT NUMBER
            ==================================================
            */

            return String(
                b?.document
                || ""
            )
            .localeCompare(
                String(
                    a?.document
                    || ""
                )
            );

        }
    );


    /*
    ======================================================
    RETURN LAST 8 ACTIVITIES
    ======================================================
    */

    return activities.slice(
        0,
        8
    );

}

    detectJournalSource(journal) {

        const explicit =
            journal?.source
            || journal?.source_module
            || journal?.module
            || journal?.reference_type
            || "";

        if (explicit) {
            return String(explicit).toUpperCase();
        }

        const journalNo = String(
            journal?.journal_no || ""
        ).toUpperCase();

        if (journalNo.includes("AP")) {
            return "AP";
        }

        if (journalNo.includes("AR")) {
            return "AR";
        }

        return "GLJ";
    }

    getJournalDate(journal) {
        return String(
            journal?.journal_date
            ?? journal?.accounting_date
            ?? ""
        ).slice(0, 10);
    }

    getTodayISO() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    normalizeStatus(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    cleanFinancialNumber(value) {
        const number = this.toNumber(value);
        return Math.abs(number) < 0.000001
            ? 0
            : number;
    }

    /* ========================================================
       MAIN RENDER
    ======================================================== */
    renderDashboard() {

        const data = this.dashboardData;

        const netProfit = this.toNumber(
            data.netProfit !== undefined
                ? data.netProfit
                : this.toNumber(data.revenue) - this.toNumber(data.expense)
        );

        const revenue = this.toNumber(data.revenue);
        const margin = revenue !== 0
            ? (netProfit / revenue) * 100
            : 0;

        this.setText("dashboard-total-asset", this.formatCurrency(data.totalAsset));
        this.setText("dashboard-total-liability", this.formatCurrency(data.totalLiability));
        this.setText("dashboard-equity", this.formatCurrency(data.equity));
        this.setText("dashboard-net-profit", this.formatCurrency(netProfit));
        this.setText("dashboard-net-margin", this.formatPercent(margin));

        this.setText("dashboard-position-asset", this.formatCurrency(data.totalAsset));
        this.setText("dashboard-position-liability", this.formatCurrency(data.totalLiability));
        this.setText("dashboard-position-equity", this.formatCurrency(data.equity));
        this.setText("dashboard-donut-total", this.formatCurrency(data.totalAsset));

        this.setText("dashboard-bs-asset", this.formatCurrency(data.totalAsset));
        this.setText("dashboard-bs-liability", this.formatCurrency(data.totalLiability));
        this.setText("dashboard-bs-equity", this.formatCurrency(data.equity));

        const difference =
            this.toNumber(data.totalAsset)
            - this.toNumber(data.totalLiability)
            - this.toNumber(data.equity);

        this.setText("dashboard-bs-difference", this.formatCurrency(difference));

        this.setText("dashboard-pl-revenue", this.formatCurrency(data.revenue));
        this.setText("dashboard-pl-expense", this.formatCurrency(data.expense));
        this.setText("dashboard-pl-profit", this.formatCurrency(netProfit));
        this.setText("dashboard-pl-margin", this.formatPercent(margin));

        this.setText("dashboard-ar-outstanding", this.formatCurrency(data.arOutstanding));
        this.setText("dashboard-ap-outstanding", this.formatCurrency(data.apOutstanding));
        this.setText("dashboard-ar-overdue", `${this.toInteger(data.arOverdueCount)} overdue`);
        this.setText("dashboard-ap-overdue", `${this.toInteger(data.apOverdueCount)} overdue`);
        this.setText("dashboard-draft-journal", this.formatInteger(data.draftJournalCount));
        this.setText("dashboard-active-bp", this.formatInteger(data.activeBusinessPartnerCount));

        this.renderProfitStatus(netProfit);
        this.renderPerformanceChart(data.monthly);
        this.renderFinancialPosition(data);
        this.renderInsights(data, netProfit);
        this.renderActivities(data.activities);
    }

    /* ========================================================
       NET PROFIT STATUS
    ======================================================== */
    renderProfitStatus(netProfit) {

        const el = this.el["dashboard-net-profit-status"];
        if (!el) return;

        el.classList.remove("is-negative", "is-neutral");

        if (netProfit > 0) {
            el.innerHTML = '<i class="fa-solid fa-arrow-trend-up"></i> Positive performance';
            return;
        }

        if (netProfit < 0) {
            el.classList.add("is-negative");
            el.innerHTML = '<i class="fa-solid fa-arrow-trend-down"></i> Negative performance';
            return;
        }

        el.classList.add("is-neutral");
        el.innerHTML = '<i class="fa-solid fa-minus"></i> No movement';
    }

    /* ========================================================
       PERFORMANCE CHART
       No external chart library required.
    ======================================================== */
    renderPerformanceChart(monthly = []) {

        const container = this.el["dashboard-performance-chart"];
        if (!container) return;

        const normalized = this.normalizeMonthlyData(monthly);

        const hasValue = normalized.some(item =>
            item.revenue !== 0 || item.expense !== 0 || item.profit !== 0
        );

        if (!hasValue) {
            container.innerHTML = `
                <div class="dashboard-chart-empty">
                    No financial trend data available.
                </div>
            `;
            return;
        }

        const width = 900;
        const height = 220;
        const left = 22;
        const right = 12;
        const top = 12;
        const bottom = 28;
        const chartWidth = width - left - right;
        const chartHeight = height - top - bottom;

        const allValues = normalized.flatMap(item => [
            item.revenue,
            item.expense,
            item.profit
        ]);

        const max = Math.max(...allValues, 1);
        const min = Math.min(...allValues, 0);
        const range = Math.max(max - min, 1);

        const x = index =>
            left + (index * chartWidth / Math.max(normalized.length - 1, 1));

        const y = value =>
            top + ((max - value) / range) * chartHeight;

        const points = key =>
            normalized
                .map((item, index) => `${x(index)},${y(item[key])}`)
                .join(" ");

        let grid = "";
        for (let i = 0; i <= 4; i++) {
            const gy = top + (chartHeight * i / 4);
            grid += `<line class="dashboard-chart-grid" x1="${left}" y1="${gy}" x2="${width-right}" y2="${gy}"></line>`;
        }

        const labels = normalized.map((item, index) => `
            <text class="dashboard-chart-label"
                  x="${x(index)}"
                  y="${height - 7}"
                  text-anchor="middle">${this.escapeHTML(item.label)}</text>
        `).join("");

        const pointHtml = key => normalized.map((item, index) => `
            <circle class="dashboard-chart-point-${key}"
                    cx="${x(index)}"
                    cy="${y(item[key])}"
                    r="2.4"></circle>
        `).join("");

        container.innerHTML = `
            <svg class="dashboard-chart-svg"
                 viewBox="0 0 ${width} ${height}"
                 preserveAspectRatio="none"
                 role="img"
                 aria-label="Financial performance trend">
                ${grid}
                <polyline class="dashboard-chart-line-revenue" points="${points("revenue")}"></polyline>
                <polyline class="dashboard-chart-line-expense" points="${points("expense")}"></polyline>
                <polyline class="dashboard-chart-line-profit" points="${points("profit")}"></polyline>
                ${pointHtml("revenue")}
                ${pointHtml("expense")}
                ${pointHtml("profit")}
                ${labels}
            </svg>
        `;
    }

    normalizeMonthlyData(monthly) {

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const source = Array.isArray(monthly) ? monthly : [];

        return monthNames.map((label, index) => {
            const item = source[index] || {};
            const revenue = this.toNumber(item.revenue);
            const expense = this.toNumber(item.expense);

            return {
                label: item.label || label,
                revenue,
                expense,
                profit: item.profit !== undefined
                    ? this.toNumber(item.profit)
                    : revenue - expense
            };
        });
    }

    /* ========================================================
       FINANCIAL POSITION DONUT
    ======================================================== */
    renderFinancialPosition(data) {

        const donut = this.el["dashboard-position-donut"];
        if (!donut) return;

        const asset = Math.abs(this.toNumber(data.totalAsset));
        const liability = Math.abs(this.toNumber(data.totalLiability));
        const equity = Math.abs(this.toNumber(data.equity));
        const total = asset + liability + equity;

        if (total === 0) {
            donut.style.background = "conic-gradient(#E8ECF2 0deg 360deg)";
            return;
        }

        const assetDeg = asset / total * 360;
        const liabilityDeg = liability / total * 360;

        donut.style.background = `
            conic-gradient(
                #315BB8 0deg ${assetDeg}deg,
                #EF6B6B ${assetDeg}deg ${assetDeg + liabilityDeg}deg,
                #7C3AED ${assetDeg + liabilityDeg}deg 360deg
            )
        `;
    }

    /* ========================================================
       QUICK INSIGHTS
    ======================================================== */
    renderInsights(data, netProfit) {

        const container = this.el["dashboard-insight-list"];
        if (!container) return;

        const insights = [];

        if (this.toInteger(data.arOverdueCount) > 0) {
            insights.push({
                type: "warning",
                icon: "fa-solid fa-triangle-exclamation",
                title: "Receivable overdue",
                text: `${this.toInteger(data.arOverdueCount)} AR invoice(s) require collection follow-up.`
            });
        }

        if (this.toInteger(data.apOverdueCount) > 0) {
            insights.push({
                type: "danger",
                icon: "fa-solid fa-clock",
                title: "Payable overdue",
                text: `${this.toInteger(data.apOverdueCount)} AP invoice(s) have passed their due date.`
            });
        }

        if (this.toInteger(data.draftJournalCount) > 0) {
            insights.push({
                type: "info",
                icon: "fa-solid fa-book-open",
                title: "Draft journal pending",
                text: `${this.toInteger(data.draftJournalCount)} journal(s) are still waiting for posting.`
            });
        }

        if (netProfit > 0) {
            insights.push({
                type: "success",
                icon: "fa-solid fa-arrow-trend-up",
                title: "Positive YTD result",
                text: `Net profit is ${this.formatCurrency(netProfit)}.`
            });
        }

        if (!insights.length) {
            insights.push({
                type: "info",
                icon: "fa-solid fa-circle-info",
                title: "No financial alert",
                text: "Financial insights will appear automatically when dashboard data is loaded."
            });
        }

        container.innerHTML = insights.slice(0, 4).map(item => `
            <div class="dashboard-insight-item is-${item.type}">
                <div class="dashboard-insight-icon">
                    <i class="${item.icon}"></i>
                </div>
                <div>
                    <strong>${this.escapeHTML(item.title)}</strong>
                    <span>${this.escapeHTML(item.text)}</span>
                </div>
            </div>
        `).join("");
    }

    /* ========================================================
       RECENT ACTIVITY
    ======================================================== */
    renderActivities(activities = []) {

        const tbody = this.el["dashboard-activity-tbody"];
        if (!tbody) return;

        if (!Array.isArray(activities) || !activities.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="dashboard-empty-state">
                        <i class="fa-regular fa-folder-open"></i>
                        <span>No recent financial activity.</span>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = activities.slice(0, 8).map(row => `
            <tr>
                <td>${this.escapeHTML(this.formatDate(row.date))}</td>
                <td>${this.escapeHTML(row.module || "-")}</td>
                <td>${this.escapeHTML(row.document || row.document_no || "-")}</td>
                <td>${this.escapeHTML(row.description || "-")}</td>
                <td class="text-end">${this.escapeHTML(this.formatCurrency(row.amount))}</td>
                <td class="text-center">
                    ${this.renderStatus(row.status)}
                </td>
            </tr>
        `).join("");
    }

    renderStatus(status) {

        const value = String(status || "-").trim();
        const key = value.toLowerCase();
        const allowed = ["posted", "paid", "draft", "void"];
        const className = allowed.includes(key) ? key : "draft";

        return `
            <span class="dashboard-status-badge ${className}">
                ${this.escapeHTML(value)}
            </span>
        `;
    }

    /* ========================================================
       SYSTEM INFORMATION
    ======================================================== */
    loadSystemInformation() {

        const now = new Date();

        const period = now.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });

        const headerDate = now.toLocaleDateString("en-US", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        this.setText("dashboard-period-label", period);
        this.setText("dashboard-period", period);
        this.setText("dashboard-header-date", headerDate);

        /* Keep these neutral until company/branch settings are connected. */
        this.setText("dashboard-branch", "Main Branch");
        this.setText("dashboard-currency", "IDR");
    }

    startClock() {

        const update = () => {
            const now = new Date();
            const value = now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });

            this.setText("dashboard-current-time", value);
        };

        update();

        if (this.clockTimer) {
            clearInterval(this.clockTimer);
        }

        this.clockTimer = setInterval(update, 1000);
    }

    destroy() {

    /*
    ======================================================
    CLOCK
    ======================================================
    */

    if (
        this.clockTimer
    ) {

        clearInterval(
            this.clockTimer
        );

        this.clockTimer = null;

    }


    /*
    ======================================================
    REALTIME RELOAD TIMER
    ======================================================
    */

    if (
        this.realtimeReloadTimer
    ) {

        clearTimeout(
            this.realtimeReloadTimer
        );

        this.realtimeReloadTimer = null;

    }


    /*
    ======================================================
    SUPABASE REALTIME CHANNEL
    ======================================================
    */

    if (
        this.realtimeChannel
    ) {

        supabase.removeChannel(
            this.realtimeChannel
        );

        this.realtimeChannel = null;

    }


    /*
    ======================================================
    RESET REALTIME STATE
    ======================================================
    */

    this.isRealtimeReloading =
        false;

    this.realtimeReloadPending =
        false;

}

    /* ========================================================
       UTILITIES
    ======================================================== */
    setText(id, value) {
        const element = this.el?.[id] || document.getElementById(id);
        if (element) element.textContent = value;
    }

    toNumber(value) {
        const number = Number(value ?? 0);
        return Number.isFinite(number) ? number : 0;
    }

    toInteger(value) {
        return Math.max(0, Math.trunc(this.toNumber(value)));
    }

    formatInteger(value) {
        return this.toInteger(value).toLocaleString("id-ID");
    }

    formatCurrency(value) {
        const number = Math.round(this.toNumber(value));
        return `Rp ${number.toLocaleString("id-ID")}`;
    }

    formatPercent(value) {
        return `${this.toNumber(value).toLocaleString("id-ID", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}%`;
    }

    formatDate(value) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}
