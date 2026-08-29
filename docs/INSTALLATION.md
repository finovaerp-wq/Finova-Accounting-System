# Installation Guide

## 1. Requirements

For local development:

-   Windows 11 or another modern desktop OS
-   Visual Studio Code
-   Modern browser (Chrome/Edge recommended)
-   A local static web server such as VS Code Live Server
-   Internet access for CDN dependencies and Supabase
-   A Supabase project

Git is strongly recommended for version control and Vercel deployment.

## 2. Extract the Project

Extract the project so the root contains:

``` text
index.html
login.html
assets/
modules/
service/
database/
docs/
```

Do not open module HTML files directly. Start the application from the
project root.

## 3. Supabase Configuration

The current project creates the Supabase client in:

``` text
assets/js/core/supabase.js
```

Configure the project URL and public/anonymous client key for the target
Supabase project.

Security rules:

-   Never place a Supabase `service_role` key in frontend JavaScript.
-   Treat frontend keys as public client configuration.
-   Protect data with PostgreSQL Row Level Security (RLS).
-   Keep privileged administrative operations in a trusted backend/Edge
    Function.

## 4. Database

SQL assets currently live under:

``` text
database/
├── migration/
├── seed/
└── index/
```

Existing SQL files include Business Partner, Term of Payment, Bank,
Business Partner Bank, seed, schema, and index scripts.

Because the running application references more tables than the
checked-in SQL migrations currently define, production setup should
verify the live Supabase schema before treating the repository SQL as a
complete database bootstrap.

See `docs/DATABASE.md`.

## 5. Run Locally

Using VS Code Live Server:

1.  Open the project root in VS Code.
2.  Start Live Server from `index.html` or `login.html`.
3.  Use the generated localhost address.
4.  Sign in using a valid Supabase Auth account.

Avoid `file://` execution because ES module imports and dynamic HTML
loading require HTTP serving.

## 6. Authentication Check

The application uses Supabase Auth with session persistence and token
refresh. Verify:

-   login succeeds;
-   refresh preserves the session;
-   unauthorized users are redirected correctly;
-   logout clears the session;
-   protected data respects RLS.

## 7. CDN Dependencies

The UI expects Bootstrap, Font Awesome, Google Fonts, and the Supabase
JavaScript client. Confirm the browser can load those resources.

## 8. Vercel Deployment

Recommended flow:

``` text
Local Project
→ Git repository
→ GitHub/GitLab/Bitbucket
→ Vercel project
→ Deploy
```

For a static SPA:

-   publish the repository root;
-   keep relative module paths unchanged;
-   verify dynamic module HTML/JS requests after deployment;
-   configure SPA rewrites if direct navigation is later introduced;
-   add the deployed origin to any relevant Supabase Auth URL
    configuration.

## 9. Post-Installation Checklist

-   Dashboard loads.
-   Sidebar routes to every registered module.
-   User Management reads the signed-in user's role.
-   BP/COA/Tax masters load.
-   AP and AR can load active Business Partners and transactional
    accounts.
-   GL Journal loads and can display source-generated journals.
-   General Ledger and financial reports load.
-   Pagination and table layouts remain inside their cards.
-   Browser console has no unresolved module path errors.
