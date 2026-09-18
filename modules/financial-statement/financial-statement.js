/*
==========================================================
FINOVA ACCOUNTING SYSTEM
FINANCIAL STATEMENT
Version : 2.0.0
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


    this.trialBalanceCheckbox =
        document.getElementById(
            "financial-statement-trial-balance"
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
                    "trial-balance"
                ) {

                    if (
                        this.previewContent
                    ) {

                        this.previewContent.innerHTML =
                            this.renderTrialBalancePreview();

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
            this.trialBalanceCheckbox?.checked
        ) {

            statements.push(
                "trial-balance"
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

            "trial-balance"

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

            if (
                accountRows.length === 0
            ) {

                return `

                    <tr>

                        <td
                            colspan="4"
                            class="text-muted"
                        >

                            No account data.

                        </td>

                    </tr>

                `;

            }


            return accountRows

                .map(
                    row => {

                        const accountCode =
                            this.escapePreviewHTML(
                                row.account_code
                            );


                        const accountName =
                            this.escapePreviewHTML(
                                row.account_name
                            );


                        const currentAmount =
                            this.formatFinancialAmount(
                                row.current_amount
                            );


                        const comparativeAmount =
                            this.formatFinancialAmount(
                                row.comparative_amount
                            );


                        const level =
                            Math.max(
                                0,
                                Number(
                                    row.level
                                    ??
                                    0
                                )
                                ||
                                0
                            );


                        const paddingLeft =
                            10
                            +
                            (
                                level
                                *
                                22
                            );


                        const rowClass =
                            row.has_children
                                ? "financial-statement-report-parent-row"
                                : "financial-statement-report-account-row";


                        const nameWeight =
                            row.has_children
                                ? "600"
                                : "400";


                        return `

                            <tr
                                class="${rowClass}"
                                data-account-id="${this.escapePreviewHTML(
                                    row.account_id
                                )}"
                                data-account-level="${level}"
                            >

                                <td
                                    class="financial-statement-report-account-code"
                                >

                                    ${accountCode}

                                </td>


                                <td
                                    class="financial-statement-report-account-name"
                                    style="
                                        padding-left: ${paddingLeft}px;
                                        font-weight: ${nameWeight};
                                    "
                                >

                                    ${accountName}

                                </td>


                                <td
                                    class="financial-statement-report-number"
                                >

                                    ${currentAmount}

                                </td>


                                <td
                                    class="financial-statement-report-number"
                                >

                                    ${comparativeAmount}

                                </td>

                            </tr>

                        `;

                    }
                )

                .join(
                    ""
                );

        };


    /*
    ======================================================
    TOTAL ROW
    ======================================================
    */

    const renderTotalRow =
        (
            label,
            total
        ) => {

            return `

                <tr
                    class="financial-statement-report-total-row"
                >

                    <td
                        colspan="2"
                    >

                        ${this.escapePreviewHTML(
                            label
                        )}

                    </td>


                    <td
                        class="financial-statement-report-number"
                    >

                        ${this.formatFinancialAmount(
                            total?.current
                        )}

                    </td>


                    <td
                        class="financial-statement-report-number"
                    >

                        ${this.formatFinancialAmount(
                            total?.comparative
                        )}

                    </td>

                </tr>

            `;

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

                                Account

                            </th>


                            <th
                                class="financial-statement-report-account-name"
                            >

                                Account Name

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

    /*
    ======================================================
    VALIDATE DATASET
    ======================================================
    */

    if (
        !this.reportDataset
        ||
        !Array.isArray(
            this.reportDataset.profitLoss
        )
    ) {

        console.warn(
            "FINOVA PROFIT & LOSS DATASET NOT READY"
        );


        return "";

    }


    /*
    ======================================================
    DATA
    ======================================================
    */

    const rows =
        this.reportDataset.profitLoss;


    const totals =
        this.reportDataset
            ?.totals
            ?.profitLoss
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

    const revenueSource =
        rows.filter(
            row =>
                row.group === "revenue"
        );


    const expenseSource =
        rows.filter(
            row =>
                row.group === "expense"
        );


    /*
    ======================================================
    BUILD COA HIERARCHY

    Reuse hierarchy builder already validated by
    Balance Sheet.

    This does NOT recalculate accounting balances.
    ======================================================
    */

    const revenueRows =
        this.buildBalanceSheetHierarchy(
            revenueSource
        );


    const expenseRows =
        this.buildBalanceSheetHierarchy(
            expenseSource
        );


    /*
    ======================================================
    ACCOUNT ROW RENDERER
    ======================================================
    */

    const renderAccountRows =
        accountRows => {

            if (
                accountRows.length === 0
            ) {

                return `

                    <tr>

                        <td
                            colspan="4"
                            class="text-muted"
                        >

                            No account data.

                        </td>

                    </tr>

                `;

            }


            return accountRows

                .map(
                    row => {

                        const accountCode =
                            this.escapePreviewHTML(
                                row.account_code
                            );


                        const accountName =
                            this.escapePreviewHTML(
                                row.account_name
                            );


                        const currentAmount =
                            this.formatFinancialAmount(
                                row.current_amount
                            );


                        const comparativeAmount =
                            this.formatFinancialAmount(
                                row.comparative_amount
                            );


                        /*
                        ==========================================
                        HIERARCHY LEVEL
                        ==========================================
                        */

                        const level =
                            Math.max(
                                0,
                                Number(
                                    row.level
                                    ??
                                    0
                                )
                                ||
                                0
                            );


                        /*
                        ==========================================
                        INDENTATION

                        Level 0 = 10px
                        Level 1 = 32px
                        Level 2 = 54px
                        ==========================================
                        */

                        const paddingLeft =
                            10
                            +
                            (
                                level
                                *
                                22
                            );


                        /*
                        ==========================================
                        ROW TYPE
                        ==========================================
                        */

                        const rowClass =
                            row.has_children
                                ? "financial-statement-report-parent-row"
                                : "financial-statement-report-account-row";


                        const nameWeight =
                            row.has_children
                                ? "600"
                                : "400";


                        /*
                        ==========================================
                        ROW HTML
                        ==========================================
                        */

                        return `

                            <tr
                                class="${rowClass}"
                                data-account-id="${this.escapePreviewHTML(
                                    row.account_id
                                )}"
                                data-account-level="${level}"
                            >

                                <td
                                    class="financial-statement-report-account-code"
                                >

                                    ${accountCode}

                                </td>


                                <td
                                    class="financial-statement-report-account-name"
                                    style="
                                        padding-left: ${paddingLeft}px;
                                        font-weight: ${nameWeight};
                                    "
                                >

                                    ${accountName}

                                </td>


                                <td
                                    class="financial-statement-report-number"
                                >

                                    ${currentAmount}

                                </td>


                                <td
                                    class="financial-statement-report-number"
                                >

                                    ${comparativeAmount}

                                </td>

                            </tr>

                        `;

                    }
                )

                .join(
                    ""
                );

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
    TOTAL ROW
    ======================================================
    */

    const renderTotalRow =
        (
            label,
            total,
            extraClass = ""
        ) => {

            return `

                <tr
                    class="
                        financial-statement-report-total-row
                        ${extraClass}
                    "
                >

                    <td
                        colspan="2"
                    >

                        ${this.escapePreviewHTML(
                            label
                        )}

                    </td>


                    <td
                        class="financial-statement-report-number"
                    >

                        ${this.formatFinancialAmount(
                            total?.current
                        )}

                    </td>


                    <td
                        class="financial-statement-report-number"
                    >

                        ${this.formatFinancialAmount(
                            total?.comparative
                        )}

                    </td>

                </tr>

            `;

        };


    /*
    ======================================================
    BUILD PROFIT & LOSS
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

                        Profit & Loss

                    </h4>


                    <p
                        class="financial-statement-report-description"
                    >

                        Statement of Profit or Loss

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

                                Account

                            </th>


                            <th
                                class="financial-statement-report-account-name"
                            >

                                Account Name

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
                            "REVENUE"
                        )}


                        ${renderAccountRows(
                            revenueRows
                        )}


                        ${renderTotalRow(
                            "TOTAL REVENUE",
                            totals.revenue
                        )}


                        ${renderGroupHeader(
                            "EXPENSE"
                        )}


                        ${renderAccountRows(
                            expenseRows
                        )}


                        ${renderTotalRow(
                            "TOTAL EXPENSE",
                            totals.expense
                        )}


                        ${renderTotalRow(
                            "NET PROFIT / (LOSS)",
                            totals.netProfit,
                            "financial-statement-report-net-profit-row"
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
            ...revenueRows,
            ...expenseRows
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
    HIERARCHY DEBUG
    ======================================================
    */

    console.log(
        "FINOVA PROFIT & LOSS HIERARCHY:",
        {

            sourceRows:
                rows.length,

            renderedRows:
                hierarchyRows.length,

            revenueRows:
                revenueRows.length,

            expenseRows:
                expenseRows.length,

            parentRows:
                parentRows.length,

            nestedRows:
                nestedRows.length,

            maxLevel:
                maxLevel

        }
    );


    /*
    ======================================================
    PREVIEW DEBUG
    ======================================================
    */

    console.log(
        "FINOVA PROFIT & LOSS PREVIEW:",
        {

            totalRows:
                rows.length,

            revenueRows:
                revenueRows.length,

            expenseRows:
                expenseRows.length,

            renderedRows:
                hierarchyRows.length,

            totalRevenueCurrent:
                totals.revenue?.current
                ??
                0,

            totalRevenueComparative:
                totals.revenue?.comparative
                ??
                0,

            totalExpenseCurrent:
                totals.expense?.current
                ??
                0,

            totalExpenseComparative:
                totals.expense?.comparative
                ??
                0,

            netProfitCurrent:
                totals.netProfit?.current
                ??
                0,

            netProfitComparative:
                totals.netProfit?.comparative
                ??
                0

        }
    );


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return html;

}

/*
==========================================================
RENDER TRIAL BALANCE PREVIEW
==========================================================
*/

renderTrialBalancePreview() {

    const current = this.reportDataset?.trialBalance?.current;
    const comparative = this.reportDataset?.trialBalance?.comparative;

    if (!current || !Array.isArray(current.rows)) {
        console.warn("FINOVA TRIAL BALANCE DATASET NOT READY");
        return "";
    }

    const currentRows = current.rows;
    const comparativeRows = Array.isArray(comparative?.rows) ? comparative.rows : [];
    const comparativeMap = new Map(
        comparativeRows.map(row => [String(row.account_id), row])
    );

    const currentPeriod = this.formatPreviewPeriod(
        this.reportRequest.reporting.year,
        this.reportRequest.reporting.month
    );
    const comparativePeriod = this.formatPreviewPeriod(
        this.reportRequest.comparative.year,
        this.reportRequest.comparative.month
    );

    const rowsHTML = currentRows.map(row => {
        const comp = comparativeMap.get(String(row.account_id)) ?? {};
        return `
            <tr class="financial-statement-report-account-row">
                <td class="financial-statement-report-account-code">${this.escapePreviewHTML(row.account_code)}</td>
                <td class="financial-statement-report-account-name">${this.escapePreviewHTML(row.account_name)}</td>
                <td class="financial-statement-report-number">${this.formatFinancialAmount(row.ending_debit)}</td>
                <td class="financial-statement-report-number">${this.formatFinancialAmount(row.ending_credit)}</td>
                <td class="financial-statement-report-number">${this.formatFinancialAmount(comp.ending_debit)}</td>
                <td class="financial-statement-report-number">${this.formatFinancialAmount(comp.ending_credit)}</td>
            </tr>`;
    }).join("");

    const ct = current.totals ?? {};
    const pt = comparative?.totals ?? {};
    const currentDifference = Number(ct.endingDebit ?? 0) - Number(ct.endingCredit ?? 0);
    const comparativeDifference = Number(pt.endingDebit ?? 0) - Number(pt.endingCredit ?? 0);

    console.log("FINOVA TRIAL BALANCE VALIDATION:", {
        currentRows: currentRows.length,
        comparativeRows: comparativeRows.length,
        currentDifference,
        comparativeDifference,
        currentBalanced: Math.abs(currentDifference) < 0.01,
        comparativeBalanced: Math.abs(comparativeDifference) < 0.01
    });

    return `
        <div class="financial-statement-report">
            <div class="financial-statement-report-header">
                <div>
                    <h4 class="financial-statement-report-title">Trial Balance</h4>
                    <p class="financial-statement-report-description">Ending balances by account</p>
                </div>
                <div class="financial-statement-report-currency">Currency: IDR</div>
            </div>
            <div class="financial-statement-report-table-wrapper">
                <table class="financial-statement-report-table financial-statement-trial-balance-table">
                    <thead>
                        <tr>
                            <th rowspan="2" class="financial-statement-report-account-code">Account</th>
                            <th rowspan="2" class="financial-statement-report-account-name">Account Name</th>
                            <th colspan="2" class="financial-statement-report-number text-center">${this.escapePreviewHTML(currentPeriod)}</th>
                            <th colspan="2" class="financial-statement-report-number text-center">${this.escapePreviewHTML(comparativePeriod)}</th>
                        </tr>
                        <tr>
                            <th class="financial-statement-report-number">Debit</th>
                            <th class="financial-statement-report-number">Credit</th>
                            <th class="financial-statement-report-number">Debit</th>
                            <th class="financial-statement-report-number">Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML}
                        <tr class="financial-statement-report-total-row">
                            <td colspan="2">TOTAL</td>
                            <td class="financial-statement-report-number">${this.formatFinancialAmount(ct.endingDebit)}</td>
                            <td class="financial-statement-report-number">${this.formatFinancialAmount(ct.endingCredit)}</td>
                            <td class="financial-statement-report-number">${this.formatFinancialAmount(pt.endingDebit)}</td>
                            <td class="financial-statement-report-number">${this.formatFinancialAmount(pt.endingCredit)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`;
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

    const cover = [
        ["FINOVA ACCOUNTING SYSTEM"],
        ["FINANCIAL STATEMENT"],
        [],
        ["Company", company],
        ["Reporting Period", currentLabel],
        ["Comparative Period", comparativeLabel],
        ["Generated At", (this.reportGeneratedAt ?? new Date()).toLocaleString("id-ID")],
        [],
        ["Included Statements", this.reportRequest.statements.join(", ")]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cover), "Cover");

    if (this.reportRequest.statements.includes("balance-sheet")) {
        const data = [["Account", "Account Name", currentLabel, comparativeLabel]];
        for (const row of this.reportDataset.balanceSheet ?? []) {
            data.push([row.account_code, row.account_name, Number(row.current_amount ?? 0), Number(row.comparative_amount ?? 0)]);
        }
        const t = this.reportDataset.totals?.balanceSheet ?? {};
        data.push([], ["", "TOTAL ASSETS", Number(t.asset?.current ?? 0), Number(t.asset?.comparative ?? 0)]);
        data.push(["", "TOTAL LIABILITIES & EQUITY", Number(t.liabilityAndEquity?.current ?? 0), Number(t.liabilityAndEquity?.comparative ?? 0)]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Balance Sheet");
    }

    if (this.reportRequest.statements.includes("profit-loss")) {
        const data = [["Account", "Account Name", currentLabel, comparativeLabel]];
        for (const row of this.reportDataset.profitLoss ?? []) {
            data.push([row.account_code, row.account_name, Number(row.current_amount ?? 0), Number(row.comparative_amount ?? 0)]);
        }
        const t = this.reportDataset.totals?.profitLoss ?? {};
        data.push([], ["", "TOTAL REVENUE", Number(t.revenue?.current ?? 0), Number(t.revenue?.comparative ?? 0)]);
        data.push(["", "TOTAL EXPENSE", Number(t.expense?.current ?? 0), Number(t.expense?.comparative ?? 0)]);
        data.push(["", "NET PROFIT / (LOSS)", Number(t.netProfit?.current ?? 0), Number(t.netProfit?.comparative ?? 0)]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Profit & Loss");
    }

    if (this.reportRequest.statements.includes("trial-balance")) {
        const c = this.reportDataset.trialBalance?.current ?? {};
        const p = this.reportDataset.trialBalance?.comparative ?? {};
        const pMap = new Map((p.rows ?? []).map(row => [String(row.account_id), row]));
        const data = [["Account", "Account Name", `${currentLabel} Debit`, `${currentLabel} Credit`, `${comparativeLabel} Debit`, `${comparativeLabel} Credit`]];
        for (const row of c.rows ?? []) {
            const comp = pMap.get(String(row.account_id)) ?? {};
            data.push([row.account_code, row.account_name, Number(row.ending_debit ?? 0), Number(row.ending_credit ?? 0), Number(comp.ending_debit ?? 0), Number(comp.ending_credit ?? 0)]);
        }
        data.push([], ["", "TOTAL", Number(c.totals?.endingDebit ?? 0), Number(c.totals?.endingCredit ?? 0), Number(p.totals?.endingDebit ?? 0), Number(p.totals?.endingCredit ?? 0)]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Trial Balance");
    }

    const safeCompany = company.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    XLSX.writeFile(wb, `Financial-Statement-${safeCompany}-${this.reportRequest.reporting.year}-${String(this.reportRequest.reporting.month).padStart(2, "0")}.xlsx`);
    console.log("FINOVA FINANCIAL STATEMENT EXCEL DOWNLOADED");
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
    const money = value => this.formatFinancialAmount(value);
    const pageWidth = doc.internal.pageSize.getWidth();
    const left = 14;
    const right = pageWidth - 14;

    const header = title => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.text(company, left, 16);
        doc.setFontSize(11); doc.text(title, left, 23);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        doc.text(`${currentLabel} | Comparative: ${comparativeLabel} | Currency: IDR`, left, 29);
        doc.line(left, 32, right, 32);
        return 39;
    };

    const ensurePage = (y, title) => {
        if (y <= 280) return y;
        doc.addPage();
        return header(title);
    };

    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.text("FINANCIAL STATEMENT", pageWidth / 2, 70, { align: "center" });
    doc.setFontSize(14); doc.text(company, pageWidth / 2, 84, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Reporting Period: ${currentLabel}`, pageWidth / 2, 98, { align: "center" });
    doc.text(`Comparative Period: ${comparativeLabel}`, pageWidth / 2, 105, { align: "center" });
    doc.text("Generated by FINOVA Accounting System", pageWidth / 2, 240, { align: "center" });

    const renderFourColumn = (title, rows, totals) => {
        doc.addPage(); let y = header(title);
        doc.setFont("helvetica", "bold"); doc.setFontSize(7);
        doc.text("Account", left, y); doc.text("Account Name", 38, y); doc.text(currentLabel, 151, y, { align: "right" }); doc.text(comparativeLabel, right, y, { align: "right" }); y += 5;
        doc.setFont("helvetica", "normal");
        for (const row of rows) {
            y = ensurePage(y, title); doc.setFontSize(6.5);
            doc.text(String(row.account_code ?? ""), left, y);
            const name = doc.splitTextToSize(String(row.account_name ?? ""), 90)[0] ?? "";
            doc.text(name, 38, y);
            doc.text(money(row.current_amount), 151, y, { align: "right" });
            doc.text(money(row.comparative_amount), right, y, { align: "right" }); y += 4;
        }
        doc.setFont("helvetica", "bold");
        for (const [label, value] of totals) {
            y = ensurePage(y + 2, title); doc.text(label, 38, y); doc.text(money(value?.current), 151, y, { align: "right" }); doc.text(money(value?.comparative), right, y, { align: "right" }); y += 5;
        }
    };

    if (this.reportRequest.statements.includes("balance-sheet")) {
        const t = this.reportDataset.totals?.balanceSheet ?? {};
        renderFourColumn("Balance Sheet", this.reportDataset.balanceSheet ?? [], [["TOTAL ASSETS", t.asset], ["TOTAL LIABILITIES & EQUITY", t.liabilityAndEquity]]);
    }
    if (this.reportRequest.statements.includes("profit-loss")) {
        const t = this.reportDataset.totals?.profitLoss ?? {};
        renderFourColumn("Profit & Loss", this.reportDataset.profitLoss ?? [], [["TOTAL REVENUE", t.revenue], ["TOTAL EXPENSE", t.expense], ["NET PROFIT / (LOSS)", t.netProfit]]);
    }
    if (this.reportRequest.statements.includes("trial-balance")) {
        doc.addPage(); let y = header("Trial Balance");
        const c = this.reportDataset.trialBalance?.current ?? {};
        const p = this.reportDataset.trialBalance?.comparative ?? {};
        const pMap = new Map((p.rows ?? []).map(row => [String(row.account_id), row]));
        doc.setFont("helvetica", "bold"); doc.setFontSize(6.5);
        doc.text("Account", left, y); doc.text("Account Name", 35, y); doc.text("Dr", 125, y, {align:"right"}); doc.text("Cr", 148, y, {align:"right"}); doc.text("Comp Dr", 172, y, {align:"right"}); doc.text("Comp Cr", right, y, {align:"right"}); y += 5;
        doc.setFont("helvetica", "normal");
        for (const row of c.rows ?? []) {
            y = ensurePage(y, "Trial Balance"); const comp = pMap.get(String(row.account_id)) ?? {};
            doc.text(String(row.account_code ?? ""), left, y); doc.text((doc.splitTextToSize(String(row.account_name ?? ""), 72)[0] ?? ""), 35, y);
            doc.text(money(row.ending_debit), 125, y, {align:"right"}); doc.text(money(row.ending_credit), 148, y, {align:"right"}); doc.text(money(comp.ending_debit), 172, y, {align:"right"}); doc.text(money(comp.ending_credit), right, y, {align:"right"}); y += 4;
        }
    }

    const safeCompany = company.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    doc.save(`Financial-Statement-${safeCompany}-${this.reportRequest.reporting.year}-${String(this.reportRequest.reporting.month).padStart(2, "0")}.pdf`);
    console.log("FINOVA FINANCIAL STATEMENT PDF DOWNLOADED");
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

        "trial-balance":
            "Trial Balance"

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