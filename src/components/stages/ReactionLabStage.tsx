"use client";

import type { AnalyzeResult } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";

const ACTION_TONE: Record<
  AnalyzeResult["reactions"][number]["likelyAction"],
  "teal" | "amber" | "danger" | "neutral" | "success"
> = {
  save: "success",
  comment: "teal",
  share: "teal",
  skip: "neutral",
  skeptical: "amber",
};

function thunderboltLine(result: AnalyzeResult): string {
  const skips = result.reactions.filter((r) => r.likelyAction === "skip").length;
  const skeptical = result.reactions.filter(
    (r) => r.likelyAction === "skeptical",
  ).length;
  const risk = result.originalDiagnostics.misinterpretationRisk;
  if (risk >= 70) {
    return "Your draft walks into the room yelling. Two segments already have their arms crossed.";
  }
  if (skips + skeptical >= 2) {
    return "The jury is split. Publish this raw and you’re choosing drama over clarity.";
  }
  return "Not bad — but one segment still wants receipts. Tighten the claim before you ship.";
}

export function ReactionLabStage({ result }: { result: AnalyzeResult }) {
  return (
    <section className="animate-fade-in space-y-6">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
          Reaction Lab
        </h2>
        <p className="mt-2 text-ink/65">
          Audience jury simulation. Disagreement is a feature — conflicting
          segment needs surface trade-offs before you publish.
        </p>
      </div>

      <div className="rounded-xl border border-amber-600/20 bg-amber-500/10 p-4 text-sm text-amber-950">
        <p className="font-medium">Visible disagreement</p>
        <p className="mt-1 text-amber-950/80">
          {result.reactions.map((r) => r.disagreementNote).join(" · ")}
        </p>
      </div>

      <div className="rounded-xl border border-teal-800/15 bg-ink px-4 py-3 text-sm text-paper shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-teal-300">
          Thunderbolt
        </p>
        <p className="mt-1 text-paper/90">
          {thunderboltLine(result)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {result.reactions.map((reaction) => (
          <article
            key={reaction.segmentName}
            className="rounded-xl border border-ink/10 bg-white/55 p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl text-ink">
                {reaction.segmentName}
              </h3>
              <Badge tone={ACTION_TONE[reaction.likelyAction]}>
                Likely: {reaction.likelyAction}
              </Badge>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-ink">Understood</dt>
                <dd className="text-ink/70">{reaction.understood}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Valued</dt>
                <dd className="text-ink/70">{reaction.valued}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Challenged</dt>
                <dd className="text-ink/70">{reaction.challenged}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Missing</dt>
                <dd className="text-ink/70">{reaction.missingInfo}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
