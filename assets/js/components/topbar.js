/*
===========================================
FINOVA ACCOUNTING SYSTEM
Topbar Component
Version : 1.1.0
===========================================
*/

import {
    UserService
} from "../../../service/user.service.js";


import {
    CustomerConfig
} from "../core/customer-config.js";

import {
    supabase
} from "../core/supabase.js";

import {
    CompanyContextService
} from "../../../service/company-context.service.js";


export class FinovaTopbar {


    /*
    ==========================================================
    CONSTRUCTOR
    ==========================================================
    */

    constructor() {

        this.render();

        this.bindEvents();
        this.loadCompanyIdentity();

        this.loadProfile();

    }


    render() {

    /*
    ======================================================
    TOPBAR HOST
    ======================================================
    */

    const topbar =
        document.getElementById(
            "finova-topbar"
        );


    if (
        !topbar
    ) {

        return;

    }


    /*
    ======================================================
    RENDER
    ======================================================
    */

    topbar.innerHTML = `

        <div class="finova-topbar">


            <!-- ==========================================
                 LEFT
            =========================================== -->

            <div class="finova-topbar-left">


                <!-- MOBILE SIDEBAR BUTTON -->

                <button
                    id="btn-mobile-sidebar"
                    class="finova-icon-button finova-sidebar-toggle-button"
                    type="button"
                    aria-label="Open Navigation Menu"
                    title="Menu"
                >

                    <i class="fa-solid fa-bars"></i>

                </button>


                <!-- PAGE TITLE -->

                <div class="finova-page-title">

                    Dashboard

                </div>


            </div>


            <!-- ==========================================
                 RIGHT
            =========================================== -->

            <div class="finova-topbar-right">


                <!-- ======================================
                     FULLSCREEN
                ======================================= -->

                <button
                    type="button"
                    class="finova-icon-button"
                    id="finova-fullscreen"
                    title="Fullscreen"
                >

                    <i class="fa-solid fa-expand"></i>

                </button>


                <!-- ======================================
                     SUPER ADMIN COMPANY CONTEXT
                ======================================= -->

                <div
                    id="finova-super-admin-company-context"
                    class="finova-super-admin-company-context"
                    style="display:none;"
                >


                    <!-- LABEL -->

                    <div
                        class="finova-company-context-label"
                    >

                        Company Context

                    </div>


                    <!-- ==================================
                         SELECTOR WRAPPER
                    =================================== -->

                    <div
                        class="finova-company-context-wrapper"
                    >


                        <!-- SELECTOR -->

                        <div
                            id="finova-company-context-selector"
                            class="finova-company-context-selector"
                            role="button"
                            tabindex="0"
                            aria-haspopup="true"
                            aria-expanded="false"
                        >

                            <i
                                class="fa-solid fa-building"
                            ></i>


                            <span
                                id="finova-company-context-name"
                            >

                                Select Company

                            </span>


                            <i
                                id="finova-company-context-chevron"
                                class="fa-solid fa-chevron-down"
                            ></i>

                        </div>


                        <!-- ==============================
                             DROPDOWN PANEL
                        =============================== -->

                        <div
                            id="finova-company-context-dropdown"
                            class="finova-company-context-dropdown"
                            style="display:none;"
                        >


                            <!-- DROPDOWN HEADER -->

                            <div
                                class="finova-company-context-dropdown-header"
                            >

                                <div
                                    class="finova-company-context-dropdown-title"
                                >

                                    Select Company

                                </div>


                                <div
                                    class="finova-company-context-dropdown-subtitle"
                                >

                                    Choose company context

                                </div>

                            </div>


                            <!-- SEARCH -->

                            <div
                                class="finova-company-context-search"
                            >

                                <i
                                    class="fa-solid fa-magnifying-glass"
                                ></i>


                                <input
                                    type="text"
                                    id="finova-company-context-search"
                                    placeholder="Search company..."
                                    autocomplete="off"
                                >

                            </div>


                            <!-- COMPANY LIST -->

                            <div
                                id="finova-company-context-list"
                                class="finova-company-context-list"
                            >

                                <div
                                    class="finova-company-context-empty"
                                >

                                    Company list not loaded.

                                </div>

                            </div>


                        </div>


                    </div>


                </div>


                <!-- ======================================
                     COMPANY IDENTITY
                ======================================= -->

                <div
                    class="finova-company-identity"
                    id="finova-company-identity"
                >


                    <div
                        class="finova-company-name"
                        id="topbar-company-name"
                    >

                        Loading Company...

                    </div>


                    <div
                        class="finova-company-code"
                        id="topbar-company-code"
                    >

                        -

                    </div>


                </div>


                <!-- ======================================
                     USER PROFILE
                ======================================= -->

                <div
                    class="finova-user-profile"
                >


                    <!-- AVATAR -->

                    <div
                        id="topbar-avatar"
                        class="finova-user-avatar"
                    >

                        FA

                    </div>


                    <!-- USER INFORMATION -->

                    <div
                        class="finova-user-info"
                    >


                        <div
                            id="topbar-user-name"
                            class="finova-user-name"
                        >

                            Loading...

                        </div>


                        <div
                            id="topbar-user-position"
                            class="finova-user-role"
                        >

                            Loading...

                        </div>


                    </div>


                </div>


            </div>


        </div>

    `;

}
    /*
==========================================================
BIND EVENTS
==========================================================
*/

bindEvents() {

    /*
    ======================================================
    FULLSCREEN
    ======================================================
    */

    const fullscreen =
        document.getElementById(
            "finova-fullscreen"
        );


    fullscreen?.addEventListener(
        "click",
        async () => {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await document
                        .documentElement
                        .requestFullscreen();

                }
                else {

                    await document
                        .exitFullscreen();

                }

            }
            catch (error) {

                console.error(
                    "Fullscreen error:",
                    error
                );

            }

        }
    );


    /*
    ======================================================
    COMPANY CONTEXT DOM
    ======================================================
    */

    const companyContextSelector =
        document.getElementById(
            "finova-company-context-selector"
        );


    const companyContextDropdown =
        document.getElementById(
            "finova-company-context-dropdown"
        );


    const companyContextChevron =
        document.getElementById(
            "finova-company-context-chevron"
        );


    const companyContextList =
        document.getElementById(
            "finova-company-context-list"
        );


    const companyContextSearch =
        document.getElementById(
            "finova-company-context-search"
        );


    /*
    ======================================================
    OPEN / CLOSE COMPANY CONTEXT
    ======================================================
    */

    const setCompanyContextDropdownState = (
        isOpen
    ) => {

        if (
            !companyContextSelector
            ||
            !companyContextDropdown
        ) {

            return;

        }


        companyContextDropdown.style.display =
            isOpen
                ? "block"
                : "none";


        companyContextSelector.setAttribute(
            "aria-expanded",
            isOpen
                ? "true"
                : "false"
        );


        if (
            companyContextChevron
        ) {

            companyContextChevron.style.transform =
                isOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)";

        }


        /*
        ==================================================
        RESET SEARCH WHEN CLOSED
        ==================================================
        */

        if (
            !isOpen
            &&
            companyContextSearch
        ) {

            companyContextSearch.value =
                "";


            const companyItems =
                companyContextList
                    ?.querySelectorAll(
                        ".finova-company-context-item"
                    );


            companyItems?.forEach(
                item => {

                    item.style.display =
                        "flex";

                }
            );

        }

    };


    /*
    ======================================================
    SELECTOR CLICK
    ======================================================
    */

    companyContextSelector?.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();


            const isOpen =
                companyContextSelector
                    .getAttribute(
                        "aria-expanded"
                    )
                ===
                "true";


            setCompanyContextDropdownState(
                !isOpen
            );

        }
    );


    /*
    ======================================================
    SELECTOR KEYBOARD
    ENTER / SPACE
    ======================================================
    */

    companyContextSelector?.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Enter"
                &&
                event.key !== " "
            ) {

                return;

            }


            event.preventDefault();
            event.stopPropagation();


            const isOpen =
                companyContextSelector
                    .getAttribute(
                        "aria-expanded"
                    )
                ===
                "true";


            setCompanyContextDropdownState(
                !isOpen
            );

        }
    );


    /*
    ======================================================
    DROPDOWN INTERNAL CLICK
    ======================================================
    */

    companyContextDropdown?.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

        }
    );


    /*
    ======================================================
    SEARCH COMPANY
    ======================================================
    */

    companyContextSearch?.addEventListener(
        "input",
        () => {

            const keyword =
                companyContextSearch
                    .value
                    .trim()
                    .toLowerCase();


            const companyItems =
                companyContextList
                    ?.querySelectorAll(
                        ".finova-company-context-item"
                    );


            companyItems?.forEach(
                item => {

                    const companyName =
                        item
                            .querySelector(
                                ".finova-company-context-item-name"
                            )
                            ?.textContent
                            ?.trim()
                            ?.toLowerCase()
                        ||
                        "";


                    const companyCode =
                        item
                            .querySelector(
                                ".finova-company-context-item-code"
                            )
                            ?.textContent
                            ?.trim()
                            ?.toLowerCase()
                        ||
                        "";


                    const isMatch =
                        companyName.includes(
                            keyword
                        )
                        ||
                        companyCode.includes(
                            keyword
                        );


                    item.style.display =
                        isMatch
                            ? "flex"
                            : "none";

                }
            );

        }
    );


    /*
    ======================================================
    COMPANY CONTEXT ACTION

    EVENT DELEGATION IS USED BECAUSE ITEMS ARE
    RENDERED ASYNCHRONOUSLY BY loadCompanyContext()
    ======================================================
    */

    companyContextList?.addEventListener(
        "click",
        async (event) => {

            const companyItem =
                event
                    .target
                    .closest(
                        ".finova-company-context-item"
                    );


            if (
                !companyItem
                ||
                !companyContextList.contains(
                    companyItem
                )
            ) {

                return;

            }


            event.preventDefault();
            event.stopPropagation();


            /*
            ==================================================
            ACTION TYPE
            ==================================================
            */

            const contextAction =
                companyItem.dataset.contextAction
                ||
                null;


            const companyId =
                companyItem.dataset.companyId
                ||
                null;


            /*
            ==================================================
            PREVENT DOUBLE CLICK
            ==================================================
            */

            const companyItems =
                companyContextList.querySelectorAll(
                    ".finova-company-context-item"
                );


            companyItems.forEach(
                item => {

                    item.disabled =
                        true;

                }
            );


            try {

                /*
                ==================================================
                CLEAR COMPANY CONTEXT
                ==================================================
                */

                if (
                    contextAction === "clear"
                ) {

                    console.log(
                        "FINOVA COMPANY CONTEXT CLEARING..."
                    );


                    await CompanyContextService
                        .clearCompany();


                    console.log(
                        "FINOVA COMPANY CONTEXT CLEARED"
                    );


                    /*
                    ==============================================
                    CLOSE DROPDOWN
                    ==============================================
                    */

                    setCompanyContextDropdownState(
                        false
                    );


                    /*
                    ==============================================
                    FULL APPLICATION RELOAD

                    Required because:
                    - CustomerConfig
                    - TenantContext
                    - Sidebar access
                    - Router access
                    - Dashboard/module data

                    must all restart under No Company Context.
                    ==============================================
                    */

                    window.location.reload();


                    return;

                }


                /*
                ==================================================
                NORMAL COMPANY SELECTION REQUIRES COMPANY ID
                ==================================================
                */

                if (
                    !companyId
                ) {

                    throw new Error(
                        "FINOVA COMPANY CONTEXT: COMPANY ID NOT FOUND"
                    );

                }


                /*
                ==================================================
                SELECT COMPANY
                ==================================================
                */

                console.log(
                    "FINOVA COMPANY CONTEXT SELECTING:",
                    companyId
                );


                const selectedCompanyId =
                    await CompanyContextService
                        .selectCompany(
                            companyId
                        );


                /*
                ==================================================
                VALIDATE RESULT
                ==================================================
                */

                if (
                    !selectedCompanyId
                    ||
                    selectedCompanyId !== companyId
                ) {

                    throw new Error(
                        "Selected company context does not match requested company."
                    );

                }


                /*
                ==================================================
                COMPANY CONTEXT SELECTED
                ==================================================
                */

                console.log(
                    "FINOVA COMPANY CONTEXT SELECTED:",
                    selectedCompanyId
                );


                /*
                ==================================================
                CLOSE DROPDOWN
                ==================================================
                */

                setCompanyContextDropdownState(
                    false
                );


                /*
                ==================================================
                FULL APPLICATION RELOAD

                Company Context changes the entire accounting
                application scope.

                Reload ensures:
                - TenantContext uses new company
                - CustomerConfig uses new company
                - Sidebar access is recalculated
                - Router is recalculated
                - Current module cannot retain old tenant data
                ==================================================
                */

                window.location.reload();


                return;

            }
            catch (
                error
            ) {

                console.error(
                    "FINOVA COMPANY CONTEXT ACTION ERROR:",
                    error
                );


                /*
                ==================================================
                RE-ENABLE COMPANY ITEMS
                ==================================================
                */

                companyItems.forEach(
                    item => {

                        item.disabled =
                            false;

                    }
                );

            }

        }
    );


    /*
    ======================================================
    CLICK OUTSIDE
    ======================================================
    */

    document.addEventListener(
        "click",
        () => {

            setCompanyContextDropdownState(
                false
            );

        }
    );


    /*
    ======================================================
    ESCAPE
    ======================================================
    */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Escape"
            ) {

                return;

            }


            setCompanyContextDropdownState(
                false
            );

        }
    );


    /*
    ======================================================
    SIDEBAR MOBILE

    Sidebar.js menangani:
    #btn-mobile-sidebar
    ======================================================
    */

    const sidebarButton =
        document.getElementById(
            "btn-mobile-sidebar"
        );


    /*
    ------------------------------------------------------
    FALLBACK

    Apabila Sidebar Component dibuat lebih dahulu daripada
    Topbar Component, event sidebar.js mungkin belum sempat
    menemukan tombol ini.

    Karena itu Topbar mempunyai fallback sendiri.
    ------------------------------------------------------
    */

    sidebarButton?.addEventListener(
        "click",
        (event) => {

            /*
            ==============================================
            DESKTOP
            ==============================================
            */

            if (
                window.innerWidth >
                991.98
            ) {

                return;

            }


            /*
            ==============================================
            CHECK IF SIDEBAR.JS ALREADY HANDLED EVENT
            ==============================================
            */

            const sidebarHost =
                document.getElementById(
                    "finova-sidebar"
                );


            if (
                !sidebarHost
            ) {

                return;

            }


            /*
            ==============================================
            TOGGLE
            ==============================================
            */

            const isOpen =
                sidebarHost
                    .classList
                    .contains(
                        "mobile-open"
                    );


            if (
                isOpen
            ) {

                this.closeMobileSidebar();

            }
            else {

                this.openMobileSidebar();

            }

        }
    );

}
    /*
    ==========================================================
    OPEN MOBILE SIDEBAR
    ==========================================================
    */

    openMobileSidebar() {

        const sidebarHost =
            document.getElementById(
                "finova-sidebar"
            );


        const backdrop =
            document.getElementById(
                "finova-sidebar-backdrop"
            );


        if (!sidebarHost) {

            return;

        }


        /*
        ======================================================
        SIDEBAR
        ======================================================
        */

        sidebarHost
            .classList
            .add(
                "mobile-open"
            );


        /*
        ======================================================
        BACKDROP
        ======================================================
        */

        backdrop
            ?.classList
            .add(
                "show"
            );


        /*
        ======================================================
        BODY
        ======================================================
        */

        document
            .body
            .classList
            .add(
                "finova-sidebar-open"
            );

    }


    /*
    ==========================================================
    CLOSE MOBILE SIDEBAR
    ==========================================================
    */

    closeMobileSidebar() {

        const sidebarHost =
            document.getElementById(
                "finova-sidebar"
            );


        const backdrop =
            document.getElementById(
                "finova-sidebar-backdrop"
            );


        /*
        ======================================================
        SIDEBAR
        ======================================================
        */

        sidebarHost
            ?.classList
            .remove(
                "mobile-open"
            );


        /*
        ======================================================
        BACKDROP
        ======================================================
        */

        backdrop
            ?.classList
            .remove(
                "show"
            );


        /*
        ======================================================
        BODY
        ======================================================
        */

        document
            .body
            .classList
            .remove(
                "finova-sidebar-open"
            );

    }


    /*
    ==========================================================
    UPDATE TITLE
    ==========================================================
    */

    updateTitle(title) {

        const pageTitle =
            document.querySelector(
                ".finova-page-title"
            );


        if (pageTitle) {

            pageTitle.textContent =
                title;

        }

    }

