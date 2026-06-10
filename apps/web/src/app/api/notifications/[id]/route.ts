import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const notification = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json(notification);
}
