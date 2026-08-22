import AccessLog from "@/models/AccessLog";

/**
 * Writes one AccessLog entry. Used by both the fingerprint and face
 * verification routes so every gate attempt — granted or denied — is
 * recorded consistently, per Chapter 3.9.5 / 3.10.5.
 */
export async function logAccessAttempt({ student, matricNumber, method, result, remarks = "" }) {
  const now = new Date();
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const time = now.toTimeString().slice(0, 8); // HH:mm:ss

  return AccessLog.create({
    student: student || null,
    matricNumber,
    method,
    result,
    date,
    time,
    remarks,
  });
}
