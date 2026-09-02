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
    list: (workspaceId: string, categoryId?: string) =>
      fetchJSON<Contact[]>(`/api/contacts?workspaceId=${workspaceId}${categoryId ? `&categoryId=${categoryId}` : ""}`),
    get: (id: string) => fetchJSON<Contact>(`/api/contacts/${id}`),
    create: (data: Partial<Contact>) =>
      fetchJSON<Contact>("/api/contacts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Contact>) =>
      fetchJSON<Contact>(`/api/contacts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/api/contacts/${id}`, { method: "DELETE" }),
    convertToDeal: (id: string) =>
      fetchJSON<Deal>(`/api/contacts/${id}/convert-to-deal`, { method: "POST" }),
    bulk: (data: { ids: string[]; status?: Contact["status"]; categoryIds?: string[]; delete?: boolean }) =>
      fetchJSON<{ updated?: number; deleted?: number }>("/api/contacts/bulk", { method: "POST", body: JSON.stringify(data) }),
    import: (workspaceId: string, csvText: string, categoryIds?: string[]) =>
      fetchJSON<{ created: number; skipped: { row: number; reason: string }[]; contacts: any[] }>("/api/contacts/import", {
        method: "POST",
        body: JSON.stringify({ workspaceId, csvText, categoryIds }),
      }),
    followUp: (id: string, data: any) =>
      fetchJSON<Contact>(`/api/contacts/${id}/follow-up`, { method: "POST", body: JSON.stringify(data) }),
  },
  contactCategories: {
    list: (workspaceId: string) =>
      fetchJSON<ContactCategory[]>(`/api/contact-categories?workspaceId=${workspaceId}`),
    create: (data: Partial<ContactCategory>) =>
      fetchJSON<ContactCategory>("/api/contact-categories", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ContactCategory>) =>
      fetchJSON<ContactCategory>(`/api/contact-categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/api/contact-categories/${id}`, { method: "DELETE" }),
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
    members: (id: string) =>
      fetchJSON<WorkspaceMember[]>(`/api/workspaces/${id}/members`),
    invite: (id: string, data: { email: string; role?: string }) =>
      fetchJSON<WorkspaceMember>(`/api/workspaces/${id}/members`, { method: "POST", body: JSON.stringify(data) }),
    updateMember: (id: string, userId: string, data: { role: string }) =>
      fetchJSON<WorkspaceMember>(`/api/workspaces/${id}/members/${userId}`, { method: "PATCH", body: JSON.stringify(data) }),
    removeMember: (id: string, userId: string) =>
      fetchJSON<void>(`/api/workspaces/${id}/members/${userId}`, { method: "DELETE" }),
  },
  campaigns: {
    list: (workspaceId: string) =>
      fetchJSON<EmailCampaign[]>(`/api/campaigns?workspaceId=${workspaceId}`),
    get: (id: string) => fetchJSON<EmailCampaign>(`/api/campaigns/${id}`),
    create: (data: Partial<EmailCampaign> & { contactIds?: string[]; categoryIds?: string[] }) =>
      fetchJSON<EmailCampaign>("/api/campaigns", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<EmailCampaign>) =>
      fetchJSON<EmailCampaign>(`/api/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/api/campaigns/${id}`, { method: "DELETE" }),
    send: (id: string) =>
      fetchJSON<{ sent: number; failed: number; total: number }>(`/api/campaigns/${id}/send`, { method: "POST", body: JSON.stringify({}) }),
    resend: (id: string) =>
      fetchJSON<{ sent: number; failed: number; total: number }>(`/api/campaigns/${id}/resend`, { method: "POST", body: JSON.stringify({}) }),
    test: (id: string, email: string) =>
      fetchJSON<{ success: boolean; messageId?: string; error?: string }>(`/api/campaigns/${id}/test`, { method: "POST", body: JSON.stringify({ email }) }),
    stats: (id: string) => fetchJSON<CampaignStats>(`/api/campaigns/${id}/stats`),
  },
  emailTemplates: {
    list: (workspaceId: string) =>
      fetchJSON<EmailTemplate[]>(`/api/email-templates?workspaceId=${workspaceId}`),
    get: (id: string) => fetchJSON<EmailTemplate>(`/api/email-templates/${id}`),
    create: (data: Partial<EmailTemplate>) =>
      fetchJSON<EmailTemplate>("/api/email-templates", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<EmailTemplate>) =>
      fetchJSON<EmailTemplate>(`/api/email-templates/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/api/email-templates/${id}`, { method: "DELETE" }),
  },
  integrations: {
    list: (workspaceId: string) =>
      fetchJSON<Integration[]>(`/api/integrations?workspaceId=${workspaceId}`),
    create: (data: Partial<Integration>) =>
      fetchJSON<Integration>("/api/integrations", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Integration>) =>
      fetchJSON<Integration>(`/api/integrations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/api/integrations/${id}`, { method: "DELETE" }),
    test: (id: string) => fetchJSON<{ success: boolean; message: string; authUrl?: string }>(`/api/integrations/${id}/test`, { method: "POST" }),
  },
  followUps: {
    list: (workspaceId: string, filter?: string) =>
      fetchJSON<Contact[]>(`/api/follow-ups?workspaceId=${workspaceId}${filter ? `&filter=${filter}` : ""}`),
    activity: (workspaceId: string, params?: { from?: string; to?: string; contactId?: string; type?: string; outcome?: string }) => {
      const qs = new URLSearchParams({ workspaceId });
      if (params?.from) qs.append("from", params.from);
      if (params?.to) qs.append("to", params.to);
      if (params?.contactId) qs.append("contactId", params.contactId);
      if (params?.type) qs.append("type", params.type);
      if (params?.outcome) qs.append("outcome", params.outcome);
      return fetchJSON<TimelineEvent[]>(`/api/follow-ups/activity?${qs.toString()}`);
    },
    exportCsv: (workspaceId: string, params?: { from?: string; to?: string; contactId?: string; type?: string; outcome?: string }) => {
      const qs = new URLSearchParams({ workspaceId, format: "csv" });
      if (params?.from) qs.append("from", params.from);
      if (params?.to) qs.append("to", params.to);
      if (params?.contactId) qs.append("contactId", params.contactId);
      if (params?.type) qs.append("type", params.type);
      if (params?.outcome) qs.append("outcome", params.outcome);
      return fetch(`/api/follow-ups/activity?${qs.toString()}`).then((r) => {
        if (!r.ok) throw new Error("Export failed");
        return r.blob();
      });
    },
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
  isActive?: boolean;
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

export interface WorkspaceMember {
  id: string;
  userId: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
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
  status: "new" | "qualified" | "opportunity" | "customer" | "lost";
  categoryIds: string[];
  customFields?: any;
  nextFollowUpAt?: string;
  lastFollowUpAt?: string;
  followUpCadence?: string;
  createdAt: string;
  updatedAt: string;
  account?: { id: string; name: string };
}

export interface ContactCategory {
  id: string;
  workspaceId: string;
  name: string;
  color?: string;
  count?: number;
  createdAt: string;
  updatedAt: string;
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
  contact?: { id: string; firstName: string; lastName: string; email?: string; nextFollowUpAt?: string };
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
  contact?: { id: string; firstName: string; lastName: string; email?: string; nextFollowUpAt?: string };
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
  contact?: { id: string; firstName: string; lastName: string; email?: string; nextFollowUpAt?: string };
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

export interface EmailTemplate {
  id: string;
  workspaceId: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

export interface EmailCampaign {
  id: string;
  workspaceId: string;
  templateId?: string;
  template?: { id: string; name: string };
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  senderName: string;
  senderEmail: string;
  replyTo?: string;
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  unsubscribeCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: { recipients: number };
  recipients?: CampaignRecipient[];
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  contactId: string;
  email: string;
  status: "pending" | "sent" | "failed" | "opened" | "clicked" | "bounced" | "unsubscribed";
  brevoMessageId?: string;
  sentAt?: string;
  openedAt?: string;
  errorReason?: string;
  contact?: { id: string; firstName: string; lastName: string; email?: string; nextFollowUpAt?: string };
}

export interface CampaignStats {
  id: string;
  status: CampaignStatus;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  unsubscribeCount: number;
  sentAt?: string;
  recipientBreakdown: Record<string, number>;
}

export interface Integration {
  id: string;
  workspaceId: string;
  type: "email" | "sms" | "calendar";
  provider: string;
  label?: string;
  isActive: boolean;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
