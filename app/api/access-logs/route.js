import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import AccessLog from "@/models/AccessLog";
import { requireAdmin } from "@/lib/auth/middleware";

const MAX_RESULTS = 500;

/**
 * GET /api/access-logs?search=&method=&result=&dateFrom=&dateTo=
 *
 * search    - matches matric number (partial, case-insensitive)
 * method    - "fingerprint" | "face" | omitted for all
 * result    - "granted" | "denied" | omitted for all
 * dateFrom  - "YYYY-MM-DD", inclusive
 * dateTo    - "YYYY-MM-DD", inclusive
 *
 * Admin-only, per Chapter 3.9.5 (access logs are an admin-facing audit
 * feature) — unlike /api/verify/*, which is intentionally public for the
 * gate kiosk.
 */
export async function GET(request) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const method = searchParams.get("method");
  const result = searchParams.get("result");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const query = {};

  if (search) {
    query.matricNumber = { $regex: search, $options: "i" };
  }
  if (method && method !== "all") {
    query.method = method;
  }
  if (result && result !== "all") {
    query.result = result;
  }
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = dateFrom;
    if (dateTo) query.date.$lte = dateTo;
  }

  const logs = await AccessLog.find(query)
    .populate("student", "fullName")
    .sort({ createdAt: -1 })
    .limit(MAX_RESULTS);

  return NextResponse.json({ logs, capped: logs.length === MAX_RESULTS });
}
