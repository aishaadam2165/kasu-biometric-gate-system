import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Student from "@/models/Student";
import Biometric from "@/models/Biometric";
import { requireAdmin } from "@/lib/auth/middleware";
import { saveFaceImage } from "@/lib/upload/handleFormData";

/**
 * POST /api/biometrics/face/enroll
 * FormData: studentId, descriptor (JSON-stringified 128-length array),
 * faceImage (captured snapshot file)
 *
 * The descriptor is extracted client-side by face-api.js (see
 * components/biometric/FaceCapture.jsx) since running the recognition
 * model requires a live video frame from the browser's webcam.
 */
export async function POST(request) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const formData = await request.formData();
    const studentId = formData.get("studentId")?.toString();
    const descriptorRaw = formData.get("descriptor")?.toString();
    const faceImageFile = formData.get("faceImage");

    if (!studentId || !descriptorRaw) {
      return NextResponse.json(
        { error: "studentId and descriptor are required." },
        { status: 400 }
      );
    }

    let descriptor;
    try {
      descriptor = JSON.parse(descriptorRaw);
    } catch {
      return NextResponse.json({ error: "descriptor must be valid JSON." }, { status: 400 });
    }

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json(
        { error: "descriptor must be a 128-length array." },
        { status: 400 }
      );
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    let faceImagePath = null;
    if (faceImageFile && typeof faceImageFile.arrayBuffer === "function" && faceImageFile.size > 0) {
      faceImagePath = await saveFaceImage(faceImageFile);
    }

    let biometric = await Biometric.findOne({ student: studentId });
    if (!biometric) {
      biometric = new Biometric({ student: studentId });
    }

    biometric.faceEmbedding = descriptor;
    if (faceImagePath) biometric.faceImage = faceImagePath;
    biometric.faceEnrolledAt = new Date();
    await biometric.save();

    if (biometric.fingerprintTemplate && biometric.faceEmbedding) {
      student.isEnrolled = true;
      await student.save();
    }

    return NextResponse.json({ biometric, isEnrolled: student.isEnrolled });
  } catch (err) {
    console.error("Face enrolment error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to enrol face." },
      { status: 500 }
    );
  }
}
