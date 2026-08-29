/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Module  : Dashboard
Version : 2.0.0 Executive Summary
==========================================================
*/

import {
    supabase,
    TABLE
} from "../../assets/js/core/supabase.js";


export class Dashboard {

    constructor() {

        this.clockTimer = null;

        this.dashboardData = {
            totalAsset: 0,
            totalLiability: 0,
            equity: 0,
            revenue: 0,
            expense: 0,
            netProfit: 0,
            arOutstanding: 0,
            apOutstanding: 0,
            arOverdueCount: 0,
            apOverdueCount: 0,
            draftJournalCount: 0,
            activeBusinessPartnerCount: 0,
            monthly: [],
            activities: []
        };

        this.initialize();
    }

    async initialize() {

        console.log("Dashboard: Initialized");

        this.cacheDom();
        this.loadSystemInformation();
        this.startClock();

        /*
        ======================================================
        INITIAL RENDER
        ======================================================
        */
        this.renderDashboard();

        /*
        ======================================================
        LOAD LIVE FINOVA DATA
        ======================================================
        */
        await this.loadDashboardData();
    }

    /* ========================================================
       CACHE DOM
    ======================================================== */
    cacheDom() {

        this.el = {};

        const ids = [
            "dashboard-period-label",
            "dashboard-header-date",
            "dashboard-total-asset",
            "dashboard-total-liability",
            "dashboard-equity",
            "dashboard-net-profit",
            "dashboard-net-profit-status",
            "dashboard-net-margin",
            "dashboard-performance-chart",
            "dashboard-position-donut",
            "dashboard-donut-total",
            "dashboard-position-asset",
            "dashboard-position-liability",
            "dashboard-position-equity",
            "dashboard-bs-asset",
            "dashboard-bs-liability",
            "dashboard-bs-equity",
            "dashboard-bs-difference",
            "dashboard-pl-revenue",
            "dashboard-pl-expense",
            "dashboard-pl-profit",
            "dashboard-pl-margin",
            "dashboard-insight-list",
            "dashboard-ar-outstanding",
            "dashboard-ap-outstanding",
            "dashboard-ar-overdue",
            "dashboard-ap-overdue",
            "dashboard-draft-journal",
            "dashboard-active-bp",
            "dashboard-activity-tbody",
            "dashboard-current-time",
            "dashboard-period",
            "dashboard-branch",
            "dashboard-currency"
        ];

        ids.forEach(id => {
            this.el[id] = document.getElementById(id);
        });
    }

    /* ========================================================
       PUBLIC DATA ENTRY
       Later Supabase/service layer can call this method.
    ======================================================== */
    setDashboardData(data = {}) {

        this.dashboardData = {
            ...this.dashboardData,
            ...data,
            monthly: Array.isArray(data.monthly)
                ? data.monthly
                : this.dashboardData.monthly,
            activities: Array.isArray(data.activities)
                ? data.activities
                : this.dashboardData.activities
        };

        this.renderDashboard();
    }

