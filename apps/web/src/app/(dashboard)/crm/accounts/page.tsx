"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../../hooks/useAuth";
import { api, type Account } from "../../../../lib/api";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAccounts();
    }
  }, [isAuthenticated, user]);

  const loadAccounts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getAccounts("default-workspace");
      setAccounts(response.accounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    
    try {
      await api.deleteAccount(accountId);
      await loadAccounts(); // Refresh accounts
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getSizeLabel = (size: string) => {
    const sizeMap = {
      "1-10": "Startup",
      "11-50": "Small", 
      "51-200": "Medium",
      "201-500": "Large",
      "500+": "Enterprise",
    };
    return sizeMap[size as keyof typeof sizeMap] || size;
  };

  if (!isAuthenticated || !user) {
    return <div>Please sign in to view accounts.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-2">Manage your customer accounts and track their relationships.</p>
        </div>
        <Link
          href="/dashboard/crm/accounts/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Account
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
          <button
            onClick={loadAccounts}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">Loading accounts...</div>
        </div>
      )}

      {/* Accounts List */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Accounts ({accounts.length})
            </h2>
          </div>
          
          {accounts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">No accounts found</div>
              <Link
                href="/dashboard/crm/accounts/new"
                className="inline-block text-blue-600 hover:text-blue-700"
              >
                Create your first account →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {accounts.map((account) => (
                <div key={account.id.value} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                        {account.industry && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {account.industry}
                          </span>
                        )}
                        {account.size && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            {getSizeLabel(account.size)}
                          </span>
                        )}
                      </div>
                      
                      {account.description && (
                        <p className="text-gray-600 mb-3">{account.description}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        {account.website && (
                          <a
                            href={account.website.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {account.website.value}
                          </a>
                        )}
                        {account.domain && (
                          <span>Domain: {account.domain.value}</span>
                        )}
                        <span>Created: {new Date(account.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Contacts Preview */}
                      <div className="mt-4">
                        <div className="text-sm text-gray-500 mb-2">Contacts</div>
                        <div className="flex -space-x-2">
                          {/* Placeholder for contact avatars */}
                          <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            JD
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            AS
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            MK
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                            +3
                          </div>
                        </div>
                      </div>

                      {/* Deals Preview */}
                      <div className="mt-4">
                        <div className="text-sm text-gray-500 mb-2">Recent Deals</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">Q3 Contract Renewal</span>
                            <span className="text-green-600 font-medium">$25,000</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">Enterprise License</span>
                            <span className="text-blue-600 font-medium">$150,000</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/dashboard/crm/accounts/${account.id.value}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View account"
                      >
                        👁️
                      </Link>
                      <Link
                        href={`/dashboard/crm/accounts/${account.id.value}/edit`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit account"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => handleDelete(account.id.value)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete account"
                      >
                        🗑️
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
