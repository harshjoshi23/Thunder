"use client";

const STEPS = [
  "Audience Research Agent reading comments…",
  "Scenario Simulation Agent running jury…",
  "Adversarial Critic checking guardrails…",
  "Deterministic scoring engine…",
  "Content Strategy Agent drafting carousel…",
];

export function LoadingOrchestra() {
  return (
    <div className="animate-fade-in rounded-xl border border-ink/10 bg-white/60 p-6 shadow-sm">
      <p className="font-display text-xl text-ink">Running audience test</p>
      <p className="mt-1 text-sm text-ink/60">
        Multi-agent scenario graph in progress. This is a grounded simulation —
        not a view predictor.
      </p>
      <ul className="mt-6 space-y-3">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className="flex items-center gap-3 text-sm text-ink/75"
            style={{ animationDelay: `${i * 120}ms` }}
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
