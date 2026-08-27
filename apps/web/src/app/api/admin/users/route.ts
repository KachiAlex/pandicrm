import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isSuperAdmin, unauthorized, serverError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;
  if (!isSuperAdmin(session.user.role)) return unauthorized();

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        plan: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[ADMIN USERS GET]", err);
    return serverError("Failed to load users");
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;
  if (!isSuperAdmin(session.user.role)) return unauthorized();

  try {
    const body = await req.json();
    const { id, role, isActive, plan } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    if (role !== undefined && !["user", "admin", "superadmin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (plan !== undefined && !["free", "standard", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Invalid isActive" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined ? { role: role as any } : {}),
        ...(plan !== undefined ? { plan: plan as any } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        isActive: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("[ADMIN USERS PATCH]", err);
    return serverError("Failed to update user");
  }
}
