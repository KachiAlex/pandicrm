import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { bulkUpdateAccountsSchema, validateBody } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(bulkUpdateAccountsSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { ids, delete: shouldDelete } = validation.data;
    const userId = (session as any).user.id;

    const firstAccount = await prisma.account.findFirst({
      where: { id: { in: ids } },
      select: { workspaceId: true },
    });

    if (!firstAccount) {
      return NextResponse.json({ error: "No accounts found" }, { status: 404 });
    }

    if (!(await requireWorkspaceAccess(firstAccount.workspaceId, userId))) return unauthorized();

    if (shouldDelete) {
      const result = await prisma.account.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ deleted: result.count });
    }

    return NextResponse.json({ updated: 0 });
  } catch {
    return serverError();
  }
}
