# FINOVA Accounting System

Web-based accounting ERP focused on finance and accounting processes,
built as a Single Page Application (SPA) with vanilla
HTML/CSS/JavaScript and Supabase (PostgreSQL).

## Main Scope

FINOVA currently contains these functional areas:

-   Dashboard
-   Master Data: User Management, Business Partner, Chart of Accounts,
    Tax Master
-   Finance: Account Payable, Account Receivable, Aging Payable, Aging
    Receivable
-   Accounting: GL Journal
-   Payment: AP Payment, AR Payment
-   Reports: General Ledger, Trial Balance Year, Income Statement,
    Balance Sheet, Profit & Loss
-   Settings / authentication support

## Technology

-   HTML5, CSS3, JavaScript ES Modules
-   Bootstrap 5.3.3
-   Font Awesome 6.7.2
-   Poppins
-   Supabase JavaScript client
-   Supabase PostgreSQL
-   SPA router (`assets/js/core/router.js`)

## Project Structure

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

## Documentation

  --------------------------------------------------------------------------
  Document                               Purpose
  -------------------------------------- -----------------------------------
  [INSTALLATION](docs/INSTALLATION.md)   Local setup, Supabase setup, and
                                         deployment checklist

  [DEVELOPMENT](docs/DEVELOPMENT.md)     Architecture, coding conventions,
                                         module development workflow

  [API](docs/API.md)                     Internal service/API reference

  [DATABASE](docs/DATABASE.md)           Database tables, relationships,
                                         RLS, and migration notes

  [ACCOUNTING                            AP/AR/GL/payment/report accounting
  FLOW](docs/ACCOUNTING-FLOW.md)         flow

  [MODULES](docs/MODULES.md)             Module-by-module functional
                                         reference

  [CHANGELOG](docs/CHANGELOG.md)         Project change history and release
                                         format
  --------------------------------------------------------------------------

## SPA Routes

The router currently registers:

`dashboard`, `user-management`, `business-partner`, `chart-of-accounts`,
`tax`, `account-payable`, `account-receivable`, `aging-payable`,
`aging-receivable`, `gl-journal`, `ap-payment`, `ar-payment`,
`general-ledger`, `trial-balance-year`, `income-statement`,
`balance-sheet`, and `profit-loss`.

## Accounting Integration

FINOVA uses GL Journal as the accounting center. Source transactions can
generate journals carrying source metadata such as module, document
type, document ID, invoice number, and PO number. Reports then read
accounting data rather than re-entering transactions manually.

See [ACCOUNTING-FLOW.md](docs/ACCOUNTING-FLOW.md) for details.

## Important Notes

-   Keep the desktop sidebar structure consistent across modules.
-   Reuse global table, pagination, typography, and layout components.
-   Transactional account selectors should use active Chart of Accounts
    records that allow transactions.
-   Inactive Business Partners should not be offered for new operational
    transactions.
-   Financial-report classification should use explicit COA
    grouping/hierarchy; do not infer accounting categories only from
    account-code prefixes.
-   Supabase Row Level Security should remain enabled and tested for
    authenticated roles.

## Status

This documentation is based on the source tree in **BACKUP 26 FINISH**
and is intended to become the baseline documentation for future FINOVA
development.
