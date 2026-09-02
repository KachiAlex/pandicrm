import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { account: true },
    });
    if (!contact) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(contact.workspaceId, userId))) return unauthorized();

    const dealName = `${contact.firstName} ${contact.lastName}`.trim() || "New deal";
    const accountName = contact.account?.name || null;

    const [updated, deal] = await prisma.$transaction([
      prisma.contact.update({
        where: { id },
        data: { status: "opportunity" },
      }),
      prisma.deal.create({
        data: {
          workspaceId: contact.workspaceId,
          accountId: contact.accountId,
          contactId: contact.id,
          name: accountName ? `${accountName} - ${dealName}` : dealName,
          stage: "lead",
          value: 0,
          currency: "USD",
          probability: 10,
        },
      }),
    ]);

    return NextResponse.json({ contact: updated, deal }, { status: 201 });
  } catch {
    return serverError();
  }
}
