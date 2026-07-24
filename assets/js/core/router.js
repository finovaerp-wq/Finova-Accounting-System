/*
===========================================
FINOVA ACCOUNTING SYSTEM
Router
Version : 2.0.0
===========================================
*/

export class FinovaRouter {

    constructor() {

        this.routes = {

            dashboard: {
                title: "Dashboard",
                html: "modules/dashboard/dashboard.html",
                js: "modules/dashboard/dashboard.js",
                className: "Dashboard"
            },

            "user-management": {
                title: "User Management",
                html: "modules/user-management/user-management.html",
                js: "modules/user-management/user-management.js",
                className: "UserManagement"
            },

            "business-partner": {
                title: "Business Partner",
                html: "modules/business-partner/business-partner.html",
                js: "modules/business-partner/business-partner.js",
                className: "BusinessPartner"
            },

            "chart-of-accounts": {
                title: "Chart Of Accounts",
                html: "modules/chart-of-accounts/chart-of-accounts.html",
                js: "modules/chart-of-accounts/chart-of-accounts.js",
                className: "ChartOfAccounts"
            },

            "account-payable": {
                title: "Account Payable",
                html: "modules/account-payable/account-payable.html",
                js: "modules/account-payable/account-payable.js",
                className: "AccountPayable"
            },

            "account-receivable": {
                title: "Account Receivable",
                html: "modules/account-receivable/account-receivable.html",
                js: "modules/account-receivable/account-receivable.js",
                className: "AccountReceivable"
            },

            "aging-payable": {
                title: "Aging Payable",
                html: "modules/aging-payable/aging-payable.html",
                js: "modules/aging-payable/aging-payable.js",
                className: "AgingPayable"
            },

            "aging-receivable": {
                title: "Aging Receivable",
                html: "modules/aging-receivable/aging-receivable.html",
                js: "modules/aging-receivable/aging-receivable.js",
                className: "AgingReceivable"
            },

            "gl-journal": {
                title: "GL Journal",
                html: "modules/gl-journal/gl-journal.html",
                js: "modules/gl-journal/gl-journal.js",
                className: "GeneralJournal"

            },

            "ap-payment": {
                title: "AP Payment",
                html: "modules/ap-payment/ap-payment.html",
                js: "modules/ap-payment/ap-payment.js",
                className: "APPayment"
            },

            "ar-payment": {
                title: "AR Payment",
                html: "modules/ar-payment/ar-payment.html",
                js: "modules/ar-payment/ar-payment.js",
                className: "ARPayment"
            },

            "general-ledger": {
                title: "General Ledger",
                html: "modules/general-ledger/general-ledger.html",
                js: "modules/general-ledger/general-ledger.js",
                className: "GeneralLedger"
            },

            "trial-balance-year": {
                title: "Trial Balance Year",
                html: "modules/trial-balance-year/trial-balance-year.html",
                js: "modules/trial-balance-year/trial-balance-year.js",
                className: "TrialBalanceYear"
            },

            "income-statement": {
                title: "Income Statement",
                html: "modules/income-statement/income-statement.html",
                js: "modules/income-statement/income-statement.js",
                className: "IncomeStatement"
            },

            "balance-sheet": {
                title: "Balance Sheet",
                html: "modules/balance-sheet/balance-sheet.html",
                js: "modules/balance-sheet/balance-sheet.js",
                className: "BalanceSheet"
            },

            "profit-loss": {
                title: "Profit & Loss",
                html: "modules/profit-loss/profit-loss.html",
                js: "modules/profit-loss/profit-loss.js",
                className: "ProfitLoss"
            }

        };

        this.currentModule = null;

        this.initialize();

    }

    initialize() {

        this.navigate("dashboard");

    }

    async navigate(moduleName) {

        const route = this.routes[moduleName];

        if (!route) {

            this.show404();

            return;

        }

        try {

            await this.loadHTML(route);

            await this.loadModule(route);

            this.updateTopbar(route.title);

            this.setActiveMenu(moduleName);

            this.currentModule = moduleName;

        }

        catch (error) {

            console.error(error);

            this.showError();

        }

    }

    async loadHTML(route) {

        const response = await fetch(route.html);

        const html = await response.text();

        document.getElementById("finova-content").innerHTML = html;

    }

async loadModule(route) {

    try {

        const url = new URL(`../../../${route.js}`, import.meta.url);

        const module = await import(url.href);

        const page = new module[route.className]();

        if (typeof page.init === "function") {
            await page.init();
        }

    } catch (e) {

        console.group("MODULE LOAD ERROR");

        console.log("Module :", route.js);

        console.log("Class  :", route.className);

        console.error(e);

        console.groupEnd();

    }

}
    updateTopbar(title) {

        if (window.finovaTopbar) {

            window.finovaTopbar.updateTitle(title);

        }

    }

    setActiveMenu(moduleName) {

        document
            .querySelectorAll(".finova-menu-item")
            .forEach(menu => {

                menu.classList.remove("active");

            });

        const active = document.querySelector(

            `[data-module="${moduleName}"]`

        );

        if (active) {

            active.classList.add("active");

        }

    }

    show404() {

        document.getElementById("finova-content").innerHTML = `

            <div class="alert alert-danger">

                Module not found.

            </div>

        `;

    }

    showError() {

        document.getElementById("finova-content").innerHTML = `

            <div class="alert alert-warning">

                Error loading module.

            </div>

        `;

    }

}