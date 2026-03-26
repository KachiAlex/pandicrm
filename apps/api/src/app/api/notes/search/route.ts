import { NextResponse } from "next/server";
import { createInMemoryNoteRepository } from "@pandi/data-access";
import type { WorkspaceId, UserId } from "@pandi/core-domain";

export const runtime = "nodejs";

const noteRepository = createInMemoryNoteRepository();

// GET /api/notes/search - Search notes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get("q");
    const userId = searchParams.get("userId");
    const workspaceId = searchParams.get("workspaceId");

    if (!query) {
      return NextResponse.json(
        { error: "Search query (q) is required" },
        { status: 400 }
      );
    }

    if (!userId || !workspaceId) {
      return NextResponse.json(
        { error: "userId and workspaceId are required" },
        { status: 400 }
      );
    }

    const notes = await noteRepository.search(query, { value: userId }, { value: workspaceId });
    
    return NextResponse.json({ 
      notes,
      query,
      total: notes.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search notes" },
      { status: 500 }
    );
  }
}
