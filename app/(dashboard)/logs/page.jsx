"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import LogFilters from "@/components/logs/LogFilters";
import LogTable from "@/components/logs/LogTable";
import styles from "./logs.module.css";

const DEFAULT_FILTERS = {
  search: "",
  method: "all",
  result: "all",
  dateFrom: "",
  dateTo: "",
};

export default function LogsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [logs, setLogs] = useState([]);
  const [capped, setCapped] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.method !== "all") params.method = filters.method;
      if (filters.result !== "all") params.result = filters.result;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const { data } = await axios.get("/api/access-logs", { params });
      setLogs(data.logs);
      setCapped(data.capped);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchLogs, 300); // debounce search typing
    return () => clearTimeout(timeout);
  }, [fetchLogs]);

  return (
    <div>
      <div className={styles.header}>
        <h3>Access Logs</h3>
        <span className={styles.count}>{loading ? "…" : `${logs.length} result${logs.length === 1 ? "" : "s"}`}</span>
      </div>

      <LogFilters filters={filters} onChange={setFilters} onClear={() => setFilters(DEFAULT_FILTERS)} />

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : (
        <LogTable logs={logs} />
      )}

      {capped && (
        <div className={styles.cappedNote}>
          Showing the most recent 500 matching entries. Narrow your filters to see older records.
        </div>
      )}
    </div>
  );
}
