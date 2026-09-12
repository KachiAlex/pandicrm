import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { bulkUpdateTasksSchema, validateBody } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(bulkUpdateTasksSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { ids, status, priority, assigneeId, delete: shouldDelete } = validation.data;
    const userId = (session as any).user.id;

    const firstTask = await prisma.task.findFirst({
      where: { id: { in: ids } },
      select: { workspaceId: true },
    });

    if (!firstTask) {
      return NextResponse.json({ error: "No tasks found" }, { status: 404 });
    }

    if (!(await requireWorkspaceAccess(firstTask.workspaceId, userId))) return unauthorized();

    if (shouldDelete) {
      const result = await prisma.task.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ deleted: result.count });
    }

    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assigneeId !== undefined) data.assigneeId = assigneeId;

    const result = await prisma.task.updateMany({
      where: { id: { in: ids } },
      data,
    });

    return NextResponse.json({ updated: result.count });
  } catch {
    return serverError();
  }
}
