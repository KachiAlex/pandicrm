import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { notifyWorkspace } from "@/lib/notifications";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        account: true,
        contact: true,
        timelineEvents: { orderBy: { occurredAt: "desc" }, take: 20 },
      },
    });

    if (!deal) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(deal.workspaceId, userId))) return unauthorized();

    return NextResponse.json(deal);
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const previous = await prisma.deal.findUnique({ where: { id }, select: { stage: true, name: true, workspaceId: true } });
    if (!previous) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(previous.workspaceId, userId))) return unauthorized();

    const body = await req.json();
    const { name, stage, value, currency, probability, closeDate, description, accountId, contactId } = body;
    const updateData: any = { name, stage, value, currency, probability, description, accountId, contactId };
    if (closeDate) updateData.closeDate = new Date(closeDate);

    const deal = await prisma.deal.update({ where: { id }, data: updateData });

    if (stage && stage !== previous.stage) {
      const type = stage === "won" ? "deal_won" : stage === "lost" ? "deal_lost" : "deal_stage_change";
      const title = stage === "won" ? "Deal won!" : stage === "lost" ? "Deal lost" : "Deal stage changed";
      const message = `Deal "${previous.name}" moved from ${previous.stage} to ${stage}.`;
      await notifyWorkspace(previous.workspaceId, userId, type, title, message, "deal", id);
    }

    return NextResponse.json(deal);
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.deal.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    await prisma.deal.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
