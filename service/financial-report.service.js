/*
==========================================================
FINOVA ACCOUNTING SYSTEM
SERVICE : FINANCIAL REPORT
FILE    : financial-report.service.js
VERSION : 1.2.0 FINAL - FINANCIAL STATEMENT BOOK SUPPORT
==========================================================
*/

import {
    supabase
} from "../assets/js/core/supabase.js";


export class FinancialReportService {


    /*
    ==========================================================
    CACHE
    ==========================================================
    */

    static accounts = null;


    /*
    ==========================================================
    CLEAR CACHE
    ==========================================================
    */

    static clearCache() {

        this.accounts = null;

    }


    /*
    ==========================================================
    NORMALIZE ACCOUNT
    ==========================================================
    */

    static normalizeAccount(
        account
    ) {

        const parentId =

            account?.parent_id

            ??

            account?.parent_account_id

            ??

            account?.parent_coa_id

            ??

            account?.parent_account

            ??

            null;


        return {

            ...account,


            id:
                account?.id,


            account_code:

                String(

                    account?.account_code

                    ??

                    account?.code

                    ??

                    ""

                ),


            account_name:

                String(

                    account?.account_name

                    ??

                    account?.name

                    ??

                    ""

                ),


            parent_id:
                parentId,


            allow_transaction:

                account?.allow_transaction

                ??

                account?.is_transaction

                ??

                true,


            status:

                account?.status

                ??

                account?.is_active

                ??

                true

        };

    }


    /*
    ==========================================================
    COMPARE ACCOUNT CODE
    ==========================================================
    */

    static compareAccountCode(
        codeA,
        codeB
    ) {

        return String(
            codeA
            ??
            ""
        )
        .localeCompare(

            String(
                codeB
                ??
                ""
            ),

            undefined,

            {
                numeric:
                    true,

                sensitivity:
                    "base"
            }

        );

    }


    /*
==========================================================
RESOLVE ACCOUNT GROUP
==========================================================
*/

static resolveAccountGroup(
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


    /*
    ======================================================
    WALK TO ROOT ACCOUNT
    ======================================================
    */

    while (
        current
    ) {

        const key =
            String(
                current.id
                ??
                ""
            );


        if (
            visited.has(
                key
            )
        ) {

            break;

        }


        visited.add(
            key
        );


        const name =
            String(
                current.account_name
                ||
                ""
            )
            .trim()
            .toUpperCase();


        /*
        ==================================================
        ACCOUNT GROUP FROM NAME
        ==================================================
        */

        if (
            name.includes(
                "ASSET"
            )
        ) {

            return "asset";

        }


        if (
            name.includes(
                "LIABILIT"
            )
        ) {

            return "liability";

        }


        if (
            name.includes(
                "EQUITY"
            )
            ||
            name.includes(
                "CAPITAL"
            )
        ) {

            return "equity";

        }


        if (
            name.includes(
                "REVENUE"
            )
            ||
            name.includes(
                "INCOME"
            )
        ) {

            return "revenue";

        }


        if (
            name.includes(
                "EXPENSE"
            )
            ||
            name.includes(
                "COST"
            )
            ||
            name.includes(
                "BEBAN"
            )
            ||
            name.includes(
                "BIAYA"
            )
            ||
            name.includes(
                "KERUGIAN"
            )
        ) {

            return "expense";

        }


        /*
        ==================================================
        MOVE TO PARENT
        ==================================================
        */

        const parentId =
            current.parent_id;


        if (
            parentId === null
            ||
            parentId === undefined
            ||
            parentId === ""
        ) {

            break;

        }


        current =
            accountMap.get(
                String(
                    parentId
                )
            );

    }


    /*
    ======================================================
    FALLBACK ACCOUNT CODE

    FINOVA ACCOUNT CLASSIFICATION

    1 = Asset
    2 = Liability
    3 = Equity
    4 = Revenue / Income
    5 = Expense / Cost
    6 = Expense
    7 = Expense
    8 = Other Expense / Loss
    ======================================================
    */

    const code =
        String(
            account.account_code
            ||
            ""
        )
        .trim();


    if (
        code.startsWith(
            "1"
        )
    ) {

        return "asset";

    }


    if (
        code.startsWith(
            "2"
        )
    ) {

        return "liability";

    }


    if (
        code.startsWith(
            "3"
        )
    ) {

        return "equity";

    }


    if (
        code.startsWith(
            "4"
        )
    ) {

        return "revenue";

    }


    if (
        code.startsWith(
            "5"
        )
        ||
        code.startsWith(
            "6"
        )
        ||
        code.startsWith(
            "7"
        )
        ||
        code.startsWith(
            "8"
        )
    ) {

        return "expense";

    }


    return null;

}

    /*
    ==========================================================
    LOAD CHART OF ACCOUNTS
    ==========================================================
    */

    static async loadAccounts(
        forceRefresh = false
    ) {

        /*
        ======================================================
        RETURN CACHE
        ======================================================
        */

        if (
            forceRefresh !== true
            &&
            Array.isArray(
                this.accounts
            )
        ) {

            return this.accounts;

        }


        /*
        ======================================================
        LOAD FROM DATABASE

        Company isolation is handled by FINOVA tenant RLS
        using finova_effective_company_id().
        ======================================================
        */

        const {

            data,

            error

        } = await supabase

            .from(
                "mst_chart_of_accounts"
            )

            .select("*")

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

            console.error(
                "FinancialReportService.loadAccounts:",
                error
            );


            throw error;

        }


        /*
        ======================================================
        NORMALIZE
        ======================================================
        */

        const accounts =
            (
                Array.isArray(
                    data
                )
                    ? data
                    : []
            )
            .map(

                account =>
                    this.normalizeAccount(
                        account
                    )

            );


        /*
        ======================================================
        SORT ACCOUNT CODE
        ======================================================
        */

        accounts.sort(

            (
                a,
                b
            ) =>
                this.compareAccountCode(

                    a.account_code,

                    b.account_code

                )

        );


        /*
        ======================================================
        CACHE
        ======================================================
        */

        this.accounts =
            accounts;


        return this.accounts;

    }
    /*
==========================================================
LOAD POSTED GL JOURNALS
==========================================================
*/

static async loadPostedJournals(
    dateFrom = null,
    dateTo = null
) {

    /*
    ======================================================
    VALIDATE DATE RANGE
    ======================================================
    */

    if (
        dateFrom
        &&
        dateTo
        &&
        String(
            dateFrom
        )
        >
        String(
            dateTo
        )
    ) {

        throw new Error(
            "Financial Report dateFrom cannot be greater than dateTo."
        );

    }


    /*
    ======================================================
    BASE QUERY

    IMPORTANT:
    Only Posted journals are part of Financial Statements.

    Company isolation is handled by FINOVA tenant RLS
    through finova_effective_company_id().
    ======================================================
    */

    let query =
        supabase

            .from(
                "trx_gl_journal"
            )

            .select("*")

            .eq(
                "status",
                "Posted"
            );


    /*
    ======================================================
    DATE FROM
    ======================================================
    */

    if (
        dateFrom
    ) {

        query =
            query.gte(
                "journal_date",
                dateFrom
            );

    }


    /*
    ======================================================
    DATE TO
    ======================================================
    */

    if (
        dateTo
    ) {

        query =
            query.lte(
                "journal_date",
                dateTo
            );

    }


    /*
    ======================================================
    ORDER
    ======================================================
    */

    query =
        query.order(
            "journal_date",
            {
                ascending:
                    true
            }
        );


    /*
    ======================================================
    EXECUTE QUERY
    ======================================================
    */

    const {

        data,

        error

    } =
        await query;


    if (
        error
    ) {

        console.error(
            "FinancialReportService.loadPostedJournals:",
            error
        );


        throw error;

    }


    /*
    ======================================================
    NORMALIZE RESULT
    ======================================================
    */

    return Array.isArray(
        data
    )
        ? data
        : [];

}

