import { prisma } from "@/lib/prisma";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string; recipient?: string }>;
}) {
  const params = await searchParams;
  const { campaign, recipient } = params;
  let message = "Invalid unsubscribe link.";

  if (campaign && recipient) {
    try {
      const record = await prisma.emailCampaignRecipient.findUnique({
        where: { id: recipient },
        select: { campaignId: true, status: true },
      });

      if (record && record.campaignId === campaign) {
        if (record.status !== "unsubscribed") {
          await prisma.emailCampaignRecipient.update({
            where: { id: recipient },
            data: { status: "unsubscribed" },
          });
          await prisma.emailCampaign.update({
            where: { id: campaign },
            data: { unsubscribeCount: { increment: 1 } },
          });
        }
        message = "You have been unsubscribed from this campaign.";
      }
    } catch {
      message = "Something went wrong. Please try again later.";
    }
  }

  return (
    <html>
      <body className="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <h1 className="text-xl font-bold mb-2">Unsubscribe</h1>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </body>
    </html>
  );
}
