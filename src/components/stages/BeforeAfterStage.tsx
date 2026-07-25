"use client";

import { useEffect, useState } from "react";
import type { AnalyzeResult, Diagnostics } from "@/lib/schemas";

function AnimatedValue({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let frame = 0;
    const steps = 24;
    const id = window.setInterval(() => {
      frame += 1;
      setN(Math.round((value * frame) / steps));
      if (frame >= steps) window.clearInterval(id);
    }, 20);
    return () => window.clearInterval(id);
  }, [value]);
  return <span className="font-mono tabular-nums">{n}</span>;
}

const ROWS: Array<{
  key: keyof Diagnostics;
  label: string;
  invert?: boolean;
}> = [
  { key: "audienceFit", label: "Audience fit" },
  { key: "clarity", label: "Clarity" },
  { key: "savePotential", label: "Save potential" },
  { key: "discussionPotential", label: "Discussion potential" },
  { key: "misinterpretationRisk", label: "Misinterpretation risk", invert: true },
];

export function BeforeAfterStage({ result }: { result: AnalyzeResult }) {
  return (
    <section className="animate-fade-in space-y-6">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
          Before vs After
        </h2>
        <p className="mt-2 text-ink/65">
          Same deterministic formulas on original vs optimized factor ratings.
          No hard-coded vanity improvements.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/60 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-paper">
            <tr>
              <th className="px-4 py-3 font-medium">Diagnostic</th>
              <th className="px-4 py-3 font-medium">Original</th>
              <th className="px-4 py-3 font-medium">Optimized</th>
              <th className="px-4 py-3 font-medium">Delta</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const before = result.originalDiagnostics[row.key];
              const after = result.optimizedDiagnostics[row.key];
              const delta = after - before;
              const good = row.invert ? delta < 0 : delta > 0;
              return (
                <tr key={row.key} className="border-t border-ink/8">
                  <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
                  <td className="px-4 py-3 text-ink/70">
                    <AnimatedValue value={before} />
                  </td>
                  <td className="px-4 py-3 text-ink">
                    <AnimatedValue value={after} />
                  </td>
                  <td
                    className={`px-4 py-3 font-mono ${
                      good ? "text-teal-800" : "text-amber-700"
                    }`}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-ink/10 bg-white/55 p-4">
          <p className="text-xs uppercase tracking-wider text-ink/50">
            Relative performance
          </p>
          <p className="mt-2 font-display text-2xl text-ink">
            {result.meta.relativePerformance}
          </p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white/55 p-4">
          <p className="text-xs uppercase tracking-wider text-ink/50">
            Primary strength
          </p>
          <p className="mt-2 text-sm text-ink/80">{result.meta.primaryStrength}</p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white/55 p-4">
          <p className="text-xs uppercase tracking-wider text-ink/50">
            Primary weakness addressed
          </p>
          <p className="mt-2 text-sm text-ink/80">{result.meta.primaryWeakness}</p>
        </div>
      </div>

      <div className="rounded-xl border border-ink/10 bg-ink/[0.03] p-4 text-xs text-ink/55">
        <p className="font-medium text-ink/70">Agent trace</p>
        <p className="mt-1 font-mono">{result.meta.agentTrace.join(" → ")}</p>
      </div>
    </section>
  );
}
