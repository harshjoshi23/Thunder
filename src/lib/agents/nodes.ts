import { normalizeComments } from "@/lib/evidence/normalize";
import {
  allEvidenceValid,
  repairCall1Evidence,
  repairCall2Evidence,
} from "@/lib/evidence/validate";
import {
  applyFactorDeltas,
  computeDiagnostics,
} from "@/lib/scoring/formulas";
import {
  buildAnalyzeResultFromParts,
  getMockAnalyzeResult,
} from "@/lib/mock/seed-result";
import { hasFalKey, isFallbackEnabled, shouldForceMock } from "@/lib/fal/config";
import type { Call1Output, Reaction, TraceStep } from "@/lib/schemas";
import { runAudienceResearch } from "./audience";
import { runJuror } from "./juror";
import { runCritic } from "./critic";
import { runStrategy } from "./strategy";
import type { ThunderGraphState } from "./state";

function trace(
  node: string,
  status: TraceStep["status"],
  detail?: string,
  model?: string,
  ms?: number,
): TraceStep {
  return { node, status, detail, model, ms };
}

function shouldUseLive(state: ThunderGraphState): boolean {
  return (
    !state.forceMock &&
    !shouldForceMock() &&
    hasFalKey() &&
    state.comments.length > 0
  );
}

export async function normalizeCommentsNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  const comments = normalizeComments(state.commentsText);
  return {
    comments,
    agentTrace: ["normalizeComments"],
    executionTrace: [
      trace("normalizeComments", "ok", `${comments.length} comments`),
    ],
  };
}

export async function audienceResearchNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (!shouldUseLive(state)) {
    return {
      mode: state.forceMock || shouldForceMock() ? "seeded_demo" : "recovery_fallback",
      agentTrace: ["audienceResearch → skip (no live path)"],
      executionTrace: [
        trace(
          "audienceResearch",
          "skip",
          state.forceMock || shouldForceMock()
            ? "seeded demo forced"
            : "FAL_KEY missing or no comments",
        ),
      ],
    };
  }

  const t0 = Date.now();
  try {
    const { data, model } = await runAudienceResearch({
      comments: state.comments,
      creatorContext: state.creatorContext,
      draftPost: state.draftPost,
    });
    return {
      segments: data.segments,
      mode: "live",
      modelsUsed: { audience: model },
      agentTrace: [`audienceResearch (${model})`],
      executionTrace: [
        trace("audienceResearch", "ok", "3 segments", model, Date.now() - t0),
      ],
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "audience failed";
    return {
      mode: "recovery_fallback",
      error: message,
      agentTrace: [`audienceResearch failed: ${message}`],
      executionTrace: [
        trace("audienceResearch", "error", message, undefined, Date.now() - t0),
      ],
    };
  }
}

export async function evidenceValidateNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (state.mode !== "live" || state.segments.length !== 3) {
    return {
      needsRetry: false,
      agentTrace: ["evidenceValidate skipped"],
      executionTrace: [trace("evidenceValidate", "skip")],
    };
  }

  const fakeCall1: Call1Output = {
    segments: state.segments,
    reactions: state.reactions.length === 3
      ? state.reactions
      : state.segments.map((s) => ({
          segmentName: s.name,
          understood: "pending",
          valued: "pending",
          challenged: "pending",
          missingInfo: "pending",
          likelyAction: "skeptical" as const,
          disagreementNote: "pending",
        })),
    factors: {
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
    },
    guardrails: [],
    strengths: ["pending"],
    weaknesses: ["pending"],
  };

  const { output, invalidIds, repaired } = repairCall1Evidence(
    fakeCall1,
    state.comments,
  );
  const valid = allEvidenceValid(output.segments, state.comments);
  const needsRetry = state.retries < 1 && invalidIds.length >= 4;

  return {
    segments: output.segments,
    needsRetry,
    retries: needsRetry ? state.retries + 1 : state.retries,
    agentTrace: [
      repaired || invalidIds.length > 0
        ? `evidenceValidate repaired invalid=[${invalidIds.join(",")}] valid=${valid}`
        : "evidenceValidate ok",
    ],
    executionTrace: [
      trace(
        "evidenceValidate",
        needsRetry ? "retry" : "ok",
        `invalid=${invalidIds.length} valid=${valid}`,
      ),
    ],
  };
}

