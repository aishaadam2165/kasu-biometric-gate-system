"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadFaceApiModels,
  getLoadedFaceApi,
} from "@/lib/biometric/faceapiLoader";
import styles from "./FaceCapture.module.css";

export default function FaceCapture({ onCaptured, captured }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        setError("");

        // ---------------------------------------
        // 1. START PHONE CAMERA FIRST
        // ---------------------------------------
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera API is not supported by this browser.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = resolve;
          });

          await videoRef.current.play();
        }

        setCameraReady(true);

        // ---------------------------------------
        // 2. LOAD FACE MODELS AFTER CAMERA STARTS
        // ---------------------------------------
        try {
          await loadFaceApiModels();

          if (!cancelled) {
            setModelsReady(true);
          }
        } catch (modelError) {
          console.error("Face model loading error:", modelError);

          if (!cancelled) {
            setError(
              "Camera started, but face recognition models could not be loaded. Check your internet connection."
            );
          }
        }
      } catch (err) {
        console.error("Camera initialization error:", err);

        if (cancelled) return;

        if (err?.name === "NotAllowedError") {
          setError(
            "Camera access was denied. Allow camera permission for this website and reload."
          );
        } else if (err?.name === "NotFoundError") {
          setError("No camera was found on this device.");
        } else if (err?.name === "NotReadableError") {
          setError("The camera is already being used by another application.");
        } else {
          setError(
            err?.message || "Could not start the phone camera."
          );
        }
      }
    }

    if (!captured) {
      startCamera();
    }

    return () => {
      cancelled = true;

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    };
  }, [captured]);

  async function handleCapture() {
    if (
      !videoRef.current ||
      !cameraReady ||
      !modelsReady ||
      capturing
    ) {
      return;
    }

    setError("");
    setCapturing(true);

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
        return;
      }

      // ---------------------------------------
      // CAPTURE IMAGE
      // ---------------------------------------
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error("Could not create image."));
            }
          },
          "image/jpeg",
          0.9
        );
      });

      const imageFile = new File(
        [blob],
        "face-capture.jpg",
        {
          type: "image/jpeg",
        }
      );

      const previewUrl = URL.createObjectURL(blob);

      // ---------------------------------------
      // STOP CAMERA
      // ---------------------------------------
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;

      // ---------------------------------------
      // SEND RESULT TO ENROLLMENT PAGE
      // ---------------------------------------
      onCaptured({
        descriptor: Array.from(detection.descriptor),
        imageFile,
        previewUrl,
      });
    } catch (err) {
      console.error("Face capture error:", err);

      setError(
        "Face capture failed. Make sure your face is clearly visible and try again."
      );
    } finally {
      setCapturing(false);
    }
  }

  function handleRetry() {
    onCaptured(null);
  }

  return (
    <div className={styles.wrapper}>
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

      {captured ? (
        <div className={styles.result}>
          <img
            src={captured.previewUrl}
            alt="Captured face"
            className={styles.preview}
          />

          <button
            className={styles.retryButton}
            onClick={handleRetry}
          >
            Re-capture
          </button>
        </div>
      ) : (
        <>
          <div className={styles.videoBox}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={styles.video}
            />

            {!cameraReady && (
              <div className={styles.overlay}>
                {error || "Starting camera…"}
              </div>
            )}

            {cameraReady && !modelsReady && (
              <div className={styles.overlay}>
                Loading face recognition…
              </div>
            )}
          </div>

          <button
            className={styles.captureButton}
            onClick={handleCapture}
            disabled={
              !cameraReady ||
              !modelsReady ||
              capturing
            }
          >
            {capturing
              ? "Capturing…"
              : !cameraReady
              ? "Starting Camera…"
              : !modelsReady
              ? "Loading Face Recognition…"
              : "Capture Face"}
          </button>
        </>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
}