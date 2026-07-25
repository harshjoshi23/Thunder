import type { Diagnostics, Factors } from "@/lib/schemas";
import { clamp, round } from "@/lib/utils";

function weighted(parts: Array<{ weight: number; value: number }>): number {
  const totalWeight = parts.reduce((s, p) => s + p.weight, 0);
  const sum = parts.reduce((s, p) => s + p.weight * p.value, 0);
  return round(clamp((100 * sum) / (10 * totalWeight), 0, 100));
}

export const FORMULA_DISCLOSURE = {
  audienceFit:
    "0.35×segmentRelevance + 0.25×practicalUsefulness + 0.20×evidenceSupport + 0.20×hookStrength",
  clarity:
    "0.30×readability + 0.25×specificity + 0.25×structure + 0.20×(10−missingContext)",
  savePotential:
    "0.30×practicalUsefulness + 0.25×specificity + 0.25×novelty + 0.20×hookStrength",
  discussionPotential:
    "0.35×questionPotential + 0.25×controversyRisk + 0.20×novelty + 0.20×segmentRelevance",
  misinterpretationRisk:
    "0.30×ambiguity + 0.30×exaggeration + 0.20×missingContext + 0.20×controversyRisk",
} as const;

export function computeDiagnostics(factors: Factors): Diagnostics {
  return {
    audienceFit: weighted([
      { weight: 0.35, value: factors.segmentRelevance },
      { weight: 0.25, value: factors.practicalUsefulness },
      { weight: 0.2, value: factors.evidenceSupport },
      { weight: 0.2, value: factors.hookStrength },
    ]),
    clarity: weighted([
      { weight: 0.3, value: factors.readability },
      { weight: 0.25, value: factors.specificity },
      { weight: 0.25, value: factors.structure },
      { weight: 0.2, value: 10 - factors.missingContext },
    ]),
    savePotential: weighted([
      { weight: 0.3, value: factors.practicalUsefulness },
      { weight: 0.25, value: factors.specificity },
      { weight: 0.25, value: factors.novelty },
      { weight: 0.2, value: factors.hookStrength },
    ]),
    discussionPotential: weighted([
      { weight: 0.35, value: factors.questionPotential },
      { weight: 0.25, value: factors.controversyRisk },
      { weight: 0.2, value: factors.novelty },
      { weight: 0.2, value: factors.segmentRelevance },
    ]),
    misinterpretationRisk: weighted([
      { weight: 0.3, value: factors.ambiguity },
      { weight: 0.3, value: factors.exaggeration },
      { weight: 0.2, value: factors.missingContext },
      { weight: 0.2, value: factors.controversyRisk },
    ]),
  };
}

export function applyFactorDeltas(
  factors: Factors,
  deltas: Partial<Record<keyof Factors, number>>,
): Factors {
  const next = { ...factors };
  (Object.keys(next) as Array<keyof Factors>).forEach((key) => {
    const delta = deltas[key] ?? 0;
    const capped = clamp(delta, -3, 3);
    next[key] = clamp(factors[key] + capped, 0, 10) as Factors[typeof key];
  });
  return next;
}

export function relativePerformance(
  diagnostics: Diagnostics,
): "Low" | "Moderate" | "Strong" {
  const positive =
    (diagnostics.audienceFit +
      diagnostics.clarity +
      diagnostics.savePotential +
      diagnostics.discussionPotential) /
    4;
  const adjusted = positive - diagnostics.misinterpretationRisk * 0.25;
  if (adjusted >= 70) return "Strong";
  if (adjusted >= 45) return "Moderate";
  return "Low";
}
