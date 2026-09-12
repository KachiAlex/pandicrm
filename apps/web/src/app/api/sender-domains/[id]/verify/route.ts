import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { verifyDomainDns, getRequiredDnsRecords, getBrevoDkimInstructions } from "@/lib/sender-domains";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;
    const { id } = await params;
    const existing = await prisma.senderDomain.findUnique({ where: { id } });
    if (!existing) return notFound();
    if (!(await requireWorkspaceAccess(existing.workspaceId, (session as any).user.id))) return unauthorized();

    const result = await verifyDomainDns(existing.domain);
    const status = result.allOk ? "verified" : result.spfOk || result.dmarcOk || result.dkimOk ? "pending" : "failed";

    const updated = await prisma.senderDomain.update({
      where: { id },
      data: {
        spfOk: result.spfOk,
        dkimOk: result.dkimOk,
        dmarcOk: result.dmarcOk,
        status,
        lastCheckedAt: new Date(),
        lastError: result.allOk ? null : [result.spfDetail, result.dkimDetail, result.dmarcDetail].filter((d) => d.includes("No ") || d.includes("does not")).join(" "),
      },
    });

    // Mark identities on this domain verified when domain verifies
    if (result.allOk) {
      await prisma.senderIdentity.updateMany({ where: { domainId: id }, data: { isVerified: true } });
    }

    return NextResponse.json({
      domain: updated,
      checks: result,
      dnsRecords: getRequiredDnsRecords(existing.domain),
      dkimInstructions: getBrevoDkimInstructions(existing.domain),
    });
  } catch {
    return serverError();
  }
}
