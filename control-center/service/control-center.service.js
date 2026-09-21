/*
==========================================================
FINOVA ACCOUNTING SYSTEM
FINOVA CONTROL CENTER SERVICE

Version : 3.1 FINAL
==========================================================
*/


/*
==========================================================
IMPORT
==========================================================
*/

import {
    supabase
} from "../../assets/js/core/supabase.js";


/*
==========================================================
CONTROL CENTER SERVICE
==========================================================
*/

export class ControlCenterService {


    /*
    ======================================================
    GET CURRENT AUTH USER
    ======================================================
    */

    static async getCurrentUser() {

        const {
            data,
            error
        } =
            await supabase
                .auth
                .getUser();


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.getCurrentUser:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return (
            data?.user
            ??
            null
        );

    }


    /*
    ======================================================
    REQUIRE FINOVA SUPER ADMIN
    ======================================================
    */

    static async requireSuperAdmin() {

        /*
        ==================================================
        AUTH USER
        ==================================================
        */

        const user =
            await this
                .getCurrentUser();


        if (
            !user
        ) {

            throw new Error(
                "AUTH_REQUIRED"
            );

        }


        /*
        ==================================================
        CHECK SUPER ADMIN
        ==================================================
        */

        const {
            data,
            error
        } =
            await supabase

                .from(
                    "finova_super_admins"
                )

                .select(`
                    user_uid,
                    full_name,
                    is_active
                `)

                .eq(
                    "user_uid",
                    user.id
                )

                .eq(
                    "is_active",
                    true
                )

                .maybeSingle();


        /*
        ==================================================
        DATABASE ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.requireSuperAdmin:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        ACCESS DENIED
        ==================================================
        */

        if (
            !data
        ) {

            throw new Error(
                "SUPER_ADMIN_REQUIRED"
            );

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return {

            user,

            admin:
                data

        };

    }


    /*
    ======================================================
    GET COMPANIES
    ======================================================
    */

    static async getCompanies() {

        const {
            data,
            error
        } =
            await supabase

                .from(
                    "finova_companies"
                )

                .select(
                    "*"
                )

                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                );


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.getCompanies:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return (
            data
            ??
            []
        );

    }


    /*
    ======================================================
    CREATE COMPANY
    ======================================================
    */

    static async createCompany(
        values
    ) {

        /*
        ==================================================
        PAYLOAD
        ==================================================
        */

        const payload = {

            company_code:
                String(
                    values?.company_code
                    ||
                    ""
                )
                    .trim()
                    .toUpperCase(),

            company_name:
                String(
                    values?.company_name
                    ||
                    ""
                )
                    .trim(),

            legal_name:
                String(
                    values?.legal_name
                    ||
                    ""
                )
                    .trim()
                ||
                null,

            email:
                String(
                    values?.email
                    ||
                    ""
                )
                    .trim()
                    .toLowerCase()
                ||
                null,

            phone:
                String(
                    values?.phone
                    ||
                    ""
                )
                    .trim()
                ||
                null,

            max_users:
                Number(
                    values?.max_users
                    ||
                    5
                ),

            status:
                String(
                    values?.status
                    ||
                    "ACTIVE"
                )
                    .trim()
                    .toUpperCase()

        };


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !payload.company_code
        ) {

            throw new Error(
                "Company Code wajib diisi."
            );

        }


        if (
            !payload.company_name
        ) {

            throw new Error(
                "Company Name wajib diisi."
            );

        }


        if (
            !Number.isFinite(
                payload.max_users
            )
            ||
            payload.max_users < 1
        ) {

            throw new Error(
                "Maximum Users harus minimal 1."
            );

        }


        /*
        ==================================================
        INSERT
        ==================================================
        */

        const {
            data,
            error
        } =
            await supabase

                .from(
                    "finova_companies"
                )

                .insert(
                    payload
                )

                .select()

