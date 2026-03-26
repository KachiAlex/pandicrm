"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../../hooks/useAuth";
import { api, type Deal } from "../../../../lib/api";

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
      await loadDeals(); // Refresh deals
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete deal");
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Please sign in to view deals.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Error State */}
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

      {/* Loading State */}
      {isLoading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">Loading deals...</div>
        </div>
      )}

      {/* Deals List */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Deals ({deals.length})
            </h2>
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
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{deal.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${stageColors[deal.stage]}`}>
                          {deal.stage.replace("_", " ").charAt(0).toUpperCase() + deal.stage.replace("_", " ").slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${getProbabilityColor(deal.probability)}`}>
                          {deal.probability}% probability
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(deal.value)}
                        </span>
                        <span>Expected close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                        <span>Created: {new Date(deal.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Account Info */}
                      {deal.accountId && (
                        <div className="mb-3">
                          <div className="text-sm text-gray-500 mb-1">Account</div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                              AC
                            </div>
                            <span className="text-sm text-gray-700">Acme Corporation</span>
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      {deal.contactId && (
                        <div className="mb-3">
                          <div className="text-sm text-gray-500 mb-1">Contact</div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium text-white">
                              JD
                            </div>
                            <span className="text-sm text-gray-700">John Doe</span>
                          </div>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Deal Progress</span>
                          <span>{deal.probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
