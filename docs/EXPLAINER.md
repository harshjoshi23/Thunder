# Thunder — What we built (simple English)

This file explains the product in plain language so you can think clearly before the next steps.

---

## One-sentence story

**Thunder helps a creator test a draft post against their real audience comments — before they publish.**

Tagline: *Test your post before your audience does.*

---

## What problem does it solve?

Creators write carousels and captions, then guess how people will react.

They already have gold: old comments under past posts. Those comments show beginners, experts, skeptics, people who want tips, people who hate hype.

Thunder turns those comments into a small “audience twin,” runs a multi-agent rehearsal, shows where segments disagree, scores the draft with clear math, and suggests a stronger 5-slide carousel.

It is **not** Instagram. It does **not** post for you. It does **not** promise views or virality.

---

## Is this static / fake, or real?

**Both paths exist — same UI.**

| Mode | When | What happens |
|------|------|----------------|
| **Demo / fallback** | No OpenAI key, timeout, or error | Uses high-quality seeded analysis that matches the real schemas. App never goes blank. |
| **Live agents** | `OPENAI_API_KEY` is set | Real LangGraph run: 2 structured OpenAI calls + TypeScript scoring/evidence checks. |

So: the **screens and workflow are fully ready**. Live AI is ready when you add a key. Without a key, the whole demo still works (badge shows “Demo / fallback mode”).

This is **not** a static HTML mockup. It is a real Next.js app with APIs, Zod validation, tests, and a production build.

---

## The 3 main features (say these in the pitch)

### 1) Audience Twin (evidence-backed segments)
- Paste historical comments
- Thunder builds **exactly 3** audience segments
- Each segment shows **comment IDs** (C01, C02…) as proof
- Fake evidence IDs get stripped — we do not silently invent support

### 2) Reaction Lab (multi-agent scenario testing)
- Not three fake persona cards only
- A **LangGraph** pipeline with clear jobs:
  - Audience Research
  - Scenario Simulation (each segment reacts; they can disagree)
  - Adversarial Critic / guardrails (calls out hype, missing context, privacy risk)
  - Content Strategy (improved carousel)
  - Deterministic verification + scoring (TypeScript, not another LLM guess)

### 3) Diagnostics → Better carousel → Before/After
- Five transparent scores (audience fit, clarity, save potential, discussion, misinterpretation risk)
- Scores come from **formulas** in code, not “the model said 84”
- Optimized 5-slide carousel + caption + CTA
- **Before vs After** table — the memorable demo moment

---

## How you use the app (click path)

1. Open the app (`npm run dev` or your deployed URL).
2. Click **Load seeded demo** (or paste your own comments + draft).
3. Click **Run Audience Test**.
4. Walk stages with the top nav:
   - Audience Twin → who is in the room
   - Reaction Lab → how they clash
   - Diagnostics → what is weak (and why)
   - Carousel → improved 5 slides
   - Before / After → score lift
5. Optional: **Generate cover (fal.ai)** if `FAL_KEY` is set.
6. Optional: **Export to n8n** if webhook URL is set (approved content only — does not auto-post to Instagram).
7. **Reset demo** anytime for a clean run.

---

## Demo topic (current seed)

We use a **generic creator topic**: “how to stay consistent posting when you have a full-time job” — beginners vs busy professionals vs skeptics of hustle culture.

Not MCP/agent-nerd content, so judges from any track can follow instantly.

---

## What we wanted but did **not** ship (honest pitch lines)

Say this if asked:

> “I also wanted a small companion mobile flow and a ‘Poke this segment’ chat so you can argue with one audience twin live. That is cool for demos, but it is not the core. With limited time I shipped the full vertical slice — twin, jury, diagnostics, carousel, before/after — instead of half-building poke chat.”

### Is “Poke agents” worth it?
**Nice-to-have, not a winning feature by itself.**
- Advantage: interactive wow, judges can type a challenge.
- Risk: eats time, needs another LLM call, can feel gimmicky if the core path is incomplete.
- Verdict: mention as next step; do not block submission on it.

### “AI whip” / funny Instagram-style roast?
Same story: a short **Thunderbolt roast** one-liner under reactions can be funny. We added a light **Thunderbolt** quip line as flavor — not a separate product.

---

## Sponsor tools — what you need vs nice

| Tool | Need it? | Use |
|------|----------|-----|
| **Cursor $50** | Yes for build speed | Redeem referral |
| **OpenAI key** | For *live* agents | Your own billing / key in `.env.local` |
| **Render** | Yes for demo URL (sponsor) | Deploy Next.js — guide in `docs/render-n8n-guide.md` |
| **n8n** | Stretch for “export approved carousel” | Webhook export — not required for core |
| **fal.ai** | Stretch cover image | Already wired as optional button |
| **ElevenLabs** | **Not for UI** | Optional voiceover on your 2-min video |
| **Firecrawl** | Skip in-app | Optional research only |
| **Vercel** | Backup deploy if Render is slow | Same Next.js app |

**You do not need ElevenLabs or Vercel to make the UI look good.** Branding is CSS + SVG lightning. ElevenLabs = voice. Vercel = hosting alternative.

**Any more subscriptions?** Only if you want live agents: an OpenAI (or compatible) API key. Everything else for a working demo is covered by mock mode + Render + optional fal/n8n.

---

## Model hosting (simple answer)

- Models run via **OpenAI API** from the Next.js server (`/api/analyze`).
- You do **not** host a model on Render yourself.
- Render only hosts the **Thunder web app**.
- n8n does **not** host the model either — it can receive the finished carousel JSON and forward it to Notion/Slack/Drive later.

---

## Git / submission status

- Local git repo is initialized.
- First commit will include the app + docs.
- You still need: **public GitHub URL**, **live demo URL**, **2-min video**, **pitch deck URL**, and **team formed** on the portal.

See `docs/SPEAKER.md` for what to say out loud.
See `docs/render-n8n-guide.md` for deploy + n8n with screenshots-in-words.
