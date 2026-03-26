import { NextResponse } from "next/server";
import { createInMemoryTaskRepository } from "@pandi/data-access";
import type { 
  WorkspaceId,
  TimePeriod
} from "@pandi/core-domain";

export const runtime = "nodejs";

const taskRepository = createInMemoryTaskRepository();

function parseWorkspaceId(url: URL): WorkspaceId | null {
  const workspaceId = url.searchParams.get("workspaceId");
  return workspaceId ? { value: workspaceId } : null;
}

function parseTimePeriod(period: string): TimePeriod | null {
  const validPeriods: TimePeriod[] = ["daily", "weekly", "monthly", "annual", "adhoc"];
  return validPeriods.includes(period as TimePeriod) ? period as TimePeriod : null;
}

// GET /api/tasks/period/[period] - Get tasks by time period
export async function GET(
  request: Request,
  { params }: { params: { period: string } }
) {
  const url = new URL(request.url);
  const workspaceId = parseWorkspaceId(url);
  const timePeriod = parseTimePeriod(params.period);

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId query parameter is required" },
      { status: 400 }
    );
  }

  if (!timePeriod) {
    return NextResponse.json(
      { error: "Invalid time period. Must be one of: daily, weekly, monthly, annual, adhoc" },
      { status: 400 }
    );
  }

  const startDate = url.searchParams.get("startDate") || undefined;
  const endDate = url.searchParams.get("endDate") || undefined;

  try {
    const tasks = await taskRepository.getTasksByTimePeriod(
      workspaceId, 
      timePeriod, 
      startDate, 
      endDate
    );
    return NextResponse.json({ tasks, period: timePeriod });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch tasks by period" },
      { status: 500 }
    );
  }
}
