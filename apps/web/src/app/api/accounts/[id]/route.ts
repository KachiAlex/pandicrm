import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        contacts: true,
        deals: true,
        timelineEvents: { orderBy: { occurredAt: "desc" }, take: 20 },
      },
    });

    if (!account) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(account.workspaceId, userId))) return unauthorized();

    return NextResponse.json(account);
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.account.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    const body = await req.json();
    const { name, description, domain, industry, size, website, phone } = body;

    const account = await prisma.account.update({
      where: { id },
      data: { name, description, domain, industry, size, website, phone },
    });

    return NextResponse.json(account);
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.account.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    await prisma.account.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
