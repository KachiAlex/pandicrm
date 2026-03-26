import type {
  Note,
  NoteId,
  NoteContent,
  TranscriptText,
  NoteType,
  NoteMetadata,
  CreateNoteInput,
  UpdateNoteInput,
  TranscribeNoteInput,
  TranscriptionResult,
  ShareNoteInput,
  NotePermissions,
  NoteFilter,
  NoteRepository,
  UserId,
  WorkspaceId,
} from "@pandi/core-domain";

// In-memory storage for demo purposes
const notes: Map<string, Note> = new Map();
const userToNotesMap: Map<string, string[]> = new Map();
const workspaceToNotesMap: Map<string, string[]> = new Map();
const sharedNotesMap: Map<string, string[]> = new Map();

// Helper functions
const generateId = (): string => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Mock AI transcription service
const mockTranscribeAudio = async (audioFile?: File, videoFile?: File): Promise<TranscriptionResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockTranscripts = [
    "In today's meeting, we discussed the Q3 roadmap and identified key milestones for the product launch.",
    "The client expressed concerns about the timeline and requested additional resources for the project.",
    "We need to follow up with the engineering team to get an updated estimate for the feature implementation.",
    "The marketing team has prepared a comprehensive campaign strategy that aligns with our sales goals.",
    "Budget allocation for next quarter needs to be finalized by the end of this week.",
  ];

  const mockKeyPoints = [
    "Q3 roadmap review completed",
    "Client concerns about project timeline",
    "Additional resources requested",
    "Marketing campaign strategy approved",
    "Budget deadline approaching",
  ];

  const mockActionItems = [
    "Follow up with engineering team for estimates",
    "Schedule client meeting to address concerns",
    "Finalize Q3 budget allocation",
    "Review marketing campaign materials",
    "Prepare project timeline revision",
  ];

  return {
    transcript: { value: mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)] },
    confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
    language: "en",
    summary: "Key discussion points and action items from the meeting",
    keyPoints: mockKeyPoints.slice(0, 2 + Math.floor(Math.random() * 2)),
    actionItems: mockActionItems.slice(0, 1 + Math.floor(Math.random() * 2)),
    processingTime: 2000,
  };
};

