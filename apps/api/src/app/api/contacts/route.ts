import { NextResponse } from "next/server";
import { createInMemoryContactRepository } from "@pandi/crm-data-access";
import type { WorkspaceId } from "@pandi/crm-domain";

export const runtime = "nodejs";

const contactRepository = createInMemoryContactRepository({
  initialContacts: [
    {
      id: { value: "contact-001" },
      workspaceId: { value: "ws-demo" },
      accountId: { value: "acc-001" },
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@acme.com",
      phone: "+1-555-0101",
      title: "VP of Engineering",
      department: "Engineering",
      linkedin: "https://linkedin.com/in/sarahjohnson",
      isPrimary: true,
      createdAt: new Date("2026-03-01T10:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-02T15:45:00.000Z").toISOString(),
    },
    {
      id: { value: "contact-002" },
      workspaceId: { value: "ws-demo" },
      accountId: { value: "acc-001" },
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@acme.com",
      title: "Product Manager",
      department: "Product",
      createdAt: new Date("2026-03-03T14:20:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-03T14:20:00.000Z").toISOString(),
    },
    {
      id: { value: "contact-003" },
      workspaceId: { value: "ws-demo" },
      accountId: { value: "acc-002" },
      firstName: "Jennifer",
      lastName: "Williams",
      email: "jennifer.williams@globalindustries.com",
      phone: "+1-555-0202",
      title: "Director of Operations",
      department: "Operations",
      isPrimary: true,
      createdAt: new Date("2026-03-04T09:15:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-05T11:30:00.000Z").toISOString(),
    },
  ],
});

function parseWorkspaceId(url: URL): WorkspaceId | null {
  const workspaceId = url.searchParams.get("workspaceId");
  return workspaceId ? { value: workspaceId } : null;
}

function parseAccountId(url: URL): { value: string } | null {
  const accountId = url.searchParams.get("accountId");
  return accountId ? { value: accountId } : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = parseWorkspaceId(url);

  if (!workspaceId) {
    return NextResponse.json(
      {
        error: "workspaceId query parameter is required",
      },
      { status: 400 },
    );
  }

  const accountId = parseAccountId(url);
  const contacts = accountId
    ? await contactRepository.listByAccount(accountId)
    : await contactRepository.listByWorkspace(workspaceId);

  return NextResponse.json({ contacts });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const workspaceId = parseWorkspaceId(url);

  if (!workspaceId) {
    return NextResponse.json(
      {
        error: "workspaceId query parameter is required",
      },
      { status: 400 },
    );
  }

  const accountId = parseAccountId(url);
  if (!accountId) {
    return NextResponse.json(
      {
        error: "accountId query parameter is required",
      },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const contact = await contactRepository.create({
      workspaceId,
      accountId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      title: body.title,
      department: body.department,
      linkedin: body.linkedin,
      avatar: body.avatar,
      isPrimary: body.isPrimary,
      customFields: body.customFields,
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create contact",
      },
      { status: 500 },
    );
  }
}
