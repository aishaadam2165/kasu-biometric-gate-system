"use client";

import { useState } from "react";
import axios from "axios";
import FingerprintCapture from "./FingerprintCapture";
import FaceCapture from "./FaceCapture";
import styles from "./EnrollmentStepper.module.css";

const STEPS = [
  { key: "fingerprint", label: "Fingerprint" },
  { key: "face", label: "Facial Capture" },
];

/**
 * Orchestrates the two-step enrolment flow (Chapter 3.7): fingerprint
 * capture, then facial capture. Each step is saved to the Biometric
 * collection as soon as it's captured, rather than batched at the end —
 * so an admin who completes only one step today can resume the other
 * later without losing progress.
 */
export default function EnrollmentStepper({ studentId, initialStatus }) {
  const [stepIndex, setStepIndex] = useState(initialStatus?.hasFingerprint ? 1 : 0);
  const [fingerprintCaptured, setFingerprintCaptured] = useState(
    initialStatus?.hasFingerprint
      ? { quality: initialStatus.fingerprintQuality, alreadySaved: true }
      : null
  );
  const [faceCaptured, setFaceCaptured] = useState(
    initialStatus?.hasFace ? { alreadySaved: true } : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(Boolean(initialStatus?.hasFingerprint && initialStatus?.hasFace));

  async function handleFingerprintCaptured(result) {
    setFingerprintCaptured(result);
    setError("");
    setSaving(true);
    try {
      await axios.post("/api/biometrics/fingerprint/enroll", {
        studentId,
        template: result.template,
        quality: result.quality,
      });
      setStepIndex(1);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save fingerprint.");
      setFingerprintCaptured(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleFaceCaptured(result) {
    if (result === null) {
      setFaceCaptured(null);
      return;
    }

    setFaceCaptured(result);
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("studentId", studentId);
      formData.append("descriptor", JSON.stringify(result.descriptor));
      formData.append("faceImage", result.imageFile);

      const { data } = await axios.post("/api/biometrics/face/enroll", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDone(Boolean(data.isEnrolled));
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save face capture.");
      setFaceCaptured(null);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className={styles.doneBox}>
        <div className={styles.doneIcon}>✓</div>
        <h3 className={styles.doneTitle}>Enrolment Complete</h3>
        <p className={styles.doneText}>
          Both fingerprint and facial biometrics are saved. This student can
          now be verified at the gate.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.stepper}>
        {STEPS.map((step, i) => (
          <div key={step.key} className={styles.stepItem}>
            <div
              className={`${styles.stepDot} ${i === stepIndex ? styles.stepDotActive : ""} ${
                i < stepIndex ? styles.stepDotDone : ""
              }`}
            >
              {i < stepIndex ? "✓" : i + 1}
            </div>
            <span className={i === stepIndex ? styles.stepLabelActive : styles.stepLabel}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.stepContent}>
        {stepIndex === 0 && (
          <FingerprintCapture onCaptured={handleFingerprintCaptured} captured={fingerprintCaptured} />
        )}
        {stepIndex === 1 && (
          <FaceCapture onCaptured={handleFaceCaptured} captured={faceCaptured} />
        )}
      </div>

      {saving && <div className={styles.saving}>Saving…</div>}
    </div>
  );
}
