/*
==========================================================
FINOVA CONTROL CENTER
TAHAP 3
FINAL FIX
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
        "Riwayat aktivitas administratif FINOVA Control Center."
    ]

};


/*
==========================================================
FORMATTER
==========================================================
*/

const idr = (value) => {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(value || 0)
    );

};


const esc = (value) => {

    return String(
        value ?? ""
    ).replace(
        /[&<>'"]/g,
        (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        }[char])
    );

};


const fmtDate = (value) => {

    if (!value) {

        return "-";

    }

    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(
        new Date(
            `${value}T00:00:00`
        )
    );

};


/*
==========================================================
BADGE
==========================================================
*/

function badge(value) {

    const currentValue =
        String(
            value || ""
        ).toUpperCase();


    const badgeClass =

        [
            "ACTIVE",
            "PAID"
        ].includes(
            currentValue
        )

            ? "success"

            :

        [
            "SUSPENDED",
            "OVERDUE",
            "UNPAID"
        ].includes(
            currentValue
        )

            ? "warning"

            :

        "neutral";


    return `
        <span class="cc-badge ${badgeClass}">
            ${esc(currentValue || "-")}
        </span>
    `;

}


/*
==========================================================
SHOW ERROR
==========================================================
*/

function showError(error) {

    console.error(
        error
    );


    const message =

        error?.message === "AUTH_REQUIRED"

            ? "Silakan login terlebih dahulu."

            :

        error?.message === "SUPER_ADMIN_REQUIRED"

            ? "Akun ini bukan FINOVA Super Admin."

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
        alertElement
    ) {

        alertElement.className =
            "cc-alert error";

        alertElement.textContent =
            message;

        alertElement.hidden =
            false;

    }

}


/*
==========================================================
SHOW INFO
==========================================================
*/

function showInfo(message) {

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


    setTimeout(
        () => {

            alertElement.hidden =
                true;

        },
        3500
    );

}


/*
==========================================================
NAVIGATION
==========================================================
*/

