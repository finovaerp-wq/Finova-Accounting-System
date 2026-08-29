# FINOVA Accounting System

FINOVA Accounting System adalah aplikasi web **ERP Accounting & Finance** berbasis Single Page Application (SPA) yang berfokus pada proses akuntansi, transaksi keuangan, general ledger, account payable, account receivable, aging, pembayaran, serta laporan keuangan.

Project ini menggunakan **HTML, CSS, JavaScript ES Modules, Bootstrap, Font Awesome, Tom Select, SheetJS/XLSX, dan Supabase (PostgreSQL + Authentication)**. Frontend dirancang modular dengan router internal yang memuat file HTML dan JavaScript setiap module secara dinamis.

> Dokumen ini dibuat berdasarkan struktur dan source code pada `FINOVA-ACCOUNTING-SYSTEM-LOCKED FINAL - BACKUP 26 FINISH`.

---

## 1. Tujuan Project

FINOVA dibuat sebagai sistem accounting berbasis web dengan alur utama:

```text
Master Data
    ↓
Account Payable / Account Receivable
    ↓
GL Journal
    ↓
Payment / Settlement
    ↓
General Ledger
    ↓
Trial Balance
    ↓
Financial Report
```

Fokus utama project adalah menjaga transaksi keuangan terintegrasi sampai menghasilkan laporan accounting.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript ES Modules |
| UI | Bootstrap 5, Font Awesome, Poppins |
| Searchable Select | Tom Select |
| Excel Export | SheetJS / XLSX |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Architecture | SPA + Dynamic Module Router |
| Deployment Target | Static/Web Hosting seperti Vercel |

Tidak terdapat framework frontend seperti React/Vue/Angular dan tidak terdapat Node build pipeline wajib pada source project ini.

---

## 3. Entry Point Aplikasi

File utama:

```text
index.html
login.html
forgot-password.html
unauthorized.html
404.html
```

`index.html` memuat global theme, layout, component CSS, module CSS, library eksternal, dan container utama:

```html
<div id="finova-app"></div>
```

Application bootstrap berada di:

```text
assets/js/core/app.js
```

Urutan utama startup:

```text
DOMContentLoaded
    ↓
FinovaApp
    ↓
AuthService.initialize()
    ↓
Render Layout
    ↓
Initialize Sidebar + Topbar
    ↓
Initialize Router
    ↓
Load Dashboard
```

---

## 4. Application Architecture

Struktur utama aplikasi:

```text
FINOVA ACCOUNTING SYSTEM
│
├── index.html
├── login.html
├── forgot-password.html
├── unauthorized.html
├── 404.html
│
├── assets/
│   ├── css/
│   ├── images/
│   └── js/
│
├── modules/
├── service/
├── database/
├── shared/
└── docs/
```

### Core Layer

```text
assets/js/core/
├── api.js
├── app.js
├── auth.js
├── config.js
├── protected-route.js
├── router.js
├── storage.js
├── supabase.js
├── utils.js
└── vendor.js
```

### Component Layer

```text
assets/js/components/
├── datatable.js
├── footer.js
├── loading.js
├── modal.js
├── sidebar.js
├── toast.js
└── topbar.js
```

### Service Layer

```text
service/
├── account-payable.service.js
├── account-receivable.service.js
├── auth.service.js
├── bank.service.js
├── business-partner-bank.service.js
├── business-partner.service.js
├── chart-of-accounts.service.js
├── excel-export.service.js
├── journal.service.js
├── preview.service.js
├── tax-service.js
├── term-of-payment.service.js
├── user-management.service.js
└── user.service.js
```

---

# 5. Module Routing

Router berada di:

```text
assets/js/core/router.js
```

Setiap route memiliki:

```javascript
{
    title: "Module Name",
    html: "modules/module/module.html",
    js: "modules/module/module.js",
    className: "ModuleClass"
}
```

Router memuat HTML dengan `fetch()`, kemudian meng-import JavaScript module secara dinamis, membuat instance class, lalu menjalankan `init()` jika tersedia.

