import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { updateWorkspaceSchema, validateBody } from "@/lib/validations";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const userId = (session as any).user.id;

    if (!(await requireWorkspaceAccess(id, userId))) return unauthorized();

    const body = await req.json();
    const validation = validateBody(updateWorkspaceSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name } = validation.data;

    const workspace = await prisma.workspace.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(workspace);
  } catch {
    return serverError();
  }
}
