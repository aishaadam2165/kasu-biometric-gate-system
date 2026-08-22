import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Student from "@/models/Student";
import AccessLog from "@/models/AccessLog";
import { requireAdmin } from "@/lib/auth/middleware";

const RECENT_LOG_LIMIT = 8;
const CHART_DAYS = 7;

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * GET /api/dashboard/stats
 *
 * Powers the admin dashboard: student counts, today's attempt breakdown,
 * a 7-day granted/denied series for the activity chart, and the most
 * recent log entries. Admin-only.
 */
export async function GET(request) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const todayStr = formatDate(new Date());

  const [totalStudents, activeStudents, enrolledStudents, todayLogs, recentLogs] = await Promise.all([
    Student.countDocuments({}),
    Student.countDocuments({ isActive: true }),
    Student.countDocuments({ isEnrolled: true }),
    AccessLog.find({ date: todayStr }),
    AccessLog.find({}).sort({ createdAt: -1 }).limit(RECENT_LOG_LIMIT).populate("student", "fullName"),
  ]);

  const todayGranted = todayLogs.filter((l) => l.result === "granted").length;
  const todayDenied = todayLogs.filter((l) => l.result === "denied").length;

  // Build the last CHART_DAYS dates (oldest first) for a dense series,
  // filling in zero-count days rather than skipping them.
  const chartDates = [];
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    chartDates.push(formatDate(d));
  }

  const earliestDate = chartDates[0];
  const grouped = await AccessLog.aggregate([
    { $match: { date: { $gte: earliestDate } } },
    { $group: { _id: { date: "$date", result: "$result" }, count: { $sum: 1 } } },
  ]);

  const countMap = {};
  grouped.forEach((g) => {
    const { date, result } = g._id;
    countMap[date] = countMap[date] || { granted: 0, denied: 0 };
    countMap[date][result] = g.count;
  });

  const chartData = chartDates.map((date) => ({
    date,
    granted: countMap[date]?.granted || 0,
    denied: countMap[date]?.denied || 0,
  }));

  return NextResponse.json({
    totalStudents,
    activeStudents,
    enrolledStudents,
    todayAttempts: todayLogs.length,
    todayGranted,
    todayDenied,
    chartData,
    recentLogs,
  });
}