/*
==========================================================
LOAD COMPANY IDENTITY
==========================================================
*/

loadCompanyIdentity() {

    try {

        /*
        ==================================================
        DOM
        ==================================================
        */

        const nameElement =
            document.getElementById(
                "topbar-company-name"
            );

        const codeElement =
            document.getElementById(
                "topbar-company-code"
            );

        const identityElement =
            document.getElementById(
                "finova-company-identity"
            );


        /*
        ==================================================
        SUPER ADMIN MODE
        CUSTOMER CONFIG NOT REQUIRED
        ==================================================
        */

        if (
            !CustomerConfig.isInitialized()
        ) {

            if (nameElement) {

                nameElement.textContent =
                    "FINOVA";

            }


            if (codeElement) {

                codeElement.textContent =
                    "SUPER ADMIN";

            }


            if (identityElement) {

                identityElement.title =
                    "FINOVA Super Admin";

            }


            console.log(
                "FINOVA TOPBAR MODE: SUPER ADMIN"
            );


            return;

        }


        /*
        ==================================================
        COMPANY DATA
        ==================================================
        */

        const companyName =
            CustomerConfig.getCompanyName();

        const companyCode =
            CustomerConfig.getCompanyCode();


        /*
        ==================================================
        COMPANY NAME
        ==================================================
        */

        if (nameElement) {

            nameElement.textContent =
                companyName
                ||
                "FINOVA";

        }


        /*
        ==================================================
        COMPANY CODE
        ==================================================
        */

        if (codeElement) {

            codeElement.textContent =
                companyCode
                ||
                "-";

        }


        /*
        ==================================================
        TOOLTIP
        ==================================================
        */

        if (identityElement) {

            identityElement.title =
                companyCode
                    ? `${companyName} (${companyCode})`
                    : companyName;

        }


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "FINOVA TOPBAR COMPANY:",
            companyCode,
            companyName
        );

    }
    catch (error) {

        console.error(
            "Topbar loadCompanyIdentity:",
            error
        );

    }

}

    /*
==========================================================
LOAD PROFILE
==========================================================
*/

