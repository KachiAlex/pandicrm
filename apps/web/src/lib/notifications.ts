import { prisma } from "@/lib/prisma";

export async function notifyWorkspace(
  workspaceId: string,
  senderUserId: string,
  type: string,
  title: string,
  message: string,
  entityType?: string,
  entityId?: string
) {
  try {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true },
    });

    const userIds = members.map((m) => m.userId);
    if (userIds.length === 0) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
      });
      if (workspace?.ownerId) userIds.push(workspace.ownerId);
    }

    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        workspaceId,
        userId,
        type,
        title,
        message,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
      })),
      skipDuplicates: false,
    });
  } catch {
    // Silently fail so API routes don't break on notification errors
  }
}