| Route | Module | Class |
|---|---|---|
| `dashboard` | Dashboard | `Dashboard` |
| `user-management` | User Management | `UserManagement` |
| `business-partner` | Business Partner | `BusinessPartner` |
| `chart-of-accounts` | Chart Of Accounts | `ChartOfAccounts` |
| `tax` | Tax Master | `Tax` |
| `account-payable` | Account Payable | `AccountPayable` |
| `account-receivable` | Account Receivable | `AccountReceivable` |
| `aging-payable` | Aging Payable | `AgingPayable` |
| `aging-receivable` | Aging Receivable | `AgingReceivable` |
| `gl-journal` | GL Journal | `GeneralJournal` |
| `ap-payment` | AP Payment | `APPayment` |
| `ar-payment` | AR Payment | `ARPayment` |
| `general-ledger` | General Ledger | `GeneralLedger` |
| `trial-balance-year` | Trial Balance Year | `TrialBalanceYear` |
| `income-statement` | Income Statement | `IncomeStatement` |
| `balance-sheet` | Balance Sheet | `BalanceSheet` |
| `profit-loss` | Profit & Loss | `ProfitLoss` |

---

# 6. Module Documentation

## 6.1 Dashboard

**Folder:**

```text
modules/dashboard/
├── dashboard.html
├── dashboard.css
└── dashboard.js
```

**Class:** `Dashboard`

Dashboard mengambil data live dari database dan menyusun ringkasan accounting/finance. Source saat ini memiliki fungsi untuk:

- mengambil data secara aman dari Supabase;
- normalisasi posting journal;
- menentukan kelompok akun berdasarkan data account;
- menghitung outstanding;
- membangun recent activity;
- menampilkan financial position;
- menampilkan performance chart;
- menampilkan insight;
- menampilkan status transaksi dan system information.

Dashboard bukan sekadar halaman statis; module memiliki proses pengumpulan dan normalisasi data accounting.

---

## 6.2 User Management

**Folder:**

```text
modules/user-management/
├── user-management.html
├── user-management.css
└── user-management.js
```

**Class:** `UserManagement`

**Service:** `service/user-management.service.js`

Fitur source saat ini meliputi:

- load user;
- filter user;
- pagination;
- Add User;
- View User;
- Edit User;
- Delete User;
- role/access check;
- Manager authorization;
- read-only mode;
- Bootstrap modal;
- success/error feedback.

Module memiliki logika akses UI melalui `loadAccess()`, `applyAccessUI()`, dan `ensureManager()`.

---

## 6.3 Business Partner

**Folder:**

```text
modules/business-partner/
├── business-partner.html
├── business-partner-modal.html
├── business-partner.css
├── business-partner.js
└── bank-grid.js
```

**Class utama:** `BusinessPartner`  
**Sub-component:** `BankGrid`

**Services:**

```text
business-partner.service.js
business-partner-bank.service.js
term-of-payment.service.js
bank.service.js
excel-export.service.js
preview.service.js
```

Business Partner menangani master Customer, Vendor, dan Employee beserta informasi bank dan Term of Payment.

Fitur yang tersedia di source:

- Add/Edit/Delete Business Partner;
- search/filter;
- pagination;
- status Active/Inactive;
- Term of Payment;
- bank grid;
- Excel export;
- HTML preview;
- validation;
- success/error handling.

Data Business Partner menjadi referensi untuk transaksi AP, AR, dan GL Journal.

---

## 6.4 Chart Of Accounts

**Folder:**

```text
modules/chart-of-accounts/
├── chart-of-accounts.html
├── chart-of-accounts-modal.html
├── chart-of-accounts.css
└── chart-of-accounts.js
```

**Class:** `ChartOfAccounts`

**Service:** `service/chart-of-accounts.service.js`

COA merupakan master akun utama yang digunakan oleh journal dan financial report.

Fitur source meliputi:

- Add/Edit/Delete account;
- parent account hierarchy;
- transactional account control;
- active/inactive account;
- pagination;
- search/filter;
- Excel export;
- HTML preview;
- previous/next navigation;
- validation.

---

## 6.5 Tax Master

**Folder:**

```text
modules/tax/
├── tax.html
├── tax.css
└── tax.js
```

**Class:** `Tax`

**Service:** `service/tax-service.js`

Tax Master menyediakan konfigurasi pajak yang digunakan pada transaksi accounting, terutama AP dan AR.

Fitur source:

- Add/Edit/Delete Tax;
- filter dan search;
- pagination;
- COA selection;
- Tax (+) / Tax (-);
- tax rate;
- tax account dan offset account;
- status;
- Excel export;
- HTML preview.

---

# 7. Finance Modules

## 7.1 Account Payable

**Folder:**

```text
modules/account-payable/
├── account-payable.html
├── account-payable.css
├── account-payable.js
├── account-payable-modal.html
├── account-payable-detail-modal.html
└── account-payable-payment-modal.html
```

