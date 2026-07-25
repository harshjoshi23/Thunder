import { normalizeComments } from "@/lib/evidence/normalize";
import {
  allEvidenceValid,
  repairCall1Evidence,
  repairCall2Evidence,
} from "@/lib/evidence/validate";
import { computeDiagnostics } from "@/lib/scoring/formulas";
import { getMockAnalyzeResult, buildAnalyzeResultFromParts } from "@/lib/mock/seed-result";
import { hasOpenAIKey, shouldForceMock } from "@/lib/openai";
import { runCall1 } from "./call1";
import { runCall2 } from "./call2";
import type { ThunderGraphState } from "./state";

export async function normalizeCommentsNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  const comments = normalizeComments(state.commentsText);
  return {
    comments,
    agentTrace: ["normalizeComments"],
  };
}

export async function analyzeAudienceAndDraftNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (
    state.forceMock ||
    shouldForceMock() ||
    !hasOpenAIKey() ||
    state.comments.length === 0
  ) {
    return {
      mode: "fallback",
      needsRetry: false,
      agentTrace: ["analyzeAudienceAndDraft → skip to mock"],
    };
  }

  try {
    const call1 = await runCall1({
      comments: state.comments,
      creatorContext: state.creatorContext,
      draftPost: state.draftPost,
      repairHint:
        state.retries > 0
          ? "Previous output used invalid evidence IDs. Use only provided Cxx IDs."
          : undefined,
    });
    return {
      call1,
      mode: "live",
      agentTrace: ["analyzeAudienceAndDraft (LLM Call 1)"],
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Call1 failed";
    return {
      mode: "fallback",
      error: message,
      agentTrace: [`analyzeAudienceAndDraft failed: ${message}`],
    };
  }
}

export async function verifyEvidenceNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (state.mode === "fallback" || !state.call1) {
    return { needsRetry: false, agentTrace: ["verifyEvidence skipped"] };
  }

  const { output, invalidIds, repaired } = repairCall1Evidence(
    state.call1,
    state.comments,
  );

  const valid = allEvidenceValid(output.segments, state.comments);
  // One bounded retry only when fabrication was severe before repair
  const needsRetry = state.retries < 1 && invalidIds.length >= 4;

  return {
    call1: output,
    needsRetry,
    retries: needsRetry ? state.retries + 1 : state.retries,
    agentTrace: [
      repaired || invalidIds.length > 0
        ? `verifyEvidence repaired invalid=[${invalidIds.join(",")}] valid=${valid}`
        : "verifyEvidence ok",
    ],
  };
}

export async function scoreDiagnosticsNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (!state.call1) {
    return { agentTrace: ["scoreDiagnostics skipped"] };
  }
  const originalDiagnostics = computeDiagnostics(state.call1.factors);
  return {
    originalDiagnostics,
    agentTrace: ["scoreDiagnostics (deterministic)"],
  };
}

export async function optimizeCarouselNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (state.mode === "fallback" || !state.call1 || !state.originalDiagnostics) {
    return { agentTrace: ["optimizeCarousel skipped (fallback path)"] };
  }

  try {
    const call2 = await runCall2({
      comments: state.comments,
      creatorContext: state.creatorContext,
      draftPost: state.draftPost,
      call1: state.call1,
      diagnostics: state.originalDiagnostics,
    });
    const repaired = repairCall2Evidence(call2, state.comments);
    return {
      call2: repaired,
      agentTrace: ["optimizeCarousel (LLM Call 2)"],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Call2 failed";
    return {
      mode: "fallback",
      error: message,
      agentTrace: [`optimizeCarousel failed: ${message}`],
    };
  }
}

export async function finalizeNode(
  state: ThunderGraphState,
): Promise<Partial<ThunderGraphState>> {
  if (
    state.mode === "fallback" ||
    !state.call1 ||
    !state.call2 ||
    !state.originalDiagnostics
  ) {
    const result = getMockAnalyzeResult({
      commentsText: state.commentsText,
      creatorContext: state.creatorContext,
      draftPost: state.draftPost,
    });
    return {
      mode: "fallback",
      result: {
        ...result,
        meta: {
          ...result.meta,
          agentTrace: [...state.agentTrace, "finalize → mockFallback"],
        },
      },
      agentTrace: ["finalize mock"],
    };
  }

  const result = buildAnalyzeResultFromParts({
    mode: "live",
    commentsText: state.commentsText,
    creatorContext: state.creatorContext,
    draftPost: state.draftPost,
    call1: state.call1,
    call2: state.call2,
    agentTrace: [...state.agentTrace, "finalize"],
  });

  return {
    result,
    agentTrace: ["finalize live"],
  };
}

export function routeAfterVerify(
  state: ThunderGraphState,
): "analyzeAudienceAndDraft" | "scoreDiagnostics" {
  return state.needsRetry ? "analyzeAudienceAndDraft" : "scoreDiagnostics";
}
