# Development Guide

## Architecture

FINOVA adalah vanilla JavaScript SPA dengan Supabase backend.

``` text
index.html
  ↓
application/core
  ↓
Auth + Company/Tenant Context
  ↓
Sidebar / Topbar / Workspace
  ↓
FinovaRouter
  ↓
module HTML
  ↓
dynamic ES-module import
  ↓
module class
  ↓
service layer
  ↓
Supabase + RLS
```

Router: `assets/js/core/router.js`.

## Module Convention

``` text
modules/<module-name>/
├── <module-name>.html
├── <module-name>.css
├── <module-name>.js
└── optional modal HTML
```

Class export harus sesuai `className` pada router.

## Service Convention

Database/domain logic ditempatkan pada `service/` bila service tersedia.

Service saat ini antara lain: - auth - user/user-management -
company-context - customer-config - business-partner/bank/TOP - COA -
tax - accounting-period - AP - AR - journal - fixed-asset -
financial-report - cash-flow-forecast - Excel export - preview

## Multi-Company Rule

Semua module tenant-aware harus menghormati effective company context.

Jangan menganggap filter JavaScript sebagai security. Database
RLS/tenant guard harus tetap menjadi enforcement utama.

## UI Rules

Pertahankan: - Poppins; - Bootstrap-compatible controls; - fixed desktop
sidebar; - global table; - global pagination; - page/card header
consistency; - date alignment; - amount formatting/alignment sesuai
FINOVA; - action/status column consistency.

Jangan membuat module-specific CSS yang merusak global table/pagination.

## Data Rules

### Business Partner

-   AP → active Vendor
-   AR → active Customer
-   GL → active Business Partner jika diperlukan

### COA

Transactional selector:

``` text
active
allow_transaction = true
```

### Journal

-   balance sebelum posting;
-   source-generated journal mempertahankan source metadata;
-   Posted/Voided behavior harus konsisten dengan report/audit rules.

### Accounting Period

Tanggal dasar: - AP Invoice → Date Received - AR Invoice → Invoice
Date - GL → Accounting Date - Payment → Payment Date

### Fixed Asset

Depreciation dan journal integration harus traceable ke asset/source
transaction.

## Error Handling

-   Hindari native `alert()`/`confirm()` untuk production UI.
-   Gunakan Bootstrap modal/toast/FINOVA notification.
-   Console untuk technical diagnostics, tetapi jangan mencetak
    sensitive session/token data.
-   User message harus ringkas dan actionable.

## Security

-   Jangan menaruh `SUPABASE_SERVICE_ROLE_KEY` di frontend.
-   Privileged user administration melalui Edge Function.
-   RLS harus diuji menggunakan authenticated non-admin/tenant user.
-   Cross-company isolation wajib diuji.

## Source Control

Recommended:

``` text
main        → stable/deployable
develop     → integration
feature/*   → feature
fix/*       → bug fix
```

## Testing Checklist

Untuk setiap perubahan: 1. initial load; 2. refresh; 3. create; 4. edit;
5. delete/void bila diizinkan; 6. status transition; 7. empty state; 8.
pagination; 9. filter/search; 10. responsive layout; 11. Supabase/RLS
error; 12. cross-module integration; 13. company isolation; 14.
accounting-period validation; 15. source journal traceability.

## Documentation Rule

Perubahan material harus memperbarui: - `MODULES.md` - `API.md` bila
service berubah - `DATABASE.md` bila schema/RLS berubah -
`ACCOUNTING-FLOW.md` bila posting berubah - `CHANGELOG.md` - `README.md`
bila scope/architecture berubah
