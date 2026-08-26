const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // Reset the alarm flag for tasks that are now done or have been rescheduled
  const reset = await prisma.task.updateMany({
    where: {
      overdueNotifiedAt: { not: null },
      OR: [
        { status: "done" },
        { dueDate: { gte: now } },
      ],
    },
    data: { overdueNotifiedAt: null },
  });

  // Find tasks that are overdue, not completed, and not yet alarmed
  const overdue = await prisma.task.findMany({
    where: {
      dueDate: { lt: now },
      status: { not: "done" },
      overdueNotifiedAt: null,
    },
    include: {
      workspace: { select: { ownerId: true } },
    },
  });

  for (const task of overdue) {
    const recipientId = task.assigneeId || task.workspace.ownerId;

    if (recipientId) {
      await prisma.notification.create({
        data: {
          workspaceId: task.workspaceId,
          userId: recipientId,
          type: "task_overdue",
          title: "Task overdue",
          message: `"${task.title || "A task"}" is past its due date`,
          entityType: "task",
          entityId: task.id,
        },
      });
    }

    await prisma.task.update({
      where: { id: task.id },
      data: { overdueNotifiedAt: now },
    });
  }

  console.log(`[OVERDUE] reset ${reset.count} task(s), notified ${overdue.length} task(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
