import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/middleware";
import { getReportData } from "@/lib/reports/queryLogs";
import { generateAccessReportPdf } from "@/lib/reports/generatePdf";

/**
 * GET /api/reports/pdf?period=daily|weekly|monthly&date=YYYY-MM-DD
 *
 * Downloaded via plain browser navigation (an <a> tag), not fetch/axios —
 * the httpOnly session cookie travels automatically with that request,
 * and Content-Disposition triggers the browser's native save dialog.
 */
export async function GET(request) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "daily";
  const date = searchParams.get("date");

  const reportData = await getReportData(period, date);
  const pdfBuffer = await generateAccessReportPdf(reportData);

  const filename = `access-report-${period}-${reportData.from}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
