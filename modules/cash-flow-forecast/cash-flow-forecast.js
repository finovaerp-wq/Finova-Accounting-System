/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : CASH FLOW FORECAST
FILE    : cash-flow-forecast.js
VERSION : 1.1.0 FINAL
==========================================================
*/

import {
    CashFlowForecastService
} from "../../service/cash-flow-forecast.service.js";

import {
    CompanyReport
} from "../../assets/js/core/company-report.js";


export class CashFlowForecast {

    constructor() {

        this.service =
            new CashFlowForecastService();

        this.dataset =
            null;

        this.businessPartners =
            [];

        this.currentManual =
            null;

        this.deleteManualId =
            null;

        this.destroyed =
            false;

        this.bound =
            [];

        this.init();

    }


    /* ======================================================
       INIT
    ====================================================== */

    async init() {

        this.cacheDom();

        this.setDefaults();

        this.bindEvents();

        await this.loadBusinessPartners();

        console.log(
            "FINOVA CASH FLOW FORECAST V1.1 INITIALIZED"
        );

    }


    cacheDom() {

    this.startWeek =
        document.getElementById(
            "cff-start-week"
        );

    this.numberWeeks =
        document.getElementById(
            "cff-number-weeks"
        );

    this.btnGenerate =
        document.getElementById(
            "btn-cff-generate"
        );

    this.btnRefresh =
        document.getElementById(
            "btn-cff-refresh"
        );

    this.btnExcel =
        document.getElementById(
            "btn-cff-excel"
        );

    this.btnPdf =
        document.getElementById(
            "btn-cff-pdf"
        );

    this.btnManual =
        document.getElementById(
            "btn-cff-manual"
        );

    this.warning =
        document.getElementById(
            "cff-warning"
        );

    this.openingCash =
        document.getElementById(
            "cff-opening-cash"
        );

    this.cashIn =
        document.getElementById(
            "cff-cash-in"
        );

    this.cashOut =
        document.getElementById(
            "cff-cash-out"
        );

    this.endingCash =
        document.getElementById(
            "cff-ending-cash"
        );

    this.endingMeta =
        document.getElementById(
            "cff-ending-meta"
        );

    this.periodLabel =
        document.getElementById(
            "cff-period-label"
        );

    this.tableHead =
        document.getElementById(
            "cff-table-head"
        );

    this.tableBody =
        document.getElementById(
            "cff-table-body"
        );

    this.chart =
        document.getElementById(
            "cff-chart"
        );

    this.liquidity =
        document.getElementById(
            "cff-liquidity"
        );

    this.detailTitle =
        document.getElementById(
            "cff-detail-title"
        );

    this.detailSubtitle =
        document.getElementById(
            "cff-detail-subtitle"
        );

    this.detailBody =
        document.getElementById(
            "cff-detail-body"
        );


    /* ======================================================
       MANUAL FORECAST LIST
    ====================================================== */

    this.manualListBody =
        document.getElementById(
            "cff-manual-list-body"
        );

    this.manualTotalIn =
        document.getElementById(
            "cff-manual-total-in"
        );

    this.manualTotalOut =
        document.getElementById(
            "cff-manual-total-out"
        );


    /* ======================================================
       MANUAL FORECAST MODAL
    ====================================================== */

    this.manualModalElement =
        document.getElementById(
            "cffManualModal"
        );

    this.manualModalTitle =
        document.getElementById(
            "cff-manual-modal-title"
        );

    this.manualId =
        document.getElementById(
            "cff-manual-id"
        );

    this.manualType =
        document.getElementById(
            "cff-manual-type"
        );

    this.manualDate =
        document.getElementById(
            "cff-manual-date"
        );

    this.manualCategory =
        document.getElementById(
            "cff-manual-category"
        );

    this.manualBP =
        document.getElementById(
            "cff-manual-bp"
        );

    this.manualDescription =
        document.getElementById(
            "cff-manual-description"
        );

    this.manualAmount =
        document.getElementById(
            "cff-manual-amount"
        );

    this.manualNotes =
        document.getElementById(
            "cff-manual-notes"
        );

    this.btnManualSave =
        document.getElementById(
            "btn-cff-manual-save"
        );


    /* ======================================================
       DELETE MODAL
    ====================================================== */

    this.deleteModalElement =
        document.getElementById(
            "cffDeleteModal"
        );

    this.deleteDescription =
        document.getElementById(
            "cff-delete-description"
        );

    this.btnConfirmDelete =
        document.getElementById(
            "btn-cff-confirm-delete"
        );

    

}


    /* ======================================================
       DEFAULTS
    ====================================================== */

    setDefaults() {

        const now =
            new Date();

        const day =
            now.getDay();

        now.setDate(
            now.getDate()
            +
            (
                day === 0
                    ? -6
                    : 1 - day
            )
        );


        if (this.startWeek) {

            this.startWeek.value =
                this.toISO(now);

        }

    }


    /* ======================================================
       EVENT HELPER
    ====================================================== */

    on(
        element,
        event,
        handler
    ) {

        if (!element) {
            return;
        }

        element.addEventListener(
            event,
            handler
        );

        this.bound.push([
            element,
            event,
            handler
        ]);

    }


    /* ======================================================
       EVENTS
    ====================================================== */

