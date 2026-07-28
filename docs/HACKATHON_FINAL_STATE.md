# Thunder Hackathon Edition — final state

Freeze snapshot for demos, interviews, and handoff to a new production repo.

**Demo:** https://thunder-psio.onrender.com  
**Tag recommendation:** `thunder-hackathon-final-2026`

## What works

- Six-stage preflight lab on `/`
- LangGraph pipeline: normalize → audience (3 segments) → evidence → jurors×3 → critic → TS scores → strategy → verify
- Mode badges: Live / Imported / Seeded demo / Recovery fallback
- Deterministic diagnostics ([docs/SCORING.md](./SCORING.md))
- Media ZIP export (PNG slides, PDF, VTT, storyboard)
- Optional Studio (`/studio`) when `DATABASE_URL` is set
- Optional auth gate when Clerk / `THUNDER_API_TOKEN` set
- Health: `/api/health`
- EvidencePack Zod contract for future ingestion ([INTEGRATION_CONTRACT.md](./INTEGRATION_CONTRACT.md))

## What is seeded

- **Load seeded demo** loads fixed comments/context/draft ([`src/lib/mock/seed-input.ts`](../src/lib/mock/seed-input.ts))
- `forceSeededDemo` / `FORCE_SEEDED_DEMO` forces mock pipeline result labeled **Seeded demo**

## What is fallback

- Missing language keys → **Recovery fallback** mock (if `THUNDER_ENABLE_FALLBACK=true`)
- Pipeline errors with fallback enabled → recovery result + error note in trace
- Cover / voice / Firecrawl / n8n without keys → recovery-labeled responses

## What is incomplete (by design here)

- Native social publishing / OAuth
- Full Clerk UI, Stripe Checkout UI, Sentry SDK, real S3 SDK upload
- Cross-platform ingestion product (YouTube/TikTok/IG connectors)
- Social network / Circles / feed

## How to demo (exact path)

1. Open live demo or `npm run dev` → http://127.0.0.1:3000  
2. Click **Load seeded demo**  
3. Click **Run Audience Test**  
4. Walk stages: Twin → Reaction Lab → Diagnostics → Carousel → Before/After  
5. On Carousel, click **Export media package** → download ZIP  
6. Point to mode badge (Seeded demo or Live if keys present)

### Demo prep checklist

- [ ] Confirm deploy is healthy (`/api/health`)  
- [ ] Prefer seeded path if OpenAI budget is low  
- [ ] Cold start: wait up to ~60s on free Render  
- [ ] Do not claim view prediction  
- [ ] Do not show `.env` or keys on screen  

## Known risks

- Public `/api/analyze` can spend OpenAI when keys are set and auth is open  
- In-memory rate limits without Redis  
- `.env.local` must never be committed  

## Features intentionally postponed

All multi-platform connector work, partnership upstream ingest, incubator pitch strategy, and social-graph product — **new repository only**.
