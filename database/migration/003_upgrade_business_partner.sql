/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Migration 003
Upgrade Business Partner
==========================================================
*/

ALTER TABLE public.mst_business_partner
ADD COLUMN IF NOT EXISTS top_id BIGINT;

ALTER TABLE public.mst_business_partner
ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50);

ALTER TABLE public.mst_business_partner
ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(18,2) DEFAULT 0;

ALTER TABLE public.mst_business_partner
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE public.mst_business_partner
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();