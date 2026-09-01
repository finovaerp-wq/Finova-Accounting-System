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
==========================================================
EVENTS
==========================================================
*/

bindEvents() {

    /*
    ======================================================
    PASSWORD TOGGLE
    ======================================================
    */

    this.initializePasswordToggle();


    /*
    ======================================================
    SAVE PASSWORD
    ======================================================
    */

    this.btnSave?.addEventListener(

        "click",

        () => {

            this.changePassword();

        }

    );

}
/*
==========================================================
INITIALIZE PASSWORD TOGGLE
==========================================================
*/

initializePasswordToggle() {

    /*
    ======================================================
    PASSWORD INPUTS
    ======================================================
    */

    const passwordInputs = [

        this.currentPassword,

        this.newPassword,

        this.confirmPassword

    ];


    passwordInputs.forEach(

        input => {

            /*
            ==================================================
            VALIDATION
            ==================================================
            */

            if (
                !input
            ) {

                return;

            }


            /*
            ==================================================
            CHECK EXISTING INPUT GROUP
            ==================================================
            */

            let inputGroup =
                input.closest(
                    ".finova-change-password-group"
                );


            let toggleButton =
                null;


            /*
            ==================================================
            CREATE INPUT GROUP
            ==================================================
            */

            if (
                !inputGroup
            ) {

                /*
                ==============================================
                CREATE WRAPPER
                ==============================================
                */

                inputGroup =
                    document.createElement(
                        "div"
                    );


                inputGroup.className =
                    "input-group finova-change-password-group";


                /*
                ==============================================
                INSERT WRAPPER BEFORE INPUT
                ==============================================
                */

                input.parentNode.insertBefore(

                    inputGroup,

                    input

                );


                /*
                ==============================================
                MOVE INPUT INTO GROUP
                ==============================================
                */

                inputGroup.appendChild(
                    input
                );


                /*
                ==============================================
                CREATE TOGGLE BUTTON
                ==============================================
                */

                toggleButton =
                    document.createElement(
                        "button"
                    );


                toggleButton.type =
                    "button";


                toggleButton.className =
                    "btn btn-outline-secondary finova-password-toggle";


                toggleButton.title =
                    "Show Password";


                toggleButton.setAttribute(
                    "aria-label",
                    "Show Password"
                );


                toggleButton.innerHTML = `

                    <i
                        class="
                            fa-solid
                            fa-eye
                        ">
                    </i>

                `;


                /*
                ==============================================
                APPEND BUTTON
                ==============================================
                */

                inputGroup.appendChild(
                    toggleButton
                );

            }

            else {

                /*
                ==============================================
                GET EXISTING BUTTON
                ==============================================
                */

                toggleButton =
                    inputGroup.querySelector(
                        ".finova-password-toggle"
                    );

            }


            /*
            ==================================================
            VALIDATE BUTTON
            ==================================================
            */

            if (
                !toggleButton
            ) {

                return;

            }


            /*
            ==================================================
            PREVENT DUPLICATE EVENT
            ==================================================
            */

            if (
                toggleButton.dataset.bound ===
                "true"
            ) {

                return;

            }


            toggleButton.dataset.bound =
                "true";


            /*
            ==================================================
            CLICK EVENT
            ==================================================
            */

            toggleButton.addEventListener(

                "click",

                () => {

                    this.togglePasswordVisibility(

                        input,

                        toggleButton

                    );

                }

            );

        }

    );

}
/*
==========================================================
TOGGLE PASSWORD VISIBILITY
==========================================================
*/

togglePasswordVisibility(

    input,

    button

) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (
        !input
        ||
        !button
    ) {

        return;

    }


    /*
    ======================================================
    CURRENT STATE
    ======================================================
    */

    const isHidden =
        input.type ===
        "password";


    /*
    ======================================================
    CHANGE INPUT TYPE
    ======================================================
    */

    input.type =
        isHidden
            ?
            "text"
            :
            "password";


    /*
    ======================================================
    GET ICON
    ======================================================
    */

    const icon =
        button.querySelector(
            "i"
        );


    /*
    ======================================================
    UPDATE ICON
    ======================================================
    */

    if (
        icon
    ) {

        icon.classList.toggle(

            "fa-eye",

            !isHidden

        );


        icon.classList.toggle(

            "fa-eye-slash",

            isHidden

        );

    }


    /*
    ======================================================
    UPDATE BUTTON INFORMATION
    ======================================================
    */

    const buttonTitle =
        isHidden
            ?
            "Hide Password"
            :
            "Show Password";


    button.title =
        buttonTitle;


    button.setAttribute(

        "aria-label",

        buttonTitle

    );


    /*
    ======================================================
    RETURN FOCUS TO INPUT
    ======================================================
    */

    input.focus();

}
/*
==========================================================
RESET PASSWORD VISIBILITY
==========================================================
*/

resetPasswordVisibility() {

    /*
    ======================================================
    PASSWORD INPUTS
    ======================================================
    */

    const passwordInputs = [

        this.currentPassword,

        this.newPassword,

        this.confirmPassword

    ];


    /*
    ======================================================
    RESET EACH INPUT
    ======================================================
    */

    passwordInputs.forEach(

        input => {

            if (
                !input
            ) {

                return;

            }


            /*
            ==================================================
            PASSWORD TYPE
            ==================================================
            */

            input.type =
                "password";


            /*
            ==================================================
            GET TOGGLE BUTTON
            ==================================================
            */

            const inputGroup =
                input.closest(
                    ".finova-change-password-group"
                );


            const toggleButton =
                inputGroup?.querySelector(
                    ".finova-password-toggle"
                );


            if (
                !toggleButton
            ) {

                return;

            }


            /*
            ==================================================
            RESET ICON
            ==================================================
            */

            const icon =
                toggleButton.querySelector(
                    "i"
                );


            if (
                icon
            ) {

                icon.classList.remove(
                    "fa-eye-slash"
                );


                icon.classList.add(
                    "fa-eye"
                );

            }


            /*
            ==================================================
            RESET BUTTON INFORMATION
            ==================================================
            */

            toggleButton.title =
                "Show Password";


            toggleButton.setAttribute(
                "aria-label",
                "Show Password"
            );

        }

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