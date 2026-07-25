# Judge questions — honest answers

## What is Thunder?

A **scenario-testing** workspace: import audience comments, draft a post, run an evidence-backed multi-agent jury, see before/after scores, export an improved carousel.

## Why not just ChatGPT?

Thunder adds: comment IDs as evidence, Zod validation + repair, deterministic TypeScript scoring, parallel juror nodes, labeled Live / Seeded demo / Recovery fallback, and optional cover / voiceover / n8n handoff.

## Are the agents “real”?

Yes when a language key is set: LangGraph calls **OpenAI** (preferred) or fal `any-llm` with distinct roles for audience, jurors, critic, and strategy. Scoring and evidence checks are TypeScript, not LLM.

## Which models?

| Role | Default |
|------|---------|
| Audience / Jurors / Critic / Strategy | OpenAI `gpt-4o-mini` when `OPENAI_API_KEY` set |
| Language fallback | fal any-llm (Gemini / Claude catalog IDs in `render.yaml`) |
| Image | `fal-ai/flux/dev` |
| Voice | `eleven_multilingual_v2` |

## Does it predict views?

No. Explicitly a grounded simulation with transparent formulas.

## What if keys are missing?

UI still works. Badge shows **Seeded demo** or **Recovery fallback**. Never claims Live.

## Social posting / login?

No OAuth to Instagram, TikTok, Reddit, or Twitter. No user login for the hackathon demo. Optional n8n webhook after human approve.

## n8n?

Import `n8n/thunder-approved-content.workflow.json`, paste webhook into `N8N_WEBHOOK_URL`. Thunder never auto-posts to social.

## Keys for a Live demo

`OPENAI_API_KEY` (preferred), optional `FAL_KEY`, `FIRECRAWL_API_KEY`, `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID`, `N8N_WEBHOOK_URL`. See `render.yaml` / [developer-setup.md](developer-setup.md).
