import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/unsubscribe",
];

const PUBLIC_API_PATHS = [
  "/api/register",
];

const PUBLIC_API_PREFIXES = [
  "/api/auth/",
  "/api/campaigns/track/",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const isAdminRoute = pathname.startsWith("/admin");

  const authPayload = req.auth as { role?: string; user?: { role?: string } } | null;
  const role = authPayload?.role ?? authPayload?.user?.role;
  const isAdmin = ["admin", "superadmin"].includes(role ?? "");

  const isPublicApiPath = PUBLIC_API_PATHS.includes(pathname) ||
    PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isApiRoute) {
    if (!isLoggedIn && !isPublicApiPath) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname === "/login" || pathname === "/register") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", nextUrl));
  }

  if (!isLoggedIn && !PUBLIC_PATHS.includes(pathname)) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
