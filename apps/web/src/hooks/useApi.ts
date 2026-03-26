import { useState, useEffect, useCallback } from "react";
import { api, type ApiResponse } from "../lib/api";

export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  dependencies: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetcher();

      if (response.error) {
        setError(response.error);
        setData(null);
      } else {
        setData(response.data || null);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useAccounts(workspaceId: string) {
  return useApi(() => api.getAccounts(workspaceId), [workspaceId]);
}

export function useAccount(id: string) {
  return useApi(() => api.getAccount(id), [id]);
}

export function useContacts(workspaceId: string, accountId?: string) {
  return useApi(() => api.getContacts(workspaceId, accountId), [workspaceId, accountId]);
}

export function useContact(id: string) {
  return useApi(() => api.getContact(id), [id]);
}

export function useDeals(workspaceId: string, accountId?: string) {
  return useApi(() => api.getDeals(workspaceId, accountId), [workspaceId, accountId]);
}

export function useDeal(id: string) {
  return useApi(() => api.getDeal(id), [id]);
}
