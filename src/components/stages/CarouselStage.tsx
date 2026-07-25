"use client";

import { useState } from "react";
import type { AnalyzeResult } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceList } from "@/components/shared/EvidenceList";
import { Accordion } from "@/components/ui/accordion";

export function CarouselStage({ result }: { result: AnalyzeResult }) {
  const [coverUrl, setCoverUrl] = useState("/og-cover.svg");
  const [coverMsg, setCoverMsg] = useState<string | null>(null);
  const [loadingCover, setLoadingCover] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  async function exportToN8n() {
    setExporting(true);
    setExportMsg(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hook: result.optimized.hook,
          slides: result.optimized.slides,
          caption: result.optimized.caption,
          cta: result.optimized.cta,
          mode: result.mode,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        skipped?: boolean;
      };
      setExportMsg(
        data.message ??
          (data.ok
            ? "Exported to n8n webhook."
            : "Export skipped — set N8N_WEBHOOK_URL to enable."),
      );
    } catch {
      setExportMsg("Export failed — core carousel is still safe.");
    } finally {
      setExporting(false);
    }
  }

  async function generateCover() {
    setLoadingCover(true);
    setCoverMsg(null);
    try {
      const res = await fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hook: result.optimized.hook,
          creatorContext: result.creatorContext.slice(0, 500),
        }),
      });
      const data = (await res.json()) as {
        imageUrl?: string;
        message?: string;
        fallback?: boolean;
      };
      if (data.imageUrl) setCoverUrl(data.imageUrl);
      setCoverMsg(
        data.message ??
          (data.fallback
            ? "Using designed fallback cover."
            : "Cover generated with fal.ai."),
      );
    } catch {
      setCoverUrl("/og-cover.svg");
      setCoverMsg("Cover generation failed — fallback retained.");
    } finally {
      setLoadingCover(false);
    }
  }

  return (
    <section className="animate-fade-in space-y-6">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
          Optimized Carousel
        </h2>
        <p className="mt-2 text-ink/65">
          Content Strategy Agent resolved segment trade-offs into five slides,
          with evidence-linked change explanations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt="Carousel cover"
            className="aspect-square w-full rounded-xl border border-ink/10 object-cover shadow-sm"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={generateCover}
            disabled={loadingCover}
          >
            {loadingCover ? "Generating…" : "Generate cover (fal.ai)"}
          </Button>
          <Button
            type="button"
            variant="amber"
            onClick={exportToN8n}
            disabled={exporting}
          >
            {exporting ? "Exporting…" : "Export to n8n"}
          </Button>
          {coverMsg ? (
            <p className="text-xs text-ink/55">{coverMsg}</p>
          ) : null}
          {exportMsg ? (
            <p className="text-xs text-ink/55">{exportMsg}</p>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-teal-800/15 bg-teal-800/5 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-teal-900">
              Hook
            </p>
            <p className="mt-2 font-display text-2xl text-ink">
              {result.optimized.hook}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {result.optimized.slides.map((slide, i) => (
              <article
                key={slide.title}
                className="rounded-xl border border-ink/10 bg-white/70 p-4 shadow-sm"
              >
                <Badge tone="teal" className="mb-2">
                  Slide {i + 1}
                </Badge>
                <h3 className="font-display text-lg text-ink">{slide.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{slide.body}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-ink/10 bg-white/55 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-ink/50">
                Caption
              </p>
              <p className="mt-2 text-sm text-ink/80">{result.optimized.caption}</p>
            </div>
            <div className="rounded-xl border border-ink/10 bg-white/55 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-ink/50">
                CTA
              </p>
              <p className="mt-2 text-sm text-ink/80">{result.optimized.cta}</p>
            </div>
          </div>

          <div className="rounded-xl border border-ink/10 bg-white/55 p-4">
            <h3 className="font-medium text-ink">Why it changed</h3>
            <ul className="mt-3 space-y-3">
              {result.optimized.changeExplanations.map((item) => (
                <li key={item.change} className="text-sm">
                  <p className="font-medium text-ink">{item.change}</p>
                  <p className="text-ink/70">{item.why}</p>
                  {item.evidenceIds.length > 0 ? (
                    <Accordion title="Evidence">
                      <EvidenceList
                        evidenceIds={item.evidenceIds}
                        comments={result.comments}
                      />
                    </Accordion>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
