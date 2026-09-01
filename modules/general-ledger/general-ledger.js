/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : GENERAL LEDGER
FILE    : general-ledger.js
VERSION : 2.2.0 FINAL
==========================================================
*/

import { supabase } from "../../assets/js/core/supabase.js";

export class GeneralLedger {

    constructor() {

        this.accounts = [];

        this.businessPartners = [];

        this.journals = [];

        this.details = [];

        this.data = [];

        this.filteredData = [];

        this.accountTomSelect = null;

        this.currentPage = 1;

        this.pageSize = 30;

        this.totalPages = 1;

        this.totalRows = 0;

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

            this.cacheDom();

            this.initializeDateFilter();

            this.bindEvents();

            await this.loadAccounts();

            await this.loadBusinessPartners();

            await this.loadData(false);

            console.log(
                "General Ledger Initialized"
            );

        }

        catch (error) {

            console.error(
                "GeneralLedger.initialize:",
                error
            );

            this.showError(
                error?.message
                ||
                "Failed to initialize General Ledger."
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

        this.dateFrom =
            document.getElementById(
                "general-ledger-date-from"
            );


        this.dateTo =
            document.getElementById(
                "general-ledger-date-to"
            );


        this.accountFilter =
            document.getElementById(
                "general-ledger-account"
            );


        this.keyword =
            document.getElementById(
                "general-ledger-keyword"
            );


        this.btnFind =
            document.getElementById(
                "btn-find-general-ledger"
            );


        /*
        ======================================================
        HEADER BUTTON
        ======================================================
        */

        this.btnDownload =
            document.getElementById(
                "btn-download-excel-general-ledger"
            );


        this.btnPreview =
            document.getElementById(
                "btn-preview-html-general-ledger"
            );


        this.btnRefresh =
            document.getElementById(
                "btn-refresh-general-ledger"
            );


        /*
        ======================================================
        TABLE
        ======================================================
        */

        this.tableBody =
            document.getElementById(
                "general-ledger-tbody"
            );


        /*
        ======================================================
        TOTAL
        ======================================================
        */

        this.totalDebit =
            document.getElementById(
                "general-ledger-total-debit"
            );


        this.totalCredit =
            document.getElementById(
                "general-ledger-total-credit"
            );


        this.totalBalance =
            document.getElementById(
                "general-ledger-total-balance"
            );


        /*
        ======================================================
        PAGINATION
        ======================================================
        */

        this.btnFirst =
            document.getElementById(
                "general-ledger-page-first"
            );


        this.btnPrev =
            document.getElementById(
                "general-ledger-page-prev"
            );


        this.btnNext =
            document.getElementById(
                "general-ledger-page-next"
            );


        this.btnLast =
            document.getElementById(
                "general-ledger-page-last"
            );


        this.currentPageInput =
            document.getElementById(
                "general-ledger-current-page"
            );


        this.totalPagesLabel =
            document.getElementById(
                "general-ledger-total-pages"
            );


        this.recordInfo =
            document.getElementById(
                "general-ledger-record-info"
            );

    }


    /*
    ==========================================================
    INITIALIZE DATE FILTER
    ==========================================================
    */

    initializeDateFilter() {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            )
            .padStart(
                2,
                "0"
            );


        const day =
            String(
                today.getDate()
            )
            .padStart(
                2,
                "0"
            );


        if (this.dateFrom) {

            this.dateFrom.value =
                `${year}-01-01`;

        }


        if (this.dateTo) {

            this.dateTo.value =
                `${year}-${month}-${day}`;

        }

    }


    /*
    ==========================================================
    BIND EVENTS
    ==========================================================
    */

    bindEvents() {

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

        this.keyword?.addEventListener(

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
        DATE
        ======================================================
        */

        this.dateFrom?.addEventListener(

            "change",

            () => {

                this.applyFilter();

            }

        );


        this.dateTo?.addEventListener(

            "change",

            () => {

                this.applyFilter();

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
        DOWNLOAD
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
        PAGINATION
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


        this.btnPrev?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    this.currentPage - 1
                );

            }

        );


        this.btnNext?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    this.currentPage + 1
                );

            }

        );


        this.btnLast?.addEventListener(

            "click",

            () => {

                this.goToPage(
                    this.totalPages
                );

            }

        );


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
LOAD COA
==========================================================
*/

