import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const userId = (session as any).user.id;
  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Current password and new password (min 6 chars) required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
