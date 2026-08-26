import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Admin from "@/models/Admin";
import { comparePassword } from "@/lib/auth/bcrypt";
import { signToken } from "@/lib/auth/jwt";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await connectDB();

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValidPassword = await comparePassword(password, admin.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signToken({ id: admin._id.toString(), email: admin.email, role: admin.role });

    const response = NextResponse.json({
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
