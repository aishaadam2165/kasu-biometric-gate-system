"use client";

import styles from "./StatsCard.module.css";

const COLOR_CLASS = {
  green: styles.valueGreen,
  red: styles.valueRed,
  cyan: styles.valueCyan,
  amber: styles.valueAmber,
};

export default function StatsCard({ label, value, color, sublabel }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.value} ${COLOR_CLASS[color] || ""}`}>{value}</div>
      {sublabel && <div className={styles.sublabel}>{sublabel}</div>}
    </div>
  );
}
