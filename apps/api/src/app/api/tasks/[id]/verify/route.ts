import { NextResponse } from "next/server";
import { createInMemoryTaskRepository } from "@pandi/data-access";
import type { 
  TaskId,
  VerifyTaskInput
} from "@pandi/core-domain";

export const runtime = "nodejs";

const taskRepository = createInMemoryTaskRepository();

function parseTaskId(id: string): TaskId | null {
  return id ? { value: id } : null;
}

// POST /api/tasks/[id]/verify - Verify a completed task
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const taskId = parseTaskId(params.id);

  if (!taskId) {
    return NextResponse.json(
      { error: "Invalid task ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    const verifyInput: VerifyTaskInput = {
      verifiedBy: { value: body.verifiedBy },
      notes: body.notes,
    };

    const task = await taskRepository.verifyTask(taskId, verifyInput);
    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("must be completed")) {
      return NextResponse.json(
        { error: "Task must be completed before it can be verified" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify task" },
      { status: 500 }
    );
  }
}
