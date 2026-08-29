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

    this.mobileBreakpoint = 991.98;

    this.render();

    this.createMobileBackdrop();

    this.bindEvents();

    this.bindMobileEvents();

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
        ),

        this.menuItem(
            "Tax Master",
            "fa-solid fa-percent",
            "tax",
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
/*
==========================================================
SET ACTIVE MENU
==========================================================
*/

setActiveMenu(module) {

    const sidebar =
        document.querySelector(
            ".finova-sidebar"
        );

    if (!sidebar) {
        return;
    }


    /*
    ======================================================
    REMOVE ALL ACTIVE MENU
    ======================================================
    */

    sidebar
        .querySelectorAll(
            ".finova-menu-item, .finova-submenu-item"
        )
        .forEach(item => {

            item.classList.remove(
                "active"
            );

        });


    /*
    ======================================================
    FIND CURRENT MENU
    ======================================================
    */

    const activeMenu =
        sidebar.querySelector(
            `[data-module="${module}"]`
        );

    if (!activeMenu) {
        return;
    }


    /*
    ======================================================
    SET ACTIVE MENU
    ======================================================
    */

    activeMenu.classList.add(
        "active"
    );


    /*
    ======================================================
    OPEN PARENT GROUP
    ======================================================
    */

    const parentGroup =
        activeMenu.closest(
            ".finova-menu-group"
        );

    if (parentGroup) {

        parentGroup.classList.add(
            "open"
        );

        const submenu =
            parentGroup.querySelector(
                ".finova-submenu"
            );

        if (submenu) {

            submenu.classList.add(
                "open"
            );

        }

    }

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

this.setActiveMenu(
    module
);

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
CREATE MOBILE BACKDROP
==========================================================
*/

createMobileBackdrop() {

    let backdrop =
        document.getElementById(
            "finova-sidebar-backdrop"
        );

    if (backdrop) {
        return;
    }


    backdrop =
        document.createElement(
            "div"
        );

    backdrop.id =
        "finova-sidebar-backdrop";

    backdrop.className =
        "finova-sidebar-backdrop";

    document.body.appendChild(
        backdrop
    );

}


/*
==========================================================
BIND MOBILE EVENTS
==========================================================
*/

bindMobileEvents() {

    /*
    ======================================================
    SIDEBAR
    ======================================================
    */

    const sidebarHost =
        document.getElementById(
            "finova-sidebar"
        );


    /*
    ======================================================
    BACKDROP
    ======================================================
    */

    const backdrop =
        document.getElementById(
            "finova-sidebar-backdrop"
        );


    /*
    ======================================================
    MOBILE MENU BUTTON

    Support beberapa ID agar kompatibel dengan topbar.
    ======================================================
    */

    const menuButton =
        document.getElementById(
            "btn-mobile-sidebar"
        )
        ||
        document.getElementById(
            "sidebar-toggle"
        )
        ||
        document.getElementById(
            "btn-sidebar-toggle"
        )
        ||
        document.querySelector(
            "[data-finova-sidebar-toggle]"
        );


    /*
    ======================================================
    OPEN / TOGGLE
    ======================================================
    */

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                this.toggleMobileSidebar();

            }
        );

    }


    /*
    ======================================================
    BACKDROP CLICK
    ======================================================
    */

    if (backdrop) {

        backdrop.addEventListener(
            "click",
            () => {

                this.closeMobileSidebar();

            }
        );

    }


    /*
    ======================================================
    CLOSE AFTER MENU NAVIGATION
    ======================================================
    */

    if (sidebarHost) {

        sidebarHost.addEventListener(
            "click",
            (event) => {

                const menu =
                    event.target.closest(
                        ".finova-menu-item, .finova-submenu-item"
                    );

                if (!menu) {
                    return;
                }


                const module =
                    menu.dataset.module;


                /*
                ==========================================
                GROUP HEADER IS NOT NAVIGATION
                ==========================================
                */

                if (!module) {
                    return;
                }


                /*
                ==========================================
                ONLY MOBILE
                ==========================================
                */

                if (
                    window.innerWidth
                    <=
                    this.mobileBreakpoint
                ) {

                    /*
                    --------------------------------------
                    Small delay allows router click
                    to execute first.
                    --------------------------------------
                    */

                    window.setTimeout(
                        () => {

                            this.closeMobileSidebar();

                        },
                        50
                    );

                }

            }
        );

    }


    /*
    ======================================================
    ESC KEY
    ======================================================
    */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                this.closeMobileSidebar();

            }

        }
    );


    /*
    ======================================================
    WINDOW RESIZE
    ======================================================
    */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth
                >
                this.mobileBreakpoint
            ) {

                this.closeMobileSidebar();

            }

        }
    );

}


/*
==========================================================
OPEN MOBILE SIDEBAR
==========================================================
*/

openMobileSidebar() {

    const sidebarHost =
        document.getElementById(
            "finova-sidebar"
        );

    const backdrop =
        document.getElementById(
            "finova-sidebar-backdrop"
        );


    if (!sidebarHost) {
        return;
    }


    sidebarHost.classList.add(
        "mobile-open"
    );


    sidebarHost
        .querySelector(
            ".finova-sidebar"
        )
        ?.classList.add(
            "mobile-open"
        );


    backdrop?.classList.add(
        "show"
    );


    document.body.classList.add(
        "finova-sidebar-open"
    );

}


/*
==========================================================
CLOSE MOBILE SIDEBAR
==========================================================
*/

closeMobileSidebar() {

    const sidebarHost =
        document.getElementById(
            "finova-sidebar"
        );

    const backdrop =
        document.getElementById(
            "finova-sidebar-backdrop"
        );


    sidebarHost?.classList.remove(
        "mobile-open"
    );


    sidebarHost
        ?.querySelector(
            ".finova-sidebar"
        )
        ?.classList.remove(
            "mobile-open"
        );


    backdrop?.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "finova-sidebar-open"
    );

}


/*
==========================================================
TOGGLE MOBILE SIDEBAR
==========================================================
*/

toggleMobileSidebar() {

    const sidebarHost =
        document.getElementById(
            "finova-sidebar"
        );


    if (!sidebarHost) {
        return;
    }


    const isOpen =
        sidebarHost.classList.contains(
            "mobile-open"
        );


    if (isOpen) {

        this.closeMobileSidebar();

    }
    else {

        this.openMobileSidebar();

    }

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