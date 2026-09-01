/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : TRIAL BALANCE YEAR
FILE    : trial-balance-year.js
VERSION : 2.1.0 FINAL
==========================================================
*/

import {
    supabase
} from "../../assets/js/core/supabase.js";


export class TrialBalanceYear {


    /*
    ==========================================================
    CONSTRUCTOR
    ==========================================================
    */

    constructor() {

        /*
        ======================================================
        MASTER DATA
        ======================================================
        */

        this.accounts = [];


        /*
        ======================================================
        GL DATA
        ======================================================
        */

        this.journals = [];

        this.details = [];

        this.postings = [];


        /*
        ======================================================
        REPORT DATA
        ======================================================
        */

        this.data = [];

        this.filteredData = [];


        /*
        ======================================================
        PAGINATION
        ======================================================
        */

        this.currentPage = 1;

        this.pageSize = 30;

        this.totalPages = 1;

        this.totalRows = 0;


        /*
        ======================================================
        MONTH
        ======================================================
        */

        this.monthNames = [

            "Jan",

            "Feb",

            "Mar",

            "Apr",

            "May",

            "Jun",

            "Jul",

            "Aug",

            "Sep",

            "Oct",

            "Nov",

            "Dec"

        ];


        /*
        ======================================================
        INITIALIZE
        ======================================================
        */

        this.initialize();

    }


    /*
    ==========================================================
    INITIALIZE
    ==========================================================
    */

    async initialize() {

        try {

            window.App?.showLoading?.();


            /*
            ==================================================
            CACHE DOM
            ==================================================
            */

            this.cacheDom();


            /*
            ==================================================
            INITIAL FILTER
            ==================================================
            */

            this.initializeYearOptions();

            this.updateMonthHeaders();


            /*
            ==================================================
            EVENTS
            ==================================================
            */

            this.bindEvents();


            /*
            ==================================================
            MASTER DATA
            ==================================================
            */

            await this.loadAccounts();


            /*
            ==================================================
            REPORT
            ==================================================
            */

            await this.loadData(
                false
            );


            console.log(
                "Trial Balance Year Initialized"
            );

        }

        catch (
            error
        ) {

            console.error(
                "TrialBalanceYear.initialize:",
                error
            );


            this.showError(

                error?.message
                ||
                "Failed to initialize Trial Balance Year."

            );

        }

        finally {

            window.App?.hideLoading?.();

        }

    }


    /*
    ==========================================================
    CACHE DOM
    ==========================================================
    */

    cacheDom() {

        /*
        ======================================================
        FILTER
        ======================================================
        */

        this.filterYear =
            document.getElementById(
                "trial-balance-year"
            );


        this.filterAccount =
            document.getElementById(
                "trial-balance-account"
            );


        this.filterKeyword =
            document.getElementById(
                "trial-balance-keyword"
            );


        this.btnFind =
            document.getElementById(
                "btn-find-trial-balance"
            );


        /*
        ======================================================
        HEADER BUTTON
        ======================================================
        */

        this.btnDownload =
            document.getElementById(
                "btn-download-excel-trial-balance"
            );


        this.btnPreview =
            document.getElementById(
                "btn-preview-html-trial-balance"
            );


        this.btnRefresh =
            document.getElementById(
                "btn-refresh-trial-balance"
            );


        /*
        ======================================================
        TABLE
        ======================================================
        */

        this.tableBody =
            document.getElementById(
                "trial-balance-tbody"
            );


        /*
        ======================================================
        MONTH HEADER
        ======================================================
        */

        this.monthHeaders = [];


        for (
            let month = 1;
            month <= 12;
            month++
        ) {

            this.monthHeaders.push(

                document.getElementById(
                    `tb-month-header-${month}`
                )

            );

        }


        /*
        ======================================================
        TOTAL
        ======================================================
        */

        this.totalBeginning =
            document.getElementById(
                "tb-total-beginning"
            );


        this.totalMonths = [];


        for (
            let month = 1;
            month <= 12;
            month++
        ) {

            this.totalMonths.push(

                document.getElementById(
                    `tb-total-month-${month}`
                )

            );

        }


        /*
        ======================================================
        PAGINATION
        ======================================================
        */

        this.btnFirst =
            document.getElementById(
                "trial-balance-page-first"
            );


        this.btnPrev =
            document.getElementById(
                "trial-balance-page-prev"
            );


        this.btnNext =
            document.getElementById(
                "trial-balance-page-next"
            );


        this.btnLast =
            document.getElementById(
                "trial-balance-page-last"
            );


        this.currentPageInput =
            document.getElementById(
                "trial-balance-current-page"
            );


        this.totalPagesLabel =
            document.getElementById(
                "trial-balance-total-pages"
            );


        this.recordInfo =
            document.getElementById(
                "trial-balance-record-info"
            );

    }


    /*
    ==========================================================
    INITIALIZE YEAR
    ==========================================================
    */

    initializeYearOptions() {

        if (
            !this.filterYear
        ) {

            return;

        }


        const currentYear =
            new Date()
                .getFullYear();


        this.filterYear.innerHTML =
            "";


        /*
        ======================================================
        YEAR RANGE

        Current + 2
        Current - 10
        ======================================================
        */

        for (
            let year = currentYear + 2;
            year >= currentYear - 10;
            year--
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(
                    year
                );


            option.textContent =
                String(
                    year
                );


            if (
                year === currentYear
            ) {

                option.selected =
                    true;

            }


            this.filterYear.appendChild(
                option
            );

        }

    }


   /*
==========================================================
GET CURRENT REPORT MONTH
==========================================================
*/

getCurrentReportMonth(
    year
) {

    const today =
        new Date();


    const currentYear =
        today.getFullYear();


    const currentMonth =
        today.getMonth() + 1;


    /*
    ======================================================
    PAST YEAR

    Full year.
    ======================================================
    */

    if (
        year < currentYear
    ) {

        return 12;

    }


    /*
    ======================================================
    FUTURE YEAR
    ======================================================
    */

    if (
        year > currentYear
    ) {

        return 0;

    }


    /*
    ======================================================
    CURRENT YEAR

    REALTIME CURRENT MONTH

    Example:

    September 2026
    =
    September = 9
    ======================================================
    */

    return currentMonth;

}

    /*
==========================================================
UPDATE MONTH HEADERS
==========================================================
*/

updateMonthHeaders() {

    const year =
        Number(

            this.filterYear?.value

            ||

            new Date()
                .getFullYear()

        );


    const shortYear =
        String(
            year
        )
        .slice(
            -2
        );


    const currentReportMonth =
        this.getCurrentReportMonth(
            year
        );


    this.monthHeaders.forEach(

        (
            element,
            index
        ) => {

            if (
                !element
            ) {

                return;

            }


            const monthNumber =
                index + 1;


            /*
            ==================================================
            HEADER TEXT
            ==================================================
            */

            element.textContent =
                `${
                    this.monthNames[
                        index
                    ]
                }-${shortYear}`;


            /*
            ==================================================
            ALWAYS SHOW JAN - DEC
            ==================================================
            */

            element.style.display =
                "";


            /*
            ==================================================
            FUTURE PERIOD CLASS

            Future column stays visible.

            Example September:
            Oct - Dec = future.
            ==================================================
            */

            element.classList.toggle(

                "tb-future-period-header",

                monthNumber
                >
                currentReportMonth

            );

        }

    );

}

    /*
    ==========================================================
    BIND EVENTS
    ==========================================================
    */

