import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { createContactSchema, validateBody } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const contacts = await prisma.contact.findMany({
      where: { workspaceId },
      include: { account: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(createContactSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { workspaceId, accountId, firstName, lastName, email, phone, title, department, linkedin } = validation.data;

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const contact = await prisma.contact.create({
      data: { workspaceId, accountId, firstName, lastName, email, phone, title, department, linkedin },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch {
    return serverError();
  }
}