    /* ========================================================
       LOAD DASHBOARD DATA
       Source of truth = same Supabase tables used by modules.
    ======================================================== */
    async loadDashboardData() {

        try {

            const today = this.getTodayISO();
            const year = Number(today.slice(0, 4));

            const [
                accounts,
                journals,
                details,
                accountPayables,
                accountReceivables,
                businessPartners
            ] = await Promise.all([
                this.safeFetchAllRows(
                    TABLE.CHART_OF_ACCOUNTS,
                    "Chart Of Accounts"
                ),
                this.safeFetchAllRows(
                    TABLE.GL_JOURNAL,
                    "GL Journal"
                ),
                this.safeFetchAllRows(
                    TABLE.GL_JOURNAL_DETAIL,
                    "GL Journal Detail"
                ),
                this.safeFetchAllRows(
                    TABLE.ACCOUNT_PAYABLE,
                    "Account Payable"
                ),
                this.safeFetchAllRows(
                    TABLE.ACCOUNT_RECEIVABLE,
                    "Account Receivable"
                ),
                this.safeFetchAllRows(
                    TABLE.BUSINESS_PARTNER,
                    "Business Partner"
                )
            ]);

            const financial =
                this.buildFinancialSummary({
                    accounts,
                    journals,
                    details,
                    year,
                    today
                });

            const apSummary =
                this.buildOutstandingSummary(
                    accountPayables,
                    today
                );

            const arSummary =
                this.buildOutstandingSummary(
                    accountReceivables,
                    today
                );

            const draftJournalCount =
                journals.filter(
                    row =>
                        this.normalizeStatus(row?.status)
                        === "draft"
                ).length;

            const activeBusinessPartnerCount =
                businessPartners.filter(
                    row =>
                        row?.is_active === true
                        || String(row?.status || "")
                            .trim()
                            .toLowerCase()
                            === "active"
                ).length;

            const activities =
                this.buildRecentActivities(
                    journals,
                    details
                );

            this.setDashboardData({
                totalAsset:
                    financial.totalAsset,
                totalLiability:
                    financial.totalLiability,
                equity:
                    financial.equity,
                revenue:
                    financial.revenue,
                expense:
                    financial.expense,
                netProfit:
                    financial.netProfit,
                arOutstanding:
                    arSummary.outstanding,
                apOutstanding:
                    apSummary.outstanding,
                arOverdueCount:
                    arSummary.overdueCount,
                apOverdueCount:
                    apSummary.overdueCount,
                draftJournalCount,
                activeBusinessPartnerCount,
                monthly:
                    financial.monthly,
                activities
            });

            console.log(
                "Dashboard: live data loaded",
                this.dashboardData
            );

        }
        catch (error) {

            console.error(
                "Dashboard.loadDashboardData:",
                error
            );

            /*
            Dashboard remains usable with the data that was
            successfully loaded by safeFetchAllRows().
            */
        }
    }

    /* ========================================================
       SAFE PAGED SUPABASE READER
       Prevent Supabase default row limit from truncating data.
    ======================================================== */
    async safeFetchAllRows(table, label = table) {

        try {
            return await this.fetchAllRows(table);
        }
        catch (error) {
            console.error(
                `Dashboard ${label} load failed:`,
                error
            );
            return [];
        }
    }

    async fetchAllRows(table) {

        const result = [];
        const pageSize = 1000;
        let from = 0;

        while (true) {

            const { data, error } = await supabase
                .from(table)
                .select("*")
                .range(
                    from,
                    from + pageSize - 1
                );

            if (error) {
                throw error;
            }

            const rows = Array.isArray(data)
                ? data
                : [];

            result.push(...rows);

            if (rows.length < pageSize) {
                break;
            }

            from += pageSize;
        }

        return result;
    }

    /* ========================================================
       FINANCIAL SUMMARY
       Balance Sheet : Posted GL up to today.
       Profit & Loss : Posted GL in current year.
    ======================================================== */
    buildFinancialSummary({
        accounts = [],
        journals = [],
        details = [],
        year,
        today
    }) {

        const accountMap = new Map();

        accounts.forEach(account => {
            if (account?.id !== null && account?.id !== undefined) {
                accountMap.set(
                    String(account.id),
                    account
                );
            }
        });

        const postedJournals = journals.filter(journal => {

            if (
                this.normalizeStatus(journal?.status)
                !== "posted"
            ) {
                return false;
            }

            const date = this.getJournalDate(journal);

            return date && date <= today;
        });

        const postedJournalMap = new Map(
            postedJournals.map(
                journal => [
                    String(journal.id),
                    journal
                ]
            )
        );

        const postings = this.normalizePostings(details);

        let totalAsset = 0;
        let totalLiability = 0;
        let equity = 0;
        let revenue = 0;
        let expense = 0;

        const monthly = Array.from(
            { length: 12 },
            (_, index) => ({
                month: index + 1,
                revenue: 0,
                expense: 0,
                profit: 0
            })
        );

        postings.forEach(posting => {

            const journal = postedJournalMap.get(
                String(posting.journal_id)
            );

            if (!journal) {
                return;
            }

            const account = accountMap.get(
                String(posting.account_id)
            );

            if (!account) {
                return;
            }

            const group = this.resolveAccountGroup(
                account,
                accountMap
            );

            if (!group) {
                return;
            }

            const amount = this.getPresentationAmount(
                posting,
                account,
                group
            );

            const journalDate = this.getJournalDate(journal);

            /* Balance Sheet = point in time */
            if (group === "asset") {
                totalAsset += amount;
            }
            else if (group === "liability") {
                totalLiability += amount;
            }
            else if (group === "equity") {
                equity += amount;
            }

            /* Profit & Loss = current year activity only */
            if (
                journalDate
                && Number(journalDate.slice(0, 4)) === year
            ) {

                const month = Number(
                    journalDate.slice(5, 7)
                );

                if (group === "revenue") {
                    revenue += amount;

                    if (month >= 1 && month <= 12) {
                        monthly[month - 1].revenue += amount;
                    }
                }
                else if (group === "expense") {
                    expense += amount;

                    if (month >= 1 && month <= 12) {
                        monthly[month - 1].expense += amount;
                    }
                }
            }
        });

        monthly.forEach(row => {
            row.profit =
                row.revenue
                - row.expense;
        });

        return {
            totalAsset:
                this.cleanFinancialNumber(totalAsset),
            totalLiability:
                this.cleanFinancialNumber(totalLiability),
            equity:
                this.cleanFinancialNumber(equity),
            revenue:
                this.cleanFinancialNumber(revenue),
            expense:
                this.cleanFinancialNumber(expense),
            netProfit:
                this.cleanFinancialNumber(
                    revenue - expense
                ),
            monthly
        };
    }

