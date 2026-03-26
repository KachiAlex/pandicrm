import { NextResponse } from "next/server";
import { createInMemoryRitualRepository } from "@pandi/data-access";
import type { WorkspaceId, UserId } from "@pandi/core-domain";

export const runtime = "nodejs";

const ritualRepository = createInMemoryRitualRepository();

// GET /api/rituals/stats - Get ritual statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get("userId");
    const workspaceId = searchParams.get("workspaceId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!userId || !workspaceId) {
      return NextResponse.json(
        { error: "userId and workspaceId are required" },
        { status: 400 }
      );
    }

    const stats = await ritualRepository.getStats(
      { value: userId },
      { value: workspaceId },
      dateFrom || undefined,
      dateTo || undefined
    );
    
    return NextResponse.json({ 
      stats,
      userId,
      workspaceId,
      dateFrom,
      dateTo,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch ritual stats" },
      { status: 500 }
    );
  }
}
