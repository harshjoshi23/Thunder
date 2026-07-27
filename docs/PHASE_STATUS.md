# Thunder phase status

Public tracker for Thunder OS build phases. Private strategy Word docs live in `docs/newThunder/` (gitignored).

**Live demo:** [https://thunder-psio.onrender.com](https://thunder-psio.onrender.com)  
**Repo:** [https://github.com/harshjoshi23/Thunder](https://github.com/harshjoshi23/Thunder)  
**Roadmap issue:** [Issue #1](https://github.com/harshjoshi23/Thunder/issues/1) (if present)

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

## Next — Phase 2 Media (not started)

PNG/PDF carousel, VO/subs, Remotion/FFmpeg reel worker, S3 assets → then private-repo gate.

## Later

- Phase 3 Publish — ZIP first, then OAuth (TikTok → YT → IG)  
- Phase 4 Teams → Phase 5 Circles → Phase 6 Network  
- Mobile (Expo) after Media + a publish path  

---

## You must do (ops)

1. Create Neon (or Render Postgres) → set `DATABASE_URL` on Render  
2. Run migrations: `npx prisma migrate deploy` (or build hook / one-off shell)  
3. Optional: Clerk keys if locking Studio/costly APIs; Stripe test keys for live billing  
4. Confirm `/api/health` shows `databaseConfigured: true` after deploy  
5. Keep sharing the seeded demo path for no-cost trials  
