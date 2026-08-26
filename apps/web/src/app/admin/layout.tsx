import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isSuperAdmin } from "@/lib/api-auth";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="flex items-center gap-4 px-6 py-4">
          <h1 className="text-lg font-semibold">Admin</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/users" className="text-pink-600 font-medium">
              Users
            </Link>
            <Link href="/admin/workspaces" className="text-pink-600 font-medium">
              Workspaces
            </Link>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              Back to app
            </Link>
          </nav>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
