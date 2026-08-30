import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(
    body: Record<string, unknown>,
    status = 200
) {
    return new Response(
        JSON.stringify(body),
        {
            status,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json; charset=utf-8"
            }
        }
    );
}

function normalizeRole(value: unknown) {
    return String(value ?? "").trim().toLowerCase() === "manager"
        ? "Manager"
        : "Staff";
}

Deno.serve(async request => {
    if (request.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders
        });
    }

    if (request.method !== "POST") {
        return jsonResponse(
            {
                success: false,
                message: "Method not allowed."
            },
            405
        );
    }

    try {
        const SUPABASE_URL =
            Deno.env.get("SUPABASE_URL") ?? "";

        const SUPABASE_ANON_KEY =
            Deno.env.get("SUPABASE_ANON_KEY") ?? "";

        const SUPABASE_SERVICE_ROLE_KEY =
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (
            !SUPABASE_URL
            || !SUPABASE_ANON_KEY
            || !SUPABASE_SERVICE_ROLE_KEY
        ) {
            return jsonResponse(
                {
                    success: false,
                    message:
                        "Edge Function environment is incomplete."
                },
                500
            );
        }

        const authorization =
            request.headers.get("Authorization") ?? "";

        if (!authorization.startsWith("Bearer ")) {
            return jsonResponse(
                {
                    success: false,
                    message: "Authentication token was not found."
                },
                401
            );
        }

        /*
        ==========================================================
        REQUEST USER CLIENT
        Uses the caller JWT to identify the logged-in user.
        ==========================================================
        */
        const authClient = createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: authorization
                    }
                },
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );

        const {
            data: authData,
            error: authError
        } = await authClient.auth.getUser();

        if (authError || !authData?.user) {
            return jsonResponse(
                {
                    success: false,
                    message: "Authentication session is invalid."
                },
                401
            );
        }

        const currentUser = authData.user;

        /*
        ==========================================================
        ADMIN CLIENT
        Service role exists only inside the Edge Function.
        ==========================================================
        */
        const admin = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );

        /*
        ==========================================================
        SERVER-SIDE MANAGER AUTHORIZATION
        ==========================================================
        */
        const {
            data: currentProfile,
            error: profileError
        } = await admin
            .from("mst_users")
            .select("user_uid, email, full_name, role, status")
            .eq("user_uid", currentUser.id)
            .maybeSingle();

        if (profileError) {
            console.error(
                "admin-user-management current profile:",
                profileError
            );

            return jsonResponse(
                {
                    success: false,
                    message: "Failed to validate Manager access."
                },
                500
            );
        }

        const isManager =
            String(currentProfile?.role ?? "")
                .trim()
                .toLowerCase()
            === "manager";

        const isActive =
            currentProfile?.status === true;

        if (!currentProfile || !isManager || !isActive) {
            return jsonResponse(
                {
                    success: false,
                    message:
                        "Only an active Manager can modify User Management."
                },
                403
            );
        }

        let payload: Record<string, unknown>;

        try {
            payload = await request.json();
        }
        catch {
            return jsonResponse(
                {
                    success: false,
                    message: "Invalid request body."
                },
                400
            );
        }

        const action =
            String(payload?.action ?? "")
                .trim()
                .toLowerCase();

        /*
        ==========================================================
        CREATE USER
        ==========================================================
        */
        if (action === "create") {
            const fullName =
                String(payload?.full_name ?? "").trim();

            const email =
                String(payload?.email ?? "")
                    .trim()
                    .toLowerCase();

            const password =
                String(payload?.password ?? "");

            const role =
                normalizeRole(payload?.role);

            const status =
                Boolean(payload?.status);

            if (!fullName) {
                return jsonResponse(
                    {
                        success: false,
                        message: "Full Name is required."
                    },
                    400
                );
            }

            if (!email) {
                return jsonResponse(
                    {
                        success: false,
                        message: "Email is required."
                    },
                    400
                );
            }

            if (password.length < 8) {
                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Temporary Password must contain at least 8 characters."
                    },
                    400
                );
            }

            const {
                data: created,
                error: createError
            } = await admin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                    role
                }
            });

            if (createError || !created?.user) {
                console.error(
                    "admin-user-management create auth:",
                    createError
                );

                return jsonResponse(
                    {
                        success: false,
                        message:
                            createError?.message
                            || "Failed to create authentication user."
                    },
                    400
                );
            }

            const createdUser = created.user;

            const {
                data: profile,
                error: insertError
            } = await admin
                .from("mst_users")
                .insert({
                    user_uid: createdUser.id,
                    full_name: fullName,
                    email,
                    role,
                    status
                })
                .select()
                .single();

            if (insertError) {
                console.error(
                    "admin-user-management insert profile:",
                    insertError
                );

                /* Roll back Auth user when profile creation fails. */
                const {
                    error: rollbackError
                } = await admin.auth.admin.deleteUser(
                    createdUser.id
                );

                if (rollbackError) {
                    console.error(
                        "admin-user-management create rollback:",
                        rollbackError
                    );
                }

                return jsonResponse(
                    {
                        success: false,
                        message:
                            insertError.message
                            || "Failed to create FINOVA user profile."
                    },
                    500
                );
            }

            return jsonResponse({
                success: true,
                message: "User created successfully.",
                user: profile
            });
        }

        /*
        ==========================================================
        DELETE USER
        ==========================================================
        */
        if (action === "delete") {
            const userUid =
                String(payload?.user_uid ?? "").trim();

            if (!userUid) {
                return jsonResponse(
                    {
                        success: false,
                        message: "User UID is required."
                    },
                    400
                );
            }

            if (userUid === currentUser.id) {
                return jsonResponse(
                    {
                        success: false,
                        message:
                            "You cannot delete your own login account."
                    },
                    400
                );
            }

            const {
                data: targetProfile,
                error: targetProfileError
            } = await admin
                .from("mst_users")
                .select("*")
                .eq("user_uid", userUid)
                .maybeSingle();

            if (targetProfileError) {
                console.error(
                    "admin-user-management target profile:",
                    targetProfileError
                );

                return jsonResponse(
                    {
                        success: false,
                        message: "Failed to read target user."
                    },
                    500
                );
            }

            /*
            Delete application profile first. If Auth deletion fails,
            restore the profile using the row we just read.
            */
            if (targetProfile) {
                const {
                    error: profileDeleteError
                } = await admin
                    .from("mst_users")
                    .delete()
                    .eq("user_uid", userUid);

                if (profileDeleteError) {
                    console.error(
                        "admin-user-management delete profile:",
                        profileDeleteError
                    );

                    return jsonResponse(
                        {
                            success: false,
                            message:
                                profileDeleteError.message
                                || "Failed to delete FINOVA user profile."
                        },
                        500
                    );
                }
            }

            const {
                error: deleteAuthError
            } = await admin.auth.admin.deleteUser(userUid);

            if (deleteAuthError) {
                console.error(
                    "admin-user-management delete auth:",
                    deleteAuthError
                );

                /* Best-effort profile rollback. */
                if (targetProfile) {
                    const {
                        error: restoreError
                    } = await admin
                        .from("mst_users")
                        .upsert(
                            targetProfile,
                            {
                                onConflict: "user_uid"
                            }
                        );

                    if (restoreError) {
                        console.error(
                            "admin-user-management delete rollback:",
                            restoreError
                        );
                    }
                }

                return jsonResponse(
                    {
                        success: false,
                        message:
                            deleteAuthError.message
                            || "Failed to delete authentication user."
                    },
                    500
                );
            }

            return jsonResponse({
                success: true,
                message: "User deleted successfully."
            });
        }

        return jsonResponse(
            {
                success: false,
                message: "Unsupported User Management action."
            },
            400
        );
    }
    catch (error) {
        console.error(
            "admin-user-management unhandled error:",
            error
        );

        return jsonResponse(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal Edge Function error."
            },
            500
        );
    }
});
