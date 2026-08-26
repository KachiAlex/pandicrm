import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/api-auth";
import WorkspacesTable from "./_components/workspaces-table";

export default async function AdminWorkspacesPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!isSuperAdmin(role)) {
    redirect("/dashboard");
  }

  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  const serializedWorkspaces = workspaces.map((w) => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Tenant Workspaces</h2>
      <WorkspacesTable initialWorkspaces={serializedWorkspaces} />
    </div>
  );
}
