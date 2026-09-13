/*
==========================================================
FINOVA ACCOUNTING SYSTEM
SERVICE : USER MANAGEMENT
FILE    : user-management.service.js
VERSION : 3.0.0 FINAL
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

            .select("*")

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
    GET ALL USERS
    ======================================================
    */

    static async getAll() {

        const {
            data,
            error
        } = await supabase

            .from(this.TABLE)

            .select("*")

            .order(
                "full_name",
                {
                    ascending: true
                }
            )

            .order(
                "email",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        return data ?? [];
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


        const allowed = {

            full_name:
                String(
                    values?.full_name
                    ??
                    ""
                )
                    .trim(),

            role:
                values?.role === "Manager"
                    ? "Manager"
                    : "Staff",

            status:
                Boolean(
                    values?.status
                )

        };


        const {
            data,
            error
        } = await supabase

            .from(this.TABLE)

            .update(
                allowed
            )

            .eq(
                "user_uid",
                userUid
            )

            .select()

            .single();


        if (error) {
            throw error;
        }


        return data;
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


        const status =
            Boolean(
                payload?.status
            );


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


        /*
        ==================================================
        CALL EDGE FUNCTION
        ==================================================
        */

        const {
            data,
            error
        } =
            await supabase
                .functions
                .invoke(
                    "admin-user-management",
                    {
                        body: {

                            action:
                                "create",

                            full_name:
                                fullName,

                            email,

                            password,

                            role,

                            status

                        }
                    }
                );


        if (error) {
            throw error;
        }


        if (
            !data?.success
        ) {

            throw new Error(
                data?.message
                ||
                "Failed to create user."
            );

        }


        return data.user;
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


        /*
        ==================================================
        CALL EDGE FUNCTION
        ==================================================
        */

        const {
            data,
            error
        } =
            await supabase
                .functions
                .invoke(
                    "admin-user-management",
                    {
                        body: {

                            action:
                                "reset_password",

                            user_uid:
                                userUid,

                            password

                        }
                    }
                );


        if (error) {
            throw error;
        }


        if (
            !data?.success
        ) {

            throw new Error(
                data?.message
                ||
                "Failed to reset user password."
            );

        }


        return data;
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


        /*
        ==================================================
        CALL EDGE FUNCTION
        ==================================================
        */

        const {
            data,
            error
        } =
            await supabase
                .functions
                .invoke(
                    "admin-user-management",
                    {
                        body: {

                            action:
                                "delete",

                            user_uid:
                                userUid

                        }
                    }
                );


        if (error) {
            throw error;
        }


        if (
            !data?.success
        ) {

            throw new Error(
                data?.message
                ||
                "Failed to delete user."
            );

        }


        return true;
    }

}