import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit-redis";

describe("rate-limit", () => {
  beforeEach(async () => {
    await resetRateLimit("test:127.0.0.1");
  });

  it("allows first attempt", async () => {
    const result = await checkRateLimit("test:127.0.0.1");
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBe(0);
  });

  it("allows up to 5 attempts", async () => {
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit("test:127.0.0.1");
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks 6th attempt", async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("test:127.0.0.1");
    }
    const result = await checkRateLimit("test:127.0.0.1");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("tracks different keys independently", async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("test:127.0.0.1");
    }
    const blocked = await checkRateLimit("test:127.0.0.1");
    const other = await checkRateLimit("test:192.168.0.1");
    expect(blocked.allowed).toBe(false);
    expect(other.allowed).toBe(true);
  });

  it("resets after calling resetRateLimit", async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("test:127.0.0.1");
    }
    expect((await checkRateLimit("test:127.0.0.1")).allowed).toBe(false);

    await resetRateLimit("test:127.0.0.1");
    expect((await checkRateLimit("test:127.0.0.1")).allowed).toBe(true);
  });
});
