/*
==========================================================
FINOVA ACCOUNTING SYSTEM
SUPABASE EDGE FUNCTION
FUNCTION : ADMIN USER MANAGEMENT
FILE     : index.ts
VERSION  : 4.0.0 MULTI COMPANY
==========================================================
*/

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";


/*
==========================================================
CORS
==========================================================
*/

const corsHeaders = {

    "Access-Control-Allow-Origin": "*",

    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",

    "Access-Control-Allow-Methods":
        "POST, OPTIONS"

};


/*
==========================================================
JSON RESPONSE
==========================================================
*/

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
                "Content-Type":
                    "application/json; charset=utf-8"
            }
        }

    );

}


/*
==========================================================
NORMALIZE ROLE
==========================================================
*/

function normalizeRole(
    value: unknown
): "Manager" | "Staff" | "" {
    // Accept casing differences from older clients, but always persist the
    // canonical values required by the database constraint. Never accept Admin.
    const role = String(value ?? "").trim().toLowerCase();
    if (role === "manager") return "Manager";
    if (role === "staff") return "Staff";
    return "";
}

function canAssignRole(
    actorRole: string,
    targetRole: string
): boolean {
    const actor = String(actorRole ?? "").trim().toLowerCase();
    const target = String(targetRole ?? "").trim().toLowerCase();
    return actor === "manager" && ["manager", "staff"].includes(target);
}

function canManageTargetRole(
    actorRole: string,
    targetRole: string
): boolean {
    const actor = String(actorRole ?? "").trim().toLowerCase();
    const target = String(targetRole ?? "").trim().toLowerCase();
    return actor === "manager" && ["manager", "staff"].includes(target);
}

/*
==========================================================
ACTIVE MANAGER SAFEGUARD
==========================================================
Prevent a company from losing its last active Manager through
role changes, deactivation, or deletion.
*/
async function countActiveCompanyManagers(
    adminClient: SupabaseClient,
    companyId: string
): Promise<{ count: number; error: unknown }> {
    const { data, error } = await adminClient
        .from("mst_users")
        .select("user_uid, role, status")
        .eq("company_id", companyId)
        .eq("status", true);

    if (error) return { count: 0, error };

    const count = (data ?? []).filter((row: { role?: unknown }) =>
        String(row.role ?? "").trim().toLowerCase() === "manager"
    ).length;

    return { count, error: null };
}


/*
==========================================================
EDGE FUNCTION
==========================================================
*/

