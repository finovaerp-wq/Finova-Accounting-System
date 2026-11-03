import { supabase } from "../../assets/js/core/supabase.js";

export class AuditLog {
    constructor() {
        this.root = document.querySelector(".audit-log-page");
        this.logs = [];
        this.filtered = [];
        this.userNames = new Map();
        this.companyNames = new Map();
        this.page = 1;
        this.pageSize = 50;
        this.maxRows = 10000;
        this.batchSize = 500;
        this.channel = null;
        this.refreshTimer = null;
        this.loading = false;
        this.reloadRequested = false;
        // One-shot navigation target from AP/AR. Only Super Admin can read it.
        this.trailTarget = null;
        if (window.finovaIsSuperAdmin === true) {
            try {
                const raw = sessionStorage.getItem("finova-audit-trail-target");
                if (raw) {
                    const target = JSON.parse(raw);
                    if (["account-payable", "account-receivable"].includes(target?.module)
                        && typeof target.recordId === "string" && target.recordId.length <= 128) {
                        this.trailTarget = target;
                    }
                }
            } catch (error) {
                console.warn("FINOVA AUDIT TRAIL TARGET:", error);
            } finally {
                sessionStorage.removeItem("finova-audit-trail-target");
            }
        }


        if (window.finovaIsSuperAdmin !== true) {
            if (this.root) this.root.innerHTML = '<div class="alert alert-danger">Akses Audit Log hanya untuk Super Admin.</div>';
            return;
        }
        this.bindEvents();
        this.load();
        this.subscribeRealtime();
    }

    el(id) { return document.getElementById(id); }

