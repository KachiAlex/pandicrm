import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const userId = (session as any).user.id;

    if (!(await requireWorkspaceAccess(id, userId))) return unauthorized();

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(workspace);
  } catch {
    return serverError();
  }
}
