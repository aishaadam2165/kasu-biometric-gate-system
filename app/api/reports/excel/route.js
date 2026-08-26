import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/middleware";
import { getReportData } from "@/lib/reports/queryLogs";
import { generateAccessReportExcel } from "@/lib/reports/generateExcel";

/**
 * GET /api/reports/excel?period=daily|weekly|monthly&date=YYYY-MM-DD
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
  const excelBuffer = await generateAccessReportExcel(reportData);

  const filename = `access-report-${period}-${reportData.from}.xlsx`;

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