**Class:** `AccountPayable`

**Services:**

```text
account-payable.service.js
journal.service.js
tax-service.js
excel-export.service.js
preview.service.js
```

Account Payable menangani invoice Vendor dari Draft sampai pembayaran dan posting journal.

Fitur source saat ini mencakup:

- Add/Edit/View/Delete invoice;
- Vendor selection;
- Term of Payment;
- due date calculation;
- invoice details;
- quantity × unit price calculation;
- Tax (+);
- Tax (-);
- subtotal/tax/withholding/total summary;
- Draft/Post/Complete/Void flow;
- payment creation;
- payment history;
- duplicate invoice;
- printing;
- Excel export;
- HTML preview;
- pagination dan filter;
- GL Journal generation.

### AP Journal Integration

Source memiliki:

```text
generateAPJournal()
generateAPPaymentJournal()
```

Artinya invoice dan payment AP dapat menghasilkan journal yang diteruskan ke General Ledger.

---

## 7.2 Account Receivable

**Folder:**

```text
modules/account-receivable/
├── account-receivable.html
├── account-receivable.css
├── account-receivable.js
├── account-receivable-modal.html
├── account-receivable-detail-modal.html
└── account-receivable-payment-modal.html
```

**Class:** `AccountReceivable`

**Services:**

```text
account-receivable.service.js
journal.service.js
tax-service.js
excel-export.service.js
preview.service.js
```

Account Receivable menangani invoice Customer dan penerimaan pembayaran.

Fitur source:

- Customer selection;
- invoice header/detail;
- due date calculation;
- Tax (+) dan Tax (-);
- save draft;
- edit/view/delete invoice;
- receive payment;
- payment history;
- posting/completion;
- void;
- print;
- Excel export;
- HTML preview;
- pagination dan filter;
- GL Journal generation.

### AR Journal Integration

Source memiliki:

```text
generateARJournal()
generateARPaymentJournal()
```

Artinya invoice AR dan AR Payment terintegrasi dengan journal accounting.

---

## 7.3 Aging Payable

**Folder:**

```text
modules/aging-payable/
├── aging-payable.html
├── aging-payable.css
└── aging-payable.js
```

**Class:** `AgingPayable`

Aging Payable membentuk umur utang Vendor berdasarkan due date dan outstanding invoice.

Fitur source:

- default date filter;
- load AP data;
- Vendor bank information;
- aging bucket calculation;
- filtering;
- totals;
- pagination;
- Excel export;
- HTML preview.

---

## 7.4 Aging Receivable

**Folder:**

```text
modules/aging-receivable/
├── aging-receivable.html
├── aging-receivable.css
└── aging-receivable.js
```

**Class:** `AgingReceivable`

Aging Receivable membentuk umur piutang Customer berdasarkan due date dan outstanding invoice.

Fitur source:

- date filter;
- AR data load;
- Customer bank information;
- aging bucket calculation;
- totals;
- pagination;
- Excel export;
- HTML preview.

---

# 8. Accounting Module

## 8.1 GL Journal

**Folder:**

```text
modules/gl-journal/
├── gl-journal.html
├── gl-journal.css
├── gl-journal.js
├── gl-journal-modal.html
├── gl-journal-modal.css
└── journal-detail-modal.html
```

**Class:** `GeneralJournal`

**Service:** `service/journal.service.js`

GL Journal adalah pusat pencatatan journal system.

Fitur source saat ini sangat lengkap, termasuk:

- Add Journal;
- Edit Journal;
- View Journal;
- Journal detail debit/credit;
- Business Partner per line;
- account searchable dropdown;
- Draft/Post/Void;
- delete confirmation;
- posting confirmation;
- journal balance validation;
- journal source identification;
- AP Invoice source;
- AP Payment source;
- AR Invoice source;
- AR Payment source;
- manual GL Journal source;
- status badge;
- source badge;
- pagination;
- filter by date/status/keyword;
- Excel export;
- HTML preview;
- read-only mode;
- summary total line/debit/credit.

### Journal Source

Journal dapat dikenali melalui kombinasi:

```text
source_module
source_document_type
source_document_id
source_invoice_no
source_po_no
```

Source yang telah didukung di UI:

```text
AP_INVOICE
AP_PAYMENT
AR_INVOICE
AR_PAYMENT
MANUAL / GLJ
```

---

# 9. Payment Modules

## 9.1 AP Payment

