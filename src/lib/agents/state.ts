import { Annotation } from "@langchain/langgraph";
import type {
  AnalyzeResult,
  Call1Output,
  Call2Output,
  Comment,
  CriticOutput,
  Diagnostics,
  Reaction,
  RunMode,
  Segment,
  TraceStep,
} from "@/lib/schemas";

export const ThunderState = Annotation.Root({
  commentsText: Annotation<string>,
  creatorContext: Annotation<string>,
  draftPost: Annotation<string>,
  sourceUrl: Annotation<string | undefined>,
  forceMock: Annotation<boolean>,
  comments: Annotation<Comment[]>,
  segments: Annotation<Segment[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  reactions: Annotation<Reaction[]>({
    reducer: (left, right) => {
      const map = new Map<string, Reaction>();
      for (const r of left) map.set(r.segmentName, r);
      for (const r of right) map.set(r.segmentName, r);
      return Array.from(map.values());
    },
    default: () => [],
  }),
  critic: Annotation<CriticOutput | null>,
  call1: Annotation<Call1Output | null>,
  call2: Annotation<Call2Output | null>,
  originalDiagnostics: Annotation<Diagnostics | null>,
  optimizedDiagnostics: Annotation<Diagnostics | null>,
  result: Annotation<AnalyzeResult | null>,
  mode: Annotation<RunMode>,
  retries: Annotation<number>,
  needsRetry: Annotation<boolean>,
  agentTrace: Annotation<string[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),
  executionTrace: Annotation<TraceStep[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),
  modelsUsed: Annotation<{
    audience?: string;
    juror?: string;
    critic?: string;
    strategy?: string;
  }>({
    reducer: (left, right) => ({ ...left, ...right }),
    default: () => ({}),
  }),
  error: Annotation<string | null>,
});

export type ThunderGraphState = typeof ThunderState.State;
