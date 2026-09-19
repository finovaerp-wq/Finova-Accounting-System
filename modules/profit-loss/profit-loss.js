/* ==========================================================
   FINOVA ACCOUNTING SYSTEM
   MODULE : PROFIT & LOSS
   FILE   : profit-loss.js
   VERSION: 3.1.0 FINAL - GROUPED MONTHLY P&L
========================================================== */

import { supabase } from "../../assets/js/core/supabase.js";
import { CompanyReport } from "../../assets/js/core/company-report.js";

export class ProfitLoss {
    constructor() {
        this.accounts = [];
        this.journals = [];
        this.details = [];
        this.postings = [];
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.pageSize = 30;
        this.totalPages = 1;
        this.totalRows = 0;
        this.monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        this.initialize();
    }

    async initialize() {
        try {
            window.App?.showLoading?.();
            this.cacheDom();
            this.initializeYearOptions();
            this.updateMonthHeaders();
            this.bindEvents();
            await this.loadAccounts();
            await this.loadData(false);
            console.log("Profit & Loss v3.1.0 Grouped Monthly P&L Initialized");
        } catch (error) {
            console.error("ProfitLoss.initialize:", error);
            this.showError(error?.message || "Failed to initialize Profit & Loss.");
        } finally {
            window.App?.hideLoading?.();
        }
    }

    cacheDom() {
        this.filterYear = document.getElementById("profit-loss");
        this.filterAccount = document.getElementById("profit-loss-account");
        this.filterKeyword = document.getElementById("profit-loss-keyword");
        this.btnFind = document.getElementById("btn-find-profit-loss");
        this.btnDownload = document.getElementById("btn-download-excel-profit-loss");
        this.btnPreview = document.getElementById("btn-preview-html-profit-loss");
        this.btnRefresh = document.getElementById("btn-refresh-profit-loss");
        this.tableBody = document.getElementById("profit-loss-tbody");
        this.monthHeaders = Array.from({length:12}, (_,i) => document.getElementById(`pl-month-header-${i+1}`));
        this.totalYearHeader = document.getElementById("pl-total-year-header");
        this.totalMonths = Array.from({length:12}, (_,i) => document.getElementById(`pl-total-month-${i+1}`));
        this.totalYear = document.getElementById("pl-total-year");
        this.totalLabel = document.getElementById("pl-total-label");
        this.btnFirst = document.getElementById("profit-loss-page-first");
        this.btnPrev = document.getElementById("profit-loss-page-prev");
        this.btnNext = document.getElementById("profit-loss-page-next");
        this.btnLast = document.getElementById("profit-loss-page-last");
        this.currentPageInput = document.getElementById("profit-loss-current-page");
        this.totalPagesLabel = document.getElementById("profit-loss-total-pages");
        this.recordInfo = document.getElementById("profit-loss-record-info");
    }

    initializeYearOptions() {
        if (!this.filterYear) return;
        const currentYear = new Date().getFullYear();
        this.filterYear.innerHTML = "";
        for (let year = currentYear + 2; year >= currentYear - 10; year--) {
            const option = document.createElement("option");
            option.value = String(year);
            option.textContent = String(year);
            option.selected = year === currentYear;
            this.filterYear.appendChild(option);
        }
    }

    getCurrentReportMonth(year) {
        const now = new Date();
        if (year < now.getFullYear()) return 12;
        if (year > now.getFullYear()) return 0;
        return now.getMonth() + 1;
    }

    updateMonthHeaders() {
        const year = Number(this.filterYear?.value || new Date().getFullYear());
        const shortYear = String(year).slice(-2);
        const currentMonth = this.getCurrentReportMonth(year);
        this.monthHeaders.forEach((el,index) => {
            if (!el) return;
            el.textContent = `${this.monthNames[index]}-${shortYear}`;
            el.classList.toggle("pl-future-period-header", index + 1 > currentMonth);
        });
        if (this.totalYearHeader) this.totalYearHeader.textContent = `Total ${year}`;
    }

