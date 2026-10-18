/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Chart Of Accounts Service
Version : 2.0.0
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";


export class ChartOfAccountsService {

    /*
==========================================================
GET ALL
==========================================================
*/

static async getAll() {

    try {

        /*
        ======================================================
        LOAD DATA
        ======================================================
        */

        const { data, error } = await supabase

            .from(TABLE.CHART_OF_ACCOUNTS)

            .select("*")

            .order(

                "account_code",

                {

                    ascending: true

                }

            );

        if (error) {

            throw error;

        }

        /*
        ======================================================
        PREPARE DATA
        ======================================================
        */

        const accounts =
            data ?? [];

        /*
        ======================================================
        PARENT MAP
        ======================================================
        */

        const parentMap = new Map(

            accounts.map(account => [

                account.id,

                account.account_name

            ])

        );

        /*
        ======================================================
        RETURN
        ======================================================
        */

        return accounts.map(account => ({

            ...account,

            parent_name:

                parentMap.get(

                    account.parent_id

                ) ?? "-"

        }));

    }

    catch (error) {

        console.error(error);

        throw new Error(

            "Failed to load Chart Of Accounts."

        );

    }

}
/*
==========================================================
GET HEADER ACCOUNTS
==========================================================
*/

static async getHeaderAccounts() {

    const { data, error } = await supabase

        .from(TABLE.CHART_OF_ACCOUNTS)

        .select(`
            id,
            account_code,
            account_name,
            level
        `)

        .eq("is_header", true)

        .eq("status", true)

        .order("account_code", {
            ascending: true
        });

    if (error) {

        throw error;

    }

    return data ?? [];

}
    /*
==========================================================
GET BY ID
==========================================================
*/

static async getById(id) {

    try {

        /*
        ======================================================
        LOAD ACCOUNT
        ======================================================
        */

        const { data, error } = await supabase

            .from(TABLE.CHART_OF_ACCOUNTS)

            .select(`
                *,
                parent:parent_id (
                    id,
                    account_code,
                    account_name,
                    level
                )
            `)

            .eq("id", id)

            .single();

        if (error) {

            throw error;

        }

        /*
        ======================================================
        CHILD COUNT
        ======================================================
        */

        const {

            count,

            error: childError

        } = await supabase

            .from(TABLE.CHART_OF_ACCOUNTS)

            .select("*", {

                count: "exact",

                head: true

            })

            .eq(

                "parent_id",

                id

            );

        if (childError) {

            throw childError;

        }

        /*
        ======================================================
        RETURN
        ======================================================
        */

        return {

            ...data,

            parent_name:

                data.parent?.account_name ?? "-",

            parent_level:

                data.parent?.level ?? "-",

            parent_child_count:

                count ?? 0

        };

    }

    catch (error) {

        console.error(error);

        throw new Error(

            "Failed to load Chart Of Account."

        );

    }

}
/*
==========================================================
INSERT
==========================================================
*/

static async insert(payload) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!payload) {

            throw new Error(
                "Chart Of Account data is required."
            );

        }


        const accountCode =
            String(
                payload.account_code ?? ""
            ).trim();


        if (!accountCode) {

            throw new Error(
                "Account Code is required."
            );

        }


        /*
        ======================================================
        CHECK DUPLICATE ACCOUNT CODE
        ======================================================
        */

        const exists =
            await this.isAccountCodeExists(
                accountCode
            );


        if (exists) {

            throw new Error(
                `Account Code "${accountCode}" already exists.`
            );

        }


        /*
        ======================================================
        VALIDATE PARENT ACCOUNT
        ======================================================
        */

        await this.validateParentAccount(
            payload.parent_id
        );


        /*
        ======================================================
        CURRENT DATE
        ======================================================
        */

        const now =
            new Date().toISOString();


        /*
        ======================================================
        ACCOUNT LEVEL
        ======================================================
        */

        const level =
            await this.getLevel(
                payload.parent_id
            );


        /*
        ======================================================
        BUILD DATA
        ======================================================
        */

        const dataInsert = {

            account_code:
                accountCode,

            account_name:
                payload.account_name ?? "",

            account_class:
                payload.account_class ?? "",

            parent_id:
                payload.parent_id || null,

            currency:
                payload.currency ?? "IDR",

            normal_balance:
                payload.normal_balance ?? "Debit",

            posting_type:
                payload.posting_type ??
                "Manual & Auto",

            level:
                level,

            is_header:
                payload.is_header ?? false,

            allow_transaction:
                payload.allow_transaction ?? true,

            status:
                payload.status ?? true,

            description:
                payload.description ?? "",

            created_at:
                now,

            updated_at:
                now

        };


        /*
        ======================================================
        INSERT
        ======================================================
        */

        const {
            data,
            error
        } = await supabase

            .from(
                TABLE.CHART_OF_ACCOUNTS
            )

            .insert(dataInsert)

            .select()

            .single();


        if (error) {

            throw error;

        }


        /*
        ======================================================
        RETURN
        ======================================================
        */

        return data;

    }

    catch (error) {

        console.error(
            "ChartOfAccountsService.insert:",
            error
        );

        throw error;

    }

}
    /*
==========================================================
UPDATE
==========================================================
*/

