/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : ACCOUNTING PERIOD
FILE    : accounting-period.js
VERSION : 1.0.0 FINAL
==========================================================
*/

import {
    AccountingPeriodService
} from "../../service/accounting-period.service.js";


export class AccountingPeriod {


    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor() {

        /*
        ==================================================
        SERVICE
        ==================================================
        */

        this.service =
            new AccountingPeriodService();


        /*
        ==================================================
        DATA
        ==================================================
        */

        this.data =
            [];

        this.filteredData =
            [];


        /*
        ==================================================
        FILTER DOM
        ==================================================
        */

        this.tableBody =
            null;

        this.filterYear =
            null;

        this.filterStatus =
            null;

        this.filterSearch =
            null;

        this.btnFind =
            null;

        this.btnRefresh =
            null;


        /*
        ==================================================
        ACTION MODAL
        ==================================================
        */

        this.actionModal =
            null;

        this.selectedPeriod =
            null;

        this.selectedAction =
            null;

        this.periodHistoryCache =
            new Map();


        /*
        ==================================================
        SELF INITIALIZE
        ==================================================
        */

        this.init();

    }


    /*
    ======================================================
    INITIALIZE
    ======================================================
    */

    async init() {

        try {

            this.cacheDom();

            this.bindEvents();

            await this.loadData();

        }

        catch (
            error
        ) {

            console.error(
                "AccountingPeriod.init:",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to initialize Accounting Period."
            );

        }

    }


    /*
    ======================================================
    CACHE DOM
    ======================================================
    */

    cacheDom() {

        /*
        ==================================================
        TABLE
        ==================================================
        */

        this.tableBody =
            document.getElementById(
                "accounting-period-tbody"
            );


        /*
        ==================================================
        FILTER
        ==================================================
        */

        this.filterYear =
            document.getElementById(
                "accounting-period-year"
            );


        this.filterStatus =
            document.getElementById(
                "accounting-period-status"
            );


        this.filterSearch =
            document.getElementById(
                "accounting-period-search"
            );


        this.btnFind =
            document.getElementById(
                "btn-find-accounting-period"
            );


        this.btnRefresh =
            document.getElementById(
                "btn-refresh-accounting-period"
            );


        /*
        ==================================================
        ACTION MODAL
        ==================================================
        */

        this.actionModalElement =
            document.getElementById(
                "accountingPeriodActionModal"
            );


        this.actionModalLabel =
            document.getElementById(
                "accountingPeriodActionModalLabel"
            );


        this.actionIcon =
            document.getElementById(
                "accounting-period-action-icon"
            );


        this.actionTitle =
            document.getElementById(
                "accounting-period-action-title"
            );


        this.actionMessage =
            document.getElementById(
                "accounting-period-action-message"
            );


        this.modalPeriod =
            document.getElementById(
                "accounting-period-modal-period"
            );


        this.modalStartDate =
            document.getElementById(
                "accounting-period-modal-start-date"
            );


        this.modalEndDate =
            document.getElementById(
                "accounting-period-modal-end-date"
            );


        this.modalStatus =
            document.getElementById(
                "accounting-period-modal-status"
            );


        this.actionReason =
            document.getElementById(
                "accounting-period-action-reason"
            );


        this.reasonRequired =
            document.getElementById(
                "accounting-period-reason-required"
            );


        this.reasonHelp =
            document.getElementById(
                "accounting-period-reason-help"
            );


        this.modalError =
            document.getElementById(
                "accounting-period-modal-error"
            );


        this.btnConfirmAction =
            document.getElementById(
                "btn-confirm-accounting-period-action"
            );


        this.confirmIcon =
            document.getElementById(
                "accounting-period-confirm-icon"
            );


        this.confirmText =
            document.getElementById(
                "accounting-period-confirm-text"
            );


        /*
        ==================================================
        BOOTSTRAP MODAL INSTANCE
        ==================================================
        */

        if (
            this.actionModalElement
            &&
            window.bootstrap
        ) {

            this.actionModal =
                bootstrap.Modal
                    .getOrCreateInstance(
                        this.actionModalElement
                    );

        }

    }


    /*
    ======================================================
    BIND EVENTS
    ======================================================
    */

