/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : ACCOUNTING PERIOD
FILE    : accounting-period.service.js
VERSION : 1.0.0 FINAL
==========================================================
*/

import {
    supabase
} from "../assets/js/core/supabase.js";


/*
==========================================================
ACCOUNTING PERIOD SERVICE
==========================================================
*/

export class AccountingPeriodService {


    /*
    ======================================================
    GET ALL ACCOUNTING PERIOD
    ======================================================
    */

    async getAll() {

        try {

            const {
                data,
                error
            } =
                await supabase

                    .from(
                        "mst_accounting_period"
                    )

                    .select(`
                        id,
                        period,
                        month,
                        year,
                        start_date,
                        end_date,
                        status,
                        closed_at,
                        closed_by,
                        reopened_at,
                        reopened_by,
                        created_at,
                        updated_at
                    `)

                    .order(
                        "year",
                        {
                            ascending: true
                        }
                    )

                    .order(
                        "month",
                        {
                            ascending: true
                        }
                    );


            if (
                error
            ) {

                throw error;

            }


            return (
                data
                ||
                []
            );

        }

        catch (
            error
        ) {

            console.error(
                "AccountingPeriodService.getAll:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    GET PERIOD BY ID
    ======================================================
    */

    async getById(
        id
    ) {

        try {

            if (
                !id
            ) {

                throw new Error(
                    "Accounting Period ID is required."
                );

            }


            const {
                data,
                error
            } =
                await supabase

                    .from(
                        "mst_accounting_period"
                    )

                    .select(`
                        id,
                        period,
                        month,
                        year,
                        start_date,
                        end_date,
                        status,
                        closed_at,
                        closed_by,
                        reopened_at,
                        reopened_by,
                        created_at,
                        updated_at
                    `)

                    .eq(
                        "id",
                        id
                    )

                    .single();


            if (
                error
            ) {

                throw error;

            }


            return data;

        }

        catch (
            error
        ) {

            console.error(
                "AccountingPeriodService.getById:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    GET HISTORY
    ======================================================
    */

    async getHistory(
        accountingPeriodId
    ) {

        try {

            if (
                !accountingPeriodId
            ) {

                return [];

            }


            const {
                data,
                error
            } =
                await supabase

                    .from(
                        "trx_accounting_period_history"
                    )

                    .select(`
                        id,
                        accounting_period_id,
                        period,
                        action,
                        previous_status,
                        new_status,
                        reason,
                        action_by,
                        action_at
                    `)

                    .eq(
                        "accounting_period_id",
                        accountingPeriodId
                    )

                    .order(
                        "action_at",
                        {
                            ascending: false
                        }
                    );


            if (
                error
            ) {

                throw error;

            }


            return (
                data
                ||
                []
            );

        }

        catch (
            error
        ) {

            console.error(
                "AccountingPeriodService.getHistory:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    CLOSE ACCOUNTING PERIOD
    ======================================================
    */

    async closePeriod(
        periodId,
        reason = null
    ) {

        try {

            if (
                !periodId
            ) {

                throw new Error(
                    "Accounting Period ID is required."
                );

            }


            const {
                data,
                error
            } =
                await supabase.rpc(
                    "close_accounting_period",
                    {

                        p_period_id:
                            periodId,

                        p_reason:
                            reason
                            ?
                            String(
                                reason
                            ).trim()
                            :
                            null

                    }
                );


            if (
                error
            ) {

                throw error;

            }


            return data;

        }

        catch (
            error
        ) {

            console.error(
                "AccountingPeriodService.closePeriod:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    REOPEN ACCOUNTING PERIOD
    ======================================================
    */

    async reopenPeriod(
        periodId,
        reason
    ) {

        try {

            if (
                !periodId
            ) {

                throw new Error(
                    "Accounting Period ID is required."
                );

            }


            const reopenReason =
                String(
                    reason
                    ||
                    ""
                )
                .trim();


            if (
                !reopenReason
            ) {

                throw new Error(
                    "Reason is required to reopen Accounting Period."
                );

            }


            const {
                data,
                error
            } =
                await supabase.rpc(
                    "reopen_accounting_period",
                    {

                        p_period_id:
                            periodId,

                        p_reason:
                            reopenReason

                    }
                );


            if (
                error
            ) {

                throw error;

            }


            return data;

        }

        catch (
            error
        ) {

            console.error(
                "AccountingPeriodService.reopenPeriod:",
                error
            );


            throw error;

        }

    }

}