    bindEvents() {
        this.filterYear?.addEventListener("change", async () => {
            this.updateMonthHeaders();
            await this.loadData();
        });
        this.filterAccount?.addEventListener("change", () => this.applyFilter());
        this.btnFind?.addEventListener("click", e => { e.preventDefault(); this.applyFilter(); });
        this.filterKeyword?.addEventListener("keydown", e => {
            if (e.key === "Enter") { e.preventDefault(); this.applyFilter(); }
        });
        this.btnRefresh?.addEventListener("click", async e => { e.preventDefault(); await this.resetAndReload(); });
        this.btnDownload?.addEventListener("click", e => { e.preventDefault(); this.downloadExcel(); });
        this.btnPreview?.addEventListener("click", e => { e.preventDefault(); this.previewHTML(); });
        this.btnFirst?.addEventListener("click", () => this.goToPage(1));
        this.btnPrev?.addEventListener("click", () => this.goToPage(this.currentPage - 1));
        this.btnNext?.addEventListener("click", () => this.goToPage(this.currentPage + 1));
        this.btnLast?.addEventListener("click", () => this.goToPage(this.totalPages));
        this.currentPageInput?.addEventListener("change", () => this.goToPage(Number(this.currentPageInput.value || 1)));
    }

    async loadAccounts() {
        const { data, error } = await supabase.from("mst_chart_of_accounts").select("*").order("account_code", {ascending:true});
        if (error) throw error;
        this.accounts = (Array.isArray(data) ? data : []).map(a => this.normalizeAccount(a));
        this.accounts.sort((a,b) => this.compareAccountCode(a.account_code,b.account_code));
        this.populateAccountFilter();
    }

    normalizeAccount(account) {
        return {
            ...account,
            id: account?.id,
            account_code: String(account?.account_code ?? account?.code ?? ""),
            account_name: String(account?.account_name ?? account?.name ?? ""),
            parent_id: account?.parent_id ?? account?.parent_account_id ?? account?.parent_coa_id ?? account?.parent_account ?? null,
            normal_account: String(account?.normal_account ?? account?.normal_balance ?? "").toLowerCase(),
            allow_transaction: account?.allow_transaction ?? account?.is_transaction ?? true,
            status: account?.status ?? account?.is_active ?? true
        };
    }

    getAccountMap() { return new Map(this.accounts.map(a => [String(a.id), a])); }

    getAccountPath(account) {
        const map = this.getAccountMap();
        const path = [];
        const visited = new Set();
        let current = account;
        while (current && !visited.has(String(current.id))) {
            visited.add(String(current.id));
            path.unshift(current);
            if (current.parent_id === null || current.parent_id === undefined || current.parent_id === "") break;
            current = map.get(String(current.parent_id));
        }
        return path;
    }

    classifyAccount(account) {
        const pathText = this.getAccountPath(account)
            .map(a => `${a.account_code} ${a.account_name}`)
            .join(" ")
            .toLowerCase();
        const own = `${account.account_code} ${account.account_name}`.toLowerCase();
        const has = (...terms) => terms.some(t => pathText.includes(t));
        const ownHas = (...terms) => terms.some(t => own.includes(t));

        if (has("income tax", "tax expense", "pajak penghasilan", "beban pajak")) return "tax";
        if (has("cost of revenue", "cost of sales", "cost of goods", "cogs", "harga pokok", "hpp")) return "cost";
        if (has("other income", "other revenue", "pendapatan lain", "penghasilan lain")) return "other_income";
        if (has("finance cost", "interest expense", "beban bunga", "biaya keuangan", "other expense", "beban lain")) return "other_expense";
        if (has("expense", "expenses", "beban", "operating cost", "biaya operasional")) return "opex";
        if (has("revenue", "income", "sales", "pendapatan", "penjualan", "penghasilan")) return "revenue";

        // Conservative code fallback commonly used by FINOVA-style COA.
        const first = String(account.account_code || "").charAt(0);
        if (first === "4") return "revenue";
        if (first === "5") return "cost";
        if (first === "6") return "opex";
        if (first === "7") {
            if (ownHas("income", "revenue", "pendapatan", "penghasilan")) return "other_income";
            return "other_expense";
        }
        return null;
    }

    populateAccountFilter() {
        if (!this.filterAccount) return;
        const previous = this.filterAccount.value || "";
        this.filterAccount.innerHTML = `<option value="">Show All P&L Accounts</option>`;
        this.accounts.filter(a => this.classifyAccount(a)).forEach(account => {
            const option = document.createElement("option");
            option.value = String(account.id);
            option.textContent = `${account.account_code} :: ${account.account_name}`;
            this.filterAccount.appendChild(option);
        });
        if (previous) this.filterAccount.value = previous;
    }

