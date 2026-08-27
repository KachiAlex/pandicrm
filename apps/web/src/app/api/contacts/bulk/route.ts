import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { bulkUpdateContactsSchema, validateBody } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(bulkUpdateContactsSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { ids, status, categoryIds, delete: shouldDelete } = validation.data;

    const userId = (session as any).user.id;

    // Resolve workspace from the first contact and verify all belong to the same workspace
    const first = await prisma.contact.findFirst({
      where: { id: { in: ids } },
      select: { workspaceId: true },
      orderBy: { createdAt: "asc" },
    });

    if (!first) {
      return NextResponse.json({ error: "No contacts found" }, { status: 404 });
    }

    if (!(await requireWorkspaceAccess(first.workspaceId, userId))) return unauthorized();

    if (shouldDelete) {
      await prisma.contact.deleteMany({
        where: { id: { in: ids }, workspaceId: first.workspaceId },
      });
      return NextResponse.json({ deleted: ids.length });
    }

    if (status !== undefined) {
      await prisma.contact.updateMany({
        where: { id: { in: ids }, workspaceId: first.workspaceId },
        data: { status },
      });
      return NextResponse.json({ updated: ids.length });
    }

    if (categoryIds !== undefined) {
      // Validate categories belong to the workspace
      if (categoryIds.length > 0) {
        const categories = await prisma.contactCategory.findMany({
          where: { id: { in: categoryIds }, workspaceId: first.workspaceId },
          select: { id: true },
        });
        if (categories.length !== categoryIds.length) {
          return NextResponse.json({ error: "One or more categories do not exist in this workspace" }, { status: 400 });
        }
      }

      await prisma.contact.updateMany({
        where: { id: { in: ids }, workspaceId: first.workspaceId },
        data: { categoryIds: { set: categoryIds } },
      });
      return NextResponse.json({ updated: ids.length });
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 });
  } catch {
    return serverError();
  }
}