    bindEvents() {

    this.on(
        this.btnGenerate,
        "click",
        () =>
            this.generate()
    );


    this.on(
    this.btnRefresh,
    "click",
    () =>
        this.refresh()
);


    this.on(
        this.btnExcel,
        "click",
        () =>
            this.downloadExcel()
    );


    this.on(
        this.btnPdf,
        "click",
        () =>
            this.previewPDF()
    );


    this.on(
        this.btnManual,
        "click",
        () =>
            this.openManualModal()
    );


    this.on(
        this.btnManualSave,
        "click",
        () =>
            this.saveManualForecast()
    );


    this.on(
        this.btnConfirmDelete,
        "click",
        () =>
            this.confirmDeleteManual()
    );


    /* ======================================================
       WEEKLY DETAIL
    ====================================================== */

    this.on(
        this.tableBody,
        "click",
        event => {

            const cell =
                event.target.closest(
                    "[data-cff-detail]"
                );


            if (
                !cell
                ||
                !this.tableBody.contains(
                    cell
                )
            ) {

                return;

            }


            this.renderDetail(
                Number(
                    cell.dataset.week
                ),
                cell.dataset.type
            );

        }
    );


    /* ======================================================
       FORECAST DETAIL ACTION
    ====================================================== */

    this.on(
        this.detailBody,
        "click",
        event => {

            const editButton =
                event.target.closest(
                    "[data-cff-edit]"
                );


            if (editButton) {

                this.editManualForecast(
                    editButton.dataset.cffEdit
                );

                return;

            }


            const deleteButton =
                event.target.closest(
                    "[data-cff-delete]"
                );


            if (deleteButton) {

                this.showDeleteManual(
                    deleteButton.dataset.cffDelete
                );

            }

        }
    );


    /* ======================================================
       PERMANENT MANUAL FORECAST LIST ACTION
    ====================================================== */

    this.on(
        this.manualListBody,
        "click",
        event => {

            const editButton =
                event.target.closest(
                    "[data-cff-manual-edit]"
                );


            if (editButton) {

                this.editManualForecast(
                    editButton.dataset
                        .cffManualEdit
                );

                return;

            }


            const deleteButton =
                event.target.closest(
                    "[data-cff-manual-delete]"
                );


            if (deleteButton) {

                this.showDeleteManual(
                    deleteButton.dataset
                        .cffManualDelete
                );

            }

        }
    );

}


    /* ======================================================
       BUSINESS PARTNER
    ====================================================== */

    async loadBusinessPartners() {

        try {

            this.businessPartners =
                await this.service
                    .getBusinessPartners();


            if (!this.manualBP) {
                return;
            }


            this.manualBP.innerHTML = [

                `<option value="">Optional</option>`,

                ...this.businessPartners.map(
                    bp => `
                        <option value="${this.escape(bp.id)}">
                            ${this.escape(bp.bp_code || "")}
                            ${bp.bp_code ? " :: " : ""}
                            ${this.escape(bp.bp_name || "")}
                        </option>
                    `
                )

            ].join("");

        }

        catch (error) {

            console.error(
                "CashFlowForecast.loadBusinessPartners:",
                error
            );

        }

    }


    /* ======================================================
       DATE
    ====================================================== */

    toISO(date) {

        return (
            `${date.getFullYear()}-`
            +
            `${String(
                date.getMonth() + 1
            ).padStart(2, "0")}-`
            +
            `${String(
                date.getDate()
            ).padStart(2, "0")}`
        );

    }


    formatDate(value) {

        if (!value) {
            return "-";
        }


        const d =
            new Date(
                `${String(value).slice(0, 10)}T00:00:00`
            );


        if (
            Number.isNaN(
                d.getTime()
            )
        ) {

            return "-";

        }


        return new Intl.DateTimeFormat(
            "id-ID",
            {
                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"
            }
        ).format(d);

    }


    /* ======================================================
       MONEY
    ====================================================== */

    money(
        value,
        currency = true
    ) {

        const n =
            Number(
                value ?? 0
            ) || 0;


        const text =
            new Intl.NumberFormat(
                "id-ID",
                {
                    maximumFractionDigits:
                        0
                }
            ).format(
                Math.abs(n)
            );


        return (
            `${n < 0 ? "-" : ""}`
            +
            `${currency ? "Rp" : ""}`
            +
            text
        );

    }


    /* ======================================================
       ESCAPE
    ====================================================== */