**Folder:**

```text
modules/ap-payment/
├── ap-payment.html
├── ap-payment.css
└── ap-payment.js
```

**Class:** `APPayment`

Status implementasi source saat ini: **placeholder/basic initialization**.

JavaScript module hanya menjalankan initialization dasar. Payment AP operasional saat ini lebih banyak berada di flow `Account Payable`, termasuk `generateAPPaymentJournal()` dan payment modal AP.

---

## 9.2 AR Payment

**Folder:**

```text
modules/ar-payment/
├── ar-payment.html
├── ar-payment.css
└── ar-payment.js
```

**Class:** `ARPayment`

Status implementasi source saat ini: **placeholder/basic initialization**.

Flow penerimaan payment AR saat ini lebih banyak berada di module `Account Receivable`, termasuk `generateARPaymentJournal()` dan AR payment modal.

---

# 10. Report Modules

## 10.1 General Ledger

**Folder:**

```text
modules/general-ledger/
├── general-ledger.html
├── general-ledger.css
└── general-ledger.js
```

**Class:** `GeneralLedger`

General Ledger membaca posting journal dan menyusunnya per account.

Fitur source:

- account filter;
- searchable account selector;
- Business Partner load;
- date filtering;
- journal detail load;
- running balance;
- debit/credit totals;
- closing balance;
- pagination;
- Excel export;
- HTML preview.

---

## 10.2 Trial Balance Year

**Folder:**

```text
modules/trial-balance-year/
├── trial-balance-year.html
├── trial-balance-year.css
└── trial-balance-year.js
```

**Class:** `TrialBalanceYear`

Trial Balance Year membentuk balance account berdasarkan posting journal dan monthly period.

Fitur source:

- year selection;
- current report month;
- monthly balance calculation;
- hierarchical account support;
- descendants account filtering;
- totals;
- pagination;
- Excel export;
- HTML preview.

---

## 10.3 Income Statement

**Folder:**

```text
modules/income-statement/
├── income-statement.html
├── income-statement.css
└── income-statement.js
```

**Class:** `IncomeStatement`

Status implementasi JavaScript saat ini: **placeholder/basic initialization**.

Module sudah terdaftar di router, tetapi logic report detail belum terlihat pada source JavaScript current backup.

---

## 10.4 Balance Sheet

**Folder:**

```text
modules/balance-sheet/
├── balance-sheet.html
├── balance-sheet.css
└── balance-sheet.js
```

**Class:** `BalanceSheet`

Fitur source:

- account load;
- account normalization;
- year/month report;
- journal detail load;
- monthly balance calculation;
- hierarchical account support;
- filtering;
- totals;
- pagination;
- Excel export;
- HTML preview.

---

## 10.5 Profit & Loss

**Folder:**

```text
modules/profit-loss/
├── profit-loss.html
├── profit-loss.css
└── profit-loss.js
```

**Class:** `ProfitLoss`

Fitur source:

- year/month reporting;
- account hierarchy;
- journal posting normalization;
- monthly balance calculation;
- account/descendant filter;
- totals;
- pagination;
- Excel export;
- HTML preview.

---

# 11. Settings

Folder:

```text
modules/settings/
├── settings.html
├── settings.css
└── settings.js
```

`settings.js` pada backup ini masih kosong. Pengaturan yang aktif secara global, seperti Change Password dan Logout, ditangani melalui global component/UI dan authentication service.

---

# 12. Bank Master

Terdapat folder:

```text
modules/master bank/
└── bank.service.js
```

Project juga memiliki service global:

```text
service/bank.service.js
```

Bank digunakan oleh Business Partner, aging, dan payment/accounting-related flow.

Folder `modules/master bank` belum terdaftar sebagai route SPA pada router current backup.

---

# 13. Database Tables

Konstanta table berada di:

```text
assets/js/core/supabase.js
```

Table yang direferensikan source:

| Constant | PostgreSQL Table |
|---|---|
| `USERS` | `mst_users` |
| `BUSINESS_PARTNER` | `mst_business_partner` |
| `BUSINESS_PARTNER_BANK` | `mst_business_partner_bank` |
| `TERM_OF_PAYMENT` | `mst_term_of_payment` |
| `BANK` | `mst_bank` |
| `CHART_OF_ACCOUNTS` | `mst_chart_of_accounts` |
| `TAX` | `mst_taxes` |
| `GL_JOURNAL` | `trx_gl_journal` |
| `GL_JOURNAL_DETAIL` | `trx_gl_journal_detail` |
| `ACCOUNT_PAYABLE` | `trx_account_payable` |
| `ACCOUNT_PAYABLE_DETAIL` | `trx_account_payable_detail` |
| `ACCOUNT_RECEIVABLE` | `trx_account_receivable` |
| `ACCOUNT_RECEIVABLE_DETAIL` | `trx_account_receivable_detail` |
| `ACCOUNT_RECEIVABLE_PAYMENT` | `trx_account_receivable_payment` |
| `AP_PAYMENT` | `trx_ap_payment` |
| `AR_PAYMENT` | `trx_ar_payment` |

Database SQL berada di:

```text
database/
├── migration/
├── seed/
└── index/
```

File migration/seed yang tersedia antara lain:

```text
schema.sql
seed.sql
business-partner.sql
mst_business_partner_bank.sql
mst_bank.sql
001_mst_term_of_payment.sql
002_mst_business_partner.sql
003_upgrade_business_partner.sql
seed_term_of_payment.sql
001_business_partner_index.sql
```

---

# 14. Authentication

Authentication utama berada di:

```text
service/auth.service.js
assets/js/core/auth.js
assets/js/core/protected-route.js
```

Sebelum layout aplikasi dirender, `FinovaApp` memanggil authentication initialization. Jika session tidak valid, browser diarahkan ke:

```text
login.html
```

Logout juga kembali ke `login.html`.

---

# 15. Global UI System

CSS global dibagi menjadi beberapa layer.

## Theme

```text
assets/css/theme.css
```

## Global

```text
assets/css/global/
├── animation.css
├── reset.css
├── responsive.css
├── typography.css
├── utilities.css
└── variables.css
```

## Layout

```text
assets/css/layout/
├── footer.css
├── layout.css
├── sidebar.css
└── topbar.css
```

## Components

```text
assets/css/components/
├── alert.css
├── badge.css
├── breadcrumb.css
├── button.css
├── card.css
├── dropdown.css
├── empty.css
├── form.css
├── loading.css
├── modal.css
├── pagination.css
├── search.css
├── table.css
└── toast.css
```

Komponen global dipakai agar visual antar module konsisten.

---

# 16. Export & Preview

Project memiliki reusable service:

```text
service/excel-export.service.js
service/preview.service.js
```

Module yang telah memiliki fungsi export/preview pada source antara lain:

```text
Business Partner
Chart Of Accounts
Tax Master
Account Payable
Account Receivable
Aging Payable
Aging Receivable
GL Journal
General Ledger
Trial Balance Year
Balance Sheet
Profit & Loss
```

---

# 17. Project Folder Structure

```text
FINOVA-ACCOUNTING-SYSTEM/
│
├── index.html
├── login.html
├── forgot-password.html
├── unauthorized.html
├── 404.html
├── README.md
├── LICENSE
│
├── assets/
│   ├── css/
│   │   ├── components/
│   │   ├── global/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── login.css
│   │   └── theme.css
│   │
│   ├── images/
│   └── js/
│       ├── components/
│       ├── core/
│       ├── helpers/
│       ├── ui/
│       ├── utils/
│       └── vendor/
│
├── database/
│   ├── migration/
│   ├── seed/
│   └── index/
│
├── docs/
│   ├── database/
│   ├── API.md
│   ├── CHANGELOG.md
│   ├── DEVELOPMENT.md
│   └── INSTALLATION.md
│
├── modules/
│   ├── account-payable/
│   ├── account-receivable/
│   ├── aging-payable/
│   ├── aging-receivable/
│   ├── ap-payment/
│   ├── ar-payment/
│   ├── balance-sheet/
│   ├── business-partner/
│   ├── chart-of-accounts/
│   ├── dashboard/
│   ├── general-ledger/
│   ├── gl-journal/
│   ├── income-statement/
│   ├── master bank/
│   ├── profit-loss/
│   ├── settings/
│   ├── tax/
│   ├── trial-balance-year/
│   └── user-management/
│
├── service/
├── shared/
└── .git/
```

---

# 18. Module Status Snapshot

Status berikut menggambarkan **isi JavaScript pada backup ini**, bukan roadmap produk.

