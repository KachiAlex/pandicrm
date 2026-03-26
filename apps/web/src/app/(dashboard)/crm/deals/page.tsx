"use client";

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../../hooks/useAuth";
import { api, type Deal } from "../../../../lib/api";

const stageColors: Record<string, string> = {
  prospecting: "bg-gray-100 text-gray-800",
  qualification: "bg-blue-100 text-blue-800",
  proposal: "bg-purple-100 text-purple-800",
  negotiation: "bg-orange-100 text-orange-800",
  closed_won: "bg-green-100 text-green-800",
  closed_lost: "bg-red-100 text-red-800",
};

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDeals();
    }
  }, [isAuthenticated, user]);

  const loadDeals = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getDeals("default-workspace");
      setDeals(response.deals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
      setDeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    
    try {
      await api.deleteDeal(dealId);
      await loadDeals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete deal");
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Please sign in to view deals.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-2">Track your sales pipeline and manage deal progression.</p>
        </div>
        <Link
          href="/dashboard/crm/deals/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Deal
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
          <button
            onClick={loadDeals}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {isLoading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">Loading deals...</div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Deals ({deals.length})</h2>
          </div>
          
          {deals.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">No deals found</div>
              <Link
                href="/dashboard/crm/deals/new"
                className="inline-block text-blue-600 hover:text-blue-700"
              >
                Create your first deal →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deals.map((deal) => (
                <div key={deal.id.value} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{deal.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${stageColors[deal.stage] || 'bg-gray-100'}`}>
                          {deal.stage.replace("_", " ")}
                        </span>
                        <span className="text-gray-600">{deal.probability}% probability</span>
                      </div>
                      <div className="mt-2 text-lg font-semibold text-gray-900">
                        {formatCurrency(deal.value)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Expected close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/crm/deals/${deal.id.value}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(deal.id.value)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
