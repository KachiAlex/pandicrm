const BASE = "";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  accounts: {
    list: (workspaceId: string) =>
      fetchJSON<Account[]>(`/api/accounts?workspaceId=${workspaceId}`),
    get: (id: string) => fetchJSON<Account>(`/api/accounts/${id}`),
    create: (data: Partial<Account>) =>
      fetchJSON<Account>("/api/accounts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Account>) =>
      fetchJSON<Account>(`/api/accounts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/api/accounts/${id}`, { method: "DELETE" }),
  },
  contacts: {
    list: (workspaceId: string) =>
      fetchJSON<Contact[]>(`/api/contacts?workspaceId=${workspaceId}`),
    get: (id: string) => fetchJSON<Contact>(`/api/contacts/${id}`),
    create: (data: Partial<Contact>) =>
      fetchJSON<Contact>("/api/contacts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Contact>) =>
      fetchJSON<Contact>(`/api/contacts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/api/contacts/${id}`, { method: "DELETE" }),
  },
  deals: {
    list: (workspaceId: string) =>
      fetchJSON<Deal[]>(`/api/deals?workspaceId=${workspaceId}`),
    get: (id: string) => fetchJSON<Deal>(`/api/deals/${id}`),
    create: (data: Partial<Deal>) =>
      fetchJSON<Deal>("/api/deals", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Deal>) =>
      fetchJSON<Deal>(`/api/deals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/api/deals/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: (workspaceId: string) =>
      fetchJSON<Task[]>(`/api/tasks?workspaceId=${workspaceId}`),
    get: (id: string) => fetchJSON<Task>(`/api/tasks/${id}`),
    create: (data: Partial<Task>) =>
      fetchJSON<Task>("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Task>) =>
      fetchJSON<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/api/tasks/${id}`, { method: "DELETE" }),
  },
  notes: {
    list: (workspaceId: string) =>
      fetchJSON<Note[]>(`/api/notes?workspaceId=${workspaceId}`),
    get: (id: string) => fetchJSON<Note>(`/api/notes/${id}`),
    create: (data: Partial<Note>) =>
      fetchJSON<Note>("/api/notes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Note>) =>
      fetchJSON<Note>(`/api/notes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/api/notes/${id}`, { method: "DELETE" }),
  },
  timeline: {
    list: (workspaceId: string, filters?: { contactId?: string; accountId?: string; dealId?: string }) => {
      const qs = new URLSearchParams({ workspaceId });
      if (filters?.contactId) qs.append("contactId", filters.contactId);
      if (filters?.accountId) qs.append("accountId", filters.accountId);
      if (filters?.dealId) qs.append("dealId", filters.dealId);
      return fetchJSON<TimelineEvent[]>(`/api/timeline?${qs.toString()}`);
    },
  },
  notifications: {
    list: (workspaceId: string) =>
      fetchJSON<Notification[]>(`/api/notifications?workspaceId=${workspaceId}`),
    markRead: (id: string) =>
      fetchJSON<Notification>(`/api/notifications/${id}`, { method: "PATCH", body: JSON.stringify({}) }),
    markAllRead: (workspaceId: string) =>
      fetchJSON<void>("/api/notifications", { method: "PATCH", body: JSON.stringify({ workspaceId }) }),
  },
  user: {
    get: () => fetchJSON<User>("/api/user"),
    update: (data: Partial<User>) => fetchJSON<User>("/api/user", { method: "PATCH", body: JSON.stringify(data) }),
    changePassword: (currentPassword: string, newPassword: string) =>
      fetchJSON<void>("/api/user/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }),
  },
  workspaces: {
    update: (id: string, data: Partial<Workspace>) =>
      fetchJSON<Workspace>(`/api/workspaces/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
};

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  role?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  domain?: string;
  industry?: string;
  size?: string;
  website?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  contacts?: { id: string; firstName: string; lastName: string }[];
}

export interface Contact {
  id: string;
  workspaceId: string;
  accountId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  linkedin?: string;
  avatar?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  account?: { id: string; name: string };
}

export type DealStage = "lead" | "qualify" | "propose" | "negotiate" | "won" | "lost";

export interface Deal {
  id: string;
  workspaceId: string;
  accountId?: string;
  contactId?: string;
  name: string;
  stage: DealStage;
  value: number;
  currency: string;
  probability: number;
  closeDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  account?: { id: string; name: string };
  contact?: { id: string; firstName: string; lastName: string };
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  workspaceId: string;
  assigneeId?: string;
  accountId?: string;
  contactId?: string;
  dealId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: { id: string; name?: string; avatar?: string };
}

export type NoteType = "manual" | "meeting" | "call" | "email" | "document" | "voice_memo";

export interface Note {
  id: string;
  workspaceId: string;
  authorId: string;
  contactId?: string;
  dealId?: string;
  title: string;
  content: string;
  type: NoteType;
  aiSummary?: string;
  sentiment?: string;
  tags: string[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name?: string; avatar?: string };
  contact?: { id: string; firstName: string; lastName: string };
}

export type TimelineEventType = "call" | "email" | "meeting" | "note" | "deal_stage_change" | "task_completed";

export interface TimelineEvent {
  id: string;
  workspaceId: string;
  accountId?: string;
  contactId?: string;
  dealId?: string;
  authorId?: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  occurredAt: string;
  createdAt: string;
  author?: { id: string; name?: string; avatar?: string };
  account?: { id: string; name: string };
  contact?: { id: string; firstName: string; lastName: string };
  deal?: { id: string; name: string };
}

export interface Notification {
  id: string;
  workspaceId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  read: boolean;
  createdAt: string;
}
