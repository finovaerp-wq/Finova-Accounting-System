/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MODULE  : BALANCE SHEET
FILE    : balance-sheet.js
VERSION : 3.0.0 FINAL - MONTHLY POSITION
==========================================================
*/

import { supabase } from "../../assets/js/core/supabase.js";
import { CompanyReport } from "../../assets/js/core/company-report.js";

export class BalanceSheet {

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
            console.log("Balance Sheet v3.0.0 Initialized");
        } catch (error) {
            console.error("BalanceSheet.initialize:", error);
            this.showError(error?.message || "Failed to initialize Balance Sheet.");
        } finally {
            window.App?.hideLoading?.();
        }
    }

    cacheDom() {
        this.filterYear = document.getElementById("balance-sheet");
        this.filterAccount = document.getElementById("balance-sheet-account");
        this.filterKeyword = document.getElementById("balance-sheet-keyword");
        this.btnFind = document.getElementById("btn-find-balance-sheet");
        this.btnDownload = document.getElementById("btn-download-excel-balance-sheet");
        this.btnPreview = document.getElementById("btn-preview-html-balance-sheet");
        this.btnRefresh = document.getElementById("btn-refresh-balance-sheet");
        this.tableBody = document.getElementById("balance-sheet-tbody");
        this.monthHeaders = Array.from({length:12}, (_,i) => document.getElementById(`bs-month-header-${i+1}`));
        this.totalBeginning = document.getElementById("bs-total-beginning");
        this.totalMonths = Array.from({length:12}, (_,i) => document.getElementById(`bs-total-month-${i+1}`));
        this.totalLabel = document.getElementById("bs-total-label");
        this.btnFirst = document.getElementById("balance-sheet-page-first");
        this.btnPrev = document.getElementById("balance-sheet-page-prev");
        this.btnNext = document.getElementById("balance-sheet-page-next");
        this.btnLast = document.getElementById("balance-sheet-page-last");
        this.currentPageInput = document.getElementById("balance-sheet-current-page");
        this.totalPagesLabel = document.getElementById("balance-sheet-total-pages");
        this.recordInfo = document.getElementById("balance-sheet-record-info");
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
            el.classList.toggle("bs-future-period-header", index + 1 > currentMonth);
        });
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
        const { data, error } = await supabase
            .from("mst_chart_of_accounts")
            .select("*")
            .order("account_code", {ascending:true});

        if (error) throw error;

        this.accounts = (Array.isArray(data) ? data : [])
            .map(a => this.normalizeAccount(a))
            .sort((a,b) => this.compareAccountCode(a.account_code,b.account_code));

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

    getAccountMap() {
        return new Map(this.accounts.map(a => [String(a.id), a]));
    }

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

        const first = String(account.account_code || "").charAt(0);

        if (pathText.includes("asset") || pathText.includes("aset") || first === "1") return "asset";
        if (pathText.includes("liabilit") || pathText.includes("payable") || pathText.includes("utang") || pathText.includes("kewajiban") || first === "2") return "liability";
        if (pathText.includes("equity") || pathText.includes("ekuitas") || pathText.includes("capital") || pathText.includes("modal") || pathText.includes("retained earning") || pathText.includes("laba ditahan") || first === "3") return "equity";

        return null;
    }

    classifySubsection(account, classification) {
        const text = this.getAccountPath(account)
            .map(a => `${a.account_code} ${a.account_name}`)
            .join(" ")
            .toLowerCase();

        if (classification === "asset") {
            if (text.includes("non-current") || text.includes("non current") || text.includes("fixed asset") ||
                text.includes("aset tetap") || text.includes("aset tidak lancar")) return "non_current_asset";
            return "current_asset";
        }

        if (classification === "liability") {
            if (text.includes("non-current") || text.includes("non current") || text.includes("long term") ||
                text.includes("jangka panjang") || text.includes("tidak lancar")) return "non_current_liability";
            return "current_liability";
        }

        return "equity";
    }

    populateAccountFilter() {
        if (!this.filterAccount) return;
        const previous = this.filterAccount.value || "";
        this.filterAccount.innerHTML = `<option value="">Show All Balance Sheet Accounts</option>`;

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
            const endDate = `${year}-12-31`;

            const { data: journalRows, error: journalError } = await supabase
                .from("trx_gl_journal")
                .select("*")
                .eq("status","Posted")
                .lte("journal_date", endDate)
                .order("journal_date", {ascending:true});

            if (journalError) throw journalError;

            this.journals = Array.isArray(journalRows) ? journalRows : [];
            const ids = this.journals.map(j => j.id).filter(v => v !== null && v !== undefined);
            this.details = ids.length ? await this.loadJournalDetails(ids) : [];
            this.postings = this.normalizePostings(this.details);
            this.data = this.buildBalanceSheet(year);
            this.applyFilter();

        } catch (error) {
            console.error("BalanceSheet.loadData:", error);
            this.journals = [];
            this.details = [];
            this.postings = [];
            this.data = [];
            this.filteredData = [];
            this.refreshView();
            this.showError(error?.message || "Failed to load Balance Sheet.");
        } finally {
            if (showLoading) window.App?.hideLoading?.();
        }
    }

    async loadJournalDetails(journalIds) {
        const result = [];

        for (let i=0; i<journalIds.length; i+=200) {
            const {data,error} = await supabase
                .from("trx_gl_journal_detail")
                .select("*")
                .in("journal_id", journalIds.slice(i,i+200));

            if (error) throw error;
            if (Array.isArray(data)) result.push(...data);
        }

        return result;
    }

    normalizePostings(details) {
        const result = [];

        (details || []).forEach(detail => {
            const journalId = detail?.journal_id ?? detail?.gl_journal_id ?? detail?.header_id ?? null;
            if (journalId === null || journalId === undefined) return;

            if (detail?.account_id !== null && detail?.account_id !== undefined) {
                result.push({
                    journal_id: journalId,
                    account_id: detail.account_id,
                    debit: this.toNumber(detail.debit),
                    credit: this.toNumber(detail.credit)
                });
                return;
            }

            const amount = this.toNumber(detail?.amount);

            if (detail?.debit_account_id != null) {
                result.push({journal_id:journalId, account_id:detail.debit_account_id, debit:amount, credit:0});
            }

            if (detail?.credit_account_id != null) {
                result.push({journal_id:journalId, account_id:detail.credit_account_id, debit:0, credit:amount});
            }
        });

        return result;
    }

    presentationMovement(account, debit, credit) {
        const cls = this.classifyAccount(account);

        if (cls === "liability" || cls === "equity") {
            return this.cleanNumber(credit - debit);
        }

        return this.cleanNumber(debit - credit);
    }

    buildBalanceSheet(year) {
        const currentMonth = this.getCurrentReportMonth(year);
        const accountMap = this.getAccountMap();
        const journalMap = new Map(this.journals.map(j => [String(j.id), j]));
        const direct = new Map();

        this.accounts.forEach(account => {
            if (!this.classifyAccount(account)) return;
            direct.set(String(account.id), {
                beginning: 0,
                movements: new Array(12).fill(0)
            });
        });

        this.postings.forEach(posting => {
            const journal = journalMap.get(String(posting.journal_id));
            const account = accountMap.get(String(posting.account_id));
            if (!journal || !account || !this.classifyAccount(account)) return;

            const date = String(journal?.journal_date ?? journal?.accounting_date ?? "").slice(0,10);
            if (!date) return;

            const postingYear = Number(date.slice(0,4));
            const postingMonth = Number(date.slice(5,7));
            const movement = this.presentationMovement(
                account,
                this.toNumber(posting.debit),
                this.toNumber(posting.credit)
            );

            const bucket = direct.get(String(account.id));
            if (!bucket) return;

            if (postingYear < year) {
                bucket.beginning += movement;
                return;
            }

            if (postingYear === year && postingMonth >= 1 && postingMonth <= 12) {
                bucket.movements[postingMonth - 1] += movement;
            }
        });

        const rows = this.accounts
            .filter(account => this.classifyAccount(account))
            .map(account => {
                const bucket = direct.get(String(account.id)) || {beginning:0,movements:new Array(12).fill(0)};
                const classification = this.classifyAccount(account);

                return {
                    id: account.id,
                    account_code: account.account_code,
                    account_name: account.account_name,
                    parent_id: account.parent_id,
                    classification,
                    subsection: this.classifySubsection(account, classification),
                    beginning: this.cleanNumber(bucket.beginning),
                    movements: bucket.movements.map(v => this.cleanNumber(v)),
                    months: this.buildMonthlyBalances(bucket.beginning, bucket.movements, currentMonth),
                    level: 0,
                    has_children: false,
                    is_root: false,
                    row_type: "account"
                };
            });

        const rowMap = new Map(rows.map(row => [String(row.id), row]));
        const childrenMap = new Map();

        rows.forEach(row => {
            if (row.parent_id == null || !rowMap.has(String(row.parent_id))) return;
            const key = String(row.parent_id);
            if (!childrenMap.has(key)) childrenMap.set(key, []);
            childrenMap.get(key).push(row);
        });

        childrenMap.forEach(children => children.sort((a,b) => this.compareAccountCode(a.account_code,b.account_code)));

        const aggregate = (row, visited = new Set()) => {
            const key = String(row.id);
            if (visited.has(key)) return {beginning:row.beginning,movements:[...row.movements]};

            const next = new Set(visited);
            next.add(key);

            let beginning = this.toNumber(row.beginning);
            const movements = [...row.movements].map(v => this.toNumber(v));
            const children = childrenMap.get(key) || [];
            row.has_children = children.length > 0;

            children.forEach(child => {
                const value = aggregate(child, next);
                beginning += value.beginning;
                for (let i=0;i<12;i++) movements[i] += this.toNumber(value.movements[i]);
            });

            row.beginning = this.cleanNumber(beginning);
            row.movements = movements.map(v => this.cleanNumber(v));
            row.months = this.buildMonthlyBalances(row.beginning,row.movements,currentMonth);

            return {beginning:row.beginning,movements:[...row.movements]};
        };

        const roots = rows
            .filter(row => row.parent_id == null || !rowMap.has(String(row.parent_id)))
            .sort((a,b) => this.compareAccountCode(a.account_code,b.account_code));

        roots.forEach(root => {
            root.is_root = true;
            aggregate(root);
        });

        const flatAccounts = [];
        const append = (row, level=0, visited=new Set()) => {
            const key = String(row.id);
            if (visited.has(key)) return;
            const next = new Set(visited);
            next.add(key);
            row.level = Math.min(level,5);
            flatAccounts.push(row);
            (childrenMap.get(key) || []).forEach(child => append(child,level+1,next));
        };
        roots.forEach(root => append(root));

        const sectionOrder = [
            ["asset","ASSETS"],
            ["liability","LIABILITIES"],
            ["equity","EQUITY"]
        ];

        const finalRows = [];

        sectionOrder.forEach(([classification,label]) => {
            const group = flatAccounts.filter(row => row.classification === classification);
            if (!group.length) return;

            finalRows.push({
                id:`section-${classification}`,
                row_type:"section",
                account_code:"",
                account_name:label,
                classification,
                level:0,
                beginning:null,
                months:new Array(12).fill(null)
            });

            finalRows.push(...group);

            const totals = this.calculateClassTotals(classification,year);

            finalRows.push({
                id:`total-${classification}`,
                row_type:"subtotal",
                account_code:"",
                account_name:`TOTAL ${label}`,
                classification,
                level:0,
                beginning:totals.beginning,
                months:totals.months
            });
        });

        return finalRows;
    }

    buildMonthlyBalances(beginning,movements,currentReportMonth) {
        let running = this.toNumber(beginning);
        const months = [];

        for (let index=0; index<12; index++) {
            if (index + 1 > currentReportMonth) {
                months.push(null);
                continue;
            }

            running += this.toNumber(movements?.[index]);
            months.push(this.cleanNumber(running));
        }

        return months;
    }

    calculateClassTotals(classification,year) {
        const currentMonth = this.getCurrentReportMonth(year);
        const accountMap = this.getAccountMap();
        const journalMap = new Map(this.journals.map(j => [String(j.id),j]));
        let beginning = 0;
        const movements = new Array(12).fill(0);

        this.postings.forEach(posting => {
            const journal = journalMap.get(String(posting.journal_id));
            const account = accountMap.get(String(posting.account_id));
            if (!journal || !account || this.classifyAccount(account) !== classification) return;

            const date = String(journal?.journal_date ?? journal?.accounting_date ?? "").slice(0,10);
            if (!date) return;

            const postingYear = Number(date.slice(0,4));
            const postingMonth = Number(date.slice(5,7));
            const movement = this.presentationMovement(account,posting.debit,posting.credit);

            if (postingYear < year) beginning += movement;
            else if (postingYear === year && postingMonth >= 1 && postingMonth <= 12) {
                movements[postingMonth-1] += movement;
            }
        });

        return {
            beginning:this.cleanNumber(beginning),
            months:this.buildMonthlyBalances(beginning,movements,currentMonth)
        };
    }

    calculateEquationTotals() {
        const year = Number(this.filterYear?.value || new Date().getFullYear());
        const assets = this.calculateClassTotals("asset",year);
        const liabilities = this.calculateClassTotals("liability",year);
        const equity = this.calculateClassTotals("equity",year);

        return {
            beginning: this.cleanNumber(liabilities.beginning + equity.beginning),
            months: liabilities.months.map((value,index) => {
                if (value == null || equity.months[index] == null) return null;
                return this.cleanNumber(this.toNumber(value) + this.toNumber(equity.months[index]));
            }),
            assets
        };
    }

    applyFilter() {
        const accountId = String(this.filterAccount?.value || "");
        const keyword = String(this.filterKeyword?.value || "").trim().toLowerCase();

        if (!accountId && !keyword) {
            this.filteredData = [...this.data];
        } else {
            const allowed = accountId ? this.getAccountAndDescendantIds(accountId) : null;

            this.filteredData = this.data.filter(row => {
                if (row.row_type !== "account") return false;
                if (allowed && !allowed.has(String(row.id))) return false;
                if (!keyword) return true;
                return `${row.account_code} ${row.account_name}`.toLowerCase().includes(keyword);
            });
        }

        this.currentPage = 1;
        this.refreshView();
    }

    getAccountAndDescendantIds(accountId) {
        const result = new Set();
        const accounts = this.data.filter(row => row.row_type === "account");
        const childrenMap = new Map();

        accounts.forEach(row => {
            if (row.parent_id == null) return;
            const key = String(row.parent_id);
            if (!childrenMap.has(key)) childrenMap.set(key,[]);
            childrenMap.get(key).push(String(row.id));
        });

        const walk = id => {
            const key = String(id);
            if (result.has(key)) return;
            result.add(key);
            (childrenMap.get(key) || []).forEach(walk);
        };

        walk(accountId);
        return result;
    }

    refreshView() {
        this.totalRows = this.filteredData.length;
        this.totalPages = Math.max(1,Math.ceil(this.totalRows/this.pageSize));
        this.currentPage = Math.min(Math.max(this.currentPage,1),this.totalPages);
        this.renderTable();
        this.renderTotals();
        this.updatePagination();
    }

    renderTable() {
        if (!this.tableBody) return;

        const start = (this.currentPage-1)*this.pageSize;
        const rows = this.filteredData.slice(start,start+this.pageSize);

        if (!rows.length) {
            this.renderEmpty();
            return;
        }

        this.tableBody.innerHTML = rows.map(row => this.createRow(row)).join("");
    }

    createRow(row) {
        if (row.row_type === "section") {
            return `<tr class="bs-section-row"><td colspan="14" class="bs-section-cell">${this.escapeHTML(row.account_name)}</td></tr>`;
        }

        const monthCells = row.months.map(value => `
            <td class="finova-table-number bs-number ${this.getAmountClass(value)}">
                ${this.formatAmount(value)}
            </td>
        `).join("");

        const rowClass = row.row_type === "subtotal"
            ? "bs-subtotal-row"
            : this.getRowClass(row);

        const description = row.row_type === "subtotal"
            ? this.escapeHTML(row.account_name)
            : `
                <span class="bs-account-code">${this.escapeHTML(row.account_code || "")}</span>
                ${row.account_code && row.account_name ? '<span class="bs-account-separator">::</span>' : ''}
                <span class="bs-account-name">${this.escapeHTML(row.account_name || "-")}</span>
            `;

        return `
            <tr class="${rowClass} bs-level-${Math.min(row.level||0,5)}">
                <td class="bs-description-cell"><div class="bs-description-text">${description}</div></td>
                <td class="finova-table-number bs-number ${this.getAmountClass(row.beginning)}">${this.formatAmount(row.beginning)}</td>
                ${monthCells}
            </tr>
        `;
    }

    getRowClass(row) {
        if (row.is_root) return "bs-root-row";
        if (row.has_children) return "bs-parent-row";
        return "bs-leaf-row";
    }

    getAmountClass(value) {
        if (value == null) return "bs-future-period";
        const n = this.toNumber(value);
        if (Math.abs(n) < 0.0001) return "bs-zero";
        if (n < 0) return "bs-negative";
        return "";
    }

    renderEmpty() {
        if (this.tableBody) {
            this.tableBody.innerHTML = `<tr><td colspan="14" class="text-center py-5 text-muted">No Balance Sheet record found.</td></tr>`;
        }
    }

    showTableLoading() {
        if (this.tableBody) {
            this.tableBody.innerHTML = `<tr><td colspan="14" class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary" role="status"></div><div class="small text-muted mt-2">Loading Balance Sheet...</div></td></tr>`;
        }
    }

    renderTotals() {
        const totals = this.calculateEquationTotals();

        if (this.totalLabel) this.totalLabel.textContent = "TOTAL LIABILITIES AND EQUITY";
        if (this.totalBeginning) this.totalBeginning.textContent = this.formatAmount(totals.beginning);

        this.totalMonths.forEach((el,index) => {
            if (!el) return;
            const value = totals.months[index];
            el.textContent = this.formatAmount(value);
            el.classList.toggle("bs-future-period",value == null);
        });
    }

    updatePagination() {
        const start = this.totalRows ? ((this.currentPage-1)*this.pageSize)+1 : 0;
        const end = Math.min(this.currentPage*this.pageSize,this.totalRows);

        if (this.currentPageInput) this.currentPageInput.value = this.currentPage;
        if (this.totalPagesLabel) this.totalPagesLabel.textContent = this.totalPages;
        if (this.recordInfo) this.recordInfo.textContent = this.totalRows ? `Displaying Record ${start} - ${end} of ${this.totalRows}` : "Displaying Record 0 - 0 of 0";
        if (this.btnFirst) this.btnFirst.disabled = this.currentPage <= 1;
        if (this.btnPrev) this.btnPrev.disabled = this.currentPage <= 1;
        if (this.btnNext) this.btnNext.disabled = this.currentPage >= this.totalPages;
        if (this.btnLast) this.btnLast.disabled = this.currentPage >= this.totalPages;
    }

    goToPage(page) {
        const target = Math.min(Math.max(Number(page)||1,1),this.totalPages);
        if (target === this.currentPage) return;
        this.currentPage = target;
        this.renderTable();
        this.updatePagination();
    }

    async resetAndReload() {
        try {
            window.App?.showLoading?.();
            if (this.filterAccount) this.filterAccount.value = "";
            if (this.filterKeyword) this.filterKeyword.value = "";
            this.currentPage = 1;
            this.updateMonthHeaders();
            await this.loadAccounts();
            await this.loadData(false);
        } catch (error) {
            console.error("BalanceSheet.resetAndReload:",error);
            this.showError(error?.message || "Failed to refresh Balance Sheet.");
        } finally {
            window.App?.hideLoading?.();
        }
    }

    getExportRows() {
        return this.filteredData.map(row => {
            if (row.row_type === "section") {
                return [row.account_name,...new Array(13).fill(null)];
            }

            const description = row.row_type === "subtotal"
                ? row.account_name
                : `${"    ".repeat(Math.max(0,row.level||0))}${row.account_code||""}${row.account_code&&row.account_name?" :: ":""}${row.account_name||""}`;

            return [
                description,
                row.beginning == null ? null : this.toNumber(row.beginning),
                ...row.months.map(v => v == null ? null : this.toNumber(v))
            ];
        });
    }

    downloadExcel() {
        try {
            if (!this.filteredData.length) {
                this.showError("No Balance Sheet data available to export.");
                return;
            }

            if (typeof XLSX === "undefined") {
                this.showError("Excel library is not available.");
                return;
            }

            const year = Number(this.filterYear?.value || new Date().getFullYear());
            const shortYear = String(year).slice(-2);
            const headers = ["Description","Beginning Year",...this.monthNames.map(m => `${m}-${shortYear}`)];
            const reportHeaderRows = CompanyReport.getExcelHeaderRows({
                title:"BALANCE SHEET",
                period:`Fiscal Year : ${year}`
            });

            const worksheetRows = [...reportHeaderRows,[],headers,...this.getExportRows()];
            const ws = XLSX.utils.aoa_to_sheet(worksheetRows);
            ws["!cols"] = [{wch:50},...new Array(13).fill(null).map(() => ({wch:18}))];

            const headerIndex = worksheetRows.indexOf(headers);

            if (ws["!ref"]) {
                const range = XLSX.utils.decode_range(ws["!ref"]);
                for (let r=headerIndex+1;r<=range.e.r;r++) {
                    for (let c=1;c<=13;c++) {
                        const cell = ws[XLSX.utils.encode_cell({r,c})];
                        if (cell && typeof cell.v === "number") cell.z = '#,##0;[Red](#,##0)';
                    }
                }
            }

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb,ws,"Balance Sheet");

            const now = new Date();
            const parts = new Intl.DateTimeFormat("en-GB",{
                day:"2-digit",month:"2-digit",year:"numeric",
                hour:"2-digit",minute:"2-digit",hourCycle:"h23",
                timeZone:"Asia/Jakarta"
            }).formatToParts(now);

            const getPart = type => parts.find(part => part.type === type)?.value ?? "";
            const timestamp =
                `${getPart("day")}.${getPart("month")}.${getPart("year")} ` +
                `${getPart("hour")}_${getPart("minute")} WIB`;

            XLSX.writeFile(wb,`Balance Sheet ${timestamp}.xlsx`);

        } catch (error) {
            console.error("BalanceSheet.downloadExcel:",error);
            this.showError(error?.message || "Failed to download Balance Sheet Excel.");
        }
    }

    previewHTML() {
        try {
            if (!this.filteredData.length) {
                this.showError("No Balance Sheet data available to preview.");
                return;
            }

            const win = window.open("about:blank","finova-balance-sheet-preview");
            if (!win) {
                this.showError("Browser blocked the preview window. Please allow pop-ups for FINOVA.");
                return;
            }

            const year = Number(this.filterYear?.value || new Date().getFullYear());
            const shortYear = String(year).slice(-2);
            const currentMonth = this.getCurrentReportMonth(year);
            const company = CompanyReport.getIdentity();
            const companyContact = company.contactLine || "";

            const monthHeaders = this.monthNames.map((m,i) =>
                `<th class="${i+1>currentMonth?'future-period':''}">${m}-${shortYear}</th>`
            ).join("");

            const rows = this.filteredData.map(row => {
                if (row.row_type === "section") {
                    return `<tr class="section"><td colspan="14">${this.escapeHTML(row.account_name)}</td></tr>`;
                }

                const cells = row.months.map(v =>
                    v == null
                        ? '<td class="amount future-period"></td>'
                        : `<td class="amount ${this.toNumber(v)<0?'negative':''}">${this.formatAmount(v)}</td>`
                ).join("");

                const cls = row.row_type === "subtotal"
                    ? "subtotal"
                    : row.is_root ? "root" : row.has_children ? "parent" : "account";

                const description = row.row_type === "subtotal"
                    ? this.escapeHTML(row.account_name)
                    : `${this.escapeHTML(row.account_code||"")}${row.account_code&&row.account_name?' :: ':''}${this.escapeHTML(row.account_name||"")}`;

                return `<tr class="${cls}">
                    <td class="description" style="padding-left:${10+Math.min(row.level||0,5)*18}px">${description}</td>
                    <td class="amount ${this.toNumber(row.beginning)<0?'negative':''}">${this.formatAmount(row.beginning)}</td>
                    ${cells}
                </tr>`;
            }).join("");

            const totals = this.calculateEquationTotals();
            const totalCells = totals.months.map(v =>
                v == null
                    ? '<td class="amount future-period"></td>'
                    : `<td class="amount ${v<0?'negative':''}">${this.formatAmount(v)}</td>`
            ).join("");

            const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Balance Sheet ${year}</title>
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
.amount{min-width:115px;text-align:right;font-variant-numeric:tabular-nums}
.negative{color:#b91c1c}
.future-period{background:#f8fafc!important;color:#94a3b8}
.section td{background:#E8EEFC;color:#1E3A8A;font-weight:700;letter-spacing:.3px;border-top:2px solid #244494}
.root td{background:#eef2ff;font-weight:700}
.parent td{background:#f8fafc;font-weight:600}
.subtotal td{background:#f3f4f6;font-weight:700;border-top:2px solid #9ca3af}
tfoot td{background:#dbeafe;font-weight:700;border-top:2px solid #244494}
.footer{display:flex;justify-content:space-between;gap:30px;margin-top:16px;padding-top:10px;border-top:1px solid #e5e7eb}
@media print{@page{size:landscape;margin:8mm}body{padding:0}}
</style>
</head>
<body>
<div class="report">
<div class="report-header">
<div class="finova-brand">FINOVA ACCOUNTING SYSTEM</div>
${company.displayName?`<div class="company">${this.escapeHTML(company.displayName)}</div>`:""}
${companyContact?`<div class="company-contact">${this.escapeHTML(companyContact)}</div>`:""}
<div class="title">BALANCE SHEET</div>
<div class="period">Fiscal Year : ${year}</div>
<div class="period">Amount in IDR</div>
<div class="generated">Print Date : ${new Date().toLocaleString("id-ID")}</div>
</div>
<div class="table-container">
<table>
<thead><tr><th>Description</th><th>Beginning Year</th>${monthHeaders}</tr></thead>
<tbody>${rows}</tbody>
<tfoot>
<tr>
<td>TOTAL LIABILITIES AND EQUITY</td>
<td class="amount ${totals.beginning<0?'negative':''}">${this.formatAmount(totals.beginning)}</td>
${totalCells}
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
            console.error("BalanceSheet.previewHTML:",error);
            this.showError(error?.message || "Failed to preview Balance Sheet.");
        }
    }

    compareAccountCode(a,b) {
        return String(a||"").localeCompare(String(b||""),undefined,{numeric:true,sensitivity:"base"});
    }

    toNumber(value) {
        if (value == null || value === "") return 0;
        if (typeof value === "number") return Number.isFinite(value) ? value : 0;

        const text = String(value).trim();
        if (!text) return 0;

        if (/^-?\d+(\.\d+)?$/.test(text)) {
            const n = Number(text);
            return Number.isFinite(n) ? n : 0;
        }

        const n = Number(text.replace(/\./g,"").replace(",","."));
        return Number.isFinite(n) ? n : 0;
    }

    cleanNumber(value) {
        const n = this.toNumber(value);
        return Math.abs(n) < 0.0001 ? 0 : n;
    }

    formatAmount(value) {
        if (value == null) return "";
        const n = Math.round(this.cleanNumber(value));
        const abs = Math.abs(n).toLocaleString("id-ID");
        return n < 0 ? `(${abs})` : abs;
    }

    escapeHTML(value) {
        return String(value??"")
            .replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");
    }

    showError(message) {
        if (window.App?.showError) {
            window.App.showError(message);
            return;
        }
        console.error(message);
    }
}
