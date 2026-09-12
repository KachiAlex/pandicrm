import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      select: { workspaceId: true, status: true },
    });

    if (!campaign) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(campaign.workspaceId, userId))) return unauthorized();

    if (campaign.status !== "draft") {
      return NextResponse.json({ error: "Only draft campaigns can be scheduled" }, { status: 400 });
    }

    const body = await req.json();
    const { scheduledAt } = body;

    if (!scheduledAt) {
      return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      return NextResponse.json({ error: "scheduledAt must be in the future" }, { status: 400 });
    }

    const updated = await prisma.emailCampaign.update({
      where: { id },
      data: {
        scheduledAt: scheduledDate,
        status: "scheduled",
      },
    });

    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      select: { workspaceId: true, status: true },
    });

    if (!campaign) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(campaign.workspaceId, userId))) return unauthorized();

    if (campaign.status !== "scheduled") {
      return NextResponse.json({ error: "Only scheduled campaigns can be unscheduled" }, { status: 400 });
    }

    const updated = await prisma.emailCampaign.update({
      where: { id },
      data: {
        scheduledAt: null,
        status: "draft",
      },
    });

    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}