    escape(value) {

        return String(
            value ?? ""
        ).replace(
            /[&<>'"]/g,
            ch => ({
                "&":
                    "&amp;",
                "<":
                    "&lt;",
                ">":
                    "&gt;",
                "'":
                    "&#39;",
                '"':
                    "&quot;"
            }[ch])
        );

    }
    /*
======================================================
SHOW SUCCESS
BOOTSTRAP ALERT
CASH FLOW FORECAST
======================================================
*/

showSuccess(
    message
) {

    /*
    ==================================================
    NORMALIZE MESSAGE
    ==================================================
    */

    const successMessage =
        message
        ||
        "Operation completed successfully.";


    /*
    ==================================================
    CONSOLE
    ==================================================
    */

    console.log(
        "Cash Flow Forecast SUCCESS:",
        successMessage
    );


    /*
    ==================================================
    REMOVE EXISTING SUCCESS ALERT
    ==================================================
    */

    const existingAlert =
        document.getElementById(
            "cff-bootstrap-success-alert"
        );


    if (
        existingAlert
    ) {

        existingAlert.remove();

    }


    /*
    ==================================================
    CREATE BOOTSTRAP SUCCESS ALERT
    ==================================================
    */

    const alertElement =
        document.createElement(
            "div"
        );


    alertElement.id =
        "cff-bootstrap-success-alert";


    alertElement.className =
        "alert alert-success alert-dismissible fade show shadow-sm";


    alertElement.setAttribute(
        "role",
        "alert"
    );


    alertElement.innerHTML = `

        <div class="d-flex align-items-start">

            <i
                class="fa-solid fa-circle-check me-2 mt-1">
            </i>

            <div class="flex-grow-1">

                <strong>
                    Cash Flow Forecast
                </strong>

                <div>
                    ${this.escape(
                        successMessage
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


    /*
    ==================================================
    FIND MANUAL FORECAST MODAL
    ==================================================
    */

    const modal =
        document.getElementById(
            "cffManualModal"
        );


    const modalIsVisible =
        modal
        &&
        modal.classList.contains(
            "show"
        );


    const modalBody =
        modalIsVisible
            ? modal.querySelector(
                ".modal-body"
            )
            : null;


    /*
    ==================================================
    INSERT INSIDE ACTIVE MODAL
    ==================================================
    */

    if (
        modalBody
    ) {

        modalBody.insertBefore(
            alertElement,
            modalBody.firstChild
        );

    }

    else {

        /*
        ==============================================
        PAGE LEVEL ALERT
        USED AFTER MODAL HAS CLOSED
        ==============================================
        */

        alertElement.style.position =
            "fixed";

        alertElement.style.top =
            "20px";

        alertElement.style.left =
            "50%";

        alertElement.style.transform =
            "translateX(-50%)";

        alertElement.style.zIndex =
            "99999";

        alertElement.style.width =
            "auto";

        alertElement.style.minWidth =
            "380px";

        alertElement.style.maxWidth =
            "90vw";


        document.body.appendChild(
            alertElement
        );

    }


    /*
    ==================================================
    AUTO CLOSE
    ==================================================
    */

    setTimeout(
        () => {

            const currentAlert =
                document.getElementById(
                    "cff-bootstrap-success-alert"
                );


            if (
                !currentAlert
            ) {

                return;

            }


            if (
                window.bootstrap
                &&
                bootstrap.Alert
            ) {

                bootstrap.Alert
                    .getOrCreateInstance(
                        currentAlert
                    )
                    .close();

            }

            else {

                currentAlert.remove();

            }

        },

        5000
    );

}

    /* ======================================================
       GENERATE
    ====================================================== */

    async generate(
        force = false
    ) {

        if (this.destroyed) {
            return;
        }


        try {

            window.App
                ?.showLoading
                ?.();


            const start =
                this.startWeek?.value;


            const weeks =
                Number(
                    this.numberWeeks?.value
                    ??
                    8
                );


            if (!start) {

                throw new Error(
                    "Start Week is required."
                );

            }


            console.log(
                "FINOVA CASH FLOW FORECAST REQUEST:",
                {
                    startDate:
                        start,

                    numberOfWeeks:
                        weeks,

                    force
                }
            );


            this.dataset =
                await this.service
                    .buildForecastDataset(
                        start,
                        weeks
                    );


            if (this.destroyed) {
                return;
            }


            this.render();


            console.log(
                "FINOVA CASH FLOW FORECAST DATASET:",
                this.dataset
            );

        }

        catch (error) {

            console.error(
                "CashFlowForecast.generate:",
                error
            );


            window.App
                ?.showError
                ?.(
                    error?.message
                    ||
                    "Failed to generate Cash Flow Forecast."
                );

        }

        finally {

            window.App
                ?.hideLoading
                ?.();

        }

    }

    /* ==========================================================
   REFRESH
========================================================== */

async refresh() {

    if (this.destroyed) {
        return;
    }


    try {

        console.log(
            "FINOVA CASH FLOW FORECAST REFRESH"
        );


        /* ==================================================
           RESET DATASET
        ================================================== */

        this.dataset =
            null;


        this.currentManual =
            null;


        this.deleteManualId =
            null;


        /* ==================================================
           RESET FILTER
        ================================================== */

        this.setDefaults();


        if (this.numberWeeks) {

            this.numberWeeks.value =
                "8";

        }


        /* ==================================================
           RESET WARNING
        ================================================== */

        if (this.warning) {

            this.warning.textContent =
                "";

            this.warning.classList.add(
                "d-none"
            );

        }


        /* ==================================================
           RESET SUMMARY
        ================================================== */

        if (this.openingCash) {

            this.openingCash.textContent =
                "Rp0";

        }


        if (this.cashIn) {

            this.cashIn.textContent =
                "Rp0";

        }


        if (this.cashOut) {

            this.cashOut.textContent =
                "Rp0";

        }


        if (this.endingCash) {

            this.endingCash.textContent =
                "Rp0";

            this.endingCash.classList.remove(
                "cff-positive",
                "cff-negative"
            );

        }


        if (this.endingMeta) {

            this.endingMeta.textContent =
                "After forecast period";

        }


        /* ==================================================
           RESET PERIOD
        ================================================== */

        if (this.periodLabel) {

            this.periodLabel.textContent =
                "Refreshing forecast...";

        }


        /* ==================================================
           RESET WEEKLY TABLE
        ================================================== */

        if (this.tableHead) {

            this.tableHead.innerHTML =
                "";

        }


        if (this.tableBody) {

            this.tableBody.innerHTML =
                `
                <tr>

                    <td
                        class="
                            text-center
                            text-muted
                            py-5
                        "
                    >
                        Refreshing forecast...
                    </td>

                </tr>
                `;

        }


        /* ==================================================
           RESET CHART
        ================================================== */

        if (this.chart) {

            this.chart.innerHTML =
                `
                <div class="text-muted">
                    Refreshing forecast...
                </div>
                `;

        }


        /* ==================================================
           RESET LIQUIDITY
        ================================================== */

        if (this.liquidity) {

            this.liquidity.innerHTML =
                `
                <div class="text-muted">
                    Refreshing forecast...
                </div>
                `;

        }


        /* ==================================================
           RESET DETAIL
        ================================================== */

        if (this.detailTitle) {

            this.detailTitle.textContent =
                "Forecast Detail";

        }


        if (this.detailSubtitle) {

            this.detailSubtitle.textContent =
                "Click a weekly forecast amount to inspect detail.";

        }


        if (this.detailBody) {

            this.detailBody.innerHTML =
                `
                <tr>

                    <td
                        colspan="7"
                        class="
                            text-center
                            text-muted
                            py-4
                        "
                    >
                        Select a week to view detail.
                    </td>

                </tr>
                `;

        }


        /* ==================================================
           RESET MANUAL LIST
        ================================================== */

        if (this.manualTotalIn) {

            this.manualTotalIn.textContent =
                "Rp0";

        }


        if (this.manualTotalOut) {

            this.manualTotalOut.textContent =
                "Rp0";

        }


        if (this.manualListBody) {

            this.manualListBody.innerHTML =
                `
                <tr>

                    <td
                        colspan="9"
                        class="
                            text-center
                            text-muted
                            py-4
                        "
                    >
                        Refreshing manual forecast...
                    </td>

                </tr>
                `;

        }


        /* ==================================================
           RELOAD BUSINESS PARTNER

           Important if BP master changed.
        ================================================== */

        await this.loadBusinessPartners();


        if (this.destroyed) {
            return;
        }


        /* ==================================================
           RELOAD FORECAST

           AR
           AP
           Manual Forecast
           Opening Cash
        ================================================== */

        await this.generate(
            true
        );


        console.log(
            "FINOVA CASH FLOW FORECAST REFRESHED"
        );

    }

    catch (error) {

        console.error(
            "CashFlowForecast.refresh:",
            error
        );


        window.App
            ?.showError
            ?.(
                error?.message
                ||
                "Failed to refresh Cash Flow Forecast."
            );

    }

}

    /* ======================================================
       RENDER
    ====================================================== */

    render() {

    const d =
        this.dataset;


    if (!d) {
        return;
    }


    this.openingCash.textContent =
        this.money(
            d.openingCash
        );


    this.cashIn.textContent =
        this.money(
            d.totalCashIn
        );


    this.cashOut.textContent =
        this.money(
            d.totalCashOut
        );


    this.endingCash.textContent =
        this.money(
            d.endingCash
        );


    this.endingCash.classList.toggle(
        "cff-negative",
        d.endingCash < 0
    );


    this.endingCash.classList.toggle(
        "cff-positive",
        d.endingCash >= 0
    );


    this.endingMeta.textContent =
        `${d.numberOfWeeks} week forecast`;


    this.periodLabel.textContent =
        `${this.formatDate(d.startDate)} — ${this.formatDate(d.endDate)}`;


    if (d.warning) {

        this.warning.textContent =
            d.warning;

        this.warning.classList.remove(
            "d-none"
        );

    }

    else {

        this.warning.classList.add(
            "d-none"
        );

    }


    /* ======================================================
       RENDER FORECAST
    ====================================================== */

    this.renderWeeklyTable();

    this.renderChart();

    this.renderLiquidity();


    /* ======================================================
       RENDER MANUAL FORECAST LIST
    ====================================================== */

    this.renderManualForecastList();


    /* ======================================================
       RESET DETAIL
    ====================================================== */

    this.detailTitle.textContent =
        "Forecast Detail";


    this.detailSubtitle.textContent =
        "Click a weekly forecast amount to inspect detail.";


    this.detailBody.innerHTML =
        `
        <tr>

            <td
                colspan="7"
                class="text-center text-muted py-4"
            >
                Select a week to view detail.
            </td>

        </tr>
        `;

}


    /* ======================================================
       WEEKLY TABLE
    ====================================================== */

    renderWeeklyTable() {

        const weeks =
            this.dataset.weeks;


        this.tableHead.innerHTML =
            `
            <tr>

                <th class="cff-row-label">
                    Cash Flow
                </th>

                ${weeks.map(
                    week => `
                        <th class="text-end">

                            <div>
                                ${this.escape(week.label)}
                            </div>

                            <small>
                                ${this.escape(
                                    this.formatDate(
                                        week.dateFrom
                                    )
                                )}
                            </small>

                        </th>
                    `
                ).join("")}

            </tr>
            `;


        const row =
            (
                label,
                field,
                css = "",
                clickable = null
            ) =>
                `
                <tr class="${css}">

                    <td class="cff-row-label">
                        ${label}
                    </td>

                    ${weeks.map(
                        (
                            week,
                            index
                        ) => {

                            const value =
                                Number(
                                    week[field]
                                    ??
                                    0
                                );


                            return `
                                <td
                                    class="
                                        text-end
                                        ${clickable ? "cff-clickable" : ""}
                                        ${value < 0 ? "cff-negative" : ""}
                                    "

                                    ${
                                        clickable
                                            ? `
                                                data-cff-detail="1"
                                                data-week="${index}"
                                                data-type="${clickable}"
                                              `
                                            : ""
                                    }
                                >
                                    ${this.money(value)}
                                </td>
                            `;

                        }
                    ).join("")}

                </tr>
                `;


        const group =
            label =>
                `
                <tr class="cff-group-row">

                    <td class="cff-row-label">
                        ${label}
                    </td>

                    ${weeks.map(
                        () =>
                            `<td></td>`
                    ).join("")}

                </tr>
                `;


        this.tableBody.innerHTML = [

            row(
                "Opening Cash",
                "openingCash",
                "cff-total-row"
            ),

            group(
                "Cash In"
            ),

            row(
                "Aging AR",
                "autoCashIn",
                "cff-sub-row",
                "AR"
            ),

            row(
                "Manual Cash In",
                "manualCashIn",
                "cff-sub-row",
                "MANUAL_IN"
            ),

            row(
                "Total Cash In",
                "cashIn",
                "cff-total-row"
            ),

            group(
                "Cash Out"
            ),

            row(
                "Aging AP",
                "autoCashOut",
                "cff-sub-row",
                "AP"
            ),

            row(
                "Manual Cash Out",
                "manualCashOut",
                "cff-sub-row",
                "MANUAL_OUT"
            ),

            row(
                "Total Cash Out",
                "cashOut",
                "cff-total-row"
            ),

            row(
                "Net Cash Flow",
                "netCashFlow",
                "cff-total-row"
            ),

            row(
                "Ending Cash",
                "endingCash",
                "cff-ending-row"
            )

        ].join("");

    }


    /* ======================================================
       CHART
    ====================================================== */

    renderChart() {

        const weeks =
            this.dataset.weeks;


        const max =
            Math.max(
                ...weeks.map(
                    week =>
                        Math.abs(
                            week.endingCash
                        )
                ),
                1
            );


        this.chart.innerHTML =
            weeks.map(
                week => {

                    const height =
                        Math.max(
                            2,
                            Math.round(
                                Math.abs(
                                    week.endingCash
                                )
                                /
                                max
                                *
                                110
                            )
                        );


                    return `
                        <div class="cff-chart-column">

                            <div class="cff-chart-value">
                                ${this.money(
                                    week.endingCash
                                )}
                            </div>

                            <div class="cff-chart-bar-wrap">

                                <div
                                    class="
                                        cff-chart-bar
                                        ${
                                            week.endingCash < 0
                                                ? "negative"
                                                : ""
                                        }
                                    "
                                    style="height:${height}px"
                                ></div>

                            </div>

                            <div class="cff-chart-label">
                                ${this.escape(
                                    week.key
                                )}
                            </div>

                        </div>
                    `;

                }
            ).join("");

    }


    /* ======================================================
       LIQUIDITY
    ====================================================== */

    renderLiquidity() {

        const negative =
            this.dataset.weeks.filter(
                week =>
                    week.endingCash < 0
            );


        if (!negative.length) {

            this.liquidity.innerHTML =
                `
                <div class="cff-liquidity-ok">

                    <i class="fa-solid fa-circle-check"></i>

                    No projected negative ending cash
                    in the selected period.

                </div>
                `;

            return;

        }


        this.liquidity.innerHTML =
            negative.map(
                week => `
                    <div class="cff-liquidity-item">

                        <div class="cff-liquidity-week">

                            ${this.escape(week.label)}
                            •
                            ${this.escape(
                                this.formatDate(
                                    week.dateFrom
                                )
                            )}

                        </div>

                        <div class="cff-liquidity-value">

                            Projected Ending Cash:
                            ${this.money(
                                week.endingCash
                            )}

                        </div>

                    </div>
                `
            ).join("");

    }

    /* ==========================================================
   RENDER MANUAL FORECAST LIST
========================================================== */

renderManualForecastList() {

    if (
        !this.manualListBody
    ) {

        return;

    }


    const items =
        Array.isArray(
            this.dataset
                ?.manualForecasts
        )

            ? [
                ...this.dataset
                    .manualForecasts
            ]

            : [];


    /* ======================================================
       SORT

       Newest forecast date first.
       If date is same, preserve database order.
    ====================================================== */

    items.sort(
        (
            a,
            b
        ) => {

            const dateA =
                String(
                    a.forecastDate
                    ||
                    ""
                );


            const dateB =
                String(
                    b.forecastDate
                    ||
                    ""
                );


            return dateB.localeCompare(
                dateA
            );

        }
    );


    /* ======================================================
       SUMMARY

       This summary is ALL active manual forecast records,
       not only records inside the selected weekly range.
    ====================================================== */

    const totalCashIn =
        items

            .filter(
                item =>
                    item.forecastType
                    ===
                    "CASH_IN"
            )

            .reduce(
                (
                    total,
                    item
                ) =>
                    total
                    +
                    Number(
                        item.amount
                        ||
                        0
                    ),
                0
            );


    const totalCashOut =
        items

            .filter(
                item =>
                    item.forecastType
                    ===
                    "CASH_OUT"
            )

            .reduce(
                (
                    total,
                    item
                ) =>
                    total
                    +
                    Number(
                        item.amount
                        ||
                        0
                    ),
                0
            );


    if (
        this.manualTotalIn
    ) {

        this.manualTotalIn.textContent =
            this.money(
                totalCashIn
            );

    }


    if (
        this.manualTotalOut
    ) {

        this.manualTotalOut.textContent =
            this.money(
                totalCashOut
            );

    }


    /* ======================================================
       EMPTY
    ====================================================== */

    if (!items.length) {

        this.manualListBody.innerHTML =
            `
            <tr>

                <td
                    colspan="9"
                    class="text-center text-muted py-4"
                >
                    No manual forecast.
                </td>

            </tr>
            `;

        return;

    }


    /* ======================================================
       ROWS
    ====================================================== */

    this.manualListBody.innerHTML =
        items.map(
            (
                item,
                index
            ) => {

                const isCashIn =
                    item.forecastType
                    ===
                    "CASH_IN";


                const typeLabel =
                    isCashIn
                        ? "Cash In"
                        : "Cash Out";


                const typeClass =
                    isCashIn
                        ? "cff-manual-type-in"
                        : "cff-manual-type-out";


                const amountClass =
                    isCashIn
                        ? "cff-positive"
                        : "cff-negative";


                const partner =
                    item.partnerName
                    &&
                    item.partnerName !== "-"

                        ? item.partnerName

                        : "-";


                return `
                    <tr>

                        <td class="text-center">
                            ${index + 1}
                        </td>


                        <td>
                            ${this.escape(
                                this.formatDate(
                                    item.forecastDate
                                )
                            )}
                        </td>


                        <td>

                            <span
                                class="
                                    cff-manual-type
                                    ${typeClass}
                                "
                            >
                                ${typeLabel}
                            </span>

                        </td>


                        <td>

                            <div class="fw-semibold">

                                ${this.escape(
                                    item.category
                                    ||
                                    "-"
                                )}

                            </div>

                        </td>


                        <td class="cff-manual-description">

                            ${this.escape(
                                item.description
                                ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${this.escape(
                                partner
                            )}

                        </td>


                        <td
                            class="
                                text-end
                                fw-semibold
                                ${amountClass}
                            "
                        >

                            ${this.money(
                                item.amount
                            )}

                        </td>


                        <td class="cff-manual-notes">

                            ${this.escape(
                                item.notes
                                ||
                                "-"
                            )}

                        </td>


                        <td class="text-center">

                            <div class="cff-manual-action">

                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-sm
                                        btn-outline-primary
                                    "
                                    data-cff-manual-edit="${this.escape(
                                        item.id
                                    )}"
                                    title="Edit Manual Forecast"
                                >

                                    <i
                                        class="
                                            fa-solid
                                            fa-pen
                                        "
                                    ></i>

                                </button>


                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-sm
                                        btn-outline-danger
                                    "
                                    data-cff-manual-delete="${this.escape(
                                        item.id
                                    )}"
                                    title="Delete Manual Forecast"
                                >

