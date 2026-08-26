import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isSuperAdmin, unauthorized, serverError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;
  if (!isSuperAdmin(session.user.role)) return unauthorized();

  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    return NextResponse.json({ workspaces });
  } catch (err) {
    console.error("[ADMIN WORKSPACES GET]", err);
    return serverError("Failed to load workspaces");
  }
}
