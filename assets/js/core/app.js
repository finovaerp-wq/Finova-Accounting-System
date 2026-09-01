/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Application
Version : 2.1 Enterprise

FINAL :
- AUTHENTICATION VIA AUTHSERVICE
- GLOBAL LAYOUT
- GLOBAL COMPONENTS
- ROUTER
- AUTH STATE LISTENER
- AUTO LOGOUT HANDLED BY AUTHSERVICE
==========================================================
*/

import {
    FinovaSidebar
} from "../components/sidebar.js";

import {
    FinovaTopbar
} from "../components/topbar.js";

import {
    FinovaRouter
} from "./router.js";

import {
    AuthService
} from "../../../service/auth.service.js";


/*
==========================================================
APPLICATION
==========================================================
*/

class FinovaApp {

    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor() {

        /*
        ==========================================
        STATE
        ==========================================
        */

        this.sidebar =
            null;

        this.topbar =
            null;

        this.router =
            null;

        this.authSubscription =
            null;


        /*
        ==========================================
        INITIALIZE
        ==========================================
        */

        this.initialize();

    }


    /*
    ======================================================
    INITIALIZE
    ======================================================
    */

    async initialize() {

        try {

            /*
            ==========================================
            AUTHENTICATION
            ==========================================
            */

            const authenticated =
                await this.checkAuthentication();


            if (
                !authenticated
            ) {

                return;

            }


            /*
            ==========================================
            LAYOUT
            ==========================================
            */

            this.renderLayout();


            /*
            ==========================================
            COMPONENTS
            ==========================================
            */

            this.initializeComponents();


            /*
            ==========================================
            ROUTER
            ==========================================
            */

            this.initializeRouter();


            /*
            ==========================================
            APPLICATION
            ==========================================
            */

            this.initializeApplication();


            /*
            ==========================================
            READY
            ==========================================
            */

            console.log(
                "FINOVA Accounting System Ready."
            );

        }

        catch (
            error
        ) {

            this.handleError(
                error
            );

        }

    }


    /*
    ======================================================
    CHECK AUTHENTICATION
    ======================================================
    */

    async checkAuthentication() {

        try {

            /*
            ==========================================
            CHECK SESSION
            ==========================================
            */

            const authenticated =
                await AuthService.initialize();


            /*
            ==========================================
            AUTHENTICATED
            ==========================================
            */

            if (
                authenticated
            ) {

                return true;

            }


            /*
            ==========================================
            NOT AUTHENTICATED
            ==========================================
            */

            window.location.replace(
                "login.html"
            );


            return false;

        }

        catch (
            error
        ) {

            console.error(
                "FINOVA Authentication Error :",
                error
            );


            /*
            ==========================================
            FORCE LOGIN PAGE
            ==========================================
            */

            window.location.replace(
                "login.html"
            );


            return false;

        }

    }


    /*
    ======================================================
    RENDER LAYOUT
    ======================================================
    */

    renderLayout() {

        /*
        ==========================================
        APPLICATION CONTAINER
        ==========================================
        */

        const app =
            document.getElementById(
                "finova-app"
            );


        /*
        ==========================================
        VALIDATION
        ==========================================
        */

        if (
            !app
        ) {

            throw new Error(
                "Container #finova-app not found."
            );

        }


        /*
        ==========================================
        LAYOUT
        ==========================================
        */

        app.innerHTML = `

            <div class="finova-layout">

                <aside
                    id="finova-sidebar">
                </aside>

                <div class="finova-main">

                    <header
                        id="finova-topbar">
                    </header>

                    <main
                        id="finova-content">
                    </main>

                </div>

            </div>

        `;

    }


    /*
    ======================================================
    INITIALIZE COMPONENTS
    ======================================================
    */

    initializeComponents() {

        /*
        ==========================================
        SIDEBAR
        ==========================================
        */

        this.sidebar =
            new FinovaSidebar();


        /*
        ==========================================
        TOPBAR
        ==========================================
        */

        this.topbar =
            new FinovaTopbar();


        /*
        ==========================================
        GLOBAL ACCESS
        ==========================================
        */

        window.finovaSidebar =
            this.sidebar;

        window.finovaTopbar =
            this.topbar;

    }


    /*
    ======================================================
    INITIALIZE ROUTER
    ======================================================
    */

