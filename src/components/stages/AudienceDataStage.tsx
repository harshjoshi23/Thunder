"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SEED_INPUT } from "@/lib/mock/seed-input";

export function AudienceDataStage({
  commentsText,
  creatorContext,
  draftPost,
  onChange,
  onLoadSeed,
  onRun,
  running,
}: {
  commentsText: string;
  creatorContext: string;
  draftPost: string;
  onChange: (field: "commentsText" | "creatorContext" | "draftPost", value: string) => void;
  onLoadSeed: () => void;
  onRun: () => void;
  running: boolean;
}) {
  return (
    <section className="animate-fade-in space-y-6">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
          Audience Data
        </h2>
        <p className="mt-2 text-ink/65">
          Import historical comments and the draft you want to test. Thunder
          builds an evidence-backed audience twin, then runs a multi-agent
          scenario simulation — not a fake view predictor.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={onLoadSeed}>
          Load seeded demo
        </Button>
        <Button type="button" size="lg" onClick={onRun} disabled={running}>
          {running ? "Running…" : "Run Audience Test"}
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Textarea
          label="Historical audience comments (one per line)"
          value={commentsText}
          onChange={(e) => onChange("commentsText", e.target.value)}
          className="min-h-64"
          placeholder={SEED_INPUT.commentsText.slice(0, 120) + "…"}
        />
        <div className="space-y-5">
          <Textarea
            label="Creator context"
            value={creatorContext}
            onChange={(e) => onChange("creatorContext", e.target.value)}
            className="min-h-28"
          />
          <Textarea
            label="Draft post / carousel outline"
            value={draftPost}
            onChange={(e) => onChange("draftPost", e.target.value)}
            className="min-h-40"
          />
        </div>
      </div>
    </section>
  );
}
