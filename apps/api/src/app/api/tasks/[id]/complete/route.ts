import { NextResponse } from "next/server";
import { createInMemoryTaskRepository } from "@pandi/data-access";
import type { 
  TaskId,
  CompleteTaskInput
} from "@pandi/core-domain";

export const runtime = "nodejs";

const taskRepository = createInMemoryTaskRepository();

function parseTaskId(id: string): TaskId | null {
  return id ? { value: id } : null;
}

// POST /api/tasks/[id]/complete - Complete a task
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
    
    const completeInput: CompleteTaskInput = {
      completedBy: { value: body.completedBy },
      notes: body.notes,
      actualHours: body.actualHours,
    };

    const task = await taskRepository.completeTask(taskId, completeInput);
    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete task" },
      { status: 500 }
    );
  }
}
