import { NextResponse } from "next/server";
import { createInMemoryNoteRepository } from "@pandi/data-access";
import type { NoteId, UpdateNoteInput } from "@pandi/core-domain";

export const runtime = "nodejs";

const noteRepository = createInMemoryNoteRepository();

function parseNoteId(id: string): NoteId | null {
  return id ? { value: id } : null;
}

// GET /api/notes/[id] - Get specific note
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const noteId = parseNoteId(params.id);

  if (!noteId) {
    return NextResponse.json(
      { error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    const note = await noteRepository.findById(noteId);
    
    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch note" },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update note
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const noteId = parseNoteId(params.id);

  if (!noteId) {
    return NextResponse.json(
      { error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    const updateInput: UpdateNoteInput = {
      title: body.title,
      content: body.content ? { value: body.content } : undefined,
      tags: body.tags,
      isShared: body.isShared,
      sharedWith: body.sharedWith?.map((id: string) => ({ value: id })),
      metadata: body.metadata || {},
    };

    const note = await noteRepository.update(noteId, updateInput);
    
    return NextResponse.json({ 
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete note
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const noteId = parseNoteId(params.id);

  if (!noteId) {
    return NextResponse.json(
      { error: "Invalid note ID" },
      { status: 400 }
    );
  }

  try {
    await noteRepository.delete(noteId);
    return NextResponse.json({ 
      message: "Note deleted successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete note" },
      { status: 500 }
    );
  }
}
