import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAuthRoute = nextUrl.pathname === "/login";
  const isPublicRoute = nextUrl.pathname === "/";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const authPayload = req.auth as any;
  const role = authPayload?.role ?? authPayload?.user?.role;
  const isAdmin = ["admin", "superadmin"].includes(role ?? "");

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (isAdminRoute && !isAdmin) {
    return Response.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
