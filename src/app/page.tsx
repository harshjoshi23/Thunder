"use client";

import { useMemo, useState } from "react";
import type { AnalyzeResult } from "@/lib/schemas";
import { AnalyzeResultSchema } from "@/lib/schemas";
import { SEED_INPUT } from "@/lib/mock/seed-input";
import { StageNav } from "@/components/shell/StageNav";
import { ModeBadge } from "@/components/shell/ModeBadge";
import { ThunderMark } from "@/components/shell/ThunderMark";
import { Button } from "@/components/ui/button";
import { LoadingOrchestra } from "@/components/shared/LoadingOrchestra";
import { AudienceDataStage } from "@/components/stages/AudienceDataStage";
import { AudienceTwinStage } from "@/components/stages/AudienceTwinStage";
import { ReactionLabStage } from "@/components/stages/ReactionLabStage";
import { DiagnosticsStage } from "@/components/stages/DiagnosticsStage";
import { CarouselStage } from "@/components/stages/CarouselStage";
import { BeforeAfterStage } from "@/components/stages/BeforeAfterStage";

export default function HomePage() {
  const [commentsText, setCommentsText] = useState<string>(
    SEED_INPUT.commentsText,
  );
  const [creatorContext, setCreatorContext] = useState<string>(
    SEED_INPUT.creatorContext,
  );
  const [draftPost, setDraftPost] = useState<string>(SEED_INPUT.draftPost);
  const [stage, setStage] = useState(1);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const unlockedThrough = useMemo(() => {
    if (running) return 1;
    if (result) return 6;
    return 1;
  }, [running, result]);

  function loadSeed() {
    setCommentsText(SEED_INPUT.commentsText);
    setCreatorContext(SEED_INPUT.creatorContext);
    setDraftPost(SEED_INPUT.draftPost);
    setError(null);
  }

  function resetDemo() {
    loadSeed();
    setResult(null);
    setStage(1);
    setError(null);
    setRunning(false);
  }

  async function runAnalysis() {
    setRunning(true);
    setError(null);
    setStage(1);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentsText,
          creatorContext,
          draftPost,
        }),
      });
      const json: unknown = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof json === "object" &&
            json &&
            "error" in json &&
            typeof (json as { error: unknown }).error === "string"
            ? (json as { error: string }).error
            : "Analysis failed",
        );
      }
      const parsed = AnalyzeResultSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error("Response failed schema validation");
      }
      setResult(parsed.data);
      setStage(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-wash" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.35]" aria-hidden />

      <header className="relative border-b border-ink/10 bg-paper/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-6 md:px-6">
          <div className="flex items-start gap-3 md:gap-4">
            <ThunderMark size={52} className="mt-1 shadow-sm ring-1 ring-ink/10" />
            <div>
              <p className="font-display text-4xl tracking-tight text-ink md:text-5xl">
                Thunder
              </p>
              <p className="mt-1 max-w-xl text-sm text-ink/65 md:text-base">
                Test your post before your audience does.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ModeBadge mode={result?.mode} confidence={result?.confidence} />
            <Button type="button" variant="ghost" size="sm" onClick={resetDemo}>
              Reset demo
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
        <StageNav
          active={stage}
          unlockedThrough={unlockedThrough}
          onSelect={setStage}
        />

        {error ? (
          <div
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {running ? <LoadingOrchestra /> : null}

        {!running && stage === 1 ? (
          <AudienceDataStage
            commentsText={commentsText}
            creatorContext={creatorContext}
            draftPost={draftPost}
            onChange={(field, value) => {
              if (field === "commentsText") setCommentsText(value);
              if (field === "creatorContext") setCreatorContext(value);
              if (field === "draftPost") setDraftPost(value);
            }}
            onLoadSeed={loadSeed}
            onRun={runAnalysis}
            running={running}
          />
        ) : null}

        {!running && result && stage === 2 ? (
          <AudienceTwinStage result={result} />
        ) : null}
        {!running && result && stage === 3 ? (
          <ReactionLabStage result={result} />
        ) : null}
        {!running && result && stage === 4 ? (
          <DiagnosticsStage result={result} />
        ) : null}
        {!running && result && stage === 5 ? (
          <CarouselStage result={result} />
        ) : null}
        {!running && result && stage === 6 ? (
          <BeforeAfterStage result={result} />
        ) : null}

        {!running && !result && stage !== 1 ? (
          <p className="text-sm text-ink/55">
            Run an audience test to unlock later stages.
          </p>
        ) : null}

        <footer className="border-t border-ink/10 pt-6 text-xs text-ink/45">
          Thunder runs a grounded scenario simulation based on patterns in the
          creator’s supplied audience data. It does not predict real humans
          perfectly, guarantee virality, or produce scientific view forecasts.
        </footer>
      </main>
    </div>
  );
}
