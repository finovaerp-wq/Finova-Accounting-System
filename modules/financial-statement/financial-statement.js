/*
==========================================================
FINOVA ACCOUNTING SYSTEM
FINANCIAL STATEMENT
Version : 1.1.0
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
    ACTION BUTTONS
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

            preview:
                !!this.btnPreview,

            excel:
                !!this.btnExcel,

            pdf:
                !!this.btnPdf,

            previewContainer:
                !!this.previewContainer,

            previewCompany:
                !!this.previewCompany,

            previewCompanyDetail:
                !!this.previewCompanyDetail,

            previewPeriod:
                !!this.previewPeriod,

            previewComparativePeriod:
                !!this.previewComparativePeriod,

            previewTabs:
                !!this.previewTabs,

            previewContent:
                !!this.previewContent,

            previewGeneratedAt:
                !!this.previewGeneratedAt

        }
    );

}


    /*
    ======================================================
    BIND EVENTS
    ======================================================
    */

    bindEvents() {

        /*
        ==================================================
        PREVIEW
        ==================================================
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
        ==================================================
        DOWNLOAD EXCEL
        ==================================================
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
        ==================================================
        DOWNLOAD PDF
        ==================================================
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
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "FINOVA FINANCIAL STATEMENT EVENTS BOUND"
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

    FINOVA App already loads CustomerConfig for the
    effective Company Context.

    Use available application identity without making
    another accounting-data query.
    ======================================================
    */

    const customerConfig =
        window.CustomerConfig
        ??
        window.customerConfig
        ??
        null;


    const company =
        window.finovaCompany
        ??
        window.currentCompany
        ??
        null;


    const companyName =
        customerConfig?.company_name
        ??
        customerConfig?.companyName
        ??
        company?.company_name
        ??
        company?.companyName
        ??
        "FINOVA";


    const companyCode =
        customerConfig?.company_code
        ??
        customerConfig?.companyCode
        ??
        company?.company_code
        ??
        company?.companyCode
        ??
        "";


    /*
    ======================================================
    COMPANY DETAIL
    ======================================================
    */

    const companyDetailParts =
        [];


    if (
        companyCode
    ) {

        companyDetailParts.push(
            companyCode
        );

    }


    if (
        customerConfig?.address
    ) {

        companyDetailParts.push(
            customerConfig.address
        );

    }


    const companyDetail =
        companyDetailParts.length > 0
            ? companyDetailParts.join(
                " • "
            )
            : "Financial Reporting";


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
    APPLY COMPANY
    ======================================================
    */

    this.previewCompany.textContent =
        companyName;


    this.previewCompanyDetail.textContent =
        companyDetail;


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


            tab.classList.toggle(
                "d-none",
                !selected
            );


            tab.classList.remove(
                "active"
            );


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
    INITIAL PREVIEW CONTENT

    FS-3.2C only connects the shell.

    Actual Balance Sheet / Profit & Loss / Trial Balance
    rows will be rendered in the next substep.
    ======================================================
    */

    const firstStatement =
        firstVisibleTab
            ?.dataset
            ?.financialStatementPreview
        ??
        null;


    const statementTitles = {

        "balance-sheet":
            "Balance Sheet",

        "profit-loss":
            "Profit & Loss",

        "trial-balance":
            "Trial Balance"

    };


    const statementTitle =
        statementTitles[
            firstStatement
        ]
        ??
        "Financial Statement";


    this.previewContent.innerHTML = `

        <div class="financial-statement-preview-empty">

            <div class="financial-statement-preview-empty-icon">

                <i class="fa-solid fa-file-invoice-dollar"></i>

            </div>


            <div class="financial-statement-preview-empty-title">

                ${statementTitle}

            </div>


            <div class="financial-statement-preview-empty-text">

                Financial statement data is ready.
                Report rows will be rendered in the next stage.

            </div>

        </div>

    `;


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

            companyCode:
                companyCode,

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

                console.log(
                    "FINOVA FINANCIAL STATEMENT EXCEL DATA READY",
                    this.reportDataset
                );


                break;


            /*
            ==============================================
            PDF
            ==============================================
            */

            case "pdf":

                console.log(
                    "FINOVA FINANCIAL STATEMENT PDF DATA READY",
                    this.reportDataset
                );


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