import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Student from "@/models/Student";
import { requireAdmin } from "@/lib/auth/middleware";
import { validateStudentInput } from "@/lib/validators/studentValidator";
import { savePassportPhoto } from "@/lib/upload/handleFormData";

/**
 * GET /api/students?search=&department=&status=active|inactive|all
 * Lists students with optional search (matric number or name) and filters.
 */
export async function GET(request) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const department = searchParams.get("department")?.trim();
  const status = searchParams.get("status") || "active";

  const query = {};

  if (search) {
    query.$or = [
      { matricNumber: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
    ];
  }

  if (department) {
    query.department = department;
  }

  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;
  // status === "all" -> no filter

  const students = await Student.find(query).sort({ createdAt: -1 });

  return NextResponse.json({ students });
}

/**
 * POST /api/students
 * Creates a new student. Expects multipart/form-data (native FormData),
 * not JSON, so the passport photo can travel in the same request.
 */
export async function POST(request) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

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

    const { isValid, errors } = validateStudentInput(data);
    if (!isValid) {
      return NextResponse.json({ error: "Validation failed.", fields: errors }, { status: 400 });
    }

    const existing = await Student.findOne({ matricNumber: data.matricNumber });
    if (existing) {
      return NextResponse.json(
        { error: "A student with this matric number already exists.", fields: { matricNumber: "Already registered." } },
        { status: 409 }
      );
    }

    let passportPhoto = null;
    const photoFile = formData.get("passportPhoto");
    if (photoFile && typeof photoFile.arrayBuffer === "function" && photoFile.size > 0) {
      passportPhoto = await savePassportPhoto(photoFile);
    }

    const student = await Student.create({
      ...data,
      passportPhoto,
      registeredBy: admin.id,
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (err) {
    console.error("Create student error:", err);
    return NextResponse.json({ error: err.message || "Failed to create student." }, { status: 500 });
  }
}
