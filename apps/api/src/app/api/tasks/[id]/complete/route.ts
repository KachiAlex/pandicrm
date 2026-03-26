import { NextResponse } from "next/server";
import { createInMemoryTaskRepository } from "@pandi/data-access";
import type { 
  TaskId,
  CompleteTaskInput
} from "@pandi/core-domain";
import { wsManager } from "../../../../lib/websocket";
import { notificationManager } from "../../../../lib/notifications";

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
      completionNotes: body.completionNotes,
      verificationRequired: body.verificationRequired,
    };

    // Basic validation
    if (!completeInput.completedBy.value) {
      return NextResponse.json(
        { error: "completedBy is required" },
        { status: 400 }
      );
    }

    const task = await taskRepository.completeTask(taskId, completeInput);
    
    // Broadcast real-time update
    wsManager.broadcastTaskUpdate(task.workspaceId.value, task, "completed");
    
    // Send notification to task creator if different from completer
    if (task.createdBy.value !== completeInput.completedBy.value) {
      await notificationManager.notifyTaskCompleted(
        task.createdBy.value,
        task.workspaceId.value,
        task
      );
    }
    
    return NextResponse.json({ 
      message: "Task completed successfully",
      task,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("already completed")) {
      return NextResponse.json(
        { error: "Task is already completed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete task" },
      { status: 500 }
    );
  }
}
