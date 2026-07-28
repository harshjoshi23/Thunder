import { END, START, StateGraph } from "@langchain/langgraph";
import type { AnalyzeRequest, AnalyzeResult, RunMode } from "@/lib/schemas";
import { getAnalyzeTimeoutMs, withTimeout } from "@/lib/timeouts";
import { getMockAnalyzeResult } from "@/lib/mock/seed-result";
import { isFallbackEnabled, shouldForceMock } from "@/lib/fal/config";
import { hasLiveLanguageKey } from "@/lib/llm/config";
import { evidencePackToPipelineInput } from "@/lib/evidence-pack";
import {
  audienceResearchNode,
  criticNode,
  evidenceValidateNode,
  finalVerifyNode,
  juror1Node,
  juror2Node,
  juror3Node,
  jurorFanoutNode,
  normalizeCommentsNode,
  optimizedEvalNode,
  originalScoringNode,
  routeAfterEvidence,
  strategyNode,
} from "./nodes";
import { ThunderState } from "./state";

function resolveRequest(request: AnalyzeRequest): {
  commentsText: string;
  creatorContext: string;
  draftPost: string;
  sourceUrl?: string;
  preferredMode: RunMode | null;
} {
  if (request.evidencePack) {
    const mapped = evidencePackToPipelineInput(request.evidencePack);
    return {
      commentsText: request.commentsText?.trim() || mapped.commentsText,
      creatorContext:
        request.creatorContext?.trim() || mapped.suggestedCreatorContext,
      draftPost: request.draftPost,
      sourceUrl: request.sourceUrl || mapped.sourceUrl,
      preferredMode: mapped.preferredRunMode,
    };
  }
  return {
    commentsText: request.commentsText?.trim() ?? "",
    creatorContext: request.creatorContext?.trim() ?? "",
    draftPost: request.draftPost,
    sourceUrl: request.sourceUrl || undefined,
    preferredMode: null,
  };
}

function buildGraph() {
  const graph = new StateGraph(ThunderState)
    .addNode("normalizeComments", normalizeCommentsNode)
    .addNode("audienceResearch", audienceResearchNode)
    .addNode("evidenceValidate", evidenceValidateNode)
    .addNode("jurorFanout", jurorFanoutNode)
    .addNode("juror1", juror1Node)
    .addNode("juror2", juror2Node)
    .addNode("juror3", juror3Node)
    .addNode("criticPass", criticNode)
    .addNode("originalScoring", originalScoringNode)
    .addNode("strategy", strategyNode)
    .addNode("optimizedEval", optimizedEvalNode)
    .addNode("finalVerify", finalVerifyNode)
    .addEdge(START, "normalizeComments")
    .addEdge("normalizeComments", "audienceResearch")
    .addEdge("audienceResearch", "evidenceValidate")
    .addConditionalEdges("evidenceValidate", routeAfterEvidence, {
      audienceResearch: "audienceResearch",
      jurorFanout: "jurorFanout",
    })
    .addEdge("jurorFanout", "juror1")
    .addEdge("jurorFanout", "juror2")
    .addEdge("jurorFanout", "juror3")
    .addEdge("juror1", "criticPass")
    .addEdge("juror2", "criticPass")
    .addEdge("juror3", "criticPass")
    .addEdge("criticPass", "originalScoring")
    .addEdge("originalScoring", "strategy")
    .addEdge("strategy", "optimizedEval")
    .addEdge("optimizedEval", "finalVerify")
    .addEdge("finalVerify", END);

  return graph.compile();
}

function applyPreferredMode(
  result: AnalyzeResult,
  preferred: RunMode | null,
): AnalyzeResult {
  if (!preferred) return result;
  if (result.mode === "recovery_fallback" || result.mode === "seeded_demo") {
    return result;
  }
  if (preferred === "imported" || preferred === "live") {
    return { ...result, mode: preferred };
  }
  return result;
}

