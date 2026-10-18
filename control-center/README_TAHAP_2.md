# FINOVA Control Center — Tahap 2

Tahap 2 menambahkan fondasi SaaS tanpa mengubah tabel transaksi accounting.

## Yang aktif
- `finova_companies`
- `finova_super_admins`
- `finova_plans`
- `finova_subscriptions`
- `finova_company_users`
- `mst_users.company_id` (nullable)
- RLS untuk tabel Control Center
- RPC aman untuk assign user berdasarkan Auth email
- Control Center Company, Subscription, Users, KPI/MRR

## WAJIB dilakukan
1. Jalankan `database/migration/004_finova_control_center_tahap_2.sql` di Supabase SQL Editor.
2. Ambil UUID akun owner di Supabase Authentication > Users.
3. Jalankan:
```sql
insert into public.finova_super_admins(user_uid, full_name)
values ('UUID-OWNER', 'FINOVA Owner')
on conflict(user_uid) do update
set is_active=true, full_name=excluded.full_name;
```
4. Login dengan akun owner yang sama.
5. Buka `/control-center/`.

## Aman untuk project existing
AP, AR, GL Journal, COA, Tax, Aging, Ledger dan report belum diberi `company_id` pada Tahap 2. Jangan aktifkan tenant RLS pada transaksi sebelum service masing-masing module sudah dimigrasikan.
