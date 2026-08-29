/*
==========================================================
FINOVA ACCOUNTING SYSTEM
SERVICE : USER MANAGEMENT
FILE    : user-management.service.js
VERSION : 2.0.0 FINAL
==========================================================
*/

import {
    supabase
} from "../assets/js/core/supabase.js";

export class UserManagementService {

    static TABLE = "mst_users";

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
            .eq("user_uid", authUser.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data ?? null;
    }

    static async getAll() {
        const {
            data,
            error
        } = await supabase
            .from(this.TABLE)
            .select("*")
            .order("full_name", {
                ascending: true
            })
            .order("email", {
                ascending: true
            });

        if (error) {
            throw error;
        }

        return data ?? [];
    }

    static async updateProfile(userUid, values) {
        if (!userUid) {
            throw new Error("User UID is required.");
        }

        const allowed = {
            full_name:
                String(values?.full_name ?? "").trim(),
            role:
                values?.role === "Manager"
                    ? "Manager"
                    : "Staff",
            status:
                Boolean(values?.status)
        };

        const {
            data,
            error
        } = await supabase
            .from(this.TABLE)
            .update(allowed)
            .eq("user_uid", userUid)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    static async createAuthUser(payload) {
        const {
            data,
            error
        } = await supabase.functions.invoke(
            "admin-user-management",
            {
                body: {
                    action: "create",
                    full_name:
                        String(payload?.full_name ?? "").trim(),
                    email:
                        String(payload?.email ?? "")
                            .trim()
                            .toLowerCase(),
                    password:
                        String(payload?.password ?? ""),
                    role:
                        payload?.role === "Manager"
                            ? "Manager"
                            : "Staff",
                    status:
                        Boolean(payload?.status)
                }
            }
        );

        if (error) {
            throw error;
        }

        if (!data?.success) {
            throw new Error(
                data?.message
                ||
                "Failed to create user."
            );
        }

        return data.user;
    }

    static async deleteAuthUser(userUid) {
        if (!userUid) {
            throw new Error("User UID is required.");
        }

        const {
            data,
            error
        } = await supabase.functions.invoke(
            "admin-user-management",
            {
                body: {
                    action: "delete",
                    user_uid: userUid
                }
            }
        );

        if (error) {
            throw error;
        }

        if (!data?.success) {
            throw new Error(
                data?.message
                ||
                "Failed to delete user."
            );
        }

        return true;
    }
}