export async function runThunderAnalysis(
  request: AnalyzeRequest,
): Promise<AnalyzeResult> {
  const resolved = resolveRequest(request);
  if (!resolved.commentsText.trim()) {
    throw new Error("No comments available after resolving evidencePack");
  }
  if (!resolved.creatorContext.trim()) {
    throw new Error("creatorContext is required");
  }

  const forceSeeded =
    Boolean(request.forceMock) ||
    Boolean(request.forceSeededDemo) ||
    shouldForceMock() ||
    resolved.preferredMode === "seeded_demo";

  if (forceSeeded) {
    return getMockAnalyzeResult(
      {
        commentsText: resolved.commentsText,
        creatorContext: resolved.creatorContext,
        draftPost: resolved.draftPost,
        sourceUrl: resolved.sourceUrl,
      },
      "seeded_demo",
    );
  }

  if (!hasLiveLanguageKey()) {
    if (!isFallbackEnabled()) {
      throw new Error(
        "OPENAI_API_KEY or FAL_KEY is required for live analysis (or set THUNDER_ENABLE_FALLBACK=true)",
      );
    }
    return getMockAnalyzeResult(
      {
        commentsText: resolved.commentsText,
        creatorContext: resolved.creatorContext,
        draftPost: resolved.draftPost,
        sourceUrl: resolved.sourceUrl,
      },
      "recovery_fallback",
    );
  }

  if (resolved.preferredMode === "recovery_fallback") {
    return getMockAnalyzeResult(
      {
        commentsText: resolved.commentsText,
        creatorContext: resolved.creatorContext,
        draftPost: resolved.draftPost,
        sourceUrl: resolved.sourceUrl,
      },
      "recovery_fallback",
    );
  }

  const app = buildGraph();
  const timeoutMs = getAnalyzeTimeoutMs();
  const initialMode: RunMode =
    resolved.preferredMode === "imported" ? "imported" : "live";

  try {
    const finalState = await withTimeout(
      app.invoke({
        commentsText: resolved.commentsText,
        creatorContext: resolved.creatorContext,
        draftPost: resolved.draftPost,
        sourceUrl: resolved.sourceUrl,
        forceMock: false,
        comments: [],
        segments: [],
        reactions: [],
        critic: null,
        call1: null,
        call2: null,
        originalDiagnostics: null,
        optimizedDiagnostics: null,
        result: null,
        mode: initialMode,
        retries: 0,
        needsRetry: false,
        agentTrace: [],
        executionTrace: [],
        modelsUsed: {},
        error: null,
      }),
      timeoutMs,
      "Thunder LangGraph analysis",
    );

    if (finalState.result) {
      return applyPreferredMode(finalState.result, resolved.preferredMode);
    }

    if (!isFallbackEnabled()) {
      throw new Error("Analysis produced no result");
    }
    return getMockAnalyzeResult(
      {
        commentsText: resolved.commentsText,
        creatorContext: resolved.creatorContext,
        draftPost: resolved.draftPost,
        sourceUrl: resolved.sourceUrl,
      },
      "recovery_fallback",
    );
  } catch (err) {
    if (!isFallbackEnabled()) {
      throw err;
    }
    const result = getMockAnalyzeResult(
      {
        commentsText: resolved.commentsText,
        creatorContext: resolved.creatorContext,
        draftPost: resolved.draftPost,
        sourceUrl: resolved.sourceUrl,
      },
      "recovery_fallback",
    );
    const message = err instanceof Error ? err.message : "pipeline error";
    return {
      ...result,
      meta: {
        ...result.meta,
        agentTrace: [
          ...result.meta.agentTrace,
          `recovery after error: ${message}`,
        ],
        executionTrace: [
          ...(result.meta.executionTrace ?? []),
          {
            node: "runThunderAnalysis",
            status: "error" as const,
            detail: message,
          },
        ],
      },
    };
  }
}
