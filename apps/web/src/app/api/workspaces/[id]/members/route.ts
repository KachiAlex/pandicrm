import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceRole, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { inviteWorkspaceMemberSchema, validateBody } from "@/lib/validations";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const userId = (session as any).user.id;

    const check = await requireWorkspaceRole(id, userId, "member");
    if (!check.ok) return unauthorized();

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, email: true, name: true, firstName: true, lastName: true } } } },
      },
    });

    if (!workspace) return notFound();

    const owner = await prisma.user.findUnique({
      where: { id: workspace.ownerId },
      select: { id: true, email: true, name: true, firstName: true, lastName: true },
    });

    const all = workspace.members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      email: m.user.email,
      name: m.user.name,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    }));

    const ownerInMembers = workspace.members.some((m) => m.user.id === workspace.ownerId);
    if (owner && !ownerInMembers) {
      all.unshift({
        id: "owner",
        userId: owner.id,
        email: owner.email,
        name: owner.name,
        firstName: owner.firstName,
        lastName: owner.lastName,
        role: "owner",
        joinedAt: workspace.createdAt.toISOString(),
      });
    }

    return NextResponse.json(all);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const userId = (session as any).user.id;

    const check = await requireWorkspaceRole(id, userId, "admin");
    if (!check.ok) return unauthorized();

    const body = await req.json();
    const validation = validateBody(inviteWorkspaceMemberSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, role } = validation.data;

    const target = await prisma.user.findUnique({ where: { email } });
    if (!target) {
      return NextResponse.json({ error: "User not found. They must sign up first." }, { status: 404 });
    }

    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId: target.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "User is already a member of this workspace" }, { status: 409 });
    }

    if (target.id === userId) {
      return NextResponse.json({ error: "You are already in this workspace" }, { status: 400 });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: id,
        userId: target.id,
        role,
      },
      include: {
        user: { select: { id: true, email: true, name: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      id: member.id,
      userId: member.user.id,
      email: member.user.email,
      name: member.user.name,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
    }, { status: 201 });
  } catch {
    return serverError();
  }
}