                                    <i
                                        class="
                                            fa-solid
                                            fa-trash
                                        "
                                    ></i>

                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }
        ).join("");

}
    /* ======================================================
       DETAIL
    ====================================================== */

    renderDetail(
        index,
        type
    ) {

        const week =
            this.dataset
                ?.weeks
                ?.[index];


        if (!week) {
            return;
        }


        let items =
            [];

        let title =
            "";


        if (type === "AR") {

            items =
                week.arItems;

            title =
                "Aging AR — Auto Cash In";

        }


        else if (
            type === "AP"
        ) {

            items =
                week.apItems;

            title =
                "Aging AP — Auto Cash Out";

        }


        else if (
            type === "MANUAL_IN"
        ) {

            items =
                week.manualCashInItems;

            title =
                "Manual Cash In";

        }


        else if (
            type === "MANUAL_OUT"
        ) {

            items =
                week.manualCashOutItems;

            title =
                "Manual Cash Out";

        }


        this.detailTitle.textContent =
            `${title} • ${week.label}`;


        this.detailSubtitle.textContent =
            `${this.formatDate(week.dateFrom)} — ${this.formatDate(week.dateTo)}`;


        if (!items.length) {

            this.detailBody.innerHTML =
                `
                <tr>

                    <td
                        colspan="7"
                        class="text-center text-muted py-4"
                    >
                        No forecast detail in this week.
                    </td>

                </tr>
                `;

            return;

        }


        if (
            type === "AR"
            ||
            type === "AP"
        ) {

            this.detailBody.innerHTML =
                items.map(
                    item => `
                        <tr>

                            <td>
                                ${type}
                            </td>

                            <td>
                                ${this.escape(
                                    item.partnerName
                                )}
                            </td>

                            <td>
                                ${this.escape(
                                    item.invoiceNo
                                )}
                            </td>

                            <td>
                                ${this.escape(
                                    this.formatDate(
                                        item.dueDate
                                    )
                                )}
                            </td>

                            <td>
                                ${this.escape(
                                    item.status
                                )}
                            </td>

                            <td class="text-end fw-semibold">
                                ${this.money(
                                    item.outstandingAmount
                                )}
                            </td>

                            <td class="text-center text-muted">
                                -
                            </td>

                        </tr>
                    `
                ).join("");

            return;

        }


        this.detailBody.innerHTML =
            items.map(
                item => `
                    <tr>

                        <td>
                            <span class="cff-manual-badge">
                                ${
                                    item.forecastType ===
                                    "CASH_IN"
                                        ? "Manual In"
                                        : "Manual Out"
                                }
                            </span>
                        </td>

                        <td>

                            <div class="fw-semibold">
                                ${this.escape(
                                    item.category
                                )}
                            </div>

                            <small class="text-muted">
                                ${this.escape(
                                    item.partnerName
                                )}
                            </small>

                        </td>

                        <td>
                            ${this.escape(
                                item.description
                            )}
                        </td>

                        <td>
                            ${this.escape(
                                this.formatDate(
                                    item.forecastDate
                                )
                            )}
                        </td>

                        <td>
                            ${this.escape(
                                item.status
                            )}
                        </td>

                        <td class="text-end fw-semibold">
                            ${this.money(
                                item.amount
                            )}
                        </td>

                        <td class="text-center cff-detail-action">

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-primary"
                                data-cff-edit="${this.escape(item.id)}"
                                title="Edit"
                            >
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                data-cff-delete="${this.escape(item.id)}"
                                title="Delete"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </td>

                    </tr>
                `
            ).join("");

    }


    /* ======================================================
       CLEAR MANUAL FORM
    ====================================================== */

    clearManualForm() {

        this.currentManual =
            null;


        this.manualId.value =
            "";


        this.manualType.value =
            "CASH_OUT";


        this.manualDate.value =
            this.startWeek?.value
            ||
            this.toISO(
                new Date()
            );


        this.manualCategory.value =
            "";


        this.manualBP.value =
            "";


        this.manualDescription.value =
            "";


        this.manualAmount.value =
            "";


        this.manualNotes.value =
            "";


        this.manualModalTitle.textContent =
            "New Manual Cash Forecast";

    }


    /* ======================================================
       OPEN MANUAL
    ====================================================== */

    openManualModal() {

        this.clearManualForm();


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                this.manualModalElement
            );


        modal.show();

    }


    /* ======================================================
       EDIT MANUAL
    ====================================================== */

    editManualForecast(id) {

        const item =
            this.dataset
                ?.manualForecasts
                ?.find(
                    row =>
                        String(row.id)
                        ===
                        String(id)
                );


        if (!item) {

            window.App
                ?.showError
                ?.(
                    "Manual Forecast not found."
                );

            return;

        }


        this.currentManual =
            item;


        this.manualId.value =
            item.id;


        this.manualType.value =
            item.forecastType;


        this.manualDate.value =
            item.forecastDate;


        this.manualCategory.value =
            item.category || "";


        this.manualBP.value =
            item.businessPartnerId || "";


        this.manualDescription.value =
            item.description || "";


        this.manualAmount.value =
            item.amount || "";


        this.manualNotes.value =
            item.notes || "";


        this.manualModalTitle.textContent =
            "Edit Manual Cash Forecast";


        bootstrap.Modal
            .getOrCreateInstance(
                this.manualModalElement
            )
            .show();

    }


    /* ======================================================
   SAVE MANUAL FORECAST
====================================================== */

