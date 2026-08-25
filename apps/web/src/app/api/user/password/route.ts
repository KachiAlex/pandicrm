import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, serverError, notFound } from "@/lib/api-auth";
import bcrypt from "bcryptjs";
import { changePasswordSchema, validateBody } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const userId = (session as any).user.id;
    const body = await req.json();
    const validation = validateBody(changePasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      return notFound();
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