function navigate(name) {

    document
        .querySelectorAll(
            ".cc-page"
        )
        .forEach(
            (element) => {

                element.classList.remove(
                    "active"
                );

            }
        );


    document
        .querySelectorAll(
            ".cc-nav-item"
        )
        .forEach(
            (element) => {

                element.classList.remove(
                    "active"
                );

            }
        );


    document
        .getElementById(
            `page-${name}`
        )
        ?.classList.add(
            "active"
        );


    document
        .querySelector(
            `.cc-nav-item[data-page="${name}"]`
        )
        ?.classList.add(
            "active"
        );


    const pageMeta =
        pages[name]
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


    history.replaceState(
        null,
        "",
        `#${name}`
    );


    closeSidebar();

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
LOAD ALL
==========================================================
*/

async function loadAll() {

    const auth =
        await ControlCenterService
            .requireSuperAdmin();


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
            .map(
                (item) => item[0]
            )
            .join("")
            .slice(
                0,
                2
            )
            .toUpperCase();


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


    Object.assign(
        state,
        dashboard,
        {
            dashboard,
            plans,
            auditLogs
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


    if (
        companiesKpi
    ) {

        companiesKpi.textContent =
            dashboard
                .activeCompanies
                .length;

    }


    if (
        usersKpi
    ) {

        usersKpi.textContent =
            dashboard
                .activeUsers
                .length;

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
            dashboard
                .expiring
                .length;

    }


    const rows =

        state
            .companies
            .slice(
                0,
                5
            )
            .map(
                (company) => {

                    const activeUserCount =

                        state
                            .users
                            .filter(
                                (user) =>

                                    user.company_id
                                    ===
                                    company.id

                                    &&

                                    user.membership_status
                                    ===
                                    "ACTIVE"

                            )
                            .length;


                    const subscription =

                        state
                            .subscriptions
                            .find(
                                (item) =>

                                    item.company_id
                                    ===
                                    company.id

                                    &&

                                    item.status
                                    ===
                                    "ACTIVE"

                            );


                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${esc(
                                        company.company_code
                                    )}
                                </strong>

                                <br>

                                <small>
                                    ${esc(
                                        company.company_name
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
                                ${company.max_users}

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
            .join("");


    const tableBody =
        document.getElementById(
            "overview-company-body"
        );


    if (
        tableBody
    ) {

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


    const rows =

        state
            .companies
            .map(
                (company) => {

                    const activeUserCount =

                        state
                            .users
                            .filter(
                                (user) =>

                                    user.company_id
                                    ===
                                    company.id

                                    &&

                                    user.membership_status
                                    ===
                                    "ACTIVE"

                            )
                            .length;


                    const actionButton =

                        company.status
                        ===
                        "ACTIVE"

                            ?

                        `

                        <button
                            type="button"
                            class="btn btn-outline-danger btn-sm"
                            data-company-status="${company.id}"
                            data-status="SUSPENDED">

                            Suspend

                        </button>

                        `

                            :

                        `

                        <button
                            type="button"
                            class="btn btn-outline-success btn-sm"
                            data-company-status="${company.id}"
                            data-status="ACTIVE">

                            Activate

                        </button>

                        `;


                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${esc(
                                        company.company_code
                                    )}
                                </strong>

                            </td>

                            <td>

                                ${esc(
                                    company.company_name
                                )}

                            </td>

                            <td>

                                ${activeUserCount}
                                /
                                ${company.max_users}

                            </td>

                            <td>

                                ${badge(
                                    company.status
                                )}

                            </td>

                            <td>

                                ${actionButton}

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


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


    document
        .querySelectorAll(
            "[data-company-status]"
        )
        .forEach(
            (button) => {

                button.onclick =
                    async () => {

                        try {

                            button.disabled =
                                true;


                            await ControlCenterService
                                .setCompanyStatus(
                                    button.dataset.companyStatus,
                                    button.dataset.status
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

                    };

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


    const rows =

        state
            .subscriptions
            .map(
                (subscription) => {

                    return `

                        <tr>

                            <td>

                                ${esc(
                                    subscription
                                        .finova_companies
                                        ?.company_name
                                    ||
                                    "-"
                                )}

                            </td>

                            <td>

                                ${esc(
                                    subscription
                                        .finova_plans
                                        ?.plan_name
                                    ||
                                    "-"
                                )}

                            </td>

                            <td>

                                ${fmtDate(
                                    subscription.start_date
                                )}

                            </td>

                            <td>

                                ${fmtDate(
                                    subscription.end_date
                                )}

                            </td>

                            <td class="text-end">

                                ${idr(
                                    subscription.amount
                                )}

                            </td>

                            <td>

                                ${badge(
                                    subscription.payment_status
                                )}

                            </td>

                            <td>

                                ${badge(
                                    subscription.status
                                )}

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


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


    const rows =

        state
            .users
            .map(
                (user) => {

                    return `

                        <tr>

                            <td>

                                ${esc(
                                    user.email
                                )}

                            </td>

                            <td>

                                ${esc(
                                    user.full_name
                                    ||
                                    "-"
                                )}

                            </td>

                            <td>

                                ${esc(
                                    user.company_name
                                    ||
                                    "Belum terhubung"
                                )}

                            </td>

                            <td>

                                ${esc(
                                    user.company_role
                                    ||
                                    "-"
                                )}

                            </td>

                            <td>

                                ${
                                    user.company_id

                                        ?

                                    badge(
                                        user.membership_status
                                    )

                                        :

                                    `

                                    <span class="cc-badge neutral">
                                        UNASSIGNED
                                    </span>

                                    `
                                }

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


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

    if (!tableBody) {
        return;
    }

    const searchValue =
        String(
            document.getElementById("audit-search")?.value || ""
        ).trim().toLowerCase();

    const actionValue =
        String(
            document.getElementById("audit-action")?.value || ""
        ).trim().toUpperCase();

    const companyMap = new Map(
        state.companies.map(
            (company) => [company.id, `${company.company_code} — ${company.company_name}`]
        )
    );

    const rows = state.auditLogs
        .filter((item) => {
            const action = String(item.action || "").toUpperCase();
            if (actionValue && action !== actionValue) {
                return false;
            }

            if (!searchValue) {
                return true;
            }

            const haystack = [
                companyMap.get(item.company_id) || item.company_id || "",
                item.module,
                item.table_name,
                item.document_no,
                item.action,
                item.user_uid,
                item.source_module,
                item.source_no
            ].join(" ").toLowerCase();

            return haystack.includes(searchValue);
        })
        .map((item) => {
            const createdAt = item.created_at
                ? new Intl.DateTimeFormat("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }).format(new Date(item.created_at))
                : "-";

            const companyName =
                companyMap.get(item.company_id)
                || (item.company_id ? item.company_id : "SYSTEM");

            const documentNo =
                item.document_no
                || item.source_no
                || "-";

            return `
                <tr>
                    <td>${esc(createdAt)}</td>
                    <td>${esc(companyName)}</td>
                    <td><strong>${esc(item.module || "-")}</strong><br><small>${esc(item.table_name || "-")}</small></td>
                    <td>${esc(documentNo)}</td>
                    <td>${badge(item.action)}</td>
                    <td><span class="cc-mono">${esc(item.user_uid || "SYSTEM")}</span></td>
                </tr>
            `;
        })
        .join("");

    tableBody.innerHTML = rows || `
        <tr class="cc-empty">
            <td colspan="6">
                <i class="fa-regular fa-folder-open"></i>
                <span>Belum ada audit log yang sesuai.</span>
            </td>
        </tr>
    `;
}


/*
==========================================================
FILL SELECTS
==========================================================
*/

function fillSelects() {

    const companyOptions =

        state
            .companies
            .filter(
                (company) =>

                    company.status
                    ===
                    "ACTIVE"

            )
            .map(
                (company) => {

                    return `

                        <option value="${company.id}">

                            ${esc(
                                company.company_code
                            )}
                            —
                            ${esc(
                                company.company_name
                            )}

                        </option>

                    `;

                }
            )
            .join("");


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


    if (
        subscriptionPlan
    ) {

        subscriptionPlan.innerHTML =

            `
            <option value="">
                Pilih paket
            </option>
            `

            +

            state
                .plans
                .filter(
                    (plan) =>

                        plan.is_active
                        !==
                        false

                )
                .map(
                    (plan) => {

                        return `

                            <option
                                value="${plan.id}"
                                data-price="${plan.price}"
                                data-cycle="${plan.billing_cycle}">

                                ${esc(
                                    plan.plan_name
                                )}
                                —
                                ${idr(
                                    plan.price
                                )}

                            </option>

                        `;

                    }
                )
                .join("");

    }

}


/*
==========================================================
REFRESH DATA
==========================================================
*/

async function refresh() {

    const [dashboard, auditLogs] =
        await Promise.all([
            ControlCenterService.getDashboardData(),
            ControlCenterService.getAuditLogs()
        ]);

    Object.assign(
        state,
        dashboard,
        {
            dashboard,
            auditLogs
        }
    );

    renderAll();

}


/*
==========================================================
SET SUGGESTED SUBSCRIPTION END DATE
==========================================================
*/

function setSuggestedEndDate(cycle) {

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


    const value =
        startElement.value;


    if (
        !value
    ) {

        return;

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        cycle === "ANNUAL"
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


    date.setDate(
        date.getDate()
        -
        1
    );


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
        .getElementById("btn-logout")
        ?.addEventListener("click", async () => {
            const button = document.getElementById("btn-logout");

            try {
                if (button) button.disabled = true;
                await ControlCenterService.logout();
                location.replace("../login.html");
            }
            catch (error) {
                showError(error);
                if (button) button.disabled = false;
            }
        });


    /*
    ======================================================
    AUDIT FILTER / REFRESH
    ======================================================
    */

    document
        .getElementById("audit-search")
        ?.addEventListener("input", renderAuditLogs);

    document
        .getElementById("audit-action")
        ?.addEventListener("change", renderAuditLogs);

    document
        .getElementById("btn-refresh-audit")
        ?.addEventListener("click", async (event) => {
            const button = event.currentTarget;
            try {
                button.disabled = true;
                state.auditLogs = await ControlCenterService.getAuditLogs();
                renderAuditLogs();
                showInfo("Audit Log diperbarui.");
            }
            catch (error) {
                showError(error);
            }
            finally {
                button.disabled = false;
            }
        });


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
            (button) => {

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
            (button) => {

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
    MOBILE SIDEBAR
    ======================================================
    */

    document
        .getElementById(
            "btn-sidebar"
        )
        ?.addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "cc-sidebar"
                    )
                    ?.classList.toggle(
                        "show"
                    );


                document
                    .getElementById(
                        "cc-overlay"
                    )
                    ?.classList.toggle(
                        "show"
                    );

            }
        );


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
    COMPANY FORM
    FIX : SAVE FORM REFERENCE BEFORE AWAIT
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
                Save form reference before await.
                Do not use event.currentTarget after await.
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


                    const formData =
                        new FormData(
                            form
                        );


                    const payload =
                        Object.fromEntries(
                            formData.entries()
                        );


                    await ControlCenterService
                        .createCompany(
                            payload
                        );


                    const modalElement =
                        document.getElementById(
                            "company-modal"
                        );


                    const modalInstance =
                        modalElement
                            ?
                        bootstrap.Modal
                            .getInstance(
                                modalElement
                            )
                            :
                        null;


                    modalInstance
                        ?.hide();


                    /*
                    IMPORTANT
                    Form reference is safe.
                    */

                    form.reset();


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


                if (
                    !selectedOption
                    ||
                    !selectedOption.value
                ) {

                    return;

                }


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
    FIX : SAVE FORM REFERENCE BEFORE AWAIT
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


                    const formData =
                        new FormData(
                            form
                        );


                    const payload =
                        Object.fromEntries(
                            formData.entries()
                        );


                    await ControlCenterService
                        .createSubscription(
                            payload
                        );


                    const modalElement =
                        document.getElementById(
                            "subscription-modal"
                        );


                    const modalInstance =
                        modalElement
                            ?
                        bootstrap.Modal
                            .getInstance(
                                modalElement
                            )
                            :
                        null;


                    modalInstance
                        ?.hide();


                    form.reset();


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
    FIX : SAVE FORM REFERENCE BEFORE AWAIT
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


                    const formData =
                        new FormData(
                            form
                        );


                    const email =
                        formData.get(
                            "email"
                        );


                    const companyId =
                        formData.get(
                            "company_id"
                        );


                    const role =
                        formData.get(
                            "role"
                        );


                    await ControlCenterService
                        .assignUser(
                            email,
                            companyId,
                            role
                        );


                    const modalElement =
                        document.getElementById(
                            "assign-user-modal"
                        );


                    const modalInstance =
                        modalElement
                            ?
                        bootstrap.Modal
                            .getInstance(
                                modalElement
                            )
                            :
                        null;


                    modalInstance
                        ?.hide();


                    form.reset();


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
INITIALIZE
==========================================================
*/

bind();


const initialPage =
    location
        .hash
        .replace(
            "#",
            ""
        );


navigate(
    pages[initialPage]
        ?
    initialPage
        :
    "overview"
);


/*
==========================================================
LOAD CONTROL CENTER DATA
==========================================================
*/

loadAll()
    .catch(
        (
            error
        ) => {

            showError(
                error
            );


            document
                .getElementById(
                    "cc-loading"
                )
                ?.remove();


            if (
                ["AUTH_REQUIRED", "SUPER_ADMIN_REQUIRED"].includes(
                    error?.message
                )
            ) {

                setTimeout(
                    () => {

                        location.replace(
                            "../login.html"
                        );

                    },
                    1200
                );

            }

        }
    );