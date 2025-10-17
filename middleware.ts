import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { roleConfig, publicPaths } from "@/lib/roleConfig";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token",
  });

  const pathname = request.nextUrl.pathname;

  // If not logged in → redirect to login
  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (token) {
    // Must change password
    if (token.mustChangePassword && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }

    const role = token.role as keyof typeof roleConfig;
    const roleData = roleConfig[role];

  // Redirect logged-in users away from /auth/signin
  if (pathname === "/auth/signin" && request.method === "GET" && roleData) {
    return NextResponse.redirect(new URL(roleData.base, request.url));
  }

    // Role-based access control
    const isAllowed =
      roleData?.routes.some((route) => pathname.startsWith(route)) ?? false;

    if (!isAllowed && !publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  console.log("🍪 Cookies in middleware:", request.cookies.getAll());
  console.log("🎫 Token from getToken:", token);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/products/:path*",
    "/inventory/batches/:path*",
    "/transaction/:path*",
    "/audit_log/:path*",
    "/auth/signin",
    "/manager_settings/:path*",
    "/nurse_dashboard/:path*",
    "/cashier_dashboard/:path*",
    "/pharmacist_dashboard/:path*",
    "/change-password",
    "/user_management",
    "/unauthorized",
     "/archive",
  ],
};
