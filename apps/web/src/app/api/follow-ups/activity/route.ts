import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const contactId = searchParams.get("contactId");
    const type = searchParams.get("type");
    const outcome = searchParams.get("outcome");
    const format = searchParams.get("format") || "json";

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);

    const where: any = {
      workspaceId,
      occurredAt: { gte: start, lte: end },
      type: type || { in: ["call", "email", "meeting", "note"] },
    };
    if (contactId) where.contactId = contactId;

    const events = await prisma.timelineEvent.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true, email: true, nextFollowUpAt: true } },
        account: { select: { id: true, name: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: 1000,
    });

    const filtered = outcome
      ? events.filter((e) => (e.metadata as any)?.outcome === outcome)
      : events;

    if (format === "csv") {
      const rows = filtered.map((e) => {
        const c = e.contact;
        const name = c ? `${c.firstName} ${c.lastName}` : "";
        const email = c?.email || "";
        const account = e.account?.name || "";
        const author = e.author?.name || "";
        const [date, time] = e.occurredAt.toISOString().split("T");
        const timeClean = time ? time.replace("Z", "") : "";
        const next = c?.nextFollowUpAt ? c.nextFollowUpAt.toISOString().split("T")[0] : "";
        const out = (e.metadata as any)?.outcome || "";
        const cadence = (e.metadata as any)?.nextCadence || "";
        const notes = (e.description || "").replace(/"/g, '""');
        return `"${date} ${timeClean}","${name}","${email}","${account}","${e.type}","${out}","${cadence}","${next}","${author}","${notes}"`;
      });
      const csv = `Date,Contact,Email,Account,Type,Outcome,Cadence,Next Follow-up,Owner,Notes\n${rows.join("\n")}`;
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="follow-ups-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(filtered);
  } catch (err: any) {
    console.error(err);
    return serverError();
  }
}
