"use client";

import type { AnalyzeResult, TraceStep } from "@/lib/schemas";

const DEFAULT_STEPS = [
  "normalizeComments",
  "audienceResearch",
  "evidenceValidate",
  "juror1 / juror2 / juror3",
  "critic",
  "originalScoring",
  "strategy",
  "optimizedEval",
  "finalVerify",
];

export function LoadingOrchestra({
  trace,
}: {
  trace?: TraceStep[] | string[] | null;
}) {
  const steps =
    trace && trace.length > 0
      ? trace.map((t) =>
          typeof t === "string"
            ? t
            : `${t.node}${t.status !== "ok" ? ` (${t.status})` : ""}${t.detail ? `: ${t.detail}` : ""}`,
        )
      : DEFAULT_STEPS;

  return (
    <div className="animate-fade-in rounded-xl border border-ink/10 bg-white/60 p-6 shadow-sm">
      <p className="font-display text-xl text-ink">Running audience test</p>
      <p className="mt-1 text-sm text-ink/60">
        Multi-agent scenario graph in progress. This is a grounded simulation —
        not a view predictor.
      </p>
      <ul className="mt-6 space-y-3">
        {steps.map((step, i) => (
          <li
            key={`${step}-${i}`}
            className="flex items-center gap-3 text-sm text-ink/75"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-700" />
            {step}
          </li>
        ))}
      </ul>
      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full w-1/2 animate-progress rounded-full bg-teal-700" />
      </div>
    </div>
  );
}

export function TechnicalCredibilityPanel({
  result,
}: {
  result: AnalyzeResult;
}) {
  const models = result.meta.modelsUsed;
  const trace = result.meta.executionTrace ?? [];

  return (
    <div className="rounded-xl border border-ink/10 bg-white/55 p-4">
      <h3 className="font-medium text-ink">Technical credibility</h3>
      <p className="mt-1 text-xs text-ink/55">
        Mode is labeled honestly. Live means fal.ai returned validated JSON.
        Seeded demo / recovery fallback never pretend to be live.
      </p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink/50">Mode</dt>
          <dd className="font-medium text-ink">{result.mode}</dd>
        </div>
        <div>
          <dt className="text-ink/50">Confidence</dt>
          <dd className="font-medium text-ink">{result.confidence}</dd>
        </div>
        {models?.audience ? (
          <div>
            <dt className="text-ink/50">Audience model</dt>
            <dd className="font-mono text-xs text-ink">{models.audience}</dd>
          </div>
        ) : null}
        {models?.juror ? (
          <div>
            <dt className="text-ink/50">Juror model</dt>
            <dd className="font-mono text-xs text-ink">{models.juror}</dd>
          </div>
        ) : null}
        {models?.critic ? (
          <div>
            <dt className="text-ink/50">Critic model</dt>
            <dd className="font-mono text-xs text-ink">{models.critic}</dd>
          </div>
        ) : null}
        {models?.strategy ? (
          <div>
            <dt className="text-ink/50">Strategy model</dt>
            <dd className="font-mono text-xs text-ink">{models.strategy}</dd>
          </div>
        ) : null}
      </dl>
      {trace.length > 0 ? (
        <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] text-ink/60">
          {trace.map((t, i) => (
            <li key={`${t.node}-${i}`}>
              [{t.status}] {t.node}
              {t.model ? ` · ${t.model}` : ""}
              {t.ms != null ? ` · ${t.ms}ms` : ""}
              {t.detail ? ` — ${t.detail}` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-3 space-y-1 font-mono text-[11px] text-ink/60">
          {result.meta.agentTrace.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
