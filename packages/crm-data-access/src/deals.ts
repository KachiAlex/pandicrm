import type {
  Deal,
  DealId,
  DealRepository,
  CreateDealInput,
  ListOptions,
  UpdateDealInput,
  AccountId,
  WorkspaceId,
  UserId,
} from "@pandi/crm-domain";

export interface InMemoryDealRepositoryOptions {
  readonly initialDeals?: Deal[];
}

export function createInMemoryDealRepository(
  options: InMemoryDealRepositoryOptions = {},
): DealRepository {
  const deals: Deal[] = [...(options.initialDeals ?? [])];

  return {
    async create(input) {
      const now = new Date().toISOString();
      const deal: Deal = {
        id: { value: crypto.randomUUID() },
        workspaceId: input.workspaceId,
        accountId: input.accountId,
        name: input.name,
        stage: input.stage,
        amount: input.amount,
        currency: input.currency,
        closeDate: input.closeDate,
        probability: input.probability,
        source: input.source,
        description: input.description,
        ownerId: input.ownerId,
        customFields: input.customFields,
        createdAt: now,
        updatedAt: now,
      };
      deals.push(deal);
      return deal;
    },

    async update(id, input) {
      const index = deals.findIndex((d) => d.id.value === id.value);
      if (index === -1) {
        throw new Error(`Deal with id ${id.value} not found`);
      }

      const existing = deals[index];
      const updated: Deal = {
        ...existing,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      deals[index] = updated;
      return updated;
    },

    async delete(id) {
      const index = deals.findIndex((d) => d.id.value === id.value);
      if (index === -1) {
        throw new Error(`Deal with id ${id.value} not found`);
      }
      deals.splice(index, 1);
    },

    async findById(id) {
      return deals.find((d) => d.id.value === id.value) ?? null;
    },

    async listByAccount(accountId, options = {}) {
      let filtered = deals.filter((d) => d.accountId.value === accountId.value);

      if (options.sortBy) {
        filtered.sort((a, b) => {
          const aValue = a[options.sortBy as keyof Deal];
          const bValue = b[options.sortBy as keyof Deal];
          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return 1;
          if (bValue == null) return -1;
          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return options.sortOrder === "desc" ? -comparison : comparison;
        });
      }

      if (options.offset) {
        filtered = filtered.slice(options.offset);
      }

      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered.map((deal) => ({ ...deal }));
    },

    async listByWorkspace(workspaceId, options = {}) {
      let filtered = deals.filter((d) => d.workspaceId.value === workspaceId.value);

      if (options.sortBy) {
        filtered.sort((a, b) => {
          const aValue = a[options.sortBy as keyof Deal];
          const bValue = b[options.sortBy as keyof Deal];
          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return 1;
          if (bValue == null) return -1;
          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return options.sortOrder === "desc" ? -comparison : comparison;
        });
      }

      if (options.offset) {
        filtered = filtered.slice(options.offset);
      }

      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered.map((deal) => ({ ...deal }));
    },

    async listByOwner(ownerId, options = {}) {
      let filtered = deals.filter((d) => d.ownerId?.value === ownerId.value);

      if (options.sortBy) {
        filtered.sort((a, b) => {
          const aValue = a[options.sortBy as keyof Deal];
          const bValue = b[options.sortBy as keyof Deal];
          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return 1;
          if (bValue == null) return -1;
          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return options.sortOrder === "desc" ? -comparison : comparison;
        });
      }

      if (options.offset) {
        filtered = filtered.slice(options.offset);
      }

      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered.map((deal) => ({ ...deal }));
    },
  };
}

export type { DealRepository } from "@pandi/crm-domain";
