import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Building2 } from "lucide-react";

export default async function AdminDashboardPage() {
  const [userCount, workspaceCount] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
  ]);

  const cards = [
    {
      label: "Users",
      count: userCount,
      href: "/admin/users",
      icon: Users,
      desc: "Manage platform users and roles",
    },
    {
      label: "Workspaces",
      count: workspaceCount,
      href: "/admin/workspaces",
      icon: Building2,
      desc: "Manage tenant workspaces",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Superadmin Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Overview and management for the pandicrm platform.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="block p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-pk-500 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <c.icon className="w-8 h-8 text-pk-600" />
              <span className="text-3xl font-bold text-gray-900">{c.count}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{c.label}</h2>
            <p className="text-sm text-gray-500">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
