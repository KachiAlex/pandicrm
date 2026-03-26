import { NextResponse } from "next/server";
import { createInMemoryRitualRepository } from "@pandi/data-access";
import type { RitualId } from "@pandi/core-domain";

export const runtime = "nodejs";

const ritualRepository = createInMemoryRitualRepository();

// GET /api/rituals/[id]/completions - Get ritual completions
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ritualId = { value: params.id };

  try {
    const { searchParams } = new URL(request.url);
    
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const completions = await ritualRepository.getCompletions(ritualId, dateFrom || undefined, dateTo || undefined);
    
    return NextResponse.json({ 
      completions,
      total: completions.length,
      dateFrom,
      dateTo,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch completions" },
      { status: 500 }
    );
  }
}