async saveManualForecast() {

    try {

        const payload = {

            forecast_type:
                this.manualType.value,

            forecast_date:
                this.manualDate.value,

            category:
                this.manualCategory.value,

            business_partner_id:
                this.manualBP.value
                ||
                null,

            description:
                this.manualDescription.value,

            amount:
                Number(
                    this.manualAmount.value
                    ||
                    0
                ),

            notes:
                this.manualNotes.value

        };


        /* ==================================================
           VALIDATION
        ================================================== */

        if (!payload.forecast_date) {

            throw new Error(
                "Forecast Date is required."
            );

        }


        if (
            !String(
                payload.category
            ).trim()
        ) {

            throw new Error(
                "Category is required."
            );

        }


        if (
            !String(
                payload.description
            ).trim()
        ) {

            throw new Error(
                "Description is required."
            );

        }


        if (
            payload.amount <= 0
        ) {

            throw new Error(
                "Amount must be greater than 0."
            );

        }


        /* ==================================================
           LOADING
        ================================================== */

        window.App
            ?.showLoading
            ?.();


        const id =
            this.manualId.value;


        /* ==================================================
           SAVE
        ================================================== */

        if (id) {

            await this.service
                .updateManualForecast(
                    id,
                    payload
                );

        }

        else {

            await this.service
                .createManualForecast(
                    payload
                );

        }


        /* ==================================================
           CLOSE MODAL
        ================================================== */

        bootstrap.Modal
            .getInstance(
                this.manualModalElement
            )
            ?.hide();


        /* ==================================================
           RELOAD FORECAST
        ================================================== */

        await this.generate(
            true
        );


        /* ==================================================
           SUCCESS
        ================================================== */

        this.showSuccess(

            id

                ? "Manual Forecast updated successfully."

                : "Manual Forecast saved successfully."

        );


        console.log(
            id
                ? "FINOVA MANUAL FORECAST UPDATED"
                : "FINOVA MANUAL FORECAST SAVED"
        );

    }

    catch (error) {

        console.error(
            "CashFlowForecast.saveManualForecast:",
            error
        );


        window.App
            ?.showError
            ?.(
                error?.message
                ||
                "Failed to save Manual Forecast."
            );

    }

    finally {

        window.App
            ?.hideLoading
            ?.();

    }

}


    /* ======================================================
       SHOW DELETE
    ====================================================== */

    showDeleteManual(id) {

        const item =
            this.dataset
                ?.manualForecasts
                ?.find(
                    row =>
                        String(row.id)
                        ===
                        String(id)
                );


        if (!item) {

            window.App
                ?.showError
                ?.(
                    "Manual Forecast not found."
                );

            return;

        }


        this.deleteManualId =
            item.id;


        this.deleteDescription.textContent =
            `${item.description} — ${this.money(item.amount)}`;


        bootstrap.Modal
            .getOrCreateInstance(
                this.deleteModalElement
            )
            .show();

    }


    /* ======================================================
   CONFIRM DELETE MANUAL FORECAST
====================================================== */

