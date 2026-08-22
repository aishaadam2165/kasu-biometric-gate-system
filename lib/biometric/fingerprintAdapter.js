/**
 * Fingerprint Adapter — extensibility seam described in Chapter 3.7.4.
 * This is the ONLY module that talks to fingerprint hardware. Every other
 * part of the system calls these two functions and never touches hardware
 * directly, so swapping in the real DigitalPersona SDK later only requires
 * changing this file — nothing in the enrolment UI, verification flow, or
 * API routes needs to change.
 *
 * captureFingerprint() is mocked here because a physical DigitalPersona
 * U.are.U 4500 scanner and its SDK are not available in this build
 * environment (chapter 3.7.4 names real hardware integration as a stretch
 * goal). The mock still produces a realistic-shaped template + quality
 * score so the rest of the system (storage, matching interface) behaves
 * exactly as it would with a real scanner attached.
 */

/**
 * Simulates capturing a fingerprint sample from the connected scanner.
 * A real DigitalPersona SDK call would replace the body of this function
 * with an actual capture request to the device.
 * @returns {Promise<{ template: string, quality: number }>}
 */
export async function captureFingerprint() {
  // Simulate scanner latency so the UI's "scanning..." state is meaningful.
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const randomId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // Browser-safe "template" — a fixed-shape opaque string standing in for
  // what a real SDK would return as a binary/base64 minutiae template.
  const template = `mock-fp:${randomId}`;

  const quality = Math.floor(70 + Math.random() * 29); // 70-98

  return { template, quality };
}

/**
 * Compare a freshly captured fingerprint against a stored template.
 *
 * Because captureFingerprint() is mocked (no physical scanner is present
 * in this environment — see the module comment above), two separate mock
 * captures of "the same finger" never produce identical templates the way
 * real minutiae data would. So this mock simulates a realistic scanner's
 * behaviour instead of doing a literal string comparison: it succeeds
 * most of the time (a genuine scanner has some false-rejection rate too),
 * which is what actually exercises the face-fallback path this project
 * is built to demonstrate.
 *
 * `forceOutcome` ("match" | "no-match") is an optional override so the
 * fallback path can be demonstrated reliably during a live defense,
 * instead of depending on random chance. It changes nothing about how a
 * real DigitalPersona SDK integration would call this function — only
 * the mock's internals.
 *
 * @param {string} liveTemplate
 * @param {string} storedTemplate
 * @param {"match"|"no-match"|undefined} forceOutcome
 * @returns {Promise<{ match: boolean, score: number }>}
 */
export async function matchFingerprint(liveTemplate, storedTemplate, forceOutcome) {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (!storedTemplate) {
    return { match: false, score: 0 };
  }

  if (forceOutcome === "match") {
    return { match: true, score: Math.floor(88 + Math.random() * 11) };
  }
  if (forceOutcome === "no-match") {
    return { match: false, score: Math.floor(10 + Math.random() * 30) };
  }

  const isMatch = Math.random() < 0.9; // ~90% simulated success rate
  const score = isMatch
    ? Math.floor(80 + Math.random() * 19)
    : Math.floor(10 + Math.random() * 40);

  return { match: isMatch, score };
}
