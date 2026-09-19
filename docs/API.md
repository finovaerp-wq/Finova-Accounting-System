# Internal API / Service Reference

Dokumen ini menjelaskan internal JavaScript service layer FINOVA. Ini
bukan public REST API.

## Supabase Core

File: `assets/js/core/supabase.js`

Exports utama: - `supabase` - `TABLE` - `CONFIG`

Runtime table constants yang saat ini didefinisikan pada core:

``` text
mst_users
mst_business_partner
mst_business_partner_bank
mst_term_of_payment
mst_bank
mst_chart_of_accounts
mst_taxes
trx_gl_journal
trx_gl_journal_detail
trx_account_payable
trx_account_payable_detail
trx_account_receivable
trx_account_receivable_detail
trx_account_receivable_payment
trx_ap_payment
trx_ar_payment
```

Beberapa service, seperti Fixed Asset, juga menggunakan nama tabel
domain secara langsung.

## Core/Context Services

### AuthService

File: `service/auth.service.js`

Authentication, session, login/logout, password/session-related flow.

### CompanyContextService

File: `service/company-context.service.js`

Mendukung company context/effective company workflow pada multi-company
architecture.

### CustomerConfigService

File: `service/customer-config.service.js`

Customer/company configuration layer yang digunakan aplikasi.

## Master Services

### UserService

`service/user.service.js`

Profile/user data untuk UI.

### UserManagementService

`service/user-management.service.js`

User administration. Privileged auth-user operations harus melalui
trusted server-side mechanism/Edge Function.

### BusinessPartnerService

`service/business-partner.service.js`

Business Partner CRUD/search.

### BusinessPartnerBankService

`service/business-partner-bank.service.js`

Rekening bank Business Partner.

### TermOfPaymentService

`service/term-of-payment.service.js`

Term of Payment.

### BankService

`service/bank.service.js`

Bank master/reference.

### ChartOfAccountsService

`service/chart-of-accounts.service.js`

COA CRUD, hierarchy, transactional account selection.

### TaxService

`service/tax-service.js`

Tax master/rate/account mapping.

### AccountingPeriodService

`service/accounting-period.service.js`

Accounting Period dan kontrol period.

## Transaction Services

### AccountPayableService

`service/account-payable.service.js`

AP invoice/header/detail/status dan supporting payment/posting workflow.

### AccountReceivableService

`service/account-receivable.service.js`

AR invoice/header/detail/status dan supporting payment/posting workflow.

### GeneralJournalService

`service/journal.service.js`

GL Journal header/detail dan source-generated journal operations.

### FixedAssetService

`service/fixed-asset.service.js`

Fixed asset category, asset, depreciation, dan GL integration. Service
mereferensikan: - `mst_fixed_asset_category` - `mst_fixed_asset` -
`trx_fixed_asset_depreciation` - GL Journal tables

### CashFlowForecastService

`service/cash-flow-forecast.service.js`

Supporting service untuk Cash Flow Forecast.

## Reporting/Output Services

### FinancialReportService

`service/financial-report.service.js`

Supporting financial reporting logic.

### ExcelExportService

`service/excel-export.service.js`

Client-side Excel export.

### PreviewService

`service/preview.service.js`

HTML preview/report presentation.

## Supabase Edge Function

`supabase/functions/admin-user-management/index.ts`

Digunakan untuk privileged User Management operations.
`SUPABASE_SERVICE_ROLE_KEY` hanya boleh berada pada server-side
environment, tidak di frontend.

## Service Design Rules

1.  Validasi required ID sebelum query.
2.  Database access ditempatkan di service bila service domain tersedia.
3.  Throw technical errors dari service; UI menentukan presentation.
4.  Pertahankan deterministic posting.
5.  Pertahankan source document metadata.
6.  Gunakan satu source of truth untuk status.
7.  Hormati effective company context.
8.  Jangan menjadikan frontend filter sebagai security boundary.
9.  Jangan embed service-role credential di browser.
10. Perubahan schema/service harus diikuti update dokumentasi.