    async loadData(showLoading = true) {
        try {
            if (showLoading) window.App?.showLoading?.();
            this.showTableLoading();
            const year = Number(this.filterYear?.value || new Date().getFullYear());
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;
            const { data: journalRows, error: journalError } = await supabase
                .from("trx_gl_journal").select("*")
                .eq("status","Posted")
                .gte("journal_date", startDate).lte("journal_date", endDate)
                .order("journal_date", {ascending:true});
            if (journalError) throw journalError;
            this.journals = Array.isArray(journalRows) ? journalRows : [];
            const ids = this.journals.map(j => j.id).filter(v => v !== null && v !== undefined);
            this.details = ids.length ? await this.loadJournalDetails(ids) : [];
            this.postings = this.normalizePostings(this.details);
            this.data = this.buildProfitLoss(year);
            this.applyFilter();
        } catch (error) {
            console.error("ProfitLoss.loadData:", error);
            this.journals = []; this.details = []; this.postings = []; this.data = []; this.filteredData = [];
            this.refreshView();
            this.showError(error?.message || "Failed to load Profit & Loss.");
        } finally {
            if (showLoading) window.App?.hideLoading?.();
        }
    }

    async loadJournalDetails(journalIds) {
        const result = [];
        for (let i=0; i<journalIds.length; i+=200) {
            const {data,error} = await supabase.from("trx_gl_journal_detail").select("*").in("journal_id", journalIds.slice(i,i+200));
            if (error) throw error;
            if (Array.isArray(data)) result.push(...data);
        }
        return result;
    }

    normalizePostings(details) {
        const result = [];
        (details || []).forEach(detail => {
            const journalId = detail?.journal_id ?? detail?.gl_journal_id ?? detail?.header_id ?? null;
            if (journalId === null) return;
            if (detail?.account_id !== null && detail?.account_id !== undefined) {
                result.push({journal_id:journalId, account_id:detail.account_id, debit:this.toNumber(detail.debit), credit:this.toNumber(detail.credit)});
                return;
            }
            const amount = this.toNumber(detail?.amount);
            if (detail?.debit_account_id != null) result.push({journal_id:journalId,account_id:detail.debit_account_id,debit:amount,credit:0});
            if (detail?.credit_account_id != null) result.push({journal_id:journalId,account_id:detail.credit_account_id,debit:0,credit:amount});
        });
        return result;
    }

    accountMonthlyMovement(account, debit, credit) {
        const cls = this.classifyAccount(account);
        // P&L presentation: income positive, costs/expenses negative.
        if (cls === "revenue" || cls === "other_income") return this.cleanNumber(credit - debit);
        return this.cleanNumber(debit - credit) * -1;
    }

