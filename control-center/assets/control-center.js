/*
==========================================================
FINOVA CONTROL CENTER
Version : 3.1
FINAL
==========================================================
*/


/*
==========================================================
IMPORT
==========================================================
*/

import {
    ControlCenterService
} from "../service/control-center.service.js";


/*
==========================================================
STATE
==========================================================
*/

const state = {

    companies: [],

    subscriptions: [],

    users: [],

    plans: [],

    dashboard: null,

    auditLogs: [],

    auditModule: "ALL",

    auditPage: 1,

    auditPageSize: 100,

    auditTotalRecords: 0,

    auditTotalPages: 1,

    auditLoading: false

};

/*
==========================================================
AUDIT LOG REALTIME STATE
==========================================================
*/

let auditRealtimeChannel =
    null;

let auditRealtimeRefreshTimer =
    null;

let auditRealtimeRefreshing =
    false;

let auditRealtimeRefreshPending =
    false;



/*
==========================================================
PAGE CONFIGURATION
==========================================================
*/

const pages = {

    overview: [

        "Overview",

        "Ringkasan seluruh customer FINOVA."

    ],


    companies: [

        "Companies",

        "Kelola perusahaan/customer FINOVA."

    ],


    subscriptions: [

        "Subscriptions",

        "Kelola paket, periode, tagihan dan status subscription."

    ],


    users: [

        "Users",

        "Hubungkan user FINOVA ke perusahaan dan kontrol quota."

    ],


    "backup-monitor": [

        "Backup Monitor",

        "Monitor status backup platform dan per-company."

    ],


    "audit-log": [

        "Audit Log",

        "Riwayat aktivitas dan perubahan data lintas company."

    ]

};


/*
==========================================================
ACCOUNTING MODULE AUDIT MAP
==========================================================

Satu audit engine, tetapi setiap module memiliki view audit
tersendiri. Nilai source_module/module menjadi prioritas,
kemudian table_name digunakan sebagai fallback.
==========================================================
*/

const auditModules = [

    { key: "ALL", label: "All Modules", icon: "fa-layer-group", aliases: [] },

    { key: "USER_MANAGEMENT", label: "User Management", icon: "fa-users-gear", aliases: ["USER", "USERS", "USER MANAGEMENT"] },
    { key: "BUSINESS_PARTNER", label: "Business Partner", icon: "fa-handshake", aliases: ["BP", "BUSINESS PARTNER", "BUSINESS_PARTNER"] },
    { key: "CHART_OF_ACCOUNTS", label: "Chart of Accounts", icon: "fa-sitemap", aliases: ["COA", "CHART OF ACCOUNTS", "CHART_OF_ACCOUNTS"] },
    { key: "TAX", label: "Tax Master", icon: "fa-percent", aliases: ["TAX", "TAX MASTER", "TAX_MASTER"] },
    { key: "ACCOUNTING_PERIOD", label: "Accounting Period", icon: "fa-calendar-days", aliases: ["PERIOD", "ACCOUNTING PERIOD", "ACCOUNTING_PERIOD"] },
    { key: "ACCOUNT_PAYABLE", label: "Account Payable", icon: "fa-file-invoice-dollar", aliases: ["AP", "ACCOUNT PAYABLE", "ACCOUNT_PAYABLE"] },
    { key: "ACCOUNT_RECEIVABLE", label: "Account Receivable", icon: "fa-file-invoice", aliases: ["AR", "ACCOUNT RECEIVABLE", "ACCOUNT_RECEIVABLE"] },
    { key: "AGING_PAYABLE", label: "Aging Payable", icon: "fa-clock-rotate-left", aliases: ["AGING AP", "AGING PAYABLE", "AGING_PAYABLE"] },
    { key: "AGING_RECEIVABLE", label: "Aging Receivable", icon: "fa-hourglass-half", aliases: ["AGING AR", "AGING RECEIVABLE", "AGING_RECEIVABLE"] },
    { key: "GL_JOURNAL", label: "GL Journal", icon: "fa-book", aliases: ["GL", "GJ", "GL JOURNAL", "GL_JOURNAL", "GENERAL JOURNAL"] },
    { key: "FIXED_ASSET", label: "Fixed Asset", icon: "fa-building-columns", aliases: ["FA", "FIXED ASSET", "FIXED_ASSET"] },
    { key: "GENERAL_LEDGER", label: "General Ledger", icon: "fa-list-check", aliases: ["GENERAL LEDGER", "GENERAL_LEDGER"] },
    { key: "TRIAL_BALANCE", label: "Trial Balance", icon: "fa-scale-balanced", aliases: ["TB", "TRIAL BALANCE", "TRIAL_BALANCE", "TRIAL BALANCE YEAR"] },
    { key: "BALANCE_SHEET", label: "Balance Sheet", icon: "fa-table-columns", aliases: ["BS", "BALANCE SHEET", "BALANCE_SHEET"] },
    { key: "PROFIT_LOSS", label: "Profit & Loss", icon: "fa-chart-line", aliases: ["P&L", "PL", "PROFIT LOSS", "PROFIT & LOSS", "PROFIT_LOSS"] },
    { key: "FINANCIAL_STATEMENT", label: "Financial Statement", icon: "fa-file-lines", aliases: ["FINANCIAL STATEMENT", "FINANCIAL_STATEMENT"] },
    { key: "CASH_FLOW_FORECAST", label: "Cash Flow Forecast", icon: "fa-money-bill-trend-up", aliases: ["CASH FLOW", "CASH FLOW FORECAST", "CASH_FLOW_FORECAST"] },
    { key: "SETTINGS", label: "Settings", icon: "fa-gear", aliases: ["SETTING", "SETTINGS"] }

];


const auditTableModuleMap = {

    mst_users: "USER_MANAGEMENT",
    mst_business_partner: "BUSINESS_PARTNER",
    mst_business_partner_bank: "BUSINESS_PARTNER",
    mst_term_of_payment: "BUSINESS_PARTNER",
    mst_chart_of_accounts: "CHART_OF_ACCOUNTS",
    mst_accounting_period: "ACCOUNTING_PERIOD",
    trx_accounting_period_history: "ACCOUNTING_PERIOD",
    trx_account_payable: "ACCOUNT_PAYABLE",
    trx_ap_payment: "ACCOUNT_PAYABLE",
    trx_ap_payment_batch: "ACCOUNT_PAYABLE",
    trx_account_receivable: "ACCOUNT_RECEIVABLE",
    trx_account_receivable_payment: "ACCOUNT_RECEIVABLE",
    trx_gl_journal: "GL_JOURNAL",
    trx_gl_journal_detail: "GL_JOURNAL",
    mst_fixed_asset_category: "FIXED_ASSET",
    mst_fixed_asset: "FIXED_ASSET",
    trx_fixed_asset_depreciation: "FIXED_ASSET",
    trx_cash_flow_forecast_manual: "CASH_FLOW_FORECAST",
    finova_company_settings: "SETTINGS"

};


function normalizeAuditModule(value) {

    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/-/g, "_");

}


function getAuditModuleKey(item) {

    if (!item) {
        return "OTHER";
    }

    /*
       IMPORTANT: table_name identifies the module that actually owns
       the audited record. source_module is only the origin/trace of a
       cross-module transaction (e.g. AP -> GL) and must NOT override
       the owning module.
    */
    const candidates = [
        item.table_name,
        item.module,
        item.source_module
    ];

    for (const candidate of candidates) {

        const normalized = normalizeAuditModule(candidate);

        if (!normalized) {
            continue;
        }

        const byTable = auditTableModuleMap[String(candidate).trim().toLowerCase()];
        if (byTable) {
            return byTable;
        }

        for (const module of auditModules) {
            if (module.key === normalized || module.aliases.includes(normalized) || module.aliases.includes(String(candidate || "").trim().toUpperCase())) {
                return module.key;
            }
        }

        /* Common source values used by FINOVA transaction flows. */
        if (normalized === "AR_INVOICE" || normalized === "AR_PAYMENT") return "ACCOUNT_RECEIVABLE";
        if (normalized === "AP_INVOICE" || normalized === "AP_PAYMENT") return "ACCOUNT_PAYABLE";
        if (normalized === "GJ" || normalized === "JOURNAL") return "GL_JOURNAL";
    }

    return "OTHER";

}


function getAuditModuleMeta(key) {

    return auditModules.find((module) => module.key === key)
        || { key, label: key === "OTHER" ? "Other / Unmapped" : key, icon: "fa-circle-question", aliases: [] };

}


/*
==========================================================
FORMAT IDR
==========================================================
*/

const idr = (
    value
) => {

    return new Intl.NumberFormat(
        "id-ID",
        {

            style:
                "currency",

            currency:
                "IDR",

            maximumFractionDigits:
                0

        }
    ).format(
        Number(
            value || 0
        )
    );

};


/*
==========================================================
ESCAPE HTML
==========================================================
*/

