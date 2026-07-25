import type {
  AnalyzeResult,
  Call1Output,
  Call2Output,
  RunMode,
  TraceStep,
} from "@/lib/schemas";
import { normalizeComments } from "@/lib/evidence/normalize";
import {
  allEvidenceValid,
  repairCall1Evidence,
  repairCall2Evidence,
} from "@/lib/evidence/validate";
import {
  applyFactorDeltas,
  computeDiagnostics,
  relativePerformance,
} from "@/lib/scoring/formulas";
import { computeConfidence } from "@/lib/scoring/confidence";
import { SEED_INPUT } from "./seed-input";

export const MOCK_CALL1: Call1Output = {
  segments: [
    {
      name: "Quiet Beginners",
      description:
        "Newer creators who feel behind and want gentle, clear starting steps.",
      needs: [
        "Simple definitions without guilt",
        "A tiny first weekly plan",
        "Visual structure that sticks",
      ],
      frustrations: [
        "Carousels that assume they already know the game",
        "Motivation talk without a first step",
      ],
      expertiseLevel: "beginner",
      evidenceIds: ["C01", "C02", "C07", "C12"],
      consistencyNote:
        "Multiple comments ask for simpler entry points and less shame.",
    },
    {
      name: "Busy Professionals",
      description:
        "Full-time workers who want short systems, checklists, and realistic time budgets.",
      needs: [
        "20-minute night routines",
        "Concrete weekly plans",
        "Beginner vs busy-pro paths in one carousel",
      ],
      frustrations: [
        "Vibe-only advice",
        "Advice that ignores a 9–6 job",
      ],
      expertiseLevel: "intermediate",
      evidenceIds: ["C03", "C06", "C08", "C13", "C15"],
      consistencyNote:
        "Strong pattern of requests for systems, time realism, and clarity of audience.",
    },
    {
      name: "Hustle Skeptics",
      description:
        "People burned by daily-posting culture who demand nuance, rest, and honest limits.",
      needs: [
        "When-NOT-to-post guidance",
        "Evidence beyond absolute claims",
        "Realistic before/after weeks",
      ],
      frustrations: [
        "Grind 24/7 messaging",
        "Unsupported ‘you will never grow’ statements",
      ],
      expertiseLevel: "advanced",
      evidenceIds: ["C04", "C05", "C09", "C10", "C11", "C14"],
      consistencyNote:
        "Consistent pushback on burnout, absolutes, and hustle marketing.",
    },
  ],
  reactions: [
    {
      segmentName: "Quiet Beginners",
      understood: "Growth requires serious consistency and daily effort.",
      valued: "The promise of a clear carousel about posting habits.",
      challenged:
        "Feels shaming — ‘every single day or never grow’ with no beginner on-ramp.",
      missingInfo: "What consistency means in week one with tiny time.",
      likelyAction: "skip",
      disagreementNote:
        "Beginners need softness; skeptics want hard boundaries on hustle.",
    },
    {
      segmentName: "Busy Professionals",
      understood: "Daily posting is framed as the only path to growth.",
      valued: "Topic matches their real struggle: creating after work.",
      challenged:
        "No 20-minute plan, no 3x/week option, no job-aware checklist.",
      missingInfo: "A realistic weekly system for full-time employees.",
      likelyAction: "skeptical",
      disagreementNote:
        "They want systems that would still feel too advanced if beginners aren’t guided first.",
    },
    {
      segmentName: "Hustle Skeptics",
      understood: "The draft sells grind culture as destiny.",
      valued: "Willingness to talk about consistency at all.",
      challenged:
        "Absolute claims, burnout risk, missing ‘when not to post,’ no evidence.",
      missingInfo: "Nuance, rest days, and a realistic before/after week.",
      likelyAction: "comment",
      disagreementNote:
        "Likely to publicly challenge guilt-based growth claims.",
    },
  ],
  factors: {
    hookStrength: 6,
    readability: 5,
    specificity: 3,
    structure: 4,
    practicalUsefulness: 3,
    segmentRelevance: 6,
    evidenceSupport: 6,
    novelty: 4,
    questionPotential: 7,
    controversyRisk: 8,
    ambiguity: 6,
    exaggeration: 9,
    missingContext: 8,
  },
  guardrails: [
    {
      type: "exaggeration",
      severity: "high",
      finding:
        "Claim that missing daily posts means you will never grow is absolute and unsupported.",
      relatedEvidenceIds: ["C04", "C11", "C14"],
    },
    {
      type: "manipulative_wording",
      severity: "high",
      finding:
        "‘No excuses’ / ‘unstoppable’ / ‘life changes forever’ language risks guilt and burnout.",
      relatedEvidenceIds: ["C05", "C09", "C10"],
    },
    {
      type: "missing_context",
      severity: "medium",
      finding:
        "Draft never says who it is for — employees vs full-time creators.",
      relatedEvidenceIds: ["C15", "C02"],
    },
    {
      type: "unsupported_claim",
      severity: "medium",
      finding:
        "Implies daily posting is required without nuance or evidence alternatives like 3x/week.",
      relatedEvidenceIds: ["C06", "C11"],
    },
  ],
  strengths: [
    "Topic matches a real, recurring audience pain (time + consistency)",
    "Carousel format fits mixed expertise well",
    "Save CTA fits practical learners",
  ],
  weaknesses: [
    "Guilt-heavy absolutes raise misinterpretation and backlash risk",
    "No segmented path for beginners vs busy professionals",
    "Missing rest / when-not-to-post guidance",
  ],
};

