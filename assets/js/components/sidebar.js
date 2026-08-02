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

    <img
    src="assets/images/brand/sidebar-logo.png.png"
    alt="FINOVA"
    class="finova-sidebar-logo-image">

    <div class="finova-sidebar-brand">

        <div class="finova-sidebar-title">

            FINOVA

        </div>

        <div class="finova-sidebar-subtitle">

            Accounting System

        </div>

    </div>

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

        ${this.menuItem(
            "Dashboard",
            "fa-solid fa-gauge-high",
            "dashboard"
        )}

        ${this.menuGroup(
            "Master Data",
            "fa-solid fa-layer-group",
            [

                this.menuItem(
                    "User Management",
                    "fa-solid fa-users-gear",
                    "user-management",
                    true
                ),

                this.menuItem(
                    "Business Partner",
                    "fa-solid fa-handshake",
                    "business-partner",
                    true
                ),

                this.menuItem(
                    "Chart Of Accounts",
                    "fa-solid fa-book-open",
                    "chart-of-accounts",
                    true
                )

            ]
        )}

       ${this.menuGroup(
    "Finance",
    "fa-solid fa-building-columns",
    [

        this.menuItem(
            "Account Payable",
            "fa-solid fa-file-invoice-dollar",
            "account-payable",
            true
        ),

        this.menuItem(
            "Account Receivable",
            "fa-solid fa-money-check",
            "account-receivable",
            true
        ),

        this.menuItem(
            "Aging Payable",
            "fa-solid fa-hourglass-half",
            "aging-payable",
            true
        ),

        this.menuItem(
            "Aging Receivable",
            "fa-solid fa-business-time",
            "aging-receivable",
            true
        )

    ]
)}

        ${this.menuGroup(
    "Accounting",
    "fa-solid fa-calculator",
    [

        this.menuItem(
            "GL Journal",
            "fa-solid fa-book-journal-whills",
            "gl-journal",
            true
        )

    ]
)}
        ${this.menuGroup(
    "Payment",
    "fa-solid fa-wallet",
    [

        this.menuItem(
            "AP Payment",
            "fa-solid fa-money-check-dollar",
            "ap-payment",
            true
        ),

        this.menuItem(
            "AR Payment",
            "fa-solid fa-money-bill-transfer",
            "ar-payment",
            true
        )

    ]
)}

        ${this.menuGroup(
    "Report",
    "fa-solid fa-chart-column",
    [

        this.menuItem(
            "General Ledger",
            "fa-solid fa-book-bookmark",
            "general-ledger",
            true
        ),

        this.menuItem(
            "Trial Balance Year",
            "fa-solid fa-scale-balanced",
            "trial-balance-year",
            true
        ),

        this.menuItem(
            "Income Statement",
            "fa-solid fa-chart-line",
            "income-statement",
            true
        ),

        this.menuItem(
            "Balance Sheet",
            "fa-solid fa-table",
            "balance-sheet",
            true
        ),

        this.menuItem(
            "Profit & Loss",
            "fa-solid fa-chart-pie",
            "profit-loss",
            true
        )

    ]
)}

        ${this.menuHeader("Settings")}

        ${this.menuItem(
            "Change Password",
            "fa-solid fa-key",
            "change-password"
        )}

        ${this.menuItem(
            "Logout",
            "fa-solid fa-right-from-bracket",
            "logout"
        )}

    `;

}

    menuHeader(title) {

        return `

            <div class="finova-menu-header">

                ${title}

            </div>

        `;

    }

    menuItem(title, icon, module, isSubmenu = false) {

    return `

        <div
            class="${isSubmenu ? "finova-submenu-item" : "finova-menu-item"}"
            data-module="${module}">

            <i class="${icon}"></i>

            <span>${title}</span>

        </div>

    `;

}
menuGroup(title, icon, children) {

    return `

        <div class="finova-menu-group">

            <div class="finova-menu-group-header">

                <div class="finova-menu-group-left">

                    <i class="${icon}"></i>

                    <span>${title}</span>

                </div>

                <i class="fa-solid fa-chevron-right finova-menu-arrow"></i>

            </div>

            <div class="finova-submenu">

                ${children.join("")}

            </div>

        </div>

    `;

}

    bindEvents() {

    const sidebar = document.querySelector(".finova-sidebar");

    if (!sidebar) {

        return;

    }
    

    sidebar.addEventListener("click", (event) => {

        /*
        ==========================================
        GROUP HEADER
        ==========================================
        */

        const groupHeader = event.target.closest(
            ".finova-menu-group-header"
        );

        if (groupHeader) {
const submenu = groupHeader.nextElementSibling;

if (submenu) {

    const group = groupHeader.parentElement;

    const isOpen = submenu.classList.contains("open");

group.classList.toggle("open");

submenu.classList.toggle("open");

}

            return;

        }

        /*
        ==========================================
        MENU / SUBMENU
        ==========================================
        */

        const menu = event.target.closest(
            ".finova-menu-item, .finova-submenu-item"
        );

        if (!menu) {

            return;

        }

        const module = menu.dataset.module;

        if (!module) {

            return;

        }

        /*
        ==========================================
        CHANGE PASSWORD
        ==========================================
        */

        if (module === "change-password") {

            this.openChangePasswordModal();

            return;

        }
        

        /*
        ==========================================
        LOGOUT
        ==========================================
        */

        if (module === "logout") {

            this.logout();

            return;

        }
        

        /*
==========================================
ACTIVE MENU
==========================================
*/

sidebar
    .querySelectorAll(
        ".finova-menu-item, .finova-submenu-item"
    )
    .forEach(item => {

        item.classList.remove("active");

    });

sidebar
    .querySelectorAll(".finova-menu-group")
    .forEach(group => {

        group.classList.remove("active");

    });

menu.classList.add("active");

/*
==========================================
ACTIVE PARENT
==========================================
*/

const parentGroup =
    menu.closest(".finova-menu-group");

if (parentGroup) {

    parentGroup.classList.add("open");

}

        /*
        ==========================================
        ROUTER
        ==========================================
        */

        if (window.finovaRouter) {

            window.finovaRouter.navigate(module);

        }

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