Deno.serve(

async request => {


    /*
    ======================================================
    CORS PREFLIGHT
    ======================================================
    */

    if (
        request.method === "OPTIONS"
    ) {

        return new Response(
            "ok",
            {
                headers: corsHeaders
            }
        );

    }


    /*
    ======================================================
    METHOD VALIDATION
    ======================================================
    */

    if (
        request.method !== "POST"
    ) {

        return jsonResponse(
            {
                success: false,
                message:
                    "Method not allowed."
            },
            405
        );

    }


    try {


        /*
        ==================================================
        ENVIRONMENT
        ==================================================
        */

        const SUPABASE_URL =
            Deno.env.get(
                "SUPABASE_URL"
            )
            ??
            "";


        const SUPABASE_ANON_KEY =
            Deno.env.get(
                "SUPABASE_ANON_KEY"
            )
            ??
            "";


        const SUPABASE_SERVICE_ROLE_KEY =
            Deno.env.get(
                "SUPABASE_SERVICE_ROLE_KEY"
            )
            ??
            "";


        if (
            !SUPABASE_URL
            ||
            !SUPABASE_ANON_KEY
            ||
            !SUPABASE_SERVICE_ROLE_KEY
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


        /*
        ==================================================
        AUTHORIZATION HEADER
        ==================================================
        */

        const authorization =
            request.headers.get(
                "Authorization"
            )
            ??
            "";


        if (
            !authorization.startsWith(
                "Bearer "
            )
        ) {

            return jsonResponse(
                {
                    success: false,

                    message:
                        "Authentication token was not found."
                },
                401
            );

        }


        /*
        ==================================================
        REQUEST USER CLIENT

        Uses caller JWT to identify currently
        logged-in FINOVA user.
        ==================================================
        */

        const authClient =
            createClient(

                SUPABASE_URL,

                SUPABASE_ANON_KEY,

                {

                    global: {

                        headers: {

                            Authorization:
                                authorization

                        }

                    },

                    auth: {

                        persistSession:
                            false,

                        autoRefreshToken:
                            false

                    }

                }

            );


        /*
        ==================================================
        GET CURRENT AUTH USER
        ==================================================
        */

        const {

            data: authData,

            error: authError

        } =
            await authClient
                .auth
                .getUser();


        if (
            authError
            ||
            !authData?.user
        ) {

            console.error(
                "admin-user-management auth:",
                authError
            );


            return jsonResponse(
                {
                    success: false,

                    message:
                        "Authentication session is invalid."
                },
                401
            );

        }


        const currentUser =
            authData.user;


        /*
        ==================================================
        ADMIN CLIENT

        SERVICE ROLE EXISTS ONLY ON SERVER.
        NEVER EXPOSE THIS KEY TO BROWSER.
        ==================================================
        */

        const admin =
            createClient(

                SUPABASE_URL,

                SUPABASE_SERVICE_ROLE_KEY,

                {

                    auth: {

                        persistSession:
                            false,

                        autoRefreshToken:
                            false

                    }

                }

            );


        /*
        ==================================================
        SERVER SIDE USER MANAGEMENT AUTHORIZATION
        ==================================================

        ACCESS MODEL
        ------------
        MANAGER
        - Full User Management access in own company.
        - May create/update/reset/delete Manager and Staff users.

        STAFF
        - User Management is VIEW ONLY.

        LEGACY ROLES
        ------------
        Only Manager and Staff are valid tenant roles.
        Existing legacy role values must be migrated before deployment.

        IMPORTANT
        ----------
        Company is always resolved server-side from the
        authenticated user's active company membership.
        Never trust company_id from browser payloads.
        ==================================================
        */

        const {
            data: effectiveCompanyData,
            error: effectiveCompanyError
        } = await authClient.rpc(
            "finova_effective_company_id"
        );

        if (effectiveCompanyError) {
            console.error(
                "admin-user-management effective company:",
                effectiveCompanyError
            );

            return jsonResponse(
                {
                    success: false,
                    message:
                        "Failed to resolve FINOVA company context."
                },
                500
            );
        }

        const effectiveCompanyId =
            String(effectiveCompanyData ?? "").trim();

        if (!effectiveCompanyId) {
            return jsonResponse(
                {
                    success: false,
                    message:
                        "FINOVA company context was not found. Create or join a company first."
                },
                403
            );
        }

        const {
            data: currentProfile,
            error: profileError
        } = await admin
            .from("mst_users")
            .select(`
                user_uid,
                email,
                full_name,
                role,
                status,
                company_id
            `)
            .eq("user_uid", currentUser.id)
            .eq("company_id", effectiveCompanyId)
            .maybeSingle();

        if (profileError) {
            console.error(
                "admin-user-management current profile:",
                profileError
            );

            return jsonResponse(
                {
                    success: false,
                    message:
                        "Failed to validate User Management access."
                },
                500
            );
        }

        if (!currentProfile || currentProfile.status !== true) {
            return jsonResponse(
                {
                    success: false,
                    message:
                        "Only an active FINOVA user can open User Management."
                },
                403
            );
        }

        const profileRole = String(
            currentProfile.role ?? ""
        ).trim().toLowerCase();

        if (!["manager", "staff"].includes(profileRole)) {
            return jsonResponse(
                {
                    success: false,
                    message:
                        "User role is not permitted to access User Management."
                },
                403
            );
        }

        const {
            data: currentMembership,
            error: membershipError
        } = await admin
            .from("finova_company_users")
            .select(`
                company_id,
                user_uid,
                role,
                status
            `)
            .eq("company_id", effectiveCompanyId)
            .eq("user_uid", currentUser.id)
            .maybeSingle();

        if (membershipError) {
            console.error(
                "admin-user-management current membership:",
                membershipError
            );

            return jsonResponse(
                {
                    success: false,
                    message:
                        "Failed to validate company membership."
                },
                500
            );
        }

        const membershipRole = String(
            currentMembership?.role ?? ""
        ).trim().toLowerCase();

        const membershipIsActive =
            String(currentMembership?.status ?? "")
                .trim()
                .toUpperCase() === "ACTIVE";

        if (
            !currentMembership
            || !membershipIsActive
            || !["manager", "staff"].includes(membershipRole)
            || membershipRole !== profileRole
        ) {
            return jsonResponse(
                {
                    success: false,
                    message:
                        "An active company membership matching the FINOVA user role is required."
                },
                403
            );
        }

        const currentCompanyId = effectiveCompanyId;
        const isManager = profileRole === "manager";
        const canManageUserManagement = isManager;

        /*
        ==================================================
        REQUEST BODY
        ==================================================
        */

        let payload:
            Record<
                string,
                unknown
            >;


        try {

            payload =
                await request.json();

        }

        catch {

            return jsonResponse(
                {
                    success: false,

                    message:
                        "Invalid request body."
                },
                400
            );

        }


        /*
        ==================================================
        ACTION
        ==================================================
        */

        const action =
            String(
                payload?.action
                ??
                ""
            )
                .trim()
                .toLowerCase();


        /*
        ==================================================
        STAFF ACCESS
        ==================================================
        Staff may open User Management and view users,
        but all mutation actions require Manager access.
        ==================================================
        */

        if (
            action !== "list_users"
            &&
            !canManageUserManagement
        ) {

            return jsonResponse(
                {
                    success: false,
                    message:
                        "Staff has view-only access to User Management."
                },
                403
            );

        }


        /*
        ==================================================
        LIST USERS
        ==================================================
        */

        if (
            action === "list_users"
        ) {

            const {
                data: users,
                error: usersError
            } = await admin
                .from("mst_users")
                .select(`
                    user_uid,
                    email,
                    full_name,
                    role,
                    status,
                    company_id
                `)
                .eq(
                    "company_id",
                    currentCompanyId
                )
                .order(
                    "full_name",
                    { ascending: true }
                )
                .order(
                    "email",
                    { ascending: true }
                );


            if (
                usersError
            ) {

                console.error(
                    "admin-user-management list users:",
                    usersError
                );

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Failed to load User Management."
                    },
                    500
                );

            }


            return jsonResponse(
                {
                    success: true,
                    users: users ?? []
                }
            );

        }

        /*
        ==================================================
        CREATE USER
        ==================================================
        */

        if (
            action === "create"
        ) {


            /*
            ==============================================
            INPUT
            ==============================================
            */

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
                normalizeRole(
                    payload?.role
                );

            if (!role) {
                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Role must be Manager or Staff."
                    },
                    400
                );
            }

            if (!canAssignRole(profileRole, role)) {
                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Only Manager may assign Manager or Staff."
                    },
                    403
                );
            }


            const statusValue =
                payload?.status;


            if (
                typeof statusValue !==
                "boolean"
            ) {

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "User status must be boolean."
                    },
                    400
                );

            }


            const status =
                statusValue;


            /*
            ==============================================
            VALIDATION
            ==============================================
            */

            if (
                !fullName
            ) {

                return jsonResponse(
                    {
                        success: false,

                        message:
                            "Full Name is required."
                    },
                    400
                );

            }


            if (
                !email
            ) {

                return jsonResponse(
                    {
                        success: false,

                        message:
                            "Email is required."
                    },
                    400
                );

            }


            if (
                password.length < 8
            ) {

                return jsonResponse(
                    {
                        success: false,

                        message:
                            "Temporary Password must contain at least 8 characters."
                    },
                    400
                );

            }


            /*
            ==============================================
            CREATE SUPABASE AUTH USER
            ==============================================
            */

            const {

                data:
                    created,

                error:
                    createError

            } =
                await admin
                    .auth
                    .admin
                    .createUser(
                        {

                            email,

                            password,

                            /*
                            Email is immediately
                            confirmed because user
                            is created internally by
                            FINOVA Manager.
                            */

                            email_confirm:
                                true,

                            user_metadata: {

                                full_name:
                                    fullName,

                                role

                            }

                        }
                    );


            if (
                createError
                ||
                !created?.user
            ) {

                console.error(
                    "admin-user-management create auth:",
                    createError
                );


                return jsonResponse(
                    {
                        success: false,

                        message:
                            createError?.message
                            ||
                            "Failed to create authentication user."
                    },
                    400
                );

            }


            const createdUser =
                created.user;


            /*
            ==============================================
            CREATE FINOVA PROFILE
            ==============================================
            */

            const {

                data:
                    profile,

                error:
                    insertError

            } =
                await admin

                    .from(
                        "mst_users"
                    )

                    .insert(
    {

        user_uid:
            createdUser.id,

        full_name:
            fullName,

        email,

        role,

        status,

        company_id:
            currentCompanyId

    }
)

                    .select()

                    .single();

            
            /*
            ==============================================
            PROFILE INSERT FAILED

            Delete Auth user again so Auth and
            mst_users do not become inconsistent.
            ==============================================
            */

            if (
                insertError
            ) {

                console.error(
                    "admin-user-management insert profile:",
                    insertError
                );


                const {

                    error:
                        rollbackError

                } =
                    await admin
                        .auth
                        .admin
                        .deleteUser(
                            createdUser.id
                        );


                if (
                    rollbackError
                ) {

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
                            ||
                            "Failed to create FINOVA user profile."
                    },
                    500
                );

            }

            /*
==============================================
SYNC COMPANY MEMBERSHIP
==============================================
*/

