"use client";

import styles from "./ResultDisplay.module.css";

export default function ResultDisplay({ result, student, method }) {
  const granted = result === "granted";

  return (
    <div className={styles.card}>
      <div className={`${styles.banner} ${granted ? styles.bannerGranted : styles.bannerDenied}`}>
        {granted ? "ACCESS GRANTED" : "ACCESS DENIED"}
      </div>

      {student?.passportPhoto ? (
        <img src={student.passportPhoto} alt={student.fullName} className={styles.photo} />
      ) : (
        <div className={styles.photoPlaceholder}>{student?.fullName?.[0] || "?"}</div>
      )}

      <div className={styles.name}>{student?.fullName || "Unknown"}</div>
      <div className={styles.matric}>{student?.matricNumber}</div>

      <div className={styles.method}>Verified via {method}</div>

      <div className={styles.resetHint}>Resetting for next student…</div>
    </div>
  );
}
