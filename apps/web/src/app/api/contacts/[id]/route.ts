import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        account: true,
        deals: true,
        notes: { orderBy: { createdAt: "desc" }, take: 10 },
        timelineEvents: { orderBy: { occurredAt: "desc" }, take: 20 },
      },
    });

    if (!contact) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(contact.workspaceId, userId))) return unauthorized();

    return NextResponse.json(contact);
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.contact.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    const body = await req.json();
    const { firstName, lastName, email, phone, title, department, linkedin, accountId } = body;

    const contact = await prisma.contact.update({
      where: { id },
      data: { firstName, lastName, email, phone, title, department, linkedin, accountId },
    });
    return NextResponse.json(contact);
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.contact.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    await prisma.contact.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
