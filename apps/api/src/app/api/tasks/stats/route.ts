import { NextResponse } from "next/server";
import { createInMemoryTaskRepository } from "@pandi/data-access";
import type { 
  WorkspaceId,
  UserId
} from "@pandi/core-domain";

export const runtime = "nodejs";

const taskRepository = createInMemoryTaskRepository();

function parseWorkspaceId(url: URL): WorkspaceId | null {
  const workspaceId = url.searchParams.get("workspaceId");
  return workspaceId ? { value: workspaceId } : null;
}

function parseUserId(url: URL): UserId | null {
  const userId = url.searchParams.get("userId");
  return userId ? { value: userId } : null;
}

// GET /api/tasks/stats - Get accountability statistics
export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = parseWorkspaceId(url);

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId query parameter is required" },
      { status: 400 }
    );
  }

  const userId = parseUserId(url);

  try {
    const stats = await taskRepository.getAccountabilityStats(workspaceId, userId);
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