async function jurorNode(
  state: ThunderGraphState,
  index: number,
): Promise<Partial<ThunderGraphState>> {
  const nodeName = `juror${index + 1}`;
  if (state.mode !== "live" || state.segments.length !== 3) {
    return {
      agentTrace: [`${nodeName} skipped`],
      executionTrace: [trace(nodeName, "skip")],
    };
  }

  const segment = state.segments[index];
  if (!segment) {
    return {
      executionTrace: [trace(nodeName, "error", "segment missing")],
    };
  }

  const t0 = Date.now();
  try {
    const { data, model } = await runJuror({
      comments: state.comments,
      creatorContext: state.creatorContext,
      draftPost: state.draftPost,
      segment,
      segmentIndex: index,
      allSegments: state.segments,
    });
    return {
      reactions: [data.reaction],
      modelsUsed: { juror: model },
      agentTrace: [`${nodeName} (${segment.name})`],
      executionTrace: [
        trace(nodeName, "ok", segment.name, model, Date.now() - t0),
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "juror failed";
    return {
      mode: "recovery_fallback",
      error: message,
      agentTrace: [`${nodeName} failed: ${message}`],
      executionTrace: [
        trace(nodeName, "error", message, undefined, Date.now() - t0),
      ],
    };
  }
}

export async function juror1Node(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  return jurorNode(state, 0);
}

export async function juror2Node(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  return jurorNode(state, 1);
}

export async function juror3Node(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  return jurorNode(state, 2);
}

export async function criticNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (state.mode !== "live" || state.segments.length !== 3) {
    return {
      agentTrace: ["critic skipped"],
      executionTrace: [trace("critic", "skip")],
    };
  }

  const reactions: Reaction[] = state.segments.map((seg) => {
    const found = state.reactions.find((r) => r.segmentName === seg.name);
    return (
      found ?? {
        segmentName: seg.name,
        understood: "Unclear",
        valued: "Topic relevance",
        challenged: "Missing specificity",
        missingInfo: "Concrete steps",
        likelyAction: "skeptical" as const,
        disagreementNote: "Incomplete jury response",
      }
    );
  });

  const t0 = Date.now();
  try {
    const { data, model } = await runCritic({
      comments: state.comments,
      creatorContext: state.creatorContext,
      draftPost: state.draftPost,
      segments: state.segments,
      reactions,
    });

    const call1: Call1Output = {
      segments: state.segments,
      reactions,
      factors: data.factors,
      guardrails: data.guardrails,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
    };

    const repaired = repairCall1Evidence(call1, state.comments).output;

    return {
      critic: data,
      call1: repaired,
      reactions,
      modelsUsed: { critic: model },
      agentTrace: [`critic (${model})`],
      executionTrace: [
        trace("critic", "ok", undefined, model, Date.now() - t0),
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "critic failed";
    return {
      mode: "recovery_fallback",
      error: message,
      agentTrace: [`critic failed: ${message}`],
      executionTrace: [
        trace("critic", "error", message, undefined, Date.now() - t0),
      ],
    };
  }
}

export async function originalScoringNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (!state.call1) {
    return {
      agentTrace: ["originalScoring skipped"],
      executionTrace: [trace("originalScoring", "skip")],
    };
  }
  const originalDiagnostics = computeDiagnostics(state.call1.factors);
  return {
    originalDiagnostics,
    agentTrace: ["originalScoring (deterministic TS)"],
    executionTrace: [
      trace(
        "originalScoring",
        "ok",
        `audienceFit=${originalDiagnostics.audienceFit}`,
      ),
    ],
  };
}

export async function strategyNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (state.mode !== "live" || !state.call1 || !state.originalDiagnostics) {
    return {
      agentTrace: ["strategy skipped"],
      executionTrace: [trace("strategy", "skip")],
    };
  }

  const t0 = Date.now();
  try {
    const { data, model } = await runStrategy({
      comments: state.comments,
      creatorContext: state.creatorContext,
      draftPost: state.draftPost,
      call1: state.call1,
      diagnostics: state.originalDiagnostics,
    });
    const repaired = repairCall2Evidence(data, state.comments);
    return {
      call2: repaired,
      modelsUsed: { strategy: model },
      agentTrace: [`strategy (${model})`],
      executionTrace: [
        trace("strategy", "ok", "carousel+voiceover", model, Date.now() - t0),
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "strategy failed";
    return {
      mode: "recovery_fallback",
      error: message,
      agentTrace: [`strategy failed: ${message}`],
      executionTrace: [
        trace("strategy", "error", message, undefined, Date.now() - t0),
      ],
    };
  }
}

export async function optimizedEvalNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (!state.call1 || !state.call2) {
    return {
      agentTrace: ["optimizedEval skipped"],
      executionTrace: [trace("optimizedEval", "skip")],
    };
  }
  const optimizedFactors = applyFactorDeltas(
    state.call1.factors,
    state.call2.optimizedFactorDeltas,
  );
  const optimizedDiagnostics = computeDiagnostics(optimizedFactors);
  return {
    optimizedDiagnostics,
    agentTrace: ["optimizedEval (deterministic TS)"],
    executionTrace: [
      trace(
        "optimizedEval",
        "ok",
        `audienceFit=${optimizedDiagnostics.audienceFit}`,
      ),
    ],
  };
}

export async function finalVerifyNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  const wantSeeded = state.forceMock || shouldForceMock();
  const liveOk =
    state.mode === "live" &&
    state.call1 &&
    state.call2 &&
    state.originalDiagnostics;

  if (!liveOk) {
    if (!isFallbackEnabled() && !wantSeeded) {
      throw new Error(
        state.error ??
          "Live analysis failed and THUNDER_ENABLE_FALLBACK is disabled",
      );
    }
    const mode = wantSeeded ? "seeded_demo" : "recovery_fallback";
    const result = getMockAnalyzeResult(
      {
        commentsText: state.commentsText,
        creatorContext: state.creatorContext,
        draftPost: state.draftPost,
        sourceUrl: state.sourceUrl,
      },
      mode,
    );
    return {
      mode,
      result: {
        ...result,
        meta: {
          ...result.meta,
          agentTrace: [
            ...state.agentTrace,
            `finalVerify → ${mode}`,
          ],
          executionTrace: [
            ...state.executionTrace,
            trace("finalVerify", "ok", mode),
          ],
          modelsUsed: state.modelsUsed,
        },
      },
      agentTrace: [`finalVerify ${mode}`],
      executionTrace: [trace("finalVerify", "ok", mode)],
    };
  }

  const result = buildAnalyzeResultFromParts({
    mode: "live",
    commentsText: state.commentsText,
    creatorContext: state.creatorContext,
    draftPost: state.draftPost,
    sourceUrl: state.sourceUrl,
    call1: state.call1!,
    call2: state.call2!,
    agentTrace: [...state.agentTrace, "finalVerify"],
    executionTrace: [
      ...state.executionTrace,
      trace("finalVerify", "ok", "live"),
    ],
    modelsUsed: state.modelsUsed,
  });

  return {
    result,
    agentTrace: ["finalVerify live"],
    executionTrace: [trace("finalVerify", "ok", "live")],
  };
}

export function routeAfterEvidence(
  state: ThunderGraphState,
): "audienceResearch" | "jurorFanout" {
  return state.needsRetry ? "audienceResearch" : "jurorFanout";
}

/** No-op join node after parallel jurors (LangGraph fan-in). */
export async function jurorFanoutNode(): Promise<Partial<ThunderGraphState>> {
  return {
    agentTrace: ["jurorFanout (parallel start)"],
    executionTrace: [trace("jurorFanout", "ok", "dispatch 3 jurors")],
  };
}