const esc = (
    value
) => {

    return String(
        value ?? ""
    ).replace(
        /[&<>'"]/g,
        (
            char
        ) => ({

            "&":
                "&amp;",

            "<":
                "&lt;",

            ">":
                "&gt;",

            "'":
                "&#39;",

            '"':
                "&quot;"

        }[char])
    );

};


/*
==========================================================
FORMAT DATE
==========================================================
*/

const fmtDate = (
    value
) => {

    if (
        !value
    ) {

        return "-";

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return new Intl.DateTimeFormat(
        "id-ID",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    ).format(
        date
    );

};


/*
==========================================================
GENERAL BADGE
==========================================================
*/

function badge(
    value
) {

    const currentValue =
        String(
            value || ""
        ).toUpperCase();


    let badgeClass =
        "neutral";


    if (
        [
            "ACTIVE",
            "PAID"
        ].includes(
            currentValue
        )
    ) {

        badgeClass =
            "success";

    }
    else if (
        [
            "SUSPENDED",
            "OVERDUE",
            "UNPAID"
        ].includes(
            currentValue
        )
    ) {

        badgeClass =
            "warning";

    }
    else if (
        [
            "INACTIVE",
            "CANCELLED"
        ].includes(
            currentValue
        )
    ) {

        badgeClass =
            "danger";

    }


    return `

        <span class="cc-badge ${badgeClass}">

            ${esc(
                currentValue || "-"
            )}

        </span>

    `;

}


/*
==========================================================
AUDIT ACTION BADGE
==========================================================
*/

function getAuditRemarks(item) {

    const direct =
        item?.remarks
        ||
        item?.void_reason
        ||
        item?.new_data?.void_reason
        ||
        item?.new_data?.remarks
        ||
        item?.new_data?.void_remarks
        ||
        "";

    return String(direct || "").trim();

}


function auditBadge(
    value
) {

    const action =
        String(
            value || ""
        ).toUpperCase();


    let badgeClass =
        "neutral";


    switch (
        action
    ) {

        case "CREATE":

            badgeClass =
                "create";

            break;


        case "UPDATE":

            badgeClass =
                "update";

            break;


        case "POST":

            badgeClass =
                "post";

            break;


        case "COMPLETE":

            badgeClass =
                "complete";

            break;


        case "PAID":

            badgeClass =
                "paid";

            break;


        case "APPROVE":

            badgeClass =
                "approve";

            break;


        case "DRAFT":

            badgeClass =
                "draft";

            break;


        case "VOID":

            badgeClass =
                "void";

            break;


        case "DELETE":

            badgeClass =
                "delete";

            break;

    }


    return `

        <span class="cc-badge ${badgeClass}">

            ${esc(
                action || "-"
            )}

        </span>

    `;

}


/*
==========================================================
FORMAT AUDIT DATE / TIME
==========================================================
*/

function fmtAuditDateTime(
    value
) {

    if (
        !value
    ) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return new Intl.DateTimeFormat(
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
                "2-digit",

            second:
                "2-digit"

        }
    ).format(
        date
    );

}


/*
==========================================================
FORMAT AUDIT JSON
==========================================================
*/

function formatAuditJson(
    value
) {

    if (
        value === null
        ||
        value === undefined
    ) {

        return "-";

    }


    try {

        return JSON.stringify(
            value,
            null,
            2
        );

    }
    catch (
        error
    ) {

        console.warn(
            "Unable to format audit JSON:",
            error
        );


        return String(
            value
        );

    }

}


/*
==========================================================
AUDIT DISPLAY VALUE
==========================================================
*/

function auditDisplayValue(
    value
) {

    if (
        value === null
        ||
        value === undefined
        ||
        value === ""
    ) {

        return "-";

    }


    if (
        typeof value === "object"
    ) {

        return formatAuditJson(
            value
        );

    }


    return String(
        value
    );

}


/*
==========================================================
GET AUDIT CHANGED FIELDS
==========================================================
*/

function getAuditChangedFields(
    oldData,
    newData
) {

    const before =

        oldData
        &&
        typeof oldData === "object"
        &&
        !Array.isArray(
            oldData
        )

            ?

        oldData

            :

        {};


    const after =

        newData
        &&
        typeof newData === "object"
        &&
        !Array.isArray(
            newData
        )

            ?

        newData

            :

        {};


    const keys =
        new Set(
            [

                ...Object.keys(
                    before
                ),

                ...Object.keys(
                    after
                )

            ]
        );


    const changes =
        [];


    keys.forEach(
        (
            key
        ) => {

            const oldValue =
                before[key];


            const newValue =
                after[key];


            let oldCompare;

            let newCompare;


            try {

                oldCompare =
                    JSON.stringify(
                        oldValue
                    );

            }
            catch {

                oldCompare =
                    String(
                        oldValue
                    );

            }


            try {

                newCompare =
                    JSON.stringify(
                        newValue
                    );

            }
            catch {

                newCompare =
                    String(
                        newValue
                    );

            }


            if (
                oldCompare
                !==
                newCompare
            ) {

                changes.push(
                    {

                        field:
                            key,

                        oldValue,

                        newValue

                    }
                );

            }

        }
    );


    return changes;

}


/*
==========================================================
GET COMPANY DISPLAY
==========================================================
*/

function getCompanyDisplay(
    companyId
) {

    if (
        !companyId
    ) {

        return "SYSTEM";

    }


    const company =
        state.companies.find(
            (
                item
            ) => {

                return (
                    item.id
                    ===
                    companyId
                );

            }
        );


    if (
        !company
    ) {

        return companyId;

    }


    return `${company.company_code} — ${company.company_name}`;

}


/*
==========================================================
GET AUDIT DOCUMENT
==========================================================
*/

function getAuditDocument(
    item
) {

    if (
        !item
    ) {

        return "-";

    }


    return (
        item.document_no
        ||
        item.source_no
        ||
        "-"
    );

}


/*
==========================================================
GET AUDIT RECORD
==========================================================
*/

function getAuditRecord(
    auditId
) {

    if (
        !auditId
    ) {

        return null;

    }


    return (
        state.auditLogs.find(
            (
                item
            ) => {

                return (
                    String(
                        item.id
                    )
                    ===
                    String(
                        auditId
                    )
                );

            }
        )
        ||
        null
    );

}


/*
==========================================================
SET TEXT
==========================================================
*/

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        !element
    ) {

        return;

    }


    element.textContent =
        value === null
        ||
        value === undefined
        ||
        value === ""

            ?

        "-"

            :

        String(
            value
        );

}


/*
==========================================================
SHOW ERROR
==========================================================
*/

function showError(
    error
) {

    console.error(
        error
    );


    const message =

        error?.message === "AUTH_REQUIRED"

            ?

        "Silakan login terlebih dahulu."

            :

        error?.message === "SUPER_ADMIN_REQUIRED"

            ?

        "Akun ini bukan FINOVA Super Admin."

            :

        (
            error?.message
            ||
            "Terjadi kesalahan."
        );


    const alertElement =
        document.getElementById(
            "cc-alert"
        );


    if (
        !alertElement
    ) {

        return;

    }


    alertElement.className =
        "cc-alert error";


    alertElement.textContent =
        message;


    alertElement.hidden =
        false;

}


/*
==========================================================
SHOW INFO
==========================================================
*/

function showInfo(
    message
) {

    const alertElement =
        document.getElementById(
            "cc-alert"
        );

    if (
        !alertElement
    ) {

        return;

    }

    alertElement.className =
        "cc-alert success";

    alertElement.textContent =
        message;

    alertElement.hidden =
        false;

    alertElement.style.display =
        "";

    window.setTimeout(
        () => {

            alertElement.hidden =
                true;

            alertElement.style.display =
                "none";

        },
        3500
    );

}


/*
==========================================================
CLOSE SIDEBAR
==========================================================
*/

function closeSidebar() {

    document
        .getElementById(
            "cc-sidebar"
        )
        ?.classList.remove(
            "show"
        );


    document
        .getElementById(
            "cc-overlay"
        )
        ?.classList.remove(
            "show"
        );

}


/*
==========================================================
OPEN / TOGGLE SIDEBAR
==========================================================
*/

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "cc-sidebar"
        );


    const overlay =
        document.getElementById(
            "cc-overlay"
        );


    if (
        !sidebar
    ) {

        return;

    }


    sidebar.classList.toggle(
        "show"
    );


    overlay
        ?.classList.toggle(
            "show",
            sidebar.classList.contains(
                "show"
            )
        );

}


/*
==========================================================
NAVIGATION
==========================================================
*/

function navigate(
    name,
    auditModule = null
) {

    const targetName =
        pages[name]
            ?
        name
            :
        "overview";


    if (targetName === "audit-log" && auditModule) {
        state.auditModule = String(auditModule).toUpperCase();
    }


    /*
    ======================================================
    HIDE ALL PAGE
    ======================================================
    */

    document
        .querySelectorAll(
            ".cc-page"
        )
        .forEach(
            (
                element
            ) => {

                element.classList.remove(
                    "active"
                );

            }
        );


    /*
    ======================================================
    RESET NAVIGATION ACTIVE
    ======================================================
    */

    document
        .querySelectorAll(
            ".cc-nav-item, .cc-nav-audit"
        )
        .forEach(
            (
                element
            ) => {

                element.classList.remove(
                    "active"
                );

            }
        );


    /*
    ======================================================
    SHOW TARGET PAGE
    ======================================================
    */

    document
        .getElementById(
            `page-${targetName}`
        )
        ?.classList.add(
            "active"
        );


    /*
    ======================================================
    SET NAVIGATION ACTIVE
    ======================================================
    */

    document
        .querySelector(
            `.cc-nav-item[data-page="${targetName}"]`
        )
        ?.classList.add(
            "active"
        );

    if (targetName === "audit-log") {
        document
            .querySelector(
                `.cc-nav-audit[data-audit-module="${state.auditModule}"]`
            )
            ?.classList.add("active");
    }


    /*
    ======================================================
    PAGE TITLE / SUBTITLE
    ======================================================
    */

    const pageMeta =
        pages[targetName]
        ||
        pages.overview;


    const pageTitle =
        document.getElementById(
            "cc-page-title"
        );


    const pageSubtitle =
        document.getElementById(
            "cc-page-subtitle"
        );


    if (
        pageTitle
    ) {

        pageTitle.textContent =
            pageMeta[0];

    }


    if (
        pageSubtitle
    ) {

        pageSubtitle.textContent =
            pageMeta[1];

    }


    if (targetName === "audit-log") {
        if (pageTitle) {
            pageTitle.textContent = "Audit Log";
        }
        if (pageSubtitle) {
            pageSubtitle.textContent = "Riwayat CREATE, UPDATE, POST, COMPLETE, PAID, VOID, DELETE dan perubahan data lintas seluruh module accounting FINOVA.";
        }
        renderAuditModuleTabs();
        renderAuditLogs();
    }


    /*
    ======================================================
    UPDATE HASH
    ======================================================
    */

    history.replaceState(
        null,
        "",
        `#${targetName}`
    );


    /*
    ======================================================
    CLOSE MOBILE SIDEBAR
    ======================================================
    */

    closeSidebar();

}


/*
==========================================================
LOAD ALL DATA
==========================================================
*/

