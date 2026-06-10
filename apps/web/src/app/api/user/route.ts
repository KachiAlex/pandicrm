import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const userId = (session as any).user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, firstName: true, lastName: true, company: true, phone: true, role: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const userId = (session as any).user.id;
  const body = await req.json();
  const { name, firstName, lastName, company, phone } = body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, firstName, lastName, company, phone },
  });

  return NextResponse.json(user);
}