async loadProfile() {

    try {

        /*
        ==================================================
        DOM
        ==================================================
        */

        const nameElement =
            document.getElementById(
                "topbar-user-name"
            );

        const roleElement =
            document.getElementById(
                "topbar-user-position"
            );

        const avatar =
            document.getElementById(
                "topbar-avatar"
            );


        /*
        ==================================================
        CHECK FINOVA SUPER ADMIN
        ==================================================
        */

        const {
            data: isSuperAdmin,
            error: superAdminError
        } = await supabase.rpc(
            "is_finova_super_admin"
        );


        if (
            superAdminError
        ) {

            throw superAdminError;

        }


        /*
        ==================================================
        SUPER ADMIN PROFILE
        ==================================================
        */

        if (
            isSuperAdmin === true
        ) {

            /*
            ==================================================
            SHOW COMPANY CONTEXT
            ==================================================
            */

            const companyContext =
                document.getElementById(
                    "finova-super-admin-company-context"
                );


            if (
                companyContext
            ) {

                companyContext.style.display =
                    "flex";

            }


            /*
            ==================================================
            LOAD COMPANY CONTEXT
            ==================================================
            */

            await this.loadCompanyContext();


            /*
            ==================================================
            GET SUPER ADMIN USER
            ==================================================
            */

            const {
                data: {
                    user
                },
                error: userError
            } = await supabase.auth.getUser();


            if (
                userError
            ) {

                throw userError;

            }


            const displayName =
                user?.user_metadata?.full_name
                ||
                user?.user_metadata?.name
                ||
                user?.email
                ||
                "FINOVA Super Admin";


            /*
            ==================================================
            NAME
            ==================================================
            */

            if (
                nameElement
            ) {

                nameElement.textContent =
                    displayName;

            }


            /*
            ==================================================
            ROLE
            ==================================================
            */

            if (
                roleElement
            ) {

                roleElement.textContent =
                    "Super Admin";

            }


            /*
            ==================================================
            AVATAR
            ==================================================
            */

            if (
                avatar
            ) {

                avatar.textContent =
                    this.getInitial(
                        displayName
                    );

            }


            console.log(
                "FINOVA TOPBAR USER: SUPER ADMIN"
            );


            return;

        }


        /*
        ==================================================
        TENANT USER PROFILE
        ==================================================
        */

        const profile =
            await UserService
                .getCurrentProfile();


        if (
            !profile
        ) {

            return;

        }


        /*
        ==================================================
        NAME
        ==================================================
        */

        if (
            nameElement
        ) {

            nameElement.textContent =
                profile.full_name
                ||
                "Unknown User";

        }


        /*
        ==================================================
        ROLE

        Manager / Staff
        ==================================================
        */

        if (
            roleElement
        ) {

            roleElement.textContent =
                profile.role
                ||
                profile.position
                ||
                "-";

        }


        /*
        ==================================================
        AVATAR
        ==================================================
        */

        if (
            avatar
        ) {

            avatar.textContent =
                this.getInitial(
                    profile.full_name
                );

        }

    }
    catch (
        error
    ) {

        console.error(
            "Topbar loadProfile:",
            error
        );

    }

}
/*
==========================================================
LOAD COMPANY CONTEXT
==========================================================
*/

