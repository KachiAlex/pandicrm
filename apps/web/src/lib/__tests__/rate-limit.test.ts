import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimit("test:127.0.0.1");
  });

  it("allows first attempt", () => {
    const result = checkRateLimit("test:127.0.0.1");
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBe(0);
  });

  it("allows up to 5 attempts", () => {
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit("test:127.0.0.1");
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks 6th attempt", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:127.0.0.1");
    }
    const result = checkRateLimit("test:127.0.0.1");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("tracks different keys independently", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:127.0.0.1");
    }
    const blocked = checkRateLimit("test:127.0.0.1");
    const other = checkRateLimit("test:192.168.0.1");
    expect(blocked.allowed).toBe(false);
    expect(other.allowed).toBe(true);
  });

  it("resets after calling resetRateLimit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:127.0.0.1");
    }
    expect(checkRateLimit("test:127.0.0.1").allowed).toBe(false);

    resetRateLimit("test:127.0.0.1");
    expect(checkRateLimit("test:127.0.0.1").allowed).toBe(true);
  });
});