/*
==========================================================
LOAD GL JOURNAL DETAILS
==========================================================
*/

static async loadJournalDetails(
    journals = []
) {

    /*
    ======================================================
    VALIDATE JOURNALS
    ======================================================
    */

    if (
        !Array.isArray(
            journals
        )
    ) {

        throw new Error(
            "Financial Report journals must be an array."
        );

    }


    /*
    ======================================================
    EMPTY JOURNAL LIST
    ======================================================
    */

    if (
        journals.length === 0
    ) {

        return [];

    }


    /*
    ======================================================
    GET JOURNAL IDS
    ======================================================
    */

    const journalIds =
        [
            ...new Set(

                journals

                    .map(
                        journal =>
                            journal?.id
                    )

                    .filter(
                        journalId =>
                            journalId !== null
                            &&
                            journalId !== undefined
                            &&
                            journalId !== ""
                    )

                    .map(
                        journalId =>
                            String(
                                journalId
                            )
                    )

            )
        ];


    /*
    ======================================================
    NO VALID JOURNAL IDS
    ======================================================
    */

    if (
        journalIds.length === 0
    ) {

        return [];

    }


    /*
    ======================================================
    LOAD JOURNAL DETAILS

    IMPORTANT:
    Only details belonging to the supplied Posted GL
    headers are requested.

    Tenant isolation remains enforced by FINOVA RLS
    through finova_effective_company_id().
    ======================================================
    */

    const {

        data,

        error

    } =
        await supabase

            .from(
                "trx_gl_journal_detail"
            )

            .select("*")

            .in(
                "journal_id",
                journalIds
            )

            .order(
                "journal_id",
                {
                    ascending:
                        true
                }
            );


    if (
        error
    ) {

        console.error(
            "FinancialReportService.loadJournalDetails:",
            error
        );


        throw error;

    }


    /*
    ======================================================
    NORMALIZE RESULT
    ======================================================
    */

    return Array.isArray(
        data
    )
        ? data
        : [];

}
/*
==========================================================
NORMALIZE GL POSTINGS
==========================================================
*/

static normalizePostings(
    details = []
) {

    /*
    ======================================================
    VALIDATE DETAILS
    ======================================================
    */

    if (
        !Array.isArray(
            details
        )
    ) {

        throw new Error(
            "Financial Report journal details must be an array."
        );

    }


    /*
    ======================================================
    NORMALIZED POSTINGS
    ======================================================
    */

    const postings = [];


    /*
    ======================================================
    PROCESS DETAIL ROWS
    ======================================================
    */

    details.forEach(
        detail => {

            /*
            ==================================================
            MODERN FINOVA POSTING STRUCTURE

            One detail row represents one account posting:

            account_id
            debit
            credit

            Debit  = positive
            Credit = negative
            ==================================================
            */

            const hasModernAccount =
                detail?.account_id !== null
                &&
                detail?.account_id !== undefined
                &&
                detail?.account_id !== "";


            if (
                hasModernAccount
            ) {

                const debit =
                    Number(
                        detail?.debit
                        ??
                        0
                    )
                    ||
                    0;


                const credit =
                    Number(
                        detail?.credit
                        ??
                        0
                    )
                    ||
                    0;


                postings.push({

                    detail_id:
                        detail?.id
                        ??
                        null,

                    journal_id:
                        detail?.journal_id
                        ??
                        null,

                    company_id:
                        detail?.company_id
                        ??
                        null,

                    account_id:
                        detail.account_id,

                    debit:
                        debit,

                    credit:
                        credit,

                    net_amount:
                        debit
                        -
                        credit,

                    source_format:
                        "modern"

                });


                return;

            }


            /*
            ==================================================
            LEGACY FINOVA POSTING STRUCTURE

            Older structure may contain:

            debit_account_id
            credit_account_id
            amount

            Keep this only for backward compatibility.
            ==================================================
            */

            const amount =
                Number(
                    detail?.amount
                    ??
                    0
                )
                ||
                0;


            const debitAccountId =
                detail?.debit_account_id;


            const creditAccountId =
                detail?.credit_account_id;


            /*
            ==================================================
            LEGACY DEBIT POSTING
            ==================================================
            */

            if (
                debitAccountId !== null
                &&
                debitAccountId !== undefined
                &&
                debitAccountId !== ""
            ) {

                postings.push({

                    detail_id:
                        detail?.id
                        ??
                        null,

                    journal_id:
                        detail?.journal_id
                        ??
                        null,

                    company_id:
                        detail?.company_id
                        ??
                        null,

                    account_id:
                        debitAccountId,

                    debit:
                        amount,

                    credit:
                        0,

                    net_amount:
                        amount,

                    source_format:
                        "legacy"

                });

            }


            /*
            ==================================================
            LEGACY CREDIT POSTING
            ==================================================
            */

            if (
                creditAccountId !== null
                &&
                creditAccountId !== undefined
                &&
                creditAccountId !== ""
            ) {

                postings.push({

                    detail_id:
                        detail?.id
                        ??
                        null,

                    journal_id:
                        detail?.journal_id
                        ??
                        null,

                    company_id:
                        detail?.company_id
                        ??
                        null,

                    account_id:
                        creditAccountId,

                    debit:
                        0,

                    credit:
                        amount,

                    net_amount:
                        0
                        -
                        amount,

                    source_format:
                        "legacy"

                });

            }

        }
    );


    /*
    ======================================================
    RETURN POSTINGS
    ======================================================
    */

    return postings;

}
/*
==========================================================
CALCULATE ACCOUNT BALANCES
==========================================================
*/

