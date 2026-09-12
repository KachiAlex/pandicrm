import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const userId = (session as any).user.id;

    const attachment = await prisma.fileAttachment.findUnique({
      where: { id },
      select: { workspaceId: true },
    });

    if (!attachment) return notFound();
    if (!(await requireWorkspaceAccess(attachment.workspaceId, userId))) return unauthorized();

    await prisma.fileAttachment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
