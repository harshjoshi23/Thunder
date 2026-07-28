# Thunder (Hackathon Edition)

**Test your post before your audience does.**

Thunder is a pre-publication **audience intelligence** lab for creators. Paste historical comments and a draft; Thunder builds an evidence-backed audience twin, runs a multi-agent rehearsal, scores the draft with transparent TypeScript formulas, and returns an improved five-slide carousel (plus optional media ZIP export).

> Grounded simulation from *your* comments. Not a view predictor. Not a virality or revenue guarantee.

**Live demo:** [https://thunder-psio.onrender.com](https://thunder-psio.onrender.com)  
(Cold start on free hosting can take ~30–60s. Use **Load seeded demo** → **Run Audience Test**.)

![Thunder Audience Data](docs/images/01-audience-data.png)

## What Thunder does

1. Import historical audience comments (+ short creator context)  
2. Build **three** evidence-linked audience segments  
3. Rehearse the draft with three juror perspectives + a critic  
4. Show deterministic diagnostics and guardrails  
5. Generate an improved five-slide carousel and supporting evidence  
6. Optionally export a media package (PNG / PDF / VTT ZIP)

Every completed run is labeled **Live**, **Imported**, **Seeded demo**, or **Recovery fallback** — never silently faked as live.

## Working flow (6 stages)

| Stage | What you see |
|-------|----------------|
| Audience Data | Comments, context, draft, optional URL fetch |
| Audience Twin | Three segments with evidence IDs |
| Reaction Lab | Disagreement across segments |
| Diagnostics | Transparent scores + guardrails |
| Carousel | Improved slides + **Export media package** |
| Before / After | Score deltas + credibility |

## Screenshots

| Stage | Preview |
|-------|---------|
| Audience Data | ![input](docs/images/01-audience-data.png) |
| Running | ![running](docs/images/03-running.png) |
| Audience Twin | ![twin](docs/images/04-audience-twin.png) |
| Reaction Lab | ![jury](docs/images/05-reaction-lab.png) |
| Diagnostics | ![diagnostics](docs/images/06-diagnostics.png) |
| Carousel | ![carousel](docs/images/08-carousel-slides.png) |
| Before / After | ![before-after](docs/images/09-before-after.png) |

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Load seeded demo** → **Run Audience Test**.

Optional Studio (Postgres): set `DATABASE_URL`, run `npx prisma migrate deploy`, open `/studio`.

### Environment variables

Copy names from [`.env.example`](.env.example). Never commit real keys.

Minimum for Live language: `OPENAI_API_KEY` (or `FAL_KEY`).  
Without a language key, Seeded demo / Recovery fallback still works when fallback is enabled.

### Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run start
npm run test:e2e   # Playwright; forced seeded path
```

## Current limitations

- Does not predict views, virality, or revenue  
- Does not post to Instagram / TikTok / YouTube / LinkedIn  
- Optional Studio / Redis / S3 / Clerk / Stripe need env configuration  
- Cover, voiceover, Firecrawl, and n8n degrade to labeled recovery without keys  
- S3 upload interface is prepared; local `.data/exports` is the default ZIP store  

## What comes next

Next: additional content sources, stronger audience calibration, and optional creator-workflow integrations — in a **separate production repository**. This repo remains the stable Hackathon Edition.

Engineering handoff: [`docs/THUNDER_KNOWLEDGE_PACK.md`](docs/THUNDER_KNOWLEDGE_PACK.md) · Evidence contract: [`docs/INTEGRATION_CONTRACT.md`](docs/INTEGRATION_CONTRACT.md) · Scoring: [`docs/SCORING.md`](docs/SCORING.md)

## Licence

**GPL-3.0** — see [`LICENSE`](LICENSE).
