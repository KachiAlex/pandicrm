import { useState, useEffect } from "react";

interface Workspace {
  id: string;
  name: string;
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWorkspace(data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { workspace, loading };
}
