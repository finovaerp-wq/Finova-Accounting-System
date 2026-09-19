# Module Reference

Dokumen ini mengikuti route yang saat ini terdaftar pada
`assets/js/core/router.js`.

## Dashboard

**Route:** `dashboard`\
**Class:** `Dashboard`

Landing page ringkasan aktivitas dan informasi akuntansi.

## User Management

**Route:** `user-management`\
**Class:** `UserManagement`\
**Service:** `UserManagementService`

Mengelola user, role/status, company assignment, dan operasi
administratif yang terkait. Operasi privileged menggunakan server-side
Supabase Edge Function.

## Business Partner

**Route:** `business-partner`\
**Class:** `BusinessPartner`\
**Services:** `BusinessPartnerService`, `BusinessPartnerBankService`,
`TermOfPaymentService`

Master Customer, Vendor, Employee, TOP, alamat/kontak, status aktif, dan
rekening bank. Partner inactive tidak digunakan untuk transaksi baru.

## Chart of Accounts

**Route:** `chart-of-accounts`\
**Class:** `ChartOfAccounts`\
**Service:** `ChartOfAccountsService`

Master akun, hierarchy/parent, currency, normal balance, transaction
permission, dan status.

## Tax Master

**Route:** `tax`\
**Class:** `Tax`\
**Service:** `TaxService`

Master tax code/type/rate dan account mapping.

## Accounting Period

**Route:** `accounting-period`\
**Class:** `AccountingPeriod`\
**Service:** `AccountingPeriodService`

Mengelola periode akuntansi dan status periode yang menjadi kontrol
transaksi/posting.

## Account Payable

**Route:** `account-payable`\
**Class:** `AccountPayable`\
**Service:** `AccountPayableService`

Vendor invoice, detail invoice, Tax (+), Tax (-), TOP/due date, status,
payment, dan integrasi GL Journal. AP Payment diproses dari module ini,
bukan route standalone.

## Account Receivable

**Route:** `account-receivable`\
**Class:** `AccountReceivable`\
**Service:** `AccountReceivableService`

Customer invoice, detail, tax, status, payment, dan integrasi GL
Journal. AR Payment diproses dari module ini, bukan route standalone.

## Aging Payable

**Route:** `aging-payable`\
**Class:** `AgingPayable`

Analisis outstanding AP berdasarkan due date/aging bucket.

## Aging Receivable

**Route:** `aging-receivable`\
**Class:** `AgingReceivable`

Analisis outstanding AR berdasarkan due date/aging bucket.

## GL Journal

**Route:** `gl-journal`\
**Class:** `GeneralJournal`\
**Service:** `GeneralJournalService`

Manual/source-generated journal, detail debit-credit, Draft/Posted/Void,
source traceability, export, dan preview.

## Fixed Asset

**Route:** `fixed-asset`\
**Class:** `FixedAsset`\
**Service:** `FixedAssetService`

Mengelola fixed asset category, fixed asset, depreciation transaction,
dan integrasi GL Journal. Service saat ini mereferensikan
`mst_fixed_asset_category`, `mst_fixed_asset`, dan
`trx_fixed_asset_depreciation`.

## General Ledger

**Route:** `general-ledger`\
**Class:** `GeneralLedger`

Ledger per akun dari GL Journal.

## Trial Balance Year

**Route:** `trial-balance-year`\
**Class:** `TrialBalanceYear`

Trial balance tahunan dan rekonsiliasi debit-credit.

## Balance Sheet

**Route:** `balance-sheet`\
**Class:** `BalanceSheet`

Laporan posisi keuangan berdasarkan saldo akuntansi dan klasifikasi COA.

## Profit & Loss

**Route:** `profit-loss`\
**Class:** `ProfitLoss`

Laporan laba rugi berdasarkan saldo akuntansi dan klasifikasi COA.

## Financial Statement

**Route:** `financial-statement`\
**Class:** `FinancialStatement`\
**Service terkait:** `FinancialReportService`

Module laporan keuangan terintegrasi yang tersedia pada router saat ini.

## Cash Flow Forecast

**Route:** `cash-flow-forecast`\
**Class:** `CashFlowForecast`\
**Service:** `CashFlowForecastService`

Module forecast arus kas yang tersedia pada router saat ini.

## Master Bank

Folder `modules/master bank/` dan `service/bank.service.js` tersedia
sebagai bagian master/reference bank. Bank Master juga memiliki RLS
global yang diamankan pada migration database. Module ini tidak
terdaftar sebagai route utama tersendiri pada `FinovaRouter` saat
dokumentasi ini diperbarui.

## Settings

Folder `modules/settings/` tersedia, tetapi bukan route normal pada
`FinovaRouter`. Change Password dan Logout dijalankan sebagai
global/sidebar actions.

## Control Center

Folder `control-center/` tersedia sebagai area administrasi terpisah
dari SPA accounting utama. Struktur saat ini mencakup overview,
companies, users, subscriptions, audit-log, dan backup-monitor
placeholders/services.

## Cross-Module Components

-   Sidebar
-   Topbar
-   Workspace tabs
-   Global Table
-   Global Pagination
-   Excel Export
-   HTML Preview
-   Authentication/session
-   Company/Tenant Context
-   Customer Configuration Layer
-   Shared layout/theme
