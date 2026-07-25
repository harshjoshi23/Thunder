# Thunder in simple English

Thunder helps creators **rehearse** a post against their own audience comments before publishing.

1. Paste comments + a draft
2. Agents build 3 audience segments and argue about the draft
3. Transparent scores show fit / clarity / risk
4. A strategy agent rewrites a 5-slide carousel
5. Optional: cover image, voiceover, send to n8n

No login. No native social posting.

## Modes (always labeled)

| Badge | When |
|-------|------|
| **Live** | Language agents succeeded with OpenAI (or fal LM fallback) |
| **Seeded demo** | Load seeded demo / force demo |
| **Recovery fallback** | Missing keys or pipeline error — same UI, clearly not Live |

## Models

- **Preferred language:** OpenAI (`gpt-4o-mini` defaults) when `OPENAI_API_KEY` is set
- **Fallback language:** fal.ai `any-llm` when only `FAL_KEY` is set
- **Cover image:** fal Flux when `FAL_KEY` is set
- **Voice:** ElevenLabs when configured