    initializeRouter() {

        /*
        ==========================================
        ROUTER
        ==========================================
        */

        this.router =
            new FinovaRouter();


        /*
        ==========================================
        GLOBAL ACCESS
        ==========================================
        */

        window.finovaRouter =
            this.router;

    }


    /*
    ======================================================
    INITIALIZE APPLICATION
    ======================================================
    */

    initializeApplication() {

        /*
        ==========================================
        AUTH LISTENER
        ==========================================
        */

        const authListener =
            AuthService.onAuthStateChange(

                (
                    event,
                    session
                ) => {

                    this.handleAuthStateChange(

                        event,

                        session

                    );

                }

            );


        /*
        ==========================================
        STORE SUBSCRIPTION
        ==========================================
        */

        this.authSubscription =
            authListener?.data?.subscription
            ??
            null;


        /*
        ==========================================
        READY
        ==========================================
        */

        console.log(
            "Application Initialized."
        );

    }


    /*
    ======================================================
    HANDLE AUTH STATE CHANGE
    ======================================================
    */

    handleAuthStateChange(

        event,

        session

    ) {

        /*
        ==========================================
        DEBUG
        ==========================================
        */

        console.log(

            "AUTH EVENT :",

            event

        );


        /*
        ==========================================
        SIGNED OUT
        ==========================================
        */

        if (
            event ===
            "SIGNED_OUT"
        ) {

            /*
            ======================================
            STOP APPLICATION INSTANCE
            ======================================
            */

            this.destroy();


            /*
            ======================================
            REDIRECT LOGIN
            ======================================
            */

            window.location.replace(
                "login.html"
            );


            return;

        }


        /*
        ==========================================
        TOKEN REFRESHED
        ==========================================
        */

        if (
            event ===
            "TOKEN_REFRESHED"
        ) {

            console.log(
                "FINOVA session token refreshed."
            );


            return;

        }


        /*
        ==========================================
        USER UPDATED
        ==========================================
        */

        if (
            event ===
            "USER_UPDATED"
        ) {

            console.log(
                "FINOVA user session updated."
            );


            return;

        }


        /*
        ==========================================
        SIGNED IN
        ==========================================
        */

        if (
            event ===
            "SIGNED_IN"
        ) {

            /*
            ======================================
            SESSION AVAILABLE
            ======================================
            */

            if (
                session
            ) {

                console.log(
                    "FINOVA user authenticated."
                );

            }

        }

    }


    /*
    ======================================================
    DESTROY
    ======================================================
    */

    destroy() {

        /*
        ==========================================
        UNSUBSCRIBE AUTH LISTENER
        ==========================================
        */

        if (
            this.authSubscription
        ) {

            try {

                this.authSubscription.unsubscribe();

            }

            catch (
                error
            ) {

                console.warn(
                    "FINOVA Auth Subscription Cleanup :",
                    error
                );

            }


            this.authSubscription =
                null;

        }


        /*
        ==========================================
        CLEAR GLOBAL OBJECT
        ==========================================
        */

        window.finovaSidebar =
            null;

        window.finovaTopbar =
            null;

        window.finovaRouter =
            null;


        /*
        ==========================================
        CLEAR INSTANCE
        ==========================================
        */

        this.sidebar =
            null;

        this.topbar =
            null;

        this.router =
            null;


        /*
        ==========================================
        READY
        ==========================================
        */

        console.log(
            "Application Destroyed."
        );

    }


    /*
    ======================================================
    ERROR HANDLER
    ======================================================
    */

    handleError(
        error
    ) {

        /*
        ==========================================
        CONSOLE
        ==========================================
        */

        console.error(

            "FINOVA ERROR :",

            error

        );


        /*
        ==========================================
        TOAST
        ==========================================
        */

        if (
            window.Toast
        ) {

            Toast.fire({

                icon:
                    "error",

                title:
                    error?.message
                    ??
                    "Unexpected Error"

            });


            return;

        }


        /*
        ==========================================
        FALLBACK ALERT
        ==========================================
        */

        alert(

            error?.message
            ??
            "Unexpected Error"

        );

    }

}


/*
==========================================================
START APPLICATION
==========================================================
*/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        /*
        ==========================================
        CREATE APPLICATION
        ==========================================
        */

        window.finovaApp =
            new FinovaApp();

    }

);