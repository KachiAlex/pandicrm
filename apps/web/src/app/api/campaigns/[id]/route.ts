import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { updateCampaignSchema, validateBody } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        template: { select: { id: true, name: true, subject: true, htmlContent: true } },
        recipients: {
          include: {
            contact: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!campaign) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(campaign.workspaceId, userId))) return unauthorized();

    return NextResponse.json(campaign);
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.emailCampaign.findUnique({ where: { id }, select: { workspaceId: true, status: true } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    if (existing.status === "sending" || existing.status === "sent") {
      return NextResponse.json({ error: "Cannot edit a campaign that has been sent or is sending" }, { status: 400 });
    }

    const body = await req.json();
    const validation = validateBody(updateCampaignSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, subject, htmlContent, textContent, senderName, senderEmail, replyTo } = validation.data;

    const campaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(subject !== undefined && { subject }),
        ...(htmlContent !== undefined && { htmlContent }),
        ...(textContent !== undefined && { textContent }),
        ...(senderName !== undefined && { senderName }),
        ...(senderEmail !== undefined && { senderEmail }),
        ...(replyTo !== undefined && { replyTo: replyTo || null }),
      },
    });

    return NextResponse.json(campaign);
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.emailCampaign.findUnique({ where: { id }, select: { workspaceId: true, status: true } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    if (existing.status === "sending") {
      return NextResponse.json({ error: "Cannot delete a campaign that is currently sending" }, { status: 400 });
    }

    await prisma.emailCampaign.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
