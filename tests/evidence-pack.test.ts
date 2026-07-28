import { describe, expect, it } from "vitest";
import {
  EvidencePackSchema,
  accessModeToRunMode,
  evidencePackToPipelineInput,
  safeParseEvidencePack,
} from "@/lib/evidence-pack";
import {
  AnalyzeRequestSchema,
  AnalyzeResultSchema,
  Call1OutputSchema,
  ReactionSchema,
  SegmentSchema,
} from "@/lib/schemas";
import { computeDiagnostics, FORMULA_DISCLOSURE } from "@/lib/scoring/formulas";
import { getMockAnalyzeResult, MOCK_CALL1 } from "@/lib/mock/seed-result";
import {
  FIXTURE_CSV_NORMALISED_PACK,
  FIXTURE_INVALID_DUP_IDS,
  FIXTURE_INVALID_EMPTY_COMMENTS,
  FIXTURE_INVALID_VERSION,
  FIXTURE_INSTAGRAM_PACK,
  FIXTURE_TIKTOK_PACK,
  FIXTURE_YOUTUBE_PACK,
} from "./fixtures/evidence-pack";

describe("EvidencePack contract", () => {
  it("accepts YouTube / Instagram / TikTok / CSV fixtures", () => {
    expect(EvidencePackSchema.parse(FIXTURE_YOUTUBE_PACK).platform).toBe(
      "youtube",
    );
    expect(EvidencePackSchema.parse(FIXTURE_INSTAGRAM_PACK).accessMode).toBe(
      "owner_authorized",
    );
    expect(EvidencePackSchema.parse(FIXTURE_TIKTOK_PACK).comments).toHaveLength(
      1,
    );
    expect(
      EvidencePackSchema.parse(FIXTURE_CSV_NORMALISED_PACK).platform,
    ).toBe("csv");
  });

  it("rejects invalid packs", () => {
    expect(safeParseEvidencePack(FIXTURE_INVALID_VERSION).success).toBe(false);
    expect(safeParseEvidencePack(FIXTURE_INVALID_EMPTY_COMMENTS).success).toBe(
      false,
    );
    expect(safeParseEvidencePack(FIXTURE_INVALID_DUP_IDS).success).toBe(false);
  });

  it("maps access modes to run modes", () => {
    expect(accessModeToRunMode("imported")).toBe("imported");
    expect(accessModeToRunMode("live_api")).toBe("live");
    expect(accessModeToRunMode("seeded_demo")).toBe("seeded_demo");
    expect(accessModeToRunMode("recovery_fallback")).toBe("recovery_fallback");
  });

  it("converts pack to pipeline comments", () => {
    const mapped = evidencePackToPipelineInput(FIXTURE_YOUTUBE_PACK);
    expect(mapped.commentCount).toBe(3);
    expect(mapped.commentsText).toContain("20 minutes");
    expect(mapped.preferredRunMode).toBe("imported");
  });

  it("accepts AnalyzeRequest with evidencePack only", () => {
    const parsed = AnalyzeRequestSchema.parse({
      draftPost: "Consistency is everything. Post every day.",
      evidencePack: FIXTURE_YOUTUBE_PACK,
    });
    expect(parsed.evidencePack?.comments).toHaveLength(3);
  });

  it("rejects AnalyzeRequest with neither comments nor pack", () => {
    expect(
      AnalyzeRequestSchema.safeParse({
        draftPost: "Hello world draft for testing.",
      }).success,
    ).toBe(false);
  });
});

describe("Audience segment and reaction validation", () => {
  it("requires exactly three segments in Call1", () => {
    expect(Call1OutputSchema.parse(MOCK_CALL1).segments).toHaveLength(3);
    for (const s of MOCK_CALL1.segments) {
      expect(SegmentSchema.parse(s).evidenceIds.length).toBeGreaterThan(0);
    }
  });

  it("validates reaction shape", () => {
    const reaction = MOCK_CALL1.reactions[0];
    expect(ReactionSchema.parse(reaction).likelyAction).toBeTruthy();
  });
});

describe("Deterministic scoring and mode labelling", () => {
  it("computes diagnostics from factors only", () => {
    const factors = MOCK_CALL1.factors;
    const d = computeDiagnostics(factors);
    expect(d.audienceFit).toBeGreaterThanOrEqual(0);
    expect(d.audienceFit).toBeLessThanOrEqual(100);
    expect(FORMULA_DISCLOSURE.clarity).toContain("readability");
  });

  it("labels seeded and recovery modes on results", () => {
    const seeded = getMockAnalyzeResult(undefined, "seeded_demo");
    const recovery = getMockAnalyzeResult(undefined, "recovery_fallback");
    const imported = getMockAnalyzeResult(undefined, "imported");
    expect(AnalyzeResultSchema.parse(seeded).mode).toBe("seeded_demo");
    expect(AnalyzeResultSchema.parse(recovery).mode).toBe("recovery_fallback");
    expect(AnalyzeResultSchema.parse(imported).mode).toBe("imported");
    expect(seeded.segments).toHaveLength(3);
    expect(seeded.reactions).toHaveLength(3);
  });

  it("keeps mode on export-shaped optimized payload", () => {
    const result = getMockAnalyzeResult(undefined, "seeded_demo");
    expect(result.mode).toBe("seeded_demo");
    expect(result.optimized.slides).toHaveLength(5);
  });
});
