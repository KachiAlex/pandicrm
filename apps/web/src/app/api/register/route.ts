import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { registerSchema, validateBody } from "@/lib/validations";
import { serverError } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { allowed, retryAfter } = checkRateLimit(`register:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${retryAfter} seconds.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await req.json();
    const validation = validateBody(registerSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password, firstName, lastName, company, phone } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || null;

    const workspaceName = `${firstName || "My"}'s Workspace`;

    const { user, workspace } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          name: fullName,
          company: company || null,
          phone: phone || null,
          password: hashed,
        },
        select: { id: true, email: true, name: true },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: user.id,
          ownerId: user.id,
          plan: "starter",
        },
        select: { id: true, name: true, slug: true, ownerId: true },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: "owner",
        },
      });

      return { user, workspace };
    });

    return NextResponse.json({ user, workspace }, { status: 201 });
  } catch (err) {
    console.error("[REGISTER] Unexpected error during registration:", err);
    return serverError();
  }
}
