/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MIGRATION : 007
MODULE    : CUSTOMER CONFIGURATION LAYER
PURPOSE   :
- Centralize per-company FINOVA configuration
- One configuration row per company
- Preserve finova_companies as company identity source of truth
- Provide tenant-safe configuration access through RLS
- Auto-create default configuration for existing/new companies
==========================================================
*/

begin;


/* ==========================================================
   1. PREREQUISITES
========================================================== */

do $$
begin
    if to_regclass('public.finova_companies') is null then
        raise exception 'Required table public.finova_companies was not found. Run migration 004 first.';
    end if;

    if to_regclass('public.finova_company_users') is null then
        raise exception 'Required table public.finova_company_users was not found. Run migration 004 first.';
    end if;

    if to_regprocedure('public.finova_current_company_id()') is null then
        raise exception 'Required function public.finova_current_company_id() was not found.';
    end if;

    if to_regprocedure('public.is_finova_super_admin()') is null then
        raise exception 'Required function public.is_finova_super_admin() was not found.';
    end if;

    if to_regprocedure('public.finova_set_updated_at()') is null then
        raise exception 'Required function public.finova_set_updated_at() was not found.';
    end if;
end;
$$;


/* ==========================================================
   2. COMPANY SETTINGS TABLE

   IMPORTANT:
   Company identity remains in public.finova_companies.
   This table stores behavior/configuration only.
========================================================== */

create table if not exists public.finova_company_settings (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
        references public.finova_companies(id)
        on delete cascade,

    /* ------------------------------------------------------
       LOCALIZATION / ACCOUNTING BASE
    ------------------------------------------------------ */

    base_currency text not null default 'IDR',

    locale text not null default 'id-ID',

    timezone text not null default 'Asia/Jakarta',

    date_format text not null default 'DD/MM/YYYY',

    number_format text not null default 'id-ID',

    fiscal_year_start_month smallint not null default 1,


    /* ------------------------------------------------------
       FEATURE FLAGS
    ------------------------------------------------------ */

    ap_enabled boolean not null default true,

    ar_enabled boolean not null default true,

    tax_enabled boolean not null default true,

    multi_currency_enabled boolean not null default false,


    /* ------------------------------------------------------
       DOCUMENT NUMBERING PREFIX
    ------------------------------------------------------ */

    document_prefix_ap text not null default 'AP',

    document_prefix_ar text not null default 'AR',

    document_prefix_gl text not null default 'GLJ',

    document_prefix_ap_payment text not null default 'APP',

    document_prefix_ar_payment text not null default 'ARP',


    /* ------------------------------------------------------
       BRANDING
    ------------------------------------------------------ */

    logo_url text null,

    primary_color text null default '#0B1F3A',


    /* ------------------------------------------------------
       EXTRA CONFIGURATION
       Reserved for future non-critical settings.
       Core accounting rules should stay typed columns.
    ------------------------------------------------------ */

    extra_config jsonb not null default '{}'::jsonb,


    /* ------------------------------------------------------
       AUDIT
    ------------------------------------------------------ */

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),


    /* ------------------------------------------------------
       CONSTRAINTS
    ------------------------------------------------------ */

    constraint uq_finova_company_settings_company
        unique (company_id),

    constraint chk_finova_company_settings_currency
        check (
            base_currency = upper(base_currency)
            and char_length(base_currency) = 3
        ),

    constraint chk_finova_company_settings_fiscal_month
        check (fiscal_year_start_month between 1 and 12),

    constraint chk_finova_company_settings_ap_prefix
        check (
            char_length(trim(document_prefix_ap)) between 1 and 20
        ),

    constraint chk_finova_company_settings_ar_prefix
        check (
            char_length(trim(document_prefix_ar)) between 1 and 20
        ),

    constraint chk_finova_company_settings_gl_prefix
        check (
            char_length(trim(document_prefix_gl)) between 1 and 20
        ),

    constraint chk_finova_company_settings_app_prefix
        check (
            char_length(trim(document_prefix_ap_payment)) between 1 and 20
        ),

    constraint chk_finova_company_settings_arp_prefix
        check (
            char_length(trim(document_prefix_ar_payment)) between 1 and 20
        ),

    constraint chk_finova_company_settings_extra_config_object
        check (jsonb_typeof(extra_config) = 'object')
);


/* ==========================================================
   3. INDEXES
========================================================== */

create unique index if not exists uq_finova_company_settings_company_id
    on public.finova_company_settings(company_id);


/* ==========================================================
   4. UPDATED_AT TRIGGER
========================================================== */

drop trigger if exists trg_finova_company_settings_updated_at
on public.finova_company_settings;

create trigger trg_finova_company_settings_updated_at
before update on public.finova_company_settings
for each row
execute function public.finova_set_updated_at();


/* ==========================================================
   5. DEFAULT CONFIGURATION FOR EXISTING COMPANIES
========================================================== */

insert into public.finova_company_settings (
    company_id
)
select
    c.id
from public.finova_companies c
where not exists (
    select 1
    from public.finova_company_settings s
    where s.company_id = c.id
)
on conflict (company_id) do nothing;


/* ==========================================================
   6. AUTO CREATE SETTINGS FOR NEW COMPANY
========================================================== */

create or replace function public.finova_create_default_company_settings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

    insert into public.finova_company_settings (
        company_id
    )
    values (
        new.id
    )
    on conflict (company_id) do nothing;

    return new;

end;
$$;

revoke all on function public.finova_create_default_company_settings()
from public;


drop trigger if exists trg_finova_company_create_settings
on public.finova_companies;

create trigger trg_finova_company_create_settings
after insert on public.finova_companies
for each row
execute function public.finova_create_default_company_settings();