static async update(
    id,
    payload
) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!id) {

            throw new Error(
                "Chart Of Account ID is required."
            );

        }


        if (!payload) {

            throw new Error(
                "Chart Of Account data is required."
            );

        }


        /*
        ======================================================
        ACCOUNT CODE
        ======================================================
        */

        const accountCode =
            String(
                payload.account_code ?? ""
            ).trim();


        if (!accountCode) {

            throw new Error(
                "Account Code is required."
            );

        }


        /*
        ======================================================
        CHECK DUPLICATE ACCOUNT CODE
        EXCLUDE CURRENT ACCOUNT
        ======================================================
        */

        const exists =
            await this.isAccountCodeExists(
                accountCode,
                id
            );


        if (exists) {

            throw new Error(
                `Account Code "${accountCode}" already exists.`
            );

        }


        /*
        ======================================================
        VALIDATE PARENT ACCOUNT
        ======================================================
        */

        await this.validateParentAccount(
            payload.parent_id
        );


        /*
        ======================================================
        VALIDATE PARENT HIERARCHY
        ======================================================
        */

        await this.validateParentHierarchy(
            id,
            payload.parent_id
        );


        /*
        ======================================================
        VALIDATE HEADER ACCOUNT
        Header Account yang masih memiliki child
        tidak boleh diubah menjadi non-header.
        ======================================================
        */

        if (
            payload.is_header === false
        ) {

            const {
                count: childCount,
                error: childError
            } = await supabase

                .from(
                    TABLE.CHART_OF_ACCOUNTS
                )

                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )

                .eq(
                    "parent_id",
                    id
                );


            if (childError) {

                throw childError;

            }


            if (
                (childCount ?? 0) > 0
            ) {

                throw new Error(
                    "Header Account cannot be disabled because it still has child accounts."
                );

            }

        }


        /*
        ======================================================
        CURRENT DATE
        ======================================================
        */

        const now =
            new Date().toISOString();


        /*
        ======================================================
        ACCOUNT LEVEL
        ======================================================
        */

        const level =
            await this.getLevel(
                payload.parent_id
            );


        /*
        ======================================================
        BUILD DATA
        ======================================================
        */

        const dataUpdate = {

            ...payload,

            account_code:
                accountCode,

            parent_id:
                payload.parent_id || null,

            level:
                level,

            updated_at:
                now

        };


        /*
        ======================================================
        UPDATE
        ======================================================
        */

        const {
            data,
            error
        } = await supabase

            .from(
                TABLE.CHART_OF_ACCOUNTS
            )

            .update(
                dataUpdate
            )

            .eq(
                "id",
                id
            )

            .select()

            .single();


        if (error) {

            throw error;

        }


        /*
        ======================================================
        RETURN
        ======================================================
        */

        return data;

    }

    catch (error) {

        console.error(
            "ChartOfAccountsService.update:",
            error
        );

        throw error;

    }

}

/*
==========================================================
VALIDATE PARENT HIERARCHY
==========================================================
*/

