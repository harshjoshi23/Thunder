# Thunder

**Test your post before your audience does.**

Thunder is a pre-publication audience intelligence and scenario-testing environment for creators. It turns historical comments into an evidence-backed audience twin, runs a controlled multi-agent LangGraph simulation, scores the draft with transparent deterministic formulas, and produces an improved five-slide carousel with a before/after comparison.

> Thunder runs a grounded scenario simulation based on patterns in the creator’s supplied audience data. It does **not** predict real humans perfectly, guarantee virality, or forecast exact views.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Zod contracts on every AI/API boundary
- LangGraph.js multi-agent orchestration (2 structured OpenAI calls + deterministic nodes)
- Mock/demo fallback when `OPENAI_API_KEY` is missing
- Optional fal.ai cover generation

## Quick start

```bash
cp .env.example .env.local
# optional: add OPENAI_API_KEY and FAL_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Load seeded demo**, then **Run Audience Test**.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

## Demo path (2 minutes)

1. Load seeded demo (AI agents / MCP creator story)
2. Run Audience Test
3. Audience Twin → 3 evidence-backed segments
4. Reaction Lab → disagreement across segments
5. Diagnostics → deterministic scores + guardrails
6. Optimized carousel (5 slides)
7. Before / After score table

## Architecture

See [docs/architecture.md](docs/architecture.md) for Mermaid diagrams (importable into diagrams.net).

## Environment

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Live multi-agent runs |
| `OPENAI_MODEL` | Default `gpt-4o` |
| `ANALYZE_TIMEOUT_MS` | Default `45000` |
| `FORCE_MOCK` | Force fallback mode |
| `FAL_KEY` | Optional cover generation |

Without an OpenAI key, the full UI still works in **Demo / fallback mode**.

## Deploy

- **Render:** see `render.yaml`
- **Vercel:** import the repo and set env vars

## Docs for pitch & learning

- [docs/EXPLAINER.md](docs/EXPLAINER.md) — what we built, in simple English
- [docs/SPEAKER.md](docs/SPEAKER.md) — what to say out loud
- [docs/render-n8n-guide.md](docs/render-n8n-guide.md) — deploy + n8n for beginners
- [docs/architecture.md](docs/architecture.md) — Mermaid diagrams
- [docs/submission.md](docs/submission.md) — portal checklist

## License

**GPL-3.0** — open source (required for the hackathon), but **copyleft**: others who distribute modified versions must also keep them open under GPL-3.0. This is stricter than MIT (people cannot quietly take Thunder closed-source). See [`LICENSE`](LICENSE).

Built for Cursor Hackathon Stuttgart.
