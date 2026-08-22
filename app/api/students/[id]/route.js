import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Student from "@/models/Student";
import { requireAdmin } from "@/lib/auth/middleware";
import { validateStudentInput } from "@/lib/validators/studentValidator";
import { savePassportPhoto } from "@/lib/upload/handleFormData";

/**
 * GET /api/students/:id
 */
export async function GET(request, { params }) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const student = await Student.findById(params.id);

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  return NextResponse.json({ student });
}

/**
 * PUT /api/students/:id
 * Updates student profile fields. Accepts multipart/form-data so the
 * passport photo can optionally be replaced in the same request.
 */
export async function PUT(request, { params }) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const student = await Student.findById(params.id);
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  try {
    const formData = await request.formData();

    const data = {
      matricNumber: formData.get("matricNumber")?.toString().trim().toUpperCase(),
      fullName: formData.get("fullName")?.toString().trim(),
      department: formData.get("department")?.toString().trim(),
      level: formData.get("level")?.toString().trim(),
      email: formData.get("email")?.toString().trim() || undefined,
      phone: formData.get("phone")?.toString().trim() || undefined,
    };

    const { isValid, errors } = validateStudentInput(data, { isUpdate: true });
    if (!isValid) {
      return NextResponse.json({ error: "Validation failed.", fields: errors }, { status: 400 });
    }

    if (data.matricNumber && data.matricNumber !== student.matricNumber) {
      const clash = await Student.findOne({
        matricNumber: data.matricNumber,
        _id: { $ne: student._id },
      });
      if (clash) {
        return NextResponse.json(
          { error: "Another student already uses this matric number.", fields: { matricNumber: "Already registered." } },
          { status: 409 }
        );
      }
    }

    const photoFile = formData.get("passportPhoto");
    if (photoFile && typeof photoFile.arrayBuffer === "function" && photoFile.size > 0) {
      data.passportPhoto = await savePassportPhoto(photoFile);
    }

    Object.assign(student, data);
    await student.save();

    return NextResponse.json({ student });
  } catch (err) {
    console.error("Update student error:", err);
    return NextResponse.json({ error: err.message || "Failed to update student." }, { status: 500 });
  }
}