| Module | Status Source |
|---|---|
| Dashboard | Implemented |
| User Management | Implemented |
| Business Partner | Implemented |
| Chart Of Accounts | Implemented |
| Tax Master | Implemented |
| Account Payable | Implemented / extensive |
| Account Receivable | Implemented / extensive |
| Aging Payable | Implemented |
| Aging Receivable | Implemented |
| GL Journal | Implemented / extensive |
| AP Payment standalone | Basic placeholder |
| AR Payment standalone | Basic placeholder |
| General Ledger | Implemented |
| Trial Balance Year | Implemented |
| Income Statement | Basic placeholder |
| Balance Sheet | Implemented |
| Profit & Loss | Implemented |
| Settings standalone | Empty/basic |
| Master Bank standalone | Service only / not routed |

---

# 19. Important Accounting Integration

Current project menunjukkan integration berikut:

```text
Business Partner
   ├── Vendor → Account Payable
   └── Customer → Account Receivable

Chart Of Accounts
   ├── Tax Master
   ├── AP / AR Detail
   ├── GL Journal
   └── Financial Reports

Account Payable
   ├── AP Invoice Journal
   └── AP Payment Journal

Account Receivable
   ├── AR Invoice Journal
   └── AR Payment Journal

GL Journal
   ↓
General Ledger
   ↓
Trial Balance / Financial Reports
```

Ini adalah backbone accounting utama FINOVA.

---

# 20. Local Development

Karena frontend menggunakan native ES Modules dan `fetch()` untuk memuat module HTML, project harus dijalankan melalui HTTP server dan **bukan** langsung membuka `index.html` dengan `file://`.

Contoh development environment:

```text
Visual Studio Code
+ Live Server
```

Kemudian buka aplikasi melalui URL local server, misalnya:

```text
http://127.0.0.1:5500/
```

Supabase configuration harus tersedia di:

```text
assets/js/core/supabase.js
```

Jangan commit secret/service-role key ke frontend. Frontend hanya boleh menggunakan credential yang memang aman untuk client dan dilindungi oleh Supabase RLS.

---

# 21. Development Convention

Agar module baru konsisten dengan architecture current project, gunakan pola:

```text
modules/new-module/
├── new-module.html
├── new-module.css
└── new-module.js
```

JavaScript module:

```javascript
export class NewModule {

    constructor() {
        // state/service
    }

    async init() {
        // cache DOM
        // bind event
        // load data
        // render
    }

}
```

Kemudian tambahkan route ke:

```text
assets/js/core/router.js
```

Contoh:

```javascript
"new-module": {
    title: "New Module",
    html: "modules/new-module/new-module.html",
    js: "modules/new-module/new-module.js",
    className: "NewModule"
}
```

---

# 22. Notes for Maintenance

Beberapa hal yang terlihat dari source current backup dan perlu diperhatikan saat maintenance:

1. Beberapa module standalone masih berupa placeholder (`AP Payment`, `AR Payment`, `Income Statement`).
2. `settings.js` masih kosong.
3. Folder `modules/master bank` belum diregistrasikan pada router.
4. `docs/INSTALLATION.md` dan `docs/DEVELOPMENT.md` pada backup ini masih kosong.
5. Project menggunakan cache-busting timestamp pada dynamic HTML/JS module load.
6. Karena banyak module memakai Supabase langsung, perubahan schema harus disinkronkan dengan service dan UI.
7. Financial report harus tetap menggunakan account hierarchy/group yang benar dan tidak mengandalkan asumsi account code tanpa definisi bisnis yang eksplisit.

---

# 23. Recommended Git Ignore

Project ZIP saat ini menyertakan folder `.git/`. Untuk distribusi source/backup biasa, folder tersebut tidak perlu dikirim jika history Git tidak dibutuhkan.

File `.gitignore` sebaiknya setidaknya mempertimbangkan:

```gitignore
.env
.env.*
.vscode/
.DS_Store
Thumbs.db
```

Jangan menyimpan credential sensitif atau Supabase service-role key pada repository frontend.

---

# 24. Project Identity

```text
Application : FINOVA Accounting System
Type        : Web-based Accounting ERP
Architecture: SPA / Modular JavaScript
Backend     : Supabase PostgreSQL
Primary Use : Accounting, Finance, GL & Financial Reporting
```

---

## License

Lihat file:

```text
LICENSE
```

untuk ketentuan license repository.

---

## Maintainer Note

README ini mengikuti struktur source pada backup yang dianalisis. Jika module baru ditambahkan atau logic existing diubah, bagian **Module Documentation**, **Module Status Snapshot**, **Database Tables**, dan **Router** sebaiknya diperbarui agar dokumentasi tetap sinkron dengan source code.
