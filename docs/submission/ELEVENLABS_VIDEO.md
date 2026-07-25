# Thunder — ElevenLabs paste kit (one file)

Use this with [elevenlabs.io](https://elevenlabs.io) **Speech** (and optional Image & Video / Sound Effects).

**Recommended for submission:** a **40–50 second** product clip + this VO.  
Optional: longer ~2 min version at the bottom.

---

## A) Settings (Speech tab)

| Setting | Suggestion |
|---------|------------|
| Model | **Eleven Multilingual v2** (already selected is fine) |
| Voice | **Roger** (Laid-Back, Casual, Resonant) or any clear male/neutral voice |
| Speed | ~1.0 (or slightly slower if it rushes) |
| Stability | Medium–High (less wild emotion) |

1. Open **Speech**
2. Paste **Block 1** below
3. **Generate** → Download MP3/WAV
4. In Loom/QuickTime: record Thunder screen (`npm run dev` → Load seeded demo → Run → Twin → Jury → Before/After) while playing this audio, **or** speak live using the same words

---

## B) Block 1 — paste into Speech (~40–50 seconds)

Copy **everything inside the fence** into ElevenLabs:

```
This is Thunder. Test your post before your audience does.

Creators usually find out what landed only after they publish. Thunder rehearses first.

Paste your real audience comments and a draft. One click runs a multi-agent jury: an audience twin, three conflicting reactions, guardrails, and transparent scores.

Then you get a stronger five-slide carousel — and a clear before-versus-after.

Not a view predictor. A grounded rehearsal from your comments.

That’s Thunder.
```

**On-screen while this plays (~45s):**

| Approx | Show |
|--------|------|
| 0–8s | Home / logo / tagline |
| 8–18s | Seeded comments + draft inputs |
| 18–28s | Click **Run Audience Test** → running agents |
| 28–38s | Audience Twin or Reaction Lab (disagreement) |
| 38–50s | Before / After table → end on logo |

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

## E) Block 2 — longer VO (~2 min) if you need it

```
This is Thunder — test your post before your audience does.
Creators usually learn what landed only after they publish. Thunder rehearses the post first.

You paste historical comments, a short creator context, and a draft. Evidence comes from your comments — not invented personas.

One click runs a multi-agent scenario graph: an audience twin, three parallel jurors, an adversarial critic, then deterministic TypeScript scoring.

Here is the audience twin — three differentiated segments, each tied to validated comment evidence IDs.

Reaction Lab surfaces disagreement on purpose. Segments conflict — that’s the point. You see trade-offs before you post.

Diagnostics are transparent formulas in TypeScript — the model does not invent the scores. Guardrails flag exaggeration and missing context.

Strategy resolves the trade-offs into a five-slide carousel, caption, call to action, and optional voiceover script.

Before and after: same formulas on original versus optimized. Audience fit up, misinterpretation risk down.
Live, Seeded demo, or Recovery fallback — always labeled honestly.
That’s Thunder.
```

---

## F) After you have the file

1. Upload video to **Loom** or **YouTube** (public or unlisted)
2. Paste the link into the hackathon portal → **2-minute video pitch**
3. Update `TODO_VIDEO_URL` in `docs/submission/PORTAL_FILL.md` if you want a local reminder

**Tip:** Portal says “2-minute”; a tight **45–90s** product demo is fine if the platform allows — check the form. If it requires ~2 min, use **Block 2** or slow the screen tour and keep Block 1 as the VO spine with a few extra seconds of Before/After.
