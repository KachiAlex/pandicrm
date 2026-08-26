"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
};

type UserPatch = Partial<Pick<AdminUser, "role" | "isActive">>;

export default function UsersTable({
  initialUsers,
}: {
  initialUsers: AdminUser[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [saving, setSaving] = useState<string | null>(null);
  const router = useRouter();

  async function updateUser(id: string, patch: UserPatch) {
    setSaving(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      const { user } = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...user } : u))
      );
      router.refresh();
    } catch {
      alert("Could not update user");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Active</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-3">
                {user.name ||
                  `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  "—"}
              </td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  disabled={saving === user.id}
                  onChange={(e) =>
                    updateUser(user.id, { role: e.target.value })
                  }
                  className="border rounded px-2 py-1 text-xs"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={user.isActive}
                  disabled={saving === user.id}
                  onChange={(e) =>
                    updateUser(user.id, { isActive: e.target.checked })
                  }
                />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
