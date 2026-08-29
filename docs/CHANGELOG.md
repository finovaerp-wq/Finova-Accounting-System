# Changelog

All notable FINOVA changes should be recorded here.

This file is initialized from the state of **BACKUP 26 FINISH**. Earlier
work was not consistently version-tagged, so historical entries below
summarize the current baseline rather than claiming exact release dates.

## \[Unreleased\]

### Documentation

-   Added project README.
-   Added Installation Guide.
-   Added Development Guide.
-   Added Internal API/Service Reference.
-   Added Database Guide.
-   Added Accounting Flow.
-   Added Module Reference.
-   Established changelog format.

### Recommended Next Documentation Work

-   Reconcile live Supabase schema with repository migrations.
-   Document exact RLS policies.
-   Document financial-statement COA classification fields.
-   Add deployment environment checklist.

## \[1.0.0-baseline\] - 2026-08-30

### Core

-   SPA router with dynamically loaded accounting modules.
-   Supabase client/auth integration.
-   Global sidebar/topbar/layout.
-   Global table and pagination design.

### Master Data

-   User Management.
-   Business Partner with Customer/Vendor/Employee types.
-   Business Partner bank support.
-   Term of Payment integration.
-   Chart of Accounts.
-   Tax Master.

### Finance

-   Account Payable.
-   Account Receivable.
-   Aging Payable.
-   Aging Receivable.

### Accounting

-   GL Journal with Draft, Posted, and Void statuses.
-   Source metadata for generated journals.
-   AP/AR invoice and payment journal integration.

### Reports

-   General Ledger.
-   Trial Balance Year.
-   Income Statement route.
-   Balance Sheet.
-   Profit & Loss.

### Payment

-   AP Payment route.
-   AR Payment route.

## Changelog Format

For future releases use:

``` text
## [x.y.z] - YYYY-MM-DD

### Added
### Changed
### Fixed
### Removed
### Security
```

Use semantic versioning where practical:

-   MAJOR: incompatible architecture/data changes
-   MINOR: new backward-compatible module/features
-   PATCH: backward-compatible fixes
