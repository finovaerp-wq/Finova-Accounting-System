/**
 * ==========================================================
 * FINOVA ACCOUNTING SYSTEM
 * Excel Export Service
 * Version : 1.0.0
 * ==========================================================
 */

export class ExcelExportService {

    /**
     * Export data ke Excel
     * @param {Object[]} data
     * @param {String} fileName
     * @param {String} sheetName
     */
    /**
 * Export data ke Excel
 * @param {Object[]} data
 * @param {String} fileName
 * @param {String} sheetName
 */
static export(
    data = [],
    fileName = "Export",
    sheetName = "Sheet1"
) {

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (
        !Array.isArray(data)
        ||
        data.length === 0
    ) {

        window.App?.showWarning?.(
            "No data available to export."
        );

        return;

    }


    /*
======================================================
CURRENT DATE TIME
WIB / ASIA JAKARTA
======================================================
*/

const now =
    new Date();


/*
======================================================
DATE & TIME PARTS
======================================================
*/

const parts =
    new Intl.DateTimeFormat(
        "en-GB",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit",

            hour12:
                false,

            timeZone:
                "Asia/Jakarta"
        }
    )
    .formatToParts(
        now
    );


/*
======================================================
GET PART
======================================================
*/

const getPart =
    type =>
        parts.find(
            part =>
                part.type === type
        )?.value
        ??
        "";


const day =
    getPart(
        "day"
    );


const month =
    getPart(
        "month"
    );


const year =
    getPart(
        "year"
    );


const hour =
    getPart(
        "hour"
    );


const minute =
    getPart(
        "minute"
    );


/*
======================================================
SAFE FILE NAME
======================================================
*/

const safeFileName =
    String(
        fileName
        ||
        "Export"
    )
        .replace(
            /[\\/:*?"<>|]/g,
            ""
        )
        .trim();


/*
======================================================
FINAL FILE NAME
======================================================
*/

const finalFileName =
    `${safeFileName} ` +
    `${day}.${month}.${year} ` +
    `${hour}_${minute} WIB.xlsx`;
    /*
    ======================================================
    CREATE WORKSHEET
    ======================================================
    */

    const worksheet =
        XLSX.utils.json_to_sheet(
            data
        );


    /*
    ======================================================
    CREATE WORKBOOK
    ======================================================
    */

    const workbook =
        XLSX.utils.book_new();


    /*
    ======================================================
    APPEND WORKSHEET
    ======================================================
    */

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sheetName
    );


    /*
    ======================================================
    DOWNLOAD FILE
    ======================================================
    */

    XLSX.writeFile(
        workbook,
        finalFileName
    );

}
}