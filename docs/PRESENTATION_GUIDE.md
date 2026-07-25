# Thunder — presentation guide

Total live block: **~7 minutes** (3 pitch + 2 demo + 2 Q&A).

## 3-minute pitch

| Min | Say |
|-----|-----|
| 0:00–0:40 | **Problem:** Creators only learn audience reaction *after* publishing. Gut edits miss segment conflict, weak evidence, and overclaim. |
| 0:40–1:30 | **What we built:** Thunder — a pre-publication scenario lab. Import comments → evidence-backed audience twin → multi-agent jury + critic → TypeScript diagnostics → optimized 5-slide carousel. Modes always labeled Live / Seeded demo / Recovery fallback. |
| 1:30–2:20 | **Why it is real tech:** LangGraph orchestration; OpenAI preferred for language agents (fal optional fallback + Flux covers); Zod validation; deterministic scoring (LLM does not invent 0–100); optional Firecrawl / ElevenLabs / n8n. **No login. No native social OAuth posting.** |
| 2:20–3:00 | **Honest limits:** Grounded simulation from *imported* comments — not live humans, not view prediction, not virality guarantee. Cover/voice/n8n need their keys. Close on tagline: *Test your post before your audience does.* |

Slides: [`docs/submission/Thunder_Pitch_Deck.pdf`](submission/Thunder_Pitch_Deck.pdf) (also `.pptx`).

## 2-minute demo

Follow [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md). Fast path:

1. Logo home → Load seeded demo → Run
2. Twin → Reaction Lab (point at disagreement)
3. Diagnostics (point at formula line)
4. Carousel → Before/After deltas
5. Mention Live badge if keys are live

## 2-minute Q&A — honest answers

| Question | Answer |
|----------|--------|
| Predict views? | No — scenario simulation with transparent scores. |
| Fake Live? | Never. Missing keys → Seeded / Recovery, labeled. |
| Why not ChatGPT alone? | Evidence IDs, Zod repair, TS scoring, parallel jurors, mode honesty, export path. |
| Models? | OpenAI `gpt-4o-mini` when `OPENAI_API_KEY` set; else fal any-llm; Flux for covers if `FAL_KEY`. |
| Social posting? | No OAuth. Optional n8n “approve & send” webhook only. |
| Auth? | No login for hackathon demo. |

More: [`judge-questions.md`](judge-questions.md).

---

## Portal field checklist

Paste these into the submission portal. Replace placeholders when you have public URLs.

| Field | Value |
|-------|--------|
| **Project name** | Thunder |
| **One-liner** | Test your post before your audience does. |
| **Repo URL** | https://github.com/harshjoshi23/Thunder |
| **Demo / live URL** | `TODO_DEMO_URL` — Render (or local recording only if deploy pending) |
| **Video URL** | `TODO_VIDEO_URL` — upload Loom/YouTube/Drive, then paste |
| **Pitch deck URL** | Repo path or uploaded file: `docs/submission/Thunder_Pitch_Deck.pdf` — `TODO_PITCH_PUBLIC_URL` if portal needs a direct link |
| **Samples / kit URL** | `docs/submission/Thunder_Submission_Kit.pdf` — `TODO_SAMPLES_URL` |
| **Screenshots** | `docs/images/` in repo (also embed in README) |

### What is ready vs you must fill

| Ready in repo | You must fill after upload/deploy |
|---------------|-----------------------------------|
| Code + README + architecture | Demo URL |
| Pitch PDF/PPTX + submission kit | Public pitch URL (if portal rejects raw GitHub blob) |
| Video script + ElevenLabs text | Recorded video URL |
| Screenshots in `docs/images/` | — |

---

## Deploy on Render (5 steps)

Render CLI was not available in this environment — use the dashboard:

1. Open [Render](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect `https://github.com/harshjoshi23/Thunder` (branch `main`)
3. Confirm `render.yaml` (Frankfurt, health check `/api/health`)
4. Set secrets (do not commit): at minimum `OPENAI_API_KEY`; optional `FAL_KEY`, `FIRECRAWL_API_KEY`, `ELEVENLABS_*`, `N8N_WEBHOOK_URL`, `NEXT_PUBLIC_APP_URL`
5. Deploy → copy the `.onrender.com` URL into `TODO_DEMO_URL` above

Local: see [`developer-setup.md`](developer-setup.md).

---

## Security reminder

If an OpenAI key was ever pasted into chat, logs, or a public commit: **rotate it** in the OpenAI dashboard. Never commit `.env.local`.
