/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Migration 002
Master Business Partner
Version : 2.0.0
==========================================================
*/

create table if not exists public.mst_business_partner (

    id bigint generated always as identity primary key,

    bp_code varchar(20) not null unique,

    bp_name varchar(200) not null,

    bp_type varchar(20) not null
        check (
            bp_type in (
                'Customer',
                'Vendor',
                'Employee'
            )
        ),

    top_id bigint,

    phone varchar(50),

    mobile varchar(50),

    email varchar(100),

    website varchar(100),

    contact_person varchar(100),

    address text,

    city varchar(100),

    province varchar(100),

    postal_code varchar(10),

    country varchar(100),

    tax_number varchar(50),

    credit_limit numeric(18,2)
        not null
        default 0,

    remarks text,

    is_active boolean
        not null
        default true,

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now(),

    constraint fk_bp_top
        foreign key (top_id)
        references public.mst_term_of_payment(id)

);