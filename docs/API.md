# Internal API / Service Reference

This document describes the internal JavaScript service layer used by
FINOVA. It is not a public HTTP REST API.

## Supabase Core

File:

``` text
assets/js/core/supabase.js
```

Exports:

-   `supabase` --- configured Supabase client
-   `TABLE` --- centralized table-name constants
-   `CONFIG` --- application defaults

Current table constants include:

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

## AuthService

File: `service/auth.service.js`

Responsibility:

-   authentication/session operations;
-   login/logout support;
-   interaction with Supabase Auth.

Privileged user-management operations should not expose
admin/service-role credentials in the browser.

## UserService

File: `service/user.service.js`

Responsibility:

-   application user/profile data used by the UI.

## UserManagementService

File: `service/user-management.service.js`

Responsibility:

-   user-management data operations;
-   role/status administration support.

Manager/Staff authorization must still be enforced server-side/RLS;
hiding UI controls alone is not sufficient security.

## BusinessPartnerService

File: `service/business-partner.service.js`

Responsibility:

-   Business Partner CRUD/search;
-   customer/vendor/employee master data.

Operational modules should filter by partner type and active status.

## BusinessPartnerBankService

File: `service/business-partner-bank.service.js`

Responsibility:

-   bank-account rows associated with a Business Partner.

## TermOfPaymentService

File: `service/term-of-payment.service.js`

Responsibility:

-   Term of Payment master data used by AP/AR and Business Partner.

## BankService

File: `service/bank.service.js`

Responsibility:

-   bank master/reference data.

## ChartOfAccountsService

File: `service/chart-of-accounts.service.js`

Responsibility:

-   Chart of Accounts CRUD/search;
-   hierarchy/parent-account data;
-   transactional-account selection.

## TaxService

File: `service/tax-service.js`

Responsibility:

-   tax master data;
-   tax type/rate/account mappings used by transaction modules.

## AccountPayableService

File: `service/account-payable.service.js`

Responsibility:

-   AP invoice header/detail persistence;
-   vendor-linked invoice retrieval;
-   AP status lifecycle support.

AP UI also contains payment/posting orchestration that integrates with
GL Journal.

## AccountReceivableService

File: `service/account-receivable.service.js`

Responsibility:

-   AR invoice header/detail persistence;
-   customer-linked invoice retrieval;
-   payment/status lifecycle support.

## GeneralJournalService

File: `service/journal.service.js`

Responsibility:

-   GL Journal header/detail operations;
-   journal creation used by manual and source-generated postings.

Source metadata should be preserved when journals are generated from
AP/AR/payment processes.

## ExcelExportService

File: `service/excel-export.service.js`

Responsibility:

-   client-side Excel export support used by modules.

## PreviewService

File: `service/preview.service.js`

Responsibility:

-   HTML preview/report presentation support.

## Service Design Rules

1.  Validate required IDs before querying.
2.  Throw errors from the service; let the module decide how to present
    them.
3.  Keep table names centralized in `TABLE`.
4.  Keep posting logic deterministic and auditable.
5.  Never embed service-role credentials in frontend code.
6.  Prefer one source of truth for status values.
7.  Preserve source document references on generated journals.
