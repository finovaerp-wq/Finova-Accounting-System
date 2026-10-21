/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Business Partner Bank Grid
Version : 3.0.0
==========================================================
*/
import { BankService } from "../../service/bank.service.js";

export class BankGrid {
    constructor() {
        this.table = document.getElementById("bp-bank-table");
        this.button = document.getElementById("btn-add-bank-row");
        this.editorElement = document.getElementById("bpBankAccountModal");
        this.editorForm = document.getElementById("bpBankAccountForm");
        this.bankSelect = document.getElementById("bp-bank-account-bank");
        this.accountNameInput = document.getElementById("bp-bank-account-holder");
        this.accountNumberInput = document.getElementById("bp-bank-account-number");
        this.branchInput = document.getElementById("bp-bank-account-branch");
        this.purposeSelect = document.getElementById("bp-bank-account-purpose");
        this.defaultInput = document.getElementById("bp-bank-account-default");
        this.saveEditorButton = document.getElementById("btn-save-bp-bank-account");
        this.deleteModal = document.getElementById("bpBankDeleteModal");
        this.confirmDeleteButton = document.getElementById("btn-confirm-bank-delete");
        this.pendingDeleteRow = null;
        this.editingRow = null;
        this.bankOptionsLoaded = false;
        this.bankOptionsPromise = null;
        this.bankTomSelect = null;
        this.editorModal = this.editorElement && globalThis.bootstrap
            ? globalThis.bootstrap.Modal.getOrCreateInstance(this.editorElement)
            : null;
        this.initialize();
    }

    initialize() {
        this.button?.addEventListener("click", () => this.openEditor());
        this.editorForm?.addEventListener("submit", event => {
            event.preventDefault();
            this.saveEditor();
        });
        this.editorElement?.addEventListener("shown.bs.modal", () => {
            this.setEditorLayer();
        });
        this.editorElement?.addEventListener("hidden.bs.modal", () => {
            this.bankTomSelect?.close();
        });
        this.confirmDeleteButton?.addEventListener("click", () => {
            if (!this.pendingDeleteRow) return;
            const deletedWasDefault = this.pendingDeleteRow._bankData?.is_default === true;
            this.pendingDeleteRow.remove();
            this.pendingDeleteRow = null;
            const remaining = [...(this.table?.querySelectorAll("tr") || [])];
            if (deletedWasDefault && remaining.length) {
                remaining[0]._bankData.is_default = true;
            }
            this.syncDefaultState();
            const modal = this.deleteModal ? bootstrap.Modal.getInstance(this.deleteModal) : null;
            modal?.hide();
        });
    }

    setEditorLayer() {
        if (!this.editorElement) return;
        this.editorElement.style.zIndex = "1070";
        const backdrops = [...document.querySelectorAll(".modal-backdrop")];
        const latestBackdrop = backdrops[backdrops.length - 1];
        if (latestBackdrop) latestBackdrop.style.zIndex = "1065";
    }

    loadBankOptions() {
        if (this.bankOptionsLoaded) return;
        if (this.bankOptionsPromise) return this.bankOptionsPromise;
        this.bankOptionsPromise = (async () => {
            const banks = await BankService.getAll();
            this.bankSelect.innerHTML = '<option value="">Select Bank</option>';
            banks.forEach(bank => {
                const option = document.createElement("option");
                option.value = String(bank.id);
                option.textContent = String(bank.bank_name ?? "").toUpperCase();
                this.bankSelect.appendChild(option);
            });
            if (typeof TomSelect !== "undefined") {
                this.bankTomSelect?.destroy();
                this.bankTomSelect = new TomSelect(this.bankSelect, {
                    create: false,
                    allowEmptyOption: false,
                    placeholder: "Select Bank",
                    searchField: ["text"],
                    maxOptions: 200,
                    closeAfterSelect: true,
                    openOnFocus: false,
                    selectOnTab: true,
                    onChange: () => this.bankSelect.setCustomValidity(""),
                    onDropdownOpen: () => {
                        // Start with the complete bank list; the user can type
                        // immediately to filter it.
                        this.bankTomSelect?.setTextboxValue("");
                        this.bankTomSelect?.refreshOptions(false);
                    }
                });

                // Explicit click opens all banks and focuses the real search
                // input. Do not move the dropdown outside the modal.
                this.bankTomSelect.control.addEventListener("click", () => {
                    const control = this.bankTomSelect;
                    if (!control) return;
                    control.focus();
                    if (!control.isOpen) {
                        control.setTextboxValue("");
                        control.open();
                    }
                });
            }
            this.bankOptionsLoaded = true;
        })().catch(error => {
            console.error("Failed to load bank master:", error);
            this.bankOptionsPromise = null;
            throw error;
        });
        return this.bankOptionsPromise;
    }

