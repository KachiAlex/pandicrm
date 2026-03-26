import { NextResponse } from "next/server";
import { createInMemoryUserRepository } from "@pandi/data-access";
import type { UserId, UpdateUserInput } from "@pandi/core-domain";

export const runtime = "nodejs";

const userRepository = createInMemoryUserRepository();

function parseUserId(id: string): UserId | null {
  return id ? { value: id } : null;
}

// GET /api/users/[id] - Get specific user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = parseUserId(params.id);

  if (!userId) {
    return NextResponse.json(
      { error: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = parseUserId(params.id);

  if (!userId) {
    return NextResponse.json(
      { error: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    const updateInput: UpdateUserInput = {
      name: body.name,
      avatar: body.avatar,
      role: body.role,
      isActive: body.isActive,
      preferences: body.preferences,
    };

    const user = await userRepository.update(userId, updateInput);
    
    return NextResponse.json({ 
      message: "User updated successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = parseUserId(params.id);

  if (!userId) {
    return NextResponse.json(
      { error: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    await userRepository.delete(userId);
    return NextResponse.json({ 
      message: "User deleted successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
