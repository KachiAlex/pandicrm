import { NextResponse } from "next/server";
import { createInMemoryUserRepository } from "@pandi/data-access";
import type { CreateUserInput, Email } from "@pandi/core-domain";

export const runtime = "nodejs";

const userRepository = createInMemoryUserRepository();

// POST /api/auth/register - Register a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const registerInput: CreateUserInput = {
      email: { value: body.email },
      name: body.name,
      password: body.password,
      role: body.role || "user",
    };

    // Basic validation
    if (!registerInput.email.value || !registerInput.name || !registerInput.password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    if (registerInput.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const user = await userRepository.create(registerInput);
    
    return NextResponse.json({ 
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register user" },
      { status: 500 }
    );
  }
}
