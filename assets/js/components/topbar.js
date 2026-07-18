/*
===========================================
FINOVA ACCOUNTING SYSTEM
Topbar Component
Version : 1.0.0
===========================================
*/
import { UserService } from "../../../service/user.service.js";

export class FinovaTopbar {

    constructor() {

        this.render();

        this.bindEvents();
        this.loadProfile();

    }

    render() {

        const topbar = document.getElementById("finova-topbar");

        if (!topbar) return;

        topbar.innerHTML = `

            <div class="finova-topbar">

                <div class="finova-topbar-left">

                    <button
                        id="finova-sidebar-toggle"
                        class="finova-icon-button"
                        type="button">

                        <i class="fa-solid fa-bars"></i>

                    </button>

                    <div class="finova-page-title">

                        Dashboard

                    </div>

                </div>

                <div class="finova-topbar-right">

                    <div class="finova-search-box">

                        <i class="fa-solid fa-magnifying-glass"></i>

                        <input
                            type="text"
                            placeholder="Search..."
                            disabled>

                    </div>

                    <button
                        class="finova-icon-button"
                        id="finova-notification">

                        <i class="fa-regular fa-bell"></i>

                    </button>

                    <button
                        class="finova-icon-button"
                        id="finova-fullscreen">

                        <i class="fa-solid fa-expand"></i>

                    </button>

                    <div class="finova-user-profile">

    <div
    id="topbar-avatar"
    class="finova-user-avatar">

    FA

</div>

<div
    id="topbar-user-name"
    class="finova-user-name">

    Loading...

</div>

<div
    id="topbar-user-position"
    class="finova-user-role">

    Loading...

</div>
    </div>

</div>
                </div>

            </div>

        `;

    }

    bindEvents() {

        const fullscreen =
            document.getElementById("finova-fullscreen");

        fullscreen.addEventListener("click", () => {

            if (!document.fullscreenElement) {

                document.documentElement.requestFullscreen();

            } else {

                document.exitFullscreen();

            }

        });

        const sidebarButton =
            document.getElementById("finova-sidebar-toggle");

        sidebarButton.addEventListener("click", () => {

            console.log("Sidebar Toggle");

            /*
                Sprint berikutnya

                Sidebar Collapse
            */

        });

    }

    updateTitle(title) {

        const pageTitle = document.querySelector(
            ".finova-page-title"
        );

        if (pageTitle) {

            pageTitle.textContent = title;

        }

    }
    /*
==========================================================
LOAD PROFILE
==========================================================
*/

async loadProfile() {

    try {

        const profile =

            await UserService.getCurrentProfile();

        if (!profile) {

            return;

        }

        /*
        ==========================================
        NAME
        ==========================================
        */

        document.getElementById(

            "topbar-user-name"

        ).textContent =

            profile.full_name ||

            "Unknown User";

        /*
        ==========================================
        POSITION
        ==========================================
        */

        document.getElementById(

            "topbar-user-position"

        ).textContent =

            profile.position ||

            "-";

        /*
        ==========================================
        AVATAR
        ==========================================
        */

        const avatar =

            document.getElementById(

                "topbar-avatar"

            );

        avatar.textContent =

            this.getInitial(

                profile.full_name

            );

    }

    catch (error) {

        console.error(error);

    }

}
/*
==========================================================
GET INITIAL
==========================================================
*/

getInitial(name) {

    if (!name) {

        return "U";

    }

    return name

        .split(" ")

        .map(

            word => word[0]

        )

        .join("")

        .substring(0, 2)

        .toUpperCase();

}
    /*
==========================================================
LOGOUT
==========================================================
*/

bindLogout() {

    document

        .getElementById("btn-logout")

        ?.addEventListener(

            "click",

            async () => {

                if (

                    !confirm(

                        "Logout from FINOVA?"

                    )

                ) {

                    return;

                }

                try {

                    await AuthService.logout();

                }

                catch (error) {

                    console.error(error);

                }

            }

        );

}

}