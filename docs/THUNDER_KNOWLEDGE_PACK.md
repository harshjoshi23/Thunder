# Thunder knowledge pack (Hackathon Edition)

Source of truth for the next engineering agent. Describes **this repository after the hackathon freeze**, not an imagined SaaS.

## Product problem

Creators learn how their audience reacts **after** publishing. Gut edits miss segment disagreement, weak evidence, and overclaim.

## Positioning

**Audience operating system wedge:** test → improve → (later) create/approve/publish.  
Tagline: **Test your post before your audience does.**

Not: social network, scheduler, or view predictor.

## Target users

Creators / founder-led brands who already have meaningful comments and care about trust and clarity.

## Main user journey

1. Enter or load historical comments  
2. Add creator/audience context  
3. Enter draft  
4. Run analysis  
5. Inspect three segments + evidence  
6. Inspect three reactions  
7. Read diagnostics + guardrails  
8. Review improved five-slide carousel  
9. Optional: export media ZIP / n8n payload  

## Current features

See [HACKATHON_FINAL_STATE.md](./HACKATHON_FINAL_STATE.md).

## UI routes

| Route | Purpose |
|-------|---------|
| `/` | Six-stage lab |
| `/studio`, `/studio/[id]` | Optional saved projects (Postgres) |
| `/terms`, `/privacy` | Legal stubs |
| `/api/analyze` | Main pipeline |
| `/api/media/package` | ZIP export |
| `/api/health` | Status flags |
| Other `/api/*` | Cover, voice, source, studio, billing webhook stub |

## Architecture

```
Browser → Next.js App Router
       → /api/analyze → LangGraph (src/lib/agents)
       → OpenAI preferred / fal LM fallback
       → TS scoring (src/lib/scoring)
       → AnalyzeResult + ModeBadge
```

Optional: Prisma Studio, Redis rate limits, local/S3 media storage interface.

## Important paths

| Area | Path |
|------|------|
| Graph | `src/lib/agents/graph.ts`, `nodes.ts` |
| Schemas | `src/lib/schemas/*` |
| Evidence IDs | `src/lib/evidence/*` |
| EvidencePack | `src/lib/evidence-pack/*` |
| Scoring | `src/lib/scoring/formulas.ts` |
| Media ZIP | `src/lib/media/*` |
| Mock | `src/lib/mock/*` |
| Security | `src/lib/security/*` |

## LangGraph flow

`normalizeComments → audienceResearch → evidenceValidate ⇄ retry → jurorFanout → juror1|2|3 → criticPass → originalScoring → strategy → optimizedEval → finalVerify`

## LLM schemas

Zod: segments (exactly 3), reactions (3), critic factors 0–10, strategy 5 slides + deltas. Malformed output repaired or rejected; evidence IDs validated against `C01…` comments.

## Deterministic scoring

Documented in [SCORING.md](./SCORING.md). LLM does **not** invent final 0–100 scores.

## Guardrails

Structured findings from critic; types include exaggeration, missing_context, unsupported_claim, etc.

## Evidence model

Comments normalized to `C01`, `C02`, … Segments must cite `evidenceIds` from that set.

## Export flow

`POST /api/media/package` builds ZIP via `buildMediaPackage`; mode string included in PDF/README when provided.

## Environment variables

Names only in [`.env.example`](../.env.example).

## Modes

| Mode | When |
|------|------|
| Live | Language LM succeeded on live/owner-authorized path |
| Imported | EvidencePack `accessMode: imported` (or preferred imported) with LM success |
| Seeded demo | Force mock / seeded load |
| Recovery fallback | Missing keys or pipeline failure with fallback on |

## Limitations & debt

- S3 SDK not wired (local filesystem fallback)  
- Clerk/Stripe/Sentry incomplete productization  
- No native publish  
- Open demo can spend API without auth if keys set  

## Decisions and why

- Next.js + LangGraph in-process: one deployable demo  
- TS scoring: honest “deterministic” claim  
- Mode badges: never fake live  
- EvidencePack: stable boundary for future ingest without building connectors here  

## Deliberately excluded

Social graph, follows, Circles/Network product, live YT/TT/IG connectors in this repo, partnership integration.

## Claims never to make

Exact performance/virality/revenue; political neutrality of AI; seeded=live.

## Public vs private roadmap

Public README: broad “what comes next” only.  
Private strategy: `docs/newThunder/` (gitignored).  
Internal phase tracker historically in `PHASE_STATUS.md` — use [HACKATHON_FINAL_STATE.md](./HACKATHON_FINAL_STATE.md) for freeze.

## Production repo boundaries

See [NEW_REPO_BOOTSTRAP.md](./NEW_REPO_BOOTSTRAP.md). Ingestion service emits EvidencePack; Thunder consumes it.

## Commands

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```
