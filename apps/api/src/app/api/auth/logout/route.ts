import { NextResponse } from "next/server";
import { createInMemoryAuthenticationRepository } from "@pandi/data-access";

export const runtime = "nodejs";

const authRepository = createInMemoryAuthenticationRepository();

// POST /api/auth/logout - Logout user
export async function POST(request: Request) {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.split("auth-token=")?.[1]?.split(";")[0];

    if (token) {
      // Invalidate the session (in a real implementation, you'd find and invalidate the specific session)
      // For now, we'll just clear the cookie
      try {
        const user = await authRepository.validateToken(token);
        if (user) {
          await authRepository.invalidateAllUserSessions(user.id);
        }
      } catch (error) {
        // Token might be invalid, but that's okay for logout
      }
    }

    // Clear the auth cookie
    const response = NextResponse.json({
      message: "Logout successful",
    });

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to logout" },
      { status: 500 }
    );
  }
}
