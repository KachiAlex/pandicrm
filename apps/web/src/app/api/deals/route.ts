import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const deals = await prisma.deal.findMany({
    where: { workspaceId },
    include: {
      account: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deals);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const { workspaceId, accountId, contactId, name, stage, value, currency, probability, closeDate, description } = body;

  if (!workspaceId || !name) {
    return NextResponse.json({ error: "workspaceId and name required" }, { status: 400 });
  }

  const deal = await prisma.deal.create({
    data: { workspaceId, accountId, contactId, name, stage, value, currency, probability, closeDate: closeDate ? new Date(closeDate) : null, description },
  });

  return NextResponse.json(deal, { status: 201 });
}