static calculateAccountBalances(
    accounts = [],
    postings = []
) {

    /*
    ======================================================
    VALIDATE INPUT
    ======================================================
    */

    if (
        !Array.isArray(
            accounts
        )
    ) {

        throw new Error(
            "Financial Report accounts must be an array."
        );

    }


    if (
        !Array.isArray(
            postings
        )
    ) {

        throw new Error(
            "Financial Report postings must be an array."
        );

    }


    /*
    ======================================================
    ACCOUNT MAP
    ======================================================
    */

    const accountMap =
        new Map(
            accounts.map(
                account => [
                    String(
                        account.id
                    ),
                    account
                ]
            )
        );


    /*
    ======================================================
    POSTING TOTAL BY ACCOUNT
    ======================================================
    */

    const postingTotals =
        new Map();


    postings.forEach(
        posting => {

            const accountId =
                posting?.account_id;


            if (
                accountId === null
                ||
                accountId === undefined
                ||
                accountId === ""
            ) {

                return;

            }


            const key =
                String(
                    accountId
                );


            if (
                !postingTotals.has(
                    key
                )
            ) {

                postingTotals.set(
                    key,
                    {
                        debit:
                            0,

                        credit:
                            0
                    }
                );

            }


            const total =
                postingTotals.get(
                    key
                );


            total.debit +=
                Number(
                    posting?.debit
                    ??
                    0
                )
                ||
                0;


            total.credit +=
                Number(
                    posting?.credit
                    ??
                    0
                )
                ||
                0;

        }
    );


    /*
    ======================================================
    BUILD ACCOUNT BALANCES
    ======================================================
    */

    const balances =
        accounts.map(
            account => {

                const key =
                    String(
                        account.id
                    );


                const total =
                    postingTotals.get(
                        key
                    )
                    ??
                    {
                        debit:
                            0,

                        credit:
                            0
                    };


                const debit =
                    Number(
                        total.debit
                        ??
                        0
                    )
                    ||
                    0;


                const credit =
                    Number(
                        total.credit
                        ??
                        0
                    )
                    ||
                    0;


                const netAmount =
                    debit
                    -
                    credit;


                const group =
                    this.resolveAccountGroup(
                        account,
                        accountMap
                    );


                /*
                ==================================================
                PRESENTATION BALANCE

                Asset / Expense:
                Debit - Credit

                Liability / Equity / Revenue:
                Credit - Debit
                ==================================================
                */

                let balance =
                    netAmount;


                if (
                    group === "liability"
                    ||
                    group === "equity"
                    ||
                    group === "revenue"
                ) {

                    balance =
                        credit
                        -
                        debit;

                }


                return {

                    id:
                        account.id,

                    account_id:
                        account.id,

                    account_code:
                        account.account_code,

                    account_name:
                        account.account_name,

                    parent_id:
                        account.parent_id
                        ??
                        null,

                    allow_transaction:
                        account.allow_transaction,

                    status:
                        account.status,

                    group:
                        group,

                    debit:
                        debit,

                    credit:
                        credit,

                    net_amount:
                        netAmount,

                    balance:
                        balance

                };

            }
        );


    /*
    ======================================================
    SORT
    ======================================================
    */

    balances.sort(
        (
            a,
            b
        ) =>
            this.compareAccountCode(
                a.account_code,
                b.account_code
            )
    );


    return balances;

}
/*
==========================================================
CALCULATE PERIOD BALANCES
==========================================================
*/

static async calculatePeriodBalances(
    dateFrom,
    dateTo
) {

    /*
    ======================================================
    VALIDATE REPORTING PERIOD
    ======================================================
    */

    if (
        !dateFrom
        ||
        !dateTo
    ) {

        throw new Error(
            "Financial Report reporting period is required."
        );

    }


    if (
        String(
            dateFrom
        )
        >
        String(
            dateTo
        )
    ) {

        throw new Error(
            "Financial Report dateFrom cannot be greater than dateTo."
        );

    }


    /*
    ======================================================
    LOAD CHART OF ACCOUNTS
    ======================================================
    */

    const accounts =
        await this.loadAccounts();


    /*
    ======================================================
    BALANCE SHEET SOURCE

    Balance Sheet uses all Posted GL transactions
    up to the reporting date.
    ======================================================
    */

    const cumulativeJournals =
        await this.loadPostedJournals(
            null,
            dateTo
        );


    const cumulativeDetails =
        await this.loadJournalDetails(
            cumulativeJournals
        );


    const cumulativePostings =
        this.normalizePostings(
            cumulativeDetails
        );


    const cumulativeBalances =
        this.calculateAccountBalances(
            accounts,
            cumulativePostings
        );


    /*
    ======================================================
    PROFIT & LOSS SOURCE

    Profit & Loss uses only Posted GL transactions
    inside the reporting period.
    ======================================================
    */

    const periodJournals =
        await this.loadPostedJournals(
            dateFrom,
            dateTo
        );


    const periodDetails =
        await this.loadJournalDetails(
            periodJournals
        );


    const periodPostings =
        this.normalizePostings(
            periodDetails
        );


    const periodBalances =
        this.calculateAccountBalances(
            accounts,
            periodPostings
        );


    /*
    ======================================================
    BALANCE SHEET ACCOUNTS
    ======================================================
    */

    const balanceSheet =
        cumulativeBalances.filter(
            account =>
                account.group === "asset"
                ||
                account.group === "liability"
                ||
                account.group === "equity"
        );


    /*
    ======================================================
    PROFIT & LOSS ACCOUNTS
    ======================================================
    */

    const profitLoss =
        periodBalances.filter(
            account =>
                account.group === "revenue"
                ||
                account.group === "expense"
        );


    /*
    ======================================================
    PROFIT & LOSS TOTALS
    ======================================================
    */

    const totalRevenue =
        profitLoss

            .filter(
                account =>
                    account.group === "revenue"
            )

            .reduce(
                (
                    total,
                    account
                ) =>
                    total
                    +
                    Number(
                        account.balance
                        ||
                        0
                    ),
                0
            );


    const totalExpense =
        profitLoss

            .filter(
                account =>
                    account.group === "expense"
            )

            .reduce(
                (
                    total,
                    account
                ) =>
                    total
                    +
                    Number(
                        account.balance
                        ||
                        0
                    ),
                0
            );


    const netProfit =
        totalRevenue
        -
        totalExpense;


    /*
    ======================================================
    BALANCE SHEET TOTALS
    ======================================================
    */

    const totalAsset =
        balanceSheet

            .filter(
                account =>
                    account.group === "asset"
            )

            .reduce(
                (
                    total,
                    account
                ) =>
                    total
                    +
                    Number(
                        account.balance
                        ||
                        0
                    ),
                0
            );


    const totalLiability =
        balanceSheet

            .filter(
                account =>
                    account.group === "liability"
            )

            .reduce(
                (
                    total,
                    account
                ) =>
                    total
                    +
                    Number(
                        account.balance
                        ||
                        0
                    ),
                0
            );


    const totalEquity =
        balanceSheet

            .filter(
                account =>
                    account.group === "equity"
            )

            .reduce(
                (
                    total,
                    account
                ) =>
                    total
                    +
                    Number(
                        account.balance
                        ||
                        0
                    ),
                0
            );


    /*
    ======================================================
    CURRENT YEAR PROFIT / LOSS

    Current-year profit/loss is presented as part of
    equity in the Balance Sheet.

    IMPORTANT:
    This is a reporting presentation only.

    No GL journal is created.
    No COA balance is modified.
    ======================================================
    */

    const currentYearProfit =
        netProfit;


    const totalEquityIncludingProfit =
        totalEquity
        +
        currentYearProfit;


    const totalLiabilityAndEquity =
        totalLiability
        +
        totalEquityIncludingProfit;


    /*
    ======================================================
    BALANCE SHEET EQUATION
    ======================================================
    */

    const balanceSheetDifference =
        totalAsset
        -
        totalLiabilityAndEquity;


    const isBalanceSheetBalanced =
        Math.abs(
            balanceSheetDifference
        )
        <
        0.01;


    /*
    ======================================================
    RETURN FINANCIAL REPORT DATA
    ======================================================
    */

    return {

        period: {

            dateFrom:
                dateFrom,

            dateTo:
                dateTo

        },


        accounts:
            accounts,


        balanceSheet:
            balanceSheet,


        profitLoss:
            profitLoss,


        totals: {

            /*
            ==============================================
            PROFIT & LOSS
            ==============================================
            */

            revenue:
                totalRevenue,

            expense:
                totalExpense,

            netProfit:
                netProfit,


            /*
            ==============================================
            BALANCE SHEET
            ==============================================
            */

            asset:
                totalAsset,

            liability:
                totalLiability,

            equity:
                totalEquity,

            currentYearProfit:
                currentYearProfit,

            equityIncludingProfit:
                totalEquityIncludingProfit,

            liabilityAndEquity:
                totalLiabilityAndEquity,

            balanceSheetDifference:
                balanceSheetDifference,

            isBalanceSheetBalanced:
                isBalanceSheetBalanced

        },


        diagnostics: {

            cumulativeJournalCount:
                cumulativeJournals.length,

            cumulativeDetailCount:
                cumulativeDetails.length,

            cumulativePostingCount:
                cumulativePostings.length,

            periodJournalCount:
                periodJournals.length,

            periodDetailCount:
                periodDetails.length,

            periodPostingCount:
                periodPostings.length

        }

    };

}

