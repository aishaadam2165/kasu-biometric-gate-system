"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import LogTable from "@/components/logs/LogTable";
import styles from "./reports.module.css";

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("daily");
  const [date, setDate] = useState(today());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/reports/summary", { params: { period, date } });
      setData(data);
    } finally {
      setLoading(false);
    }
  }, [period, date]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const query = new URLSearchParams({ period, date }).toString();

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.periodGroup}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={`${styles.periodButton} ${period === p.key ? styles.periodButtonActive : ""}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <input
          type="date"
          className={styles.dateInput}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className={styles.spacer} />

        <a
          className={`${styles.downloadButton} ${styles.downloadButtonPdf}`}
          href={`/api/reports/pdf?${query}`}
        >
          Download PDF
        </a>
        <a
          className={`${styles.downloadButton} ${styles.downloadButtonExcel}`}
          href={`/api/reports/excel?${query}`}
        >
          Download Excel
        </a>
      </div>

      {loading || !data ? (
        <div className={styles.loading}>Loading…</div>
      ) : (
        <>
          <div className={styles.rangeLabel}>
            {data.label} ({data.from} to {data.to})
          </div>

          <div className={styles.statsRow}>
            <StatCard label="Total Attempts" value={data.stats.total} />
            <StatCard label="Granted" value={data.stats.granted} colorClass={styles.statValueGreen} />
            <StatCard label="Denied" value={data.stats.denied} colorClass={styles.statValueRed} />
            <StatCard label="Fingerprint" value={data.stats.fingerprint} />
            <StatCard label="Face" value={data.stats.face} />
          </div>

          <LogTable logs={data.logs} />

          {data.logsCapped && (
            <div className={styles.previewNote}>
              Preview shows the first 200 entries — the downloaded report
              includes all {data.stats.total} attempts in this period.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, colorClass }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={`${styles.statValue} ${colorClass || ""}`}>{value}</div>
    </div>
  );
}
