import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { getPaginationParams, createPaginatedResult } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const q = searchParams.get("q")?.trim();
    const type = searchParams.get("type") || "all";

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }
    if (!q || q.length < 2) {
      return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const { skip, take, page, pageSize } = getPaginationParams(searchParams);
    const searchQuery = q.toLowerCase();
    const results: any[] = [];

    const contactWhere = {
      workspaceId,
      OR: [
        { firstName: { contains: searchQuery, mode: "insensitive" as const } },
        { lastName: { contains: searchQuery, mode: "insensitive" as const } },
        { email: { contains: searchQuery, mode: "insensitive" as const } },
        { phone: { contains: searchQuery, mode: "insensitive" as const } },
        { title: { contains: searchQuery, mode: "insensitive" as const } },
      ],
    };

    const accountWhere = {
      workspaceId,
      OR: [
        { name: { contains: searchQuery, mode: "insensitive" as const } },
        { domain: { contains: searchQuery, mode: "insensitive" as const } },
        { industry: { contains: searchQuery, mode: "insensitive" as const } },
      ],
    };

    const dealWhere = {
      workspaceId,
      OR: [
        { name: { contains: searchQuery, mode: "insensitive" as const } },
        { description: { contains: searchQuery, mode: "insensitive" as const } },
      ],
    };

    const taskWhere = {
      workspaceId,
      OR: [
        { title: { contains: searchQuery, mode: "insensitive" as const } },
        { description: { contains: searchQuery, mode: "insensitive" as const } },
      ],
    };

    const noteWhere = {
      workspaceId,
      OR: [
        { title: { contains: searchQuery, mode: "insensitive" as const } },
        { content: { contains: searchQuery, mode: "insensitive" as const } },
      ],
    };

    let total = 0;

    if (type === "all" || type === "contacts") {
      const contacts = await prisma.contact.findMany({
        where: type === "all" ? contactWhere : contactWhere,
        select: { id: true, firstName: true, lastName: true, email: true, title: true },
        take: type === "all" ? 5 : take,
        skip: type === "all" ? 0 : skip,
      });
      total += await prisma.contact.count({ where: contactWhere });
      results.push(...contacts.map((c) => ({ ...c, _type: "contact" })));
    }

    if (type === "all" || type === "accounts") {
      const accounts = await prisma.account.findMany({
        where: accountWhere,
        select: { id: true, name: true, domain: true, industry: true },
        take: type === "all" ? 5 : take,
        skip: type === "all" ? 0 : skip,
      });
      total += await prisma.account.count({ where: accountWhere });
      results.push(...accounts.map((a) => ({ ...a, _type: "account" })));
    }

    if (type === "all" || type === "deals") {
      const deals = await prisma.deal.findMany({
        where: dealWhere,
        select: { id: true, name: true, stage: true, value: true },
        take: type === "all" ? 5 : take,
        skip: type === "all" ? 0 : skip,
      });
      total += await prisma.deal.count({ where: dealWhere });
      results.push(...deals.map((d) => ({ ...d, _type: "deal" })));
    }

    if (type === "all" || type === "tasks") {
      const tasks = await prisma.task.findMany({
        where: taskWhere,
        select: { id: true, title: true, status: true, priority: true },
        take: type === "all" ? 5 : take,
        skip: type === "all" ? 0 : skip,
      });
      total += await prisma.task.count({ where: taskWhere });
      results.push(...tasks.map((t) => ({ ...t, _type: "task" })));
    }

    if (type === "all" || type === "notes") {
      const notes = await prisma.note.findMany({
        where: noteWhere,
        select: { id: true, title: true, type: true, createdAt: true },
        take: type === "all" ? 5 : take,
        skip: type === "all" ? 0 : skip,
      });
      total += await prisma.note.count({ where: noteWhere });
      results.push(...notes.map((n) => ({ ...n, _type: "note" })));
    }

    if (type === "all") {
      return NextResponse.json({
        data: results,
        query: q,
        total,
      });
    }

    return NextResponse.json(createPaginatedResult(results, total, { page, pageSize, skip, take }));
  } catch {
    return serverError();
  }
}
