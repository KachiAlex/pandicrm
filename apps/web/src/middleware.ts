import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NOTE: Edge-safe middleware — must NOT import auth.ts, prisma, bcrypt,
// ioredis, or any other Node-only module. We only check for the presence
// of a session cookie here; full auth/role verification happens in API
// routes (requireAuth) and server components/layouts.
const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

function hasSessionCookie(req: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => req.cookies.has(name));
}

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

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const isLoggedIn = hasSessionCookie(req);
  const pathname = nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const isAdminRoute = pathname.startsWith("/admin");

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

  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (!isLoggedIn && !PUBLIC_PATHS.includes(pathname)) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
