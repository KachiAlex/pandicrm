import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      select: {
        id: true,
        workspaceId: true,
        status: true,
        totalRecipients: true,
        sentCount: true,
        failedCount: true,
        openCount: true,
        clickCount: true,
        bounceCount: true,
        unsubscribeCount: true,
        sentAt: true,
      },
    });

    if (!campaign) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(campaign.workspaceId, userId))) return unauthorized();

    const recipientStats = await prisma.emailCampaignRecipient.groupBy({
      by: ["status"],
      where: { campaignId: id },
      _count: { status: true },
    });

    return NextResponse.json({
      ...campaign,
      recipientBreakdown: recipientStats.reduce((acc, r) => {
        acc[r.status] = r._count.status;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch {
    return serverError();
  }
}
