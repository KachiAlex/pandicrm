import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { bulkUpdateDealsSchema, validateBody } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(bulkUpdateDealsSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { ids, stage, delete: shouldDelete } = validation.data;
    const userId = (session as any).user.id;

    const firstDeal = await prisma.deal.findFirst({
      where: { id: { in: ids } },
      select: { workspaceId: true },
    });

    if (!firstDeal) {
      return NextResponse.json({ error: "No deals found" }, { status: 404 });
    }

    if (!(await requireWorkspaceAccess(firstDeal.workspaceId, userId))) return unauthorized();

    if (shouldDelete) {
      const result = await prisma.deal.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ deleted: result.count });
    }

    const data: any = {};
    if (stage) data.stage = stage;

    const result = await prisma.deal.updateMany({
      where: { id: { in: ids } },
      data,
    });

    return NextResponse.json({ updated: result.count });
  } catch {
    return serverError();
  }
}
