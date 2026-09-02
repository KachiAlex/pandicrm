import { useState, useEffect } from "react";

interface Workspace {
  id: string;
  name: string;
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load workspace");
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWorkspace(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load workspace");
        setLoading(false);
      });
  }, []);

  return { workspace, loading, error };
}