/* ==========================================================
   7. CURRENT COMPANY MANAGER HELPER FALLBACK

   Migration 006 normally creates this helper.
   Create only when it does not yet exist.
========================================================== */

do $$
begin

    if to_regprocedure('public.finova_is_current_company_manager()') is null then

        execute $fn$
            create function public.finova_is_current_company_manager()
            returns boolean
            language sql
            stable
            security definer
            set search_path = ''
            as $body$
                select exists (
                    select 1
                    from public.finova_company_users cu
                    where cu.user_uid = (select auth.uid())
                      and cu.company_id = public.finova_current_company_id()
                      and upper(coalesce(cu.role, '')) = 'MANAGER'
                      and upper(coalesce(cu.status, '')) = 'ACTIVE'
                );
            $body$;
        $fn$;

        execute 'revoke all on function public.finova_is_current_company_manager() from public';
        execute 'grant execute on function public.finova_is_current_company_manager() to authenticated';

    end if;

end;
$$;


/* ==========================================================
   8. ROW LEVEL SECURITY
========================================================== */

alter table public.finova_company_settings
enable row level security;


/* Remove policies from an earlier/partial installation. */

do $$
declare
    p record;
begin
    for p in
        select policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = 'finova_company_settings'
    loop
        execute format(
            'drop policy if exists %I on public.finova_company_settings',
            p.policyname
        );
    end loop;
end;
$$;


/* ----------------------------------------------------------
   SELECT
   - Super Admin: all companies
   - Tenant user: current company only
---------------------------------------------------------- */

create policy finova_company_settings_select
on public.finova_company_settings
for select
to authenticated
using (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
);


/* ----------------------------------------------------------
   INSERT
   Browser-side INSERT is allowed only for Super Admin.
   Normal company rows are created automatically by trigger.
---------------------------------------------------------- */

create policy finova_company_settings_insert
on public.finova_company_settings
for insert
to authenticated
with check (
    public.is_finova_super_admin()
);


/* ----------------------------------------------------------
   UPDATE
   - Super Admin: all companies
   - Active company Manager: own company only
---------------------------------------------------------- */

create policy finova_company_settings_update
on public.finova_company_settings
for update
to authenticated
using (
    public.is_finova_super_admin()
    or (
        public.finova_is_current_company_manager()
        and company_id = public.finova_current_company_id()
    )
)
with check (
    public.is_finova_super_admin()
    or (
        public.finova_is_current_company_manager()
        and company_id = public.finova_current_company_id()
    )
);


/* ----------------------------------------------------------
   DELETE
   Only Super Admin can delete directly.
   Normally settings disappear through company ON DELETE CASCADE.
---------------------------------------------------------- */

create policy finova_company_settings_delete
on public.finova_company_settings
for delete
to authenticated
using (
    public.is_finova_super_admin()
);


/* ==========================================================
   9. API PRIVILEGES
========================================================== */

grant select, insert, update, delete
on public.finova_company_settings
to authenticated;


/* ==========================================================
   10. TENANT-SAFE CONFIG RPC

   Returns one JSON object that will later be consumed by
   CustomerConfig / CustomerConfigService.
========================================================== */

create or replace function public.finova_current_company_config()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
    select jsonb_build_object(

        'company', jsonb_build_object(
            'id', c.id,
            'code', c.company_code,
            'name', c.company_name,
            'legalName', c.legal_name,
            'email', c.email,
            'phone', c.phone,
            'address', c.address,
            'status', c.status
        ),

        'accounting', jsonb_build_object(
            'baseCurrency', s.base_currency,
            'fiscalYearStartMonth', s.fiscal_year_start_month
        ),

        'localization', jsonb_build_object(
            'locale', s.locale,
            'timezone', s.timezone,
            'dateFormat', s.date_format,
            'numberFormat', s.number_format
        ),

        'features', jsonb_build_object(
            'accountPayable', s.ap_enabled,
            'accountReceivable', s.ar_enabled,
            'tax', s.tax_enabled,
            'multiCurrency', s.multi_currency_enabled
        ),

        'numbering', jsonb_build_object(
            'apPrefix', s.document_prefix_ap,
            'arPrefix', s.document_prefix_ar,
            'glPrefix', s.document_prefix_gl,
            'apPaymentPrefix', s.document_prefix_ap_payment,
            'arPaymentPrefix', s.document_prefix_ar_payment
        ),

        'branding', jsonb_build_object(
            'logoUrl', s.logo_url,
            'primaryColor', s.primary_color
        ),

        'extra', s.extra_config

    )
    from public.finova_companies c
    join public.finova_company_settings s
      on s.company_id = c.id
    where c.id = public.finova_current_company_id()
    limit 1;
$$;

revoke all on function public.finova_current_company_config()
from public;

grant execute on function public.finova_current_company_config()
to authenticated;


/* ==========================================================
   11. DIAGNOSTIC RPC

   Used after migration to verify:
   - current company exists
   - exactly one settings row is visible
   - RLS does not leak another company's settings
========================================================== */

create or replace function public.finova_customer_config_status()
returns table (
    current_company_id uuid,
    visible_config_rows bigint,
    foreign_config_rows_visible bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
    select
        public.finova_current_company_id() as current_company_id,
        count(*)::bigint as visible_config_rows,
        count(*) filter (
            where company_id is distinct from public.finova_current_company_id()
        )::bigint as foreign_config_rows_visible
    from public.finova_company_settings;
$$;

revoke all on function public.finova_customer_config_status()
from public;

grant execute on function public.finova_customer_config_status()
to authenticated;


commit;
