/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Authentication Service
Version : 3.1 Enterprise
==========================================================
*/

import {
    supabase
} from "../assets/js/core/supabase.js";

import {
    UserService
} from "./user.service.js";

export class AuthService {

    /*
    ======================================================
    SESSION CONFIGURATION
    ======================================================
    */

    static SESSION_TIMEOUT =

        30 * 60 * 1000;

    static sessionTimer = null;

    /*
    ======================================================
    ACTIVITY CONFIGURATION
    ======================================================
    */

    static activityHandler = null;

    static activityEvents = [

        "click",

        "mousemove",

        "keydown",

        "scroll",

        "touchstart"

    ];
        /*
    ======================================================
    REMEMBER ME CONFIGURATION
    ======================================================
    */

    static REMEMBER_EMAIL_KEY = "remember_email";

    static saveRememberEmail(email) {

        localStorage.setItem(

            this.REMEMBER_EMAIL_KEY,

            email

        );

    }

    static getRememberEmail() {

        return localStorage.getItem(

            this.REMEMBER_EMAIL_KEY

        ) || "";

    }

    static clearRememberEmail() {

        localStorage.removeItem(

            this.REMEMBER_EMAIL_KEY

        );

    }

    /*
    ======================================================
    LOGIN
    ======================================================
    */

    static async login(

        email,

        password

    ) {

        const {

            data,

            error

        } = await supabase.auth.signInWithPassword({

            email,

            password

        });

        if (error) {

            throw error;

        }

        /*
        ==========================================
        SYNC PROFILE
        ==========================================
        */

        await UserService.syncProfile();

        /*
        ==========================================
        START SESSION
        ==========================================
        */

        this.startSessionTimer();

        return data;

    }

    /*
    ======================================================
    LOGOUT
    ======================================================
    */

    static async logout() {

        /*
        ==========================================
        STOP TIMER
        ==========================================
        */

        this.stopSessionTimer();

        /*
        ==========================================
        SIGN OUT
        ==========================================
        */

        const {

            error

        } = await supabase.auth.signOut();

        if (error) {

            throw error;

        }

        /*
        ==========================================
        CLEAR SESSION
        ==========================================
        */

        sessionStorage.clear();

        return true;

    }

    /*
    ======================================================
    CHANGE PASSWORD
    ======================================================
    */

    static async changePassword(

    currentPassword,

    newPassword

) {

    /*
    ==========================================
    GET CURRENT USER
    ==========================================
    */

    const user = await this.getUser();

    if (!user) {

        throw new Error(

            "User not found."

        );

    }

    /*
    ==========================================
    VERIFY CURRENT PASSWORD
    ==========================================
    */

    const {

        error: loginError

    } = await supabase.auth.signInWithPassword({

        email: user.email,

        password: currentPassword

    });

    if (loginError) {

        throw new Error(

            "Current password is incorrect."

        );

    }

    /*
    ==========================================
    UPDATE PASSWORD
    ==========================================
    */

    const {

        data,

        error

    } = await supabase.auth.updateUser({

        password: newPassword

    });

    if (error) {

        throw error;

    }

    return data;

}

    /*
    ======================================================
    REFRESH SESSION
    ======================================================
    */

    static async refreshSession() {

        const {

            data,

            error

        } = await supabase.auth.refreshSession();

        if (error) {

            throw error;

        }

        return data;

    }

    /*
    ======================================================
    GET SESSION
    ======================================================
    */

    static async getSession() {

        const {

            data,

            error

        } = await supabase.auth.getSession();

        if (error) {

            throw error;

        }

        return data.session;

    }

    /*
    ======================================================
    GET USER
    ======================================================
    */

    static async getUser() {

        const {

            data,

            error

        } = await supabase.auth.getUser();

        if (error) {

            throw error;

        }

        return data.user;

    }

    /*
    ======================================================
    GET ACCESS TOKEN
    ======================================================
    */

