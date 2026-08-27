import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, serverError } from "@/lib/api-auth";
import { createWorkspaceSchema, validateBody } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const userId = (session as any).user.id;

    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(workspaces);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const userId = (session as any).user.id;
    const body = await req.json();
    const validation = validateBody(createWorkspaceSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name } = validation.data;

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 50);

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        plan: "free",
        ownerId: userId,
        members: {
          create: { userId, role: "admin" },
        },
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch {
    return serverError();
  }
}
