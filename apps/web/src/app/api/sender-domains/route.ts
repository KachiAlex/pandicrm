import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, requireWorkspaceRole, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { normalizeDomain, isValidDomain, getRequiredDnsRecords, getBrevoDkimInstructions } from "@/lib/sender-domains";
import { z } from "zod";

const createSchema = z.object({
  workspaceId: z.string().min(1),
  domain: z.string().min(1).max(255),
  isDefault: z.boolean().optional().default(false),
});

function workspaceIdFrom(req: NextRequest): string | null {
  const { searchParams } = new URL(req.url);
  return searchParams.get("workspaceId");
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;
    const workspaceId = workspaceIdFrom(req);
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    if (!(await requireWorkspaceAccess(workspaceId, (session as any).user.id))) return unauthorized();

    const domains = await prisma.senderDomain.findMany({
      where: { workspaceId },
      include: { _count: { select: { identities: true } } },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(domains);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    const { workspaceId } = parsed.data;
    const role = await requireWorkspaceRole(workspaceId, (session as any).user.id, "admin");
    if (!role.ok) return unauthorized();

    const domain = normalizeDomain(parsed.data.domain);
    if (!isValidDomain(domain)) {
      return NextResponse.json({ error: "That doesn't look like a valid domain (e.g. mail.kreatixtech.com)" }, { status: 400 });
    }

    const existing = await prisma.senderDomain.findUnique({ where: { workspaceId_domain: { workspaceId, domain } } });
    if (existing) return NextResponse.json({ error: "This domain is already registered in this workspace" }, { status: 409 });

    const result = await prisma.$transaction(async (tx) => {
      if (parsed.data.isDefault) {
        await tx.senderDomain.updateMany({ where: { workspaceId, isDefault: true }, data: { isDefault: false } });
      }
      const count = await tx.senderDomain.count({ where: { workspaceId } });
      return tx.senderDomain.create({
        data: {
          workspaceId,
          domain,
          status: "pending",
          isDefault: parsed.data.isDefault || count === 0,
        },
      });
    });

    return NextResponse.json(
      {
        ...result,
        dnsRecords: getRequiredDnsRecords(domain),
        dkimInstructions: getBrevoDkimInstructions(domain),
      },
      { status: 201 }
    );
  } catch {
    return serverError();
  }
}
