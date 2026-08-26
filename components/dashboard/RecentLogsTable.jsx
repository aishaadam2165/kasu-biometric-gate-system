"use client";

import styles from "./RecentLogsTable.module.css";

export default function RecentLogsTable({ logs }) {
  return (
    <div className={styles.panel}>
      <div className={styles.title}>Recent Activity</div>

      {!logs.length ? (
        <div className={styles.empty}>No access attempts recorded yet.</div>
      ) : (
        <div className={styles.list}>
          {logs.map((log) => (
            <div key={log._id} className={styles.row}>
              <div className={styles.rowLeft}>
                <span className={log.result === "granted" ? styles.dotGranted : styles.dotDenied} />
                <span className={styles.name}>{log.student?.fullName || "Unknown"}</span>
                <span className={styles.matric}>{log.matricNumber}</span>
              </div>
              <div className={styles.meta}>
                {log.method} · {log.time}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
