import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { createAccountSchema, validateBody } from "@/lib/validations";
import { getPaginationParams, createPaginatedResult } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const search = searchParams.get("search")?.trim();

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const { skip, take, page, pageSize } = getPaginationParams(searchParams);

    const where: any = { workspaceId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { domain: { contains: search, mode: "insensitive" } },
      ];
    }

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        include: { contacts: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.account.count({ where }),
    ]);

    return NextResponse.json(createPaginatedResult(accounts, total, { page, pageSize, skip, take }));
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(createAccountSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { workspaceId, name, description, domain, industry, size, website, phone } = validation.data;

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const account = await prisma.account.create({
      data: { workspaceId, name, description, domain, industry, size, website, phone },
    });

    return NextResponse.json(account, { status: 201 });
  } catch {
    return serverError();
  }
}
