import type {
  Contact,
  ContactId,
  ContactRepository,
  CreateContactInput,
  ListOptions,
  UpdateContactInput,
  AccountId,
  WorkspaceId,
} from "@pandi/crm-domain";

export interface InMemoryContactRepositoryOptions {
  readonly initialContacts?: Contact[];
}

export function createInMemoryContactRepository(
  options: InMemoryContactRepositoryOptions = {},
): ContactRepository {
  const contacts: Contact[] = [...(options.initialContacts ?? [])];

  return {
    async create(input) {
      const now = new Date().toISOString();
      const contact: Contact = {
        id: { value: crypto.randomUUID() },
        workspaceId: input.workspaceId,
        accountId: input.accountId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        title: input.title,
        department: input.department,
        linkedin: input.linkedin,
        avatar: input.avatar,
        isPrimary: input.isPrimary,
        customFields: input.customFields,
        createdAt: now,
        updatedAt: now,
      };
      contacts.push(contact);
      return contact;
    },

    async update(id, input) {
      const index = contacts.findIndex((c) => c.id.value === id.value);
      if (index === -1) {
        throw new Error(`Contact with id ${id.value} not found`);
      }

      const existing = contacts[index];
      const updated: Contact = {
        ...existing,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      contacts[index] = updated;
      return updated;
    },

    async delete(id) {
      const index = contacts.findIndex((c) => c.id.value === id.value);
      if (index === -1) {
        throw new Error(`Contact with id ${id.value} not found`);
      }
      contacts.splice(index, 1);
    },

    async findById(id) {
      return contacts.find((c) => c.id.value === id.value) ?? null;
    },

    async listByAccount(accountId, options = {}) {
      let filtered = contacts.filter((c) => c.accountId.value === accountId.value);

      if (options.sortBy) {
        filtered.sort((a, b) => {
          const aValue = a[options.sortBy as keyof Contact];
          const bValue = b[options.sortBy as keyof Contact];
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

      return filtered.map((contact) => ({ ...contact }));
    },

    async listByWorkspace(workspaceId, options = {}) {
      let filtered = contacts.filter((c) => c.workspaceId.value === workspaceId.value);

      if (options.sortBy) {
        filtered.sort((a, b) => {
          const aValue = a[options.sortBy as keyof Contact];
          const bValue = b[options.sortBy as keyof Contact];
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

      return filtered.map((contact) => ({ ...contact }));
    },
  };
}

export type { ContactRepository } from "@pandi/crm-domain";
