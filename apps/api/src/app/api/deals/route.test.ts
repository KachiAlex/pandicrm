import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

function buildRequest(path: string, options?: RequestInit) {
  return new Request(`https://example.test${path}`, options);
}

describe("GET /api/deals", () => {
  it("returns 400 when workspaceId is missing", async () => {
    const response = await GET(buildRequest("/api/deals"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "workspaceId query parameter is required" });
  });

  it("returns deals for the requested workspace", async () => {
    const response = await GET(buildRequest("/api/deals?workspaceId=ws-demo"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.deals)).toBe(true);
    expect(body.deals).not.toHaveLength(0);
    expect(body.deals[0]).toMatchObject({
      workspaceId: { value: "ws-demo" },
    });
  });

  it("returns deals for a specific account", async () => {
    const response = await GET(
      buildRequest("/api/deals?workspaceId=ws-demo&accountId=acc-001"),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.deals)).toBe(true);
    expect(body.deals.every((d: { accountId: { value: string } }) => d.accountId.value === "acc-001")).toBe(true);
  });
});

describe("POST /api/deals", () => {
  it("creates a new deal", async () => {
    const newDeal = {
      name: "New Enterprise Deal",
      stage: "prospecting" as const,
      amount: 500000,
      currency: "USD",
      closeDate: "2026-06-30T00:00:00.000Z",
      probability: 25,
      source: "website",
      description: "Test deal for enterprise customer",
      ownerId: "user-001",
    };

    const response = await POST(
      buildRequest("/api/deals?workspaceId=ws-demo&accountId=acc-001", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDeal),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.deal).toMatchObject({
      name: "New Enterprise Deal",
      stage: "prospecting",
      amount: 500000,
      currency: "USD",
      probability: 25,
      source: "website",
      description: "Test deal for enterprise customer",
      ownerId: { value: "user-001" },
      workspaceId: { value: "ws-demo" },
      accountId: { value: "acc-001" },
    });
    expect(body.deal.id).toBeDefined();
    expect(body.deal.createdAt).toBeDefined();
    expect(body.deal.updatedAt).toBeDefined();
  });

  it("returns 400 when workspaceId is missing", async () => {
    const response = await POST(
      buildRequest("/api/deals?accountId=acc-001", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Deal", stage: "prospecting" }),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "workspaceId query parameter is required" });
  });

  it("returns 400 when accountId is missing", async () => {
    const response = await POST(
      buildRequest("/api/deals?workspaceId=ws-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Deal", stage: "prospecting" }),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "accountId query parameter is required" });
  });
});
