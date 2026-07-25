"use client";

import { useState } from "react";
import type { AnalyzeResult } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceList } from "@/components/shared/EvidenceList";
import { Accordion } from "@/components/ui/accordion";
import { TechnicalCredibilityPanel } from "@/components/shared/LoadingOrchestra";

export function CarouselStage({ result }: { result: AnalyzeResult }) {
  const [coverUrl, setCoverUrl] = useState("/og-cover.svg");
  const [coverMsg, setCoverMsg] = useState<string | null>(null);
  const [loadingCover, setLoadingCover] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState<string | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  async function exportToN8n() {
    setExporting(true);
    setExportMsg(null);
    try {
      const res = await fetch("/api/export/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hook: result.optimized.hook,
          slides: result.optimized.slides,
          caption: result.optimized.caption,
          cta: result.optimized.cta,
          voiceoverScript: result.optimized.voiceoverScript,
          coverImageUrl: coverUrl.startsWith("http") ? coverUrl : undefined,
          mode: result.mode,
          confidence: result.confidence,
          diagnostics: result.optimizedDiagnostics,
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
            ? "Approved & sent to n8n."
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
        mode?: string;
      };
      if (data.imageUrl) setCoverUrl(data.imageUrl);
      setCoverMsg(
        data.message ??
          (data.fallback
            ? "Recovery fallback cover."
            : "Cover generated with fal.ai."),
      );
    } catch {
      setCoverUrl("/og-cover.svg");
      setCoverMsg("Cover generation failed — recovery fallback retained.");
    } finally {
      setLoadingCover(false);
    }
  }

  async function generateVoiceover() {
    setVoiceLoading(true);
    setVoiceMsg(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    try {
      const res = await fetch("/api/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: result.optimized.voiceoverScript }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        audioBase64?: string | null;
        mimeType?: string | null;
        message?: string;
        script?: string;
      };
      setVoiceMsg(data.message ?? null);
      if (data.audioBase64 && data.mimeType) {
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: data.mimeType });
        setAudioUrl(URL.createObjectURL(blob));
      }
    } catch {
      setVoiceMsg("Voiceover failed — script still available below.");
    } finally {
      setVoiceLoading(false);
    }
  }

  return (
    <section className="animate-fade-in space-y-6">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl tracking-tight text-primary md:text-4xl">
          Optimized Carousel
        </h2>
        <p className="mt-2 text-secondary">
          Content Strategy Agent resolved segment trade-offs into five slides,
          with evidence-linked change explanations and a voiceover script.
        </p>
        <p className="mt-2 text-xs text-muted">
          Cover image is a visual asset only — it does not change diagnostic
          scores. Requires <code className="text-electric">FAL_KEY</code>;
          otherwise a branded fallback SVG is used.
        </p>
      </div>

      <TechnicalCredibilityPanel result={result} />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3" data-testid="cover-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt="Carousel cover"
            className="aspect-square w-full rounded-xl border border-border object-cover shadow-sm"
            data-testid="cover-image"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={generateCover}
            disabled={loadingCover}
            data-testid="generate-cover"
          >
            {loadingCover ? "Generating…" : "Generate Cover"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={generateVoiceover}
            disabled={voiceLoading}
          >
            {voiceLoading ? "Generating…" : "Generate Voiceover"}
          </Button>
          <Button
            type="button"
            variant="amber"
            onClick={exportToN8n}
            disabled={exporting}
          >
            {exporting ? "Sending…" : "Approve & Send to n8n"}
          </Button>
          {coverMsg ? (
            <p className="text-xs text-muted">{coverMsg}</p>
          ) : null}
          {voiceMsg ? (
            <p className="text-xs text-muted">{voiceMsg}</p>
          ) : null}
          {exportMsg ? (
            <p className="text-xs text-muted">{exportMsg}</p>
          ) : null}
          {audioUrl ? (
            <audio controls src={audioUrl} className="w-full" />
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-electric/25 bg-electric-soft p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-electric">
              Hook
            </p>
            <p className="mt-2 font-display text-2xl text-primary">
              {result.optimized.hook}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {result.optimized.slides.map((slide, i) => (
              <article
                key={slide.title}
                className="rounded-xl border border-border bg-elevated p-4 shadow-sm"
              >
                <Badge tone="teal" className="mb-2">
                  Slide {i + 1}
                </Badge>
                <h3 className="font-display text-lg text-primary">{slide.title}</h3>
                <p className="mt-2 text-sm text-secondary">{slide.body}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-elevated/80 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Caption
              </p>
              <p className="mt-2 text-sm text-secondary">{result.optimized.caption}</p>
            </div>
            <div className="rounded-xl border border-border bg-elevated/80 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                CTA
              </p>
              <p className="mt-2 text-sm text-secondary">{result.optimized.cta}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-elevated/80 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Voiceover script
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-secondary">
              {result.optimized.voiceoverScript}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-elevated/80 p-4">
            <h3 className="font-medium text-primary">Why it changed</h3>
            <ul className="mt-3 space-y-3">
              {result.optimized.changeExplanations.map((item) => (
                <li key={item.change} className="text-sm">
                  <p className="font-medium text-primary">{item.change}</p>
                  <p className="text-secondary">{item.why}</p>
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
