import * as faceapi from "@vladmandic/face-api";

/**
 * face-api.js needs pretrained model weights. Rather than bundling ~15MB
 * of model files directly into this project, they're loaded from a CDN
 * by default (requires the kiosk/enrolment machine to have internet on
 * first load — the browser caches them after that).
 *
 * For a fully offline defense/demo setup: copy the contents of
 * node_modules/@vladmandic/face-api/model into /public/models, then set
 * NEXT_PUBLIC_FACE_MODELS_URL=/models in .env.local.
 */
const MODEL_URL =
  process.env.NEXT_PUBLIC_FACE_MODELS_URL ||
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

let modelsLoaded = false;
let loadingPromise = null;

/**
 * Loads the three models the enrolment/verification flow needs:
 * - tinyFaceDetector: fast face detection, suitable for a live webcam feed
 * - faceLandmark68Net: facial landmark points, required before descriptor extraction
 * - faceRecognitionNet: produces the 128-length face descriptor used for matching
 */
export async function loadFaceApiModels() {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  })();

  return loadingPromise;
}

export function areFaceModelsLoaded() {
  return modelsLoaded;
}

export { faceapi };
