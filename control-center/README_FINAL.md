# FINOVA Control Center — Final Current Phase

Fitur yang aktif pada paket ini:
- Super Admin gate
- Overview KPI
- Company master + activate/suspend
- Subscription creation
- User-to-company assignment
- Logout resmi
- Audit Log database (finova_audit_log) dengan search, filter action, refresh
- Responsive sidebar/topbar

Catatan:
- Link "Buka FINOVA" dihapus dari Control Center karena session Super Admin tidak memiliki tenant company dan tidak boleh diarahkan ke customer app.
- Backup Monitor tetap monitor placeholder sampai backend/scheduled backup job tersedia.
- Audit log memerlukan tabel `public.finova_audit_log` dan RLS Super Admin yang sudah dibuat.
- Modul transaksi customer tetap mengikuti tenant-isolation rollout terpisah.
