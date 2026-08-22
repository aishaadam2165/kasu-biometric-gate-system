import AccessLog from "@/models/AccessLog";
import { getReportRange } from "./dateRange";

/**
 * Fetches AccessLog entries and summary stats for a report period.
 * Shared by the summary preview endpoint and both export endpoints so
 * the numbers a report shows always match what an admin previewed.
 */
export async function getReportData(period, date) {
  const { from, to, label } = getReportRange(period, date);

  const logs = await AccessLog.find({ date: { $gte: from, $lte: to } })
    .populate("student", "fullName department")
    .sort({ date: 1, time: 1 });

  const stats = {
    total: logs.length,
    granted: logs.filter((l) => l.result === "granted").length,
    denied: logs.filter((l) => l.result === "denied").length,
    fingerprint: logs.filter((l) => l.method === "fingerprint").length,
    face: logs.filter((l) => l.method === "face").length,
  };

  return { logs, stats, from, to, label };
}
