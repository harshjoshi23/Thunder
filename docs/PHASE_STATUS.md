# Thunder phase status

Public tracker for Thunder OS build phases. Private strategy Word docs live in `docs/newThunder/` (gitignored).

**Live demo:** [https://thunder-psio.onrender.com](https://thunder-psio.onrender.com)  
**Repo:** [https://github.com/harshjoshi23/Thunder](https://github.com/harshjoshi23/Thunder)  
**Roadmap issue:** [GitHub issue #1](https://github.com/harshjoshi23/Thunder/issues/1) (if present)

Architecture target over time: **Postgres + Redis + S3 + Clerk**.

---

## Phase 0 — Harden — DONE

| Item | Status | Notes |
|------|--------|--------|
| gitignore `docs/newThunder/` | Done | Private strategy docs stay local |
| Redis-backed rate limits | Done | Upstash REST; in-memory fallback + warning |
| Auth foundation | Done | Clerk / `THUNDER_API_TOKEN`; seeded/no-LM analyze stays open |
| CI (lint, typecheck, vitest, build) | Done | `.github/workflows/ci.yml` |
| Terms + Privacy | Done | `/terms`, `/privacy` |
| Sentry | Stub | `SENTRY_DSN` env; install `@sentry/nextjs` when ready |
| README personal-product framing | Done | Demo path preserved |

---

## Phase 1 — Studio — DONE (code shipped)

| Item | Status | Notes |
|------|--------|--------|
| Postgres schema (Prisma) | Done | User, Workspace, BrandKit, AudienceSource, AudienceTwin, Project, DraftVersion, AnalysisRun, Subscription |
| Migrations checked in | Done | `prisma/migrations/` — run `npx prisma migrate deploy` |
| Studio APIs | Done | `/api/studio/*` projects, runs, twins, brand-kits, CSV import, entitlement |
| Studio UI | Done | `/studio` + `/studio/[id]` — main `/` demo unchanged |
| CSV → AudienceSource | Done | `POST /api/studio/import/csv` |
| Billing stub | Done | Free (5 runs/mo) vs Creator Pro; Stripe webhook stub |
| DB missing → 503 | Done | App builds without `DATABASE_URL`; Studio APIs clear 503 |
| Optional local Postgres | Done | `docker-compose.yml` |
| Unit tests | Done | entitlement + CSV parse (no live DB / no OpenAI) |

**Gate (you verify with real users later):** 20 users × 2+ runs; ~30% weekly return.

---

## Phase 2 — Media — DONE (code shipped)

| Item | Status | Notes |
|------|--------|--------|
| PNG carousel (5 slides) | Done | Deterministic bitmap renderer + SVG companions; brand tokens |
| PDF export | Done | `carousel.pdf` via pdf-lib |
| VTT + captions.json | Done | Estimated timings from voiceover script (works without audio) |
| Aspect ratio helpers | Done | IG/TikTok/LinkedIn/Stories presets |
| ZIP media package API | Done | `POST /api/media/package` → downloadable ZIP |
| Local / S3 storage | Done | `.data/exports` + `/api/media/files/*`; S3 env interface ready |
| MediaAsset Prisma model | Done | Migration `20260728010000_media_assets` |
| FFmpeg reel path | Done | `compose-reel.sh` inside ZIP + `npm run media:reel` (no GPU; optional) |
| Optional ElevenLabs in package | Done | `includeVoiceover: true` when keys set; else VTT-only |
| Optional fal cover URL | Done | Pass `coverImageUrl` into package provenance |
| UI export | Done | Carousel “Export media package”; Studio run detail button |
| Unit tests | Done | `tests/media.test.ts` — no OpenAI / no fal credits |

**Gate (you verify):** ≥25% of completed analyses produce a downloadable media package.

**After Phase 2 gate:** product repo → private; hackathon archive stays public.

---

## Next — Phase 3 Publish (not started)

ZIP already exists — next is OAuth vault, TikTok draft → YT private → IG; approval + retries. Do **not** silent auto-post.

## Later

- Phase 4 Teams → Phase 5 Circles → Phase 6 Network  
- Mobile (Expo) after Media + a publish path  

---

## You must do (ops)

1. Create Neon (or Render Postgres) → set `DATABASE_URL` on Render  
2. Run migrations: `npx prisma migrate deploy` (includes MediaAsset)  
3. Optional: Clerk keys; Stripe test keys; **S3/R2** for durable exports (`S3_BUCKET` + keys)  
4. Optional: install **ffmpeg** on the host if you want `compose-reel.sh` → MP4  
5. Confirm `/api/health` shows `databaseConfigured` / `s3Configured` as expected  
6. Keep sharing the seeded demo path for no-cost trials  
7. Visual QA of exported PNG/PDF/VTT ZIP on cloud  
