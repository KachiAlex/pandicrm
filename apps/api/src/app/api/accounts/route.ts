import { NextResponse } from "next/server";
import { createInMemoryAccountRepository } from "@pandi/crm-data-access";
import type { WorkspaceId } from "@pandi/crm-domain";

export const runtime = "nodejs";

const accountRepository = createInMemoryAccountRepository({
  initialAccounts: [
    {
      id: { value: "acc-001" },
      workspaceId: { value: "ws-demo" },
      name: "Acme Corporation",
      domain: "acme.com",
      industry: "Technology",
      size: "51-200",
      website: "https://acme.com",
      phone: "+1-555-0123",
      billingAddress: {
        street1: "123 Tech Street",
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        country: "US",
      },
      createdAt: new Date("2026-03-01T10:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-02T15:45:00.000Z").toISOString(),
    },
    {
      id: { value: "acc-002" },
      workspaceId: { value: "ws-demo" },
      name: "Global Industries",
      industry: "Manufacturing",
      size: "500+",
      website: "https://globalindustries.com",
      createdAt: new Date("2026-03-05T09:30:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-05T09:30:00.000Z").toISOString(),
    },
  ],
});

function parseWorkspaceId(url: URL): WorkspaceId | null {
  const workspaceId = url.searchParams.get("workspaceId");
  return workspaceId ? { value: workspaceId } : null;
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

  const accounts = await accountRepository.listByWorkspace(workspaceId);
  return NextResponse.json({ accounts });
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

  try {
    const body = await request.json();
    const account = await accountRepository.create({
      workspaceId,
      name: body.name,
      domain: body.domain,
      industry: body.industry,
      size: body.size,
      website: body.website,
      phone: body.phone,
      billingAddress: body.billingAddress,
      shippingAddress: body.shippingAddress,
      customFields: body.customFields,
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create account",
      },
      { status: 500 },
    );
  }
}
