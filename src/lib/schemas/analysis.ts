import { z } from "zod";

export const ExpertiseLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "mixed",
]);

export const LikelyActionSchema = z.enum([
  "save",
  "comment",
  "share",
  "skip",
  "skeptical",
]);

export const FactorKeySchema = z.enum([
  "hookStrength",
  "readability",
  "specificity",
  "structure",
  "practicalUsefulness",
  "segmentRelevance",
  "evidenceSupport",
  "novelty",
  "questionPotential",
  "controversyRisk",
  "ambiguity",
  "exaggeration",
  "missingContext",
]);

export const FactorScoreSchema = z.number().int().min(0).max(10);

export const FactorsSchema = z.object({
  hookStrength: FactorScoreSchema,
  readability: FactorScoreSchema,
  specificity: FactorScoreSchema,
  structure: FactorScoreSchema,
  practicalUsefulness: FactorScoreSchema,
  segmentRelevance: FactorScoreSchema,
  evidenceSupport: FactorScoreSchema,
  novelty: FactorScoreSchema,
  questionPotential: FactorScoreSchema,
  controversyRisk: FactorScoreSchema,
  ambiguity: FactorScoreSchema,
  exaggeration: FactorScoreSchema,
  missingContext: FactorScoreSchema,
});

export type Factors = z.infer<typeof FactorsSchema>;

export const SegmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  needs: z.array(z.string()).min(1).max(6),
  frustrations: z.array(z.string()).min(1).max(6),
  expertiseLevel: ExpertiseLevelSchema,
  evidenceIds: z.array(z.string()).min(1).max(8),
  consistencyNote: z.string().min(1),
});

export type Segment = z.infer<typeof SegmentSchema>;

export const ReactionSchema = z.object({
  segmentName: z.string().min(1),
  understood: z.string().min(1),
  valued: z.string().min(1),
  challenged: z.string().min(1),
  missingInfo: z.string().min(1),
  likelyAction: LikelyActionSchema,
  disagreementNote: z.string().min(1),
});

export type Reaction = z.infer<typeof ReactionSchema>;

export const GuardrailFindingSchema = z.object({
  type: z.enum([
    "exaggeration",
    "missing_context",
    "unsupported_claim",
    "manipulative_wording",
    "privacy_safety",
    "misinterpretation",
    "weak_evidence",
  ]),
  severity: z.enum(["low", "medium", "high"]),
  finding: z.string().min(1),
  relatedEvidenceIds: z.array(z.string()).optional(),
});

export type GuardrailFinding = z.infer<typeof GuardrailFindingSchema>;

const GUARDRAIL_TYPES = new Set([
  "exaggeration",
  "missing_context",
  "unsupported_claim",
  "manipulative_wording",
  "privacy_safety",
  "misinterpretation",
  "weak_evidence",
]);

function coerceGuardrails(raw: unknown): GuardrailFinding[] {
  if (!Array.isArray(raw)) return [];
  const out: GuardrailFinding[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      out.push({
        type: "unsupported_claim",
        severity: "medium",
        finding: item.trim(),
      });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const typeRaw = String(obj.type ?? obj.kind ?? obj.category ?? "").trim();
    const type = (
      GUARDRAIL_TYPES.has(typeRaw)
        ? typeRaw
        : typeRaw
          ? "unsupported_claim"
          : null
    ) as GuardrailFinding["type"] | null;
    const finding = String(
      obj.finding ?? obj.message ?? obj.text ?? obj.description ?? "",
    ).trim();
    const severityRaw = String(obj.severity ?? "medium").toLowerCase();
    const severity: GuardrailFinding["severity"] =
      severityRaw === "low" || severityRaw === "high" ? severityRaw : "medium";
    if (!type || !finding) continue;
    const related = Array.isArray(obj.relatedEvidenceIds)
      ? obj.relatedEvidenceIds.filter((x): x is string => typeof x === "string")
      : undefined;
    out.push({
      type,
      severity,
      finding,
      ...(related && related.length > 0 ? { relatedEvidenceIds: related } : {}),
    });
  }
  return out.slice(0, 8);
}

/** Coerce messy LLM guardrail shapes into valid findings (drop junk). */
export const GuardrailsSchema = z
  .unknown()
  .transform((raw): GuardrailFinding[] => coerceGuardrails(raw));

export const AudienceResearchSchema = z.object({
  segments: z.array(SegmentSchema).length(3),
});

export type AudienceResearch = z.infer<typeof AudienceResearchSchema>;

export const JurorOutputSchema = z.object({
  reaction: ReactionSchema,
});

export type JurorOutput = z.infer<typeof JurorOutputSchema>;

export const CriticOutputSchema = z.object({
  factors: FactorsSchema,
  guardrails: GuardrailsSchema,
  strengths: z.array(z.string()).min(1).max(5),
  weaknesses: z.array(z.string()).min(1).max(5),
});

export type CriticOutput = z.infer<typeof CriticOutputSchema>;

