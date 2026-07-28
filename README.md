# Thunder

**Test your post before your audience does.**

Thunder is a pre-publication **audience intelligence** product for creators. You paste historical audience comments and a draft post. Thunder builds an evidence-backed model of that audience, rehearses how different segments may react, scores the draft with transparent formulas, and returns an improved five-slide carousel you can export.

It does **not** predict views, virality, revenue, or exact human behaviour. It is a grounded rehearsal from *your* imported comments — not a social network and not a fake analytics oracle.

**Live demo:** [https://thunder-psio.onrender.com](https://thunder-psio.onrender.com)  
Cold start on free hosting can take ~30–60 seconds. Use **Load seeded demo**, then **Run Audience Test**.

![Thunder Audience Data](docs/images/01-audience-data.png)

---

## Product flow

```text
Historical comments
  → three evidence-backed audience segments
  → your draft
  → three simulated audience reactions
  → transparent diagnostic scores + guardrails
  → improved five-slide carousel
  → optional media ZIP export
```

### Stages in the app

| Stage | What you get |
|-------|----------------|
| **Audience Data** | Paste comments, creator context, draft; optional URL fetch |
| **Audience Twin** | Exactly three segments, each tied to comment evidence IDs |
| **Reaction Lab** | How each segment understands, values, and challenges the draft |
| **Diagnostics** | Fit, clarity, save/discussion signals, misinterpretation risk |
| **Carousel** | Improved hook, five slides, caption, CTA; export ZIP |
| **Before / After** | Score deltas and credibility panel |

### Mode labels (always visible)

| Mode | Meaning |
|------|---------|
| **Live** | Language models ran successfully on your inputs |
| **Imported** | Comments arrived via a validated evidence package |
| **Seeded demo** | Built-in sample path for demos (no paid API required) |
| **Recovery fallback** | Missing keys or a pipeline error — same UI, clearly not Live |

Never treat Seeded or Recovery as Live audience truth.

---

## Screenshots

| Stage | Preview |
|-------|---------|
| Audience Data | ![input](docs/images/01-audience-data.png) |
| Running | ![running](docs/images/03-running.png) |
| Audience Twin | ![twin](docs/images/04-audience-twin.png) |
| Reaction Lab | ![jury](docs/images/05-reaction-lab.png) |
| Diagnostics | ![diagnostics](docs/images/06-diagnostics.png) |
| Carousel | ![carousel](docs/images/08-carousel-slides.png) |
| Before / After | ![before-after](docs/images/09-before-after.png) |

---

## How it works (technical summary)

- **App:** Next.js (App Router) + TypeScript + Tailwind  
- **Orchestration:** LangGraph.js — normalize comments → audience research → evidence check → three parallel jurors → critic → TypeScript scoring → strategy → verify  
- **Language:** OpenAI when `OPENAI_API_KEY` is set; otherwise fal.ai `any-llm` if `FAL_KEY` is set  
- **Scores:** LLM rates factors 0–10; final 0–100 diagnostics are **deterministic TypeScript** (see [`docs/SCORING.md`](docs/SCORING.md))  
- **Evidence:** Comment IDs (`C01`…) only — invalid citations are repaired or retried  
- **Export:** PNG slides + PDF + subtitles/VTT storyboard in a downloadable ZIP  
- **Optional:** Studio (`/studio`) with Postgres, cover (fal), voiceover (ElevenLabs), Firecrawl source fetch, n8n webhook  

---

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Load seeded demo** → **Run Audience Test**.

### Useful commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

### Environment

Copy variable **names** from [`.env.example`](.env.example). Never commit real keys.

| Need | Variables |
|------|-----------|
| Live language path | `OPENAI_API_KEY` (preferred) or `FAL_KEY` |
| Live cover images | `FAL_KEY` |
| Voiceover | `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` |
| Optional URL scrape | `FIRECRAWL_API_KEY` |
| Optional Studio | `DATABASE_URL` then `npx prisma migrate deploy` |
| Optional shared rate limits | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |

Without a language key, Seeded demo / Recovery fallback still work when fallback is enabled (`THUNDER_ENABLE_FALLBACK`).

More setup detail: [`docs/developer-setup.md`](docs/developer-setup.md) · simple English: [`docs/EXPLAINER.md`](docs/EXPLAINER.md)

---

## Studio and export (optional)

- **Studio** (`/studio`): save projects and runs when Postgres (`DATABASE_URL`) is configured. The main lab on `/` works without a database.  
- **Export media package:** from the Carousel stage (or a Studio run). ZIP includes slide PNGs, PDF, VTT, captions, and a reel helper script.  

---

## Honest limits

- Not a view / virality / revenue predictor  
- Does not post to Instagram, TikTok, YouTube, or LinkedIn  
- Segments describe communication patterns from **imported comments**, not medical, political, or private-identity profiling  
- Optional integrations degrade with a clear Recovery label when keys are missing  

---

## Licence

**GPL-3.0** — see [`LICENSE`](LICENSE).
