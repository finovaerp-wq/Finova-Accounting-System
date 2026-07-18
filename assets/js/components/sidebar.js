/*
===========================================
FINOVA ACCOUNTING SYSTEM
Sidebar Component
Version : 1.0.0
===========================================
*/


import { AuthService } from "../../../service/auth.service.js";
import { ChangePassword } from "../ui/change-password.js";
export class FinovaSidebar {

    constructor() {

        this.changePassword = null;
        this.render();

        this.bindEvents();

    }

    render() {

        const sidebar = document.getElementById("finova-sidebar");

        if (!sidebar) return;

        sidebar.innerHTML = `

            <div class="finova-sidebar">

                <div class="finova-sidebar-logo">

                    <h2>FINOVA</h2>

                    <span>Accounting System</span>

                </div>

                <div class="finova-sidebar-menu">

                    ${this.generateMenu()}

                </div>

                <div class="finova-sidebar-footer">

                    <div class="finova-sidebar-version">

                        Version 1.0.0

                    </div>

                </div>

            </div>

        `;

    }

    generateMenu() {

        return `

            ${this.menuHeader("Dashboard")}

            ${this.menuItem("Dashboard", "fa-solid fa-gauge-high", "dashboard")}

            ${this.menuHeader("Master Data")}

            ${this.menuItem("User Management", "fa-solid fa-user-shield", "user-management")}
            ${this.menuItem("Business Partner", "fa-solid fa-users", "business-partner")}
            ${this.menuItem("Chart Of Accounts", "fa-solid fa-book", "chart-of-accounts")}

            ${this.menuHeader("Finance")}

            ${this.menuItem("Account Payable", "fa-solid fa-file-invoice-dollar", "account-payable")}
            ${this.menuItem("Account Receivable", "fa-solid fa-money-check-dollar", "account-receivable")}
            ${this.menuItem("Aging Payable", "fa-solid fa-hourglass-half", "aging-payable")}
            ${this.menuItem("Aging Receivable", "fa-solid fa-clock", "aging-receivable")}

            ${this.menuHeader("Accounting")}

            ${this.menuItem("GL Journal", "fa-solid fa-book-open", "gl-journal")}

            ${this.menuHeader("Payment")}

            ${this.menuItem("AP Payment", "fa-solid fa-credit-card", "ap-payment")}
            ${this.menuItem("AR Payment", "fa-solid fa-wallet", "ar-payment")}

            ${this.menuHeader("Report")}

            ${this.menuItem("General Ledger", "fa-solid fa-book", "general-ledger")}
            ${this.menuItem("Trial Balance Year", "fa-solid fa-scale-balanced", "trial-balance-year")}
            ${this.menuItem("Income Statement", "fa-solid fa-chart-line", "income-statement")}
            ${this.menuItem("Balance Sheet", "fa-solid fa-table", "balance-sheet")}
            ${this.menuItem("Profit & Loss", "fa-solid fa-chart-pie", "profit-loss")}

            ${this.menuHeader("Settings")}

            ${this.menuItem("Change Password", "fa-solid fa-key", "change-password")}
            ${this.menuItem("Logout", "fa-solid fa-right-from-bracket", "logout")}

        `;

    }

    menuHeader(title) {

        return `

            <div class="finova-menu-header">

                ${title}

            </div>

        `;

    }

    menuItem(title, icon, module) {

        return `

            <div
                class="finova-menu-item"
                data-module="${module}">

                <i class="${icon}"></i>

                <span>${title}</span>

            </div>

        `;

    }

    bindEvents() {

        const menus = document.querySelectorAll(".finova-menu-item");

        menus.forEach(menu => {

            menu.addEventListener("click", () => {

                const module = menu.dataset.module;

                
                
/*
=========================================
CHANGE PASSWORD
=========================================
*/

if (module === "change-password") {

    this.openChangePasswordModal();

    return;

}

/*
=========================================
LOGOUT
=========================================
*/

if (module === "logout") {

    this.logout();

    return;

}

                if (window.finovaRouter) {

                    window.finovaRouter.navigate(module);

                }

            });

        });

    }
    /*
==========================================================
LOGOUT
==========================================================
*/

async logout() {

    const confirmed = confirm(

        "Are you sure you want to logout?"

    );

    if (!confirmed) {

        return;

    }

    try {

        await AuthService.logout();
        window.location.replace(

    "login.html"

);

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}
/*
==========================================================
OPEN CHANGE PASSWORD MODAL
==========================================================
*/

openChangePasswordModal() {

    const modalElement =
        document.getElementById("change-password-modal");

    if (!modalElement) {

        console.error("Change Password Modal not found.");

        return;

    }

    if (!this.changePassword) {

        this.changePassword = new ChangePassword();

    }

    const modal = new bootstrap.Modal(modalElement);

    modal.show();

}
}