/*
==========================================================
CALCULATE STATEMENT OF CHANGES IN EQUITY
==========================================================

This engine reconciles:
Opening equity
+ Profit / (loss) for period
+ Direct movements posted to equity
= Closing equity

Direct equity movements are kept as actual posted movements and are
not guessed as dividend / capital / OCI unless FINOVA later stores a
dedicated transaction classification.
==========================================================
*/
static async calculateChangesInEquity(
    dateFrom,
    dateTo
) {

    if (!dateFrom || !dateTo) {
        throw new Error(
            "Changes in Equity reporting period is required."
        );
    }

    const accounts =
        await this.loadAccounts();

    const accountMap =
        new Map(
            accounts.map(
                account => [
                    String(account.id),
                    account
                ]
            )
        );

    const openingDate =
        new Date(
            `${dateFrom}T00:00:00`
        );

    openingDate.setDate(
        openingDate.getDate() - 1
    );

    const openingDateTo =
        [
            openingDate.getFullYear(),
            String(openingDate.getMonth() + 1).padStart(2, "0"),
            String(openingDate.getDate()).padStart(2, "0")
        ].join("-");

    const openingJournals =
        await this.loadPostedJournals(
            null,
            openingDateTo
        );

    const openingDetails =
        await this.loadJournalDetails(
            openingJournals
        );

    const openingBalances =
        this.calculateAccountBalances(
            accounts,
            this.normalizePostings(
                openingDetails
            )
        );

    const periodJournals =
        await this.loadPostedJournals(
            dateFrom,
            dateTo
        );

    const periodDetails =
        await this.loadJournalDetails(
            periodJournals
        );

    const periodPostings =
        this.normalizePostings(
            periodDetails
        );

    const periodBalances =
        this.calculateAccountBalances(
            accounts,
            periodPostings
        );

    const closingJournals =
        await this.loadPostedJournals(
            null,
            dateTo
        );

    const closingDetails =
        await this.loadJournalDetails(
            closingJournals
        );

    const closingBalances =
        this.calculateAccountBalances(
            accounts,
            this.normalizePostings(
                closingDetails
            )
        );

    const equityAccounts =
        accounts.filter(
            account =>
                this.resolveAccountGroup(
                    account,
                    accountMap
                ) === "equity"
        );

    const openingMap =
        new Map(
            openingBalances.map(
                row => [
                    String(row.account_id),
                    Number(row.balance || 0)
                ]
            )
        );

    const closingMap =
        new Map(
            closingBalances.map(
                row => [
                    String(row.account_id),
                    Number(row.balance || 0)
                ]
            )
        );

    const periodMap =
        new Map(
            periodBalances.map(
                row => [
                    String(row.account_id),
                    Number(row.balance || 0)
                ]
            )
        );

    const components =
        equityAccounts.map(
            account => {

                const key =
                    String(account.id);

                return {
                    account_id:
                        account.id,

                    account_code:
                        account.account_code,

                    account_name:
                        account.account_name,

                    parent_id:
                        account.parent_id ?? null,

                    opening_balance:
                        openingMap.get(key) || 0,

                    direct_movement:
                        periodMap.get(key) || 0,

                    closing_balance:
                        closingMap.get(key) || 0
                };

            }
        );

    const openingEquity =
        components.reduce(
            (total, row) =>
                total
                +
                Number(
                    row.opening_balance || 0
                ),
            0
        );

    const directEquityMovement =
        components.reduce(
            (total, row) =>
                total
                +
                Number(
                    row.direct_movement || 0
                ),
            0
        );

    const closingEquityAccounts =
        components.reduce(
            (total, row) =>
                total
                +
                Number(
                    row.closing_balance || 0
                ),
            0
        );

    const periodProfitLoss =
        periodBalances.filter(
            account =>
                account.group === "revenue"
                ||
                account.group === "expense"
        );

    const revenue =
        periodProfitLoss
            .filter(
                account =>
                    account.group === "revenue"
            )
            .reduce(
                (total, account) =>
                    total
                    +
                    Number(
                        account.balance || 0
                    ),
                0
            );

    const expense =
        periodProfitLoss
            .filter(
                account =>
                    account.group === "expense"
            )
            .reduce(
                (total, account) =>
                    total
                    +
                    Number(
                        account.balance || 0
                    ),
                0
            );

    const profitForPeriod =
        revenue - expense;

    return {
        period: {
            dateFrom,
            dateTo
        },

        components,

        totals: {
            openingEquity,
            profitForPeriod,
            directEquityMovement,
            closingEquityAccounts,
            closingEquityIncludingProfit:
                closingEquityAccounts
                +
                profitForPeriod
        }
    };

}


