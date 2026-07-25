# Thunder — portal fill (creators-ecosystem.de)

Paste-ready. Replace only `TODO_*` after you upload/deploy.

---

## Team name

```
Thunder
```

---

## Brief description (1–3 sentences)

```
Thunder is audience intelligence and scenario testing for creators: paste historical comments plus a draft, run a multi-agent jury rehearsal grounded in comment evidence, then ship a better five-slide carousel before you publish. Modes are labeled honestly — Live, Seeded demo, or Recovery fallback. Tagline: Test your post before your audience does.
```

---

## Project logo

Upload this file (512×512 PNG, square):

- Relative: `docs/submission/Thunder_Logo.png`
- Absolute (this machine): `/Users/harsh/Desktop/reposjuly26/cursorHackthron/docs/submission/Thunder_Logo.png`
- Also available: `docs/submission/Thunder_Logo.svg` (prefer PNG for the portal)

---

## 2-minute video

```
TODO_VIDEO_URL
```

**How to make it (5 steps)**

1. Open gitignored `docs/video-recording-private.md` (full script + ElevenLabs TTS).
2. Run `npm run dev` → Load seeded demo (or Live if keys set) → record screen + voice (~2 min).
3. Optional: paste the ElevenLabs block from that private file for VO.
4. Upload to Loom or YouTube (unlisted/public).
5. Paste the public link here and into the portal (replace `TODO_VIDEO_URL`).

---

## GitHub

```
https://github.com/harshjoshi23/Thunder
```

---

## Live demo URL (optional)

**Honest status:** No public `.onrender.com` URL in the repo/env yet. Leave blank if short on time — GitHub + video are enough.

If you deploy ASAP:

1. Render → New → Blueprint → connect `harshjoshi23/Thunder` (`render.yaml` present)
2. Set at least `OPENAI_API_KEY`; set `NEXT_PUBLIC_APP_URL` to the Render URL
3. Paste:

```
TODO_DEMO_URL
```

---

## Pitch deck URL

**Prefer (Drive, anyone with link):** upload `docs/submission/Thunder_Pitch_Deck.pdf` → share → paste link.

**Or GitHub:**

```
https://github.com/harshjoshi23/Thunder/blob/main/docs/submission/Thunder_Pitch_Deck.pdf
```

Raw (if portal wants a direct file):

```
https://github.com/harshjoshi23/Thunder/raw/main/docs/submission/Thunder_Pitch_Deck.pdf
```

Placeholder if Drive not ready yet:

```
TODO_PITCH_PUBLIC_URL
```

---

## Google Drive samples (or GitHub fallback)

Suggested Drive folder contents: screenshots from `docs/images/`, carousel sample, `Thunder_Submission_Kit.pdf`.

**GitHub fallbacks (no Drive yet):**

```
https://github.com/harshjoshi23/Thunder/tree/main/docs/images
```

```
https://github.com/harshjoshi23/Thunder/blob/main/docs/submission/Thunder_Submission_Kit.pdf
```

Placeholder:

```
TODO_SAMPLES_URL
```

---

## Sponsors — tick these

| Sponsor | Tick? | Why (one line) |
|---------|-------|----------------|
| **Cursor** | YES | Built entirely in Cursor |
| **fal.ai** | YES | fal client in repo: LM fallback (`src/lib/fal/lm.ts`) + Flux covers (`src/lib/fal/image.ts`); `FAL_KEY` in `render.yaml` |
| **ElevenLabs** | YES | `/api/voiceover` calls ElevenLabs TTS; also used for video VO |
| **Render** | YES | `render.yaml` blueprint in repo (deploy path for demo) |
| **n8n** | YES | Workflow JSON + `POST /api/export/n8n` approve-and-send |
| **Firecrawl** | YES | `/api/source` Firecrawl scrape when `FIRECRAWL_API_KEY` set |

Do **not** claim live production usage of every optional key — the **code + blueprint** integrations above are what the portal is asking for.
