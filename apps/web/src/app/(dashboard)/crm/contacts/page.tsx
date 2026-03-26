"use client";

import Link from "next/link";
import { useContacts } from "../../../../hooks/useApi";

const WORKSPACE_ID = "ws-demo";

export default function ContactsPageClient() {
  const { data, loading, error } = useContacts(WORKSPACE_ID);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Contacts</h1>
            <p className="mt-2 text-base text-base-600">
              Manage your customer contacts and track their information.
            </p>
          </div>
          <Link
            href="/dashboard/crm/contacts/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
          >
            + New Contact
          </Link>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-base-600">Loading contacts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Contacts</h1>
            <p className="mt-2 text-base text-base-600">
              Manage your customer contacts and track their information.
            </p>
          </div>
          <Link
            href="/dashboard/crm/contacts/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
          >
            + New Contact
          </Link>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  const contacts = data?.contacts || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">Contacts</h1>
          <p className="mt-2 text-base text-base-600">
            Manage your customer contacts and track their information.
          </p>
        </div>
        <Link
          href="/dashboard/crm/contacts/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
        >
          + New Contact
        </Link>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-white/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Account
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {contacts.map((contact: { id: { value: string }; firstName: string; lastName: string; isPrimary?: boolean; accountId: { value: string }; title?: string; department?: string; email?: string; phone?: string; updatedAt: string }) => (
                <tr key={contact.id.value} className="hover:bg-white/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/crm/contacts/${contact.id.value}`}
                            className="font-medium text-base-900 hover:text-primary"
                          >
                            {contact.firstName} {contact.lastName}
                          </Link>
                          {contact.isPrimary && (
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/crm/accounts/${contact.accountId.value}`}
                      className="text-sm font-medium text-base-900 hover:text-primary"
                    >
                      Account {contact.accountId.value}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-base-600">{contact.title || "-"}</td>
                  <td className="px-6 py-4 text-sm text-base-600">{contact.department || "-"}</td>
                  <td className="px-6 py-4">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-base-600 hover:text-primary"
                      >
                        {contact.email}
                      </a>
                    ) : (
                      <span className="text-sm text-base-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-base-600">{contact.phone || "-"}</td>
                  <td className="px-6 py-4 text-sm text-base-600">
                    {new Date(contact.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