/*
==========================================================
CALCULATE CASH FLOW
==========================================================

FINOVA uses transaction-level Posted GL data.

Cash / cash-equivalent accounts are identified from the COA name/code.
Each journal's cash-side movement is analysed against its non-cash
counter-account group.

Classification:
- counter Asset (non-cash)        -> Investing
- counter Equity                  -> Financing
- counter Liability:
    operating names               -> Operating
    financing names               -> Financing
- counter Revenue / Expense       -> Operating

This is intentionally conservative. Ambiguous items are returned in
"unclassified" rather than silently forced into a PSAK 207 category.
==========================================================
*/
static async calculateCashFlow(
    dateFrom,
    dateTo
) {

    if (!dateFrom || !dateTo) {
        throw new Error(
            "Cash Flow reporting period is required."
        );
    }

    const accounts =
        await this.loadAccounts();

    const accountMap =
        new Map(
            accounts.map(
                account => [
                    String(account.id),
                    account
                ]
            )
        );

    const cashPattern =
        /\b(CASH|KAS|BANK|GIRO|PETTY CASH|CASH EQUIVALENT|SETARA KAS)\b/i;

    const cashAccounts =
        accounts.filter(
            account =>
                this.resolveAccountGroup(
                    account,
                    accountMap
                ) === "asset"
                &&
                cashPattern.test(
                    `${account.account_code || ""} ${account.account_name || ""}`
                )
        );

    const cashIds =
        new Set(
            cashAccounts.map(
                account =>
                    String(account.id)
            )
        );

    const journals =
        await this.loadPostedJournals(
            dateFrom,
            dateTo
        );

    const details =
        await this.loadJournalDetails(
            journals
        );

    const postings =
        this.normalizePostings(
            details
        );

    const postingsByJournal =
        new Map();

    postings.forEach(
        posting => {

            const key =
                String(
                    posting.journal_id
                );

            if (!postingsByJournal.has(key)) {
                postingsByJournal.set(
                    key,
                    []
                );
            }

            postingsByJournal
                .get(key)
                .push(posting);

        }
    );

    const journalMap =
        new Map(
            journals.map(
                journal => [
                    String(journal.id),
                    journal
                ]
            )
        );

    const operatingLiabilityPattern =
        /(PAYABLE|UTANG USAHA|HUTANG USAHA|ACCRUED|ACCRUAL|TAX PAYABLE|UTANG PAJAK|VAT|PPN|PPh|SALARY|PAYROLL|WAGE)/i;

    const financingLiabilityPattern =
        /(LOAN|PINJAMAN|BANK LOAN|DEBT|LEASE LIABILITY|LIABILITAS SEWA|OBLIGATION|BOND|NOTES PAYABLE)/i;

    const classifyCounterAccount =
        account => {

            if (!account) {
                return "unclassified";
            }

            const group =
                this.resolveAccountGroup(
                    account,
                    accountMap
                );

            const label =
                `${account.account_code || ""} ${account.account_name || ""}`;

            if (
                group === "revenue"
                ||
                group === "expense"
            ) {
                return "operating";
            }

            if (
                group === "equity"
            ) {
                return "financing";
            }

            if (
                group === "liability"
            ) {

                if (
                    financingLiabilityPattern.test(
                        label
                    )
                ) {
                    return "financing";
                }

                if (
                    operatingLiabilityPattern.test(
                        label
                    )
                ) {
                    return "operating";
                }

                return "unclassified";
            }

            if (
                group === "asset"
            ) {
                return "investing";
            }

            return "unclassified";
        };

    const activities = {
        operating: [],
        investing: [],
        financing: [],
        unclassified: []
    };

    postingsByJournal.forEach(
        (
            journalPostings,
            journalId
        ) => {

            const cashPostings =
                journalPostings.filter(
                    posting =>
                        cashIds.has(
                            String(
                                posting.account_id
                            )
                        )
                );

            if (
                cashPostings.length === 0
            ) {
                return;
            }

            const nonCashPostings =
                journalPostings.filter(
                    posting =>
                        !cashIds.has(
                            String(
                                posting.account_id
                            )
                        )
                );

            const cashMovement =
                cashPostings.reduce(
                    (total, posting) =>
                        total
                        +
                        Number(
                            posting.debit || 0
                        )
                        -
                        Number(
                            posting.credit || 0
                        ),
                    0
                );

            if (
                Math.abs(
                    cashMovement
                )
                <
                0.01
            ) {
                return;
            }

            const categoryWeights = {
                operating: 0,
                investing: 0,
                financing: 0,
                unclassified: 0
            };

            nonCashPostings.forEach(
                posting => {

                    const account =
                        accountMap.get(
                            String(
                                posting.account_id
                            )
                        );

                    const category =
                        classifyCounterAccount(
                            account
                        );

                    categoryWeights[category] +=
                        Math.abs(
                            Number(
                                posting.debit || 0
                            )
                            -
                            Number(
                                posting.credit || 0
                            )
                        );

                }
            );

            const categories =
                Object.entries(
                    categoryWeights
                )
                .filter(
                    ([, amount]) =>
                        amount > 0.009
                )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                );

            let category =
                "unclassified";

            if (
                categories.length === 1
            ) {
                category =
                    categories[0][0];
            }
            else if (
                categories.length > 1
                &&
                categories[0][1]
                >
                categories[1][1] * 1.5
            ) {
                category =
                    categories[0][0];
            }

            const journal =
                journalMap.get(
                    journalId
                )
                || {};

            activities[category].push({
                journal_id:
                    journalId,

                journal_no:
                    journal.journal_no
                    ||
                    journal.reference_no
                    ||
                    "-",

                journal_date:
                    journal.journal_date
                    ||
                    null,

                description:
                    journal.description
                    ||
                    "",

                amount:
                    cashMovement
            });

        }
    );

    const total =
        rows =>
            rows.reduce(
                (sum, row) =>
                    sum
                    +
                    Number(
                        row.amount || 0
                    ),
                0
            );

    const openingDate =
        new Date(
            `${dateFrom}T00:00:00`
        );

    openingDate.setDate(
        openingDate.getDate() - 1
    );

    const openingDateTo =
        [
            openingDate.getFullYear(),
            String(openingDate.getMonth() + 1).padStart(2, "0"),
            String(openingDate.getDate()).padStart(2, "0")
        ].join("-");

    const openingJournals =
        await this.loadPostedJournals(
            null,
            openingDateTo
        );

    const openingDetails =
        await this.loadJournalDetails(
            openingJournals
        );

    const openingBalances =
        this.calculateAccountBalances(
            accounts,
            this.normalizePostings(
                openingDetails
            )
        );

    const closingJournals =
        await this.loadPostedJournals(
            null,
            dateTo
        );

    const closingDetails =
        await this.loadJournalDetails(
            closingJournals
        );

    const closingBalances =
        this.calculateAccountBalances(
            accounts,
            this.normalizePostings(
                closingDetails
            )
        );

    const sumCashBalance =
        balances =>
            balances
                .filter(
                    row =>
                        cashIds.has(
                            String(
                                row.account_id
                            )
                        )
                )
                .reduce(
                    (sum, row) =>
                        sum
                        +
                        Number(
                            row.balance || 0
                        ),
                    0
                );

    const openingCash =
        sumCashBalance(
            openingBalances
        );

    const closingCash =
        sumCashBalance(
            closingBalances
        );

    const operating =
        total(
            activities.operating
        );

    const investing =
        total(
            activities.investing
        );

    const financing =
        total(
            activities.financing
        );

    const unclassified =
        total(
            activities.unclassified
        );

    const classifiedNetChange =
        operating
        +
        investing
        +
        financing;

    const actualNetChange =
        closingCash
        -
        openingCash;

    return {
        period: {
            dateFrom,
            dateTo
        },

        cashAccounts:
            cashAccounts.map(
                account => ({
                    id:
                        account.id,
                    account_code:
                        account.account_code,
                    account_name:
                        account.account_name
                })
            ),

        activities,

        totals: {
            operating,
            investing,
            financing,
            unclassified,
            classifiedNetChange,
            actualNetChange,
            openingCash,
            closingCash,
            reconciliationDifference:
                actualNetChange
                -
                (
                    classifiedNetChange
                    +
                    unclassified
                )
        }
    };

}


