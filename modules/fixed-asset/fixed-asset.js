/* ==========================================================
   FINOVA ACCOUNTING SYSTEM
   FIXED ASSET
   Version : 1.1.0 FINAL
========================================================== */

import {
    FixedAssetService
} from "../../service/fixed-asset.service.js";

import {
    ExcelExportService
} from "../../service/excel-export.service.js";


export class FixedAsset {

    /* ======================================================
       CONSTRUCTOR
    ====================================================== */

    constructor() {

        this.service =
            new FixedAssetService();

        this.assets =
            [];

        this.filtered =
            [];

        this.categories =
            [];

        this.coa =
            [];

        this.currentDepAsset =
            null;

        this.bound =
            [];

        this.destroyed =
            false;

        this.isRefreshing =
            false;

        this.init();

    }


    /* ======================================================
       INITIALIZE
    ====================================================== */

    async init() {

        try {

            this.cache();

            this.bind();

            await this.load(
                true
            );


            console.log(
                "FINOVA FIXED ASSET V1.1.0 INITIALIZED"
            );

        }

        catch (
            error
        ) {

            console.error(
                "FixedAsset.init",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to initialize Fixed Asset."
            );

        }

    }


    /* ======================================================
       CACHE DOM
    ====================================================== */

    cache() {

        const $ =
            id =>
                document.getElementById(
                    id
                );


        /* ==================================================
           MAIN
        ================================================== */

        this.body =
            $("fa-table-body");

        this.search =
            $("fa-search");

        this.status =
            $("fa-status");


        /* ==================================================
           MAIN BUTTONS
        ================================================== */

        this.btnFind =
            $("btn-fa-find");

        this.btnAdd =
            $("btn-fa-add");

        this.btnCategory =
            $("btn-fa-category");

        this.btnRefresh =
            $("btn-fa-refresh");

        this.btnExcel =
            $("btn-fa-excel");

        this.btnSave =
            $("btn-fa-save");


        /* ==================================================
           CATEGORY
        ================================================== */

        this.facBody =
            $("fac-body");

        this.btnFacSave =
            $("btn-fac-save");


        /* ==================================================
           DEPRECIATION
        ================================================== */

        this.fadBody =
            $("fad-body");

        this.btnFadCreate =
            $("btn-fad-create");


        /* ==================================================
           DISPOSAL
        ================================================== */

        this.btnDisposeSave =
            $("btn-fadis-save");

    }


    /* ======================================================
       EVENT HELPER
    ====================================================== */

    on(
        element,
        type,
        handler
    ) {

        if (
            !element
        ) {

            return;

        }


        element.addEventListener(
            type,
            handler
        );


        this.bound.push(
            [
                element,
                type,
                handler
            ]
        );

    }


    /* ======================================================
       BIND EVENTS
    ====================================================== */

    bind() {

        /* ==================================================
           FIND
        ================================================== */

        this.on(
            this.btnFind,
            "click",
            () => {

                this.applyFilter();

            }
        );


        /* ==================================================
           SEARCH ENTER
        ================================================== */

        this.on(
            this.search,
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


        /* ==================================================
           STATUS
        ================================================== */

        this.on(
            this.status,
            "change",
            () => {

                this.applyFilter();

            }
        );


        /* ==================================================
           REFRESH
        ================================================== */

        this.on(
            this.btnRefresh,
            "click",
            async event => {

                event.preventDefault();

                await this.refresh();

            }
        );


        /* ==================================================
           NEW ASSET
        ================================================== */

        this.on(
            this.btnAdd,
            "click",
            () => {

                this.openAsset();

            }
        );


        /* ==================================================
           CATEGORY
        ================================================== */

        this.on(
            this.btnCategory,
            "click",
            () => {

                this.openCategories();

            }
        );


        /* ==================================================
           SAVE ASSET
        ================================================== */

        this.on(
            this.btnSave,
            "click",
            async () => {

                await this.saveAsset();

            }
        );


        /* ==================================================
           SAVE CATEGORY
        ================================================== */

        this.on(
            this.btnFacSave,
            "click",
            async () => {

                await this.saveCategory();

            }
        );


        /* ==================================================
           CREATE DEPRECIATION
        ================================================== */

        this.on(
            this.btnFadCreate,
            "click",
            async () => {

                await this.createDep();

            }
        );


        /* ==================================================
           DISPOSAL
        ================================================== */

        this.on(
            this.btnDisposeSave,
            "click",
            async () => {

                await this.dispose();

            }
        );


        /* ==================================================
           EXCEL
        ================================================== */

        this.on(
            this.btnExcel,
            "click",
            () => {

                this.downloadExcel();

            }
        );


        /* ==================================================
           ASSET TABLE ACTION
        ================================================== */

        this.on(
            this.body,
            "click",
            async event => {

                await this.handleAssetAction(
                    event
                );

            }
        );


        /* ==================================================
           CATEGORY TABLE ACTION
        ================================================== */

        this.on(
            this.facBody,
            "click",
            event => {

                this.handleCategoryAction(
                    event
                );

            }
        );


        /* ==================================================
           DEPRECIATION TABLE ACTION
        ================================================== */

        this.on(
            this.fadBody,
            "click",
            async event => {

                await this.handleDepAction(
                    event
                );

            }
        );

    }


    /* ======================================================
   REFRESH
====================================================== */

async refresh() {

    if (
        this.isRefreshing
    ) {

        return;

    }


    this.isRefreshing =
        true;


    const startedAt =
        Date.now();


    try {

        console.log(
            "FixedAsset.refresh",
            {
                time:
                    new Date()
                        .toISOString()
            }
        );


        /* ==================================================
           SHOW GLOBAL FINOVA LOADING
        ================================================== */

        window.App
            ?.showLoading
            ?.();


        /* ==================================================
           RESET FILTER
        ================================================== */

        if (
            this.search
        ) {

            this.search.value =
                "";

        }


        if (
            this.status
        ) {

            this.status.value =
                "";

        }


        /* ==================================================
           RELOAD DATA

           false:
           loading dikontrol oleh refresh()
        ================================================== */

        await this.load(
            false
        );


        /* ==================================================
           RESET FILTERED DATA
        ================================================== */

        this.filtered =
            [
                ...this.assets
            ];


        /* ==================================================
           RENDER
        ================================================== */

        this.render();


        /* ==================================================
           MINIMUM LOADING DISPLAY
           Agar loading terlihat oleh user
        ================================================== */

        const elapsed =
            Date.now()
            -
            startedAt;


        const minimumLoadingTime =
            500;


        if (
            elapsed <
            minimumLoadingTime
        ) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        minimumLoadingTime
                        -
                        elapsed
                    )
            );

        }


