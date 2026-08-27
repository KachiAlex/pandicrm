import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function endOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const filter = searchParams.get("filter") || "today";

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const now = new Date();
    const start = startOfDay(now);
    const end = endOfDay(now);

    const where: any = { workspaceId, nextFollowUpAt: { not: null } };

    if (filter === "today") {
      where.nextFollowUpAt = { gte: start, lte: end };
    } else if (filter === "overdue") {
      where.nextFollowUpAt = { lt: start };
    } else if (filter === "upcoming") {
      where.nextFollowUpAt = { gt: end };
    } else if (filter === "all") {
      where.nextFollowUpAt = { not: null };
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: { account: { select: { id: true, name: true } } },
      orderBy: { nextFollowUpAt: "asc" },
    });

    return NextResponse.json(contacts);
  } catch (err: any) {
    console.error(err);
    return serverError();
  }
}
