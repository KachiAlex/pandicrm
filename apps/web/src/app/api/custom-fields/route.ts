import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const entityType = searchParams.get("entityType");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const where: any = { workspaceId };
    if (entityType) where.entityType = entityType;

    const fields = await prisma.customFieldDefinition.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(fields);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const { workspaceId, entityType, fieldName, fieldType, isRequired, options, sortOrder } = body;

    if (!workspaceId || !entityType || !fieldName || !fieldType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const field = await prisma.customFieldDefinition.create({
      data: {
        workspaceId,
        entityType,
        fieldName,
        fieldType,
        isRequired: isRequired || false,
        options: options || null,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Field name already exists for this entity type" }, { status: 409 });
    }
    return serverError();
  }
}
