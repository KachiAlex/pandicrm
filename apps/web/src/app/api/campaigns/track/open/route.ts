import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GIF_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const recipientId = searchParams.get("recipient");

  if (!recipientId) {
    return new NextResponse(GIF_PIXEL, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  try {
    const recipient = await prisma.emailCampaignRecipient.findUnique({
      where: { id: recipientId },
      select: { id: true, status: true, campaignId: true, openedAt: true },
    });

    if (recipient && !recipient.openedAt) {
      await prisma.emailCampaignRecipient.update({
        where: { id: recipient.id },
        data: { status: "opened", openedAt: new Date() },
      });
      await prisma.emailCampaign.update({
        where: { id: recipient.campaignId },
        data: { openCount: { increment: 1 } },
      });
    }
  } catch {
    // fail silently so image always returns
  }

  return new NextResponse(GIF_PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