    buildProfitLoss(year) {
        const currentMonth = this.getCurrentReportMonth(year);
        const accountMap = this.getAccountMap();
        const journalMap = new Map(this.journals.map(j => [String(j.id), j]));
        const direct = new Map();

        this.accounts.forEach(account => {
            if (this.classifyAccount(account)) {
                direct.set(String(account.id), new Array(12).fill(0));
            }
        });

        this.postings.forEach(posting => {
            const journal = journalMap.get(String(posting.journal_id));
            const account = accountMap.get(String(posting.account_id));
            const classification = account ? this.classifyAccount(account) : null;

            if (!journal || !account || !classification) return;

            const date = String(
                journal?.journal_date ??
                journal?.accounting_date ??
                ""
            ).slice(0, 10);

            if (!date || Number(date.slice(0, 4)) !== year) return;

            const month = Number(date.slice(5, 7));
            if (month < 1 || month > 12) return;

            const movement = this.accountMonthlyMovement(
                account,
                this.toNumber(posting.debit),
                this.toNumber(posting.credit)
            );

            direct.get(String(account.id))[month - 1] += movement;
        });

        const accountRows = this.accounts
            .filter(account => this.classifyAccount(account))
            .map(account => {
                const classification = this.classifyAccount(account);
                const raw = direct.get(String(account.id)) || new Array(12).fill(0);
                const months = raw.map((value, index) =>
                    index + 1 > currentMonth
                        ? null
                        : this.cleanNumber(value)
                );

                return {
                    id: account.id,
                    account_code: account.account_code,
                    account_name: account.account_name,
                    parent_id: account.parent_id,
                    classification,
                    months,
                    movements: [...raw],
                    totalYear: this.cleanNumber(
                        raw.reduce((sum, value) => sum + this.toNumber(value), 0)
                    ),
                    level: 1,
                    has_children: false,
                    is_root: false,
                    row_type: "account"
                };
            })
            .sort((a, b) =>
                this.compareAccountCode(a.account_code, b.account_code)
            );

        const sumRows = rows => {
            const months = new Array(12).fill(0);
            let totalYear = 0;

            rows.forEach(row => {
                row.movements.forEach((value, index) => {
                    months[index] += this.toNumber(value);
                });
                totalYear += this.toNumber(row.totalYear);
            });

            return {
                movements: months.map(value => this.cleanNumber(value)),
                months: months.map((value, index) =>
                    index + 1 > currentMonth
                        ? null
                        : this.cleanNumber(value)
                ),
                totalYear: this.cleanNumber(totalYear)
            };
        };

        const makeSection = label => ({
            id: `section-${label}`,
            account_code: "",
            account_name: label,
            parent_id: null,
            classification: "",
            months: new Array(12).fill(null),
            movements: new Array(12).fill(0),
            totalYear: null,
            level: 0,
            has_children: false,
            is_root: false,
            row_type: "section"
        });

        const makeSubtotal = (label, values, strongest = false) => ({
            id: `subtotal-${label}`,
            account_code: "",
            account_name: label,
            parent_id: null,
            classification: "",
            months: [...values.months],
            movements: [...values.movements],
            totalYear: this.cleanNumber(values.totalYear),
            level: 0,
            has_children: false,
            is_root: false,
            row_type: strongest ? "strong_total" : "subtotal"
        });

        const combine = (...parts) => {
            const movements = new Array(12).fill(0);

            parts.forEach(part => {
                part.movements.forEach((value, index) => {
                    movements[index] += this.toNumber(value);
                });
            });

            return {
                movements: movements.map(value => this.cleanNumber(value)),
                months: movements.map((value, index) =>
                    index + 1 > currentMonth
                        ? null
                        : this.cleanNumber(value)
                ),
                totalYear: this.cleanNumber(
                    movements.reduce((sum, value) => sum + value, 0)
                )
            };
        };

        const byClass = classification =>
            accountRows.filter(row => row.classification === classification);

        const revenueRows = byClass("revenue");
        const costRows = byClass("cost");
        const opexRows = byClass("opex");
        const otherIncomeRows = byClass("other_income");
        const otherExpenseRows = byClass("other_expense");
        const taxRows = byClass("tax");

        const revenue = sumRows(revenueRows);
        const cost = sumRows(costRows);
        const grossProfit = combine(revenue, cost);

        const operatingExpenses = sumRows(opexRows);
        const operatingProfit = combine(grossProfit, operatingExpenses);

        const otherIncome = sumRows(otherIncomeRows);
        const otherExpense = sumRows(otherExpenseRows);
        const otherNet = combine(otherIncome, otherExpense);

        const profitBeforeTax = combine(operatingProfit, otherNet);
        const incomeTax = sumRows(taxRows);
        const profitForPeriod = combine(profitBeforeTax, incomeTax);

        const result = [];

        result.push(makeSection("REVENUE"));
        result.push(...revenueRows);
        result.push(makeSubtotal("TOTAL REVENUE", revenue));

        result.push(makeSection("COST OF REVENUE"));
        result.push(...costRows);
        result.push(makeSubtotal("TOTAL COST OF REVENUE", cost));
        result.push(makeSubtotal("GROSS PROFIT", grossProfit, true));

        result.push(makeSection("OPERATING EXPENSES"));
        result.push(...opexRows);
        result.push(makeSubtotal("TOTAL OPERATING EXPENSES", operatingExpenses));
        result.push(makeSubtotal("OPERATING PROFIT", operatingProfit, true));

        result.push(makeSection("OTHER INCOME / (EXPENSES)"));
        result.push(...otherIncomeRows);
        result.push(...otherExpenseRows);
        result.push(makeSubtotal("TOTAL OTHER INCOME / (EXPENSES)", otherNet));

        result.push(makeSubtotal("PROFIT BEFORE INCOME TAX", profitBeforeTax, true));

        result.push(makeSection("INCOME TAX EXPENSE"));
        result.push(...taxRows);
        result.push(makeSubtotal("TOTAL INCOME TAX EXPENSE", incomeTax));

        result.push(makeSubtotal("PROFIT FOR THE PERIOD", profitForPeriod, true));

        return result;
    }

    applyFilter() {
        const accountId = String(this.filterAccount?.value || "");
        const keyword = String(this.filterKeyword?.value || "").trim().toLowerCase();

        if (!accountId && !keyword) {
            this.filteredData = [...this.data];
        } else {
            const allowed = accountId
                ? this.getAccountAndDescendantIds(accountId)
                : null;

            this.filteredData = this.data.filter(row => {
                if (row.row_type !== "account") return false;

                if (allowed && !allowed.has(String(row.id))) {
                    return false;
                }

                if (!keyword) return true;

                return `${row.account_code} ${row.account_name}`
                    .toLowerCase()
                    .includes(keyword);
            });
        }

        this.currentPage = 1;
        this.refreshView();
    }

