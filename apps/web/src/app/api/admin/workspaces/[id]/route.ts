import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isSuperAdmin, unauthorized, serverError, notFound } from "@/lib/api-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth(_req);
  if (session instanceof NextResponse) return session;
  if (!isSuperAdmin(session.user.role)) return unauthorized();

  try {
    const { id } = await params;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!workspace) return notFound();

    await prisma.workspace.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN WORKSPACES DELETE]", err);
    return serverError("Failed to delete workspace");
  }
}
