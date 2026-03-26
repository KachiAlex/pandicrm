import { NextResponse } from "next/server";
import { createInMemoryNoteRepository } from "@pandi/data-access";
import type { NoteId, ShareNoteInput } from "@pandi/core-domain";

export const runtime = "nodejs";

const noteRepository = createInMemoryNoteRepository();

// POST /api/notes/[id]/share - Share note with users
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const noteId = { value: params.id };

  try {
    const body = await request.json();
    
    const shareInput: ShareNoteInput = {
      noteId,
      shareWith: body.shareWith.map((id: string) => ({ value: id })),
      permissions: body.permissions || {
        canEdit: false,
        canComment: true,
        canShare: false,
      },
    };

    const note = await noteRepository.shareNote(shareInput);
    
    return NextResponse.json({ 
      message: "Note shared successfully",
      note,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("authorized")) {
      return NextResponse.json(
        { error: "Not authorized to share this note" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to share note" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id]/share - Unshare note with specific user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const noteId = { value: params.id };

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    await noteRepository.unshareNote(noteId, { value: userId });
    
    return NextResponse.json({ 
      message: "Note unshared successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to unshare note" },
      { status: 500 }
    );
  }
}
