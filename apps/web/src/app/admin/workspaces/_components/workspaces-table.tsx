"use client";

import { useState } from "react";
import { Trash2, Users } from "lucide-react";

type AdminWorkspace = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
  owner: {
    id: string;
    email: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  _count: { members: number };
};

export default function WorkspacesTable({
  initialWorkspaces,
}: {
  initialWorkspaces: AdminWorkspace[];
}) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workspace and all its data? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/workspaces/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Workspace</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Owner</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Members</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {workspaces.map((w) => (
            <tr key={w.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{w.name}</p>
                <p className="text-xs text-gray-400">{w.slug}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-gray-800">
                  {w.owner?.firstName && w.owner?.lastName
                    ? `${w.owner.firstName} ${w.owner.lastName}`
                    : w.owner?.name || w.owner?.email || "Unknown"}
                </p>
                <p className="text-xs text-gray-400">{w.owner?.email}</p>
              </td>
              <td className="px-4 py-3">
                <span className="capitalize text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {w.plan}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                  <Users className="w-3.5 h-3.5" />
                  {w._count.members}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(w.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDelete(w.id)}
                  disabled={deleting === w.id}
                  className="p-1.5 rounded-md hover:bg-red-50 text-red-500 disabled:opacity-50"
                  title="Delete workspace"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
