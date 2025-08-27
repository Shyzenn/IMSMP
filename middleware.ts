import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRoutes = {
  Manager: ["/dashboard", "/inventory", "/transaction", "/order", "/settings"],
  Nurse: ["/request-order"],
  Cashier: ["/cashier_dashboard"],
  Pharmacist_Staff: [
    "/pharmacist_dashboard",
    "/pharmacist_inventory",
    "/pharmacist_transaction",
    "/add-product",
    "/pharmacist_order",
    "/pharmacist_settings",
  ],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const pathname = request.nextUrl.pathname;

  //  Public paths
  const publicPaths = ["/auth/signin", "/unauthorized", "/change-password"];

  // If not logged in and accessing protected page → redirect to login
  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (token) {
    // Force password change flow
    if (token.mustChangePassword && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }

    // Redirect away from login if already logged in
    if (pathname === "/auth/signin") {
      const role = token.role;
      if (role === "Manager")
        return NextResponse.redirect(new URL("/dashboard", request.url));
      if (role === "Nurse")
        return NextResponse.redirect(new URL("/request-order", request.url));
      if (role === "Pharmacist_Staff")
        return NextResponse.redirect(
          new URL("/pharmacist_dashboard", request.url)
        );
      if (role === "Cashier")
        return NextResponse.redirect(
          new URL("/cashier_dashboard", request.url)
        );
    }

    // Role-based route check
    const role = token.role as keyof typeof roleRoutes;
    const allowedRoutes = roleRoutes[role] || [];
    const isAllowed = allowedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (!isAllowed && !publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/user-management/:path*",
    "/inventory/:path*",
    "/request-order/:path*",
    "/transaction/:path*",
    "/cashier_dashboard/:path*",
    "/pharmacist_dashboard/:path*",
    "/auth/signin",
    "/settings/:path*",
    "/pharmacist_inventory/:path*",
    "/pharmacist_transaction/:path*",
    "/pharmacist_order/:path*",
    "/pharmacist_settings/:path*",
    "/change-password", 
  ],
};