export const MOCK_CALL2: Call2Output = {
  hook: "You don’t need to post every day. You need a system that survives a full-time job.",
  slides: [
    {
      title: "Consistency ≠ daily",
      body: "Consistency means a rhythm you can repeat. For many people with jobs, 2–3 quality posts/week beats daily burnout.",
    },
    {
      title: "Who this is for",
      body: "Full-time employees with ~20 minutes at night. If you’re a full-time creator, your cadence can be higher — say so up front.",
    },
    {
      title: "A 20-minute night plan",
      body: "5 min idea capture → 10 min draft one slide or caption → 5 min schedule or park it. Same checklist, week after week.",
    },
    {
      title: "Beginner vs busy-pro path",
      body: "Beginners: one format, one platform, 4 weeks. Busy-pros: batch Sunday outlines, publish Tue/Thu. Different lanes, same carousel.",
    },
    {
      title: "When NOT to post",
      body: "Skip when you’re only posting from guilt, sleeping under 6 hours, or repeating content with no learning. Rest is part of the system.",
    },
  ],
  caption:
    "Consistency that respects your job > grind cosplay. Here’s a realistic rhythm, a 20-minute plan, and when to stop — grounded in what my comments actually ask for.",
  cta: "Save this for your next quiet evening — and tell me your real weekly cadence.",
  voiceoverScript:
    "You don’t need to post every day. You need a system that survives a full-time job. Consistency is a rhythm you can repeat — for many people, two or three quality posts a week beats daily burnout. Say who this is for up front: employees with about twenty minutes at night. Here’s the plan: five minutes to capture an idea, ten to draft one slide or caption, five to schedule or park it. Beginners pick one format for four weeks. Busy pros batch Sunday outlines and publish Tuesday and Thursday. And when should you skip? When you’re posting from guilt, sleeping under six hours, or repeating content with no learning. Rest is part of the system. Save this for your next quiet evening.",
  changeExplanations: [
    {
      change: "Replaced ‘post every day or never grow’ with a bounded hook",
      why: "Skeptics and burned-out readers challenged absolute hustle claims.",
      evidenceIds: ["C04", "C11", "C14"],
    },
    {
      change: "Named the audience (full-time job) up front",
      why: "Commenters asked who the advice is actually for.",
      evidenceIds: ["C15", "C02"],
    },
    {
      change: "Added 20-minute plan + beginner/busy-pro paths",
      why: "Busy professionals want systems, not vibes.",
      evidenceIds: ["C03", "C08", "C13"],
    },
    {
      change: "Added when-NOT-to-post / anti-guilt slide",
      why: "Audience flagged burnout and rest explicitly.",
      evidenceIds: ["C09", "C10", "C05"],
    },
  ],
  optimizedFactorDeltas: {
    hookStrength: 2,
    readability: 3,
    specificity: 3,
    structure: 3,
    practicalUsefulness: 3,
    segmentRelevance: 2,
    evidenceSupport: 1,
    novelty: 1,
    questionPotential: 0,
    controversyRisk: -2,
    ambiguity: -2,
    exaggeration: -3,
    missingContext: -3,
  },
};

