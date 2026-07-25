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

1. Paste the full script from [`ELEVENLABS_PASTE.txt`](./ELEVENLABS_PASTE.txt) into ElevenLabs Speech → download audio (**~1:50**, ~240–280 words). Do **not** use the old short ~40–50s block — it is too short for a 1:50 video. Cues/timing: [`ELEVENLABS_VIDEO.md`](./ELEVENLABS_VIDEO.md).
2. Sync VO under your finished ~1:50 screen recording (Home → inputs → Run → Twin → Jury → Diagnostics → Carousel → Before/After → close), or re-record with `npm run dev` + seeded demo while the audio plays.
3. Optional: Image & Video / SFX prompts are in `ELEVENLABS_VIDEO.md` if you unlock those modes.
4. Upload to Loom or YouTube (unlisted/public).
5. Paste the public link into the portal (replace `TODO_VIDEO_URL`).

---

## GitHub

```
https://github.com/harshjoshi23/Thunder
```

---

## Live demo URL (optional)

**Honest status:** Live demo is **NOT submitted** until a public `https://….onrender.com` URL exists. `172.x` / `localhost:3000` are local-only — do **not** paste them in the portal.

**ASAP Render deploy (~10 min) — 5 steps**

1. Open [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** → connect GitHub repo `harshjoshi23/Thunder` (uses root `render.yaml`).
2. Confirm service **thunder** (Node web, `npm install && npm run build`, start `npm run start`, health `/api/health`).
3. In **Environment**, set secrets (sync:false in blueprint): **required** `OPENAI_API_KEY`; optional `FAL_KEY`, `ELEVENLABS_API_KEY`, `FIRECRAWL_API_KEY`, n8n keys. Leave model defaults as in `render.yaml`.
4. Deploy → wait for green. Open the service URL → confirm `/` loads and `/api/health` returns JSON. Then set `NEXT_PUBLIC_APP_URL` to that exact `https://….onrender.com` URL and **Manual Deploy** once more.
5. Paste that public URL into the portal (replace below). Until then leave blank or keep the placeholder.

```
TODO_DEMO_URL
```

**Portal field:** Live demo URL → paste only the Render HTTPS URL (e.g. `https://thunder-xxxx.onrender.com`), never LAN IPs.

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
