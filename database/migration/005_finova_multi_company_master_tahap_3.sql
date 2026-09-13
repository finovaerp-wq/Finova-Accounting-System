/*
==========================================================
FINOVA ACCOUNTING SYSTEM
MULTI-COMPANY / MULTI-TENANT - TAHAP 3
MASTER DATA TENANT ISOLATION
==========================================================
SCOPE:
- mst_business_partner
- mst_business_partner_bank
- mst_chart_of_accounts
- mst_taxes
- mst_accounting_period
- trx_accounting_period_history

BELUM MENYENTUH:
- Account Payable
- Account Receivable
- Payment AP / AR
- GL Journal
- Aging
- Financial Reports

PRASYARAT:
- Migration Tahap 2 sudah dijalankan.
- public.finova_companies, public.finova_company_users,
  public.finova_current_company_id(), public.is_finova_super_admin()
  sudah tersedia.
==========================================================
*/

begin;

/* ==========================================================
   VALIDASI TAHAP 2
========================================================== */
do $$
begin
    if to_regclass('public.finova_companies') is null then
        raise exception 'Tahap 2 belum terpasang: public.finova_companies tidak ditemukan.';
    end if;

    if to_regprocedure('public.finova_current_company_id()') is null then
        raise exception 'Tahap 2 belum terpasang: finova_current_company_id() tidak ditemukan.';
    end if;

    if to_regprocedure('public.is_finova_super_admin()') is null then
        raise exception 'Tahap 2 belum terpasang: is_finova_super_admin() tidak ditemukan.';
    end if;
end;
$$;

/* ==========================================================
   1. TAMBAH company_id - NULLABLE UNTUK MIGRATION AMAN
========================================================== */
alter table public.mst_business_partner
    add column if not exists company_id uuid null
    references public.finova_companies(id) on delete restrict;

alter table public.mst_business_partner_bank
    add column if not exists company_id uuid null
    references public.finova_companies(id) on delete restrict;

alter table public.mst_chart_of_accounts
    add column if not exists company_id uuid null
    references public.finova_companies(id) on delete restrict;

alter table public.mst_taxes
    add column if not exists company_id uuid null
    references public.finova_companies(id) on delete restrict;

alter table public.mst_accounting_period
    add column if not exists company_id uuid null
    references public.finova_companies(id) on delete restrict;

alter table public.trx_accounting_period_history
    add column if not exists company_id uuid null
    references public.finova_companies(id) on delete restrict;

/* ==========================================================
   2. INDEX TENANT
========================================================== */
create index if not exists idx_bp_company_id
    on public.mst_business_partner(company_id);

create index if not exists idx_bp_bank_company_id
    on public.mst_business_partner_bank(company_id);

create index if not exists idx_coa_company_id
    on public.mst_chart_of_accounts(company_id);

create index if not exists idx_tax_company_id
    on public.mst_taxes(company_id);

create index if not exists idx_accounting_period_company_id
    on public.mst_accounting_period(company_id);

create index if not exists idx_accounting_period_history_company_id
    on public.trx_accounting_period_history(company_id);

/* ==========================================================
   3. BACKFILL OTOMATIS HANYA JIKA TEPAT 1 COMPANY
   Tidak menebak jika company sudah lebih dari satu.
========================================================== */
do $$
declare
    v_company_id uuid;
    v_company_count integer;
begin

    select count(*)
      into v_company_count
      from public.finova_companies;

    if v_company_count = 1 then

        select id
          into v_company_id
          from public.finova_companies
          limit 1;

        update public.mst_business_partner
           set company_id = v_company_id
         where company_id is null;

        update public.mst_chart_of_accounts
           set company_id = v_company_id
         where company_id is null;

        update public.mst_taxes
           set company_id = v_company_id
         where company_id is null;

        update public.mst_accounting_period
           set company_id = v_company_id
         where company_id is null;

        update public.trx_accounting_period_history
           set company_id = v_company_id
         where company_id is null;

        update public.mst_business_partner_bank b
           set company_id = bp.company_id
          from public.mst_business_partner bp
         where b.business_partner_id = bp.id
           and b.company_id is null;

    end if;

end;
$$;

