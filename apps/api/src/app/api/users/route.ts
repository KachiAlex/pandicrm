import { NextResponse } from "next/server";
import { createInMemoryUserRepository } from "@pandi/data-access";
import type { CreateUserInput } from "@pandi/core-domain";

export const runtime = "nodejs";

const userRepository = createInMemoryUserRepository();

// GET /api/users - List all users (admin only)
export async function GET(request: Request) {
  try {
    // In a real implementation, you'd verify admin role from auth token
    const users = await userRepository.list();
    
    return NextResponse.json({ 
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const createInput: CreateUserInput = {
      email: { value: body.email },
      name: body.name,
      password: body.password,
      role: body.role || "user",
    };

    // Basic validation
    if (!createInput.email.value || !createInput.name || !createInput.password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    const user = await userRepository.create(createInput);
    
    return NextResponse.json({ 
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
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
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 }
    );
  }
}