export function buildAnalyzeResultFromParts(args: {
  mode: RunMode;
  commentsText: string;
  creatorContext: string;
  draftPost: string;
  sourceUrl?: string;
  call1: Call1Output;
  call2: Call2Output;
  agentTrace?: string[];
  executionTrace?: TraceStep[];
  modelsUsed?: AnalyzeResult["meta"]["modelsUsed"];
}): AnalyzeResult {
  const comments = normalizeComments(args.commentsText);
  const repaired1 = repairCall1Evidence(args.call1, comments).output;
  const repaired2 = repairCall2Evidence(args.call2, comments);
  const originalDiagnostics = computeDiagnostics(repaired1.factors);
  const optimizedFactors = applyFactorDeltas(
    repaired1.factors,
    repaired2.optimizedFactorDeltas,
  );
  const optimizedDiagnostics = computeDiagnostics(optimizedFactors);
  const valid = allEvidenceValid(repaired1.segments, comments);
  const confidence = computeConfidence(
    repaired1.segments,
    repaired1.guardrails,
    valid,
  );

  return {
    mode: args.mode,
    confidence,
    comments,
    creatorContext: args.creatorContext,
    draftPost: args.draftPost,
    sourceUrl: args.sourceUrl,
    segments: repaired1.segments,
    reactions: repaired1.reactions,
    factors: repaired1.factors,
    optimizedFactors,
    guardrails: repaired1.guardrails,
    strengths: repaired1.strengths,
    weaknesses: repaired1.weaknesses,
    originalDiagnostics,
    optimizedDiagnostics,
    optimized: {
      hook: repaired2.hook,
      slides: repaired2.slides,
      caption: repaired2.caption,
      cta: repaired2.cta,
      voiceoverScript: repaired2.voiceoverScript,
      changeExplanations: repaired2.changeExplanations,
    },
    meta: {
      relativePerformance: relativePerformance(optimizedDiagnostics),
      primaryStrength: repaired1.strengths[0] ?? "Audience topical fit",
      primaryWeakness: repaired1.weaknesses[0] ?? "Draft specificity",
      agentTrace: args.agentTrace ?? [
        "normalizeComments",
        "audienceResearch",
        "evidenceValidate",
        "juror1",
        "juror2",
        "juror3",
        "critic",
        "originalScoring",
        "strategy",
        "optimizedEval",
        "finalVerify",
      ],
      executionTrace: args.executionTrace,
      modelsUsed: args.modelsUsed,
    },
  };
}

export function getMockAnalyzeResult(
  overrides?: Partial<{
    commentsText: string;
    creatorContext: string;
    draftPost: string;
    sourceUrl: string;
  }>,
  mode: RunMode = "seeded_demo",
): AnalyzeResult {
  const label =
    mode === "seeded_demo"
      ? "seeded_demo (demo data)"
      : "recovery_fallback (services missing or failed)";
  return buildAnalyzeResultFromParts({
    mode,
    commentsText: overrides?.commentsText ?? SEED_INPUT.commentsText,
    creatorContext: overrides?.creatorContext ?? SEED_INPUT.creatorContext,
    draftPost: overrides?.draftPost ?? SEED_INPUT.draftPost,
    sourceUrl: overrides?.sourceUrl,
    call1: MOCK_CALL1,
    call2: MOCK_CALL2,
    agentTrace: [
      "normalizeComments",
      label,
      "originalScoring",
      "optimizedEval",
      "finalVerify",
    ],
    executionTrace: [
      { node: "normalizeComments", status: "ok" },
      { node: label, status: "skip", detail: mode },
      { node: "originalScoring", status: "ok" },
      { node: "finalVerify", status: "ok", detail: mode },
    ],
  });
}
