---
title: CRM Domain Model Design
updated: 2026-03-26
---

## Core Entities

### Account
Represents a customer company or organization.

```ts
interface Account {
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
```

### Contact
Individual people associated with accounts.

```ts
interface Contact {
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
```

### Deal
Opportunities tied to accounts with stages and values.

```ts
interface Deal {
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

type DealStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";
```

### Activity
Interactions and events across accounts, contacts, and deals.

```ts
interface Activity {
  id: ActivityId;
  workspaceId: WorkspaceId;
  type: ActivityType;
  subject: string;
  description?: string;
  direction?: "inbound" | "outbound";
  duration?: number; // minutes
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

type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "task"
  | "demo"
  | "proposal_sent"
  | "follow_up";
```

## Relationships

- **Account** 1-* **Contact**: An account can have many contacts.
- **Account** 1-* **Deal**: An account can have many deals.
- **Contact** 1-* **Activity**: Activities can be linked to contacts.
- **Deal** 1-* **Activity**: Activities can be linked to deals.
- **Account** 1-* **Activity**: Activities can be linked directly to accounts.
- **User** 1-* **Deal**: Users own deals.
- **User** 1-* **Activity**: Users own activities.

## Value Objects

```ts
interface AccountId { value: string }
interface ContactId { value: string }
interface DealId { value: string }
interface ActivityId { value: string }
interface WorkspaceId { value: string }
interface UserId { value: string }

interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
```

## Repository Interfaces

```ts
interface AccountRepository {
  create(input: CreateAccountInput): Promise<Account>;
  update(id: AccountId, input: UpdateAccountInput): Promise<Account>;
  delete(id: AccountId): Promise<void>;
  findById(id: AccountId): Promise<Account | null>;
  listByWorkspace(workspaceId: WorkspaceId, options?: ListOptions): Promise<Account[]>;
}

interface ContactRepository {
  create(input: CreateContactInput): Promise<Contact>;
  update(id: ContactId, input: UpdateContactInput): Promise<Contact>;
  delete(id: ContactId): Promise<void>;
  findById(id: ContactId): Promise<Contact | null>;
  listByAccount(accountId: AccountId, options?: ListOptions): Promise<Contact[]>;
  listByWorkspace(workspaceId: WorkspaceId, options?: ListOptions): Promise<Contact[]>;
}

interface DealRepository {
  create(input: CreateDealInput): Promise<Deal>;
  update(id: DealId, input: UpdateDealInput): Promise<Deal>;
  delete(id: DealId): Promise<void>;
  findById(id: DealId): Promise<Deal | null>;
  listByAccount(accountId: AccountId, options?: ListOptions): Promise<Deal[]>;
  listByWorkspace(workspaceId: WorkspaceId, options?: ListOptions): Promise<Deal[]>;
  listByOwner(ownerId: UserId, options?: ListOptions): Promise<Deal[]>;
}

interface ActivityRepository {
  create(input: CreateActivityInput): Promise<Activity>;
  update(id: ActivityId, input: UpdateActivityInput): Promise<Activity>;
  delete(id: ActivityId): Promise<void>;
  findById(id: ActivityId): Promise<Activity | null>;
  listByEntity(entity: { accountId?: AccountId; contactId?: ContactId; dealId?: DealId }, options?: ListOptions): Promise<Activity[]>;
  listByWorkspace(workspaceId: WorkspaceId, options?: ListOptions): Promise<Activity[]>;
}
```

## Common Types

```ts
interface ListOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, unknown>;
}

interface CreateAccountInput {
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

// Similar Create*Input and Update*Input for other entities
```

## Domain Services

### DealPipelineService
- Handles deal stage transitions
- Validates stage rules (e.g., can't skip from prospecting to closed_won)
- Calculates probability based on stage
- Updates deal health metrics

### ActivityTimelineService
- Compiles activity history for entities
- Generates activity summaries
- Handles activity scheduling and reminders

### AccountHealthService
- Calculates account health scores based on:
  - Deal activity and pipeline value
  - Recent interactions
  - Task completion rates
  - Revenue trends

## Integration Points

- **Tasks**: Deals and accounts can generate follow-up tasks
- **AI Notes**: Meeting activities can be enriched with AI transcriptions
- **Rituals**: Account and deal metrics feed into ritual health scores
- **Calendar**: Activities with scheduledAt sync to external calendars

## Data Access Patterns

- Repository pattern for persistence abstraction
- Unit of Work pattern for transaction management
- Specification pattern for complex queries
- Caching strategy for frequently accessed entities (accounts, active deals)

## Security Considerations

- Row-level security by workspaceId
- Field-level encryption for sensitive data (phone, custom fields)
- Audit logging for all mutations
- Role-based access control for different entity types
