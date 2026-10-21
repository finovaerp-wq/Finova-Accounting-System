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
ACCESS CONTROL
==========================================================
*/

static async ensureCanManage() {

    const { data: authData, error: authError } =
        await supabase.auth.getUser();

    if (authError) throw authError;

    const userUid = authData?.user?.id;
    if (!userUid) {
        throw new Error("Authentication session was not found.");
    }

    // Resolve the active tenant first. A user's role in another company must
    // never grant write access to the current company's Chart of Accounts.
    const { data: companyId, error: companyError } =
        await supabase.rpc("finova_effective_company_id");

    if (companyError) throw companyError;
    if (!companyId) {
        throw new Error("Active company context was not found.");
    }

    const { data: profile, error } = await supabase
        .from("mst_users")
        .select("role, status, company_id")
        .eq("user_uid", userUid)
        .eq("company_id", companyId)
        .maybeSingle();

    if (error) throw error;

    // Normalize legacy role spellings returned by different FINOVA screens/data.
    // Accept "Super Admin", "super_admin", and "super-admin" as the same owner role.
    const role = String(profile?.role ?? "")
        .trim()
        .toLowerCase()
        .replace(/[._-]+/g, " ")
        .replace(/\s+/g, " ");

    // mst_users.status may be stored as a boolean or as a textual active status.
    const rawStatus = profile?.status;
    const active =
        rawStatus === true ||
        rawStatus === 1 ||
        ["true", "1", "active", "aktif"].includes(String(rawStatus ?? "").trim().toLowerCase());

    // Super Admin is the FINOVA owner and receives the same COA write permissions as Manager.
    if (!active || !["manager", "super admin"].includes(role)) {
        throw new Error("You have view-only access to Chart Of Accounts. Manager or Super Admin access is required.");
    }

    return true;

}

/*
==========================================================
INSERT
==========================================================
*/

static getAccountTypeFromClass(accountClass) {

    const mapping = {
        Asset: "Balance Sheet",
        Liability: "Balance Sheet",
        Equity: "Balance Sheet",
        Revenue: "Income Statement",
        Expense: "Income Statement"
    };

    return mapping[String(accountClass ?? "").trim()] ?? "";

}

static validateAccountPayload(payload) {

    if (!payload || typeof payload !== "object") {
        throw new Error("Chart Of Account data is required.");
    }

    if (!String(payload.account_name ?? "").trim()) {
        throw new Error("Account Name is required.");
    }

    const allowedClasses = new Set(["Asset", "Liability", "Equity", "Revenue", "Expense"]);
    const accountClass = String(payload.account_class ?? "").trim();
    if (!allowedClasses.has(accountClass)) {
        throw new Error("Account Class must be Asset, Liability, Equity, Revenue, or Expense.");
    }

    return true;

}

