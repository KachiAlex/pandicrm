import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

function buildRequest(path: string, options?: RequestInit) {
  return new Request(`https://example.test${path}`, options);
}

describe("GET /api/contacts", () => {
  it("returns 400 when workspaceId is missing", async () => {
    const response = await GET(buildRequest("/api/contacts"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "workspaceId query parameter is required" });
  });

  it("returns contacts for the requested workspace", async () => {
    const response = await GET(buildRequest("/api/contacts?workspaceId=ws-demo"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.contacts)).toBe(true);
    expect(body.contacts).not.toHaveLength(0);
    expect(body.contacts[0]).toMatchObject({
      workspaceId: { value: "ws-demo" },
    });
  });

  it("returns contacts for a specific account", async () => {
    const response = await GET(
      buildRequest("/api/contacts?workspaceId=ws-demo&accountId=acc-001"),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.contacts)).toBe(true);
    expect(body.contacts.every((c: { accountId: { value: string } }) => c.accountId.value === "acc-001")).toBe(true);
  });
});

describe("POST /api/contacts", () => {
  it("creates a new contact", async () => {
    const newContact = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      title: "CEO",
      department: "Executive",
    };

    const response = await POST(
      buildRequest("/api/contacts?workspaceId=ws-demo&accountId=acc-001", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.contact).toMatchObject({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      title: "CEO",
      department: "Executive",
      workspaceId: { value: "ws-demo" },
      accountId: { value: "acc-001" },
    });
    expect(body.contact.id).toBeDefined();
    expect(body.contact.createdAt).toBeDefined();
    expect(body.contact.updatedAt).toBeDefined();
  });

  it("returns 400 when workspaceId is missing", async () => {
    const response = await POST(
      buildRequest("/api/contacts?accountId=acc-001", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: "John", lastName: "Doe" }),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "workspaceId query parameter is required" });
  });

  it("returns 400 when accountId is missing", async () => {
    const response = await POST(
      buildRequest("/api/contacts?workspaceId=ws-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: "John", lastName: "Doe" }),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "accountId query parameter is required" });
  });
});
