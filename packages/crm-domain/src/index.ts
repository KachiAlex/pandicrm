// Value Objects
export interface AccountId {
  value: string;
}

export interface ContactId {
  value: string;
}

export interface DealId {
  value: string;
}

export interface ActivityId {
  value: string;
}

export interface WorkspaceId {
  value: string;
}

export interface UserId {
  value: string;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Core Entities
export interface Account {
  id: AccountId;
  workspaceId: WorkspaceId;
  name: string;
  domain?: string;
  industry?: string;
  size?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  website?: string;
  phone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: ContactId;
  workspaceId: WorkspaceId;
  accountId: AccountId;
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

export type DealStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export interface Deal {
  id: DealId;
  workspaceId: WorkspaceId;
  accountId: AccountId;
  name: string;
  stage: DealStage;
  amount?: number;
  currency?: string;
  closeDate?: string;
  probability?: number;
  source?: string;
  description?: string;
  ownerId?: UserId;
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "task"
  | "demo"
  | "proposal_sent"
  | "follow_up";

export interface Activity {
  id: ActivityId;
  workspaceId: WorkspaceId;
  type: ActivityType;
  subject: string;
  description?: string;
  direction?: "inbound" | "outbound";
  duration?: number;
  accountId?: AccountId;
  contactId?: ContactId;
  dealId?: DealId;
  ownerId?: UserId;
  scheduledAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Repository Interfaces
export interface ListOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, unknown>;
}

export interface CreateAccountInput {
  workspaceId: WorkspaceId;
  name: string;
  domain?: string;
  industry?: string;
  size?: Account["size"];
  website?: string;
  phone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  customFields?: Record<string, unknown>;
}

export interface UpdateAccountInput {
  name?: string;
  domain?: string;
  industry?: string;
  size?: Account["size"];
  website?: string;
  phone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  customFields?: Record<string, unknown>;
}

export interface AccountRepository {
  create(input: CreateAccountInput): Promise<Account>;
  update(id: AccountId, input: UpdateAccountInput): Promise<Account>;
  delete(id: AccountId): Promise<void>;
  findById(id: AccountId): Promise<Account | null>;
  listByWorkspace(workspaceId: WorkspaceId, options?: ListOptions): Promise<Account[]>;
}

export interface CreateContactInput {
  workspaceId: WorkspaceId;
  accountId: AccountId;
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
}

export interface UpdateContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  linkedin?: string;
  avatar?: string;
  isPrimary?: boolean;
  customFields?: Record<string, unknown>;
}

export interface ContactRepository {
  create(input: CreateContactInput): Promise<Contact>;
  update(id: ContactId, input: UpdateContactInput): Promise<Contact>;
  delete(id: ContactId): Promise<void>;
  findById(id: ContactId): Promise<Contact | null>;
  listByAccount(accountId: AccountId, options?: ListOptions): Promise<Contact[]>;
  listByWorkspace(workspaceId: WorkspaceId, options?: ListOptions): Promise<Contact[]>;
}

export interface CreateDealInput {
  workspaceId: WorkspaceId;
  accountId: AccountId;
  name: string;
  stage: DealStage;
  amount?: number;
  currency?: string;
  closeDate?: string;
  probability?: number;
  source?: string;
  description?: string;
  ownerId?: UserId;
  customFields?: Record<string, unknown>;
}

export interface UpdateDealInput {
  name?: string;
  stage?: DealStage;
  amount?: number;
  currency?: string;
  closeDate?: string;
  probability?: number;
  source?: string;
  description?: string;
  ownerId?: UserId;
  customFields?: Record<string, unknown>;
}

export interface DealRepository {
  create(input: CreateDealInput): Promise<Deal>;
  update(id: DealId, input: UpdateDealInput): Promise<Deal>;
  delete(id: DealId): Promise<void>;
  findById(id: DealId): Promise<Deal | null>;
  listByAccount(accountId: AccountId, options?: ListOptions): Promise<Deal[]>;
  listByWorkspace(workspaceId: WorkspaceId, options?: ListOptions): Promise<Deal[]>;
  listByOwner(ownerId: UserId, options?: ListOptions): Promise<Deal[]>;
}

export interface CreateActivityInput {
  workspaceId: WorkspaceId;
  type: ActivityType;
  subject: string;
  description?: string;
  direction?: "inbound" | "outbound";
  duration?: number;
  accountId?: AccountId;
  contactId?: ContactId;
  dealId?: DealId;
  ownerId?: UserId;
  scheduledAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateActivityInput {
  type?: ActivityType;
  subject?: string;
  description?: string;
  direction?: "inbound" | "outbound";
  duration?: number;
  accountId?: AccountId;
  contactId?: ContactId;
  dealId?: DealId;
  ownerId?: UserId;
  scheduledAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityRepository {
  create(input: CreateActivityInput): Promise<Activity>;
  update(id: ActivityId, input: UpdateActivityInput): Promise<Activity>;
  delete(id: ActivityId): Promise<void>;
  findById(id: ActivityId): Promise<Activity | null>;
  listByEntity(
    entity: { accountId?: AccountId; contactId?: ContactId; dealId?: DealId },
    options?: ListOptions,
  ): Promise<Activity[]>;
  listByWorkspace(workspaceId: WorkspaceId, options?: ListOptions): Promise<Activity[]>;
}
