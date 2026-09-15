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


    /*
    ==========================================================
    RENDER
    ==========================================================
    */

    render() {

        const topbar =
            document.getElementById(
                "finova-topbar"
            );


        if (!topbar) {

            return;

        }


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


                    <!-- FULLSCREEN -->

                    <button
                        type="button"
                        class="finova-icon-button"
                        id="finova-fullscreen"
                        title="Fullscreen"
                    >

                        <i class="fa-solid fa-expand"></i>

                    </button>


                    <!-- ==========================================
     COMPANY IDENTITY
=========================================== -->

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


<!-- ==========================================
     USER PROFILE
=========================================== -->

<div class="finova-user-profile">


                        <!-- AVATAR -->

                        <div
                            id="topbar-avatar"
                            class="finova-user-avatar"
                        >

                            FA

                        </div>


                        <!-- USER INFORMATION -->

                        <div class="finova-user-info">


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


                if (!sidebarHost) {

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


                if (isOpen) {

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


            if (
                nameElement
            ) {

                nameElement.textContent =
                    displayName;

            }


            if (
                roleElement
            ) {

                roleElement.textContent =
                    "Super Admin";

            }


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