    /* ========================================================
       NORMALIZE GL DETAIL
       Supports current account_id/debit/credit structure and
       legacy debit_account_id/credit_account_id/amount structure.
    ======================================================== */
    normalizePostings(details = []) {

        const postings = [];

        details.forEach(detail => {

            const journalId =
                detail?.journal_id;

            if (
                journalId === null
                || journalId === undefined
            ) {
                return;
            }

            if (
                detail?.account_id !== null
                && detail?.account_id !== undefined
            ) {

                postings.push({
                    journal_id:
                        journalId,
                    account_id:
                        detail.account_id,
                    debit:
                        this.toNumber(detail.debit),
                    credit:
                        this.toNumber(detail.credit)
                });

                return;
            }

            const amount = this.toNumber(
                detail?.amount
            );

            if (
                detail?.debit_account_id !== null
                && detail?.debit_account_id !== undefined
            ) {
                postings.push({
                    journal_id:
                        journalId,
                    account_id:
                        detail.debit_account_id,
                    debit:
                        amount,
                    credit:
                        0
                });
            }

            if (
                detail?.credit_account_id !== null
                && detail?.credit_account_id !== undefined
            ) {
                postings.push({
                    journal_id:
                        journalId,
                    account_id:
                        detail.credit_account_id,
                    debit:
                        0,
                    credit:
                        amount
                });
            }
        });

        return postings;
    }

    /* ========================================================
       ACCOUNT CLASSIFICATION
       Priority:
       1. Explicit report/category fields if they exist.
       2. Top-level COA parent name.

       This avoids depending on account-code prefixes.
    ======================================================== */
    resolveAccountGroup(account, accountMap) {

        const explicitCandidates = [
            account?.report_group,
            account?.financial_group,
            account?.account_group,
            account?.account_category,
            account?.category,
            account?.account_type
        ];

        for (const candidate of explicitCandidates) {
            const group = this.matchAccountGroup(candidate);
            if (group) {
                return group;
            }
        }

        let current = account;
        const visited = new Set();

        while (
            current
            && current?.parent_id !== null
            && current?.parent_id !== undefined
            && !visited.has(String(current.id))
        ) {

            visited.add(String(current.id));

            const parent = accountMap.get(
                String(current.parent_id)
            );

            if (!parent) {
                break;
            }

            current = parent;
        }

        return this.matchAccountGroup(
            current?.account_name
            || account?.account_name
            || ""
        );
    }

