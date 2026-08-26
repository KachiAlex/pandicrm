import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceRole, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { updateWorkspaceMemberSchema, validateBody } from "@/lib/validations";

function roleLevel(role: string) {
  return ["member", "admin", "owner"].indexOf(role);
}

async function targetRole(workspaceId: string, targetUserId: string) {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: targetUserId },
    select: { id: true },
  });
  if (workspace) return "owner";
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: targetUserId },
    select: { role: true },
  });
  return membership?.role || null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id, userId: targetUserId } = await params;
    const userId = (session as any).user.id;

    const body = await req.json();
    const validation = validateBody(updateWorkspaceMemberSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { role } = validation.data;
    if (!role) {
      return NextResponse.json({ error: "role is required" }, { status: 400 });
    }

    const current = await requireWorkspaceRole(id, userId, roleLevel(role) === 2 ? "owner" : "admin");
    if (!current.ok) return unauthorized();

    const target = await targetRole(id, targetUserId);
    if (!target) return notFound();

    if (target === "owner") {
      return NextResponse.json({ error: "Cannot edit the workspace owner" }, { status: 400 });
    }

    if (current.role === "admin" && roleLevel(target) >= roleLevel(current.role)) {
      return unauthorized();
    }

    if (role === "owner") {
      return NextResponse.json({ error: "Use transfer ownership to make someone an owner" }, { status: 400 });
    }

    const updated = await prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId: id, userId: targetUserId } },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id, userId: targetUserId } = await params;
    const userId = (session as any).user.id;

    const current = await requireWorkspaceRole(id, userId, "admin");
    if (!current.ok) return unauthorized();

    const target = await targetRole(id, targetUserId);
    if (!target) return notFound();

    if (target === "owner") {
      return NextResponse.json({ error: "Cannot remove the workspace owner" }, { status: 400 });
    }

    if (current.role === "admin" && roleLevel(target) >= roleLevel(current.role)) {
      return unauthorized();
    }

    await prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId: id, userId: targetUserId } },
    });

    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
