import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { notifyWorkspace } from "@/lib/notifications";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const body = await req.json();
  if (body.closeDate) body.closeDate = new Date(body.closeDate);

  const previous = await prisma.deal.findUnique({ where: { id }, select: { stage: true, name: true, workspaceId: true } });
  const deal = await prisma.deal.update({ where: { id }, data: body });

  if (previous && body.stage && body.stage !== previous.stage) {
    const sessionUserId = (session as any).user.id;
    const type = body.stage === "won" ? "deal_won" : body.stage === "lost" ? "deal_lost" : "deal_stage_change";
    const title = body.stage === "won" ? "Deal won!" : body.stage === "lost" ? "Deal lost" : "Deal stage changed";
    const message = `Deal "${previous.name}" moved from ${previous.stage} to ${body.stage}.`;
    await notifyWorkspace(previous.workspaceId, sessionUserId, type, title, message, "deal", id);
  }

  return NextResponse.json(deal);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  await prisma.deal.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