    matchAccountGroup(value) {

        const text = String(value || "")
            .trim()
            .toLowerCase();

        if (!text) {
            return null;
        }

        const containsAny = words =>
            words.some(word =>
                text.includes(word)
            );

        if (containsAny([
            "asset",
            "assets",
            "aset"
        ])) {
            return "asset";
        }

        if (containsAny([
            "liability",
            "liabilities",
            "kewajiban"
        ])) {
            return "liability";
        }

        if (containsAny([
            "equity",
            "ekuitas",
            "modal"
        ])) {
            return "equity";
        }

        if (containsAny([
            "revenue",
            "income",
            "pendapatan",
            "sales",
            "penjualan"
        ])) {
            return "revenue";
        }

        if (containsAny([
            "expense",
            "expenses",
            "cost",
            "cogs",
            "beban",
            "biaya",
            "hpp"
        ])) {
            return "expense";
        }

        return null;
    }

    getPresentationAmount(posting, account, group) {

        const debit = this.toNumber(posting?.debit);
        const credit = this.toNumber(posting?.credit);

        const normalBalance = String(
            account?.normal_balance
            || ""
        )
            .trim()
            .toLowerCase();

        if (normalBalance === "credit") {
            return credit - debit;
        }

        if (normalBalance === "debit") {
            return debit - credit;
        }

        if (
            group === "liability"
            || group === "equity"
            || group === "revenue"
        ) {
            return credit - debit;
        }

        return debit - credit;
    }

    /* ========================================================
       AP / AR OUTSTANDING SUMMARY
    ======================================================== */
    buildOutstandingSummary(rows = [], today) {

        let outstanding = 0;
        let overdueCount = 0;

        rows.forEach(row => {

            const status = this.normalizeStatus(
                row?.status
            );

            if ([
                "draft",
                "void",
                "paid",
                "cancelled",
                "canceled"
            ].includes(status)) {
                return;
            }

            const amount = Math.max(
                0,
                this.toNumber(
                    row?.outstanding_amount
                    ?? row?.total_amount
                )
            );

            if (amount <= 0) {
                return;
            }

            outstanding += amount;

            const dueDate = String(
                row?.due_date
                || ""
            ).slice(0, 10);

            if (
                dueDate
                && dueDate < today
            ) {
                overdueCount += 1;
            }
        });

        return {
            outstanding:
                this.cleanFinancialNumber(outstanding),
            overdueCount
        };
    }

    /* ========================================================
       RECENT FINANCIAL ACTIVITY
       GL Journal is the final accounting trail for AP/AR/GLJ.
    ======================================================== */
    buildRecentActivities(journals = [], details = []) {

        const totalByJournal = new Map();

        this.normalizePostings(details)
            .forEach(posting => {

                const key = String(
                    posting.journal_id
                );

                const current =
                    totalByJournal.get(key)
                    || 0;

                totalByJournal.set(
                    key,
                    current
                    + this.toNumber(posting.debit)
                );
            });

        return [...journals]
            .sort((a, b) => {
                const dateA = this.getJournalDate(a) || "";
                const dateB = this.getJournalDate(b) || "";

                if (dateA !== dateB) {
                    return dateB.localeCompare(dateA);
                }

                return String(b?.journal_no || "")
                    .localeCompare(
                        String(a?.journal_no || "")
                    );
            })
            .slice(0, 8)
            .map(journal => ({
                date:
                    this.getJournalDate(journal),
                module:
                    this.detectJournalSource(journal),
                document:
                    journal?.journal_no || "-",
                description:
                    journal?.description || "-",
                amount:
                    totalByJournal.get(
                        String(journal?.id)
                    ) || 0,
                status:
                    journal?.status || "-"
            }));
    }

    detectJournalSource(journal) {

        const explicit =
            journal?.source
            || journal?.source_module
            || journal?.module
            || journal?.reference_type
            || "";

        if (explicit) {
            return String(explicit).toUpperCase();
        }

        const journalNo = String(
            journal?.journal_no || ""
        ).toUpperCase();

        if (journalNo.includes("AP")) {
            return "AP";
        }

        if (journalNo.includes("AR")) {
            return "AR";
        }

        return "GLJ";
    }

    getJournalDate(journal) {
        return String(
            journal?.journal_date
            ?? journal?.accounting_date
            ?? ""
        ).slice(0, 10);
    }

