import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError } from "@/lib/api-auth";
import { createCampaignSchema, validateBody } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const campaigns = await prisma.emailCampaign.findMany({
      where: { workspaceId },
      include: {
        template: { select: { id: true, name: true } },
        _count: { select: { recipients: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const validation = validateBody(createCampaignSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { workspaceId, templateId, name, subject, htmlContent, textContent, senderName, senderEmail, replyTo, contactIds, categoryIds } = validation.data;

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(workspaceId, userId))) return unauthorized();

    const contactWhere: any = { workspaceId, email: { not: null } };
    if (contactIds && contactIds.length > 0) {
      contactWhere.id = { in: contactIds };
    }

    if (categoryIds && categoryIds.length > 0) {
      contactWhere.OR = [
        contactWhere.id ? { id: { in: contactIds } } : undefined,
        { categoryIds: { hasSome: categoryIds } },
      ].filter(Boolean);
      delete contactWhere.id;
    }

    const contacts = await prisma.contact.findMany({
      where: contactWhere,
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const uniqueContacts = Array.from(new Map(contacts.map((c) => [c.id, c])).values());

    if (uniqueContacts.length === 0) {
      return NextResponse.json({ error: "No valid contacts with email addresses found" }, { status: 400 });
    }

    const campaign = await prisma.emailCampaign.create({
      data: {
        workspaceId,
        templateId: templateId || null,
        name,
        subject,
        htmlContent,
        textContent: textContent || null,
        senderName,
        senderEmail,
        replyTo: replyTo || null,
        status: "draft",
        totalRecipients: uniqueContacts.length,
        recipients: {
          create: uniqueContacts.map((c) => ({
            contactId: c.id,
            email: c.email!,
          })),
        },
      },
      include: {
        _count: { select: { recipients: true } },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch {
    return serverError();
  }
}
