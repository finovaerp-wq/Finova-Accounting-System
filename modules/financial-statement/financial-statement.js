/*
==========================================================
FINOVA ACCOUNTING SYSTEM
FINANCIAL STATEMENT
Version : 3.0.0 FINAL - FINANCIAL STATEMENT BOOK
==========================================================
*/


/*
==========================================================
SHARED FINANCIAL REPORT ENGINE
==========================================================
*/

import {
    FinancialReportService
} from "../../service/financial-report.service.js";

import {
    CompanyReport
} from "../../assets/js/core/company-report.js";


/*
==========================================================
FINANCIAL STATEMENT
==========================================================
*/

export class FinancialStatement {


    /*
==========================================================
CONSTRUCTOR
==========================================================
*/

constructor() {

    /*
    ======================================================
    REPORT STATE
    ======================================================
    */

    this.reportRequest =
        null;


    this.reportDataset =
        null;


    this.reportGeneratedAt =
        null;


    /*
    ======================================================
    DATASET CACHE
    ======================================================

    Completed dataset cache.
    ======================================================
    */

    this.reportDatasetCacheKey =
        null;


    /*
    ======================================================
    IN-FLIGHT DATASET
    ======================================================

    Prevent duplicate FinancialReportService calls when
    Preview / Excel / PDF are triggered while the same
    dataset is still being generated.

    Promise cache key is stored separately so a request
    for another period will never wait for an unrelated
    in-flight dataset.
    ======================================================
    */

    this.reportDatasetPromise =
        null;


    this.reportDatasetPromiseCacheKey =
        null;


    /*
    ======================================================
    INITIALIZE
    ======================================================
    */

    console.log(
        "FINOVA FINANCIAL STATEMENT INITIALIZED"
    );


    this.init();

}

    /*
    ======================================================
    INITIALIZE
    ======================================================
    */

    async init() {

        /*
        ==================================================
        CACHE DOM
        ==================================================
        */

        this.cacheDom();


        /*
        ==================================================
        INITIALIZE PERIODS
        ==================================================
        */

        this.initializePeriods();


        /*
        ==================================================
        BIND EVENTS
        ==================================================
        */

        this.bindEvents();


        /*
        ==================================================
        READY
        ==================================================
        */

        console.log(
            "FINOVA FINANCIAL STATEMENT MODULE READY"
        );

    }


    cacheDom() {

    /*
    ======================================================
    REPORTING PERIOD
    ======================================================
    */

    this.reportingYear =
        document.getElementById(
            "financial-statement-reporting-year"
        );


    this.reportingPeriod =
        document.getElementById(
            "financial-statement-reporting-period"
        );


    /*
    ======================================================
    COMPARATIVE PERIOD
    ======================================================
    */

    this.comparativeYear =
        document.getElementById(
            "financial-statement-comparative-year"
        );


    this.comparativePeriod =
        document.getElementById(
            "financial-statement-comparative-period"
        );


    /*
    ======================================================
    STATEMENT SELECTION
    ======================================================
    */

    this.balanceSheetCheckbox =
        document.getElementById(
            "financial-statement-balance-sheet"
        );


    this.profitLossCheckbox =
        document.getElementById(
            "financial-statement-profit-loss"
        );

    this.changesEquityCheckbox =
        document.getElementById(
            "financial-statement-changes-equity"
        );

    this.cashFlowCheckbox =
        document.getElementById(
            "financial-statement-cash-flow"
        );

    this.notesCheckbox =
        document.getElementById(
            "financial-statement-notes"
        );


    /*
    ======================================================
    CONFIGURATION ACTION BUTTONS
    ======================================================
    */

    this.btnPreview =
        document.getElementById(
            "btn-financial-statement-preview"
        );


    this.btnExcel =
        document.getElementById(
            "btn-financial-statement-excel"
        );


    this.btnPdf =
        document.getElementById(
            "btn-financial-statement-pdf"
        );


    /*
    ======================================================
    PREVIEW ACTION BUTTONS
    ======================================================
    */

    this.btnPreviewExcel =
        document.getElementById(
            "btn-financial-statement-preview-excel"
        );


    this.btnPreviewPdf =
        document.getElementById(
            "btn-financial-statement-preview-pdf"
        );


    /*
    ======================================================
    PREVIEW SHELL
    ======================================================
    */

    this.previewContainer =
        document.getElementById(
            "financial-statement-preview"
        );


    this.previewCompany =
        document.getElementById(
            "financial-statement-preview-company"
        );


    this.previewCompanyDetail =
        document.getElementById(
            "financial-statement-preview-company-detail"
        );


    this.previewPeriod =
        document.getElementById(
            "financial-statement-preview-period"
        );


    this.previewComparativePeriod =
        document.getElementById(
            "financial-statement-preview-comparative-period"
        );


    this.previewTabs =
        document.getElementById(
            "financial-statement-preview-tabs"
        );


    this.previewContent =
        document.getElementById(
            "financial-statement-preview-content"
        );


    this.previewGeneratedAt =
        document.getElementById(
            "financial-statement-preview-generated-at"
        );


    /*
    ======================================================
    DEBUG
    ======================================================
    */

    console.log(
        "FINOVA FINANCIAL STATEMENT DOM:",
        {

            reportingYear:
                !!this.reportingYear,

            reportingPeriod:
                !!this.reportingPeriod,

            comparativeYear:
                !!this.comparativeYear,

            comparativePeriod:
                !!this.comparativePeriod,

            balanceSheet:
                !!this.balanceSheetCheckbox,

            profitLoss:
                !!this.profitLossCheckbox,

            trialBalance:
                !!this.trialBalanceCheckbox,

            previewButton:
                !!this.btnPreview,

            excelButton:
                !!this.btnExcel,

            pdfButton:
                !!this.btnPdf,

            previewExcelButton:
                !!this.btnPreviewExcel,

            previewPdfButton:
                !!this.btnPreviewPdf,

            previewContainer:
                !!this.previewContainer,

            previewTabs:
                !!this.previewTabs,

            previewContent:
                !!this.previewContent

        }
    );

}

    bindEvents() {

    /*
    ======================================================
    CONFIGURATION PREVIEW
    ======================================================
    */

    if (
        this.btnPreview
    ) {

        this.btnPreview.addEventListener(
            "click",
            () => {

                this.handleAction(
                    "preview"
                );

            }
        );

    }


    /*
    ======================================================
    CONFIGURATION DOWNLOAD EXCEL
    ======================================================
    */

    if (
        this.btnExcel
    ) {

        this.btnExcel.addEventListener(
            "click",
            () => {

                this.handleAction(
                    "excel"
                );

            }
        );

    }


    /*
    ======================================================
    CONFIGURATION DOWNLOAD PDF
    ======================================================
    */

    if (
        this.btnPdf
    ) {

        this.btnPdf.addEventListener(
            "click",
            () => {

                this.handleAction(
                    "pdf"
                );

            }
        );

    }


    /*
    ======================================================
    PREVIEW DOWNLOAD EXCEL
    ======================================================
    */

    if (
        this.btnPreviewExcel
    ) {

        this.btnPreviewExcel.addEventListener(
            "click",
            () => {

                this.handleAction(
                    "excel"
                );

            }
        );

    }


    /*
    ======================================================
    PREVIEW DOWNLOAD PDF
    ======================================================
    */

    if (
        this.btnPreviewPdf
    ) {

        this.btnPreviewPdf.addEventListener(
            "click",
            () => {

                this.handleAction(
                    "pdf"
                );

            }
        );

    }


    /*
    ======================================================
    PREVIEW TABS
    ======================================================
    */

    if (
        this.previewTabs
    ) {

        this.previewTabs.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-financial-statement-preview]"
                    );


                if (
                    !button
                    ||
                    !this.previewTabs.contains(
                        button
                    )
                ) {

                    return;

                }


                const statement =
                    button.dataset
                        .financialStatementPreview;


                if (
                    !statement
                ) {

                    return;

                }


                /*
                ==========================================
                ACTIVE TAB
                ==========================================
                */

                const tabs =
                    this.previewTabs.querySelectorAll(
                        "[data-financial-statement-preview]"
                    );


                tabs.forEach(
                    tab => {

                        tab.classList.toggle(
                            "active",
                            tab === button
                        );

                    }
                );


                /*
                ==========================================
                RENDER STATEMENT
                ==========================================
                */

                if (
                    statement ===
                    "balance-sheet"
                ) {

                    if (
                        this.previewContent
                    ) {

                        this.previewContent.innerHTML =
                            this.renderBalanceSheetPreview();

                    }

                }


                else if (
                    statement ===
                    "profit-loss"
                ) {

                    if (
                        this.previewContent
                    ) {

                        this.previewContent.innerHTML =
                            this.renderProfitLossPreview();

                    }

                }

                else if (
                    statement ===
                    "changes-equity"
                ) {
                    if (this.previewContent) {
                        this.previewContent.innerHTML =
                            this.renderChangesInEquityPreview();
                    }
                }

                else if (
                    statement ===
                    "cash-flow"
                ) {
                    if (this.previewContent) {
                        this.previewContent.innerHTML =
                            this.renderCashFlowPreview();
                    }
                }

