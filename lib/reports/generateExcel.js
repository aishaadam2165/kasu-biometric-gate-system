import ExcelJS from "exceljs";

/**
 * Builds the access report as an .xlsx buffer.
 */
export async function generateAccessReportExcel({ logs, stats, label, from, to }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KASU Biometric Gate Access";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Access Report");

  sheet.mergeCells("A1:H1");
  sheet.getCell("A1").value = label;
  sheet.getCell("A1").font = { size: 14, bold: true };

  sheet.getCell("A2").value = `Period: ${from} to ${to}`;
  sheet.getCell("A3").value = `Generated: ${new Date().toLocaleString()}`;

  sheet.getCell("A5").value = "Summary";
  sheet.getCell("A5").font = { bold: true };

  const summaryRows = [
    ["Total Attempts", stats.total],
    ["Granted", stats.granted],
    ["Denied", stats.denied],
    ["Fingerprint Attempts", stats.fingerprint],
    ["Face Attempts", stats.face],
  ];
  summaryRows.forEach(([label, value], i) => {
    sheet.getCell(6 + i, 1).value = label;
    sheet.getCell(6 + i, 2).value = value;
  });

  const headerRowNum = 6 + summaryRows.length + 1;
  const headers = ["Date", "Time", "Matric Number", "Student", "Department", "Method", "Result", "Remarks"];
  headers.forEach((h, i) => {
    const cell = sheet.getCell(headerRowNum, i + 1);
    cell.value = h;
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8ECF2" } };
  });

  logs.forEach((log, idx) => {
    const rowNum = headerRowNum + 1 + idx;
    sheet.getCell(rowNum, 1).value = log.date;
    sheet.getCell(rowNum, 2).value = log.time;
    sheet.getCell(rowNum, 3).value = log.matricNumber;
    sheet.getCell(rowNum, 4).value = log.student?.fullName || "";
    sheet.getCell(rowNum, 5).value = log.student?.department || "";
    sheet.getCell(rowNum, 6).value = log.method;
    sheet.getCell(rowNum, 7).value = log.result;
    sheet.getCell(rowNum, 8).value = log.remarks || "";
  });

  sheet.columns.forEach((col) => {
    col.width = 18;
  });

  return workbook.xlsx.writeBuffer();
}
