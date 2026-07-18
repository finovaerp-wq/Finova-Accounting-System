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
        payload.account_code,

    account_name:
        payload.account_name,

    parent_id:
        payload.parent_id || null,

    currency:
        payload.currency ?? "IDR",

    normal_balance:
        payload.normal_balance ?? "Debit",

    posting_type:
        payload.posting_type ?? "Manual & Auto",

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

    const { data, error } = await supabase

        .from(TABLE.CHART_OF_ACCOUNTS)

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
    /*
    ==========================================================
    UPDATE
    ==========================================================
    */

    static async update(id, payload) {

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

    const { data, error } = await supabase

        .from(TABLE.CHART_OF_ACCOUNTS)

        .update(dataUpdate)

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
        DELETE
        ======================================================
        */

        const { error } = await supabase

            .from(TABLE.CHART_OF_ACCOUNTS)

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

        console.error(error);

        throw new Error(

            "Failed to delete Chart Of Account."

        );

    }

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
/*
==========================================================
GET PARENT INFORMATION
==========================================================
*/

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
    PARENT
    ======================================================
    */

    const parent =
        await this.getById(parentId);

    /*
    ======================================================
    CHILD
    ======================================================
    */

    const { data: children, error } = await supabase

        .from(TABLE.CHART_OF_ACCOUNTS)

        .select("account_code")

        .eq("parent_id", parentId)

        .order("account_code", {

            ascending: false

        });

    if (error) {

        throw error;

    }

    /*
    ======================================================
    NEXT ACCOUNT CODE
    ======================================================
    */

    let nextCode;

    if (!children.length) {

        nextCode =
            parent.account_code + "01";

    }

    else {

        const lastCode =
            children[0].account_code;

        nextCode =
            String(Number(lastCode) + 1);

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
        QUERY
        ======================================================
        */

        let query = supabase

            .from(TABLE.CHART_OF_ACCOUNTS)

            .select("*");

        /*
        ======================================================
        KEYWORD
        ======================================================
        */

        const keywordValue =
            keyword.trim();

        if (keywordValue !== "") {

            query = query.or(

                `account_code.ilike.%${keywordValue}%,account_name.ilike.%${keywordValue}%`

            );

        }

        /*
        ======================================================
        STATUS
        ======================================================
        */

        if (status !== "") {

            query = query.eq(

                "status",

                status === "true"

            );

        }

        /*
        ======================================================
        LOAD DATA
        ======================================================
        */

        const { data, error } = await query

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

            "Failed to search Chart Of Accounts."

        );

    }

}
}