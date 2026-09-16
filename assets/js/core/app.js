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
import {
    CustomerConfig
} from "./customer-config.js";

import {
    TenantContext
} from "./tenant-context.js";

import {
    supabase
} from "./supabase.js";

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
        CHECK FINOVA SUPER ADMIN
        ==========================================
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

            console.error(
                "FINOVA SUPER ADMIN CHECK ERROR :",
                superAdminError
            );

            throw superAdminError;

        }


        /*
        ==========================================
        APPLICATION ACCESS MODE
        ==========================================
        */

        this.isSuperAdmin =
            isSuperAdmin === true;


        /*
        ==========================================
        EFFECTIVE COMPANY CONTEXT
        ==========================================
        */

        const effectiveCompanyId =
            await TenantContext.getCompanyId({
                refresh: true
            });


        this.effectiveCompanyId =
            effectiveCompanyId ?? null;


        this.hasCompanyContext =
            Boolean(
                this.effectiveCompanyId
            );


        /*
        ==========================================
        ACCESS MODE
        ==========================================
        */

        if (
            this.isSuperAdmin
        ) {

            console.log(
                "FINOVA ACCESS MODE : SUPER ADMIN"
            );


            console.log(
                "FINOVA SUPER ADMIN COMPANY CONTEXT :",
                this.effectiveCompanyId
                ??
                "NOT SELECTED"
            );

        }
        else {

            /*
            ======================================
            TENANT MUST HAVE COMPANY
            ======================================
            */

            if (
                !this.hasCompanyContext
            ) {

                throw new Error(
                    "FINOVA company context not found for authenticated tenant user."
                );

            }

        }


        /*
        ==========================================
        CUSTOMER CONFIGURATION
        ==========================================

        TENANT USER
        -----------
        Selalu memiliki company context.

        SUPER ADMIN
        -----------
        CustomerConfig hanya di-load apabila
        Company Context sudah dipilih.

        Super Admin tanpa Company Context tetap
        dapat masuk FINOVA untuk memilih company,
        tetapi configuration tenant tidak boleh
        di-load.
        ==========================================
        */

        if (
            this.hasCompanyContext
        ) {

            /*
            ======================================
            RESET OLD CONFIGURATION
            ======================================

            Penting untuk mencegah configuration
            company sebelumnya tetap berada di
            cache.
            ======================================
            */

            CustomerConfig.reset();


            /*
            ======================================
            INITIALIZE EFFECTIVE COMPANY CONFIG
            ======================================
            */

            await CustomerConfig.initialize(
                true
            );


            /*
            ======================================
            VALIDATE CONFIG COMPANY
            ======================================
            */

            const configCompanyId =
                CustomerConfig.getCompanyId();


            if (
                configCompanyId
                !==
                this.effectiveCompanyId
            ) {

                throw new Error(
                    "FINOVA customer configuration does not match the effective company context."
                );

            }


            /*
            ======================================
            CUSTOMER CONFIG DEBUG
            ======================================
            */

            console.log(
                "FINOVA COMPANY :",
                CustomerConfig.getCompanyCode(),
                CustomerConfig.getCompanyName()
            );


            console.log(
                "FINOVA BASE CURRENCY :",
                CustomerConfig.getBaseCurrency()
            );


            console.log(
                "FINOVA CUSTOMER CONFIG COMPANY ID :",
                configCompanyId
            );

        }
        else {

            /*
            ======================================
            NO COMPANY CONTEXT
            ======================================

            Berlaku untuk Super Admin yang belum
            memilih Company Context.
            ======================================
            */

            CustomerConfig.reset();


            console.log(
                "FINOVA CUSTOMER CONFIG : NOT INITIALIZED"
            );

        }


        /*
        ==========================================
        GLOBAL COMPANY CONTEXT STATE
        ==========================================
        */

        window.finovaEffectiveCompanyId =
            this.effectiveCompanyId;


        window.finovaHasCompanyContext =
            this.hasCompanyContext;


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
==========================================================
RENDER LAYOUT
==========================================================
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


            <!-- ==========================================
                 SIDEBAR
            =========================================== -->

            <aside
                id="finova-sidebar">
            </aside>


            <!-- ==========================================
                 MAIN
            =========================================== -->

            <div class="finova-main">


                <!-- ======================================
                     TOPBAR
                ======================================= -->

                <header
                    id="finova-topbar">
                </header>


                <!-- ======================================
                     WORKSPACE TAB BAR
                ======================================= -->

                <div
                    id="finova-workspace-tabs"
                    class="finova-workspace-tabs">
                </div>


                <!-- ======================================
                     WORKSPACE CONTENT
                ======================================= -->

                <main
    id="finova-content"
    class="finova-workspace-content">
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
        new FinovaSidebar(
            {
                isSuperAdmin:
                    this.isSuperAdmin === true,

                hasCompanyContext:
                    this.hasCompanyContext === true
            }
        );


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


    /*
    ==========================================
    GLOBAL ACCESS MODE
    ==========================================
    */

    window.finovaIsSuperAdmin =
        this.isSuperAdmin === true;


    /*
    ==========================================
    GLOBAL COMPANY CONTEXT
    ==========================================
    */

    window.finovaHasCompanyContext =
        this.hasCompanyContext === true;


    window.finovaHasAccountingAccess =
        !this.isSuperAdmin
        ||
        this.hasCompanyContext === true;

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
    RESET CUSTOMER CONFIGURATION
    ==========================================
    */

    CustomerConfig.reset();

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