                .single();


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.createCompany:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return data;

    }


    /*
    ======================================================
    SET COMPANY STATUS
    ======================================================
    */

    static async setCompanyStatus(
        companyId,
        status
    ) {

        /*
        ==================================================
        NORMALIZE
        ==================================================
        */

        const normalizedCompanyId =
            String(
                companyId
                ||
                ""
            ).trim();


        const normalizedStatus =
            String(
                status
                ||
                ""
            )
                .trim()
                .toUpperCase();


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !normalizedCompanyId
        ) {

            throw new Error(
                "Company ID tidak valid."
            );

        }


        if (
            !normalizedStatus
        ) {

            throw new Error(
                "Status company tidak valid."
            );

        }


        /*
        ==================================================
        UPDATE
        ==================================================
        */

        const {
            data,
            error
        } =
            await supabase

                .from(
                    "finova_companies"
                )

                .update({

                    status:
                        normalizedStatus

                })

                .eq(
                    "id",
                    normalizedCompanyId
                )

                .select()

                .single();


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.setCompanyStatus:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return data;

    }


    /*
    ======================================================
    BAGIAN 2/4 DITEMPEL DI BAWAH INI
    ======================================================
    */
       /*
    ======================================================
    GET PLANS
    ======================================================
    */

    static async getPlans() {

        const {
            data,
            error
        } =
            await supabase

                .from(
                    "finova_plans"
                )

                .select(
                    "*"
                )

                .eq(
                    "is_active",
                    true
                )

                .order(
                    "price",
                    {
                        ascending:
                            true
                    }
                );


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.getPlans:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return (
            data
            ??
            []
        );

    }


    /*
    ======================================================
    GET SUBSCRIPTIONS
    ======================================================
    */

    static async getSubscriptions() {

        const {
            data,
            error
        } =
            await supabase

                .from(
                    "finova_subscriptions"
                )

                .select(`
                    id,
                    company_id,
                    plan_id,
                    start_date,
                    end_date,
                    amount,
                    payment_status,
                    status,
                    notes,
                    created_at,
                    finova_companies(
                        company_code,
                        company_name
                    ),
                    finova_plans(
                        plan_code,
                        plan_name,
                        billing_cycle
                    )
                `)

                .order(
                    "end_date",
                    {
                        ascending:
                            true
                    }
                );


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.getSubscriptions:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return (
            data
            ??
            []
        );

    }


    /*
    ======================================================
    CREATE SUBSCRIPTION
    ======================================================
    */

    static async createSubscription(
        values
    ) {

        /*
        ==================================================
        NORMALIZE PAYLOAD
        ==================================================
        */

        const companyId =
            String(
                values?.company_id
                ||
                ""
            ).trim();


        const planId =
            String(
                values?.plan_id
                ||
                ""
            ).trim();


        const startDate =
            String(
                values?.start_date
                ||
                ""
            ).trim();


        const endDate =
            String(
                values?.end_date
                ||
                ""
            ).trim();


        const amount =
            Number(
                values?.amount
                ||
                0
            );


        const paymentStatus =
            String(
                values?.payment_status
                ||
                "PAID"
            )
                .trim()
                .toUpperCase();


        const notes =
            String(
                values?.notes
                ||
                ""
            ).trim();


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !companyId
        ) {

            throw new Error(
                "Company wajib dipilih."
            );

        }


        if (
            !planId
        ) {

            throw new Error(
                "Plan wajib dipilih."
            );

        }


        if (
            !startDate
        ) {

            throw new Error(
                "Start Date wajib diisi."
            );

        }


        if (
            !endDate
        ) {

            throw new Error(
                "End Date wajib diisi."
            );

        }


        if (
            !Number.isFinite(
                amount
            )
            ||
            amount < 0
        ) {

            throw new Error(
                "Amount subscription tidak valid."
            );

        }


        /*
        ==================================================
        VALIDATE DATE RANGE
        ==================================================
        */

        const start =
            new Date(
                `${startDate}T00:00:00`
            );


        const end =
            new Date(
                `${endDate}T00:00:00`
            );


        if (
            Number.isNaN(
                start.getTime()
            )
            ||
            Number.isNaN(
                end.getTime()
            )
        ) {

            throw new Error(
                "Periode subscription tidak valid."
            );

        }


        if (
            end < start
        ) {

            throw new Error(
                "End Date tidak boleh lebih kecil dari Start Date."
            );

        }


        /*
        ==================================================
        PAYLOAD
        ==================================================
        */

        const payload = {

            company_id:
                companyId,

            plan_id:
                planId,

            start_date:
                startDate,

            end_date:
                endDate,

            amount,

            payment_status:
                paymentStatus,

            status:
                "ACTIVE",

            notes:
                notes
                ||
                null

        };


        /*
        ==================================================
        INSERT SUBSCRIPTION
        ==================================================
        */

        const {
            data,
            error
        } =
            await supabase

                .from(
                    "finova_subscriptions"
                )

                .insert(
                    payload
                )

                .select()

                .single();


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.createSubscription:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return data;

    }


    /*
    ======================================================
    BAGIAN 3/4 DITEMPEL DI BAWAH INI
    ======================================================
    */
       /*
    ======================================================
    LIST USERS
    ======================================================
    */

    static async listUsers() {

        const {
            data,
            error
        } =
            await supabase

                .rpc(
                    "finova_admin_list_users"
                );


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.listUsers:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return (
            data
            ??
            []
        );

    }


    /*
    ======================================================
    ASSIGN USER TO COMPANY
    ======================================================
    */

    static async assignUser(
        email,
        companyId,
        role
    ) {

        /*
        ==================================================
        NORMALIZE
        ==================================================
        */

        const normalizedEmail =
            String(
                email
                ||
                ""
            )
                .trim()
                .toLowerCase();


        const normalizedCompanyId =
            String(
                companyId
                ||
                ""
            ).trim();


        const normalizedRole =
            String(
                role
                ||
                "STAFF"
            )
                .trim()
                .toUpperCase();


        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !normalizedEmail
        ) {

            throw new Error(
                "Email user wajib diisi."
            );

        }


        if (
            !normalizedCompanyId
        ) {

            throw new Error(
                "Company wajib dipilih."
            );

        }


        if (
            ![
                "MANAGER",
                "STAFF"
            ].includes(
                normalizedRole
            )
        ) {

            throw new Error(
                "Role user tidak valid."
            );

        }


        /*
        ==================================================
        ASSIGN USER RPC
        ==================================================
        */

        const {
            data,
            error
        } =
            await supabase

                .rpc(
                    "finova_admin_assign_user",
                    {

                        p_email:
                            normalizedEmail,

                        p_company_id:
                            normalizedCompanyId,

                        p_role:
                            normalizedRole

                    }
                );


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.assignUser:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return data;

    }


    /*
    ======================================================
    GET DASHBOARD DATA
    ======================================================
    */

    static async getDashboardData() {

        /*
        ==================================================
        LOAD CONTROL CENTER DATA
        ==================================================
        */

        const [
            companies,
            subscriptions,
            users
        ] =
            await Promise.all(
                [

                    this.getCompanies(),

                    this.getSubscriptions(),

                    this.listUsers()

                ]
            );


        /*
        ==================================================
        ACTIVE COMPANIES
        ==================================================
        */

        const activeCompanies =
            companies.filter(
                (
                    company
                ) => {

                    return (
                        String(
                            company?.status
                            ||
                            ""
                        ).toUpperCase()
                        ===
                        "ACTIVE"
                    );

                }
            );


        /*
        ==================================================
        ACTIVE USERS
        ==================================================
        */

        const activeUsers =
            users.filter(
                (
                    user
                ) => {

                    return (

                        Boolean(
                            user?.company_id
                        )

                        &&

                        String(
                            user?.membership_status
                            ||
                            ""
                        ).toUpperCase()
                        ===
                        "ACTIVE"

                    );

                }
            );


        /*
        ==================================================
        ACTIVE SUBSCRIPTIONS
        ==================================================
        */

        const activeSubscriptions =
            subscriptions.filter(
                (
                    subscription
                ) => {

                    return (
                        String(
                            subscription?.status
                            ||
                            ""
                        ).toUpperCase()
                        ===
                        "ACTIVE"
                    );

                }
            );


        /*
        ==================================================
        CURRENT DATE
        ==================================================
        */

        const now =
            new Date();


        const today =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );


        /*
        ==================================================
        DATE + 30 DAYS
        ==================================================
        */

        const in30 =
            new Date(
                today.getTime()
                +
                (
                    30
                    *
                    86400000
                )
            );


        /*
        ==================================================
        EXPIRING SUBSCRIPTIONS
        ==================================================
        */

        const expiring =
            activeSubscriptions.filter(
                (
                    subscription
                ) => {

                    if (
                        !subscription?.end_date
                    ) {

                        return false;

                    }


                    const endDate =
                        new Date(
                            `${subscription.end_date}T00:00:00`
                        );


                    if (
                        Number.isNaN(
                            endDate.getTime()
                        )
                    ) {

                        return false;

                    }


                    return (

                        endDate
                        >=
                        today

                        &&

                        endDate
                        <=
                        in30

                    );

                }
            );


        /*
        ==================================================
        MONTHLY RECURRING REVENUE
        ==================================================
        */

        let mrr =
            0;


        for (
            const subscription
            of activeSubscriptions
        ) {

            /*
            ==============================================
            CANCELLED PAYMENT DOES NOT COUNT
            ==============================================
            */

            const paymentStatus =
                String(
                    subscription?.payment_status
                    ||
                    ""
                ).toUpperCase();


            if (
                paymentStatus
                ===
                "CANCELLED"
            ) {

                continue;

            }


            /*
            ==============================================
            BILLING CYCLE
            ==============================================
            */

            const billingCycle =
                String(
                    subscription
                        ?.finova_plans
                        ?.billing_cycle
                    ||
                    ""
                ).toUpperCase();


            /*
            ==============================================
            AMOUNT
            ==============================================
            */

            const amount =
                Number(
                    subscription?.amount
                    ||
                    0
                );


            if (
                !Number.isFinite(
                    amount
                )
            ) {

                continue;

            }


            /*
            ==============================================
            ANNUAL -> MONTHLY EQUIVALENT
            ==============================================
            */

            if (
                billingCycle
                ===
                "ANNUAL"
            ) {

                mrr +=
                    amount
                    /
                    12;

            }
            else {

                mrr +=
                    amount;

            }

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return {

            companies,

            subscriptions,

            users,

            activeCompanies,

            activeUsers,

            activeSubscriptions,

            expiring,

            mrr

        };

    }


    /*
    ======================================================
    BAGIAN 4/4 DITEMPEL DI BAWAH INI
    ======================================================
    */    
   /*
    ======================================================
    LOGOUT
    ======================================================
    */

    static async logout() {

        const {
            error
        } =
            await supabase
                .auth
                .signOut();


        /*
        ==================================================
        ERROR
        ==================================================
        */

        if (
            error
        ) {

            console.error(
                "ControlCenterService.logout:",
                error
            );


            throw error;

        }


        /*
        ==================================================
        CLEAR SESSION STORAGE
        ==================================================
        */

        sessionStorage.clear();


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return true;

    }


    /*
======================================================
SUBSCRIBE AUDIT LOG REALTIME
======================================================
*/

