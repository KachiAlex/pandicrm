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

// Notes and Transcription Types
export type NoteId = { value: string };
export type NoteContent = { value: string };
export type TranscriptText = { value: string };

export interface Note {
  id: NoteId;
  userId: UserId;
  workspaceId: WorkspaceId;
  title: string;
  content: NoteContent;
  type: NoteType;
  metadata: NoteMetadata;
  tags: string[];
  isShared: boolean;
  sharedWith?: UserId[];
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export type NoteType = "manual" | "meeting" | "call" | "email" | "document" | "voice_memo";

export interface NoteMetadata {
  duration?: number; // in minutes for audio/video notes
  participantCount?: number; // for meetings
  recordingUrl?: string; // for audio/video notes
  originalFile?: string; // for document uploads
  aiTranscribed: boolean;
  transcriptionConfidence?: number; // 0-1
  language?: string;
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  relatedTaskIds?: TaskId[];
  relatedContactIds?: string[];
}

export interface CreateNoteInput {
  userId: UserId;
  workspaceId: WorkspaceId;
  title: string;
  content: NoteContent;
  type: NoteType;
  tags?: string[];
  metadata?: Partial<NoteMetadata>;
  isShared?: boolean;
  sharedWith?: UserId[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: NoteContent;
  tags?: string[];
  isShared?: boolean;
  sharedWith?: UserId[];
  metadata?: Partial<NoteMetadata>;
}

export interface TranscribeNoteInput {
  noteId: NoteId;
  audioFile?: File;
  videoFile?: File;
  forceRetranscribe?: boolean;
}

export interface TranscriptionResult {
  transcript: TranscriptText;
  confidence: number;
  language: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  processingTime: number;
}

export interface ShareNoteInput {
  noteId: NoteId;
  shareWith: UserId[];
  permissions: NotePermissions;
}

export interface NotePermissions {
  canEdit: boolean;
  canComment: boolean;
  canShare: boolean;
  expiresAt?: string;
}

export interface NoteFilter {
  userId?: UserId;
  workspaceId?: WorkspaceId;
  type?: NoteType;
  tags?: string[];
  isShared?: boolean;
  sharedWithUserId?: UserId;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  hasTranscript?: boolean;
  hasActionItems?: boolean;
}

export interface NoteRepository {
  create(input: CreateNoteInput): Promise<Note>;
  update(id: NoteId, input: UpdateNoteInput): Promise<Note>;
  delete(id: NoteId): Promise<void>;
  findById(id: NoteId): Promise<Note | null>;
  list(filter: NoteFilter): Promise<Note[]>;
  listByUser(userId: UserId, filter?: NoteFilter): Promise<Note[]>;
  listByWorkspace(workspaceId: WorkspaceId, filter?: NoteFilter): Promise<Note[]>;
  listSharedWithUser(userId: UserId, filter?: NoteFilter): Promise<Note[]>;
  search(query: string, userId: UserId, workspaceId: WorkspaceId): Promise<Note[]>;
  shareNote(input: ShareNoteInput): Promise<Note>;
  unshareNote(noteId: NoteId, userId: UserId): Promise<void>;
  transcribeNote(input: TranscribeNoteInput): Promise<TranscriptionResult>;
  updateTranscription(noteId: NoteId, result: TranscriptionResult): Promise<Note>;
}

// Rituals and Habits Types
export type RitualId = { value: string };
export type RitualName = { value: string };

export interface Ritual {
  id: RitualId;
  userId: UserId;
  workspaceId: WorkspaceId;
  name: RitualName;
  description?: string;
  category: RitualCategory;
  frequency: RitualFrequency;
  targetTime: string; // HH:MM format
  duration: number; // in minutes
  isActive: boolean;
  color: string; // hex color code
  icon: string; // emoji or icon name
  createdAt: string;
  updatedAt: string;
}

export type RitualCategory = "health" | "mindfulness" | "productivity" | "business" | "learning" | "social" | "creativity" | "personal";

export type RitualFrequency = "daily" | "weekly" | "monthly" | "custom";

export interface RitualCompletion {
  id: string;
  ritualId: RitualId;
  userId: UserId;
  completedAt: string;
  duration: number; // actual time spent in minutes
  quality: CompletionQuality;
  notes?: string;
  mood?: MoodRating;
  energy?: EnergyRating;
}

export type CompletionQuality = "excellent" | "good" | "fair" | "poor";
export type MoodRating = 1 | 2 | 3 | 4 | 5;
export type EnergyRating = 1 | 2 | 3 | 4 | 5;

export interface CreateRitualInput {
  userId: UserId;
  workspaceId: WorkspaceId;
  name: RitualName;
  description?: string;
  category: RitualCategory;
  frequency: RitualFrequency;
  targetTime: string;
  duration: number;
  color?: string;
  icon?: string;
}

export interface UpdateRitualInput {
  name?: RitualName;
  description?: string;
  category?: RitualCategory;
  frequency?: RitualFrequency;
  targetTime?: string;
  duration?: number;
  isActive?: boolean;
  color?: string;
  icon?: string;
}

export interface CompleteRitualInput {
  ritualId: RitualId;
  duration: number;
  quality: CompletionQuality;
  notes?: string;
  mood?: MoodRating;
  energy?: EnergyRating;
}

export interface RitualFilter {
  userId?: UserId;
  workspaceId?: WorkspaceId;
  category?: RitualCategory;
  frequency?: RitualFrequency;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface RitualStats {
  totalRituals: number;
  activeRituals: number;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  averageQuality: number;
  totalDuration: number;
  categoryStats: CategoryStats[];
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
}

export interface CategoryStats {
  category: RitualCategory;
  completions: number;
  streak: number;
  averageQuality: number;
  totalDuration: number;
}

export interface WeeklyProgress {
  week: string;
  completions: number;
  targetCompletions: number;
  rate: number;
}

export interface MonthlyProgress {
  month: string;
  completions: number;
  targetCompletions: number;
  rate: number;
}

export interface RitualRepository {
  create(input: CreateRitualInput): Promise<Ritual>;
  update(id: RitualId, input: UpdateRitualInput): Promise<Ritual>;
  delete(id: RitualId): Promise<void>;
  findById(id: RitualId): Promise<Ritual | null>;
  list(filter: RitualFilter): Promise<Ritual[]>;
  listByUser(userId: UserId, filter?: RitualFilter): Promise<Ritual[]>;
  listByWorkspace(workspaceId: WorkspaceId, filter?: RitualFilter): Promise<Ritual[]>;
  completeRitual(input: CompleteRitualInput): Promise<RitualCompletion>;
  getCompletions(ritualId: RitualId, dateFrom?: string, dateTo?: string): Promise<RitualCompletion[]>;
  getUserCompletions(userId: UserId, dateFrom?: string, dateTo?: string): Promise<RitualCompletion[]>;
  getStats(userId: UserId, workspaceId: WorkspaceId, dateFrom?: string, dateTo?: string): Promise<RitualStats>;
  getCurrentStreak(userId: UserId): Promise<number>;
  getLongestStreak(userId: UserId): Promise<number>;
}

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
