/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Module  : General Journal Service
Version : Enterprise 3.0
Author  : FINOVA Development Team
==========================================================
*/

import {

    supabase,
    TABLE

} from "../assets/js/core/supabase.js";

/*
==========================================================
GENERAL JOURNAL SERVICE
==========================================================
*/

export class GeneralJournalService {

    /*
    ==========================================================
    CONSTRUCTOR
    ==========================================================
    */

    constructor() {

    }

    /*
    ==========================================================
    CONSTANT
    ==========================================================
    */

    get STATUS() {

        return {

            DRAFT: "Draft",

            POSTED: "Posted",

            CANCELLED: "Cancelled",

            REVERSED: "Reversed"

        };

    }
    /*
==========================================================
RENDER PAGINATION
==========================================================
*/

renderPagination() {

    if (!this.currentPageInput) return;

    this.currentPageInput.value = this.currentPage;

    if (this.totalPageLabel) {

        this.totalPageLabel.textContent =
            `of ${this.totalPages}`;

    }

    if (this.btnFirstPage)
        this.btnFirstPage.disabled =
            this.currentPage === 1;

    if (this.btnPreviousPage)
        this.btnPreviousPage.disabled =
            this.currentPage === 1;

    if (this.btnNextPage)
        this.btnNextPage.disabled =
            this.currentPage >= this.totalPages;

    if (this.btnLastPage)
        this.btnLastPage.disabled =
            this.currentPage >= this.totalPages;

}
    /*
==========================================================
GET ALL GENERAL JOURNAL
==========================================================
*/

async getAll() {

    const { data, error } = await supabase
        .from(TABLE.GL_JOURNAL)
        .select("*");

    console.log("DATA :", data);
    console.log("ERROR :", error);

    if (error) {
        throw error;
    }

    return data ?? [];

}
/*
==========================================================
GET JOURNAL BY ID
==========================================================
*/

async getById(id) {

    try {

        /*
        ======================================================
        HEADER
        ======================================================
        */

        const {

            data: header,

            error: headerError

        } = await supabase

            .from(TABLE.GL_JOURNAL)

            .select("*")

            .eq("id", id)

            .single();

        if (headerError) {

            throw headerError;

        }

        /*
        ======================================================
        DETAIL
        ======================================================
        */

        const {

            data: details,

            error: detailError

        } = await supabase

            .from(TABLE.GL_JOURNAL_DETAIL)

            .select("*")

            .eq(

                "journal_id",

                id

            )

            .order(

                "line_no",

                {

                    ascending: true

                }

            );

        if (detailError) {

            throw detailError;

        }

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return {

            ...header,

            details: details ?? []

        };

    }

    catch (error) {

        console.error(

            "GeneralJournalService.getById",

            error

        );

        throw error;

    }

}

/*
==========================================================
SEARCH GENERAL JOURNAL
==========================================================
*/

async search(filter = {}) {

    try {

        let query = supabase

            .from(TABLE.GL_JOURNAL)

            .select("*");

        /*
        ======================================================
        DATE
        ======================================================
        */

        if (

            filter.dateFrom

        ) {

            query = query.gte(

                "accounting_date",

                filter.dateFrom

            );

        }

        if (

            filter.dateTo

        ) {

            query = query.lte(

                "accounting_date",

                filter.dateTo

            );

        }

        /*
        ======================================================
        STATUS
        ======================================================
        */

        if (

            filter.status &&

            filter.status !== "all"

        ) {

            query = query.eq(

                "status",

                filter.status

            );

        }

        /*
        ======================================================
        KEYWORD
        ======================================================
        */

        if (

            filter.keyword &&

            filter.keyword.length > 0

        ) {

            query = query.ilike(

                filter.findBy,

                `%${filter.keyword}%`

            );

        }

        /*
        ======================================================
        ORDER
        ======================================================
        */

        query = query

            .order(

                "accounting_date",

                {

                    ascending: false

                }

            )

            .order(
    "journal_no",
    {
        ascending: false
    }
);

        /*
        ======================================================
        EXECUTE
        ======================================================
        */

        const {

            data,

            error

        } = await query;

        if (error) {

            throw error;

        }

        return data ?? [];

    }

    catch (error) {

        console.error(

            "GeneralJournalService.search",

            error

        );

        throw error;

    }

}
/*
==========================================================
CREATE GENERAL JOURNAL
==========================================================
*/

async create(header, details = []) {

    try {

        /*
        ======================================================
        GENERATE DOCUMENT NUMBER
        ======================================================
        */

        if (
            !header.journal_no ||
            header.journal_no === ""
        ) {
            header.journal_no =
                await this.generateDocumentNumber();
        }

        /*
        ======================================================
        VALIDATE HEADER
        ======================================================
        */

        this.validateHeader(header);

        /*
        ======================================================
        VALIDATE DETAIL
        ======================================================
        */

        this.validateDetail(details);

        /*
        ======================================================
        CONVERT UI DETAIL
        ======================================================
        */

        const journalDetails =
            this.buildJournalDetail(details);

        /*
        ======================================================
        CALCULATE TOTAL
        ======================================================
        */

        const total =
            this.calculateTotal(journalDetails);

        header.total_debit =
            total.totalDebit;

        header.total_credit =
            total.totalCredit;
        /*
        ======================================================
        DEFAULT STATUS
        ======================================================
        */

        if (

            !header.status

        ) {

            header.status =

                this.STATUS.DRAFT;

        }

        /*
        ======================================================
        INSERT HEADER
        ======================================================
        */

        const {

            data: journal,

            error: headerError

        } = await supabase

            .from(TABLE.GL_JOURNAL)

            .insert(header)

            .select()

            .single();

        if (headerError) {

            throw headerError;

        }

        /*
        ======================================================
        INSERT DETAIL
        ======================================================
        */

        /*
======================================================
PREPARE DETAIL
======================================================
*/

const insertDetail = journalDetails.map(item => ({

    journal_id: journal.id,

    line_no: item.line_no,

    account_id: item.account_id,

    business_partner_id:
        item.business_partner_id,

    description:
        item.description,

    debit:
        item.debit,

    credit:
        item.credit

}));

/*
======================================================
INSERT DETAIL
======================================================
*/

if (insertDetail.length > 0) {

    const {

        error: detailError

    } = await supabase

        .from(TABLE.GL_JOURNAL_DETAIL)

        .insert(insertDetail);

    if (detailError) {

        /*
        ==============================================
        ROLLBACK HEADER
        ==============================================
        */

        await supabase

            .from(TABLE.GL_JOURNAL)

            .delete()

            .eq(
                "id",
                journal.id
            );

        throw detailError;

    }

}

        /*
        ======================================================
        RETURN
        ======================================================
        */

        return journal;

    }

    catch (error) {

        console.error(

            "GeneralJournalService.create",

            error

        );

        throw error;

    }

}
async update(id, header, details = []) {

    try {

        /*
        ======================================================
        VALIDATE
        ======================================================
        */

        this.validateHeader(header);

        this.validateDetail(details);

        /*
        ======================================================
        BUILD DETAIL
        ======================================================
        */

        const journalDetails =
            this.buildJournalDetail(details);

        /*
        ======================================================
        TOTAL
        ======================================================
        */

        const total =
            this.calculateTotal(journalDetails);

        header.total_debit =
            total.totalDebit;

        header.total_credit =
            total.totalCredit;

        /*
        ======================================================
        UPDATE HEADER
        ======================================================
        */

        const {

            error: headerError

        } = await supabase

            .from(TABLE.GL_JOURNAL)

            .update(header)

            .eq("id", id);

        if (headerError) {

            throw headerError;

        }

        /*
        ======================================================
        DELETE OLD DETAIL
        ======================================================
        */

        const {

            error: deleteError

        } = await supabase

            .from(TABLE.GL_JOURNAL_DETAIL)

            .delete()

            .eq(

                "journal_id",

                id

            );

        if (deleteError) {

            throw deleteError;

        }

        /*
        ======================================================
        PREPARE DETAIL
        ======================================================
        */

        const insertDetail =
            journalDetails.map(item => ({

                journal_id: id,

                line_no: item.line_no,

                account_id: item.account_id,

                business_partner_id:
                    item.business_partner_id,

                description:
                    item.description,

                debit:
                    item.debit,

                credit:
                    item.credit

            }));

        /*
        ======================================================
        INSERT DETAIL
        ======================================================
        */

        if (insertDetail.length > 0) {

            const {

                error: detailError

            } = await supabase

                .from(TABLE.GL_JOURNAL_DETAIL)

                .insert(insertDetail);

            if (detailError) {

                throw detailError;

            }

        }

        return true;

    }

    catch (error) {

        console.error(

            "GeneralJournalService.update",

            error

        );

        throw error;

    }

}

/*
==========================================================
DELETE GENERAL JOURNAL
==========================================================
*/

async delete(id){

    try{

        /*
        ======================================================
        DELETE DETAIL
        ======================================================
        */

        await supabase

            .from(TABLE.GL_JOURNAL_DETAIL)

            .delete()

            .eq(

                "journal_id",

                id

            );

        /*
        ======================================================
        DELETE HEADER
        ======================================================
        */

        const{

            error

        }=await supabase

            .from(TABLE.GL_JOURNAL)

            .delete()

            .eq(

                "id",

                id

            );

        if(error){

            throw error;

        }

        return true;

    }

    catch(error){

        console.error(

            "GeneralJournalService.delete",

            error

        );

        throw error;

    }

}

/*
==========================================================
DUPLICATE GENERAL JOURNAL
==========================================================
*/

async duplicate(id){

    try{

        /*
        ======================================================
        GET ORIGINAL
        ======================================================
        */

        const original =
            await this.getById(id);

        if(!original){

            throw new Error(

                "Journal not found."

            );

        }

        /*
        ======================================================
        NEW HEADER
        ======================================================
        */

        const {

            details,

            id:journalId,

            created_at,

            updated_at,

            ...header

        }=original;

        header.journal_no =

    await this.generateDocumentNumber();

        header.status=
            this.STATUS.DRAFT;

        header.accounting_date=

            new Date()

            .toISOString()

            .substring(0,10);

        /*
        ======================================================
        CREATE NEW
        ======================================================
        */

        return await this.create(

            header,

            details

        );

    }

    catch(error){

        console.error(

            "GeneralJournalService.duplicate",

            error

        );

        throw error;

    }

}
/*
==========================================================
GENERATE DOCUMENT NUMBER
==========================================================
*/

async generateDocumentNumber() {

    try {

        /*
        ======================================================
        PREFIX
        ======================================================
        */

        const today = new Date();

        const yyyy =
            today.getFullYear();

        const mm =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const prefix =
            `GJ-${yyyy}${mm}`;

        /*
        ======================================================
        GET LAST DOCUMENT
        ======================================================
        */

        const {

    data,

    error

} = await supabase

    .from(TABLE.GL_JOURNAL)

    .select("journal_no")

    .ilike(

        "journal_no",

        `${prefix}%`

    )

    .order(

        "journal_no",

        {

            ascending: false

        }

    )

    .limit(1);

        if (error) {

    console.log("================================");
    console.log("GENERATE DOCUMENT NUMBER ERROR");
    console.log("ERROR OBJECT :", error);
    console.log("MESSAGE :", error.message);
    console.log("DETAILS :", error.details);
    console.log("HINT :", error.hint);
    console.log("CODE :", error.code);
    console.log("================================");

    throw error;

}

        /*
        ======================================================
        NEXT RUNNING NUMBER
        ======================================================
        */

        let running = 1;

        if (

            data &&

            data.length > 0

        ) {

            const lastDocument =
                data[0].journal_no;

            const number =
                lastDocument.split("-").pop();

            running =
                Number(number) + 1;

        }

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return `${prefix}-${String(running).padStart(5,"0")}`;

    }

    catch (error) {

        console.error(

            "GeneralJournalService.generateDocumentNumber",

            error

        );

        throw error;

    }

}
/*
==========================================================
GET CHART OF ACCOUNT
==========================================================
*/

/*
==========================================================
GET CHART OF ACCOUNT
==========================================================
*/

async getCOA() {

    try {

        const { data, error } = await supabase

            .from(TABLE.CHART_OF_ACCOUNTS)

            .select(
                "id, account_code, account_name"
            )

            .eq(
                "status",
                true
            )

            .order(
                "account_code",
                {
                    ascending: true
                }
            );

        console.log("COA DATA :", data);
        console.log("COA ERROR :", error);

        if (error) {

            throw error;

        }

        return data ?? [];

    }

    catch (error) {

        console.error(
            "GeneralJournalService.getCOA",
            error
        );

        throw error;

    }

}
/*
==========================================================
GET BUSINESS PARTNER
==========================================================
*/

/*
==========================================================
GET BUSINESS PARTNER
==========================================================
*/

async getBusinessPartner() {

    try {

        const { data, error } = await supabase

            .from(TABLE.BUSINESS_PARTNER)

            .select(
                "id, bp_code, bp_name"
            )

            .eq(
                "is_active",
                true
            )

            .order(
                "bp_code",
                {
                    ascending: true
                }
            );

        console.log("BP DATA :", data);
        console.log("BP ERROR :", error);

        if (error) {

            throw error;

        }

        return data ?? [];

    }

    catch (error) {

        console.error(
            "GeneralJournalService.getBusinessPartner",
            error
        );

        throw error;

    }

}

/*
==========================================================
GET COA BY ID
==========================================================
*/

async getCOAById(id) {

    try {

        const {

            data,

            error

        } = await supabase

            .from(TABLE.CHART_OF_ACCOUNTS)

            .select("*")

            .eq(

                "id",

                id

            )

            .single();

        if (error) {

            throw error;

        }

        return data;

    }

    catch (error) {

    console.log("========== GET COA ERROR ==========");
    console.log(error);
    console.log("message :", error.message);
    console.log("details :", error.details);
    console.log("hint :", error.hint);
    console.log("code :", error.code);
    console.log("===================================");

    throw error;

}

}

/*
==========================================================
GET BUSINESS PARTNER BY ID
==========================================================
*/

async getBusinessPartnerById(id) {

    try {

        const {

            data,

            error

        } = await supabase

            .from(TABLE.BUSINESS_PARTNER)

            .select("*")

            .eq(

                "id",

                id

            )

            .single();

        if (error) {

            throw error;

        }

        return data;

    }

    catch (error) {

        console.error(

            "GeneralJournalService.getBusinessPartnerById",

            error

        );

        throw error;

    }

}
/*
==========================================================
VALIDATE HEADER
==========================================================
*/

validateHeader(header = {}) {

    if (!header) {

        throw new Error(
            "Journal Header is required."
        );

    }

    /*
    ======================================================
    ACCOUNTING DATE
    ======================================================
    */

    if (!header.journal_date) {

        throw new Error(
            "Accounting Date is required."
        );

    }
    if (!header.source_module) {

    header.source_module = "GENERAL";

}

    /*
    ======================================================
    JOURNAL NUMBER
    ======================================================
    */

    if (!header.journal_no) {

        throw new Error(
            "Journal Number is required."
        );

    }

    /*
    ======================================================
    DESCRIPTION
    ======================================================
    */

    if (!header.description?.trim()) {

        throw new Error(
            "Description is required."
        );

    }

}

/*
==========================================================
VALIDATE DETAIL
==========================================================
*/

validateDetail(details = []) {

    if (!Array.isArray(details)) {

        throw new Error(
            "Journal Detail is invalid."
        );

    }

    if (details.length === 0) {

        throw new Error(
            "Journal Detail cannot be empty."
        );

    }

    details.forEach((item, index) => {

        if (!item.debit_account_id) {

            throw new Error(

                `Debit Account is required on line ${index + 1}.`

            );

        }

        if (!item.credit_account_id) {

            throw new Error(

                `Credit Account is required on line ${index + 1}.`

            );

        }

        const amount =
            Number(item.amount || 0);

        if (amount <= 0) {

            throw new Error(

                `Amount must be greater than zero on line ${index + 1}.`

            );

        }

    });

}

/*
==========================================================
CONVERT DETAIL
1 Amount
↓↓↓
Debit & Credit
==========================================================
*/

buildJournalDetail(details = []) {

    const result = [];

    details.forEach((item, index) => {

        /*
        ==========================================
        DEBIT
        ==========================================
        */

        result.push({

            line_no:

                result.length + 1,

            account_id:

                item.debit_account_id,

            business_partner_id:

                item.business_partner_id ?? null,

            description:

                item.description ?? "",

            debit:

                Number(item.amount),

            credit:

                0

        });

        /*
        ==========================================
        CREDIT
        ==========================================
        */

        result.push({

            line_no:

                result.length + 1,

            account_id:

                item.credit_account_id,

            business_partner_id:

                item.business_partner_id ?? null,

            description:

                item.description ?? "",

            debit:

                0,

            credit:

                Number(item.amount)

        });

    });

    return result;

}

/*
==========================================================
CALCULATE TOTAL
==========================================================
*/

calculateTotal(details = []) {

    let totalDebit = 0;

    let totalCredit = 0;

    details.forEach(item => {

        totalDebit +=
            Number(item.debit || 0);

        totalCredit +=
            Number(item.credit || 0);

    });

    return {

        totalDebit,

        totalCredit

    };

}

/*
==========================================================
CHECK BALANCE
==========================================================
*/

checkBalance(details = []) {

    const total =

        this.calculateTotal(details);

    return (

        total.totalDebit ===

        total.totalCredit

    );

}
/*
==========================================================
SHOW ERROR
==========================================================
*/

showError(error){

    console.error(error);

    if(window.Toast){

        window.Toast.show(

            error.message ||

            "Unexpected Error",

            "danger"

        );

    }else{

        alert(

            error.message ||

            "Unexpected Error"

        );

    }
    

}
/*
==========================================================
POST JOURNAL
==========================================================
*/

async post(id) {

    try {

        /*
        ======================================================
        UPDATE STATUS
        ======================================================
        */

        const {

            error

        } = await supabase

            .from(TABLE.GL_JOURNAL)

            .update({

                status: this.STATUS.POSTED

            })

            .eq("id", id);

        if (error) {

            throw error;

        }

        return true;

    }

    catch (error) {

        console.error(

            "GeneralJournalService.post",

            error

        );

        throw error;

    }

}

async void(id) {

    const { error } = await supabase

        .from(TABLE.GL_JOURNAL)

        .update({

            status: "Void",

            updated_at: new Date().toISOString()

        })

        .eq("id", id);

    if (error) {

        throw error;

    }

}

}