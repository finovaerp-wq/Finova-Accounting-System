/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Application
Version : 2.0 Enterprise
==========================================================
*/

import { FinovaSidebar } from "../components/sidebar.js";
import { FinovaTopbar } from "../components/topbar.js";
import { FinovaFooter } from "../components/footer.js";

import { FinovaRouter } from "./router.js";

import { AuthService } from "../../../service/auth.service.js";

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

        this.sidebar = null;

        this.topbar = null;

        this.footer = null;

        this.router = null;

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

            if (!authenticated) {

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

            console.log(

                "FINOVA Accounting System Ready."

            );

        }

        catch (error) {

            console.error(

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

        /*
        ==========================================
        CHECK SESSION
        ==========================================
        */

        const authenticated =

            await AuthService.initialize();

        if (

            authenticated

        ) {

            return true;

        }

        /*
        ==========================================
        REDIRECT
        ==========================================
        */

        window.location.replace(

            "login.html"

        );

        return false;

    }

    /*
    ======================================================
    RENDER LAYOUT
    ======================================================
    */

    renderLayout() {

        const app =

            document.getElementById(

                "finova-app"

            );

        if (!app) {

            throw new Error(

                "Container #finova-app not found."

            );

        }

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

                    <footer
                        id="finova-footer">
                    </footer>

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
        FOOTER
        ==========================================
        */

        this.footer =

            new FinovaFooter();

        /*
        ==========================================
        GLOBAL ACCESS
        ==========================================
        */

        window.finovaSidebar =

            this.sidebar;

        window.finovaTopbar =

            this.topbar;

        window.finovaFooter =

            this.footer;

    }

    /*
    ======================================================
    INITIALIZE ROUTER
    ======================================================
    */

    initializeRouter() {

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

        AuthService.onAuthStateChange(

            (event) => {

                console.log(

                    "AUTH EVENT :",

                    event

                );

                /*
                ==================================
                SESSION EXPIRED
                ==================================
                */

                if (

                    event ===

                    "SIGNED_OUT"

                ) {

                    window.location.replace(

                        "login.html"

                    );

                }

            }

        );

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
    DESTROY
    ======================================================
    */

    destroy() {

        /*
        ==========================================
        CLEAR GLOBAL OBJECT
        ==========================================
        */

        window.finovaSidebar = null;

        window.finovaTopbar = null;

        window.finovaFooter = null;

        window.finovaRouter = null;

        /*
        ==========================================
        CLEAR INSTANCE
        ==========================================
        */

        this.sidebar = null;

        this.topbar = null;

        this.footer = null;

        this.router = null;

        console.log(

            "Application Destroyed."

        );

    }

    /*
    ======================================================
    ERROR HANDLER
    ======================================================
    */

    handleError(error) {

        console.error(

            "FINOVA ERROR :",

            error

        );

        if (

            window.Toast

        ) {

            Toast.fire({

                icon: "error",

                title: error.message ??

                    "Unexpected Error"

            });

            return;

        }

        alert(

            error.message ??

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

        window.finovaApp =

            new FinovaApp();

    }

);