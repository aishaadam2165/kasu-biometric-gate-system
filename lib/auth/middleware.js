import { verifyToken } from "./jwt";

/**
 * Use inside any protected API route handler:
 *   const admin = requireAdmin(request);
 *   if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *
 * Returns the decoded token payload ({ id, email, role }) or null.
 */
export function requireAdmin(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