    getAccountAndDescendantIds(accountId) {
        const result=new Set();
        const walk=id=>{
            const key=String(id); if(result.has(key)) return; result.add(key);
            this.data.filter(r=>String(r.parent_id)===key).forEach(r=>walk(r.id));
        };
        walk(accountId); return result;
    }

    refreshView() {
        this.totalRows=this.filteredData.length;
        this.totalPages=Math.max(1,Math.ceil(this.totalRows/this.pageSize));
        this.currentPage=Math.min(Math.max(this.currentPage,1),this.totalPages);
        this.renderTable(); this.renderTotals(); this.updatePagination();
    }

    renderTable() {
        if (!this.tableBody) return;
        const start=(this.currentPage-1)*this.pageSize;
        const rows=this.filteredData.slice(start,start+this.pageSize);
        if(!rows.length){this.renderEmpty();return;}
        this.tableBody.innerHTML=rows.map(row=>this.createRow(row)).join("");
    }

    createRow(row) {
        if (row.row_type === "section") {
            return `
                <tr class="pl-section-row">
                    <td class="pl-section-cell">
                        ${this.escapeHTML(row.account_name)}
                    </td>
                    ${new Array(13).fill('<td class="pl-section-value"></td>').join("")}
                </tr>
            `;
        }

        const monthCells = row.months
            .map(value => `
                <td class="finova-table-number pl-number ${this.getAmountClass(value)}">
                    ${this.formatAmount(value)}
                </td>
            `)
            .join("");

        if (
            row.row_type === "subtotal" ||
            row.row_type === "strong_total"
        ) {
            const rowClass =
                row.row_type === "strong_total"
                    ? "pl-strong-total-row"
                    : "pl-subtotal-row";

            return `
                <tr class="${rowClass}">
                    <td class="pl-description-cell">
                        <div class="pl-description-text">
                            ${this.escapeHTML(row.account_name)}
                        </div>
                    </td>
                    ${monthCells}
                    <td class="finova-table-number pl-number pl-total-year-cell ${this.getAmountClass(row.totalYear)}">
                        ${this.formatAmount(row.totalYear)}
                    </td>
                </tr>
            `;
        }

        return `
            <tr class="pl-account-row pl-level-1">
                <td class="pl-description-cell">
                    <div class="pl-description-text">
                        <span class="pl-account-code">
                            ${this.escapeHTML(row.account_code || "")}
                        </span>
                        ${
                            row.account_code && row.account_name
                                ? '<span class="pl-account-separator">::</span>'
                                : ""
                        }
                        <span class="pl-account-name">
                            ${this.escapeHTML(row.account_name || "-")}
                        </span>
                    </div>
                </td>
                ${monthCells}
                <td class="finova-table-number pl-number pl-total-year-cell ${this.getAmountClass(row.totalYear)}">
                    ${this.formatAmount(row.totalYear)}
                </td>
            </tr>
        `;
    }

    getRowClass(row){if(row.is_root)return "pl-root-row";if(row.has_children)return "pl-parent-row";return "pl-leaf-row";}
    getAmountClass(value){if(value==null)return "pl-future-period";const n=this.toNumber(value);if(Math.abs(n)<0.0001)return "pl-zero";if(n<0)return "pl-negative";return "";}

    renderEmpty(){if(this.tableBody)this.tableBody.innerHTML=`<tr><td colspan="14" class="text-center py-5 text-muted">No Profit & Loss record found.</td></tr>`;}
    showTableLoading(){if(this.tableBody)this.tableBody.innerHTML=`<tr><td colspan="14" class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary" role="status"></div><div class="small text-muted mt-2">Loading Profit & Loss...</div></td></tr>`;}

    calculateTotals() {
        const finalRow = this.data.find(
            row =>
                row.row_type === "strong_total" &&
                row.account_name === "PROFIT FOR THE PERIOD"
        );

        if (!finalRow) {
            return {
                months: new Array(12).fill(0),
                totalYear: 0
            };
        }

        return {
            months: [...finalRow.months],
            totalYear: this.toNumber(finalRow.totalYear)
        };
    }

    renderTotals(){
        const totals=this.calculateTotals();
        if(this.totalLabel)this.totalLabel.textContent="PROFIT FOR THE PERIOD";
        this.totalMonths.forEach((el,i)=>{if(!el)return;const v=totals.months[i];el.textContent=this.formatAmount(v);el.classList.toggle("pl-future-period",v==null);});
        if(this.totalYear)this.totalYear.textContent=this.formatAmount(totals.totalYear);
    }

