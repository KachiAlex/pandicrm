import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { updateIntegrationSchema, validateBody } from "@/lib/validations";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.integration.findUnique({ where: { id } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    const body = await req.json();
    const validation = validateBody(updateIntegrationSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data: any = {};
    if (validation.data.provider !== undefined) data.provider = validation.data.provider;
    if (validation.data.label !== undefined) data.label = validation.data.label;
    if (validation.data.isActive !== undefined) data.isActive = validation.data.isActive;
    if (validation.data.config !== undefined) data.config = validation.data.config;

    const updated = await prisma.integration.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.integration.findUnique({ where: { id } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    await prisma.integration.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