/*
==========================================================
CALCULATE TRIAL BALANCE
==========================================================
*/

static async calculateTrialBalance(
    dateFrom,
    dateTo
) {

    /*
    ======================================================
    VALIDATE REPORTING PERIOD
    ======================================================
    */

    if (
        !dateFrom
        ||
        !dateTo
    ) {

        throw new Error(
            "Financial Report reporting period is required."
        );

    }


    if (
        String(
            dateFrom
        )
        >
        String(
            dateTo
        )
    ) {

        throw new Error(
            "Financial Report dateFrom cannot be greater than dateTo."
        );

    }


    /*
    ======================================================
    LOAD CHART OF ACCOUNTS
    ======================================================
    */

    const accounts =
        await this.loadAccounts();


    /*
    ======================================================
    BEGINNING BALANCE SOURCE

    Beginning balance:
    all Posted GL before dateFrom.

    Example:
    dateFrom = 2026-01-01

    Beginning balance source:
    Posted GL <= 2025-12-31
    ======================================================
    */

    const beginningDate =
        new Date(
            `${dateFrom}T00:00:00`
        );


    beginningDate.setDate(
        beginningDate.getDate()
        -
        1
    );


    const beginningDateTo =
        [
            beginningDate.getFullYear(),

            String(
                beginningDate.getMonth()
                +
                1
            ).padStart(
                2,
                "0"
            ),

            String(
                beginningDate.getDate()
            ).padStart(
                2,
                "0"
            )
        ].join(
            "-"
        );


    const beginningJournals =
        await this.loadPostedJournals(
            null,
            beginningDateTo
        );


    const beginningDetails =
        await this.loadJournalDetails(
            beginningJournals
        );


    const beginningPostings =
        this.normalizePostings(
            beginningDetails
        );


    const beginningBalances =
        this.calculateAccountBalances(
            accounts,
            beginningPostings
        );


    /*
    ======================================================
    PERIOD MOVEMENT SOURCE
    ======================================================
    */

    const periodJournals =
        await this.loadPostedJournals(
            dateFrom,
            dateTo
        );


    const periodDetails =
        await this.loadJournalDetails(
            periodJournals
        );


    const periodPostings =
        this.normalizePostings(
            periodDetails
        );


    /*
    ======================================================
    PERIOD MOVEMENT BY ACCOUNT
    ======================================================
    */

    const movementMap =
        new Map();


    periodPostings.forEach(
        posting => {

            const key =
                String(
                    posting.account_id
                );


            if (
                !movementMap.has(
                    key
                )
            ) {

                movementMap.set(
                    key,
                    {
                        debit:
                            0,

                        credit:
                            0
                    }
                );

            }


            const movement =
                movementMap.get(
                    key
                );


            movement.debit +=
                Number(
                    posting.debit
                    ||
                    0
                );


            movement.credit +=
                Number(
                    posting.credit
                    ||
                    0
                );

        }
    );


    /*
    ======================================================
    BEGINNING BALANCE MAP
    ======================================================
    */

    const beginningMap =
        new Map(
            beginningBalances.map(
                account => [
                    String(
                        account.account_id
                    ),
                    account
                ]
            )
        );


    /*
    ======================================================
    BUILD TRIAL BALANCE
    ======================================================
    */

    const trialBalance =
        accounts.map(
            account => {

                const key =
                    String(
                        account.id
                    );


                const group =
                    this.resolveAccountGroup(
                        account,
                        new Map(
                            accounts.map(
                                item => [
                                    String(
                                        item.id
                                    ),
                                    item
                                ]
                            )
                        )
                    );


                const beginning =
                    beginningMap.get(
                        key
                    );


                const movement =
                    movementMap.get(
                        key
                    )
                    ??
                    {
                        debit:
                            0,

                        credit:
                            0
                    };


                /*
                ==================================================
                BEGINNING BALANCE

                Revenue and Expense are periodic accounts.

                Their beginning balance for a new reporting
                period is zero.

                Asset, Liability and Equity carry forward.
                ==================================================
                */

                let beginningDebit =
                    0;


                let beginningCredit =
                    0;


                if (
                    group === "asset"
                    ||
                    group === "liability"
                    ||
                    group === "equity"
                ) {

                    const beginningNet =
                        Number(
                            beginning?.net_amount
                            ??
                            0
                        );


                    if (
                        beginningNet >= 0
                    ) {

                        beginningDebit =
                            beginningNet;

                    }
                    else {

                        beginningCredit =
                            Math.abs(
                                beginningNet
                            );

                    }

                }


                /*
                ==================================================
                PERIOD MOVEMENT
                ==================================================
                */

                const movementDebit =
                    Number(
                        movement.debit
                        ||
                        0
                    );


                const movementCredit =
                    Number(
                        movement.credit
                        ||
                        0
                    );


                /*
                ==================================================
                ENDING BALANCE
                ==================================================
                */

                const endingNet =
                    beginningDebit
                    -
                    beginningCredit
                    +
                    movementDebit
                    -
                    movementCredit;


                const endingDebit =
                    endingNet >= 0
                        ? endingNet
                        : 0;


                const endingCredit =
                    endingNet < 0
                        ? Math.abs(
                            endingNet
                        )
                        : 0;


                return {

                    account_id:
                        account.id,

                    account_code:
                        account.account_code,

                    account_name:
                        account.account_name,

                    parent_id:
                        account.parent_id
                        ??
                        null,

                    group:
                        group,

                    beginning_debit:
                        beginningDebit,

                    beginning_credit:
                        beginningCredit,

                    movement_debit:
                        movementDebit,

                    movement_credit:
                        movementCredit,

                    ending_debit:
                        endingDebit,

                    ending_credit:
                        endingCredit

                };

            }
        );


    /*
    ======================================================
    SORT
    ======================================================
    */

    trialBalance.sort(
        (
            a,
            b
        ) =>
            this.compareAccountCode(
                a.account_code,
                b.account_code
            )
    );


    /*
    ======================================================
    TOTALS
    ======================================================
    */

    const totals =
        trialBalance.reduce(
            (
                result,
                account
            ) => {

                result.beginningDebit +=
                    account.beginning_debit;


                result.beginningCredit +=
                    account.beginning_credit;


                result.movementDebit +=
                    account.movement_debit;


                result.movementCredit +=
                    account.movement_credit;


                result.endingDebit +=
                    account.ending_debit;


                result.endingCredit +=
                    account.ending_credit;


                return result;

            },
            {
                beginningDebit:
                    0,

                beginningCredit:
                    0,

                movementDebit:
                    0,

                movementCredit:
                    0,

                endingDebit:
                    0,

                endingCredit:
                    0
            }
        );


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return {

        period: {

            dateFrom:
                dateFrom,

            dateTo:
                dateTo

        },


        rows:
            trialBalance,


        totals:
            totals,


        diagnostics: {

            beginningJournalCount:
                beginningJournals.length,

            beginningDetailCount:
                beginningDetails.length,

            beginningPostingCount:
                beginningPostings.length,

            periodJournalCount:
                periodJournals.length,

            periodDetailCount:
                periodDetails.length,

            periodPostingCount:
                periodPostings.length

        }

    };

}
/*
==========================================================
CALCULATE COMPARATIVE FINANCIAL REPORT
==========================================================
*/