    updatePagination(){
        const start=this.totalRows?((this.currentPage-1)*this.pageSize)+1:0;
        const end=Math.min(this.currentPage*this.pageSize,this.totalRows);
        if(this.currentPageInput)this.currentPageInput.value=this.currentPage;
        if(this.totalPagesLabel)this.totalPagesLabel.textContent=this.totalPages;
        if(this.recordInfo)this.recordInfo.textContent=this.totalRows?`Displaying Record ${start} - ${end} of ${this.totalRows}`:"Displaying Record 0 - 0 of 0";
        if(this.btnFirst)this.btnFirst.disabled=this.currentPage<=1;
        if(this.btnPrev)this.btnPrev.disabled=this.currentPage<=1;
        if(this.btnNext)this.btnNext.disabled=this.currentPage>=this.totalPages;
        if(this.btnLast)this.btnLast.disabled=this.currentPage>=this.totalPages;
    }

    goToPage(page){const p=Math.min(Math.max(Number(page)||1,1),this.totalPages);if(p===this.currentPage)return;this.currentPage=p;this.renderTable();this.updatePagination();}

    async resetAndReload(){
        try{window.App?.showLoading?.();if(this.filterAccount)this.filterAccount.value="";if(this.filterKeyword)this.filterKeyword.value="";this.currentPage=1;await this.loadAccounts();await this.loadData(false);}
        catch(error){console.error("ProfitLoss.resetAndReload:",error);this.showError(error?.message||"Failed to refresh Profit & Loss.");}
        finally{window.App?.hideLoading?.();}
    }

    getExportRows() {
        return this.filteredData.map(row => {
            if (row.row_type === "section") {
                return [
                    row.account_name,
                    ...new Array(12).fill(null),
                    null
                ];
            }

            const description =
                row.row_type === "account"
                    ? `    ${row.account_code || ""}${row.account_code && row.account_name ? " :: " : ""}${row.account_name || ""}`
                    : row.account_name;

            return [
                description,
                ...row.months.map(value =>
                    value == null ? null : this.toNumber(value)
                ),
                row.totalYear == null
                    ? null
                    : this.toNumber(row.totalYear)
            ];
        });
    }

    /*
==========================================================
DOWNLOAD EXCEL
==========================================================
*/

downloadExcel() {

    try {

        /*
        ==================================================
        VALIDATE DATA
        ==================================================
        */

        if (
            !this.filteredData.length
        ) {

            this.showError(
                "No Profit & Loss data available to export."
            );

            return;

        }


        /*
        ==================================================
        XLSX LIBRARY
        ==================================================
        */

        if (
            typeof XLSX === "undefined"
        ) {

            this.showError(
                "Excel library is not available."
            );

            return;

        }


        /*
        ==================================================
        REPORT YEAR
        ==================================================
        */

        const year =
            Number(
                this.filterYear?.value
                ||
                new Date().getFullYear()
            );


        const shortYear =
            String(
                year
            )
            .slice(
                -2
            );


        /*
        ==================================================
        TABLE HEADER
        ==================================================
        */

        const headers = [

            "Description",

            ...this.monthNames.map(
                month =>
                    `${month}-${shortYear}`
            ),

            `Total ${year}`

        ];


        /*
        ==================================================
        COMPANY REPORT HEADER
        ==================================================
        */

        const reportHeaderRows =
            CompanyReport.getExcelHeaderRows({

                title:
                    "PROFIT & LOSS",

                period:
                    `Fiscal Year : ${year}`

            });


        /*
        ==================================================
        WORKSHEET ROWS
        ==================================================
        */

        const worksheetRows = [

            ...reportHeaderRows,

            [],

            headers,

            ...this.getExportRows()

        ];


        /*
        ==================================================
        CREATE WORKSHEET
        ==================================================
        */

        const worksheet =
            XLSX.utils.aoa_to_sheet(
                worksheetRows
            );


        /*
        ==================================================
        COLUMN WIDTH
        ==================================================
        */

        worksheet["!cols"] = [

            {
                wch: 50
            },

            ...new Array(
                13
            )
            .fill(
                null
            )
            .map(
                () => ({
                    wch: 18
                })
            )

        ];


        /*
        ==================================================
        TABLE HEADER POSITION
        ==================================================
        */

        const tableHeaderRowIndex =
            worksheetRows.indexOf(
                headers
            );


        /*
        ==================================================
        NUMBER FORMAT
        ==================================================

        Column:
        0      = Description
        1 - 12 = Jan - Dec
        13     = Total Year

        ==================================================
        */

        if (
            worksheet["!ref"]
        ) {

            const range =
                XLSX.utils.decode_range(
                    worksheet["!ref"]
                );


            for (
                let row =
                    tableHeaderRowIndex + 1;

                row <= range.e.r;

                row++
            ) {

                for (
                    let column = 1;

                    column <= 13;

                    column++
                ) {

                    const address =
                        XLSX.utils.encode_cell({

                            r:
                                row,

                            c:
                                column

                        });


                    const cell =
                        worksheet[
                            address
                        ];


                    if (
                        cell
                        &&
                        typeof cell.v === "number"
                    ) {

                        cell.z =
                            '#,##0;[Red](#,##0)';

                    }

                }

            }

        }


        /*
        ==================================================
        CREATE WORKBOOK
        ==================================================
        */

        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            "Profit & Loss"

        );


        /*
        ==================================================
        FILE NAME TIMESTAMP WIB

        Keep original FINOVA download naming format.

        Example:
        Profit & Loss 19.09.2026 15_41 WIB.xlsx
        ==================================================
        */

        const now =
            new Date();


        const parts =
            new Intl.DateTimeFormat(

                "en-GB",

                {

                    day:
                        "2-digit",

                    month:
                        "2-digit",

                    year:
                        "numeric",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    hourCycle:
                        "h23",

                    timeZone:
                        "Asia/Jakarta"

                }

            )
            .formatToParts(
                now
            );


        const getPart =
            type =>

                parts.find(
                    part =>
                        part.type === type
                )?.value

                ?? "";


        const timestamp =

            `${getPart("day")}.`
            +
            `${getPart("month")}.`
            +
            `${getPart("year")} `
            +
            `${getPart("hour")}_`
            +
            `${getPart("minute")} WIB`;


        /*
        ==================================================
        DOWNLOAD
        ==================================================
        */

        XLSX.writeFile(

            workbook,

            `Profit & Loss ${timestamp}.xlsx`

        );

    }

