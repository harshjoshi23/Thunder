# Status summary

## Done

- fal-first LangGraph pipeline (audience → evidence → 3 parallel jurors → critic → TS score → strategy → optimized eval → verify)
- Modes: Live / Seeded demo / Recovery fallback
- APIs: health, source, analyze, cover, voiceover, export/n8n
- n8n importable workflow + README steps
- render.yaml (Frankfurt, `/api/health`)
- Tests for normalize, evidence, scoring, schemas, n8n payload
- Docs: README, architecture, demo-script, judge-questions

## Not done / out of scope

- Redis / Kafka scaling
- Render live deploy (needs your dashboard login + pasted keys)
- Social auto-post

## Keys to paste in `.env.local`

Copy from `.env.example`. Do not commit secrets.

- `FAL_KEY` (required for Live)
- `FIRECRAWL_API_KEY` (optional)
- `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (optional)
- `N8N_WEBHOOK_URL` (optional)
- `NEXT_PUBLIC_APP_URL` (after Render deploy)
