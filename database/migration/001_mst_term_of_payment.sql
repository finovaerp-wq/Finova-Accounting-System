/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Seed Master Term Of Payment
==========================================================
*/

insert into public.mst_term_of_payment
(
    top_code,
    top_name,
    days,
    description
)
values

('COD','Cash On Delivery',0,'Cash payment'),

('TOP7','Net 7 Days',7,'Payment within 7 days'),

('TOP14','Net 14 Days',14,'Payment within 14 days'),

('TOP30','Net 30 Days',30,'Payment within 30 days'),

('TOP45','Net 45 Days',45,'Payment within 45 days'),

('TOP60','Net 60 Days',60,'Payment within 60 days'),

('TOP90','Net 90 Days',90,'Payment within 90 days')

on conflict (top_code)
do nothing;