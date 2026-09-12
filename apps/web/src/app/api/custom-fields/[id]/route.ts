import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const userId = (session as any).user.id;

    const existing = await prisma.customFieldDefinition.findUnique({
      where: { id },
      select: { workspaceId: true },
    });

    if (!existing) return notFound();
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    const body = await req.json();
    const { fieldName, fieldType, isRequired, options, sortOrder } = body;

    const field = await prisma.customFieldDefinition.update({
      where: { id },
      data: {
        ...(fieldName && { fieldName }),
        ...(fieldType && { fieldType }),
        ...(isRequired !== undefined && { isRequired }),
        ...(options !== undefined && { options }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(field);
  } catch {
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const userId = (session as any).user.id;

    const existing = await prisma.customFieldDefinition.findUnique({
      where: { id },
      select: { workspaceId: true },
    });

    if (!existing) return notFound();
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    await prisma.customFieldDefinition.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
