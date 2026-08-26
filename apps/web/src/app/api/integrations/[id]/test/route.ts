import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { testEmailIntegration, testSmsIntegration, testCalendarIntegration } from "@/lib/integration-test";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const integration = await prisma.integration.findUnique({ where: { id } });
    if (!integration) return notFound();

    const user = (session as any).user;
    if (!(await requireWorkspaceAccess(integration.workspaceId, user.id))) return unauthorized();

    let result;
    switch (integration.type) {
      case "email":
        result = await testEmailIntegration(integration.config as any, user.email);
        break;
      case "sms":
        result = await testSmsIntegration(integration.config as any);
        break;
      case "calendar":
        result = await testCalendarIntegration(integration.config as any);
        break;
      default:
        return NextResponse.json({ error: "Unsupported integration type" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return serverError();
  }
}
