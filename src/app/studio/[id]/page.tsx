"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ThunderMark } from "@/components/shell/ThunderMark";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { Button } from "@/components/ui/button";
import type { AnalyzeResult } from "@/lib/schemas";
import { AnalyzeResultSchema } from "@/lib/schemas";
import { SEED_INPUT } from "@/lib/mock/seed-input";

type RunRow = {
  id: string;
  mode: string;
  confidence: string | null;
  createdAt: string;
  resultJson: string;
};

type ProjectDetail = {
  id: string;
  title: string;
  creatorContext: string;
  runs: RunRow[];
  drafts: { id: string; label: string; body: string; isOptimized: boolean }[];
  brandKit: { id: string; name: string; voiceSummary: string } | null;
  audienceTwin: {
    id: string;
    name: string;
    version: number;
    segmentsJson: string;
  } | null;
};

export default function StudioProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbMissing, setDbMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<RunRow | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setDbMissing(false);
    try {
      const res = await fetch(`/api/studio/projects/${projectId}`);
      if (res.status === 503) {
        setDbMissing(true);
        return;
      }
      const body = (await res.json()) as {
        error?: string;
        project?: ProjectDetail;
      };
      if (!res.ok) throw new Error(body.error ?? "Failed to load project");
      setProject(body.project ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runSeededAndSave() {
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentsText: SEED_INPUT.commentsText,
          creatorContext:
            project?.creatorContext || SEED_INPUT.creatorContext,
          draftPost: SEED_INPUT.draftPost,
          forceMock: true,
        }),
      });
      const analyzeJson: unknown = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(
          typeof analyzeJson === "object" &&
            analyzeJson &&
            "error" in analyzeJson
            ? String((analyzeJson as { error: unknown }).error)
            : "Analyze failed",
        );
      }
      const parsed = AnalyzeResultSchema.safeParse(analyzeJson);
      if (!parsed.success) throw new Error("Analyze response invalid");
      const result: AnalyzeResult = parsed.data;

      const saveRes = await fetch("/api/studio/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          mode: result.mode,
          confidence: result.confidence,
          result,
          meta: result.meta,
          draftBody: SEED_INPUT.draftPost,
          optimizedBody: result.optimized?.caption ?? result.optimized?.slides?.[0]?.body,
        }),
      });
      const saveBody = (await saveRes.json()) as {
        error?: string;
        run?: { id: string };
      };
      if (!saveRes.ok) throw new Error(saveBody.error ?? "Save run failed");

      await fetch("/api/studio/twins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          analysisRunId: saveBody.run?.id,
          name: `${project?.title ?? "Project"} twin`,
          segments: result.segments,
        }),
      });

      setMsg("Seeded run saved and audience twin upserted.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveCurrentLabHint() {
    setMsg(
      "Open the preflight lab (/), run an analysis, then return here and use “Run seeded & save” — or POST the result to /api/studio/runs with this projectId.",
    );
  }

  let selectedPreview: string | null = null;
  if (selectedRun) {
    try {
      const parsed = JSON.parse(selectedRun.resultJson) as {
        mode?: string;
        segments?: unknown[];
        optimizedDiagnostics?: { audienceFit?: number };
      };
      selectedPreview = `mode=${parsed.mode ?? selectedRun.mode}; segments=${
        Array.isArray(parsed.segments) ? parsed.segments.length : "?"
      }; fit=${parsed.optimizedDiagnostics?.audienceFit ?? "?"}`;
    } catch {
      selectedPreview = "Stored result (raw JSON)";
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-wash" aria-hidden />
      <header className="relative border-b border-border bg-elevated/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-5 md:px-6">
          <Link href="/studio" className="flex items-start gap-3 hover:opacity-90">
            <ThunderMark size={40} className="mt-1 ring-1 ring-border" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Studio</p>
              <p className="font-display text-2xl tracking-tight text-primary md:text-3xl">
                {project?.title ?? "Project"}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/studio">
              <Button type="button" variant="ghost" size="sm">
                All projects
              </Button>
            </Link>
            <Link href="/">
              <Button type="button" variant="secondary" size="sm">
                Preflight lab
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
        {dbMissing ? (
          <p className="text-sm text-secondary" data-testid="studio-db-missing">
            DATABASE_URL not set — Studio APIs unavailable (503).
          </p>
        ) : null}
        {error ? (
          <div
            className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical"
            role="alert"
          >
            {error}
          </div>
        ) : null}
        {msg ? <p className="text-sm text-secondary">{msg}</p> : null}

        {project ? (
          <>
            <section className="space-y-2 text-sm text-secondary">
              <p>
                Context: {project.creatorContext || "—"}
              </p>
              <p>
                Brand kit: {project.brandKit?.name ?? "none"} · Twin:{" "}
                {project.audienceTwin
                  ? `${project.audienceTwin.name} v${project.audienceTwin.version}`
                  : "none"}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  onClick={() => void runSeededAndSave()}
                  data-testid="studio-save-seeded-run"
                >
                  {busy ? "Working…" : "Run seeded & save"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => void saveCurrentLabHint()}
                >
                  How to save a live lab run
                </Button>
              </div>
              <p className="text-xs text-muted">
                Seeded path uses forceMock — no OpenAI spend. Entitlement still
                counts saved runs toward the Free monthly cap.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-primary">Past runs</h2>
              {project.runs.length === 0 ? (
                <p className="mt-2 text-sm text-secondary">No runs saved yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-border border-y border-border">
                  {project.runs.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <div>
                        <p className="font-medium text-primary">
                          {r.mode}
                          {r.confidence ? ` · ${r.confidence}` : ""}
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(r.createdAt).toLocaleString()} · {r.id}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedRun(r)}
                      >
                        Preview
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedPreview ? (
                <p className="mt-3 rounded-md border border-border bg-elevated px-3 py-2 font-mono text-xs">
                  {selectedPreview}
                </p>
              ) : null}
            </section>

            <section>
              <h2 className="font-display text-xl text-primary">Drafts</h2>
              {project.drafts.length === 0 ? (
                <p className="mt-2 text-sm text-secondary">No drafts stored.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {project.drafts.map((d) => (
                    <li key={d.id} className="border-b border-border py-2">
                      <span className="font-medium text-primary">
                        {d.label}
                        {d.isOptimized ? " (optimized)" : ""}
                      </span>
                      <p className="mt-1 line-clamp-3 text-secondary">{d.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : !dbMissing && !error ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : null}
      </main>
    </div>
  );
}
