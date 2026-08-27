import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
}

const cadenceDays: Record<string, number> = {
  same_day: 0,
  "1_day": 1,
  "2_days": 2,
  "3_days": 3,
  "1_week": 7,
  "2_weeks": 14,
  "1_month": 30,
  custom: -1,
};

function computeNextFollowUpAt(cadence: string, customDays?: number, from = new Date()) {
  if (cadence === "custom" && typeof customDays === "number" && customDays >= 0) {
    return addDays(from, customDays);
  }
  const days = cadenceDays[cadence] ?? 3;
  return addDays(from, days);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const contact = await prisma.contact.findUnique({
      where: { id },
      select: { workspaceId: true, firstName: true, lastName: true, followUpCadence: true, nextFollowUpAt: true },
    });
    if (!contact) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(contact.workspaceId, userId))) return unauthorized();

    const body = await req.json();
    const {
      type = "call",
      outcome = "other",
      notes = "",
      nextCadence,
      customDays,
      reminder,
      reminderDate,
    } = body as any;

    const cadence = (nextCadence as string) || contact.followUpCadence || "3_days";
    const next = computeNextFollowUpAt(cadence, customDays);
    const now = new Date();
    const title = `${type} - ${outcome}`;

    const noteType =
      type === "meeting" ? "meeting" :
      type === "email" ? "email" :
      type === "call" ? "call" : "manual";

    const ops: any[] = [
      prisma.contact.update({
        where: { id },
        data: {
          lastFollowUpAt: now,
          nextFollowUpAt: next,
          followUpCadence: cadence,
        },
      }),
      prisma.timelineEvent.create({
        data: {
          workspaceId: contact.workspaceId,
          contactId: id,
          authorId: userId,
          type,
          title,
          description: notes,
          metadata: { outcome, nextCadence: cadence, nextFollowUpAt: next.toISOString() },
          occurredAt: now,
        },
      }),
    ];

    if (notes.trim()) {
      ops.push(
        prisma.note.create({
          data: {
            workspaceId: contact.workspaceId,
            contactId: id,
            authorId: userId,
            title,
            content: notes,
            type: noteType as any,
          },
        })
      );
    }

    if (reminder === true && reminderDate) {
      ops.push(
        prisma.task.create({
          data: {
            workspaceId: contact.workspaceId,
            contactId: id,
            assigneeId: userId,
            title: `Follow up with ${contact.firstName} ${contact.lastName}`,
            description: notes,
            dueDate: new Date(reminderDate as string),
            priority: "medium",
            status: "todo",
          },
        })
      );
    }

    const [updated] = await prisma.$transaction(ops);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    return serverError();
  }
}
