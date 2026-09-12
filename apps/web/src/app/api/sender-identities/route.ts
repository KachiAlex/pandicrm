import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, requireWorkspaceRole, unauthorized, serverError } from "@/lib/api-auth";
import { extractDomain } from "@/lib/sender-domains";
import { z } from "zod";

const createSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  replyTo: z.string().email().max(255).optional().or(z.literal("")),
  isDefault: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    if (!(await requireWorkspaceAccess(workspaceId, (session as any).user.id))) return unauthorized();

    const identities = await prisma.senderIdentity.findMany({
      where: { workspaceId },
      include: { domain: { select: { id: true, domain: true, status: true, spfOk: true, dkimOk: true, dmarcOk: true } } },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(identities);
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
    const { workspaceId, name } = parsed.data;
    const role = await requireWorkspaceRole(workspaceId, (session as any).user.id, "admin");
    if (!role.ok) return unauthorized();

    const email = parsed.data.email.trim().toLowerCase();
    const emailDomain = extractDomain(email);
    if (!emailDomain) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });

    // Must belong to a registered domain in this workspace
    const senderDomain = await prisma.senderDomain.findUnique({
      where: { workspaceId_domain: { workspaceId, domain: emailDomain } },
    });
    if (!senderDomain) {
      const registered = await prisma.senderDomain.findMany({ where: { workspaceId }, select: { domain: true, status: true } });
      return NextResponse.json(
        {
          error: `The domain "${emailDomain}" is not registered in this workspace. Register it under Sending Domains first.`,
          registered,
        },
        { status: 422 }
      );
    }

    const existing = await prisma.senderIdentity.findUnique({ where: { workspaceId_email: { workspaceId, email } } });
    if (existing) return NextResponse.json({ error: "This sender email already exists in this workspace" }, { status: 409 });

    const verified = senderDomain.status === "verified";
    const result = await prisma.$transaction(async (tx) => {
      if (parsed.data.isDefault) {
        await tx.senderIdentity.updateMany({ where: { workspaceId, isDefault: true }, data: { isDefault: false } });
      }
      const count = await tx.senderIdentity.count({ where: { workspaceId } });
      return tx.senderIdentity.create({
        data: {
          workspaceId,
          domainId: senderDomain.id,
          name,
          email,
          replyTo: parsed.data.replyTo || null,
          isDefault: parsed.data.isDefault || count === 0,
          isVerified: verified,
        },
        include: { domain: true },
      });
    });

    return NextResponse.json(
      {
        ...result,
        domainVerified: verified,
        warning: verified
          ? undefined
          : `Domain "${emailDomain}" is not DNS-verified yet (status: ${senderDomain.status}). Campaigns using this sender will be blocked until you verify the domain.`,
      },
      { status: 201 }
    );
  } catch {
    return serverError();
  }
}
