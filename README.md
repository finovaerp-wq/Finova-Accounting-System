# FINOVA Accounting System

FINOVA Accounting System adalah ERP berbasis web yang berfokus pada
proses keuangan, akuntansi, pelaporan, fixed asset, dan perencanaan cash
flow. Aplikasi dibangun sebagai Single Page Application (SPA)
menggunakan HTML, CSS, JavaScript ES Modules, Bootstrap, dan Supabase
PostgreSQL/Auth.

## Arsitektur Saat Ini

``` text
Browser
  ↓
index.html / login.html
  ↓
FINOVA Core
  ├── AuthService
  ├── Tenant / Company Context
  ├── Sidebar + Topbar
  ├── Workspace Tabs
  └── FinovaRouter
        ↓
Dynamic Module HTML + JavaScript
        ↓
Service Layer
        ↓
Supabase Auth + PostgreSQL + RLS
```

FINOVA menggunakan multi-company architecture. Akses data perusahaan
ditentukan oleh effective company context dan dilindungi oleh Row Level
Security (RLS) pada database.

## Module Aktif

### Dashboard

-   Dashboard

### Master Data

-   User Management
-   Business Partner
-   Chart of Accounts
-   Tax Master
-   Accounting Period

### Finance

-   Account Payable
-   Account Receivable
-   Aging Payable
-   Aging Receivable

### Accounting

-   GL Journal
-   Fixed Asset

### Report

-   General Ledger
-   Trial Balance Year
-   Balance Sheet
-   Profit & Loss
-   Financial Statement
-   Cash Flow Forecast

AP Payment dan AR Payment tidak menggunakan route/module standalone.
Payment diproses dari Account Payable dan Account Receivable
masing-masing.

## Teknologi

-   HTML5
-   CSS3
-   JavaScript ES Modules
-   Bootstrap 5.3.3
-   Font Awesome 6.7.2
-   Google Font Poppins
-   Supabase JavaScript Client
-   Supabase Auth
-   Supabase PostgreSQL
-   PostgreSQL Row Level Security
-   Supabase Edge Functions
-   Vercel untuk deployment web

## Struktur Project

``` text
FINOVA-PRODUCTION/
├── assets/
│   ├── css/
│   ├── images/
│   └── js/
├── control-center/
├── database/
│   ├── migration/
│   ├── seed/
│   └── index/
├── docs/
├── modules/
├── service/
├── shared/
├── supabase/
│   └── functions/
├── index.html
├── login.html
├── forgot-password.html
├── unauthorized.html
└── 404.html
```

## Multi-Company & Security

Project saat ini mempunyai: - company master dan user-company
assignment; - tenant/effective-company context; - Super Admin company
context; - RLS untuk master dan transaction tables; - tenant guard
migrations; - audit log support; - server-side Edge Function untuk
privileged User Management; - secure global Bank Master RLS.

Frontend tidak boleh menyimpan `SUPABASE_SERVICE_ROLE_KEY`. Privileged
operation harus dilakukan melalui trusted backend/Edge Function.

## Alur Akuntansi

``` text
Master Data
   ↓
AP / AR / Fixed Asset / Manual Journal
   ↓
Payment / Depreciation / Posting
   ↓
GL Journal
   ↓
General Ledger
   ↓
Trial Balance
   ↓
Financial Statements
```

GL Journal merupakan pusat integrasi pencatatan akuntansi dan
traceability transaksi.

## Accounting Period

Dasar tanggal transaksi:

``` text
AP Invoice       → Date Received
AR Invoice       → Invoice Date
Manual GL        → Accounting Date
AP Payment       → Payment Date
AR Payment       → Payment Date
Fixed Asset      → tanggal transaksi/depreciation sesuai proses module
```

Transaksi yang memerlukan posting harus mengikuti Accounting Period yang
diizinkan sistem.

## Dokumentasi

-   `INSTALLATION.md` --- instalasi dan konfigurasi.
-   `DEVELOPMENT.md` --- arsitektur dan development rules.
-   `API.md` --- internal JavaScript service reference.
-   `DATABASE.md` --- database, migration, RLS, dan multi-company.
-   `ACCOUNTING-FLOW.md` --- alur akuntansi.
-   `MODULES.md` --- referensi module.
-   `CHANGELOG.md` --- perubahan project.
-   `DEPLOY.txt` --- deployment User Management Edge Function.

## Catatan Produksi

-   Pertahankan struktur sidebar dan global layout.
-   Gunakan Global Table dan Global Pagination.
-   Business Partner transaksi harus sesuai tipe dan status aktif.
-   COA transaksi harus aktif dan `allow_transaction = true`.
-   Laporan akuntansi harus bersumber dari jurnal yang memenuhi status
    posting yang berlaku.
-   Source metadata jurnal harus dipertahankan untuk audit trail.
-   RLS harus tetap aktif; frontend filtering bukan pengganti database
    authorization.
