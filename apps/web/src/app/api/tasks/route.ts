import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { notifyWorkspace } from "@/lib/notifications";
import { createTaskSchema, validateBody } from "@/lib/validations";

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

    const tasks = await prisma.task.findMany({
      where: { workspaceId },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
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