async loadCompanyContext() {

    /*
    ======================================================
    DOM
    ======================================================
    */

    const companyNameElement =
        document.getElementById(
            "finova-company-context-name"
        );


    const companyListElement =
        document.getElementById(
            "finova-company-context-list"
        );


    if (
        !companyNameElement
        ||
        !companyListElement
    ) {

        return;

    }


    /*
    ======================================================
    LOADING
    ======================================================
    */

    companyListElement.innerHTML = `

        <div
            class="finova-company-context-empty"
        >

            Loading companies...

        </div>

    `;


    try {

        /*
        ==================================================
        AVAILABLE ACTIVE COMPANIES
        ==================================================
        */

        const companies =
            await CompanyContextService
                .getAvailableCompanies();


        /*
        ==================================================
        CURRENT SELECTED COMPANY
        ==================================================
        */

        const selectedCompany =
            await CompanyContextService
                .getSelectedCompany();


        /*
        ==================================================
        SELECTOR LABEL
        ==================================================
        */

        if (
            selectedCompany
        ) {

            companyNameElement.textContent =
                selectedCompany.company_name
                ||
                selectedCompany.company_code
                ||
                "Selected Company";

        }
        else {

            companyNameElement.textContent =
                "No Company";

        }


        /*
        ==================================================
        NO COMPANY CONTEXT ITEM
        ==================================================

        This item intentionally has no company UUID.

        data-context-action="clear"
        will be handled separately from normal company
        selection.
        ==================================================
        */

        const noCompanyItem = `

            <button
                type="button"
                class="
                    finova-company-context-item
                    finova-company-context-clear
                    ${!selectedCompany
                        ? "active"
                        : ""}
                "
                data-context-action="clear"
            >

                <div
                    class="finova-company-context-item-icon"
                >

                    <i
                        class="fa-solid fa-ban"
                    ></i>

                </div>


                <div
                    class="finova-company-context-item-info"
                >

                    <div
                        class="finova-company-context-item-name"
                    >

                        No Company

                    </div>


                    <div
                        class="finova-company-context-item-code"
                    >

                        No company context

                    </div>

                </div>


                ${
                    !selectedCompany
                        ? `

                            <i
                                class="
                                    fa-solid
                                    fa-check
                                    finova-company-context-item-check
                                "
                            ></i>

                        `
                        : ""
                }

            </button>

        `;


        /*
        ==================================================
        EMPTY COMPANY LIST
        ==================================================

        Even when no active companies exist, Super Admin
        must still be able to remain in No Company mode.
        ==================================================
        */

        if (
            !Array.isArray(
                companies
            )
            ||
            companies.length === 0
        ) {

            companyListElement.innerHTML = `

                ${noCompanyItem}

                <div
                    class="finova-company-context-empty"
                >

                    No active company found.

                </div>

            `;


            console.log(
                "FINOVA COMPANY CONTEXT COMPANIES:",
                0
            );


            console.log(
                "FINOVA COMPANY CONTEXT SELECTED:",
                selectedCompany?.id
                ||
                null
            );


            return;

        }


        /*
        ==================================================
        RENDER COMPANY LIST
        ==================================================
        */

        const companyItems =
            companies
                .map(
                    company => {

                        const companyId =
                            company.id
                            ||
                            "";


                        const companyCode =
                            company.company_code
                            ||
                            "-";


                        const companyName =
                            company.company_name
                            ||
                            company.legal_name
                            ||
                            "Unnamed Company";


                        const isSelected =
                            selectedCompany?.id
                            ===
                            companyId;


                        return `

                            <button
                                type="button"
                                class="
                                    finova-company-context-item
                                    ${isSelected
                                        ? "active"
                                        : ""}
                                "
                                data-company-id="${this.escapeHtml(
                                    companyId
                                )}"
                            >

                                <div
                                    class="finova-company-context-item-icon"
                                >

                                    <i
                                        class="fa-solid fa-building"
                                    ></i>

                                </div>


                                <div
                                    class="finova-company-context-item-info"
                                >

                                    <div
                                        class="finova-company-context-item-name"
                                    >

                                        ${this.escapeHtml(
                                            companyName
                                        )}

                                    </div>


                                    <div
                                        class="finova-company-context-item-code"
                                    >

                                        ${this.escapeHtml(
                                            companyCode
                                        )}

                                    </div>

                                </div>


                                ${
                                    isSelected
                                        ? `

                                            <i
                                                class="
                                                    fa-solid
                                                    fa-check
                                                    finova-company-context-item-check
                                                "
                                            ></i>

                                        `
                                        : ""
                                }

                            </button>

                        `;

                    }
                )
                .join("");


        /*
        ==================================================
        FINAL LIST

        NO COMPANY always appears first.
        ==================================================
        */

        companyListElement.innerHTML = `

            ${noCompanyItem}

            ${companyItems}

        `;


        /*
        ==================================================
        DEBUG
        ==================================================
        */

        console.log(
            "FINOVA COMPANY CONTEXT COMPANIES:",
            companies.length
        );


        console.log(
            "FINOVA COMPANY CONTEXT SELECTED:",
            selectedCompany?.id
            ||
            null
        );

    }
    catch (
        error
    ) {

        /*
        ==================================================
        ERROR
        ==================================================
        */

        console.error(
            "Topbar loadCompanyContext:",
            error
        );


        companyNameElement.textContent =
            "No Company";


        companyListElement.innerHTML = `

            <div
                class="finova-company-context-empty"
            >

                Failed to load companies.

            </div>

        `;

    }

}
/*
==========================================================
ESCAPE HTML
==========================================================
*/

escapeHtml(value) {

    return String(
        value ?? ""
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
    GET INITIAL
    ==========================================================
    */

    getInitial(name) {

        if (!name) {

            return "U";

        }


        return name

            .split(" ")

            .filter(
                word => word.length > 0
            )

            .map(
                word => word[0]
            )

            .join("")

            .substring(
                0,
                2
            )

            .toUpperCase();

    }


}