/**
 * Computes the date range for a report period, anchored to a reference
 * date (defaults to today). Dates are returned as "YYYY-MM-DD" strings
 * to match how AccessLog.date is stored, so range queries stay simple
 * lexicographic comparisons.
 */
function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

export function getReportRange(period, referenceDateStr) {
  const ref = referenceDateStr ? new Date(`${referenceDateStr}T00:00:00`) : new Date();

  if (period === "weekly") {
    const day = ref.getDay(); // 0 = Sunday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      from: formatDate(monday),
      to: formatDate(sunday),
      label: `Weekly Report — ${formatDate(monday)} to ${formatDate(sunday)}`,
    };
  }

  if (period === "monthly") {
    const first = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const last = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    const monthLabel = ref.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return {
      from: formatDate(first),
      to: formatDate(last),
      label: `Monthly Report — ${monthLabel}`,
    };
  }

  // default: daily
  const day = formatDate(ref);
  return { from: day, to: day, label: `Daily Report — ${day}` };
}
