import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isSuperAdmin } from "@/lib/api-auth";
import { LayoutDashboard, Users, Building2, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;

  if (!isSuperAdmin(role)) {
    redirect("/dashboard");
  }

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <Logo mode="icon" className="h-8 w-auto" />
          <h1 className="mt-2 text-lg font-bold text-gray-900">Superadmin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-pink-50 hover:text-pk-600 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-pk-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to app
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
