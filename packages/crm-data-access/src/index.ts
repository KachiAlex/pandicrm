import type {
  Account,
  AccountId,
  AccountRepository,
  CreateAccountInput,
  ListOptions,
  UpdateAccountInput,
  WorkspaceId,
} from "@pandi/crm-domain";

export interface InMemoryAccountRepositoryOptions {
  readonly initialAccounts?: Account[];
}

export function createInMemoryAccountRepository(
  options: InMemoryAccountRepositoryOptions = {},
): AccountRepository {
  const accounts: Account[] = [...(options.initialAccounts ?? [])];

  return {
    async create(input) {
      const now = new Date().toISOString();
      const account: Account = {
        id: { value: crypto.randomUUID() },
        workspaceId: input.workspaceId,
        name: input.name,
        domain: input.domain,
        industry: input.industry,
        size: input.size,
        website: input.website,
        phone: input.phone,
        billingAddress: input.billingAddress,
        shippingAddress: input.shippingAddress,
        customFields: input.customFields,
        createdAt: now,
        updatedAt: now,
      };
      accounts.push(account);
      return account;
    },

    async update(id, input) {
      const index = accounts.findIndex((a) => a.id.value === id.value);
      if (index === -1) {
        throw new Error(`Account with id ${id.value} not found`);
      }

      const existing = accounts[index];
      const updated: Account = {
        ...existing,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      accounts[index] = updated;
      return updated;
    },

    async delete(id) {
      const index = accounts.findIndex((a) => a.id.value === id.value);
      if (index === -1) {
        throw new Error(`Account with id ${id.value} not found`);
      }
      accounts.splice(index, 1);
    },

    async findById(id) {
      return accounts.find((a) => a.id.value === id.value) ?? null;
    },

    async listByWorkspace(workspaceId, options = {}) {
      let filtered = accounts.filter((a) => a.workspaceId.value === workspaceId.value);

      if (options.sortBy) {
        filtered.sort((a, b) => {
          const aValue = a[options.sortBy as keyof Account];
          const bValue = b[options.sortBy as keyof Account];
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

      return filtered.map((account) => ({ ...account }));
    },
  };
}

export type { AccountRepository } from "@pandi/crm-domain";

export * from "./contacts";
export * from "./deals";
