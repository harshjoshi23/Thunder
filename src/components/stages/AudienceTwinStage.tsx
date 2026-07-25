"use client";

import type { AnalyzeResult } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { EvidenceList } from "@/components/shared/EvidenceList";

export function AudienceTwinStage({ result }: { result: AnalyzeResult }) {
  return (
    <section className="animate-fade-in space-y-6">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl tracking-tight text-primary md:text-4xl">
          Audience Twin
        </h2>
        <p className="mt-2 text-secondary">
          Three differentiated segments grounded in your imported comments.
          Every evidence ID is validated against the source list.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {result.segments.map((segment) => (
          <article
            key={segment.name}
            className="flex flex-col rounded-xl border border-border bg-elevated/80 p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="teal">{segment.expertiseLevel}</Badge>
              <Badge tone="neutral">
                {segment.evidenceIds.length} evidence
              </Badge>
            </div>
            <h3 className="font-display text-2xl text-primary">{segment.name}</h3>
            <p className="mt-2 text-sm text-secondary">{segment.description}</p>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-medium text-primary">Needs</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-secondary">
                  {segment.needs.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-primary">Frustrations</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-secondary">
                  {segment.frustrations.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs italic text-muted">
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