    escape(value) {
        return String(value ?? "").replace(/[&<>"']/g, ch => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[ch]);
    }

    subscribeRealtime() {
        // Realtime publication and SELECT RLS are configured in Supabase.
        // The server remains the source of truth: reload on notification.
        this.channel = supabase.channel(`finova-audit-log-${Date.now()}-${Math.random().toString(36).slice(2)}`)
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'finova_audit_log'
            }, () => this.scheduleReload())
            .subscribe(status => {
                if (status === 'SUBSCRIBED') this.scheduleReload();
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.warn('FINOVA AUDIT LOG REALTIME:', status);
                }
            });
    }

    scheduleReload() {
        if (!this.root?.isConnected) {
            this.destroy();
            return;
        }
        clearTimeout(this.refreshTimer);
        this.refreshTimer = setTimeout(() => this.load(true), 350);
    }

    destroy() {
        clearTimeout(this.refreshTimer);
        if (this.channel) {
            supabase.removeChannel(this.channel);
            this.channel = null;
        }
    }

    async fetchLogs() {
        const records = [];
        for (let offset = 0; offset < this.maxRows; offset += this.batchSize) {
            const size = Math.min(this.batchSize, this.maxRows - offset);
            const { data, error } = await supabase
                .from('finova_audit_log')
                .select('id,created_at,user_uid,company_id,module,table_name,record_id,document_no,action,old_data,new_data,source_module,source_id,source_no,remarks')
                .order('created_at', { ascending: false })
                .order('id', { ascending: false })
                .range(offset, offset + size - 1);
            if (error) throw error;
            records.push(...(data || []));
            if (!data || data.length < size) break;
        }
        return records;
    }

    async load(silent = false) {
        if (this.loading) {
            this.reloadRequested = true;
            return;
        }
        this.loading = true;
        const body = this.el('audit-rows');
        if (!silent && body) body.innerHTML = '<tr><td colspan="7" class="audit-empty">Memuat Audit Log...</td></tr>';
        try {
            this.logs = await this.fetchLogs();

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

            const companyIds = [...new Set(this.logs.map(row => row.company_id).filter(Boolean))];
            if (companyIds.length) {
                const { data: companies, error: companyError } = await supabase
                    .from("finova_companies")
                    .select("id,company_name,legal_name")
                    .in("id", companyIds);
                if (companyError) {
                    console.warn("FINOVA AUDIT LOG COMPANY LOOKUP:", companyError);
                } else {
                    for (const company of (companies || [])) {
                        this.companyNames.set(company.id, company.company_name || company.legal_name || company.id);
                    }
                }
            }

            this.populateFilters();
            if (this.trailTarget) {
                const search = this.el("audit-search");
                if (search) search.value = this.trailTarget.recordId;
                const note = this.el("audit-trail-context");
                if (note) {
                    note.hidden = false;
                    note.textContent = `Audit Trail ${this.trailTarget.module === "account-payable" ? "AP" : "AR"} • Record ID: ${this.trailTarget.recordId}. Hasil mencakup log yang memuat ID ini; relasi lain hanya muncul jika dicatat pada log.`;
                }
                this.trailTarget = null;
            }
            const previousPage = this.page;
            this.applyFilters();
            if (silent) {
                this.page = previousPage;
                this.renderRows();
            }
            const stamp = this.el("audit-loaded-at");
            if (stamp) stamp.textContent = `Diperbarui ${new Date().toLocaleString("id-ID")}`;
        } catch (error) {
            console.error("FINOVA AUDIT LOG LOAD ERROR:", error);
            if (body) body.innerHTML = `<tr><td colspan="7" class="audit-empty">Gagal memuat Audit Log: ${this.escape(error?.message || error)}. Periksa policy/RLS dan migrasi SQL Audit Log.</td></tr>`;
            if (this.el("audit-count")) this.el("audit-count").textContent = "Gagal memuat data";
        } finally {
            this.loading = false;
            if (this.reloadRequested) {
                this.reloadRequested = false;
                this.scheduleReload();
            }
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
                    row.user_uid, row.company_id, this.companyNames.get(row.company_id)
                ].join(" ").toLowerCase();
                if (!haystack.includes(query)) return false;
            }
            return true;
        });
        this.page = 1;
        this.renderRows();
    }

    moduleLabel(row) {
        const key = String(row.module || row.source_module || '').toLowerCase();
        const table = String(row.table_name || '').toLowerCase();
        if (key.includes('payable') || table.includes('payable')) return 'Account Payable';
        if (key.includes('receivable') || table.includes('receivable')) return 'Account Receivable';
        if (key.includes('journal') || table.includes('journal')) return 'GL Journal';
        return String(row.module || row.source_module || 'Modul tidak dicatat').replace(/[_-]/g, ' ');
    }

    activityLabel(row) {
        const action = String(row.action || '').toUpperCase();
        const table = String(row.table_name || '').toLowerCase();
        const detail = table.includes('detail') || String(row.module || '').toLowerCase().includes('detail');
        const noun = detail ? 'detail' : 'data';
        const labels = {INSERT: `Menambahkan ${noun}`, CREATE: `Menambahkan ${noun}`,
            UPDATE: `Mengubah ${noun}`, DELETE: `Menghapus ${noun}`,
            POST: 'Posting transaksi', VOID: 'Membatalkan transaksi',
            REOPEN: 'Membuka kembali periode', CLOSE: 'Menutup periode'};
        return labels[action] || (action ? `${action} ${noun}` : 'Aktivitas tercatat');
    }

    actionLabel(row) {
        const action = String(row.action || '').toUpperCase();
        return ({INSERT:'TAMBAH',CREATE:'TAMBAH',UPDATE:'EDIT',DELETE:'HAPUS',POST:'POST',VOID:'VOID'})[action] || action || 'LAINNYA';
    }

    changedFields(row) {
        const before = row.old_data && typeof row.old_data === 'object' && !Array.isArray(row.old_data) ? row.old_data : {};
        const after = row.new_data && typeof row.new_data === 'object' && !Array.isArray(row.new_data) ? row.new_data : {};
        const ignored = new Set(['updated_at','created_at']);
        return [...new Set([...Object.keys(before),...Object.keys(after)])]
            .filter(k => !ignored.has(k) && JSON.stringify(before[k] ?? null) !== JSON.stringify(after[k] ?? null))
            .map(k => ({name:k,before:before[k],after:after[k]}));
    }

    formatField(value) {
        if (value == null || value === '') return '—';
        if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    renderRows() {
        const body = this.el("audit-rows");
        const total = this.filtered.length;
        const pages = Math.max(1, Math.ceil(total / this.pageSize));
        this.page = Math.min(this.page, pages);
        const start = (this.page - 1) * this.pageSize;
        const visible = this.filtered.slice(start, start + this.pageSize);

        if (body) {
            body.innerHTML = visible.length ? visible.map((row, index) => {
                const action = String(row.action || 'UNKNOWN').toLowerCase();
                const user = this.userNames.get(row.user_uid) || row.user_uid || 'Tidak diketahui';
                const when = row.created_at ? new Date(row.created_at).toLocaleString('id-ID', {dateStyle:'medium',timeStyle:'medium'}) : '—';
                const doc = row.document_no || row.source_no || 'Nomor dokumen tidak dicatat';
                const company = this.companyNames.get(row.company_id) || row.company_id || '—';
                const changes = this.changedFields(row);
                const summary = String(row.action || '').toUpperCase() === 'UPDATE'
                    ? `${changes.length} field berubah` : this.activityLabel(row);
                return `<tr>
                    <td class="audit-no">${start + index + 1}</td>
                    <td class="audit-time">${this.escape(when)}</td>
                    <td class="audit-user">${this.escape(user)}</td>
                    <td>${this.escape(this.moduleLabel(row))}</td>
                    <td class="audit-activity"><span class="audit-action-pill ${this.escape(action)}">${this.escape(this.actionLabel(row))}</span><div class="audit-activity-description">${this.escape(this.activityLabel(row))} · ${this.escape(summary)}</div></td>
                    <td class="audit-document"><strong>${this.escape(doc)}</strong><div class="text-muted">${this.escape(company)}</div></td>
                    <td><button type="button" class="btn btn-sm btn-outline-primary audit-detail-btn" data-audit-id="${this.escape(row.id)}">Lihat Detail</button></td>
                </tr>`;
            }).join('') : '<tr><td colspan="7" class="audit-empty">Tidak ada log yang sesuai filter.</td></tr>';
        }
        if (this.el("audit-count")) this.el("audit-count").textContent = `${total.toLocaleString("id-ID")} aktivitas ditemukan`;
        if (this.el("audit-page-info")) this.el("audit-page-info").textContent = `Halaman ${this.page} dari ${pages} · hingga ${this.maxRows.toLocaleString("id-ID")} log terbaru dimuat`;
        const pageInput = this.el("audit-page-input");
        if (pageInput) {
            pageInput.value = String(this.page);
            pageInput.min = "1";
            pageInput.max = String(pages);
        }
        if (this.el("audit-page-total")) this.el("audit-page-total").textContent = String(pages);
        for (const id of ["audit-first", "audit-prev"]) {
            if (this.el(id)) this.el(id).disabled = this.page <= 1;
        }
        for (const id of ["audit-next", "audit-last"]) {
            if (this.el(id)) this.el(id).disabled = this.page >= pages;
        }
    }

    showDetail(id) {
        const row = this.logs.find(item => item.id === id);
        if (!row) return;
        const modal = this.el('audit-detail-modal');
        const content = this.el('audit-detail-content');
        if (!modal || !content) return;
        const doc = row.document_no || row.source_no || '—';
        const meta = [
            ['Aktivitas', this.activityLabel(row)],
            ['Waktu', row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '—'],
            ['Pengguna', this.userNames.get(row.user_uid) || row.user_uid || '—'],
            ['Perusahaan', this.companyNames.get(row.company_id) || row.company_id || '—'],
            ['Modul', this.moduleLabel(row)],
            ['Nomor dokumen', doc]
        ];
        const changes = this.changedFields(row);
        const action = String(row.action || '').toUpperCase();
        const isUpdate = action === 'UPDATE';
        const table = changes.length ? `<div class="audit-change-wrap"><table class="audit-change-table"><thead><tr><th>Field</th><th>Sebelum</th><th>Sesudah</th></tr></thead><tbody>${changes.map(f => `<tr><td>${this.escape(f.name.replace(/_/g,' '))}</td><td>${this.escape(this.formatField(f.before))}</td><td>${this.escape(this.formatField(f.after))}</td></tr>`).join('')}</tbody></table></div>`
            : '<p class="text-muted">Tidak ada perbedaan field yang tersedia dalam catatan ini.</p>';
        const pretty = value => this.escape(JSON.stringify(value ?? null, null, 2));
        const technical = [
            ['Audit ID',row.id],['User UID',row.user_uid],['Company ID',row.company_id],
            ['Nama tabel',row.table_name],['Record ID',row.record_id],
            ['Action database',row.action],['Source module',row.source_module],
            ['Source ID',row.source_id],['Source no',row.source_no],['Remarks',row.remarks]
        ];
        content.innerHTML = `
            <div class="audit-detail-meta">${meta.map(([label,value]) => `<div><strong>${this.escape(label)}</strong>${this.escape(value)}</div>`).join('')}</div>
            <h3 class="audit-change-title">${isUpdate ? 'Field yang berubah' : 'Data yang tercatat'}</h3>
            ${table}
            <p class="audit-detail-hint">Ini adalah satu catatan perubahan database. Beberapa catatan belum tentu berasal dari satu kali Save karena belum ada ID aktivitas bersama.</p>
            <details class="audit-technical"><summary>Detail teknis dan data mentah (untuk tracing)</summary>
                <div class="audit-detail-meta">${technical.map(([label,value]) => `<div><strong>${this.escape(label)}</strong>${this.escape(value || '—')}</div>`).join('')}</div>
                <div class="audit-detail-grid">
                    <div class="audit-detail-block"><h3>Data Sebelum (old_data)</h3><pre>${pretty(row.old_data)}</pre></div>
                    <div class="audit-detail-block"><h3>Data Sesudah (new_data)</h3><pre>${pretty(row.new_data)}</pre></div>
                </div>
            </details>`;
        modal.hidden = false;
    }

    exportCsv() {
        const columns = ["created_at","user_uid","company_id","module","table_name","record_id","document_no","action","remarks","source_module","source_id","source_no","old_data","new_data"];
        const quote = value => {
            let text = String(value ?? "");
            if (/^[\s]*[=+\-@]/.test(text)) text = "\t" + text;
            return `"${text.replace(/"/g, '""')}"`;
        };
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
        this.el("audit-first")?.addEventListener("click", () => { this.page = 1; this.renderRows(); });
        this.el("audit-last")?.addEventListener("click", () => { this.page = Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); this.renderRows(); });
        const pageInput = this.el("audit-page-input");
        const goToPage = () => {
            const requested = Number(pageInput?.value);
            const pages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
            this.page = Number.isFinite(requested) ? Math.max(1, Math.min(pages, Math.trunc(requested))) : this.page;
            this.renderRows();
        };
        pageInput?.addEventListener("change", goToPage);
        pageInput?.addEventListener("keydown", event => {
            if (event.key === "Enter") { event.preventDefault(); goToPage(); pageInput.blur(); }
        });
        this.el("audit-rows")?.addEventListener("click", event => {
            const button = event.target.closest("[data-audit-id]");
            if (button) this.showDetail(button.dataset.auditId);
        });
        this.el("audit-detail-modal")?.addEventListener("click", event => {
            if (event.target.closest("[data-audit-close]")) this.el("audit-detail-modal").hidden = true;
        });
    }
}