async loadAccounts() {

    try {

        const rows =
            await this.fetchAllRows(

                "mst_chart_of_accounts",

                query =>

                    query.order(
                        "account_code",
                        {
                            ascending: true
                        }
                    )

            );


        this.accounts =
            rows.map(

                account => ({

                    ...account,

                    id:
                        account.id,

                    account_code:
                        String(
                            account.account_code
                            ??
                            ""
                        )
                        .trim(),

                    account_name:
                        String(
                            account.account_name
                            ??
                            ""
                        )
                        .trim()

                })

            );


        console.log(
            "GENERAL LEDGER COA DATA:",
            this.accounts
        );


        /*
        ==================================================
        POPULATE NATIVE SELECT FIRST
        ==================================================
        */

        this.populateAccountFilter();


        /*
        ==================================================
        THEN ACTIVATE TOM SELECT
        ==================================================
        */

        this.initializeAccountTomSelect();


        console.log(
            "GENERAL LEDGER COA COUNT:",
            this.accounts.length
        );

    }

    catch (error) {

        console.error(
            "GeneralLedger.loadAccounts:",
            error
        );


        throw error;

    }

}
/*
==========================================================
POPULATE ACCOUNT FILTER
==========================================================
*/

populateAccountFilter() {

    if (
        !this.accountFilter
    ) {

        console.error(
            "General Ledger: COA select not found."
        );

        return;

    }


    /*
    ======================================================
    CLEAR
    ======================================================
    */

    this.accountFilter.innerHTML =
        "";


    /*
    ======================================================
    SHOW ALL
    ======================================================
    */

    const allOption =
        document.createElement(
            "option"
        );


    allOption.value =
        "";


    allOption.textContent =
        "Show All Accounts";


    this.accountFilter.appendChild(
        allOption
    );


    /*
    ======================================================
    COA
    ======================================================
    */

    this.accounts.forEach(

        account => {

            if (
                account.id === null
                ||
                account.id === undefined
            ) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(
                    account.id
                );


            option.textContent =

                `${account.account_code} :: ${account.account_name}`;


            this.accountFilter.appendChild(
                option
            );

        }

    );


    console.log(
        "GENERAL LEDGER NATIVE COA OPTIONS:",
        this.accountFilter.options.length
    );

}


    /*
==========================================================
INITIALIZE TOM SELECT COA
==========================================================
*/

