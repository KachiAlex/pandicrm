import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { z } from "zod";

const markReadSchema = z.object({
  read: z.boolean().default(true),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const userId = (session as any).user.id;

    const notification = await prisma.notification.findUnique({ where: { id }, select: { userId: true, workspaceId: true } });
    if (!notification) return notFound();
    if (notification.userId !== userId) return unauthorized();

    const body = await req.json();
    const validation = markReadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: validation.data.read },
    });

    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}