    bindEvents() {

        /*
        ======================================================
        YEAR
        ======================================================
        */

        this.filterYear?.addEventListener(

            "change",

            async () => {

                this.updateMonthHeaders();

                await this.loadData();

            }

        );


        /*
        ======================================================
        ACCOUNT
        ======================================================
        */

        this.filterAccount?.addEventListener(

            "change",

            () => {

                this.applyFilter();

            }

        );


        /*
        ======================================================
        FIND
        ======================================================
        */

        this.btnFind?.addEventListener(

            "click",

            event => {

                event.preventDefault();

                this.applyFilter();

            }

        );


        /*
        ======================================================
        KEYWORD ENTER
        ======================================================
        */

        this.filterKeyword?.addEventListener(

            "keydown",

            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    this.applyFilter();

                }

            }

        );


        /*
        ======================================================
        REFRESH
        ======================================================
        */

        this.btnRefresh?.addEventListener(

            "click",

            async event => {

                event.preventDefault();

                await this.resetAndReload();

            }

        );


        /*
        ======================================================
        DOWNLOAD EXCEL
        ======================================================
        */

        this.btnDownload?.addEventListener(

            "click",

            event => {

                event.preventDefault();

                this.downloadExcel();

            }

        );


        /*
        ======================================================
        PREVIEW
        ======================================================
        */

        this.btnPreview?.addEventListener(

            "click",

            event => {

                event.preventDefault();

                this.previewHTML();

            }

        );


        /*
        ======================================================
        FIRST PAGE
        ======================================================
        */

        this.btnFirst?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    1
                );

            }

        );


        /*
        ======================================================
        PREVIOUS PAGE
        ======================================================
        */

        this.btnPrev?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    this.currentPage - 1
                );

            }

        );


        /*
        ======================================================
        NEXT PAGE
        ======================================================
        */

        this.btnNext?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    this.currentPage + 1
                );

            }

        );


        /*
        ======================================================
        LAST PAGE
        ======================================================
        */

        this.btnLast?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    this.totalPages
                );

            }

        );


        /*
        ======================================================
        CURRENT PAGE INPUT
        ======================================================
        */

        this.currentPageInput?.addEventListener(

            "change",

            () => {

                this.goToPage(

                    Number(
                        this.currentPageInput.value
                        ||
                        1
                    )

                );

            }

        );

    }


    /*
    ==========================================================
    LOAD CHART OF ACCOUNTS
    ==========================================================
    */

    async loadAccounts() {

        try {

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
                        ascending: true
                    }
                );


            if (
                error
            ) {

                throw error;

            }


            this.accounts =
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
            ==================================================
            SORT BY ACCOUNT CODE
            ==================================================
            */

            this.accounts.sort(

                (
                    a,
                    b
                ) => {

                    return this.compareAccountCode(

                        a.account_code,

                        b.account_code

                    );

                }

            );


            /*
            ==================================================
            ACCOUNT FILTER
            ==================================================
            */

            this.populateAccountFilter();

        }

        catch (
            error
        ) {

            console.error(
                "TrialBalanceYear.loadAccounts:",
                error
            );


            throw error;

        }

    }


    /*
    ==========================================================
    NORMALIZE ACCOUNT
    ==========================================================
    */

    normalizeAccount(
        account
    ) {

        /*
        ======================================================
        SUPPORT POSSIBLE PARENT FIELD
        ======================================================
        */

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
RESOLVE ACCOUNT GROUP
==========================================================
*/

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

    1 = Asset
    2 = Liability
    3 = Equity
    4 = Revenue
    5 / 6 / 7 = Expense / Other / Tax
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
    ) {

        return "expense";

    }


    return null;

}


    /*
    ==========================================================
    POPULATE ACCOUNT FILTER
    ==========================================================
    */

    populateAccountFilter() {

        if (
            !this.filterAccount
        ) {

            return;

        }


        const previous =
            this.filterAccount.value
            ||
            "";


        this.filterAccount.innerHTML = `

            <option value="">

                Show All Accounts

            </option>

        `;


        this.accounts.forEach(

            account => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(
                        account.id
                    );


                option.textContent =

                    `${
                        account.account_code
                        ||
                        ""
                    } :: ${
                        account.account_name
                        ||
                        ""
                    }`;


                this.filterAccount.appendChild(
                    option
                );

            }

        );


        if (
            previous
        ) {

            this.filterAccount.value =
                previous;

        }

    }


    /*
    ==========================================================
    LOAD DATA
    ==========================================================
    */

    async loadData(
        showLoading = true
    ) {

        try {

            if (
                showLoading
            ) {

                window.App?.showLoading?.();

            }


            /*
            ==================================================
            TABLE LOADING
            ==================================================
            */

            this.showTableLoading();


            /*
            ==================================================
            SELECTED YEAR
            ==================================================
            */

            const year =
                Number(

                    this.filterYear?.value

                    ||

                    new Date()
                        .getFullYear()

                );


            /*
            ==================================================
            LAST DATE OF SELECTED YEAR
            ==================================================
            */

            const endDate =
                `${year}-12-31`;


            /*
            ==================================================
            LOAD POSTED JOURNAL HEADER

            DRAFT / VOID EXCLUDED
            ==================================================
            */

            const {

                data:
                    journalRows,

                error:
                    journalError

            } = await supabase

                .from(
                    "trx_gl_journal"
                )

                .select("*")

                .eq(
                    "status",
                    "Posted"
                )

                .lte(
                    "journal_date",
                    endDate
                )

                .order(
                    "journal_date",
                    {
                        ascending: true
                    }
                );


            if (
                journalError
            ) {

                throw journalError;

            }


            this.journals =
                Array.isArray(
                    journalRows
                )
                    ? journalRows
                    : [];


            /*
            ==================================================
            NO JOURNAL
            ==================================================
            */

            if (
                !this.journals.length
            ) {

                this.details = [];

                this.postings = [];


                this.data =
                    this.buildTrialBalance(
                        year
                    );


                this.applyFilter();

                return;

            }


            /*
            ==================================================
            JOURNAL IDS
            ==================================================
            */

            const journalIds =
                this.journals

                    .map(
                        journal =>
                            journal.id
                    )

                    .filter(

                        id =>
                            id !== null
                            &&
                            id !== undefined

                    );


            /*
            ==================================================
            LOAD DETAIL USING CHUNK

            Avoid Supabase .in() getting too large.
            ==================================================
            */

            this.details =
                await this.loadJournalDetails(
                    journalIds
                );


            /*
            ==================================================
            NORMALIZE POSTINGS
            ==================================================
            */

            this.postings =
                this.normalizePostings(
                    this.details
                );


            /*
            ==================================================
            BUILD REPORT
            ==================================================
            */

            this.data =
                this.buildTrialBalance(
                    year
                );


            /*
            ==================================================
            APPLY FILTER
            ==================================================
            */

            this.applyFilter();


            console.log(
                "TRIAL BALANCE YEAR:",
                year
            );


            console.log(
                "CURRENT REPORT MONTH:",
                this.getCurrentReportMonth(
                    year
                )
            );


            console.log(
                "POSTED JOURNALS:",
                this.journals.length
            );


            console.log(
                "GL DETAILS:",
                this.details.length
            );


            console.log(
                "NORMALIZED POSTINGS:",
                this.postings.length
            );

        }

        catch (
            error
        ) {

            console.error(
                "TrialBalanceYear.loadData:",
                error
            );


            this.journals = [];

            this.details = [];

            this.postings = [];

            this.data = [];

            this.filteredData = [];


            this.refreshView();


            this.showError(

                error?.message
                ||
                "Failed to load Trial Balance Year."

            );

        }

        finally {

            if (
                showLoading
            ) {

                window.App?.hideLoading?.();

            }

        }

    }


    /*
    ==========================================================
    LOAD JOURNAL DETAILS
    ==========================================================
    */

    async loadJournalDetails(
        journalIds
    ) {

        if (
            !Array.isArray(
                journalIds
            )
            ||
            !journalIds.length
        ) {

            return [];

        }


        const result = [];


        /*
        ======================================================
        CHUNK SIZE
        ======================================================
        */

        const chunkSize = 200;


        for (
            let index = 0;
            index < journalIds.length;
            index += chunkSize
        ) {

            const chunk =
                journalIds.slice(

                    index,

                    index + chunkSize

                );


            const {

                data,

                error

            } = await supabase

                .from(
                    "trx_gl_journal_detail"
                )

                .select("*")

                .in(
                    "journal_id",
                    chunk
                );


            if (
                error
            ) {

                throw error;

            }


            if (
                Array.isArray(
                    data
                )
            ) {

                result.push(
                    ...data
                );

            }

        }


        return result;

    }


    /*
    ==========================================================
    NORMALIZE GL POSTINGS
    ==========================================================
    */

    normalizePostings(
        details
    ) {

        const result = [];


        (
            details
            ||
            []
        )
        .forEach(

            detail => {

                /*
                ==================================================
                JOURNAL ID
                ==================================================
                */

                const journalId =

                    detail?.journal_id

                    ??

                    detail?.gl_journal_id

                    ??

                    detail?.header_id

                    ??

                    null;


                if (
                    journalId === null
                    ||
                    journalId === undefined
                ) {

                    return;

                }


                /*
                ==================================================
                FINOVA CURRENT STRUCTURE

                account_id
                debit
                credit
                ==================================================
                */

                if (
                    detail?.account_id !== null
                    &&
                    detail?.account_id !== undefined
                ) {

                    result.push({

                        journal_id:
                            journalId,

                        account_id:
                            detail.account_id,

                        debit:
                            this.toNumber(
                                detail.debit
                            ),

                        credit:
                            this.toNumber(
                                detail.credit
                            )

                    });


                    return;

                }


                /*
                ==================================================
                LEGACY / MERGED DETAIL COMPATIBILITY

                debit_account_id
                credit_account_id
                amount
                ==================================================
                */

                const amount =
                    this.toNumber(
                        detail?.amount
                    );


                /*
                ==================================================
                DEBIT ACCOUNT
                ==================================================
                */

                if (
                    detail?.debit_account_id !== null
                    &&
                    detail?.debit_account_id !== undefined
                ) {

                    result.push({

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


                /*
                ==================================================
                CREDIT ACCOUNT
                ==================================================
                */

                if (
                    detail?.credit_account_id !== null
                    &&
                    detail?.credit_account_id !== undefined
                ) {

                    result.push({

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

            }

        );


        return result;

    }


    /*
==========================================================
BUILD TRIAL BALANCE YEAR
==========================================================
*/

buildTrialBalance(
    year
) {

    /*
    ======================================================
    CURRENT REPORT MONTH
    ======================================================
    */

    const currentReportMonth =
        this.getCurrentReportMonth(
            year
        );


    /*
    ======================================================
    ACCOUNT MAP
    ======================================================
    */

    const accountMap =
        new Map();


    this.accounts.forEach(

        account => {

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
    JOURNAL MAP
    ======================================================
    */

    const journalMap =
        new Map();


    this.journals.forEach(

        journal => {

            journalMap.set(

                String(
                    journal.id
                ),

                journal

            );

        }

    );


    /*
    ======================================================
    DIRECT BALANCE MAP
    ======================================================
    */

    const directMap =
        new Map();


    this.accounts.forEach(

        account => {

            const group =
                this.resolveAccountGroup(

                    account,

                    accountMap

                );


            directMap.set(

                String(
                    account.id
                ),

                {

                    beginning:
                        0,

                    movements:
                        new Array(
                            12
                        )
                        .fill(
                            0
                        ),

                    group

                }

            );

        }

    );


    /*
    ======================================================
    CALCULATE DIRECT ACCOUNT MOVEMENT
    ======================================================
    */

    this.postings.forEach(

        posting => {

            const journal =
                journalMap.get(

                    String(
                        posting.journal_id
                    )

                );


            if (
                !journal
            ) {

                return;

            }


            /*
            ==================================================
            JOURNAL DATE
            ==================================================
            */

            const journalDate =
                String(

                    journal?.journal_date

                    ??

                    journal?.accounting_date

                    ??

                    ""

                )
                .slice(
                    0,
                    10
                );


            if (
                !journalDate
            ) {

                return;

            }


            const postingYear =
                Number(

                    journalDate.slice(
                        0,
                        4
                    )

                );


            const postingMonth =
                Number(

                    journalDate.slice(
                        5,
                        7
                    )

                );


            const accountKey =
                String(
                    posting.account_id
                );


            const account =
                accountMap.get(
                    accountKey
                );


            /*
            ==================================================
            UNKNOWN ACCOUNT
            ==================================================
            */

            if (
                !directMap.has(
                    accountKey
                )
            ) {

                directMap.set(

                    accountKey,

                    {

                        beginning:
                            0,

                        movements:
                            new Array(
                                12
                            )
                            .fill(
                                0
                            ),

                        group:
                            null

                    }

                );

            }


            const balance =
                directMap.get(
                    accountKey
                );


            /*
            ==================================================
            ACCOUNT GROUP
            ==================================================
            */

            const group =
                balance.group

                ||

                this.resolveAccountGroup(

                    account,

                    accountMap

                );


            balance.group =
                group;


            /*
            ==================================================
            RAW DEBIT / CREDIT
            ==================================================
            */

            const debit =
                this.toNumber(
                    posting.debit
                );


            const credit =
                this.toNumber(
                    posting.credit
                );


            /*
            ==================================================
            PRESENTATION AMOUNT

            Asset
            =
            Debit - Credit

            Expense
            =
            Debit - Credit

            Liability
            =
            Credit - Debit

            Equity
            =
            Credit - Debit

            Revenue
            =
            Credit - Debit
            ==================================================
            */

            let movement;


            if (
                group === "liability"
                ||
                group === "equity"
                ||
                group === "revenue"
            ) {

                movement =
                    credit
                    -
                    debit;

            }

            else {

                movement =
                    debit
                    -
                    credit;

            }


            /*
            ==================================================
            BEGINNING YEAR

            Permanent account:
            Asset
            Liability
            Equity

            carry opening balance.

            Revenue / Expense:
            opening = 0
            ==================================================
            */

            if (
                postingYear < year
            ) {

                if (
                    group !== "revenue"
                    &&
                    group !== "expense"
                ) {

                    balance.beginning +=
                        movement;

                }


                return;

            }


            /*
            ==================================================
            SELECTED YEAR
            ==================================================
            */

            if (
                postingYear === year
                &&
                postingMonth >= 1
                &&
                postingMonth <= 12
            ) {

                balance.movements[
                    postingMonth - 1
                ] +=
                    movement;

            }

        }

    );


    /*
    ======================================================
    REPORT MAP
    ======================================================
    */

    const reportMap =
        new Map();


    /*
    ======================================================
    CREATE ACCOUNT ROWS
    ======================================================
    */

    this.accounts.forEach(

        account => {

            const accountKey =
                String(
                    account.id
                );


            const directBalance =
                directMap.get(
                    accountKey
                )
                ||
                {

                    beginning:
                        0,

                    movements:
                        new Array(
                            12
                        )
                        .fill(
                            0
                        ),

                    group:
                        this.resolveAccountGroup(

                            account,

                            accountMap

                        )

                };


            const group =
                directBalance.group

                ||

                this.resolveAccountGroup(

                    account,

                    accountMap

                );


            const isPeriodic =
                group === "revenue"
                ||
                group === "expense";


            /*
            ==================================================
            MONTH VALUES
            ==================================================
            */

            const months =
                this.buildMonthlyBalances(

                    directBalance.beginning,

                    directBalance.movements,

                    currentReportMonth,

                    isPeriodic

                );


            reportMap.set(

                accountKey,

                {

                    id:
                        account.id,

                    account_code:
                        account.account_code,

                    account_name:
                        account.account_name,

                    parent_id:
                        account.parent_id,

                    allow_transaction:
                        account.allow_transaction,

                    status:
                        account.status,

                    group,

                    is_periodic:
                        isPeriodic,

                    beginning:
                        isPeriodic

                            ? 0

                            : this.cleanNumber(
                                directBalance.beginning
                            ),

                    movements:
                        [
                            ...directBalance.movements
                        ],

                    months,

                    level:
                        0,

                    has_children:
                        false,

                    is_root:
                        false,

                    is_calculated:
                        false

                }

            );

        }

    );


    /*
    ======================================================
    UNKNOWN ACCOUNTS
    ======================================================
    */

    directMap.forEach(

        (
            directBalance,
            key
        ) => {

            if (
                reportMap.has(
                    key
                )
            ) {

                return;

            }


            const isPeriodic =
                directBalance.group === "revenue"
                ||
                directBalance.group === "expense";


            reportMap.set(

                key,

                {

                    id:
                        key,

                    account_code:
                        key,

                    account_name:
                        "Unknown Account",

                    parent_id:
                        null,

                    allow_transaction:
                        true,

                    status:
                        true,

                    group:
                        directBalance.group,

                    is_periodic:
                        isPeriodic,

                    beginning:
                        isPeriodic

                            ? 0

                            : this.cleanNumber(
                                directBalance.beginning
                            ),

                    movements:
                        [
                            ...directBalance.movements
                        ],

                    months:
                        this.buildMonthlyBalances(

                            directBalance.beginning,

                            directBalance.movements,

                            currentReportMonth,

                            isPeriodic

                        ),

                    level:
                        0,

                    has_children:
                        false,

                    is_root:
                        true,

                    is_calculated:
                        false

                }

            );

        }

    );


    /*
    ======================================================
    CHILD LOOKUP
    ======================================================
    */

    const childrenMap =
        new Map();


    reportMap.forEach(

        row => {

            if (
                row.parent_id === null
                ||
                row.parent_id === undefined
                ||
                row.parent_id === ""
            ) {

                return;

            }


            const parentKey =
                String(
                    row.parent_id
                );


            if (
                !childrenMap.has(
                    parentKey
                )
            ) {

                childrenMap.set(
                    parentKey,
                    []
                );

            }


            childrenMap
                .get(
                    parentKey
                )
                .push(
                    row
                );

        }

    );


    /*
    ======================================================
    SORT CHILDREN
    ======================================================
    */

    childrenMap.forEach(

        children => {

            children.sort(

                (
                    a,
                    b
                ) => {

                    return this.compareAccountCode(

                        a.account_code,

                        b.account_code

                    );

                }

            );

        }

    );


    /*
    ======================================================
    RECURSIVE AGGREGATION
    ======================================================
    */

    const aggregateAccount =
        (
            row,
            visited = new Set()
        ) => {

            const key =
                String(
                    row.id
                );


            /*
            ==================================================
            CIRCULAR PROTECTION
            ==================================================
            */

            if (
                visited.has(
                    key
                )
            ) {

                return {

                    beginning:
                        row.beginning,

                    movements:
                        [
                            ...row.movements
                        ]

                };

            }


            const nextVisited =
                new Set(
                    visited
                );


            nextVisited.add(
                key
            );


            const children =
                childrenMap.get(
                    key
                )
                ||
                [];


            row.has_children =
                children.length > 0;


            /*
            ==================================================
            DIRECT VALUE
            ==================================================
            */

            let beginning =
                row.is_periodic

                    ? 0

                    : this.toNumber(
                        row.beginning
                    );


            const movements =
                [
                    ...row.movements
                ]
                .map(

                    value =>
                        this.toNumber(
                            value
                        )

                );


            /*
            ==================================================
            ADD DESCENDANTS
            ==================================================
            */

            children.forEach(

                child => {

                    const childValue =
                        aggregateAccount(

                            child,

                            nextVisited

                        );


                    /*
                    ==============================================
                    BEGINNING BALANCE

                    Periodic account does not carry opening.
                    ==============================================
                    */

                    if (
                        !row.is_periodic
                    ) {

                        beginning +=
                            this.toNumber(
                                childValue.beginning
                            );

                    }


                    /*
                    ==============================================
                    MONTH MOVEMENT
                    ==============================================
                    */

                    for (
                        let month = 0;
                        month < 12;
                        month++
                    ) {

                        movements[
                            month
                        ] +=

                            this.toNumber(

                                childValue.movements[
                                    month
                                ]

                            );

                    }

                }

            );


            /*
            ==================================================
            CLEAN BEGINNING
            ==================================================
            */

            row.beginning =
                row.is_periodic

                    ? 0

                    : this.cleanNumber(
                        beginning
                    );


            /*
            ==================================================
            CLEAN MOVEMENT
            ==================================================
            */

            row.movements =
                movements.map(

                    value =>
                        this.cleanNumber(
                            value
                        )

                );


            /*
            ==================================================
            REBUILD MONTH VALUES
            ==================================================
            */

            row.months =
                this.buildMonthlyBalances(

                    row.beginning,

                    row.movements,

                    currentReportMonth,

                    row.is_periodic

                );


            return {

                beginning:
                    row.beginning,

                movements:
                    [
                        ...row.movements
                    ]

            };

        };


    /*
    ======================================================
    ROOT ACCOUNTS
    ======================================================
    */

    const roots =
        [];


    reportMap.forEach(

        row => {

            const hasParent =
                row.parent_id !== null
                &&
                row.parent_id !== undefined
                &&
                row.parent_id !== "";


            const parentExists =
                hasParent
                &&
                reportMap.has(

                    String(
                        row.parent_id
                    )

                );


            if (
                !parentExists
            ) {

                row.is_root =
                    true;


                roots.push(
                    row
                );

            }

        }

    );


    /*
    ======================================================
    SORT ROOT
    ======================================================
    */

    roots.sort(

        (
            a,
            b
        ) => {

            return this.compareAccountCode(

                a.account_code,

                b.account_code

            );

        }

    );


    /*
    ======================================================
    AGGREGATE ROOTS
    ======================================================
    */

    roots.forEach(

        root => {

            aggregateAccount(
                root
            );

        }

    );


    /*
    ======================================================
    FLATTEN HIERARCHY
    ======================================================
    */

    const flattened =
        [];


    const appendHierarchy =
        (
            row,
            level = 0,
            visited = new Set()
        ) => {

            const key =
                String(
                    row.id
                );


            if (
                visited.has(
                    key
                )
            ) {

                return;

            }


            const nextVisited =
                new Set(
                    visited
                );


            nextVisited.add(
                key
            );


            row.level =
                Math.min(
                    level,
                    5
                );


            flattened.push(
                row
            );


            const children =
                childrenMap.get(
                    key
                )
                ||
                [];


            children.forEach(

                child => {

                    appendHierarchy(

                        child,

                        level + 1,

                        nextVisited

                    );

                }

            );

        };


    /*
    ======================================================
    APPEND ROOT
    ======================================================
    */

    roots.forEach(

        root => {

            appendHierarchy(
                root,
                0
            );

        }

    );


    /*
    ======================================================
    ORPHAN PROTECTION
    ======================================================
    */

    const flattenedIds =
        new Set(

            flattened.map(

                row =>
                    String(
                        row.id
                    )

            )

        );


    reportMap.forEach(

        row => {

            if (
                !flattenedIds.has(
                    String(
                        row.id
                    )
                )
            ) {

                row.level =
                    0;


                row.is_root =
                    true;


                row.months =
                    this.buildMonthlyBalances(

                        row.beginning,

                        row.movements,

                        currentReportMonth,

                        row.is_periodic

                    );


                flattened.push(
                    row
                );

            }

        }

    );


    /*
    ======================================================
    FINANCIAL CALCULATED ROWS
    ======================================================

    COA STRUCTURE REFERENCE

    4xxxxx
    =
    OPERATING REVENUE

    5xxxxx
    =
    OPERATING EXPENSES

    6xxxxx
    =
    GA EXPENSES

    701xxx
    =
    OTHER REVENUE

    702xxx
    =
    OTHER EXPENSE

    703xxx
    =
    TAX EXPENSE
    ======================================================
    */


    /*
    ======================================================
    SUMMARY ARRAY
    ======================================================
    */

    const operatingRevenue =
        new Array(
            12
        )
        .fill(
            0
        );


    const operatingExpense =
        new Array(
            12
        )
        .fill(
            0
        );


    const gaExpense =
        new Array(
            12
        )
        .fill(
            0
        );


    const otherRevenue =
        new Array(
            12
        )
        .fill(
            0
        );


    const otherExpense =
        new Array(
            12
        )
        .fill(
            0
        );


    const taxExpense =
        new Array(
            12
        )
        .fill(
            0
        );


    /*
    ======================================================
    READ DIRECT GL MOVEMENT

    IMPORTANT:

    Use directMap.

    Do not total flattened hierarchy because parent
    already contains child values.
    ======================================================
    */

    directMap.forEach(

        (
            balance,
            accountKey
        ) => {

            const account =
                accountMap.get(
                    String(
                        accountKey
                    )
                );


            if (
                !account
            ) {

                return;

            }


            const code =
                String(
                    account.account_code
                    ||
                    ""
                )
                .trim();


            const movements =
                Array.isArray(
                    balance.movements
                )

                    ? balance.movements

                    : [];


            for (
                let month = 0;
                month < 12;
                month++
            ) {

                const amount =
                    this.toNumber(
                        movements[
                            month
                        ]
                    );


                /*
                ==============================================
                OPERATING REVENUE
                ==============================================
                */

                if (
                    code.startsWith(
                        "4"
                    )
                ) {

                    operatingRevenue[
                        month
                    ] +=
                        amount;


                    continue;

                }


                /*
                ==============================================
                OPERATING EXPENSE
                ==============================================
                */

                if (
                    code.startsWith(
                        "5"
                    )
                ) {

                    operatingExpense[
                        month
                    ] +=
                        amount;


                    continue;

                }


                /*
                ==============================================
                GA EXPENSE
                ==============================================
                */

                if (
                    code.startsWith(
                        "6"
                    )
                ) {

                    gaExpense[
                        month
                    ] +=
                        amount;


                    continue;

                }


                /*
                ==============================================
                OTHER REVENUE
                ==============================================
                */

                if (
                    code.startsWith(
                        "701"
                    )
                ) {

                    otherRevenue[
                        month
                    ] +=
                        amount;


                    continue;

                }


                /*
                ==============================================
                OTHER EXPENSE
                ==============================================
                */

                if (
                    code.startsWith(
                        "702"
                    )
                ) {

                    otherExpense[
                        month
                    ] +=
                        amount;


                    continue;

                }


                /*
                ==============================================
                TAX EXPENSE
                ==============================================
                */

                if (
                    code.startsWith(
                        "703"
                    )
                ) {

                    taxExpense[
                        month
                    ] +=
                        amount;

                }

            }

        }

    );


    /*
    ======================================================
    CLEAN SUMMARY
    ======================================================
    */

    for (
        let month = 0;
        month < 12;
        month++
    ) {

        operatingRevenue[
            month
        ] =
            this.cleanNumber(
                operatingRevenue[
                    month
                ]
            );


        operatingExpense[
            month
        ] =
            this.cleanNumber(
                operatingExpense[
                    month
                ]
            );


        gaExpense[
            month
        ] =
            this.cleanNumber(
                gaExpense[
                    month
                ]
            );


        otherRevenue[
            month
        ] =
            this.cleanNumber(
                otherRevenue[
                    month
                ]
            );


        otherExpense[
            month
        ] =
            this.cleanNumber(
                otherExpense[
                    month
                ]
            );


        taxExpense[
            month
        ] =
            this.cleanNumber(
                taxExpense[
                    month
                ]
            );

    }


    /*
    ======================================================
    CALCULATED ARRAYS
    ======================================================
    */

    const operatingProfit =
        new Array(
            12
        )
        .fill(
            null
        );


    const otherRevenueExpense =
        new Array(
            12
        )
        .fill(
            null
        );


    const ebit =
        new Array(
            12
        )
        .fill(
            null
        );


    const netProfit =
        new Array(
            12
        )
        .fill(
            null
        );


    const currentEarning =
        new Array(
            12
        )
        .fill(
            null
        );


    /*
    ======================================================
    CALCULATE MONTHLY RESULT
    ======================================================
    */

    for (
        let month = 0;
        month < 12;
        month++
    ) {

        const monthNumber =
            month + 1;


        /*
        ==================================================
        FUTURE PERIOD
        ==================================================
        */

        if (
            monthNumber
            >
            currentReportMonth
        ) {

            operatingProfit[
                month
            ] =
                null;


            otherRevenueExpense[
                month
            ] =
                null;


            ebit[
                month
            ] =
                null;


            netProfit[
                month
            ] =
                null;


            currentEarning[
                month
            ] =
                null;


            continue;

        }


        /*
        ==================================================
        OPERATING PROFIT

        Operating Revenue
        -
        Operating Expense
        ==================================================
        */

        operatingProfit[
            month
        ] =
            this.cleanNumber(

                operatingRevenue[
                    month
                ]

                -

                operatingExpense[
                    month
                ]

            );


        /*
        ==================================================
        OTHER REVENUE & EXPENSE

        Other Revenue
        -
        Other Expense
        ==================================================
        */

        otherRevenueExpense[
            month
        ] =
            this.cleanNumber(

                otherRevenue[
                    month
                ]

                -

                otherExpense[
                    month
                ]

            );


        /*
        ==================================================
        EBIT

        Operating Profit
        -
        GA Expense
        +
        Other Revenue
        -
        Other Expense
        ==================================================
        */

        ebit[
            month
        ] =
            this.cleanNumber(

                operatingProfit[
                    month
                ]

                -

                gaExpense[
                    month
                ]

                +

                otherRevenueExpense[
                    month
                ]

            );


        /*
        ==================================================
        NET PROFIT

        EBIT
        -
        Tax Expense
        ==================================================
        */

        netProfit[
            month
        ] =
            this.cleanNumber(

                ebit[
                    month
                ]

                -

                taxExpense[
                    month
                ]

            );


        /*
        ==================================================
        CURRENT EARNING BALANCE

        Reference TB:
        Only current report period carries current earning.
        Previous month = 0.
        ==================================================
        */

        currentEarning[
            month
        ] =

            monthNumber
            ===
            currentReportMonth

                ? netProfit[
                    month
                ]

                : 0;

    }


    /*
    ======================================================
    CREATE CALCULATED ROW
    ======================================================
    */

    const createCalculatedRow =
        (
            id,
            name,
            months
        ) => {

            return {

                id,

                account_code:
                    "",

                account_name:
                    name,

                parent_id:
                    null,

                allow_transaction:
                    false,

                status:
                    true,

                group:
                    "calculated",

                is_periodic:
                    true,

                beginning:
                    0,

                movements:
                    months.map(

                        value => {

                            if (
                                value === null
                                ||
                                value === undefined
                            ) {

                                return 0;

                            }


                            return this.toNumber(
                                value
                            );

                        }

                    ),

                months:
                    [
                        ...months
                    ],

                level:
                    0,

                has_children:
                    true,

                is_root:
                    false,

                is_calculated:
                    true

            };

        };


    /*
    ======================================================
    APPEND CALCULATED ROWS
    ======================================================
    */


    /*
    ======================================================
    OPERATING PROFIT
    ======================================================
    */

    flattened.push(

        createCalculatedRow(

            "__TB_OPERATING_PROFIT__",

            "OPERATING PROFIT",

            operatingProfit

        )

    );


    /*
    ======================================================
    EBIT
    ======================================================
    */

    flattened.push(

        createCalculatedRow(

            "__TB_EBIT__",

            "EBIT",

            ebit

        )

    );


    /*
    ======================================================
    NET PROFIT
    ======================================================
    */

    flattened.push(

        createCalculatedRow(

            "__TB_NET_PROFIT__",

            "NET PROFIT",

            netProfit

        )

    );


    /*
    ======================================================
    CURRENT EARNING
    ======================================================
    */

    flattened.push(

        createCalculatedRow(

            "__TB_CURRENT_EARNING__",

            "CURRENT EARNING (BALANCE)",

            currentEarning

        )

    );


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return flattened;

}
   /*
==========================================================
BUILD MONTHLY BALANCES
==========================================================

BALANCE SHEET ACCOUNT
Asset / Liability / Equity

Jan - Current Month
=
Closing Balance

Current Month
=
Previous Closing Balance
+
Current Month Movement

Future Month
=
0


PROFIT & LOSS ACCOUNT
Revenue / Expense

Jan - Current Month
=
Monthly Activity

Future Month
=
0
==========================================================
*/

buildMonthlyBalances(
    beginning,
    movements,
    currentReportMonth,
    isPeriodic = false
) {

    const months =
        [];


    /*
    ======================================================
    PERIODIC ACCOUNT

    Revenue / Expense

    No carry forward.
    ======================================================
    */

    if (
        isPeriodic
    ) {

        for (
            let index = 0;
            index < 12;
            index++
        ) {

            const monthNumber =
                index + 1;


            /*
            ==================================================
            FUTURE MONTH

            Always display 0.
            ==================================================
            */

            if (
                monthNumber
                >
                currentReportMonth
            ) {

                months.push(
                    0
                );


                continue;

            }


            /*
            ==================================================
            CURRENT / COMPLETED MONTH

            Monthly movement only.
            ==================================================
            */

            months.push(

                this.cleanNumber(

                    this.toNumber(

                        movements?.[
                            index
                        ]

                    )

                )

            );

        }


        return months;

    }


    /*
    ======================================================
    BALANCE SHEET ACCOUNT

    Asset / Liability / Equity
    ======================================================
    */

    let running =
        this.toNumber(
            beginning
        );


    for (
        let index = 0;
        index < 12;
        index++
    ) {

        const monthNumber =
            index + 1;


        /*
        ==================================================
        FUTURE MONTH

        Oct / Nov / Dec etc
        =
        0

        Do NOT carry current balance into future month.
        ==================================================
        */

        if (
            monthNumber
            >
            currentReportMonth
        ) {

            months.push(
                0
            );


            continue;

        }


        /*
        ==================================================
        CURRENT / COMPLETED MONTH

        Closing Balance
        =
        Previous Balance
        +
        Current Month Movement

        Therefore:

        August Closing = 100

        September movement = 0

        September Closing = 100
        ==================================================
        */

        running +=
            this.toNumber(

                movements?.[
                    index
                ]

            );


        months.push(

            this.cleanNumber(
                running
            )

        );

    }


    return months;

}


    /*
    ==========================================================
    APPLY FILTER
    ==========================================================
    */

    applyFilter() {

        const accountId =
            String(
                this.filterAccount?.value
                ||
                ""
            );


        const keyword =
            String(
                this.filterKeyword?.value
                ||
                ""
            )
            .trim()
            .toLowerCase();


        /*
        ======================================================
        ALL ACCOUNTS
        ======================================================
        */

        if (
            !accountId
        ) {

            this.filteredData =
                this.data.filter(

                    row => {

                        if (
                            !keyword
                        ) {

                            return true;

                        }


                        const searchText =
                            `${

                                row.account_code
                                ||
                                ""

                            } ${

                                row.account_name
                                ||
                                ""

                            }`
                            .toLowerCase();


                        return searchText.includes(
                            keyword
                        );

                    }

                );

        }

        else {

            /*
            ==================================================
            SELECTED ACCOUNT + DESCENDANTS
            ==================================================
            */

            const allowedIds =
                this.getAccountAndDescendantIds(
                    accountId
                );


            this.filteredData =
                this.data.filter(

                    row => {

                        if (
                            !allowedIds.has(
                                String(
                                    row.id
                                )
                            )
                        ) {

                            return false;

                        }


                        if (
                            !keyword
                        ) {

                            return true;

                        }


                        const searchText =
                            `${

                                row.account_code
                                ||
                                ""

                            } ${

                                row.account_name
                                ||
                                ""

                            }`
                            .toLowerCase();


                        return searchText.includes(
                            keyword
                        );

                    }

                );

        }


        /*
        ======================================================
        RESET PAGE
        ======================================================
        */

        this.currentPage = 1;


        /*
        ======================================================
        RENDER
        ======================================================
        */

        this.refreshView();

    }


    /*
    ==========================================================
    GET ACCOUNT + DESCENDANTS
    ==========================================================
    */

    getAccountAndDescendantIds(
        accountId
    ) {

        const result =
            new Set();


        const childrenMap =
            new Map();


        /*
        ======================================================
        CREATE CHILD MAP
        ======================================================
        */

        this.data.forEach(

            row => {

                const parentId =
                    row.parent_id;


                if (
                    parentId === null
                    ||
                    parentId === undefined
                    ||
                    parentId === ""
                ) {

                    return;

                }


                const key =
                    String(
                        parentId
                    );


                if (
                    !childrenMap.has(
                        key
                    )
                ) {

                    childrenMap.set(
                        key,
                        []
                    );

                }


                childrenMap
                    .get(
                        key
                    )
                    .push(

                        String(
                            row.id
                        )

                    );

            }

        );


        /*
        ======================================================
        WALK
        ======================================================
        */

        const walk =
            id => {

                const key =
                    String(
                        id
                    );


                if (
                    result.has(
                        key
                    )
                ) {

                    return;

                }


                result.add(
                    key
                );


                const children =
                    childrenMap.get(
                        key
                    )
                    ||
                    [];


                children.forEach(

                    childId => {

                        walk(
                            childId
                        );

                    }

                );

            };


        walk(
            accountId
        );


        return result;

    }


    /*
    ==========================================================
    REFRESH VIEW
    ==========================================================
    */

    refreshView() {

        this.totalRows =
            this.filteredData.length;


        this.totalPages =
            Math.max(

                1,

                Math.ceil(

                    this.totalRows

                    /

                    this.pageSize

                )

            );


        this.currentPage =
            Math.min(

                Math.max(
                    this.currentPage,
                    1
                ),

                this.totalPages

            );


        this.renderTable();

        this.renderTotals();

        this.updatePagination();

    }


    /*
    ==========================================================
    RENDER TABLE
    ==========================================================
    */

    renderTable() {

        if (
            !this.tableBody
        ) {

            return;

        }


        /*
        ======================================================
        PAGE START
        ======================================================
        */

        const start =
            (
                this.currentPage - 1
            )
            *
            this.pageSize;


        /*
        ======================================================
        PAGE DATA
        ======================================================
        */

        const rows =
            this.filteredData.slice(

                start,

                start
                +
                this.pageSize

            );


        /*
        ======================================================
        EMPTY
        ======================================================
        */

        if (
            !rows.length
        ) {

            this.renderEmpty();

            return;

        }


        /*
        ======================================================
        RENDER
        ======================================================
        */

        this.tableBody.innerHTML =

            rows
                .map(

                    row =>
                        this.createRow(
                            row
                        )

                )
                .join("");

    }


   /*
==========================================================
CREATE ROW
==========================================================
*/

createRow(
    row
) {

    const rowClass =
        this.getRowClass(
            row
        );


    /*
    ======================================================
    MONTH CELLS

    ALWAYS SHOW JAN - DEC
    ======================================================
    */

    const monthCells =
        row.months

            .map(

                amount => `

                    <td
                        class="
                            finova-table-number
                            tb-number
                            ${
                                this.getAmountClass(
                                    amount
                                )
                            }
                        ">

                        ${
                            this.formatAmount(
                                amount
                            )
                        }

                    </td>

                `

            )
            .join("");


    /*
    ======================================================
    BEGINNING YEAR

    Revenue / Expense blank.
    ======================================================
    */

    const beginningValue =

        row.is_periodic

            ? ""

            : this.formatAmount(
                row.beginning
            );


    /*
    ======================================================
    ROW
    ======================================================
    */

    return `

        <tr
            class="
                ${rowClass}
                tb-level-${
                    Math.min(
                        row.level
                        ||
                        0,
                        5
                    )
                }
            ">


            <!-- ======================================
                 DESCRIPTION
            ======================================= -->

            <td class="tb-description-cell">

                <div class="tb-description-text">


                    <span class="tb-account-code">

                        ${
                            this.escapeHTML(
                                row.account_code
                                ||
                                ""
                            )
                        }

                    </span>


                    ${
                        row.account_code
                        &&
                        row.account_name

                            ? `

                                <span class="tb-account-separator">
                                    ::
                                </span>

                            `

                            : ""
                    }


                    <span class="tb-account-name">

                        ${
                            this.escapeHTML(
                                row.account_name
                                ||
                                "-"
                            )
                        }

                    </span>


                </div>

            </td>


            <!-- ======================================
                 BEGINNING YEAR
            ======================================= -->

            <td
                class="
                    finova-table-number
                    tb-number
                    ${
                        row.is_periodic

                            ? ""

                            : this.getAmountClass(
                                row.beginning
                            )
                    }
                ">

                ${beginningValue}

            </td>


            <!-- ======================================
                 JAN - DEC
            ======================================= -->

            ${monthCells}


        </tr>

    `;

}

    /*
==========================================================
GET ROW CLASS
==========================================================
*/

getRowClass(
    row
) {

    /*
    ======================================================
    CALCULATED FINANCIAL ROW
    ======================================================
    */

    if (
        row.is_calculated
    ) {

        return "tb-parent-row tb-calculated-row";

    }


    /*
    ======================================================
    ROOT
    ======================================================
    */

    if (
        row.is_root
    ) {

        return "tb-root-row";

    }


    /*
    ======================================================
    PARENT
    ======================================================
    */

    if (
        row.has_children
    ) {

        return "tb-parent-row";

    }


    /*
    ======================================================
    LEAF
    ======================================================
    */

    return "tb-leaf-row";

}


    /*
    ==========================================================
    GET AMOUNT CLASS
    ==========================================================
    */

    getAmountClass(
        value
    ) {

        /*
        ======================================================
        FUTURE PERIOD
        ======================================================
        */

        if (
            value === null
            ||
            value === undefined
        ) {

            return "tb-future-period";

        }


        const number =
            this.toNumber(
                value
            );


        /*
        ======================================================
        ZERO
        ======================================================
        */

        if (
            Math.abs(
                number
            )
            <
            0.0001
        ) {

            return "tb-zero";

        }


        /*
        ======================================================
        NEGATIVE
        ======================================================
        */

        if (
            number < 0
        ) {

            return "tb-negative";

        }


        return "";

    }


    /*
    ==========================================================
    RENDER EMPTY
    ==========================================================
    */

    renderEmpty() {

        if (
            !this.tableBody
        ) {

            return;

        }


        this.tableBody.innerHTML = `

            <tr>

                <td
                    colspan="14"
                    class="
                        text-center
                        py-5
                        text-muted
                    ">

                    No Trial Balance record found.

                </td>

            </tr>

        `;

    }


    /*
    ==========================================================
    SHOW TABLE LOADING
    ==========================================================
    */

    showTableLoading() {

        if (
            !this.tableBody
        ) {

            return;

        }


        this.tableBody.innerHTML = `

            <tr>

                <td
                    colspan="14"
                    class="text-center py-5">

                    <div
                        class="
                            spinner-border
                            spinner-border-sm
                            text-primary
                        "
                        role="status">
                    </div>


                    <div class="small text-muted mt-2">

                        Loading Trial Balance Year...

                    </div>

                </td>

            </tr>

        `;

    }


    /*
    ==========================================================
    CALCULATE TOTALS
    ==========================================================
    */

    calculateTotals() {

        const year =
            Number(

                this.filterYear?.value

                ||

                new Date()
                    .getFullYear()

            );


        const currentReportMonth =
            this.getCurrentReportMonth(
                year
            );


        /*
        ======================================================
        JOURNAL MAP
        ======================================================
        */

        const journalMap =
            new Map();


        this.journals.forEach(

            journal => {

                journalMap.set(

                    String(
                        journal.id
                    ),

                    journal

                );

            }

        );


        /*
        ======================================================
        TOTAL DIRECT GL ONLY

        We do NOT total parent + child because that would
        double count hierarchy.
        ======================================================
        */

        let beginning = 0;


        const movements =
            new Array(
                12
            )
            .fill(
                0
            );


        this.postings.forEach(

            posting => {

                const journal =
                    journalMap.get(

                        String(
                            posting.journal_id
                        )

                    );


                if (
                    !journal
                ) {

                    return;

                }


                const journalDate =
                    String(

                        journal?.journal_date

                        ??

                        journal?.accounting_date

                        ??

                        ""

                    )
                    .slice(
                        0,
                        10
                    );


                if (
                    !journalDate
                ) {

                    return;

                }


                const postingYear =
                    Number(
                        journalDate.slice(
                            0,
                            4
                        )
                    );


                const postingMonth =
                    Number(
                        journalDate.slice(
                            5,
                            7
                        )
                    );


                const net =

                    this.toNumber(
                        posting.debit
                    )

                    -

                    this.toNumber(
                        posting.credit
                    );


                /*
                ==================================================
                BEGINNING
                ==================================================
                */

                if (
                    postingYear < year
                ) {

                    beginning +=
                        net;


                    return;

                }


                /*
                ==================================================
                MOVEMENT
                ==================================================
                */

                if (
                    postingYear === year
                    &&
                    postingMonth >= 1
                    &&
                    postingMonth <= 12
                ) {

                    movements[
                        postingMonth - 1
                    ] +=
                        net;

                }

            }

        );


        /*
        ======================================================
        BUILD MONTH TOTAL

        Uses same period logic as detail rows.
        ======================================================
        */

        const months =
            this.buildMonthlyBalances(

                beginning,

                movements,

                currentReportMonth

            );


        return {

            beginning:
                this.cleanNumber(
                    beginning
                ),

            months

        };

    }


   /*
==========================================================
RENDER TOTALS
==========================================================
*/

renderTotals() {

    const totals =
        this.calculateTotals();


    /*
    ======================================================
    BEGINNING
    ======================================================
    */

    if (
        this.totalBeginning
    ) {

        this.totalBeginning.textContent =
            this.formatAmount(
                totals.beginning
            );

    }


    /*
    ======================================================
    MONTH TOTAL

    ALWAYS SHOW JAN - DEC
    ======================================================
    */

    this.totalMonths.forEach(

        (
            element,
            index
        ) => {

            if (
                !element
            ) {

                return;

            }


            /*
            ==================================================
            ALWAYS VISIBLE
            ==================================================
            */

            element.style.display =
                "";


            const value =
                totals.months[
                    index
                ];


            /*
            ==================================================
            NULL / UNDEFINED
            =
            ZERO
            ==================================================
            */

            const displayValue =

                value === null
                ||
                value === undefined

                    ? 0

                    : value;


            element.textContent =
                this.formatAmount(
                    displayValue
                );


            element.classList.remove(
                "tb-future-period"
            );

        }

    );

}

    /*
    ==========================================================
    UPDATE PAGINATION
    ==========================================================
    */

    updatePagination() {

        const start =
            this.totalRows

                ? (
                    (
                        this.currentPage - 1
                    )
                    *
                    this.pageSize
                )
                +
                1

                : 0;


        const end =
            Math.min(

                this.currentPage
                *
                this.pageSize,

                this.totalRows

            );


        /*
        ======================================================
        CURRENT PAGE
        ======================================================
        */

        if (
            this.currentPageInput
        ) {

            this.currentPageInput.value =
                this.currentPage;

        }


        /*
        ======================================================
        TOTAL PAGES
        ======================================================
        */

        if (
            this.totalPagesLabel
        ) {

            this.totalPagesLabel.textContent =
                this.totalPages;

        }


        /*
        ======================================================
        RECORD INFO
        ======================================================
        */

        if (
            this.recordInfo
        ) {

            this.recordInfo.textContent =

                this.totalRows

                    ? `Displaying Record ${start} - ${end} of ${this.totalRows}`

                    : "Displaying Record 0 - 0 of 0";

        }


        /*
        ======================================================
        BUTTON STATE
        ======================================================
        */

        if (
            this.btnFirst
        ) {

            this.btnFirst.disabled =
                this.currentPage <= 1;

        }


        if (
            this.btnPrev
        ) {

            this.btnPrev.disabled =
                this.currentPage <= 1;

        }


        if (
            this.btnNext
        ) {

            this.btnNext.disabled =
                this.currentPage
                >=
                this.totalPages;

        }


        if (
            this.btnLast
        ) {

            this.btnLast.disabled =
                this.currentPage
                >=
                this.totalPages;

        }

    }


    /*
    ==========================================================
    GO TO PAGE
    ==========================================================
    */

    goToPage(
        page
    ) {

        this.currentPage =
            Math.min(

                Math.max(

                    Number(
                        page
                    )
                    ||
                    1,

                    1

                ),

                this.totalPages

            );


        this.renderTable();

        this.updatePagination();

    }


    /*
    ==========================================================
    RESET AND RELOAD
    ==========================================================
    */

    async resetAndReload() {

        try {

            window.App?.showLoading?.();


            const currentYear =
                new Date()
                    .getFullYear();


            /*
            ==================================================
            YEAR
            ==================================================
            */

            if (
                this.filterYear
            ) {

                this.filterYear.value =
                    String(
                        currentYear
                    );

            }


            /*
            ==================================================
            ACCOUNT
            ==================================================
            */

            if (
                this.filterAccount
            ) {

                this.filterAccount.value =
                    "";

            }


            /*
            ==================================================
            KEYWORD
            ==================================================
            */

            if (
                this.filterKeyword
            ) {

                this.filterKeyword.value =
                    "";

            }


            /*
            ==================================================
            PAGE
            ==================================================
            */

            this.currentPage = 1;


            /*
            ==================================================
            MONTH HEADER
            ==================================================
            */

            this.updateMonthHeaders();


            /*
            ==================================================
            MASTER
            ==================================================
            */

            await this.loadAccounts();


            /*
            ==================================================
            DATA
            ==================================================
            */

            await this.loadData(
                false
            );

        }

        catch (
            error
        ) {

            console.error(
                "TrialBalanceYear.resetAndReload:",
                error
            );


            this.showError(

                error?.message
                ||
                "Failed to refresh Trial Balance Year."

            );

        }

        finally {

            window.App?.hideLoading?.();

        }

    }


    /*
==========================================================
DOWNLOAD EXCEL
==========================================================
*/

downloadExcel() {

    try {

        /*
        ==================================================
        VALIDATE DATA
        ==================================================
        */

        if (
            !this.filteredData.length
        ) {

            this.showError(
                "No Trial Balance data available to export."
            );

            return;

        }


        /*
        ==================================================
        XLSX LIBRARY
        ==================================================
        */

        if (
            typeof XLSX === "undefined"
        ) {

            this.showError(
                "Excel library is not available."
            );

            return;

        }


        const year =
            Number(

                this.filterYear?.value

                ||

                new Date()
                    .getFullYear()

            );


        const shortYear =
            String(
                year
            )
            .slice(
                -2
            );


        /*
        ==================================================
        HEADER
        ==================================================
        */

        const headers = [

            "Description",

            "Beginning Year",

            ...this.monthNames.map(

                month =>
                    `${month}-${shortYear}`

            )

        ];


        /*
        ==================================================
        DATA ROWS

        IMPORTANT:
        Future period null stays null.
        Do not pass through toNumber().
        ==================================================
        */

        const rows =
            this.filteredData.map(

                row => {

                    const description =

                        `${
                            "    ".repeat(

                                Math.max(
                                    0,
                                    row.level
                                    ||
                                    0
                                )

                            )
                        }${
                            row.account_code
                            ||
                            ""
                        }${
                            row.account_code
                            &&
                            row.account_name

                                ? " :: "

                                : ""
                        }${
                            row.account_name
                            ||
                            ""
                        }`;


                    const monthValues =
                        row.months.map(

                            amount => {

                                if (
                                    amount === null
                                    ||
                                    amount === undefined
                                ) {

                                    return null;

                                }


                                return this.toNumber(
                                    amount
                                );

                            }

                        );


                    return [

                        description,

                        this.toNumber(
                            row.beginning
                        ),

                        ...monthValues

                    ];

                }

            );


        /*
        ==================================================
        REPORT INFORMATION
        ==================================================
        */

        const currentReportMonth =
            this.getCurrentReportMonth(
                year
            );


        const currentPeriodText =
            currentReportMonth > 0

                ? `${

                    this.monthNames[
                        currentReportMonth - 1
                    ]

                }-${shortYear}`

                : "-";


        /*
        ==================================================
        WORKSHEET
        ==================================================
        */

        const worksheet =
            XLSX.utils.aoa_to_sheet([

                [
                    "FINOVA ACCOUNTING SYSTEM"
                ],

                [
                    "TRIAL BALANCE YEAR"
                ],

                [
                    `Fiscal Year : ${year}`
                ],

                [
                    `Current Period : ${currentPeriodText}`
                ],

                [],

                headers,

                ...rows

            ]);


        /*
        ==================================================
        COLUMN WIDTH
        ==================================================
        */

        worksheet["!cols"] = [

            {
                wch: 50
            },

            {
                wch: 18
            },

            ...new Array(
                12
            )
            .fill(
                null
            )
            .map(

                () => ({

                    wch: 18

                })

            )

        ];


        /*
        ==================================================
        NUMBER FORMAT
        ==================================================
        */

        if (
            worksheet["!ref"]
        ) {

            const range =
                XLSX.utils.decode_range(
                    worksheet["!ref"]
                );


            /*
            ==================================================
            DATA START ROW = 7 IN EXCEL
            0 BASE INDEX = 6
            ==================================================
            */

            for (
                let row = 6;
                row <= range.e.r;
                row++
            ) {

                for (
                    let column = 1;
                    column <= 13;
                    column++
                ) {

                    const address =
                        XLSX.utils.encode_cell({

                            r:
                                row,

                            c:
                                column

                        });


                    const cell =
                        worksheet[
                            address
                        ];


                    if (
                        cell
                        &&
                        typeof cell.v === "number"
                    ) {

                        cell.z =
                            '#,##0;[Red]-#,##0';

                    }

                }

            }

        }


        /*
        ==================================================
        WORKBOOK
        ==================================================
        */

        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            "Trial Balance"

        );


        /*
        ==================================================
        FILE NAME TIMESTAMP WIB
        ==================================================
        */

        const now =
            new Date();


        const parts =
            new Intl.DateTimeFormat(
                "en-GB",
                {
                    day:
                        "2-digit",

                    month:
                        "2-digit",

                    year:
                        "numeric",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    hourCycle:
                        "h23",

                    timeZone:
                        "Asia/Jakarta"
                }
            )
            .formatToParts(
                now
            );


        const getPart =
            type =>
                parts.find(
                    part =>
                        part.type === type
                )?.value
                ?? "";


        const timestamp =
            `${getPart("day")}.` +
            `${getPart("month")}.` +
            `${getPart("year")} ` +
            `${getPart("hour")}_` +
            `${getPart("minute")} WIB`;


        /*
        ==================================================
        DOWNLOAD
        ==================================================
        */

        XLSX.writeFile(

            workbook,

            `Trial Balance Year ${timestamp}.xlsx`

        );

    }

    catch (
        error
    ) {

        console.error(
            "TrialBalanceYear.downloadExcel:",
            error
        );


        this.showError(

            error?.message
            ||
            "Failed to download Trial Balance Excel."

        );

    }

}

    /*
    ==========================================================
    PREVIEW HTML
    ==========================================================
    */

    previewHTML() {

        try {

            /*
            ==================================================
            VALIDATE
            ==================================================
            */

            if (
                !this.filteredData.length
            ) {

                this.showError(
                    "No Trial Balance data available to preview."
                );

                return;

            }


            /*
            ==================================================
            OPEN WINDOW FIRST
            ==================================================
            */

            const previewWindow =
                window.open(

                    "about:blank",

                    "finova-trial-balance-year-preview"

                );


            if (
                !previewWindow
            ) {

                this.showError(
                    "Browser blocked the preview window. Please allow pop-ups for FINOVA."
                );

                return;

            }


            /*
            ==================================================
            YEAR
            ==================================================
            */

            const year =
                Number(

                    this.filterYear?.value

                    ||

                    new Date()
                        .getFullYear()

                );


            const shortYear =
                String(
                    year
                )
                .slice(
                    -2
                );


            const currentReportMonth =
                this.getCurrentReportMonth(
                    year
                );


            /*
            ==================================================
            PERIOD TEXT
            ==================================================
            */

            const currentPeriodText =
                currentReportMonth > 0

                    ? `${
                        this.monthNames[
                            currentReportMonth - 1
                        ]
                    }-${shortYear}`

                    : "-";


            /*
            ==================================================
            MONTH HEADER
            ==================================================
            */

            const monthHeaders =
                this.monthNames

                    .map(

                        (
                            month,
                            index
                        ) => {

                            const future =
                                index + 1
                                >
                                currentReportMonth;


                            return `

                                <th
                                    class="${
                                        future

                                            ? "future-period"

                                            : ""
                                    }">

                                    ${month}-${shortYear}

                                </th>

                            `;

                        }

                    )
                    .join("");


            /*
            ==================================================
            REPORT ROW
            ==================================================
            */

            const rows =
                this.filteredData

                    .map(

                        row => {

                            /*
                            ==========================================
                            MONTH CELLS
                            ==========================================
                            */

                            const monthCells =
                                row.months

                                    .map(

                                        amount => {

                                            /*
                                            ==================================
                                            FUTURE PERIOD
                                            ==================================
                                            */

                                            if (
                                                amount === null
                                                ||
                                                amount === undefined
                                            ) {

                                                return `

                                                    <td
                                                        class="
                                                            amount
                                                            future-period
                                                        ">
                                                    </td>

                                                `;

                                            }


                                            /*
                                            ==================================
                                            NORMAL PERIOD
                                            ==================================
                                            */

                                            return `

                                                <td
                                                    class="
                                                        amount
                                                        ${
                                                            this.toNumber(
                                                                amount
                                                            ) < 0

                                                                ? "negative"

                                                                : ""
                                                        }
                                                    ">

                                                    ${
                                                        this.formatAmount(
                                                            amount
                                                        )
                                                    }

                                                </td>

                                            `;

                                        }

                                    )
                                    .join("");


                            /*
                            ==========================================
                            ROW TYPE
                            ==========================================
                            */

                            const typeClass =

                                row.is_root

                                    ? "root"

                                    : row.has_children

                                        ? "parent"

                                        : "account";


                            /*
                            ==========================================
                            ROW HTML
                            ==========================================
                            */

                            return `

                                <tr class="${typeClass}">

                                    <td
                                        class="description"
                                        style="
                                            padding-left:${
                                                10
                                                +
                                                (
                                                    Math.min(
                                                        row.level
                                                        ||
                                                        0,
                                                        5
                                                    )
                                                    *
                                                    18
                                                )
                                            }px;
                                        ">

                                        ${
                                            this.escapeHTML(
                                                row.account_code
                                                ||
                                                ""
                                            )
                                        }

                                        ${
                                            row.account_code
                                            &&
                                            row.account_name

                                                ? " :: "

                                                : ""
                                        }

                                        ${
                                            this.escapeHTML(
                                                row.account_name
                                                ||
                                                ""
                                            )
                                        }

                                    </td>


                                    <td
                                        class="
                                            amount
                                            ${
                                                this.toNumber(
                                                    row.beginning
                                                ) < 0

                                                    ? "negative"

                                                    : ""
                                            }
                                        ">

                                        ${
                                            this.formatAmount(
                                                row.beginning
                                            )
                                        }

                                    </td>


                                    ${monthCells}

                                </tr>

                            `;

                        }

                    )
                    .join("");


            /*
            ==================================================
            TOTAL
            ==================================================
            */

            const totals =
                this.calculateTotals();


            const totalMonthCells =
                totals.months

                    .map(

                        amount => {

                            if (
                                amount === null
                                ||
                                amount === undefined
                            ) {

                                return `

                                    <td
                                        class="
                                            amount
                                            future-period
                                        ">
                                    </td>

                                `;

                            }


                            return `

                                <td
                                    class="
                                        amount
                                        ${
                                            this.toNumber(
                                                amount
                                            ) < 0

                                                ? "negative"

                                                : ""
                                        }
                                    ">

                                    ${
                                        this.formatAmount(
                                            amount
                                        )
                                    }

                                </td>

                            `;

                        }

                    )
                    .join("");


            /*
            ==================================================
            HTML
            ==================================================
            */

            const html = `

<!DOCTYPE html>

<html lang="id">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0">

<title>
    Trial Balance Year ${year}
</title>


<style>

* {
    box-sizing: border-box;
}


html {

    margin: 0;

    padding: 0;

    width: 100%;

    min-height: 100%;

    overflow-x: auto;

    overflow-y: auto;

}


body {

    margin: 0;

    padding: 28px 32px 42px;

    width: max-content;

    min-width: 100%;

    min-height: 100vh;

    background: #FFFFFF;

    color: #1F2937;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    font-size: 11px;

}


.report {

    width: max-content;

    min-width: calc(100vw - 64px);

}


/* ==========================================
   REPORT HEADER
========================================== */

.report-header {

    margin-bottom: 18px;

    padding-bottom: 14px;

    border-bottom: 2px solid #244494;

}


.company {

    margin: 0;

    color: #111827;

    font-size: 21px;

    font-weight: 700;

}


.title {

    margin-top: 5px;

    color: #244494;

    font-size: 17px;

    font-weight: 700;

}


.period {

    margin-top: 7px;

    font-weight: 600;

}


.generated {

    margin-top: 4px;

    color: #6B7280;

    font-size: 10px;

}


/* ==========================================
   TABLE
========================================== */

.table-container {

    width: max-content;

    min-width: 100%;

    border: 1px solid #D1D5DB;

    border-radius: 4px;

    background: #FFFFFF;

    overflow: visible;

}


.table-wrapper {

    width: max-content;

    min-width: 100%;

    overflow: visible !important;

}


table {

    width: max-content;

    min-width: 100%;

    margin: 0;

    border-collapse: collapse;

    table-layout: auto;

}


th {

    min-width: 130px;

    padding: 9px;

    background: #244494;

    color: #FFFFFF;

    border: 1px solid #D1D5DB;

    text-align: right;

    font-size: 10px;

    font-weight: 700;

    white-space: nowrap;

}


th:first-child {

    min-width: 360px;

    text-align: left;

}


td {

    padding: 8px 9px;

    border: 1px solid #D1D5DB;

    background: #FFFFFF;

    white-space: nowrap;

}


.description {

    min-width: 360px;

    text-align: left;

}


.amount {

    min-width: 130px;

    text-align: right;

    font-variant-numeric: tabular-nums;

}


.negative {

    color: #B91C1C;

}


/* ==========================================
   FUTURE PERIOD
========================================== */

.future-period {

    background: #F8FAFC !important;

    color: #94A3B8;

}


/* ==========================================
   ROOT
========================================== */

tr.root td {

    background: #EEF2FF;

    color: #1E3A8A;

    font-weight: 700;

}


/* ==========================================
   PARENT
========================================== */

tr.parent td {

    background: #F8FAFC;

    color: #1F2937;

    font-weight: 600;

}


/* ==========================================
   TOTAL
========================================== */

tfoot td {

    background: #EEF2FF;

    color: #111827;

    font-weight: 700;

}


/* ==========================================
   FOOTER
========================================== */

.footer {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 30px;

    margin-top: 16px;

    padding-top: 10px;

    border-top: 1px solid #E5E7EB;

    color: #6B7280;

    font-size: 10px;

}


/* ==========================================
   PRINT
========================================== */

@media print {

    @page {

        size: landscape;

        margin: 8mm;

    }


    body {

        padding: 0;

    }

}

</style>

</head>


<body>


<div class="report">


    <!-- ==========================================
         HEADER
    =========================================== -->

    <div class="report-header">


        <div class="company">

            FINOVA ACCOUNTING SYSTEM

        </div>


        <div class="title">

            TRIAL BALANCE YEAR

        </div>


        <div class="period">

            Fiscal Year :
            ${year}

        </div>


        <div class="period">

            Current Period :
            ${currentPeriodText}

        </div>


        <div class="generated">

            Print Date :
            ${
                new Date()
                    .toLocaleString(
                        "id-ID"
                    )
            }

        </div>


    </div>


    <!-- ==========================================
         TABLE
    =========================================== -->

    <div class="table-container">

        <div class="table-wrapper">

            <table>


                <thead>

                    <tr>

                        <th>

                            Description

                        </th>


                        <th>

                            Beginning Year

                        </th>


                        ${monthHeaders}

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>


                <tfoot>

                    <tr>

                        <td>

                            TOTAL NET BALANCE

                        </td>


                        <td
                            class="
                                amount
                                ${
                                    this.toNumber(
                                        totals.beginning
                                    ) < 0

                                        ? "negative"

                                        : ""
                                }
                            ">

                            ${
                                this.formatAmount(
                                    totals.beginning
                                )
                            }

                        </td>


                        ${totalMonthCells}

                    </tr>

                </tfoot>


            </table>

        </div>

    </div>


    <!-- ==========================================
         FOOTER
    =========================================== -->

    <div class="footer">

        <div>

            Total Records :
            ${this.filteredData.length}

        </div>


        <div>

            Period :
            ${currentPeriodText}

        </div>


        <div>

            Generated by FINOVA Accounting System

        </div>

    </div>


</div>


</body>

</html>

            `;


            /*
            ==================================================
            WRITE PREVIEW
            ==================================================
            */

            previewWindow.document.open();

            previewWindow.document.write(
                html
            );

            previewWindow.document.close();

            previewWindow.focus();

        }

        catch (
            error
        ) {

            console.error(
                "TrialBalanceYear.previewHTML:",
                error
            );


            this.showError(

                error?.message
                ||
                "Failed to preview Trial Balance Year."

            );

        }

    }


    /*
    ==========================================================
    COMPARE ACCOUNT CODE
    ==========================================================
    */

    compareAccountCode(
        a,
        b
    ) {

        return String(
            a
            ||
            ""
        )
        .localeCompare(

            String(
                b
                ||
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
    TO NUMBER
    ==========================================================
    */

    toNumber(
        value
    ) {

        /*
        ======================================================
        NULL
        ======================================================
        */

        if (
            value === null
            ||
            value === undefined
            ||
            value === ""
        ) {

            return 0;

        }


        /*
        ======================================================
        NUMBER
        ======================================================
        */

        if (
            typeof value === "number"
        ) {

            return Number.isFinite(
                value
            )
                ? value
                : 0;

        }


        /*
        ======================================================
        STRING
        ======================================================
        */

        const text =
            String(
                value
            )
            .trim();


        if (
            !text
        ) {

            return 0;

        }


        /*
        ======================================================
        NORMAL DATABASE NUMBER

        Examples:
        1000000
        1000000.50
        -1000000.50
        ======================================================
        */

        if (
            /^-?\d+(\.\d+)?$/.test(
                text
            )
        ) {

            const direct =
                Number(
                    text
                );


            return Number.isFinite(
                direct
            )
                ? direct
                : 0;

        }


        /*
        ======================================================
        INDONESIAN DISPLAY FORMAT

        1.000.000
        1.000.000,50
        ======================================================
        */

        const normalized =
            text

                .replace(
                    /\./g,
                    ""
                )

                .replace(
                    ",",
                    "."
                );


        const number =
            Number(
                normalized
            );


        return Number.isFinite(
            number
        )
            ? number
            : 0;

    }


    /*
    ==========================================================
    CLEAN NUMBER
    ==========================================================
    */

    cleanNumber(
        value
    ) {

        const number =
            this.toNumber(
                value
            );


        /*
        ======================================================
        REMOVE FLOATING POINT DUST
        ======================================================
        */

        if (
            Math.abs(
                number
            )
            <
            0.0001
        ) {

            return 0;

        }


        return number;

    }


    /*
    ==========================================================
    FORMAT AMOUNT
    ==========================================================
    */

    formatAmount(
        value
    ) {

        /*
        ======================================================
        FUTURE PERIOD

        Null must stay EMPTY.
        ======================================================
        */

        if (
            value === null
            ||
            value === undefined
        ) {

            return "";

        }


        const number =
            this.cleanNumber(
                value
            );


        return Math
            .round(
                number
            )
            .toLocaleString(
                "id-ID"
            );

    }


    /*
    ==========================================================
    ESCAPE HTML
    ==========================================================
    */

    escapeHTML(
        value
    ) {

        return String(
            value
            ??
            ""
        )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

    }


    /*
    ==========================================================
    SHOW ERROR
    ==========================================================
    */

    showError(
        message
    ) {

        /*
        ======================================================
        GLOBAL APP
        ======================================================
        */

        if (
            window.App?.showError
        ) {

            window.App.showError(
                message
            );


            return;

        }


        /*
        ======================================================
        FALLBACK
        ======================================================
        */

        console.error(
            message
        );

    }

}
