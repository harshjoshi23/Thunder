import { END, START, StateGraph } from "@langchain/langgraph";
import type { AnalyzeRequest, AnalyzeResult } from "@/lib/schemas";
import { getAnalyzeTimeoutMs, withTimeout } from "@/lib/timeouts";
import { getMockAnalyzeResult } from "@/lib/mock/seed-result";
import {
  hasFalKey,
  isFallbackEnabled,
  shouldForceMock,
} from "@/lib/fal/config";
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

function buildGraph() {
  const graph = new StateGraph(ThunderState)
    .addNode("normalizeComments", normalizeCommentsNode)
    .addNode("audienceResearch", audienceResearchNode)
    .addNode("evidenceValidate", evidenceValidateNode)
    .addNode("jurorFanout", jurorFanoutNode)
    .addNode("juror1", juror1Node)
    .addNode("juror2", juror2Node)
    .addNode("juror3", juror3Node)
    .addNode("critic", criticNode)
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
    // Fan-out: three parallel jurors
    .addEdge("jurorFanout", "juror1")
    .addEdge("jurorFanout", "juror2")
    .addEdge("jurorFanout", "juror3")
    // Fan-in: critic waits for all three
    .addEdge("juror1", "critic")
    .addEdge("juror2", "critic")
    .addEdge("juror3", "critic")
    .addEdge("critic", "originalScoring")
    .addEdge("originalScoring", "strategy")
    .addEdge("strategy", "optimizedEval")
    .addEdge("optimizedEval", "finalVerify")
    .addEdge("finalVerify", END);

  return graph.compile();
}

export async function runThunderAnalysis(
  request: AnalyzeRequest,
): Promise<AnalyzeResult> {
  const forceSeeded =
    Boolean(request.forceMock) ||
    Boolean(request.forceSeededDemo) ||
    shouldForceMock();

  if (forceSeeded) {
    return getMockAnalyzeResult(
      {
        commentsText: request.commentsText,
        creatorContext: request.creatorContext,
        draftPost: request.draftPost,
        sourceUrl: request.sourceUrl || undefined,
      },
      "seeded_demo",
    );
  }

  if (!hasFalKey()) {
    if (!isFallbackEnabled()) {
      throw new Error(
        "FAL_KEY is required for live analysis (or set THUNDER_ENABLE_FALLBACK=true)",
      );
    }
    return getMockAnalyzeResult(
      {
        commentsText: request.commentsText,
        creatorContext: request.creatorContext,
        draftPost: request.draftPost,
        sourceUrl: request.sourceUrl || undefined,
      },
      "recovery_fallback",
    );
  }

  const app = buildGraph();
  const timeoutMs = getAnalyzeTimeoutMs();

  try {
    const finalState = await withTimeout(
      app.invoke({
        commentsText: request.commentsText,
        creatorContext: request.creatorContext,
        draftPost: request.draftPost,
        sourceUrl: request.sourceUrl || undefined,
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
        mode: "live",
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
      return finalState.result;
    }

    if (!isFallbackEnabled()) {
      throw new Error("Analysis produced no result");
    }
    return getMockAnalyzeResult(
      {
        commentsText: request.commentsText,
        creatorContext: request.creatorContext,
        draftPost: request.draftPost,
        sourceUrl: request.sourceUrl || undefined,
      },
      "recovery_fallback",
    );
  } catch (err) {
    if (!isFallbackEnabled()) {
      throw err;
    }
    const result = getMockAnalyzeResult(
      {
        commentsText: request.commentsText,
        creatorContext: request.creatorContext,
        draftPost: request.draftPost,
        sourceUrl: request.sourceUrl || undefined,
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