        console.log(
            "FINOVA FIXED ASSET REFRESHED"
        );

    }

    catch (
        error
    ) {

        console.error(
            "FINOVA FIXED ASSET REFRESH ERROR:",
            error
        );


        this.showError(
            error?.message
            ||
            "Failed to refresh Fixed Asset."
        );

    }

    finally {

        /* ==================================================
           HIDE GLOBAL FINOVA LOADING
        ================================================== */

        window.App
            ?.hideLoading
            ?.();


        this.isRefreshing =
            false;

    }

}

    /* ======================================================
       FORMAT MONEY
    ====================================================== */

    money(
        value
    ) {

        return new Intl.NumberFormat(
            "id-ID",
            {
                style:
                    "currency",

                currency:
                    "IDR",

                maximumFractionDigits:
                    0
            }
        ).format(
            Number(
                value
                ||
                0
            )
        );

    }


    /* ======================================================
       FORMAT DATE
    ====================================================== */

    date(
        value
    ) {

        if (
            !value
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
        ).format(
            new Date(
                `${value}T00:00:00`
            )
        );

    }


    /* ======================================================
       ESCAPE HTML
    ====================================================== */

    esc(
        value
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.textContent =
            String(
                value
                ??
                ""
            );


        return element.innerHTML;

    }


    /* ======================================================
       ACCUMULATED DEPRECIATION
    ====================================================== */

    accum(
        asset
    ) {

        return Number(
            asset
                ?.accumulated_depreciation
            ||
            0
        );

    }


    /* ======================================================
       CALCULATE ASSET VALUES
    ====================================================== */

    async calculateAssetValues() {

        const depreciations =
            await this.service
                .getDepreciations();


        const map =
            new Map();


        depreciations
            .filter(
                item =>
                    String(
                        item.status
                        ||
                        ""
                    ).toLowerCase()
                    ===
                    "posted"
            )
            .forEach(
                item => {

                    const assetId =
                        String(
                            item.asset_id
                        );


                    map.set(
                        assetId,
                        (
                            map.get(
                                assetId
                            )
                            ||
                            0
                        )
                        +
                        Number(
                            item.depreciation_amount
                            ||
                            0
                        )
                    );

                }
            );


        this.assets.forEach(
            asset => {

                const accumulated =
                    map.get(
                        String(
                            asset.id
                        )
                    )
                    ||
                    0;


                asset.accumulated_depreciation =
                    accumulated;


                asset.book_value =
                    Math.max(
                        Number(
                            asset.acquisition_cost
                            ||
                            0
                        )
                        -
                        accumulated,

                        Number(
                            asset.salvage_value
                            ||
                            0
                        )
                    );

            }
        );

    }


    /* ======================================================
       LOAD DATA
    ====================================================== */

    async load(
        showLoading = false
    ) {

        if (
            showLoading
        ) {

            window.App
                ?.showLoading
                ?.();

        }


        try {

            const [
                assets,
                categories,
                coa
            ] =
                await Promise.all(
                    [
                        this.service
                            .getAssets(),

                        this.service
                            .getCategories(),

                        this.service
                            .getCOA()
                    ]
                );


            if (
                this.destroyed
            ) {

                return;

            }


            this.assets =
                Array.isArray(
                    assets
                )
                    ? assets
                    : [];


            this.categories =
                Array.isArray(
                    categories
                )
                    ? categories
                    : [];


            this.coa =
                Array.isArray(
                    coa
                )
                    ? coa
                    : [];


            await this
                .calculateAssetValues();


            if (
                this.destroyed
            ) {

                return;

            }


            this.filtered =
                [
                    ...this.assets
                ];


            this.render();

            this.fillOptions();

        }

        finally {

            if (
                showLoading
            ) {

                window.App
                    ?.hideLoading
                    ?.();

            }

        }

    }


    /* ======================================================
       APPLY FILTER
    ====================================================== */

    applyFilter() {

        const keyword =
            this.search
                ?.value
                ?.trim()
                ?.toLowerCase()
            ||
            "";


        const status =
            this.status
                ?.value
            ||
            "";


        this.filtered =
            this.assets.filter(
                asset => {

                    const statusMatch =
                        !status
                        ||
                        asset.status ===
                            status;


                    const searchMatch =
                        !keyword
                        ||
                        [
                            asset.asset_no,
                            asset.asset_name,
                            asset.category
                                ?.category_name,
                            asset.location
                        ]
                            .some(
                                value =>
                                    String(
                                        value
                                        ||
                                        ""
                                    )
                                        .toLowerCase()
                                        .includes(
                                            keyword
                                        )
                            );


                    return (
                        statusMatch
                        &&
                        searchMatch
                    );

                }
            );


        this.render();

    }


    /* ======================================================
       RENDER ASSET TABLE
    ====================================================== */

    render() {

        if (
            !this.body
        ) {

            return;

        }


        if (
            !this.filtered.length
        ) {

            this.body.innerHTML = `

                <tr>

                    <td
                        colspan="10"
                        class="
                            text-center
                            text-muted
                            py-5
                        "
                    >

                        No Fixed Asset data.

                    </td>

                </tr>

            `;


            return;

        }


        this.body.innerHTML =
            this.filtered
                .map(
                    (
                        asset,
                        index
                    ) => `

                        <tr>

                            <td
                                class="
                                    finova-table-index
                                    text-center
                                "
                            >
                                ${index + 1}
                            </td>


                            <td class="finova-table-code">

                                ${this.esc(
                                    asset.asset_no
                                )}

                            </td>


                            <td class="finova-table-name">

                                <strong>

                                    ${this.esc(
                                        asset.asset_name
                                    )}

                                </strong>


                                ${
                                    asset.location
                                        ? `

                                            <div
                                                class="
                                                    small
                                                    text-muted
                                                "
                                            >
                                                ${this.esc(
                                                    asset.location
                                                )}
                                            </div>

                                        `
                                        : ""
                                }

                            </td>


                            <td class="finova-table-name">

                                ${this.esc(
                                    asset.category
                                        ?.category_name
                                    ||
                                    "-"
                                )}

                            </td>


                            <td
                                class="
                                    finova-table-date
                                    text-center
                                "
                            >

                                ${this.date(
                                    asset.acquisition_date
                                )}

                            </td>


                            <td
                                class="
                                    finova-table-number
                                    fa-amount
                                "
                            >

                                ${this.money(
                                    asset.acquisition_cost
                                )}

                            </td>


                            <td
                                class="
                                    finova-table-number
                                    fa-amount
                                "
                            >

                                ${this.money(
                                    asset.accumulated_depreciation
                                )}

                            </td>


                            <td
                                class="
                                    finova-table-number
                                    fa-amount
                                "
                            >

                                <strong>

                                    ${this.money(
                                        asset.book_value
                                    )}

                                </strong>

                            </td>


                            <td
                                class="
                                    finova-table-status
                                    text-center
                                "
                            >

                                <span
                                    class="
                                        badge
                                        ${
                                            asset.status ===
                                            "Active"
                                                ? "text-bg-success"
                                                :
                                            asset.status ===
                                            "Disposed"
                                                ? "text-bg-secondary"
                                                :
                                                "text-bg-warning"
                                        }
                                        fa-status
                                    "
                                >

                                    ${this.esc(
                                        asset.status
                                    )}

                                </span>

                            </td>


                            <td class="finova-table-action">

                                <div class="fa-actions">


                                    <button
                                        type="button"
                                        class="
                                            btn
                                            btn-sm
                                            btn-outline-primary
                                        "
                                        data-fa="edit"
                                        data-id="${asset.id}"
                                        title="Edit"
                                    >

                                        <i class="fa-solid fa-pen"></i>

                                    </button>


                                    <button
                                        type="button"
                                        class="
                                            btn
                                            btn-sm
                                            btn-outline-success
                                        "
                                        data-fa="dep"
                                        data-id="${asset.id}"
                                        title="Depreciation"
                                    >

                                        <i class="fa-solid fa-calculator"></i>

                                    </button>


                                    <button
                                        type="button"
                                        class="
                                            btn
                                            btn-sm
                                            btn-outline-warning
                                        "
                                        data-fa="dispose"
                                        data-id="${asset.id}"
                                        title="Dispose"
                                    >

                                        <i
                                            class="
                                                fa-solid
                                                fa-arrow-right-from-bracket
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
                                        data-fa="delete"
                                        data-id="${asset.id}"
                                        title="Delete"
                                    >

                                        <i class="fa-solid fa-trash"></i>

                                    </button>

                                </div>

                            </td>

                        </tr>

                    `
                )
                .join("");

    }


    /* ======================================================
       FILL OPTIONS
    ====================================================== */

    fillOptions() {

        /* ==================================================
           COA
        ================================================== */

        const accountOptions =
            `
                <option value="">
                    Select Account
                </option>
            `
            +
            this.coa
                .map(
                    account => `

                        <option value="${account.id}">

                            ${this.esc(
                                account.account_code
                            )}
                            ::
                            ${this.esc(
                                account.account_name
                            )}

                        </option>

                    `
                )
                .join("");


        [
            "fac-asset-account",
            "fac-accum-account",
            "fac-expense-account",
            "fac-gain-account",
            "fac-loss-account",
            "fadis-account"
        ]
            .forEach(
                id => {

                    const element =
                        document.getElementById(
                            id
                        );


                    if (
                        element
                    ) {

                        element.innerHTML =
                            accountOptions;

                    }

                }
            );


        /* ==================================================
           CATEGORY
        ================================================== */

        const categoryOptions =
            `
                <option value="">
                    Select Category
                </option>
            `
            +
    this.categories
    .filter(
        category =>
            category.status === true
    )
                .map(
                    category => `

                        <option value="${category.id}">

                            ${this.esc(
                                category.category_code
                            )}
                            ::
                            ${this.esc(
                                category.category_name
                            )}

                        </option>

                    `
                )
                .join("");


        const categoryElement =
            document.getElementById(
                "fa-category"
            );


        if (
            categoryElement
        ) {

            categoryElement.innerHTML =
                categoryOptions;

        }

    }


    /* ======================================================
       OPEN ASSET
    ====================================================== */

    openAsset(
        asset = null
    ) {

        const today =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );


        document
            .getElementById(
                "fa-id"
            )
            .value =
                asset?.id
                ||
                "";


        document
            .getElementById(
                "fa-no"
            )
            .value =
                asset?.asset_no
                ||
                "";


        document
            .getElementById(
                "fa-name"
            )
            .value =
                asset?.asset_name
                ||
                "";


        document
            .getElementById(
                "fa-category"
            )
            .value =
                asset?.category_id
                ||
                "";


        document
            .getElementById(
                "fa-acquisition-date"
            )
            .value =
                asset?.acquisition_date
                ||
                today;


        document
            .getElementById(
                "fa-start-date"
            )
            .value =
                asset?.depreciation_start_date
                ||
                today;


        document
            .getElementById(
                "fa-cost"
            )
            .value =
                asset?.acquisition_cost
                ??
                "";


        document
            .getElementById(
                "fa-salvage"
            )
            .value =
                asset?.salvage_value
                ??
                0;


        document
            .getElementById(
                "fa-life"
            )
            .value =
                asset?.useful_life_months
                ||
                "";


        document
            .getElementById(
                "fa-method"
            )
            .value =
                asset?.depreciation_method
                ||
                "STRAIGHT_LINE";


        document
            .getElementById(
                "fa-location"
            )
            .value =
                asset?.location
                ||
                "";


        document
            .getElementById(
                "fa-description"
            )
            .value =
                asset?.description
                ||
                "";


        document
            .getElementById(
                "fa-form-status"
            )
            .value =
                asset?.status ===
                "Inactive"
                    ? "Inactive"
                    : "Active";


        document
            .getElementById(
                "fa-asset-modal-title"
            )
            .textContent =
                asset
                    ? "Edit Fixed Asset"
                    : "New Fixed Asset";


        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById(
                    "faAssetModal"
                )
            )
            .show();

    }


    /* ======================================================
       SAVE ASSET
    ====================================================== */

    async saveAsset() {

        const button =
            this.btnSave;


        if (
            button?.disabled
        ) {

            return;

        }


        try {

            if (
                button
            ) {

                button.disabled =
                    true;

            }


            const id =
                document
                    .getElementById(
                        "fa-id"
                    )
                    .value
                ||
                null;


            const categoryId =
                document
                    .getElementById(
                        "fa-category"
                    )
                    .value;


            const category =
                this.categories.find(
                    item =>
                        String(
                            item.id
                        )
                        ===
                        String(
                            categoryId
                        )
                );


            const payload = {

                asset_no:
                    document
                        .getElementById(
                            "fa-no"
                        )
                        .value
                        .trim(),

                asset_name:
                    document
                        .getElementById(
                            "fa-name"
                        )
                        .value
                        .trim(),

                category_id:
                    categoryId,

                acquisition_date:
                    document
                        .getElementById(
                            "fa-acquisition-date"
                        )
                        .value,

                depreciation_start_date:
                    document
                        .getElementById(
                            "fa-start-date"
                        )
                        .value,

                acquisition_cost:
                    Number(
                        document
                            .getElementById(
                                "fa-cost"
                            )
                            .value
                        ||
                        0
                    ),

                salvage_value:
                    Number(
                        document
                            .getElementById(
                                "fa-salvage"
                            )
                            .value
                        ||
                        0
                    ),

                useful_life_months:
                    Number(
                        document
                            .getElementById(
                                "fa-life"
                            )
                            .value
                        ||
                        category
                            ?.useful_life_months
                        ||
                        0
                    ),

                depreciation_method:
                    document
                        .getElementById(
                            "fa-method"
                        )
                        .value
                    ||
                    "STRAIGHT_LINE",

                location:
                    document
                        .getElementById(
                            "fa-location"
                        )
                        .value
                        .trim()
                    ||
                    null,

                description:
                    document
                        .getElementById(
                            "fa-description"
                        )
                        .value
                        .trim()
                    ||
                    null,

                status:
                    document
                        .getElementById(
                            "fa-form-status"
                        )
                        .value

            };


            /* ==============================================
               VALIDATION
            ============================================== */

            if (
                !payload.asset_no
                ||
                !payload.asset_name
                ||
                !payload.category_id
                ||
                !payload.acquisition_date
                ||
                !payload.depreciation_start_date
                ||
                payload.acquisition_cost < 0
                ||
                payload.useful_life_months < 1
            ) {

                throw new Error(
                    "Complete all required Fixed Asset fields."
                );

            }


            if (
                payload.salvage_value >
                payload.acquisition_cost
            ) {

                throw new Error(
                    "Salvage Value cannot exceed Acquisition Cost."
                );

            }


            /* ==============================================
               SAVE
            ============================================== */

            await this.service
                .saveAsset(
                    payload,
                    id
                );


            /* ==============================================
               CLOSE MODAL
            ============================================== */

            bootstrap.Modal
                .getInstance(
                    document.getElementById(
                        "faAssetModal"
                    )
                )
                ?.hide();


            /* ==============================================
               RELOAD
            ============================================== */

            await this.load(
                false
            );


            /* ==============================================
               SUCCESS
            ============================================== */

            this.showSuccess(
                id
                    ? "Fixed Asset successfully updated."
                    : "Fixed Asset successfully saved."
            );

        }

        catch (
            error
        ) {

            console.error(
                "FixedAsset.saveAsset",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to save Fixed Asset."
            );

        }

        finally {

            if (
                button
            ) {

                button.disabled =
                    false;

            }

        }

    }


    /* ======================================================
       OPEN CATEGORY
    ====================================================== */

    openCategories() {

        this.resetCategoryForm();

        this.renderCategories();


        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById(
                    "faCategoryModal"
                )
            )
            .show();

    }


    /* ======================================================
       RESET CATEGORY FORM
    ====================================================== */

    resetCategoryForm() {

        const defaults = {

            "fac-id":
                "",

            "fac-code":
                "",

            "fac-name":
                "",

            "fac-life":
                "",

            "fac-active":
                "true",

            "fac-asset-account":
                "",

            "fac-accum-account":
                "",

            "fac-expense-account":
                "",

            "fac-gain-account":
                "",

            "fac-loss-account":
                ""

        };


        Object.entries(
            defaults
        )
            .forEach(
                (
                    [
                        id,
                        value
                    ]
                ) => {

                    const element =
                        document.getElementById(
                            id
                        );


                    if (
                        element
                    ) {

                        element.value =
                            value;

                    }

                }
            );

    }


    /* ======================================================
       RENDER CATEGORIES
    ====================================================== */

    renderCategories() {

        if (
            !this.facBody
        ) {

            return;

        }


        if (
            !this.categories.length
        ) {

            this.facBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="
                            text-center
                            text-muted
                            py-4
                        "
                    >

                        No category.

                    </td>

                </tr>

            `;


            return;

        }


        this.facBody.innerHTML =
            this.categories
                .map(
                    category => {

                        const assetAccount =
                            this.coa.find(
                                account =>
                                    String(
                                        account.id
                                    )
                                    ===
                                    String(
                                        category.asset_account_id
                                    )
                            );


                        const accumulatedAccount =
                            this.coa.find(
                                account =>
                                    String(
                                        account.id
                                    )
                                    ===
                                    String(
                                        category
                                            .accumulated_depreciation_account_id
                                    )
                            );


                        const expenseAccount =
                            this.coa.find(
                                account =>
                                    String(
                                        account.id
                                    )
                                    ===
                                    String(
                                        category
                                            .depreciation_expense_account_id
                                    )
                            );


                        return `

                            <tr>

                                <td>
                                    ${this.esc(
                                        category.category_code
                                    )}
                                </td>

                                <td>
                                    ${this.esc(
                                        category.category_name
                                    )}
                                </td>

                                <td>
                                    ${
                                        Number(
                                            category.useful_life_months
                                            ||
                                            0
                                        )
                                    }
                                    months
                                </td>

                                <td>
                                    ${this.esc(
                                        assetAccount
                                            ?.account_code
                                        ||
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${this.esc(
                                        accumulatedAccount
                                            ?.account_code
                                        ||
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${this.esc(
                                        expenseAccount
                                            ?.account_code
                                        ||
                                        "-"
                                    )}
                                </td>

                                <td class="text-center">

                                    <button
                                        type="button"
                                        class="
                                            btn
                                            btn-sm
                                            btn-outline-primary
                                        "
                                        data-fac-edit="${category.id}"
                                        title="Edit"
                                    >

                                        <i class="fa-solid fa-pen"></i>

                                    </button>

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");

    }


    /* ======================================================
       CATEGORY ACTION
    ====================================================== */

    handleCategoryAction(
        event
    ) {

        const button =
            event.target.closest(
                "[data-fac-edit]"
            );


        if (
            !button
        ) {

            return;

        }


        const category =
            this.categories.find(
                item =>
                    String(
                        item.id
                    )
                    ===
                    String(
                        button.dataset.facEdit
                    )
            );


        if (
            !category
        ) {

            return;

        }


        document
            .getElementById(
                "fac-id"
            )
            .value =
                category.id;


        document
            .getElementById(
                "fac-code"
            )
            .value =
                category.category_code
                ||
                "";


        document
            .getElementById(
                "fac-name"
            )
            .value =
                category.category_name
                ||
                "";


        document
            .getElementById(
                "fac-life"
            )
            .value =
                category.useful_life_months
                ||
                "";


        document
    .getElementById(
        "fac-active"
    )
    .value =
        String(
            category.status
        );


        document
            .getElementById(
                "fac-asset-account"
            )
            .value =
                category.asset_account_id
                ||
                "";


        document
            .getElementById(
                "fac-accum-account"
            )
            .value =
                category
                    .accumulated_depreciation_account_id
                ||
                "";


        document
            .getElementById(
                "fac-expense-account"
            )
            .value =
                category
                    .depreciation_expense_account_id
                ||
                "";


        document
            .getElementById(
                "fac-gain-account"
            )
            .value =
                category
                    .disposal_gain_account_id
                ||
                "";


        document
            .getElementById(
                "fac-loss-account"
            )
            .value =
                category
                    .disposal_loss_account_id
                ||
                "";

    }


    /* ======================================================
       SAVE CATEGORY
    ====================================================== */

    async saveCategory() {

        const button =
            this.btnFacSave;


        if (
            button?.disabled
        ) {

            return;

        }


        try {

            if (
                button
            ) {

                button.disabled =
                    true;

            }


            const id =
                document
                    .getElementById(
                        "fac-id"
                    )
                    .value
                ||
                null;


            const payload = {

                category_code:
                    document
                        .getElementById(
                            "fac-code"
                        )
                        .value
                        .trim(),

                category_name:
                    document
                        .getElementById(
                            "fac-name"
                        )
                        .value
                        .trim(),

                useful_life_months:
                    Number(
                        document
                            .getElementById(
                                "fac-life"
                            )
                            .value
                        ||
                        0
                    ),

                asset_account_id:
                    Number(
                        document
                            .getElementById(
                                "fac-asset-account"
                            )
                            .value
                    ),

                accumulated_depreciation_account_id:
                    Number(
                        document
                            .getElementById(
                                "fac-accum-account"
                            )
                            .value
                    ),

                depreciation_expense_account_id:
                    Number(
                        document
                            .getElementById(
                                "fac-expense-account"
                            )
                            .value
                    ),

                disposal_gain_account_id:
                    Number(
                        document
                            .getElementById(
                                "fac-gain-account"
                            )
                            .value
                    )
                    ||
                    null,

                disposal_loss_account_id:
                    Number(
                        document
                            .getElementById(
                                "fac-loss-account"
                            )
                            .value
                    )
                    ||
                    null,

                status:
    document
        .getElementById(
            "fac-active"
        )
        .value
    ===
    "true"

            };


            /* ==============================================
               VALIDATION
            ============================================== */

            if (
                !payload.category_code
                ||
                !payload.category_name
                ||
                payload.useful_life_months < 1
                ||
                !payload.asset_account_id
                ||
                !payload.accumulated_depreciation_account_id
                ||
                !payload.depreciation_expense_account_id
            ) {

                throw new Error(
                    "Complete all required Asset Category fields."
                );

            }


            /* ==============================================
               SAVE
            ============================================== */

            await this.service
                .saveCategory(
                    payload,
                    id
                );


            /* ==============================================
               RELOAD CATEGORY
            ============================================== */

            this.categories =
                await this.service
                    .getCategories();


            this.fillOptions();

            this.renderCategories();

            this.resetCategoryForm();


            /* ==============================================
               SUCCESS
            ============================================== */

            this.showSuccess(
                id
                    ? "Asset Category successfully updated."
                    : "Asset Category successfully saved."
            );

        }

        catch (
            error
        ) {

            console.error(
                "FixedAsset.saveCategory",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to save Asset Category."
            );

        }

        finally {

            if (
                button
            ) {

                button.disabled =
                    false;

            }

        }

    }


    /* ======================================================
       ASSET ACTION
    ====================================================== */

    async handleAssetAction(
        event
    ) {

        const button =
            event.target.closest(
                "[data-fa]"
            );


        if (
            !button
        ) {

            return;

        }


        const asset =
            this.assets.find(
                item =>
                    String(
                        item.id
                    )
                    ===
                    String(
                        button.dataset.id
                    )
            );


        if (
            !asset
        ) {

            return;

        }


        const action =
            button.dataset.fa;


        /* ==================================================
           EDIT
        ================================================== */

        if (
            action ===
            "edit"
        ) {

            this.openAsset(
                asset
            );


            return;

        }


        /* ==================================================
           DEPRECIATION
        ================================================== */

        if (
            action ===
            "dep"
        ) {

            await this.openDep(
                asset
            );


            return;

        }


        /* ==================================================
           DISPOSAL
        ================================================== */

        if (
            action ===
            "dispose"
        ) {

            this.openDispose(
                asset
            );


            return;

        }


        /* ==================================================
           DELETE
        ================================================== */

        if (
            action ===
            "delete"
        ) {

            const confirmed =
                window.confirm(
                    `Delete ${asset.asset_no} - ${asset.asset_name}?`
                );


            if (
                !confirmed
            ) {

                return;

            }


            try {

                await this.service
                    .deleteAsset(
                        asset.id
                    );


                await this.load(
                    false
                );


                this.showSuccess(
                    "Fixed Asset successfully deleted."
                );

            }

            catch (
                error
            ) {

                console.error(
                    "FixedAsset.deleteAsset",
                    error
                );


                this.showError(
                    error?.message
                    ||
                    "Failed to delete Fixed Asset."
                );

            }

        }

    }


    /* ======================================================
       OPEN DEPRECIATION
    ====================================================== */

    async openDep(
        asset
    ) {

        try {

            this.currentDepAsset =
                asset;


            document
                .getElementById(
                    "fad-asset-id"
                )
                .value =
                    asset.id;


            document
                .getElementById(
                    "fad-date"
                )
                .value =
                    new Date()
                        .toISOString()
                        .slice(
                            0,
                            10
                        );


            document
                .getElementById(
                    "fad-asset-info"
                )
                .innerHTML = `

                    <strong>
                        ${this.esc(
                            asset.asset_no
                        )}
                        -
                        ${this.esc(
                            asset.asset_name
                        )}
                    </strong>

                    <br>

                    Monthly depreciation:
                    ${this.money(
                        this.service.monthly(
                            asset
                        )
                    )}

                    |

                    Book value:
                    ${this.money(
                        asset.book_value
                    )}

                `;


            await this.renderDeps();


            bootstrap.Modal
                .getOrCreateInstance(
                    document.getElementById(
                        "faDepModal"
                    )
                )
                .show();

        }

        catch (
            error
        ) {

            console.error(
                "FixedAsset.openDep",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to load depreciation."
            );

        }

    }


    /* ======================================================
       RENDER DEPRECIATION
    ====================================================== */

    async renderDeps() {

        if (
            !this.currentDepAsset
        ) {

            return;

        }


        const rows =
            await this.service
                .getDepreciations(
                    this.currentDepAsset.id
                );


        if (
            !this.fadBody
        ) {

            return;

        }


        if (
            !rows.length
        ) {

            this.fadBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="
                            text-center
                            text-muted
                            py-4
                        "
                    >

                        No depreciation history.

                    </td>

                </tr>

            `;


            return;

        }


        this.fadBody.innerHTML =
            rows
                .map(
                    depreciation => `

                        <tr>

                            <td>
                                ${this.esc(
                                    depreciation.period_key
                                )}
                            </td>


                            <td class="fa-amount">
                                ${this.money(
                                    depreciation
                                        .depreciation_amount
                                )}
                            </td>


                            <td class="fa-amount">
                                ${this.money(
                                    depreciation
                                        .accumulated_depreciation
                                )}
                            </td>


                            <td class="fa-amount">
                                ${this.money(
                                    depreciation
                                        .book_value
                                )}
                            </td>


                            <td class="text-center">

                                <span
                                    class="
                                        badge
                                        ${
                                            depreciation.status ===
                                            "Posted"
                                                ? "text-bg-secondary"
                                                :
                                            depreciation.status ===
                                            "Void"
                                                ? "text-bg-light"
                                                :
                                                "text-bg-warning"
                                        }
                                    "
                                >
                                    ${this.esc(
                                        depreciation.status
                                    )}
                                </span>

                            </td>


                            <td class="text-center">

                                ${
                                    depreciation.status ===
                                    "Draft"
                                        ? `

                                            <button
                                                type="button"
                                                class="
                                                    btn
                                                    btn-sm
                                                    btn-success
                                                "
                                                data-fad-post="${depreciation.id}"
                                            >

                                                <i
                                                    class="
                                                        fa-solid
                                                        fa-check
                                                        me-1
                                                    "
                                                ></i>

                                                Post

                                            </button>

                                        `
                                        : "-"
                                }

                            </td>

                        </tr>

                    `
                )
                .join("");

    }


    /* ======================================================
       CREATE DEPRECIATION
    ====================================================== */

    async createDep() {

        if (
            !this.currentDepAsset
        ) {

            this.showError(
                "Fixed Asset is not selected."
            );


            return;

        }


        const button =
            this.btnFadCreate;


        if (
            button?.disabled
        ) {

            return;

        }


        try {

            if (
                button
            ) {

                button.disabled =
                    true;

            }


            const depreciationDate =
                document
                    .getElementById(
                        "fad-date"
                    )
                    .value;


            if (
                !depreciationDate
            ) {

                throw new Error(
                    "Depreciation Date is required."
                );

            }


            if (
                depreciationDate <
                this.currentDepAsset
                    .depreciation_start_date
            ) {

                throw new Error(
                    "Depreciation Date cannot be before Depreciation Start Date."
                );

            }


            if (
                this.currentDepAsset.status !==
                "Active"
            ) {

                throw new Error(
                    "Only Active Fixed Asset can be depreciated."
                );

            }


            await this.service
                .createDepreciation(
                    this.currentDepAsset,
                    depreciationDate
                );


            await this.renderDeps();


            this.showSuccess(
                "Draft depreciation successfully created."
            );

        }

        catch (
            error
        ) {

            console.error(
                "FixedAsset.createDep",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to create depreciation."
            );

        }

        finally {

            if (
                button
            ) {

                button.disabled =
                    false;

            }

        }

    }


    /* ======================================================
       POST DEPRECIATION
    ====================================================== */

    async handleDepAction(
        event
    ) {

        const button =
            event.target.closest(
                "[data-fad-post]"
            );


        if (
            !button
            ||
            !this.currentDepAsset
        ) {

            return;

        }


        if (
            button.disabled
        ) {

            return;

        }


        try {

            button.disabled =
                true;


            const depreciations =
                await this.service
                    .getDepreciations(
                        this.currentDepAsset.id
                    );


            const depreciation =
                depreciations.find(
                    item =>
                        String(
                            item.id
                        )
                        ===
                        String(
                            button.dataset.fadPost
                        )
                );


            if (
                !depreciation
            ) {

                throw new Error(
                    "Depreciation transaction not found."
                );

            }


            if (
                depreciation.status !==
                "Draft"
            ) {

                throw new Error(
                    "Only Draft depreciation can be posted."
                );

            }


            await this.service
                .postDepreciationJournal(
                    depreciation,
                    this.currentDepAsset
                );


            /* ==============================================
               RELOAD MAIN DATA
            ============================================== */

            const currentAssetId =
                this.currentDepAsset.id;


            await this.load(
                false
            );


            this.currentDepAsset =
                this.assets.find(
                    item =>
                        String(
                            item.id
                        )
                        ===
                        String(
                            currentAssetId
                        )
                )
                ||
                null;


            if (
                this.currentDepAsset
            ) {

                document
                    .getElementById(
                        "fad-asset-info"
                    )
                    .innerHTML = `

                        <strong>
                            ${this.esc(
                                this.currentDepAsset
                                    .asset_no
                            )}
                            -
                            ${this.esc(
                                this.currentDepAsset
                                    .asset_name
                            )}
                        </strong>

                        <br>

                        Monthly depreciation:
                        ${this.money(
                            this.service.monthly(
                                this.currentDepAsset
                            )
                        )}

                        |

                        Book value:
                        ${this.money(
                            this.currentDepAsset
                                .book_value
                        )}

                    `;


                await this.renderDeps();

            }


            this.showSuccess(
                "Depreciation successfully posted to GL Journal."
            );

        }

        catch (
            error
        ) {

            console.error(
                "FixedAsset.handleDepAction",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to post depreciation."
            );

        }

        finally {

            if (
                button?.isConnected
            ) {

                button.disabled =
                    false;

            }

        }

    }


    /* ======================================================
       OPEN DISPOSAL
    ====================================================== */

    openDispose(
        asset
    ) {

        if (
            asset.status ===
            "Disposed"
        ) {

            this.showError(
                "Asset is already disposed."
            );


            return;

        }


        if (
            asset.status !==
            "Active"
        ) {

            this.showError(
                "Only Active Fixed Asset can be disposed."
            );


            return;

        }


        document
            .getElementById(
                "fadis-asset-id"
            )
            .value =
                asset.id;


        document
            .getElementById(
                "fadis-date"
            )
            .value =
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10
                    );


        document
            .getElementById(
                "fadis-amount"
            )
            .value =
                0;


        document
            .getElementById(
                "fadis-account"
            )
            .value =
                "";


        document
            .getElementById(
                "fadis-info"
            )
            .innerHTML = `

                <strong>
                    ${this.esc(
                        asset.asset_no
                    )}
                    -
                    ${this.esc(
                        asset.asset_name
                    )}
                </strong>

                <br>

                Current Book Value:
                ${this.money(
                    asset.book_value
                )}

            `;


        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById(
                    "faDisposeModal"
                )
            )
            .show();

    }


    /* ======================================================
       DISPOSE ASSET
    ====================================================== */

    async dispose() {

        const button =
            this.btnDisposeSave;


        if (
            button?.disabled
        ) {

            return;

        }


        try {

            if (
                button
            ) {

                button.disabled =
                    true;

            }


            const assetId =
                document
                    .getElementById(
                        "fadis-asset-id"
                    )
                    .value;


            const asset =
                this.assets.find(
                    item =>
                        String(
                            item.id
                        )
                        ===
                        String(
                            assetId
                        )
                );


            if (
                !asset
            ) {

                throw new Error(
                    "Fixed Asset not found."
                );

            }


            const disposalDate =
                document
                    .getElementById(
                        "fadis-date"
                    )
                    .value;


            const amount =
                Number(
                    document
                        .getElementById(
                            "fadis-amount"
                        )
                        .value
                    ||
                    0
                );


            const accountId =
                document
                    .getElementById(
                        "fadis-account"
                    )
                    .value;


            if (
                !disposalDate
                ||
                !accountId
            ) {

                throw new Error(
                    "Disposal Date and Proceeds Account are required."
                );

            }


            if (
                disposalDate <
                asset.acquisition_date
            ) {

                throw new Error(
                    "Disposal Date cannot be before Acquisition Date."
                );

            }


            if (
                amount < 0
            ) {

                throw new Error(
                    "Selling Price cannot be negative."
                );

            }


            await this.service
                .disposeAsset(
                    asset,
                    disposalDate,
                    amount,
                    accountId
                );


            bootstrap.Modal
                .getInstance(
                    document.getElementById(
                        "faDisposeModal"
                    )
                )
                ?.hide();


            await this.load(
                false
            );


            this.showSuccess(
                "Fixed Asset successfully disposed and GL Journal created."
            );

        }

        catch (
            error
        ) {

            console.error(
                "FixedAsset.dispose",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to dispose Fixed Asset."
            );

        }

        finally {

            if (
                button
            ) {

                button.disabled =
                    false;

            }

        }

    }


    /* ======================================================
       DOWNLOAD EXCEL
    ====================================================== */

    downloadExcel() {

        if (
            !this.filtered.length
        ) {

            this.showError(
                "No Fixed Asset data available to export."
            );


            return;

        }


        try {

            const data =
                this.filtered.map(
                    (
                        asset,
                        index
                    ) => ({

                        No:
                            index + 1,

                        "Asset No":
                            asset.asset_no,

                        "Asset Name":
                            asset.asset_name,

                        Category:
                            asset.category
                                ?.category_name
                            ||
                            "",

                        "Acquisition Date":
                            asset.acquisition_date,

                        "Acquisition Cost":
                            Number(
                                asset.acquisition_cost
                                ||
                                0
                            ),

                        "Salvage Value":
                            Number(
                                asset.salvage_value
                                ||
                                0
                            ),

                        "Useful Life (Months)":
                            Number(
                                asset.useful_life_months
                                ||
                                0
                            ),

                        "Accumulated Depreciation":
                            Number(
                                asset
                                    .accumulated_depreciation
                                ||
                                0
                            ),

                        "Book Value":
                            Number(
                                asset.book_value
                                ||
                                0
                            ),

                        Location:
                            asset.location
                            ||
                            "",

                        Status:
                            asset.status
                            ||
                            "",

                        Description:
                            asset.description
                            ||
                            ""

                    })
                );


            ExcelExportService.export(
                data,
                "Fixed Asset Register",
                "Fixed Asset Register"
            );


            this.showSuccess(
                "Fixed Asset Excel successfully downloaded."
            );

        }

        catch (
            error
        ) {

            console.error(
                "FixedAsset.downloadExcel",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to download Fixed Asset Excel."
            );

        }

    }


    /* ======================================================
       BOOTSTRAP SUCCESS
       SAME BEHAVIOR USED FOR CASH FLOW STYLE
    ====================================================== */

    showSuccess(
        message
    ) {

        /* ==================================================
           REMOVE PREVIOUS ALERT
        ================================================== */

        const oldAlert =
            document.getElementById(
                "fa-bootstrap-success-alert"
            );


        if (
            oldAlert
        ) {

            try {

                bootstrap.Alert
                    .getInstance(
                        oldAlert
                    )
                    ?.close();

            }

            catch (
                error
            ) {

                oldAlert.remove();

            }

        }


        /* ==================================================
           CREATE ALERT
        ================================================== */

        const alert =
            document.createElement(
                "div"
            );


        alert.id =
            "fa-bootstrap-success-alert";


        alert.className =
            "alert alert-success alert-dismissible fade show shadow-sm";


        alert.setAttribute(
            "role",
            "alert"
        );


        alert.innerHTML = `

            <div
                class="
                    d-flex
                    align-items-start
                "
            >

                <i
                    class="
                        fa-solid
                        fa-circle-check
                        me-2
                        mt-1
                    "
                ></i>


                <div class="flex-grow-1">

                    <strong>
                        Fixed Asset
                    </strong>

                    <div>
                        ${this.esc(
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


        /* ==================================================
           POSITION
        ================================================== */

        Object.assign(
            alert.style,
            {
                position:
                    "fixed",

                top:
                    "20px",

                left:
                    "50%",

                transform:
                    "translateX(-50%)",

                zIndex:
                    "99999",

                minWidth:
                    "380px",

                maxWidth:
                    "90vw"
            }
        );


        /* ==================================================
           APPEND
        ================================================== */

        document.body.appendChild(
            alert
        );


        /* ==================================================
           AUTO CLOSE
        ================================================== */

        window.setTimeout(
            () => {

                const currentAlert =
                    document.getElementById(
                        "fa-bootstrap-success-alert"
                    );


                if (
                    !currentAlert
                ) {

                    return;

                }


                try {

                    bootstrap.Alert
                        .getOrCreateInstance(
                            currentAlert
                        )
                        .close();

                }

                catch (
                    error
                ) {

                    currentAlert.remove();

                }

            },

            5000
        );

    }


    /* ======================================================
       ERROR
    ====================================================== */

    showError(
        message
    ) {

        if (
            window.App
            &&
            typeof window.App.showError ===
                "function"
        ) {

            window.App.showError(
                message
            );


            return;

        }


        console.error(
            "FINOVA FIXED ASSET ERROR:",
            message
        );

    }


    /* ======================================================
       DESTROY
       MULTI TAB WORKSPACE SAFE
    ====================================================== */

    destroy() {

        this.destroyed =
            true;


        /* ==================================================
           REMOVE EVENTS
        ================================================== */

        this.bound.forEach(
            (
                [
                    element,
                    type,
                    handler
                ]
            ) => {

                element.removeEventListener(
                    type,
                    handler
                );

            }
        );


        this.bound =
            [];


        /* ==================================================
           REMOVE SUCCESS ALERT
        ================================================== */

        const successAlert =
            document.getElementById(
                "fa-bootstrap-success-alert"
            );


        if (
            successAlert
        ) {

            successAlert.remove();

        }


        /* ==================================================
           RESET STATE
        ================================================== */

        this.currentDepAsset =
            null;


        console.log(
            "FINOVA FIXED ASSET DESTROYED"
        );

    }

}