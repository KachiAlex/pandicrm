import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const contactId = searchParams.get("contactId");
    const accountId = searchParams.get("accountId");
    const dealId = searchParams.get("dealId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const events = await prisma.timelineEvent.findMany({
      where: {
        workspaceId,
        ...(contactId ? { contactId } : {}),
        ...(accountId ? { accountId } : {}),
        ...(dealId ? { dealId } : {}),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, name: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: 50,
    });

    return NextResponse.json(events);
  } catch {
    return serverError();
  }
}
