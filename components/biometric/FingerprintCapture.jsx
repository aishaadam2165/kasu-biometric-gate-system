"use client";

import { useState } from "react";
import { captureFingerprint } from "@/lib/biometric/fingerprintAdapter";
import styles from "./FingerprintCapture.module.css";

/**
 * Mock fingerprint capture UI. Calls the same captureFingerprint()
 * interface a real DigitalPersona SDK integration would use — see
 * lib/biometric/fingerprintAdapter.js for why this is mocked and how it
 * would be swapped for real hardware later.
 */
export default function FingerprintCapture({ onCaptured, captured }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  async function handleScan() {
    setError("");
    setScanning(true);
    try {
      const result = await captureFingerprint();
      onCaptured(result);
    } catch (err) {
      setError(err.message || "Fingerprint capture failed.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.scannerBox}>
        <div
          className={`${styles.pad} ${scanning ? styles.padScanning : ""} ${
            captured ? styles.padCaptured : ""
          }`}
        >
          {scanning ? "SCANNING…" : captured ? "✓" : "READY"}
        </div>
      </div>

      {captured ? (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Quality Score</span>
            <span className={styles.resultValue}>{captured.quality}%</span>
          </div>
          <button className={styles.retryButton} onClick={handleScan} disabled={scanning}>
            Re-scan
          </button>
        </div>
      ) : (
        <button className={styles.scanButton} onClick={handleScan} disabled={scanning}>
          {scanning ? "Scanning…" : "Simulate Fingerprint Scan"}
        </button>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <p className={styles.hint}>
        No physical scanner is connected in this environment, so capture is
        simulated. See the README for how this swaps to a real
        DigitalPersona U.are.U 4500 scanner.
      </p>
    </div>
  );
}
