/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : USER MANAGEMENT
FILE    : user-management.js
VERSION : 3.0.0 FINAL
==========================================================
*/

import {
    CONFIG
} from "../../assets/js/core/supabase.js";

import {
    UserManagementService
} from "../../service/user-management.service.js";


export class UserManagement {

    constructor() {

        this.data = [];
        this.filteredData = [];

        this.currentProfile = null;
        this.currentAuthUser = null;
        this.isManager = false;

        this.pageSize =
            CONFIG.PAGE_SIZE
            ||
            20;

        this.currentPage = 1;
        this.totalPages = 1;
        this.totalRows = 0;

        this.currentMode = "view";
        this.currentUserUid = null;

        this.pendingDeleteUserUid = null;
        this.pendingResetPasswordUserUid = null;

        this.userModal = null;
        this.deleteModal = null;

        this.resetPasswordModal = null;

        this.resetPasswordModalElement = null;
        this.resetPasswordUserName = null;
        this.resetPasswordUserEmail = null;

        this.resetPasswordInput = null;
        this.resetPasswordConfirmInput = null;

        this.btnToggleResetPassword = null;
        this.iconToggleResetPassword = null;

        this.btnToggleResetPasswordConfirm = null;
        this.iconToggleResetPasswordConfirm = null;

        this.btnConfirmResetPassword = null;

        this.initialize();
    }


    /*
    ==========================================================
    INITIALIZE
    ==========================================================
    */

    async initialize() {

        try {

            this.cacheDom();

            this.initializeBootstrap();

            this.bindEvents();

            await this.loadAccess();

            this.applyAccessUI();

            await this.loadData(true);

            console.log(
                "User Management Initialized :",
                this.currentProfile?.role
            );

        }

        catch (error) {

            console.error(
                "UserManagement.initialize:",
                error
            );

            this.showError(
                error?.message
                ||
                "Failed to initialize User Management."
            );

        }

    }


    /*
    ==========================================================
    CACHE DOM
    ==========================================================
    */

    cacheDom() {

        this.btnAddUser =
            document.getElementById(
                "btn-add-user"
            );

        this.btnRefresh =
            document.getElementById(
                "btn-refresh-user"
            );

        this.btnFind =
            document.getElementById(
                "btn-find-user"
            );

        this.accessInfo =
            document.getElementById(
                "user-access-info"
            );

        this.filterKeyword =
            document.getElementById(
                "user-search-keyword"
            );

        this.filterRole =
            document.getElementById(
                "user-filter-role"
            );

        this.filterStatus =
            document.getElementById(
                "user-filter-status"
            );

        this.tableBody =
            document.getElementById(
                "user-management-tbody"
            );

        this.pageFirst =
            document.getElementById(
                "user-page-first"
            );

        this.pagePrev =
            document.getElementById(
                "user-page-prev"
            );

        this.pageNext =
            document.getElementById(
                "user-page-next"
            );

        this.pageLast =
            document.getElementById(
                "user-page-last"
            );

        this.currentPageInput =
            document.getElementById(
                "user-current-page"
            );

        this.totalPagesText =
            document.getElementById(
                "user-total-pages"
            );

        this.recordInfo =
            document.getElementById(
                "user-record-info"
            );


        /*
        ======================================================
        MAIN USER MODAL
        ======================================================
        */

        this.modalElement =
            document.getElementById(
                "user-management-modal"
            );

        this.modalTitle =
            document.getElementById(
                "user-management-modal-title"
            );

        this.form =
            document.getElementById(
                "user-management-form"
            );

        this.inputId =
            document.getElementById(
                "user-id"
            );

        this.inputUid =
            document.getElementById(
                "user-uid"
            );

        this.inputFullName =
            document.getElementById(
                "user-full-name"
            );

        this.inputEmail =
            document.getElementById(
                "user-email"
            );

        this.inputPassword =
            document.getElementById(
                "user-password"
            );

        this.btnTogglePassword =
            document.getElementById(
                "btn-toggle-user-password"
            );

        this.iconTogglePassword =
            document.getElementById(
                "icon-toggle-user-password"
            );

        this.passwordColumn =
            document.getElementById(
                "user-password-column"
            );

        this.inputRole =
            document.getElementById(
                "user-role"
            );

        this.inputStatus =
            document.getElementById(
                "user-status"
            );

        this.btnSave =
            document.getElementById(
                "btn-save-user"
            );


        /*
        ======================================================
        DELETE MODAL
        ======================================================
        */

        this.deleteModalElement =
            document.getElementById(
                "user-delete-modal"
            );

        this.deleteUserName =
            document.getElementById(
                "delete-user-name"
            );

        this.deleteUserEmail =
            document.getElementById(
                "delete-user-email"
            );

        this.btnConfirmDelete =
            document.getElementById(
                "btn-confirm-delete-user"
            );

    }


    /*
    ==========================================================
    BOOTSTRAP
    ==========================================================
    */

    initializeBootstrap() {

        if (
            this.modalElement
        ) {

            this.userModal =
                bootstrap.Modal
                    .getOrCreateInstance(
                        this.modalElement
                    );

        }


        if (
            this.deleteModalElement
        ) {

            this.deleteModal =
                bootstrap.Modal
                    .getOrCreateInstance(
                        this.deleteModalElement
                    );

        }


        /*
        ======================================================
        RESET PASSWORD MODAL
        ======================================================
        */

        this.initializeResetPasswordModal();

    }


    /*
    ==========================================================
    EVENTS
    ==========================================================
    */

