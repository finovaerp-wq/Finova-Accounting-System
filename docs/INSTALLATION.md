# Installation Guide

## 1. Requirements

-   Windows 11 atau modern desktop OS
-   Visual Studio Code
-   Chrome/Edge
-   Local static server (mis. VS Code Live Server)
-   Internet untuk CDN/Supabase
-   Supabase project
-   Node.js/npm dan Supabase CLI untuk Edge Function/database workflow
-   Git direkomendasikan
-   Vercel untuk production web deployment

## 2. Project Root

Root project saat ini:

``` text
FINOVA-PRODUCTION/
├── assets/
├── control-center/
├── database/
├── docs/
├── modules/
├── service/
├── shared/
├── supabase/
├── index.html
├── login.html
├── forgot-password.html
├── unauthorized.html
└── 404.html
```

Jalankan aplikasi melalui HTTP server, bukan membuka module HTML
langsung.

## 3. Supabase Frontend Configuration

Client dibuat di: `assets/js/core/supabase.js`

Gunakan project URL dan public/publishable client key.

Security: - service-role key dilarang di frontend; - RLS melindungi
data; - privileged operation melalui Edge Function/backend.

## 4. Database

SQL versioning berada pada: `database/migration/`

Project saat ini memiliki migration 001--033 yang mencakup baseline
master, multi-company, customer configuration, effective-company RLS,
tenant guard, dan audit.

Jangan menjalankan destructive migration tanpa backup dan verifikasi
live schema.

## 5. Run Locally

1.  Buka root di VS Code.
2.  Jalankan Live Server dari `index.html`/`login.html`.
3.  Login dengan Supabase Auth account valid.
4.  Verifikasi company context.
5.  Verifikasi route/module.

## 6. Deploy Edge Function User Management

``` text
supabase login
supabase link --project-ref <PROJECT_REF>
supabase functions deploy admin-user-management
supabase functions list
```

Edge Function: `supabase/functions/admin-user-management/index.ts`

## 7. Authentication & Tenant Check

Verifikasi: - login; - refresh mempertahankan session; - logout; -
unauthorized redirect; - tenant/effective company context; - RLS; -
Super Admin selected-company behavior; - User Management Edge Function.

## 8. Vercel

``` text
Local
→ Git
→ Remote Repository
→ Vercel
→ Deploy
```

Setelah deploy: - cek relative asset/module paths; - cek dynamic
imports; - cek Supabase Auth redirect URLs; - cek favicon/case-sensitive
paths; - cek console untuk unresolved module import.

## 9. Post-Installation Checklist

-   Dashboard load.
-   Sidebar routes sesuai router.
-   User Management bekerja.
-   BP/COA/Tax/Accounting Period load.
-   AP/AR dan payment workflow load.
-   Aging load.
-   GL Journal load.
-   Fixed Asset load.
-   General Ledger/Trial Balance/Balance Sheet/P&L/Financial Statement
    load.
-   Cash Flow Forecast load.
-   Company isolation lulus test.
-   RLS lulus test.
-   Pagination/table tetap sesuai global component.
