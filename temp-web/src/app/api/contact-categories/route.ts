import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { createContactCategorySchema, validateBody } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const categories = await prisma.contactCategory.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    });

    const withCounts = await Promise.all(
      categories.map(async (c) => ({
        ...c,
        count: await prisma.contact.count({ where: { workspaceId, categoryIds: { has: c.id } } }),
      }))
    );

    return NextResponse.json(withCounts);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(createContactCategorySchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { workspaceId, name, color } = validation.data;

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const existing = await prisma.contactCategory.findFirst({
      where: { workspaceId, name: { equals: name, mode: "insensitive" } },
    });
    if (existing) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
    }

    const category = await prisma.contactCategory.create({
      data: { workspaceId, name, color },
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return serverError();
  }
}
