import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const recipientId = searchParams.get("recipient");
  const targetUrl = searchParams.get("url") || "";

  if (!recipientId || !targetUrl) {
    return NextResponse.redirect("https://pandacrm.com.ng");
  }

  try {
    const recipient = await prisma.emailCampaignRecipient.findUnique({
      where: { id: recipientId },
      select: { id: true, status: true, campaignId: true, openedAt: true, clickedAt: true },
    });

    if (recipient) {
      const recipientData: Record<string, any> = {};
      const campaignData: Record<string, any> = {};

      if (!recipient.openedAt) {
        recipientData.openedAt = new Date();
        campaignData.openCount = { increment: 1 };
      }

      if (!recipient.clickedAt) {
        recipientData.clickedAt = new Date();
        campaignData.clickCount = { increment: 1 };
      }

      if (recipient.status !== "clicked") {
        recipientData.status = "clicked";
      }

      if (Object.keys(recipientData).length > 0) {
        await prisma.emailCampaignRecipient.update({
          where: { id: recipient.id },
          data: recipientData,
        });
      }

      if (Object.keys(campaignData).length > 0) {
        await prisma.emailCampaign.update({
          where: { id: recipient.campaignId },
          data: campaignData,
        });
      }
    }
  } catch {
    // redirect anyway
  }

  return NextResponse.redirect(targetUrl);
}
