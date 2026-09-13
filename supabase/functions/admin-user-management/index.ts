/*
==========================================================
FINOVA ACCOUNTING SYSTEM
SUPABASE EDGE FUNCTION
FUNCTION : ADMIN USER MANAGEMENT
FILE     : index.ts
VERSION  : 4.0.0 MULTI COMPANY
==========================================================
*/

import {
    createClient
} from "npm:@supabase/supabase-js@2";


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
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase()
        === "manager"

        ? "Manager"
        : "Staff";

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
        SERVER SIDE MANAGER AUTHORIZATION
        ==================================================
        */

        const {

            data:
                currentProfile,

            error:
                profileError

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
                    currentUser.id
                )

                .maybeSingle();


        if (
            profileError
        ) {

            console.error(
                "admin-user-management current profile:",
                profileError
            );


            return jsonResponse(
                {
                    success: false,

                    message:
                        "Failed to validate Manager access."
                },
                500
            );

        }


        const isManager =
            String(
                currentProfile?.role
                ??
                ""
            )
                .trim()
                .toLowerCase()
            ===
            "manager";


        const isActive =
            currentProfile?.status
            ===
            true;


        if (
            !currentProfile
            ||
            !isManager
            ||
            !isActive
        ) {

            return jsonResponse(
                {
                    success: false,

                    message:
                        "Only an active Manager can modify User Management."
                },
                403
            );

        }
        /*
==================================================
CURRENT COMPANY
==================================================
*/

const currentCompanyId =
    String(
        currentProfile.company_id
        ??
        ""
    )
        .trim();


if (
    !currentCompanyId
) {

    return jsonResponse(
        {
            success: false,

            message:
                "Manager is not assigned to a company."
        },
        403
    );

}
/*
==================================================
VALIDATE CURRENT COMPANY MEMBERSHIP
==================================================
*/

const {
    data:
        currentMembership,

    error:
        currentMembershipError

} =
    await admin

        .from(
            "finova_company_users"
        )

        .select(
            `
            company_id,
            user_uid,
            role,
            status
            `
        )

        .eq(
            "company_id",
            currentCompanyId
        )

        .eq(
            "user_uid",
            currentUser.id
        )

        .maybeSingle();


