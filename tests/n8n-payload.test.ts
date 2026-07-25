import { describe, expect, it } from "vitest";
import { buildN8nPayload } from "@/lib/n8n/payload";
import { MOCK_CALL2, getMockAnalyzeResult } from "@/lib/mock/seed-result";

describe("n8n export payload", () => {
  it("builds approved thunder payload", () => {
    const result = getMockAnalyzeResult();
    const payload = buildN8nPayload({
      hook: result.optimized.hook,
      slides: result.optimized.slides,
      caption: result.optimized.caption,
      cta: result.optimized.cta,
      voiceoverScript: result.optimized.voiceoverScript,
      mode: result.mode,
      confidence: result.confidence,
      diagnostics: result.optimizedDiagnostics,
    });
    expect(payload.source).toBe("thunder");
    expect(payload.approved).toBe(true);
    expect(payload.slides).toHaveLength(5);
    expect(payload.hook).toBe(MOCK_CALL2.hook);
  });
});
