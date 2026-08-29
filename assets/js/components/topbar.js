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


export class FinovaTopbar {


    /*
    ==========================================================
    CONSTRUCTOR
    ==========================================================
    */

    constructor() {

        this.render();

        this.bindEvents();

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


                    <!-- USER PROFILE -->

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
    LOAD PROFILE
    ==========================================================
    */

    async loadProfile() {

        try {

            const profile =
                await UserService
                    .getCurrentProfile();


            if (!profile) {

                return;

            }


            /*
            ==================================================
            NAME
            ==================================================
            */

            const nameElement =
                document.getElementById(
                    "topbar-user-name"
                );


            if (nameElement) {

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

            const roleElement =
                document.getElementById(
                    "topbar-user-position"
                );


            if (roleElement) {

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

            const avatar =
                document.getElementById(
                    "topbar-avatar"
                );


            if (avatar) {

                avatar.textContent =
                    this.getInitial(
                        profile.full_name
                    );

            }

        }
        catch (error) {

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