async function loadAll() {

    /*
    ======================================================
    SUPER ADMIN GATE
    ======================================================
    */

    const auth =
        await ControlCenterService
            .requireSuperAdmin();


    /*
    ======================================================
    ADMIN INITIAL
    ======================================================
    */

    const initials =

        (
            auth.admin.full_name
            ||
            auth.user.email
            ||
            "FA"
        )
            .split(
                /\s+/
            )
            .filter(
                Boolean
            )
            .map(
                (
                    item
                ) => {

                    return (
                        item[0]
                        ||
                        ""
                    );

                }
            )
            .join(
                ""
            )
            .slice(
                0,
                2
            )
            .toUpperCase();


    /*
    ======================================================
    ADMIN DOM
    ======================================================
    */

    const avatarElement =
        document.getElementById(
            "cc-avatar"
        );


    const adminNameElement =
        document.getElementById(
            "cc-admin-name"
        );


    if (
        avatarElement
    ) {

        avatarElement.textContent =
            initials
            ||
            "FA";

    }


    if (
        adminNameElement
    ) {

        adminNameElement.textContent =

            auth.admin.full_name
            ||
            auth.user.email
            ||
            "FINOVA Owner";

    }


    /*
    ======================================================
    LOAD DATA INDEPENDENTLY
    ======================================================
    */

    const results = await Promise.allSettled([
        ControlCenterService.getDashboardData(),
        ControlCenterService.getPlans()
    ]);

    const dashboard = results[0].status === "fulfilled" ? results[0].value : null;
    const plans = results[1].status === "fulfilled" ? results[1].value : [];

    await loadAuditLogPage(1, false);

    const auditLogs = Array.isArray(state.auditLogs) ? state.auditLogs : [];

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            console.error("Control Center load failed:", index, result.reason);
        }
    });

    Object.assign(state, dashboard || {}, {
        dashboard: dashboard || state.dashboard || null,
        plans: Array.isArray(plans) ? plans : [],
        auditLogs: Array.isArray(auditLogs) ? auditLogs : []
    });

    /*
    ======================================================
    RENDER
    ======================================================
    */

    renderAll();

}


/*
==========================================================
REFRESH AUDIT LOG ONLY
==========================================================
*/

async function refreshAuditLogsRealtime() {
    try {
        await loadAuditLogPage(state.auditPage || 1, false);
    } catch (error) {
        console.error("Control Center audit refresh failed:", error);
        showError(error);
    }
}

/*
==========================================================
START AUDIT LOG REALTIME
==========================================================
*/

function startAuditLogRealtime() {

    /*
    ======================================================
    PREVENT DUPLICATE SUBSCRIPTION
    ======================================================
    */

    if (
        auditRealtimeChannel
    ) {

        console.log(
            "CONTROL CENTER AUDIT REALTIME ALREADY ACTIVE"
        );

        return;

    }


    /*
    ======================================================
    SUBSCRIBE
    ======================================================
    */

    try {

        auditRealtimeChannel =
            ControlCenterService.subscribeAuditLogs(
                () => {

                    /*
                    ==========================================
                    PREVENT MULTIPLE REFRESH AT ONCE
                    ==========================================
                    */

                    if (
                        auditRealtimeRefreshTimer
                    ) {

                        window.clearTimeout(
                            auditRealtimeRefreshTimer
                        );

                    }


                    /*
                    ==========================================
                    DEBOUNCE REFRESH
                    ==========================================
                    */

                    auditRealtimeRefreshTimer =
                        window.setTimeout(
                            async () => {

                                /*
                                ==================================
                                PREVENT CONCURRENT REFRESH
                                ==================================
                                */

                                if (
                                    auditRealtimeRefreshing
                                ) {

                                    auditRealtimeRefreshPending =
                                        true;

                                    return;

                                }


                                auditRealtimeRefreshing =
                                    true;


                                try {

                                    await refreshAuditLogsRealtime();

                                }
                                catch (
                                    error
                                ) {

                                    console.error(
                                        "CONTROL CENTER AUDIT REALTIME REFRESH FAILED:",
                                        error
                                    );

                                }
                                finally {

                                    auditRealtimeRefreshing =
                                        false;


                                    /*
                                    ==================================
                                    PENDING EVENT
                                    ==================================
                                    */

                                    if (
                                        auditRealtimeRefreshPending
                                    ) {

                                        auditRealtimeRefreshPending =
                                            false;


                                        /*
                                        ==============================
                                        RUN ONE MORE REFRESH
                                        ==============================
                                        */

                                        if (
                                            auditRealtimeRefreshTimer
                                        ) {

                                            window.clearTimeout(
                                                auditRealtimeRefreshTimer
                                            );

                                        }


                                        auditRealtimeRefreshTimer =
                                            window.setTimeout(
                                                async () => {

                                                    if (
                                                        auditRealtimeRefreshing
                                                    ) {

                                                        return;

                                                    }


                                                    auditRealtimeRefreshing =
                                                        true;


                                                    try {

                                                        await refreshAuditLogsRealtime();

                                                    }
                                                    catch (
                                                        error
                                                    ) {

                                                        console.error(
                                                            "CONTROL CENTER AUDIT REALTIME PENDING REFRESH FAILED:",
                                                            error
                                                        );

                                                    }
                                                    finally {

                                                        auditRealtimeRefreshing =
                                                            false;

                                                    }

                                                },
                                                300
                                            );

                                    }

                                }

                            },
                            300
                        );

                }
            );


        console.log(
            "CONTROL CENTER AUDIT REALTIME STARTED"
        );


    }
    catch (
        error
    ) {

        console.error(
            "CONTROL CENTER AUDIT REALTIME START FAILED:",
            error
        );


        auditRealtimeChannel =
            null;

    }

}


/*
==========================================================
STOP AUDIT LOG REALTIME
==========================================================
*/

async function stopAuditLogRealtime() {

    /*
    ======================================================
    CLEAR REFRESH TIMER
    ======================================================
    */

    if (
        auditRealtimeRefreshTimer
    ) {

        window.clearTimeout(
            auditRealtimeRefreshTimer
        );

        auditRealtimeRefreshTimer =
            null;

    }


    /*
    ======================================================
    RESET FLAGS
    ======================================================
    */

    auditRealtimeRefreshing =
        false;

    auditRealtimeRefreshPending =
        false;


    /*
    ======================================================
    REMOVE CHANNEL
    ======================================================
    */

    if (
        auditRealtimeChannel
    ) {

        try {

            await ControlCenterService.unsubscribeAuditLogs(
                auditRealtimeChannel
            );


            console.log(
                "CONTROL CENTER AUDIT REALTIME STOPPED"
            );

        }
        catch (
            error
        ) {

            console.error(
                "CONTROL CENTER AUDIT REALTIME STOP FAILED:",
                error
            );

        }
        finally {

            auditRealtimeChannel =
                null;

        }

    }

}
/*
==========================================================
REFRESH DATA
==========================================================
*/

async function refresh() {

    const results = await Promise.allSettled([
        ControlCenterService.getDashboardData()
    ]);

    const dashboard = results[0].status === "fulfilled" ? results[0].value : null;

    await loadAuditLogPage(state.auditPage || 1, false);

    const auditLogs = Array.isArray(state.auditLogs) ? state.auditLogs : [];

    Object.assign(state, dashboard || {}, {
        dashboard: dashboard || state.dashboard || null,
        auditLogs: Array.isArray(auditLogs) ? auditLogs : []
    });

    if (results[1].status === "rejected") {
        showError(results[1].reason);
    }

    renderAll();
}


/*
==========================================================
RENDER ALL
==========================================================
*/

function renderAll() {

    renderOverview();

    renderCompanies();

    renderSubscriptions();

    renderUsers();

    renderAuditModuleTabs();

    renderAuditLogs();

    fillSelects();

}


/*
==========================================================
RENDER OVERVIEW
==========================================================
*/

function renderOverview() {

    const dashboard =
        state.dashboard;


    if (
        !dashboard
    ) {

        return;

    }


    /*
    ======================================================
    KPI ELEMENTS
    ======================================================
    */

    const companiesKpi =
        document.getElementById(
            "kpi-companies"
        );


    const usersKpi =
        document.getElementById(
            "kpi-users"
        );


    const mrrKpi =
        document.getElementById(
            "kpi-mrr"
        );


    const expiringKpi =
        document.getElementById(
            "kpi-expiring"
        );


    /*
    ======================================================
    KPI VALUE
    ======================================================
    */

    if (
        companiesKpi
    ) {

        companiesKpi.textContent =
            Array.isArray(
                dashboard.activeCompanies
            )
                ?
            dashboard.activeCompanies.length
                :
            0;

    }


    if (
        usersKpi
    ) {

        usersKpi.textContent =
            Array.isArray(
                dashboard.activeUsers
            )
                ?
            dashboard.activeUsers.length
                :
            0;

    }


    if (
        mrrKpi
    ) {

        mrrKpi.textContent =
            idr(
                dashboard.mrr
            );

    }


    if (
        expiringKpi
    ) {

        expiringKpi.textContent =
            Array.isArray(
                dashboard.expiring
            )
                ?
            dashboard.expiring.length
                :
            0;

    }


    /*
    ======================================================
    LATEST COMPANY ROW
    ======================================================
    */

    const rows =

        (
            Array.isArray(
                state.companies
            )
                ?
            state.companies
                :
            []
        )
            .slice(
                0,
                5
            )
            .map(
                (
                    company
                ) => {

                    /*
                    ==============================================
                    ACTIVE USER COUNT
                    ==============================================
                    */

                    const activeUserCount =

                        (
                            Array.isArray(
                                state.users
                            )
                                ?
                            state.users
                                :
                            []
                        )
                            .filter(
                                (
                                    user
                                ) => {

                                    return (

                                        user.company_id
                                        ===
                                        company.id

                                        &&

                                        user.membership_status
                                        ===
                                        "ACTIVE"

                                    );

                                }
                            )
                            .length;


                    /*
                    ==============================================
                    ACTIVE SUBSCRIPTION
                    ==============================================
                    */

                    const subscription =

                        (
                            Array.isArray(
                                state.subscriptions
                            )
                                ?
                            state.subscriptions
                                :
                            []
                        )
                            .find(
                                (
                                    item
                                ) => {

                                    return (

                                        item.company_id
                                        ===
                                        company.id

                                        &&

                                        item.status
                                        ===
                                        "ACTIVE"

                                    );

                                }
                            );


                    /*
                    ==============================================
                    ROW
                    ==============================================
                    */

                    return `

                        <tr>

                            <td>

                                <strong>

                                    ${esc(
                                        company.company_code
                                        ||
                                        "-"
                                    )}

                                </strong>

                                <br>

                                <small>

                                    ${esc(
                                        company.company_name
                                        ||
                                        "-"
                                    )}

                                </small>

                            </td>


                            <td>

                                ${esc(
                                    subscription
                                        ?.finova_plans
                                        ?.plan_name
                                    ||
                                    "-"
                                )}

                            </td>


                            <td>

                                ${activeUserCount}
                                /
                                ${esc(
                                    company.max_users
                                    ??
                                    0
                                )}

                            </td>


                            <td>

                                ${badge(
                                    company.status
                                )}

                            </td>

                        </tr>

                    `;

                }
            )
            .join(
                ""
            );


    /*
    ======================================================
    RENDER TABLE
    ======================================================
    */

    const tableBody =
        document.getElementById(
            "overview-company-body"
        );


    if (
        !tableBody
    ) {

        return;

    }


    tableBody.innerHTML =

        rows

        ||

        `

            <tr class="cc-empty">

                <td colspan="4">

                    <i class="fa-regular fa-folder-open"></i>

                    <span>
                        Belum ada company.
                    </span>

                </td>

            </tr>

        `;

}


