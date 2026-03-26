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
  const url = new URL(request.url);
  const workspaceId = parseWorkspaceId(url);

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId query parameter is required" },
      { status: 400 }
    );
  }

  const filter = parseTaskFilter(url);
  const tasks = await taskRepository.listByWorkspace(workspaceId, filter);
  
  return NextResponse.json({ tasks });
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const taskInput: CreateTaskInput = {
      workspaceId: { value: body.workspaceId },
      title: body.title,
      description: body.description,
      priority: body.priority,
      category: body.category,
      timePeriod: body.timePeriod,
      dueAt: body.dueAt,
      assigneeId: body.assigneeId ? { value: body.assigneeId } : undefined,
      estimatedHours: body.estimatedHours,
      tags: body.tags,
    };

    const task = await taskRepository.create(taskInput);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create task" },
      { status: 500 }
    );
  }
}