const {
    error:
        membershipInsertError

} =
    await admin

        .from(
            "finova_company_users"
        )

        .upsert(
            {
                company_id:
                    currentCompanyId,

                user_uid:
                    createdUser.id,

                role:
                    role,

                status:
                    status
                        ? "ACTIVE"
                        : "INACTIVE"
            },
            {
                onConflict:
                    "company_id,user_uid"
            }
        );
        if (
    membershipInsertError
) {

    console.error(
        "admin-user-management membership insert:",
        membershipInsertError
    );


    await admin
        .from(
            "mst_users"
        )
        .delete()
        .eq(
            "user_uid",
            createdUser.id
        );


    await admin
        .auth
        .admin
        .deleteUser(
            createdUser.id
        );


    return jsonResponse(
        {
            success: false,

            message:
                "Failed to create company membership."
        },
        500
    );

}
            /*
            ==============================================
            SUCCESS
            ==============================================
            */

            return jsonResponse(
                {

                    success: true,

                    message:
                        "User created successfully.",

                    user:
                        profile

                }
            );

        }

/*
==========================================================
UPDATE USER PROFILE
==========================================================
*/

if (
    action === "update_profile"
) {

    /*
    ======================================================
    INPUT
    ======================================================
    */

    const userUid =
        String(
            payload?.user_uid ??
            ""
        )
            .trim();


    const fullName =
        String(
            payload?.full_name ??
            ""
        )
            .trim();


    const role =
        normalizeRole(
            payload?.role
        );

    if (!role) {
        return jsonResponse(
            {
                success: false,
                message:
                    "Role must be Manager or Staff."
            },
            400
        );
    }

    if (!canAssignRole(profileRole, role)) {
        return jsonResponse(
            {
                success: false,
                message:
                    "Only Manager may assign Manager or Staff."
            },
            403
        );
    }


    const statusValue =
        payload?.status;


    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (
        !userUid
    ) {

        return jsonResponse(
            {
                success: false,

                message:
                    "User UID is required."
            },
            400
        );

    }


    if (
        !fullName
    ) {

        return jsonResponse(
            {
                success: false,

                message:
                    "Full Name is required."
            },
            400
        );

    }


    if (
        typeof statusValue !==
        "boolean"
    ) {

        return jsonResponse(
            {
                success: false,

                message:
                    "User status must be boolean."
            },
            400
        );

    }


    const status =
        statusValue;


    /*
    ======================================================
    SELF UPDATE
    ======================================================

    Manager is allowed to edit their own profile.
    ======================================================
    */

    /*
    ======================================================
    GET TARGET PROFILE
    ======================================================
    */

    const {
        data:
            updateTargetProfile,

        error:
            updateTargetError

    } =
        await admin

            .from(
                "mst_users"
            )

            .select(
                `
                user_uid,
                email,
                full_name,
                role,
                status,
                company_id
                `
            )

            .eq(
                "user_uid",
                userUid
            )

            .eq(
                "company_id",
                currentCompanyId
            )

            .maybeSingle();


    if (
        updateTargetError
    ) {

        console.error(
            "admin-user-management update target:",
            updateTargetError
        );


        return jsonResponse(
            {
                success: false,

                message:
                    "Failed to read target user."
            },
            500
        );

    }


    if (
        !updateTargetProfile
    ) {

        return jsonResponse(
            {
                success: false,

                message:
                    "FINOVA user profile was not found in your company."
            },
            404
        );

    }


    /*
    ======================================================
    TARGET AUTHORITY
    ======================================================

    The actor must be allowed to manage the target's
    EXISTING role, not only the new role being submitted.
    This prevents changes to unsupported or legacy role values.
    ======================================================
    */

    if (
        !canManageTargetRole(
            profileRole,
            updateTargetProfile.role
        )
    ) {
        return jsonResponse(
            {
                success: false,
                message:
                    "Only Manager may manage users with Manager or Staff roles."
            },
            403
        );
    }


    if (
        userUid === currentUser.id
        && role !== profileRole
    ) {
        return jsonResponse(
            {
                success: false,
                message:
                    "You cannot change your own FINOVA role."
            },
            400
        );
    }


    if (
        userUid === currentUser.id
        && status === false
    ) {
        return jsonResponse(
            {
                success: false,
                message:
                    "You cannot deactivate your own FINOVA account."
            },
            400
        );
    }

    const targetIsActiveManager =
        String(updateTargetProfile.role ?? "").trim().toLowerCase() === "manager"
        && updateTargetProfile.status === true;

    const targetWouldStopBeingActiveManager =
        targetIsActiveManager
        && (role.toLowerCase() !== "manager" || status === false);

    if (targetWouldStopBeingActiveManager) {
        const managerCountResult = await countActiveCompanyManagers(
            admin,
            currentCompanyId
        );

        if (managerCountResult.error) {
            console.error(
                "admin-user-management active Manager count:",
                managerCountResult.error
            );
            return jsonResponse(
                {
                    success: false,
                    message: "Failed to validate active Manager safeguards."
                },
                500
            );
        }

        if (managerCountResult.count <= 1) {
            return jsonResponse(
                {
                    success: false,
                    message: "The last active Manager cannot be demoted or deactivated. Assign another active Manager first."
                },
                409
            );
        }
    }

    /*
    ======================================================
    UPDATE MST_USERS
    ======================================================
    */

    const {
        data:
            updatedProfile,

        error:
            updateProfileError

    } =
        await admin

            .from(
                "mst_users"
            )

            .update(
                {
                    full_name:
                        fullName,

                    role,

                    status
                }
            )

            .eq(
                "user_uid",
                userUid
            )

            .eq(
                "company_id",
                currentCompanyId
            )

            .select()
            .single();


    if (
        updateProfileError
    ) {

        console.error(
            "admin-user-management update profile:",
            updateProfileError
        );


        return jsonResponse(
            {
                success: false,

                message:
                    updateProfileError.message
                    ||
                    "Failed to update FINOVA user profile."
            },
            500
        );

    }


    /*
    ======================================================
    SYNC COMPANY MEMBERSHIP
    ======================================================
    */

    const {
        error:
            membershipUpdateError

    } =
        await admin

            .from(
                "finova_company_users"
            )

            .upsert(
                {
                    company_id:
                        currentCompanyId,

                    user_uid:
                        userUid,

                    role:
                        role,

                    status:
                        status
                            ? "ACTIVE"
                            : "INACTIVE"
                },
                {
                    onConflict:
                        "company_id,user_uid"
                }
            );


    if (
        membershipUpdateError
    ) {

        console.error(
            "admin-user-management update membership:",
            membershipUpdateError
        );


        /*
        ==================================================
        ROLLBACK MST_USERS
        ==================================================
        */

        const {
            error:
                profileRollbackError

        } =
            await admin

                .from(
                    "mst_users"
                )

                .update(
                    {
                        full_name:
                            updateTargetProfile.full_name,

                        role:
                            updateTargetProfile.role,

                        status:
                            updateTargetProfile.status
                    }
                )

                .eq(
                    "user_uid",
                    userUid
                )

                .eq(
                    "company_id",
                    currentCompanyId
                );


        if (
            profileRollbackError
        ) {

            console.error(
                "admin-user-management profile rollback:",
                profileRollbackError
            );

        }


        return jsonResponse(
            {
                success: false,

                message:
                    membershipUpdateError.message
                    ||
                    "Failed to update company membership."
            },
            500
        );

    }


    /*
    ======================================================
    SUCCESS
    ======================================================
    */

    return jsonResponse(
        {
            success: true,

            message:
                "User profile updated successfully.",

            user:
                updatedProfile
        }
    );

}
        /*
        ==================================================
        RESET USER PASSWORD
        ==================================================
        */

        if (
            action ===
            "reset_password"
        ) {


            /*
            ==============================================
            INPUT
            ==============================================
            */

            const userUid =
                String(
                    payload?.user_uid
                    ??
                    ""
                )
                    .trim();


            const newPassword =
                String(
                    payload?.password
                    ??
                    ""
                );


            /*
            ==============================================
            VALIDATION
            ==============================================
            */

            if (
                !userUid
            ) {

                return jsonResponse(
                    {
                        success: false,

                        message:
                            "User UID is required."
                    },
                    400
                );

            }


            if (
                newPassword.length
                <
                8
            ) {

                return jsonResponse(
                    {
                        success: false,

                        message:
                            "New Password must contain at least 8 characters."
                    },
                    400
                );

            }


            /*
            ==============================================
            CHECK TARGET PROFILE
            ==============================================
            */

            const {

                data:
                    resetTargetProfile,

                error:
                    resetTargetError

            } =
                await admin

                    .from(
                        "mst_users"
                    )

                    .select(
    `
        user_uid,
        email,
        full_name,
        role,
        status,
        company_id
    `
)

                    .eq(
                        "user_uid",
                        userUid
                    )
                    .eq(
                        "company_id",
                        currentCompanyId
                    )

                    .maybeSingle();


            if (
                resetTargetError
            ) {

                console.error(
                    "admin-user-management reset target:",
                    resetTargetError
                );


                return jsonResponse(
                    {
                        success: false,

                        message:
                            "Failed to read target user."
                    },
                    500
                );

            }


            if (
                !resetTargetProfile
            ) {

                return jsonResponse(
                    {
                        success: false,

                        message:
                            "FINOVA user profile was not found."
                    },
                    404
                );

            }


            /*
            ==============================================
            TARGET AUTHORITY
            ==============================================
            */

            if (
                !canManageTargetRole(
                    profileRole,
                    resetTargetProfile.role
                )
            ) {
                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Only Manager may reset passwords for Manager or Staff users."
                    },
                    403
                );
            }
            
            /*
==============================================
TENANT VALIDATION
RESET PASSWORD
==============================================
*/

