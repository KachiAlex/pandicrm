import { NextResponse } from "next/server";
import { createInMemoryAuthenticationRepository, seedAuthData } from "@pandi/data-access";
import type { AuthenticateInput, Email } from "@pandi/core-domain";

export const runtime = "nodejs";

const authRepository = createInMemoryAuthenticationRepository();

// Seed auth data on startup
seedAuthData().catch(console.error);

// POST /api/auth/login - Authenticate user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const loginInput: AuthenticateInput = {
      email: { value: body.email },
      password: body.password,
    };

    // Basic validation
    if (!loginInput.email.value || !loginInput.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await authRepository.authenticate(loginInput);
    
    // Set HTTP-only cookie with token
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        preferences: result.user.preferences,
      },
      expiresAt: result.expiresAt,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof Error && (error.message.includes("Invalid credentials") || error.message.includes("inactive"))) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to authenticate" },
      { status: 500 }
    );
  }
}
