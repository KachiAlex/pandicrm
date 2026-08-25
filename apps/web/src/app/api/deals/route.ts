import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { notifyWorkspace } from "@/lib/notifications";
import { createDealSchema, validateBody } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const deals = await prisma.deal.findMany({
      where: { workspaceId },
      include: {
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deals);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(createDealSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { workspaceId, accountId, contactId, name, stage, value, currency, probability, closeDate, description } = validation.data;

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const deal = await prisma.deal.create({
      data: { workspaceId, accountId, contactId, name, stage, value, currency, probability, closeDate: closeDate ? new Date(closeDate) : null, description },
    });

    await notifyWorkspace(workspaceId, userId, "deal_created", "New deal created", `Deal "${name}" was created in stage ${stage}.`, "deal", deal.id);

    return NextResponse.json(deal, { status: 201 });
  } catch {
    return serverError();
  }
}