static async validateParentHierarchy(
    accountId,
    parentId
) {

    /*
    ======================================================
    ROOT ACCOUNT
    ======================================================
    */

    if (!parentId) {

        return true;

    }


    /*
    ======================================================
    SELF PARENT
    ======================================================
    */

    if (
        accountId
        &&
        String(accountId) ===
        String(parentId)
    ) {

        throw new Error(
            "Chart Of Account cannot be its own parent."
        );

    }


    /*
    ======================================================
    LOAD ALL ACCOUNT HIERARCHY
    ======================================================
    */

    const {
        data,
        error
    } = await supabase

        .from(
            TABLE.CHART_OF_ACCOUNTS
        )

        .select(`
            id,
            parent_id
        `);


    if (error) {

        throw error;

    }


    const accounts =
        data ?? [];


    /*
    ======================================================
    BUILD PARENT MAP
    ======================================================
    */

    const parentMap =
        new Map();


    accounts.forEach(
        account => {

            parentMap.set(
                String(account.id),
                account.parent_id
                    ? String(account.parent_id)
                    : null
            );

        }
    );


    /*
    ======================================================
    WALK UP FROM PROPOSED PARENT
    ======================================================
    */

    let currentParentId =
        String(parentId);


    const visited =
        new Set();


    while (currentParentId) {

        /*
        ==============================================
        PROTECT AGAINST EXISTING CYCLE
        ==============================================
        */

        if (
            visited.has(
                currentParentId
            )
        ) {

            throw new Error(
                "Invalid Chart Of Account hierarchy detected."
            );

        }


        visited.add(
            currentParentId
        );


        /*
        ==============================================
        PROPOSED PARENT IS CURRENT ACCOUNT
        ==============================================
        */

        if (
            accountId
            &&
            currentParentId ===
            String(accountId)
        ) {

            throw new Error(
                "Chart Of Account cannot use one of its child accounts as parent."
            );

        }


        /*
        ==============================================
        GET NEXT PARENT
        ==============================================
        */

        currentParentId =
            parentMap.get(
                currentParentId
            ) ?? null;

    }


    return true;

}

/*
==========================================================
CHECK ACCOUNT CODE EXISTS
==========================================================
*/

static async isAccountCodeExists(
    accountCode,
    excludeId = null
) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        const code =
            String(accountCode ?? "")
                .trim();

        if (!code) {

            return false;

        }


        /*
        ======================================================
        QUERY
        ======================================================
        */

        let query =
            supabase

                .from(
                    TABLE.CHART_OF_ACCOUNTS
                )

                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )

                .eq(
                    "account_code",
                    code
                );


        /*
        ======================================================
        EXCLUDE CURRENT ACCOUNT
        SAAT EDIT
        ======================================================
        */

        if (excludeId) {

            query =
                query.neq(
                    "id",
                    excludeId
                );

        }


        /*
        ======================================================
        EXECUTE
        ======================================================
        */

        const {
            count,
            error
        } = await query;


        if (error) {

            throw error;

        }


        /*
        ======================================================
        RETURN
        ======================================================
        */

        return (count ?? 0) > 0;

    }

    catch (error) {

        console.error(
            "ChartOfAccountsService.isAccountCodeExists:",
            error
        );

        throw new Error(
            "Failed to check Account Code."
        );

    }

}

    /*
    ==========================================================
    DELETE
    ==========================================================
    */

    static async delete(id) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!id) {

            throw new Error(
                "Chart Of Account ID is required."
            );

        }


        /*
        ======================================================
        CHECK CHILD ACCOUNT
        ======================================================
        */

        const {
            count: childCount,
            error: childError
        } = await supabase

            .from(
                TABLE.CHART_OF_ACCOUNTS
            )

            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )

            .eq(
                "parent_id",
                id
            );


        if (childError) {

            throw childError;

        }


        /*
        ======================================================
        BLOCK DELETE PARENT
        ======================================================
        */

        if ((childCount ?? 0) > 0) {

            throw new Error(
                "Chart Of Account cannot be deleted because it still has child accounts."
            );

        }


        /*
        ======================================================
        CHECK ACCOUNT USED
        ======================================================
        */

        const {
            count: usageCount,
            error: usageError
        } = await supabase

            .from(
                TABLE.GL_JOURNAL_DETAIL
            )

            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )

            .eq(
                "account_id",
                id
            );


        if (usageError) {

            throw usageError;

        }


        /*
        ======================================================
        BLOCK DELETE USED ACCOUNT
        ======================================================
        */

        if ((usageCount ?? 0) > 0) {

            throw new Error(
                "Chart Of Account cannot be deleted because it is still being used."
            );

        }


        /*
        ======================================================
        DELETE
        ======================================================
        */

        const {
            error
        } = await supabase

            .from(
                TABLE.CHART_OF_ACCOUNTS
            )

            .delete()

            .eq(
                "id",
                id
            );


        if (error) {

            throw error;

        }


        /*
        ======================================================
        RETURN
        ======================================================
        */

        return true;

    }

    catch (error) {

        console.error(
            "ChartOfAccountsService.delete:",
            error
        );

        throw error;

    }

}

/*
==========================================================
SET STATUS
==========================================================
*/