    getTodayISO() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    normalizeStatus(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    cleanFinancialNumber(value) {
        const number = this.toNumber(value);
        return Math.abs(number) < 0.000001
            ? 0
            : number;
    }

    /* ========================================================
       MAIN RENDER
    ======================================================== */
    renderDashboard() {

        const data = this.dashboardData;

        const netProfit = this.toNumber(
            data.netProfit !== undefined
                ? data.netProfit
                : this.toNumber(data.revenue) - this.toNumber(data.expense)
        );

        const revenue = this.toNumber(data.revenue);
        const margin = revenue !== 0
            ? (netProfit / revenue) * 100
            : 0;

        this.setText("dashboard-total-asset", this.formatCurrency(data.totalAsset));
        this.setText("dashboard-total-liability", this.formatCurrency(data.totalLiability));
        this.setText("dashboard-equity", this.formatCurrency(data.equity));
        this.setText("dashboard-net-profit", this.formatCurrency(netProfit));
        this.setText("dashboard-net-margin", this.formatPercent(margin));

        this.setText("dashboard-position-asset", this.formatCurrency(data.totalAsset));
        this.setText("dashboard-position-liability", this.formatCurrency(data.totalLiability));
        this.setText("dashboard-position-equity", this.formatCurrency(data.equity));
        this.setText("dashboard-donut-total", this.formatCurrency(data.totalAsset));

        this.setText("dashboard-bs-asset", this.formatCurrency(data.totalAsset));
        this.setText("dashboard-bs-liability", this.formatCurrency(data.totalLiability));
        this.setText("dashboard-bs-equity", this.formatCurrency(data.equity));

        const difference =
            this.toNumber(data.totalAsset)
            - this.toNumber(data.totalLiability)
            - this.toNumber(data.equity);

        this.setText("dashboard-bs-difference", this.formatCurrency(difference));

        this.setText("dashboard-pl-revenue", this.formatCurrency(data.revenue));
        this.setText("dashboard-pl-expense", this.formatCurrency(data.expense));
        this.setText("dashboard-pl-profit", this.formatCurrency(netProfit));
        this.setText("dashboard-pl-margin", this.formatPercent(margin));

        this.setText("dashboard-ar-outstanding", this.formatCurrency(data.arOutstanding));
        this.setText("dashboard-ap-outstanding", this.formatCurrency(data.apOutstanding));
        this.setText("dashboard-ar-overdue", `${this.toInteger(data.arOverdueCount)} overdue`);
        this.setText("dashboard-ap-overdue", `${this.toInteger(data.apOverdueCount)} overdue`);
        this.setText("dashboard-draft-journal", this.formatInteger(data.draftJournalCount));
        this.setText("dashboard-active-bp", this.formatInteger(data.activeBusinessPartnerCount));

        this.renderProfitStatus(netProfit);
        this.renderPerformanceChart(data.monthly);
        this.renderFinancialPosition(data);
        this.renderInsights(data, netProfit);
        this.renderActivities(data.activities);
    }

    /* ========================================================
       NET PROFIT STATUS
    ======================================================== */
    renderProfitStatus(netProfit) {

        const el = this.el["dashboard-net-profit-status"];
        if (!el) return;

        el.classList.remove("is-negative", "is-neutral");

        if (netProfit > 0) {
            el.innerHTML = '<i class="fa-solid fa-arrow-trend-up"></i> Positive performance';
            return;
        }

        if (netProfit < 0) {
            el.classList.add("is-negative");
            el.innerHTML = '<i class="fa-solid fa-arrow-trend-down"></i> Negative performance';
            return;
        }

        el.classList.add("is-neutral");
        el.innerHTML = '<i class="fa-solid fa-minus"></i> No movement';
    }

    /* ========================================================
       PERFORMANCE CHART
       No external chart library required.
    ======================================================== */
    renderPerformanceChart(monthly = []) {

        const container = this.el["dashboard-performance-chart"];
        if (!container) return;

        const normalized = this.normalizeMonthlyData(monthly);

        const hasValue = normalized.some(item =>
            item.revenue !== 0 || item.expense !== 0 || item.profit !== 0
        );

        if (!hasValue) {
            container.innerHTML = `
                <div class="dashboard-chart-empty">
                    No financial trend data available.
                </div>
            `;
            return;
        }

        const width = 900;
        const height = 220;
        const left = 22;
        const right = 12;
        const top = 12;
        const bottom = 28;
        const chartWidth = width - left - right;
        const chartHeight = height - top - bottom;

        const allValues = normalized.flatMap(item => [
            item.revenue,
            item.expense,
            item.profit
        ]);

        const max = Math.max(...allValues, 1);
        const min = Math.min(...allValues, 0);
        const range = Math.max(max - min, 1);

        const x = index =>
            left + (index * chartWidth / Math.max(normalized.length - 1, 1));

        const y = value =>
            top + ((max - value) / range) * chartHeight;

        const points = key =>
            normalized
                .map((item, index) => `${x(index)},${y(item[key])}`)
                .join(" ");

        let grid = "";
        for (let i = 0; i <= 4; i++) {
            const gy = top + (chartHeight * i / 4);
            grid += `<line class="dashboard-chart-grid" x1="${left}" y1="${gy}" x2="${width-right}" y2="${gy}"></line>`;
        }

        const labels = normalized.map((item, index) => `
            <text class="dashboard-chart-label"
                  x="${x(index)}"
                  y="${height - 7}"
                  text-anchor="middle">${this.escapeHTML(item.label)}</text>
        `).join("");

        const pointHtml = key => normalized.map((item, index) => `
            <circle class="dashboard-chart-point-${key}"
                    cx="${x(index)}"
                    cy="${y(item[key])}"
                    r="2.4"></circle>
        `).join("");

        container.innerHTML = `
            <svg class="dashboard-chart-svg"
                 viewBox="0 0 ${width} ${height}"
                 preserveAspectRatio="none"
                 role="img"
                 aria-label="Financial performance trend">
                ${grid}
                <polyline class="dashboard-chart-line-revenue" points="${points("revenue")}"></polyline>
                <polyline class="dashboard-chart-line-expense" points="${points("expense")}"></polyline>
                <polyline class="dashboard-chart-line-profit" points="${points("profit")}"></polyline>
                ${pointHtml("revenue")}
                ${pointHtml("expense")}
                ${pointHtml("profit")}
                ${labels}
            </svg>
        `;
    }

    normalizeMonthlyData(monthly) {

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const source = Array.isArray(monthly) ? monthly : [];

        return monthNames.map((label, index) => {
            const item = source[index] || {};
            const revenue = this.toNumber(item.revenue);
            const expense = this.toNumber(item.expense);

            return {
                label: item.label || label,
                revenue,
                expense,
                profit: item.profit !== undefined
                    ? this.toNumber(item.profit)
                    : revenue - expense
            };
        });
    }

    /* ========================================================
       FINANCIAL POSITION DONUT
    ======================================================== */
    renderFinancialPosition(data) {

        const donut = this.el["dashboard-position-donut"];
        if (!donut) return;

        const asset = Math.abs(this.toNumber(data.totalAsset));
        const liability = Math.abs(this.toNumber(data.totalLiability));
        const equity = Math.abs(this.toNumber(data.equity));
        const total = asset + liability + equity;

        if (total === 0) {
            donut.style.background = "conic-gradient(#E8ECF2 0deg 360deg)";
            return;
        }

        const assetDeg = asset / total * 360;
        const liabilityDeg = liability / total * 360;

        donut.style.background = `
            conic-gradient(
                #315BB8 0deg ${assetDeg}deg,
                #EF6B6B ${assetDeg}deg ${assetDeg + liabilityDeg}deg,
                #7C3AED ${assetDeg + liabilityDeg}deg 360deg
            )
        `;
    }

    /* ========================================================
       QUICK INSIGHTS
    ======================================================== */
    renderInsights(data, netProfit) {

        const container = this.el["dashboard-insight-list"];
        if (!container) return;

        const insights = [];

        if (this.toInteger(data.arOverdueCount) > 0) {
            insights.push({
                type: "warning",
                icon: "fa-solid fa-triangle-exclamation",
                title: "Receivable overdue",
                text: `${this.toInteger(data.arOverdueCount)} AR invoice(s) require collection follow-up.`
            });
        }

        if (this.toInteger(data.apOverdueCount) > 0) {
            insights.push({
                type: "danger",
                icon: "fa-solid fa-clock",
                title: "Payable overdue",
                text: `${this.toInteger(data.apOverdueCount)} AP invoice(s) have passed their due date.`
            });
        }

        if (this.toInteger(data.draftJournalCount) > 0) {
            insights.push({
                type: "info",
                icon: "fa-solid fa-book-open",
                title: "Draft journal pending",
                text: `${this.toInteger(data.draftJournalCount)} journal(s) are still waiting for posting.`
            });
        }

        if (netProfit > 0) {
            insights.push({
                type: "success",
                icon: "fa-solid fa-arrow-trend-up",
                title: "Positive YTD result",
                text: `Net profit is ${this.formatCurrency(netProfit)}.`
            });
        }

        if (!insights.length) {
            insights.push({
                type: "info",
                icon: "fa-solid fa-circle-info",
                title: "No financial alert",
                text: "Financial insights will appear automatically when dashboard data is loaded."
            });
        }

        container.innerHTML = insights.slice(0, 4).map(item => `
            <div class="dashboard-insight-item is-${item.type}">
                <div class="dashboard-insight-icon">
                    <i class="${item.icon}"></i>
                </div>
                <div>
                    <strong>${this.escapeHTML(item.title)}</strong>
                    <span>${this.escapeHTML(item.text)}</span>
                </div>
            </div>
        `).join("");
    }

    /* ========================================================
       RECENT ACTIVITY
    ======================================================== */
    renderActivities(activities = []) {

        const tbody = this.el["dashboard-activity-tbody"];
        if (!tbody) return;

        if (!Array.isArray(activities) || !activities.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="dashboard-empty-state">
                        <i class="fa-regular fa-folder-open"></i>
                        <span>No recent financial activity.</span>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = activities.slice(0, 8).map(row => `
            <tr>
                <td>${this.escapeHTML(this.formatDate(row.date))}</td>
                <td>${this.escapeHTML(row.module || "-")}</td>
                <td>${this.escapeHTML(row.document || row.document_no || "-")}</td>
                <td>${this.escapeHTML(row.description || "-")}</td>
                <td class="text-end">${this.escapeHTML(this.formatCurrency(row.amount))}</td>
                <td class="text-center">
                    ${this.renderStatus(row.status)}
                </td>
            </tr>
        `).join("");
    }

    renderStatus(status) {

        const value = String(status || "-").trim();
        const key = value.toLowerCase();
        const allowed = ["posted", "paid", "draft", "void"];
        const className = allowed.includes(key) ? key : "draft";

        return `
            <span class="dashboard-status-badge ${className}">
                ${this.escapeHTML(value)}
            </span>
        `;
    }

    /* ========================================================
       SYSTEM INFORMATION
    ======================================================== */
    loadSystemInformation() {

        const now = new Date();

        const period = now.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });

        const headerDate = now.toLocaleDateString("en-US", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        this.setText("dashboard-period-label", period);
        this.setText("dashboard-period", period);
        this.setText("dashboard-header-date", headerDate);

        /* Keep these neutral until company/branch settings are connected. */
        this.setText("dashboard-branch", "Main Branch");
        this.setText("dashboard-currency", "IDR");
    }

    startClock() {

        const update = () => {
            const now = new Date();
            const value = now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });

            this.setText("dashboard-current-time", value);
        };

        update();

        if (this.clockTimer) {
            clearInterval(this.clockTimer);
        }

        this.clockTimer = setInterval(update, 1000);
    }

    destroy() {
        if (this.clockTimer) {
            clearInterval(this.clockTimer);
            this.clockTimer = null;
        }
    }

    /* ========================================================
       UTILITIES
    ======================================================== */
    setText(id, value) {
        const element = this.el?.[id] || document.getElementById(id);
        if (element) element.textContent = value;
    }

    toNumber(value) {
        const number = Number(value ?? 0);
        return Number.isFinite(number) ? number : 0;
    }

    toInteger(value) {
        return Math.max(0, Math.trunc(this.toNumber(value)));
    }

    formatInteger(value) {
        return this.toInteger(value).toLocaleString("id-ID");
    }

    formatCurrency(value) {
        const number = Math.round(this.toNumber(value));
        return `Rp ${number.toLocaleString("id-ID")}`;
    }

    formatPercent(value) {
        return `${this.toNumber(value).toLocaleString("id-ID", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}%`;
    }

    formatDate(value) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}
