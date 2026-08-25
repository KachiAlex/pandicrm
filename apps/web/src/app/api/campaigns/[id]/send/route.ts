import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { sendTransactionalEmail, replaceTemplateVariables } from "@/lib/brevo";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        recipients: {
          include: {
            contact: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!campaign) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(campaign.workspaceId, userId))) return unauthorized();

    if (campaign.status === "sent" || campaign.status === "sending") {
      return NextResponse.json({ error: "Campaign has already been sent or is sending" }, { status: 400 });
    }

    const pendingRecipients = campaign.recipients.filter((r) => r.status === "pending");
    if (pendingRecipients.length === 0) {
      return NextResponse.json({ error: "No pending recipients to send to" }, { status: 400 });
    }

    await prisma.emailCampaign.update({
      where: { id },
      data: { status: "sending" },
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of pendingRecipients) {
      const contact = recipient.contact;
      const variables: Record<string, string> = {
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        fullName: `${contact.firstName} ${contact.lastName}`.trim(),
        email: recipient.email,
      };

      const personalizedHtml = replaceTemplateVariables(campaign.htmlContent, variables);
      const personalizedText = campaign.textContent
        ? replaceTemplateVariables(campaign.textContent, variables)
        : undefined;
      const personalizedSubject = replaceTemplateVariables(campaign.subject, variables);

      const result = await sendTransactionalEmail({
        sender: { name: campaign.senderName, email: campaign.senderEmail },
        to: [{ email: recipient.email, name: `${contact.firstName} ${contact.lastName}`.trim() }],
        subject: personalizedSubject,
        htmlContent: personalizedHtml,
        textContent: personalizedText,
        replyTo: campaign.replyTo ? { email: campaign.replyTo } : undefined,
        tags: [`campaign:${campaign.id}`],
      });

      if (result.success) {
        sentCount++;
        await prisma.emailCampaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: "sent",
            brevoMessageId: result.messageId || null,
            sentAt: new Date(),
          },
        });
      } else {
        failedCount++;
        await prisma.emailCampaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: "failed",
            errorReason: result.error || "Unknown error",
          },
        });
      }
    }

    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: "sent",
        sentAt: new Date(),
        sentCount: sentCount,
        failedCount: failedCount,
      },
    });

    return NextResponse.json({
      sent: sentCount,
      failed: failedCount,
      total: pendingRecipients.length,
    });
  } catch {
    return serverError();
  }
}
