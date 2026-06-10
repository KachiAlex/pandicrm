import { PrismaClient, DealStage, TaskStatus, TaskPriority, NoteType, TimelineEventType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("password123", 12);

  const user = await prisma.user.create({
    data: {
      email: "demo@pandicrm.com",
      name: "Demo User",
      password: hashed,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",
      slug: "demo",
      ownerId: user.id,
      plan: "pro",
    },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "owner",
    },
  });

  const accounts = await prisma.account.createManyAndReturn({
    data: [
      { workspaceId: workspace.id, name: "Acme Corp", industry: "Technology", size: "201-500", domain: "acme.com", phone: "+1-555-0101" },
      { workspaceId: workspace.id, name: "Globex Inc", industry: "Manufacturing", size: "51-200", domain: "globex.com" },
      { workspaceId: workspace.id, name: "Soylent Corp", industry: "Food & Beverage", size: "500+", domain: "soylent.com" },
      { workspaceId: workspace.id, name: "Initech", industry: "Software", size: "11-50", domain: "initech.com" },
    ],
  });

  const contacts = await prisma.contact.createManyAndReturn({
    data: [
      { workspaceId: workspace.id, accountId: accounts[0].id, firstName: "Alice", lastName: "Smith", email: "alice@acme.com", title: "VP Sales", isPrimary: true },
      { workspaceId: workspace.id, accountId: accounts[0].id, firstName: "Bob", lastName: "Jones", email: "bob@acme.com", title: "Engineering Lead" },
      { workspaceId: workspace.id, accountId: accounts[1].id, firstName: "Charlie", lastName: "Brown", email: "charlie@globex.com", title: "Procurement Manager", isPrimary: true },
      { workspaceId: workspace.id, accountId: accounts[2].id, firstName: "Dana", lastName: "White", email: "dana@soylent.com", title: "CEO", isPrimary: true },
      { workspaceId: workspace.id, accountId: accounts[3].id, firstName: "Eve", lastName: "Davis", email: "eve@initech.com", title: "CTO", isPrimary: true },
    ],
  });

  await prisma.deal.createMany({
    data: [
      { workspaceId: workspace.id, accountId: accounts[0].id, contactId: contacts[0].id, name: "Enterprise License", stage: DealStage.negotiate, value: 120000, probability: 75, currency: "USD", closeDate: new Date("2026-07-15") },
      { workspaceId: workspace.id, accountId: accounts[1].id, contactId: contacts[2].id, name: "Factory Integration", stage: DealStage.propose, value: 45000, probability: 50, currency: "USD", closeDate: new Date("2026-08-01") },
      { workspaceId: workspace.id, accountId: accounts[2].id, contactId: contacts[3].id, name: "Supply Chain Suite", stage: DealStage.won, value: 90000, probability: 100, currency: "USD", closeDate: new Date("2026-06-01") },
      { workspaceId: workspace.id, accountId: accounts[3].id, contactId: contacts[4].id, name: "Migration Project", stage: DealStage.qualify, value: 30000, probability: 30, currency: "USD", closeDate: new Date("2026-09-15") },
      { workspaceId: workspace.id, name: "Starter Pack", stage: DealStage.lead, value: 5000, probability: 10, currency: "USD" },
    ],
  });

  await prisma.task.createMany({
    data: [
      { workspaceId: workspace.id, assigneeId: user.id, accountId: accounts[0].id, title: "Follow up with Acme", status: TaskStatus.todo, priority: TaskPriority.high, dueDate: new Date("2026-06-12") },
      { workspaceId: workspace.id, assigneeId: user.id, contactId: contacts[2].id, title: "Send Globex proposal", status: TaskStatus.in_progress, priority: TaskPriority.medium, dueDate: new Date("2026-06-14") },
      { workspaceId: workspace.id, assigneeId: user.id, dealId: (await prisma.deal.findFirst({ where: { name: "Supply Chain Suite" } }))!.id, title: "Onboarding kickoff", status: TaskStatus.done, priority: TaskPriority.high },
    ],
  });

  await prisma.note.createMany({
    data: [
      { workspaceId: workspace.id, authorId: user.id, contactId: contacts[0].id, title: "Discovery call notes", content: "Alice is interested in enterprise features. Budget approved for Q3.", type: NoteType.meeting, aiSummary: "Positive discovery call. Budget approved. Interested in enterprise features." },
      { workspaceId: workspace.id, authorId: user.id, contactId: contacts[3].id, title: "QBR Summary", content: "Strong partnership. Looking to expand usage to international teams.", type: NoteType.meeting, aiSummary: "Strong partnership. Plans to expand internationally." },
    ],
  });

  await prisma.timelineEvent.createMany({
    data: [
      { workspaceId: workspace.id, accountId: accounts[0].id, contactId: contacts[0].id, type: TimelineEventType.meeting, title: "Discovery call", description: "Initial discovery call with VP Sales", occurredAt: new Date("2026-06-01") },
      { workspaceId: workspace.id, accountId: accounts[0].id, type: TimelineEventType.deal_stage_change, title: "Deal moved to Negotiate", metadata: { from: "propose", to: "negotiate" }, occurredAt: new Date("2026-06-05") },
      { workspaceId: workspace.id, accountId: accounts[1].id, contactId: contacts[2].id, type: TimelineEventType.email, title: "Proposal sent", description: "Sent customized proposal for factory integration", occurredAt: new Date("2026-06-08") },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
