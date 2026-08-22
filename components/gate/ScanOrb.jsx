"use client";

import styles from "./ScanOrb.module.css";

const STATE_CLASS = {
  idle: { orb: styles.idle, label: styles.stateIdle, text: "READY" },
  scanning: { orb: styles.scanning, label: styles.stateScanning, text: "SCANNING…" },
  granted: { orb: styles.granted, label: styles.stateGranted, text: "GRANTED" },
  denied: { orb: styles.denied, label: styles.stateDenied, text: "DENIED" },
};

export default function ScanOrb({ state = "idle" }) {
  const s = STATE_CLASS[state] || STATE_CLASS.idle;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.orb} ${s.orb}`}>
        <div className={styles.innerDot} />
      </div>
      <div className={`${styles.label} ${s.label}`}>{s.text}</div>
    </div>
  );
}
