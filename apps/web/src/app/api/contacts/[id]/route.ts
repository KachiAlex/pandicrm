import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { updateContactSchema, validateBody } from "@/lib/validations";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
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
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.contact.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    const body = await req.json();
    const validation = validateBody(updateContactSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { firstName, lastName, email, phone, title, department, linkedin, accountId, status, categoryIds } = validation.data;

    const contact = await prisma.contact.update({
      where: { id },
      data: { firstName, lastName, email, phone, title, department, linkedin, accountId, status, categoryIds },
    });
    return NextResponse.json(contact);
  } catch {
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
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
