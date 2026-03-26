import { NextResponse } from "next/server";
import { createInMemoryAuthenticationRepository } from "@pandi/data-access";

export const runtime = "nodejs";

const authRepository = createInMemoryAuthenticationRepository();

// GET /api/auth/me - Get current user profile
export async function GET(request: Request) {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader?.split("auth-token=")?.[1]?.split(";")[0];

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }

    const user = await authRepository.validateToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get user profile" },
      { status: 500 }
    );
  }
}
