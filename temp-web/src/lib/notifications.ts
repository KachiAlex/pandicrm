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

    const userIds = members.map((m) => m.userId).filter((id) => id !== senderUserId);
    if (userIds.length === 0) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
      });
      if (workspace?.ownerId && workspace.ownerId !== senderUserId) userIds.push(workspace.ownerId);
    }

    if (userIds.length > 0) {
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
    }
  } catch (err) {
    console.error("[NOTIFICATION] Failed to notify workspace:", err);
  }
}
