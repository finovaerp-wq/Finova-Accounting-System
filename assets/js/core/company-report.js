/*
==========================================================
FINOVA ACCOUNTING SYSTEM
CORE    : COMPANY REPORT
FILE    : company-report.js
VERSION : 1.0.0
==========================================================

PURPOSE

Centralized company identity for:

- Preview HTML
- Download Excel
- Printed Reports
- Financial Reports
- Transaction Documents

FINOVA remains the PRODUCT BRAND.

Company identity comes from the current tenant
through CustomerConfig.

IMPORTANT

Company Code is intentionally NOT displayed
in report output.

==========================================================
*/


import {
    CustomerConfig
} from "./customer-config.js";


export class CompanyReport {


    /*
    ==========================================================
    PRODUCT BRAND
    ==========================================================
    */

    static getBrandName() {

        return "FINOVA ACCOUNTING SYSTEM";

    }


    /*
    ==========================================================
    GET COMPANY IDENTITY
    ==========================================================

    This is the main source used by reports.

    DO NOT query Supabase directly from individual reports.

    ==========================================================
    */

    static getIdentity() {

        try {

            /*
            ==================================================
            CUSTOMER CONFIG NOT READY
            ==================================================
            */

            if (
                !CustomerConfig.isInitialized()
            ) {

                return {

                    brand:
                        this.getBrandName(),

                    name:
                        "",

                    legalName:
                        "",

                    displayName:
                         "",

                    address:
                        "",

                    email:
                        "",

                    phone:
                        "",

                    contactLine:
                        ""

                };

            }


            /*
            ==================================================
            COMPANY DATA
            ==================================================
            */

            const name =

                CustomerConfig.getCompanyName()

                ||

                "";


            const legalName =

                CustomerConfig.getLegalName()

                ||

                name

                ||

                "";


            const address =

                CustomerConfig.getCompanyAddress()

                ||

                "";


            const email =

                CustomerConfig.getCompanyEmail()

                ||

                "";


            const phone =

                CustomerConfig.getCompanyPhone()

                ||

                "";


            /*
            ==================================================
            CONTACT LINE
            ==================================================
            */

            const contactLine =

                [
                    address,
                    phone,
                    email
                ]

                .filter(
                    Boolean
                )

                .join(
                    " | "
                );


            /*
            ==================================================
            RETURN
            ==================================================
            */

            return {

                brand:
                    this.getBrandName(),

                name,

                legalName,

                displayName:
    legalName
    ||
    name
    ||
    "",

                address,

                email,

                phone,

                contactLine

            };

        }
        catch (error) {

            console.error(
                "CompanyReport.getIdentity:",
                error
            );


            /*
            ==================================================
            SAFE FALLBACK
            ==================================================
            */

            return {

                brand:
                    this.getBrandName(),

                name:
                    "",

                legalName:
                    "",

                displayName:
    "",

                address:
                    "",

                email:
                    "",

                phone:
                    "",

                contactLine:
                    ""

            };

        }

    }


    /*
    ==========================================================
    GET COMPANY DISPLAY NAME
    ==========================================================
    */

    static getCompanyName() {

    return (
        this.getIdentity().displayName
        ||
        ""
    );

}


    /*
    ==========================================================
    GET CONTACT LINE
    ==========================================================
    */

    static getContactLine() {

        return (
            this.getIdentity().contactLine
            ||
            ""
        );

    }


    /*
    ==========================================================
    HTML ESCAPE
    ==========================================================

    Company data comes from database.

    Always escape before inserting into HTML preview.

    ==========================================================
    */

    static escapeHTML(
        value
    ) {

        return String(
            value
            ??
            ""
        )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

    }


    /*
    ==========================================================
    BUILD HTML REPORT HEADER
    ==========================================================

    Example:

    CompanyReport.renderHTMLHeader({
        title: "GENERAL LEDGER",
        period: "Period : 01-01-2026 to 31-12-2026",
        generated: "Print Date : ..."
    });

    ==========================================================
    */

    static renderHTMLHeader(
        options = {}
    ) {

        const {

            title = "",

            period = "",

            generated = ""

        } = options;


        const company =
            this.getIdentity();


        return `

            <div class="report-header">


                <div class="finova-brand">

                    ${
                        this.escapeHTML(
                            company.brand
                        )
                    }

                </div>


                ${
    company.displayName

        ? `

            <div class="company">

                ${
                    this.escapeHTML(
                        company.displayName
                    )
                }

            </div>

        `

        : ""
}


                ${
                    company.contactLine

                        ? `

                            <div class="company-contact">

                                ${
                                    this.escapeHTML(
                                        company.contactLine
                                    )
                                }

                            </div>

                        `

                        : ""
                }


                ${
                    title

                        ? `

                            <div class="title">

                                ${
                                    this.escapeHTML(
                                        title
                                    )
                                }

                            </div>

                        `

                        : ""
                }


                ${
                    period

                        ? `

                            <div class="period">

                                ${
                                    this.escapeHTML(
                                        period
                                    )
                                }

                            </div>

                        `

                        : ""
                }


                ${
                    generated

                        ? `

                            <div class="generated">

                                ${
                                    this.escapeHTML(
                                        generated
                                    )
                                }

                            </div>

                        `

                        : ""
                }


            </div>

        `;

    }


    /*
    ==========================================================
    BUILD EXCEL HEADER ROWS
    ==========================================================

    Returned value is ready for:

    XLSX.utils.aoa_to_sheet()

    ==========================================================
    */

    static getExcelHeaderRows(
        options = {}
    ) {

        const {

            title = "",

            period = ""

        } = options;


        const company =
            this.getIdentity();


        const rows =
            [];


        /*
        ======================================================
        FINOVA BRAND
        ======================================================
        */

        rows.push(
            [
                company.brand
            ]
        );


        /*
======================================================
COMPANY
======================================================
*/

if (
    company.displayName
) {

    rows.push(
        [
            company.displayName
        ]
    );

}


        /*
        ======================================================
        CONTACT
        ======================================================
        */

        if (
            company.contactLine
        ) {

            rows.push(
                [
                    company.contactLine
                ]
            );

        }


        /*
        ======================================================
        REPORT TITLE
        ======================================================
        */

        if (
            title
        ) {

            rows.push(
                [
                    title
                ]
            );

        }


        /*
        ======================================================
        PERIOD
        ======================================================
        */

        if (
            period
        ) {

            rows.push(
                [
                    period
                ]
            );

        }


        return rows;

    }


    /*
    ==========================================================
    DEBUG
    ==========================================================
    */

    static debug() {

        const identity =
            this.getIdentity();


        console.log(
            "FINOVA COMPANY REPORT:",
            identity
        );


        return identity;

    }

}


export default CompanyReport;