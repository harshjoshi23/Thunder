import { afterEach, describe, expect, it, vi } from "vitest";
import {
  __resetRateLimitMemoryForTests,
  checkRateLimit,
} from "@/lib/security/rate-limit";
import { isAuthConfigured, requireApiAuth } from "@/lib/security/auth";

function makeRequest(ip = "203.0.113.10"): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: {
      "x-forwarded-for": ip,
      "content-type": "application/json",
    },
  });
}

describe("rate-limit (in-memory fallback)", () => {
  afterEach(() => {
    __resetRateLimitMemoryForTests();
    vi.unstubAllEnvs();
  });

  it("allows under the limit and blocks after", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("THUNDER_RATE_LIMIT", "2");
    vi.stubEnv("THUNDER_RATE_WINDOW_MS", "60000");

    const req = makeRequest();
    expect((await checkRateLimit(req, "test-route", { limit: 2 })).ok).toBe(
      true,
    );
    expect((await checkRateLimit(req, "test-route", { limit: 2 })).ok).toBe(
      true,
    );
    const blocked = await checkRateLimit(req, "test-route", { limit: 2 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });
});

describe("auth foundation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stays open when auth env is unset", async () => {
    vi.stubEnv("CLERK_SECRET_KEY", "");
    vi.stubEnv("THUNDER_API_TOKEN", "");
    expect(isAuthConfigured()).toBe(false);
    const result = await requireApiAuth(makeRequest());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.via).toBe("open");
  });

  it("accepts THUNDER_API_TOKEN bearer when configured", async () => {
    vi.stubEnv("CLERK_SECRET_KEY", "");
    vi.stubEnv("THUNDER_API_TOKEN", "test-token-phase0");
    expect(isAuthConfigured()).toBe(true);

    const denied = await requireApiAuth(makeRequest());
    expect(denied.ok).toBe(false);

    const allowed = await requireApiAuth(
      new Request("http://localhost/api/cover", {
        method: "POST",
        headers: {
          authorization: "Bearer test-token-phase0",
          "x-forwarded-for": "203.0.113.11",
        },
      }),
    );
    expect(allowed.ok).toBe(true);
    if (allowed.ok) expect(allowed.via).toBe("api_token");
  });

  it("allows seeded bypass when requested", async () => {
    vi.stubEnv("THUNDER_API_TOKEN", "secret");
    const result = await requireApiAuth(makeRequest(), { allowSeeded: true });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.via).toBe("seeded");
  });
});
