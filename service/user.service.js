/*
==========================================================
FINOVA ACCOUNTING SYSTEM
User Service
Version : 2.0 Enterprise
==========================================================
*/

import {
    supabase
} from "../assets/js/core/supabase.js";

export class UserService {

    /*
    ======================================================
    CREATE PROFILE
    ======================================================
    */

    static async createProfile(user) {

        const {

            data,

            error

        } = await supabase

            .from("mst_users")

            .insert({

                user_uid: user.id,

                email: user.email,

                full_name:

                    user.user_metadata?.full_name ??

                    "",

                status: true

            })

            .select()

            .single();

        if (error) {

            throw error;

        }

        return data;

    }

    /*
    ======================================================
    PROFILE EXISTS
    ======================================================
    */

    static async profileExists(userId) {

        const {

            count,

            error

        } = await supabase

            .from("mst_users")

            .select(

                "*",

                {

                    count: "exact",

                    head: true

                }

            )

            .eq(

                "user_uid",

                userId

            );

        if (error) {

            throw error;

        }

        return count > 0;

    }

    /*
    ======================================================
    GET PROFILE
    ======================================================
    */

    static async getProfile(userId) {

        const {

            data,

            error

        } = await supabase

            .from("mst_users")

            .select("*")

            .eq(

                "user_uid",

                userId

            );

        if (error) {

            throw error;

        }

        return data[0] ?? null;

    }

    /*
    ======================================================
    GET CURRENT PROFILE
    ======================================================
    */

    static async getCurrentProfile() {

        const {

            data,

            error

        } = await supabase.auth.getUser();

        if (error) {

            throw error;

        }

        if (!data.user) {

            return null;

        }

        return await this.getProfile(

            data.user.id

        );

    }

    /*
    ======================================================
    UPDATE PROFILE
    ======================================================
    */

    static async updateProfile(

        userId,

        values

    ) {

        const {

            data,

            error

        } = await supabase

            .from("mst_users")

            .update(values)

            .eq(

                "user_uid",

                userId

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
    SYNC PROFILE
    ======================================================
    */

    static async syncProfile() {

        // Legacy profile auto-creation is intentionally disabled.
        // Tenant profiles and company memberships must be provisioned by
        // the authorized User Management Edge Function, not by the browser.
        return await this.getCurrentProfile();

    }
}

window.UserService = UserService;