if (
    currentMembershipError
) {

    console.error(
        "admin-user-management current membership:",
        currentMembershipError
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


const membershipIsManager =
    String(
        currentMembership?.role
        ??
        ""
    )
        .trim()
        .toUpperCase()
    ===
    "MANAGER";


const membershipIsActive =
    String(
        currentMembership?.status
        ??
        ""
    )
        .trim()
        .toUpperCase()
    ===
    "ACTIVE";


if (
    !currentMembership
    ||
    !membershipIsManager
    ||
    !membershipIsActive
) {

    return jsonResponse(
        {
            success: false,

            message:
                "Active Manager company membership is required."
        },
        403
    );

}


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


            const status =
                Boolean(
                    payload?.status
                );


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
                    String(
                        role
                    )
                        .trim()
                        .toUpperCase(),

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
            payload?.user_uid
            ??
            ""
        )
            .trim();


    const fullName =
        String(
            payload?.full_name
            ??
            ""
        )
            .trim();


    const role =
        normalizeRole(
            payload?.role
        );


    const status =
        Boolean(
            payload?.status
        );


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
                    "FINOVA user profile was not found."
            },
            404
        );

    }


    /*
    ======================================================
    TENANT VALIDATION
    ======================================================
    */

    const updateTargetCompanyId =
        String(
            updateTargetProfile.company_id
            ??
            ""
        )
            .trim();


    if (
        updateTargetCompanyId !==
        currentCompanyId
    ) {

        return jsonResponse(
            {
                success: false,

                message:
                    "You cannot update a user from another company."
            },
            403
        );

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
                        String(
                            role
                        )
                            .trim()
                            .toUpperCase(),

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
    ======================================================
    ROLLBACK MST_USERS
    ======================================================
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
            "admin-user-management update profile rollback:",
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
        ==================================================
        DELETE USER
        ==================================================
        */

        if (
            action ===
            "delete"
        ) {


            /*
            ==============================================
            USER UID
            ==============================================
            */

            const userUid =
                String(
                    payload?.user_uid
                    ??
                    ""
                )
                    .trim();


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


            /*
            ==============================================
            CURRENT USER CANNOT DELETE SELF
            ==============================================
            */

            if (
                userUid
                ===
                currentUser.id
            ) {

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
            ==============================================
            GET TARGET PROFILE
            ==============================================
            */

            const {

                data:
                    targetProfile,

                error:
                    targetProfileError

            } =
                await admin

                    .from(
                        "mst_users"
                    )

                    .select(
                        "*"
                    )

                    .eq(
                        "user_uid",
                        userUid
                    )

                    .maybeSingle();


            if (
                targetProfileError
            ) {

                console.error(
                    "admin-user-management target profile:",
                    targetProfileError
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
            /*
==============================================
TARGET USER EXISTS
==============================================
*/

if (
    !targetProfile
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
TENANT VALIDATION
DELETE USER
==============================================
*/

const targetCompanyId =
    String(
        targetProfile.company_id
        ??
        ""
    )
        .trim();


if (
    targetCompanyId !==
    currentCompanyId
) {

    return jsonResponse(
        {
            success: false,

            message:
                "You cannot delete a user from another company."
        },
        403
    );

}
            /*
==============================================
GET COMPANY MEMBERSHIP
FOR ROLLBACK
==============================================
*/

const {
    data:
        targetMembership,

    error:
        membershipReadError

} =
    await admin

        .from(
            "finova_company_users"
        )

        .select(
            "*"
        )

        .eq(
            "company_id",
            currentCompanyId
        )

        .eq(
            "user_uid",
            userUid
        )

        .maybeSingle();


if (
    membershipReadError
) {

    return jsonResponse(
        {
            success: false,

            message:
                "Failed to read company membership."
        },
        500
    );

}
/*
==============================================
DELETE COMPANY MEMBERSHIP
==============================================
*/

const {
    error:
        membershipDeleteError

} =
    await admin

        .from(
            "finova_company_users"
        )

        .delete()

        .eq(
            "company_id",
            currentCompanyId
        )

        .eq(
            "user_uid",
            userUid
        );


if (
    membershipDeleteError
) {

    console.error(
        "admin-user-management delete membership:",
        membershipDeleteError
    );


    return jsonResponse(
        {
            success: false,

            message:
                membershipDeleteError.message
                ||
                "Failed to delete company membership."
        },
        500
    );

}
            /*
            ==============================================
            DELETE APPLICATION PROFILE FIRST

            If Auth deletion fails we attempt
            to restore mst_users profile.
            ==============================================
            */

            if (
                targetProfile
            ) {

                const {

                    error:
                        profileDeleteError

                } =
                    await admin

                        .from(
                            "mst_users"
                        )

                        .delete()

                        .eq(
                            "user_uid",
                            userUid
                        );


                if (
    profileDeleteError
) {

    console.error(
        "admin-user-management delete profile:",
        profileDeleteError
    );


    /*
    ======================================================
    RESTORE COMPANY MEMBERSHIP
    ======================================================
    */

    if (
        targetMembership
    ) {

        const {
            error:
                membershipRollbackError

        } =
            await admin

                .from(
                    "finova_company_users"
                )

                .upsert(
                    targetMembership,
                    {
                        onConflict:
                            "company_id,user_uid"
                    }
                );


        if (
            membershipRollbackError
        ) {

            console.error(
                "admin-user-management profile delete membership rollback:",
                membershipRollbackError
            );

        }

    }


    return jsonResponse(
        {
            success: false,

            message:
                profileDeleteError.message
                ||
                "Failed to delete FINOVA user profile."
        },
        500
    );

}


            /*
            ==============================================
            DELETE SUPABASE AUTH USER
            ==============================================
            */

            const {

                error:
                    deleteAuthError

            } =
                await admin
                    .auth
                    .admin
                    .deleteUser(
                        userUid
                    );


            /*
            ==============================================
            AUTH DELETE FAILED
            RESTORE PROFILE
            ==============================================
            */

            if (
                deleteAuthError
            ) {

                console.error(
                    "admin-user-management delete auth:",
                    deleteAuthError
                );


                if (
                    targetProfile
                ) {

                    const {

                        error:
                            restoreError

                    } =
                        await admin

                            .from(
                                "mst_users"
                            )

                            .upsert(

                                targetProfile,

                                {

                                    onConflict:
                                        "user_uid"

                                }

                            );


                    if (
                        restoreError
                    ) {

                        console.error(
                            "admin-user-management delete rollback:",
                            restoreError
                        );

                    }

                }

                    /*
==============================================
RESTORE COMPANY MEMBERSHIP
==============================================
*/

if (
    targetMembership
) {

    const {
        error:
            membershipRestoreError

    } =
        await admin

            .from(
                "finova_company_users"
            )

            .upsert(
                targetMembership,
                {
                    onConflict:
                        "company_id,user_uid"
                }
            );


    if (
        membershipRestoreError
    ) {

        console.error(
            "admin-user-management membership rollback:",
            membershipRestoreError
        );

    }

}


return jsonResponse(
    {
        success: false,

        message:
            deleteAuthError.message
            ||
            "Failed to delete authentication user."
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

                    success:
                        true,

                    message:
                        "User deleted successfully."

                }
            );

        }
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
                    "Unsupported User Management action."

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
