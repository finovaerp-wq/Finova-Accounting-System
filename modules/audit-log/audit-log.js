import { supabase } from "../../assets/js/core/supabase.js";

export class AuditLog {
    constructor() {
        this.root = document.querySelector(".audit-log-page");
        this.logs = [];
        this.filtered = [];
        this.userNames = new Map();
        this.page = 1;
        this.pageSize = 50;
        this.maxRows = 10000;

        if (window.finovaIsSuperAdmin !== true) {
            if (this.root) this.root.innerHTML = '<div class="alert alert-danger">Akses Audit Log hanya untuk Super Admin.</div>';
            return;
        }
        this.bindEvents();
        this.load();
    }

    el(id) { return document.getElementById(id); }

    escape(value) {
        return String(value ?? "").replace(/[&<>"']/g, ch => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[ch]);
    }

    async load() {
        const body = this.el("audit-rows");
        if (body) body.innerHTML = '<tr><td colspan="9" class="audit-empty">Memuat Audit Log...</td></tr>';
        try {
            const { data, error } = await supabase
                .from("finova_audit_log")
                .select("id,created_at,user_uid,company_id,module,table_name,record_id,document_no,action,old_data,new_data,source_module,source_id,source_no,remarks")
                .order("created_at", { ascending: false })
                .limit(this.maxRows);
            if (error) throw error;
            this.logs = Array.isArray(data) ? data : [];

            const userIds = [...new Set(this.logs.map(row => row.user_uid).filter(Boolean))];
            if (userIds.length) {
                const { data: users, error: userError } = await supabase
                    .from("mst_users")
                    .select("user_uid,full_name,email")
                    .in("user_uid", userIds);
                if (!userError) {
                    for (const user of (users || [])) {
                        this.userNames.set(user.user_uid, user.full_name || user.email || user.user_uid);
                    }
                }
            }

            this.populateFilters();
            this.applyFilters();
            const stamp = this.el("audit-loaded-at");
            if (stamp) stamp.textContent = `Diperbarui ${new Date().toLocaleString("id-ID")}`;
        } catch (error) {
            console.error("FINOVA AUDIT LOG LOAD ERROR:", error);
            if (body) body.innerHTML = `<tr><td colspan="9" class="audit-empty">Gagal memuat Audit Log: ${this.escape(error?.message || error)}. Periksa policy/RLS dan migrasi SQL Audit Log.</td></tr>`;
            if (this.el("audit-count")) this.el("audit-count").textContent = "Gagal memuat data";
        }
    }

    populateFilters() {
        const setup = (id, values, label) => {
            const select = this.el(id);
            if (!select) return;
            const prior = select.value;
            select.innerHTML = `<option value="">${label}</option>` + values.map(v =>
                `<option value="${this.escape(v)}">${this.escape(v)}</option>`
            ).join("");
            if (values.includes(prior)) select.value = prior;
        };
        setup("audit-user", [...new Set(this.logs.map(r => r.user_uid).filter(Boolean))].sort(), "Semua pengguna");
        setup("audit-module", [...new Set(this.logs.map(r => r.module).filter(Boolean))].sort(), "Semua modul");
        setup("audit-action", [...new Set(this.logs.map(r => r.action).filter(Boolean))].sort(), "Semua action");
    }

    applyFilters() {
        const from = this.el("audit-from")?.value || "";
        const to = this.el("audit-to")?.value || "";
        const user = this.el("audit-user")?.value || "";
        const module = this.el("audit-module")?.value || "";
        const action = this.el("audit-action")?.value || "";
        const query = (this.el("audit-search")?.value || "").trim().toLowerCase();

        this.filtered = this.logs.filter(row => {
            const date = String(row.created_at || "").slice(0, 10);
            if (from && date < from) return false;
            if (to && date > to) return false;
            if (user && row.user_uid !== user) return false;
            if (module && row.module !== module) return false;
            if (action && row.action !== action) return false;
            if (query) {
                const haystack = [
                    row.document_no, row.table_name, row.record_id, row.module, row.action,
                    row.remarks, row.source_module, row.source_no, row.source_id,
                    row.user_uid, row.company_id
                ].join(" ").toLowerCase();
                if (!haystack.includes(query)) return false;
            }
            return true;
        });
        this.page = 1;
        this.renderRows();
    }

    renderRows() {
        const body = this.el("audit-rows");
        const total = this.filtered.length;
        const pages = Math.max(1, Math.ceil(total / this.pageSize));
        this.page = Math.min(this.page, pages);
        const start = (this.page - 1) * this.pageSize;
        const visible = this.filtered.slice(start, start + this.pageSize);

        if (body) {
            body.innerHTML = visible.length ? visible.map(row => {
                const action = String(row.action || "UNKNOWN").toLowerCase();
                const reason = row.remarks || row.new_data?.void_reason || row.old_data?.void_reason || "";
                const user = this.userNames.get(row.user_uid) || row.user_uid || "Tidak diketahui";
                const company = row.company_id || "—";
                const when = row.created_at ? new Date(row.created_at).toLocaleString("id-ID") : "—";
                return `<tr>
                    <td class="audit-time">${this.escape(when)}</td>
                    <td class="audit-user">${this.escape(user)}<div class="text-muted">${this.escape(row.user_uid || "")}</div></td>
                    <td class="audit-company">${this.escape(company)}</td>
                    <td>${this.escape(row.module || "—")}</td>
                    <td><span class="audit-action-pill ${this.escape(action)}">${this.escape(row.action || "—")}</span></td>
                    <td>${this.escape(row.document_no || row.source_no || "—")}</td>
                    <td>${this.escape(row.table_name || "—")}<div class="text-muted">${this.escape(row.record_id || "")}</div></td>
                    <td class="audit-reason">${reason ? this.escape(reason) : '<span class="text-muted">—</span>'}</td>
                    <td><button type="button" class="btn btn-sm btn-outline-primary audit-detail-btn" data-audit-id="${this.escape(row.id)}">Detail</button></td>
                </tr>`;
            }).join("") : '<tr><td colspan="9" class="audit-empty">Tidak ada log yang sesuai filter.</td></tr>';
        }
        if (this.el("audit-count")) this.el("audit-count").textContent = `${total.toLocaleString("id-ID")} aktivitas ditemukan`;
        if (this.el("audit-page-info")) this.el("audit-page-info").textContent = `Halaman ${this.page} dari ${pages} · hingga ${this.maxRows.toLocaleString("id-ID")} log terbaru dimuat`;
        if (this.el("audit-prev")) this.el("audit-prev").disabled = this.page <= 1;
        if (this.el("audit-next")) this.el("audit-next").disabled = this.page >= pages;
    }

    showDetail(id) {
        const row = this.logs.find(item => item.id === id);
        if (!row) return;
        const modal = this.el("audit-detail-modal");
        const content = this.el("audit-detail-content");
        if (!modal || !content) return;
        const meta = [
            ["Waktu", row.created_at ? new Date(row.created_at).toLocaleString("id-ID") : "—"],
            ["Pengguna", this.userNames.get(row.user_uid) || row.user_uid || "—"],
            ["Perusahaan", row.company_id || "—"],
            ["Modul / tabel", `${row.module || "—"} / ${row.table_name || "—"}`],
            ["Action", row.action || "—"],
            ["Nomor dokumen", row.document_no || "—"],
            ["Source", [row.source_module, row.source_no, row.source_id].filter(Boolean).join(" / ") || "—"],
            ["Alasan / Remarks", row.remarks || row.new_data?.void_reason || row.old_data?.void_reason || "Tidak dicatat"]
        ];
        const pretty = value => this.escape(JSON.stringify(value ?? null, null, 2));
        content.innerHTML = `
            <div class="audit-detail-meta">${meta.map(([label, value]) => `<div><strong>${this.escape(label)}</strong>${this.escape(value)}</div>`).join("")}</div>
            <div class="audit-detail-grid">
                <div class="audit-detail-block"><h3>Data Sebelum (old_data)</h3><pre>${pretty(row.old_data)}</pre></div>
                <div class="audit-detail-block"><h3>Data Sesudah (new_data)</h3><pre>${pretty(row.new_data)}</pre></div>
            </div>`;
        modal.hidden = false;
    }

    exportCsv() {
        const columns = ["created_at","user_uid","company_id","module","table_name","record_id","document_no","action","remarks","source_module","source_id","source_no","old_data","new_data"];
        const quote = value => `"${String(value ?? "").replace(/"/g, '""')}"`;
        const csv = [columns.join(","), ...this.filtered.map(row => columns.map(key =>
            quote(typeof row[key] === "object" ? JSON.stringify(row[key]) : row[key])
        ).join(","))].join("\r\n");
        const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `FINOVA-Audit-Log-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    bindEvents() {
        this.el("audit-refresh")?.addEventListener("click", () => this.load());
        this.el("audit-apply")?.addEventListener("click", () => this.applyFilters());
        this.el("audit-reset")?.addEventListener("click", () => {
            ["audit-from","audit-to","audit-user","audit-module","audit-action","audit-search"].forEach(id => {
                const el = this.el(id); if (el) el.value = "";
            });
            this.applyFilters();
        });
        this.el("audit-export")?.addEventListener("click", () => this.exportCsv());
        this.el("audit-prev")?.addEventListener("click", () => { if (this.page > 1) { this.page--; this.renderRows(); } });
        this.el("audit-next")?.addEventListener("click", () => { if (this.page < Math.ceil(this.filtered.length / this.pageSize)) { this.page++; this.renderRows(); } });
        this.el("audit-rows")?.addEventListener("click", event => {
            const button = event.target.closest("[data-audit-id]");
            if (button) this.showDetail(button.dataset.auditId);
        });
        this.el("audit-detail-modal")?.addEventListener("click", event => {
            if (event.target.closest("[data-audit-close]")) this.el("audit-detail-modal").hidden = true;
        });
    }
}
