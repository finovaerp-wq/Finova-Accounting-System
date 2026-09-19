# Catatan Perubahan

Dokumentasi ini diperbarui untuk mencerminkan kondisi project
`FINOVA-PRODUCTION(10)` yang diaudit pada 2026-09-19.

## \[Belum Dirilis\] - 2026-09-19

### Ditambahkan

-   Accounting Period route/service.
-   Fixed Asset route/module/service.
-   Financial Statement route/module dan financial report service.
-   Cash Flow Forecast route/module/service.
-   Company Context service.
-   Customer Configuration Layer.
-   FINOVA Control Center structure.
-   Supabase Edge Function `admin-user-management`.
-   Multi-company database migrations.
-   Effective-company RLS migrations.
-   Tenant guard dan audit migrations.

### Diubah

-   Arsitektur berkembang dari single-company baseline menjadi
    multi-company/effective-company.
-   User Management privileged operations menggunakan server-side Edge
    Function.
-   Payment tetap diproses dari Account Payable/Account Receivable,
    bukan route standalone.
-   Database documentation sekarang mengikuti migration 001--033.
-   Dokumentasi module mengikuti route aktual `FinovaRouter`.

### Keamanan

-   Effective-company RLS tersedia untuk master dan transaction tables.
-   Secure global Bank Master RLS tersedia.
-   Tenant guard layer tersedia.
-   Audit trigger/writer effective-company tersedia.
-   Service-role credential tetap server-side.

### Catatan Audit

-   `assets/js/core/supabase.js` masih mempunyai blok debug
    `getSession()` pada snapshot project yang diaudit; blok tersebut
    dapat dihapus untuk production logging hygiene.
-   `modules/master bank/bank.service.js` perlu memastikan relative
    import ke core Supabase menggunakan path yang benar dari lokasi
    module.
-   Versi komponen core belum seluruhnya menggunakan satu version
    source.

## \[1.0.0-baseline\] - 2026-08-30

### Core

-   SPA Router.
-   Supabase Client/Auth.
-   Sidebar/Topbar/Layout.
-   Global Table/Pagination.

### Master Data

-   User Management.
-   Business Partner.
-   Business Partner Bank.
-   Term of Payment.
-   Chart of Accounts.
-   Tax Master.

### Finance

-   Account Payable.
-   Account Receivable.
-   Aging Payable.
-   Aging Receivable.
-   Payment terintegrasi pada AP/AR.

### Accounting

-   GL Journal.
-   Source metadata.
-   AP/AR invoice/payment journal integration.

### Report

-   General Ledger.
-   Trial Balance Year.
-   Balance Sheet.
-   Profit & Loss.

## Format Changelog

``` text
## [x.y.z] - YYYY-MM-DD
### Ditambahkan
### Diubah
### Diperbaiki
### Dihapus
### Keamanan
```
