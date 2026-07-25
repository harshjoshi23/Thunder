import { END, START, StateGraph } from "@langchain/langgraph";
import type { AnalyzeRequest, AnalyzeResult } from "@/lib/schemas";
import { getAnalyzeTimeoutMs, withTimeout } from "@/lib/timeouts";
import { getMockAnalyzeResult } from "@/lib/mock/seed-result";
import { hasOpenAIKey, shouldForceMock } from "@/lib/openai";
import {
  analyzeAudienceAndDraftNode,
  finalizeNode,
  normalizeCommentsNode,
  optimizeCarouselNode,
  routeAfterVerify,
  scoreDiagnosticsNode,
  verifyEvidenceNode,
} from "./nodes";
import { ThunderState } from "./state";

function buildGraph() {
  const graph = new StateGraph(ThunderState)
    .addNode("normalizeComments", normalizeCommentsNode)
    .addNode("analyzeAudienceAndDraft", analyzeAudienceAndDraftNode)
    .addNode("verifyEvidence", verifyEvidenceNode)
    .addNode("scoreDiagnostics", scoreDiagnosticsNode)
    .addNode("optimizeCarousel", optimizeCarouselNode)
    .addNode("finalize", finalizeNode)
    .addEdge(START, "normalizeComments")
    .addEdge("normalizeComments", "analyzeAudienceAndDraft")
    .addEdge("analyzeAudienceAndDraft", "verifyEvidence")
    .addConditionalEdges("verifyEvidence", routeAfterVerify, {
      analyzeAudienceAndDraft: "analyzeAudienceAndDraft",
      scoreDiagnostics: "scoreDiagnostics",
    })
    .addEdge("scoreDiagnostics", "optimizeCarousel")
    .addEdge("optimizeCarousel", "finalize")
    .addEdge("finalize", END);

  return graph.compile();
}

export async function runThunderAnalysis(
  request: AnalyzeRequest,
): Promise<AnalyzeResult> {
  if (request.forceMock || shouldForceMock() || !hasOpenAIKey()) {
    return getMockAnalyzeResult(request);
  }

  const app = buildGraph();
  const timeoutMs = getAnalyzeTimeoutMs();

  try {
    const finalState = await withTimeout(
      app.invoke({
        commentsText: request.commentsText,
        creatorContext: request.creatorContext,
        draftPost: request.draftPost,
        forceMock: Boolean(request.forceMock),
        comments: [],
        call1: null,
        call2: null,
        originalDiagnostics: null,
        result: null,
        mode: "live",
        retries: 0,
        needsRetry: false,
        agentTrace: [],
        error: null,
      }),
      timeoutMs,
      "Thunder LangGraph analysis",
    );

    if (finalState.result) {
      return finalState.result;
    }

    return getMockAnalyzeResult(request);
  } catch {
    return getMockAnalyzeResult(request);
  }
}
