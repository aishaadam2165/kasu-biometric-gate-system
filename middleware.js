import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/students", "/logs", "/reports", "/settings"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasToken = Boolean(request.cookies.get("token")?.value);

  if (!hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/students/:path*", "/logs/:path*", "/reports/:path*", "/settings/:path*"],
};
