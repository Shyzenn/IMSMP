import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { roleConfig, publicPaths } from "@/lib/roleConfig";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
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
    if (pathname === "/auth/signin" && roleData) {
      return NextResponse.redirect(new URL(roleData.base, request.url));
    }

    // Role-based access control
    const isAllowed =
      roleData?.routes.some((route) => pathname.startsWith(route)) ?? false;

    if (!isAllowed && !publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/products/:path*",
    "/inventory/batches/:path*",
    "/transaction/:path*",
    "/audit_log/:path*",
    "/manager_settings/:path*",
    "/request-order/:path*",
    "/cashier_dashboard/:path*",
    "/pharmacist_dashboard/:path*",
    "/auth/signin",
    "/change-password",
    "/user_management",
    "/unauthorized",
  ],
};
