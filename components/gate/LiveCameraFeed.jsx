"use client";

import { useEffect, useRef, useState } from "react";
import { loadFaceApiModels, faceapi } from "@/lib/biometric/faceapiLoader";
import styles from "./LiveCameraFeed.module.css";

/**
 * One-shot face descriptor capture for gate verification.
 *
 * Face-api is loaded only in the browser to prevent Next.js SSR
 * from evaluating the face-api package on the server.
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
        setError("");

        await loadFaceApiModels();

        if (cancelled) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setReady(true);
      } catch (err) {
        console.error("Face camera initialization error:", err);

        if (cancelled) return;

        setError(
          err?.name === "NotAllowedError"
            ? "Camera access denied. Allow permission and reload."
            : "Could not start camera or load face models."
        );
      }
    }

    init();

    return () => {
      cancelled = true;

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    };
  }, []);

  async function handleVerify() {
    if (!videoRef.current || verifying || disabled) {
      return;
    }

    setError("");
    setVerifying(true);

    try {
     const faceapi = await getLoadedFaceApi();

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError(
          "No face detected. Face the camera directly and try again."
        );
        setVerifying(false);
        return;
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;

      await onVerify(Array.from(detection.descriptor));

      setVerifying(false);
    } catch (err) {
      console.error("Face verification error:", err);

      setError("Face verification failed. Try again.");
      setVerifying(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.videoBox}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={styles.video}
        />

        {!ready && (
          <div className={styles.overlay}>
            {error ? "—" : "Loading camera…"}
          </div>
        )}
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