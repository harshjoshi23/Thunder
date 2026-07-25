# Thunder in simple English

Thunder helps creators **rehearse** a post against their own audience comments before publishing.

1. Paste comments + a draft
2. Agents build 3 audience segments and argue about the draft
3. Transparent scores show fit / clarity / risk
4. A strategy agent rewrites a 5-slide carousel
5. Optional: cover image, voiceover, send to n8n

## Modes (always labeled)

| Badge | When |
|-------|------|
| **Live** | `FAL_KEY` set and LangGraph + fal succeeded |
| **Seeded demo** | Load seeded demo / force demo |
| **Recovery fallback** | Missing keys or pipeline error — same UI, clearly not Live |

## Models (via fal)

- Audience: `google/gemini-2.5-flash-lite`
- Jurors: `google/gemini-2.5-flash`
- Critic: `anthropic/claude-3-5-haiku`
- Strategy: `google/gemini-2.5-flash`
- Image: `fal-ai/flux/dev`