// In-memory NoteRepository implementation
export class InMemoryNoteRepository implements NoteRepository {
  async create(input: CreateNoteInput): Promise<Note> {
    const id: NoteId = { value: generateId() };
    
    const note: Note = {
      id,
      userId: input.userId,
      workspaceId: input.workspaceId,
      title: input.title,
      content: input.content,
      type: input.type,
      tags: input.tags || [],
      isShared: input.isShared || false,
      sharedWith: input.sharedWith || [],
      metadata: {
        aiTranscribed: false,
        ...input.metadata,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store note
    notes.set(id.value, note);

    // Update user mapping
    const userNotes = userToNotesMap.get(input.userId.value) || [];
    userNotes.push(id.value);
    userToNotesMap.set(input.userId.value, userNotes);

    // Update workspace mapping
    const workspaceNotes = workspaceToNotesMap.get(input.workspaceId.value) || [];
    workspaceNotes.push(id.value);
    workspaceToNotesMap.set(input.workspaceId.value, workspaceNotes);

    // Update shared mapping if shared
    if (note.isShared && note.sharedWith) {
      for (const sharedUserId of note.sharedWith) {
        const sharedUserNotes = sharedNotesMap.get(sharedUserId.value) || [];
        sharedUserNotes.push(id.value);
        sharedNotesMap.set(sharedUserId.value, sharedUserNotes);
      }
    }

    return note;
  }

  async update(id: NoteId, input: UpdateNoteInput): Promise<Note> {
    const existingNote = notes.get(id.value);
    if (!existingNote) {
      throw new Error("Note not found");
    }

    const updatedNote: Note = {
      ...existingNote,
      ...input,
      metadata: {
        ...existingNote.metadata,
        ...input.metadata,
      },
      updatedAt: new Date().toISOString(),
    };

    // Handle sharing changes
    if (input.isShared !== undefined || input.sharedWith !== undefined) {
      // Remove from old shared mappings
      if (existingNote.sharedWith) {
        for (const oldSharedUserId of existingNote.sharedWith) {
          const oldSharedNotes = sharedNotesMap.get(oldSharedUserId.value) || [];
          const filteredNotes = oldSharedNotes.filter(noteId => noteId !== id.value);
          sharedNotesMap.set(oldSharedUserId.value, filteredNotes);
        }
      }

      // Add to new shared mappings
      if (updatedNote.isShared && updatedNote.sharedWith) {
        for (const newSharedUserId of updatedNote.sharedWith) {
          const newSharedNotes = sharedNotesMap.get(newSharedUserId.value) || [];
          newSharedNotes.push(id.value);
          sharedNotesMap.set(newSharedUserId.value, newSharedNotes);
        }
      }
    }

    notes.set(id.value, updatedNote);
    return updatedNote;
  }

  async delete(id: NoteId): Promise<void> {
    const note = notes.get(id.value);
    if (!note) return;

    // Remove from main storage
    notes.delete(id.value);

    // Remove from user mapping
    const userNotes = userToNotesMap.get(note.userId.value) || [];
    const filteredUserNotes = userNotes.filter(noteId => noteId !== id.value);
    userToNotesMap.set(note.userId.value, filteredUserNotes);

    // Remove from workspace mapping
    const workspaceNotes = workspaceToNotesMap.get(note.workspaceId.value) || [];
    const filteredWorkspaceNotes = workspaceNotes.filter(noteId => noteId !== id.value);
    workspaceToNotesMap.set(note.workspaceId.value, filteredWorkspaceNotes);

    // Remove from shared mappings
    if (note.sharedWith) {
      for (const sharedUserId of note.sharedWith) {
        const sharedNotes = sharedNotesMap.get(sharedUserId.value) || [];
        const filteredSharedNotes = sharedNotes.filter(noteId => noteId !== id.value);
        sharedNotesMap.set(sharedUserId.value, filteredSharedNotes);
      }
    }
  }

  async findById(id: NoteId): Promise<Note | null> {
    return notes.get(id.value) || null;
  }

  async list(filter: NoteFilter): Promise<Note[]> {
    let allNotes = Array.from(notes.values());

    // Apply filters
    if (filter.userId) {
      allNotes = allNotes.filter(note => note.userId.value === filter.userId!.value);
    }

    if (filter.workspaceId) {
      allNotes = allNotes.filter(note => note.workspaceId.value === filter.workspaceId!.value);
    }

    if (filter.type) {
      allNotes = allNotes.filter(note => note.type === filter.type);
    }

    if (filter.tags && filter.tags.length > 0) {
      allNotes = allNotes.filter(note => 
        filter.tags!.some(tag => note.tags.includes(tag))
      );
    }

    if (filter.isShared !== undefined) {
      allNotes = allNotes.filter(note => note.isShared === filter.isShared);
    }

    if (filter.sharedWithUserId) {
      allNotes = allNotes.filter(note => 
        note.sharedWith?.some(userId => userId.value === filter.sharedWithUserId!.value)
      );
    }

    if (filter.dateFrom) {
      const fromDate = new Date(filter.dateFrom);
      allNotes = allNotes.filter(note => new Date(note.createdAt) >= fromDate);
    }

    if (filter.dateTo) {
      const toDate = new Date(filter.dateTo);
      allNotes = allNotes.filter(note => new Date(note.createdAt) <= toDate);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      allNotes = allNotes.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.value.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filter.hasTranscript !== undefined) {
      allNotes = allNotes.filter(note => note.metadata.aiTranscribed === filter.hasTranscript);
    }

    if (filter.hasActionItems !== undefined) {
      allNotes = allNotes.filter(note => 
        (note.metadata.actionItems?.length || 0) > 0 === filter.hasActionItems
      );
    }

    // Sort by creation date (newest first)
    return allNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listByUser(userId: UserId, filter?: NoteFilter): Promise<Note[]> {
    const userFilter = { ...filter, userId };
    return this.list(userFilter);
  }

  async listByWorkspace(workspaceId: WorkspaceId, filter?: NoteFilter): Promise<Note[]> {
    const workspaceFilter = { ...filter, workspaceId };
    return this.list(workspaceFilter);
  }

  async listSharedWithUser(userId: UserId, filter?: NoteFilter): Promise<Note[]> {
    const sharedNoteIds = sharedNotesMap.get(userId.value) || [];
    const sharedNotes = sharedNoteIds
      .map(noteId => notes.get(noteId))
      .filter((note): note is Note => note !== undefined);

    // Apply additional filters if provided
    let filteredNotes = sharedNotes;
    if (filter) {
      const { sharedWithUserId, ...otherFilters } = filter;
      filteredNotes = await this.list({ ...otherFilters });
      filteredNotes = filteredNotes.filter(note => sharedNotes.includes(note));
    }

    return filteredNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async search(query: string, userId: UserId, workspaceId: WorkspaceId): Promise<Note[]> {
    const searchFilter: NoteFilter = {
      userId,
      workspaceId,
      searchQuery: query,
    };
    return this.list(searchFilter);
  }

  async shareNote(input: ShareNoteInput): Promise<Note> {
    const note = await this.findById(input.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.userId.value !== input.shareWith[0].value) {
      // In a real implementation, check permissions
      throw new Error("Not authorized to share this note");
    }

    return this.update(input.noteId, {
      isShared: true,
      sharedWith: input.shareWith,
    });
  }

  async unshareNote(noteId: NoteId, userId: UserId): Promise<void> {
    const note = await this.findById(noteId);
    if (!note) return;

    const updatedSharedWith = note.sharedWith?.filter(
      sharedUserId => sharedUserId.value !== userId.value
    ) || [];

    await this.update(noteId, {
      isShared: updatedSharedWith.length > 0,
      sharedWith: updatedSharedWith,
    });
  }

  async transcribeNote(input: TranscribeNoteInput): Promise<TranscriptionResult> {
    const note = await this.findById(input.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Only transcribe if not already transcribed or forced retranscribe
    if (note.metadata.aiTranscribed && !input.forceRetranscribe) {
      throw new Error("Note already transcribed");
    }

    const result = await mockTranscribeAudio(input.audioFile, input.videoFile);
    
    // Update note with transcription results
    await this.updateTranscription(input.noteId, result);
    
    return result;
  }

  async updateTranscription(noteId: NoteId, result: TranscriptionResult): Promise<Note> {
    const note = await this.findById(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    return this.update(noteId, {
      metadata: {
        aiTranscribed: true,
        transcriptionConfidence: result.confidence,
        language: result.language,
        summary: result.summary,
        keyPoints: result.keyPoints,
        actionItems: result.actionItems,
      },
    });
  }
}

// Factory function
export const createInMemoryNoteRepository = (): InMemoryNoteRepository => {
  return new InMemoryNoteRepository();
};

// Seed with demo notes
export const seedNotesData = async (userId: UserId, workspaceId: WorkspaceId) => {
  const noteRepo = createInMemoryNoteRepository();
  
  try {
    // Create demo notes
    await noteRepo.create({
      userId,
      workspaceId,
      title: "Q3 Planning Meeting",
      content: { value: "Discussion about Q3 roadmap and resource allocation" },
      type: "meeting",
      tags: ["planning", "q3", "roadmap"],
      metadata: {
        duration: 45,
        participantCount: 8,
        aiTranscribed: true,
        transcriptionConfidence: 0.92,
        language: "en",
        summary: "Key decisions made about Q3 product roadmap and team priorities",
        keyPoints: ["Product launch timeline confirmed", "Additional resources approved", "Marketing campaign finalized"],
        actionItems: ["Update project timeline", "Schedule follow-up with stakeholders", "Prepare budget proposal"],
      },
    });

    await noteRepo.create({
      userId,
      workspaceId,
      title: "Client Call - Acme Corp",
      content: { value: "Requirements discussion and project scope clarification" },
      type: "call",
      tags: ["client", "acme-corp", "requirements"],
      metadata: {
        duration: 30,
        aiTranscribed: true,
        transcriptionConfidence: 0.88,
        language: "en",
        summary: "Client feedback on initial proposal and scope adjustments needed",
        keyPoints: ["Timeline concerns addressed", "Budget discussion completed", "Next steps defined"],
        actionItems: ["Revised proposal due Friday", "Technical review scheduled", "Contract terms to be finalized"],
      },
    });

    await noteRepo.create({
      userId,
      workspaceId,
      title: "Product Development Notes",
      content: { value: "Technical decisions and architecture considerations for the new feature" },
      type: "manual",
      tags: ["development", "architecture", "technical"],
      metadata: {
        aiTranscribed: false,
      },
    });

    await noteRepo.create({
      userId,
      workspaceId,
      title: "Sales Strategy Brainstorm",
      content: { value: "Ideas for improving sales process and conversion rates" },
      type: "voice_memo",
      tags: ["sales", "strategy", "brainstorm"],
      metadata: {
        duration: 15,
        aiTranscribed: true,
        transcriptionConfidence: 0.85,
        language: "en",
        summary: "Brainstorming session on sales process improvements",
        keyPoints: ["Lead qualification process needs refinement", "Follow-up timing optimization", "Better tracking of conversion metrics"],
        actionItems: ["Research lead scoring models", "Analyze current conversion funnel", "Propose new sales workflow"],
      },
    });
  } catch (error) {
    console.log("Notes seeding completed or notes already exist");
  }
};
