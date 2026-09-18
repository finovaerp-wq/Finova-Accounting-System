/*
===========================================
FINOVA ACCOUNTING SYSTEM
Router
Version : 2.0.0
===========================================
*/

export class FinovaRouter {

    constructor() {

        this.routes = {

            dashboard: {
                title: "Dashboard",
                html: "modules/dashboard/dashboard.html",
                js: "modules/dashboard/dashboard.js",
                className: "Dashboard"
            },

            "user-management": {
                title: "User Management",
                html: "modules/user-management/user-management.html",
                js: "modules/user-management/user-management.js",
                className: "UserManagement"
            },

            "business-partner": {
                title: "Business Partner",
                html: "modules/business-partner/business-partner.html",
                js: "modules/business-partner/business-partner.js",
                className: "BusinessPartner"
            },

            "chart-of-accounts": {
                title: "Chart Of Accounts",
                html: "modules/chart-of-accounts/chart-of-accounts.html",
                js: "modules/chart-of-accounts/chart-of-accounts.js",
                className: "ChartOfAccounts"
                
            },
            "tax": {
                title: "Tax Master",
                html: "modules/tax/tax.html",
                js: "modules/tax/tax.js",
                className: "Tax"

                
            },
            "accounting-period": {

                title:
                    "Accounting Period",

                html:
                    "modules/accounting-period/accounting-period.html",

                js:
                    "modules/accounting-period/accounting-period.js",

                className:
                    "AccountingPeriod"

            },

            "account-payable": {
                title: "Account Payable",
                html: "modules/account-payable/account-payable.html",
                js: "modules/account-payable/account-payable.js",
                className: "AccountPayable"
            },

            "account-receivable": {
                title: "Account Receivable",
                html: "modules/account-receivable/account-receivable.html",
                js: "modules/account-receivable/account-receivable.js",
                className: "AccountReceivable"
            },

            "aging-payable": {
                title: "Aging Payable",
                html: "modules/aging-payable/aging-payable.html",
                js: "modules/aging-payable/aging-payable.js",
                className: "AgingPayable"
            },

            "aging-receivable": {
                title: "Aging Receivable",
                html: "modules/aging-receivable/aging-receivable.html",
                js: "modules/aging-receivable/aging-receivable.js",
                className: "AgingReceivable"
            },

            "gl-journal": {
                title: "GL Journal",
                html: "modules/gl-journal/gl-journal.html",
                js: "modules/gl-journal/gl-journal.js",
                className: "GeneralJournal"

            },

            

            "general-ledger": {
                title: "General Ledger",
                html: "modules/general-ledger/general-ledger.html",
                js: "modules/general-ledger/general-ledger.js",
                className: "GeneralLedger"
            },

            "trial-balance-year": {
                title: "Trial Balance Year",
                html: "modules/trial-balance-year/trial-balance-year.html",
                js: "modules/trial-balance-year/trial-balance-year.js",
                className: "TrialBalanceYear"
            },


            "balance-sheet": {
                title: "Balance Sheet",
                html: "modules/balance-sheet/balance-sheet.html",
                js: "modules/balance-sheet/balance-sheet.js",
                className: "BalanceSheet"
            },

            "profit-loss": {
                title: "Profit & Loss",
                html: "modules/profit-loss/profit-loss.html",
                js: "modules/profit-loss/profit-loss.js",
                className: "ProfitLoss"
            },
            "financial-statement": {

    title:
        "Financial Statement",

    html:
        "modules/financial-statement/financial-statement.html",

    css:
        "modules/financial-statement/financial-statement.css",

    js:
        "modules/financial-statement/financial-statement.js",

    className:
        "FinancialStatement"

},


/*
==========================================================
CASH FLOW FORECAST
==========================================================
*/

"cash-flow-forecast": {

    title:
        "Cash Flow Forecast",

    html:
        "modules/cash-flow-forecast/cash-flow-forecast.html",

    css:
        "modules/cash-flow-forecast/cash-flow-forecast.css",

    js:
        "modules/cash-flow-forecast/cash-flow-forecast.js",

    className:
        "CashFlowForecast"

},

};

        /*
==========================================================
WORKSPACE STATE
==========================================================
*/

this.currentModule =
    null;


/*
==========================================================
OPEN WORKSPACE TABS

Map structure:

moduleName => {
    route,
    panel,
    instance
}
==========================================================
*/

this.openTabs =
    new Map();


/*
==========================================================
TAB HISTORY

Digunakan ketika tab aktif ditutup
==========================================================
*/

this.tabHistory =
    [];


/*
==========================================================
INITIALIZE
==========================================================
*/

this.initialize();

    }
    /*
==========================================================
CREATE HOME TAB
==========================================================
*/

createHomeTab() {

    /*
    ======================================================
    GET TAB CONTAINER
    ======================================================
    */

    const tabContainer =
        document.getElementById(
            "finova-workspace-tabs"
        );


    if (!tabContainer) {

        console.warn(
            "FINOVA ROUTER: #finova-workspace-tabs not found."
        );

        return;

    }


    /*
    ======================================================
    PREVENT DUPLICATE
    ======================================================
    */

    const existingTab =
        document.getElementById(
            "finova-tab-dashboard"
        );


    if (existingTab) {

        return;

    }


    /*
    ======================================================
    CREATE TAB
    ======================================================
    */

    const tab =
        document.createElement(
            "div"
        );


    tab.id =
        "finova-tab-dashboard";


    tab.className =
        "finova-workspace-tab home active";


    tab.dataset.module =
        "dashboard";

    tab.setAttribute(
    "role",
    "tab"
);


tab.setAttribute(
    "aria-selected",
    "true"
);


    /*
    ======================================================
    TAB CONTENT
    ======================================================
    */

    tab.innerHTML = `

        <span
            class="finova-workspace-tab-icon">

            <i class="fa-solid fa-house"></i>

        </span>


        <span
            class="finova-workspace-tab-title">

            Home

        </span>

    `;


    /*
    ======================================================
    CLICK EVENT
    ======================================================
    */

    tab.addEventListener(
        "click",
        () => {

            this.navigate(
                "dashboard"
            );

        }
    );


    /*
    ======================================================
    APPEND
    ======================================================
    */

    tabContainer.appendChild(
        tab
    );


    console.log(
        "FINOVA HOME TAB CREATED"
    );

}

/*
==========================================================
LOAD CSS
==========================================================
*/

async loadCSS(
    route
) {

    /*
    ======================================================
    ROUTE WITHOUT CSS
    ======================================================

    Existing FINOVA modules are still allowed to operate
    without a CSS property in their route configuration.
    ======================================================
    */

    if (
        !route
        ||
        !route.css
    ) {

        return;

    }


    /*
    ======================================================
    CREATE CSS URL
    ======================================================
    */

    const url =
        new URL(
            route.css,
            document.baseURI
        );


    /*
    ======================================================
    UNIQUE STYLESHEET KEY
    ======================================================

    Keep one stylesheet element for each module CSS file.
    This is important for FINOVA multi-tab workspace.
    ======================================================
    */

    const stylesheetKey =
        url.pathname;


    /*
    ======================================================
    FIND EXISTING STYLESHEET
    ======================================================
    */

    const existingStylesheet =
        Array
            .from(
                document.querySelectorAll(
                    'link[data-finova-module-css]'
                )
            )
            .find(
                link =>
                    link.dataset.finovaModuleCss
                    ===
                    stylesheetKey
            );


    /*
    ======================================================
    ALREADY LOADED
    ======================================================
    */

    if (
        existingStylesheet
        &&
        existingStylesheet.dataset.loaded
        ===
        "true"
    ) {

        console.log(
            "FINOVA MODULE CSS REUSED :",
            route.css
        );


        return;

    }


    /*
    ======================================================
    WAIT EXISTING CSS LOAD
    ======================================================

    Prevent duplicate <link> elements if the same module
    is requested while its stylesheet is still loading.
    ======================================================
    */

    if (
        existingStylesheet
    ) {

        await new Promise(
            (
                resolve,
                reject
            ) => {

                existingStylesheet.addEventListener(
                    "load",
                    () => resolve(),
                    {
                        once:
                            true
                    }
                );


                existingStylesheet.addEventListener(
                    "error",
                    () => reject(
                        new Error(
                            `Failed to load CSS: ${route.css}`
                        )
                    ),
                    {
                        once:
                            true
                    }
                );

            }
        );


        return;

    }


    /*
    ======================================================
    CREATE STYLESHEET
    ======================================================
    */

    const stylesheet =
        document.createElement(
            "link"
        );


    stylesheet.rel =
        "stylesheet";


    stylesheet.dataset.finovaModuleCss =
        stylesheetKey;


    stylesheet.dataset.loaded =
        "false";


    /*
    ======================================================
    CACHE BUSTER
    ======================================================
    */

    url.searchParams.set(
        "v",
        Date.now().toString()
    );


    stylesheet.href =
        url.href;


    /*
    ======================================================
    LOAD STYLESHEET
    ======================================================
    */

    await new Promise(
        (
            resolve,
            reject
        ) => {

            stylesheet.addEventListener(
                "load",
                () => {

                    stylesheet.dataset.loaded =
                        "true";


                    console.log(
                        "FINOVA MODULE CSS LOADED :",
                        route.css
                    );


                    resolve();

                },
                {
                    once:
                        true
                }
            );


            stylesheet.addEventListener(
                "error",
                () => {

                    stylesheet.remove();


                    reject(
                        new Error(
                            `Failed to load CSS: ${route.css}`
                        )
                    );

                },
                {
                    once:
                        true
                }
            );


            document.head.appendChild(
                stylesheet
            );

        }
    );

}
/*
==========================================================
CREATE WORKSPACE TAB
==========================================================
*/

createWorkspaceTab(
    moduleName,
    route
) {

    /*
    ======================================================
    DASHBOARD USES HOME TAB
    ======================================================
    */

    if (
        moduleName ===
        "dashboard"
    ) {

        return;

    }


    /*
    ======================================================
    GET TAB CONTAINER
    ======================================================
    */

    const tabContainer =
        document.getElementById(
            "finova-workspace-tabs"
        );


    if (
        !tabContainer
    ) {

        console.warn(
            "FINOVA ROUTER: #finova-workspace-tabs not found."
        );

        return;

    }


    /*
    ======================================================
    PREVENT DUPLICATE TAB
    ======================================================
    */

    const existingTab =
        document.getElementById(
            `finova-tab-${moduleName}`
        );


    if (
        existingTab
    ) {

        return existingTab;

    }


    /*
    ======================================================
    CREATE TAB
    ======================================================
    */

    const tab =
        document.createElement(
            "div"
        );


    tab.id =
        `finova-tab-${moduleName}`;


    tab.className =
        "finova-workspace-tab";


    tab.dataset.module =
        moduleName;
    tab.setAttribute(
    "role",
    "tab"
);


tab.setAttribute(
    "aria-selected",
    "false"
);


    /*
    ======================================================
    TAB CONTENT
    ======================================================
    */

    tab.innerHTML = `

        <span
            class="finova-workspace-tab-title">

            ${route.title}

        </span>


        <button
            type="button"
            class="finova-workspace-tab-close"
            aria-label="Close">

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;


    /*
    ======================================================
    TAB CLICK
    ======================================================
    */

    tab.addEventListener(
        "click",
        event => {

            /*
            Ignore close button
            */

            if (
                event.target.closest(
                    ".finova-workspace-tab-close"
                )
            ) {

                return;

            }


            this.navigate(
                moduleName
            );

        }
    );


    /*
    ======================================================
    CLOSE BUTTON
    ======================================================
    */

    const closeButton =
        tab.querySelector(
            ".finova-workspace-tab-close"
        );


    if (
        closeButton
    ) {

        closeButton.addEventListener(
    "click",
    event => {

        /*
        ==============================================
        PREVENT TAB CLICK
        ==============================================
        */

        event.preventDefault();

        event.stopPropagation();


        /*
        ==============================================
        CLOSE WORKSPACE
        ==============================================
        */

        this.closeWorkspaceTab(
            moduleName
        );

    }
);
    }


    /*
    ======================================================
    APPEND TAB
    ======================================================
    */

    tabContainer.appendChild(
        tab
    );


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return tab;

}
/*
==========================================================
CLOSE WORKSPACE TAB
==========================================================
*/

closeWorkspaceTab(
    moduleName
) {

    /*
    ======================================================
    HOME CANNOT BE CLOSED
    ======================================================
    */

    if (
        moduleName ===
        "dashboard"
    ) {

        return;

    }


    /*
    ======================================================
    CHECK WORKSPACE
    ======================================================
    */

    const workspace =
        this.openTabs.get(
            moduleName
        );


    if (
        !workspace
    ) {

        return;

    }


    /*
    ======================================================
    ACTIVE STATE
    ======================================================
    */

    const wasActive =
        this.currentModule ===
        moduleName;


    /*
    ======================================================
    CLEAN BOOTSTRAP OVERLAY
    ======================================================
    */

    this.cleanupWorkspaceOverlay(
        moduleName
    );


    /*
    ======================================================
    DESTROY MODULE INSTANCE
    ======================================================
    */

    if (
        workspace.instance
        &&
        typeof workspace.instance.destroy ===
            "function"
    ) {

        try {

            workspace.instance.destroy();

        }

        catch (
            error
        ) {

            console.warn(
                "FINOVA MODULE DESTROY ERROR :",
                moduleName,
                error
            );

        }

    }


    /*
    ======================================================
    REMOVE PANEL
    ======================================================
    */

    if (
        workspace.panel
    ) {

        workspace.panel.remove();

    }

    else {

        const panel =
            document.getElementById(
                `finova-panel-${moduleName}`
            );


        if (
            panel
        ) {

            panel.remove();

        }

    }


    /*
    ======================================================
    REMOVE TAB
    ======================================================
    */

    const tab =
        document.getElementById(
            `finova-tab-${moduleName}`
        );


    if (
        tab
    ) {

        tab.remove();

    }


    /*
    ======================================================
    REMOVE OPEN TAB STATE
    ======================================================
    */

    this.openTabs.delete(
        moduleName
    );


    /*
    ======================================================
    REMOVE HISTORY
    ======================================================
    */

    this.tabHistory =
        this.tabHistory.filter(
            item =>
                item !== moduleName
        );


    /*
    ======================================================
    IF CLOSED TAB WAS NOT ACTIVE
    ======================================================
    */

    if (
        !wasActive
    ) {

        return;

    }


    /*
    ======================================================
    FIND PREVIOUS MODULE
    ======================================================
    */

    let previousModule =
        this.tabHistory[
            this.tabHistory.length - 1
        ];


    /*
    ======================================================
    FALLBACK HOME
    ======================================================
    */

    if (
        !previousModule
        ||
        !this.openTabs.has(
            previousModule
        )
    ) {

        previousModule =
            "dashboard";

    }


    /*
    ======================================================
    ACTIVATE PREVIOUS MODULE
    ======================================================
    */

    this.navigate(
        previousModule
    );

}

/*
==========================================================
CREATE WORKSPACE PANEL
==========================================================
*/

createWorkspacePanel(
    moduleName
) {

    /*
    ======================================================
    GET WORKSPACE CONTENT
    ======================================================
    */

    const workspace =
        document.getElementById(
            "finova-content"
        );


    if (
        !workspace
    ) {

        throw new Error(
            "FINOVA ROUTER: #finova-content not found."
        );

    }


    /*
    ======================================================
    RETURN EXISTING PANEL
    ======================================================
    */

    const existingPanel =
        document.getElementById(
            `finova-panel-${moduleName}`
        );


    if (
        existingPanel
    ) {

        return existingPanel;

    }


    /*
    ======================================================
    CREATE PANEL
    ======================================================
    */

    const panel =
        document.createElement(
            "section"
        );


    /*
    ======================================================
    ATTRIBUTES
    ======================================================
    */

    panel.id =
        `finova-panel-${moduleName}`;


    panel.className =
        "finova-workspace-panel";


    panel.dataset.module =
        moduleName;


    panel.setAttribute(
        "role",
        "tabpanel"
    );


    panel.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
    ======================================================
    APPEND
    ======================================================
    */

    workspace.appendChild(
        panel
    );


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return panel;

}
/*
==========================================================
CLEANUP WORKSPACE OVERLAY
==========================================================
*/

cleanupWorkspaceOverlay(
    moduleName = null
) {

    /*
    ======================================================
    GET TARGET PANEL
    ======================================================
    */

    let panel =
        null;


    if (
        moduleName
    ) {

        panel =
            document.getElementById(
                `finova-panel-${moduleName}`
            );

    }


    /*
    ======================================================
    GET OPEN MODALS
    ======================================================
    */

    const modalElements =
        panel
            ? panel.querySelectorAll(
                ".modal.show"
            )
            : document.querySelectorAll(
                ".modal.show"
            );


    /*
    ======================================================
    HIDE ACTIVE BOOTSTRAP MODALS
    ======================================================
    */

    modalElements.forEach(
        modalElement => {

            try {

                if (
                    window.bootstrap
                    &&
                    bootstrap.Modal
                ) {

                    const modalInstance =
                        bootstrap.Modal.getInstance(
                            modalElement
                        );


                    if (
                        modalInstance
                    ) {

                        modalInstance.hide();

                    }

                }

            }

            catch (
                error
            ) {

                console.warn(
                    "FINOVA MODAL CLEANUP :",
                    error
                );

            }

        }
    );


    /*
    ======================================================
    REMOVE LEFTOVER BACKDROP
    ======================================================
    */

    document
        .querySelectorAll(
            ".modal-backdrop"
        )
        .forEach(
            backdrop => {

                backdrop.remove();

            }
        );


    /*
    ======================================================
    RESTORE BODY
    ======================================================
    */

    document.body.classList.remove(
        "modal-open"
    );


    document.body.style.removeProperty(
        "overflow"
    );


    document.body.style.removeProperty(
        "padding-right"
    );

}
/*
==========================================================
ACTIVATE WORKSPACE
==========================================================
*/

activateWorkspace(
    moduleName
) {

    /*
    ======================================================
    VALIDATE WORKSPACE
    ======================================================
    */

    const workspace =
        this.openTabs.get(
            moduleName
        );


    /*
    Dashboard may be activated
    before it is registered in openTabs
    during first initialization.
    */

    const panel =
        document.getElementById(
            `finova-panel-${moduleName}`
        );


    if (
        !panel
    ) {

        console.warn(
            "FINOVA WORKSPACE PANEL NOT FOUND :",
            moduleName
        );

        return;

    }


    /*
    ======================================================
    CLEAN CURRENT MODULE OVERLAY
    ======================================================
    */

    if (
        this.currentModule
        &&
        this.currentModule !==
            moduleName
    ) {

        this.cleanupWorkspaceOverlay(
            this.currentModule
        );

    }


    /*
    ======================================================
    DEACTIVATE ALL TABS
    ======================================================
    */

    document
        .querySelectorAll(
            "#finova-workspace-tabs .finova-workspace-tab"
        )
        .forEach(
            tab => {

                tab.classList.remove(
                    "active"
                );

                tab.setAttribute(
                    "aria-selected",
                    "false"
                );

            }
        );


    /*
    ======================================================
    DEACTIVATE ALL PANELS
    ======================================================
    */

    document
        .querySelectorAll(
            "#finova-content .finova-workspace-panel"
        )
        .forEach(
            workspacePanel => {

                workspacePanel.classList.remove(
                    "active"
                );

                workspacePanel.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );


    /*
    ======================================================
    ACTIVATE CURRENT TAB
    ======================================================
    */

    const tab =
        document.getElementById(
            `finova-tab-${moduleName}`
        );


    if (
        tab
    ) {

        tab.classList.add(
            "active"
        );


        tab.setAttribute(
            "aria-selected",
            "true"
        );


        /*
        Keep active tab visible
        when many tabs are opened.
        */

        tab.scrollIntoView(
            {
                behavior:
                    "smooth",

                block:
                    "nearest",

                inline:
                    "nearest"
            }
        );

    }


    /*
    ======================================================
    ACTIVATE PANEL
    ======================================================
    */

    panel.classList.add(
        "active"
    );


    panel.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
    ======================================================
    CURRENT MODULE
    ======================================================
    */

    this.currentModule =
        moduleName;


    /*
    ======================================================
    TAB HISTORY
    ======================================================
    */

    this.tabHistory =
        this.tabHistory.filter(
            item =>
                item !== moduleName
        );


    this.tabHistory.push(
        moduleName
    );


    /*
    ======================================================
    DEBUG
    ======================================================
    */

    console.log(
        "FINOVA WORKSPACE ACTIVE :",
        moduleName
    );

}
    initialize() {

    /*
    ======================================================
    COMPANY CONTEXT ACCESS
    ======================================================

    TENANT USER
    -----------
    Router berjalan normal.

    SUPER ADMIN + COMPANY SELECTED
    ------------------------------
    Router berjalan normal.

    SUPER ADMIN + NO COMPANY
    ------------------------
    Dashboard / Accounting Workspace tidak dimuat.
    ======================================================
    */

    const isSuperAdmin =
        window.finovaIsSuperAdmin === true;


    const hasCompanyContext =
        window.finovaHasCompanyContext === true;


    const hasAccountingAccess =
        !isSuperAdmin
        ||
        hasCompanyContext;


    /*
    ======================================================
    LOCK ACCOUNTING WORKSPACE
    ======================================================
    */

    if (
        !hasAccountingAccess
    ) {

        console.warn(
            "FINOVA ROUTER LOCKED: COMPANY CONTEXT NOT SELECTED."
        );


        this.showCompanyContextRequired();


        return;

    }


    /*
    ======================================================
    CREATE HOME TAB
    ======================================================
    */

    this.createHomeTab();


    /*
    ======================================================
    LOAD DASHBOARD
    ======================================================
    */

    this.navigate(
        "dashboard"
    );

}
/*
==========================================================
SHOW COMPANY CONTEXT REQUIRED
==========================================================
*/

showCompanyContextRequired() {

    /*
    ======================================================
    WORKSPACE
    ======================================================
    */

    const workspace =
        document.getElementById(
            "finova-content"
        );


    /*
    ======================================================
    TAB CONTAINER
    ======================================================
    */

    const tabContainer =
        document.getElementById(
            "finova-workspace-tabs"
        );


    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (
        !workspace
    ) {

        console.warn(
            "FINOVA ROUTER: #finova-content not found."
        );

        return;

    }


    /*
    ======================================================
    CLEAR WORKSPACE TABS
    ======================================================
    */

    if (
        tabContainer
    ) {

        tabContainer.innerHTML =
            "";

    }


    /*
    ======================================================
    RESET ROUTER STATE
    ======================================================
    */

    this.currentModule =
        null;


    this.openTabs.clear();


    this.tabHistory =
        [];


    /*
    ======================================================
    COMPANY CONTEXT REQUIRED VIEW
    ======================================================
    */

    workspace.innerHTML = `

        <div
            class="
                d-flex
                align-items-center
                justify-content-center
                w-100
                h-100
                p-4
            "
        >

            <div
                class="
                    text-center
                    bg-white
                    border
                    rounded-3
                    shadow-sm
                    p-5
                "
                style="
                    width:100%;
                    max-width:560px;
                "
            >

                <div
                    class="
                        d-flex
                        align-items-center
                        justify-content-center
                        mx-auto
                        mb-4
                    "
                    style="
                        width:64px;
                        height:64px;
                        border-radius:50%;
                        background:rgba(37, 99, 235, 0.08);
                        color:#2563EB;
                        font-size:24px;
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-building
                        ">
                    </i>

                </div>


                <h4
                    class="
                        mb-2
                        fw-semibold
                    "
                >

                    Select Company to Continue

                </h4>


                <p
                    class="
                        text-secondary
                        mb-4
                    "
                >

                    Select a Company Context from the topbar
                    before accessing FINOVA accounting modules.

                </p>


                <button
                    type="button"
                    id="finova-select-company-context-button"
                    class="
                        btn
                        btn-primary
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-building
                            me-2
                        ">
                    </i>

                    Select Company

                </button>

            </div>

        </div>

    `;


    /*
    ======================================================
    SELECT COMPANY BUTTON
    ======================================================
    */

    const selectCompanyButton =
        document.getElementById(
            "finova-select-company-context-button"
        );


    selectCompanyButton?.addEventListener(
        "click",
        () => {

            const selector =
                document.getElementById(
                    "finova-company-context-selector"
                );


            if (
                !selector
            ) {

                console.warn(
                    "FINOVA COMPANY CONTEXT SELECTOR NOT FOUND."
                );

                return;

            }


            /*
            ==================================================
            OPEN TOPBAR COMPANY SELECTOR
            ==================================================
            */

            selector.focus();


            selector.click();

        }
    );


    /*
    ======================================================
    TOPBAR
    ======================================================
    */

    this.updateTopbar(
        "Company Context"
    );


    /*
    ======================================================
    DEBUG
    ======================================================
    */

    console.log(
        "FINOVA COMPANY CONTEXT REQUIRED VIEW CREATED"
    );

}

/*
==========================================================
SHOW COMPANY CONTEXT REQUIRED
==========================================================
*/

showCompanyContextRequired() {

    /*
    ======================================================
    WORKSPACE
    ======================================================
    */

    const workspace =
        document.getElementById(
            "finova-content"
        );


    /*
    ======================================================
    TAB CONTAINER
    ======================================================
    */

    const tabContainer =
        document.getElementById(
            "finova-workspace-tabs"
        );


    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (
        !workspace
    ) {

        console.warn(
            "FINOVA ROUTER: #finova-content not found."
        );

        return;

    }


    /*
    ======================================================
    CLEAR WORKSPACE TABS
    ======================================================
    */

    if (
        tabContainer
    ) {

        tabContainer.innerHTML =
            "";

    }


    /*
    ======================================================
    RESET ROUTER STATE
    ======================================================
    */

    this.currentModule =
        null;


    this.openTabs.clear();


    this.tabHistory =
        [];


    /*
    ======================================================
    COMPANY CONTEXT REQUIRED VIEW
    ======================================================
    */

    workspace.innerHTML = `

        <div
            class="
                d-flex
                align-items-center
                justify-content-center
                w-100
                h-100
                p-4
            "
        >

            <div
                class="
                    text-center
                    bg-white
                    border
                    rounded-3
                    shadow-sm
                    p-5
                "
                style="
                    width:100%;
                    max-width:560px;
                "
            >

                <div
                    class="
                        d-flex
                        align-items-center
                        justify-content-center
                        mx-auto
                        mb-4
                    "
                    style="
                        width:64px;
                        height:64px;
                        border-radius:50%;
                        background:rgba(37, 99, 235, 0.08);
                        color:#2563EB;
                        font-size:24px;
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-building
                        ">
                    </i>

                </div>


                <h4
                    class="
                        mb-2
                        fw-semibold
                    "
                >

                    Select Company to Continue

                </h4>


                <p
                    class="
                        text-secondary
                        mb-4
                    "
                >

                    Select a Company Context from the topbar
                    before accessing FINOVA accounting modules.

                </p>


                <button
                    type="button"
                    id="finova-select-company-context-button"
                    class="
                        btn
                        btn-primary
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-building
                            me-2
                        ">
                    </i>

                    Select Company

                </button>

            </div>

        </div>

    `;


    /*
    ======================================================
    SELECT COMPANY BUTTON
    ======================================================
    */

    const selectCompanyButton =
        document.getElementById(
            "finova-select-company-context-button"
        );


    selectCompanyButton?.addEventListener(

        "click",

        () => {

            const selector =
                document.getElementById(
                    "finova-company-context-selector"
                );


            if (
                !selector
            ) {

                console.warn(
                    "FINOVA COMPANY CONTEXT SELECTOR NOT FOUND."
                );

                return;

            }


            selector.focus();


            selector.click();

        }

    );


    /*
    ======================================================
    TOPBAR
    ======================================================
    */

    this.updateTopbar(
        "Company Context"
    );


    /*
    ======================================================
    DEBUG
    ======================================================
    */

    console.log(
        "FINOVA COMPANY CONTEXT REQUIRED VIEW CREATED"
    );

}

  /*
==========================================================
NAVIGATE
TRUE MULTI TAB
==========================================================
*/

async navigate(
    moduleName
) {

    /*
    ======================================================
    GET ROUTE
    ======================================================
    */

    const route =
        this.routes[
            moduleName
        ];


    /*
    ======================================================
    VALIDATE ROUTE
    ======================================================
    */

    if (
        !route
    ) {

        this.show404();

        return;

    }


    /*
    ======================================================
    COMPANY CONTEXT ACCESS
    ======================================================

    TENANT USER
    -----------
    Accounting navigation berjalan normal.

    SUPER ADMIN + COMPANY SELECTED
    ------------------------------
    Accounting navigation berjalan normal.

    SUPER ADMIN + NO COMPANY
    ------------------------
    Semua accounting route diblokir.
    ======================================================
    */

    const isSuperAdmin =
        window.finovaIsSuperAdmin === true;


    const hasCompanyContext =
        window.finovaHasCompanyContext === true;


    const hasAccountingAccess =
        !isSuperAdmin
        ||
        hasCompanyContext;


    /*
    ======================================================
    BLOCK ACCOUNTING NAVIGATION
    ======================================================
    */

    if (
        !hasAccountingAccess
    ) {

        console.warn(
            "FINOVA ROUTER NAVIGATION DENIED: COMPANY CONTEXT NOT SELECTED.",
            moduleName
        );


        this.showCompanyContextRequired();


        return;

    }


    /*
    ======================================================
    LOAD WORKSPACE
    ======================================================
    */

    try {

        /*
        ==================================================
        CHECK IF MODULE ALREADY OPEN
        ==================================================
        */

        const existingWorkspace =
            this.openTabs.get(
                moduleName
            );


        /*
        ==================================================
        EXISTING MODULE
        ==================================================
        */

        if (
            existingWorkspace
        ) {

            /*
            ==============================================
            ACTIVATE EXISTING WORKSPACE
            ==============================================
            */

            this.activateWorkspace(
                moduleName
            );


            /*
            ==============================================
            UPDATE TOPBAR
            ==============================================
            */

            this.updateTopbar(
                route.title
            );


            /*
            ==============================================
            UPDATE SIDEBAR
            ==============================================
            */

            this.setActiveMenu(
                moduleName
            );


            console.log(
                "FINOVA WORKSPACE REUSED :",
                moduleName
            );


            return;

        }


        /*
        ==================================================
        CREATE TAB
        ==================================================
        */

        if (
            moduleName !==
            "dashboard"
        ) {

            this.createWorkspaceTab(
                moduleName,
                route
            );

        }


        /*
        ==========================================================
        CREATE PANEL
        ==========================================================
        */

        const panel =
            this.createWorkspacePanel(
                moduleName
            );


        /*
        ==========================================================
        REGISTER WORKSPACE FIRST
        ==========================================================
        */

        this.openTabs.set(
            moduleName,
            {

                route:
                    route,

                panel:
                    panel,

                instance:
                    null

            }
        );


        /*
        ==========================================================
        LOAD HTML
        ==========================================================
        */

        await this.loadHTML(
            route,
            panel
        );


        /*
        ==========================================================
        LOAD MODULE CSS
        ==========================================================

        Modules without route.css remain compatible.
        loadCSS() will simply return when no CSS is declared.
        ==========================================================
        */

        await this.loadCSS(
            route
        );


        /*
        ==========================================================
        ACTIVATE WORKSPACE
        ==========================================================
        */

        this.activateWorkspace(
            moduleName
        );


        /*
        ==========================================================
        LOAD MODULE
        ==========================================================
        */

        const instance =
            await this.loadModule(
                route
            );


        /*
        ==========================================================
        STORE MODULE INSTANCE
        ==========================================================
        */

        const workspace =
            this.openTabs.get(
                moduleName
            );


        if (
            workspace
        ) {

            workspace.instance =
                instance;

        }


        /*
        ==================================================
        UPDATE TOPBAR
        ==================================================
        */

        this.updateTopbar(
            route.title
        );


        /*
        ==================================================
        UPDATE SIDEBAR
        ==================================================
        */

        this.setActiveMenu(
            moduleName
        );


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "FINOVA WORKSPACE OPENED :",
            moduleName
        );

    }

    catch (
        error
    ) {

        console.error(
            "FINOVA ROUTER ERROR :",
            error
        );


        /*
        ==================================================
        CLEAN FAILED WORKSPACE
        ==================================================
        */

        const failedPanel =
            document.getElementById(
                `finova-panel-${moduleName}`
            );


        if (
            failedPanel
        ) {

            failedPanel.remove();

        }


        if (
            moduleName !==
            "dashboard"
        ) {

            const failedTab =
                document.getElementById(
                    `finova-tab-${moduleName}`
                );


            if (
                failedTab
            ) {

                failedTab.remove();

            }

        }


        this.openTabs.delete(
            moduleName
        );


        /*
        ==================================================
        ERROR DISPLAY
        ==================================================
        */

        this.showError();

    }

}
/*
==========================================================
LOAD HTML
==========================================================
*/

async loadHTML(
    route,
    panel
) {

    /*
    ======================================================
    VALIDATE PANEL
    ======================================================
    */

    if (
        !panel
    ) {

        throw new Error(
            "FINOVA ROUTER: Workspace panel not provided."
        );

    }


    /*
    ======================================================
    CREATE URL
    ======================================================
    */

    const url =
    new URL(
        route.html,
        document.baseURI
    );


    /*
    ======================================================
    CACHE BUSTER
    ======================================================
    */

    url.searchParams.set(
        "v",
        Date.now().toString()
    );


    /*
    ======================================================
    FETCH HTML
    ======================================================
    */

    const response =
        await fetch(
            url.href,
            {
                cache:
                    "no-store"
            }
        );


    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (
        !response.ok
    ) {

        throw new Error(
            `Failed to load HTML: ${route.html}`
        );

    }


    /*
    ======================================================
    GET HTML
    ======================================================
    */

    const html =
        await response.text();


    /*
    ======================================================
    RENDER INTO WORKSPACE PANEL
    ======================================================
    */

    panel.innerHTML =
        html;

}

async loadModule(route) {

    try {

        console.log(
            "=========================================="
        );

        console.log(
            "FINOVA MODULE LOAD"
        );

        console.log(
            "JS :",
            route.js
        );

        console.log(
            "CLASS :",
            route.className
        );


        /*
        ==============================================
        MODULE URL
        ==============================================
        */

        const url =
    new URL(
        route.js,
        document.baseURI
    );
    


        /*
        ==============================================
        CACHE BUSTER

        Prevent old JS module from browser / Vercel cache
        ==============================================
        */

        url.searchParams.set(
            "v",
            Date.now().toString()
        );


        console.log(
            "MODULE URL :",
            url.href
        );


        /*
        ==============================================
        IMPORT MODULE
        ==============================================
        */

        const module =
            await import(
                url.href
            );


        console.log(
            "MODULE IMPORTED :",
            module
        );


        /*
        ==============================================
        GET CLASS
        ==============================================
        */

        const PageClass =
            module[
                route.className
            ];


        if (!PageClass) {

            throw new Error(
                `Class "${route.className}" not found in ${route.js}`
            );

        }


        /*
==============================================
CREATE INSTANCE
==============================================
*/

const page =
    new PageClass();


console.log(
    "MODULE INSTANCE :",
    page
);


/*
==============================================
MODULE INITIALIZED
==============================================

IMPORTANT:

Initialization dilakukan oleh
constructor masing-masing module.

Router TIDAK memanggil init() kembali
untuk mencegah:

- duplicate event listener
- duplicate data loading
- duplicate rendering
- duplicate download

==============================================
*/

console.log(
    "MODULE INITIALIZED :",
    route.className
);


        console.log(
            "=========================================="
        );

        return page;

    }

    catch (error) {

        console.group(
            "MODULE LOAD ERROR"
        );


        console.error(
            "Module :",
            route.js
        );


        console.error(
            "Class :",
            route.className
        );


        console.error(
            "Error :",
            error
        );


        console.groupEnd();


        throw error;

    }

}
    updateTopbar(title) {

        if (window.finovaTopbar) {

            window.finovaTopbar.updateTitle(title);

        }

    }

    /*
==========================================================
SET ACTIVE MENU
==========================================================
*/

setActiveMenu(moduleName) {

    /*
    ======================================================
    USE SIDEBAR COMPONENT
    AS SINGLE SOURCE OF TRUTH
    ======================================================
    */

    if (
        window.finovaSidebar
        &&
        typeof window.finovaSidebar.setActiveMenu
            === "function"
    ) {

        window.finovaSidebar.setActiveMenu(
            moduleName
        );

        return;

    }


    /*
    ======================================================
    FALLBACK
    REMOVE ALL ACTIVE MENU
    ======================================================
    */

    document
        .querySelectorAll(
            ".finova-menu-item, .finova-submenu-item"
        )
        .forEach(
            menu => {

                menu.classList.remove(
                    "active"
                );

            }
        );


    /*
    ======================================================
    FIND CURRENT MENU
    ======================================================
    */

    const active =
        document.querySelector(
            `[data-module="${moduleName}"]`
        );


    if (!active) {

        return;

    }


    /*
    ======================================================
    SET ACTIVE
    ======================================================
    */

    active.classList.add(
        "active"
    );


    /*
    ======================================================
    OPEN PARENT GROUP
    ======================================================
    */

    const parentGroup =
        active.closest(
            ".finova-menu-group"
        );


    if (parentGroup) {

        parentGroup.classList.add(
            "open"
        );


        const submenu =
            parentGroup.querySelector(
                ".finova-submenu"
            );


        if (submenu) {

            submenu.classList.add(
                "open"
            );

        }

    }

}

    show404() {

        document.getElementById("finova-content").innerHTML = `

            <div class="alert alert-danger">

                Module not found.

            </div>

        `;

    }

    showError() {

        document.getElementById("finova-content").innerHTML = `

            <div class="alert alert-warning">

                Error loading module.

            </div>

        `;

    }

}