/*
==========================================================
RENDER COMPANIES
==========================================================
*/

function renderCompanies() {

    const tableBody =
        document.getElementById(
            "companies-body"
        );


    if (
        !tableBody
    ) {

        return;

    }


    const companies =

        Array.isArray(
            state.companies
        )

            ?

        state.companies

            :

        [];


    const users =

        Array.isArray(
            state.users
        )

            ?

        state.users

            :

        [];


    /*
    ======================================================
    BUILD COMPANY ROWS
    ======================================================
    */

    const rows =
        companies
            .map(
                (
                    company
                ) => {

                    /*
                    ==============================================
                    ACTIVE USER COUNT
                    ==============================================
                    */

                    const activeUserCount =
                        users
                            .filter(
                                (
                                    user
                                ) => {

                                    return (

                                        user.company_id
                                        ===
                                        company.id

                                        &&

                                        user.membership_status
                                        ===
                                        "ACTIVE"

                                    );

                                }
                            )
                            .length;


                    /*
                    ==============================================
                    COMPANY STATUS
                    ==============================================
                    */

                    const currentStatus =
                        String(
                            company.status
                            ||
                            ""
                        ).toUpperCase();


                    /*
                    ==============================================
                    ACTION BUTTON
                    ==============================================
                    */

                    const actionButton =

                        currentStatus
                        ===
                        "ACTIVE"

                            ?

                        `

                            <button
                                type="button"
                                class="cc-btn danger small"
                                data-company-status="${esc(
                                    company.id
                                )}"
                                data-status="SUSPENDED">

                                <i class="fa-solid fa-ban"></i>

                                <span>
                                    Suspend
                                </span>

                            </button>

                        `

                            :

                        `

                            <button
                                type="button"
                                class="cc-btn success small"
                                data-company-status="${esc(
                                    company.id
                                )}"
                                data-status="ACTIVE">

                                <i class="fa-solid fa-circle-check"></i>

                                <span>
                                    Activate
                                </span>

                            </button>

                        `;


                    /*
                    ==============================================
                    ROW
                    ==============================================
                    */

                    return `

                        <tr>

                            <td>

                                <strong>

                                    ${esc(
                                        company.company_code
                                        ||
                                        "-"
                                    )}

                                </strong>

                            </td>


                            <td>

                                <div class="cc-table-primary">

                                    ${esc(
                                        company.company_name
                                        ||
                                        "-"
                                    )}

                                </div>


                                ${
                                    company.legal_name
                                    &&
                                    company.legal_name
                                    !==
                                    company.company_name

                                        ?

                                    `

                                        <small class="cc-table-secondary">

                                            ${esc(
                                                company.legal_name
                                            )}

                                        </small>

                                    `

                                        :

                                    ""
                                }

                            </td>


                            <td>

                                <span class="cc-mono">

                                    ${activeUserCount}
                                    /
                                    ${esc(
                                        company.max_users
                                        ??
                                        0
                                    )}

                                </span>

                            </td>


                            <td>

                                ${badge(
                                    currentStatus
                                )}

                            </td>


                            <td class="text-end">

                                ${actionButton}

                            </td>

                        </tr>

                    `;

                }
            )
            .join(
                ""
            );


    /*
    ======================================================
    RENDER
    ======================================================
    */

    tableBody.innerHTML =

        rows

        ||

        `

            <tr class="cc-empty">

                <td colspan="5">

                    <i class="fa-regular fa-folder-open"></i>

                    <span>
                        Belum ada company.
                    </span>

                </td>

            </tr>

        `;


    /*
    ======================================================
    COMPANY STATUS EVENT
    ======================================================
    */

    tableBody
        .querySelectorAll(
            "[data-company-status]"
        )
        .forEach(
            (
                button
            ) => {

                button.addEventListener(
                    "click",
                    async () => {

                        try {

                            button.disabled =
                                true;


                            const companyId =
                                button.dataset.companyStatus;


                            const nextStatus =
                                button.dataset.status;


                            if (
                                !companyId
                                ||
                                !nextStatus
                            ) {

                                throw new Error(
                                    "Company atau status tidak valid."
                                );

                            }


                            await ControlCenterService
                                .setCompanyStatus(
                                    companyId,
                                    nextStatus
                                );


                            showInfo(
                                "Status company diperbarui."
                            );


                            await refresh();

                        }
                        catch (
                            error
                        ) {

                            showError(
                                error
                            );

                        }
                        finally {

                            button.disabled =
                                false;

                        }

                    }
                );

            }
        );

}


/*
==========================================================
RENDER SUBSCRIPTIONS
==========================================================
*/

function renderSubscriptions() {

    const tableBody =
        document.getElementById(
            "subscriptions-body"
        );


    if (
        !tableBody
    ) {

        return;

    }


    const subscriptions =

        Array.isArray(
            state.subscriptions
        )

            ?

        state.subscriptions

            :

        [];


    /*
    ======================================================
    BUILD SUBSCRIPTION ROWS
    ======================================================
    */

    const rows =
        subscriptions
            .map(
                (
                    subscription
                ) => {

                    const companyName =

                        subscription
                            ?.finova_companies
                            ?.company_name

                        ||

                        "-";


                    const planName =

                        subscription
                            ?.finova_plans
                            ?.plan_name

                        ||

                        "-";


                    return `

                        <tr>


                            <!-- COMPANY -->

                            <td>

                                <div class="cc-table-primary">

                                    ${esc(
                                        companyName
                                    )}

                                </div>

                            </td>


                            <!-- PLAN -->

                            <td>

                                <strong>

                                    ${esc(
                                        planName
                                    )}

                                </strong>

                            </td>


                            <!-- START -->

                            <td>

                                ${fmtDate(
                                    subscription.start_date
                                )}

                            </td>


                            <!-- END -->

                            <td>

                                ${fmtDate(
                                    subscription.end_date
                                )}

                            </td>


                            <!-- AMOUNT -->

                            <td class="text-end">

                                <strong>

                                    ${idr(
                                        subscription.amount
                                    )}

                                </strong>

                            </td>


                            <!-- PAYMENT -->

                            <td>

                                ${badge(
                                    subscription.payment_status
                                )}

                            </td>


                            <!-- STATUS -->

                            <td>

                                ${badge(
                                    subscription.status
                                )}

                            </td>


                        </tr>

                    `;

                }
            )
            .join(
                ""
            );


    /*
    ======================================================
    RENDER
    ======================================================
    */

    tableBody.innerHTML =

        rows

        ||

        `

            <tr class="cc-empty">

                <td colspan="9">

                    <i class="fa-regular fa-folder-open"></i>

                    <span>
                        Belum ada subscription.
                    </span>

                </td>

            </tr>

        `;

}


/*
==========================================================
RENDER USERS
==========================================================
*/

function renderUsers() {

    const tableBody =
        document.getElementById(
            "users-body"
        );


    if (
        !tableBody
    ) {

        return;

    }


    const users =

        Array.isArray(
            state.users
        )

            ?

        state.users

            :

        [];


    /*
    ======================================================
    BUILD USER ROWS
    ======================================================
    */

    const rows =
        users
            .map(
                (
                    user
                ) => {

                    const hasCompany =
                        Boolean(
                            user.company_id
                        );


                    const companyName =

                        user.company_name

                        ||

                        "Belum terhubung";


                    const companyRole =

                        user.company_role

                        ||

                        "-";


                    /*
                    ==============================================
                    USER STATUS
                    ==============================================
                    */

                    const statusHtml =

                        hasCompany

                            ?

                        badge(
                            user.membership_status
                        )

                            :

                        `

                            <span class="cc-badge neutral">

                                UNASSIGNED

                            </span>

                        `;


                    /*
                    ==============================================
                    ROW
                    ==============================================
                    */

                    return `

                        <tr>


                            <!-- EMAIL -->

                            <td>

                                <div class="cc-table-primary">

                                    ${esc(
                                        user.email
                                        ||
                                        "-"
                                    )}

                                </div>

                            </td>


                            <!-- NAME -->

                            <td>

                                ${esc(
                                    user.full_name
                                    ||
                                    "-"
                                )}

                            </td>


                            <!-- COMPANY -->

                            <td>

                                <span
                                    class="${
                                        hasCompany
                                            ?
                                        ""
                                            :
                                        "cc-text-muted"
                                    }">

                                    ${esc(
                                        companyName
                                    )}

                                </span>

                            </td>


                            <!-- ROLE -->

                            <td>

                                ${
                                    hasCompany

                                        ?

                                    `

                                        <span class="cc-mono">

                                            ${esc(
                                                companyRole
                                            )}

                                        </span>

                                    `

                                        :

                                    "-"
                                }

                            </td>


                            <!-- STATUS -->

                            <td>

                                ${statusHtml}

                            </td>


                        </tr>

                    `;

                }
            )
            .join(
                ""
            );


    /*
    ======================================================
    RENDER
    ======================================================
    */

    tableBody.innerHTML =

        rows

        ||

        `

            <tr class="cc-empty">

                <td colspan="5">

                    <i class="fa-regular fa-folder-open"></i>

                    <span>
                        Belum ada user Auth.
                    </span>

                </td>

            </tr>

        `;

}



/*
==========================================================
RENDER AUDIT LOG
==========================================================
*/

function renderAuditModuleTabs() {

    /*
    Audit Log FINOVA menggunakan satu combined audit log.
    Tidak ada pemisahan halaman/module audit.
    */

    state.auditModule = "ALL";

}

