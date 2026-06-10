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

  const accounts = await prisma.account.findMany({
    where: { workspaceId },
    include: { contacts: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const { workspaceId, name, description, domain, industry, size, website, phone } = body;

  if (!workspaceId || !name) {
    return NextResponse.json({ error: "workspaceId and name required" }, { status: 400 });
  }

  const account = await prisma.account.create({
    data: { workspaceId, name, description, domain, industry, size, website, phone },
  });

  return NextResponse.json(account, { status: 201 });
}
