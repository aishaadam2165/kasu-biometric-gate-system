"use client";

import { useEffect, useRef, useState } from "react";
import { loadFaceApiModels, faceapi } from "@/lib/biometric/faceapiLoader";
import styles from "./LiveCameraFeed.module.css";

/**
 * One-shot face descriptor capture for gate verification. Unlike
 * FaceCapture.jsx (used at enrolment), this doesn't save an image — it
 * only extracts a descriptor to send for 1:1 comparison against the
 * already-identified student's stored embedding.
 */
export default function LiveCameraFeed({ onVerify, disabled }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await loadFaceApiModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      } catch (err) {
        setError(
          err.name === "NotAllowedError"
            ? "Camera access denied. Allow permission and reload."
            : "Could not start camera or load face models."
        );
      }
    }

    init();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function handleVerify() {
    setError("");
    setVerifying(true);
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError("No face detected. Face the camera directly and try again.");
        setVerifying(false);
        return;
      }

      streamRef.current?.getTracks().forEach((t) => t.stop());
      await onVerify(Array.from(detection.descriptor));
    } catch (err) {
      setError("Face verification failed. Try again.");
      setVerifying(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.videoBox}>
        <video ref={videoRef} autoPlay muted playsInline className={styles.video} />
        {!ready && <div className={styles.overlay}>{error ? "—" : "Loading camera…"}</div>}
      </div>

      <button
        className={styles.verifyButton}
        onClick={handleVerify}
        disabled={!ready || verifying || disabled}
      >
        {verifying ? "Verifying…" : "Verify Face"}
      </button>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
