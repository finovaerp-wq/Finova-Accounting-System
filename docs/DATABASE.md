# Database Guide

## Platform

FINOVA menggunakan Supabase PostgreSQL dan Supabase Auth.

## Arsitektur Multi-Company

Database project saat ini telah berkembang menjadi multi-company
architecture.

Komponen utama: - company master/context; - user-company isolation; -
Super Admin company context; - customer configuration layer; -
`finova_current_company_id()` / effective-company pattern; - RLS per
business table; - tenant guard; - audit log; - secure global Bank Master
policy.

## Runtime Tables dari Core

`assets/js/core/supabase.js` mendefinisikan:

### Master

-   `mst_users`
-   `mst_business_partner`
-   `mst_business_partner_bank`
-   `mst_term_of_payment`
-   `mst_bank`
-   `mst_chart_of_accounts`
-   `mst_taxes`

### Transaction

-   `trx_gl_journal`
-   `trx_gl_journal_detail`
-   `trx_account_payable`
-   `trx_account_payable_detail`
-   `trx_account_receivable`
-   `trx_account_receivable_detail`
-   `trx_account_receivable_payment`
-   `trx_ap_payment`
-   `trx_ar_payment`

Fixed Asset service juga mereferensikan: - `mst_fixed_asset_category` -
`mst_fixed_asset` - `trx_fixed_asset_depreciation`

## Relationship Konseptual

``` text
Company / Effective Company
  ↓
tenant-aware master & transactions

mst_business_partner
  ├── top_id → mst_term_of_payment
  └── 1:N → mst_business_partner_bank

trx_account_payable
  ├── vendor_id → mst_business_partner
  └── 1:N → trx_account_payable_detail

trx_account_receivable
  ├── customer_id → mst_business_partner
  └── 1:N → trx_account_receivable_detail

trx_gl_journal
  └── 1:N → trx_gl_journal_detail

mst_fixed_asset_category
  └── mst_fixed_asset
        └── trx_fixed_asset_depreciation
              └── GL Journal integration
```

Exact FK/constraint harus selalu diverifikasi terhadap live Supabase
schema sebelum destructive migration.

## Migration Repository Saat Ini

Project memiliki versioned migrations:

``` text
001 mst_term_of_payment
002 mst_business_partner
003 upgrade_business_partner
004 FINOVA Control Center tahap 2
005 multi-company master tahap 3
006 user management multi-company isolation
007 customer configuration layer
008 super admin company context
009 customer config effective company
010 RLS business partner
011 RLS business partner bank
012 RLS chart of accounts
013 RLS taxes
014 RLS accounting period
015 RLS accounting period history
016 RLS account payable
017 RLS account payable detail
018 RLS AP payment
019 RLS AP payment batch
020 RLS account receivable
021 RLS account receivable detail
022 RLS AR payment
023 RLS GL journal
024 RLS GL journal detail
025 RLS company settings
026 RLS mst_users
027 RLS audit log
028 secure global bank master RLS
029 phase 3 tenant guard
030 transaction tenant guard
031 audit trigger effective company
032 audit writer effective company
033 audit writer UUID effective company
```

Repository juga mempunyai legacy/support SQL: - `business-partner.sql` -
`mst_bank.sql` - `mst_business_partner_bank.sql` - `schema.sql` -
`seed.sql` - index/seed scripts.

## RLS

RLS adalah security boundary utama untuk data tenant. Policy harus
menggunakan effective company context untuk tabel tenant-aware.

Prinsip: - authenticated user hanya mengakses company yang diizinkan; -
`company_id` tidak boleh dipindahkan antar-company melalui update; -
Super Admin harus menggunakan company context yang valid saat mengakses
accounting tenant; - UI hiding/filtering bukan authorization; - Bank
Master diperlakukan sebagai secure global master sesuai migration 028.

## Tenant Guard

Migration 029 dan 030 menyediakan tenant-guard layer tambahan untuk
menjaga konsistensi `company_id` dan mencegah cross-company transaction.
Keberadaan function/trigger aktual tetap harus diverifikasi terhadap
live database setelah deployment migration.

## Audit

Migration 031--033 menangani audit trigger/writer berbasis effective
company. Audit log harus mempertahankan company context dan tidak
membuka akses lintas tenant.

## User Management

Privileged Supabase Auth administration dilakukan melalui:
`supabase/functions/admin-user-management/index.ts`

Service-role key tidak boleh berada di frontend.

## Production Verification

Sebelum release: 1. Verifikasi seluruh migration telah diterapkan ke
project Supabase target. 2. Verifikasi RLS enabled pada seluruh
tenant-aware tables. 3. Test dengan minimal dua company berbeda. 4.
Pastikan user Company A tidak dapat SELECT/INSERT/UPDATE/DELETE Company
B. 5. Test Super Admin tanpa company context dan dengan selected company
context. 6. Test detail rows tidak dapat diarahkan ke header company
lain. 7. Test audit log dan user-management authorization. 8. Cocokkan
live schema dengan service yang dipakai frontend.
