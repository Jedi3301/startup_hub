import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  // Protect root, dashboard, founder, tickets, and startup routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/founder") ||
    pathname.startsWith("/tickets") ||
    pathname.startsWith("/startup") ||
    pathname === "/"
  ) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login/signup to dashboard
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (sessionToken) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/founder/:path*",
    "/tickets/:path*",
    "/startup/:path*",
    "/login",
    "/signup",
  ],
};
