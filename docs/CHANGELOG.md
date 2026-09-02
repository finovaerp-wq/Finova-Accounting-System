# Catatan Perubahan

Semua perubahan penting pada FINOVA Accounting System dicatat dalam file
ini.

Dokumentasi ini diperbarui berdasarkan kondisi project **BACKUP 26
FINISH**.

## \[Belum Dirilis\]

### Dokumentasi

-   Memperbarui Accounting Flow setelah penghapusan module AP Payment
    dan AR Payment standalone.
-   Menjelaskan bahwa payment tetap diproses langsung dari Account
    Payable dan Account Receivable.
-   Memperjelas dasar Accounting Period untuk AP, AR, GL Journal, dan
    payment.

### Diubah

-   AP Payment sekarang diproses langsung dari module Account Payable.
-   AR Payment sekarang diproses langsung dari module Account
    Receivable.
-   AP Payment tetap menggunakan Payment Date sebagai dasar Accounting
    Period.
-   AR Payment tetap menggunakan Payment Date sebagai dasar Accounting
    Period.
-   Logic transaksi payment dan integrasi GL Journal tetap berada di
    dalam Account Payable dan Account Receivable.

### Dihapus

-   Menu AP Payment standalone.
-   Menu AR Payment standalone.
-   Route AP Payment standalone.
-   Route AR Payment standalone.
-   Module standalone `modules/ap-payment`.
-   Module standalone `modules/ar-payment`.

## \[1.0.0-baseline\] - 2026-08-30

### Core

-   SPA Router dengan pemuatan module secara dinamis.
-   Integrasi Supabase Client dan Authentication.
-   Global Sidebar, Topbar, dan Layout.
-   Global Table dan Pagination.

### Master Data

-   User Management.
-   Business Partner dengan tipe Customer, Vendor, dan Employee.
-   Business Partner Bank.
-   Term of Payment.
-   Chart of Accounts.
-   Tax Master.

### Finance

-   Account Payable beserta proses AP Payment di dalam module.
-   Account Receivable beserta proses AR Payment di dalam module.
-   Aging Payable.
-   Aging Receivable.

### Accounting

-   GL Journal dengan status Draft, Posted, dan Void.
-   Source metadata untuk jurnal yang dibuat dari transaksi.
-   Integrasi jurnal AP/AR Invoice dan Payment.

### Report

-   General Ledger.
-   Trial Balance Year.
-   Income Statement.
-   Balance Sheet.
-   Profit & Loss.

## Format Changelog

Untuk versi berikutnya gunakan:

``` text
## [x.y.z] - YYYY-MM-DD

### Ditambahkan
### Diubah
### Diperbaiki
### Dihapus
### Keamanan
```

Gunakan semantic versioning jika memungkinkan:

-   MAJOR --- perubahan arsitektur/data yang tidak kompatibel dengan
    versi sebelumnya.
-   MINOR --- penambahan module atau fitur yang tetap kompatibel.
-   PATCH --- perbaikan yang tetap kompatibel.
