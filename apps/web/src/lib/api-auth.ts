import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function requireAuth(req?: NextRequest) {
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.id && payload.email) {
          if (payload.isActive === false) {
            return NextResponse.json({ error: "Account inactive" }, { status: 401 });
          }
          return {
            user: {
              id: payload.id as string,
              email: payload.email as string,
              name: (payload.name as string) || null,
              firstName: (payload.firstName as string) || null,
              lastName: (payload.lastName as string) || null,
              company: (payload.company as string) || null,
              phone: (payload.phone as string) || null,
              role: (payload.role as string) || "user",
              image: (payload.image as string) || null,
              isActive: payload.isActive as boolean ?? true,
            },
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          } as any;
        }
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }
  }

  const session = await auth();
  if ((session as any)?.user?.isActive === false || !(session as any)?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireWorkspaceAccess(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
    },
  });

  if (!membership) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: userId,
      },
    });
    if (!workspace) return false;
  }
  return true;
}

export async function requireWorkspaceRole(workspaceId: string, userId: string, required: "owner" | "admin" | "member" = "member") {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: userId },
    select: { id: true },
  });
  if (workspace) return { role: "owner" as const, ok: true };

  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId },
    select: { role: true },
  });
  if (!membership) return { ok: false };

  const roles = ["member", "admin", "owner"];
  const userLevel = roles.indexOf(membership.role);
  const requiredLevel = roles.indexOf(required);
  return { role: membership.role as "member" | "admin" | "owner", ok: userLevel >= requiredLevel };
}

export function unauthorized() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function isAdmin(role?: string | null) {
  return ["admin", "superadmin"].includes(role ?? "");
}

export function isSuperAdmin(role?: string | null) {
  return (role ?? "") === "superadmin";
}

export function requireAdmin(session: { user?: { role?: string | null } }) {
  if (!isAdmin(session?.user?.role)) {
    return unauthorized();
  }
}

export function requireSuperAdmin(session: { user?: { role?: string | null } }) {
  if (!isSuperAdmin(session?.user?.role)) {
    return unauthorized();
  }
}
