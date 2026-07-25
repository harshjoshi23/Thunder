import { Annotation } from "@langchain/langgraph";
import type {
  AnalyzeResult,
  Call1Output,
  Call2Output,
  Comment,
  Diagnostics,
} from "@/lib/schemas";

export const ThunderState = Annotation.Root({
  commentsText: Annotation<string>,
  creatorContext: Annotation<string>,
  draftPost: Annotation<string>,
  forceMock: Annotation<boolean>,
  comments: Annotation<Comment[]>,
  call1: Annotation<Call1Output | null>,
  call2: Annotation<Call2Output | null>,
  originalDiagnostics: Annotation<Diagnostics | null>,
  result: Annotation<AnalyzeResult | null>,
  mode: Annotation<"live" | "fallback">,
  retries: Annotation<number>,
  needsRetry: Annotation<boolean>,
  agentTrace: Annotation<string[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),
  error: Annotation<string | null>,
});

export type ThunderGraphState = typeof ThunderState.State;