initializeAccountTomSelect() {

    if (
        !this.accountFilter
    ) {

        return;

    }


    /*
    ======================================================
    DESTROY PREVIOUS INSTANCE
    ======================================================
    */

    if (
        this.accountTomSelect
    ) {

        this.accountTomSelect.destroy();

        this.accountTomSelect =
            null;

    }


    /*
    ======================================================
    REMOVE STALE TOM SELECT WRAPPER
    ======================================================
    */

    const parent =
        this.accountFilter.parentElement;


    if (
        parent
    ) {

        parent
            .querySelectorAll(
                ".ts-wrapper"
            )
            .forEach(

                wrapper => {

                    if (
                        !wrapper.contains(
                            this.accountFilter
                        )
                    ) {

                        wrapper.remove();

                    }

                }

            );

    }


    /*
    ======================================================
    CHECK LIBRARY
    ======================================================
    */

    if (
        typeof window.TomSelect !== "function"
    ) {

        console.error(
            "Tom Select library not loaded."
        );


        /*
        ==================================================
        NATIVE SELECT STILL WORKS
        ==================================================
        */

        this.accountFilter.style.display =
            "";


        this.accountFilter.onchange =
            () => {

                this.applyFilter();

            };


        return;

    }


    /*
    ======================================================
    CREATE FROM NATIVE <OPTION>
    ======================================================
    */

    this.accountTomSelect =
        new window.TomSelect(

            this.accountFilter,

            {

                create:
                    false,


                maxItems:
                    1,


                maxOptions:
                    5000,


                allowEmptyOption:
                    true,


                closeAfterSelect:
                    true,


                hideSelected:
                    false,


                selectOnTab:
                    true,


                placeholder:
                    "Type Account Code or Account Name...",


                /*
                ==================================================
                TOM SELECT READS THE <option> TEXT
                ==================================================
                */

                searchField: [
                    "text"
                ],


                sortField: {

                    field:
                        "text",

                    direction:
                        "asc"

                },


                onChange:

                    value => {

                        console.log(
                            "GENERAL LEDGER COA SELECTED:",
                            value
                        );


                        this.currentPage =
                            1;


                        this.applyFilter();

                    }

            }

        );


    /*
    ======================================================
    DEFAULT EMPTY
    ======================================================
    */

    this.accountTomSelect.clear(
        true
    );


    console.log(
        "GENERAL LEDGER TOM SELECT READY"
    );


    console.log(
        "GENERAL LEDGER TOM SELECT OPTIONS:",
        Object.keys(
            this.accountTomSelect.options
        ).length
    );

}


    /*
    ==========================================================
    FALLBACK NATIVE SELECT
    ==========================================================
    */

    populateNativeAccountSelect() {

        if (
            !this.accountFilter
        ) {

            return;

        }


        this.accountFilter.innerHTML =
            '<option value="">Show All Accounts</option>';


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
                    } :: ${
                        account.account_name
                    }`;


                this.accountFilter.appendChild(
                    option
                );

            }

        );

    }


    /*
    ==========================================================
    LOAD BUSINESS PARTNER
    ==========================================================
    */

    async loadBusinessPartners() {

        try {

            this.businessPartners =
                await this.fetchAllRows(

                    "mst_business_partner",

                    query =>

                        query.order(
                            "bp_code",
                            {
                                ascending: true
                            }
                        )

                );

        }

        catch (error) {

            console.error(
                "GeneralLedger.loadBusinessPartners:",
                error
            );


            /*
            ==================================================
            BUSINESS PARTNER SHOULD NOT BLOCK REPORT
            ==================================================
            */

            this.businessPartners =
                [];

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


            this.showTableLoading();


            /*
            ==================================================
            POSTED JOURNAL ONLY
            ==================================================
            */

            this.journals =
                await this.fetchAllRows(

                    "trx_gl_journal",

                    query =>

                        query

                            .eq(
                                "status",
                                "Posted"
                            )

                            .order(
                                "journal_date",
                                {
                                    ascending: true
                                }
                            )

                            .order(
                                "journal_no",
                                {
                                    ascending: true
                                }
                            )

                );


            /*
            ==================================================
            EMPTY
            ==================================================
            */

            if (
                !this.journals.length
            ) {

                this.details =
                    [];


                this.data =
                    [];


                this.filteredData =
                    [];


                this.refreshView();


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
            DETAILS
            ==================================================
            */

            this.details =
                await this.loadJournalDetails(
                    journalIds
                );


            /*
            ==================================================
            BUILD DATA
            ==================================================
            */

            this.data =
                this.buildLedgerRows();


            /*
            ==================================================
            FILTER
            ==================================================
            */

            this.applyFilter();


            console.log(
                "GENERAL LEDGER POSTED JOURNAL:",
                this.journals.length
            );


            console.log(
                "GENERAL LEDGER DETAIL:",
                this.details.length
            );


            console.log(
                "GENERAL LEDGER ROW:",
                this.data.length
            );

        }

        catch (error) {

            console.error(
                "GeneralLedger.loadData:",
                error
            );


            this.journals =
                [];


            this.details =
                [];


            this.data =
                [];


            this.filteredData =
                [];


            this.refreshView();


            this.showError(

                error?.message

                ||

                "Failed to load General Ledger."

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
    FETCH ALL ROWS
    ==========================================================
    */

    async fetchAllRows(
        table,
        modifier = null
    ) {

        const result =
            [];


        const pageSize =
            1000;


        let from =
            0;


        while (
            true
        ) {

            let query =
                supabase

                    .from(
                        table
                    )

                    .select("*");


            /*
            ==================================================
            MODIFIER
            ==================================================
            */

            if (
                typeof modifier === "function"
            ) {

                query =
                    modifier(
                        query
                    );

            }


            /*
            ==================================================
            PAGINATION
            ==================================================
            */

            const {

                data,

                error

            } = await query.range(

                from,

                from + pageSize - 1

            );


            if (
                error
            ) {

                throw error;

            }


            const rows =
                Array.isArray(
                    data
                )

                    ? data

                    : [];


            result.push(
                ...rows
            );


            if (
                rows.length < pageSize
            ) {

                break;

            }


            from +=
                pageSize;

        }


        return result;

    }


    /*
    ==========================================================
    LOAD JOURNAL DETAIL
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


        const result =
            [];


        const chunkSize =
            200;


        const pageSize =
            1000;


        /*
        ======================================================
        CHUNK JOURNAL IDS
        ======================================================
        */

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


            let from =
                0;


            /*
            ==================================================
            SUPABASE PAGINATION
            ==================================================
            */

            while (
                true
            ) {

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
                    )

                    .order(
                        "journal_id",
                        {
                            ascending: true
                        }
                    )

                    .order(
                        "line_no",
                        {
                            ascending: true
                        }
                    )

                    .range(

                        from,

                        from + pageSize - 1

                    );


                if (
                    error
                ) {

                    throw error;

                }


                const rows =
                    Array.isArray(
                        data
                    )

                        ? data

                        : [];


                result.push(
                    ...rows
                );


                if (
                    rows.length < pageSize
                ) {

                    break;

                }


                from +=
                    pageSize;

            }

        }


        return result;

    }


    /*
    ==========================================================
    BUILD LEDGER ROW
    ==========================================================
    */

    buildLedgerRows() {

        /*
        ======================================================
        ACCOUNT MAP
        ======================================================
        */

        const accountMap =
            new Map(

                this.accounts.map(

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
        BP MAP
        ======================================================
        */

        const bpMap =
            new Map(

                this.businessPartners.map(

                    bp => [

                        String(
                            bp.id
                        ),

                        bp

                    ]

                )

            );


        /*
        ======================================================
        JOURNAL MAP
        ======================================================
        */

        const journalMap =
            new Map(

                this.journals.map(

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
        BUILD
        ======================================================
        */

        const rows =
            this.details

                .map(

                    detail => {

                        /*
                        ==========================================
                        HEADER
                        ==========================================
                        */

                        const journal =
                            journalMap.get(

                                String(
                                    detail.journal_id
                                )

                            );


                        if (
                            !journal
                        ) {

                            return null;

                        }


                        /*
                        ==========================================
                        ACCOUNT
                        ==========================================
                        */

                        const account =
                            accountMap.get(

                                String(
                                    detail.account_id
                                )

                            )

                            ||

                            {};


                        /*
                        ==========================================
                        BUSINESS PARTNER
                        ==========================================
                        */

                        const bp =
                            detail.business_partner_id

                                ? bpMap.get(

                                    String(
                                        detail.business_partner_id
                                    )

                                )

                                : null;


                        /*
                        ==========================================
                        JOURNAL DESCRIPTION
                        ==========================================
                        */

                        const journalDescription =
                            String(

                                journal.description

                                ??

                                ""

                            );


                        /*
                        ==========================================
                        RETURN
                        ==========================================
                        */

                        return {


                            id:
                                detail.id,


                            journal_id:
                                journal.id,


                            line_no:

                                Number(
                                    detail.line_no
                                    ??
                                    0
                                ),


                            journal_no:

                                journal.journal_no

                                ||

                                "-",


                            date:

                                this.normalizeDate(

                                    journal.journal_date

                                    ??

                                    journal.accounting_date

                                ),


                            account_id:
                                detail.account_id,


                            account_code:

                                account.account_code

                                ||

                                "",


                            account_name:

                                account.account_name

                                ||

                                "",


                            business_partner_id:

                                detail.business_partner_id

                                ??

                                null,


                            business_partner:

                                bp?.bp_name

                                ||

                                detail.mst_business_partner?.bp_name

                                ||

                                detail.business_partner_name

                                ||

                                detail.bp_name

                                ||

                                "",


                            /*
                            ======================================
                            IMPORTANT
                            KEYWORD USES THIS FIELD ONLY
                            ======================================
                            */

                            journal_description:
                                journalDescription,


                            /*
                            ======================================
                            DISPLAY DESCRIPTION
                            ======================================
                            */

                            description:

                                journalDescription

                                ||

                                String(
                                    detail.description
                                    ??
                                    ""
                                ),


                            debit:

                                this.toNumber(
                                    detail.debit
                                ),


                            credit:

                                this.toNumber(
                                    detail.credit
                                ),


                            balance:
                                0

                        };

                    }

                )

                .filter(
                    Boolean
                );


        /*
        ======================================================
        SORT

        DATE
        JOURNAL
        LINE NO
        ======================================================
        */

        rows.sort(

            (
                a,
                b
            ) =>

                String(
                    a.date
                )
                .localeCompare(
                    String(
                        b.date
                    )
                )

                ||

                String(
                    a.journal_no
                )
                .localeCompare(

                    String(
                        b.journal_no
                    ),

                    undefined,

                    {
                        numeric:
                            true
                    }

                )

                ||

                Number(
                    a.line_no
                )

                -

                Number(
                    b.line_no
                )

        );


        /*
        ======================================================
        GLOBAL RUNNING BALANCE
        ======================================================
        */

        const runningMap =
            new Map();


        rows.forEach(

            row => {

                const key =
                    String(
                        row.account_id
                    );


                const previous =
                    runningMap.get(
                        key
                    )
                    ||
                    0;


                const current =

                    previous

                    +

                    this.toNumber(
                        row.debit
                    )

                    -

                    this.toNumber(
                        row.credit
                    );


                row.balance =
                    this.cleanNumber(
                        current
                    );


                runningMap.set(

                    key,

                    current

                );

            }

        );


        return rows;

    }


    /*
    ==========================================================
    GET SELECTED ACCOUNT
    ==========================================================
    */

    getSelectedAccountId() {

        if (
            this.accountTomSelect
        ) {

            return String(

                this.accountTomSelect.getValue()

                ||

                ""

            );

        }


        return String(

            this.accountFilter?.value

            ||

            ""

        );

    }


    /*
    ==========================================================
    APPLY FILTER
    ==========================================================
    */

    applyFilter() {

        /*
        ======================================================
        FILTER VALUE
        ======================================================
        */

        const dateFrom =
            this.dateFrom?.value
            ||
            "";


        const dateTo =
            this.dateTo?.value
            ||
            "";


        const accountId =
            this.getSelectedAccountId();


        const keyword =
            String(

                this.keyword?.value

                ??

                ""

            )
            .trim()
            .toLowerCase();


        /*
        ======================================================
        BASE LEDGER

        IMPORTANT:
        KEYWORD MUST NOT AFFECT RUNNING BALANCE.

        BASE FILTER ONLY:
        - DATE
        - COA
        ======================================================
        */

        const baseRows =
            this.data.filter(

                row => {

                    /*
                    ==========================================
                    DATE FROM
                    ==========================================
                    */

                    if (
                        dateFrom
                        &&
                        row.date < dateFrom
                    ) {

                        return false;

                    }


                    /*
                    ==========================================
                    DATE TO
                    ==========================================
                    */

                    if (
                        dateTo
                        &&
                        row.date > dateTo
                    ) {

                        return false;

                    }


                    /*
                    ==========================================
                    COA
                    ==========================================
                    */

                    if (
                        accountId
                        &&
                        String(
                            row.account_id
                        )
                        !==
                        accountId
                    ) {

                        return false;

                    }


                    return true;

                }

            );


        /*
        ======================================================
        CALCULATE RUNNING BALANCE FIRST
        ======================================================
        */

        this.calculateReportRunningBalance(

            baseRows,

            dateFrom,

            accountId

        );


        /*
        ======================================================
        KEYWORD FILTER

        ONLY:
        trx_gl_journal.description
        ======================================================
        */

        this.filteredData =
            keyword

                ? baseRows.filter(

                    row =>

                        String(

                            row.journal_description

                            ??

                            ""

                        )

                        .toLowerCase()

                        .includes(
                            keyword
                        )

                )

                : baseRows;


        /*
        ======================================================
        RESET PAGE
        ======================================================
        */

        this.currentPage =
            1;


        this.refreshView();

    }


    /*
    ==========================================================
    CALCULATE REPORT RUNNING BALANCE
    ==========================================================
    */

    calculateReportRunningBalance(
        rows,
        dateFrom,
        accountId
    ) {

        /*
        ======================================================
        OPENING
        ======================================================
        */

        const openingMap =
            new Map();


        /*
        ======================================================
        BEFORE DATE FROM
        ======================================================
        */

        if (
            dateFrom
        ) {

            this.data.forEach(

                row => {

                    /*
                    ==========================================
                    ONLY PREVIOUS DATE
                    ==========================================
                    */

                    if (
                        row.date >= dateFrom
                    ) {

                        return;

                    }


                    /*
                    ==========================================
                    SELECTED ACCOUNT
                    ==========================================
                    */

                    if (
                        accountId
                        &&
                        String(
                            row.account_id
                        )
                        !==
                        accountId
                    ) {

                        return;

                    }


                    const key =
                        String(
                            row.account_id
                        );


                    const previous =
                        openingMap.get(
                            key
                        )
                        ||
                        0;


                    const current =

                        previous

                        +

                        this.toNumber(
                            row.debit
                        )

                        -

                        this.toNumber(
                            row.credit
                        );


                    openingMap.set(

                        key,

                        current

                    );

                }

            );

        }


        /*
        ======================================================
        RUNNING MAP
        ======================================================
        */

        const runningMap =
            new Map(
                openingMap
            );


        /*
        ======================================================
        CURRENT PERIOD
        ======================================================
        */

        rows.forEach(

            row => {

                const key =
                    String(
                        row.account_id
                    );


                const previous =
                    runningMap.get(
                        key
                    )
                    ||
                    0;


                const current =

                    previous

                    +

                    this.toNumber(
                        row.debit
                    )

                    -

                    this.toNumber(
                        row.credit
                    );


                row.balance =
                    this.cleanNumber(
                        current
                    );


                runningMap.set(

                    key,

                    current

                );

            }

        );

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


        const start =

            (
                this.currentPage - 1
            )

            *

            this.pageSize;


        const rows =
            this.filteredData.slice(

                start,

                start
                +
                this.pageSize

            );


        if (
            !rows.length
        ) {

            this.renderEmpty();

            return;

        }


        this.tableBody.innerHTML =

            rows

                .map(

                    (
                        row,
                        index
                    ) =>

                        this.createRow(

                            row,

                            start
                            +
                            index
                            +
                            1

                        )

                )

                .join("");

    }


    /*
    ==========================================================
    CREATE TABLE ROW
    ==========================================================
    */

    createRow(
        row,
        number
    ) {

        return `

            <tr>


                <td class="finova-table-index">

                    ${number}

                </td>


                <td class="finova-table-date">

                    ${
                        this.escapeHTML(

                            this.formatDate(
                                row.date
                            )

                        )
                    }

                </td>


                <td class="finova-table-code">

                    ${
                        this.escapeHTML(
                            row.journal_no
                            ||
                            "-"
                        )
                    }

                </td>


                <td class="finova-table-code">

                    ${
                        this.escapeHTML(
                            row.account_code
                            ||
                            "-"
                        )
                    }

                </td>


                <td class="finova-table-name">

                    <span
                        class="glr-text-ellipsis"
                        title="${
                            this.escapeHTML(
                                row.account_name
                                ||
                                "-"
                            )
                        }">

                        ${
                            this.escapeHTML(
                                row.account_name
                                ||
                                "-"
                            )
                        }

                    </span>

                </td>


                <td class="finova-table-name">

                    <span
                        class="glr-text-ellipsis"
                        title="${
                            this.escapeHTML(
                                row.business_partner
                                ||
                                "-"
                            )
                        }">

                        ${
                            this.escapeHTML(
                                row.business_partner
                                ||
                                "-"
                            )
                        }

                    </span>

                </td>


                <td class="finova-table-name">

                    <span
                        class="glr-text-ellipsis"
                        title="${
                            this.escapeHTML(
                                row.description
                                ||
                                "-"
                            )
                        }">

                        ${
                            this.escapeHTML(
                                row.description
                                ||
                                "-"
                            )
                        }

                    </span>

                </td>


                <td
                    class="
                        finova-table-number
                        glr-number
                        ${
                            this.getAmountClass(
                                row.debit
                            )
                        }
                    ">

                    ${
                        this.formatAmount(
                            row.debit
                        )
                    }

                </td>


                <td
                    class="
                        finova-table-number
                        glr-number
                        ${
                            this.getAmountClass(
                                row.credit
                            )
                        }
                    ">

                    ${
                        this.formatAmount(
                            row.credit
                        )
                    }

                </td>


                <td
                    class="
                        finova-table-number
                        glr-number
                        ${
                            this.getAmountClass(
                                row.balance
                            )
                        }
                    ">

                    ${
                        this.formatAmount(
                            row.balance
                        )
                    }

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

        return this.filteredData.reduce(

            (
                total,
                row
            ) => {

                total.debit +=
                    this.toNumber(
                        row.debit
                    );


                total.credit +=
                    this.toNumber(
                        row.credit
                    );


                return total;

            },

            {

                debit:
                    0,

                credit:
                    0

            }

        );

    }


    /*
    ==========================================================
    GET CLOSING BALANCE
    ==========================================================
    */

    getClosingBalance() {

        if (
            !this.filteredData.length
        ) {

            return 0;

        }


        const accountId =
            this.getSelectedAccountId();


        /*
        ======================================================
        SINGLE ACCOUNT
        ======================================================
        */

        if (
            accountId
        ) {

            return this.toNumber(

                this.filteredData[
                    this.filteredData.length - 1
                ]?.balance

            );

        }


        /*
        ======================================================
        ALL ACCOUNT
        ======================================================
        */

        const lastBalanceByAccount =
            new Map();


        this.filteredData.forEach(

            row => {

                lastBalanceByAccount.set(

                    String(
                        row.account_id
                    ),

                    this.toNumber(
                        row.balance
                    )

                );

            }

        );


        return [

            ...lastBalanceByAccount.values()

        ]
        .reduce(

            (
                sum,
                value
            ) =>

                sum
                +
                value,

            0

        );

    }


    /*
    ==========================================================
    RENDER TOTALS
    ==========================================================
    */

    renderTotals() {

        const totals =
            this.calculateTotals();


        if (
            this.totalDebit
        ) {

            this.totalDebit.textContent =
                this.formatAmount(
                    totals.debit
                );

        }


        if (
            this.totalCredit
        ) {

            this.totalCredit.textContent =
                this.formatAmount(
                    totals.credit
                );

        }


        /*
        ======================================================
        FOOTER BALANCE

        NET MOVEMENT
        ======================================================
        */

        if (
            this.totalBalance
        ) {

            this.totalBalance.textContent =
                this.formatAmount(

                    totals.debit

                    -

                    totals.credit

                );

        }

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
                    colspan="10"
                    class="
                        text-center
                        py-5
                        text-muted
                    ">

                    No General Ledger record found.

                </td>

            </tr>

        `;

    }


    /*
    ==========================================================
    TABLE LOADING
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
                    colspan="10"
                    class="text-center py-5">

                    <div
                        class="
                            spinner-border
                            spinner-border-sm
                            text-primary
                        "
                        role="status">
                    </div>


                    <div
                        class="
                            small
                            text-muted
                            mt-2
                        ">

                        Loading General Ledger...

                    </div>

                </td>

            </tr>

        `;

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
        TOTAL PAGE
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
        BUTTON
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


            /*
            ==================================================
            DATE
            ==================================================
            */

            this.initializeDateFilter();


            /*
            ==================================================
            KEYWORD
            ==================================================
            */

            if (
                this.keyword
            ) {

                this.keyword.value =
                    "";

            }


            /*
            ==================================================
            DESTROY TOM SELECT
            ==================================================
            */

            if (
                this.accountTomSelect
            ) {

                this.accountTomSelect.destroy();

                this.accountTomSelect =
                    null;

            }


            /*
            ==================================================
            RESET SELECT
            ==================================================
            */

            if (
                this.accountFilter
            ) {

                this.accountFilter.innerHTML =
                    '<option value="">Show All Accounts</option>';

            }


            /*
            ==================================================
            RELOAD MASTER
            ==================================================
            */

            await this.loadAccounts();

            await this.loadBusinessPartners();


            /*
            ==================================================
            RELOAD DATA
            ==================================================
            */

            await this.loadData(
                false
            );

        }

        catch (error) {

            console.error(
                "GeneralLedger.resetAndReload:",
                error
            );


            this.showError(

                error?.message

                ||

                "Failed to refresh General Ledger."

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

        if (
            !this.filteredData.length
        ) {

            this.showError(
                "No General Ledger data available to export."
            );

            return;

        }


        if (
            typeof XLSX === "undefined"
        ) {

            this.showError(
                "Excel library is not available."
            );

            return;

        }


        /*
        ==================================================
        DATA
        ==================================================
        */

        const rows =
            this.filteredData.map(

                (
                    row,
                    index
                ) => [

                    index + 1,

                    this.formatDate(
                        row.date
                    ),

                    row.journal_no,

                    row.account_code,

                    row.account_name,

                    row.business_partner,

                    row.description,

                    this.toNumber(
                        row.debit
                    ),

                    this.toNumber(
                        row.credit
                    ),

                    this.toNumber(
                        row.balance
                    )

                ]

            );


        const totals =
            this.calculateTotals();


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
                    "GENERAL LEDGER"
                ],


                [
                    `Period : ${
                        this.dateFrom?.value
                        ||
                        "-"
                    } to ${
                        this.dateTo?.value
                        ||
                        "-"
                    }`
                ],


                [],


                [
                    "No",
                    "Date",
                    "Journal No",
                    "Account Code",
                    "Account Name",
                    "Business Partner",
                    "Description",
                    "Debit",
                    "Credit",
                    "Balance"
                ],


                ...rows,


                [
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "TOTAL",

                    totals.debit,

                    totals.credit,

                    totals.debit
                    -
                    totals.credit
                ]

            ]);


        /*
        ==================================================
        COLUMN WIDTH
        ==================================================
        */

        worksheet["!cols"] = [

            {
                wch:
                    8
            },

            {
                wch:
                    14
            },

            {
                wch:
                    20
            },

            {
                wch:
                    16
            },

            {
                wch:
                    32
            },

            {
                wch:
                    28
            },

            {
                wch:
                    40
            },

            {
                wch:
                    18
            },

            {
                wch:
                    18
            },

            {
                wch:
                    18
            }

        ];


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

            "General Ledger"

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

            `General Ledger ${timestamp}.xlsx`

        );

    }

    catch (error) {

        console.error(
            "GeneralLedger.downloadExcel:",
            error
        );


        this.showError(

            error?.message

            ||

            "Failed to download General Ledger Excel."

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

            if (
                !this.filteredData.length
            ) {

                this.showError(
                    "No General Ledger data available to preview."
                );

                return;

            }


            /*
            ==================================================
            POPUP
            ==================================================
            */

            const previewWindow =
                window.open(

                    "about:blank",

                    "finova-general-ledger-preview"

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
            TABLE ROWS
            ==================================================
            */

            const rows =
                this.filteredData

                    .map(

                        (
                            row,
                            index
                        ) => `

                            <tr>

                                <td class="center">

                                    ${index + 1}

                                </td>


                                <td class="center">

                                    ${
                                        this.escapeHTML(

                                            this.formatDate(
                                                row.date
                                            )

                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.journal_no
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.account_code
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.account_name
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.business_partner
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        this.escapeHTML(
                                            row.description
                                            ||
                                            "-"
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.debit
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.credit
                                        )
                                    }

                                </td>


                                <td class="amount">

                                    ${
                                        this.formatAmount(
                                            row.balance
                                        )
                                    }

                                </td>

                            </tr>

                        `

                    )

                    .join("");


            /*
            ==================================================
            TOTAL
            ==================================================
            */

            const totals =
                this.calculateTotals();


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
    General Ledger
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

    padding: 9px;

    background: #244494;

    color: #FFFFFF;

    border: 1px solid #D1D5DB;

    text-align: left;

    font-size: 10px;

    font-weight: 700;

    white-space: nowrap;

}


td {

    padding: 8px 9px;

    border: 1px solid #D1D5DB;

    background: #FFFFFF;

    white-space: nowrap;

}


.center {

    text-align: center;

}


.amount {

    min-width: 130px;

    text-align: right;

    font-variant-numeric: tabular-nums;

}


tfoot td {

    background: #EEF2FF;

    color: #111827;

    font-weight: 700;

}


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


    <div class="report-header">


        <div class="company">

            FINOVA ACCOUNTING SYSTEM

        </div>


        <div class="title">

            GENERAL LEDGER

        </div>


        <div class="period">

            Period :

            ${
                this.escapeHTML(
                    this.dateFrom?.value
                    ||
                    "-"
                )
            }

            to

            ${
                this.escapeHTML(
                    this.dateTo?.value
                    ||
                    "-"
                )
            }

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


    <div class="table-container">

        <div class="table-wrapper">

            <table>


                <thead>

                    <tr>

                        <th>No</th>

                        <th>Date</th>

                        <th>Journal No</th>

                        <th>Account Code</th>

                        <th>Account Name</th>

                        <th>Business Partner</th>

                        <th>Description</th>

                        <th>Debit</th>

                        <th>Credit</th>

                        <th>Balance</th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>


                <tfoot>

                    <tr>

                        <td
                            colspan="7"
                            class="amount">

                            TOTAL

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.debit
                                )
                            }

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(
                                    totals.credit
                                )
                            }

                        </td>


                        <td class="amount">

                            ${
                                this.formatAmount(

                                    totals.debit

                                    -

                                    totals.credit

                                )
                            }

                        </td>

                    </tr>

                </tfoot>


            </table>

        </div>

    </div>


    <div class="footer">

        <div>

            Total Records :
            ${this.filteredData.length}

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
            WRITE
            ==================================================
            */

            previewWindow.document.open();

            previewWindow.document.write(
                html
            );

            previewWindow.document.close();

            previewWindow.focus();

        }

        catch (error) {

            console.error(
                "GeneralLedger.previewHTML:",
                error
            );


            this.showError(

                error?.message

                ||

                "Failed to preview General Ledger."

            );

        }

    }


    /*
    ==========================================================
    NORMALIZE DATE
    ==========================================================
    */

    normalizeDate(
        value
    ) {

        if (
            !value
        ) {

            return "";

        }


        return String(
            value
        )
        .slice(
            0,
            10
        );

    }


    /*
    ==========================================================
    FORMAT DATE
    ==========================================================
    */

    formatDate(
        value
    ) {

        const date =
            this.normalizeDate(
                value
            );


        if (
            !date
        ) {

            return "-";

        }


        const [

            year,

            month,

            day

        ] =
            date.split(
                "-"
            );


        return `${day}-${month}-${year}`;

    }


    /*
    ==========================================================
    TO NUMBER
    ==========================================================
    */

    toNumber(
        value
    ) {

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


        /*
        ======================================================
        SUPABASE DECIMAL
        ======================================================
        */

        if (
            /^-?\d+(\.\d+)?$/.test(
                text
            )
        ) {

            const number =
                Number(
                    text
                );


            return Number.isFinite(
                number
            )

                ? number

                : 0;

        }


        /*
        ======================================================
        INDONESIAN NUMBER FORMAT
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


        return Math.abs(
            number
        )
        <
        0.0001

            ? 0

            : number;

    }


    /*
    ==========================================================
    FORMAT AMOUNT
    ==========================================================
    */

    formatAmount(
        value
    ) {

        return Math

            .round(

                this.cleanNumber(
                    value
                )

            )

            .toLocaleString(
                "id-ID"
            );

    }


    /*
    ==========================================================
    AMOUNT CLASS
    ==========================================================
    */

    getAmountClass(
        value
    ) {

        const number =
            this.toNumber(
                value
            );


        if (
            Math.abs(
                number
            )
            <
            0.0001
        ) {

            return "glr-zero";

        }


        if (
            number < 0
        ) {

            return "glr-negative";

        }


        return "";

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

        if (
            window.App?.showError
        ) {

            window.App.showError(
                message
            );

            return;

        }


        console.error(
            message
        );

    }

}