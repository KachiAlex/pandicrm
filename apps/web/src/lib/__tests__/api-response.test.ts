import { describe, it, expect } from "vitest";
import {
  successResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  tooManyRequestsResponse,
  serverErrorResponse,
  paginatedResponse,
} from "@/lib/api-response";

describe("api-response helpers", () => {
  it("successResponse returns 200 with data", async () => {
    const res = successResponse({ message: "ok" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ message: "ok" });
  });

  it("createdResponse returns 201 with data", async () => {
    const res = createdResponse({ id: "123" });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ id: "123" });
  });

  it("noContentResponse returns 204", () => {
    const res = noContentResponse();
    expect(res.status).toBe(204);
  });

  it("errorResponse returns 400 with message", async () => {
    const res = errorResponse("Bad request");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Bad request");
  });

  it("unauthorizedResponse returns 401", async () => {
    const res = unauthorizedResponse();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("forbiddenResponse returns 403", async () => {
    const res = forbiddenResponse();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Forbidden");
  });

  it("notFoundResponse returns 404", async () => {
    const res = notFoundResponse();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not found");
  });

  it("conflictResponse returns 409", async () => {
    const res = conflictResponse("Already exists");
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("Already exists");
  });

  it("tooManyRequestsResponse returns 429 with Retry-After header", async () => {
    const res = tooManyRequestsResponse(30);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    const body = await res.json();
    expect(body.error).toContain("30");
  });

  it("serverErrorResponse returns 500", async () => {
    const res = serverErrorResponse();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });

  it("paginatedResponse returns data with pagination metadata", async () => {
    const data = [{ id: "1" }, { id: "2" }];
    const res = paginatedResponse(data, 1, 20, 100);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(data);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.pageSize).toBe(20);
    expect(body.pagination.total).toBe(100);
    expect(body.pagination.totalPages).toBe(5);
    expect(body.pagination.hasNext).toBe(true);
    expect(body.pagination.hasPrev).toBe(false);
  });
});
