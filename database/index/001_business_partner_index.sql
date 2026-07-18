/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Business Partner Index
==========================================================
*/

create index if not exists idx_bp_code
on public.mst_business_partner(bp_code);

create index if not exists idx_bp_name
on public.mst_business_partner(bp_name);

create index if not exists idx_bp_type
on public.mst_business_partner(bp_type);

create index if not exists idx_bp_active
on public.mst_business_partner(is_active);

create index if not exists idx_bp_top
on public.mst_business_partner(top_id);