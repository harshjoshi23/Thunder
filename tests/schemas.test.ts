import { describe, expect, it } from "vitest";
import {
  AnalyzeRequestSchema,
  AnalyzeResultSchema,
  Call1OutputSchema,
  Call2OutputSchema,
  N8nExportPayloadSchema,
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
    expect(Call2OutputSchema.parse(MOCK_CALL2).voiceoverScript.length).toBeGreaterThan(
      40,
    );
  });

  it("parses full mock analyze result as seeded_demo", () => {
    const result = getMockAnalyzeResult();
    expect(AnalyzeResultSchema.parse(result).mode).toBe("seeded_demo");
    expect(result.optimized.slides).toHaveLength(5);
    expect(result.optimized.voiceoverScript.length).toBeGreaterThan(40);
    expect(result.originalDiagnostics.clarity).toBeGreaterThan(0);
  });

  it("parses recovery_fallback mode", () => {
    const result = getMockAnalyzeResult(undefined, "recovery_fallback");
    expect(result.mode).toBe("recovery_fallback");
  });

  it("validates n8n export payload", () => {
    const payload = N8nExportPayloadSchema.parse({
      source: "thunder",
      approved: true,
      exportedAt: new Date().toISOString(),
      hook: MOCK_CALL2.hook,
      slides: MOCK_CALL2.slides,
      caption: MOCK_CALL2.caption,
      cta: MOCK_CALL2.cta,
      voiceoverScript: MOCK_CALL2.voiceoverScript,
      mode: "seeded_demo",
    });
    expect(payload.approved).toBe(true);
    expect(payload.slides).toHaveLength(5);
  });
});
