# Thunder phase status

Public tracker for Thunder OS build phases. Private strategy Word docs live in `docs/newThunder/` (gitignored).

**Live demo:** [https://thunder-psio.onrender.com](https://thunder-psio.onrender.com)  
**Repo:** [https://github.com/harshjoshi23/Thunder](https://github.com/harshjoshi23/Thunder)  
**Roadmap issue:** [Issue #1](https://github.com/harshjoshi23/Thunder/issues/1) (if present)

Architecture target over time: **Postgres + Redis + S3 + Clerk**. Phase 0 is Harden only.

---

## Phase 0 — Harden — DONE (code shipped)

| Item | Status | Notes |
|------|--------|--------|
| gitignore `docs/newThunder/` | Done | Private strategy docs stay local |
| Redis-backed rate limits | Done | Upstash REST; in-memory fallback + warning |
| Auth foundation | Done | Clerk / `THUNDER_API_TOKEN`; seeded/no-LM analyze stays open |
| CI (lint, typecheck, vitest, build) | Done | `.github/workflows/ci.yml` |
| Terms + Privacy | Done | `/terms`, `/privacy` |
| Sentry | Stub | `SENTRY_DSN` env; install `@sentry/nextjs` when ready |
| README personal-product framing | Done | Demo path preserved |
| Product repo fork | Deferred | Continue in this repo; fork steps in `docs/newThunder/README.md` (local) |

**Gate (you verify):** no uncontrolled spend, no high-severity secret leak, stable public demo after you set Redis/rotate keys.

---

## Next — Phase 1 Studio (not started)

Accounts + Postgres, projects / twins / brand kits, CSV import, Stripe Free vs Creator Pro.

## Later

- Phase 2 Media — PNG/PDF, VO/subs, Remotion/FFmpeg, S3 → then private-repo gate  
- Phase 3 Publish — ZIP first, then OAuth (TikTok → YT → IG)  
- Phase 4 Teams → Phase 5 Circles → Phase 6 Network  
- Mobile (Expo) after Media + a publish path  

---

## You must do (ops)

1. Rotate any OpenAI key that may have been exposed; set a hard provider budget  
2. On Render: set `NEXT_PUBLIC_APP_URL`, Upstash Redis URL/token, optional Clerk + `SENTRY_DSN`  
3. Confirm `/api/health` shows `redisConfigured` / `authConfigured` as expected  
4. Keep sharing the seeded demo path for no-cost trials  