export const Call1OutputSchema = z.object({
  segments: z.array(SegmentSchema).length(3),
  reactions: z.array(ReactionSchema).length(3),
  factors: FactorsSchema,
  guardrails: GuardrailsSchema,
  strengths: z.array(z.string()).min(1).max(5),
  weaknesses: z.array(z.string()).min(1).max(5),
});

export type Call1Output = z.infer<typeof Call1OutputSchema>;

export const SlideSchema = z.object({
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(320),
});

export const FactorDeltaSchema = z.number().int().min(-3).max(3);

export const OptimizedFactorDeltasSchema = z.object({
  hookStrength: FactorDeltaSchema,
  readability: FactorDeltaSchema,
  specificity: FactorDeltaSchema,
  structure: FactorDeltaSchema,
  practicalUsefulness: FactorDeltaSchema,
  segmentRelevance: FactorDeltaSchema,
  evidenceSupport: FactorDeltaSchema,
  novelty: FactorDeltaSchema,
  questionPotential: FactorDeltaSchema,
  controversyRisk: FactorDeltaSchema,
  ambiguity: FactorDeltaSchema,
  exaggeration: FactorDeltaSchema,
  missingContext: FactorDeltaSchema,
});

export const Call2OutputSchema = z.object({
  hook: z.string().min(1),
  slides: z.array(SlideSchema).length(5),
  caption: z.string().min(1),
  cta: z.string().min(1),
  voiceoverScript: z.string().min(1).max(2500),
  changeExplanations: z
    .array(
      z.object({
        change: z.string().min(1),
        why: z.string().min(1),
        evidenceIds: z.array(z.string()).max(6),
      }),
    )
    .min(1)
    .max(8),
  optimizedFactorDeltas: OptimizedFactorDeltasSchema,
});

export type Call2Output = z.infer<typeof Call2OutputSchema>;

export const DiagnosticsSchema = z.object({
  audienceFit: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  savePotential: z.number().min(0).max(100),
  discussionPotential: z.number().min(0).max(100),
  misinterpretationRisk: z.number().min(0).max(100),
});

export type Diagnostics = z.infer<typeof DiagnosticsSchema>;

export const ConfidenceSchema = z.enum(["low", "medium", "high"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const RunModeSchema = z.enum([
  "live",
  "seeded_demo",
  "recovery_fallback",
]);
export type RunMode = z.infer<typeof RunModeSchema>;

export const TraceStepSchema = z.object({
  node: z.string(),
  status: z.enum(["ok", "skip", "error", "retry"]),
  detail: z.string().optional(),
  model: z.string().optional(),
  ms: z.number().optional(),
});

export type TraceStep = z.infer<typeof TraceStepSchema>;

export const AnalyzeResultSchema = z.object({
  mode: RunModeSchema,
  confidence: ConfidenceSchema,
  comments: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
  creatorContext: z.string(),
  draftPost: z.string(),
  sourceUrl: z.string().optional(),
  segments: z.array(SegmentSchema).length(3),
  reactions: z.array(ReactionSchema).length(3),
  factors: FactorsSchema,
  optimizedFactors: FactorsSchema,
  guardrails: GuardrailsSchema,
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  originalDiagnostics: DiagnosticsSchema,
  optimizedDiagnostics: DiagnosticsSchema,
  optimized: z.object({
    hook: z.string(),
    slides: z.array(SlideSchema).length(5),
    caption: z.string(),
    cta: z.string(),
    voiceoverScript: z.string(),
    changeExplanations: z.array(
      z.object({
        change: z.string(),
        why: z.string(),
        evidenceIds: z.array(z.string()),
      }),
    ),
  }),
  meta: z.object({
    relativePerformance: z.enum(["Low", "Moderate", "Strong"]),
    primaryStrength: z.string(),
    primaryWeakness: z.string(),
    agentTrace: z.array(z.string()),
    executionTrace: z.array(TraceStepSchema).optional(),
    modelsUsed: z
      .object({
        audience: z.string().optional(),
        juror: z.string().optional(),
        critic: z.string().optional(),
        strategy: z.string().optional(),
        image: z.string().optional(),
      })
      .optional(),
  }),
});

export type AnalyzeResult = z.infer<typeof AnalyzeResultSchema>;

export const N8nExportPayloadSchema = z.object({
  source: z.literal("thunder"),
  approved: z.literal(true),
  exportedAt: z.string(),
  hook: z.string().min(1),
  slides: z.array(z.object({ title: z.string(), body: z.string() })).length(5),
  caption: z.string().min(1),
  cta: z.string().min(1),
  voiceoverScript: z.string().optional(),
  coverImageUrl: z.string().optional(),
  mode: RunModeSchema.optional(),
  confidence: ConfidenceSchema.optional(),
  diagnostics: DiagnosticsSchema.optional(),
});

export type N8nExportPayload = z.infer<typeof N8nExportPayloadSchema>;
