const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  accounts?: any[];
  account?: any;
  contacts?: any[];
  contact?: any;
  deals?: any[];
  deal?: any;
  tasks?: any[];
  task?: any;
  stats?: any;
  users?: any[];
  user?: any;
  notes?: Note[];
  note?: Note;
  transcription?: TranscriptionResult;
  rituals?: Ritual[];
  ritual?: Ritual;
  completions?: RitualCompletion[];
  completion?: RitualCompletion;
  ritualStats?: RitualStats;
  notifications?: Notification[];
  notification?: Notification;
  notificationStats?: NotificationStats;
  message?: string;
  total?: number;
  filter?: NoteFilter | RitualFilter;
  query?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface Account {
  id: { value: string };
  workspaceId: { value: string };
  name: string;
  description?: string;
  domain?: { value: string };
  industry?: string;
  size?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  website?: { value: string };
  phone?: { value: string };
  billingAddress?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingAddress?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: { value: string };
  workspaceId: { value: string };
  accountId: { value: string };
  firstName: string;
  lastName: string;
  email?: { value: string };
  phone?: { value: string };
  title?: string;
  department?: string;
  linkedin?: { value: string };
  avatar?: string;
  isPrimary?: boolean;
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: { value: string };
  userId: { value: string };
  workspaceId: { value: string };
  title: string;
  content: { value: string };
  type: "manual" | "meeting" | "call" | "email" | "document" | "voice_memo";
  metadata: NoteMetadata;
  tags: string[];
  isShared: boolean;
  sharedWith?: { value: string }[];
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export interface NoteMetadata {
  duration?: number;
  participantCount?: number;
  recordingUrl?: string;
  originalFile?: string;
  aiTranscribed: boolean;
  transcriptionConfidence?: number;
  language?: string;
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  relatedTaskIds?: { value: string }[];
  relatedContactIds?: string[];
}

export interface CreateNoteInput {
  userId: { value: string };
  workspaceId: { value: string };
  title: string;
  content: { value: string };
  type: "manual" | "meeting" | "call" | "email" | "document" | "voice_memo";
  tags?: string[];
  metadata?: Partial<NoteMetadata>;
  isShared?: boolean;
  sharedWith?: { value: string }[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: { value: string };
  tags?: string[];
  isShared?: boolean;
  sharedWith?: { value: string }[];
  metadata?: Partial<NoteMetadata>;
}

export interface TranscriptionResult {
  transcript: { value: string };
  confidence: number;
  language: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  processingTime: number;
}

export interface ShareNoteInput {
  noteId: { value: string };
  shareWith: { value: string }[];
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
    expiresAt?: string;
  };
}

export interface NoteFilter {
  userId?: { value: string };
  workspaceId?: { value: string };
  type?: "manual" | "meeting" | "call" | "email" | "document" | "voice_memo";
  tags?: string[];
  isShared?: boolean;
  sharedWithUserId?: { value: string };
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  hasTranscript?: boolean;
  hasActionItems?: boolean;
}

export interface Ritual {
  id: { value: string };
  userId: { value: string };
  workspaceId: { value: string };
  name: { value: string };
  description?: string;
  category: "health" | "mindfulness" | "productivity" | "business" | "learning" | "social" | "creativity" | "personal";
  frequency: "daily" | "weekly" | "monthly" | "custom";
  targetTime: string;
  duration: number;
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface RitualCompletion {
  id: string;
  ritualId: { value: string };
  userId: { value: string };
  completedAt: string;
  duration: number;
  quality: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  energy?: 1 | 2 | 3 | 4 | 5;
}

export interface CreateRitualInput {
  userId: { value: string };
  workspaceId: { value: string };
  name: { value: string };
  description?: string;
  category: "health" | "mindfulness" | "productivity" | "business" | "learning" | "social" | "creativity" | "personal";
  frequency: "daily" | "weekly" | "monthly" | "custom";
  targetTime: string;
  duration: number;
  color?: string;
  icon?: string;
}

export interface UpdateRitualInput {
  name?: { value: string };
  description?: string;
  category?: "health" | "mindfulness" | "productivity" | "business" | "learning" | "social" | "creativity" | "personal";
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  targetTime?: string;
  duration?: number;
  isActive?: boolean;
  color?: string;
  icon?: string;
}

export interface CompleteRitualInput {
  ritualId: { value: string };
  duration: number;
  quality: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  energy?: 1 | 2 | 3 | 4 | 5;
}

export interface RitualFilter {
  userId?: { value: string };
  workspaceId?: { value: string };
  category?: "health" | "mindfulness" | "productivity" | "business" | "learning" | "social" | "creativity" | "personal";
  frequency?: "daily" | "weekly" | "monthly" | "custom";
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
  categoryStats: Array<{
    category: "health" | "mindfulness" | "productivity" | "business" | "learning" | "social" | "creativity" | "personal";
    completions: number;
    streak: number;
    averageQuality: number;
    totalDuration: number;
  }>;
  weeklyProgress: Array<{
    week: string;
    completions: number;
    targetCompletions: number;
    rate: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    completions: number;
    targetCompletions: number;
    rate: number;
  }>;
}

export interface Notification {
  id: string;
  userId: string;
  workspaceId: string;
  type: "task_assigned" | "task_completed" | "task_overdue" | "note_shared" | "note_transcribed" | "ritual_completed" | "ritual_missed" | "account_created" | "contact_created" | "deal_created" | "deal_won" | "deal_lost" | "system_update" | "mention" | "reminder";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  recentCount: number;
  unreadCount: number;
}

export interface User {
  id: { value: string };
  email: { value: string };
  name: string;
  avatar?: string;
  role: "admin" | "user" | "viewer";
  isActive: boolean;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

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
  email: { value: string };
  name: string;
  password: string;
  role?: "admin" | "user" | "viewer";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  expiresAt?: string;
}

export interface Deal {
  id: { value: string };
  workspaceId: { value: string };
  accountId: { value: string };
  name: string;
  description?: string;
  stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  amount?: number;
  currency?: string;
  probability?: number;
  closeDate?: string;
  ownerId?: { value: string };
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: { value: string };
  workspaceId: { value: string };
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  category: "sales" | "marketing" | "development" | "operations" | "customer_service" | "admin" | "personal" | "other";
  timePeriod: "daily" | "weekly" | "monthly" | "annual" | "adhoc";
  dueAt?: string;
  assigneeId?: { value: string };
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completion?: {
    completedAt: string;
    completedBy: { value: string };
    verifiedAt?: string;
    verifiedBy?: { value: string };
    notes?: string;
  };
}

export interface CreateTaskInput {
  workspaceId: { value: string };
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: "sales" | "marketing" | "development" | "operations" | "customer_service" | "admin" | "personal" | "other";
  timePeriod: "daily" | "weekly" | "monthly" | "annual" | "adhoc";
  dueAt?: string;
  assigneeId?: { value: string };
  estimatedHours?: number;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed" | "archived";
  priority?: "low" | "medium" | "high" | "urgent";
  category?: "sales" | "marketing" | "development" | "operations" | "customer_service" | "admin" | "personal" | "other";
  timePeriod?: "daily" | "weekly" | "monthly" | "annual" | "adhoc";
  dueAt?: string;
  assigneeId?: { value: string };
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
}

export interface CompleteTaskInput {
  completedBy: { value: string };
  notes?: string;
  actualHours?: number;
}

export interface VerifyTaskInput {
  verifiedBy: { value: string };
  notes?: string;
}

export interface TaskFilter {
  status?: ("pending" | "in_progress" | "completed" | "archived")[];
  priority?: ("low" | "medium" | "high" | "urgent")[];
  category?: ("sales" | "marketing" | "development" | "operations" | "customer_service" | "admin" | "personal" | "other")[];
  timePeriod?: ("daily" | "weekly" | "monthly" | "annual" | "adhoc")[];
  assigneeId?: { value: string }[];
  dueBefore?: string;
  dueAfter?: string;
  createdBefore?: string;
  createdAfter?: string;
  completedBefore?: string;
  completedAfter?: string;
  tags?: string[];
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include",
        ...options,
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { error: await response.text() };

      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data && "error" in data && typeof data.error === "string"
            ? data.error
            : `HTTP ${response.status}`;
        return { error: errorMessage };
      }

      return { data: data as T };
    } catch (error) {
      return {
        error:
          error instanceof Error && /failed to fetch|networkerror|load failed/i.test(error.message)
            ? "Unable to reach the API. Configure NEXT_PUBLIC_API_URL for deployed web clients."
            : error instanceof Error
              ? error.message
              : "Network error",
      };
    }
  }

  // Accounts API
  async getAccounts(workspaceId: string) {
    return this.request<{ accounts: Account[] }>(`/api/accounts?workspaceId=${workspaceId}`);
  }

  async getAccount(id: string) {
    return this.request<{ account: Account }>(`/api/accounts/${id}`);
  }

  async createAccount(account: any) {
    return this.request<{ account: Account }>("/api/accounts", {
      method: "POST",
      body: JSON.stringify(account),
    });
  }

  async updateAccount(id: string, account: any) {
    return this.request<{ account: Account }>(`/api/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(account),
    });
  }

  async deleteAccount(id: string) {
    return this.request(`/api/accounts/${id}`, {
      method: "DELETE",
    });
  }

  // Contacts API
  async getContacts(workspaceId: string, accountId?: string) {
    const params = new URLSearchParams({ workspaceId });
    if (accountId) params.append("accountId", accountId);
    return this.request<{ contacts: Contact[] }>(`/api/contacts?${params}`);
  }

  async getContact(id: string) {
    return this.request<{ contact: Contact }>(`/api/contacts/${id}`);
  }

  async createContact(contact: any) {
    return this.request<{ contact: Contact }>("/api/contacts", {
      method: "POST",
      body: JSON.stringify(contact),
    });
  }

  async updateContact(id: string, contact: any) {
    return this.request<{ contact: Contact }>(`/api/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(contact),
    });
  }

  async deleteContact(id: string) {
    return this.request(`/api/contacts/${id}`, {
      method: "DELETE",
    });
  }

  // Deals API
  async getDeals(workspaceId: string, accountId?: string) {
    const params = new URLSearchParams({ workspaceId });
    if (accountId) params.append("accountId", accountId);
    return this.request<{ deals: Deal[] }>(`/api/deals?${params}`);
  }

  async getDeal(id: string) {
    return this.request<{ deal: Deal }>(`/api/deals/${id}`);
  }

  async createDeal(deal: any) {
    return this.request<{ deal: Deal }>("/api/deals", {
      method: "POST",
      body: JSON.stringify(deal),
    });
  }

  async updateDeal(id: string, deal: any) {
    return this.request<{ deal: Deal }>(`/api/deals/${id}`, {
      method: "PUT",
      body: JSON.stringify(deal),
    });
  }

  async deleteDeal(id: string) {
    return this.request(`/api/deals/${id}`, {
      method: "DELETE",
    });
  }

  // Tasks API
  async getTasks(workspaceId: string, filter?: TaskFilter) {
    const params = new URLSearchParams({ workspaceId });
    
    if (filter) {
      if (filter.status) params.append("status", filter.status.join(","));
      if (filter.priority) params.append("priority", filter.priority.join(","));
      if (filter.category) params.append("category", filter.category.join(","));
      if (filter.timePeriod) params.append("timePeriod", filter.timePeriod.join(","));
      if (filter.assigneeId) params.append("assigneeId", filter.assigneeId.map(id => id.value).join(","));
      if (filter.tags) params.append("tags", filter.tags.join(","));
      if (filter.dueBefore) params.append("dueBefore", filter.dueBefore);
      if (filter.dueAfter) params.append("dueAfter", filter.dueAfter);
      if (filter.createdBefore) params.append("createdBefore", filter.createdBefore);
      if (filter.createdAfter) params.append("createdAfter", filter.createdAfter);
      if (filter.completedBefore) params.append("completedBefore", filter.completedBefore);
      if (filter.completedAfter) params.append("completedAfter", filter.completedAfter);
    }
    
    return this.request<{ tasks: Task[] }>(`/api/tasks?${params}`);
  }

  async getTask(id: string) {
    return this.request<{ task: Task }>(`/api/tasks/${id}`);
  }

  async createTask(task: CreateTaskInput) {
    return this.request<{ task: Task }>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: UpdateTaskInput) {
    return this.request<{ task: Task }>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  }

  async completeTask(id: string, input: CompleteTaskInput) {
    return this.request<{ task: Task }>(`/api/tasks/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async verifyTask(id: string, input: VerifyTaskInput) {
    return this.request<{ task: Task }>(`/api/tasks/${id}/verify`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async getTasksByTimePeriod(workspaceId: string, period: "daily" | "weekly" | "monthly" | "annual" | "adhoc", startDate?: string, endDate?: string) {
    const params = new URLSearchParams({ workspaceId });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    return this.request<{ tasks: Task[]; period: string }>(`/api/tasks/period/${period}?${params}`);
  }

  async getTaskStats(workspaceId: string, userId?: string) {
    const params = new URLSearchParams({ workspaceId });
    if (userId) params.append("userId", userId);
    
    return this.request<{ stats: any }>(`/api/tasks/stats?${params}`);
  }

  // Authentication API
  async register(input: CreateUserInput) {
    return this.request<{ message: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: input.email.value,
        name: input.name,
        password: input.password,
        role: input.role,
      }),
    });
  }

  async login(input: LoginInput) {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async logout() {
    return this.request<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    return this.request<{ user: User }>("/api/auth/me");
  }

  // Users API
  async getUsers() {
    return this.request<{ users: User[] }>("/api/users");
  }

  async getUser(id: string) {
    return this.request<{ user: User }>(`/api/users/${id}`);
  }

  async createUser(input: CreateUserInput) {
    return this.request<{ message: string; user: User }>("/api/users", {
      method: "POST",
      body: JSON.stringify({
        email: input.email.value,
        name: input.name,
        password: input.password,
        role: input.role,
      }),
    });
  }

  async updateUser(id: string, input: Partial<User>) {
    return this.request<{ message: string; user: User }>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/api/users/${id}`, {
      method: "DELETE",
    });
  }

  // Notes API
  async getNotes(filter?: NoteFilter) {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(","));
          } else if (typeof value === "object" && value.value) {
            params.append(key, value.value);
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    
    return this.request<{ notes: Note[]; total: number; filter: NoteFilter }>(
      `/api/notes${params.toString() ? `?${params.toString()}` : ""}`
    );
  }

  async getNote(id: string) {
    return this.request<{ note: Note }>(`/api/notes/${id}`);
  }

  async createNote(input: CreateNoteInput) {
    return this.request<{ message: string; note: Note }>("/api/notes", {
      method: "POST",
      body: JSON.stringify({
        userId: input.userId.value,
        workspaceId: input.workspaceId.value,
        title: input.title,
        content: input.content.value,
        type: input.type,
        tags: input.tags,
        metadata: input.metadata,
        isShared: input.isShared,
        sharedWith: input.sharedWith?.map(id => id.value),
      }),
    });
  }

  async updateNote(id: string, input: UpdateNoteInput) {
    return this.request<{ message: string; note: Note }>(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...input,
        content: input.content?.value,
        sharedWith: input.sharedWith?.map(id => id.value),
      }),
    });
  }

  async deleteNote(id: string) {
    return this.request<{ message: string }>(`/api/notes/${id}`, {
      method: "DELETE",
    });
  }

  async transcribeNote(id: string, forceRetranscribe?: boolean) {
    return this.request<{ message: string; transcription: TranscriptionResult }>(`/api/notes/${id}/transcribe`, {
      method: "POST",
      body: JSON.stringify({ forceRetranscribe }),
    });
  }

  async shareNote(id: string, shareWith: { value: string }[], permissions: ShareNoteInput["permissions"]) {
    return this.request<{ message: string; note: Note }>(`/api/notes/${id}/share`, {
      method: "POST",
      body: JSON.stringify({
        shareWith: shareWith.map(id => id.value),
        permissions,
      }),
    });
  }

  async unshareNote(id: string, userId: string) {
    return this.request<{ message: string }>(`/api/notes/${id}/share?userId=${userId}`, {
      method: "DELETE",
    });
  }

  async searchNotes(query: string, userId: string, workspaceId: string) {
    return this.request<{ notes: Note[]; query: string; total: number }>(
      `/api/notes/search?q=${encodeURIComponent(query)}&userId=${userId}&workspaceId=${workspaceId}`
    );
  }

  // Rituals API
  async getRituals(filter?: RitualFilter) {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(","));
          } else if (typeof value === "object" && value.value) {
            params.append(key, value.value);
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    
    return this.request<{ rituals: Ritual[]; total: number; filter: RitualFilter }>(
      `/api/rituals${params.toString() ? `?${params.toString()}` : ""}`
    );
  }

  async getRitual(id: string) {
    return this.request<{ ritual: Ritual }>(`/api/rituals/${id}`);
  }

  async createRitual(input: CreateRitualInput) {
    return this.request<{ message: string; ritual: Ritual }>("/api/rituals", {
      method: "POST",
      body: JSON.stringify({
        userId: input.userId.value,
        workspaceId: input.workspaceId.value,
        name: input.name.value,
        description: input.description,
        category: input.category,
        frequency: input.frequency,
        targetTime: input.targetTime,
        duration: input.duration,
        color: input.color,
        icon: input.icon,
      }),
    });
  }

  async updateRitual(id: string, input: UpdateRitualInput) {
    return this.request<{ message: string; ritual: Ritual }>(`/api/rituals/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...input,
        name: input.name?.value,
      }),
    });
  }

  async deleteRitual(id: string) {
    return this.request<{ message: string }>(`/api/rituals/${id}`, {
      method: "DELETE",
    });
  }

  async completeRitual(id: string, input: CompleteRitualInput) {
    return this.request<{ message: string; completion: RitualCompletion }>(`/api/rituals/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({
        ritualId: input.ritualId,
        duration: input.duration,
        quality: input.quality,
        notes: input.notes,
        mood: input.mood,
        energy: input.energy,
      }),
    });
  }

  async getRitualCompletions(id: string, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    
    return this.request<{ completions: RitualCompletion[]; total: number; dateFrom?: string; dateTo?: string }>(
      `/api/rituals/${id}/completions${params.toString() ? `?${params.toString()}` : ""}`
    );
  }

  async getRitualStats(userId: string, workspaceId: string, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("workspaceId", workspaceId);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    
    return this.request<{ ritualStats: RitualStats; userId: string; workspaceId: string; dateFrom?: string; dateTo?: string }>(
      `/api/rituals/stats?${params.toString()}`
    );
  }

  // Notifications API
  async getNotifications(userId: string, workspaceId: string, limit?: number, offset?: number, includeRead?: boolean) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("workspaceId", workspaceId);
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    if (includeRead !== undefined) params.append("includeRead", includeRead.toString());
    
    return this.request<{ notifications: Notification[]; total: number; limit: number; offset: number }>(
      `/api/notifications?${params.toString()}`
    );
  }

  async createNotification(notification: {
    userId: string;
    workspaceId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    expiresAt?: string;
  }) {
    return this.request<{ message: string; notification: Notification }>("/api/notifications", {
      method: "POST",
      body: JSON.stringify(notification),
    });
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    return this.request<{ message: string; notification: Notification }>(`/api/notifications/${notificationId}`, {
      method: "PUT",
      body: JSON.stringify({ userId }),
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.request<{ message: string }>(`/api/notifications/${notificationId}?userId=${userId}`, {
      method: "DELETE",
    });
  }

  async getNotificationStats(userId: string, workspaceId: string) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("workspaceId", workspaceId);
    
    return this.request<{ stats: NotificationStats; userId: string; workspaceId: string }>(
      `/api/notifications/stats?${params.toString()}`
    );
  }

  async markAllNotificationsAsRead(userId: string, workspaceId: string) {
    return this.request<{ message: string; markedCount: number; userId: string; workspaceId: string }>("/api/notifications/read-all", {
      method: "POST",
      body: JSON.stringify({ userId, workspaceId }),
    });
  }
}

export const api = new ApiClient();
