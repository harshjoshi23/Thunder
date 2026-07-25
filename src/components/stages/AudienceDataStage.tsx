"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SEED_INPUT } from "@/lib/mock/seed-input";

const STEPS = [
  {
    n: "1",
    title: "Comments",
    body: "Paste historical audience comments (one per line).",
  },
  {
    n: "2",
    title: "Context",
    body: "Describe who you are and what this post is for.",
  },
  {
    n: "3",
    title: "Draft",
    body: "Paste the draft post or carousel outline to stress-test.",
  },
  {
    n: "4",
    title: "Optional source",
    body: "Fetch a URL only if Firecrawl is configured — otherwise paste manually.",
  },
] as const;

export function AudienceDataStage({
  commentsText,
  creatorContext,
  draftPost,
  sourceUrl,
  onChange,
  onLoadSeed,
  onRun,
  onFetchSource,
  running,
  fetchingSource,
  sourceMsg,
}: {
  commentsText: string;
  creatorContext: string;
  draftPost: string;
  sourceUrl: string;
  onChange: (
    field: "commentsText" | "creatorContext" | "draftPost" | "sourceUrl",
    value: string,
  ) => void;
  onLoadSeed: () => void;
  onRun: () => void;
  onFetchSource: () => void;
  running: boolean;
  fetchingSource: boolean;
  sourceMsg: string | null;
}) {
  const canRun =
    commentsText.trim().length > 20 &&
    creatorContext.trim().length > 5 &&
    draftPost.trim().length > 10;

  return (
    <section className="animate-fade-in space-y-8" data-testid="stage-input">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl tracking-tight text-primary md:text-4xl">
          Audience Data
        </h2>
        <p className="mt-2 text-secondary">
          Four inputs. One run. Thunder builds an evidence-backed audience twin
          and rehearses the post with a multi-agent jury — not a fake view
          predictor.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="rounded-xl border border-border bg-elevated/80 px-4 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-electric">
              Step {step.n}
            </p>
            <p className="mt-1 text-sm font-medium text-primary">{step.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-secondary">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          size="lg"
          onClick={onRun}
          disabled={running || !canRun}
          data-testid="run-audience-test"
          className="min-w-[12rem] shadow-md shadow-electric/20"
        >
          {running ? "Running…" : "Run Audience Test"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onLoadSeed}
          data-testid="load-seed"
        >
          Load seeded demo
        </Button>
        {!canRun ? (
          <p className="text-xs text-muted sm:ml-1">
            Fill comments, context, and draft to enable Run.
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Textarea
          label="1. Historical audience comments (one per line)"
          value={commentsText}
          onChange={(e) => onChange("commentsText", e.target.value)}
          className="min-h-64"
          data-testid="comments-input"
          placeholder={SEED_INPUT.commentsText.slice(0, 120) + "…"}
        />
        <div className="space-y-5">
          <Textarea
            label="2. Creator context"
            value={creatorContext}
            onChange={(e) => onChange("creatorContext", e.target.value)}
            className="min-h-28"
            data-testid="context-input"
          />
          <Textarea
            label="3. Draft post / carousel outline"
            value={draftPost}
            onChange={(e) => onChange("draftPost", e.target.value)}
            className="min-h-40"
            data-testid="draft-input"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-elevated/70 p-4">
        <label className="block text-sm font-medium text-primary">
          4. Optional source URL (Firecrawl)
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => onChange("sourceUrl", e.target.value)}
            placeholder="https://…"
            data-testid="source-url"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-electric"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={onFetchSource}
            disabled={fetchingSource || !sourceUrl.trim()}
          >
            {fetchingSource ? "Fetching…" : "Fetch source"}
          </Button>
        </div>
        {sourceMsg ? (
          <p className="mt-2 text-xs text-muted">{sourceMsg}</p>
        ) : (
          <p className="mt-2 text-xs text-muted">
            Without FIRECRAWL_API_KEY this stays recovery — paste comments
            manually.
          </p>
        )}
      </div>
    </section>
  );
}