static async setStatus(
    id,
    status
) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!id) {

            throw new Error(
                "Chart Of Account ID is required."
            );

        }


        /*
        ======================================================
        NEW STATUS
        ======================================================
        */

        const newStatus =
            Boolean(status);


        /*
        ======================================================
        BLOCK INACTIVE HEADER ACCOUNT
        HEADER ACCOUNT YANG MASIH MEMILIKI CHILD
        TIDAK BOLEH MENJADI INACTIVE
        ======================================================
        */

        if (
            newStatus === false
        ) {

            /*
            ----------------------------------------------
            CHECK CHILD ACCOUNT
            ----------------------------------------------
            */

            const {
                count: childCount,
                error: childError
            } = await supabase

                .from(
                    TABLE.CHART_OF_ACCOUNTS
                )

                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )

                .eq(
                    "parent_id",
                    id
                );


            if (childError) {

                throw childError;

            }


            /*
            ----------------------------------------------
            BLOCK
            ----------------------------------------------
            */

            if (
                (childCount ?? 0) > 0
            ) {

                throw new Error(
                    "Header Account cannot be set to Inactive because it still has child accounts."
                );

            }

        }


        /*
        ======================================================
        UPDATE STATUS
        ======================================================
        */

        const {
            data,
            error
        } = await supabase

            .from(
                TABLE.CHART_OF_ACCOUNTS
            )

            .update({

                status:
                    newStatus,

                updated_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                id
            )

            .select()

            .single();


        if (error) {

            throw error;

        }


        /*
        ======================================================
        RETURN
        ======================================================
        */

        return data;

    }

    catch (error) {

        console.error(
            "ChartOfAccountsService.setStatus:",
            error
        );

        throw error;

    }

}
   
/*
==========================================================
VALIDATE PARENT ACCOUNT
==========================================================
*/

static async validateParentAccount(
    parentId
) {

    /*
    ======================================================
    ROOT ACCOUNT
    ======================================================
    */

    if (!parentId) {

        return true;

    }


    /*
    ======================================================
    LOAD PARENT
    ======================================================
    */

    const {
        data: parent,
        error
    } = await supabase

        .from(
            TABLE.CHART_OF_ACCOUNTS
        )

        .select(`
            id,
            account_code,
            account_name,
            level,
            is_header,
            status
        `)

        .eq(
            "id",
            parentId
        )

        .maybeSingle();


    if (error) {

        throw error;

    }


    /*
    ======================================================
    PARENT NOT FOUND
    ======================================================
    */

    if (!parent) {

        throw new Error(
            "Selected Parent Account was not found."
        );

    }


    /*
    ======================================================
    MUST BE HEADER
    ======================================================
    */

    if (
        parent.is_header !== true
    ) {

        throw new Error(
            "Selected Parent Account must be a Header Account."
        );

    }


    /*
    ======================================================
    MUST BE ACTIVE
    ======================================================
    */

    if (
        parent.status !== true
    ) {

        throw new Error(
            "Selected Parent Account must be Active."
        );

    }


    return true;

}

/*
==========================================================
GET LEVEL
==========================================================
*/

static async getLevel(parentId) {

    /*
    ==========================================
    ROOT ACCOUNT
    ==========================================
    */

    if (!parentId) {

        return 1;

    }

    /*
    ==========================================
    GET PARENT
    ==========================================
    */

    const parent =

        await this.getById(parentId);

    /*
    ==========================================
    RETURN
    ==========================================
    */

    return (parent.level ?? 1) + 1;

}
static async getParentInformation(parentId) {

    /*
    ======================================================
    ROOT ACCOUNT
    ======================================================
    */

    if (!parentId) {

        return {

            account_name: "-",

            level: 0,

            child_count: 0,

            next_account_code: "-"

        };

    }


    /*
    ======================================================
    GET PARENT
    ======================================================
    */

    const parent =
        await this.getById(parentId);


    /*
    ======================================================
    GET CHILDREN
    ======================================================
    */

    const {
        data: children,
        error
    } = await supabase

        .from(TABLE.CHART_OF_ACCOUNTS)

        .select("account_code")

        .eq(
            "parent_id",
            parentId
        )

        .order(
            "account_code",
            {
                ascending: false
            }
        );


    if (error) {

        throw error;

    }


    /*
    ======================================================
    NEXT ACCOUNT CODE
    ======================================================
    */

    let nextCode;


    /*
    ======================================================
    NO CHILD
    ======================================================
    */

    if (!children.length) {

        nextCode =
            `${parent.account_code}01`;

    }


    /*
    ======================================================
    HAS CHILD
    ======================================================
    */

    else {

        const lastCode =
            String(
                children[0]?.account_code ?? ""
            ).trim();


        /*
        ==================================================
        EXTRACT LAST NUMERIC PART
        ==================================================
        */

        const match =
            lastCode.match(/(\d+)$/);


        if (match) {

            const numericPart =
                match[1];

            const prefix =
                lastCode.substring(
                    0,
                    lastCode.length -
                    numericPart.length
                );

            const nextNumber =
                String(
                    Number(numericPart) + 1
                ).padStart(
                    numericPart.length,
                    "0"
                );

            nextCode =
                prefix + nextNumber;

        }

        else {

            /*
            ==============================================
            FALLBACK
            ==============================================
            */

            nextCode =
                `${parent.account_code}01`;

        }

    }


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return {

        account_name:
            parent.account_name,

        level:
            parent.level,

        child_count:
            children.length,

        next_account_code:
            nextCode

    };

}
/*
==========================================================
CHECK ACCOUNT USED
==========================================================
*/

