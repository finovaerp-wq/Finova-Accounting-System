/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Business Partner Bank Grid
Version : 2.0.0
==========================================================
*/

import { BankService } from "../../service/bank.service.js";

export class BankGrid {

    constructor() {

        this.table =
            document.getElementById("bp-bank-table");

        this.button =
            document.getElementById("btn-add-bank-row");

        this.initialize();

    }

    /*
    ==========================================================
    INITIALIZE
    ==========================================================
    */

    initialize() {

        if (!this.button) return;

        this.button.addEventListener(

    "click",

    () => {

        if (!this.canAddNewRow()) {

            alert(
                "Please complete the current bank account first."
            );

            return;

        }

        this.addRow();

    }

);
    }

    /*
    ==========================================================
    LOAD MASTER BANK
    ==========================================================
    */

    async loadBanks(select) {

        try {

            const banks =
                await BankService.getAll();

            select.innerHTML = `
                <option value="">
                    -- Select Bank --
                </option>
            `;

            banks.forEach(bank => {

                select.innerHTML += `
                    <option value="${bank.id}">
                        ${bank.bank_name}
                    </option>
                `;

            });

        }

        catch (error) {

            console.error(error);

            select.innerHTML = `
                <option value="">
                    Failed Load Bank
                </option>
            `;

        }

    }
    /*
==========================================================
CHECK LAST ROW
==========================================================
*/

canAddNewRow() {

    const rows =
        this.table.querySelectorAll("tr");

    /*
    ==========================================
    FIRST ROW
    ==========================================
    */

    if (rows.length === 0) {

        return true;

    }

    const lastRow =
        rows[rows.length - 1];

    const bankId =
        lastRow.querySelector(".bank-id").value;

    const accountName =
        lastRow.querySelector(".account-holder")
            .value
            .trim();

    const accountNumber =
        lastRow.querySelector(".account-number")
            .value
            .trim();

    return (

        bankId !== "" &&

        accountName !== "" &&

        accountNumber !== ""

    );

}
    /*
    ==========================================================
    ADD ROW
    ==========================================================
    */

    addRow(bank = {}) {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>

                <select class="form-select bank-id">

                    <option value="">
                        Loading...
                    </option>

                </select>

            </td>

            <td>

                <input
                    type="text"
                    class="form-control account-holder"
                    value="${bank.account_name ?? ""}">

            </td>

            <td>

                <input
                    type="text"
                    class="form-control account-number"
                    value="${bank.account_number ?? ""}">

            </td>

            <td>

                <input
                    type="text"
                    class="form-control branch"
                    value="${bank.branch ?? ""}">

            </td>

            <td>

                <select class="form-select purpose">

                    <option value="Both">
                        Both
                    </option>

                    <option value="Payment">
                        Payment
                    </option>

                    <option value="Receipt">
                        Receipt
                    </option>

                </select>

            </td>

            <td class="text-center">

                <input
                    type="radio"
                    name="default-bank"
                    class="form-check-input is-default">

            </td>

            <td class="text-center">

                <button
                    type="button"
                    class="btn btn-danger btn-sm remove-bank">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        `;

        this.table.appendChild(row);
        

this.ensureDefaultBank();
    this.table.querySelectorAll(".is-default");
    

row.querySelector(".is-default")

    .addEventListener(

        "change",

        () => {

            this.ensureSingleDefault();

        }

    );

        const bankSelect =
            row.querySelector(".bank-id");

        this.loadBanks(bankSelect).then(() => {

            if (bank.bank_id) {

                bankSelect.value =
                    bank.bank_id;

            }

        });

        row.querySelector(".purpose").value =
            bank.purpose ?? "Both";

        row.querySelector(".is-default").checked =
            bank.is_default ?? false;

        /*
        ==========================================
        DELETE ROW
        ==========================================
        */

       row.querySelector(".remove-bank")

.addEventListener(

    "click",

    () => {

        if (

            !confirm(

                "Delete this bank account?"

            )

        ) {

            return;

        }

        const wasDefault =
            row.querySelector(".is-default")
                .checked;

        row.remove();

        if (wasDefault) {

            this.ensureDefaultBank();

        }

    }

);
    }

    /*
==========================================================
GET GRID DATA
==========================================================
*/

getData() {

    const rows =
        this.table.querySelectorAll("tr");

    const banks = [];

    rows.forEach(row => {

        const bankId =
            Number(
                row.querySelector(".bank-id").value || 0
            );

        const accountName =
            row.querySelector(".account-holder")
                .value
                .trim();

        const accountNumber =
            row.querySelector(".account-number")
                .value
                .trim();

        /*
        ==========================================
        SKIP EMPTY ROW
        ==========================================
        */

        if (

            bankId === 0 &&
            accountName === "" &&
            accountNumber === ""

        ) {

            return;

        }

        banks.push({

            bank_id: bankId,

            account_name: accountName,

            account_number: accountNumber,

            branch:
                row.querySelector(".branch")
                    .value
                    .trim(),

            purpose:
                row.querySelector(".purpose")
                    .value,

            is_default:
                row.querySelector(".is-default")
                    .checked

        });

    });

    return banks;

}
    /*
==========================================================
ONLY ONE DEFAULT
==========================================================
*/

ensureSingleDefault() {

    const radios =
        this.table.querySelectorAll(".is-default");

    let active = null;

    radios.forEach(radio => {

        if (radio.checked) {

            active = radio;

        }

    });

    radios.forEach(radio => {

        radio.checked =
            radio === active;

    });

}
/*
==========================================================
ENSURE ONLY ONE DEFAULT BANK
==========================================================
*/

ensureDefaultBank() {

    const radios = this.table.querySelectorAll(".is-default");

    if (radios.length === 0) {

        return;

    }

    const checked = [...radios].filter(r => r.checked);

    if (checked.length === 0) {

        radios[0].checked = true;

    }

}
/*
==========================================================
VALIDATE
==========================================================
*/

validate() {

    const rows =
        this.table.querySelectorAll("tr");

    if (rows.length === 0) {

        throw new Error(
            "Please select one default bank account."
        );

    }

    /*
    ==========================================
    GET DATA
    ==========================================
    */

    const data =
        this.getData();

    /*
    ==========================================
    VALIDATE REQUIRED FIELD
    ==========================================
    */

    data.forEach(bank => {

        if (!bank.bank_id) {

            throw new Error(
                "Please select bank."
            );

        }

        if (bank.account_name === "") {

            throw new Error(
                "Account Name is required."
            );

        }

        if (bank.account_number === "") {

            throw new Error(
                "Account Number is required."
            );

        }

    });

    /*
    ==========================================
    VALIDATE DEFAULT BANK
    ==========================================
    */
const numbers = [];

data.forEach(bank => {

    if (

        numbers.includes(bank.account_number)

    ) {

        throw new Error(

            "Duplicate account number."

        );

    }

    numbers.push(

        bank.account_number

    );

});
    const defaults =
        data.filter(x => x.is_default);

    if (defaults.length === 0) {

        throw new Error(
            "Please select one default bank account."
        );

    }

    if (defaults.length > 1) {

        throw new Error(
            "Only one default bank account is allowed."
        );

    }

    return true;

}    /*
    ==========================================================
    CLEAR GRID
    ==========================================================
    */

    clear() {

    if (!this.table) {

        return;

    }

    this.table.innerHTML = "";

}

}
