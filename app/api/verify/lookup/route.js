import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Student from "@/models/Student";
import Biometric from "@/models/Biometric";

/**
 * GET /api/verify/lookup?matric=U20CS1001
 *
 * Deliberately NOT behind requireAdmin() — this is the gate/kiosk screen
 * students use directly, with no login. It returns only what the gate UI
 * needs to proceed (identity display + which biometric methods are
 * available), never raw templates/descriptors.
 */
export async function GET(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const matric = searchParams.get("matric")?.trim().toUpperCase();

  if (!matric) {
    return NextResponse.json({ error: "Matric number is required." }, { status: 400 });
  }

  const student = await Student.findOne({ matricNumber: matric });

  if (!student || !student.isActive) {
    return NextResponse.json(
      { error: "No active student found with this matric number." },
      { status: 404 }
    );
  }

  const biometric = await Biometric.findOne({ student: student._id });

  return NextResponse.json({
    student: {
      id: student._id,
      matricNumber: student.matricNumber,
      fullName: student.fullName,
      department: student.department,
      passportPhoto: student.passportPhoto,
    },
    biometricStatus: {
      hasFingerprint: Boolean(biometric?.fingerprintTemplate),
      hasFace: Boolean(biometric?.faceEmbedding),
    },
  });
}
