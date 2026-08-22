import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Admin from "@/models/Admin";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request) {
  const token = request.cookies.get("token")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  await connectDB();
  const admin = await Admin.findById(decoded.id);

  if (!admin) {
    return NextResponse.json({ error: "Admin not found." }, { status: 401 });
  }

  return NextResponse.json({
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
}
