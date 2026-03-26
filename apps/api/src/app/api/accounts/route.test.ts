import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

function buildRequest(path: string, options?: RequestInit) {
  return new Request(`https://example.test${path}`, options);
}

describe("GET /api/accounts", () => {
  it("returns 400 when workspaceId is missing", async () => {
    const response = await GET(buildRequest("/api/accounts"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "workspaceId query parameter is required" });
  });

  it("returns accounts for the requested workspace", async () => {
    const response = await GET(buildRequest("/api/accounts?workspaceId=ws-demo"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.accounts)).toBe(true);
    expect(body.accounts).not.toHaveLength(0);
    expect(body.accounts[0]).toMatchObject({
      workspaceId: { value: "ws-demo" },
    });
  });
});

describe("POST /api/accounts", () => {
  it("creates a new account", async () => {
    const newAccount = {
      name: "Test Company",
      domain: "test.com",
      industry: "Software",
      size: "11-50" as const,
    };

    const response = await POST(
      buildRequest("/api/accounts?workspaceId=ws-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.account).toMatchObject({
      name: "Test Company",
      domain: "test.com",
      industry: "Software",
      size: "11-50",
      workspaceId: { value: "ws-demo" },
    });
    expect(body.account.id).toBeDefined();
    expect(body.account.createdAt).toBeDefined();
    expect(body.account.updatedAt).toBeDefined();
  });

  it("returns 400 when workspaceId is missing", async () => {
    const response = await POST(
      buildRequest("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "workspaceId query parameter is required" });
  });
});