async confirmDeleteManual() {

    if (!this.deleteManualId) {
        return;
    }


    try {

        window.App
            ?.showLoading
            ?.();


        const deleteId =
            this.deleteManualId;


        /* ==================================================
           DELETE
        ================================================== */

        await this.service
            .deleteManualForecast(
                deleteId
            );


        /* ==================================================
           CLOSE MODAL
        ================================================== */

        bootstrap.Modal
            .getInstance(
                this.deleteModalElement
            )
            ?.hide();


        this.deleteManualId =
            null;


        /* ==================================================
           RELOAD
        ================================================== */

        await this.generate(
            true
        );


        /* ==================================================
           SUCCESS
        ================================================== */

        this.showSuccess(
            "Manual Forecast deleted successfully."
        );


        console.log(
            "FINOVA MANUAL FORECAST DELETED:",
            deleteId
        );

    }

    catch (error) {

        console.error(
            "CashFlowForecast.confirmDeleteManual:",
            error
        );


        window.App
            ?.showError
            ?.(
                error?.message
                ||
                "Failed to delete Manual Forecast."
            );

    }

    finally {

        window.App
            ?.hideLoading
            ?.();

    }

}


    /* ======================================================
       DATASET VALIDATION
    ====================================================== */

    ensureDataset() {

        if (!this.dataset) {

            window.App
                ?.showError
                ?.(
                    "Generate Cash Flow Forecast first."
                );

            return false;

        }


        return true;

    }


    /* ======================================================
       EXCEL
    ====================================================== */

    downloadExcel() {

        if (
            !this.ensureDataset()
        ) {

            return;

        }


        if (
            typeof XLSX ===
            "undefined"
        ) {

            window.App
                ?.showError
                ?.(
                    "XLSX library is not available."
                );

            return;

        }


        const identity =
            CompanyReport
                .getIdentity();


        const d =
            this.dataset;


        const wb =
            XLSX.utils
                .book_new();


        const summary = [

            [
                "FINOVA ACCOUNTING SYSTEM"
            ],

            [
                "CASH FLOW FORECAST"
            ],

            [
                identity?.displayName
                ||
                identity?.legalName
                ||
                identity?.name
                ||
                ""
            ],

            [
                `Period: ${this.formatDate(d.startDate)} - ${this.formatDate(d.endDate)}`
            ],

            [],

            [
                "Cash Flow",
                ...d.weeks.map(
                    week =>
                        `${week.label} (${this.formatDate(week.dateFrom)})`
                )
            ],

            [
                "Opening Cash",
                ...d.weeks.map(
                    week =>
                        week.openingCash
                )
            ],

            [
                "Aging AR",
                ...d.weeks.map(
                    week =>
                        week.autoCashIn
                )
            ],

            [
                "Manual Cash In",
                ...d.weeks.map(
                    week =>
                        week.manualCashIn
                )
            ],

            [
                "Total Cash In",
                ...d.weeks.map(
                    week =>
                        week.cashIn
                )
            ],

            [
                "Aging AP",
                ...d.weeks.map(
                    week =>
                        week.autoCashOut
                )
            ],

            [
                "Manual Cash Out",
                ...d.weeks.map(
                    week =>
                        week.manualCashOut
                )
            ],

            [
                "Total Cash Out",
                ...d.weeks.map(
                    week =>
                        week.cashOut
                )
            ],

            [
                "Net Cash Flow",
                ...d.weeks.map(
                    week =>
                        week.netCashFlow
                )
            ],

            [
                "Ending Cash",
                ...d.weeks.map(
                    week =>
                        week.endingCash
                )
            ]

        ];


        const ws =
            XLSX.utils
                .aoa_to_sheet(
                    summary
                );


        ws["!cols"] = [

            {
                wch:
                    32
            },

            ...d.weeks.map(
                () => ({
                    wch:
                        22
                })
            )

        ];


        XLSX.utils
            .book_append_sheet(
                wb,
                ws,
                "Weekly Forecast"
            );


        const detailRows = [[
            "Source",
            "Type",
            "Business Partner",
            "Category",
            "Reference",
            "Description",
            "Forecast / Due Date",
            "Amount",
            "Forecast Week"
        ]];


        d.weeks.forEach(
            week => {

                week.arItems.forEach(
                    item =>
                        detailRows.push([
                            "AR",
                            "AUTO CASH IN",
                            item.partnerName,
                            "",
                            item.invoiceNo,
                            item.description,
                            item.dueDate,
                            item.outstandingAmount,
                            week.label
                        ])
                );


                week.apItems.forEach(
                    item =>
                        detailRows.push([
                            "AP",
                            "AUTO CASH OUT",
                            item.partnerName,
                            "",
                            item.invoiceNo,
                            item.description,
                            item.dueDate,
                            item.outstandingAmount,
                            week.label
                        ])
                );


                week.manualCashInItems.forEach(
                    item =>
                        detailRows.push([
                            "MANUAL",
                            "CASH IN",
                            item.partnerName,
                            item.category,
                            "",
                            item.description,
                            item.forecastDate,
                            item.amount,
                            week.label
                        ])
                );


                week.manualCashOutItems.forEach(
                    item =>
                        detailRows.push([
                            "MANUAL",
                            "CASH OUT",
                            item.partnerName,
                            item.category,
                            "",
                            item.description,
                            item.forecastDate,
                            item.amount,
                            week.label
                        ])
                );

            }
        );


        const wd =
            XLSX.utils
                .aoa_to_sheet(
                    detailRows
                );


        wd["!cols"] = [

            { wch: 12 },
            { wch: 18 },
            { wch: 30 },
            { wch: 20 },
            { wch: 20 },
            { wch: 35 },
            { wch: 18 },
            { wch: 18 },
            { wch: 15 }

        ];


        XLSX.utils
            .book_append_sheet(
                wb,
                wd,
                "Forecast Detail"
            );


        XLSX.writeFile(
            wb,
            `Cash Flow Forecast ${d.startDate} - ${d.endDate}.xlsx`
        );


        console.log(
            "FINOVA CASH FLOW FORECAST EXCEL DOWNLOADED"
        );

    }


    /* ======================================================
       PDF PREVIEW
    ====================================================== */

    previewPDF() {

        if (
            !this.ensureDataset()
        ) {

            return;

        }


        const d =
            this.dataset;


        const identity =
            CompanyReport
                .getIdentity();


        const company =
            identity?.displayName
            ||
            identity?.legalName
            ||
            identity?.name
            ||
            "";


        const rows = [

            [
                "Opening Cash",
                "openingCash"
            ],

            [
                "Aging AR",
                "autoCashIn"
            ],

            [
                "Manual Cash In",
                "manualCashIn"
            ],

            [
                "Total Cash In",
                "cashIn"
            ],

            [
                "Aging AP",
                "autoCashOut"
            ],

            [
                "Manual Cash Out",
                "manualCashOut"
            ],

            [
                "Total Cash Out",
                "cashOut"
            ],

            [
                "Net Cash Flow",
                "netCashFlow"
            ],

            [
                "Ending Cash",
                "endingCash"
            ]

        ];


        const html =
            `
            <!doctype html>

            <html>

            <head>

                <title>
                    Cash Flow Forecast
                </title>

                <style>

                    body {
                        font-family:
                            Tahoma,
                            Arial,
                            sans-serif;

                        margin:
                            28px;

                        color:
                            #111827;
                    }

                    h1 {
                        font-size:
                            20px;

                        margin:
                            0;
                    }

                    .meta {
                        font-size:
                            11px;

                        color:
                            #64748b;

                        margin:
                            4px 0 20px;
                    }

                    table {
                        border-collapse:
                            collapse;

                        width:
                            100%;

                        font-size:
                            10px;
                    }

                    th,
                    td {
                        border:
                            1px solid #d1d5db;

                        padding:
                            7px;
                    }

                    th {
                        background:
                            #f3f4f6;
                    }

                    td.num {
                        text-align:
                            right;
                    }

                    .total {
                        font-weight:
                            bold;

                        background:
                            #f8fafc;
                    }

                    @media print {

                        button {
                            display:
                                none;
                        }

                        @page {
                            size:
                                landscape;

                            margin:
                                10mm;
                        }

                    }

                </style>

            </head>

            <body>

                <h1>
                    Cash Flow Forecast
                </h1>

                <div class="meta">

                    ${this.escape(company)}

                    <br>

                    ${this.escape(
                        this.formatDate(
                            d.startDate
                        )
                    )}

                    -

                    ${this.escape(
                        this.formatDate(
                            d.endDate
                        )
                    )}

                </div>


                <table>

                    <thead>

                        <tr>

                            <th>
                                Cash Flow
                            </th>

                            ${d.weeks.map(
                                week => `
                                    <th>
                                        ${this.escape(week.label)}
                                        <br>
                                        ${this.escape(
                                            this.formatDate(
                                                week.dateFrom
                                            )
                                        )}
                                    </th>
                                `
                            ).join("")}

                        </tr>

                    </thead>


                    <tbody>

                        ${rows.map(
                            (
                                [
                                    label,
                                    field
                                ]
                            ) => `
                                <tr
                                    class="${
                                        [
                                            "openingCash",
                                            "cashIn",
                                            "cashOut",
                                            "netCashFlow",
                                            "endingCash"
                                        ].includes(field)
                                            ? "total"
                                            : ""
                                    }"
                                >

                                    <td>
                                        ${label}
                                    </td>

                                    ${d.weeks.map(
                                        week => `
                                            <td class="num">
                                                ${this.money(
                                                    week[field]
                                                )}
                                            </td>
                                        `
                                    ).join("")}

                                </tr>
                            `
                        ).join("")}

                    </tbody>

                </table>


                <script>
                    window.onload =
                        () =>
                            window.print();
                <\/script>

            </body>

            </html>
            `;


        const win =
            window.open(
                "",
                "_blank"
            );


        if (!win) {

            window.App
                ?.showError
                ?.(
                    "Popup was blocked by the browser."
                );

            return;

        }


        win.document.open();

        win.document.write(
            html
        );

        win.document.close();


        console.log(
            "FINOVA CASH FLOW FORECAST PDF PREVIEW OPENED"
        );

    }


    /* ======================================================
       DESTROY
    ====================================================== */

    destroy() {

        this.destroyed =
            true;


        this.bound.forEach(
            (
                [
                    element,
                    event,
                    handler
                ]
            ) =>
                element
                    ?.removeEventListener(
                        event,
                        handler
                    )
        );


        this.bound =
            [];


        this.dataset =
            null;


        this.businessPartners =
            [];


        this.currentManual =
            null;


        this.deleteManualId =
            null;


        console.log(
            "FINOVA CASH FLOW FORECAST DESTROYED"
        );

    }

}