                else if (
                    statement ===
                    "notes"
                ) {
                    if (this.previewContent) {
                        this.previewContent.innerHTML =
                            this.renderNotesPreview();
                    }
                }

            }
        );

    }


    /*
    ======================================================
    READY
    ======================================================
    */

    console.log(
        "FINOVA FINANCIAL STATEMENT EVENTS BOUND",
        {

            configurationPreview:
                !!this.btnPreview,

            configurationExcel:
                !!this.btnExcel,

            configurationPdf:
                !!this.btnPdf,

            previewExcel:
                !!this.btnPreviewExcel,

            previewPdf:
                !!this.btnPreviewPdf,

            previewTabs:
                !!this.previewTabs

        }
    );

}


    /*
    ======================================================
    INITIALIZE PERIODS
    ======================================================
    */

    initializePeriods() {

        /*
        ==================================================
        VALIDATE DOM
        ==================================================
        */

        if (
            !this.reportingYear
            ||
            !this.reportingPeriod
            ||
            !this.comparativeYear
            ||
            !this.comparativePeriod
        ) {

            console.warn(
                "FINOVA FINANCIAL STATEMENT PERIOD DOM NOT READY"
            );


            return;

        }


        /*
        ==================================================
        CURRENT DATE
        ==================================================
        */

        const currentDate =
            new Date();


        const currentYear =
            currentDate.getFullYear();


        const currentMonth =
            String(
                currentDate.getMonth() + 1
            )
                .padStart(
                    2,
                    "0"
                );


        /*
        ==================================================
        YEAR RANGE

        Provide 10 historical years plus
        1 future year for report preparation.
        ==================================================
        */

        const startYear =
            currentYear + 1;


        const endYear =
            currentYear - 10;


        /*
        ==================================================
        BUILD YEAR OPTIONS
        ==================================================
        */

        let yearOptions =
            "";


        for (
            let year = startYear;
            year >= endYear;
            year--
        ) {

            yearOptions += `

                <option value="${year}">
                    ${year}
                </option>

            `;

        }


        /*
        ==================================================
        APPLY YEAR OPTIONS
        ==================================================
        */

        this.reportingYear.innerHTML =
            yearOptions;


        this.comparativeYear.innerHTML =
            yearOptions;


        /*
        ==================================================
        DEFAULT REPORTING PERIOD
        ==================================================
        */

        this.reportingYear.value =
            String(
                currentYear
            );


        this.reportingPeriod.value =
            currentMonth;


        /*
        ==================================================
        DEFAULT COMPARATIVE PERIOD
        ==================================================
        */

        this.comparativeYear.value =
            String(
                currentYear - 1
            );


        this.comparativePeriod.value =
            currentMonth;


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "FINOVA FINANCIAL STATEMENT PERIODS:",
            {

                reportingYear:
                    this.reportingYear.value,

                reportingPeriod:
                    this.reportingPeriod.value,

                comparativeYear:
                    this.comparativeYear.value,

                comparativePeriod:
                    this.comparativePeriod.value

            }
        );

    }


    /*
    ======================================================
    GET REPORT REQUEST
    ======================================================
    */

    getReportRequest() {

        /*
        ==================================================
        REPORTING PERIOD
        ==================================================
        */

        const reportingYear =
            Number(
                this.reportingYear?.value
            );


        const reportingMonth =
            Number(
                this.reportingPeriod?.value
            );


        /*
        ==================================================
        COMPARATIVE PERIOD
        ==================================================
        */

        const comparativeYear =
            Number(
                this.comparativeYear?.value
            );


        const comparativeMonth =
            Number(
                this.comparativePeriod?.value
            );


        /*
        ==================================================
        STATEMENT SELECTION
        ==================================================
        */

        const statements =
            [];


        if (
            this.balanceSheetCheckbox?.checked
        ) {

            statements.push(
                "balance-sheet"
            );

        }


        if (
            this.profitLossCheckbox?.checked
        ) {

            statements.push(
                "profit-loss"
            );

        }
if (
            this.changesEquityCheckbox?.checked
        ) {
            statements.push(
                "changes-equity"
            );
        }

        if (
            this.cashFlowCheckbox?.checked
        ) {
            statements.push(
                "cash-flow"
            );
        }

        if (
            this.notesCheckbox?.checked
        ) {
            statements.push(
                "notes"
            );
        }


        /*
        ==================================================
        REPORT REQUEST
        ==================================================
        */

        const request = {

            reporting: {

                year:
                    reportingYear,

                month:
                    reportingMonth

            },


            comparative: {

                year:
                    comparativeYear,

                month:
                    comparativeMonth

            },


            statements:
                statements

        };


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "FINOVA FINANCIAL STATEMENT REQUEST:",
            request
        );


        return request;

    }


    /*
    ======================================================
    VALIDATE REPORT REQUEST
    ======================================================
    */

    validateReportRequest(
        request
    ) {

        /*
        ==================================================
        DEFAULT RESULT
        ==================================================
        */

        const result = {

            valid:
                false,

            message:
                ""

        };


        /*
        ==================================================
        REQUEST VALIDATION
        ==================================================
        */

        if (
            !request
            ||
            typeof request !== "object"
        ) {

            result.message =
                "Financial statement request is not valid.";


            return result;

        }


        /*
        ==================================================
        REPORTING PERIOD
        ==================================================
        */

        const reportingYear =
            Number(
                request.reporting?.year
            );


        const reportingMonth =
            Number(
                request.reporting?.month
            );


        if (
            !Number.isInteger(
                reportingYear
            )
            ||
            reportingYear <= 0
        ) {

            result.message =
                "Please select a valid reporting year.";


            return result;

        }


        if (
            !Number.isInteger(
                reportingMonth
            )
            ||
            reportingMonth < 1
            ||
            reportingMonth > 12
        ) {

            result.message =
                "Please select a valid reporting period.";


            return result;

        }


        /*
        ==================================================
        COMPARATIVE PERIOD
        ==================================================
        */

        const comparativeYear =
            Number(
                request.comparative?.year
            );


        const comparativeMonth =
            Number(
                request.comparative?.month
            );


        if (
            !Number.isInteger(
                comparativeYear
            )
            ||
            comparativeYear <= 0
        ) {

            result.message =
                "Please select a valid comparative year.";


            return result;

        }


        if (
            !Number.isInteger(
                comparativeMonth
            )
            ||
            comparativeMonth < 1
            ||
            comparativeMonth > 12
        ) {

            result.message =
                "Please select a valid comparative period.";


            return result;

        }


        /*
        ==================================================
        STATEMENT SELECTION
        ==================================================
        */

        if (
            !Array.isArray(
                request.statements
            )
            ||
            request.statements.length === 0
        ) {

            result.message =
                "Please select at least one financial statement.";


            return result;

        }


        /*
        ==================================================
        ALLOWED STATEMENTS
        ==================================================
        */

        const allowedStatements = [

            "balance-sheet",

            "profit-loss",

            "changes-equity",

            "cash-flow",

            "notes"

        ];


        const invalidStatement =
            request.statements.find(
                statement =>
                    !allowedStatements.includes(
                        statement
                    )
            );


        if (
            invalidStatement
        ) {

            result.message =
                "Financial statement selection is not valid.";


            return result;

        }


        /*
        ==================================================
        VALID
        ==================================================
        */

        result.valid =
            true;


        result.message =
            "";


        return result;

    }


    /*
    ======================================================
    GET DATASET PERIOD
    ======================================================
    */

    getDatasetPeriod(
        year,
        month
    ) {

        /*
        ==================================================
        NORMALIZE
        ==================================================
        */

        const normalizedYear =
            Number(
                year
            );


        const normalizedMonth =
            Number(
                month
            );


        /*
        ==================================================
        DATE FROM

        Financial Statement uses YTD period:
        January 1 → selected reporting month.
        ==================================================
        */

        const dateFrom =
            `${normalizedYear}-01-01`;


        /*
        ==================================================
        LAST DAY OF SELECTED MONTH
        ==================================================
        */

        const lastDay =
            new Date(
                normalizedYear,
                normalizedMonth,
                0
            )
                .getDate();


        /*
        ==================================================
        FORMAT MONTH
        ==================================================
        */

        const monthText =
            String(
                normalizedMonth
            )
                .padStart(
                    2,
                    "0"
                );


        /*
        ==================================================
        FORMAT DAY
        ==================================================
        */

        const dayText =
            String(
                lastDay
            )
                .padStart(
                    2,
                    "0"
                );


        /*
        ==================================================
        DATE TO
        ==================================================
        */

        const dateTo =
            `${normalizedYear}-${monthText}-${dayText}`;


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return {

            dateFrom:
                dateFrom,

            dateTo:
                dateTo

        };

    }

    /*
==========================================================
FORMAT PREVIEW PERIOD
==========================================================
*/

formatPreviewPeriod(
    year,
    month
) {

    /*
    ======================================================
    MONTH NAMES
    ======================================================
    */

    const monthNames = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];


    /*
    ======================================================
    NORMALIZE
    ======================================================
    */

    const normalizedYear =
        Number(
            year
        );


    const normalizedMonth =
        Number(
            month
        );


    /*
    ======================================================
    VALIDATE
    ======================================================
    */

    if (
        !Number.isInteger(
            normalizedYear
        )
        ||
        !Number.isInteger(
            normalizedMonth
        )
        ||
        normalizedMonth < 1
        ||
        normalizedMonth > 12
    ) {

        return "-";

    }


    /*
    ======================================================
    RESULT
    ======================================================
    */

    return (
        `${monthNames[normalizedMonth - 1]} ${normalizedYear}`
    );

}

/*
==========================================================
FORMAT FINANCIAL AMOUNT
==========================================================
*/

formatFinancialAmount(
    value
) {

    const amount =
        Number(
            value
            ??
            0
        )
        ||
        0;


    return new Intl.NumberFormat(
        "id-ID",
        {

            minimumFractionDigits:
                0,

            maximumFractionDigits:
                0

        }
    ).format(
        amount
    );

}


/*
==========================================================
ESCAPE PREVIEW HTML
==========================================================
*/

