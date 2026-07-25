"use client";

import type { AnalyzeResult } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { EvidenceList } from "@/components/shared/EvidenceList";

export function AudienceTwinStage({ result }: { result: AnalyzeResult }) {
  return (
    <section className="animate-fade-in space-y-6">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
          Audience Twin
        </h2>
        <p className="mt-2 text-ink/65">
          Three differentiated segments grounded in your imported comments.
          Every evidence ID is validated against the source list.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {result.segments.map((segment) => (
          <article
            key={segment.name}
            className="flex flex-col rounded-xl border border-ink/10 bg-white/55 p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="teal">{segment.expertiseLevel}</Badge>
              <Badge tone="neutral">
                {segment.evidenceIds.length} evidence
              </Badge>
            </div>
            <h3 className="font-display text-2xl text-ink">{segment.name}</h3>
            <p className="mt-2 text-sm text-ink/70">{segment.description}</p>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-medium text-ink">Needs</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-ink/70">
                  {segment.needs.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-ink">Frustrations</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-ink/70">
                  {segment.frustrations.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs italic text-ink/50">
                {segment.consistencyNote}
              </p>
            </div>

            <div className="mt-auto pt-2">
              <Accordion title="Supporting comments">
                <EvidenceList
                  evidenceIds={segment.evidenceIds}
                  comments={result.comments}
                />
              </Accordion>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
