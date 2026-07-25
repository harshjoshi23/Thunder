import type {
  Confidence,
  GuardrailFinding,
  Segment,
} from "@/lib/schemas";
import { countEvidenceRefs } from "@/lib/evidence/validate";

export function computeConfidence(
  segments: Segment[],
  guardrails: GuardrailFinding[],
  allValid: boolean,
): Confidence {
  const refs = countEvidenceRefs(segments);
  const highSeverity = guardrails.some((g) => g.severity === "high");

  if (allValid && refs >= 8 && !highSeverity) return "high";
  if (refs >= 4 && allValid) return "medium";
  return "low";
}
