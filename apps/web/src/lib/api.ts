const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
}

export interface Account {
  id: { value: string };
  workspaceId: { value: string };
  name: string;
  domain?: string;
  industry?: string;
  size?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  website?: string;
  phone?: string;
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
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  linkedin?: string;
  avatar?: string;
  isPrimary?: boolean;
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
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
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` };
      }

      return { data: data as T };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
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
}

export const api = new ApiClient();
