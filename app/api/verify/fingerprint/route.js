import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Biometric from "@/models/Biometric";
import { matchFingerprint } from "@/lib/biometric/fingerprintAdapter";
import { logAccessAttempt } from "@/lib/utils/logAccess";

/**
 * POST /api/verify/fingerprint
 * Body: { studentId, matricNumber, liveTemplate, forceOutcome? }
 *
 * Fingerprint-first step of the hybrid verification flow (Chapter 3.7).
 * Every attempt is logged regardless of outcome. `forceOutcome` is an
 * optional demo-mode override — see fingerprintAdapter.js for why.
 */
export async function POST(request) {
  await connectDB();

  try {
    const { studentId, matricNumber, liveTemplate, forceOutcome } = await request.json();

    if (!studentId || !matricNumber || !liveTemplate) {
      return NextResponse.json(
        { error: "studentId, matricNumber, and liveTemplate are required." },
        { status: 400 }
      );
    }

    const biometric = await Biometric.findOne({ student: studentId });
    const storedTemplate = biometric?.fingerprintTemplate || null;

    const { match, score } = await matchFingerprint(liveTemplate, storedTemplate, forceOutcome);

    const result = match ? "granted" : "denied";
    await logAccessAttempt({
      student: studentId,
      matricNumber,
      method: "fingerprint",
      result,
      remarks: storedTemplate ? `Match score ${score}` : "No fingerprint enrolled",
    });

    return NextResponse.json({ result, score });
  } catch (err) {
    console.error("Fingerprint verification error:", err);
    return NextResponse.json({ error: "Fingerprint verification failed." }, { status: 500 });
  }
}
