import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to isolate the module for each test because it has module-level state (the Map store).
// Use dynamic imports with vi.resetModules() to get a fresh store each time.

describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  async function getModule() {
    const mod = await import("@/lib/rate-limit");
    return mod;
  }

  describe("checkRateLimit", () => {
    it("allows the first request and returns correct remaining count", async () => {
      const { checkRateLimit } = await getModule();
      const result = checkRateLimit("ip-1", 5, 60_000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.retryAfter).toBeUndefined();
    });

    it("allows requests up to the limit", async () => {
      const { checkRateLimit } = await getModule();

      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit("ip-1", 5, 60_000);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it("blocks requests that exceed the limit", async () => {
      const { checkRateLimit } = await getModule();

      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit("ip-1", 5, 60_000);
      }

      const blocked = checkRateLimit("ip-1", 5, 60_000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    });

    it("resets after the window expires", async () => {
      const { checkRateLimit } = await getModule();

      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit("ip-1", 5, 60_000);
      }

      // Advance past window
      vi.advanceTimersByTime(60_001);

      const result = checkRateLimit("ip-1", 5, 60_000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("tracks separate identifiers independently", async () => {
      const { checkRateLimit } = await getModule();

      // Exhaust ip-1
      for (let i = 0; i < 3; i++) {
        checkRateLimit("ip-1", 3, 60_000);
      }

      // ip-2 should still be allowed
      const result = checkRateLimit("ip-2", 3, 60_000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("retryAfter decreases as time passes within the window", async () => {
      const { checkRateLimit } = await getModule();

      for (let i = 0; i < 2; i++) {
        checkRateLimit("ip-1", 2, 60_000);
      }

      const blocked1 = checkRateLimit("ip-1", 2, 60_000);
      const retry1 = blocked1.retryAfter!;

      vi.advanceTimersByTime(30_000);

      const blocked2 = checkRateLimit("ip-1", 2, 60_000);
      const retry2 = blocked2.retryAfter!;

      expect(retry2).toBeLessThan(retry1);
    });
  });

  describe("getClientIP", () => {
    it("extracts IP from x-forwarded-for header", async () => {
      const { getClientIP } = await getModule();
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      });
      expect(getClientIP(request)).toBe("1.2.3.4");
    });

    it("falls back to x-real-ip", async () => {
      const { getClientIP } = await getModule();
      const request = new Request("http://localhost", {
        headers: { "x-real-ip": "9.8.7.6" },
      });
      expect(getClientIP(request)).toBe("9.8.7.6");
    });

    it("returns 'unknown' when no IP headers present", async () => {
      const { getClientIP } = await getModule();
      const request = new Request("http://localhost");
      expect(getClientIP(request)).toBe("unknown");
    });
  });
});
