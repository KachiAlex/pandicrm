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

    const [attachments, total] = await Promise.all([
      prisma.fileAttachment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.fileAttachment.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResult(attachments, total, { page, pageSize, skip, take }));
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const { workspaceId, fileName, fileSize, mimeType, url, entityType, entityId } = body;

    if (!workspaceId || !fileName || !url || !entityType || !entityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const attachment = await prisma.fileAttachment.create({
      data: {
        workspaceId,
        fileName,
        fileSize: fileSize || 0,
        mimeType: mimeType || "application/octet-stream",
        url,
        entityType,
        entityId,
        uploadedById: userId,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch {
    return serverError();
  }
}
