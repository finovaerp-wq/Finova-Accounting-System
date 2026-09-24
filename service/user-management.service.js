/*
==========================================================
FINOVA ACCOUNTING SYSTEM
SERVICE : USER MANAGEMENT
FILE    : user-management.service.js
VERSION : 4.0.0 MULTI COMPANY
==========================================================
*/

import {
    supabase
} from "../assets/js/core/supabase.js";


export class UserManagementService {

    static TABLE = "mst_users";


    /*
    ======================================================
    GET CURRENT AUTH USER
    ======================================================
    */

    static async getCurrentAuthUser() {

        const {
            data,
            error
        } = await supabase.auth.getUser();


        if (error) {
            throw error;
        }


        return data?.user ?? null;
    }


    /*
    ======================================================
    GET CURRENT PROFILE

    NOTE
    ----
    Super Admin intentionally does not need a mst_users
    tenant profile. Returning null here is valid for a
    Super Admin and must not be treated as an error by UI.
    ======================================================
    */

    static async getCurrentProfile() {

        const authUser =
            await this.getCurrentAuthUser();


        if (!authUser) {
            return null;
        }


        const {
            data,
            error
        } = await supabase
            .from(this.TABLE)
            .select(`
                user_uid,
                email,
                full_name,
                role,
                status,
                company_id
            `)
            .eq(
                "user_uid",
                authUser.id
            )
            .maybeSingle();


        if (error) {
            throw error;
        }


        return data ?? null;
    }


    /*
    ======================================================
    INVOKE ADMIN USER MANAGEMENT EDGE FUNCTION
    ======================================================
    */

    static async invokeAdmin(
        body
    ) {

        const {
            data,
            error
        } = await supabase
            .functions
            .invoke(
                "admin-user-management",
                {
                    body
                }
            );


        if (error) {
            throw error;
        }


        if (!data?.success) {
            throw new Error(
                data?.message
                ||
                "User Management request failed."
            );
        }


        return data;
    }


    /*
    ======================================================
    GET ALL USERS

    SECURITY
    --------
    User list is loaded through the Edge Function so the
    browser never decides which company can be queried.
    ======================================================
    */

    static async getAll() {

        const data =
            await this.invokeAdmin({
                action:
                    "list_users"
            });


        return Array.isArray(
            data?.users
        )
            ? data.users
            : [];
    }


    /*
    ======================================================
    UPDATE FINOVA PROFILE
    ======================================================
    */

    static async updateProfile(
        userUid,
        values
    ) {

        if (!userUid) {
            throw new Error(
                "User UID is required."
            );
        }


        const fullName =
            String(
                values?.full_name
                ??
                ""
            )
                .trim();


        if (!fullName) {
            throw new Error(
                "Full Name is required."
            );
        }


        const role =
            values?.role === "Manager"
                ? "Manager"
                : "Staff";


        if (
            typeof values?.status !==
            "boolean"
        ) {
            throw new Error(
                "User status must be boolean."
            );
        }


        const data =
            await this.invokeAdmin({

                action:
                    "update_profile",

                user_uid:
                    userUid,

                full_name:
                    fullName,

                role,

                status:
                    values.status

            });


        return data?.user ?? null;
    }


    /*
    ======================================================
    CREATE AUTH USER
    ======================================================
    */

    static async createAuthUser(
        payload
    ) {

        const fullName =
            String(
                payload?.full_name
                ??
                ""
            )
                .trim();


        const email =
            String(
                payload?.email
                ??
                ""
            )
                .trim()
                .toLowerCase();


        const password =
            String(
                payload?.password
                ??
                ""
            );


        const role =
            payload?.role === "Manager"
                ? "Manager"
                : "Staff";


        if (
            typeof payload?.status !==
            "boolean"
        ) {
            throw new Error(
                "User status must be boolean."
            );
        }


        const status =
            payload.status;


        /*
        ==================================================
        BASIC VALIDATION
        ==================================================
        */

        if (!fullName) {
            throw new Error(
                "Full Name is required."
            );
        }


        if (!email) {
            throw new Error(
                "Email is required."
            );
        }


        if (
            password.length
            <
            8
        ) {
            throw new Error(
                "Temporary Password must contain at least 8 characters."
            );
        }


        const data =
            await this.invokeAdmin({

                action:
                    "create",

                full_name:
                    fullName,

                email,

                password,

                role,

                status

            });


        return data?.user ?? null;
    }


    /*
    ======================================================
    RESET AUTH USER PASSWORD
    ======================================================
    */

    static async resetAuthUserPassword(
        userUid,
        newPassword
    ) {

        if (!userUid) {
            throw new Error(
                "User UID is required."
            );
        }


        const password =
            String(
                newPassword
                ??
                ""
            );


        if (
            password.length
            <
            8
        ) {
            throw new Error(
                "New Password must contain at least 8 characters."
            );
        }


        return await this.invokeAdmin({

            action:
                "reset_password",

            user_uid:
                userUid,

            password

        });
    }


    /*
    ======================================================
    DELETE AUTH USER
    ======================================================
    */

    static async deleteAuthUser(
        userUid
    ) {

        if (!userUid) {
            throw new Error(
                "User UID is required."
            );
        }


        await this.invokeAdmin({

            action:
                "delete",

            user_uid:
                userUid

        });


        return true;
    }

}
