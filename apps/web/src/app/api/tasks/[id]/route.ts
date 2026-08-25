import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { notifyWorkspace } from "@/lib/notifications";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!task) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(task.workspaceId, userId))) return unauthorized();

    return NextResponse.json(task);
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const previous = await prisma.task.findUnique({ where: { id }, select: { status: true, title: true, workspaceId: true } });
    if (!previous) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(previous.workspaceId, userId))) return unauthorized();

    const body = await req.json();
    const { title, description, status, priority, assigneeId, accountId, contactId, dealId, dueDate, completedAt } = body;
    const updateData: any = { title, description, status, priority, assigneeId, accountId, contactId, dealId };
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (completedAt) updateData.completedAt = new Date(completedAt);

    const task = await prisma.task.update({ where: { id }, data: updateData });

    if (status === "done" && previous.status !== "done") {
      await notifyWorkspace(previous.workspaceId, userId, "task_completed", "Task completed", `Task "${previous.title}" was marked as done.`, "task", id);
    }

    return NextResponse.json(task);
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const existing = await prisma.task.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(existing.workspaceId, userId))) return unauthorized();

    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}
