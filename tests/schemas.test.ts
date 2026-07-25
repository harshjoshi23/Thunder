import { describe, expect, it } from "vitest";
import {
  AnalyzeRequestSchema,
  AnalyzeResultSchema,
  Call1OutputSchema,
  Call2OutputSchema,
} from "@/lib/schemas";
import { MOCK_CALL1, MOCK_CALL2, getMockAnalyzeResult } from "@/lib/mock/seed-result";
import { SEED_INPUT } from "@/lib/mock/seed-input";

describe("schemas", () => {
  it("parses analyze request", () => {
    expect(AnalyzeRequestSchema.parse(SEED_INPUT).draftPost).toContain(
      "posting every single day",
    );
  });

  it("parses mock call1 and call2", () => {
    expect(Call1OutputSchema.parse(MOCK_CALL1).segments).toHaveLength(3);
    expect(Call2OutputSchema.parse(MOCK_CALL2).slides).toHaveLength(5);
  });

  it("parses full mock analyze result", () => {
    const result = getMockAnalyzeResult();
    expect(AnalyzeResultSchema.parse(result).mode).toBe("fallback");
    expect(result.optimized.slides).toHaveLength(5);
    expect(result.originalDiagnostics.clarity).toBeGreaterThan(0);
  });
});
