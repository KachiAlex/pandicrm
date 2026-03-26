import { NextResponse } from "next/server";
import { createInMemoryRitualRepository } from "@pandi/data-access";
import type { RitualId, CompleteRitualInput } from "@pandi/core-domain";
import { wsManager } from "../../../../lib/websocket";
import { notificationManager } from "../../../../lib/notifications";

export const runtime = "nodejs";

const ritualRepository = createInMemoryRitualRepository();

// POST /api/rituals/[id]/complete - Complete a ritual
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ritualId = { value: params.id };

  try {
    const body = await request.json();
    
    const completeInput: CompleteRitualInput = {
      ritualId,
      duration: body.duration,
      quality: body.quality,
      notes: body.notes,
      mood: body.mood,
      energy: body.energy,
    };

    // Basic validation
    if (!completeInput.duration || !completeInput.quality) {
      return NextResponse.json(
        { error: "duration and quality are required" },
        { status: 400 }
      );
    }

    const completion = await ritualRepository.completeRitual(completeInput);
    const ritual = await ritualRepository.findById(ritualId);
    
    if (!ritual) {
      return NextResponse.json(
        { error: "Ritual not found" },
        { status: 404 }
      );
    }
    
    // Broadcast real-time update
    wsManager.broadcastRitualUpdate(ritual.workspaceId.value, ritual, "completed");
    
    // Send celebration notification
    await notificationManager.notifyRitualCompleted(
      ritual.userId.value,
      ritual.workspaceId.value,
      ritual
    );
    
    return NextResponse.json({ 
      message: "Ritual completed successfully",
      completion,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Ritual not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("not active")) {
      return NextResponse.json(
        { error: "Ritual is not active" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete ritual" },
      { status: 500 }
    );
  }
}