static async insert(payload) {

        await this.ensureCanManage();

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

        this.validateAccountPayload(payload);

        /*
        ======================================================
        SERVER-SIDE AUTO ACCOUNT CODE - DEFAULT ONLY
        ADD CHILD ACCOUNT
        User may override the automatically generated code.
        If code is blank, generate the next available code.
        ======================================================
        */

        let resolvedAccountCode =
            String(payload.account_code ?? "").trim();

        if (payload.parent_id && !resolvedAccountCode) {
            const parentInfo =
                await this.getParentInformation(payload.parent_id);

            resolvedAccountCode =
                parentInfo.next_account_code;
        }

        const accountCode =
            resolvedAccountCode;

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

        // Prevent self-parenting and circular account hierarchies on insert.
        await this.validateParentHierarchy(
            null,
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

            account_type:
                this.getAccountTypeFromClass(payload.account_class),

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

    static async update(id, payload) {

        await this.ensureCanManage();

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

        this.validateAccountPayload(payload);

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

        // Validate the selected parent and prevent moving an account beneath itself
        // or one of its descendants. This must run before persisting the update.
        await this.validateParentAccount(
            payload.parent_id
        );

        await this.validateParentHierarchy(
            id,
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

        // Explicit allowlist prevents the UI payload from overwriting IDs,
        // ownership fields, or creation timestamps.
        const dataUpdate = {
            account_code: accountCode,
            account_name: String(payload.account_name ?? "").trim(),
            account_class: String(payload.account_class).trim(),
            account_type: this.getAccountTypeFromClass(payload.account_class),
            parent_id: payload.parent_id || null,
            currency: payload.currency ?? "IDR",
            normal_balance: payload.normal_balance ?? "Debit",
            posting_type: payload.posting_type ?? "Manual & Auto",
            level,
            is_header: payload.is_header ?? false,
            allow_transaction: payload.allow_transaction ?? true,
            status: payload.status ?? true,
            description: payload.description ?? "",
            updated_at: now
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

        await this.ensureCanManage();

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
        CHECK ACCOUNT REFERENCES ACROSS MODULES
        ======================================================
        */

        // Keep this list aligned with the verified public schema.
        // Any query error fails closed so an incomplete check cannot
        // accidentally permit deletion.
        const accountReferences = [
            { table: "trx_gl_journal_detail", column: "account_id" },
            { table: "mst_taxes", column: "tax_account_id" },
            { table: "mst_taxes", column: "offset_account_id" },
            { table: "trx_account_payable_detail", column: "account_id" },
            { table: "trx_account_payable_detail", column: "credit_account_id" },
            { table: "trx_account_payable_detail", column: "tax_plus_account_id" },
            { table: "trx_account_payable_detail", column: "tax_minus_account_id" },
            { table: "trx_account_receivable_detail", column: "account_id" }
        ];

        for (const reference of accountReferences) {

            const {
                count: referenceCount,
                error: referenceError
            } = await supabase
                .from(reference.table)
                .select(reference.column, {
                    count: "exact",
                    head: true
                })
                .eq(reference.column, id);

            if (referenceError) {
                console.error(
                    "COA DELETE REFERENCE CHECK ERROR:",
                    reference.table,
                    reference.column,
                    referenceError
                );
                throw new Error(
                    `Unable to verify COA usage in ${reference.table}.${reference.column}. Deletion was cancelled for safety.`
                );
            }

            if ((referenceCount ?? 0) > 0) {
                throw new Error(
                    `Chart Of Account cannot be deleted because it is referenced by ${reference.table}.${reference.column}.`
                );
            }
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

static async setStatus(id, status) {

        await this.ensureCanManage();

    try {

        if (!id) {

            throw new Error(
                "Chart Of Account ID is required."
            );

        }

        if (typeof status !== "boolean") {
            throw new Error("Account status must be a boolean value.");
        }

        const newStatus = status;


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

    if (!parent) {
        throw new Error("Parent account was not found.");
    }

    /*
    ======================================================
    GET ALL CHILDREN
    ======================================================
    */

    const {
        data: children,
        error
    } = await supabase
        .from(TABLE.CHART_OF_ACCOUNTS)
        .select("account_code")
        .eq("parent_id", parentId);

    if (error) {
        throw error;
    }

    const childRows = children ?? [];

    /*
    ======================================================
    AUTO ACCOUNT CODE

    RULE:
    - Child code follows the numeric sequence after parent.
    - Start from parent numeric code + 1.
    - Use the FIRST AVAILABLE number.
    - Do NOT use MAX + 1 when a lower number is missing.

    Example:
        Parent : 1-11020
        Child  : 1-11021
                  1-11022
                  1-11023
                  1-11031

        Next   : 1-11024
    ======================================================
    */

    const parentCode =
        String(parent.account_code ?? "").trim();

    const parentMatch =
        parentCode.match(/^(.*-)(\d+)$/);

    let nextCode = "";

    if (parentMatch) {

        const codePrefix = parentMatch[1];
        const parentNumberText = parentMatch[2];
        const parentNumber = Number(parentNumberText);
        const width = Math.max(parentNumberText.length, 2);

        const usedNumbers = new Set();

        for (const child of childRows) {

            const childCode =
                String(child.account_code ?? "").trim();

            const childMatch =
                childCode.match(/^(.+?-)\d+$/);

            if (!childMatch || childMatch[1] !== codePrefix) {
                continue;
            }

            const childNumberMatch =
                childCode.match(/^(.*-)(\d+)$/);

            if (!childNumberMatch || childNumberMatch[1] !== codePrefix) {
                continue;
            }

            const childNumber =
                Number(childNumberMatch[2]);

            if (Number.isFinite(childNumber)) {
                usedNumbers.add(childNumber);
            }

        }

        let candidateNumber =
            parentNumber + 1;

        while (usedNumbers.has(candidateNumber)) {
            candidateNumber += 1;
        }

        nextCode =
            codePrefix +
            String(candidateNumber).padStart(width, "0");

    }

    else {

        /*
        ==================================================
        FALLBACK FOR NON-STANDARD ROOT CODE
        ==================================================
        */

        const numericMatch =
            parentCode.match(/^(.*?)(\d+)$/);

        if (!numericMatch) {
            throw new Error(
                `Cannot generate Account Code from parent "${parentCode}".`
            );
        }

        const prefix = numericMatch[1];
        const parentNumberText = numericMatch[2];
        const parentNumber = Number(parentNumberText);
        const width = Math.max(parentNumberText.length, 2);

        const usedNumbers = new Set();

        for (const child of childRows) {
            const childCode = String(child.account_code ?? "").trim();
            const m = childCode.match(/^(.*?)(\d+)$/);
            if (m && m[1] === prefix) {
                const n = Number(m[2]);
                if (Number.isFinite(n)) usedNumbers.add(n);
            }
        }

        let candidateNumber = parentNumber + 1;
        while (usedNumbers.has(candidateNumber)) {
            candidateNumber += 1;
        }

        nextCode =
            prefix +
            String(candidateNumber).padStart(width, "0");

    }

    return {
        account_name: parent.account_name,
        level: parent.level,
        child_count: childRows.length,
        next_account_code: nextCode
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