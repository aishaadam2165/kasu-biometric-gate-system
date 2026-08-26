"use client";

import { useState } from "react";
import axios from "axios";
import { captureFingerprint } from "@/lib/biometric/fingerprintAdapter";
import ScanOrb from "@/components/gate/ScanOrb";
import LiveCameraFeed from "@/components/gate/LiveCameraFeed";
import ResultDisplay from "@/components/gate/ResultDisplay";
import styles from "./gate.module.css";

/**
 * The public gate/kiosk screen — no admin login required, since this is
 * what students interact with directly at the physical gate.
 *
 * Flow (Chapter 3.7): identify by matric number, then fingerprint-first
 * verification, falling back to facial verification only if fingerprint
 * fails or isn't enrolled. Every attempt is logged server-side regardless
 * of outcome.
 */
export default function GatePage() {
  const [stage, setStage] = useState("identify"); // identify | fingerprint | face | result
  const [matric, setMatric] = useState("");
  const [student, setStudent] = useState(null);
  const [biometricStatus, setBiometricStatus] = useState(null);
  const [orbState, setOrbState] = useState("idle");
  const [error, setError] = useState("");
  const [looking, setLooking] = useState(false);
  const [outcome, setOutcome] = useState(null); // { result, method }
  const [demoOutcome, setDemoOutcome] = useState(undefined); // undefined | "match" | "no-match"

  function resetToIdentify() {
    setStage("identify");
    setMatric("");
    setStudent(null);
    setBiometricStatus(null);
    setOrbState("idle");
    setError("");
    setOutcome(null);
  }

  async function handleIdentify(e) {
    e.preventDefault();
    setError("");
    setLooking(true);
    try {
      const { data } = await axios.get("/api/verify/lookup", { params: { matric } });
      setStudent(data.student);
      setBiometricStatus(data.biometricStatus);
      setStage("fingerprint");
    } catch (err) {
      setError(err?.response?.data?.error || "Student not found.");
    } finally {
      setLooking(false);
    }
  }

  async function handleFingerprintScan() {
    setError("");
    setOrbState("scanning");
    try {
      const { template } = await captureFingerprint();
      const { data } = await axios.post("/api/verify/fingerprint", {
        studentId: student.id,
        matricNumber: student.matricNumber,
        liveTemplate: template,
        forceOutcome: demoOutcome,
      });

      if (data.result === "granted") {
        setOrbState("granted");
        finish("granted", "fingerprint");
        return;
      }

      setOrbState("denied");
      if (biometricStatus.hasFace) {
        setTimeout(() => setStage("face"), 900);
      } else {
        finish("denied", "fingerprint");
      }
    } catch (err) {
      setError("Fingerprint verification failed. Try again.");
      setOrbState("idle");
    }
  }

  async function handleFaceVerify(descriptor) {
    setError("");
    try {
      const { data } = await axios.post("/api/verify/face", {
        studentId: student.id,
        matricNumber: student.matricNumber,
        descriptor,
      });
      finish(data.result, "face");
    } catch (err) {
      setError("Face verification failed. Try again.");
    }
  }

  function finish(result, method) {
    setOutcome({ result, method });
    setStage("result");
    setTimeout(resetToIdentify, 4000);
  }

  return (
    <main className={styles.main}>
      <div className={styles.scanline} />

      {stage === "identify" && (
        <form className={styles.panel} onSubmit={handleIdentify}>
          <img src="/kasu-logo.png" alt="KASU crest" className={styles.logo} />
          <div className={styles.eyebrow}>KADUNA STATE UNIVERSITY</div>
          <h1 className={styles.title}>Gate Access</h1>
          <p className={styles.subtitle}>Enter your matric number to begin verification.</p>

          <div className={styles.divider} />

          <input
            className={styles.input}
            value={matric}
            onChange={(e) => setMatric(e.target.value)}
            placeholder="U20CS1001"
            required
            autoFocus
          />

          <button className={styles.identifyButton} disabled={looking}>
            {looking ? "Looking up…" : "Identify"}
          </button>

          {error && <div className={styles.error}>{error}</div>}
        </form>
      )}

      {stage === "fingerprint" && (
        <div className={styles.panel}>
          <StudentHeader student={student} />

          <div className={styles.stepLabel}>Step 1 of {biometricStatus.hasFace ? 2 : 1} — Fingerprint</div>

          <ScanOrb state={orbState} />

          <button
            className={styles.scanButton}
            onClick={handleFingerprintScan}
            disabled={orbState === "scanning"}
          >
            {orbState === "scanning" ? "Scanning…" : "Scan Fingerprint"}
          </button>

          {orbState === "denied" && biometricStatus.hasFace && (
            <div className={styles.fallbackNote}>Not recognized — switching to facial verification…</div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <DemoControls value={demoOutcome} onChange={setDemoOutcome} />
        </div>
      )}

      {stage === "face" && (
        <div className={styles.panel}>
          <StudentHeader student={student} />
          <div className={styles.stepLabel}>Step 2 of 2 — Facial Verification</div>
          <LiveCameraFeed onVerify={handleFaceVerify} />
          {error && <div className={styles.error}>{error}</div>}
        </div>
      )}

      {stage === "result" && (
        <div className={styles.resultWrapper}>
          <ResultDisplay result={outcome.result} student={student} method={outcome.method} />
        </div>
      )}
    </main>
  );
}

function StudentHeader({ student }) {
  return (
    <div className={styles.studentRow}>
      {student.passportPhoto ? (
        <img src={student.passportPhoto} alt={student.fullName} className={styles.studentPhoto} />
      ) : (
        <div className={styles.studentPhotoPlaceholder}>{student.fullName?.[0]}</div>
      )}
      <div>
        <div className={styles.studentName}>{student.fullName}</div>
        <div className={styles.studentMatric}>{student.matricNumber}</div>
      </div>
    </div>
  );
}

/**
 * Demo-only control to force the mocked fingerprint outcome, so the
 * face-fallback path can be shown reliably during a live defense instead
 * of depending on the simulated ~90% success rate. See
 * lib/biometric/fingerprintAdapter.js for why this exists.
 */
function DemoControls({ value, onChange }) {
  const options = [
    { key: undefined, label: "Auto" },
    { key: "match", label: "Force Match" },
    { key: "no-match", label: "Force No-Match" },
  ];

  return (
    <div className={styles.demoControls}>
      <div className={styles.demoLabel}>DEMO CONTROLS (no physical scanner)</div>
      <div className={styles.demoButtonRow}>
        {options.map((opt) => (
          <button
            key={opt.label}
            className={`${styles.demoButton} ${value === opt.key ? styles.demoButtonActive : ""}`}
            onClick={() => onChange(opt.key)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
