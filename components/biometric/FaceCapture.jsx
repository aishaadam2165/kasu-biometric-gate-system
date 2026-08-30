"use client";

import { useEffect, useRef, useState } from "react";
import { loadFaceApiModels, getLoadedFaceApi } from "@/lib/biometric/faceapiLoader";
import styles from "./FaceCapture.module.css";

/**
 * Live webcam facial capture. Loads face-api.js models, streams the
 * webcam into a <video>, and on capture runs detection + landmark +
 * descriptor extraction on the current frame. The descriptor (128 floats)
 * is what gets stored and later compared during verification (Step 5);
 * the snapshot image is stored only for the admin's visual reference.
 */
export default function FaceCapture({ onCaptured, captured }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await loadFaceApiModels();
        if (cancelled) return;
        setModelsReady(true);

        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraReady(true);
      } catch (err) {
        console.error("Face capture init error:", err);
        setError(
          err.name === "NotAllowedError"
            ? "Camera access was denied. Allow camera permission and reload."
            : "Could not load face detection models or camera. Check your internet connection."
        );
      }
    }

    if (!captured) init();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [captured]);

  async function handleCapture() {
    setError("");
    setCapturing(true);
    try {
      const faceapi = await getLoadedFaceApi();

const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError("No face detected. Face the camera directly and try again.");
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      const imageFile = new File([blob], "face-capture.jpg", { type: "image/jpeg" });

      streamRef.current?.getTracks().forEach((t) => t.stop());

      onCaptured({
        descriptor: Array.from(detection.descriptor),
        imageFile,
        previewUrl: URL.createObjectURL(blob),
      });
    } catch (err) {
      console.error("Face capture error:", err);
      setError("Face capture failed. Try again.");
    } finally {
      setCapturing(false);
    }
  }

  function handleRetry() {
    onCaptured(null);
  }

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {captured ? (
        <div className={styles.result}>
          <img src={captured.previewUrl} alt="Captured face" className={styles.preview} />
          <button className={styles.retryButton} onClick={handleRetry}>
            Re-capture
          </button>
        </div>
      ) : (
        <>
          <div className={styles.videoBox}>
            <video ref={videoRef} autoPlay muted playsInline className={styles.video} />
            {!cameraReady && <div className={styles.overlay}>{error ? "—" : "Loading camera…"}</div>}
          </div>

          <button
            className={styles.captureButton}
            onClick={handleCapture}
            disabled={!modelsReady || !cameraReady || capturing}
          >
            {capturing ? "Capturing…" : "Capture Face"}
          </button>
        </>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
