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
    static export(data = [], fileName = "Export", sheetName = "Sheet1") {

        if (!Array.isArray(data) || data.length === 0) {
            alert("No data available to export.");
            return;
        }

        // Buat worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Buat workbook
        const workbook = XLSX.utils.book_new();

        // Tambahkan worksheet
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            sheetName
        );

        // Download file
        XLSX.writeFile(
            workbook,
            `${fileName}.xlsx`
        );
    }

}