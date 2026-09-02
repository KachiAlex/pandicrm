import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { sendTransactionalEmail, replaceTemplateVariables } from "@/lib/brevo";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: { workspace: { select: { name: true } } },
    });

    if (!campaign) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(campaign.workspaceId, userId))) return unauthorized();

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "A test email address is required" }, { status: 400 });
    }

    const variables: Record<string, string> = {
      firstName: "Test",
      lastName: "User",
      fullName: "Test User",
      email,
      company: "Test Company",
      senderName: campaign.senderName,
      senderEmail: campaign.senderEmail,
      workspaceName: campaign.workspace?.name || "",
      unsubscribeUrl: `https://pandacrm.com.ng/unsubscribe?campaign=${campaign.id}`,
    };

    const personalizedHtml = replaceTemplateVariables(campaign.htmlContent, variables);
    const personalizedText = campaign.textContent
      ? replaceTemplateVariables(campaign.textContent, variables)
      : undefined;
    const personalizedSubject = replaceTemplateVariables(campaign.subject, variables);

    const result = await sendTransactionalEmail({
      workspaceId: campaign.workspaceId,
      sender: { name: campaign.senderName, email: campaign.senderEmail },
      to: [{ email, name: "Test User" }],
      subject: `[TEST] ${personalizedSubject}`,
      htmlContent: personalizedHtml,
      textContent: personalizedText,
      replyTo: campaign.replyTo ? { email: campaign.replyTo } : undefined,
      tags: [`campaign:${campaign.id}`, "test"],
    });

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  } catch {
    return serverError();
  }
}
