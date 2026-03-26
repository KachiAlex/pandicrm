import { NextResponse } from "next/server";
import { createInMemoryNoteRepository } from "@pandi/data-access";
import type { CreateNoteInput, NoteFilter, WorkspaceId, UserId } from "@pandi/core-domain";

export const runtime = "nodejs";

const noteRepository = createInMemoryNoteRepository();

// GET /api/notes - List notes with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filter: NoteFilter = {};
    
    if (searchParams.get("userId")) {
      filter.userId = { value: searchParams.get("userId")! };
    }
    
    if (searchParams.get("workspaceId")) {
      filter.workspaceId = { value: searchParams.get("workspaceId")! };
    }
    
    if (searchParams.get("type")) {
      filter.type = searchParams.get("type") as any;
    }
    
    if (searchParams.get("tags")) {
      filter.tags = searchParams.get("tags")!.split(",").map(tag => tag.trim());
    }
    
    if (searchParams.get("isShared") !== null) {
      filter.isShared = searchParams.get("isShared") === "true";
    }
    
    if (searchParams.get("sharedWithUserId")) {
      filter.sharedWithUserId = { value: searchParams.get("sharedWithUserId")! };
    }
    
    if (searchParams.get("dateFrom")) {
      filter.dateFrom = searchParams.get("dateFrom")!;
    }
    
    if (searchParams.get("dateTo")) {
      filter.dateTo = searchParams.get("dateTo")!;
    }
    
    if (searchParams.get("searchQuery")) {
      filter.searchQuery = searchParams.get("searchQuery")!;
    }
    
    if (searchParams.get("hasTranscript") !== null) {
      filter.hasTranscript = searchParams.get("hasTranscript") === "true";
    }
    
    if (searchParams.get("hasActionItems") !== null) {
      filter.hasActionItems = searchParams.get("hasActionItems") === "true";
    }

    const notes = await noteRepository.list(filter);
    
    return NextResponse.json({ 
      notes,
      total: notes.length,
      filter,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const createInput: CreateNoteInput = {
      userId: { value: body.userId },
      workspaceId: { value: body.workspaceId },
      title: body.title,
      content: { value: body.content },
      type: body.type,
      tags: body.tags || [],
      metadata: body.metadata || {},
      isShared: body.isShared || false,
      sharedWith: body.sharedWith?.map((id: string) => ({ value: id })) || [],
    };

    // Basic validation
    if (!createInput.userId.value || !createInput.workspaceId.value || !createInput.title || !createInput.content.value) {
      return NextResponse.json(
        { error: "userId, workspaceId, title, and content are required" },
        { status: 400 }
      );
    }

    const note = await noteRepository.create(createInput);
    
    return NextResponse.json({ 
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create note" },
      { status: 500 }
    );
  }
}
