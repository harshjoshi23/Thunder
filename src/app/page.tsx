"use client";

import { useMemo, useState } from "react";
import type { AnalyzeResult } from "@/lib/schemas";
import { AnalyzeResultSchema } from "@/lib/schemas";
import { SEED_INPUT } from "@/lib/mock/seed-input";
import { StageNav } from "@/components/shell/StageNav";
import { ModeBadge } from "@/components/shell/ModeBadge";
import { ThunderMark } from "@/components/shell/ThunderMark";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
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
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceMsg, setSourceMsg] = useState<string | null>(null);
  const [fetchingSource, setFetchingSource] = useState(false);
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
    setSourceUrl("");
    setSourceMsg(null);
    setError(null);
  }

  function resetDemo() {
    loadSeed();
    setResult(null);
    setStage(1);
    setError(null);
    setRunning(false);
  }

  async function fetchSource() {
    setFetchingSource(true);
    setSourceMsg(null);
    try {
      const res = await fetch("/api/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        markdown?: string;
        message?: string;
        mode?: string;
      };
      setSourceMsg(data.message ?? null);
      if (data.markdown?.trim()) {
        const lines = data.markdown
          .split("\n")
          .map((l) => l.replace(/^[-*•]\s*/, "").trim())
          .filter((l) => l.length > 20 && l.length < 280)
          .slice(0, 20);
        if (lines.length >= 3) {
          setCommentsText(lines.join("\n"));
        } else {
          setCommentsText(data.markdown.slice(0, 8000));
        }
      }
    } catch {
      setSourceMsg("Source fetch failed — paste comments manually.");
    } finally {
      setFetchingSource(false);
    }
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
          sourceUrl: sourceUrl.trim() || undefined,
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
      <div
        className="pointer-events-none absolute inset-0 bg-grain opacity-[0.28] dark:opacity-[0.2]"
        aria-hidden
      />

      <header className="relative border-b border-border bg-elevated/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-5 md:px-6 md:py-6">
          <div className="flex items-start gap-3 md:gap-4">
            <ThunderMark size={52} className="mt-1 ring-1 ring-border" />
            <div>
              <p
                className="font-display text-4xl tracking-tight text-primary md:text-5xl"
                data-testid="brand-title"
              >
                Thunder
              </p>
              <p className="mt-1 max-w-xl text-sm text-secondary md:text-base">
                Test your post before your audience does.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ModeBadge mode={result?.mode} confidence={result?.confidence} />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={resetDemo}>
              Reset demo
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl space-y-7 px-4 py-7 md:px-6 md:py-8">
        <StageNav
          active={stage}
          unlockedThrough={unlockedThrough}
          onSelect={setStage}
        />

        {error ? (
          <div
            className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical"
            role="alert"
            data-testid="error-banner"
          >
            {error}
          </div>
        ) : null}

        {running ? (
          <div data-testid="stage-running">
            <LoadingOrchestra trace={result?.meta.executionTrace} />
          </div>
        ) : null}

        {!running && stage === 1 ? (
          <AudienceDataStage
            commentsText={commentsText}
            creatorContext={creatorContext}
            draftPost={draftPost}
            sourceUrl={sourceUrl}
            onChange={(field, value) => {
              if (field === "commentsText") setCommentsText(value);
              if (field === "creatorContext") setCreatorContext(value);
              if (field === "draftPost") setDraftPost(value);
              if (field === "sourceUrl") setSourceUrl(value);
            }}
            onLoadSeed={loadSeed}
            onRun={runAnalysis}
            onFetchSource={fetchSource}
            running={running}
            fetchingSource={fetchingSource}
            sourceMsg={sourceMsg}
          />
        ) : null}

        {!running && result && stage === 2 ? (
          <div data-testid="stage-twin">
            <AudienceTwinStage result={result} />
          </div>
        ) : null}
        {!running && result && stage === 3 ? (
          <div data-testid="stage-jury">
            <ReactionLabStage result={result} />
          </div>
        ) : null}
        {!running && result && stage === 4 ? (
          <div data-testid="stage-diagnostics">
            <DiagnosticsStage result={result} />
          </div>
        ) : null}
        {!running && result && stage === 5 ? (
          <div data-testid="stage-carousel">
            <CarouselStage result={result} />
          </div>
        ) : null}
        {!running && result && stage === 6 ? (
          <div data-testid="stage-before-after">
            <BeforeAfterStage result={result} />
          </div>
        ) : null}

        <footer className="border-t border-border pt-6 text-xs text-muted">
          Thunder runs a grounded scenario simulation based on patterns in the
          creator’s supplied audience data. It does not predict real humans
          perfectly, guarantee virality, or produce scientific view forecasts.
          Modes are labeled Live / Seeded demo / Recovery fallback — never
          silently faked as live.
        </footer>
      </main>
    </div>
  );
}
