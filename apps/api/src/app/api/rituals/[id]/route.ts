import { NextResponse } from "next/server";
import { createInMemoryRitualRepository } from "@pandi/data-access";
import type { RitualId, UpdateRitualInput } from "@pandi/core-domain";

export const runtime = "nodejs";

const ritualRepository = createInMemoryRitualRepository();

function parseRitualId(id: string): RitualId | null {
  return id ? { value: id } : null;
}

// GET /api/rituals/[id] - Get specific ritual
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ritualId = parseRitualId(params.id);

  if (!ritualId) {
    return NextResponse.json(
      { error: "Invalid ritual ID" },
      { status: 400 }
    );
  }

  try {
    const ritual = await ritualRepository.findById(ritualId);
    
    if (!ritual) {
      return NextResponse.json(
        { error: "Ritual not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ritual });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch ritual" },
      { status: 500 }
    );
  }
}

// PUT /api/rituals/[id] - Update ritual
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ritualId = parseRitualId(params.id);

  if (!ritualId) {
    return NextResponse.json(
      { error: "Invalid ritual ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    const updateInput: UpdateRitualInput = {
      name: body.name ? { value: body.name } : undefined,
      description: body.description,
      category: body.category,
      frequency: body.frequency,
      targetTime: body.targetTime,
      duration: body.duration,
      isActive: body.isActive,
      color: body.color,
      icon: body.icon,
    };

    const ritual = await ritualRepository.update(ritualId, updateInput);
    
    return NextResponse.json({ 
      message: "Ritual updated successfully",
      ritual,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Ritual not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update ritual" },
      { status: 500 }
    );
  }
}

// DELETE /api/rituals/[id] - Delete ritual
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ritualId = parseRitualId(params.id);

  if (!ritualId) {
    return NextResponse.json(
      { error: "Invalid ritual ID" },
      { status: 400 }
    );
  }

  try {
    await ritualRepository.delete(ritualId);
    return NextResponse.json({ 
      message: "Ritual deleted successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete ritual" },
      { status: 500 }
    );
  }
}
