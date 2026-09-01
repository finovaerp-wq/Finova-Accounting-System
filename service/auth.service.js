/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Authentication Service
Version : 3.2 Enterprise

FINAL :
- LOGIN
- LOGOUT
- CHANGE PASSWORD
- SESSION MANAGEMENT
- AUTO LOGOUT 30 MINUTES
- MULTI TAB ACTIVITY SYNC
- REMEMBER EMAIL
- RESET PASSWORD
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


    static LAST_ACTIVITY_KEY =
        "finova_last_activity";


    static sessionTimer =
        null;


    static isLogoutRunning =
        false;


    /*
    ======================================================
    ACTIVITY CONFIGURATION
    ======================================================
    */

    static activityHandler =
        null;


    static storageHandler =
        null;


    static visibilityHandler =
        null;


    static lastActivityWrite =
        0;


    static ACTIVITY_THROTTLE =
        1000;


    static activityEvents = [

        "click",

        "mousemove",

        "mousedown",

        "keydown",

        "scroll",

        "touchstart",

        "pointerdown"

    ];


    /*
    ======================================================
    REMEMBER ME CONFIGURATION
    ======================================================
    */

    static REMEMBER_EMAIL_KEY =
        "remember_email";


    /*
    ======================================================
    SAVE REMEMBER EMAIL
    ======================================================
    */

    static saveRememberEmail(
        email
    ) {

        localStorage.setItem(

            this.REMEMBER_EMAIL_KEY,

            email

        );

    }


    /*
    ======================================================
    GET REMEMBER EMAIL
    ======================================================
    */

    static getRememberEmail() {

        return localStorage.getItem(

            this.REMEMBER_EMAIL_KEY

        ) || "";

    }


    /*
    ======================================================
    CLEAR REMEMBER EMAIL
    ======================================================
    */

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

        /*
        ==========================================
        LOGIN SUPABASE
        ==========================================
        */

        const {

            data,

            error

        } = await supabase.auth.signInWithPassword({

            email,

            password

        });


        if (
            error
        ) {

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
        RESET IDLE STATE
        ==========================================
        */

        this.isLogoutRunning =
            false;


        this.setLastActivity(
            Date.now()
        );


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

    static async logout(

        options = {}

    ) {

        /*
        ==========================================
        OPTIONS
        ==========================================
        */

        const {

            reason = "manual",

            redirect = false

        } = options;


        /*
        ==========================================
        PREVENT DUPLICATE LOGOUT
        ==========================================
        */

        if (
            this.isLogoutRunning
        ) {

            return true;

        }


        this.isLogoutRunning =
            true;


        /*
        ==========================================
        STOP SESSION MONITOR
        ==========================================
        */

        this.stopSessionTimer();


        /*
        ==========================================
        REMOVE LAST ACTIVITY
        ==========================================
        */

        localStorage.removeItem(
            this.LAST_ACTIVITY_KEY
        );


        /*
        ==========================================
        SAVE LOGOUT REASON
        ==========================================
        */

        if (
            reason === "idle"
        ) {

            sessionStorage.setItem(

                "finova_logout_reason",

                "idle"

            );

        }

        else {

            sessionStorage.removeItem(
                "finova_logout_reason"
            );

        }


        try {

            /*
            ==========================================
            SIGN OUT
            ==========================================
            */

            const {

                error

            } = await supabase.auth.signOut();


            if (
                error
            ) {

                throw error;

            }


            /*
            ==========================================
            CLEAR FINOVA SESSION DATA
            ==========================================
            */

            this.clearSessionStorageExceptLogoutReason(
                reason
            );


            /*
            ==========================================
            OPTIONAL REDIRECT
            ==========================================
            */

            if (
                redirect
            ) {

                window.location.replace(
                    "login.html"
                );

            }


            return true;

        }

        catch (
            error
        ) {

            /*
            ==========================================
            ALLOW RETRY
            ==========================================
            */

            this.isLogoutRunning =
                false;


            throw error;

        }

    }


    /*
    ======================================================
    CLEAR SESSION STORAGE
    KEEP IDLE LOGOUT REASON WHEN REQUIRED
    ======================================================
    */

    static clearSessionStorageExceptLogoutReason(
        reason
    ) {

        /*
        ==========================================
        IDLE LOGOUT
        ==========================================
        */

        if (
            reason === "idle"
        ) {

            const logoutReason =
                sessionStorage.getItem(
                    "finova_logout_reason"
                );


            sessionStorage.clear();


            if (
                logoutReason
            ) {

                sessionStorage.setItem(

                    "finova_logout_reason",

                    logoutReason

                );

            }


            return;

        }


        /*
        ==========================================
        NORMAL LOGOUT
        ==========================================
        */

        sessionStorage.clear();

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

        const user =
            await this.getUser();


        if (
            !user
        ) {

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

            error:
                loginError

        } = await supabase.auth.signInWithPassword({

            email:
                user.email,

            password:
                currentPassword

        });


        if (
            loginError
        ) {

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

            password:
                newPassword

        });


        if (
            error
        ) {

            throw error;

        }


        /*
        ==========================================
        ACTIVITY AFTER PASSWORD CHANGE
        ==========================================
        */

        this.updateLastActivity();


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


        if (
            error
        ) {

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


        if (
            error
        ) {

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


        if (
            error
        ) {

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


        return session?.access_token
            ??
            null;

    }


    /*
    ======================================================
    GET CURRENT USER ID
    ======================================================
    */

    static async getCurrentUserId() {

        const user =
            await this.getUser();


        return user?.id
            ??
            null;

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

        /*
        ==========================================
        CHECK SESSION
        ==========================================
        */

        const authenticated =
            await this.checkAuth();


        if (
            !authenticated
        ) {

            return false;

        }


        /*
        ==========================================
        RESET LOGOUT LOCK
        ==========================================
        */

        this.isLogoutRunning =
            false;


        /*
        ==========================================
        CHECK EXISTING ACTIVITY
        ==========================================
        */

        const lastActivity =
            this.getLastActivity();


        /*
        ==========================================
        FIRST LOAD
        ==========================================
        */

        if (
            !lastActivity
        ) {

            this.setLastActivity(
                Date.now()
            );

        }


        /*
        ==========================================
        CHECK SESSION IDLE
        ==========================================
        */

        const valid =
            await this.checkIdleSession();


        if (
            !valid
        ) {

            return false;

        }


        /*
        ==========================================
        START SESSION TIMER
        ==========================================
        */

        this.startSessionTimer();


        return true;

    }


    /*
    ======================================================
    START SESSION TIMER
    ======================================================
    */

    static startSessionTimer() {

        /*
        ==========================================
        START LISTENERS
        ==========================================
        */

        this.startActivityListener();

        this.startStorageListener();

        this.startVisibilityListener();


        /*
        ==========================================
        RESET TIMER
        ==========================================
        */

        this.resetSessionTimer();

    }


    /*
    ======================================================
    RESET SESSION TIMER
    ======================================================
    */

    static resetSessionTimer() {

        /*
        ==========================================
        CLEAR OLD TIMER
        ==========================================
        */

        if (
            this.sessionTimer
        ) {

            clearTimeout(
                this.sessionTimer
            );


            this.sessionTimer =
                null;

        }


        /*
        ==========================================
        DON'T CREATE TIMER DURING LOGOUT
        ==========================================
        */

        if (
            this.isLogoutRunning
        ) {

            return;

        }


        /*
        ==========================================
        GET LAST ACTIVITY
        ==========================================
        */

        let lastActivity =
            this.getLastActivity();


        /*
        ==========================================
        NO ACTIVITY YET
        ==========================================
        */

        if (
            !lastActivity
        ) {

            lastActivity =
                Date.now();


            this.setLastActivity(
                lastActivity
            );

        }


        /*
        ==========================================
        ELAPSED
        ==========================================
        */

        const elapsed =
            Date.now()
            -
            lastActivity;


        /*
        ==========================================
        REMAINING
        ==========================================
        */

        const remaining =
            this.SESSION_TIMEOUT
            -
            elapsed;


        /*
        ==========================================
        ALREADY EXPIRED
        ==========================================
        */

        if (
            remaining <= 0
        ) {

            this.handleSessionTimeout();

            return;

        }


        /*
        ==========================================
        CREATE TIMER
        ==========================================
        */

        this.sessionTimer =
            window.setTimeout(

                () => {

                    this.handleSessionTimeout();

                },

                remaining

            );

    }


    /*
    ======================================================
    HANDLE SESSION TIMEOUT
    ======================================================
    */

    static async handleSessionTimeout() {

        /*
        ==========================================
        PREVENT DUPLICATE
        ==========================================
        */

        if (
            this.isLogoutRunning
        ) {

            return;

        }


        /*
        ==========================================
        FINAL CHECK
        OTHER TAB MAY HAVE RECENT ACTIVITY
        ==========================================
        */

        const lastActivity =
            this.getLastActivity();


        if (
            lastActivity
        ) {

            const elapsed =
                Date.now()
                -
                lastActivity;


            if (
                elapsed
                <
                this.SESSION_TIMEOUT
            ) {

                this.resetSessionTimer();

                return;

            }

        }


        /*
        ==========================================
        IDLE LOGOUT
        ==========================================
        */

        try {

            console.log(
                "FINOVA SESSION EXPIRED : 30 minutes inactivity."
            );


            await this.logout({

                reason:
                    "idle",

                redirect:
                    true

            });

        }

        catch (
            error
        ) {

            console.error(
                "FINOVA AUTO LOGOUT ERROR :",
                error
            );


            /*
            ==========================================
            FORCE REDIRECT
            ==========================================
            */

            window.location.replace(
                "login.html"
            );

        }

    }


    /*
    ======================================================
    STOP SESSION TIMER
    ======================================================
    */

    static stopSessionTimer() {

        /*
        ==========================================
        CLEAR TIMER
        ==========================================
        */

        if (
            this.sessionTimer
        ) {

            clearTimeout(
                this.sessionTimer
            );


            this.sessionTimer =
                null;

        }


        /*
        ==========================================
        STOP LISTENERS
        ==========================================
        */

        this.stopActivityListener();

        this.stopStorageListener();

        this.stopVisibilityListener();

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

        if (
            this.activityHandler
        ) {

            return;

        }


        /*
        ==========================================
        HANDLER
        ==========================================
        */

        this.activityHandler =
            () => {

                this.updateLastActivity();

            };


        /*
        ==========================================
        REGISTER
        ==========================================
        */

        this.activityEvents.forEach(

            event => {

                window.addEventListener(

                    event,

                    this.activityHandler,

                    {
                        passive:
                            true
                    }

                );

            }

        );

    }


    /*
    ======================================================
    STOP ACTIVITY LISTENER
    ======================================================
    */

    static stopActivityListener() {

        if (
            !this.activityHandler
        ) {

            return;

        }


        this.activityEvents.forEach(

            event => {

                window.removeEventListener(

                    event,

                    this.activityHandler

                );

            }

        );


        this.activityHandler =
            null;

    }


    /*
    ======================================================
    UPDATE LAST ACTIVITY
    ======================================================
    */

    static updateLastActivity() {

        /*
        ==========================================
        LOGOUT RUNNING
        ==========================================
        */

        if (
            this.isLogoutRunning
        ) {

            return;

        }


        /*
        ==========================================
        THROTTLE
        ==========================================
        */

        const now =
            Date.now();


        if (
            now
            -
            this.lastActivityWrite
            <
            this.ACTIVITY_THROTTLE
        ) {

            return;

        }


        /*
        ==========================================
        UPDATE
        ==========================================
        */

        this.lastActivityWrite =
            now;


        this.setLastActivity(
            now
        );


        /*
        ==========================================
        RESET TIMER
        ==========================================
        */

        this.resetSessionTimer();

    }


    /*
    ======================================================
    SET LAST ACTIVITY
    ======================================================
    */

    static setLastActivity(
        timestamp
    ) {

        localStorage.setItem(

            this.LAST_ACTIVITY_KEY,

            String(
                timestamp
            )

        );

    }


    /*
    ======================================================
    GET LAST ACTIVITY
    ======================================================
    */

    static getLastActivity() {

        const value =
            localStorage.getItem(
                this.LAST_ACTIVITY_KEY
            );


        if (
            !value
        ) {

            return null;

        }


        const timestamp =
            Number(
                value
            );


        if (
            !Number.isFinite(
                timestamp
            )
        ) {

            return null;

        }


        if (
            timestamp <= 0
        ) {

            return null;

        }


        return timestamp;

    }


    /*
    ======================================================
    CHECK IDLE SESSION
    ======================================================
    */

    static async checkIdleSession() {

        const lastActivity =
            this.getLastActivity();


        /*
        ==========================================
        FIRST ACTIVITY
        ==========================================
        */

        if (
            !lastActivity
        ) {

            this.setLastActivity(
                Date.now()
            );


            return true;

        }


        /*
        ==========================================
        ELAPSED
        ==========================================
        */

        const elapsed =
            Date.now()
            -
            lastActivity;


        /*
        ==========================================
        STILL ACTIVE
        ==========================================
        */

        if (
            elapsed
            <
            this.SESSION_TIMEOUT
        ) {

            return true;

        }


        /*
        ==========================================
        EXPIRED
        ==========================================
        */

        try {

            await this.logout({

                reason:
                    "idle",

                redirect:
                    true

            });

        }

        catch (
            error
        ) {

            console.error(
                "FINOVA CHECK IDLE SESSION ERROR :",
                error
            );


            window.location.replace(
                "login.html"
            );

        }


        return false;

    }


    /*
    ======================================================
    START STORAGE LISTENER
    MULTI TAB
    ======================================================
    */

    static startStorageListener() {

        /*
        ==========================================
        AVOID DUPLICATE
        ==========================================
        */

        if (
            this.storageHandler
        ) {

            return;

        }


        /*
        ==========================================
        HANDLER
        ==========================================
        */

        this.storageHandler =
            event => {

                if (
                    event.key
                    !==
                    this.LAST_ACTIVITY_KEY
                ) {

                    return;

                }


                /*
                ==================================
                ACTIVITY FROM OTHER TAB
                ==================================
                */

                if (
                    event.newValue
                ) {

                    this.resetSessionTimer();

                    return;

                }


                /*
                ==================================
                KEY REMOVED
                POSSIBLE LOGOUT
                ==================================
                */

                if (
                    event.newValue === null
                ) {

                    this.checkCurrentSessionAfterStorageChange();

                }

            };


        /*
        ==========================================
        REGISTER
        ==========================================
        */

        window.addEventListener(

            "storage",

            this.storageHandler

        );

    }


    /*
    ======================================================
    STOP STORAGE LISTENER
    ======================================================
    */

    static stopStorageListener() {

        if (
            !this.storageHandler
        ) {

            return;

        }


        window.removeEventListener(

            "storage",

            this.storageHandler

        );


        this.storageHandler =
            null;

    }


    /*
    ======================================================
    CHECK SESSION AFTER STORAGE CHANGE
    ======================================================
    */

    static async checkCurrentSessionAfterStorageChange() {

        if (
            this.isLogoutRunning
        ) {

            return;

        }


        try {

            const session =
                await this.getSession();


            /*
            ==========================================
            SESSION GONE
            ==========================================
            */

            if (
                !session
            ) {

                this.stopSessionTimer();


                window.location.replace(
                    "login.html"
                );


                return;

            }


            /*
            ==========================================
            SESSION STILL VALID
            CREATE NEW ACTIVITY
            ==========================================
            */

            this.setLastActivity(
                Date.now()
            );


            this.resetSessionTimer();

        }

        catch (
            error
        ) {

            console.error(
                "FINOVA STORAGE SESSION CHECK ERROR :",
                error
            );

        }

    }


    /*
    ======================================================
    START VISIBILITY LISTENER
    ======================================================
    */

    static startVisibilityListener() {

        if (
            this.visibilityHandler
        ) {

            return;

        }


        this.visibilityHandler =
            () => {

                /*
                ==================================
                ONLY WHEN TAB BECOMES VISIBLE
                ==================================
                */

                if (
                    document.visibilityState
                    !==
                    "visible"
                ) {

                    return;

                }


                /*
                ==================================
                CHECK SESSION
                DO NOT COUNT TAB VISIBILITY
                AS USER ACTIVITY
                ==================================
                */

                this.checkSessionWhenVisible();

            };


        document.addEventListener(

            "visibilitychange",

            this.visibilityHandler

        );

    }


    /*
    ======================================================
    STOP VISIBILITY LISTENER
    ======================================================
    */

    static stopVisibilityListener() {

        if (
            !this.visibilityHandler
        ) {

            return;

        }


        document.removeEventListener(

            "visibilitychange",

            this.visibilityHandler

        );


        this.visibilityHandler =
            null;

    }


    /*
    ======================================================
    CHECK SESSION WHEN TAB BECOMES VISIBLE
    ======================================================
    */

    static async checkSessionWhenVisible() {

        if (
            this.isLogoutRunning
        ) {

            return;

        }


        try {

            /*
            ==========================================
            CHECK AUTH SESSION
            ==========================================
            */

            const session =
                await this.getSession();


            if (
                !session
            ) {

                this.stopSessionTimer();


                window.location.replace(
                    "login.html"
                );


                return;

            }


            /*
            ==========================================
            CHECK IDLE TIME
            ==========================================
            */

            const lastActivity =
                this.getLastActivity();


            if (
                !lastActivity
            ) {

                this.setLastActivity(
                    Date.now()
                );


                this.resetSessionTimer();


                return;

            }


            const elapsed =
                Date.now()
                -
                lastActivity;


            /*
            ==========================================
            EXPIRED
            ==========================================
            */

            if (
                elapsed
                >=
                this.SESSION_TIMEOUT
            ) {

                await this.handleSessionTimeout();

                return;

            }


            /*
            ==========================================
            STILL ACTIVE
            ==========================================
            */

            this.resetSessionTimer();

        }

        catch (
            error
        ) {

            console.error(
                "FINOVA VISIBILITY SESSION CHECK ERROR :",
                error
            );

        }

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


        return user?.email
            ??
            null;

    }


    /*
    ======================================================
    GET USER METADATA
    ======================================================
    */

    static async getUserMetadata() {

        const user =
            await this.getUser();


        return user?.user_metadata
            ??
            {};

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

                    window.location.origin
                    +
                    "/change-password.html"

            }

        );


        if (
            error
        ) {

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


        if (
            error
        ) {

            throw error;

        }


        return data;

    }

}


/*
==========================================================
GLOBAL ACCESS
==========================================================
*/

window.AuthService =
    AuthService;