import { NextResponse } from "next/server";
import { createInMemoryDealRepository } from "@pandi/crm-data-access";
import type { WorkspaceId } from "@pandi/crm-domain";

export const runtime = "nodejs";

const dealRepository = createInMemoryDealRepository({
  initialDeals: [
    {
      id: { value: "deal-001" },
      workspaceId: { value: "ws-demo" },
      accountId: { value: "acc-001" },
      name: "Enterprise Software License",
      stage: "proposal",
      amount: 850000,
      currency: "USD",
      closeDate: new Date("2026-04-30T00:00:00.000Z").toISOString(),
      probability: 75,
      source: "cold outreach",
      description: "Large enterprise license for Acme Corporation",
      ownerId: { value: "user-001" },
      createdAt: new Date("2026-03-01T10:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-10T14:30:00.000Z").toISOString(),
    },
    {
      id: { value: "deal-002" },
      workspaceId: { value: "ws-demo" },
      accountId: { value: "acc-001" },
      name: "Support Contract Renewal",
      stage: "negotiation",
      amount: 120000,
      currency: "USD",
      closeDate: new Date("2026-03-31T00:00:00.000Z").toISOString(),
      probability: 90,
      source: "existing customer",
      ownerId: { value: "user-002" },
      createdAt: new Date("2026-02-15T09:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-12T16:45:00.000Z").toISOString(),
    },
    {
      id: { value: "deal-003" },
      workspaceId: { value: "ws-demo" },
      accountId: { value: "acc-002" },
      name: "Manufacturing System Integration",
      stage: "qualification",
      amount: 620000,
      currency: "USD",
      probability: 40,
      source: "referral",
      description: "ERP integration for Global Industries manufacturing division",
      ownerId: { value: "user-001" },
      createdAt: new Date("2026-03-05T11:20:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-08T13:15:00.000Z").toISOString(),
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
  const deals = accountId
    ? await dealRepository.listByAccount(accountId)
    : await dealRepository.listByWorkspace(workspaceId);

  return NextResponse.json({ deals });
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
    const deal = await dealRepository.create({
      workspaceId,
      accountId,
      name: body.name,
      stage: body.stage,
      amount: body.amount,
      currency: body.currency,
      closeDate: body.closeDate,
      probability: body.probability,
      source: body.source,
      description: body.description,
      ownerId: body.ownerId ? { value: body.ownerId } : undefined,
      customFields: body.customFields,
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create deal",
      },
      { status: 500 },
    );
  }
}