static subscribeAuditLogs(
    onChange
) {

    /*
    ==================================================
    CALLBACK
    ==================================================
    */

    const callback =
        typeof onChange ===
        "function"
            ?
        onChange
            :
        () => {};


    /*
    ==================================================
    UNIQUE CHANNEL NAME

    Prevent stale / duplicate channel collision when
    Control Center is reloaded in the same browser.
    ==================================================
    */

    const channelName =
        `finova-control-center-audit-log-${Date.now()}`;


    /*
    ==================================================
    CREATE CHANNEL
    ==================================================
    */

    const channel =
        supabase
            .channel(
                channelName
            )


            /*
            ==============================================
            AUDIT LOG DATABASE CHANGES
            ==============================================
            */

            .on(
                "postgres_changes",
                {

                    event:
                        "*",

                    schema:
                        "public",

                    table:
                        "finova_audit_log"

                },
                payload => {

                    /*
                    ======================================
                    DEBUG EVENT
                    ======================================
                    */

                    console.log(
                        "CONTROL CENTER AUDIT REALTIME EVENT:",
                        {

                            eventType:
                                payload?.eventType
                                || null,

                            schema:
                                payload?.schema
                                || null,

                            table:
                                payload?.table
                                || null,

                            new:
                                payload?.new
                                || null,

                            old:
                                payload?.old
                                || null

                        }
                    );


                    /*
                    ======================================
                    REFRESH CALLBACK
                    ======================================
                    */

                    callback(
                        payload
                    );

                }
            )


            /*
            ==============================================
            SUBSCRIBE
            ==============================================
            */

            .subscribe(
                (
                    status,
                    error
                ) => {

                    /*
                    ======================================
                    CONNECTION STATUS
                    ======================================
                    */

                    console.log(
                        "Control Center Audit Realtime:",
                        status
                    );


                    /*
                    ======================================
                    SUBSCRIBED
                    ======================================
                    */

                    if (
                        status ===
                        "SUBSCRIBED"
                    ) {

                        console.log(
                            "CONTROL CENTER AUDIT REALTIME READY"
                        );

                        return;

                    }


                    /*
                    ======================================
                    CHANNEL ERROR
                    ======================================
                    */

                    if (
                        status ===
                        "CHANNEL_ERROR"
                    ) {

                        console.error(
                            "CONTROL CENTER AUDIT REALTIME CHANNEL ERROR:",
                            error
                            || null
                        );

                        return;

                    }


                    /*
                    ======================================
                    TIMED OUT
                    ======================================
                    */

                    if (
                        status ===
                        "TIMED_OUT"
                    ) {

                        console.error(
                            "CONTROL CENTER AUDIT REALTIME TIMED OUT:",
                            error
                            || null
                        );

                        return;

                    }


                    /*
                    ======================================
                    CLOSED
                    ======================================
                    */

                    if (
                        status ===
                        "CLOSED"
                    ) {

                        console.warn(
                            "CONTROL CENTER AUDIT REALTIME CLOSED"
                        );

                    }

                }
            );


    /*
    ==================================================
    RETURN CHANNEL

    Required by unsubscribeAuditLogs().
    ==================================================
    */

    return channel;

}


    /*
    ======================================================
    UNSUBSCRIBE AUDIT LOG REALTIME
    ======================================================
    */

    static async unsubscribeAuditLogs(
        channel
    ) {

        if (
            !channel
        ) {

            return;

        }


        await supabase
            .removeChannel(
                channel
            );

    }


    /*
======================================================
GET AUDIT LOGS
======================================================
*/