static async isUsed(id) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!id) {

            return false;

        }

        /*
        ======================================================
        CHECK ACCOUNT
        ======================================================
        */

        const {

            count,

            error

        } = await supabase

            .from(TABLE.GL_JOURNAL_DETAIL)

            .select("*", {

                count: "exact",

                head: true

            })

            .eq(

                "account_id",

                id

            );

        if (error) {

            throw error;

        }

        /*
        ======================================================
        RETURN
        ======================================================
        */

        return (count ?? 0) > 0;

    }

    catch (error) {

        console.error(error);

        throw new Error(

            "Failed to check Chart Of Account."

        );

    }

}
/*
==========================================================
SEARCH
==========================================================
*/

static async search(
    keyword = "",
    status = ""
) {

    try {

        /*
        ======================================================
        QUERY ACCOUNT
        ======================================================
        */

        let query =
            supabase

                .from(
                    TABLE.CHART_OF_ACCOUNTS
                )

                .select("*");


        /*
        ======================================================
        KEYWORD
        ======================================================
        */

        const keywordValue =
            String(
                keyword ?? ""
            ).trim();


        if (
            keywordValue !== ""
        ) {

            query =
                query.or(

                    `account_code.ilike.%${keywordValue}%,account_name.ilike.%${keywordValue}%`

                );

        }


        /*
        ======================================================
        STATUS
        ======================================================
        */

        if (
            status !== ""
        ) {

            query =
                query.eq(
                    "status",
                    status === "true"
                );

        }


        /*
        ======================================================
        LOAD ACCOUNT
        ======================================================
        */

        const {
            data,
            error
        } = await query

            .order(
                "account_code",
                {
                    ascending: true
                }
            );


        if (error) {

            throw error;

        }


        /*
        ======================================================
        PREPARE ACCOUNT DATA
        ======================================================
        */

        const accounts =
            data ?? [];


        /*
        ======================================================
        COLLECT PARENT IDS
        ======================================================
        */

        const parentIds =
            [
                ...new Set(

                    accounts

                        .map(
                            account =>
                                account.parent_id
                        )

                        .filter(
                            id =>
                                id !== null
                                &&
                                id !== undefined
                                &&
                                id !== ""
                        )

                )
            ];


        /*
        ======================================================
        LOAD PARENTS
        Tidak ikut terkena keyword search.
        ======================================================
        */

        let parentMap =
            new Map();


        if (
            parentIds.length > 0
        ) {

            const {
                data: parents,
                error: parentError
            } = await supabase

                .from(
                    TABLE.CHART_OF_ACCOUNTS
                )

                .select(`
                    id,
                    account_name
                `)

                .in(
                    "id",
                    parentIds
                );


            if (parentError) {

                throw parentError;

            }


            /*
            ----------------------------------------------
            BUILD PARENT MAP
            ----------------------------------------------
            */

            parentMap =
                new Map(

                    (
                        parents ?? []
                    ).map(
                        parent => [

                            String(
                                parent.id
                            ),

                            parent.account_name

                        ]
                    )

                );

        }


        /*
        ======================================================
        RETURN
        ======================================================
        */

        return accounts.map(
            account => ({

                ...account,

                parent_name:

                    parentMap.get(
                        String(
                            account.parent_id
                        )
                    )
                    ?? "-"

            })
        );

    }

    catch (error) {

        console.error(error);

        throw new Error(
            "Failed to search Chart Of Accounts."
        );

    }

}
}