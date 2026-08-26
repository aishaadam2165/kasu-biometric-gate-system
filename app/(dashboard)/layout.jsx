import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db/connect";
import Admin from "@/models/Admin";
import { verifyToken } from "@/lib/auth/jwt";
import DashboardShell from "@/components/layout/DashboardShell";

/**
 * Server-side auth guard for every route under (dashboard). This runs on
 * the server before any protected page renders, so it cannot be bypassed
 * by disabling JavaScript or editing client state. The cookie-presence
 * check in middleware.js only avoids a content flash; this is the real
 * gate (see Step 2 README for why JWT verification can't live in
 * middleware's Edge runtime).
 */
export default async function DashboardLayout({ children }) {
  const token = cookies().get("token")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    redirect("/login");
  }

  await connectDB();
  const admin = await Admin.findById(decoded.id);

  if (!admin) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
