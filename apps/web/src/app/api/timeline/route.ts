import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { getPaginationParams, createPaginatedResult } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const contactId = searchParams.get("contactId");
    const accountId = searchParams.get("accountId");
    const dealId = searchParams.get("dealId");
    const type = searchParams.get("type")?.trim();

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const { skip, take, page, pageSize } = getPaginationParams(searchParams);

    const where: any = {
      workspaceId,
      ...(contactId ? { contactId } : {}),
      ...(accountId ? { accountId } : {}),
      ...(dealId ? { dealId } : {}),
      ...(type ? { type } : {}),
    };

    const [events, total] = await Promise.all([
      prisma.timelineEvent.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          account: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          deal: { select: { id: true, name: true } },
        },
        orderBy: { occurredAt: "desc" },
        skip,
        take,
      }),
      prisma.timelineEvent.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResult(events, total, { page, pageSize, skip, take }));
  } catch {
    return serverError();
  }
}
