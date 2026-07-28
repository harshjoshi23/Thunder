# Thunder scoring (deterministic)

Final **0–100 diagnostic scores are never invented by the LLM**.

The language model may rate **factors** on a **0–10** integer scale. TypeScript in [`src/lib/scoring/formulas.ts`](../src/lib/scoring/formulas.ts) maps those factors to diagnostics.

## Factor inputs (0–10)

| Factor | Meaning (high = more of this) |
|--------|-------------------------------|
| hookStrength | Opening pull |
| readability | Easy to read |
| specificity | Concrete vs vague |
| structure | Slide / outline structure |
| practicalUsefulness | Actionable value |
| segmentRelevance | Fit to twin segments |
| evidenceSupport | Grounded in imported comments |
| novelty | Fresh vs repeated |
| questionPotential | Likely to spark discussion |
| controversyRisk | Polarising / debate risk |
| ambiguity | Unclear meaning |
| exaggeration | Overclaim |
| missingContext | Gaps that confuse |

## Diagnostic outputs (0–100)

| Score | Formula (weights on 0–10 factors) | Meaning | Limitation |
|-------|-----------------------------------|---------|------------|
| audienceFit | 0.35×segmentRelevance + 0.25×practicalUsefulness + 0.20×evidenceSupport + 0.20×hookStrength | How well draft fits twin | Not a follower count |
| clarity | 0.30×readability + 0.25×specificity + 0.25×structure + 0.20×(10−missingContext) | How clear the draft is | Not grammar proof |
| savePotential | 0.30×practicalUsefulness + 0.25×specificity + 0.25×novelty + 0.20×hookStrength | Relative “save-worthy” signal | Not platform saves |
| discussionPotential | 0.35×questionPotential + 0.25×controversyRisk + 0.20×novelty + 0.20×segmentRelevance | Discussion likelihood | Not comment count |
| misinterpretationRisk | 0.30×ambiguity + 0.30×exaggeration + 0.20×missingContext + 0.20×controversyRisk | Risk of being misread | Higher = worse |

Weighted formula implementation: each part is `weight × factor`, normalised by `100 / (10 × totalWeight)`, clamped to 0–100.

## Relative performance label

`relativePerformance` (Low / Moderate / Strong) averages positive diagnostics and subtracts `0.25 × misinterpretationRisk`. Thresholds: ≥70 Strong, ≥45 Moderate, else Low.

## Claims Thunder must never make

- Exact views, virality, revenue, or ranking predictions
- That scores are “scientific” audience truth
- That seeded or recovery runs are Live
