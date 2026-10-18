/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : ACCOUNTING PERIOD
FILE    : accounting-period.service.js
VERSION : 1.1.0 FINAL
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

                    /*
                    ==========================================
                    ORDER
                    2026 -> 2030
                    JANUARY -> DECEMBER
                    ==========================================
                    */

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
    GET ACCOUNTING PERIOD BY ID
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
    GET ACCOUNTING PERIOD HISTORY
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
    OPEN ACCOUNTING PERIOD

    USED FOR:
    CLOSED PERIOD THAT HAS NEVER BEEN CLOSED BEFORE

    DATABASE RPC:
    open_accounting_period
    ======================================================
    */

    async openPeriod(
        periodId,
        reason
    ) {

        try {

            /*
            ==================================================
            VALIDATE PERIOD ID
            ==================================================
            */

            if (
                !periodId
            ) {

                throw new Error(
                    "Accounting Period ID is required."
                );

            }


            /*
            ==================================================
            VALIDATE REASON
            ==================================================
            */

            const openReason =
                String(
                    reason
                    ||
                    ""
                )
                .trim();


            if (
                !openReason
            ) {

                throw new Error(
                    "Reason is required to open Accounting Period."
                );

            }


            /*
            ==================================================
            CALL DATABASE RPC
            ==================================================
            */

            const {
                data,
                error
            } =
                await supabase.rpc(
                    "open_accounting_period",
                    {

                        p_period_id:
                            periodId,

                        p_reason:
                            openReason

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
                "AccountingPeriodService.openPeriod:",
                error
            );


            throw error;

        }

    }


    /*
    ======================================================
    CLOSE ACCOUNTING PERIOD

    DATABASE RPC:
    close_accounting_period
    ======================================================
    */

    async closePeriod(
        periodId,
        reason = null
    ) {

        try {

            /*
            ==================================================
            VALIDATE PERIOD ID
            ==================================================
            */

            if (
                !periodId
            ) {

                throw new Error(
                    "Accounting Period ID is required."
                );

            }


            /*
            ==================================================
            PREPARE REASON
            ==================================================
            */

            const closeReason =
                reason
                    ?
                    String(
                        reason
                    )
                    .trim()
                    :
                    null;


            /*
            ==================================================
            CALL DATABASE RPC
            ==================================================
            */

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
                            closeReason
                            ||
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

    USED FOR:
    PERIOD THAT HAS PREVIOUSLY BEEN CLOSED

    DATABASE RPC:
    reopen_accounting_period
    ======================================================
    */

    async reopenPeriod(
        periodId,
        reason
    ) {

        try {

            /*
            ==================================================
            VALIDATE PERIOD ID
            ==================================================
            */

            if (
                !periodId
            ) {

                throw new Error(
                    "Accounting Period ID is required."
                );

            }


            /*
            ==================================================
            VALIDATE REASON
            ==================================================
            */

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


            /*
            ==================================================
            CALL DATABASE RPC
            ==================================================
            */

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