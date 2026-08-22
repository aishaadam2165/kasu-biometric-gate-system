"use client";

import styles from "./LogTable.module.css";

export default function LogTable({ logs }) {
  if (!logs.length) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>No access attempts match this search or filter.</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Time</th>
            <th className={styles.th}>Matric No.</th>
            <th className={styles.th}>Student</th>
            <th className={styles.th}>Method</th>
            <th className={styles.th}>Result</th>
            <th className={styles.th}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id} className={styles.row}>
              <td className={`${styles.td} ${styles.mono}`}>{log.date}</td>
              <td className={`${styles.td} ${styles.mono}`}>{log.time}</td>
              <td className={`${styles.td} ${styles.mono}`}>{log.matricNumber}</td>
              <td className={styles.td}>{log.student?.fullName || "—"}</td>
              <td className={styles.td}>
                <span className={styles.methodTag}>{log.method}</span>
              </td>
              <td className={styles.td}>
                <span
                  className={`${styles.badge} ${
                    log.result === "granted" ? styles.badgeGranted : styles.badgeDenied
                  }`}
                >
                  {log.result}
                </span>
              </td>
              <td className={`${styles.td} ${styles.remarks}`}>{log.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
