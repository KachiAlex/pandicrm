import { NextResponse } from "next/server";
import { createInMemoryNoteRepository } from "@pandi/data-access";
import type { NoteId, TranscribeNoteInput } from "@pandi/core-domain";

export const runtime = "nodejs";

const noteRepository = createInMemoryNoteRepository();

// POST /api/notes/[id]/transcribe - Transcribe note audio/video
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const noteId = { value: params.id };

  try {
    const body = await request.json();
    
    const transcribeInput: TranscribeNoteInput = {
      noteId,
      forceRetranscribe: body.forceRetranscribe || false,
    };

    // In a real implementation, you would handle file uploads here
    // For now, we'll simulate the transcription process
    const result = await noteRepository.transcribeNote(transcribeInput);
    
    return NextResponse.json({ 
      message: "Note transcribed successfully",
      transcription: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already transcribed")) {
      return NextResponse.json(
        { error: "Note is already transcribed. Use forceRetranscribe to override." },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to transcribe note" },
      { status: 500 }
    );
  }
}
