import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const session = await requireAuth();
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
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const userId = (session as any).user.id;
  const body = await req.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 50);

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      plan: "free",
      ownerId: userId,
      members: {
        create: { userId, role: "owner" },
      },
    },
  });

  return NextResponse.json(workspace, { status: 201 });
}
