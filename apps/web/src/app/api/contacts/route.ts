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

  const contacts = await prisma.contact.findMany({
    where: { workspaceId },
    include: { account: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const { workspaceId, accountId, firstName, lastName, email, phone, title, department, linkedin } = body;

  if (!workspaceId || !firstName || !lastName) {
    return NextResponse.json({ error: "workspaceId, firstName, and lastName required" }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: { workspaceId, accountId, firstName, lastName, email, phone, title, department, linkedin },
  });

  return NextResponse.json(contact, { status: 201 });
}