/*
==========================================================
AUDIT LOG LOADING
==========================================================
*/

function showAuditLoading() {

    const tbody =
        document.querySelector(
            "#audit-table-body"
        );

    if (!tbody) {

        return;

    }

    tbody.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="cc-table-loading">

                <i
                    class="fa-solid fa-spinner fa-spin">
                </i>

                Loading Audit Log...

            </td>

        </tr>

    `;

}

/*
==========================================================
AUDIT LOG LOADING
==========================================================
*/

function showAuditLogLoading() {

    const tableBody =
        document.getElementById(
            "audit-log-body"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="cc-table-loading"
            >

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                <span>
                    Loading Audit Log...
                </span>

            </td>

        </tr>

    `;

}

/*
==========================================================
LOAD AUDIT LOG PAGE
==========================================================
*/

async function loadAuditLogPage(
    page = 1,
    showLoading = true
) {

    if (
        state.auditLoading
    ) {

        return;

    }


    state.auditLoading =
        true;


    if (
        showLoading
    ) {

        showAuditLogLoading();

    }


    try {

        const searchValue =
            String(
                document
                    .getElementById(
                        "audit-search"
                    )
                    ?.value
                ||
                ""
            )
                .trim();


        const actionValue =
            String(
                document
                    .getElementById(
                        "audit-action"
                    )
                    ?.value
                ||
                ""
            )
                .trim()
                .toUpperCase();


        const result =
            await ControlCenterService
                .getAuditLogsPage(

                    page,

                    state.auditPageSize,

                    searchValue,

                    actionValue,

                    "ALL"

                );


        state.auditLogs =
            Array.isArray(
                result?.data
            )
                ?
                result.data
                :
                [];


        state.auditPage =
            Number(
                result?.page
                ||
                page
            );


        state.auditPageSize =
            Number(
                result?.pageSize
                ||
                100
            );


        state.auditTotalRecords =
            Number(
                result?.totalCount
                ||
                0
            );


        state.auditTotalPages =
            Number(
                result?.totalPages
                ||
                1
            );


        renderAuditLogs();

    }
    catch (
        error
    ) {

        console.error(
            "FINOVA Audit Log Page Load Error:",
            error
        );


        showError(
            error
        );

    }
    finally {

        state.auditLoading =
            false;

    }

}
/*
==========================================================
AUDIT LOG
COMBINED
SERVER-SIDE PAGINATION
==========================================================
*/

