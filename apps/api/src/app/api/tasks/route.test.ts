import { describe, expect, it } from "vitest";
import { GET } from "./route";

function buildRequest(path: string) {
  return new Request(`https://example.test${path}`);
}

describe("GET /api/tasks", () => {
  it("returns 400 when workspaceId is missing", async () => {
    const response = await GET(buildRequest("/api/tasks"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "workspaceId query parameter is required" });
  });

  it("returns tasks for the requested workspace", async () => {
    const response = await GET(
      buildRequest("/api/tasks?workspaceId=ws-demo"),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.tasks)).toBe(true);
    expect(body.tasks).not.toHaveLength(0);
    expect(body.tasks[0]).toMatchObject({
      workspaceId: { value: "ws-demo" },
    });
  });
});
