import { NextResponse } from "next/server";
import { createInMemoryTaskRepository } from "@pandi/data-access";
import type { 
  WorkspaceId, 
  CreateTaskInput, 
  UpdateTaskInput, 
  CompleteTaskInput, 
  VerifyTaskInput,
  TaskFilter,
  TimePeriod,
  UserId
} from "@pandi/core-domain";

export const runtime = "nodejs";

const taskRepository = createInMemoryTaskRepository({
  initialTasks: [
    {
      id: { value: "task-001" },
      workspaceId: { value: "ws-demo" },
      title: "Prepare onboarding playbook",
      description: "Compile AI note templates for enterprise prospects.",
      status: "in_progress",
      priority: "high",
      category: "sales",
      timePeriod: "weekly",
      dueAt: new Date("2026-03-15T17:00:00.000Z").toISOString(),
      assigneeId: { value: "user-ops" },
      estimatedHours: 8,
      tags: ["onboarding", "templates", "enterprise"],
      createdAt: new Date("2026-03-01T10:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-02T15:45:00.000Z").toISOString(),
    },
    {
      id: { value: "task-002" },
      workspaceId: { value: "ws-demo" },
      title: "Review pipeline health alerts",
      description: "Monitor sales pipeline and identify at-risk deals",
      status: "pending",
      priority: "medium",
      category: "sales",
      timePeriod: "daily",
      assigneeId: { value: "user-sales" },
      estimatedHours: 2,
      tags: ["pipeline", "monitoring", "sales"],
      createdAt: new Date("2026-03-04T08:15:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-04T08:15:00.000Z").toISOString(),
    },
    {
      id: { value: "task-003" },
      workspaceId: { value: "ws-demo" },
      title: "Update CRM documentation",
      description: "Document new features and API endpoints",
      status: "completed",
      priority: "low",
      category: "development",
      timePeriod: "monthly",
      assigneeId: { value: "user-dev" },
      estimatedHours: 6,
      actualHours: 4,
      tags: ["documentation", "api", "crm"],
      createdAt: new Date("2026-03-01T09:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-05T16:30:00.000Z").toISOString(),
      completedAt: new Date("2026-03-05T16:30:00.000Z").toISOString(),
      completion: {
        completedAt: new Date("2026-03-05T16:30:00.000Z").toISOString(),
        completedBy: { value: "user-dev" },
        notes: "Documentation updated with new API endpoints",
      },
    },
    {
      id: { value: "task-004" },
      workspaceId: { value: "ws-demo" },
      title: "Customer feedback analysis",
      description: "Analyze Q1 customer feedback and prepare report",
      status: "pending",
      priority: "urgent",
      category: "customer_service",
      timePeriod: "weekly",
      dueAt: new Date("2026-03-10T17:00:00.000Z").toISOString(),
      assigneeId: { value: "user-cs" },
      estimatedHours: 12,
      tags: ["feedback", "analysis", "q1"],
      createdAt: new Date("2026-03-06T11:20:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-06T11:20:00.000Z").toISOString(),
    },
    {
      id: { value: "task-005" },
      workspaceId: { value: "ws-demo" },
      title: "Marketing campaign review",
      description: "Review performance of March marketing campaigns",
      status: "in_progress",
      priority: "medium",
      category: "marketing",
      timePeriod: "monthly",
      assigneeId: { value: "user-marketing" },
      estimatedHours: 4,
      tags: ["marketing", "campaign", "review"],
      createdAt: new Date("2026-03-07T14:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-07T14:00:00.000Z").toISOString(),
    },
  ],
});

function parseWorkspaceId(url: URL): WorkspaceId | null {
  const workspaceId = url.searchParams.get("workspaceId");
  return workspaceId ? { value: workspaceId } : null;
}

function parseTaskFilter(url: URL): TaskFilter {
  const filter: TaskFilter = {};

  // Parse array parameters
  const parseArray = (param: string): string[] | undefined => {
    const value = url.searchParams.get(param);
    return value ? value.split(",").map(s => s.trim()) : undefined;
  };

  filter.status = parseArray("status") as any[];
  filter.priority = parseArray("priority") as any[];
  filter.category = parseArray("category") as any[];
  filter.timePeriod = parseArray("timePeriod") as any[];
  filter.assigneeId = parseArray("assigneeId")?.map(id => ({ value: id }));
  filter.tags = parseArray("tags");

  // Parse date parameters
  filter.dueBefore = url.searchParams.get("dueBefore") || undefined;
  filter.dueAfter = url.searchParams.get("dueAfter") || undefined;
  filter.createdBefore = url.searchParams.get("createdBefore") || undefined;
  filter.createdAfter = url.searchParams.get("createdAfter") || undefined;
  filter.completedBefore = url.searchParams.get("completedBefore") || undefined;
  filter.completedAfter = url.searchParams.get("completedAfter") || undefined;

  return filter;
}

// GET /api/tasks - List tasks with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filter: TaskFilter = {};
    
    if (searchParams.get("userId")) {
      filter.assignedTo = { value: searchParams.get("userId")! };
    }
    
    if (searchParams.get("workspaceId")) {
      filter.workspaceId = { value: searchParams.get("workspaceId")! };
    }
    
    if (searchParams.get("status")) {
      filter.status = searchParams.get("status") as any;
    }
    
    if (searchParams.get("priority")) {
      filter.priority = searchParams.get("priority") as any;
    }
    
    if (searchParams.get("category")) {
      filter.category = searchParams.get("category") as any;
    }
    
    if (searchParams.get("dateFrom")) {
      filter.dateFrom = searchParams.get("dateFrom")!;
    }
    
    if (searchParams.get("dateTo")) {
      filter.dateTo = searchParams.get("dateTo")!;
    }

    const tasks = await taskRepository.list(filter);
    
    return NextResponse.json({ 
      tasks,
      total: tasks.length,
      filter,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const createInput: CreateTaskInput = {
      workspaceId: { value: body.workspaceId },
      title: body.title,
      description: body.description,
      assignedTo: { value: body.assignedTo },
      createdBy: { value: body.createdBy },
      priority: body.priority,
      category: body.category,
      dueDate: body.dueDate,
      timePeriod: body.timePeriod,
      estimatedDuration: body.estimatedDuration,
      tags: body.tags,
    };

    // Basic validation
    if (!createInput.workspaceId.value || !createInput.title || !createInput.assignedTo.value || !createInput.createdBy.value) {
      return NextResponse.json(
        { error: "workspaceId, title, assignedTo, and createdBy are required" },
        { status: 400 }
      );
    }

    const task = await taskRepository.create(createInput);
    
    // Broadcast real-time update
    wsManager.broadcastTaskUpdate(createInput.workspaceId.value, task, "created");
    
    // Send notification to assigned user if different from creator
    if (createInput.assignedTo.value !== createInput.createdBy.value) {
      await notificationManager.notifyTaskAssigned(
        createInput.assignedTo.value,
        createInput.workspaceId.value,
        task
      );
    }
    
    return NextResponse.json({ 
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create task" },
      { status: 500 }
    );
  }
}
