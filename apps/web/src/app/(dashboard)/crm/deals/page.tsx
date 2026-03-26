"use client";

import Link from "next/link";
import { useDeals } from "../../../../hooks/useApi";

const WORKSPACE_ID = "ws-demo";

const stageColors = {
  prospecting: "bg-gray-100 text-gray-800",
  qualification: "bg-blue-100 text-blue-800",
  proposal: "bg-purple-100 text-purple-800",
  negotiation: "bg-orange-100 text-orange-800",
  closed_won: "bg-green-100 text-green-800",
  closed_lost: "bg-red-100 text-red-800",
};

const probabilityColors = {
  high: "text-green-600",
  medium: "text-yellow-600",
  low: "text-red-600",
};

function getProbabilityColor(probability: number): string {
  if (probability >= 70) return probabilityColors.high;
  if (probability >= 40) return probabilityColors.medium;
  return probabilityColors.low;
}

export default function DealsPageClient() {
  const { data, loading, error } = useDeals(WORKSPACE_ID);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Deals</h1>
            <p className="mt-2 text-base text-base-600">
              Track your sales pipeline and manage deal progression.
            </p>
          </div>
          <Link
            href="/dashboard/crm/deals/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
          >
            + New Deal
          </Link>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-base-600">Loading deals...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Deals</h1>
            <p className="mt-2 text-base text-base-600">
              Track your sales pipeline and manage deal progression.
            </p>
          </div>
          <Link
            href="/dashboard/crm/deals/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
          >
            + New Deal
          </Link>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  const deals = data?.deals || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">Deals</h1>
          <p className="mt-2 text-base text-base-600">
            Track your sales pipeline and manage deal progression.
          </p>
        </div>
        <Link
          href="/dashboard/crm/deals/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
        >
          + New Deal
        </Link>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-white/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Deal
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Account
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Stage
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Probability
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Close Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {deals.map((deal: { id: { value: string }; name: string; accountId: { value: string }; stage: string; amount?: number; currency?: string; probability?: number; closeDate?: string; ownerId?: { value: string }; updatedAt: string }) => (
                <tr key={deal.id.value} className="hover:bg-white/50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/crm/deals/${deal.id.value}`}
                      className="font-medium text-base-900 hover:text-primary"
                    >
                      {deal.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/crm/accounts/${deal.accountId.value}`}
                      className="text-sm font-medium text-base-900 hover:text-primary"
                    >
                      Account {deal.accountId.value}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${stageColors[deal.stage as keyof typeof stageColors]}`}>
                      {deal.stage.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-base-900">
                    {deal.amount && deal.currency
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: deal.currency,
                        }).format(deal.amount)
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {deal.probability ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProbabilityColor(deal.probability).replace("text-", "bg-")}`}
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                          {deal.probability}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-base-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-base-600">
                    {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-base-600">
                    {deal.ownerId ? `User ${deal.ownerId.value}` : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-base-600">
                    {new Date(deal.updatedAt).toLocaleDateString()}
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
