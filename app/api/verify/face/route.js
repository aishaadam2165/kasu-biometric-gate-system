import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Biometric from "@/models/Biometric";
import { compareFaceDescriptors } from "@/lib/biometric/faceMatcher";
import { logAccessAttempt } from "@/lib/utils/logAccess";

/**
 * POST /api/verify/face
 * Body: { studentId, matricNumber, descriptor }
 *
 * Face-fallback step of the hybrid verification flow (Chapter 3.7),
 * triggered only when fingerprint verification fails or the student has
 * no fingerprint enrolled. Descriptor comparison is 1:1 against the
 * student identified at the lookup step, not a 1:N search across all
 * students — see the Step 5 README for why that's the deliberate design.
 */
export async function POST(request) {
  await connectDB();

  try {
    const { studentId, matricNumber, descriptor } = await request.json();

    if (!studentId || !matricNumber || !Array.isArray(descriptor)) {
      return NextResponse.json(
        { error: "studentId, matricNumber, and descriptor are required." },
        { status: 400 }
      );
    }

    const biometric = await Biometric.findOne({ student: studentId });
    const storedDescriptor = biometric?.faceEmbedding || null;

    const { match, distance } = compareFaceDescriptors(descriptor, storedDescriptor);

    const result = match ? "granted" : "denied";
    await logAccessAttempt({
      student: studentId,
      matricNumber,
      method: "face",
      result,
      remarks: storedDescriptor
        ? `Distance ${distance.toFixed(3)}`
        : "No face enrolled",
    });

    return NextResponse.json({ result, distance });
  } catch (err) {
    console.error("Face verification error:", err);
    return NextResponse.json({ error: "Face verification failed." }, { status: 500 });
  }
}
