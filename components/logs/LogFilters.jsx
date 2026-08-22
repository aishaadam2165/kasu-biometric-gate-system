"use client";

import styles from "./LogFilters.module.css";

export default function LogFilters({ filters, onChange, onClear }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className={styles.bar}>
      <input
        className={styles.search}
        placeholder="Search by matric number…"
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
      />

      <select
        className={styles.select}
        value={filters.method}
        onChange={(e) => update("method", e.target.value)}
      >
        <option value="all">All Methods</option>
        <option value="fingerprint">Fingerprint</option>
        <option value="face">Face</option>
      </select>

      <select
        className={styles.select}
        value={filters.result}
        onChange={(e) => update("result", e.target.value)}
      >
        <option value="all">All Results</option>
        <option value="granted">Granted</option>
        <option value="denied">Denied</option>
      </select>

      <div>
        <span className={styles.dateLabel}>From</span>
        <input
          type="date"
          className={styles.dateInput}
          value={filters.dateFrom}
          onChange={(e) => update("dateFrom", e.target.value)}
        />
      </div>

      <div>
        <span className={styles.dateLabel}>To</span>
        <input
          type="date"
          className={styles.dateInput}
          value={filters.dateTo}
          onChange={(e) => update("dateTo", e.target.value)}
        />
      </div>

      <button className={styles.clearButton} onClick={onClear}>
        Clear Filters
      </button>
    </div>
  );
}
