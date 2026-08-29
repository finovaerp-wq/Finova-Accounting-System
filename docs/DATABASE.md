# Database Guide

## Database Platform

FINOVA uses Supabase PostgreSQL plus Supabase Auth.

The frontend centralizes runtime table names in:

``` text
assets/js/core/supabase.js
```

## Runtime Tables Referenced by the Application

### Master

  Table                         Purpose
  ----------------------------- ------------------------------------
  `mst_users`                   Application user profile/role data
  `mst_business_partner`        Customer, Vendor, Employee master
  `mst_business_partner_bank`   Business Partner bank accounts
  `mst_term_of_payment`         Payment terms
  `mst_bank`                    Bank master
  `mst_chart_of_accounts`       Chart of Accounts
  `mst_taxes`                   Tax master

### Transaction

  -----------------------------------------------------------------------
  Table                               Purpose
  ----------------------------------- -----------------------------------
  `trx_gl_journal`                    GL Journal header

  `trx_gl_journal_detail`             GL Journal lines

  `trx_account_payable`               AP header

  `trx_account_payable_detail`        AP invoice lines

  `trx_account_receivable`            AR header

  `trx_account_receivable_detail`     AR invoice lines

  `trx_account_receivable_payment`    AR payment data referenced by
                                      current code

  `trx_ap_payment`                    AP payment module table constant

  `trx_ar_payment`                    AR payment module table constant
  -----------------------------------------------------------------------

## Important Relationships

Conceptual relationships used by the application:

``` text
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

journal detail accounts
  → mst_chart_of_accounts

tax account mappings
  → mst_chart_of_accounts
```

Exact foreign-key names should be verified against the live Supabase
schema before production migration.

## Business Partner Fields Used by the Application

The codebase/documented migrations use concepts including:

``` text
id
bp_code
bp_name
bp_type
phone
email
address
city
country
tax_number
top_id
is_active
```

Business Partner type values used by the UI are Customer, Vendor, and
Employee.

## Chart of Accounts Concepts

The application relies on COA attributes for:

-   account code/name;
-   parent/hierarchy;
-   currency;
-   normal balance;
-   active status;
-   transaction permission (`allow_transaction`);
-   header/detail distinction where available.

Financial statements should use explicit account
classification/hierarchy instead of guessing category solely from
account-code prefixes.

## GL Journal Concepts

Header concepts used by the application include:

``` text
id
journal_no
journal_date
posting_period
description
status
source_module
source_document_type
source_document_id
source_invoice_no
source_po_no
```

Detail concepts include debit account, credit account, Business Partner,
amount, and description.

Typical statuses:

``` text
Draft
Posted
Void
```

## AP Concepts

AP header includes vendor, PO/invoice references, invoice/received
dates, TOP, due date, description, status, and journal linkage where
implemented.

AP detail includes COA, quantity, unit price, line amount, tax (+), tax
(-)/withholding, and total calculations.

## AR Concepts

AR mirrors the receivable flow using Customer rather than Vendor and
supports invoice/payment journal generation in the module logic.

## RLS

Recommended baseline:

-   enable RLS on business tables;
-   authenticated users receive only required
    SELECT/INSERT/UPDATE/DELETE policies;
-   Manager/Staff rules should be enforced at database/backend level
    where they represent authorization;
-   never rely solely on disabled/hidden buttons;
-   test each operation using an authenticated non-admin session.

## Migration Repository Status

The repository currently contains SQL files for Business Partner, Term
of Payment, Bank, Business Partner Bank, schema/seed support, and
indexes.

The application references additional runtime tables that are not fully
represented by the checked-in migration folder. Therefore:

> The current `database/` folder should not yet be treated as a complete
> clean-install schema for the whole ERP.

Recommended next database documentation milestone: export a schema-only
snapshot from the live Supabase project and reconcile it with versioned
migrations.