static async calculateComparativeFinancialReport(
    currentDateFrom,
    currentDateTo,
    comparativeDateFrom,
    comparativeDateTo
) {

    /*
    ======================================================
    VALIDATE CURRENT PERIOD
    ======================================================
    */

    if (
        !currentDateFrom
        ||
        !currentDateTo
    ) {

        throw new Error(
            "Financial Report current reporting period is required."
        );

    }


    if (
        String(
            currentDateFrom
        )
        >
        String(
            currentDateTo
        )
    ) {

        throw new Error(
            "Financial Report currentDateFrom cannot be greater than currentDateTo."
        );

    }


    /*
    ======================================================
    VALIDATE COMPARATIVE PERIOD
    ======================================================
    */

    if (
        !comparativeDateFrom
        ||
        !comparativeDateTo
    ) {

        throw new Error(
            "Financial Report comparative period is required."
        );

    }


    if (
        String(
            comparativeDateFrom
        )
        >
        String(
            comparativeDateTo
        )
    ) {

        throw new Error(
            "Financial Report comparativeDateFrom cannot be greater than comparativeDateTo."
        );

    }


    /*
    ======================================================
    CURRENT FINANCIAL REPORT
    ======================================================
    */

    const currentFinancialReport =
        await this.calculatePeriodBalances(
            currentDateFrom,
            currentDateTo
        );


    /*
    ======================================================
    CURRENT TRIAL BALANCE
    ======================================================
    */

    const currentTrialBalance =
        await this.calculateTrialBalance(
            currentDateFrom,
            currentDateTo
        );


    /*
    ======================================================
    COMPARATIVE FINANCIAL REPORT
    ======================================================
    */

    const comparativeFinancialReport =
        await this.calculatePeriodBalances(
            comparativeDateFrom,
            comparativeDateTo
        );


    /*
    ======================================================
    COMPARATIVE TRIAL BALANCE
    ======================================================
    */

    const comparativeTrialBalance =
        await this.calculateTrialBalance(
            comparativeDateFrom,
            comparativeDateTo
        );


    /*
    ======================================================
    BALANCE SHEET CONTROL
    ======================================================
    */

    const currentBalanceSheetBalanced =
        currentFinancialReport
            ?.totals
            ?.isBalanceSheetBalanced
        ===
        true;


    const comparativeBalanceSheetBalanced =
        comparativeFinancialReport
            ?.totals
            ?.isBalanceSheetBalanced
        ===
        true;


    /*
    ======================================================
    TRIAL BALANCE CONTROL
    ======================================================
    */

    const currentTrialBalanceDifference =
        Number(
            currentTrialBalance
                ?.totals
                ?.endingDebit
            ??
            0
        )
        -
        Number(
            currentTrialBalance
                ?.totals
                ?.endingCredit
            ??
            0
        );


    const comparativeTrialBalanceDifference =
        Number(
            comparativeTrialBalance
                ?.totals
                ?.endingDebit
            ??
            0
        )
        -
        Number(
            comparativeTrialBalance
                ?.totals
                ?.endingCredit
            ??
            0
        );


    const currentTrialBalanceBalanced =
        Math.abs(
            currentTrialBalanceDifference
        )
        <
        0.01;


    const comparativeTrialBalanceBalanced =
        Math.abs(
            comparativeTrialBalanceDifference
        )
        <
        0.01;


    /*
    ======================================================
    RETURN COMPARATIVE REPORT
    ======================================================
    */

    return {

        current: {

            period: {

                dateFrom:
                    currentDateFrom,

                dateTo:
                    currentDateTo

            },


            financialReport:
                currentFinancialReport,


            trialBalance:
                currentTrialBalance

        },


        comparative: {

            period: {

                dateFrom:
                    comparativeDateFrom,

                dateTo:
                    comparativeDateTo

            },


            financialReport:
                comparativeFinancialReport,


            trialBalance:
                comparativeTrialBalance

        },


        controls: {

            current: {

                balanceSheetBalanced:
                    currentBalanceSheetBalanced,

                trialBalanceBalanced:
                    currentTrialBalanceBalanced,

                trialBalanceDifference:
                    currentTrialBalanceDifference

            },


            comparative: {

                balanceSheetBalanced:
                    comparativeBalanceSheetBalanced,

                trialBalanceBalanced:
                    comparativeTrialBalanceBalanced,

                trialBalanceDifference:
                    comparativeTrialBalanceDifference

            }

        }

    };

}
/*
==========================================================
MAP COMPARATIVE ACCOUNTS
==========================================================
*/

static mapComparativeAccounts(
    currentRows = [],
    comparativeRows = []
) {

    /*
    ======================================================
    VALIDATE INPUT
    ======================================================
    */

    if (
        !Array.isArray(
            currentRows
        )
    ) {

        throw new Error(
            "Financial Report current rows must be an array."
        );

    }


    if (
        !Array.isArray(
            comparativeRows
        )
    ) {

        throw new Error(
            "Financial Report comparative rows must be an array."
        );

    }


    /*
    ======================================================
    CURRENT MAP
    ======================================================
    */

    const currentMap =
        new Map();


    currentRows.forEach(
        row => {

            const accountId =
                row?.account_id
                ??
                row?.id;


            if (
                accountId === null
                ||
                accountId === undefined
                ||
                accountId === ""
            ) {

                return;

            }


            currentMap.set(
                String(
                    accountId
                ),
                row
            );

        }
    );


    /*
    ======================================================
    COMPARATIVE MAP
    ======================================================
    */

    const comparativeMap =
        new Map();


    comparativeRows.forEach(
        row => {

            const accountId =
                row?.account_id
                ??
                row?.id;


            if (
                accountId === null
                ||
                accountId === undefined
                ||
                accountId === ""
            ) {

                return;

            }


            comparativeMap.set(
                String(
                    accountId
                ),
                row
            );

        }
    );


    /*
    ======================================================
    ALL ACCOUNT IDS

    Use union so an account still appears when it has
    data in only one of the two periods.
    ======================================================
    */

    const accountIds =
        new Set(
            [
                ...currentMap.keys(),
                ...comparativeMap.keys()
            ]
        );


    /*
    ======================================================
    BUILD COMPARATIVE ROWS
    ======================================================
    */

    const rows =
        [];


    accountIds.forEach(
        accountId => {

            const current =
                currentMap.get(
                    accountId
                )
                ??
                null;


            const comparative =
                comparativeMap.get(
                    accountId
                )
                ??
                null;


            const source =
                current
                ??
                comparative;


            if (
                !source
            ) {

                return;

            }


            const currentAmount =
                Number(
                    current?.balance
                    ??
                    0
                )
                ||
                0;


            const comparativeAmount =
                Number(
                    comparative?.balance
                    ??
                    0
                )
                ||
                0;


            const variance =
                currentAmount
                -
                comparativeAmount;


            let variancePercent =
                null;


            if (
                comparativeAmount !== 0
            ) {

                variancePercent =
                    (
                        variance
                        /
                        Math.abs(
                            comparativeAmount
                        )
                    )
                    *
                    100;

            }


            rows.push({

                account_id:
                    source.account_id
                    ??
                    source.id,

                account_code:
                    source.account_code
                    ??
                    "",

                account_name:
                    source.account_name
                    ??
                    "",

                parent_id:
                    source.parent_id
                    ??
                    null,

                group:
                    source.group
                    ??
                    null,

                allow_transaction:
                    source.allow_transaction,

                status:
                    source.status,


                /*
                ==============================================
                CURRENT
                ==============================================
                */

                current_amount:
                    currentAmount,


                /*
                ==============================================
                COMPARATIVE
                ==============================================
                */

                comparative_amount:
                    comparativeAmount,


                /*
                ==============================================
                VARIANCE
                ==============================================
                */

                variance:
                    variance,

                variance_percent:
                    variancePercent

            });

        }
    );


    /*
    ======================================================
    SORT BY ACCOUNT CODE
    ======================================================
    */

    rows.sort(
        (
            a,
            b
        ) =>
            this.compareAccountCode(
                a.account_code,
                b.account_code
            )
    );


    return rows;

}
/*
==========================================================
BUILD FINANCIAL STATEMENT DATASET
==========================================================
*/

