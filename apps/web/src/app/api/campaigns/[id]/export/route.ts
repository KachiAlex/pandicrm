import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { toCSV } from "@/lib/csv";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        recipients: {
          include: {
            contact: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!campaign) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(campaign.workspaceId, userId))) return unauthorized();

    const rows = [
      ["Campaign", "Recipient", "Email", "Status", "Sent At", "Opened At", "Error"],
      ...campaign.recipients.map((r) => [
        campaign.name,
        r.contact ? `${r.contact.firstName} ${r.contact.lastName}` : "",
        r.email,
        r.status,
        r.sentAt ? new Date(r.sentAt).toISOString() : "",
        r.openedAt ? new Date(r.openedAt).toISOString() : "",
        r.errorReason || "",
      ]),
    ];

    const csv = toCSV(rows);
    const filename = `campaign-${campaign.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-export.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv;charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return serverError();
  }
}
