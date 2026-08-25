import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const userId = (session as any).user.id;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const notifications = await prisma.notification.findMany({
      where: { workspaceId, userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const userId = (session as any).user.id;
    const { workspaceId } = await req.json();
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    await prisma.notification.updateMany({
      where: { workspaceId, userId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
