# Thunder — developer setup

Env **names** only. Never commit `.env.local` or paste real keys into docs or git.

## Environment variables

Copy `.env.example` → `.env.local` and fill what you need:

| Name | Purpose |
|------|---------|
| `OPENAI_API_KEY` | Preferred live language path (audience / jurors / critic / strategy) |
| `OPENAI_*_MODEL` | Optional model overrides (`gpt-4o-mini` defaults) |
| `FAL_KEY` | fal LM fallback if OpenAI unset; required for live cover images |
| `FAL_*_MODEL` / `FAL_TEXT_ENDPOINT` / `FAL_IMAGE_MODEL` | fal catalog IDs |
| `FIRECRAWL_API_KEY` | Optional source URL scrape |
| `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` / `ELEVENLABS_MODEL_ID` | Optional voiceover |
| `N8N_WEBHOOK_URL` | Production webhook after workflow import |
| `N8N_API_URL` / `N8N_API_KEY` | Optional n8n API (unused by default UI path) |
| `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_URL` | Branding / metadata base |
| `THUNDER_ENABLE_FALLBACK` | Allow labeled recovery when live fails (default true) |
| `ANALYZE_TIMEOUT_MS` | Pipeline timeout |
| `FORCE_SEEDED_DEMO` | Force seeded path even with live keys |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Shared rate limits (else in-memory + warning) |
| `THUNDER_RATE_LIMIT` / `THUNDER_RATE_WINDOW_MS` | Rate limit defaults |
| `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Optional auth on costly routes |
| `THUNDER_API_TOKEN` | Optional Bearer token for scripts/CI |
| `SENTRY_DSN` | Optional error monitoring stub |

**Auth behavior:** if Clerk secret or `THUNDER_API_TOKEN` is set, `/api/cover`, `/api/voiceover`, `/api/source`, `/api/export/n8n`, and live `/api/analyze` require auth. Seeded / no-language-key analyze stays open (no paid LM burn). If auth env is unset, the public demo path stays open with rate limits only.

**Routing:** if `OPENAI_API_KEY` → OpenAI for language agents; else if `FAL_KEY` → fal `any-llm`; else Seeded demo / Recovery fallback. Cover images always need `FAL_KEY` for live Flux.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## n8n approve & send

1. Open n8n → **Workflows** → **Import from File**
2. Import [`n8n/thunder-approved-content.workflow.json`](../n8n/thunder-approved-content.workflow.json)
3. Open the **Webhook** node → copy the **Production** URL
4. Set `N8N_WEBHOOK_URL` in `.env.local` (or Render env)
5. **Activate** the workflow
6. In Thunder → Carousel → **Approve & Send to n8n**

API: `POST /api/export/n8n`

## Render (5 steps)

1. Dashboard → **New** → **Blueprint**
2. Connect GitHub repo `harshjoshi23/Thunder`, branch `main`
3. Confirm `render.yaml` (Frankfurt, health `/api/health`)
4. Set env vars from the table (minimum `OPENAI_API_KEY` for live agents; set `NEXT_PUBLIC_APP_URL` to the Render URL)
5. Deploy and open `/api/health`

## Local live smoke (optional, costs tokens)

With `OPENAI_API_KEY` set and `FORCE_SEEDED_DEMO=false`:

```bash
curl -s http://localhost:3000/api/health
# languagePath should be "openai"
```

Then run one Audience Test from the UI. Prefer `gpt-4o-mini` defaults to limit cost.

## Security

Rotate any API key that may have been exposed in chat, screenshots, or accidental commits. `.env.local` is gitignored — keep it that way.
