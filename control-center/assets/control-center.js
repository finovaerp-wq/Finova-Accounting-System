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

    auditLogs: []

};


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


    window.setTimeout(
        () => {

            alertElement.hidden =
                true;

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
    name
) {

    const targetName =
        pages[name]
            ?
        name
            :
        "overview";


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
            ".cc-nav-item"
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
    LOAD DASHBOARD + PLANS + AUDIT
    ======================================================
    */

    const [
        dashboard,
        plans,
        auditLogs
    ] =
        await Promise.all(
            [

                ControlCenterService
                    .getDashboardData(),

                ControlCenterService
                    .getPlans(),

                ControlCenterService
                    .getAuditLogs()

            ]
        );


    /*
    ======================================================
    UPDATE STATE
    ======================================================
    */

    Object.assign(
        state,
        dashboard,
        {

            dashboard,

            plans:
                Array.isArray(
                    plans
                )
                    ?
                plans
                    :
                [],

            auditLogs:
                Array.isArray(
                    auditLogs
                )
                    ?
                auditLogs
                    :
                []

        }
    );


    /*
    ======================================================
    RENDER
    ======================================================
    */

    renderAll();

}


/*
==========================================================
REFRESH DATA
==========================================================
*/

async function refresh() {

    const [
        dashboard,
        auditLogs
    ] =
        await Promise.all(
            [

                ControlCenterService
                    .getDashboardData(),

                ControlCenterService
                    .getAuditLogs()

            ]
        );


    Object.assign(
        state,
        dashboard,
        {

            dashboard,

            auditLogs:
                Array.isArray(
                    auditLogs
                )
                    ?
                auditLogs
                    :
                []

        }
    );


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

                <td colspan="7">

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

function renderAuditLogs() {

    const tableBody =
        document.getElementById(
            "audit-log-body"
        );


    if (
        !tableBody
    ) {

        return;

    }


    /*
    ======================================================
    FILTER VALUE
    ======================================================
    */

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
            .trim()
            .toLowerCase();


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


    /*
    ======================================================
    AUDIT DATA
    ======================================================
    */

    const auditLogs =

        Array.isArray(
            state.auditLogs
        )

            ?

        state.auditLogs

            :

        [];


    /*
    ======================================================
    FILTER + BUILD ROW
    ======================================================
    */

    const rows =
        auditLogs

            .filter(
                (
                    item
                ) => {

                    const action =
                        String(
                            item.action
                            ||
                            ""
                        ).toUpperCase();


                    /*
                    ==============================================
                    ACTION FILTER
                    ==============================================
                    */

                    if (
                        actionValue
                        &&
                        action
                        !==
                        actionValue
                    ) {

                        return false;

                    }


                    /*
                    ==============================================
                    NO SEARCH FILTER
                    ==============================================
                    */

                    if (
                        !searchValue
                    ) {

                        return true;

                    }


                    /*
                    ==============================================
                    SEARCHABLE DATA
                    ==============================================

                    Search tetap mendukung:
                    - Company
                    - Module
                    - Document
                    - Action
                    - User Name
                    - User Role
                    - User UID
                    - Record
                    - Source
                    ==============================================
                    */

                    const haystack =
                        [

                            getCompanyDisplay(
                                item.company_id
                            ),

                            item.company_id,

                            item.module,

                            item.table_name,

                            item.document_no,

                            item.action,

                            item.user_name,

                            item.user_role,

                            item.user_uid,

                            item.record_id,

                            item.source_module,

                            item.source_id,

                            item.source_no

                        ]
                            .filter(
                                (
                                    value
                                ) => {

                                    return (
                                        value !== null
                                        &&
                                        value !== undefined
                                    );

                                }
                            )
                            .join(
                                " "
                            )
                            .toLowerCase();


                    return haystack.includes(
                        searchValue
                    );

                }
            )

            .map(
                (
                    item
                ) => {

                    /*
                    ==============================================
                    DISPLAY VALUE
                    ==============================================
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
                    ==============================================
                    USER DISPLAY
                    ==============================================

                    Priority:
                    1. user_name dari service
                    2. user_uid jika profile tidak ditemukan
                    3. SYSTEM jika tidak ada actor
                    ==============================================
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


                    const userUid =
                        item.user_uid
                        ||
                        "SYSTEM";


                    /*
                    ==============================================
                    USER ROLE HTML
                    ==============================================
                    */

                    const userRoleHtml =

                        userRole

                            ?

                        `

                            <small class="cc-table-secondary">

                                ${esc(
                                    userRole
                                )}

                            </small>

                        `

                            :

                        "";


                    /*
                    ==============================================
                    ROW
                    ==============================================
                    */

                    return `

                        <tr>


                            <!-- DATE / TIME -->

                            <td>

                                <span class="cc-audit-date">

                                    ${esc(
                                        createdAt
                                    )}

                                </span>

                            </td>


                            <!-- COMPANY -->

                            <td>

                                <div class="cc-table-primary">

                                    ${esc(
                                        companyName
                                    )}

                                </div>

                            </td>


                            <!-- MODULE -->

                            <td>

                                <div class="cc-table-primary">

                                    ${esc(
                                        item.module
                                        ||
                                        "-"
                                    )}

                                </div>

                                <small class="cc-table-secondary">

                                    ${esc(
                                        item.table_name
                                        ||
                                        "-"
                                    )}

                                </small>

                            </td>


                            <!-- DOCUMENT -->

                            <td>

                                <span class="cc-mono">

                                    ${esc(
                                        documentNo
                                    )}

                                </span>

                            </td>


                            <!-- ACTION -->

                            <td>

                                ${auditBadge(
                                    item.action
                                )}

                            </td>


                            <!-- USER -->

                            <td>

                                <div
                                    class="cc-audit-user"
                                    title="${esc(
                                        userUid
                                    )}">

                                    <div class="cc-table-primary">

                                        ${esc(
                                            userName
                                        )}

                                    </div>

                                    ${userRoleHtml}

                                </div>

                            </td>


                            <!-- VIEW -->

                            <td class="text-center">

                                <button
                                    type="button"
                                    class="cc-btn icon small"
                                    data-audit-view="${esc(
                                        item.id
                                    )}"
                                    title="View Audit Detail"
                                    aria-label="View Audit Detail">

                                    <i class="fa-solid fa-eye"></i>

                                </button>

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

    tableBody.innerHTML =

        rows

        ||

        `

            <tr class="cc-empty">

                <td colspan="7">

                    <i class="fa-regular fa-folder-open"></i>

                    <span>
                        Belum ada audit log yang sesuai.
                    </span>

                </td>

            </tr>

        `;


    /*
    ======================================================
    VIEW DETAIL EVENT
    ======================================================
    */

    tableBody
        .querySelectorAll(
            "[data-audit-view]"
        )
        .forEach(
            (
                button
            ) => {

                button.addEventListener(
                    "click",
                    () => {

                        const auditId =
                            button.dataset.auditView;


                        openAuditDetail(
                            auditId
                        );

                    }
                );

            }
        );

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


    const userDisplay =
        userRole

            ?

        `${userName} (${userRole})`

            :

        userName;


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

                renderAuditLogs();

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

                renderAuditLogs();

            }
        );


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

                    button.disabled =
                        true;


                    const auditLogs =
                        await ControlCenterService
                            .getAuditLogs();


                    state.auditLogs =

                        Array.isArray(
                            auditLogs
                        )

                            ?

                        auditLogs

                            :

                        [];


                    renderAuditLogs();


                    showInfo(
                        "Audit Log diperbarui."
                    );

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

                        navigate(
                            button.dataset.page
                        );

                    }
                );

            }
        );


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