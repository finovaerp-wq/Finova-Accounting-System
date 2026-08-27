/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE : GENERAL LEDGER
Version : 1.0 Enterprise
==========================================================
*/

export class GeneralLedger {

    /*
    ==========================================================
    CONSTRUCTOR
    ==========================================================
    */

    constructor() {

        this.data = [];

        this.filteredData = [];


        this.currentPage = 1;

        this.pageSize = 20;

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

            console.log(
                "General Ledger Initialized"
            );


            this.cacheDom();

            this.bindEvents();

            this.renderEmpty();

            this.updatePagination();

        }

        catch (
            error
        ) {

            console.error(
                "GeneralLedger.initialize:",
                error
            );

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


        this.findBy =
            document.getElementById(
                "general-ledger-find-by"
            );


        this.keyword =
            document.getElementById(
                "general-ledger-keyword"
            );


        /*
        ======================================================
        ACTION
        ======================================================
        */

        this.btnFind =
            document.getElementById(
                "btn-find-general-ledger"
            );


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
    BIND EVENTS
    ==========================================================
    */

    bindEvents() {

        this.btnFind?.addEventListener(

            "click",

            () => {

                this.applyFilter();

            }

        );


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


        this.btnRefresh?.addEventListener(

            "click",

            () => {

                this.resetFilter();

            }

        );


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

    }


    /*
    ==========================================================
    APPLY FILTER
    ==========================================================
    */

    applyFilter() {

        this.currentPage =
            1;


        this.filteredData =
            [...this.data];


        this.refreshView();

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
                this.currentPage
                -
                1
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
                    ) => {

                        return this.createRow(

                            row,

                            start
                            +
                            index
                            +
                            1

                        );

                    }

                )
                .join("");

    }


    /*
    ==========================================================
    CREATE ROW
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

                    ${row.date || "-"}

                </td>


                <td class="finova-table-code">

                    ${row.journal_no || "-"}

                </td>


                <td class="finova-table-code">

                    ${row.account_code || "-"}

                </td>


                <td class="finova-table-name">

                    ${row.account_name || "-"}

                </td>


                <td class="finova-table-name">

                    ${row.business_partner || "-"}

                </td>


                <td
                    class="
                        finova-table-name
                        general-ledger-description
                    ">

                    ${row.description || "-"}

                </td>


                <td class="finova-table-number">

                    ${this.formatAmount(row.debit)}

                </td>


                <td class="finova-table-number">

                    ${this.formatAmount(row.credit)}

                </td>


                <td class="finova-table-number">

                    ${this.formatAmount(row.balance)}

                </td>

            </tr>

        `;

    }


    /*
    ==========================================================
    EMPTY
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
                    class="text-center py-5 text-muted">

                    No General Ledger record found.

                </td>

            </tr>

        `;

    }


    /*
    ==========================================================
    TOTAL
    ==========================================================
    */

    renderTotals() {

        const totals =
            this.filteredData.reduce(

                (
                    total,
                    row
                ) => {

                    total.debit +=
                        Number(
                            row.debit
                            ||
                            0
                        );


                    total.credit +=
                        Number(
                            row.credit
                            ||
                            0
                        );


                    total.balance +=
                        Number(
                            row.balance
                            ||
                            0
                        );


                    return total;

                },

                {

                    debit: 0,

                    credit: 0,

                    balance: 0

                }

            );


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


        if (
            this.totalBalance
        ) {

            this.totalBalance.textContent =
                this.formatAmount(
                    totals.balance
                );

        }

    }


    /*
    ==========================================================
    PAGINATION
    ==========================================================
    */

    updatePagination() {

        const start =
            this.totalRows

                ? (
                    (
                        this.currentPage
                        -
                        1
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


        if (
            this.currentPageInput
        ) {

            this.currentPageInput.value =
                this.currentPage;

        }


        if (
            this.totalPagesLabel
        ) {

            this.totalPagesLabel.textContent =
                this.totalPages;

        }


        if (
            this.recordInfo
        ) {

            this.recordInfo.textContent =
                this.totalRows

                    ? `Displaying Record ${start} - ${end} of ${this.totalRows}`

                    : "Displaying Record 0 - 0 of 0";

        }


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
                this.currentPage >= this.totalPages;

        }


        if (
            this.btnLast
        ) {

            this.btnLast.disabled =
                this.currentPage >= this.totalPages;

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
    RESET FILTER
    ==========================================================
    */

    resetFilter() {

        if (
            this.dateFrom
        ) {

            this.dateFrom.value =
                "";

        }


        if (
            this.dateTo
        ) {

            this.dateTo.value =
                "";

        }


        if (
            this.accountFilter
        ) {

            this.accountFilter.value =
                "";

        }


        if (
            this.findBy
        ) {

            this.findBy.value =
                "journal_no";

        }


        if (
            this.keyword
        ) {

            this.keyword.value =
                "";

        }


        this.applyFilter();

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
                Number(
                    value
                    ||
                    0
                )
            )
            .toLocaleString(
                "id-ID"
            );

    }

}