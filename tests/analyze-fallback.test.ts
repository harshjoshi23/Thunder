import { describe, expect, it } from "vitest";
import { getMockAnalyzeResult } from "@/lib/mock/seed-result";
import { SEED_INPUT } from "@/lib/mock/seed-input";

describe("seeded / recovery analyze result", () => {
  it("always returns a complete demoable payload", () => {
    const result = getMockAnalyzeResult(SEED_INPUT);
    expect(result.mode).toBe("seeded_demo");
    expect(result.segments).toHaveLength(3);
    expect(result.reactions).toHaveLength(3);
    expect(result.optimized.slides).toHaveLength(5);
    expect(result.comments.length).toBeGreaterThan(5);
    expect(result.optimizedDiagnostics.audienceFit).toBeGreaterThan(
      result.originalDiagnostics.audienceFit,
    );
  });

  it("labels recovery fallback distinctly", () => {
    const result = getMockAnalyzeResult(SEED_INPUT, "recovery_fallback");
    expect(result.mode).toBe("recovery_fallback");
    expect(result.meta.agentTrace.some((t) => t.includes("recovery"))).toBe(
      true,
    );
  });
});