static async getAuditLogs(

    limit = 200

) {


    /*
    ==================================================
    SAFE LIMIT
    ==================================================
    */

    const safeLimit =
        Math.min(
            Math.max(
                Number(
                    limit
                )
                ||
                200,
                1
            ),
            500
        );


    /*
    ==================================================
    QUERY AUDIT LOG
    ==================================================
    */

    const {
        data: auditLogs,
        error: auditError
    } =
        await supabase

            /*
            ==================================================
            CONTROL CENTER AUDIT RPC

            IMPORTANT:
            finova_audit_log RLS is intentionally scoped to
            finova_effective_company_id(). Control Center is a
            Super Admin workspace and may have no tenant Company
            Context selected, therefore a direct table SELECT can
            legitimately return zero rows.

            Use the dedicated Super Admin RPC instead.
            ==================================================
            */

            .rpc(
                "finova_admin_list_audit_logs",
                {
                    p_limit:
                        safeLimit
                }
            );


    /*
    ==================================================
    AUDIT ERROR
    ==================================================
    */

    if (
        auditError
    ) {

        console.error(
            "ControlCenterService.getAuditLogs:",
            auditError
        );


        throw auditError;

    }


    /*
    ==================================================
    EMPTY AUDIT RESULT
    ==================================================
    */

    if (
        !auditLogs
        ||
        auditLogs.length === 0
    ) {

        return [];

    }


    /*
    ==================================================
    COLLECT UNIQUE USER UID
    ==================================================
    */

    const userUids =
        [
            ...new Set(

                auditLogs

                    .map(
                        (
                            log
                        ) =>
                            log?.user_uid
                    )

                    .filter(
                        Boolean
                    )

            )
        ];


    /*
    ==================================================
    NO USER UID
    ==================================================
    */

    if (
        userUids.length === 0
    ) {

        return auditLogs.map(
            (
                log
            ) => ({

                ...log,

                user_name:
                    "System",

                user_role:
                    null

            })
        );

    }


    /*
    ==================================================
    QUERY USER MASTER
    ==================================================
    */

    const {
        data: users,
        error: userError
    } =
        await supabase

            .from(
                "mst_users"
            )

            .select(`
                user_uid,
                full_name,
                role
            `)

            .in(
                "user_uid",
                userUids
            );


    /*
    ==================================================
    USER ERROR
    ==================================================

    Audit Log tetap harus bisa ditampilkan walaupun
    lookup user gagal.

    Karena itu kita tidak throw error di sini.
    ==================================================
    */

    if (
        userError
    ) {

        console.error(
            "ControlCenterService.getAuditLogs user lookup:",
            userError
        );


        return auditLogs.map(
            (
                log
            ) => ({

                ...log,

                user_name:
                    log?.user_uid
                    ||
                    "System",

                user_role:
                    null

            })
        );

    }


    /*
    ==================================================
    CREATE USER MAP
    ==================================================
    */

    const userMap =
        new Map();


    for (
        const user
        of (
            users
            ??
            []
        )
    ) {

        if (
            !user?.user_uid
        ) {

            continue;

        }


        userMap.set(
            String(
                user.user_uid
            ),
            user
        );

    }


    /*
    ==================================================
    MERGE AUDIT LOG + USER
    ==================================================
    */

    const result =
        auditLogs.map(
            (
                log
            ) => {

                const user =
                    log?.user_uid
                        ? userMap.get(
                            String(
                                log.user_uid
                            )
                        )
                        : null;


                /*
                ==========================================
                SYSTEM GENERATED EVENT
                ==========================================
                */

                if (
                    !log?.user_uid
                ) {

                    return {

                        ...log,

                        user_name:
                            "System",

                        user_role:
                            null

                    };

                }


                /*
                ==========================================
                USER EVENT
                ==========================================
                */

                return {

                    ...log,

                    user_name:
                        user?.full_name
                        ||
                        log.user_uid,

                    user_role:
                        user?.role
                        ||
                        null

                };

            }
        );


    /*
    ==================================================
    RESULT
    ==================================================
    */

    return result;

}
}

/*
==========================================================
FINOVA CONTROL CENTER SERVICE
END OF FILE
==========================================================
*/