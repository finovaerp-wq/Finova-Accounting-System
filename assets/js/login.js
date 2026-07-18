/*
==========================================================
FINOVA ACCOUNTING SYSTEM
LOGIN
Version : 3.0 Enterprise
==========================================================
*/

import {
    AuthService
} from "../../service/auth.service.js";

/*
==========================================================
CLASS
==========================================================
*/

class Login {

    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor() {

        /*
        ==============================================
        STATE
        ==============================================
        */

        this.isLoading = false;

        /*
        ==============================================
        INITIALIZE
        ==============================================
        */

        this.cacheElements();

        this.bindEvents();

        this.checkSession();

    }

    /*
    ======================================================
    CACHE ELEMENTS
    ======================================================
    */

    cacheElements() {

        /*
        ==============================================
        FORM
        ==============================================
        */

        this.form =
            document.getElementById(
                "login-form"
            );

        /*
        ==============================================
        INPUT
        ==============================================
        */

        this.email =
            document.getElementById(
                "email"
            );

        this.password =
            document.getElementById(
                "password"
            );

        this.rememberMe =
            document.getElementById(
                "remember-me"
            );

        /*
        ==============================================
        BUTTON
        ==============================================
        */

        this.btnLogin =
            document.getElementById(
                "btn-login"
            );

        this.btnTogglePassword =
            document.getElementById(
                "btn-toggle-password"
            );

        /*
        ==============================================
        LOADING
        ==============================================
        */

        this.loading =
            document.getElementById(
                "login-loading"
            );

        this.loginSpinner =
            document.getElementById(
                "login-spinner"
            );

        this.loginIcon =
            document.getElementById(
                "login-icon"
            );

        this.loginText =
            document.getElementById(
                "login-text"
            );
        }
        /*
    ======================================================
    EVENTS
    ======================================================
    */

    bindEvents() {

        /*
        ==============================================
        LOGIN
        ==============================================
        */

        this.form?.addEventListener(

            "submit",

            (event) => {

                event.preventDefault();

                this.login();

            }

        );

        /*
        ==============================================
        ENTER KEY
        ==============================================
        */

        document.addEventListener(

            "keydown",

            (event) => {

                if (

                    event.key !== "Enter"

                ) {

                    return;

                }

                if (

                    document.activeElement?.tagName ===

                    "TEXTAREA"

                ) {

                    return;

                }

                event.preventDefault();

                this.login();

            }

        );

        /*
        ==============================================
        TOGGLE PASSWORD
        ==============================================
        */

        this.btnTogglePassword?.addEventListener(

            "click",

            () => {

                this.togglePassword();

            }

        );

    }

    /*
    ======================================================
    TOGGLE PASSWORD
    ======================================================
    */

    togglePassword() {

        const isPassword =

            this.password.type === "password";

        this.password.type =

            isPassword ?

            "text" :

            "password";

        this.btnTogglePassword.innerHTML =

            isPassword

                ?

                `<i class="fa-solid fa-eye-slash"></i>`

                :

                `<i class="fa-solid fa-eye"></i>`;

    }
        /*
    ======================================================
    LOGIN
    ======================================================
    */

    async login() {

        /*
        ==============================================
        PREVENT MULTIPLE REQUEST
        ==============================================
        */

        if (this.isLoading) {

            return;

        }

        /*
        ==============================================
        GET VALUE
        ==============================================
        */

        const email =

            this.email.value.trim();

        const password =

            this.password.value;

        /*
        ==============================================
        VALIDATION
        ==============================================
        */

        if (!email) {

            this.showError(

                "Email is required."

            );

            this.email.focus();

            return;

        }

        if (!password) {

            this.showError(

                "Password is required."

            );

            this.password.focus();

            return;

        }

        this.isLoading = true;

        this.showLoading();

        try {

            /*
            ==========================================
            LOGIN
            ==========================================
            */

            await AuthService.login(

                email,

                password

            );

            /*
            ==========================================
            REMEMBER EMAIL
            ==========================================
            */

            if (

                this.rememberMe.checked

            ) {

                AuthService.saveRememberEmail(

                    email

                );

            }

            else {

                AuthService.clearRememberEmail();

            }

            /*
            ==========================================
            SUCCESS
            ==========================================
            */

            this.showSuccess(

                "Login Success"

            );

            /*
            ==========================================
            REDIRECT
            ==========================================
            */

            window.location.replace(

                "index.html"

            );

        }

        catch (error) {

            console.error(error);

            this.showError(

                error.message ??

                "Login failed."

            );

        }

        finally {

            this.hideLoading();

            this.isLoading = false;

        }

    }
        /*
    ======================================================
    CHECK SESSION
    ======================================================
    */

    async checkSession() {

        /*
        ==============================================
        CHECK LOGIN SESSION
        ==============================================
        */

        const authenticated =

            await AuthService.isAuthenticated();

        if (

            authenticated

        ) {

            window.location.replace(

                "index.html"

            );

            return;

        }

        /*
        ==============================================
        REMEMBER EMAIL
        ==============================================
        */

        const remember =

            AuthService.getRememberEmail();

        if (

            !remember

        ) {

            return;

        }

        this.email.value =

            remember;

        this.rememberMe.checked =

            true;

    }

    /*
    ======================================================
    SHOW LOADING
    ======================================================
    */

    showLoading() {

        this.loading?.classList.remove(

            "d-none"

        );

        this.loginSpinner?.classList.remove(

            "d-none"

        );

        this.loginIcon?.classList.add(

            "d-none"

        );

        if (

            this.loginText

        ) {

            this.loginText.textContent =

                "Signing In...";

        }

        if (

            this.btnLogin

        ) {

            this.btnLogin.disabled =

                true;

        }

    }

    /*
    ======================================================
    HIDE LOADING
    ======================================================
    */

    hideLoading() {

        this.loading?.classList.add(

            "d-none"

        );

        this.loginSpinner?.classList.add(

            "d-none"

        );

        this.loginIcon?.classList.remove(

            "d-none"

        );

        if (

            this.loginText

        ) {

            this.loginText.textContent =

                "Login";

        }

        if (

            this.btnLogin

        ) {

            this.btnLogin.disabled =

                false;

        }

    }
        /*
    ======================================================
    SUCCESS
    ======================================================
    */

    showSuccess(message) {

        if (window.Toast) {

            Toast.fire({

                icon: "success",

                title: message

            });

            return;

        }

        alert(message);

    }

    /*
    ======================================================
    ERROR
    ======================================================
    */

    showError(message) {

        if (window.Toast) {

            Toast.fire({

                icon: "error",

                title: message

            });

            return;

        }

        alert(message);

    }

}

/*
==========================================================
INITIALIZE
==========================================================
*/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        new Login();

    }

);

    

    