static async buildFinancialStatementDataset(
    currentDateFrom,
    currentDateTo,
    comparativeDateFrom,
    comparativeDateTo
) {

    /*
    ======================================================
    LOAD COMPARATIVE FINANCIAL REPORT
    ======================================================
    */

    const report =
        await this.calculateComparativeFinancialReport(
            currentDateFrom,
            currentDateTo,
            comparativeDateFrom,
            comparativeDateTo
        );


    /*
    ======================================================
    BALANCE SHEET COMPARATIVE ROWS
    ======================================================
    */

    const balanceSheet =
        this.mapComparativeAccounts(
            report.current
                .financialReport
                .balanceSheet,

            report.comparative
                .financialReport
                .balanceSheet
        );


    /*
    ======================================================
    PROFIT & LOSS COMPARATIVE ROWS
    ======================================================
    */

    const profitLoss =
        this.mapComparativeAccounts(
            report.current
                .financialReport
                .profitLoss,

            report.comparative
                .financialReport
                .profitLoss
        );


    /*
    ======================================================
    TRIAL BALANCE

    Trial Balance keeps its debit / credit structure.
    Current and comparative periods are kept separately
    because Trial Balance is not a single amount report.
    ======================================================
    */

    const trialBalance = {

        current:
            report.current
                .trialBalance,

        comparative:
            report.comparative
                .trialBalance

    };


    /*
    ======================================================
    CURRENT TOTALS
    ======================================================
    */

    const currentTotals =
        report.current
            .financialReport
            .totals;


    /*
    ======================================================
    COMPARATIVE TOTALS
    ======================================================
    */

    const comparativeTotals =
        report.comparative
            .financialReport
            .totals;


    /*
    ======================================================
    VARIANCE HELPER
    ======================================================
    */

    const buildVariance =
        (
            currentAmount,
            comparativeAmount
        ) => {

            const current =
                Number(
                    currentAmount
                    ??
                    0
                )
                ||
                0;


            const comparative =
                Number(
                    comparativeAmount
                    ??
                    0
                )
                ||
                0;


            const variance =
                current
                -
                comparative;


            const variancePercent =
                comparative !== 0
                    ? (
                        variance
                        /
                        Math.abs(
                            comparative
                        )
                    )
                    *
                    100
                    : null;


            return {

                current:
                    current,

                comparative:
                    comparative,

                variance:
                    variance,

                variance_percent:
                    variancePercent

            };

        };


    /*
    ======================================================
    FINANCIAL STATEMENT TOTALS
    ======================================================
    */

    const totals = {

        balanceSheet: {

            asset:
                buildVariance(
                    currentTotals.asset,
                    comparativeTotals.asset
                ),

            liability:
                buildVariance(
                    currentTotals.liability,
                    comparativeTotals.liability
                ),

            equity:
                buildVariance(
                    currentTotals.equity,
                    comparativeTotals.equity
                ),

            currentYearProfit:
                buildVariance(
                    currentTotals.currentYearProfit,
                    comparativeTotals.currentYearProfit
                ),

            equityIncludingProfit:
                buildVariance(
                    currentTotals.equityIncludingProfit,
                    comparativeTotals.equityIncludingProfit
                ),

            liabilityAndEquity:
                buildVariance(
                    currentTotals.liabilityAndEquity,
                    comparativeTotals.liabilityAndEquity
                )

        },


        profitLoss: {

            revenue:
                buildVariance(
                    currentTotals.revenue,
                    comparativeTotals.revenue
                ),

            expense:
                buildVariance(
                    currentTotals.expense,
                    comparativeTotals.expense
                ),

            netProfit:
                buildVariance(
                    currentTotals.netProfit,
                    comparativeTotals.netProfit
                )

        }

    };


    /*
    ======================================================
    DATASET CONTROLS
    ======================================================
    */

    const controls = {

        current: {

            balanceSheetBalanced:
                report.controls
                    .current
                    .balanceSheetBalanced,

            trialBalanceBalanced:
                report.controls
                    .current
                    .trialBalanceBalanced,

            trialBalanceDifference:
                report.controls
                    .current
                    .trialBalanceDifference

        },


        comparative: {

            balanceSheetBalanced:
                report.controls
                    .comparative
                    .balanceSheetBalanced,

            trialBalanceBalanced:
                report.controls
                    .comparative
                    .trialBalanceBalanced,

            trialBalanceDifference:
                report.controls
                    .comparative
                    .trialBalanceDifference

        }

    };



    /*
    ======================================================
    ADDITIONAL COMPLETE FINANCIAL STATEMENT COMPONENTS
    ======================================================
    */

    const changesInEquityCurrent =
        await this.calculateChangesInEquity(
            currentDateFrom,
            currentDateTo
        );

    const changesInEquityComparative =
        await this.calculateChangesInEquity(
            comparativeDateFrom,
            comparativeDateTo
        );

    const cashFlowCurrent =
        await this.calculateCashFlow(
            currentDateFrom,
            currentDateTo
        );

    const cashFlowComparative =
        await this.calculateCashFlow(
            comparativeDateFrom,
            comparativeDateTo
        );


    /*
    ======================================================
    FINAL DATASET
    ======================================================
    */

    return {

        periods: {

            current: {

                dateFrom:
                    currentDateFrom,

                dateTo:
                    currentDateTo

            },

            comparative: {

                dateFrom:
                    comparativeDateFrom,

                dateTo:
                    comparativeDateTo

            }

        },


        balanceSheet:
            balanceSheet,


        profitLoss:
            profitLoss,


        trialBalance:
            trialBalance,


        changesInEquity: {
            current:
                changesInEquityCurrent,
            comparative:
                changesInEquityComparative
        },


        cashFlow: {
            current:
                cashFlowCurrent,
            comparative:
                cashFlowComparative
        },


        notes: {
            presentationCurrency:
                "IDR",
            source:
                "Posted GL only",
            requiresEntityDisclosures:
                true
        },


        totals:
            totals,


        controls:
            controls

    };

}
}