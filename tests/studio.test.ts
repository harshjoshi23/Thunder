import { describe, expect, it } from "vitest";
import {
  checkRunEntitlement,
  startOfUtcMonth,
} from "@/lib/billing/entitlement";
import { PLAN_LIMITS, normalizePlan, runsAllowedForPlan } from "@/lib/billing/plans";
import { countCommentLines, parseCommentsCsv } from "@/lib/studio/csv";
import { isDatabaseConfigured } from "@/lib/db/prisma";

describe("billing plans", () => {
  it("normalizes unknown plans to FREE", () => {
    expect(normalizePlan(undefined)).toBe("FREE");
    expect(normalizePlan("CREATOR_PRO")).toBe("CREATOR_PRO");
    expect(normalizePlan("agency")).toBe("FREE");
  });

  it("exposes Free vs Creator Pro run caps", () => {
    expect(runsAllowedForPlan("FREE")).toBe(PLAN_LIMITS.FREE.runsPerMonth);
    expect(runsAllowedForPlan("CREATOR_PRO")).toBe(
      PLAN_LIMITS.CREATOR_PRO.runsPerMonth,
    );
    expect(PLAN_LIMITS.FREE.runsPerMonth).toBe(5);
    expect(PLAN_LIMITS.CREATOR_PRO.runsPerMonth).toBeGreaterThan(
      PLAN_LIMITS.FREE.runsPerMonth,
    );
  });
});

describe("checkRunEntitlement", () => {
  it("allows Free users under the monthly cap", () => {
    const result = checkRunEntitlement({
      plan: "FREE",
      runsUsedThisMonth: 2,
    });
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(3);
    expect(result.runsAllowed).toBe(5);
  });

  it("blocks Free users at the monthly cap without Stripe", () => {
    const result = checkRunEntitlement({
      plan: "FREE",
      runsUsedThisMonth: 5,
    });
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.reason).toMatch(/Free plan limit/i);
  });

  it("allows Creator Pro with a higher cap", () => {
    const result = checkRunEntitlement({
      plan: "CREATOR_PRO",
      runsUsedThisMonth: 5,
    });
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(PLAN_LIMITS.CREATOR_PRO.runsPerMonth - 5);
  });
});

describe("startOfUtcMonth", () => {
  it("returns the first day of the UTC month", () => {
    const d = startOfUtcMonth(Date.UTC(2026, 6, 28, 15, 0, 0));
    expect(d.toISOString()).toBe("2026-07-01T00:00:00.000Z");
  });
});

describe("parseCommentsCsv", () => {
  it("parses headered CSV with comment + author", () => {
    const raw = `comment,author\n"Need simpler examples",alex\nShow me code,sam\n`;
    const parsed = parseCommentsCsv(raw);
    expect(parsed.comments).toHaveLength(2);
    expect(parsed.comments[0]?.text).toBe("Need simpler examples");
    expect(parsed.comments[0]?.author).toBe("alex");
    expect(parsed.commentsText).toContain("Show me code");
  });

  it("parses plain newline comments", () => {
    const parsed = parseCommentsCsv("First line\nSecond line\n\n");
    expect(parsed.comments.map((c) => c.text)).toEqual([
      "First line",
      "Second line",
    ]);
    expect(countCommentLines(parsed.commentsText)).toBe(2);
  });

  it("handles quoted commas", () => {
    const parsed = parseCommentsCsv(
      `text\n"Hello, world — please clarify"\n`,
    );
    expect(parsed.comments[0]?.text).toBe("Hello, world — please clarify");
  });

  it("returns empty for blank input", () => {
    expect(parseCommentsCsv("   ").comments).toHaveLength(0);
  });
});

describe("isDatabaseConfigured", () => {
  it("is false when DATABASE_URL unset (unit env)", () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    expect(isDatabaseConfigured()).toBe(false);
    if (prev !== undefined) process.env.DATABASE_URL = prev;
  });
});
