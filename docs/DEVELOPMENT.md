# Development Guide

## Architecture

FINOVA is a vanilla JavaScript SPA.

Core flow:

``` text
index.html
  ↓
core/application components
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
Supabase
```

The router is defined in `assets/js/core/router.js`.

## Module Convention

A standard module should follow:

``` text
modules/<module-name>/
├── <module-name>.html
├── <module-name>.css
├── <module-name>.js
└── optional modal HTML files
```

The JavaScript module exports one class matching the router `className`.

Example:

``` javascript
export class BusinessPartner {
    constructor() {
        // initialize module
    }
}
```

## Service Convention

Database access belongs under `service/`.

Examples:

-   `auth.service.js`
-   `user-management.service.js`
-   `business-partner.service.js`
-   `chart-of-accounts.service.js`
-   `tax-service.js`
-   `account-payable.service.js`
-   `account-receivable.service.js`
-   `journal.service.js`
-   `excel-export.service.js`
-   `preview.service.js`

Keep SQL/Supabase calls out of presentation code where a service already
exists.

## UI Rules

Maintain the FINOVA design system:

-   Poppins typography
-   Bootstrap-compatible controls
-   fixed desktop sidebar
-   global table component
-   global pagination component
-   consistent card/page header structure
-   numeric values aligned consistently
-   dates centered where applicable
-   action columns centered

Do not redesign the desktop sidebar independently inside a module.

## Table and Pagination

Module-specific CSS should not fight the global table/pagination rules.
Prefer global classes such as:

``` text
.finova-table
.finova-table-index
.finova-table-code
.finova-table-name
.finova-table-date
.finova-table-number
.finova-table-status
.finova-table-action
```

Keep pagination at the bottom of the table card rather than inside the
scrolling table body.

## Data Rules

### Business Partner

Operational selectors should only expose appropriate active partners:

-   AP → active Vendor
-   AR → active Customer
-   GL detail → active Business Partner where applicable

### Chart of Accounts

Transactional selectors should prefer:

``` text
status = active
allow_transaction = true
```

Header/non-transaction accounts should not be used as posting accounts.

### Journal

Journal header and detail should remain balanced. Source-generated
journals should preserve source metadata for traceability.

## Adding a New Route

Add an entry to `FinovaRouter.routes`:

``` javascript
"module-name": {
    title: "Module Name",
    html: "modules/module-name/module-name.html",
    js: "modules/module-name/module-name.js",
    className: "ModuleName"
}
```

Then add the corresponding sidebar item and module files.

## Error Handling

Preferred direction:

-   avoid native `alert()` and `confirm()` for production UI;
-   use Bootstrap modal/toast/FINOVA notification components;
-   log technical details to the console;
-   show users concise actionable messages.

## Source Control

Recommended branch model:

``` text
main        → stable/deployable
develop     → integration
feature/*   → new work
fix/*       → bug fixes
```

Commit by functional change, not by unrelated batches.

## Testing Checklist

For each module change test:

1.  initial load;
2.  refresh;
3.  create;
4.  edit;
5.  delete/void where allowed;
6.  status transitions;
7.  empty state;
8.  pagination;
9.  filters;
10. responsive layout;
11. Supabase/RLS errors;
12. cross-module integration.

## Documentation Rule

When a module changes materially, update:

-   `MODULES.md`
-   `API.md` if service methods change
-   `DATABASE.md` if schema changes
-   `ACCOUNTING-FLOW.md` if posting logic changes
-   `CHANGELOG.md`
