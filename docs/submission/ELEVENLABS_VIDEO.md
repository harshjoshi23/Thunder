# Thunder — ElevenLabs paste kit (one file)

Use this with [elevenlabs.io](https://elevenlabs.io) **Speech** (and optional Image & Video / Sound Effects).

**Recommended for submission:** your finished **~1 min 50 sec** screen recording + the VO in `ELEVENLABS_PASTE.txt` (~240–280 words at ~150 wpm).

**Do not use the old short ~40–50s block** — it is too short for a 1:50 video.

Primary paste file: [`ELEVENLABS_PASTE.txt`](./ELEVENLABS_PASTE.txt)

---

## A) Settings (Speech tab)

| Setting | Suggestion |
|---------|------------|
| Model | **Eleven Multilingual v2** (already selected is fine) |
| Voice | **Roger** (Laid-Back, Casual, Resonant) or any clear male/neutral voice |
| Speed | ~1.0 (or slightly slower if it rushes) |
| Stability | Medium–High (less wild emotion) |

1. Open **Speech**
2. Paste the **entire** contents of `ELEVENLABS_PASTE.txt` (also copied in **Block 1** below)
3. **Generate** → Download MP3/WAV
4. In Loom/QuickTime: sync the VO under your **1:50** Thunder screen recording (or re-record while playing this audio)

---

## B) Block 1 — paste into Speech (~1:50 / ~265 words)

Copy **everything inside the fence** into ElevenLabs (same text as `ELEVENLABS_PASTE.txt`):

```
This is Thunder. Test your post before your audience does.

Creators usually learn what landed only after they publish. Thunder rehearses first — grounded in your real audience comments, not invented personas.

On Home, the product is clear: paste historical comments, a short creator context, and your draft. Load the seeded demo anytime you want a fast, labeled walkthrough.

These inputs are evidence. Every later claim ties back to comment IDs you can check — nothing floats free of what your audience already said.

Click Run Audience Test. One click starts a multi-agent scenario graph: an audience twin, three parallel jurors, an adversarial critic, then deterministic TypeScript scoring. Watch the agents work in parallel instead of a single opaque score.

Here is the Audience Twin — three differentiated segments, each tied to validated comment evidence so you can see who is speaking and why they care.

Reaction Lab is the Jury. Segments disagree on purpose. Conflict is the signal: you see trade-offs before you post, not after the comments roll in.

Diagnostics stay transparent. Scores come from formulas in TypeScript — the model does not invent them. Guardrails flag exaggeration and missing context so the rehearsal stays honest and reviewable.

Strategy turns those trade-offs into a five-slide carousel, caption, call to action, and optional voiceover script — ready to ship or revise with intent.

Before and after uses the same formulas on original versus optimized. Audience fit goes up; misinterpretation risk goes down. Modes are labeled honestly — Live, Seeded demo, or Recovery fallback.

That’s Thunder. Test your post before your audience does.
```

**On-screen while this plays (~1:50):**

| Approx | Section | Show |
|--------|---------|------|
| 0–12s | Home | Logo / tagline / landing |
| 12–28s | Inputs | Seeded comments + draft + context |
| 28–42s | Run | Click **Run Audience Test** → agents running |
| 42–58s | Twin | Audience Twin / segments + evidence IDs |
| 58–78s | Jury | Reaction Lab — conflicting segment takes |
| 78–92s | Diagnostics | Scores, formulas, guardrails |
| 92–105s | Carousel | Five-slide strategy output |
| 105–118s | Before/After | Comparison table |
| 118s–1:50 | Close | Logo + tagline |

*(Adjust cuts slightly so VO lands with each page; total target ~1:50.)*

---

## C) Optional — ElevenLabs **Image & Video** prompt

If you unlock Image & Video mode, paste this as the generation prompt (not for the app UI — for a short bumper clip):

```
Premium product bumper, 9:16 or 16:9, dark storm-navy background, electric cyan accents, geometric Nordic storm-hammer logo with a clean lightning strike (original design, not Marvel), subtle UI mock of a creator tool called Thunder, text overlay: "Test your post before your audience does.", cinematic but minimal, no purple neon, no clutter, high-end SaaS aesthetic
```

Use as a 3–5s intro/outro only; keep the middle as **real app screen recording**.

---

## D) Optional — **Sound Effects** prompts (subtle)

Generate separately, mix quietly under VO (don’t overpower):

1. `Soft cinematic whoosh for UI transition, short, clean, no comedy`
2. `Distant soft thunder rumble, very short, premium brand sting, not scary`
3. `Subtle digital confirmation click, modern product UI`

---

## E) After you have the file

1. Upload video to **Loom** or **YouTube** (public or unlisted)
2. Paste the link into the hackathon portal → **2-minute video pitch**
3. Update `TODO_VIDEO_URL` in `docs/submission/PORTAL_FILL.md` if you want a local reminder

**Tip:** Portal says “2-minute”; your **~1:50** product demo + this VO is the intended length.
