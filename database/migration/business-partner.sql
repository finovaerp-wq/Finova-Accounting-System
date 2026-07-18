/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Database : Business Partner
Version  : 1.0.0
==========================================================
*/

-- ======================================================
-- EXTENSION
-- ======================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================
-- TABLE
-- ======================================================

CREATE TABLE IF NOT EXISTS mst_business_partner (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    bp_code VARCHAR(20) NOT NULL UNIQUE,

    bp_name VARCHAR(200) NOT NULL,

    bp_type VARCHAR(20) NOT NULL,

    phone VARCHAR(50),

    email VARCHAR(150),

    address TEXT,

    city VARCHAR(100),

    postal_code VARCHAR(20),

    tax_number VARCHAR(50),

    status BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by UUID,

    updated_at TIMESTAMPTZ,

    updated_by UUID

);

-- ======================================================
-- CHECK CONSTRAINT
-- ======================================================

ALTER TABLE mst_business_partner
ADD CONSTRAINT chk_bp_type
CHECK (
    bp_type IN (
        'CUSTOMER',
        'VENDOR',
        'EMPLOYEE'
    )
);

-- ======================================================
-- INDEX
-- ======================================================

CREATE INDEX idx_bp_code
ON mst_business_partner(bp_code);

CREATE INDEX idx_bp_name
ON mst_business_partner(bp_name);

CREATE INDEX idx_bp_type
ON mst_business_partner(bp_type);

CREATE INDEX idx_bp_status
ON mst_business_partner(status);

-- ======================================================
-- COMMENT
-- ======================================================

COMMENT ON TABLE mst_business_partner IS
'Master Business Partner';

COMMENT ON COLUMN mst_business_partner.bp_code IS
'Business Partner Code';

COMMENT ON COLUMN mst_business_partner.bp_type IS
'CUSTOMER / VENDOR / EMPLOYEE';