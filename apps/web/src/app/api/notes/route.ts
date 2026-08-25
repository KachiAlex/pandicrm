import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { notifyWorkspace } from "@/lib/notifications";
import { createNoteSchema, validateBody } from "@/lib/validations";

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

    const notes = await prisma.note.findMany({
      where: { workspaceId },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(createNoteSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { workspaceId, contactId, dealId, title, content, type, tags, isShared, aiSummary } = validation.data;

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const note = await prisma.note.create({
      data: {
        workspaceId,
        authorId: userId,
        contactId,
        dealId,
        title,
        content,
        type,
        tags: tags || [],
        isShared: isShared ?? false,
        aiSummary: aiSummary || null,
      },
    });

    await notifyWorkspace(workspaceId, userId, "note_added", "New note added", `Note "${title}" was added.`, "note", note.id);

    return NextResponse.json(note, { status: 201 });
  } catch {
    return serverError();
  }
}
