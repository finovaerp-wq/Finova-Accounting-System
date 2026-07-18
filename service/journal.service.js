/*
==========================================================
FINOVA ACCOUNTING SYSTEM
GENERAL JOURNAL SERVICE
Version : 1.0.0
==========================================================
*/

/*
==========================================================
SUPABASE
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";
class JournalService {

    
    /*
    ==========================================================
    GET ALL
    ==========================================================
    */

    static async getAll() {

        const { data, error } = await supabase

            .from(TABLE.GL_JOURNAL)

            .select("*")

            .order(
                "journal_date",
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

        if (error) {

            throw error;

        }

        return data;

    }
    /*
==========================================================
GET BY ID
==========================================================
*/

static async getById(id) {

    /*
    ==========================================
    HEADER
    ==========================================
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
    ==========================================
    DETAIL
    ==========================================
    */

    const {

        data: details,

        error: detailError

    } = await supabase

        .from(TABLE.GL_JOURNAL_DETAIL)

        .select(`
            *,
            mst_chart_of_accounts (
                account_code,
                account_name
            ),
            mst_business_partner (
                bp_code,
                bp_name
            )
        `)

        .eq("journal_id", id)

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
    ==========================================
    RETURN
    ==========================================
    */

    return {

        header,

        details

    };

}
/*
==========================================================
GENERATE JOURNAL NUMBER
==========================================================
*/

static async generateJournalNumber() {

    /*
    ==========================================
    PREFIX
    ==========================================
    */

    const now = new Date();

    const year = now.getFullYear();

    const month = String(

        now.getMonth() + 1

    ).padStart(2, "0");

    const prefix = `JV-${year}${month}-`;

    /*
    ==========================================
    LAST NUMBER
    ==========================================
    */

    const { data } = await supabase

        .from(TABLE.GL_JOURNAL)

        .select("journal_no")

        .like(

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

    /*
    ==========================================
    SEQUENCE
    ==========================================
    */

    let sequence = 1;

    if (data && data.length > 0) {

        sequence =

            Number(

                data[0]

                    .journal_no

                    .split("-")[2]

            ) + 1;

    }

    /*
    ==========================================
    RETURN
    ==========================================
    */

    return (

        prefix +

        String(sequence)

            .padStart(5, "0")

    );

}   
/*
==========================================================
INSERT JOURNAL
==========================================================
*/

static async insert(header, details) {

    /*
    ==========================================
    GENERATE JOURNAL NUMBER
    ==========================================
    */

    header.journal_no =

        await this.generateJournalNumber();

    /*
    ==========================================
    TIMESTAMP
    ==========================================
    */

    header.created_at =

        new Date().toISOString();

    header.updated_at =

        new Date().toISOString();
    
    /*
==========================================
CREATED BY
==========================================
*/

header.created_by = null;

    /*
    ==========================================
    INSERT HEADER
    ==========================================
    */

    const {

        data: journal,

        error: journalError

    } = await supabase

        .from(TABLE.GL_JOURNAL)

        .insert(header)

        .select()

        .single();

    if (journalError) {

        throw journalError;

    }

    /*
    ==========================================
    PREPARE DETAIL
    ==========================================
    */

    const rows =

        details.map(

            (item, index) => ({

                journal_id: journal.id,

                line_no: index + 1,

                account_id: item.account_id,

                business_partner_id:

                    item.business_partner_id || null,

                description:

                    item.description || null,

                debit:

                    item.debit || 0,

                credit:

                    item.credit || 0

            })

        );

    /*
    ==========================================
    INSERT DETAIL
    ==========================================
    */

    const {

        error: detailError

    } = await supabase

        .from(TABLE.GL_JOURNAL_DETAIL)

        .insert(rows);

    if (detailError) {

        throw detailError;

    }

    /*
    ==========================================
    RETURN
    ==========================================
    */

    return journal;

}
/*
==========================================================
UPDATE JOURNAL
==========================================================
*/

static async update(id, header, details) {

    /*
    ==========================================
    UPDATE HEADER
    ==========================================
    */

    header.updated_at =
        new Date().toISOString();

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
    ==========================================
    DELETE OLD DETAIL
    ==========================================
    */

    const {

        error: deleteError

    } = await supabase

        .from(TABLE.GL_JOURNAL_DETAIL)

        .delete()

        .eq("journal_id", id);

    if (deleteError) {

        throw deleteError;

    }

    /*
    ==========================================
    PREPARE DETAIL
    ==========================================
    */

    const rows =

        details.map(

            (item, index) => ({

                journal_id: id,

                line_no: index + 1,

                account_id: item.account_id,

                business_partner_id:
                    item.business_partner_id || null,

                description:
                    item.description || null,

                debit:
                    item.debit || 0,

                credit:
                    item.credit || 0

            })

        );

    /*
    ==========================================
    INSERT NEW DETAIL
    ==========================================
    */

    const {

        error: detailError

    } = await supabase

        .from(TABLE.GL_JOURNAL_DETAIL)

        .insert(rows);

    if (detailError) {

        throw detailError;

    }

    return true;

}
/*
==========================================================
DELETE JOURNAL
==========================================================
*/

static async delete(id) {

    /*
    ==========================================
    GET HEADER
    ==========================================
    */

    const journal =

        await this.getById(id);

    /*
    ==========================================
    VALIDATE
    ==========================================
    */

    if (

        journal.header.status === "Posted"

    ) {

        throw new Error(

            "Posted journal cannot be deleted."

        );

    }

    /*
    ==========================================
    DELETE DETAIL
    ==========================================
    */

    const {

        error: detailError

    } = await supabase

        .from(TABLE.GL_JOURNAL_DETAIL)

        .delete()

        .eq("journal_id", id);

    if (detailError) {

        throw detailError;

    }

    /*
    ==========================================
    DELETE HEADER
    ==========================================
    */

    const {

        error: headerError

    } = await supabase

        .from(TABLE.GL_JOURNAL)

        .delete()

        .eq("id", id);

    if (headerError) {

        throw headerError;

    }

    return true;

}
/*
==========================================================
POST JOURNAL
==========================================================
*/

static async posting(id) {

    /*
    ==========================================
    LOAD JOURNAL
    ==========================================
    */

    const journal =

        await this.getById(id);

    /*
    ==========================================
    TOTAL
    ==========================================
    */

    const totalDebit =

        journal.details.reduce(

            (sum, item) =>

                sum + Number(item.debit),

            0

        );

    const totalCredit =

        journal.details.reduce(

            (sum, item) =>

                sum + Number(item.credit),

            0

        );

    /*
    ==========================================
    VALIDATION
    ==========================================
    */

    if (totalDebit !== totalCredit) {

        throw new Error(

            "Journal is not balanced."

        );

    }

    /*
    ==========================================
    UPDATE HEADER
    ==========================================
    */

    const {

        error

    } = await supabase

        .from(TABLE.GL_JOURNAL)

        .update({

            total_debit: totalDebit,

            total_credit: totalCredit,

            status: "Posted"

        })

        .eq("id", id);

    if (error) {

        throw error;

    }

    return true;

}
}

/*
==========================================================
EXPORT
==========================================================
*/

window.JournalService = JournalService;
/*
==========================================================
EXPORT
==========================================================
*/
export {
    JournalService
};
