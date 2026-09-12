import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceRole, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { normalizeDomain, isValidDomain } from "@/lib/sender-domains";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;
    const { id } = await params;
    const existing = await prisma.senderDomain.findUnique({ where: { id } });
    if (!existing) return notFound();
    const role = await requireWorkspaceRole(existing.workspaceId, (session as any).user.id, "admin");
    if (!role.ok) return unauthorized();

    await prisma.senderDomain.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;
    const { id } = await params;
    const existing = await prisma.senderDomain.findUnique({ where: { id } });
    if (!existing) return notFound();
    const role = await requireWorkspaceRole(existing.workspaceId, (session as any).user.id, "admin");
    if (!role.ok) return unauthorized();

    const body = await req.json().catch(() => ({}));
    if (body.isDefault === true) {
      await prisma.$transaction([
        prisma.senderDomain.updateMany({ where: { workspaceId: existing.workspaceId, isDefault: true }, data: { isDefault: false } }),
        prisma.senderDomain.update({ where: { id }, data: { isDefault: true } }),
      ]);
      const updated = await prisma.senderDomain.findUnique({ where: { id } });
      return NextResponse.json(updated);
    }
    if (body.domain) {
      const domain = normalizeDomain(String(body.domain));
      if (!isValidDomain(domain)) return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
      const updated = await prisma.senderDomain.update({ where: { id }, data: { domain, status: "pending", spfOk: false, dkimOk: false, dmarcOk: false } });
      return NextResponse.json(updated);
    }
    return NextResponse.json(existing);
  } catch {
    return serverError();
  }
}
