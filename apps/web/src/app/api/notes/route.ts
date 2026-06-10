import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { notifyWorkspace } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const notes = await prisma.note.findMany({
    where: { workspaceId },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const { workspaceId, contactId, dealId, title, content, type, tags, isShared, aiSummary } = body;

  if (!workspaceId || !title || !content) {
    return NextResponse.json({ error: "workspaceId, title, and content required" }, { status: 400 });
  }

  const authorId = (session as any).user.id;
  const note = await prisma.note.create({
    data: {
      workspaceId,
      authorId,
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

  await notifyWorkspace(workspaceId, authorId, "note_added", "New note added", `Note "${title}" was added.`, "note", note.id);

  return NextResponse.json(note, { status: 201 });
}
