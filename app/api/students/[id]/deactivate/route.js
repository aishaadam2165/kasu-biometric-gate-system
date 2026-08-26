import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Student from "@/models/Student";
import { requireAdmin } from "@/lib/auth/middleware";

/**
 * POST /api/students/:id/deactivate
 * Toggles a student's active status. Students are never hard-deleted —
 * chapter 3 specifies deactivation (soft delete) so access history and
 * biometric records remain intact for audit purposes.
 */
export async function POST(request, { params }) {
  const admin = requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const student = await Student.findById(params.id);
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  student.isActive = !student.isActive;
  await student.save();

  return NextResponse.json({ student });
}
