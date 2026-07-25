"use client";

import type { AnalyzeResult } from "@/lib/schemas";
import { ScoreBar } from "@/components/shared/ScoreBar";
import { FormulaDisclosure } from "@/components/shared/FormulaDisclosure";
import { FORMULA_DISCLOSURE } from "@/lib/scoring/formulas";
import { Badge } from "@/components/ui/badge";

export function DiagnosticsStage({ result }: { result: AnalyzeResult }) {
  const d = result.originalDiagnostics;
  return (
    <section className="animate-fade-in space-y-6">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl tracking-tight text-primary md:text-4xl">
          Diagnostics & Guardrails
        </h2>
        <p className="mt-2 text-secondary">
          Final scores are computed in TypeScript from constrained factor
          ratings — the model does not invent the 0–100 numbers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5 rounded-xl border border-border bg-elevated/80 p-5 shadow-sm">
          {(
            [
              ["Audience fit", d.audienceFit, FORMULA_DISCLOSURE.audienceFit, false],
              ["Clarity", d.clarity, FORMULA_DISCLOSURE.clarity, false],
              ["Save potential", d.savePotential, FORMULA_DISCLOSURE.savePotential, false],
              [
                "Discussion potential",
                d.discussionPotential,
                FORMULA_DISCLOSURE.discussionPotential,
                false,
              ],
              [
                "Misinterpretation risk",
                d.misinterpretationRisk,
                FORMULA_DISCLOSURE.misinterpretationRisk,
                true,
              ],
            ] as const
          ).map(([label, value, formula, invert]) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="sr-only">{label}</span>
                <FormulaDisclosure label={label} formula={formula} />
              </div>
              <ScoreBar
                label={label}
                value={value}
                invert={invert}
                formula={formula}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-elevated/80 p-5 shadow-sm">
            <h3 className="font-medium text-primary">Strengths</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-secondary">
              {result.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-elevated/80 p-5 shadow-sm">
            <h3 className="font-medium text-primary">Weaknesses</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-secondary">
              {result.weaknesses.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-elevated/80 p-5 shadow-sm">
            <h3 className="font-medium text-primary">Guardrail findings</h3>
            <ul className="mt-3 space-y-3">
              {result.guardrails.map((g) => (
                <li key={g.finding} className="text-sm">
                  <div className="mb-1 flex flex-wrap gap-2">
                    <Badge
                      tone={
                        g.severity === "high"
                          ? "danger"
                          : g.severity === "medium"
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {g.severity}
                    </Badge>
                    <Badge tone="neutral">{g.type}</Badge>
                  </div>
                  <p className="text-secondary">{g.finding}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
