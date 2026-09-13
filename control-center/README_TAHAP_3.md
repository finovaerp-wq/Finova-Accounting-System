# FINOVA Control Center — Tahap 3

Tahap 3 mengaktifkan **tenant isolation untuk Master Data** tanpa menyentuh AP, AR, Payment, GL Journal, Aging, atau laporan.

## Tabel yang menjadi tenant-aware

- `mst_business_partner`
- `mst_business_partner_bank`
- `mst_chart_of_accounts`
- `mst_taxes`
- `mst_accounting_period`
- `trx_accounting_period_history`

## Cara kerja

Setiap row mempunyai `company_id`. User customer hanya dapat `SELECT / INSERT / UPDATE / DELETE` data milik `company_id` yang berasal dari `finova_current_company_id()`.

RLS berjalan di database sehingga service lama FINOVA tetap dapat memakai query yang sama. Pada `INSERT`, trigger database akan mengisi `company_id` secara otomatis berdasarkan company user yang login.

## Data lama

Jika saat migration hanya terdapat **1 company**, data lama otomatis diassign ke company tersebut.

Jika sudah terdapat lebih dari 1 company, migration **tidak menebak** pemilik data lama. Jalankan:

```sql
select public.finova_admin_assign_legacy_master_data(
    'COMPANY-UUID-DI-SINI'::uuid
);
```

Lalu cek:

```sql
select * from public.finova_admin_tenant_master_status();
```

Pastikan `unassigned_rows = 0` sebelum mulai membuat data untuk customer kedua.

## Pengujian wajib

1. Login user Company A → buat BP `CUS00001`.
2. Login user Company B → BP Company A tidak boleh terlihat.
3. Company B boleh membuat `CUS00001` miliknya sendiri.
4. Ulangi untuk COA, Tax dan Accounting Period.
5. Parent COA dan Tax Account dari company lain harus ditolak.
6. User tanpa company harus menerima error dan tidak dapat membuat master data.

## Belum termasuk Tahap 3

- Account Payable
- Account Receivable
- AP/AR Payment
- Aging
- GL Journal
- General Ledger
- Trial Balance
- Balance Sheet
- Profit & Loss

Modul transaksi tersebut dilanjutkan bertahap setelah master tenant isolation lolos pengujian.
