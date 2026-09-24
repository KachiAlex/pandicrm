import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceRole, unauthorized, serverError, notFound } from "@/lib/api-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;
    const { id } = await params;
    const existing = await prisma.senderIdentity.findUnique({ where: { id } });
    if (!existing) return notFound();
    const role = await requireWorkspaceRole(existing.workspaceId, (session as any).user.id, "admin");
    if (!role.ok) return unauthorized();
    await prisma.senderIdentity.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;
    const { id } = await params;
    const existing = await prisma.senderIdentity.findUnique({ where: { id }, include: { domain: true } });
    if (!existing) return notFound();
    const role = await requireWorkspaceRole(existing.workspaceId, (session as any).user.id, "admin");
    if (!role.ok) return unauthorized();

    const body = await req.json().catch(() => ({}));
    if (body.isDefault === true) {
      await prisma.$transaction([
        prisma.senderIdentity.updateMany({ where: { workspaceId: existing.workspaceId, isDefault: true }, data: { isDefault: false } }),
        prisma.senderIdentity.update({ where: { id }, data: { isDefault: true } }),
      ]);
      const updated = await prisma.senderIdentity.findUnique({ where: { id }, include: { domain: true } });
      return NextResponse.json(updated);
    }
    const data: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.replyTo === "string") data.replyTo = body.replyTo.trim() || null;
    if (Object.keys(data).length === 0) return NextResponse.json(existing);
    const updated = await prisma.senderIdentity.update({ where: { id }, data: data as any, include: { domain: true } });
    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}

