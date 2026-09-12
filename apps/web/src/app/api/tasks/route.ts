import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { notifyWorkspace } from "@/lib/notifications";
import { createTaskSchema, validateBody } from "@/lib/validations";
import { getPaginationParams, createPaginatedResult } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const status = searchParams.get("status")?.trim();
    const priority = searchParams.get("priority")?.trim();
    const assigneeId = searchParams.get("assigneeId")?.trim();

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const { skip, take, page, pageSize } = getPaginationParams(searchParams);

    const where: any = { workspaceId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResult(tasks, total, { page, pageSize, skip, take }));
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(createTaskSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { workspaceId, assigneeId, accountId, contactId, dealId, title, description, status, priority, dueDate } = validation.data;

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const task = await prisma.task.create({
      data: {
        workspaceId,
        assigneeId,
        accountId,
        contactId,
        dealId,
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    await notifyWorkspace(workspaceId, userId, "task_created", "New task assigned", `Task "${title}" was created.`, "task", task.id);

    return NextResponse.json(task, { status: 201 });
  } catch {
    return serverError();
  }
}
