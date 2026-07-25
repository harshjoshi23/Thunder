import { describe, expect, it } from "vitest";
import { getMockAnalyzeResult } from "@/lib/mock/seed-result";
import { SEED_INPUT } from "@/lib/mock/seed-input";

describe("fallback analyze result", () => {
  it("always returns a complete demoable payload", () => {
    const result = getMockAnalyzeResult(SEED_INPUT);
    expect(result.mode).toBe("fallback");
    expect(result.segments).toHaveLength(3);
    expect(result.reactions).toHaveLength(3);
    expect(result.optimized.slides).toHaveLength(5);
    expect(result.comments.length).toBeGreaterThan(5);
    expect(result.optimizedDiagnostics.audienceFit).toBeGreaterThan(
      result.originalDiagnostics.audienceFit,
    );
  });
});
