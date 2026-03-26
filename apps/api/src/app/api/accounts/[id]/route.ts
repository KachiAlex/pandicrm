import { NextResponse } from "next/server";
import { createInMemoryAccountRepository } from "@pandi/crm-data-access";
import type { AccountId } from "@pandi/crm-domain";

export const runtime = "nodejs";

const accountRepository = createInMemoryAccountRepository();

function parseAccountId(id: string): AccountId | null {
  return id ? { value: id } : null;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const accountId = parseAccountId(params.id);

  if (!accountId) {
    return NextResponse.json(
      {
        error: "Invalid account ID",
      },
      { status: 400 },
    );
  }

  const account = await accountRepository.findById(accountId);

  if (!account) {
    return NextResponse.json(
      {
        error: "Account not found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ account });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const accountId = parseAccountId(params.id);

  if (!accountId) {
    return NextResponse.json(
      {
        error: "Invalid account ID",
      },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const account = await accountRepository.update(accountId, {
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

    return NextResponse.json({ account });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          error: "Account not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update account",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const accountId = parseAccountId(params.id);

  if (!accountId) {
    return NextResponse.json(
      {
        error: "Invalid account ID",
      },
      { status: 400 },
    );
  }

  try {
    await accountRepository.delete(accountId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          error: "Account not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete account",
      },
      { status: 500 },
    );
  }
}