    bindEvents() {

        this.btnAddUser
            ?.addEventListener(
                "click",
                () =>
                    this.openAddUser()
            );


        this.btnRefresh
            ?.addEventListener(
                "click",
                () =>
                    this.resetAndReload()
            );


        this.btnFind
            ?.addEventListener(
                "click",
                () =>
                    this.applyFilter()
            );


        this.filterKeyword
            ?.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key
                        ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        this.applyFilter();

                    }

                }
            );


        this.filterRole
            ?.addEventListener(
                "change",
                () =>
                    this.applyFilter()
            );


        this.filterStatus
            ?.addEventListener(
                "change",
                () =>
                    this.applyFilter()
            );


        this.btnTogglePassword
            ?.addEventListener(
                "click",
                () =>
                    this.togglePasswordVisibility()
            );


        this.tableBody
            ?.addEventListener(
                "click",
                event =>
                    this.handleTableAction(
                        event
                    )
            );


        this.btnSave
            ?.addEventListener(
                "click",
                () =>
                    this.saveUser()
            );


        this.btnConfirmDelete
            ?.addEventListener(
                "click",
                () =>
                    this.deleteUser()
            );


        this.pageFirst
            ?.addEventListener(
                "click",
                () =>
                    this.goToPage(
                        1
                    )
            );


        this.pagePrev
            ?.addEventListener(
                "click",
                () =>
                    this.goToPage(
                        this.currentPage
                        -
                        1
                    )
            );


        this.pageNext
            ?.addEventListener(
                "click",
                () =>
                    this.goToPage(
                        this.currentPage
                        +
                        1
                    )
            );


        this.pageLast
            ?.addEventListener(
                "click",
                () =>
                    this.goToPage(
                        this.totalPages
                    )
            );


        this.currentPageInput
            ?.addEventListener(
                "change",
                () => {

                    const page =
                        Number(
                            this
                                .currentPageInput
                                .value
                        );

                    this.goToPage(
                        page
                    );

                }
            );

    }


    /*
    ==========================================================
    TOGGLE PASSWORD VISIBILITY
    ==========================================================
    */

    togglePasswordVisibility() {

        if (
            !this.inputPassword
            ||
            !this.btnTogglePassword
            ||
            !this.iconTogglePassword
        ) {

            return;

        }


        const isHidden =
            this.inputPassword.type
            ===
            "password";


        this.inputPassword.type =
            isHidden
                ?
                "text"
                :
                "password";


        this.iconTogglePassword
            .classList
            .toggle(
                "fa-eye",
                !isHidden
            );


        this.iconTogglePassword
            .classList
            .toggle(
                "fa-eye-slash",
                isHidden
            );


        const title =
            isHidden
                ?
                "Hide Password"
                :
                "Show Password";


        this.btnTogglePassword.title =
            title;


        this.btnTogglePassword
            .setAttribute(
                "aria-label",
                title
            );


        this.inputPassword.focus();

    }


    /*
    ==========================================================
    ACCESS
    ==========================================================
    */

    async loadAccess() {

        this.currentAuthUser =
            await UserManagementService
                .getCurrentAuthUser();


        this.currentProfile =
            await UserManagementService
                .getCurrentProfile();


        if (
            !this.currentAuthUser
        ) {

            throw new Error(
                "Authentication session was not found."
            );

        }


        if (
            !this.currentProfile
        ) {

            throw new Error(
                "FINOVA user profile was not found."
            );

        }


        this.isManager =
            String(
                this.currentProfile.role
                ||
                ""
            )
                .trim()
                .toLowerCase()
            ===
            "manager";

    }


    /*
    ==========================================================
    APPLY ACCESS UI
    ==========================================================
    */

    applyAccessUI() {

        this.btnAddUser
            ?.classList
            .toggle(
                "d-none",
                !this.isManager
            );


        if (
            this.accessInfo
        ) {

            this.accessInfo
                .classList
                .remove(
                    "d-none",
                    "manager",
                    "staff"
                );


            this.accessInfo
                .classList
                .add(
                    this.isManager
                        ?
                        "manager"
                        :
                        "staff"
                );


            this.accessInfo.innerHTML =

                this.isManager

                    ?

                    `
                    <i class="fa-solid fa-shield-halved me-1"></i>
                    Logged in as <strong>Manager</strong>.
                    You have full User Management access.
                    `

                    :

                    `
                    <i class="fa-solid fa-eye me-1"></i>
                    Logged in as <strong>Staff</strong>.
                    User Management is view only.
                    `;

        }

    }


    /*
    ==========================================================
    ENSURE MANAGER
    ==========================================================
    */

    ensureManager() {

        if (
            this.isManager
        ) {

            return true;

        }


        this.showError(
            "Only Manager can modify User Management."
        );


        return false;

    }


    /*
    ==========================================================
    LOAD DATA
    ==========================================================
    */

    async loadData(
        showLoading = true
    ) {

        try {

            if (
                showLoading
            ) {

                this.showTableLoading();

            }


            this.data =
                await UserManagementService
                    .getAll();


            this.applyFilter();

        }

        catch (error) {

            console.error(
                "UserManagement.loadData:",
                error
            );


            this.data = [];
            this.filteredData = [];


            this.refreshView();


            this.showError(
                error?.message
                ||
                "Failed to load users."
            );

        }

    }


    /*
    ==========================================================
    SHOW TABLE LOADING
    ==========================================================
    */

    showTableLoading() {

        if (
            !this.tableBody
        ) {

            return;

        }


        this.tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center py-5">

                    <div
                        class="
                            d-flex
                            flex-column
                            align-items-center
                            gap-2
                        ">

                        <div
                            class="
                                spinner-border
                                spinner-border-sm
                                text-primary
                            "
                            role="status">

                            <span
                                class="visually-hidden">
                                Loading...
                            </span>

                        </div>

                        <div
                            class="
                                small
                                text-muted
                            ">

                            Loading User Management...

                        </div>

                    </div>

                </td>

            </tr>

        `;

    }


    /*
    ==========================================================
    FILTER
    ==========================================================
    */

    applyFilter() {

        const keyword =
            String(
                this.filterKeyword
                    ?.value
                ||
                ""
            )
                .trim()
                .toLowerCase();


        const role =
            String(
                this.filterRole
                    ?.value
                ||
                "all"
            );


        const status =
            String(
                this.filterStatus
                    ?.value
                ||
                "all"
            );


        this.filteredData =
            this.data.filter(

                user => {

                    const matchKeyword =

                        !keyword

                        ||

                        String(
                            user.full_name
                            ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                        ||

                        String(
                            user.email
                            ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                keyword
                            );


                    const matchRole =

                        role
                        ===
                        "all"

                        ||

                        user.role
                        ===
                        role;


                    const active =
                        Boolean(
                            user.status
                        );


                    const matchStatus =

                        status
                        ===
                        "all"

                        ||

                        (
                            status
                            ===
                            "active"

                            &&

                            active
                        )

                        ||

                        (
                            status
                            ===
                            "inactive"

                            &&

                            !active
                        );


                    return (
                        matchKeyword
                        &&
                        matchRole
                        &&
                        matchStatus
                    );

                }

            );


        this.currentPage = 1;

        this.refreshView();

    }


    /*
    ==========================================================
    REFRESH VIEW
    ==========================================================
    */

    refreshView() {

        this.totalRows =
            this.filteredData.length;


        this.totalPages =
            Math.max(

                1,

                Math.ceil(
                    this.totalRows
                    /
                    this.pageSize
                )

            );


        this.currentPage =
            Math.min(

                Math.max(
                    this.currentPage,
                    1
                ),

                this.totalPages

            );


        this.renderTable();

        this.updatePagination();

    }


    /*
    ==========================================================
    TABLE
    ==========================================================
    */

    renderTable() {

        if (
            !this.tableBody
        ) {

            return;

        }


        const start =
            (
                this.currentPage
                -
                1
            )
            *
            this.pageSize;


        const rows =
            this.filteredData.slice(

                start,

                start
                +
                this.pageSize

            );


        if (
            !rows.length
        ) {

            this.tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="
                            text-center
                            text-muted
                            py-5
                        ">

                        No User Management record found.

                    </td>

                </tr>

            `;


            return;

        }


        this.tableBody.innerHTML =

            rows

                .map(

                    (
                        user,
                        index
                    ) =>

                        this.createTableRow(

                            user,

                            start
                            +
                            index
                            +
                            1

                        )

                )

                .join("");

    }


    /*
    ==========================================================
    CREATE TABLE ROW
    ==========================================================
    */

    createTableRow(
        user,
        rowNumber
    ) {

        const role =
            user.role
            ===
            "Manager"

                ?
                "Manager"

                :
                "Staff";


        const active =
            Boolean(
                user.status
            );


        return `

            <tr>

                <td
                    class="
                        finova-table-index
                    ">

                    ${rowNumber}

                </td>


                <td
                    class="
                        finova-table-name
                    ">

                    ${
                        this.escapeHTML(
                            user.full_name
                            ||
                            "-"
                        )
                    }

                </td>


                <td
                    class="
                        finova-table-name
                    ">

                    ${
                        this.escapeHTML(
                            user.email
                            ||
                            "-"
                        )
                    }

                </td>


                <td
                    class="
                        finova-table-status
                    ">

                    <span
                        class="
                            user-role-badge
                            ${role.toLowerCase()}
                        ">

                        ${role}

                    </span>

                </td>


                <td
                    class="
                        finova-table-status
                    ">

                    <span
                        class="
                            user-status-badge
                            ${
                                active
                                    ?
                                    "active"
                                    :
                                    "inactive"
                            }
                        ">

                        ${
                            active
                                ?
                                "Active"
                                :
                                "Inactive"
                        }

                    </span>

                </td>


                <td
                    class="
                        finova-table-date
                    ">

                    ${
                        this.formatDateTime(
                            user.updated_at
                            ||
                            user.created_at
                        )
                    }

                </td>


                <td
                    class="
                        finova-table-action
                    ">

                    ${
                        this.createActionButtons(
                            user
                        )
                    }

                </td>

            </tr>

        `;

    }


    /*
    ==========================================================
    CREATE ACTION BUTTONS
    ==========================================================
    */

    createActionButtons(
        user
    ) {

        const uid =
            this.escapeAttribute(
                user.user_uid
                ||
                ""
            );


        /*
        ======================================================
        STAFF = VIEW ONLY
        ======================================================
        */

        if (
            !this.isManager
        ) {

            return `

                <div
                    class="
                        user-action-group
                    ">

                    <button
                        type="button"
                        class="
                            btn
                            btn-outline-secondary
                            btn-sm
                        "
                        title="View"
                        data-action="view"
                        data-uid="${uid}">

                        <i
                            class="
                                fa-solid
                                fa-eye
                            ">
                        </i>

                    </button>

                </div>

            `;

        }


        const isCurrentUser =
            user.user_uid
            ===
            this.currentAuthUser
                ?.id;


        /*
        ======================================================
        MANAGER
        ======================================================
        */

        return `

            <div
                class="
                    user-action-group
                ">


                <!-- VIEW -->

                <button
                    type="button"
                    class="
                        btn
                        btn-outline-secondary
                        btn-sm
                    "
                    title="View"
                    data-action="view"
                    data-uid="${uid}">

                    <i
                        class="
                            fa-solid
                            fa-eye
                        ">
                    </i>

                </button>


                <!-- EDIT -->

                <button
                    type="button"
                    class="
                        btn
                        btn-outline-primary
                        btn-sm
                    "
                    title="Edit"
                    data-action="edit"
                    data-uid="${uid}">

                    <i
                        class="
                            fa-solid
                            fa-pen
                        ">
                    </i>

                </button>


                <!-- RESET PASSWORD -->

                <button
                    type="button"
                    class="
                        btn
                        btn-outline-warning
                        btn-sm
                    "
                    title="Reset Password"
                    data-action="reset-password"
                    data-uid="${uid}">

                    <i
                        class="
                            fa-solid
                            fa-key
                        ">
                    </i>

                </button>


                <!-- DELETE -->

                <button
                    type="button"
                    class="
                        btn
                        btn-outline-danger
                        btn-sm
                    "
                    title="${
                        isCurrentUser
                            ?
                            "Current user cannot be deleted"
                            :
                            "Delete"
                    }"
                    data-action="delete"
                    data-uid="${uid}"
                    ${
                        isCurrentUser
                            ?
                            "disabled"
                            :
                            ""
                    }>

                    <i
                        class="
                            fa-solid
                            fa-trash
                        ">
                    </i>

                </button>

            </div>

        `;

    }


    /*
    ==========================================================
    HANDLE TABLE ACTION
    ==========================================================
    */

    handleTableAction(
        event
    ) {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (
            !button
        ) {

            return;

        }


        const action =
            button.dataset.action;


        const uid =
            button.dataset.uid;


        const user =
            this.data.find(

                item =>
                    item.user_uid
                    ===
                    uid

            );


        if (
            !user
        ) {

            this.showError(
                "User not found."
            );

            return;

        }


        /*
        ======================================================
        VIEW
        ======================================================
        */

        if (
            action
            ===
            "view"
        ) {

            this.openViewUser(
                user
            );

            return;

        }


        /*
        ======================================================
        EDIT
        ======================================================
        */

        if (
            action
            ===
            "edit"
        ) {

            if (
                !this.ensureManager()
            ) {

                return;

            }


            this.openEditUser(
                user
            );

            return;

        }


        /*
        ======================================================
        RESET PASSWORD
        ======================================================
        */

        if (
            action
            ===
            "reset-password"
        ) {

            if (
                !this.ensureManager()
            ) {

                return;

            }


            this.openResetPasswordModal(
                user
            );

            return;

        }


        /*
        ======================================================
        DELETE
        ======================================================
        */

        if (
            action
            ===
            "delete"
        ) {

            if (
                !this.ensureManager()
            ) {

                return;

            }


            this.showDeleteUserModal(
                user
            );

        }

    }


    /*
    ==========================================================
    RESET FORM
    ==========================================================
    */

    resetForm() {

        this.form
            ?.reset();


        if (
            this.inputId
        ) {

            this.inputId.value =
                "";

        }


        if (
            this.inputUid
        ) {

            this.inputUid.value =
                "";

        }


        if (
            this.inputRole
        ) {

            this.inputRole.value =
                "Staff";

        }


        if (
            this.inputStatus
        ) {

            this.inputStatus.checked =
                true;

        }


        if (
            this.inputPassword
        ) {

            this.inputPassword.value =
                "";

            this.inputPassword.type =
                "password";

        }


        if (
            this.iconTogglePassword
        ) {

            this.iconTogglePassword
                .classList
                .remove(
                    "fa-eye-slash"
                );

            this.iconTogglePassword
                .classList
                .add(
                    "fa-eye"
                );

        }


        if (
            this.btnTogglePassword
        ) {

            this.btnTogglePassword.title =
                "Show Password";

            this.btnTogglePassword
                .setAttribute(
                    "aria-label",
                    "Show Password"
                );

        }


        this.currentUserUid =
            null;

    }


    /*
    ==========================================================
    SET FORM READONLY
    ==========================================================
    */

    setFormReadOnly(
        readOnly
    ) {

        [

            this.inputFullName,
            this.inputEmail,
            this.inputPassword,
            this.inputRole,
            this.inputStatus

        ]

            .filter(
                Boolean
            )

            .forEach(

                control => {

                    control.disabled =
                        readOnly;

                }

            );

    }


    /*
    ==========================================================
    OPEN ADD USER
    ==========================================================
    */

    openAddUser() {

        if (
            !this.ensureManager()
        ) {

            return;

        }


        this.currentMode =
            "add";


        this.resetForm();


        this.modalTitle.textContent =
            "Add User";


        this.passwordColumn
            ?.classList
            .remove(
                "d-none"
            );


        this.inputPassword
            ?.setAttribute(
                "required",
                "required"
            );


        this.inputEmail.disabled =
            false;


        this.setFormReadOnly(
            false
        );


        this.btnSave
            ?.classList
            .remove(
                "d-none"
            );


        this.userModal
            ?.show();

    }


    /*
    ==========================================================
    OPEN VIEW USER
    ==========================================================
    */

    openViewUser(
        user
    ) {

        this.currentMode =
            "view";


        this.fillForm(
            user
        );


        this.modalTitle.textContent =
            "View User";


        this.passwordColumn
            ?.classList
            .add(
                "d-none"
            );


        this.inputPassword
            ?.removeAttribute(
                "required"
            );


        this.setFormReadOnly(
            true
        );


        this.btnSave
            ?.classList
            .add(
                "d-none"
            );


        this.userModal
            ?.show();

    }


    /*
    ==========================================================
    OPEN EDIT USER
    ==========================================================
    */

    openEditUser(
        user
    ) {

        this.currentMode =
            "edit";


        this.fillForm(
            user
        );


        this.modalTitle.textContent =
            "Edit User";


        this.passwordColumn
            ?.classList
            .add(
                "d-none"
            );


        this.inputPassword
            ?.removeAttribute(
                "required"
            );


        this.setFormReadOnly(
            false
        );


        /*
        ======================================================
        EMAIL BELONGS TO SUPABASE AUTH
        ======================================================
        */

        this.inputEmail.disabled =
            true;


        this.btnSave
            ?.classList
            .remove(
                "d-none"
            );


        this.userModal
            ?.show();

    }


    /*
    ==========================================================
    FILL FORM
    ==========================================================
    */

    fillForm(
        user
    ) {

        this.resetForm();


        this.currentUserUid =
            user.user_uid;


        this.inputId.value =
            user.id
            ??
            "";


        this.inputUid.value =
            user.user_uid
            ??
            "";


        this.inputFullName.value =
            user.full_name
            ??
            "";


        this.inputEmail.value =
            user.email
            ??
            "";


        this.inputRole.value =
            user.role
            ===
            "Manager"

                ?
                "Manager"

                :
                "Staff";


        this.inputStatus.checked =
            Boolean(
                user.status
            );

    }


    /*
    ==========================================================
    SAVE USER
    ==========================================================
    */

    async saveUser() {

        if (
            !this.ensureManager()
        ) {

            return;

        }


        try {

            const fullName =
                String(
                    this.inputFullName
                        ?.value
                    ||
                    ""
                )
                    .trim();


            const email =
                String(
                    this.inputEmail
                        ?.value
                    ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const password =
                String(
                    this.inputPassword
                        ?.value
                    ||
                    ""
                );


            const role =
                this.inputRole
                    ?.value
                ===
                "Manager"

                    ?
                    "Manager"

                    :
                    "Staff";


            const status =
                Boolean(
                    this.inputStatus
                        ?.checked
                );


            /*
            ==================================================
            VALIDATION
            ==================================================
            */

            if (
                !fullName
            ) {

                throw new Error(
                    "Full Name is required."
                );

            }


            if (
                !email
            ) {

                throw new Error(
                    "Email is required."
                );

            }


            this.setSaveLoading(
                true
            );


            /*
            ==================================================
            ADD
            ==================================================
            */

            if (
                this.currentMode
                ===
                "add"
            ) {

                if (
                    password.length
                    <
                    8
                ) {

                    throw new Error(
                        "Temporary Password must contain at least 8 characters."
                    );

                }


                await UserManagementService
                    .createAuthUser(
                        {

                            full_name:
                                fullName,

                            email,

                            password,

                            role,

                            status

                        }
                    );


                this.userModal
                    ?.hide();


                await this.loadData(
                    false
                );


                this.showSuccess(
                    "User created successfully."
                );


                return;

            }


            /*
            ==================================================
            EDIT
            ==================================================
            */

            if (
                this.currentMode
                ===
                "edit"
            ) {

                await UserManagementService
                    .updateProfile(

                        this.currentUserUid,

                        {

                            full_name:
                                fullName,

                            role,

                            status

                        }

                    );


                this.userModal
                    ?.hide();


                await this.loadData(
                    false
                );


                /*
                ==============================================
                REFRESH OWN PROFILE
                ==============================================
                */

                if (
                    this.currentUserUid
                    ===
                    this.currentAuthUser
                        ?.id
                ) {

                    await this.loadAccess();

                    this.applyAccessUI();

                }


                this.showSuccess(
                    "User updated successfully."
                );

            }

        }

        catch (error) {

            console.error(
                "UserManagement.saveUser:",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to save user."
            );

        }

        finally {

            this.setSaveLoading(
                false
            );

        }

    }


    /*
    ==========================================================
    SET SAVE LOADING
    ==========================================================
    */

    setSaveLoading(
        loading
    ) {

        if (
            !this.btnSave
        ) {

            return;

        }


        this.btnSave.disabled =
            loading;


        this.btnSave.innerHTML =

            loading

                ?

                `
                <span
                    class="
                        spinner-border
                        spinner-border-sm
                        me-1
                    ">
                </span>

                Saving...
                `

                :

                `
                <i
                    class="
                        fa-solid
                        fa-floppy-disk
                        me-1
                    ">
                </i>

                Save
                `;

    }
        /*
    ==========================================================
    RESET PASSWORD MODAL
    ==========================================================
    */

    initializeResetPasswordModal() {

        /*
        ======================================================
        REMOVE OLD MODAL IF EXISTS
        ======================================================
        */

        const oldModal =
            document.getElementById(
                "user-reset-password-modal"
            );


        if (
            oldModal
        ) {

            const oldInstance =
                bootstrap.Modal
                    .getInstance(
                        oldModal
                    );


            oldInstance
                ?.dispose();


            oldModal.remove();

        }


        /*
        ======================================================
        CREATE MODAL
        ======================================================
        */

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.innerHTML = `

            <div
                class="modal fade"
                id="user-reset-password-modal"
                tabindex="-1"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                aria-hidden="true">

                <div
                    class="
                        modal-dialog
                        modal-dialog-centered
                    ">

                    <div
                        class="modal-content">


                        <!-- ==================================
                             HEADER
                        =================================== -->

                        <div
                            class="modal-header">

                            <h5
                                class="modal-title">

                                <i
                                    class="
                                        fa-solid
                                        fa-key
                                        me-2
                                    ">
                                </i>

                                Reset Password

                            </h5>


                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close">
                            </button>

                        </div>


                        <!-- ==================================
                             BODY
                        =================================== -->

                        <div
                            class="modal-body">


                            <!-- USER INFORMATION -->

                            <div
                                class="
                                    border
                                    rounded
                                    p-3
                                    mb-3
                                    bg-light
                                ">

                                <div
                                    class="
                                        small
                                        text-muted
                                        mb-1
                                    ">

                                    User

                                </div>


                                <div
                                    class="
                                        fw-semibold
                                    "
                                    id="reset-password-user-name">

                                    -

                                </div>


                                <div
                                    class="
                                        small
                                        text-muted
                                        mt-1
                                    "
                                    id="reset-password-user-email">

                                    -

                                </div>

                            </div>


                            <!-- NEW PASSWORD -->

                            <div
                                class="mb-3">

                                <label
                                    for="reset-password-new"
                                    class="form-label">

                                    New Password

                                    <span
                                        class="text-danger">
                                        *
                                    </span>

                                </label>


                                <div
                                    class="input-group">

                                    <input
                                        type="password"
                                        class="form-control"
                                        id="reset-password-new"
                                        autocomplete="new-password"
                                        minlength="8"
                                        placeholder="Minimum 8 characters">


                                    <button
                                        type="button"
                                        class="
                                            btn
                                            btn-outline-secondary
                                        "
                                        id="btn-toggle-reset-password"
                                        title="Show Password"
                                        aria-label="Show Password">

                                        <i
                                            class="
                                                fa-solid
                                                fa-eye
                                            "
                                            id="icon-toggle-reset-password">
                                        </i>

                                    </button>

                                </div>


                                <div
                                    class="
                                        form-text
                                    ">

                                    Password must contain at least
                                    8 characters.

                                </div>

                            </div>


                            <!-- CONFIRM PASSWORD -->

                            <div
                                class="mb-1">

                                <label
                                    for="reset-password-confirm"
                                    class="form-label">

                                    Confirm Password

                                    <span
                                        class="text-danger">
                                        *
                                    </span>

                                </label>


                                <div
                                    class="input-group">

                                    <input
                                        type="password"
                                        class="form-control"
                                        id="reset-password-confirm"
                                        autocomplete="new-password"
                                        minlength="8"
                                        placeholder="Re-enter new password">


                                    <button
                                        type="button"
                                        class="
                                            btn
                                            btn-outline-secondary
                                        "
                                        id="btn-toggle-reset-password-confirm"
                                        title="Show Password"
                                        aria-label="Show Password">

                                        <i
                                            class="
                                                fa-solid
                                                fa-eye
                                            "
                                            id="icon-toggle-reset-password-confirm">
                                        </i>

                                    </button>

                                </div>

                            </div>

                        </div>


                        <!-- ==================================
                             FOOTER
                        =================================== -->

                        <div
                            class="modal-footer">

                            <button
                                type="button"
                                class="
                                    btn
                                    btn-outline-secondary
                                "
                                data-bs-dismiss="modal">

                                Cancel

                            </button>


                            <button
                                type="button"
                                class="
                                    btn
                                    btn-primary
                                "
                                id="btn-confirm-reset-password">

                                <i
                                    class="
                                        fa-solid
                                        fa-floppy-disk
                                        me-1
                                    ">
                                </i>

                                Save Password

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;


        /*
        ======================================================
        GET MODAL ELEMENT
        ======================================================
        */

        this.resetPasswordModalElement =
            wrapper.firstElementChild;


        if (
            !this.resetPasswordModalElement
        ) {

            console.error(
                "Failed to create Reset Password modal."
            );

            return;

        }


        /*
        ======================================================
        APPEND MODAL
        ======================================================
        */

        document.body.appendChild(
            this.resetPasswordModalElement
        );


        /*
        ======================================================
        CACHE RESET PASSWORD DOM
        ======================================================
        */

        this.resetPasswordUserName =
            this.resetPasswordModalElement
                .querySelector(
                    "#reset-password-user-name"
                );


        this.resetPasswordUserEmail =
            this.resetPasswordModalElement
                .querySelector(
                    "#reset-password-user-email"
                );


        this.resetPasswordInput =
            this.resetPasswordModalElement
                .querySelector(
                    "#reset-password-new"
                );


        this.resetPasswordConfirmInput =
            this.resetPasswordModalElement
                .querySelector(
                    "#reset-password-confirm"
                );


        this.btnToggleResetPassword =
            this.resetPasswordModalElement
                .querySelector(
                    "#btn-toggle-reset-password"
                );


        this.iconToggleResetPassword =
            this.resetPasswordModalElement
                .querySelector(
                    "#icon-toggle-reset-password"
                );


        this.btnToggleResetPasswordConfirm =
            this.resetPasswordModalElement
                .querySelector(
                    "#btn-toggle-reset-password-confirm"
                );


        this.iconToggleResetPasswordConfirm =
            this.resetPasswordModalElement
                .querySelector(
                    "#icon-toggle-reset-password-confirm"
                );


        this.btnConfirmResetPassword =
            this.resetPasswordModalElement
                .querySelector(
                    "#btn-confirm-reset-password"
                );


        /*
        ======================================================
        BOOTSTRAP INSTANCE
        ======================================================
        */

        this.resetPasswordModal =
            bootstrap.Modal
                .getOrCreateInstance(
                    this.resetPasswordModalElement
                );


        /*
        ======================================================
        EVENTS
        ======================================================
        */

        this.btnToggleResetPassword
            ?.addEventListener(

                "click",

                () => {

                    this.toggleResetPasswordVisibility(
                        "new"
                    );

                }

            );


        this.btnToggleResetPasswordConfirm
            ?.addEventListener(

                "click",

                () => {

                    this.toggleResetPasswordVisibility(
                        "confirm"
                    );

                }

            );


        this.btnConfirmResetPassword
            ?.addEventListener(

                "click",

                () => {

                    this.resetUserPassword();

                }

            );


        /*
        ======================================================
        ENTER TO SAVE
        ======================================================
        */

        this.resetPasswordConfirmInput
            ?.addEventListener(

                "keydown",

                event => {

                    if (
                        event.key
                        ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        this.resetUserPassword();

                    }

                }

            );


        /*
        ======================================================
        CLEAN VALUES WHEN MODAL CLOSED
        ======================================================
        */

        this.resetPasswordModalElement
            .addEventListener(

                "hidden.bs.modal",

                () => {

                    this.clearResetPasswordForm();

                }

            );

    }


    /*
    ==========================================================
    OPEN RESET PASSWORD MODAL
    ==========================================================
    */

    openResetPasswordModal(
        user
    ) {

        if (
            !this.ensureManager()
        ) {

            return;

        }


        if (
            !user?.user_uid
        ) {

            this.showError(
                "User UID was not found."
            );

            return;

        }


        /*
        ======================================================
        STORE TARGET USER
        ======================================================
        */

        this.pendingResetPasswordUserUid =
            user.user_uid;


        /*
        ======================================================
        RESET INPUTS
        ======================================================
        */

        this.clearResetPasswordForm(
            false
        );


        /*
        ======================================================
        USER INFORMATION
        ======================================================
        */

        if (
            this.resetPasswordUserName
        ) {

            this.resetPasswordUserName
                .textContent =
                    user.full_name
                    ||
                    "-";

        }


        if (
            this.resetPasswordUserEmail
        ) {

            this.resetPasswordUserEmail
                .textContent =
                    user.email
                    ||
                    "-";

        }


        /*
        ======================================================
        SHOW
        ======================================================
        */

        this.resetPasswordModal
            ?.show();


        /*
        ======================================================
        FOCUS
        ======================================================
        */

        this.resetPasswordModalElement
            ?.addEventListener(

                "shown.bs.modal",

                () => {

                    this.resetPasswordInput
                        ?.focus();

                },

                {
                    once: true
                }

            );

    }


    /*
    ==========================================================
    CLEAR RESET PASSWORD FORM
    ==========================================================
    */

    clearResetPasswordForm(
        clearTarget = true
    ) {

        if (
            this.resetPasswordInput
        ) {

            this.resetPasswordInput.value =
                "";

            this.resetPasswordInput.type =
                "password";

        }


        if (
            this.resetPasswordConfirmInput
        ) {

            this.resetPasswordConfirmInput.value =
                "";

            this.resetPasswordConfirmInput.type =
                "password";

        }


        if (
            this.iconToggleResetPassword
        ) {

            this.iconToggleResetPassword
                .classList
                .remove(
                    "fa-eye-slash"
                );

            this.iconToggleResetPassword
                .classList
                .add(
                    "fa-eye"
                );

        }


        if (
            this.iconToggleResetPasswordConfirm
        ) {

            this.iconToggleResetPasswordConfirm
                .classList
                .remove(
                    "fa-eye-slash"
                );

            this.iconToggleResetPasswordConfirm
                .classList
                .add(
                    "fa-eye"
                );

        }


        if (
            this.btnToggleResetPassword
        ) {

            this.btnToggleResetPassword.title =
                "Show Password";

            this.btnToggleResetPassword
                .setAttribute(
                    "aria-label",
                    "Show Password"
                );

        }


        if (
            this.btnToggleResetPasswordConfirm
        ) {

            this.btnToggleResetPasswordConfirm.title =
                "Show Password";

            this.btnToggleResetPasswordConfirm
                .setAttribute(
                    "aria-label",
                    "Show Password"
                );

        }


        if (
            clearTarget
        ) {

            this.pendingResetPasswordUserUid =
                null;


            if (
                this.resetPasswordUserName
            ) {

                this.resetPasswordUserName.textContent =
                    "-";

            }


            if (
                this.resetPasswordUserEmail
            ) {

                this.resetPasswordUserEmail.textContent =
                    "-";

            }

        }

    }


    /*
    ==========================================================
    TOGGLE RESET PASSWORD VISIBILITY
    ==========================================================
    */

    toggleResetPasswordVisibility(
        field
    ) {

        let input = null;
        let button = null;
        let icon = null;


        if (
            field
            ===
            "confirm"
        ) {

            input =
                this.resetPasswordConfirmInput;

            button =
                this.btnToggleResetPasswordConfirm;

            icon =
                this.iconToggleResetPasswordConfirm;

        }

        else {

            input =
                this.resetPasswordInput;

            button =
                this.btnToggleResetPassword;

            icon =
                this.iconToggleResetPassword;

        }


        if (
            !input
            ||
            !button
            ||
            !icon
        ) {

            return;

        }


        const isHidden =
            input.type
            ===
            "password";


        input.type =
            isHidden
                ?
                "text"
                :
                "password";


        icon.classList.toggle(
            "fa-eye",
            !isHidden
        );


        icon.classList.toggle(
            "fa-eye-slash",
            isHidden
        );


        const title =
            isHidden
                ?
                "Hide Password"
                :
                "Show Password";


        button.title =
            title;


        button.setAttribute(
            "aria-label",
            title
        );


        input.focus();

    }


    /*
    ==========================================================
    RESET USER PASSWORD
    ==========================================================
    */

    async resetUserPassword() {

        if (
            !this.ensureManager()
        ) {

            return;

        }


        if (
            !this.pendingResetPasswordUserUid
        ) {

            this.showError(
                "User UID was not found."
            );

            return;

        }


        try {

            const password =
                String(
                    this.resetPasswordInput
                        ?.value
                    ||
                    ""
                );


            const confirmPassword =
                String(
                    this.resetPasswordConfirmInput
                        ?.value
                    ||
                    ""
                );


            /*
            ==================================================
            VALIDATION
            ==================================================
            */

            if (
                !password
            ) {

                throw new Error(
                    "New Password is required."
                );

            }


            if (
                password.length
                <
                8
            ) {

                throw new Error(
                    "New Password must contain at least 8 characters."
                );

            }


            if (
                !confirmPassword
            ) {

                throw new Error(
                    "Confirm Password is required."
                );

            }


            if (
                password
                !==
                confirmPassword
            ) {

                throw new Error(
                    "New Password and Confirm Password do not match."
                );

            }


            /*
            ==================================================
            LOADING
            ==================================================
            */

            this.setResetPasswordLoading(
                true
            );


            /*
            ==================================================
            CALL SERVICE
            ==================================================
            */

            await UserManagementService
                .resetAuthUserPassword(

                    this.pendingResetPasswordUserUid,

                    password

                );


            /*
            ==================================================
            SUCCESS
            ==================================================
            */

            this.resetPasswordModal
                ?.hide();


            this.showSuccess(
                "User password reset successfully."
            );

        }

        catch (error) {

            console.error(
                "UserManagement.resetUserPassword:",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to reset user password."
            );

        }

        finally {

            this.setResetPasswordLoading(
                false
            );

        }

    }


    /*
    ==========================================================
    SET RESET PASSWORD LOADING
    ==========================================================
    */

    setResetPasswordLoading(
        loading
    ) {

        if (
            !this.btnConfirmResetPassword
        ) {

            return;

        }


        this.btnConfirmResetPassword.disabled =
            loading;


        if (
            this.resetPasswordInput
        ) {

            this.resetPasswordInput.disabled =
                loading;

        }


        if (
            this.resetPasswordConfirmInput
        ) {

            this.resetPasswordConfirmInput.disabled =
                loading;

        }


        if (
            this.btnToggleResetPassword
        ) {

            this.btnToggleResetPassword.disabled =
                loading;

        }


        if (
            this.btnToggleResetPasswordConfirm
        ) {

            this.btnToggleResetPasswordConfirm.disabled =
                loading;

        }


        this.btnConfirmResetPassword.innerHTML =

            loading

                ?

                `
                <span
                    class="
                        spinner-border
                        spinner-border-sm
                        me-1
                    ">
                </span>

                Saving...
                `

                :

                `
                <i
                    class="
                        fa-solid
                        fa-floppy-disk
                        me-1
                    ">
                </i>

                Save Password
                `;

    }


    /*
    ==========================================================
    DELETE
    ==========================================================
    */

    showDeleteUserModal(
        user
    ) {

        if (
            user.user_uid
            ===
            this.currentAuthUser
                ?.id
        ) {

            this.showError(
                "You cannot delete your own login account."
            );

            return;

        }


        this.pendingDeleteUserUid =
            user.user_uid;


        if (
            this.deleteUserName
        ) {

            this.deleteUserName.textContent =
                user.full_name
                ||
                "-";

        }


        if (
            this.deleteUserEmail
        ) {

            this.deleteUserEmail.textContent =
                user.email
                ||
                "-";

        }


        this.deleteModal
            ?.show();

    }


    /*
    ==========================================================
    DELETE USER
    ==========================================================
    */

    async deleteUser() {

        if (
            !this.ensureManager()
        ) {

            return;

        }


        if (
            !this.pendingDeleteUserUid
        ) {

            return;

        }


        try {

            if (
                this.btnConfirmDelete
            ) {

                this.btnConfirmDelete.disabled =
                    true;

            }


            await UserManagementService
                .deleteAuthUser(
                    this.pendingDeleteUserUid
                );


            this.deleteModal
                ?.hide();


            this.pendingDeleteUserUid =
                null;


            await this.loadData(
                false
            );


            this.showSuccess(
                "User deleted successfully."
            );

        }

        catch (error) {

            console.error(
                "UserManagement.deleteUser:",
                error
            );


            this.showError(
                error?.message
                ||
                "Failed to delete user."
            );

        }

        finally {

            if (
                this.btnConfirmDelete
            ) {

                this.btnConfirmDelete.disabled =
                    false;

            }

        }

    }


    /*
    ==========================================================
    PAGINATION
    ==========================================================
    */

    goToPage(
        page
    ) {

        const target =
            Math.min(

                Math.max(

                    Number(
                        page
                    )
                    ||
                    1,

                    1

                ),

                this.totalPages

            );


        this.currentPage =
            target;


        this.renderTable();

        this.updatePagination();

    }


    /*
    ==========================================================
    UPDATE PAGINATION
    ==========================================================
    */

    updatePagination() {

        const start =

            this.totalRows

                ?

                (
                    (
                        this.currentPage
                        -
                        1
                    )
                    *
                    this.pageSize
                )
                +
                1

                :

                0;


        const end =

            this.totalRows

                ?

                Math.min(

                    this.currentPage
                    *
                    this.pageSize,

                    this.totalRows

                )

                :

                0;


        if (
            this.currentPageInput
        ) {

            this.currentPageInput.value =
                this.currentPage;


            this.currentPageInput.max =
                this.totalPages;

        }


        if (
            this.totalPagesText
        ) {

            this.totalPagesText.textContent =
                this.totalPages;

        }


        if (
            this.recordInfo
        ) {

            this.recordInfo.textContent =
                `Displaying Record ${start} - ${end} of ${this.totalRows}`;

        }


        const firstPage =
            this.currentPage
            <=
            1;


        const lastPage =
            this.currentPage
            >=
            this.totalPages;


        if (
            this.pageFirst
        ) {

            this.pageFirst.disabled =
                firstPage;

        }


        if (
            this.pagePrev
        ) {

            this.pagePrev.disabled =
                firstPage;

        }


        if (
            this.pageNext
        ) {

            this.pageNext.disabled =
                lastPage;

        }


        if (
            this.pageLast
        ) {

            this.pageLast.disabled =
                lastPage;

        }

    }


    /*
    ==========================================================
    RESET / REFRESH
    ==========================================================
    */

    async resetAndReload() {

        if (
            this.filterKeyword
        ) {

            this.filterKeyword.value =
                "";

        }


        if (
            this.filterRole
        ) {

            this.filterRole.value =
                "all";

        }


        if (
            this.filterStatus
        ) {

            this.filterStatus.value =
                "all";

        }


        this.currentPage =
            1;


        await this.loadAccess();

        this.applyAccessUI();

        await this.loadData(
            true
        );

    }


    /*
    ==========================================================
    FORMAT DATE TIME
    ==========================================================
    */

    formatDateTime(
        value
    ) {

        if (
            !value
        ) {

            return "-";

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";

        }


        return date.toLocaleString(

            "id-ID",

            {

                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }

        );

    }


    /*
    ==========================================================
    ESCAPE HTML
    ==========================================================
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


    /*
    ==========================================================
    ESCAPE ATTRIBUTE
    ==========================================================
    */

    escapeAttribute(
        value
    ) {

        return this.escapeHTML(
            value
        );

    }


    /*
    ==========================================================
    SUCCESS
    ==========================================================
    */

    showSuccess(
        message
    ) {

        /*
        ======================================================
        GLOBAL APP SUCCESS
        ======================================================
        */

        if (
            window.App
                ?.showSuccess
        ) {

            window.App.showSuccess(
                message
            );

            return;

        }


        /*
        ======================================================
        GLOBAL FINOVA SUCCESS MODAL
        ======================================================
        */

        const modalElement =
            document.getElementById(
                "finovaSuccessModal"
            );


        if (
            modalElement
        ) {

            const messageElement =
                modalElement.querySelector(
                    ".finova-success-message"
                );


            if (
                messageElement
            ) {

                messageElement.textContent =
                    message;

            }


            bootstrap.Modal
                .getOrCreateInstance(
                    modalElement
                )
                .show();


            return;

        }


        console.log(
            "SUCCESS:",
            message
        );

    }


    /*
    ==========================================================
    ERROR
    ==========================================================
    */

    showError(
        message
    ) {

        /*
        ======================================================
        GLOBAL APP ERROR
        ======================================================
        */

        if (
            window.App
                ?.showError
        ) {

            window.App.showError(
                message
            );

            return;

        }


        /*
        ======================================================
        GLOBAL FINOVA ERROR MODAL
        ======================================================
        */

        const globalModalElement =
            document.getElementById(
                "finovaErrorModal"
            );


        if (
            globalModalElement
        ) {

            const globalMessageElement =
                globalModalElement
                    .querySelector(
                        ".finova-error-message"
                    );


            if (
                globalMessageElement
            ) {

                globalMessageElement.textContent =
                    message;

            }


            bootstrap.Modal
                .getOrCreateInstance(
                    globalModalElement
                )
                .show();


            return;

        }


        /*
        ======================================================
        USER MANAGEMENT FALLBACK MODAL
        NO NATIVE alert()
        ======================================================
        */

        console.error(
            "FINOVA ERROR:",
            message
        );


        /*
        ======================================================
        REMOVE OLD FALLBACK MODAL
        ======================================================
        */

        const oldModal =
            document.getElementById(
                "finovaUserManagementErrorModal"
            );


        if (
            oldModal
        ) {

            const oldInstance =
                bootstrap.Modal
                    .getInstance(
                        oldModal
                    );


            oldInstance
                ?.dispose();


            oldModal.remove();

        }


        /*
        ======================================================
        CREATE FALLBACK MODAL
        ======================================================
        */

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.innerHTML = `

            <div
                class="modal fade"
                id="finovaUserManagementErrorModal"
                tabindex="-1"
                aria-hidden="true">

                <div
                    class="
                        modal-dialog
                        modal-dialog-centered
                    ">

                    <div
                        class="modal-content">


                        <!-- ==================================
                             HEADER
                        =================================== -->

                        <div
                            class="modal-header">

                            <h5
                                class="modal-title">

                                <i
                                    class="
                                        fa-solid
                                        fa-circle-exclamation
                                        text-danger
                                        me-2
                                    ">
                                </i>

                                Error

                            </h5>


                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close">
                            </button>

                        </div>


                        <!-- ==================================
                             BODY
                        =================================== -->

                        <div
                            class="modal-body">

                            <div
                                class="
                                    finova-user-management-error-message
                                ">
                            </div>

                        </div>


                        <!-- ==================================
                             FOOTER
                        =================================== -->

                        <div
                            class="modal-footer">

                            <button
                                type="button"
                                class="
                                    btn
                                    btn-primary
                                "
                                data-bs-dismiss="modal">

                                OK

                            </button>

                        </div>


                    </div>

                </div>

            </div>

        `;


        /*
        ======================================================
        GET CREATED MODAL
        ======================================================
        */

        const fallbackModalElement =
            wrapper.firstElementChild;


        if (
            !fallbackModalElement
        ) {

            console.error(
                "Failed to create FINOVA error modal."
            );

            return;

        }


        /*
        ======================================================
        APPEND TO BODY
        ======================================================
        */

        document.body.appendChild(
            fallbackModalElement
        );


        /*
        ======================================================
        SET MESSAGE
        ======================================================
        */

        const fallbackMessageElement =
            fallbackModalElement
                .querySelector(
                    ".finova-user-management-error-message"
                );


        if (
            fallbackMessageElement
        ) {

            fallbackMessageElement.textContent =
                String(
                    message
                    ||
                    "An unexpected error occurred."
                );

        }


        /*
        ======================================================
        BOOTSTRAP INSTANCE
        ======================================================
        */

        const fallbackModal =
            bootstrap.Modal
                .getOrCreateInstance(
                    fallbackModalElement
                );


        /*
        ======================================================
        CLEANUP AFTER CLOSE
        ======================================================
        */

        fallbackModalElement
            .addEventListener(

                "hidden.bs.modal",

                () => {

                    fallbackModal
                        .dispose();


                    fallbackModalElement
                        .remove();

                },

                {
                    once: true
                }

            );


        /*
        ======================================================
        SHOW
        ======================================================
        */

        fallbackModal.show();

    }

}