    openEditor(row = null) {
        if (!this.editorElement || !this.editorModal) {
            console.error("Modal rekening bank tidak ditemukan di business-partner-modal.html");
            return;
        }
        this.editingRow = row;
        if (this.editorForm) this.editorForm.reset();
        this.defaultInput.checked = false;
        this.bankSelect.setCustomValidity("");
        const data = row?._bankData || {};
        this.editorElement.querySelector("#bpBankAccountModalTitle").textContent = row ? "Edit Bank Account" : "Add Bank Account";
        this.saveEditorButton.innerHTML = '<i class="fa-solid fa-floppy-disk me-1"></i> Save Account';
        this.loadBankOptions().then(() => {
            if (this.bankTomSelect) this.bankTomSelect.setValue(data.bank_id ? String(data.bank_id) : "", true);
            else this.bankSelect.value = data.bank_id ? String(data.bank_id) : "";
            this.accountNameInput.value = data.account_name ?? data.account_holder ?? "";
            this.accountNumberInput.value = data.account_number ?? "";
            this.branchInput.value = data.branch ?? data.branch_name ?? "";
            this.purposeSelect.value = data.purpose ?? data.remarks ?? "Both";
            this.defaultInput.checked = Boolean(data.is_default ?? data.is_primary);
            this.editorModal.show();
        }).catch(() => alert("Daftar bank gagal dimuat. Periksa koneksi dan coba lagi."));
    }

    saveEditor() {
        const bankId = this.bankSelect.value;
        const bankName = this.bankSelect.selectedOptions?.[0]?.textContent?.trim() || "";
        const accountName = this.accountNameInput.value.trim();
        const accountNumber = this.accountNumberInput.value.trim();
        if (!bankId) {
            this.bankSelect.setCustomValidity("Please select a bank first.");
            alert("Please select a bank first.");
            this.bankTomSelect?.focus();
            return;
        }
        this.bankSelect.setCustomValidity("");
        if (!accountName) return this.accountNameInput.reportValidity();
        if (!accountNumber) return this.accountNumberInput.reportValidity();
        const allRows = [...(this.table?.querySelectorAll("tr") || [])];
        const duplicate = allRows.some(row => row !== this.editingRow && row._bankData?.account_number === accountNumber);
        if (duplicate) {
            alert("This account number already exists for this Business Partner.");
            this.accountNumberInput.focus();
            return;
        }
        const data = {
            bank_id: bankId,
            bank_name: bankName,
            account_name: accountName,
            account_number: accountNumber,
            branch: this.branchInput.value.trim(),
            purpose: this.purposeSelect.value || "Both",
            is_default: this.defaultInput.checked
        };
        if (data.is_default) allRows.forEach(row => { row._bankData.is_default = false; });
        if (this.editingRow) {
            this.editingRow._bankData = data;
            this.renderRow(this.editingRow);
        } else {
            const row = document.createElement("tr");
            row._bankData = data;
            this.table.appendChild(row);
            this.renderRow(row);
        }
        this.syncDefaultState();
        this.editorModal.hide();
    }

