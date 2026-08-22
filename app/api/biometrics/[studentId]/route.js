import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Biometric from "@/models/Biometric";
import { requireAdmin } from "@/lib/auth/middleware";

/**
 * GET /api/biometrics/:studentId
 * Returns the biometric record for a student (or null if not enrolled
 * yet), without exposing raw template/descriptor data unnecessarily to
 * the client — only what the enrolment UI needs to show current state.
 */
export async function GET(request, { params }) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const biometric = await Biometric.findOne({ student: params.studentId });

  if (!biometric) {
    return NextResponse.json({ biometric: null });
  }

  return NextResponse.json({
    biometric: {
      hasFingerprint: Boolean(biometric.fingerprintTemplate),
      fingerprintQuality: biometric.fingerprintQuality,
      fingerprintEnrolledAt: biometric.fingerprintEnrolledAt,
      hasFace: Boolean(biometric.faceEmbedding),
      faceImage: biometric.faceImage,
      faceEnrolledAt: biometric.faceEnrolledAt,
    },
  });
}
