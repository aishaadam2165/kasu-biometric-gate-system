let faceapiInstance = null;
let modelsLoaded = false;
let loadingPromise = null;

const MODEL_URL =
  process.env.NEXT_PUBLIC_FACE_MODELS_URL ||
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

export async function loadFaceApiModels() {
  if (modelsLoaded && faceapiInstance) {
    return faceapiInstance;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    // Import face-api ONLY in the browser.
    const faceapi = await import("@vladmandic/face-api");

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    faceapiInstance = faceapi;
    modelsLoaded = true;

    return faceapi;
  })();

  try {
    return await loadingPromise;
  } catch (error) {
    loadingPromise = null;
    modelsLoaded = false;
    faceapiInstance = null;
    throw error;
  }
}

export async function getLoadedFaceApi() {
  if (!faceapiInstance || !modelsLoaded) {
    return await loadFaceApiModels();
  }

  return faceapiInstance;
}

export function areFaceModelsLoaded() {
  return modelsLoaded;
}