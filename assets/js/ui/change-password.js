/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Change Password
Version : 2.0 Enterprise
==========================================================
*/

import { AuthService } from "../../../service/auth.service.js";

export class ChangePassword {

    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor() {

        this.cacheElements();

        this.bindEvents();

    }

    /*
    ======================================================
    CACHE ELEMENTS
    ======================================================
    */

    cacheElements() {

        this.form =
            document.getElementById(
                "change-password-form"
            );

        this.currentPassword =
            document.getElementById(
                "current-password"
            );

        this.newPassword =
            document.getElementById(
                "new-password"
            );

        this.confirmPassword =
            document.getElementById(
                "confirm-password"
            );

        this.btnSave =
            document.getElementById(
                "btn-save-password"
            );

    }

    /*
    ======================================================
    EVENTS
    ======================================================
    */

    bindEvents() {

        this.btnSave?.addEventListener(

            "click",

            () => this.changePassword()

        );

    }

   /*
==========================================================
CHANGE PASSWORD
==========================================================
*/

async changePassword() {

    /*
    ==========================================
    GET VALUE
    ==========================================
    */

    const currentPassword =

        this.currentPassword.value.trim();

    const newPassword =

        this.newPassword.value.trim();

    const confirmPassword =

        this.confirmPassword.value.trim();

    /*
    ==========================================
    VALIDATION
    ==========================================
    */

    if (!currentPassword) {

        return this.showError(

            "Current password is required."

        );

    }

    if (!newPassword) {

        return this.showError(

            "New password is required."

        );

    }

    if (newPassword.length < 8) {

        return this.showError(

            "Password minimum 8 characters."

        );

    }

    if (newPassword !== confirmPassword) {

        return this.showError(

            "Confirm password does not match."

        );

    }

    try {

    this.btnSave.disabled = true;

    this.btnSave.innerHTML =

        `<span class="spinner-border spinner-border-sm me-2"></span>
         Saving...`;

    await AuthService.changePassword(

        currentPassword,

        newPassword

    );

    if (window.Toast) {

        Toast.fire({

            icon: "success",

            title: "Password changed successfully."

        });

    }

    /*
    ==========================================
    LOGOUT
    ==========================================
    */

    setTimeout(

        async () => {

            await AuthService.logout();

        },

        1200

    );

}

catch (error) {

    this.showError(

        error.message

    );

}

finally {

    this.btnSave.disabled = false;

    this.btnSave.innerHTML =

        "Save";

}

}
/*
==========================================================
ERROR
==========================================================
*/

showError(message) {

    if (window.Toast) {

        Toast.fire({

            icon: "error",

            title: message

        });

        return;

    }

    alert(message);

}

}