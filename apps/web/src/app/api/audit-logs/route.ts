import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { getPaginationParams, createPaginatedResult } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const { skip, take, page, pageSize } = getPaginationParams(searchParams);

    const where: any = { workspaceId };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResult(logs, total, { page, pageSize, skip, take }));
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const { workspaceId, action, entityType, entityId, metadata } = body;

    if (!workspaceId || !action || !entityType || !entityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const log = await prisma.auditLog.create({
      data: {
        workspaceId,
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata || null,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch {
    return serverError();
  }
}