function renderAuditLogs() {

    const tableBody =
        document.getElementById(
            "audit-log-body"
        );


    if (!tableBody) {

        return;

    }


    const auditLogs =
        Array.isArray(
            state.auditLogs
        )
            ? state.auditLogs
            : [];


    /*
    ======================================================
    TOTAL DATA
    ======================================================
    */

    state.auditTotalRecords =
        Number(
            state.auditTotalRecords
            || 0
        );


    state.auditTotalPages =
        Math.max(
            1,
            Number(
                state.auditTotalPages
            )
            || 1
        );


    /*
    ======================================================
    BUILD AUDIT TABLE
    ======================================================
    */

    const auditRows =
        auditLogs.map(
            (
                item
            ) => {

                /*
                ==========================================
                DATE / TIME
                ==========================================
                */

                const createdAt =
                    fmtAuditDateTime(
                        item?.created_at
                    );


                /*
                ==========================================
                COMPANY
                ==========================================
                */

                const companyName =

                    item?.company_code
                        ?

                    `${item.company_code} — ${item.company_name || ""}`

                        :

                    getCompanyDisplay(
                        item?.company_id
                    );


                /*
                ==========================================
                MODULE
                ==========================================
                */

                const moduleMeta =
                    getAuditModuleMeta(
                        getAuditModuleKey(
                            item
                        )
                    );


                /*
                ==========================================
                DOCUMENT
                ==========================================
                */

                const documentNo =
                    getAuditDocument(
                        item
                    );


                /*
                ==========================================
                USER
                ==========================================
                */

                const userName =
                    item?.user_name
                    ||
                    item?.user_uid
                    ||
                    "SYSTEM";


                /*
                ==========================================
                USER STATUS
                ==========================================

                User Status =
                ROLE / JABATAN
                ==========================================
                */

                const userStatus =
                    String(
                        item?.user_role
                        ||
                        ""
                    )
                        .trim()
                        .toUpperCase();


                const userStatusHtml =

                    userStatus

                        ?

                    `
                        <span class="cc-user-status role">
                            ${esc(
                                userStatus
                            )}
                        </span>
                    `

                        :

                    `
                        <span class="cc-user-status unknown">
                            -
                        </span>
                    `;


                /*
                ==========================================
                REMARKS
                ==========================================
                */

                const remarks =
                    getAuditRemarks(
                        item
                    )
                    ||
                    "-";


                /*
                ==========================================
                RETURN ROW
                ==========================================
                */

                return `

                    <tr>

                        <!-- DATE / TIME -->

                        <td>

                            <span
                                class="cc-audit-date"
                            >

                                ${esc(
                                    createdAt
                                )}

                            </span>

                        </td>


                        <!-- COMPANY -->

                        <td>

                            <div
                                class="cc-table-primary"
                            >

                                ${esc(
                                    companyName
                                )}

                            </div>

                        </td>


                        <!-- MODULE -->

                        <td>

                            <div
                                class="cc-table-primary"
                            >

                                ${esc(
                                    moduleMeta.label
                                )}

                            </div>

                            <small
                                class="cc-table-secondary"
                            >

                                ${esc(
                                    item?.module
                                    ||
                                    item?.table_name
                                    ||
                                    "-"
                                )}

                            </small>

                        </td>


                        <!-- DOCUMENT -->

                        <td>

                            <span
                                class="cc-mono"
                                title="${esc(
                                    documentNo
                                )}"
                            >

                                ${esc(
                                    documentNo
                                )}

                            </span>

                        </td>


                        <!-- ACTION -->

                        <td>

                            ${auditBadge(
                                item?.action
                            )}

                        </td>


                        <!-- USER -->

                        <td>

                            <div
                                class="cc-table-primary"
                            >

                                ${esc(
                                    userName
                                )}

                            </div>

                        </td>


                        <!-- USER STATUS -->

                        <td>

                            ${userStatusHtml}

                        </td>


                        <!-- REMARKS -->

                        <td>

                            <div
                                class="cc-audit-remarks"
                                title="${esc(
                                    remarks
                                )}"
                            >

                                ${esc(
                                    remarks
                                )}

                            </div>

                        </td>


                        <!-- VIEW -->

                        <td>

                            <button
                                type="button"
                                class="cc-icon-btn"
                                title="View Audit Detail"
                                data-audit-view="${esc(
                                    item?.id
                                )}"
                            >

                                <i
                                    class="fa-solid fa-eye"
                                ></i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    /*
    ======================================================
    EMPTY
    ======================================================
    */

    if (
        !auditRows
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="cc-empty-state"
                >

                    No Audit Log found.

                </td>

            </tr>

        `;

    }
    else {

        tableBody.innerHTML =
            auditRows;

    }


    /*
    ======================================================
    PAGINATION UI
    ======================================================
    */

    const pageInput =
        document.getElementById(
            "audit-page"
        );


    const pageInfo =
        document.getElementById(
            "audit-page-info"
        );


    const pageFirst =
        document.getElementById(
            "audit-page-first"
        );


    const pagePrev =
        document.getElementById(
            "audit-page-prev"
        );


    const pageNext =
        document.getElementById(
            "audit-page-next"
        );


    const pageLast =
        document.getElementById(
            "audit-page-last"
        );


    if (
        pageInput
    ) {

        pageInput.value =
            state.auditPage;

        pageInput.min =
            1;

        pageInput.max =
            state.auditTotalPages;

    }


    if (
        pageInfo
    ) {

        const from =
            state.auditTotalRecords === 0
                ? 0
                :
                (
                    (
                        state.auditPage
                        -
                        1
                    )
                    *
                    state.auditPageSize
                )
                + 1;


        const to =
            Math.min(
                state.auditPage
                *
                state.auditPageSize,
                state.auditTotalRecords
            );


        pageInfo.textContent =
            `Displaying ${from}–${to} of ${state.auditTotalRecords}`;

    }


    if (
        pageFirst
    ) {

        pageFirst.disabled =
            state.auditPage <= 1;

    }


    if (
        pagePrev
    ) {

        pagePrev.disabled =
            state.auditPage <= 1;

    }


    if (
        pageNext
    ) {

        pageNext.disabled =
            state.auditPage >=
            state.auditTotalPages;

    }


    if (
        pageLast
    ) {

        pageLast.disabled =
            state.auditPage >=
            state.auditTotalPages;

    }

}
/*
==========================================================
HIDE CONTROL CENTER INFO BANNER
==========================================================
*/

function hideControlCenterInfoBanner() {

    const alertElement =
        document.getElementById(
            "cc-alert"
        );


    if (!alertElement) {

        return;

    }


    /*
    Hanya sembunyikan banner SUCCESS/INFO.
    
    Error tetap boleh tampil.
    */

    if (
        alertElement.classList.contains(
            "success"
        )
    ) {

        alertElement.hidden =
            true;

        alertElement.style.display =
            "none";

    }

}
/*
==========================================================
OPEN AUDIT DETAIL
==========================================================
*/

function openAuditDetail(
    auditId
) {

    /*
    ======================================================
    FIND AUDIT RECORD
    ======================================================
    */

    const item =
        (
            Array.isArray(
                state.auditLogs
            )
                ? state.auditLogs
                : []
        )
            .find(
                (
                    audit
                ) => {

                    return (
                        String(
                            audit?.id
                            ||
                            ""
                        )
                        ===
                        String(
                            auditId
                            ||
                            ""
                        )
                    );

                }
            );


    /*
    ======================================================
    RECORD NOT FOUND
    ======================================================
    */

    if (
        !item
    ) {

        showAlert(
            "Audit log tidak ditemukan.",
            "danger"
        );

        return;

    }


    /*
    ======================================================
    BASIC DISPLAY VALUE
    ======================================================
    */

    const createdAt =
        fmtAuditDateTime(
            item.created_at
        );


    const companyName =
        getCompanyDisplay(
            item.company_id
        );


    const documentNo =
        getAuditDocument(
            item
        );


    /*
    ======================================================
    USER DISPLAY
    ======================================================

    Service sekarang memberikan:

    user_name
    user_role
    user_uid

    Priority:
    1. Nama user
    2. UID jika profile tidak ditemukan
    3. SYSTEM jika audit tidak memiliki actor
    ======================================================
    */

    const userName =
        item.user_name
        ||
        item.user_uid
        ||
        "SYSTEM";


    const userRole =
        item.user_role
        ||
        "";


    const userDisplay = userName;


    /*
    ======================================================
    DATE / TIME
    ======================================================
    */

    setText(
        "audit-detail-date",
        createdAt
    );


    /*
    ======================================================
    COMPANY
    ======================================================
    */

    setText(
        "audit-detail-company",
        companyName
    );


    /*
    ======================================================
    MODULE
    ======================================================
    */

    setText(
        "audit-detail-module",
        item.module
        ||
        "-"
    );


    /*
    ======================================================
    DOCUMENT
    ======================================================
    */

    setText(
        "audit-detail-document",
        documentNo
    );


    /*
    ======================================================
    USER
    ======================================================
    */

    setText(
        "audit-detail-user",
        userDisplay
    );

    const detailUserStatus =
        String(item.user_status || '').trim().toUpperCase();

    const detailUserStatusEl =
        document.getElementById('audit-detail-user-status');

    if (detailUserStatusEl) {
        detailUserStatusEl.textContent = detailUserStatus || '-';
        detailUserStatusEl.className =
            "cc-audit-info-value cc-user-status-text role";
    }


    /*
    ======================================================
    TABLE
    ======================================================
    */

    setText(
        "audit-detail-table",
        item.table_name
        ||
        "-"
    );


    /*
    ======================================================
    RECORD ID
    ======================================================
    */

    setText(
        "audit-detail-record-id",
        item.record_id
        ||
        "-"
    );


    /*
    ======================================================
    REMARKS
    ======================================================
    */

    setText(
        "audit-detail-remarks",
        getAuditRemarks(item)
        ||
        "-"
    );


    /*
    ======================================================
    ACTION BADGE
    ======================================================
    */

    const actionElement =
        document.getElementById(
            "audit-detail-action"
        );


    if (
        actionElement
    ) {

        actionElement.innerHTML =
            auditBadge(
                item.action
            );

    }


    /*
    ======================================================
    DOCUMENT TRACE
    ======================================================
    */

    renderAuditDocumentTrace(
        item
    );


    /*
    ======================================================
    CHANGED FIELDS
    ======================================================
    */

    renderAuditChangedFields(
        item
    );


    /*
    ======================================================
    BEFORE / AFTER SNAPSHOT
    ======================================================
    */

    renderAuditSnapshots(
        item
    );


    /*
    ======================================================
    GET MODAL
    ======================================================
    */

    const modalElement =
        document.getElementById(
            "audit-detail-modal"
        );


    if (
        !modalElement
    ) {

        console.error(
            "Audit Detail Modal tidak ditemukan."
        );

        showAlert(
            "Audit Detail Modal tidak ditemukan.",
            "danger"
        );

        return;

    }


    /*
    ======================================================
    BOOTSTRAP CHECK
    ======================================================
    */

    if (
        typeof bootstrap
        ===
        "undefined"
        ||
        !bootstrap.Modal
    ) {

        console.error(
            "Bootstrap Modal tidak tersedia."
        );

        showAlert(
            "Bootstrap Modal tidak tersedia.",
            "danger"
        );

        return;

    }


    /*
    ======================================================
    OPEN MODAL
    ======================================================
    */

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}

/*
==========================================================
RENDER AUDIT DETAIL ACTION
==========================================================
*/

function renderAuditDetailAction(
    action
) {

    const element =
        document.getElementById(
            "audit-detail-action"
        );


    if (
        !element
    ) {

        return;

    }


    element.innerHTML =
        auditBadge(
            action
        );

}


/*
==========================================================
RENDER AUDIT DOCUMENT TRACE
==========================================================
*/

function renderAuditDocumentTrace(
    item
) {

    /*
    ======================================================
    SOURCE
    ======================================================
    */

    const sourceModule =
        item.source_module
        ||
        "-";


    const sourceNo =
        item.source_no
        ||
        item.source_id
        ||
        "-";


    /*
    ======================================================
    CURRENT DOCUMENT
    ======================================================
    */

    const currentModule =
        item.module
        ||
        "-";


    const currentDocument =
        getAuditDocument(
            item
        );


    /*
    ======================================================
    SET DOM
    ======================================================
    */

    setText(
        "audit-detail-source-module",
        sourceModule
    );


    setText(
        "audit-detail-source-no",
        sourceNo
    );


    setText(
        "audit-detail-current-module",
        currentModule
    );


    setText(
        "audit-detail-current-document",
        currentDocument
    );


    /*
    ======================================================
    TRACE CONTAINER STATE
    ======================================================
    */

    const traceElement =
        document.getElementById(
            "audit-detail-trace"
        );


    if (
        !traceElement
    ) {

        return;

    }


    const hasSource =
        Boolean(
            item.source_module
            ||
            item.source_id
            ||
            item.source_no
        );


    traceElement.classList.toggle(
        "no-source",
        !hasSource
    );

}


/*
==========================================================
RENDER AUDIT CHANGED FIELDS
==========================================================
*/

function renderAuditChangedFields(
    item
) {

    const container =
        document.getElementById(
            "audit-detail-changed-fields"
        );


    if (
        !container
    ) {

        return;

    }


    /*
    ======================================================
    GET CHANGES
    ======================================================
    */

    const changes =
        getAuditChangedFields(
            item.old_data,
            item.new_data
        );


    /*
    ======================================================
    EMPTY
    ======================================================
    */

    if (
        changes.length === 0
    ) {

        container.innerHTML = `

            <div class="cc-no-changes">

                <i class="fa-regular fa-circle-check"></i>

                <span>
                    Tidak ada perubahan field yang dapat ditampilkan.
                </span>

            </div>

        `;


        return;

    }


    /*
    ======================================================
    CHANGED FIELD TABLE
    ======================================================
    */

    const rows =
        changes
            .map(
                (
                    change
                ) => {

                    return `

                        <tr>

                            <td>

                                <strong class="cc-mono">

                                    ${esc(
                                        change.field
                                    )}

                                </strong>

                            </td>


                            <td>

                                <pre class="cc-audit-change-value">${esc(
                                    auditDisplayValue(
                                        change.oldValue
                                    )
                                )}</pre>

                            </td>


                            <td>

                                <pre class="cc-audit-change-value">${esc(
                                    auditDisplayValue(
                                        change.newValue
                                    )
                                )}</pre>

                            </td>

                        </tr>

                    `;

                }
            )
            .join(
                ""
            );


    container.innerHTML = `

        <div class="cc-table-responsive">

            <table class="cc-table cc-audit-change-table">

                <thead>

                    <tr>

                        <th>
                            Field
                        </th>

                        <th>
                            Before
                        </th>

                        <th>
                            After
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>

        </div>

    `;

}


/*
==========================================================
RENDER AUDIT SNAPSHOTS
==========================================================
*/

function renderAuditSnapshots(
    item
) {

    const oldDataElement =
        document.getElementById(
            "audit-detail-old-data"
        );


    const newDataElement =
        document.getElementById(
            "audit-detail-new-data"
        );


    if (
        oldDataElement
    ) {

        oldDataElement.textContent =
            formatAuditJson(
                item.old_data
            );

    }


    if (
        newDataElement
    ) {

        newDataElement.textContent =
            formatAuditJson(
                item.new_data
            );

    }

}


/*
==========================================================
FILL SELECTS
==========================================================
*/

function fillSelects() {

    /*
    ======================================================
    ACTIVE COMPANY OPTIONS
    ======================================================
    */

    const companyOptions =

        (
            Array.isArray(
                state.companies
            )

                ?

            state.companies

                :

            []
        )
            .filter(
                (
                    company
                ) => {

                    return (
                        String(
                            company.status
                            ||
                            ""
                        ).toUpperCase()
                        ===
                        "ACTIVE"
                    );

                }
            )
            .map(
                (
                    company
                ) => {

                    return `

                        <option value="${esc(
                            company.id
                        )}">

                            ${esc(
                                company.company_code
                                ||
                                "-"
                            )}

                            —

                            ${esc(
                                company.company_name
                                ||
                                "-"
                            )}

                        </option>

                    `;

                }
            )
            .join(
                ""
            );


    /*
    ======================================================
    DOM
    ======================================================
    */

    const subscriptionCompany =
        document.getElementById(
            "sub-company"
        );


    const assignCompany =
        document.getElementById(
            "assign-company"
        );


    const subscriptionPlan =
        document.getElementById(
            "sub-plan"
        );


    /*
    ======================================================
    SUBSCRIPTION COMPANY
    ======================================================
    */

    if (
        subscriptionCompany
    ) {

        subscriptionCompany.innerHTML =

            `

                <option value="">
                    Pilih company
                </option>

            `

            +

            companyOptions;

    }


    /*
    ======================================================
    ASSIGN USER COMPANY
    ======================================================
    */

    if (
        assignCompany
    ) {

        assignCompany.innerHTML =

            `

                <option value="">
                    Pilih company
                </option>

            `

            +

            companyOptions;

    }


    /*
    ======================================================
    PLAN OPTIONS
    ======================================================
    */

    if (
        subscriptionPlan
    ) {

        const planOptions =

            (
                Array.isArray(
                    state.plans
                )

                    ?

                state.plans

                    :

                []
            )
                .filter(
                    (
                        plan
                    ) => {

                        return (
                            plan.is_active
                            !==
                            false
                        );

                    }
                )
                .map(
                    (
                        plan
                    ) => {

                        return `

                            <option
                                value="${esc(
                                    plan.id
                                )}"
                                data-price="${esc(
                                    plan.price
                                    ??
                                    0
                                )}"
                                data-cycle="${esc(
                                    plan.billing_cycle
                                    ||
                                    ""
                                )}">

                                ${esc(
                                    plan.plan_name
                                    ||
                                    "-"
                                )}

                                —

                                ${idr(
                                    plan.price
                                )}

                            </option>

                        `;

                    }
                )
                .join(
                    ""
                );


        subscriptionPlan.innerHTML =

            `

                <option value="">
                    Pilih paket
                </option>

            `

            +

            planOptions;

    }

}


/*
==========================================================
SET SUGGESTED SUBSCRIPTION END DATE
==========================================================
*/

function setSuggestedEndDate(
    cycle
) {

    const startElement =
        document.getElementById(
            "sub-start"
        );


    const endElement =
        document.getElementById(
            "sub-end"
        );


    if (
        !startElement
        ||
        !endElement
    ) {

        return;

    }


    /*
    ======================================================
    START DATE
    ======================================================
    */

    const value =
        startElement.value;


    if (
        !value
    ) {

        endElement.value =
            "";

        return;

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        endElement.value =
            "";

        return;

    }


    /*
    ======================================================
    BILLING CYCLE
    ======================================================
    */

    const billingCycle =
        String(
            cycle
            ||
            ""
        ).toUpperCase();


    if (
        billingCycle
        ===
        "ANNUAL"
    ) {

        date.setFullYear(
            date.getFullYear()
            +
            1
        );

    }
    else {

        date.setMonth(
            date.getMonth()
            +
            1
        );

    }


    /*
    ======================================================
    SUBTRACT ONE DAY
    ======================================================
    */

    date.setDate(
        date.getDate()
        -
        1
    );


    /*
    ======================================================
    FORMAT YYYY-MM-DD
    ======================================================
    */

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth()
            +
            1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    endElement.value =
        `${year}-${month}-${day}`;

}


/*
==========================================================
BIND EVENTS
==========================================================
*/

function bind() {


    /*
    ======================================================
    LOGOUT
    ======================================================
    */

    document
        .getElementById(
            "btn-logout"
        )
        ?.addEventListener(
            "click",
            async (
                event
            ) => {

                const button =
                    event.currentTarget;


                try {

                    button.disabled =
                        true;


                    await ControlCenterService
                        .logout();


                    sessionStorage.clear();


                    location.replace(
                        "../login.html"
                    );

                }
                catch (
                    error
                ) {

                    showError(
                        error
                    );


                    button.disabled =
                        false;

                }

            }
        );


    /*
    ======================================================
    AUDIT SEARCH
    ======================================================
    */

    document
        .getElementById(
            "audit-search"
        )
        ?.addEventListener(
            "input",
            () => {

                state.auditPage = 1;
                loadAuditLogPage(1, true);

            }
        );


    /*
    ======================================================
    AUDIT ACTION FILTER
    ======================================================
    */

    document
        .getElementById(
            "audit-action"
        )
        ?.addEventListener(
            "change",
            () => {

                state.auditPage = 1;
                loadAuditLogPage(1, true);

            }
        );


    /*
    ======================================================
    AUDIT PAGINATION
    ======================================================
    */

    const auditPageInput =
        document.getElementById("audit-page");

    auditPageInput?.addEventListener("change", async () => {
        const totalPages = Math.max(1, Number(state.auditTotalPages) || 1);
        let page = Number.parseInt(auditPageInput.value, 10);
        if (!Number.isFinite(page)) page = state.auditPage || 1;
        page = Math.min(Math.max(page, 1), totalPages);
        auditPageInput.value = page;
        await loadAuditLogPage(page, true);
    });

    auditPageInput?.addEventListener("keydown", async (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        auditPageInput.dispatchEvent(new Event("change"));
    });

    document.getElementById("audit-page-first")?.addEventListener("click", () => {
        if (state.auditPage > 1) loadAuditLogPage(1, true);
    });

    document.getElementById("audit-page-prev")?.addEventListener("click", () => {
        if (state.auditPage > 1) loadAuditLogPage(state.auditPage - 1, true);
    });

    document.getElementById("audit-page-next")?.addEventListener("click", () => {
        if (state.auditPage < state.auditTotalPages) loadAuditLogPage(state.auditPage + 1, true);
    });

    document.getElementById("audit-page-last")?.addEventListener("click", () => {
        if (state.auditPage < state.auditTotalPages) loadAuditLogPage(state.auditTotalPages, true);
    });

    /*
======================================================
AUDIT REFRESH
======================================================
*/

document
    .getElementById(
        "btn-refresh-audit"
    )
    ?.addEventListener(
        "click",
        async (
            event
        ) => {

            const button =
                event.currentTarget;


            try {

                /*
                ==========================================
                BUTTON LOADING
                ==========================================
                */

                button.disabled =
                    true;


                /*
                ==========================================
                CHANGE ICON
                ==========================================
                */

                const icon =
                    button.querySelector(
                        "i"
                    );

                const label =
                    button.querySelector(
                        "span"
                    );


                if (icon) {

                    icon.className =
                        "fa-solid fa-spinner fa-spin";

                }


                if (label) {

                    label.textContent =
                        "Loading...";

                }


                /*
                ==========================================
                SHOW TABLE LOADING
                ==========================================
                */

                showAuditLoading();


                /*
                ==========================================
                LOAD DATA FROM SUPABASE
                ==========================================
                */

                state.auditPage = 1;
                state.auditModule = "ALL";

                await loadAuditLogPage(1, true);


                /*
                ==========================================
                SUCCESS
                ==========================================
                */

                showInfo(
                    "Audit Log berhasil diperbarui."
                );

            }

            catch (
                error
            ) {

                console.error(
                    "Audit Log refresh failed:",
                    error
                );


                showError(
                    error
                );

                renderAuditLogs();

            }

            finally {

                /*
                ==========================================
                RESTORE BUTTON
                ==========================================
                */

                button.disabled =
                    false;


                const icon =
                    button.querySelector(
                        "i"
                    );

                const label =
                    button.querySelector(
                        "span"
                    );


                if (icon) {

                    icon.className =
                        "fa-solid fa-rotate";

                }


                if (label) {

                    label.textContent =
                        "Refresh";

                }

            }

        }
    );


    /*
    ======================================================
    SIDEBAR NAVIGATION
    ======================================================
    */

    document
        .querySelectorAll(
            ".cc-nav-item"
        )
        .forEach(
            (
                button
            ) => {

                button.addEventListener(
                    "click",
                    () => {
                        navigate(button.dataset.page);
                    }
                );

            }
        );


    /*
    ======================================================
    MODULE AUDIT NAVIGATION
    ======================================================
    */

    document
        .querySelectorAll(".cc-nav-audit")
        .forEach((button) => {

            button.addEventListener("click", async () => {

                const module =
                    button.dataset.auditModule || "ALL";

                state.auditModule = module;

                navigate("audit-log", module);

                try {

                    const auditLogs =
                        await ControlCenterService.getAuditLogs(
                            500,
                            "ALL"
                        );

                    state.auditLogs = Array.isArray(auditLogs)
                        ? auditLogs
                        : [];

                    state.auditModule = "ALL";
                    state.auditPage = 1;
                    renderAuditModuleTabs();
                    renderAuditLogs();

                } catch (error) {

                    console.error(
                        "Control Center module audit navigation failed:",
                        error
                    );

                    showError(error);
                    renderAuditLogs();
                }

            });

        });


    /*
    ======================================================
    INTERNAL NAVIGATION
    ======================================================
    */

    document
        .querySelectorAll(
            "[data-nav]"
        )
        .forEach(
            (
                button
            ) => {

                button.addEventListener(
                    "click",
                    () => {

                        navigate(
                            button.dataset.nav
                        );

                    }
                );

            }
        );


    /*
    ======================================================
    MOBILE SIDEBAR BUTTON
    ======================================================
    */

    document
        .getElementById(
            "btn-sidebar"
        )
        ?.addEventListener(
            "click",
            toggleSidebar
        );


    /*
    ======================================================
    MOBILE SIDEBAR OVERLAY
    ======================================================
    */

    document
        .getElementById(
            "cc-overlay"
        )
        ?.addEventListener(
            "click",
            closeSidebar
        );


    /*
    ======================================================
    ESCAPE KEY
    ======================================================
    */

    document.addEventListener(
        "keydown",
        (
            event
        ) => {

            if (
                event.key
                ===
                "Escape"
            ) {

                closeSidebar();

            }

        }
    );


    /*
    ======================================================
    WINDOW RESIZE
    ======================================================
    */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth
                >
                991
            ) {

                closeSidebar();

            }

        }
    );


    /*
    ======================================================
    COMPANY FORM
    ======================================================
    */

    const companyForm =
        document.getElementById(
            "form-company"
        );


    companyForm
        ?.addEventListener(
            "submit",
            async (
                event
            ) => {

                event.preventDefault();


                /*
                ==============================================
                SAVE FORM REFERENCE BEFORE AWAIT
                ==============================================
                */

                const form =
                    event.currentTarget;


                const submitButton =
                    form.querySelector(
                        '[type="submit"]'
                    );


                try {

                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            true;

                    }


                    /*
                    ==============================================
                    PAYLOAD
                    ==============================================
                    */

                    const formData =
                        new FormData(
                            form
                        );


                    const payload =
                        Object.fromEntries(
                            formData.entries()
                        );


                    /*
                    ==============================================
                    NORMALIZE COMPANY CODE
                    ==============================================
                    */

                    if (
                        payload.company_code
                    ) {

                        payload.company_code =
                            String(
                                payload.company_code
                            )
                                .trim()
                                .toUpperCase();

                    }


                    /*
                    ==============================================
                    NORMALIZE COMPANY NAME
                    ==============================================
                    */

                    if (
                        payload.company_name
                    ) {

                        payload.company_name =
                            String(
                                payload.company_name
                            )
                                .trim();

                    }


                    /*
                    ==============================================
                    MAX USERS
                    ==============================================
                    */

                    if (
                        payload.max_users
                        !==
                        undefined
                    ) {

                        payload.max_users =
                            Number(
                                payload.max_users
                                ||
                                0
                            );

                    }


                    /*
                    ==============================================
                    CREATE COMPANY
                    ==============================================
                    */

                    await ControlCenterService
                        .createCompany(
                            payload
                        );


                    /*
                    ==============================================
                    CLOSE MODAL
                    ==============================================
                    */

                    const modalElement =
                        document.getElementById(
                            "company-modal"
                        );


                    if (
                        modalElement
                        &&
                        typeof bootstrap
                        !==
                        "undefined"
                        &&
                        bootstrap.Modal
                    ) {

                        bootstrap.Modal
                            .getOrCreateInstance(
                                modalElement
                            )
                            .hide();

                    }


                    /*
                    ==============================================
                    RESET FORM
                    ==============================================
                    */

                    form.reset();


                    const maxUsersElement =
                        form.querySelector(
                            '[name="max_users"]'
                        );


                    if (
                        maxUsersElement
                    ) {

                        maxUsersElement.value =
                            "5";

                    }


                    const statusElement =
                        form.querySelector(
                            '[name="status"]'
                        );


                    if (
                        statusElement
                    ) {

                        statusElement.value =
                            "ACTIVE";

                    }


                    /*
                    ==============================================
                    MESSAGE + REFRESH
                    ==============================================
                    */

                    showInfo(
                        "Company berhasil dibuat."
                    );


                    await refresh();

                }
                catch (
                    error
                ) {

                    showError(
                        error
                    );

                }
                finally {

                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            false;

                    }

                }

            }
        );


    /*
    ======================================================
    SUBSCRIPTION PLAN CHANGE
    ======================================================
    */

    document
        .getElementById(
            "sub-plan"
        )
        ?.addEventListener(
            "change",
            (
                event
            ) => {

                const selectedOption =
                    event
                        .target
                        .selectedOptions[0];


                /*
                ==============================================
                EMPTY PLAN
                ==============================================
                */

                if (
                    !selectedOption
                    ||
                    !selectedOption.value
                ) {

                    const amountElement =
                        document.getElementById(
                            "sub-amount"
                        );


                    const endElement =
                        document.getElementById(
                            "sub-end"
                        );


                    if (
                        amountElement
                    ) {

                        amountElement.value =
                            "";

                    }


                    if (
                        endElement
                    ) {

                        endElement.value =
                            "";

                    }


                    return;

                }


                /*
                ==============================================
                SET AMOUNT
                ==============================================
                */

                const amountElement =
                    document.getElementById(
                        "sub-amount"
                    );


                if (
                    amountElement
                ) {

                    amountElement.value =
                        selectedOption
                            .dataset
                            .price
                        ||
                        0;

                }


                /*
                ==============================================
                SET END DATE
                ==============================================
                */

                const startElement =
                    document.getElementById(
                        "sub-start"
                    );


                if (
                    startElement
                    ?.value
                ) {

                    setSuggestedEndDate(
                        selectedOption
                            .dataset
                            .cycle
                    );

                }

            }
        );


    /*
    ======================================================
    SUBSCRIPTION START DATE CHANGE
    ======================================================
    */

    document
        .getElementById(
            "sub-start"
        )
        ?.addEventListener(
            "change",
            () => {

                const planElement =
                    document.getElementById(
                        "sub-plan"
                    );


                const selectedOption =
                    planElement
                        ?.selectedOptions[0];


                if (
                    selectedOption
                    ?.value
                ) {

                    setSuggestedEndDate(
                        selectedOption
                            .dataset
                            .cycle
                    );

                }

            }
        );


    /*
    ======================================================
    SUBSCRIPTION FORM
    ======================================================
    */

    const subscriptionForm =
        document.getElementById(
            "form-subscription"
        );


    subscriptionForm
        ?.addEventListener(
            "submit",
            async (
                event
            ) => {

                event.preventDefault();


                /*
                ==============================================
                SAVE FORM REFERENCE BEFORE AWAIT
                ==============================================
                */

                const form =
                    event.currentTarget;


                const submitButton =
                    form.querySelector(
                        '[type="submit"]'
                    );


                try {

                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            true;

                    }


                    /*
                    ==============================================
                    PAYLOAD
                    ==============================================
                    */

                    const formData =
                        new FormData(
                            form
                        );


                    const payload =
                        Object.fromEntries(
                            formData.entries()
                        );


                    /*
                    ==============================================
                    NORMALIZE AMOUNT
                    ==============================================
                    */

                    if (
                        payload.amount
                        !==
                        undefined
                    ) {

                        payload.amount =
                            Number(
                                payload.amount
                                ||
                                0
                            );

                    }


                    /*
                    ==============================================
                    CREATE SUBSCRIPTION
                    ==============================================
                    */

                    await ControlCenterService
                        .createSubscription(
                            payload
                        );


                    /*
                    ==============================================
                    CLOSE MODAL
                    ==============================================
                    */

                    const modalElement =
                        document.getElementById(
                            "subscription-modal"
                        );


                    if (
                        modalElement
                        &&
                        typeof bootstrap
                        !==
                        "undefined"
                        &&
                        bootstrap.Modal
                    ) {

                        bootstrap.Modal
                            .getOrCreateInstance(
                                modalElement
                            )
                            .hide();

                    }


                    /*
                    ==============================================
                    RESET
                    ==============================================
                    */

                    form.reset();


                    /*
                    ==============================================
                    MESSAGE + REFRESH
                    ==============================================
                    */

                    showInfo(
                        "Subscription berhasil dibuat."
                    );


                    await refresh();

                }
                catch (
                    error
                ) {

                    showError(
                        error
                    );

                }
                finally {

                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            false;

                    }

                }

            }
        );


    /*
    ======================================================
    ASSIGN USER FORM
    ======================================================
    */

    const assignUserForm =
        document.getElementById(
            "form-assign-user"
        );


    assignUserForm
        ?.addEventListener(
            "submit",
            async (
                event
            ) => {

                event.preventDefault();


                /*
                ==============================================
                SAVE FORM REFERENCE BEFORE AWAIT
                ==============================================
                */

                const form =
                    event.currentTarget;


                const submitButton =
                    form.querySelector(
                        '[type="submit"]'
                    );


                try {

                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            true;

                    }


                    /*
                    ==============================================
                    FORM DATA
                    ==============================================
                    */

                    const formData =
                        new FormData(
                            form
                        );


                    const email =
                        String(
                            formData.get(
                                "email"
                            )
                            ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    const companyId =
                        String(
                            formData.get(
                                "company_id"
                            )
                            ||
                            ""
                        ).trim();


                    const role =
                        String(
                            formData.get(
                                "role"
                            )
                            ||
                            "STAFF"
                        )
                            .trim()
                            .toUpperCase();


                    /*
                    ==============================================
                    VALIDATION
                    ==============================================
                    */

                    if (
                        !email
                    ) {

                        throw new Error(
                            "Email user wajib diisi."
                        );

                    }


                    if (
                        !companyId
                    ) {

                        throw new Error(
                            "Company wajib dipilih."
                        );

                    }


                    /*
                    ==============================================
                    ASSIGN USER
                    ==============================================
                    */

                    await ControlCenterService
                        .assignUser(
                            email,
                            companyId,
                            role
                        );


                    /*
                    ==============================================
                    CLOSE MODAL
                    ==============================================
                    */

                    const modalElement =
                        document.getElementById(
                            "assign-user-modal"
                        );


                    if (
                        modalElement
                        &&
                        typeof bootstrap
                        !==
                        "undefined"
                        &&
                        bootstrap.Modal
                    ) {

                        bootstrap.Modal
                            .getOrCreateInstance(
                                modalElement
                            )
                            .hide();

                    }


                    /*
                    ==============================================
                    RESET
                    ==============================================
                    */

                    form.reset();


                    const roleElement =
                        form.querySelector(
                            '[name="role"]'
                        );


                    if (
                        roleElement
                    ) {

                        roleElement.value =
                            "STAFF";

                    }


                    /*
                    ==============================================
                    MESSAGE + REFRESH
                    ==============================================
                    */

                    showInfo(
                        "User berhasil dihubungkan ke company."
                    );


                    await refresh();

                }
                catch (
                    error
                ) {

                    showError(
                        error
                    );

                }
                finally {

                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            false;

                    }

                }

            }
        );

}
/*
==========================================================
HIDE INITIAL CONTROL CENTER INFO
==========================================================
*/