    renderRow(row) {
        const data = row._bankData;
        row.innerHTML = `
            <td class="bp-bank-name-cell"></td>
            <td></td><td></td><td></td><td></td>
            <td class="text-center"><input type="radio" name="default-bank" class="form-check-input is-default" aria-label="Jadikan rekening default"></td>
            <td class="text-center text-nowrap">
                <button type="button" class="btn btn-outline-primary btn-sm bp-bank-edit" title="Edit rekening" aria-label="Edit rekening"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="btn btn-danger btn-sm remove-bank" title="Hapus rekening" aria-label="Hapus rekening"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        const cells = row.querySelectorAll("td");
        cells[0].textContent = data.bank_name || "Bank";
        cells[1].textContent = data.account_name || "";
        cells[2].textContent = data.account_number || "";
        cells[3].textContent = data.branch || "";
        cells[4].textContent = data.purpose || "Both";
        const defaultRadio = row.querySelector(".is-default");
        defaultRadio.checked = Boolean(data.is_default);
        defaultRadio.addEventListener("change", () => {
            [...this.table.querySelectorAll("tr")].forEach(other => {
                other._bankData.is_default = other === row;
                other.querySelector(".is-default").checked = other === row;
            });
        });
        row.querySelector(".bp-bank-edit").addEventListener("click", () => this.openEditor(row));
        row.querySelector(".remove-bank").addEventListener("click", () => {
            this.pendingDeleteRow = row;
            if (this.deleteModal && globalThis.bootstrap) globalThis.bootstrap.Modal.getOrCreateInstance(this.deleteModal).show();
            else if (confirm("Delete this bank account?")) {
                row.remove();
                this.syncDefaultState();
            }
        });
    }

    syncDefaultState() {
        const rows = [...(this.table?.querySelectorAll("tr") || [])];
        if (rows.length === 1) rows[0]._bankData.is_default = true;
        if (rows.length && !rows.some(row => row._bankData.is_default)) rows[0]._bankData.is_default = true;
        rows.forEach(row => { row.querySelector(".is-default").checked = Boolean(row._bankData.is_default); });
    }

    addRow(bank = {}) {
        const row = document.createElement("tr");
        const data = {
            bank_id: bank.bank_id ?? "",
            bank_name: bank.bank_name ?? bank.mst_bank?.bank_name ?? "",
            account_name: bank.account_name ?? "",
            account_number: bank.account_number ?? "",
            branch: bank.branch ?? bank.branch_name ?? "",
            purpose: bank.purpose ?? bank.remarks ?? "Both",
            is_default: Boolean(bank.is_default ?? bank.is_primary)
        };
        row._bankData = data;
        this.table.appendChild(row);
        if (data.bank_id && !data.bank_name) {
            BankService.getAll().then(banks => {
                const match = banks.find(item => String(item.id) === String(data.bank_id));
                if (match) { data.bank_name = String(match.bank_name ?? "").toUpperCase(); this.renderRow(row); }
            }).catch(error => console.error("Failed to resolve bank name:", error));
        }
        this.renderRow(row);
        this.syncDefaultState();
        return row;
    }

    getData() {
        return [...(this.table?.querySelectorAll("tr") || [])].map(row => ({ ...row._bankData }));
    }

    validate() {
        const data = this.getData();
        if (!data.length) throw new Error("Tambahkan minimal satu rekening bank.");
        data.forEach(bank => {
            if (!bank.bank_id) throw new Error("Silakan pilih bank untuk setiap rekening.");
            if (!bank.account_name?.trim()) throw new Error("Nama pemilik rekening wajib diisi.");
            if (!bank.account_number?.trim()) throw new Error("Nomor rekening wajib diisi.");
        });
        if (new Set(data.map(bank => bank.account_number.trim())).size !== data.length) throw new Error("Nomor rekening tidak boleh duplikat.");
        if (data.filter(bank => bank.is_default).length !== 1) throw new Error("Pilih tepat satu rekening default.");
        return true;
    }

    canAddNewRow() { return true; }

    clear() {
        if (this.table) this.table.innerHTML = "";
        this.editingRow = null;
        this.pendingDeleteRow = null;
    }
}