/* ==========================================================
   4. RPC SUPER ADMIN UNTUK ASSIGN LEGACY MASTER DATA
========================================================== */
create or replace function public.finova_admin_assign_legacy_master_data(
    p_company_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_bp integer := 0;
    v_bp_bank integer := 0;
    v_coa integer := 0;
    v_tax integer := 0;
    v_period integer := 0;
    v_history integer := 0;
begin
    if not public.is_finova_super_admin() then
        raise exception 'Access denied: FINOVA Super Admin required.';
    end if;

    if not exists (
        select 1 from public.finova_companies where id = p_company_id
    ) then
        raise exception 'Company % tidak ditemukan.', p_company_id;
    end if;

    update public.mst_business_partner
       set company_id = p_company_id
     where company_id is null;
    get diagnostics v_bp = row_count;

    update public.mst_chart_of_accounts
       set company_id = p_company_id
     where company_id is null;
    get diagnostics v_coa = row_count;

    update public.mst_taxes
       set company_id = p_company_id
     where company_id is null;
    get diagnostics v_tax = row_count;

    update public.mst_accounting_period
       set company_id = p_company_id
     where company_id is null;
    get diagnostics v_period = row_count;

    update public.mst_business_partner_bank b
   set company_id = bp.company_id
  from public.mst_business_partner bp
 where b.bp_id = bp.id
   and b.company_id is null;
    get diagnostics v_bp_bank = row_count;

    update public.trx_accounting_period_history h
       set company_id = p.company_id
      from public.mst_accounting_period p
     where h.accounting_period_id = p.id
       and h.company_id is null;
    get diagnostics v_history = row_count;

    return jsonb_build_object(
        'company_id', p_company_id,
        'business_partner', v_bp,
        'business_partner_bank', v_bp_bank,
        'chart_of_accounts', v_coa,
        'tax', v_tax,
        'accounting_period', v_period,
        'accounting_period_history', v_history
    );
end;
$$;

revoke all on function public.finova_admin_assign_legacy_master_data(uuid) from public;
grant execute on function public.finova_admin_assign_legacy_master_data(uuid) to authenticated;

/* ==========================================================
   5. TENANT GUARD TRIGGER
   - INSERT customer: company_id otomatis current company
   - UPDATE/DELETE: hanya tenant sendiri
   - Super Admin dapat mengelola semua row
========================================================== */
create or replace function public.finova_phase3_tenant_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_company_id uuid;
begin
    if public.is_finova_super_admin() then
        if tg_op = 'INSERT' then
            if new.company_id is null then
                v_company_id := public.finova_current_company_id();
                if v_company_id is not null then
                    new.company_id := v_company_id;
                end if;
            end if;
            return new;
        elsif tg_op = 'UPDATE' then
            return new;
        else
            return old;
        end if;
    end if;

    v_company_id := public.finova_current_company_id();

    if v_company_id is null then
        raise exception 'FINOVA: user belum terhubung ke company aktif.';
    end if;

    if tg_op = 'INSERT' then
        if new.company_id is null then
            new.company_id := v_company_id;
        elsif new.company_id <> v_company_id then
            raise exception 'FINOVA: tidak boleh membuat data untuk company lain.';
        end if;
        return new;
    end if;

    if old.company_id is distinct from v_company_id then
        raise exception 'FINOVA: akses tenant ditolak.';
    end if;

    if tg_op = 'UPDATE' then
        if new.company_id is distinct from old.company_id then
            raise exception 'FINOVA: company_id tidak boleh dipindahkan melalui aplikasi customer.';
        end if;
        return new;
    end if;

    return old;
end;
$$;

/* ==========================================================
   6. VALIDASI REFERENSI ANTAR MASTER HARUS 1 COMPANY
========================================================== */
create or replace function public.finova_phase3_validate_reference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_ref_company uuid;
begin
    if tg_table_name = 'mst_business_partner_bank' then
        select company_id into v_ref_company
          from public.mst_business_partner
         where id = new.bp_id;
        if v_ref_company is null or v_ref_company is distinct from new.company_id then
            raise exception 'FINOVA: Business Partner Bank harus berada pada company yang sama dengan Business Partner.';
        end if;

    elsif tg_table_name = 'mst_chart_of_accounts' then
        if new.parent_id is not null then
            select company_id into v_ref_company
              from public.mst_chart_of_accounts
             where id = new.parent_id;
            if v_ref_company is null or v_ref_company is distinct from new.company_id then
                raise exception 'FINOVA: Parent COA harus berada pada company yang sama.';
            end if;
        end if;

    elsif tg_table_name = 'mst_taxes' then
        select company_id into v_ref_company
          from public.mst_chart_of_accounts
         where id = new.tax_account_id;
        if v_ref_company is null or v_ref_company is distinct from new.company_id then
            raise exception 'FINOVA: Tax Account harus berada pada company yang sama.';
        end if;

        if new.offset_account_id is not null then
            select company_id into v_ref_company
              from public.mst_chart_of_accounts
             where id = new.offset_account_id;
            if v_ref_company is null or v_ref_company is distinct from new.company_id then
                raise exception 'FINOVA: Offset Account harus berada pada company yang sama.';
            end if;
        end if;

    elsif tg_table_name = 'trx_accounting_period_history' then
        select company_id into v_ref_company
          from public.mst_accounting_period
         where id = new.accounting_period_id;

        if new.company_id is null then
            new.company_id := v_ref_company;
        end if;

        if v_ref_company is null or v_ref_company is distinct from new.company_id then
            raise exception 'FINOVA: Accounting Period History harus berada pada company yang sama.';
        end if;
    end if;

    return new;
end;
$$;

/* ==========================================================
   7. PASANG TRIGGER TENANT GUARD
========================================================== */
drop trigger if exists trg_tenant_bp on public.mst_business_partner;
create trigger trg_tenant_bp
before insert or update or delete on public.mst_business_partner
for each row execute function public.finova_phase3_tenant_guard();

drop trigger if exists trg_tenant_bp_bank on public.mst_business_partner_bank;
create trigger trg_tenant_bp_bank
before insert or update or delete on public.mst_business_partner_bank
for each row execute function public.finova_phase3_tenant_guard();

drop trigger if exists trg_tenant_coa on public.mst_chart_of_accounts;
create trigger trg_tenant_coa
before insert or update or delete on public.mst_chart_of_accounts
for each row execute function public.finova_phase3_tenant_guard();

drop trigger if exists trg_tenant_tax on public.mst_taxes;
create trigger trg_tenant_tax
before insert or update or delete on public.mst_taxes
for each row execute function public.finova_phase3_tenant_guard();

drop trigger if exists trg_tenant_accounting_period on public.mst_accounting_period;
create trigger trg_tenant_accounting_period
before insert or update or delete on public.mst_accounting_period
for each row execute function public.finova_phase3_tenant_guard();

drop trigger if exists trg_tenant_accounting_period_history on public.trx_accounting_period_history;
create trigger trg_tenant_accounting_period_history
before insert or update or delete on public.trx_accounting_period_history
for each row execute function public.finova_phase3_tenant_guard();

/* Reference validators must run after company_id has been resolved by guard. */
drop trigger if exists trg_validate_bp_bank_company on public.mst_business_partner_bank;
create trigger trg_validate_bp_bank_company
before insert or update on public.mst_business_partner_bank
for each row execute function public.finova_phase3_validate_reference();

drop trigger if exists trg_validate_coa_company on public.mst_chart_of_accounts;
create trigger trg_validate_coa_company
before insert or update on public.mst_chart_of_accounts
for each row execute function public.finova_phase3_validate_reference();

drop trigger if exists trg_validate_tax_company on public.mst_taxes;
create trigger trg_validate_tax_company
before insert or update on public.mst_taxes
for each row execute function public.finova_phase3_validate_reference();

drop trigger if exists trg_validate_period_history_company on public.trx_accounting_period_history;
create trigger trg_validate_period_history_company
before insert or update on public.trx_accounting_period_history
for each row execute function public.finova_phase3_validate_reference();

/* ==========================================================
   8. UBAH UNIQUE GLOBAL MENJADI UNIQUE PER COMPANY
========================================================== */
do $$
declare
    r record;
begin
    -- Business Partner Code
    for r in
        select conname
        from pg_constraint
        where conrelid = 'public.mst_business_partner'::regclass
          and contype = 'u'
          and pg_get_constraintdef(oid) = 'UNIQUE (bp_code)'
    loop
        execute format('alter table public.mst_business_partner drop constraint %I', r.conname);
    end loop;

    -- COA Code
    for r in
        select conname
        from pg_constraint
        where conrelid = 'public.mst_chart_of_accounts'::regclass
          and contype = 'u'
          and pg_get_constraintdef(oid) = 'UNIQUE (account_code)'
    loop
        execute format('alter table public.mst_chart_of_accounts drop constraint %I', r.conname);
    end loop;

    -- Tax Code
    for r in
        select conname
        from pg_constraint
        where conrelid = 'public.mst_taxes'::regclass
          and contype = 'u'
          and pg_get_constraintdef(oid) = 'UNIQUE (tax_code)'
    loop
        execute format('alter table public.mst_taxes drop constraint %I', r.conname);
    end loop;

    -- Accounting Period: unique period global / year-month global
    for r in
        select conname
        from pg_constraint
        where conrelid = 'public.mst_accounting_period'::regclass
          and contype = 'u'
          and pg_get_constraintdef(oid) in (
              'UNIQUE (period)',
              'UNIQUE (year, month)',
              'UNIQUE (month, year)'
          )
    loop
        execute format('alter table public.mst_accounting_period drop constraint %I', r.conname);
    end loop;
end;
$$;

create unique index if not exists uq_bp_company_code
    on public.mst_business_partner(company_id, bp_code)
    where company_id is not null;

create unique index if not exists uq_coa_company_code
    on public.mst_chart_of_accounts(company_id, account_code)
    where company_id is not null;

create unique index if not exists uq_tax_company_code
    on public.mst_taxes(company_id, tax_code)
    where company_id is not null;

create unique index if not exists uq_period_company_year_month
    on public.mst_accounting_period(company_id, year, month)
    where company_id is not null;

/* ==========================================================
   9. RLS - HAPUS POLICY LAMA PADA TABLE TAHAP 3
   lalu bangun policy tenant yang konsisten.
========================================================== */
do $$
declare
    v_table text;
    r record;
begin
    foreach v_table in array array[
        'mst_business_partner',
        'mst_business_partner_bank',
        'mst_chart_of_accounts',
        'mst_taxes',
        'mst_accounting_period',
        'trx_accounting_period_history'
    ]
    loop
        for r in
            select policyname
            from pg_policies
            where schemaname = 'public'
              and tablename = v_table
        loop
            execute format('drop policy if exists %I on public.%I', r.policyname, v_table);
        end loop;
    end loop;
end;
$$;

alter table public.mst_business_partner enable row level security;
alter table public.mst_business_partner_bank enable row level security;
alter table public.mst_chart_of_accounts enable row level security;
alter table public.mst_taxes enable row level security;
alter table public.mst_accounting_period enable row level security;
alter table public.trx_accounting_period_history enable row level security;

create policy finova_tenant_bp_all
on public.mst_business_partner
for all to authenticated
using (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
)
with check (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
);

create policy finova_tenant_bp_bank_all
on public.mst_business_partner_bank
for all to authenticated
using (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
)
with check (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
);

create policy finova_tenant_coa_all
on public.mst_chart_of_accounts
for all to authenticated
using (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
)
with check (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
);

create policy finova_tenant_tax_all
on public.mst_taxes
for all to authenticated
using (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
)
with check (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
);

create policy finova_tenant_period_all
on public.mst_accounting_period
for all to authenticated
using (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
)
with check (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
);

create policy finova_tenant_period_history_all
on public.trx_accounting_period_history
for all to authenticated
using (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
)
with check (
    public.is_finova_super_admin()
    or company_id = public.finova_current_company_id()
);

/* ==========================================================
   10. STATUS / DIAGNOSTIC RPC UNTUK SUPER ADMIN
========================================================== */
create or replace function public.finova_admin_tenant_master_status()
returns table(
    table_name text,
    total_rows bigint,
    assigned_rows bigint,
    unassigned_rows bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
    if not public.is_finova_super_admin() then
        raise exception 'Access denied: FINOVA Super Admin required.';
    end if;

    return query
    select 'mst_business_partner'::text,
           count(*)::bigint,
           count(company_id)::bigint,
           count(*) filter (where company_id is null)::bigint
    from public.mst_business_partner
    union all
    select 'mst_business_partner_bank'::text,
           count(*)::bigint,
           count(company_id)::bigint,
           count(*) filter (where company_id is null)::bigint
    from public.mst_business_partner_bank
    union all
    select 'mst_chart_of_accounts'::text,
           count(*)::bigint,
           count(company_id)::bigint,
           count(*) filter (where company_id is null)::bigint
    from public.mst_chart_of_accounts
    union all
    select 'mst_taxes'::text,
           count(*)::bigint,
           count(company_id)::bigint,
           count(*) filter (where company_id is null)::bigint
    from public.mst_taxes
    union all
    select 'mst_accounting_period'::text,
           count(*)::bigint,
           count(company_id)::bigint,
           count(*) filter (where company_id is null)::bigint
    from public.mst_accounting_period
    union all
    select 'trx_accounting_period_history'::text,
           count(*)::bigint,
           count(company_id)::bigint,
           count(*) filter (where company_id is null)::bigint
    from public.trx_accounting_period_history;
end;
$$;

revoke all on function public.finova_admin_tenant_master_status() from public;
grant execute on function public.finova_admin_tenant_master_status() to authenticated;

commit;

/*
==========================================================
POST-MIGRATION CHECK
==========================================================
Sebagai FINOVA Super Admin:

select * from public.finova_admin_tenant_master_status();

Jika unassigned_rows > 0 dan Anda sudah yakin semua data legacy
milik satu company, jalankan dari browser Supabase client/RPC atau
SQL Editor dengan company UUID yang benar:

select public.finova_admin_assign_legacy_master_data(
    'COMPANY-UUID-DI-SINI'::uuid
);

Lalu cek ulang:
select * from public.finova_admin_tenant_master_status();
==========================================================
*/
