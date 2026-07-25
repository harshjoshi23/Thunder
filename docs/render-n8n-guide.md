# Render + n8n (beginner)

## Render

1. Push repo to GitHub (`harshjoshi23/Thunder`)
2. Render → New → Blueprint → select repo (`render.yaml`)
3. Region: Frankfurt (declared in yaml)
4. Health check: `/api/health`
5. Paste env vars from `.env.example` (at minimum `FAL_KEY` for Live)
6. Deploy → copy public URL into `NEXT_PUBLIC_APP_URL`

## n8n Cloud

1. Workflows → Import from File → `n8n/thunder-approved-content.workflow.json`
2. Open Webhook node → copy **Production** URL
3. Set `N8N_WEBHOOK_URL` on Render / local `.env.local`
4. Activate workflow
5. In Thunder: **Approve & Send to n8n**

Thunder never posts to LinkedIn/Instagram automatically — n8n only receives the approved payload.
