"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ThunderMark } from "@/components/shell/ThunderMark";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { Button } from "@/components/ui/button";

type ProjectRow = {
  id: string;
  title: string;
  creatorContext: string;
  updatedAt: string;
  _count: { runs: number; drafts: number };
  brandKit?: { id: string; name: string } | null;
  audienceTwin?: { id: string; name: string; version: number } | null;
};

type BrandKitRow = {
  id: string;
  name: string;
  voiceSummary: string;
  primaryColor: string;
  accentColor: string;
  prohibitedClaims: string;
};

type Entitlement = {
  ok: boolean;
  plan: string;
  runsUsedThisMonth: number;
  runsAllowed: number;
  remaining: number;
  reason?: string;
};

export default function StudioPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [brandKits, setBrandKits] = useState<BrandKitRow[]>([]);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [plan, setPlan] = useState<string>("FREE");
  const [dbMissing, setDbMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [kitName, setKitName] = useState("");
  const [kitVoice, setKitVoice] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvMsg, setCsvMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDbMissing(false);
    try {
      const [pRes, bRes, eRes] = await Promise.all([
        fetch("/api/studio/projects"),
        fetch("/api/studio/brand-kits"),
        fetch("/api/studio/entitlement"),
      ]);

      if (pRes.status === 503 || bRes.status === 503 || eRes.status === 503) {
        setDbMissing(true);
        setProjects([]);
        setBrandKits([]);
        return;
      }

      if (!pRes.ok) {
        const body = (await pRes.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to load projects");
      }

      const pJson = (await pRes.json()) as {
        projects: ProjectRow[];
        plan?: string;
      };
      setProjects(pJson.projects);
      if (pJson.plan) setPlan(pJson.plan);

      if (bRes.ok) {
        const bJson = (await bRes.json()) as { brandKits: BrandKitRow[] };
        setBrandKits(bJson.brandKits);
      }

      if (eRes.ok) {
        const eJson = (await eRes.json()) as { entitlement: Entitlement };
        setEntitlement(eJson.entitlement);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createProject() {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const body = (await res.json()) as { error?: string; project?: ProjectRow };
      if (!res.ok) throw new Error(body.error ?? "Create failed");
      setTitle("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function createBrandKit() {
    if (!kitName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/brand-kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: kitName.trim(),
          voiceSummary: kitVoice.trim(),
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Brand kit create failed");
      setKitName("");
      setKitVoice("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Brand kit failed");
    } finally {
      setBusy(false);
    }
  }

  async function importCsv() {
    if (!csvText.trim()) return;
    setBusy(true);
    setCsvMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/studio/import/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Studio CSV import",
          csv: csvText,
          originLabel: "studio-ui",
        }),
      });
      const body = (await res.json()) as {
        error?: string;
        parsed?: { commentCount: number };
      };
      if (!res.ok) throw new Error(body.error ?? "CSV import failed");
      setCsvMsg(`Imported ${body.parsed?.commentCount ?? 0} comments as AudienceSource.`);
      setCsvText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSV import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-wash" aria-hidden />
      <header className="relative border-b border-border bg-elevated/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-5 md:px-6">
          <Link href="/" className="flex items-start gap-3 hover:opacity-90">
            <ThunderMark size={44} className="mt-1 ring-1 ring-border" />
            <div>
              <p className="font-display text-3xl tracking-tight text-primary md:text-4xl">
                Thunder Studio
              </p>
              <p className="mt-1 text-sm text-secondary">
                Projects, runs, brand kits, and audience sources.
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/">
              <Button type="button" variant="secondary" size="sm">
                Preflight lab
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
        {dbMissing ? (
          <div
            className="rounded-lg border border-border bg-elevated px-4 py-5 text-sm"
            role="status"
            data-testid="studio-db-missing"
          >
            <p className="font-medium text-primary">Postgres not configured</p>
            <p className="mt-2 text-secondary">
              Studio APIs return 503 until <code className="text-xs">DATABASE_URL</code>{" "}
              is set. Use Neon or{" "}
              <code className="text-xs">docker compose up -d</code>, then{" "}
              <code className="text-xs">npx prisma migrate deploy</code>. Steps:
              docs/developer-setup.md.
            </p>
            <p className="mt-3 text-muted">
              The public preflight demo at{" "}
              <Link href="/" className="underline">
                /
              </Link>{" "}
              keeps working without a database.
            </p>
          </div>
        ) : null}

        {error ? (
          <div
            className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {!dbMissing && entitlement ? (
          <section className="border-b border-border pb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Plan
            </h2>
            <p className="mt-2 text-sm text-primary">
              {entitlement.plan} — {entitlement.runsUsedThisMonth}/
              {entitlement.runsAllowed} runs this month ({entitlement.remaining}{" "}
              remaining). Workspace plan: {plan}.
            </p>
            {!entitlement.ok && entitlement.reason ? (
              <p className="mt-1 text-sm text-critical">{entitlement.reason}</p>
            ) : null}
          </section>
        ) : null}

        {!dbMissing ? (
          <>
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-display text-2xl text-primary">Projects</h2>
                <div className="flex flex-wrap gap-2">
                  <input
                    className="h-10 min-w-[200px] rounded-md border border-border bg-elevated px-3 text-sm"
                    placeholder="New project title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="studio-project-title"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy || !title.trim()}
                    onClick={() => void createProject()}
                    data-testid="studio-create-project"
                  >
                    Create
                  </Button>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-muted">Loading…</p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-secondary">
                  No projects yet. Create one, run the lab on{" "}
                  <Link href="/" className="underline">
                    /
                  </Link>
                  , then save a run from the project page.
                </p>
              ) : (
                <ul className="divide-y divide-border border-y border-border">
                  {projects.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <Link
                          href={`/studio/${p.id}`}
                          className="font-medium text-primary underline-offset-2 hover:underline"
                        >
                          {p.title}
                        </Link>
                        <p className="text-xs text-muted">
                          {p._count.runs} runs · updated{" "}
                          {new Date(p.updatedAt).toLocaleString()}
                          {p.brandKit ? ` · kit ${p.brandKit.name}` : ""}
                          {p.audienceTwin
                            ? ` · twin ${p.audienceTwin.name} v${p.audienceTwin.version}`
                            : ""}
                        </p>
                      </div>
                      <Link href={`/studio/${p.id}`}>
                        <Button type="button" variant="ghost" size="sm">
                          Open
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-primary">Brand kits</h2>
              <div className="flex flex-wrap gap-2">
                <input
                  className="h-10 min-w-[160px] rounded-md border border-border bg-elevated px-3 text-sm"
                  placeholder="Kit name"
                  value={kitName}
                  onChange={(e) => setKitName(e.target.value)}
                />
                <input
                  className="h-10 min-w-[220px] flex-1 rounded-md border border-border bg-elevated px-3 text-sm"
                  placeholder="Voice summary"
                  value={kitVoice}
                  onChange={(e) => setKitVoice(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={busy || !kitName.trim()}
                  onClick={() => void createBrandKit()}
                >
                  Add kit
                </Button>
              </div>
              {brandKits.length === 0 ? (
                <p className="text-sm text-secondary">No brand kits yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {brandKits.map((k) => (
                    <li
                      key={k.id}
                      className="flex items-center gap-3 border-b border-border py-2"
                    >
                      <span
                        className="inline-block h-4 w-4 rounded-sm ring-1 ring-border"
                        style={{ background: k.primaryColor }}
                        aria-hidden
                      />
                      <span className="font-medium text-primary">{k.name}</span>
                      <span className="text-muted">{k.voiceSummary || "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl text-primary">CSV import</h2>
              <p className="text-sm text-secondary">
                Paste CSV with a <code className="text-xs">comment</code> column (or
                plain one-comment-per-line). Saves as an AudienceSource.
              </p>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-border bg-elevated p-3 font-mono text-xs"
                placeholder={'comment,author\n"Need simpler examples",alex\n"Show me code",sam'}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                data-testid="studio-csv"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={busy || !csvText.trim()}
                onClick={() => void importCsv()}
              >
                Import comments
              </Button>
              {csvMsg ? <p className="text-sm text-secondary">{csvMsg}</p> : null}
            </section>
          </>
        ) : null}

        <footer className="border-t border-border pt-6 text-xs text-muted">
          <Link href="/" className="underline underline-offset-2 hover:text-fg">
            ← Preflight lab
          </Link>
          {" · "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-fg">
            Terms
          </Link>
        </footer>
      </main>
    </div>
  );
}
