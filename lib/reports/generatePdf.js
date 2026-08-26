import PDFDocument from "pdfkit";

const COLUMNS = [
  { label: "Date", width: 60, key: "date" },
  { label: "Time", width: 50, key: "time" },
  { label: "Matric No", width: 95, key: "matricNumber" },
  { label: "Student", width: 120, key: "studentName" },
  { label: "Method", width: 65, key: "method" },
  { label: "Result", width: 60, key: "result" },
];

const PAGE_BOTTOM = 730;

/**
 * Builds the access report as a PDF buffer. Runs entirely server-side
 * (Node runtime, not Edge) since pdfkit needs Node APIs.
 */
export function generateAccessReportPdf({ logs, stats, label, from, to }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).text("KASU Biometric Gate Access", { align: "center" });
    doc.fontSize(12).text(label, { align: "center" });
    doc.moveDown(1);

    doc.fontSize(9).fillColor("#555");
    doc.text(`Period: ${from} to ${to}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.fillColor("#000");
    doc.moveDown(1);

    doc.fontSize(11).text("Summary", { underline: true });
    doc.fontSize(10);
    doc.text(`Total Attempts: ${stats.total}`);
    doc.text(`Granted: ${stats.granted}    Denied: ${stats.denied}`);
    doc.text(`Fingerprint Attempts: ${stats.fingerprint}    Face Attempts: ${stats.face}`);
    doc.moveDown(1);

    doc.fontSize(11).text("Access Attempts", { underline: true });
    doc.moveDown(0.5);

    drawTableHeader(doc);

    doc.fontSize(9);
    logs.forEach((log) => {
      if (doc.y > PAGE_BOTTOM) {
        doc.addPage();
        drawTableHeader(doc);
        doc.fontSize(9);
      }
      drawTableRow(doc, {
        date: log.date,
        time: log.time,
        matricNumber: log.matricNumber,
        studentName: log.student?.fullName || "—",
        method: log.method,
        result: log.result,
      });
    });

    if (!logs.length) {
      doc.fontSize(10).fillColor("#888").text("No access attempts in this period.");
    }

    doc.end();
  });
}

function drawTableHeader(doc) {
  const startX = doc.x;
  let y = doc.y;
  let x = startX;

  doc.fontSize(9).fillColor("#333");
  COLUMNS.forEach((col) => {
    doc.text(col.label, x, y, { width: col.width });
    x += col.width;
  });

  y += 14;
  doc
    .moveTo(startX, y)
    .lineTo(startX + COLUMNS.reduce((sum, c) => sum + c.width, 0), y)
    .strokeColor("#ccc")
    .stroke();

  doc.fillColor("#000");
  doc.y = y + 4;
}

function drawTableRow(doc, row) {
  const startX = doc.x;
  let x = startX;
  const y = doc.y;

  COLUMNS.forEach((col) => {
    doc.text(String(row[col.key] ?? ""), x, y, { width: col.width });
    x += col.width;
  });

  doc.y = y + 14;
}