    static async getAccessToken() {

        const session =

            await this.getSession();

        return session?.access_token ?? null;

    }

    /*
    ======================================================
    GET CURRENT USER ID
    ======================================================
    */

    static async getCurrentUserId() {

        const user =

            await this.getUser();

        return user?.id ?? null;

    }

    /*
    ======================================================
    IS AUTHENTICATED
    ======================================================
    */

    static async isAuthenticated() {

        const session =

            await this.getSession();

        return session !== null;

    }

    /*
    ======================================================
    CHECK AUTH
    ======================================================
    */

    static async checkAuth() {

        const authenticated =

            await this.isAuthenticated();

        return authenticated;

    }

    /*
    ======================================================
    INITIALIZE
    ======================================================
    */

    static async initialize() {

        const authenticated =

            await this.checkAuth();

        if (!authenticated) {

            return false;

        }

        this.startSessionTimer();

        return true;

    }
        /*
    ======================================================
    START SESSION TIMER
    ======================================================
    */

    static startSessionTimer() {

        this.resetSessionTimer();

        this.startActivityListener();

    }

    /*
    ======================================================
    RESET SESSION TIMER
    ======================================================
    */

    static resetSessionTimer() {

        clearTimeout(

            this.sessionTimer

        );

        this.sessionTimer = setTimeout(

            async () => {

                try {

                    await this.logout();

                }

                catch (error) {

                    console.error(error);

                }

                finally {

                    window.location.replace(

                        "login.html"

                    );

                }

            },

            this.SESSION_TIMEOUT

        );

    }

    /*
    ======================================================
    STOP SESSION TIMER
    ======================================================
    */

    static stopSessionTimer() {

        clearTimeout(

            this.sessionTimer

        );

        this.stopActivityListener();

    }

    /*
    ======================================================
    START ACTIVITY LISTENER
    ======================================================
    */

    static startActivityListener() {

        /*
        ==========================================
        AVOID DUPLICATE LISTENER
        ==========================================
        */

        if (this.activityHandler) {

            return;

        }

        this.activityHandler = () => {

            this.resetSessionTimer();

        };

        this.activityEvents.forEach(

            event =>

                window.addEventListener(

                    event,

                    this.activityHandler

                )

        );

    }

    /*
    ======================================================
    STOP ACTIVITY LISTENER
    ======================================================
    */

    static stopActivityListener() {

        if (!this.activityHandler) {

            return;

        }

        this.activityEvents.forEach(

            event =>

                window.removeEventListener(

                    event,

                    this.activityHandler

                )

        );

        this.activityHandler = null;

    }

    /*
    ======================================================
    AUTH STATE CHANGE
    ======================================================
    */

    static onAuthStateChange(

        callback

    ) {

        return supabase.auth.onAuthStateChange(

            callback

        );

    }

    /*
    ======================================================
    GET USER EMAIL
    ======================================================
    */

    static async getUserEmail() {

        const user =

            await this.getUser();

        return user?.email ?? null;

    }

    /*
    ======================================================
    GET USER METADATA
    ======================================================
    */

    static async getUserMetadata() {

        const user =

            await this.getUser();

        return user?.user_metadata ?? {};

    }

    /*
    ======================================================
    RESET PASSWORD
    ======================================================
    */

    static async sendResetPassword(

        email

    ) {

        const {

            data,

            error

        } = await supabase.auth.resetPasswordForEmail(

            email,

            {

                redirectTo:

                    window.location.origin +

                    "/change-password.html"

            }

        );

        if (error) {

            throw error;

        }

        return data;

    }

    /*
    ======================================================
    UPDATE USER
    ======================================================
    */

    static async updateUser(

        values

    ) {

        const {

            data,

            error

        } = await supabase.auth.updateUser(

            values

        );

        if (error) {

            throw error;

        }

        return data;

    }

}

window.AuthService = AuthService;

