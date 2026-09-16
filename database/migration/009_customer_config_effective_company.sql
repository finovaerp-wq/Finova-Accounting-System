/*
==========================================================
FINOVA ACCOUNTING SYSTEM
CUSTOMER CONFIGURATION
EFFECTIVE COMPANY CONTEXT

Migration : 009
==========================================================
*/


create or replace function public.finova_current_company_config()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$

    select jsonb_build_object(

        /*
        ==================================================
        COMPANY
        ==================================================
        */

        'company', jsonb_build_object(

            'id',
                c.id,

            'code',
                c.company_code,

            'name',
                c.company_name,

            'legalName',
                c.legal_name,

            'email',
                c.email,

            'phone',
                c.phone,

            'address',
                c.address,

            'status',
                c.status

        ),


        /*
        ==================================================
        ACCOUNTING
        ==================================================
        */

        'accounting', jsonb_build_object(

            'baseCurrency',
                s.base_currency,

            'fiscalYearStartMonth',
                s.fiscal_year_start_month

        ),


        /*
        ==================================================
        LOCALIZATION
        ==================================================
        */

        'localization', jsonb_build_object(

            'locale',
                s.locale,

            'timezone',
                s.timezone,

            'dateFormat',
                s.date_format,

            'numberFormat',
                s.number_format

        ),


        /*
        ==================================================
        FEATURES
        ==================================================
        */

        'features', jsonb_build_object(

            'accountPayable',
                s.ap_enabled,

            'accountReceivable',
                s.ar_enabled,

            'tax',
                s.tax_enabled,

            'multiCurrency',
                s.multi_currency_enabled

        ),


        /*
        ==================================================
        NUMBERING
        ==================================================
        */

        'numbering', jsonb_build_object(

            'apPrefix',
                s.document_prefix_ap,

            'arPrefix',
                s.document_prefix_ar,

            'glPrefix',
                s.document_prefix_gl,

            'apPaymentPrefix',
                s.document_prefix_ap_payment,

            'arPaymentPrefix',
                s.document_prefix_ar_payment

        ),


        /*
        ==================================================
        BRANDING
        ==================================================
        */

        'branding', jsonb_build_object(

            'logoUrl',
                s.logo_url,

            'primaryColor',
                s.primary_color

        ),


        /*
        ==================================================
        EXTRA CONFIG
        ==================================================
        */

        'extra',
            s.extra_config

    )

    from public.finova_companies c

    inner join public.finova_company_settings s
        on s.company_id = c.id

    where
        c.id =
            public.finova_effective_company_id()

    limit 1;

$$;


/*
==========================================================
PERMISSION
==========================================================
*/

revoke all
on function public.finova_current_company_config()
from public;


grant execute
on function public.finova_current_company_config()
to authenticated;