# Thunder — developer setup

Env **names** only. Never commit `.env.local` or paste real keys into docs.

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

## Render

1. Connect the GitHub repo
2. Use `render.yaml` (Frankfurt, health `/api/health`)
3. Set env vars from the table above (at minimum `OPENAI_API_KEY` for live agents)

## Local live smoke (optional, costs tokens)

With `OPENAI_API_KEY` set and `FORCE_SEEDED_DEMO=false`:

```bash
curl -s http://localhost:3000/api/health
# languagePath should be "openai"
```

Then run one Audience Test from the UI. Prefer `gpt-4o-mini` defaults to limit cost.
