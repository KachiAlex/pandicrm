import { NextResponse } from "next/server";
import { createInMemoryRitualRepository } from "@pandi/data-access";
import type { CreateRitualInput, RitualFilter, WorkspaceId, UserId } from "@pandi/core-domain";

export const runtime = "nodejs";

const ritualRepository = createInMemoryRitualRepository();

// GET /api/rituals - List rituals with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filter: RitualFilter = {};
    
    if (searchParams.get("userId")) {
      filter.userId = { value: searchParams.get("userId")! };
    }
    
    if (searchParams.get("workspaceId")) {
      filter.workspaceId = { value: searchParams.get("workspaceId")! };
    }
    
    if (searchParams.get("category")) {
      filter.category = searchParams.get("category") as any;
    }
    
    if (searchParams.get("frequency")) {
      filter.frequency = searchParams.get("frequency") as any;
    }
    
    if (searchParams.get("isActive") !== null) {
      filter.isActive = searchParams.get("isActive") === "true";
    }
    
    if (searchParams.get("dateFrom")) {
      filter.dateFrom = searchParams.get("dateFrom")!;
    }
    
    if (searchParams.get("dateTo")) {
      filter.dateTo = searchParams.get("dateTo")!;
    }

    const rituals = await ritualRepository.list(filter);
    
    return NextResponse.json({ 
      rituals,
      total: rituals.length,
      filter,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch rituals" },
      { status: 500 }
    );
  }
}

// POST /api/rituals - Create a new ritual
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const createInput: CreateRitualInput = {
      userId: { value: body.userId },
      workspaceId: { value: body.workspaceId },
      name: { value: body.name },
      description: body.description,
      category: body.category,
      frequency: body.frequency,
      targetTime: body.targetTime,
      duration: body.duration,
      color: body.color,
      icon: body.icon,
    };

    // Basic validation
    if (!createInput.userId.value || !createInput.workspaceId.value || !createInput.name.value || !createInput.category || !createInput.frequency || !createInput.targetTime) {
      return NextResponse.json(
        { error: "userId, workspaceId, name, category, frequency, and targetTime are required" },
        { status: 400 }
      );
    }

    const ritual = await ritualRepository.create(createInput);
    
    return NextResponse.json({ 
      message: "Ritual created successfully",
      ritual,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create ritual" },
      { status: 500 }
    );
  }
}
