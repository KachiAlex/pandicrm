import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const userId = (session as any).user.id;
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const notifications = await prisma.notification.findMany({
    where: { workspaceId, userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const userId = (session as any).user.id;
  const { workspaceId } = await req.json();
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  await prisma.notification.updateMany({
    where: { workspaceId, userId, read: false },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
