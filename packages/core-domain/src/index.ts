export type TaskStatus = "pending" | "in_progress" | "completed" | "archived";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskCategory = 
  | "sales" 
  | "marketing" 
  | "development" 
  | "operations" 
  | "customer_service" 
  | "admin" 
  | "personal" 
  | "other";
export type TimePeriod = "daily" | "weekly" | "monthly" | "annual" | "adhoc";

export interface TaskId {
  value: string;
}

export interface WorkspaceId {
  value: string;
}

export interface UserId {
  value: string;
}

export interface TaskCompletion {
  completedAt: string;
  completedBy: UserId;
  verifiedAt?: string;
  verifiedBy?: UserId;
  notes?: string;
}

export interface Task {
  id: TaskId;
  workspaceId: WorkspaceId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  timePeriod: TimePeriod;
  dueAt?: string;
  assigneeId?: UserId;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completion?: TaskCompletion;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
}

export interface CreateTaskInput {
  workspaceId: WorkspaceId;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  timePeriod: TimePeriod;
  dueAt?: string;
  assigneeId?: UserId;
  estimatedHours?: number;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  timePeriod?: TimePeriod;
  dueAt?: string;
  assigneeId?: UserId;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
}

export interface CompleteTaskInput {
  completedBy: UserId;
  notes?: string;
  actualHours?: number;
}

export interface VerifyTaskInput {
  verifiedBy: UserId;
  notes?: string;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  timePeriod?: TimePeriod[];
  assigneeId?: UserId[];
  dueBefore?: string;
  dueAfter?: string;
  createdBefore?: string;
  createdAfter?: string;
  completedBefore?: string;
  completedAfter?: string;
  tags?: string[];
}

export interface TaskRepository {
  create(input: CreateTaskInput): Promise<Task>;
  update(id: TaskId, input: UpdateTaskInput): Promise<Task>;
  delete(id: TaskId): Promise<void>;
  findById(id: TaskId): Promise<Task | null>;
  listByWorkspace(workspaceId: WorkspaceId, filter?: TaskFilter): Promise<Task[]>;
  listByAssignee(assigneeId: UserId, filter?: TaskFilter): Promise<Task[]>;
  completeTask(id: TaskId, input: CompleteTaskInput): Promise<Task>;
  verifyTask(id: TaskId, input: VerifyTaskInput): Promise<Task>;
  getTasksByTimePeriod(workspaceId: WorkspaceId, period: TimePeriod, startDate?: string, endDate?: string): Promise<Task[]>;
  getAccountabilityStats(workspaceId: WorkspaceId, userId?: UserId): Promise<{
    totalTasks: number;
    completedTasks: number;
    verifiedTasks: number;
    overdueTasks: number;
    completionRate: number;
    verificationRate: number;
    averageCompletionTime: number;
  }>;
}