const resetTargetCompanyId =
    String(
        resetTargetProfile.company_id
        ??
        ""
    )
        .trim();


if (
    resetTargetCompanyId !==
    currentCompanyId
) {

    return jsonResponse(
        {
            success: false,

            message:
                "You cannot reset a user from another company."
        },
        403
    );

}


            /*
            ==============================================
            UPDATE SUPABASE AUTH PASSWORD
            ==============================================
            */

            const {

                data:
                    updatedUser,

                error:
                    updatePasswordError

            } =
                await admin
                    .auth
                    .admin
                    .updateUserById(

                        userUid,

                        {

                            password:
                                newPassword

                        }

                    );


            if (
                updatePasswordError
                ||
                !updatedUser?.user
            ) {

                console.error(
                    "admin-user-management reset password:",
                    updatePasswordError
                );


                return jsonResponse(
                    {
                        success: false,

                        message:
                            updatePasswordError?.message
                            ||
                            "Failed to reset user password."
                    },
                    400
                );

            }


            /*
            ==============================================
            SUCCESS
            ==============================================
            */

            return jsonResponse(
                {

                    success:
                        true,

                    message:
                        "User password updated successfully.",

                    user: {

                        user_uid:
                            resetTargetProfile.user_uid,

                        email:
                            resetTargetProfile.email,

                        full_name:
                            resetTargetProfile.full_name

                    }

                }
            );

        }


        
        /*
         * ==================================================
         * DELETE USER
         * GLOBAL ACCOUNT DELETION
         * ==================================================
         *
         * Deletes the target Auth account globally.
         *
         * Database relationships:
         * - finova_company_users.user_uid -> auth.users.id
         *   ON DELETE CASCADE
         * - mst_users.user_uid -> auth.users.id
         *   ON DELETE CASCADE
         *
         * The database will automatically remove the
         * linked profile and all company memberships.
         * ==================================================
         */

        if (action === "delete") {

            /*
             * ==============================================
             * INPUT
             * ==============================================
             */

            const userUid = String(
                payload?.user_uid ?? ""
            ).trim();

            /*
             * ==============================================
             * VALIDATION
             * ==============================================
             */

            if (!userUid) {
                return jsonResponse(
                    {
                        success: false,
                        message: "User UID is required."
                    },
                    400
                );
            }

            /*
             * ==============================================
             * PREVENT SELF DELETION
             * ==============================================
             */

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

            /*
             * ==============================================
             * GET TARGET PROFILE
             * ==============================================
             *
             * The target must belong to the current company
             * before a tenant Manager can delete the account.
             *
             * The target must belong to the current company.
             * ==============================================
             */

            const {
                data: targetProfile,
                error: targetProfileError
            } = await admin
                .from("mst_users")
                .select(`
                    user_uid,
                    email,
                    full_name,
                    role,
                    status,
                    company_id
                `)
                .eq("user_uid", userUid)
                .eq("company_id", currentCompanyId)
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
             * ==============================================
             * TARGET USER EXISTS
             * ==============================================
             */

            if (!targetProfile) {
                return jsonResponse(
                    {
                        success: false,
                        message:
                            "FINOVA user profile was not found in your company."
                    },
                    404
                );
            }

            /*
             * ==============================================
             * TARGET AUTHORITY
             * ==============================================
             */

            if (
                !canManageTargetRole(
                    profileRole,
                    targetProfile.role
                )
            ) {
                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Only Manager may delete users with Manager or Staff roles."
                    },
                    403
                );
            }

            if (
                String(targetProfile.role ?? "").trim().toLowerCase() === "manager"
                && targetProfile.status === true
            ) {
                const managerCountResult = await countActiveCompanyManagers(
                    admin,
                    currentCompanyId
                );

                if (managerCountResult.error) {
                    console.error(
                        "admin-user-management active Manager count before delete:",
                        managerCountResult.error
                    );
                    return jsonResponse(
                        {
                            success: false,
                            message: "Failed to validate active Manager safeguards."
                        },
                        500
                    );
                }

                if (managerCountResult.count <= 1) {
                    return jsonResponse(
                        {
                            success: false,
                            message: "The last active Manager cannot be deleted. Assign another active Manager first."
                        },
                        409
                    );
                }
            }

            /*
             * ==============================================
             * PROTECT MULTI-COMPANY AUTH ACCOUNTS
             * ==============================================
             *
             * auth.users is global. Do not hard-delete an
             * account that has memberships in other companies.
             * ==============================================
             */

            const {
                data: targetMemberships,
                error: targetMembershipsError
            } = await admin
                .from("finova_company_users")
                .select("company_id")
                .eq("user_uid", userUid);

            if (targetMembershipsError) {
                console.error(
                    "admin-user-management target memberships:",
                    targetMembershipsError
                );

                return jsonResponse(
                    {
                        success: false,
                        message:
                            "Failed to validate target company memberships."
                    },
                    500
                );
            }

            if ((targetMemberships ?? []).length > 1) {
                return jsonResponse(
                    {
                        success: false,
                        message:
                            "This user belongs to multiple companies and cannot be permanently deleted from User Management."
                    },
                    409
                );
            }

            /*
             * ==============================================
             * DELETE AUTH ACCOUNT
             * ==============================================
             *
             * Safe only when this is the user's sole company
             * membership. ON DELETE CASCADE removes the linked
             * FINOVA profile and membership.
             * ==============================================
             */

            const {
                error: deleteAuthError
            } = await admin
                .auth
                .admin
                .deleteUser(userUid);

            if (deleteAuthError) {
                console.error(
                    "admin-user-management delete auth:",
                    deleteAuthError
                );

                return jsonResponse(
                    {
                        success: false,
                        message:
                            deleteAuthError.message ||
                            "Failed to delete authentication user."
                    },
                    500
                );
            }

            /*
             * ==============================================
             * SUCCESS
             * ==============================================
             */

            return jsonResponse(
                {
                    success: true,
                    message:
                        "User account and company memberships deleted successfully."
                }
            );
        }
    

        /*
        ==================================================
        UNSUPPORTED ACTION
        ==================================================
        */

        return jsonResponse(
            {

                success:
                    false,

                message:
                    `Unsupported User Management action: ${action || "(empty)"}.`

            },
            400
        );


    }

    catch (
        error
    ) {


        /*
        ==================================================
        UNHANDLED ERROR
        ==================================================
        */

        console.error(
            "admin-user-management unhandled error:",
            error
        );


        return jsonResponse(
            {

                success:
                    false,

                message:

                    error
                    instanceof
                    Error

                        ?
                        error.message

                        :
                        "Internal Edge Function error."

            },
            500
        );

    }

});
