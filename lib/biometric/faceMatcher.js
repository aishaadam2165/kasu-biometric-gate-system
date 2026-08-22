/**
 * Compares two face descriptors (128-length Float32-like arrays produced
 * by face-api.js's faceRecognitionNet) using Euclidean distance — the
 * standard comparison method for this model.
 *
 * A distance below the threshold is considered a match. 0.6 is the
 * commonly recommended default threshold for face-api.js's recognition
 * model.
 */
export function compareFaceDescriptors(liveDescriptor, storedDescriptor, threshold = 0.6) {
  if (
    !Array.isArray(liveDescriptor) ||
    !Array.isArray(storedDescriptor) ||
    liveDescriptor.length !== storedDescriptor.length
  ) {
    return { match: false, distance: Infinity };
  }

  let sumSquares = 0;
  for (let i = 0; i < liveDescriptor.length; i++) {
    const diff = liveDescriptor[i] - storedDescriptor[i];
    sumSquares += diff * diff;
  }
  const distance = Math.sqrt(sumSquares);

  return { match: distance < threshold, distance };
}
