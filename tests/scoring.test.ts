import { describe, expect, it } from "vitest";
import {
  applyFactorDeltas,
  computeDiagnostics,
  relativePerformance,
} from "@/lib/scoring/formulas";
import { computeConfidence } from "@/lib/scoring/confidence";
import type { Factors } from "@/lib/schemas";

const baseFactors: Factors = {
  hookStrength: 5,
  readability: 5,
  specificity: 5,
  structure: 5,
  practicalUsefulness: 5,
  segmentRelevance: 5,
  evidenceSupport: 5,
  novelty: 5,
  questionPotential: 5,
  controversyRisk: 5,
  ambiguity: 5,
  exaggeration: 5,
  missingContext: 5,
};

describe("computeDiagnostics", () => {
  it("returns scores in 0–100", () => {
    const d = computeDiagnostics(baseFactors);
    for (const value of Object.values(d)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it("improves clarity when missingContext drops", () => {
    const worse = computeDiagnostics({ ...baseFactors, missingContext: 9 });
    const better = computeDiagnostics({ ...baseFactors, missingContext: 2 });
    expect(better.clarity).toBeGreaterThan(worse.clarity);
  });

  it("clamps factor deltas to ±3", () => {
    const next = applyFactorDeltas(baseFactors, { exaggeration: -9, hookStrength: 9 });
    expect(next.exaggeration).toBe(2);
    expect(next.hookStrength).toBe(8);
  });

  it("maps relative performance bands", () => {
    const strong = relativePerformance({
      audienceFit: 85,
      clarity: 80,
      savePotential: 78,
      discussionPotential: 70,
      misinterpretationRisk: 20,
    });
    expect(strong).toBe("Strong");
  });
});

describe("computeConfidence", () => {
  it("returns high with enough valid evidence", () => {
    const segments = [
      {
        name: "A",
        description: "d",
        needs: ["n"],
        frustrations: ["f"],
        expertiseLevel: "beginner" as const,
        evidenceIds: ["C01", "C02", "C03"],
        consistencyNote: "ok",
      },
      {
        name: "B",
        description: "d",
        needs: ["n"],
        frustrations: ["f"],
        expertiseLevel: "intermediate" as const,
        evidenceIds: ["C04", "C05", "C06"],
        consistencyNote: "ok",
      },
      {
        name: "C",
        description: "d",
        needs: ["n"],
        frustrations: ["f"],
        expertiseLevel: "advanced" as const,
        evidenceIds: ["C07", "C08"],
        consistencyNote: "ok",
      },
    ];
    expect(computeConfidence(segments, [], true)).toBe("high");
  });
});
