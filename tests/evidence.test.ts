import { describe, expect, it } from "vitest";
import { normalizeComments } from "@/lib/evidence/normalize";
import {
  allEvidenceValid,
  repairCall1Evidence,
} from "@/lib/evidence/validate";
import { MOCK_CALL1 } from "@/lib/mock/seed-result";
import { SEED_COMMENTS_TEXT } from "@/lib/mock/seed-input";

describe("normalizeComments", () => {
  it("assigns stable Cxx IDs", () => {
    const comments = normalizeComments("First\nSecond\nThird");
    expect(comments.map((c) => c.id)).toEqual(["C01", "C02", "C03"]);
  });

  it("strips bullets and numbers", () => {
    const comments = normalizeComments("- Hello\n1. World");
    expect(comments[0]?.text).toBe("Hello");
    expect(comments[1]?.text).toBe("World");
  });
});

describe("evidence validation", () => {
  it("rejects fabricated IDs and repairs segments", () => {
    const comments = normalizeComments(SEED_COMMENTS_TEXT);
    const poisoned = {
      ...MOCK_CALL1,
      segments: MOCK_CALL1.segments.map((s, i) =>
        i === 0 ? { ...s, evidenceIds: ["C99", "C01"] } : s,
      ),
    };
    const { output, invalidIds, repaired } = repairCall1Evidence(
      poisoned,
      comments,
    );
    expect(invalidIds).toContain("C99");
    expect(repaired).toBe(true);
    expect(output.segments[0]?.evidenceIds).not.toContain("C99");
    expect(allEvidenceValid(output.segments, comments)).toBe(true);
  });
});
