# Judge questions — honest answers

## What is Thunder?

A **scenario-testing** workspace: import audience comments, draft a post, run an evidence-backed multi-agent jury, see before/after scores, export an improved carousel.

## Why not just ChatGPT?

Thunder adds: comment IDs as evidence, Zod validation + repair, deterministic TypeScript scoring, parallel juror nodes, labeled Live / Seeded demo / Recovery fallback, and optional cover / voiceover / n8n handoff.

## Are the agents “real”?

Yes when `FAL_KEY` is set: LangGraph calls `fal-ai/any-llm` with distinct models for audience, jurors, critic, and strategy. Scoring and evidence checks are TypeScript, not LLM.

## Which models?

| Role | ID |
|------|----|
| Audience | `google/gemini-2.5-flash-lite` |
| Jurors | `google/gemini-2.5-flash` |
| Critic | `anthropic/claude-3-5-haiku` |
| Strategy | `google/gemini-2.5-flash` |
| Image | `fal-ai/flux/dev` |
| Voice | `eleven_multilingual_v2` |

## Why fal not OpenAI direct?

Hackathon credits / unified routing via fal; OpenAI-only default was removed. Models are still selected through fal’s any-llm catalog.

## Does it predict views?

No. Explicitly a grounded simulation with transparent formulas.

## What if keys are missing?

UI still works. Badge shows **Seeded demo** or **Recovery fallback**. Never claims Live.

## Redis / Kafka?

Future scale idea only — not built for the hackathon.

## n8n?

Import `n8n/thunder-approved-content.workflow.json`, paste webhook into `N8N_WEBHOOK_URL`. Thunder never auto-posts to social.

## Keys judges should know we need

`FAL_KEY`, optional `FIRECRAWL_API_KEY`, `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID`, `N8N_WEBHOOK_URL`, Render env from `render.yaml`.
