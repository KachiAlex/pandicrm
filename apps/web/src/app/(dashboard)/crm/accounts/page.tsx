"use client";

import Link from "next/link";
import { useAccounts } from "../../../../hooks/useApi";

const WORKSPACE_ID = "ws-demo";

export default function AccountsPageClient() {
  const { data, loading, error } = useAccounts(WORKSPACE_ID);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Accounts</h1>
            <p className="mt-2 text-base text-base-600">
              Manage your customer accounts and track their relationships.
            </p>
          </div>
          <Link
            href="/dashboard/crm/accounts/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
          >
            + New Account
          </Link>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-base-600">Loading accounts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Accounts</h1>
            <p className="mt-2 text-base text-base-600">
              Manage your customer accounts and track their relationships.
            </p>
          </div>
          <Link
            href="/dashboard/crm/accounts/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
          >
            + New Account
          </Link>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  const accounts = data?.accounts || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">Accounts</h1>
          <p className="mt-2 text-base text-base-600">
            Manage your customer accounts and track their relationships.
          </p>
        </div>
        <Link
          href="/dashboard/crm/accounts/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
        >
          + New Account
        </Link>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-white/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Account
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Industry
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Size
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Deals
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Pipeline
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {accounts.map((account) => (
                <tr key={account.id.value} className="hover:bg-white/50">
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/dashboard/crm/accounts/${account.id.value}`}
                        className="font-medium text-base-900 hover:text-primary"
                      >
                        {account.name}
                      </Link>
                      {account.domain && (
                        <p className="text-sm text-base-600">{account.domain}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-base-600">{account.industry || "-"}</td>
                  <td className="px-6 py-4 text-sm text-base-600">{account.size || "-"}</td>
                  <td className="px-6 py-4 text-sm text-base-600">-</td>
                  <td className="px-6 py-4 text-sm font-medium text-base-900">-</td>
                  <td className="px-6 py-4 text-sm text-base-600">
                    {new Date(account.updatedAt).toLocaleDateString()}
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