    catch (
        error
    ) {

        console.error(
            "ProfitLoss.downloadExcel:",
            error
        );


        this.showError(

            error?.message
            ||
            "Failed to download Profit & Loss."

        );

    }

}

    previewHTML() {
        try {
            if (!this.filteredData.length) {
                this.showError("No Profit & Loss data available to preview.");
                return;
            }

            const win = window.open(
                "about:blank",
                "finova-profit-loss-preview"
            );

            if (!win) {
                this.showError(
                    "Browser blocked the preview window. Please allow pop-ups for FINOVA."
                );
                return;
            }

            const year = Number(
                this.filterYear?.value ||
                new Date().getFullYear()
            );

            const shortYear = String(year).slice(-2);
            const currentMonth = this.getCurrentReportMonth(year);
            const company = CompanyReport.getIdentity();
            const companyContact = company.contactLine || "";

            const monthHeaders = this.monthNames
                .map((month, index) =>
                    `<th class="${index + 1 > currentMonth ? "future-period" : ""}">${month}-${shortYear}</th>`
                )
                .join("");

            const rows = this.filteredData
                .map(row => {
                    if (row.row_type === "section") {
                        return `
                            <tr class="section">
                                <td>${this.escapeHTML(row.account_name)}</td>
                                ${new Array(13).fill("<td></td>").join("")}
                            </tr>
                        `;
                    }

                    const cells = row.months
                        .map(value =>
                            value == null
                                ? '<td class="amount future-period"></td>'
                                : `<td class="amount ${this.toNumber(value) < 0 ? "negative" : ""}">${this.formatAmount(value)}</td>`
                        )
                        .join("");

                    const rowClass =
                        row.row_type === "strong_total"
                            ? "strong-total"
                            : row.row_type === "subtotal"
                                ? "subtotal"
                                : "account";

                    const description =
                        row.row_type === "account"
                            ? `${this.escapeHTML(row.account_code || "")}${row.account_code && row.account_name ? " :: " : ""}${this.escapeHTML(row.account_name || "")}`
                            : this.escapeHTML(row.account_name);

                    return `
                        <tr class="${rowClass}">
                            <td class="description ${row.row_type === "account" ? "account-description" : ""}">
                                ${description}
                            </td>
                            ${cells}
                            <td class="amount total-year ${this.toNumber(row.totalYear) < 0 ? "negative" : ""}">
                                ${this.formatAmount(row.totalYear)}
                            </td>
                        </tr>
                    `;
                })
                .join("");

            const totals = this.calculateTotals();

            const totalCells = totals.months
                .map(value =>
                    value == null
                        ? '<td class="amount future-period"></td>'
                        : `<td class="amount ${this.toNumber(value) < 0 ? "negative" : ""}">${this.formatAmount(value)}</td>`
                )
                .join("");

            const html = `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Profit & Loss ${year}</title>
<style>
*{box-sizing:border-box}
body{margin:0;padding:28px 32px 42px;background:#fff;color:#1f2937;font-family:Tahoma,Arial,sans-serif;font-size:10px;width:max-content;min-width:100%}
.report{width:max-content;min-width:calc(100vw - 64px)}
.report-header{margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid #244494}
.finova-brand{margin-bottom:8px;color:#244494;font-weight:700;letter-spacing:.5px}
.company{font-size:20px;font-weight:700}
.company-contact,.generated,.footer{color:#6b7280}
.title{margin-top:5px;color:#244494;font-size:16px;font-weight:700}
.period{margin-top:6px;font-weight:600}
.table-container{border:1px solid #d1d5db;border-radius:4px;overflow:visible}
table{border-collapse:collapse;table-layout:auto;width:max-content;min-width:100%}
th{min-width:115px;padding:8px;background:#244494;color:#fff;border:1px solid #d1d5db;text-align:right;white-space:nowrap}
th:first-child{min-width:360px;text-align:left}
td{padding:7px 8px;border:1px solid #d1d5db;white-space:nowrap}
.description{min-width:360px}
.account-description{padding-left:26px}
.amount{min-width:115px;text-align:right;font-variant-numeric:tabular-nums}
.negative{color:#b91c1c}
.future-period{background:#f8fafc!important;color:#94a3b8}
.section td{background:#eef2ff;color:#1e3a8a;font-weight:700}
.subtotal td{font-weight:700;border-top:2px solid #9ca3af;background:#f8fafc}
.strong-total td{font-weight:700;border-top:2px solid #244494;background:#e8eefc}
.total-year{font-weight:700}
tfoot td{background:#dbeafe;font-weight:700;border-top:2px solid #244494}
.footer{display:flex;justify-content:space-between;gap:30px;margin-top:16px;padding-top:10px;border-top:1px solid #e5e7eb}
@media print{@page{size:landscape;margin:8mm}body{padding:0}}
</style>
</head>
<body>
<div class="report">
<div class="report-header">
<div class="finova-brand">FINOVA ACCOUNTING SYSTEM</div>
${company.displayName ? `<div class="company">${this.escapeHTML(company.displayName)}</div>` : ""}
${companyContact ? `<div class="company-contact">${this.escapeHTML(companyContact)}</div>` : ""}
<div class="title">PROFIT & LOSS</div>
<div class="period">For the Year Ended 31 December ${year}</div>
<div class="period">Amount in IDR</div>
<div class="generated">Print Date : ${new Date().toLocaleString("id-ID")}</div>
</div>
<div class="table-container">
<table>
<thead>
<tr>
<th>Description</th>
${monthHeaders}
<th>Total ${year}</th>
</tr>
</thead>
<tbody>${rows}</tbody>
<tfoot>
<tr>
<td>PROFIT FOR THE PERIOD</td>
${totalCells}
<td class="amount ${totals.totalYear < 0 ? "negative" : ""}">
${this.formatAmount(totals.totalYear)}
</td>
</tr>
</tfoot>
</table>
</div>
<div class="footer">
<div>Note: This report includes only Posted transactions.</div>
<div>Generated by FINOVA Accounting System</div>
</div>
</div>
</body>
</html>`;

            win.document.open();
            win.document.write(html);
            win.document.close();
            win.focus();

        } catch (error) {
            console.error(
                "ProfitLoss.previewHTML:",
                error
            );

            this.showError(
                error?.message ||
                "Failed to preview Profit & Loss."
            );
        }
    }

    compareAccountCode(a,b){return String(a||"").localeCompare(String(b||""),undefined,{numeric:true,sensitivity:"base"});}
    toNumber(value){if(value==null||value==="")return 0;if(typeof value==="number")return Number.isFinite(value)?value:0;const text=String(value).trim();if(!text)return 0;if(/^-?\d+(\.\d+)?$/.test(text)){const n=Number(text);return Number.isFinite(n)?n:0;}const n=Number(text.replace(/\./g,"").replace(",","."));return Number.isFinite(n)?n:0;}
    cleanNumber(value){const n=this.toNumber(value);return Math.abs(n)<0.0001?0:n;}
    formatAmount(value){if(value==null)return "";const n=Math.round(this.cleanNumber(value));const abs=Math.abs(n).toLocaleString("id-ID");return n<0?`(${abs})`:abs;}
    escapeHTML(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
    showError(message){if(window.App?.showError){window.App.showError(message);return;}console.error(message);}
}