function hideInitialControlCenterInfo() {

    const alertElement =
        document.getElementById(
            "cc-alert"
        );

    if (
        !alertElement
    ) {

        return;

    }

    /*
    Sembunyikan hanya tampilan awal.
    showInfo() tetap bisa menampilkan
    pesan sukses setelah user melakukan action.
    */

    alertElement.hidden =
        true;

    alertElement.style.display =
        "none";

}
/*
==========================================================
INITIALIZE CONTROL CENTER
==========================================================
*/

async function initialize() {

    /*
    ======================================================
    BIND EVENTS
    ======================================================
    */

    bind();


    /*
    ======================================================
    HIDE INITIAL INFO BANNER
    ======================================================
    */

    hideInitialControlCenterInfo();


    /*
    ======================================================
    INITIAL PAGE FROM HASH
    ======================================================
    */

    const initialPage =
        location.hash
            .replace(
                "#",
                ""
            )
            .trim();


    navigate(
        pages[initialPage]
            ?
        initialPage
            :
        "overview"
    );


    /*
    ======================================================
    LOAD DATA
    ======================================================
    */

    try {

        await loadAll();

        /*
        ==================================================
        START AUDIT LOG REALTIME AFTER AUTH + DATA LOAD
        ==================================================
        */

        startAuditLogRealtime();

    }
    catch (
        error
    ) {

        console.error(
            "Control Center initialization failed:",
            error
        );


        /*
        ==================================================
        AUTH REQUIRED
        ==================================================
        */

        if (
            error?.message
            ===
            "AUTH_REQUIRED"
        ) {

            location.replace(
                "../login.html"
            );


            return;

        }


        /*
        ==================================================
        SUPER ADMIN REQUIRED
        ==================================================
        */

        if (
            error?.message
            ===
            "SUPER_ADMIN_REQUIRED"
        ) {

            showError(
                error
            );


            window.setTimeout(
                () => {

                    location.replace(
                        "../index.html"
                    );

                },
                1800
            );


            return;

        }


        /*
        ==================================================
        OTHER ERROR
        ==================================================
        */

        showError(
            error
        );

    }

}


/*
==========================================================
CONTROL CENTER CLEANUP
==========================================================
*/

window.addEventListener(
    "pagehide",
    () => {

        stopAuditLogRealtime();

    }
);


/*
==========================================================
HASH CHANGE
==========================================================
*/

window.addEventListener(
    "hashchange",
    () => {

        const page =
            location.hash
                .replace(
                    "#",
                    ""
                )
                .trim();


        if (
            pages[page]
        ) {

            navigate(
                page
            );

        }

    }
);


/*
==========================================================
START
==========================================================
*/

initialize();


/*
==========================================================
FINOVA CONTROL CENTER
END OF FILE
==========================================================
*/