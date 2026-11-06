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
        this.totalRows = 0;
        this.requestSerial = 0;
        this.userDirectory = [];
        this.moduleOptions = [];
        this.actionOptions = [];
        this.channel = null;
        this.refreshTimer = null;
        this.lastRealtimeRefresh = 0;
        this.realtimeMinIntervalMs = 5000;
        this.loading = false;
        this.reloadRequested = false;
        this.groupView = false;
        this.expandedGroups = new Set();
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
        this.languageListener = () => this.onLanguageChanged();
        window.addEventListener("finova:language-changed", this.languageListener);
        this.bindEvents();
        this.translateStatic();
        this.initialize();
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
        const delay = Math.max(350, this.realtimeMinIntervalMs - (Date.now() - this.lastRealtimeRefresh));
        this.refreshTimer = setTimeout(() => {
            this.lastRealtimeRefresh = Date.now();
            this.load(true);
        }, delay);
    }

    destroy() {
        if (this.languageListener) window.removeEventListener("finova:language-changed", this.languageListener);
        clearTimeout(this.refreshTimer);
        if (this.channel) {
            supabase.removeChannel(this.channel);
            this.channel = null;
        }
    }

    async initialize() {
        // User directory is independent of the current page, so filters remain usable.
        try {
            const { data, error } = await supabase.from("mst_users").select("user_uid,full_name,email").limit(1000);
            if (!error) {
                this.userDirectory = data || [];
                for (const user of this.userDirectory) this.userNames.set(user.user_uid, user.full_name || user.email || user.user_uid);
            }
        } catch (error) { console.warn("FINOVA AUDIT LOG USERS:", error); }
        try {
            // Populate filter choices from recent audit records, not the current 50-row page.
            // For older/custom module values, users can still search by text.
            const {data: choices, error: choiceError} = await supabase.from('finova_audit_log').select('module,action').order('created_at', {ascending:false}).limit(1000);
            if (!choiceError) {
                this.moduleOptions = [...new Set((choices || []).map(r => r.module).filter(Boolean))].sort();
                this.actionOptions = [...new Set((choices || []).map(r => r.action).filter(Boolean))].sort();
            }
        } catch (error) { console.warn('FINOVA AUDIT FILTER OPTIONS:', error); }
        this.populateFilters();
        if (this.trailTarget) {
            const search = this.el("audit-search");
            if (search) search.value = this.trailTarget.recordId;
            const note = this.el("audit-trail-context");
            if (note) {
                note.hidden = false;
                note.textContent = `${this.t("Audit Trail", "Audit Trail")} ${this.trailTarget.module === "account-payable" ? "AP" : "AR"} • Record ID: ${this.trailTarget.recordId}`;
            }
            this.trailTarget = null;
        }
        await this.load();
    }

    filterValues() {
        return {
            from: this.el("audit-from")?.value || "",
            to: this.el("audit-to")?.value || "",
            user: this.el("audit-user")?.value || "",
            module: this.el("audit-module")?.value || "",
            action: this.el("audit-action")?.value || "",
            query: (this.el("audit-search")?.value || "").trim()
        };
    }

    buildQuery(count = false) {
        const f = this.filterValues();
        let q = supabase.from('finova_audit_log').select(
            'id,created_at,user_uid,company_id,module,table_name,record_id,document_no,action,old_data,new_data,source_module,source_id,source_no,activity_id,remarks',
            count ? { count: 'exact' } : undefined
        );
        if (f.from) q = q.gte('created_at', `${f.from}T00:00:00`);
        if (f.to) {
            const next = new Date(`${f.to}T00:00:00Z`);
            next.setUTCDate(next.getUTCDate() + 1);
            q = q.lt('created_at', next.toISOString());
        }
        if (f.user) q = q.eq('user_uid', f.user);
        if (f.module) q = q.eq('module', f.module);
        if (f.action) q = q.eq('action', f.action);
        if (f.query) {
            // Escape PostgREST filter punctuation to prevent filter injection.
            const safe = f.query.replace(/[,%()\\]/g, ' ').trim();
            if (safe) {
                const pattern = `*${safe}*`;
                const cols = ['document_no','record_id','source_no','source_id','remarks','module','table_name','source_module'];
                const parts = cols.map(c => `${c}.ilike.${pattern}`);
                const matchingUsers = this.userDirectory.filter(u => [u.full_name,u.email,u.user_uid].some(v => String(v || '').toLowerCase().includes(safe.toLowerCase()))).map(u => u.user_uid);
                if (matchingUsers.length) parts.push(`user_uid.in.(${matchingUsers.join(',')})`);
                q = q.or(parts.join(','));
            }
        }
        return q.order('created_at', { ascending: false }).order('id', { ascending: false });
    }

    async load(silent = false) {
        if (!this.root?.isConnected) return;
        const serial = ++this.requestSerial;
        this.loading = true;
        const body = this.el('audit-rows');
        if (!silent && body) body.innerHTML = `<tr><td colspan="7" class="audit-empty">${this.t("Memuat Audit Log...","Loading Audit Log...")}</td></tr>`;
        try {
            const start = (this.page - 1) * this.pageSize;
            const query = this.buildQuery(true);
            const { data, count, error } = await query.range(start, start + this.pageSize - 1);
            if (error) throw error;
            if (serial !== this.requestSerial || !this.root?.isConnected) return;
            this.totalRows = count || 0;
            if (this.totalRows && start >= this.totalRows && this.page > 1) {
                this.page = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
                return await this.load(true);
            }
            this.logs = data || [];
            this.filtered = this.logs;
            const ids = [...new Set(this.logs.map(r => r.user_uid).filter(Boolean))].filter(id => !this.userNames.has(id));
            if (ids.length) {
                const {data: users} = await supabase.from('mst_users').select('user_uid,full_name,email').in('user_uid', ids);
                for (const user of users || []) this.userNames.set(user.user_uid, user.full_name || user.email || user.user_uid);
            }
            const companyIds = [...new Set(this.logs.map(r => r.company_id).filter(Boolean))].filter(id => !this.companyNames.has(id));
            if (companyIds.length) {
                const {data: companies} = await supabase.from('finova_companies').select('id,company_name,legal_name').in('id', companyIds);
                for (const company of companies || []) this.companyNames.set(company.id, company.company_name || company.legal_name || company.id);
            }
            if (serial !== this.requestSerial) return;
            this.populateFilters();
            this.renderRows();
            this.translateStatic();
            this.updateLoadedAt(true);
        } catch (error) {
            if (serial !== this.requestSerial) return;
            console.error('FINOVA AUDIT LOG LOAD ERROR:', error);
            if (body) body.innerHTML = `<tr><td colspan="7" class="audit-empty">${this.t('Gagal memuat Audit Log:','Failed to load Audit Log:')} ${this.escape(error?.message || error)}</td></tr>`;
            if (this.el('audit-count')) this.el('audit-count').textContent = this.t('Gagal memuat data','Failed to load data');
        } finally { if (serial === this.requestSerial) this.loading = false; }
    }

    populateFilters() {
        // Do not derive dropdown choices from one page of results.
        const users = this.el('audit-user');
        if (users) {
            const prior = users.value;
            users.innerHTML = `<option value="">${this.t('Semua pengguna','All users')}</option>` + this.userDirectory.map(u => `<option value="${this.escape(u.user_uid)}">${this.escape(u.full_name || u.email || u.user_uid)}</option>`).join('');
            users.value = prior;
        }
        for (const [id, a, b] of [['audit-module','Semua modul','All modules'],['audit-action','Semua aksi','All actions']]) {
            const select = this.el(id);
            if (!select) continue;
            const prior = select.value;
            const values = id === 'audit-module' ? this.moduleOptions : this.actionOptions;
            select.innerHTML = `<option value="">${this.t(a,b)}</option>` + values.map(v => `<option value="${this.escape(v)}">${this.escape(v)}</option>`).join('');
            select.value = prior;
        }
    }

    applyFilters() { this.page = 1; return this.load(); }

    updateLoadedAt(resetTime = false) {
        if (resetTime || !this.lastLoadedAt) this.lastLoadedAt = new Date();
        const stamp = this.el("audit-loaded-at");
        if (stamp) stamp.textContent = `${this.t('Diperbarui', 'Updated')} ${this.lastLoadedAt.toLocaleString(this.isIndonesian() ? 'id-ID' : 'en-US')}`;
    }

    isIndonesian() {
        const lang = String(localStorage.getItem("finova-ui-language") || document.documentElement.lang || "id").toLowerCase();
        return lang.startsWith("id") || lang.startsWith("in");
    }


    t(id, en) { return this.isIndonesian() ? id : en; }

    translateStatic() {
        if (!this.root?.isConnected) return;
        const set = (selector, id, en) => {
            const el = this.root.querySelector(selector);
            if (el) el.textContent = this.t(id, en);
        };
        set('.finova-page-title', 'Audit Log', 'Audit Log');
        set('.finova-page-subtitle', 'FINOVA Admin / Riwayat perubahan transaksi dan aktivitas pengguna', 'FINOVA Admin / Transaction changes and user activity history');
        set('#audit-refresh', 'Segarkan', 'Refresh');
        set('#audit-export', 'Ekspor CSV', 'Export CSV');
        set('.audit-log-security-note span', 'Halaman khusus Super Admin. Riwayat menampilkan log yang sudah tersimpan; aktivitas yang belum dicatat oleh database tidak dapat muncul secara retroaktif.', 'Super Admin only. Saved logs are displayed; unrecorded activity cannot be recovered retroactively.');
        set('#audit-detail-title', 'Detail Aktivitas', 'Activity Details');
        const labels = this.root.querySelectorAll('.audit-filter-grid > label');
        if (labels[0]) { const node = [...labels[0].childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (node) node.textContent = this.t('Mulai tanggal', 'Start date'); }
        if (labels[1]) { const node = [...labels[1].childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (node) node.textContent = this.t('Sampai tanggal', 'End date'); }
        if (labels[2]) { const node = [...labels[2].childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (node) node.textContent = this.t('Pengguna', 'User'); }
        if (labels[3]) { const node = [...labels[3].childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (node) node.textContent = this.t('Modul', 'Module'); }
        if (labels[4]) { const node = [...labels[4].childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (node) node.textContent = this.t('Aksi', 'Action'); }
        if (labels[5]) { const node = [...labels[5].childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (node) node.textContent = this.t('Cari dokumen / record ID / pengguna', 'Search document / record ID / user'); }
        const headers = this.root.querySelectorAll('.audit-table thead th');
        if (headers[0]) headers[0].textContent = this.t('No.', 'No.');
        if (headers[1]) headers[1].textContent = this.t('Waktu', 'Time');
        if (headers[2]) headers[2].textContent = this.t('Pengguna', 'User');
        if (headers[3]) headers[3].textContent = this.t('Modul', 'Module');
        if (headers[4]) headers[4].textContent = this.t('Aktivitas', 'Activity');
        if (headers[5]) headers[5].textContent = this.t('Dokumen', 'Document');
        if (headers[6]) headers[6].textContent = this.t('Detail', 'Details');
        const pages = this.root.querySelectorAll('.audit-pagination-left .finova-pagination-label');
        if (pages[0]) pages[0].textContent = this.t('Halaman','Page');
        if (pages[1]) pages[1].textContent = this.t('dari','of');
        const buttons = [['audit-apply','Terapkan','Apply'],['audit-reset','Reset','Reset']];
        for (const [id, a, b] of buttons) { const el = this.el(id); if (el) { const icon = el.querySelector('i'); el.textContent = ' ' + this.t(a,b); if (icon) el.prepend(icon); } }
        const search = this.el('audit-search');
        if (search) search.placeholder = this.t('Nomor dokumen, record ID, atau pengguna...', 'Document number, record ID, or user...');
        for (const [id,a,b] of [['audit-first','Halaman pertama','First page'],['audit-prev','Halaman sebelumnya','Previous page'],['audit-next','Halaman berikutnya','Next page'],['audit-last','Halaman terakhir','Last page']]) {
            const el=this.el(id); if(el) el.title=this.t(a,b);
        }
        const close = this.root.querySelector('[data-audit-close][aria-label]');
        if (close) close.setAttribute('aria-label',this.t('Tutup','Close'));
        for (const [id,a,b] of [['audit-user','Semua pengguna','All users'],['audit-module','Semua modul','All modules'],['audit-action','Semua aksi','All actions']]) {
            const el=this.el(id); if(el?.options?.length) el.options[0].textContent=this.t(a,b);
        }
    }

    onLanguageChanged() {
        this.translateStatic();
        this.renderRows();
        this.updateLoadedAt();
        const modal=this.el('audit-detail-modal');
        if (modal && !modal.hidden && this.activeDetailId) this.showDetail(this.activeDetailId);
    }

    moduleLabel(row) {
        const key = String(row.module || row.source_module || '').toLowerCase();
        const table = String(row.table_name || '').toLowerCase();
        if (key.includes('payable') || table.includes('payable')) return this.isIndonesian() ? 'Invoice AP' : 'Account Payable';
        if (key.includes('receivable') || table.includes('receivable')) return this.isIndonesian() ? 'Invoice AR' : 'Account Receivable';
        if (key.includes('journal') || table.includes('journal')) return 'GL Journal';
        return String(row.module || row.source_module || 'Modul tidak dicatat').replace(/[_-]/g, ' ');
    }

    activityLabel(row) {
        const action = String(row.action || '').toUpperCase();
        const table = String(row.table_name || '').toLowerCase();
        const detail = table.includes('detail') || String(row.module || '').toLowerCase().includes('detail');
        const noun = detail ? 'detail' : 'data';
        if (!this.isIndonesian()) { const labels = {INSERT:`Added ${noun}`,CREATE:`Added ${noun}`,UPDATE:`Updated ${noun}`,DELETE:`Deleted ${noun}`,POST:'Posted transaction',VOID:'Voided transaction',REOPEN:'Reopened period',CLOSE:'Closed period'}; return labels[action] || (action ? `${action} ${noun}` : 'Activity recorded'); }
        const labels = {INSERT: `Menambahkan ${noun}`, CREATE: `Menambahkan ${noun}`,
            UPDATE: `Mengubah ${noun}`, DELETE: `Menghapus ${noun}`,
            POST: 'Posting transaksi', VOID: 'Membatalkan transaksi',
            REOPEN: 'Membuka kembali periode', CLOSE: 'Menutup periode'};
        return labels[action] || (action ? `${action} ${noun}` : 'Aktivitas tercatat');
    }

    actionLabel(row) {
        const action = String(row.action || '').toUpperCase();
        return (this.isIndonesian() ? {INSERT:'TAMBAH',CREATE:'TAMBAH',UPDATE:'EDIT',DELETE:'HAPUS',POST:'POST',VOID:'VOID'} : {INSERT:'ADD',CREATE:'ADD',UPDATE:'EDIT',DELETE:'DELETE',POST:'POST',VOID:'VOID'})[action] || action || 'LAINNYA';
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
        if (typeof value === 'boolean') return value ? this.t('Ya','Yes') : this.t('Tidak','No');
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    // Exact grouping only for matching activity_id; legacy NULL rows use the
    // existing short-window heuristic. Groups never cross loaded page boundaries.
    auditGroups(rows) {
        const groups = [];
        for (const row of rows) {
            const activityId = String(row.activity_id || '').trim();
            const source = String(row.source_id || '').trim();
            const time = Date.parse(row.created_at || '');
            const last = groups[groups.length - 1];
            const prior = last?.rows[last.rows.length - 1];
            const priorTime = prior ? Date.parse(prior.created_at || '') : NaN;
            const exact = Boolean(activityId && last?.activityId === activityId &&
                String(prior?.company_id || '') === String(row.company_id || ''));
            const approximate = !activityId && !last?.activityId && source &&
                last?.source === source &&
                String(prior?.company_id || '') === String(row.company_id || '') &&
                String(prior?.user_uid || '') === String(row.user_uid || '') &&
                String(prior?.module || '') === String(row.module || '') &&
                Number.isFinite(time) && Number.isFinite(priorTime) &&
                Math.abs(time - priorTime) <= 2000;
            if (exact || approximate) last.rows.push(row);
            else groups.push({activityId, source, rows:[row], exact: Boolean(activityId)});
        }
        return groups;
    }

    ensureGroupToggle() {
        const exportButton = this.el('audit-export');
        if (!exportButton || this.el('audit-group-toggle')) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'audit-group-toggle';
        button.className = 'btn btn-sm btn-outline-secondary';
        button.style.marginRight = '8px';
        button.addEventListener('click', () => {
            this.groupView = !this.groupView;
            this.expandedGroups.clear();
            this.renderRows();
        });
        exportButton.parentElement.insertBefore(button, exportButton);
    }

    renderRows() {
        const body = this.el("audit-rows");
        const total = this.totalRows;
        const pages = Math.max(1, Math.ceil(total / this.pageSize));
        this.page = Math.min(this.page, pages);
        const start = (this.page - 1) * this.pageSize;
        const visible = this.logs;
        this.ensureGroupToggle();
        const toggle = this.el('audit-group-toggle');
        if (toggle) {
            toggle.textContent = this.groupView ? this.t('Tampilan asli', 'Original view') : this.t('Kelompokkan aktivitas', 'Group activities');
            toggle.setAttribute('aria-pressed', String(this.groupView));
        }

        if (body) {
            body.innerHTML = visible.length ? visible.map((row, index) => {
                const action = String(row.action || 'UNKNOWN').toLowerCase();
                const user = this.userNames.get(row.user_uid) || row.user_uid || this.t('Tidak diketahui','Unknown');
                const when = row.created_at ? new Date(row.created_at).toLocaleString(this.isIndonesian() ? 'id-ID' : 'en-US', {dateStyle:'medium',timeStyle:'medium'}) : '—';
                const doc = row.document_no || row.source_no || this.t('Nomor dokumen tidak dicatat','Document number not recorded');
                const company = this.companyNames.get(row.company_id) || row.company_id || '—';
                const changes = this.changedFields(row);
                const summary = String(row.action || '').toUpperCase() === 'UPDATE'
                    ? this.t(`${changes.length} field berubah`,`${changes.length} fields changed`) : this.activityLabel(row);
                return `<tr>
                    <td class="audit-no">${start + index + 1}</td>
                    <td class="audit-time">${this.escape(when)}</td>
                    <td class="audit-user">${this.escape(user)}</td>
                    <td>${this.escape(this.moduleLabel(row))}</td>
                    <td class="audit-activity"><span class="audit-action-pill ${this.escape(action)}">${this.escape(this.actionLabel(row))}</span><div class="audit-activity-description">${this.escape(this.activityLabel(row))} · ${this.escape(summary)}</div></td>
                    <td class="audit-document"><strong>${this.escape(doc)}</strong><div class="text-muted">${this.escape(company)}</div></td>
                    <td><button type="button" class="btn btn-sm btn-outline-primary audit-detail-btn" data-audit-id="${this.escape(row.id)}">${this.t("Lihat Detail","View Details")}</button></td>
                </tr>`;
            }).join('') : `<tr><td colspan="7" class="audit-empty">${this.t('Tidak ada log yang sesuai filter.','No logs match the filters.')}</td></tr>`;
            if (this.groupView && visible.length) {
                const rawRows = Array.from(body.querySelectorAll('tr'));
                const groups = this.auditGroups(visible);
                let position = 0;
                const fragment = document.createDocumentFragment();
                for (const group of groups) {
                    const children = rawRows.slice(position, position + group.rows.length);
                    position += group.rows.length;
                    if (group.rows.length < 2) {
                        for (const child of children) fragment.appendChild(child);
                        continue;
                    }
                    const key = String(group.rows[0].id);
                    const expanded = this.expandedGroups.has(key);
                    const summary = document.createElement('tr');
                    summary.className = 'audit-group-summary';
                    const cell = document.createElement('td');
                    cell.colSpan = 7;
                    cell.style.cssText = 'padding:10px 14px;background:var(--bs-tertiary-bg,#f3f6fb);';
                    const control = document.createElement('button');
                    control.type = 'button';
                    control.className = 'btn btn-sm btn-outline-primary';
                    control.dataset.auditGroup = key;
                    control.setAttribute('aria-expanded', String(expanded));
                    control.textContent = (expanded ? '▾ ' : '▸ ') + (group.exact
                        ? this.t(`${group.rows.length} catatan dalam satu transaksi database`, `${group.rows.length} records in one database transaction`)
                        : this.t(`${group.rows.length} catatan terkait (perkiraan)`, `${group.rows.length} potentially related records`));
                    cell.appendChild(control);
                    const note = document.createElement('span');
                    note.style.marginLeft = '10px';
                    note.textContent = this.moduleLabel(group.rows[0]) + ' · ' + (group.rows[0].source_no || group.rows[0].document_no || group.source || '—') + (group.exact ? ' · Activity ID: ' + group.activityId : '');
                    cell.appendChild(note);
                    summary.appendChild(cell);
                    fragment.appendChild(summary);
                    for (const child of children) {
                        child.hidden = !expanded;
                        fragment.appendChild(child);
                    }
                }
                body.replaceChildren(fragment);
            }
        }
        if (this.el("audit-count")) this.el("audit-count").textContent = this.t(`${total.toLocaleString("id-ID")} aktivitas ditemukan`,`${total.toLocaleString("en-US")} activities found`);
        if (this.el("audit-page-info")) this.el("audit-page-info").textContent = this.t(`Halaman ${this.page} dari ${pages} · seluruh riwayat sesuai filter`, `Page ${this.page} of ${pages} · all matching history`);
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
        this.activeDetailId = id;
        const row = this.logs.find(item => item.id === id);
        if (!row) return;
        const modal = this.el('audit-detail-modal');
        const content = this.el('audit-detail-content');
        if (!modal || !content) return;
        const doc = row.document_no || row.source_no || '—';
        const meta = [
            [this.t('Aktivitas','Activity'), this.activityLabel(row)],
            [this.t('Waktu','Time'), row.created_at ? new Date(row.created_at).toLocaleString(this.isIndonesian() ? 'id-ID' : 'en-US') : '—'],
            [this.t('Pengguna','User'), this.userNames.get(row.user_uid) || row.user_uid || '—'],
            [this.t('Perusahaan','Company'), this.companyNames.get(row.company_id) || row.company_id || '—'],
            [this.t('Modul','Module'), this.moduleLabel(row)],
            [this.t('Nomor dokumen','Document number'), doc]
        ];
        const changes = this.changedFields(row);
        const action = String(row.action || '').toUpperCase();
        const isUpdate = action === 'UPDATE';
        const table = changes.length ? `<div class="audit-change-wrap"><table class="audit-change-table"><thead><tr><th>Field</th><th>${this.t("Sebelum","Before")}</th><th>${this.t("Sesudah","After")}</th></tr></thead><tbody>${changes.map(f => `<tr><td>${this.escape(f.name.replace(/_/g,' '))}</td><td>${this.escape(this.formatField(f.before))}</td><td>${this.escape(this.formatField(f.after))}</td></tr>`).join('')}</tbody></table></div>`
            : `<p class="text-muted">${this.t('Tidak ada perbedaan field yang tersedia dalam catatan ini.','No field differences are available in this record.')}</p>`;
        const pretty = value => this.escape(JSON.stringify(value ?? null, null, 2));
        const technical = [
            ['Audit ID',row.id],['Activity ID',row.activity_id],['User UID',row.user_uid],['Company ID',row.company_id],
            [this.t('Nama tabel','Table name'),row.table_name],['Record ID',row.record_id],
            [this.t('Action database','Database action'),row.action],[this.t('Source module','Source module'),row.source_module],
            [this.t('Source ID','Source ID'),row.source_id],[this.t('Source no','Source no'),row.source_no],[this.t('Remarks','Remarks'),row.remarks]
        ];
        content.innerHTML = `
            <div class="audit-detail-meta">${meta.map(([label,value]) => `<div><strong>${this.escape(label)}</strong>${this.escape(value)}</div>`).join('')}</div>
            <h3 class="audit-change-title">${isUpdate ? this.t('Field yang berubah','Changed fields') : this.t('Data yang tercatat','Recorded data')}</h3>
            ${table}
            <p class="audit-detail-hint">${this.t('Ini adalah satu catatan perubahan database. Activity ID yang sama menandakan satu transaksi database, belum tentu satu kali Save pengguna.','This is one database change record. A shared Activity ID indicates one database transaction, not necessarily one user Save.')}</p>
            <details class="audit-technical"><summary>${this.t('Detail teknis dan data mentah (untuk tracing)','Technical details and raw data (for tracing)')}</summary>
                <div class="audit-detail-meta">${technical.map(([label,value]) => `<div><strong>${this.escape(label)}</strong>${this.escape(value || '—')}</div>`).join('')}</div>
                <div class="audit-detail-grid">
                    <div class="audit-detail-block"><h3>${this.t('Data Sebelum (old_data)','Data Before (old_data)')}</h3><pre>${pretty(row.old_data)}</pre></div>
                    <div class="audit-detail-block"><h3>${this.t('Data Sesudah (new_data)','Data After (new_data)')}</h3><pre>${pretty(row.new_data)}</pre></div>
                </div>
            </details>`;
        modal.hidden = false;
    }

    async exportCsv() {
        const button = this.el('audit-export');
        if (button) button.disabled = true;
        const columns = ['created_at','user_uid','company_id','module','table_name','record_id','document_no','action','remarks','source_module','source_id','source_no','activity_id','old_data','new_data'];
        const quote = value => {
            let text = String(value ?? '');
            if (/^[\s]*[=+\-@]/.test(text)) text = "\t" + text;
            return `"${text.replace(/"/g, '""')}"`;
        };
        try {
            const lines = [columns.join(',')];
            const batch = 500;
            // Export every matching row, including those on other pages.
            for (let offset = 0; ; offset += batch) {
                const q = this.buildQuery(false);
                const {data, error} = await q.range(offset, offset + batch - 1);
                if (error) throw error;
                for (const row of data || []) lines.push(columns.map(key => quote(typeof row[key] === 'object' ? JSON.stringify(row[key]) : row[key])).join(','));
                if (!data || data.length < batch) break;
            }
            const blob = new Blob(['\uFEFF', lines.join('\r\n')], {type:'text/csv;charset=utf-8;'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `FINOVA-Audit-Log-${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(link); link.click(); link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('FINOVA AUDIT LOG CSV:', error);
            alert(this.t('Gagal mengekspor Audit Log: ','Failed to export Audit Log: ') + (error?.message || error));
        } finally { if (button) button.disabled = false; }
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
        this.el("audit-prev")?.addEventListener("click", () => { if (this.page > 1) { this.page--; this.load(); } });
        this.el("audit-next")?.addEventListener("click", () => { if (this.page < Math.ceil(this.totalRows / this.pageSize)) { this.page++; this.load(); } });
        this.el("audit-first")?.addEventListener("click", () => { this.page = 1; this.load(); });
        this.el("audit-last")?.addEventListener("click", () => { this.page = Math.max(1, Math.ceil(this.totalRows / this.pageSize)); this.load(); });
        const pageInput = this.el("audit-page-input");
        const goToPage = () => {
            const requested = Number(pageInput?.value);
            const pages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
            this.page = Number.isFinite(requested) ? Math.max(1, Math.min(pages, Math.trunc(requested))) : this.page;
            this.load();
        };
        pageInput?.addEventListener("change", goToPage);
        pageInput?.addEventListener("keydown", event => {
            if (event.key === "Enter") { event.preventDefault(); goToPage(); pageInput.blur(); }
        });
        this.el("audit-rows")?.addEventListener("click", event => {
            const groupButton = event.target.closest('[data-audit-group]');
            if (groupButton) {
                const key = groupButton.dataset.auditGroup;
                if (this.expandedGroups.has(key)) this.expandedGroups.delete(key);
                else this.expandedGroups.add(key);
                this.renderRows();
                return;
            }
            const button = event.target.closest("[data-audit-id]");
            if (button) this.showDetail(button.dataset.auditId);
        });
        this.el("audit-detail-modal")?.addEventListener("click", event => {
            if (event.target.closest("[data-audit-close]")) this.el("audit-detail-modal").hidden = true;
        });
    }
}
