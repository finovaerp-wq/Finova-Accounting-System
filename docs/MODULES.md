# Module Reference

## Dashboard

**Route:** `dashboard`\
**Class:** `Dashboard`

Purpose: accounting summary landing page. It loads dashboard
KPIs/summaries from the accounting data available to the frontend.

## User Management

**Route:** `user-management`\
**Class:** `UserManagement`\
**Service:** `UserManagementService`

Purpose: maintain application users, roles, and status. UI behavior
distinguishes Manager and Staff capabilities. Authorization must also be
enforced server-side.

## Business Partner

**Route:** `business-partner`\
**Class:** `BusinessPartner`\
**Services:** `BusinessPartnerService`, `BusinessPartnerBankService`,
`TermOfPaymentService`

Purpose: Customer/Vendor/Employee master data, TOP, contact/address
information, active status, and bank-grid support.

Operational rule: inactive partners should not appear in AP/AR/GL
transaction selectors.

## Chart of Accounts

**Route:** `chart-of-accounts`\
**Class:** `ChartOfAccounts`\
**Service:** `ChartOfAccountsService`

Purpose: maintain account code/name, hierarchy/parent, currency, normal
balance, transaction permission, and status.

## Tax Master

**Route:** `tax`\
**Class:** `Tax`\
**Service:** `TaxService`

Purpose: tax code/name/type/rate and accounting mappings used by
transaction modules.

## Account Payable

**Route:** `account-payable`\
**Class:** `AccountPayable`\
**Service:** `AccountPayableService`

Purpose: Vendor invoices, invoice detail, Tax (+), Tax (-), TOP/due
date, payment interaction, status lifecycle, and AP-generated GL
Journal.

Supporting modal files:

``` text
account-payable-modal.html
account-payable-detail-modal.html
account-payable-payment-modal.html
```

## Account Receivable

**Route:** `account-receivable`\
**Class:** `AccountReceivable`\
**Service:** `AccountReceivableService`

Purpose: Customer invoices, invoice detail, taxes, payment interaction,
status lifecycle, and AR-generated GL Journal.

Supporting modal files:

``` text
account-receivable-modal.html
account-receivable-detail-modal.html
account-receivable-payment-modal.html
```

## Aging Payable

**Route:** `aging-payable`\
**Class:** `AgingPayable`

Purpose: analyze outstanding payable balances by age/due-date bucket.

## Aging Receivable

**Route:** `aging-receivable`\
**Class:** `AgingReceivable`

Purpose: analyze outstanding receivable balances by age/due-date bucket.

## GL Journal

**Route:** `gl-journal`\
**Class:** `GeneralJournal`\
**Service:** `GeneralJournalService`

Purpose: manual and source-generated journal listing/detail,
Draft/Posted/Void lifecycle, balancing, source traceability, export, and
preview.

Supporting modal files:

``` text
gl-journal-modal.html
journal-detail-modal.html
```

## AP Payment

**Route:** `ap-payment`\
**Class:** `APPayment`

Purpose: dedicated AP payment module route. AP invoice-level payment
handling also exists in the Account Payable module, so future
development should keep one authoritative payment workflow and avoid
duplicate posting logic.

## AR Payment

**Route:** `ar-payment`\
**Class:** `ARPayment`

Purpose: dedicated AR payment module route. AR invoice-level payment
handling also exists in Account Receivable; future development should
keep posting/status logic synchronized.

## General Ledger

**Route:** `general-ledger`\
**Class:** `GeneralLedger`

Purpose: account-level ledger reporting sourced from journal
transactions.

## Trial Balance Year

**Route:** `trial-balance-year`\
**Class:** `TrialBalanceYear`

Purpose: yearly trial-balance presentation with account balances and
debit/credit reconciliation.

## Income Statement

**Route:** `income-statement`\
**Class:** `IncomeStatement`

Purpose: income-statement reporting route. Final production
classification should be tied to explicit COA financial-statement
grouping.

## Balance Sheet

**Route:** `balance-sheet`\
**Class:** `BalanceSheet`

Purpose: Balance Sheet presentation using accounting balances and
explicit COA classification/hierarchy.

## Profit & Loss

**Route:** `profit-loss`\
**Class:** `ProfitLoss`

Purpose: Profit & Loss reporting using accounting balances and explicit
COA classification/hierarchy.

## Settings

A `modules/settings/` folder exists with HTML/CSS/JS, but it is not
currently registered as a router route in `FinovaRouter`. Change
Password and Logout are handled as global/sidebar actions rather than a
normal routed settings page.

## Cross-Module Components

Common components/services include:

-   Sidebar
-   Topbar
-   global table
-   global pagination
-   Excel export
-   HTML preview
-   authentication/session
-   change password
-   shared layout/theme CSS
