"use client";

import Link from "next/link";
import styles from "./StudentTable.module.css";

export default function StudentTable({ students }) {
  if (!students.length) {
    return <div className={styles.empty}>No students match this search or filter.</div>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Matric No.</th>
          <th className={styles.th}>Name</th>
          <th className={styles.th}>Department</th>
          <th className={styles.th}>Level</th>
          <th className={styles.th}>Enrolled</th>
          <th className={styles.th}>Status</th>
          <th className={styles.th}></th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s._id} className={styles.row}>
            <td className={`${styles.td} ${styles.mono}`}>{s.matricNumber}</td>
            <td className={styles.td}>{s.fullName}</td>
            <td className={styles.td}>{s.department}</td>
            <td className={styles.td}>{s.level}</td>
            <td className={styles.td}>
              <span className={`${styles.badge} ${s.isEnrolled ? styles.badgeGreen : styles.badgeAmber}`}>
                {s.isEnrolled ? "Enrolled" : "Not enrolled"}
              </span>
            </td>
            <td className={styles.td}>
              <span className={`${styles.badge} ${s.isActive ? styles.badgeGreen : styles.badgeRed}`}>
                {s.isActive ? "Active" : "Deactivated"}
              </span>
            </td>
            <td className={styles.td}>
              <Link href={`/students/${s._id}`} className={styles.link}>
                View →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