escapePreviewHTML(
    value
) {

    return String(
        value
        ??
        ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

/*
==========================================================
BUILD BALANCE SHEET HIERARCHY
==========================================================
*/

buildBalanceSheetHierarchy(
    rows = []
) {

    /*
    ======================================================
    VALIDATE INPUT
    ======================================================
    */

    if (
        !Array.isArray(
            rows
        )
    ) {

        return [];

    }


    /*
    ======================================================
    ROW MAP
    ======================================================
    */

    const rowMap =
        new Map();


    rows.forEach(
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


            rowMap.set(
                String(
                    accountId
                ),
                {

                    ...row,

                    account_id:
                        accountId,

                    level:
                        0,

                    has_children:
                        false,

                    is_root:
                        false

                }
            );

        }
    );


    /*
    ======================================================
    CHILDREN MAP
    ======================================================
    */

    const childrenMap =
        new Map();


    rowMap.forEach(
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


            const parentKey =
                String(
                    parentId
                );


            /*
            ==================================================
            PARENT MUST EXIST INSIDE CURRENT REPORT GROUP
            ==================================================
            */

            if (
                !rowMap.has(
                    parentKey
                )
            ) {

                return;

            }


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
    SORT HELPER
    ======================================================
    */

    const compareRows =
        (
            a,
            b
        ) => {

            return String(
                a?.account_code
                ??
                ""
            ).localeCompare(
                String(
                    b?.account_code
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

        };


    /*
    ======================================================
    SORT CHILDREN
    ======================================================
    */

    childrenMap.forEach(
        children => {

            children.sort(
                compareRows
            );

        }
    );


    /*
    ======================================================
    ROOT ACCOUNTS
    ======================================================
    */

    const roots =
        [];


    rowMap.forEach(
        row => {

            const parentId =
                row.parent_id;


            const hasValidParent =
                parentId !== null
                &&
                parentId !== undefined
                &&
                parentId !== ""
                &&
                rowMap.has(
                    String(
                        parentId
                    )
                );


            if (
                !hasValidParent
            ) {

                row.is_root =
                    true;


                roots.push(
                    row
                );

            }

        }
    );


    roots.sort(
        compareRows
    );


    /*
    ======================================================
    AGGREGATE PARENT / HEADER AMOUNTS

    Parent accounts are report headers. Their displayed subtotal
    must equal the sum of their descendants, not only direct postings.
    ======================================================
    */

    const aggregateNode =
        row => {

            const key =
                String(
                    row.account_id
                );

            const children =
                childrenMap.get(
                    key
                )
                ??
                [];

            if (
                children.length === 0
            ) {

                return {
                    current:
                        Number(
                            row.current_amount
                            ??
                            0
                        )
                        ||
                        0,

                    comparative:
                        Number(
                            row.comparative_amount
                            ??
                            0
                        )
                        ||
                        0
                };

            }

            let current =
                Number(
                    row.current_amount
                    ??
                    0
                )
                ||
                0;

            let comparative =
                Number(
                    row.comparative_amount
                    ??
                    0
                )
                ||
                0;

            children.forEach(
                child => {

                    const childTotal =
                        aggregateNode(
                            child
                        );

                    current +=
                        childTotal.current;

                    comparative +=
                        childTotal.comparative;

                }
            );

            row.current_amount =
                current;

            row.comparative_amount =
                comparative;

            return {
                current,
                comparative
            };

        };


    roots.forEach(
        root => {

            aggregateNode(
                root
            );

        }
    );


    /*
    ======================================================
    FLATTEN HIERARCHY
    ======================================================
    */

    const result =
        [];


    const visited =
        new Set();


    const appendRow =
        (
            row,
            level = 0
        ) => {

            const key =
                String(
                    row.account_id
                );


            /*
            ==================================================
            CYCLE PROTECTION
            ==================================================
            */

            if (
                visited.has(
                    key
                )
            ) {

                return;

            }


            visited.add(
                key
            );


            const children =
                childrenMap.get(
                    key
                )
                ??
                [];


            row.level =
                level;


            row.has_children =
                children.length
                >
                0;


            result.push(
                row
            );


            children.forEach(
                child => {

                    appendRow(
                        child,
                        level + 1
                    );

                }
            );

        };


    roots.forEach(
        root => {

            appendRow(
                root,
                0
            );

        }
    );


    /*
    ======================================================
    SAFETY FALLBACK

    Ensures no account disappears if malformed hierarchy
    or circular parent references exist.
    ======================================================
    */

    rowMap.forEach(
        row => {

            const key =
                String(
                    row.account_id
                );


            if (
                visited.has(
                    key
                )
            ) {

                return;

            }


            row.is_root =
                true;


            appendRow(
                row,
                0
            );

        }
    );


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return result;

}

/*
==========================================================
VALIDATE BALANCE SHEET PREVIEW
==========================================================
*/

validateBalanceSheetPreview() {

    /*
    ======================================================
    VALIDATE DATASET
    ======================================================
    */

    if (
        !this.reportDataset
    ) {

        console.warn(
            "FINOVA BALANCE SHEET VALIDATION: DATASET NOT READY"
        );


        return null;

    }


    /*
    ======================================================
    TOTALS
    ======================================================
    */

    const totals =
        this.reportDataset
            ?.totals
            ?.balanceSheet
        ??
        {};


    /*
    ======================================================
    CONTROLS
    ======================================================
    */

    const controls =
        this.reportDataset
            ?.controls
        ??
        {};


    /*
    ======================================================
    CURRENT PERIOD
    ======================================================
    */

    const currentAsset =
        Number(
            totals.asset?.current
            ??
            0
        )
        ||
        0;


    const currentLiabilityAndEquity =
        Number(
            totals.liabilityAndEquity?.current
            ??
            0
        )
        ||
        0;


    const currentDifference =
        currentAsset
        -
        currentLiabilityAndEquity;


    const currentEngineBalanced =
        controls
            ?.current
            ?.balanceSheetBalanced
        ===
        true;


    /*
    ======================================================
    COMPARATIVE PERIOD
    ======================================================
    */

    const comparativeAsset =
        Number(
            totals.asset?.comparative
            ??
            0
        )
        ||
        0;


    const comparativeLiabilityAndEquity =
        Number(
            totals.liabilityAndEquity?.comparative
            ??
            0
        )
        ||
        0;


    const comparativeDifference =
        comparativeAsset
        -
        comparativeLiabilityAndEquity;


    const comparativeEngineBalanced =
        controls
            ?.comparative
            ?.balanceSheetBalanced
        ===
        true;


    /*
    ======================================================
    DISPLAY VALIDATION

    Independent presentation check.

    Engine remains the accounting authority.
    ======================================================
    */

    const currentPreviewBalanced =
        Math.abs(
            currentDifference
        )
        <
        0.01;


    const comparativePreviewBalanced =
        Math.abs(
            comparativeDifference
        )
        <
        0.01;


    /*
    ======================================================
    ENGINE VS PREVIEW CONSISTENCY
    ======================================================
    */

    const currentControlMatch =
        currentEngineBalanced
        ===
        currentPreviewBalanced;


    const comparativeControlMatch =
        comparativeEngineBalanced
        ===
        comparativePreviewBalanced;


    /*
    ======================================================
    FINAL RESULT
    ======================================================
    */

    const result = {

        current: {

            totalAsset:
                currentAsset,

            totalLiabilityAndEquity:
                currentLiabilityAndEquity,

            difference:
                currentDifference,

            engineBalanced:
                currentEngineBalanced,

            previewBalanced:
                currentPreviewBalanced,

            controlMatch:
                currentControlMatch

        },


        comparative: {

            totalAsset:
                comparativeAsset,

            totalLiabilityAndEquity:
                comparativeLiabilityAndEquity,

            difference:
                comparativeDifference,

            engineBalanced:
                comparativeEngineBalanced,

            previewBalanced:
                comparativePreviewBalanced,

            controlMatch:
                comparativeControlMatch

        },


        valid:

            currentEngineBalanced
            &&
            currentPreviewBalanced
            &&
            currentControlMatch
            &&
            comparativeEngineBalanced
            &&
            comparativePreviewBalanced
            &&
            comparativeControlMatch

    };


    /*
    ======================================================
    DEBUG
    ======================================================
    */

    console.log(
        "FINOVA BALANCE SHEET ACCOUNTING VALIDATION:",
        result
    );


    /*
    ======================================================
    WARNING
    ======================================================
    */

    if (
        result.valid !== true
    ) {

        console.warn(
            "FINOVA BALANCE SHEET ACCOUNTING CONTROL FAILED:",
            result
        );

    }


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return result;

}
/*
==========================================================
RENDER BALANCE SHEET PREVIEW
==========================================================
*/

renderBalanceSheetPreview() {

    /*
    ======================================================
    VALIDATE DATASET
    ======================================================
    */

    if (
        !this.reportDataset
        ||
        !Array.isArray(
            this.reportDataset.balanceSheet
        )
    ) {

        console.warn(
            "FINOVA BALANCE SHEET DATASET NOT READY"
        );


        return "";

    }


    /*
    ======================================================
    DATA
    ======================================================
    */

    const rows =
        this.reportDataset.balanceSheet;


    const totals =
        this.reportDataset
            ?.totals
            ?.balanceSheet
        ??
        {};


    /*
    ======================================================
    PERIOD LABELS
    ======================================================
    */

    const currentPeriod =
        this.formatPreviewPeriod(
            this.reportRequest.reporting.year,
            this.reportRequest.reporting.month
        );


    const comparativePeriod =
        this.formatPreviewPeriod(
            this.reportRequest.comparative.year,
            this.reportRequest.comparative.month
        );


    /*
    ======================================================
    GROUP SOURCE
    ======================================================
    */

    const assetSource =
        rows.filter(
            row =>
                row.group === "asset"
        );


    const liabilitySource =
        rows.filter(
            row =>
                row.group === "liability"
        );


    const equitySource =
        rows.filter(
            row =>
                row.group === "equity"
        );


    /*
    ======================================================
    BUILD COA HIERARCHY
    ======================================================
    */

    const assetRows =
        this.buildBalanceSheetHierarchy(
            assetSource
        );


    const liabilityRows =
        this.buildBalanceSheetHierarchy(
            liabilitySource
        );


    const equityRows =
        this.buildBalanceSheetHierarchy(
            equitySource
        );


    /*
    ======================================================
    ACCOUNT ROW RENDERER
    ======================================================
    */

    const renderAccountRows =
        accountRows => {

            if (!Array.isArray(accountRows) || accountRows.length === 0) {
                return `<tr><td colspan="4" class="text-muted">No account data.</td></tr>`;
            }

            const output = [];
            const openParents = [];

            const subtotalRow = parent => `
                <tr class="financial-statement-report-subtotal-row">
                    <td></td>
                    <td class="financial-statement-report-account-name"
                        style="padding-left:${10 + (Number(parent.level || 0) * 22)}px;">
                        TOTAL ${this.escapePreviewHTML(parent.account_name)}
                    </td>
                    <td class="financial-statement-report-number">
                        ${this.formatFinancialAmount(parent.current_amount)}
                    </td>
                    <td class="financial-statement-report-number">
                        ${this.formatFinancialAmount(parent.comparative_amount)}
                    </td>
                </tr>`;

            const closeParentsToLevel = level => {
                while (
                    openParents.length > 0
                    && Number(openParents[openParents.length - 1].level || 0) >= level
                ) {
                    output.push(subtotalRow(openParents.pop()));
                }
            };

            accountRows.forEach(row => {
                const level = Math.max(0, Number(row.level || 0));
                closeParentsToLevel(level);

                const accountCode = this.escapePreviewHTML(row.account_code);
                const accountName = this.escapePreviewHTML(row.account_name);

                if (row.has_children === true) {
                    output.push(`
                        <tr class="financial-statement-report-account-header-row"
                            data-account-id="${this.escapePreviewHTML(row.account_id)}"
                            data-account-level="${level}">
                            <td></td>
                            <td colspan="3" class="financial-statement-report-account-name"
                                style="padding-left:${10 + (level * 22)}px;">
                                ${accountName}
                            </td>
                        </tr>`);
                    openParents.push(row);
                    return;
                }

                output.push(`
                    <tr class="financial-statement-report-account-row"
                        data-account-id="${this.escapePreviewHTML(row.account_id)}"
                        data-account-level="${level}">
                        <td class="financial-statement-report-account-code">${accountCode}</td>
                        <td class="financial-statement-report-account-name"
                            style="padding-left:${10 + (level * 22)}px;">
                            ${accountName}
                        </td>
                        <td class="financial-statement-report-number">
                            ${this.formatFinancialAmount(row.current_amount)}
                        </td>
                        <td class="financial-statement-report-number">
                            ${this.formatFinancialAmount(row.comparative_amount)}
                        </td>
                    </tr>`);
            });

            closeParentsToLevel(-1);
            return output.join("");
        };


    /*
    ======================================================
    GROUP HEADER
    ======================================================
    */

    const renderGroupHeader =
        label => {

            return `

                <tr
                    class="financial-statement-report-group-row"
                >

                    <td
                        colspan="4"
                    >

                        ${this.escapePreviewHTML(
                            label
                        )}

                    </td>

                </tr>

            `;

        };


    /*
    ======================================================
    BUILD BALANCE SHEET
    ======================================================
    */

    const html = `

        <div
            class="financial-statement-report"
        >

            <div
                class="financial-statement-report-header"
            >

                <div>

                    <h4
                        class="financial-statement-report-title"
                    >

                        Balance Sheet

                    </h4>


                    <p
                        class="financial-statement-report-description"
                    >

                        Statement of Financial Position

                    </p>

                </div>


                <div
                    class="financial-statement-report-currency"
                >

                    Currency: IDR

                </div>

            </div>


            <div
                class="financial-statement-report-table-wrapper"
            >

                <table
                    class="financial-statement-report-table"
                >

                    <thead>

                        <tr>

                            <th
                                class="financial-statement-report-account-code"
                            >

                                Notes

                            </th>


                            <th
                                class="financial-statement-report-account-name"
                            >

                                Description

                            </th>


                            <th
                                class="financial-statement-report-number"
                            >

                                ${this.escapePreviewHTML(
                                    currentPeriod
                                )}

                            </th>


                            <th
                                class="financial-statement-report-number"
                            >

                                ${this.escapePreviewHTML(
                                    comparativePeriod
                                )}

                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${renderGroupHeader(
                            "ASSETS"
                        )}


                        ${renderAccountRows(
                            assetRows
                        )}


                        ${renderTotalRow(
                            "TOTAL ASSETS",
                            totals.asset
                        )}


                        ${renderGroupHeader(
                            "LIABILITIES"
                        )}


                        ${renderAccountRows(
                            liabilityRows
                        )}


                        ${renderTotalRow(
                            "TOTAL LIABILITIES",
                            totals.liability
                        )}


                        ${renderGroupHeader(
                            "EQUITY"
                        )}


                        ${renderAccountRows(
                            equityRows
                        )}


                        ${renderTotalRow(
                            "TOTAL EQUITY",
                            totals.equity
                        )}


                        ${renderTotalRow(
                            "CURRENT YEAR PROFIT / (LOSS)",
                            totals.currentYearProfit
                        )}


                        ${renderTotalRow(
                            "TOTAL EQUITY INCLUDING PROFIT / (LOSS)",
                            totals.equityIncludingProfit
                        )}


                        ${renderTotalRow(
                            "TOTAL LIABILITIES & EQUITY",
                            totals.liabilityAndEquity
                        )}

                    </tbody>

                </table>

            </div>

        </div>

    `;


    /*
    ======================================================
    HIERARCHY DIAGNOSTICS
    ======================================================
    */

    const hierarchyRows =
        [
            ...assetRows,
            ...liabilityRows,
            ...equityRows
        ];


    const parentRows =
        hierarchyRows.filter(
            row =>
                row.has_children === true
        );


    const nestedRows =
        hierarchyRows.filter(
            row =>
                Number(
                    row.level
                    ??
                    0
                )
                >
                0
        );


    const maxLevel =
        hierarchyRows.reduce(
            (
                maximum,
                row
            ) => {

                return Math.max(
                    maximum,
                    Number(
                        row.level
                        ??
                        0
                    )
                    ||
                    0
                );

            },
            0
        );


    /*
    ======================================================
    DEBUG
    ======================================================
    */

    console.log(
        "FINOVA BALANCE SHEET HIERARCHY:",
        {

            sourceRows:
                rows.length,

            renderedRows:
                hierarchyRows.length,

            assetRows:
                assetRows.length,

            liabilityRows:
                liabilityRows.length,

            equityRows:
                equityRows.length,

            parentRows:
                parentRows.length,

            nestedRows:
                nestedRows.length,

            maxLevel:
                maxLevel

        }
    );


    console.log(
    "FINOVA BALANCE SHEET PREVIEW:",
    {

        totalRows:
            rows.length,

        totalAssetCurrent:
            totals.asset?.current
            ??
            0,

        totalAssetComparative:
            totals.asset?.comparative
            ??
            0,

        totalLiabilityAndEquityCurrent:
            totals.liabilityAndEquity?.current
            ??
            0,

        totalLiabilityAndEquityComparative:
            totals.liabilityAndEquity
                ?.comparative
            ??
            0

    }
);


/*
======================================================
ACCOUNTING VALIDATION
======================================================
*/

this.validateBalanceSheetPreview();


return html;

}

/*
==========================================================
RENDER PROFIT & LOSS PREVIEW
==========================================================
*/

renderProfitLossPreview() {

    const source =
        Array.isArray(this.reportDataset?.profitLoss)
            ? this.reportDataset.profitLoss
            : [];

    const currentLabel =
        this.formatPreviewPeriod(
            this.reportRequest.reporting.year,
            this.reportRequest.reporting.month
        );

    const comparativeLabel =
        this.formatPreviewPeriod(
            this.reportRequest.comparative.year,
            this.reportRequest.comparative.month
        );

    const formalRows =
        this.buildFormalStatementRows(
            source,
            "PROFIT OR LOSS"
        );

    const body =
        formalRows.map(
            item => {

                if (item.type === "section") {
                    return `
                        <tr class="financial-statement-report-group-row">
                            <td colspan="4">${this.escapePreviewHTML(item.label)}</td>
                        </tr>
                    `;
                }

                const padding =
                    18 + (Number(item.level || 0) * 18);

                if (item.type === "header") {
                    return `
                        <tr class="financial-statement-report-account-header-row">
                            <td></td>
                            <td style="padding-left:${padding}px">
                                ${this.escapePreviewHTML(item.label)}
                            </td>
                            <td></td>
                            <td></td>
                        </tr>
                    `;
                }

                const rowClass =
                    item.type === "subtotal"
                        ? "financial-statement-report-subtotal-row"
                        : "financial-statement-report-account-row";

                return `
                    <tr class="${rowClass}">
                        <td class="financial-statement-report-account-code">
                            ${item.type === "account" ? this.escapePreviewHTML(item.account_code) : ""}
                        </td>
                        <td
                            class="financial-statement-report-account-name"
                            style="padding-left:${padding}px">
                            ${this.escapePreviewHTML(item.label)}
                        </td>
                        <td class="financial-statement-report-number">
                            ${this.formatFinancialAmount(item.current_amount)}
                        </td>
                        <td class="financial-statement-report-number">
                            ${this.formatFinancialAmount(item.comparative_amount)}
                        </td>
                    </tr>
                `;
            }
        ).join("");

    const totals =
        this.reportDataset?.totals?.profitLoss
        ??
        {};

    return `
        <div class="financial-statement-report">

            <div class="financial-statement-report-header">
                <div>
                    <h4 class="financial-statement-report-title">
                        PROFIT OR LOSS AND OTHER COMPREHENSIVE INCOME
                    </h4>
                    <p class="financial-statement-report-description">
                        For the periods ended
                        ${this.escapePreviewHTML(currentLabel)}
                        and
                        ${this.escapePreviewHTML(comparativeLabel)}
                    </p>
                </div>
                <div class="financial-statement-report-currency">
                    Currency: IDR
                </div>
            </div>

            <div class="financial-statement-report-table-wrapper">
                <table class="financial-statement-report-table">
                    <thead>
                        <tr>
                            <th class="financial-statement-report-account-code">Account</th>
                            <th class="financial-statement-report-account-name">Description</th>
                            <th class="financial-statement-report-number">${this.escapePreviewHTML(currentLabel)}</th>
                            <th class="financial-statement-report-number">${this.escapePreviewHTML(comparativeLabel)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${body}

                        <tr class="financial-statement-report-total-row">
                            <td colspan="2">TOTAL REVENUE</td>
                            <td class="financial-statement-report-number">${this.formatFinancialAmount(totals.revenue?.current)}</td>
                            <td class="financial-statement-report-number">${this.formatFinancialAmount(totals.revenue?.comparative)}</td>
                        </tr>

                        <tr class="financial-statement-report-total-row">
                            <td colspan="2">TOTAL EXPENSE</td>
                            <td class="financial-statement-report-number">${this.formatFinancialAmount(totals.expense?.current)}</td>
                            <td class="financial-statement-report-number">${this.formatFinancialAmount(totals.expense?.comparative)}</td>
                        </tr>

                        <tr class="financial-statement-report-grand-total-row">
                            <td colspan="2">PROFIT / (LOSS) FOR THE PERIOD</td>
                            <td class="financial-statement-report-number">${this.formatFinancialAmount(totals.netProfit?.current)}</td>
                            <td class="financial-statement-report-number">${this.formatFinancialAmount(totals.netProfit?.comparative)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/*
==========================================================
STATEMENT OF CHANGES IN EQUITY
==========================================================

Uses the comparative equity closing balance as opening equity,
current-period profit/(loss), and a residual "other changes"
reconciliation. This avoids inventing owner/dividend classifications
that are not present in the current FinancialReportService dataset.
==========================================================
*/
renderChangesInEquityPreview() {
    const data = this.reportDataset?.changesInEquity?.current ?? {};
    const components = Array.isArray(data.components) ? data.components : [];
    const totals = data.totals ?? {};
    const currentPeriod = this.formatPreviewPeriod(
        this.reportRequest.reporting.year,
        this.reportRequest.reporting.month
    );

    const componentRows = components.map(row => `
        <tr class="financial-statement-report-account-row">
            <td class="financial-statement-report-account-code">${this.escapePreviewHTML(row.account_code)}</td>
            <td class="financial-statement-report-account-name">${this.escapePreviewHTML(row.account_name)}</td>
            <td class="financial-statement-report-number">${this.formatFinancialAmount(row.opening_balance)}</td>
            <td class="financial-statement-report-number">${this.formatFinancialAmount(row.direct_movement)}</td>
            <td class="financial-statement-report-number">${this.formatFinancialAmount(row.closing_balance)}</td>
        </tr>
    `).join("");

    return `
        <div class="financial-statement-report financial-statement-book-page">
            <div class="financial-statement-book-heading">
                <h4 class="financial-statement-report-title">STATEMENT OF CHANGES IN EQUITY</h4>
                <p class="financial-statement-report-description">For the period ended ${this.escapePreviewHTML(currentPeriod)}</p>
                <div class="financial-statement-report-currency">Amount in IDR</div>
            </div>
            <div class="financial-statement-report-table-wrapper">
                <table class="financial-statement-report-table financial-statement-book-table">
                    <thead><tr>
                        <th>Account</th><th>Equity Component</th>
                        <th class="financial-statement-report-number">Opening</th>
                        <th class="financial-statement-report-number">Movement</th>
                        <th class="financial-statement-report-number">Closing</th>
                    </tr></thead>
                    <tbody>
                        <tr class="financial-statement-report-group-row"><td colspan="5">EQUITY COMPONENTS</td></tr>
                        ${componentRows || `<tr><td colspan="5" class="text-muted">No equity account data.</td></tr>`}
                        <tr class="financial-statement-report-subtotal-row"><td colspan="4">PROFIT / (LOSS) FOR THE PERIOD</td><td class="financial-statement-report-number">${this.formatFinancialAmount(totals.profitForPeriod)}</td></tr>
                        <tr class="financial-statement-report-total-row"><td colspan="4">TOTAL CLOSING EQUITY INCLUDING PROFIT / (LOSS)</td><td class="financial-statement-report-number">${this.formatFinancialAmount(totals.closingEquityIncludingProfit)}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>`;
}

/*
==========================================================
CASH FLOW STATEMENT
==========================================================

The current shared dataset contains period-end account balances, not
cash-receipt/payment classification. Therefore this renderer performs
a cash-and-cash-equivalents reconciliation only and does NOT invent
operating/investing/financing classifications.
==========================================================
*/
renderCashFlowPreview() {
    const data = this.reportDataset?.cashFlow?.current ?? {};
    const activities = data.activities ?? {};
    const totals = data.totals ?? {};
    const currentPeriod = this.formatPreviewPeriod(
        this.reportRequest.reporting.year,
        this.reportRequest.reporting.month
    );

    const activityRows = (key, label) => {
        const rows = Array.isArray(activities[key]) ? activities[key] : [];
        return `
            <tr class="financial-statement-report-group-row"><td colspan="3">${label}</td></tr>
            ${rows.map(row => `
                <tr>
                    <td>${this.escapePreviewHTML(row.journal_no ?? "-")}</td>
                    <td>${this.escapePreviewHTML(row.description ?? "")}</td>
                    <td class="financial-statement-report-number">${this.formatFinancialAmount(row.amount)}</td>
                </tr>`).join("") || `<tr><td></td><td class="text-muted">No classified cash movement.</td><td></td></tr>`}
            <tr class="financial-statement-report-subtotal-row">
                <td colspan="2">NET CASH FROM ${label}</td>
                <td class="financial-statement-report-number">${this.formatFinancialAmount(totals[key])}</td>
            </tr>`;
    };

    const unclassified = Array.isArray(activities.unclassified) ? activities.unclassified : [];
    const warning = unclassified.length ? `
        <div class="financial-statement-report-warning">
            ${unclassified.length} cash movement(s) remain unclassified. Review the underlying COA/counter-account mapping before treating the cash flow statement as final.
        </div>` : "";

    return `
        <div class="financial-statement-report financial-statement-book-page">
            <div class="financial-statement-book-heading">
                <h4 class="financial-statement-report-title">CASH FLOW STATEMENT</h4>
                <p class="financial-statement-report-description">For the period ended ${this.escapePreviewHTML(currentPeriod)}</p>
                <div class="financial-statement-report-currency">Amount in IDR</div>
            </div>
            ${warning}
            <div class="financial-statement-report-table-wrapper">
                <table class="financial-statement-report-table financial-statement-book-table">
                    <thead><tr><th>Reference</th><th>Description</th><th class="financial-statement-report-number">Amount</th></tr></thead>
                    <tbody>
                        ${activityRows("operating", "OPERATING ACTIVITIES")}
                        ${activityRows("investing", "INVESTING ACTIVITIES")}
                        ${activityRows("financing", "FINANCING ACTIVITIES")}
                        ${unclassified.length ? activityRows("unclassified", "UNCLASSIFIED CASH MOVEMENTS") : ""}
                        <tr class="financial-statement-report-total-row"><td colspan="2">NET INCREASE / (DECREASE) IN CASH</td><td class="financial-statement-report-number">${this.formatFinancialAmount(totals.actualNetChange)}</td></tr>
                        <tr class="financial-statement-report-subtotal-row"><td colspan="2">CASH AND CASH EQUIVALENTS AT BEGINNING OF PERIOD</td><td class="financial-statement-report-number">${this.formatFinancialAmount(totals.openingCash)}</td></tr>
                        <tr class="financial-statement-report-total-row"><td colspan="2">CASH AND CASH EQUIVALENTS AT END OF PERIOD</td><td class="financial-statement-report-number">${this.formatFinancialAmount(totals.closingCash)}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>`;
}

/*
==========================================================
NOTES TO FINANCIAL STATEMENTS
==========================================================
*/
renderNotesPreview() {
    const currentPeriod = this.formatPreviewPeriod(
        this.reportRequest.reporting.year,
        this.reportRequest.reporting.month
    );
    const comparativePeriod = this.formatPreviewPeriod(
        this.reportRequest.comparative.year,
        this.reportRequest.comparative.month
    );
    const identity = CompanyReport.getIdentity();
    const company = identity?.displayName || identity?.legalName || identity?.name || "FINOVA";

    return `
        <div class="financial-statement-report financial-statement-notes">
            <div class="financial-statement-report-header">
                <div>
                    <h4 class="financial-statement-report-title">NOTES TO FINANCIAL STATEMENTS</h4>
                    <p class="financial-statement-report-description">${this.escapePreviewHTML(company)} — ${this.escapePreviewHTML(currentPeriod)}</p>
                </div>
            </div>

            <div class="financial-statement-note-section">
                <h5>1. General Information</h5>
                <p>These notes form an integral part of the financial statements of ${this.escapePreviewHTML(company)}.</p>
            </div>
            <div class="financial-statement-note-section">
                <h5>2. Basis of Preparation</h5>
                <p>Reporting period: ${this.escapePreviewHTML(currentPeriod)}. Comparative period: ${this.escapePreviewHTML(comparativePeriod)}. Presentation currency: IDR.</p>
                <p>Only posted accounting transactions are included in the FINOVA financial report dataset.</p>
            </div>
            <div class="financial-statement-note-section">
                <h5>3. Material Accounting Policy Information</h5>
                <p>This section must be completed according to the entity's actual accounting policies. FINOVA does not infer accounting policies from account balances.</p>
            </div>
            <div class="financial-statement-note-section">
                <h5>4. Supporting Information</h5>
                <p>Detailed balances are presented in the Statement of Financial Position, Profit or Loss and Other Comprehensive Income, Statement of Changes in Equity and Cash Flow Statement.</p>
            </div>
            <div class="financial-statement-note-section">
                <h5>5. Commitments, Contingencies and Other Disclosures</h5>
                <p>Complete this section when applicable. These disclosures cannot be derived reliably from the current general-ledger balance dataset alone.</p>
            </div>
        </div>
    `;
}

/*
==========================================================
RENDER SELECTED STATEMENT
==========================================================
*/

renderSelectedStatement(statement) {
    if (!this.previewContent) return;

    if (statement === "balance-sheet") {
        this.previewContent.innerHTML = this.renderBalanceSheetPreview();
    }
    else if (statement === "profit-loss") {
        this.previewContent.innerHTML = this.renderProfitLossPreview();
    }
    else if (statement === "trial-balance") {
        this.previewContent.innerHTML = this.renderTrialBalancePreview();
    }
    else if (statement === "changes-equity") {
        this.previewContent.innerHTML = this.renderChangesInEquityPreview();
    }
    else if (statement === "cash-flow") {
        this.previewContent.innerHTML = this.renderCashFlowPreview();
    }
    else if (statement === "notes") {
        this.previewContent.innerHTML = this.renderNotesPreview();
    }
}


/*
==========================================================
BUILD FORMAL FINANCIAL STATEMENT ROWS
==========================================================

Creates:
SECTION -> ACCOUNT HEADER -> DETAIL ACCOUNTS -> TOTAL HEADER

Used by Preview / Excel / PDF so the same account grouping is
shown consistently in every output.
==========================================================
*/
buildFormalStatementRows(
    sourceRows = [],
    sectionLabel = ""
) {

    const hierarchy =
        this.buildBalanceSheetHierarchy(
            sourceRows
        );

    const rows = [];

    rows.push({
        type:
            "section",
        label:
            sectionLabel
    });

    const openParents = [];

    const closeParentsToLevel =
        level => {

            while (
                openParents.length > 0
                &&
                Number(
                    openParents[
                        openParents.length - 1
                    ].level
                    ||
                    0
                )
                >=
                level
            ) {

                const parent =
                    openParents.pop();

                rows.push({
                    type:
                        "subtotal",
                    label:
                        `TOTAL ${parent.account_name}`,
                    level:
                        Number(
                            parent.level
                            ||
                            0
                        ),
                    current_amount:
                        Number(
                            parent.current_amount
                            ??
                            0
                        ),
                    comparative_amount:
                        Number(
                            parent.comparative_amount
                            ??
                            0
                        )
                });

            }

        };


    hierarchy.forEach(
        row => {

            const level =
                Math.max(
                    0,
                    Number(
                        row.level
                        ||
                        0
                    )
                );

            closeParentsToLevel(
                level
            );

            if (
                row.has_children === true
            ) {

                rows.push({
                    type:
                        "header",
                    account_id:
                        row.account_id,
                    account_code:
                        row.account_code,
                    label:
                        row.account_name,
                    level
                });

                openParents.push(
                    row
                );

                return;
            }

            rows.push({
                type:
                    "account",
                account_id:
                    row.account_id,
                account_code:
                    row.account_code,
                label:
                    row.account_name,
                level,
                current_amount:
                    Number(
                        row.current_amount
                        ??
                        0
                    ),
                comparative_amount:
                    Number(
                        row.comparative_amount
                        ??
                        0
                    )
            });

        }
    );

    closeParentsToLevel(
        -1
    );

    return rows;

}


/*
==========================================================
DOWNLOAD EXCEL
==========================================================
*/

async downloadExcel() {
    const XLSX = await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm");
    const wb = XLSX.utils.book_new();
    const identity = CompanyReport.getIdentity();
    const company = identity?.displayName || identity?.legalName || identity?.name || "FINOVA";
    const currentLabel = this.formatPreviewPeriod(this.reportRequest.reporting.year, this.reportRequest.reporting.month);
    const comparativeLabel = this.formatPreviewPeriod(this.reportRequest.comparative.year, this.reportRequest.comparative.month);
    const selected = this.reportRequest.statements ?? [];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        [company], ["FINANCIAL STATEMENTS"], [],
        [`Reporting Period: ${currentLabel}`], [`Comparative Period: ${comparativeLabel}`], [],
        ["Generated by FINOVA Accounting System"]
    ]), "Cover");

    const toc = [["TABLE OF CONTENTS"], [], ["FINANCIAL STATEMENTS", "Sheet"]];
    const tocRows = [
        ["balance-sheet", "STATEMENT OF FINANCIAL POSITION", "Financial Position"],
        ["profit-loss", "PROFIT OR LOSS", "Profit & Loss"],
        ["changes-equity", "STATEMENT OF CHANGES IN EQUITY", "Changes in Equity"],
        ["cash-flow", "CASH FLOW STATEMENT", "Cash Flow"],
        ["notes", "NOTES TO FINANCIAL STATEMENTS", "Notes"],
    ];
    tocRows.filter(([key]) => selected.includes(key)).forEach(([,title,sheet]) => toc.push([title,sheet]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(toc), "Table of Contents");

    if (selected.includes("balance-sheet")) {
        const data = [
            ["STATEMENT OF FINANCIAL POSITION"],
            [`As of ${currentLabel} and ${comparativeLabel}`],
            ["Amount in IDR"],
            [],
            ["Notes", "Description", currentLabel, comparativeLabel]
        ];

        const bsRows =
            this.reportDataset.balanceSheet
            ??
            [];

        const appendFormalRows =
            (
                group,
                label
            ) => {

                const formalRows =
                    this.buildFormalStatementRows(
                        bsRows.filter(
                            row =>
                                row.group === group
                        ),
                        label
                    );

                formalRows.forEach(
                    row => {

                        if (
                            row.type === "section"
                        ) {
                            data.push([
                                "",
                                row.label,
                                "",
                                ""
                            ]);
                            return;
                        }

                        if (
                            row.type === "header"
                        ) {
                            data.push([
                                "",
                                `${"   ".repeat(row.level)}${row.label}`,
                                "",
                                ""
                            ]);
                            return;
                        }

                        data.push([
                            row.type === "account"
                                ? row.account_code
                                : "",
                            `${"   ".repeat(Number(row.level || 0))}${row.label}`,
                            Number(row.current_amount ?? 0),
                            Number(row.comparative_amount ?? 0)
                        ]);
                    }
                );

            };

        appendFormalRows("asset", "ASSETS");

        const t =
            this.reportDataset.totals?.balanceSheet
            ??
            {};

        data.push([
            "",
            "TOTAL ASSETS",
            Number(t.asset?.current ?? 0),
            Number(t.asset?.comparative ?? 0)
        ]);

        appendFormalRows("liability", "LIABILITIES");

        data.push([
            "",
            "TOTAL LIABILITIES",
            Number(t.liability?.current ?? 0),
            Number(t.liability?.comparative ?? 0)
        ]);

        appendFormalRows("equity", "EQUITY");

        data.push([
            "",
            "CURRENT YEAR PROFIT / (LOSS)",
            Number(t.currentYearProfit?.current ?? 0),
            Number(t.currentYearProfit?.comparative ?? 0)
        ]);

        data.push([
            "",
            "TOTAL EQUITY INCLUDING PROFIT / (LOSS)",
            Number(t.equityIncludingProfit?.current ?? 0),
            Number(t.equityIncludingProfit?.comparative ?? 0)
        ]);

        data.push([
            "",
            "TOTAL LIABILITIES & EQUITY",
            Number(t.liabilityAndEquity?.current ?? 0),
            Number(t.liabilityAndEquity?.comparative ?? 0)
        ]);

        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.aoa_to_sheet(data),
            "Financial Position"
        );
    }
    if (selected.includes("profit-loss")) {
        const data=[
            ["PROFIT OR LOSS AND OTHER COMPREHENSIVE INCOME"],
            [`For the periods ended ${currentLabel} and ${comparativeLabel}`],
            ["Amount in IDR"],
            [],
            ["Account","Description",currentLabel,comparativeLabel]
        ];

        const formalRows =
            this.buildFormalStatementRows(
                this.reportDataset.profitLoss ?? [],
                "PROFIT OR LOSS"
            );

        for (const item of formalRows) {
            if (item.type === "section") {
                data.push(["", item.label, "", ""]);
                continue;
            }

            if (item.type === "header") {
                data.push([
                    "",
                    `${"   ".repeat(Number(item.level || 0))}${item.label}`,
                    "",
                    ""
                ]);
                continue;
            }

            data.push([
                item.type === "account" ? item.account_code : "",
                `${"   ".repeat(Number(item.level || 0))}${item.label}`,
                Number(item.current_amount ?? 0),
                Number(item.comparative_amount ?? 0)
            ]);
        }

        const t=this.reportDataset.totals?.profitLoss??{};
        data.push(
            [],
            ["","TOTAL REVENUE",Number(t.revenue?.current??0),Number(t.revenue?.comparative??0)],
            ["","TOTAL EXPENSE",Number(t.expense?.current??0),Number(t.expense?.comparative??0)],
            ["","PROFIT / (LOSS) FOR THE PERIOD",Number(t.netProfit?.current??0),Number(t.netProfit?.comparative??0)]
        );

        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.aoa_to_sheet(data),
            "Profit & Loss"
        );
    }
    if (selected.includes("changes-equity")) {
        const d=this.reportDataset.changesInEquity?.current??{}; const t=d.totals??{};
        const data=[["STATEMENT OF CHANGES IN EQUITY"],[`For the period ended ${currentLabel}`],["Amount in IDR"],[],["Account","Equity Component","Opening","Movement","Closing"]];
        for(const r of d.components??[]) data.push([r.account_code,r.account_name,Number(r.opening_balance??0),Number(r.direct_movement??0),Number(r.closing_balance??0)]);
        data.push([], ["","PROFIT / (LOSS) FOR THE PERIOD","","",Number(t.profitForPeriod??0)], ["","TOTAL CLOSING EQUITY INCLUDING PROFIT / (LOSS)","","",Number(t.closingEquityIncludingProfit??0)]);
        XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(data),"Changes in Equity");
    }
    if (selected.includes("cash-flow")) {
        const d=this.reportDataset.cashFlow?.current??{}; const a=d.activities??{}; const t=d.totals??{};
        const data=[["CASH FLOW STATEMENT"],[`For the period ended ${currentLabel}`],["Amount in IDR"],[],["Reference","Description","Amount"]];
        for(const [key,label] of [["operating","OPERATING ACTIVITIES"],["investing","INVESTING ACTIVITIES"],["financing","FINANCING ACTIVITIES"],["unclassified","UNCLASSIFIED CASH MOVEMENTS"]]){
            const rows=Array.isArray(a[key])?a[key]:[]; if(key==="unclassified"&&!rows.length) continue;
            data.push([label]); rows.forEach(r=>data.push([r.journal_no??"-",r.description??"",Number(r.amount??0)])); data.push(["",`NET CASH FROM ${label}`,Number(t[key]??0)]);
        }
        data.push([], ["","NET INCREASE / (DECREASE) IN CASH",Number(t.actualNetChange??0)], ["","CASH AND CASH EQUIVALENTS AT BEGINNING OF PERIOD",Number(t.openingCash??0)], ["","CASH AND CASH EQUIVALENTS AT END OF PERIOD",Number(t.closingCash??0)]);
        XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(data),"Cash Flow");
    }
    if (selected.includes("notes")) {
        const data=[["NOTES TO FINANCIAL STATEMENTS"],[company],[`For the periods ended ${currentLabel} and ${comparativeLabel}`],[],["1. General Information","These notes form an integral part of the financial statements."],["2. Basis of Preparation","Presentation currency: IDR. FINOVA financial report dataset includes Posted GL transactions only."],["3. Material Accounting Policy Information","Complete according to the entity's actual accounting policies."],["4. Supporting Information","See the primary financial statements and supporting schedules."],["5. Commitments, Contingencies and Other Disclosures","Complete when applicable."]];
        XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(data),"Notes");
    }
    const safeCompany=company.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"");
    XLSX.writeFile(wb,`Financial-Statement-${safeCompany}-${this.reportRequest.reporting.year}-${String(this.reportRequest.reporting.month).padStart(2,"0")}.xlsx`);
}

/*
==========================================================
DOWNLOAD PDF
==========================================================
*/

async downloadPDF() {
    const { jsPDF } = await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const identity = CompanyReport.getIdentity();
    const company = identity?.displayName || identity?.legalName || identity?.name || "FINOVA";
    const currentLabel = this.formatPreviewPeriod(this.reportRequest.reporting.year, this.reportRequest.reporting.month);
    const comparativeLabel = this.formatPreviewPeriod(this.reportRequest.comparative.year, this.reportRequest.comparative.month);
    const selected = this.reportRequest.statements ?? [];
    const money = v => this.formatFinancialAmount(Number(v ?? 0));
    const W=doc.internal.pageSize.getWidth(), left=14, right=W-14;
    const toc=[];
    const addStatement=(title,subtitle="")=>{ const start=doc.getNumberOfPages()+1; doc.addPage(); let y=18; doc.setFont("helvetica","bold");doc.setFontSize(12);doc.text(company,left,y);y+=7;doc.setFontSize(10);doc.text(title,left,y);y+=5;doc.setFont("helvetica","normal");doc.setFontSize(7.5); if(subtitle){doc.text(subtitle,left,y);y+=4;} doc.text("Amount in IDR",left,y);y+=4;doc.line(left,y,right,y); return {title,start,y:y+6}; };
    const finish=e=>{e.end=doc.getNumberOfPages();toc.push(e);};
    const ensure=(y,title,subtitle="")=>{if(y<282)return y;doc.addPage();doc.setFont("helvetica","bold");doc.setFontSize(9);doc.text(title,left,16);doc.setFont("helvetica","normal");doc.setFontSize(7);if(subtitle)doc.text(subtitle,left,21);doc.line(left,25,right,25);return 32;};
    const row=(label,a,b,y,bold=false)=>{doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(7);doc.text(doc.splitTextToSize(String(label??""),105)[0]??"",left,y);if(a!==null&&a!==undefined)doc.text(money(a),160,y,{align:"right"});if(b!==null&&b!==undefined)doc.text(money(b),right,y,{align:"right"});return y+4.3;};

    // Cover
    doc.setFont("helvetica","bold");doc.setFontSize(19);doc.text(company,W/2,72,{align:"center"});doc.setFontSize(15);doc.text("FINANCIAL STATEMENTS",W/2,88,{align:"center"});doc.setFont("helvetica","normal");doc.setFontSize(10);doc.text(`Reporting Period: ${currentLabel}`,W/2,104,{align:"center"});doc.text(`Comparative Period: ${comparativeLabel}`,W/2,111,{align:"center"});doc.setFontSize(8);doc.text("Generated by FINOVA Accounting System",W/2,245,{align:"center"});
    // Reserved TOC page
    doc.addPage();

    if(selected.includes("balance-sheet")){
        const e=addStatement("STATEMENT OF FINANCIAL POSITION",`As of ${currentLabel} and ${comparativeLabel}`);
        let y=e.y;

        doc.setFont("helvetica","bold");
        doc.setFontSize(7);
        doc.text("Description",left,y);
        doc.text(currentLabel,160,y,{align:"right"});
        doc.text(comparativeLabel,right,y,{align:"right"});
        y+=6;

        const source =
            this.reportDataset.balanceSheet
            ??
            [];

        const renderFormalGroup =
            (
                group,
                label
            ) => {

                const formalRows =
                    this.buildFormalStatementRows(
                        source.filter(
                            item =>
                                item.group === group
                        ),
                        label
                    );

                for (
                    const item
                    of
                    formalRows
                ) {

                    y =
                        ensure(
                            y,
                            e.title,
                            `As of ${currentLabel} and ${comparativeLabel}`
                        );

                    if (
                        item.type === "section"
                    ) {

                        y += 1;
                        doc.setFont("helvetica","bold");
                        doc.setFontSize(7.5);
                        doc.text(
                            item.label,
                            left,
                            y
                        );
                        doc.line(
                            left,
                            y + 1.5,
                            right,
                            y + 1.5
                        );
                        y += 6;
                        continue;
                    }

                    if (
                        item.type === "header"
                    ) {

                        doc.setFont("helvetica","bold");
                        doc.setFontSize(7);
                        doc.text(
                            String(item.label ?? ""),
                            left + 3 + (Number(item.level || 0) * 4),
                            y
                        );
                        y += 4.5;
                        continue;
                    }

                    const indent =
                        left
                        +
                        5
                        +
                        (
                            Number(
                                item.level
                                ||
                                0
                            )
                            *
                            4
                        );

                    doc.setFont(
                        "helvetica",
                        item.type === "subtotal"
                            ? "bold"
                            : "normal"
                    );

                    doc.setFontSize(7);

                    doc.text(
                        doc.splitTextToSize(
                            String(item.label ?? ""),
                            102
                        )[0] ?? "",
                        indent,
                        y
                    );

                    doc.text(
                        money(item.current_amount),
                        160,
                        y,
                        {
                            align:
                                "right"
                        }
                    );

                    doc.text(
                        money(item.comparative_amount),
                        right,
                        y,
                        {
                            align:
                                "right"
                        }
                    );

                    if (
                        item.type === "subtotal"
                    ) {
                        doc.line(
                            indent,
                            y + 1.2,
                            right,
                            y + 1.2
                        );
                    }

                    y += 4.5;
                }

            };

        renderFormalGroup(
            "asset",
            "ASSETS"
        );

        const t =
            this.reportDataset.totals?.balanceSheet
            ??
            {};

        y += 1;
        y=row(
            "TOTAL ASSETS",
            t.asset?.current,
            t.asset?.comparative,
            y,
            true
        );

        y += 3;

        renderFormalGroup(
            "liability",
            "LIABILITIES"
        );

        y=row(
            "TOTAL LIABILITIES",
            t.liability?.current,
            t.liability?.comparative,
            y,
            true
        );

        y += 3;

        renderFormalGroup(
            "equity",
            "EQUITY"
        );

        y=row(
            "CURRENT YEAR PROFIT / (LOSS)",
            t.currentYearProfit?.current,
            t.currentYearProfit?.comparative,
            y,
            true
        );

        y=row(
            "TOTAL EQUITY INCLUDING PROFIT / (LOSS)",
            t.equityIncludingProfit?.current,
            t.equityIncludingProfit?.comparative,
            y,
            true
        );

        y=row(
            "TOTAL LIABILITIES & EQUITY",
            t.liabilityAndEquity?.current,
            t.liabilityAndEquity?.comparative,
            y,
            true
        );

        finish(e);
    }
    if(selected.includes("profit-loss")){
        const e=addStatement(
            "PROFIT OR LOSS AND OTHER COMPREHENSIVE INCOME",
            `For the periods ended ${currentLabel} and ${comparativeLabel}`
        );
        let y=e.y;

        doc.setFont("helvetica","bold");
        doc.setFontSize(7);
        doc.text("Description",left,y);
        doc.text(currentLabel,160,y,{align:"right"});
        doc.text(comparativeLabel,right,y,{align:"right"});
        y+=6;

        const formalRows =
            this.buildFormalStatementRows(
                this.reportDataset.profitLoss ?? [],
                "PROFIT OR LOSS"
            );

        for(const item of formalRows){
            y=ensure(
                y,
                e.title,
                `For the periods ended ${currentLabel} and ${comparativeLabel}`
            );

            if(item.type==="section"){
                doc.setFont("helvetica","bold");
                doc.setFontSize(7.5);
                doc.text(item.label,left,y);
                doc.line(left,y+1.5,right,y+1.5);
                y+=6;
                continue;
            }

            if(item.type==="header"){
                doc.setFont("helvetica","bold");
                doc.setFontSize(7);
                doc.text(
                    String(item.label??""),
                    left+3+(Number(item.level||0)*4),
                    y
                );
                y+=4.5;
                continue;
            }

            const indent=left+5+(Number(item.level||0)*4);
            doc.setFont(
                "helvetica",
                item.type==="subtotal" ? "bold" : "normal"
            );
            doc.setFontSize(7);
            doc.text(
                doc.splitTextToSize(String(item.label??""),102)[0]??"",
                indent,
                y
            );
            doc.text(money(item.current_amount),160,y,{align:"right"});
            doc.text(money(item.comparative_amount),right,y,{align:"right"});

            if(item.type==="subtotal"){
                doc.line(indent,y+1.2,right,y+1.2);
            }
            y+=4.5;
        }

        const t=this.reportDataset.totals?.profitLoss??{};
        y+=2;
        y=row("TOTAL REVENUE",t.revenue?.current,t.revenue?.comparative,y,true);
        y=row("TOTAL EXPENSE",t.expense?.current,t.expense?.comparative,y,true);
        y=row("PROFIT / (LOSS) FOR THE PERIOD",t.netProfit?.current,t.netProfit?.comparative,y,true);
        finish(e);
    }
    if(selected.includes("changes-equity")){
        const e=addStatement("STATEMENT OF CHANGES IN EQUITY",`For the period ended ${currentLabel}`);let y=e.y;const d=this.reportDataset.changesInEquity?.current??{},t=d.totals??{};
        doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("Equity Component",left,y);doc.text("Opening",145,y,{align:"right"});doc.text("Movement",170,y,{align:"right"});doc.text("Closing",right,y,{align:"right"});y+=5;
        for(const r of d.components??[]){y=ensure(y,e.title);doc.setFont("helvetica","normal");doc.text(`${r.account_code??""}  ${r.account_name??""}`,left,y);doc.text(money(r.opening_balance),145,y,{align:"right"});doc.text(money(r.direct_movement),170,y,{align:"right"});doc.text(money(r.closing_balance),right,y,{align:"right"});y+=4.3;}
        y+=3;doc.setFont("helvetica","bold");doc.text("PROFIT / (LOSS) FOR THE PERIOD",left,y);doc.text(money(t.profitForPeriod),right,y,{align:"right"});y+=5;doc.text("TOTAL CLOSING EQUITY INCLUDING PROFIT / (LOSS)",left,y);doc.text(money(t.closingEquityIncludingProfit),right,y,{align:"right"});finish(e);
    }
    if(selected.includes("cash-flow")){
        const e=addStatement("CASH FLOW STATEMENT",`For the period ended ${currentLabel}`);let y=e.y;const d=this.reportDataset.cashFlow?.current??{},a=d.activities??{},t=d.totals??{};
        for(const [key,label] of [["operating","OPERATING ACTIVITIES"],["investing","INVESTING ACTIVITIES"],["financing","FINANCING ACTIVITIES"],["unclassified","UNCLASSIFIED CASH MOVEMENTS"]]){const rows=Array.isArray(a[key])?a[key]:[];if(key==="unclassified"&&!rows.length)continue;y=ensure(y,e.title);doc.setFont("helvetica","bold");doc.setFontSize(7.2);doc.text(label,left,y);y+=5;for(const r of rows){y=ensure(y,e.title);doc.setFont("helvetica","normal");doc.setFontSize(6.7);doc.text(doc.splitTextToSize(`${r.journal_no??"-"}  ${r.description??""}`,145)[0]??"",left+4,y);doc.text(money(r.amount),right,y,{align:"right"});y+=4;}doc.setFont("helvetica","bold");doc.text(`NET CASH FROM ${label}`,left+4,y);doc.text(money(t[key]),right,y,{align:"right"});y+=7;}
        y=ensure(y+2,e.title);doc.setFont("helvetica","bold");doc.text("NET INCREASE / (DECREASE) IN CASH",left,y);doc.text(money(t.actualNetChange),right,y,{align:"right"});y+=5;doc.text("CASH AND CASH EQUIVALENTS AT BEGINNING OF PERIOD",left,y);doc.text(money(t.openingCash),right,y,{align:"right"});y+=5;doc.text("CASH AND CASH EQUIVALENTS AT END OF PERIOD",left,y);doc.text(money(t.closingCash),right,y,{align:"right"});finish(e);
    }
    if(selected.includes("notes")){
        const e=addStatement("NOTES TO FINANCIAL STATEMENTS",`For the periods ended ${currentLabel} and ${comparativeLabel}`);let y=e.y;
        const notes=[["1. General Information",`These notes form an integral part of the financial statements of ${company}.`],["2. Basis of Preparation",`Presentation currency: IDR. Reporting period: ${currentLabel}. Comparative period: ${comparativeLabel}. FINOVA includes Posted GL transactions only.`],["3. Material Accounting Policy Information","Complete this section according to the entity's actual accounting policies. FINOVA does not infer accounting policies from account balances."],["4. Supporting Information","Detailed balances are presented in the primary financial statements and supporting schedules."],["5. Commitments, Contingencies and Other Disclosures","Complete when applicable; these disclosures cannot be derived reliably from general-ledger balances alone."]];
        for(const [h,p] of notes){y=ensure(y,e.title);doc.setFont("helvetica","bold");doc.setFontSize(8);doc.text(h,left,y);y+=5;doc.setFont("helvetica","normal");doc.setFontSize(7);for(const line of doc.splitTextToSize(p,right-left)){y=ensure(y,e.title);doc.text(line,left,y);y+=4;}y+=4;}finish(e);
    }

    // Table of contents on reserved page 2
    doc.setPage(2);doc.setFont("helvetica","bold");doc.setFontSize(14);doc.text("TABLE OF CONTENTS",W/2,20,{align:"center"});doc.setFontSize(8);doc.text("FINANCIAL STATEMENTS",left,38);doc.setFont("helvetica","normal");doc.text("Page",right,38,{align:"right"});let y=50;
    for(const e of toc){const pg=e.start===e.end?String(e.start):`${e.start} - ${e.end}`;doc.setFont("helvetica","bold");doc.setFontSize(8);doc.text(e.title,left,y);doc.setFont("helvetica","normal");doc.text(pg,right,y,{align:"right"});y+=9;}
    const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFont("helvetica","normal");doc.setFontSize(7);doc.text(`Page ${i} of ${pages}`,right,290,{align:"right"});}
    const safeCompany=company.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"");
    doc.save(`Financial-Statement-${safeCompany}-${this.reportRequest.reporting.year}-${String(this.reportRequest.reporting.month).padStart(2,"0")}.pdf`);
}

/*
==========================================================
RENDER PREVIEW SHELL
==========================================================
*/

renderPreviewShell() {

    /*
    ======================================================
    VALIDATE PREVIEW STATE
    ======================================================
    */

    if (
        !this.reportRequest
        ||
        !this.reportDataset
    ) {

        console.warn(
            "FINOVA FINANCIAL STATEMENT PREVIEW STATE NOT READY"
        );


        return;

    }


    /*
    ======================================================
    VALIDATE PREVIEW DOM
    ======================================================
    */

    if (
        !this.previewContainer
        ||
        !this.previewCompany
        ||
        !this.previewCompanyDetail
        ||
        !this.previewPeriod
        ||
        !this.previewComparativePeriod
        ||
        !this.previewTabs
        ||
        !this.previewContent
        ||
        !this.previewGeneratedAt
    ) {

        console.warn(
            "FINOVA FINANCIAL STATEMENT PREVIEW DOM NOT READY"
        );


        return;

    }


    /*
    ======================================================
    COMPANY IDENTITY

    Official FINOVA report identity source.

    CompanyReport reads the currently initialized
    CustomerConfig which already follows the effective
    Company Context.
    ======================================================
    */

    const companyIdentity =
        CompanyReport.getIdentity();


    /*
    ======================================================
    COMPANY NAME
    ======================================================
    */

    const companyName =
        companyIdentity?.displayName
        ||
        companyIdentity?.legalName
        ||
        companyIdentity?.name
        ||
        "";


    /*
    ======================================================
    COMPANY DETAIL
    ======================================================
    */

    const companyDetail =
        companyIdentity?.contactLine
        ||
        "";


    /*
    ======================================================
    VALIDATE COMPANY IDENTITY
    ======================================================
    */

    if (
        !companyName
    ) {

        console.warn(
            "FINOVA FINANCIAL STATEMENT COMPANY IDENTITY NOT READY",
            companyIdentity
        );

    }


    /*
    ======================================================
    PERIOD LABELS
    ======================================================
    */

    const reportingLabel =
        this.formatPreviewPeriod(
            this.reportRequest.reporting.year,
            this.reportRequest.reporting.month
        );


    const comparativeLabel =
        this.formatPreviewPeriod(
            this.reportRequest.comparative.year,
            this.reportRequest.comparative.month
        );


    /*
    ======================================================
    APPLY COMPANY IDENTITY
    ======================================================
    */

    this.previewCompany.textContent =
        companyName
        ||
        "FINOVA";


    this.previewCompanyDetail.textContent =
        companyDetail
        ||
        "Financial Reporting";


    /*
    ======================================================
    APPLY PERIOD
    ======================================================
    */

    this.previewPeriod.textContent =
        reportingLabel;


    this.previewComparativePeriod.textContent =
        comparativeLabel;


    /*
    ======================================================
    GENERATED AT
    ======================================================
    */

    const generatedAt =
        this.reportGeneratedAt
        instanceof Date
            ? this.reportGeneratedAt
            : new Date();


    this.previewGeneratedAt.textContent =
        generatedAt.toLocaleString(
            "id-ID",
            {

                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }
        );


    /*
    ======================================================
    STATEMENT TABS
    ======================================================
    */

    const selectedStatements =
        this.reportRequest.statements
        ??
        [];


    const previewTabElements =
        this.previewTabs.querySelectorAll(
            "[data-financial-statement-preview]"
        );


    let firstVisibleTab =
        null;


    previewTabElements.forEach(
        tab => {

            const statement =
                tab.dataset
                    .financialStatementPreview;


            const selected =
                selectedStatements.includes(
                    statement
                );


            /*
            ==================================================
            SHOW / HIDE BASED ON STATEMENT SELECTION
            ==================================================
            */

            tab.classList.toggle(
                "d-none",
                !selected
            );


            /*
            ==================================================
            RESET ACTIVE STATE
            ==================================================
            */

            tab.classList.remove(
                "active"
            );


            /*
            ==================================================
            FIRST AVAILABLE STATEMENT
            ==================================================
            */

            if (
                selected
                &&
                !firstVisibleTab
            ) {

                firstVisibleTab =
                    tab;

            }

        }
    );


    /*
    ======================================================
    ACTIVATE FIRST SELECTED STATEMENT
    ======================================================
    */

    if (
        firstVisibleTab
    ) {

        firstVisibleTab.classList.add(
            "active"
        );

    }


    /*
    ======================================================
    FIRST STATEMENT
    ======================================================
    */

    const firstStatement =
        firstVisibleTab
            ?.dataset
            ?.financialStatementPreview
        ??
        null;


    /*
    ======================================================
    STATEMENT TITLE
    ======================================================
    */

    const statementTitles = {

        "balance-sheet":
            "Balance Sheet",

        "profit-loss":
            "Profit & Loss",

        "changes-equity":
            "Statement of Changes in Equity",

        "cash-flow":
            "Cash Flow Statement",

        "notes":
            "Notes to Financial Statements"

    };


    /*
    ======================================================
    PREVIEW CONTENT
    ======================================================
    */

    if (
        firstStatement === "balance-sheet"
    ) {

        this.previewContent.innerHTML =
            this.renderBalanceSheetPreview();

    }
    else if (
        firstStatement === "profit-loss"
    ) {

        this.previewContent.innerHTML =
            this.renderProfitLossPreview();

    }
    else if (
        firstStatement === "trial-balance"
    ) {

        this.previewContent.innerHTML =
            this.renderTrialBalancePreview();

    }
    else if (
        firstStatement === "changes-equity"
    ) {
        this.previewContent.innerHTML =
            this.renderChangesInEquityPreview();
    }
    else if (
        firstStatement === "cash-flow"
    ) {
        this.previewContent.innerHTML =
            this.renderCashFlowPreview();
    }
    else if (
        firstStatement === "notes"
    ) {
        this.previewContent.innerHTML =
            this.renderNotesPreview();
    }
    else {

        const statementTitle =
            statementTitles[
                firstStatement
            ]
            ??
            "Financial Statement";


        this.previewContent.innerHTML = `

            <div
                class="financial-statement-preview-empty"
            >

                <div
                    class="financial-statement-preview-empty-icon"
                >

                    <i
                        class="fa-solid fa-file-invoice-dollar"
                    ></i>

                </div>


                <div
                    class="financial-statement-preview-empty-title"
                >

                    ${this.escapePreviewHTML(
                        statementTitle
                    )}

                </div>


                <div
                    class="financial-statement-preview-empty-text"
                >

                    Financial statement data is ready.
                    Report rows will be rendered in the next stage.

                </div>

            </div>

        `;

    }


    /*
    ======================================================
    SHOW PREVIEW
    ======================================================
    */

    this.previewContainer.classList.remove(
        "d-none"
    );


    /*
    ======================================================
    DEBUG
    ======================================================
    */

    console.log(
        "FINOVA FINANCIAL STATEMENT PREVIEW IDENTITY:",
        {

            brand:
                companyIdentity?.brand
                ??
                "",

            name:
                companyIdentity?.name
                ??
                "",

            legalName:
                companyIdentity?.legalName
                ??
                "",

            displayName:
                companyIdentity?.displayName
                ??
                "",

            contactLine:
                companyIdentity?.contactLine
                ??
                ""

        }
    );


    console.log(
        "FINOVA FINANCIAL STATEMENT PREVIEW SHELL:",
        {

            visible:
                !this.previewContainer
                    .classList
                    .contains(
                        "d-none"
                    ),

            companyName:
                companyName,

            reportingPeriod:
                reportingLabel,

            comparativePeriod:
                comparativeLabel,

            statements:
                selectedStatements,

            firstStatement:
                firstStatement,

            generatedAt:
                generatedAt

        }
    );

}
/*
==========================================================
GET DATASET CACHE KEY
==========================================================
*/

getDatasetCacheKey(
    reportingPeriod,
    comparativePeriod
) {

    /*
    ======================================================
    VALIDATE PERIOD OBJECTS
    ======================================================
    */

    if (
        !reportingPeriod
        ||
        !comparativePeriod
    ) {

        return null;

    }


    /*
    ======================================================
    BUILD CACHE KEY

    Statement selection is NOT included.

    Dataset calculation depends on:
    - Reporting Date From
    - Reporting Date To
    - Comparative Date From
    - Comparative Date To
    ======================================================
    */

    return [

        reportingPeriod.dateFrom,

        reportingPeriod.dateTo,

        comparativePeriod.dateFrom,

        comparativePeriod.dateTo

    ]
        .join(
            "|"
        );

}
/*
==========================================================
CAN REUSE DATASET
==========================================================
*/

canReuseDataset(
    cacheKey
) {

    /*
    ======================================================
    DATASET MUST EXIST
    ======================================================
    */

    if (
        !this.reportDataset
    ) {

        return false;

    }


    /*
    ======================================================
    CACHE KEY MUST EXIST
    ======================================================
    */

    if (
        !cacheKey
        ||
        !this.reportDatasetCacheKey
    ) {

        return false;

    }


    /*
    ======================================================
    PERIODS MUST MATCH
    ======================================================
    */

    return (
        this.reportDatasetCacheKey
        ===
        cacheKey
    );

}

   async handleAction(
    action
) {

    /*
    ======================================================
    GET REQUEST
    ======================================================
    */

    const request =
        this.getReportRequest();


    /*
    ======================================================
    VALIDATE REQUEST
    ======================================================
    */

    const validation =
        this.validateReportRequest(
            request
        );


    if (
        !validation.valid
    ) {

        console.warn(
            "FINOVA FINANCIAL STATEMENT VALIDATION:",
            validation.message
        );


        return;

    }


    /*
    ======================================================
    BUILD REPORTING PERIOD
    ======================================================
    */

    const reportingPeriod =
        this.getDatasetPeriod(
            request.reporting.year,
            request.reporting.month
        );


    /*
    ======================================================
    BUILD COMPARATIVE PERIOD
    ======================================================
    */

    const comparativePeriod =
        this.getDatasetPeriod(
            request.comparative.year,
            request.comparative.month
        );


    /*
    ======================================================
    BUILD DATASET CACHE KEY
    ======================================================
    */

    const cacheKey =
        this.getDatasetCacheKey(
            reportingPeriod,
            comparativePeriod
        );


    /*
    ======================================================
    CHECK COMPLETED SNAPSHOT
    ======================================================
    */

    const reuseDataset =
        this.canReuseDataset(
            cacheKey
        );


    /*
    ======================================================
    CHECK IN-FLIGHT DATASET
    ======================================================
    */

    const waitForDataset =
        (
            !reuseDataset
            &&
            !!this.reportDatasetPromise
            &&
            this.reportDatasetPromiseCacheKey
                ===
                cacheKey
        );


    /*
    ======================================================
    ACTION DEBUG
    ======================================================
    */

    console.log(
        "FINOVA FINANCIAL STATEMENT ACTION:",
        {

            action:
                action,

            request:
                request,

            reportingPeriod:
                reportingPeriod,

            comparativePeriod:
                comparativePeriod,

            cacheKey:
                cacheKey,

            reuseDataset:
                reuseDataset,

            waitForDataset:
                waitForDataset

        }
    );


    try {

        /*
        ==================================================
        REUSE COMPLETED DATASET
        ==================================================
        */

        if (
            reuseDataset
        ) {

            console.log(
                "FINOVA FINANCIAL STATEMENT DATASET SOURCE: REUSE"
            );

        }


        /*
        ==================================================
        WAIT FOR SAME IN-FLIGHT DATASET
        ==================================================
        */

        else if (
            waitForDataset
        ) {

            console.log(
                "FINOVA FINANCIAL STATEMENT DATASET SOURCE: WAIT"
            );


            await this.reportDatasetPromise;


            if (
                !this.reportDataset
                ||
                this.reportDatasetCacheKey
                    !==
                    cacheKey
            ) {

                throw new Error(
                    "FINOVA Financial Statement in-flight dataset did not produce the requested period."
                );

            }

        }


        /*
        ==================================================
        GENERATE NEW DATASET
        ==================================================
        */

        else {

            console.log(
                "FINOVA FINANCIAL STATEMENT DATASET SOURCE: GENERATE"
            );


            const datasetPromise =
                FinancialReportService
                    .buildFinancialStatementDataset(

                        reportingPeriod.dateFrom,

                        reportingPeriod.dateTo,

                        comparativePeriod.dateFrom,

                        comparativePeriod.dateTo

                    );


            this.reportDatasetPromise =
                datasetPromise;


            this.reportDatasetPromiseCacheKey =
                cacheKey;


            try {

                const dataset =
                    await datasetPromise;


                this.reportDataset =
                    dataset;


                this.reportDatasetCacheKey =
                    cacheKey;


                this.reportGeneratedAt =
                    new Date();

            }
            finally {

                if (
                    this.reportDatasetPromise
                        ===
                        datasetPromise
                ) {

                    this.reportDatasetPromise =
                        null;


                    this.reportDatasetPromiseCacheKey =
                        null;

                }

            }

        }


        /*
        ==================================================
        STORE CURRENT OUTPUT REQUEST
        ==================================================
        */

        this.reportRequest = {

            reporting: {

                year:
                    request.reporting.year,

                month:
                    request.reporting.month,

                dateFrom:
                    reportingPeriod.dateFrom,

                dateTo:
                    reportingPeriod.dateTo

            },


            comparative: {

                year:
                    request.comparative.year,

                month:
                    request.comparative.month,

                dateFrom:
                    comparativePeriod.dateFrom,

                dateTo:
                    comparativePeriod.dateTo

            },


            statements:
                [
                    ...request.statements
                ]

        };


        /*
        ==================================================
        SNAPSHOT DEBUG
        ==================================================
        */

        console.log(
            "FINOVA FINANCIAL STATEMENT SNAPSHOT:",
            {

                request:
                    this.reportRequest,

                generatedAt:
                    this.reportGeneratedAt,

                cacheKey:
                    this.reportDatasetCacheKey,

                source:
                    reuseDataset
                        ? "REUSE"
                        : (
                            waitForDataset
                                ? "WAIT"
                                : "GENERATE"
                        ),

                hasDataset:
                    !!this.reportDataset,

                balanceSheetRows:
                    this.reportDataset
                        ?.balanceSheet
                        ?.length
                    ??
                    0,

                profitLossRows:
                    this.reportDataset
                        ?.profitLoss
                        ?.length
                    ??
                    0,

                trialBalanceCurrentRows:
                    this.reportDataset
                        ?.trialBalance
                        ?.current
                        ?.rows
                        ?.length
                    ??
                    0,

                trialBalanceComparativeRows:
                    this.reportDataset
                        ?.trialBalance
                        ?.comparative
                        ?.rows
                        ?.length
                    ??
                    0

            }
        );


        /*
        ==================================================
        DATASET DEBUG
        ==================================================
        */

        console.log(
            "FINOVA FINANCIAL STATEMENT DATASET:",
            {

                periods:
                    this.reportDataset
                        ?.periods,

                balanceSheetRows:
                    this.reportDataset
                        ?.balanceSheet
                        ?.length
                    ??
                    0,

                profitLossRows:
                    this.reportDataset
                        ?.profitLoss
                        ?.length
                    ??
                    0,

                trialBalanceCurrentRows:
                    this.reportDataset
                        ?.trialBalance
                        ?.current
                        ?.rows
                        ?.length
                    ??
                    0,

                trialBalanceComparativeRows:
                    this.reportDataset
                        ?.trialBalance
                        ?.comparative
                        ?.rows
                        ?.length
                    ??
                    0,

                totals:
                    this.reportDataset
                        ?.totals,

                controls:
                    this.reportDataset
                        ?.controls

            }
        );


        /*
        ==================================================
        ACTION
        ==================================================
        */

        switch (
            action
        ) {

            /*
            ==============================================
            PREVIEW
            ==============================================
            */

            case "preview":

                this.renderPreviewShell();


                console.log(
                    "FINOVA FINANCIAL STATEMENT PREVIEW DATA READY",
                    this.reportDataset
                );


                break;


            /*
            ==============================================
            EXCEL
            ==============================================
            */

            case "excel":

                await this.downloadExcel();

                break;


            /*
            ==============================================
            PDF
            ==============================================
            */

            case "pdf":

                await this.downloadPDF();

                break;


            /*
            ==============================================
            UNKNOWN ACTION
            ==============================================
            */

            default:

                console.warn(
                    "FINOVA FINANCIAL STATEMENT UNKNOWN ACTION:",
                    action
                );

        }

    }
    catch (
        error
    ) {

        console.error(
            "FINOVA FINANCIAL STATEMENT DATASET ERROR:",
            error
        );

    }

}
}