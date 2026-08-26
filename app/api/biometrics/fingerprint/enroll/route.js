import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Student from "@/models/Student";
import Biometric from "@/models/Biometric";
import { requireAdmin } from "@/lib/auth/middleware";

/**
 * POST /api/biometrics/fingerprint/enroll
 * Body: { studentId, template, quality }
 *
 * Stores the fingerprint template captured via
 * lib/biometric/fingerprintAdapter.js's captureFingerprint(). Templates
 * are kept in the Biometric collection, separate from Student, per the
 * database security design in Chapter 3.10.7.
 */
export async function POST(request) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { studentId, template, quality } = await request.json();

    if (!studentId || !template || quality === undefined) {
      return NextResponse.json(
        { error: "studentId, template, and quality are required." },
        { status: 400 }
      );
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    let biometric = await Biometric.findOne({ student: studentId });
    if (!biometric) {
      biometric = new Biometric({ student: studentId });
    }

    biometric.fingerprintTemplate = template;
    biometric.fingerprintQuality = quality;
    biometric.fingerprintEnrolledAt = new Date();
    await biometric.save();

    // Full enrolment requires both fingerprint and face per the hybrid
    // design in Chapter 3.7 — flip isEnrolled only once both exist.
    if (biometric.fingerprintTemplate && biometric.faceEmbedding) {
      student.isEnrolled = true;
      await student.save();
    }

    return NextResponse.json({ biometric, isEnrolled: student.isEnrolled });
  } catch (err) {
    console.error("Fingerprint enrolment error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to enrol fingerprint." },
      { status: 500 }
    );
  }
}
