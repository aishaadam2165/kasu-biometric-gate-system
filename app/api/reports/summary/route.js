import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/middleware";
import { getReportData } from "@/lib/reports/queryLogs";

const PREVIEW_LIMIT = 200;

/**
 * GET /api/reports/summary?period=daily|weekly|monthly&date=YYYY-MM-DD
 * Returns stats + a capped preview of matching logs, so the reports page
 * can show what a PDF/Excel export would contain before downloading it.
 * Stats are computed from the full matching set, not just the preview.
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

  const { logs, stats, from, to, label } = await getReportData(period, date);

  return NextResponse.json({
    stats,
    from,
    to,
    label,
    logs: logs.slice(0, PREVIEW_LIMIT),
    logsCapped: logs.length > PREVIEW_LIMIT,
  });
}
