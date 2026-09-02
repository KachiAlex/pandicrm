import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { sendTransactionalEmail, replaceTemplateVariables, addTracking } from "@/lib/brevo";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        workspace: { select: { name: true } },
        recipients: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                account: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!campaign) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(campaign.workspaceId, userId))) return unauthorized();

    const failedRecipients = campaign.recipients.filter((r) => r.status === "failed");
    if (failedRecipients.length === 0) {
      return NextResponse.json({ error: "No failed recipients to resend to" }, { status: 400 });
    }

    await prisma.$transaction(
      failedRecipients.map((r) =>
        prisma.emailCampaignRecipient.update({
          where: { id: r.id },
          data: { status: "pending", errorReason: null },
        })
      )
    );

    await prisma.emailCampaign.update({
      where: { id },
      data: { status: "sending" },
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of failedRecipients) {
      const contact = recipient.contact;
      const variables: Record<string, string> = {
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        fullName: `${contact.firstName} ${contact.lastName}`.trim(),
        email: recipient.email,
        company: contact.account?.name || "",
        senderName: campaign.senderName,
        senderEmail: campaign.senderEmail,
        workspaceName: campaign.workspace?.name || "",
        unsubscribeUrl: `https://pandacrm.com.ng/unsubscribe?campaign=${campaign.id}&recipient=${recipient.id}`,
      };

      const personalizedHtml = replaceTemplateVariables(campaign.htmlContent, variables);
      const trackedHtml = addTracking(personalizedHtml, campaign.id, recipient.id, variables.unsubscribeUrl);
      const personalizedText = campaign.textContent
        ? replaceTemplateVariables(campaign.textContent, variables)
        : undefined;
      const personalizedSubject = replaceTemplateVariables(campaign.subject, variables);

      const result = await sendTransactionalEmail({
        workspaceId: campaign.workspaceId,
        sender: { name: campaign.senderName, email: campaign.senderEmail },
        to: [{ email: recipient.email, name: `${contact.firstName} ${contact.lastName}`.trim() }],
        subject: personalizedSubject,
        htmlContent: trackedHtml,
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
        sentCount: campaign.sentCount + sentCount,
        failedCount: campaign.failedCount - failedRecipients.length + failedCount,
      },
    });

    return NextResponse.json({
      sent: sentCount,
      failed: failedCount,
      total: failedRecipients.length,
    });
  } catch {
    return serverError();
  }
}
