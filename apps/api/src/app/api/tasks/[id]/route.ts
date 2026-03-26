import { NextResponse } from "next/server";
import { createInMemoryTaskRepository } from "@pandi/data-access";
import type { 
  TaskId,
  UpdateTaskInput, 
  CompleteTaskInput, 
  VerifyTaskInput,
  UserId
} from "@pandi/core-domain";

export const runtime = "nodejs";

const taskRepository = createInMemoryTaskRepository();

function parseTaskId(id: string): TaskId | null {
  return id ? { value: id } : null;
}

// GET /api/tasks/[id] - Get a specific task
export async function GET(
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
    const task = await taskRepository.findById(taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
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
    
    const updateInput: UpdateTaskInput = {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      category: body.category,
      timePeriod: body.timePeriod,
      dueAt: body.dueAt,
      assigneeId: body.assigneeId ? { value: body.assigneeId } : undefined,
      estimatedHours: body.estimatedHours,
      actualHours: body.actualHours,
      tags: body.tags,
    };

    const task = await taskRepository.update(taskId, updateInput);
    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
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
    await taskRepository.delete(taskId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete task" },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/complete - Complete a task
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const taskId = parseTaskId(params.id);
  const url = new URL(request.url);

  if (!taskId) {
    return NextResponse.json(
      { error: "Invalid task ID" },
      { status: 400 }
    );
  }

  // Handle different actions based on the request path
  if (url.pathname.endsWith('/complete')) {
    return handleComplete(taskId, request);
  } else if (url.pathname.endsWith('/verify')) {
    return handleVerify(taskId, request);
  } else {
    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  }
}

async function handleComplete(taskId: TaskId, request: Request) {
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

async function handleVerify(taskId: TaskId, request: Request) {
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
