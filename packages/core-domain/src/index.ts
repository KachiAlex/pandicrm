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

export type UserId = { value: string };
export type Email = { value: string };
export type PasswordHash = { value: string };

export interface User {
  id: UserId;
  email: Email;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  preferences?: UserPreferences;
}

export type UserRole = "admin" | "user" | "viewer";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  taskReminders: boolean;
  taskAssignments: boolean;
  teamUpdates: boolean;
}

export interface CreateUserInput {
  email: Email;
  name: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
  preferences?: UserPreferences;
}

export interface AuthenticateInput {
  email: Email;
  password: string;
}

export interface AuthenticationResult {
  user: User;
  token: string;
  expiresAt: string;
}

export interface Session {
  id: string;
  userId: UserId;
  token: string;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

export interface WorkspaceId {
  value: string;
}

export interface TaskId {
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

// Repository Interfaces
export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  update(id: UserId, input: UpdateUserInput): Promise<User>;
  delete(id: UserId): Promise<void>;
  list(): Promise<User[]>;
}

export interface AuthenticationRepository {
  authenticate(input: AuthenticateInput): Promise<AuthenticationResult>;
  validateToken(token: string): Promise<User | null>;
  createSession(userId: UserId): Promise<Session>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllUserSessions(userId: UserId): Promise<void>;
  findActiveSession(userId: UserId): Promise<Session | null>;
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