    bindEvents() {


        /*
        ==================================================
        REFRESH
        ==================================================
        */

        this.btnRefresh?.addEventListener(

            "click",

            async () => {

                await this.loadData();

            }

        );


        /*
        ==================================================
        FIND
        ==================================================
        */

        this.btnFind?.addEventListener(

            "click",

            () => {

                this.applyFilter();

            }

        );


        /*
        ==================================================
        YEAR
        ==================================================
        */

        this.filterYear?.addEventListener(

            "change",

            () => {

                this.applyFilter();

            }

        );


        /*
        ==================================================
        STATUS
        ==================================================
        */

        this.filterStatus?.addEventListener(

            "change",

            () => {

                this.applyFilter();

            }

        );


        /*
        ==================================================
        SEARCH ENTER
        ==================================================
        */

        this.filterSearch?.addEventListener(

            "keydown",

            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    this.applyFilter();

                }

            }

        );


        /*
        ==================================================
        TABLE ACTION
        ==================================================
        */

        this.tableBody?.addEventListener(

            "click",

            async event => {

                const button =
                    event.target.closest(
                        "[data-period-action]"
                    );


                if (
                    !button
                ) {

                    return;

                }


                const action =
                    String(
                        button.dataset.periodAction
                        ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                const id =
                    Number(
                        button.dataset.id
                    );


                if (
                    !id
                ) {

                    return;

                }


                if (
                    action ===
                    "close"
                ) {

                    this.openClosePeriod(
                        id
                    );

                    return;

                }


                if (
                    action ===
                    "open"
                ) {

                    this.openPeriod(
                        id
                    );

                    return;

                }


                if (
                    action ===
                    "reopen"
                ) {

                    this.openReopenPeriod(
                        id
                    );

                }

            }

        );


        /*
        ==================================================
        CONFIRM ACTION
        ==================================================
        */

        this.btnConfirmAction?.addEventListener(

            "click",

            async () => {

                await this.confirmPeriodAction();

            }

        );


        /*
        ==================================================
        CLEAR REASON VALIDATION
        ==================================================
        */

        this.actionReason?.addEventListener(

            "input",

            () => {

                this.actionReason
                    ?.classList
                    .remove(
                        "is-invalid"
                    );


                this.hideModalError();

            }

        );


        /*
        ==================================================
        MODAL HIDDEN
        ==================================================
        */

        this.actionModalElement?.addEventListener(

            "hidden.bs.modal",

            () => {

                this.resetActionModal();

            }

        );

    }


    /*
    ======================================================
    LOAD DATA
    ======================================================
    */

    async loadData() {

        try {

            this.renderLoading();


            /*
            ==================================================
            MASTER PERIOD
            ==================================================
            */

            this.data =
                await this.service
                    .getAll();


            /*
            ==================================================
            CLEAR OLD HISTORY CACHE
            ==================================================
            */

            this.periodHistoryCache.clear();


            /*
            ==================================================
            DETERMINE OPEN / REOPEN BUTTON
            ==================================================
            */

            await this.preparePeriodActions();


            /*
            ==================================================
            COPY FILTER DATA
            ==================================================
            */

            this.filteredData =
                [
                    ...this.data
                ];


            /*
            ==================================================
            FILTER
            ==================================================
            */

            this.populateYearFilter();

            this.applyFilter();

        }

        catch (
            error
        ) {

            console.error(
                "AccountingPeriod.loadData:",
                error
            );


            if (
                this.tableBody
            ) {

                this.tableBody.innerHTML = `

                    <tr>

                        <td
                            colspan="8"
                            class="
                                text-center
                                text-danger
                                py-5
                            ">

                            Failed to load Accounting Period.

                        </td>

                    </tr>

                `;

            }


            this.showError(
                error?.message
                ||
                "Failed to load Accounting Period."
            );

        }

    }


    /*
    ======================================================
    PREPARE PERIOD ACTION

    OPEN PERIOD:
    STATUS OPEN
        -> CLOSE

    CLOSED PERIOD:
    HAS CLOSE HISTORY
        -> REOPEN

    LEGACY PAST CLOSED PERIOD
        -> REOPEN

    FUTURE CLOSED PERIOD
        -> OPEN
    ======================================================
    */

    async preparePeriodActions() {

        if (
            !Array.isArray(
                this.data
            )
            ||
            !this.data.length
        ) {

            return;

        }


        const today =
            this.getJakartaToday();


        const closedPeriods =
            this.data.filter(

                item =>

                    String(
                        item.status
                        ||
                        ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    "closed"

            );


        await Promise.all(

            closedPeriods.map(

                async item => {

                    let hasCloseHistory =
                        false;


                    try {

                        const history =
                            await this.getPeriodHistory(
                                item.id
                            );


                        hasCloseHistory =
                            history.some(

                                historyItem =>

                                    String(
                                        historyItem.action
                                        ||
                                        ""
                                    )
                                    .trim()
                                    .toUpperCase()
                                    ===
                                    "CLOSE"

                            );

                    }

                    catch (
                        error
                    ) {

                        /*
                        ======================================
                        HISTORY FAILURE MUST NOT BLOCK PAGE
                        ======================================
                        */

                        console.warn(
                            "Accounting Period history unavailable:",
                            item.period,
                            error
                        );

                    }


                    /*
                    ==========================================
                    PERIOD ALREADY CLOSED BY NEW SYSTEM
                    ==========================================
                    */

                    if (
                        hasCloseHistory
                    ) {

                        item._periodAction =
                            "reopen";

                        return;

                    }


                    /*
                    ==========================================
                    LEGACY CLOSED PERIOD

                    Example:
                    Jan-Aug 2026 were already Closed before
                    history feature existed.
                    ==========================================
                    */

                    if (
                        item.start_date
                        &&
                        String(
                            item.start_date
                        )
                        <=
                        today
                    ) {

                        item._periodAction =
                            "reopen";

                        return;

                    }


                    /*
                    ==========================================
                    FUTURE PERIOD

                    Example:
                    Oct 2026 - Dec 2030
                    ==========================================
                    */

                    item._periodAction =
                        "open";

                }

            )

        );


        /*
        ==================================================
        OPEN PERIOD ALWAYS CLOSE
        ==================================================
        */

        this.data.forEach(

            item => {

                const status =
                    String(
                        item.status
                        ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                if (
                    status ===
                    "open"
                ) {

                    item._periodAction =
                        "close";

                }

            }

        );

    }


    /*
    ======================================================
    GET JAKARTA TODAY
    YYYY-MM-DD
    ======================================================
    */

    getJakartaToday() {

        try {

            const parts =
                new Intl.DateTimeFormat(
                    "en-CA",
                    {
                        timeZone:
                            "Asia/Jakarta",

                        year:
                            "numeric",

                        month:
                            "2-digit",

                        day:
                            "2-digit"
                    }
                )
                .formatToParts(
                    new Date()
                );


            const map =
                {};


            parts.forEach(

                part => {

                    map[
                        part.type
                    ] =
                        part.value;

                }

            );


            return (
                `${map.year}-${map.month}-${map.day}`
            );

        }

        catch (
            error
        ) {

            const now =
                new Date();


            const year =
                now.getFullYear();


            const month =
                String(
                    now.getMonth() + 1
                )
                .padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    now.getDate()
                )
                .padStart(
                    2,
                    "0"
                );


            return (
                `${year}-${month}-${day}`
            );

        }

    }


    /*
    ======================================================
    POPULATE YEAR FILTER
    ======================================================
    */

    populateYearFilter() {

        if (
            !this.filterYear
        ) {

            return;

        }


        const currentValue =
            this.filterYear.value;


        const years =
            [
                ...new Set(

                    this.data.map(

                        item =>
                            Number(
                                item.year
                            )

                    )

                )
            ]

            .filter(
                Boolean
            )

            .sort(
                (
                    a,
                    b
                ) =>
                    b - a
            );


        this.filterYear.innerHTML = `

            <option value="">
                All Year
            </option>

            ${
                years.map(

                    year => `

                        <option value="${year}">
                            ${year}
                        </option>

                    `

                )
                .join("")
            }

        `;


        if (
            years.includes(
                Number(
                    currentValue
                )
            )
        ) {

            this.filterYear.value =
                currentValue;

        }

    }


    /*
    ======================================================
    APPLY FILTER
    ======================================================
    */

    applyFilter() {

        const year =
            String(
                this.filterYear?.value
                ||
                ""
            );


        const status =
            String(
                this.filterStatus?.value
                ||
                ""
            );


        const keyword =
            String(
                this.filterSearch?.value
                ||
                ""
            )
            .trim()
            .toLowerCase();


        this.filteredData =
            this.data.filter(

                item => {


                    /*
                    ==========================================
                    YEAR
                    ==========================================
                    */

                    if (
                        year
                        &&
                        String(
                            item.year
                        )
                        !==
                        year
                    ) {

                        return false;

                    }


                    /*
                    ==========================================
                    STATUS
                    ==========================================
                    */

                    if (
                        status
                        &&
                        String(
                            item.status
                        )
                        !==
                        status
                    ) {

                        return false;

                    }


                    /*
                    ==========================================
                    SEARCH
                    ==========================================
                    */

                    if (
                        keyword
                    ) {

                        const searchable =
                            [
                                item.period,
                                item.year,
                                item.month,
                                item.status
                            ]
                            .join(
                                " "
                            )
                            .toLowerCase();


                        if (
                            !searchable.includes(
                                keyword
                            )
                        ) {

                            return false;

                        }

                    }


                    return true;

                }

            );


        this.renderTable();

    }


    /*
    ======================================================
    RENDER TABLE
    ======================================================
    */

    renderTable() {

        if (
            !this.tableBody
        ) {

            return;

        }


        if (
            !this.filteredData.length
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="
                            text-center
                            text-muted
                            py-5
                        ">

                        No Accounting Period found.

                    </td>

                </tr>

            `;


            return;

        }


        this.tableBody.innerHTML =
            this.filteredData

                .map(

                    (
                        item,
                        index
                    ) =>
                        this.createRow(
                            item,
                            index + 1
                        )

                )

                .join("");

    }


    /*
    ======================================================
    CREATE ROW
    ======================================================
    */

    createRow(
        item,
        rowNumber
    ) {

        const normalizedStatus =
            String(
                item.status
                ||
                ""
            )
            .trim()
            .toLowerCase();


        const isOpen =
            normalizedStatus ===
            "open";


        /*
        ==================================================
        STATUS
        ==================================================
        */

        const statusBadge =
            isOpen

                ?
                `
                    <span class="badge bg-success">
                        Open
                    </span>
                `

                :
                `
                    <span class="badge bg-secondary">
                        Closed
                    </span>
                `;


        /*
        ==================================================
        ACTION
        ==================================================
        */

        const periodAction =
            String(
                item._periodAction
                ||
                (
                    isOpen
                        ?
                        "close"
                        :
                        "open"
                )
            )
            .toLowerCase();


        let actionButton =
            "";


        if (
            periodAction ===
            "close"
        ) {

            actionButton = `

                <button
                    type="button"
                    class="
                        btn
                        btn-sm
                        btn-outline-danger
                    "
                    data-period-action="close"
                    data-id="${item.id}">

                    <i class="fa-solid fa-lock me-1"></i>

                    Close

                </button>

            `;

        }


        else if (
            periodAction ===
            "reopen"
        ) {

            actionButton = `

                <button
                    type="button"
                    class="
                        btn
                        btn-sm
                        btn-outline-warning
                    "
                    data-period-action="reopen"
                    data-id="${item.id}">

                    <i class="fa-solid fa-rotate-left me-1"></i>

                    Reopen

                </button>

            `;

        }


        else {

            actionButton = `

                <button
                    type="button"
                    class="
                        btn
                        btn-sm
                        btn-outline-success
                    "
                    data-period-action="open"
                    data-id="${item.id}">

                    <i class="fa-solid fa-lock-open me-1"></i>

                    Open

                </button>

            `;

        }


        /*
        ==================================================
        ROW
        ==================================================
        */

        return `

            <tr>


                <!-- NO -->

                <td class="finova-table-index">

                    ${rowNumber}

                </td>


                <!-- PERIOD -->

                <td class="finova-table-code">

                    <strong>

                        ${this.escapeHTML(
                            item.period
                        )}

                    </strong>

                </td>


                <!-- START DATE -->

                <td class="finova-table-date">

                    ${this.formatDate(
                        item.start_date
                    )}

                </td>


                <!-- END DATE -->

                <td class="finova-table-date">

                    ${this.formatDate(
                        item.end_date
                    )}

                </td>


                <!-- STATUS -->

                <td class="finova-table-status">

                    ${statusBadge}

                </td>


                <!-- LAST CLOSED -->

                <td class="finova-table-date">

                    ${this.formatDateTime(
                        item.closed_at
                    )}

                </td>


                <!-- LAST REOPENED -->

                <td class="finova-table-date">

                    ${this.formatDateTime(
                        item.reopened_at
                    )}

                </td>


                <!-- ACTION -->

                <td class="finova-table-action">

                    ${actionButton}

                </td>

            </tr>

        `;

    }


    /*
    ======================================================
    FIND PERIOD BY ID
    ======================================================
    */

    findPeriodById(
        id
    ) {

        return (
            this.data.find(

                item =>

                    Number(
                        item.id
                    )
                    ===
                    Number(
                        id
                    )

            )
            ||
            null
        );

    }


    /*
    ======================================================
    GET PERIOD HISTORY
    ======================================================
    */

    async getPeriodHistory(
        periodId,
        forceReload = false
    ) {

        const key =
            Number(
                periodId
            );


        if (
            !forceReload
            &&
            this.periodHistoryCache.has(
                key
            )
        ) {

            return (
                this.periodHistoryCache.get(
                    key
                )
                ||
                []
            );

        }


        const history =
            await this.service
                .getHistory(
                    periodId
                );


        this.periodHistoryCache.set(
            key,
            history
            ||
            []
        );


        return (
            history
            ||
            []
        );

    }


    /*
    ======================================================
    CLOSE PERIOD
    ======================================================
    */

    openClosePeriod(
        id
    ) {

        const period =
            this.findPeriodById(
                id
            );


        if (
            !period
        ) {

            this.showError(
                "Accounting Period not found."
            );

            return;

        }


        this.openPeriodActionModal(
            period,
            "CLOSE"
        );

    }


    /*
    ======================================================
    OPEN PERIOD
    ======================================================
    */

    openPeriod(
        id
    ) {

        const period =
            this.findPeriodById(
                id
            );


        if (
            !period
        ) {

            this.showError(
                "Accounting Period not found."
            );

            return;

        }


        this.openPeriodActionModal(
            period,
            "OPEN"
        );

    }


    /*
    ======================================================
    REOPEN PERIOD
    ======================================================
    */

    openReopenPeriod(
        id
    ) {

        const period =
            this.findPeriodById(
                id
            );


        if (
            !period
        ) {

            this.showError(
                "Accounting Period not found."
            );

            return;

        }


        this.openPeriodActionModal(
            period,
            "REOPEN"
        );

    }


    /*
    ======================================================
    OPEN ACTION MODAL
    ======================================================
    */

    openPeriodActionModal(
        period,
        action
    ) {

        if (
            !this.actionModal
        ) {

            this.showError(
                "Accounting Period confirmation modal not found."
            );

            return;

        }


        this.selectedPeriod =
            period;


        this.selectedAction =
            String(
                action
                ||
                ""
            )
            .trim()
            .toUpperCase();


        /*
        ==================================================
        RESET REASON
        ==================================================
        */

        if (
            this.actionReason
        ) {

            this.actionReason.value =
                "";

            this.actionReason.classList.remove(
                "is-invalid"
            );

        }


        this.hideModalError();


        /*
        ==================================================
        PERIOD INFORMATION
        ==================================================
        */

        if (
            this.modalPeriod
        ) {

            this.modalPeriod.textContent =
                period.period
                ||
                "-";

        }


        if (
            this.modalStartDate
        ) {

            this.modalStartDate.textContent =
                this.formatDate(
                    period.start_date
                );

        }


        if (
            this.modalEndDate
        ) {

            this.modalEndDate.textContent =
                this.formatDate(
                    period.end_date
                );

        }


        if (
            this.modalStatus
        ) {

            const isOpen =
                String(
                    period.status
                    ||
                    ""
                )
                .trim()
                .toLowerCase()
                ===
                "open";


            this.modalStatus.innerHTML =
                isOpen

                    ?
                    `
                        <span class="badge bg-success">
                            Open
                        </span>
                    `

                    :
                    `
                        <span class="badge bg-secondary">
                            Closed
                        </span>
                    `;

        }


        /*
        ==================================================
        CONFIGURE MODAL
        ==================================================
        */

        switch (
            this.selectedAction
        ) {

            case "OPEN":

                this.configureOpenModal();

                break;


            case "CLOSE":

                this.configureCloseModal();

                break;


            case "REOPEN":

                this.configureReopenModal();

                break;


            default:

                this.showError(
                    "Invalid Accounting Period action."
                );

                return;

        }


        /*
        ==================================================
        SHOW MODAL
        ==================================================
        */

        this.actionModal.show();


        window.setTimeout(

            () => {

                this.actionReason?.focus();

            },

            200

        );

    }


    /*
    ======================================================
    CONFIGURE OPEN MODAL
    ======================================================
    */

    configureOpenModal() {

        const period =
            this.selectedPeriod?.period
            ||
            "-";


        this.actionModalLabel.textContent =
            "Confirm Open Accounting Period";


        this.actionIcon.innerHTML = `

            <i
                class="
                    fa-solid
                    fa-lock-open
                    text-success
                ">
            </i>

        `;


        this.actionTitle.textContent =
            `Open Accounting Period ${period}?`;


        this.actionMessage.textContent =
            "Accounting transactions will be allowed for this period.";


        this.reasonRequired
            ?.classList
            .remove(
                "d-none"
            );


        if (
            this.reasonHelp
        ) {

            this.reasonHelp.textContent =
                "Reason is required to open this Accounting Period.";

        }


        if (
            this.btnConfirmAction
        ) {

            this.btnConfirmAction.className =
                "btn btn-success finova-btn";

        }


        if (
            this.confirmIcon
        ) {

            this.confirmIcon.className =
                "fa-solid fa-lock-open me-1";

        }


        if (
            this.confirmText
        ) {

            this.confirmText.textContent =
                "Open Period";

        }

    }


    /*
    ======================================================
    CONFIGURE CLOSE MODAL
    ======================================================
    */

    configureCloseModal() {

        const period =
            this.selectedPeriod?.period
            ||
            "-";


        this.actionModalLabel.textContent =
            "Confirm Close Accounting Period";


        this.actionIcon.innerHTML = `

            <i
                class="
                    fa-solid
                    fa-lock
                    text-danger
                ">
            </i>

        `;


        this.actionTitle.textContent =
            `Close Accounting Period ${period}?`;


        this.actionMessage.textContent =
            "Accounting transactions cannot be entered or posted to this period after it is closed.";


        this.reasonRequired
            ?.classList
            .add(
                "d-none"
            );


        if (
            this.reasonHelp
        ) {

            this.reasonHelp.textContent =
                "Reason is optional for closing this Accounting Period.";

        }


        if (
            this.btnConfirmAction
        ) {

            this.btnConfirmAction.className =
                "btn btn-danger finova-btn";

        }


        if (
            this.confirmIcon
        ) {

            this.confirmIcon.className =
                "fa-solid fa-lock me-1";

        }


        if (
            this.confirmText
        ) {

            this.confirmText.textContent =
                "Close Period";

        }

    }


    /*
    ======================================================
    CONFIGURE REOPEN MODAL
    ======================================================
    */

    configureReopenModal() {

        const period =
            this.selectedPeriod?.period
            ||
            "-";


        this.actionModalLabel.textContent =
            "Confirm Reopen Accounting Period";


        this.actionIcon.innerHTML = `

            <i
                class="
                    fa-solid
                    fa-rotate-left
                    text-warning
                ">
            </i>

        `;


        this.actionTitle.textContent =
            `Reopen Accounting Period ${period}?`;


        this.actionMessage.textContent =
            "Accounting transactions will be allowed again for this previously closed period.";


        this.reasonRequired
            ?.classList
            .remove(
                "d-none"
            );


        if (
            this.reasonHelp
        ) {

            this.reasonHelp.textContent =
                "Reason is required to reopen this Accounting Period.";

        }


        if (
            this.btnConfirmAction
        ) {

            this.btnConfirmAction.className =
                "btn btn-warning finova-btn";

        }


        if (
            this.confirmIcon
        ) {

            this.confirmIcon.className =
                "fa-solid fa-rotate-left me-1";

        }


        if (
            this.confirmText
        ) {

            this.confirmText.textContent =
                "Reopen Period";

        }

    }


    /*
    ======================================================
    CONFIRM PERIOD ACTION
    ======================================================
    */

    async confirmPeriodAction() {

        if (
            !this.selectedPeriod
            ||
            !this.selectedAction
        ) {

            this.showModalError(
                "Accounting Period action is not available."
            );

            return;

        }


        const period =
            this.selectedPeriod;


        const action =
            this.selectedAction;


        const reason =
            String(
                this.actionReason?.value
                ||
                ""
            )
            .trim();


        /*
        ==================================================
        VALIDATE REASON

        OPEN   = REQUIRED
        REOPEN = REQUIRED
        CLOSE  = OPTIONAL
        ==================================================
        */

        if (
            (
                action === "OPEN"
                ||
                action === "REOPEN"
            )
            &&
            !reason
        ) {

            this.actionReason
                ?.classList
                .add(
                    "is-invalid"
                );


            this.showModalError(
                "Reason is required."
            );


            this.actionReason?.focus();


            return;

        }


        this.actionReason
            ?.classList
            .remove(
                "is-invalid"
            );


        /*
        ==================================================
        PREVENT DOUBLE CLICK
        ==================================================
        */

        if (
            this.btnConfirmAction?.disabled
        ) {

            return;

        }


        const originalButtonHTML =
            this.btnConfirmAction?.innerHTML
            ||
            "";


        if (
            this.btnConfirmAction
        ) {

            this.btnConfirmAction.disabled =
                true;


            this.btnConfirmAction.innerHTML = `

                <span
                    class="
                        spinner-border
                        spinner-border-sm
                        me-1
                    "
                    role="status"
                    aria-hidden="true">
                </span>

                Processing...

            `;

        }


        try {


            /*
            ==================================================
            CLOSE
            ==================================================
            */

            if (
                action ===
                "CLOSE"
            ) {

                await this.service
                    .closePeriod(

                        period.id,

                        reason
                        ||
                        null

                    );

            }


            /*
            ==================================================
            OPEN

            Current database RPC:
            reopen_accounting_period()

            It changes Closed -> Open.
            ==================================================
            */

            else if (
                action ===
                "OPEN"
            ) {

                await this.service
                    .reopenPeriod(

                        period.id,

                        reason

                    );

            }


            /*
            ==================================================
            REOPEN
            ==================================================
            */

            else if (
                action ===
                "REOPEN"
            ) {

                await this.service
                    .reopenPeriod(

                        period.id,

                        reason

                    );

            }


            else {

                throw new Error(
                    "Invalid Accounting Period action."
                );

            }


            /*
            ==================================================
            CLEAR HISTORY CACHE
            ==================================================
            */

            this.periodHistoryCache.delete(
                Number(
                    period.id
                )
            );


            /*
            ==================================================
            HIDE MODAL
            ==================================================
            */

            this.actionModal?.hide();


            /*
            ==================================================
            SUCCESS
            ==================================================
            */

            if (
                action ===
                "CLOSE"
            ) {

                this.showSuccess(
                    `Accounting Period ${period.period} closed successfully.`
                );

            }


            else if (
                action ===
                "REOPEN"
            ) {

                this.showSuccess(
                    `Accounting Period ${period.period} reopened successfully.`
                );

            }


            else {

                this.showSuccess(
                    `Accounting Period ${period.period} opened successfully.`
                );

            }


            /*
            ==================================================
            RELOAD
            ==================================================
            */

            await this.loadData();


            /*
            ==================================================
            RESET STATE
            ==================================================
            */

            this.selectedPeriod =
                null;


            this.selectedAction =
                null;

        }

        catch (
            error
        ) {

            console.error(
                "AccountingPeriod.confirmPeriodAction:",
                error
            );


            this.showModalError(
                error?.message
                ||
                "Failed to update Accounting Period."
            );

        }

        finally {

            if (
                this.btnConfirmAction
            ) {

                this.btnConfirmAction.disabled =
                    false;


                this.btnConfirmAction.innerHTML =
                    originalButtonHTML;

            }

        }

    }


    /*
    ======================================================
    RESET ACTION MODAL
    ======================================================
    */

    resetActionModal() {

        this.selectedPeriod =
            null;


        this.selectedAction =
            null;


        if (
            this.actionReason
        ) {

            this.actionReason.value =
                "";


            this.actionReason
                .classList
                .remove(
                    "is-invalid"
                );

        }


        this.hideModalError();

    }


    /*
    ======================================================
    SHOW MODAL ERROR
    ======================================================
    */

    showModalError(
        message
    ) {

        if (
            !this.modalError
        ) {

            this.showError(
                message
            );

            return;

        }


        this.modalError.textContent =
            String(
                message
                ||
                "Unknown error."
            );


        this.modalError.classList.remove(
            "d-none"
        );

    }


    /*
    ======================================================
    HIDE MODAL ERROR
    ======================================================
    */

    hideModalError() {

        if (
            !this.modalError
        ) {

            return;

        }


        this.modalError.textContent =
            "";


        this.modalError.classList.add(
            "d-none"
        );

    }


    /*
    ======================================================
    LOADING
    ======================================================
    */

    renderLoading() {

        if (
            !this.tableBody
        ) {

            return;

        }


        this.tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="
                        text-center
                        py-5
                    ">

                    <div
                        class="
                            d-flex
                            flex-column
                            align-items-center
                            justify-content-center
                            gap-2
                        ">

                        <div
                            class="
                                spinner-border
                                spinner-border-sm
                                text-primary
                            "
                            role="status">

                            <span class="visually-hidden">
                                Loading...
                            </span>

                        </div>


                        <div class="text-muted small">

                            Loading Accounting Period...

                        </div>

                    </div>

                </td>

            </tr>

        `;

    }


    /*
    ======================================================
    FORMAT DATE
    ======================================================
    */

    formatDate(
        value
    ) {

        if (
            !value
        ) {

            return "-";

        }


        const parts =
            String(
                value
            )
            .substring(
                0,
                10
            )
            .split("-");


        if (
            parts.length !==
            3
        ) {

            return String(
                value
            );

        }


        return (
            `${parts[2]}/${parts[1]}/${parts[0]}`
        );

    }


    /*
    ======================================================
    FORMAT DATE TIME
    WIB
    ======================================================
    */

    formatDateTime(
        value
    ) {

        if (
            !value
        ) {

            return "-";

        }


        try {

            const formatter =
                new Intl.DateTimeFormat(

                    "id-ID",

                    {

                        timeZone:
                            "Asia/Jakarta",

                        day:
                            "2-digit",

                        month:
                            "2-digit",

                        year:
                            "numeric",

                        hour:
                            "2-digit",

                        minute:
                            "2-digit",

                        hourCycle:
                            "h23"

                    }

                );


            return (
                formatter
                    .format(
                        new Date(
                            value
                        )
                    )
                    .replace(
                        ".",
                        ":"
                    )
                +
                " WIB"
            );

        }

        catch (
            error
        ) {

            return String(
                value
            );

        }

    }


    /*
    ======================================================
    BOOTSTRAP ERROR
    ======================================================
    */

    showError(
        message
    ) {

        document
            .getElementById(
                "accounting-period-alert"
            )
            ?.remove();


        const alert =
            document.createElement(
                "div"
            );


        alert.id =
            "accounting-period-alert";


        alert.className =
            `
                alert
                alert-danger
                alert-dismissible
                fade
                show
                shadow-sm
            `;


        alert.setAttribute(
            "role",
            "alert"
        );


        alert.innerHTML = `

            <div class="d-flex align-items-start">

                <i
                    class="
                        fa-solid
                        fa-circle-exclamation
                        me-2
                        mt-1
                    ">
                </i>


                <div class="flex-grow-1">

                    <strong>
                        Accounting Period
                    </strong>


                    <div class="small mt-1">

                        ${this.escapeHTML(
                            message
                        )}

                    </div>

                </div>


                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Close">
                </button>

            </div>

        `;


        const page =
            document.querySelector(
                ".accounting-period-page"
            );


        page?.prepend(
            alert
        );


        window.setTimeout(

            () => {

                if (
                    alert.isConnected
                    &&
                    window.bootstrap
                ) {

                    bootstrap.Alert
                        .getOrCreateInstance(
                            alert
                        )
                        .close();

                }

            },

            7000

        );

    }


    /*
    ======================================================
    BOOTSTRAP SUCCESS
    ======================================================
    */

    showSuccess(
        message
    ) {

        document
            .getElementById(
                "accounting-period-success-alert"
            )
            ?.remove();


        const alert =
            document.createElement(
                "div"
            );


        alert.id =
            "accounting-period-success-alert";


        alert.className =
            `
                alert
                alert-success
                alert-dismissible
                fade
                show
                shadow-sm
            `;


        alert.setAttribute(
            "role",
            "alert"
        );


        alert.innerHTML = `

            <div class="d-flex align-items-start">

                <i
                    class="
                        fa-solid
                        fa-circle-check
                        me-2
                        mt-1
                    ">
                </i>


                <div class="flex-grow-1">

                    <strong>
                        Accounting Period
                    </strong>


                    <div class="small mt-1">

                        ${this.escapeHTML(
                            message
                        )}

                    </div>

                </div>


                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Close">
                </button>

            </div>

        `;


        const page =
            document.querySelector(
                ".accounting-period-page"
            );


        page?.prepend(
            alert
        );


        window.setTimeout(

            () => {

                if (
                    alert.isConnected
                    &&
                    window.bootstrap
                ) {

                    bootstrap.Alert
                        .getOrCreateInstance(
                            alert
                        )
                        .close();

                }

            },

            5000

        );

    }


    /*
    ======================================================
    ESCAPE HTML
    ======================================================
    */

    escapeHTML(
        value
    ) {

        return String(
            value
            ??
            ""
        )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

    }

}