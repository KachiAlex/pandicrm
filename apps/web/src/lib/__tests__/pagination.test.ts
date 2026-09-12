import { describe, it, expect } from "vitest";
import { getPaginationParams, createPaginatedResult } from "@/lib/pagination";

describe("pagination", () => {
  describe("getPaginationParams", () => {
    it("returns default values when no params provided", () => {
      const params = new URLSearchParams();
      const result = getPaginationParams(params);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.skip).toBe(0);
      expect(result.take).toBe(20);
    });

    it("parses page and pageSize from params", () => {
      const params = new URLSearchParams({ page: "3", pageSize: "50" });
      const result = getPaginationParams(params);
      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(50);
      expect(result.skip).toBe(100);
      expect(result.take).toBe(50);
    });

    it("enforces minimum page of 1", () => {
      const params = new URLSearchParams({ page: "0" });
      const result = getPaginationParams(params);
      expect(result.page).toBe(1);
    });

    it("enforces minimum pageSize of 1", () => {
      const params = new URLSearchParams({ pageSize: "0" });
      const result = getPaginationParams(params);
      expect(result.pageSize).toBe(1);
    });

    it("enforces maximum pageSize of 100", () => {
      const params = new URLSearchParams({ pageSize: "200" });
      const result = getPaginationParams(params);
      expect(result.pageSize).toBe(100);
    });
  });

  describe("createPaginatedResult", () => {
    it("creates paginated result with correct metadata", () => {
      const data = [{ id: "1" }, { id: "2" }, { id: "3" }];
      const params = { page: 1, pageSize: 10, skip: 0, take: 10 };
      const result = createPaginatedResult(data, 25, params);

      expect(result.data).toEqual(data);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it("correctly identifies last page", () => {
      const data = [{ id: "1" }];
      const params = { page: 3, pageSize: 10, skip: 20, take: 10 };
      const result = createPaginatedResult(data, 25, params);

      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it("handles empty results", () => {
      const params = { page: 1, pageSize: 10, skip: 0, take: 10 };
      const result = createPaginatedResult([], 0, params);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });
  });
});
