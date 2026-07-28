# Bootstrap a new production repository

This Hackathon Edition stays frozen. Build YouTube / TikTok / Instagram ingestion and partnership features **elsewhere**.

## Copy into the new repo

- `src/lib/agents/**` (LangGraph jury)
- `src/lib/scoring/**`
- `src/lib/evidence/**` + `src/lib/evidence-pack/**`
- `src/lib/schemas/**`
- `src/lib/media/**` (ZIP export)
- `src/lib/mock/**` (seeded/recovery)
- Core UI stages under `src/components/stages/**` and `ModeBadge`
- `docs/SCORING.md`, `docs/INTEGRATION_CONTRACT.md`, `docs/THUNDER_KNOWLEDGE_PACK.md`
- Tests that cover scoring, evidence, evidence-pack, schemas
- Licence (GPL-3.0) — confirm compatibility for your entity

## Do not copy (or rewrite first)

- Hackathon submission kits / pitch PDFs as product source of truth
- Partner-specific or accelerator strategy docs (`docs/newThunder` is private anyway)
- Stub S3/Stripe/Sentry as if production-complete
- Travel / thesis / employer code (none should be here; keep it that way)
- Assumptions that Studio Prisma schema is final SaaS multi-tenant design

## Suggested folder boundaries (new repo)

```
apps/web          # Next.js Thunder lab + Studio
packages/core     # agents, scoring, evidence-pack, schemas
packages/ingest   # YouTube/TikTok/IG connectors → EvidencePack
services/worker   # media render / publish jobs later
```

## Reuse vs rewrite

| Component | Guidance |
|-----------|----------|
| LangGraph + scoring + Zod | Reuse |
| EvidencePack contract | Reuse as API boundary |
| Six-stage UI | Reuse / restyle later |
| Mode labelling | Reuse |
| Media ZIP | Reuse; add real object storage |
| Prisma Studio schema | Evolve; don’t freeze as gospel |
| Auth | Rewrite with full Clerk (or Auth.js) UI |
| Publish OAuth | New package; not in hackathon repo |

## First five implementation tasks (new repo)

1. Monorepo scaffold + copy `packages/core`  
2. Ingest service: YouTube comments → `EvidencePack` + unit tests  
3. `POST /analyze` accepting `evidencePack` only  
4. Production Postgres + migrations + secrets vault  
5. Auth + rate limits + spend caps before public beta  

## Integration boundary

```
[Ingestion service] --EvidencePack--> [Thunder analyze]
```

Ingestion owns OAuth and platform quotas. Thunder owns twin / jury / scores / carousel.

## IP-safe transfer checklist

- [ ] No secrets in git history of files you copy  
- [ ] Confirm GPL-3.0 obligations for distribution  
- [ ] No third-party proprietary code pasted in  
- [ ] Partner MoU: who owns ingest vs Thunder core  
- [ ] Tag this repo `thunder-hackathon-final-2026` before branching product work  

## Risks of copying the whole app blindly

- Phase stubs look “done” but are not production  
- Public demo auth model is intentionally open  
- Bundle size / free Render constraints  
- Mixing partnership roadmap into public README again  
