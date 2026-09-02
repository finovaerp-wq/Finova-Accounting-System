# FINOVA Accounting System

FINOVA Accounting System adalah ERP berbasis web yang berfokus pada
proses keuangan dan akuntansi. Aplikasi dibangun sebagai Single Page
Application (SPA) menggunakan HTML, CSS, JavaScript, serta Supabase
PostgreSQL sebagai backend dan database.

## Ruang Lingkup Utama

FINOVA saat ini mencakup:

-   Dashboard
-   Master Data
    -   User Management
    -   Business Partner
    -   Chart of Accounts
    -   Tax Master
-   Finance
    -   Account Payable
    -   Account Receivable
    -   Aging Payable
    -   Aging Receivable
-   Accounting
    -   GL Journal
-   Report
    -   General Ledger
    -   Trial Balance Year
    -   Income Statement
    -   Balance Sheet
    -   Profit & Loss
-   Settings dan Authentication

AP Payment dan AR Payment **tidak menggunakan module standalone**.
Proses payment dilakukan langsung dari module Account Payable dan
Account Receivable masing-masing.

## Teknologi

-   HTML5
-   CSS3
-   JavaScript ES Modules
-   Bootstrap 5.3.3
-   Font Awesome 6.7.2
-   Google Font Poppins
-   Supabase JavaScript Client
-   Supabase PostgreSQL
-   SPA Router (`assets/js/core/router.js`)

## Struktur Project

``` text
FINOVA-ACCOUNTING-SYSTEM/
├── assets/
│   ├── css/
│   ├── images/
│   └── js/
├── database/
├── docs/
├── modules/
├── service/
├── shared/
├── index.html
├── login.html
├── forgot-password.html
├── unauthorized.html
├── 404.html
└── README.md
```

## Dokumentasi

-   `docs/INSTALLATION.md` --- instalasi lokal, konfigurasi Supabase,
    dan deployment.
-   `docs/DEVELOPMENT.md` --- arsitektur, coding convention, dan
    workflow pengembangan.
-   `docs/API.md` --- referensi internal service/API.
-   `docs/DATABASE.md` --- tabel database, relationship, RLS, dan
    migration.
-   `docs/ACCOUNTING-FLOW.md` --- alur AP, AR, GL, Payment, dan Report.
-   `docs/MODULES.md` --- referensi fungsi setiap module.
-   `docs/CHANGELOG.md` --- riwayat perubahan project.

## Module Utama

### Master Data

Master Data menyediakan data dasar yang digunakan oleh transaksi:

``` text
User Management
Business Partner
Chart of Accounts
Tax Master
Term of Payment
```

### Finance

``` text
Account Payable
Account Receivable
Aging Payable
Aging Receivable
```

Payment tidak lagi menjadi module terpisah.

Struktur payment:

``` text
Account Payable
└── AP Invoice
    └── Payment

Account Receivable
└── AR Invoice
    └── Payment
```

Modal payment, data transaksi payment, service payment, dan GL Journal
yang dihasilkan dari payment tetap dipertahankan.

### Accounting

``` text
GL Journal
```

GL Journal menjadi pusat pencatatan transaksi akuntansi, baik jurnal
manual maupun jurnal yang dihasilkan dari AP/AR.

### Report

``` text
General Ledger
Trial Balance Year
Income Statement
Balance Sheet
Profit & Loss
```

## SPA Routes

Route utama aplikasi mencakup:

``` text
dashboard
user-management
business-partner
chart-of-accounts
tax
account-payable
account-receivable
aging-payable
aging-receivable
gl-journal
general-ledger
trial-balance-year
income-statement
balance-sheet
profit-loss
```

Route standalone berikut sudah tidak digunakan:

``` text
ap-payment
ar-payment
```

## Arsitektur Payment

Payment merupakan bagian dari transaksi sumbernya.

### AP Payment

AP Payment dibuka dan diproses dari Account Payable.

``` text
AP Invoice
→ Payment
→ Payment Date
→ validasi Accounting Period
→ simpan pembayaran
→ update outstanding/status AP
→ generate GL Journal Payment
```

### AR Payment

AR Payment dibuka dan diproses dari Account Receivable.

``` text
AR Invoice
→ Payment
→ Payment Date
→ validasi Accounting Period
→ simpan pembayaran
→ update outstanding/status AR
→ generate GL Journal Payment
```

Penghapusan module standalone AP Payment dan AR Payment **tidak berarti
menghapus logic payment**.

## Accounting Period

Dasar tanggal Accounting Period adalah:

``` text
AP Invoice  → Date Received
AR Invoice  → Invoice Date
GL Journal  → Accounting Date
AP Payment  → Payment Date
AR Payment  → Payment Date
```

Hanya periode dengan status `Open` yang boleh menerima transaksi.

Contoh jika periode aktif adalah September 2026:

``` text
Agustus 2026   → Closed     → BLOK
September 2026 → Open       → BOLEH
Oktober 2026   → belum Open → BLOK
```

Dengan demikian:

-   AP memvalidasi periode berdasarkan Date Received.
-   AR memvalidasi periode berdasarkan Invoice Date.
-   GL Journal memvalidasi periode berdasarkan Accounting Date.
-   AP Payment memvalidasi periode berdasarkan Payment Date.
-   AR Payment memvalidasi periode berdasarkan Payment Date.

## Integrasi Akuntansi

FINOVA menggunakan GL Journal sebagai pusat integrasi akuntansi.

Transaksi sumber dapat menghasilkan jurnal dengan metadata seperti:

``` text
source_module
source_document_type
source_document_id
source_invoice_no
source_po_no
description
journal_date
status
```

Metadata tersebut digunakan untuk menjaga traceability antara GL Journal
dengan transaksi AP/AR asal.

## Catatan Pengembangan

-   Pertahankan struktur Sidebar agar konsisten di seluruh module.
-   Gunakan Global Table, Pagination, Typography, dan Layout Component.
-   Account selector transaksi harus menggunakan Chart of Accounts yang
    aktif dan mengizinkan transaksi.
-   Business Partner berstatus Inactive tidak boleh digunakan untuk
    transaksi baru.
-   Klasifikasi laporan keuangan sebaiknya menggunakan
    grouping/hierarchy Chart of Accounts yang eksplisit.
-   Supabase Row Level Security harus tetap aktif dan diuji untuk
    authenticated user.
-   Jangan menghapus payment modal, payment service logic, tabel
    payment, atau integrasi payment ke GL Journal hanya karena module
    payment standalone telah dihapus.

## Status

Dokumentasi ini telah diperbarui untuk mencerminkan arsitektur FINOVA
setelah penghapusan module standalone AP Payment dan AR Payment,
sementara proses pembayaran tetap terintegrasi di dalam Account Payable
dan Account Receivable.
