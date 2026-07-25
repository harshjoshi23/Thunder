# Thunder — portal fill (creators-ecosystem.de)

**Final paste-ready values** for the submission form. Replace only `TODO_VIDEO_URL` after you upload the video.

**Demo status (checked ASAP):** No `*.onrender.com` URL in docs, env hosts (`NEXT_PUBLIC_APP_URL` is local/private only), or remotes. Official Render CLI not installed / not authenticated (`RENDER_API_KEY` unset). **No public demo URL — leave Live demo blank.**

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

You must upload Loom/YouTube and paste the public link. Script/cues: [`ELEVENLABS_PASTE.txt`](./ELEVENLABS_PASTE.txt), [`ELEVENLABS_VIDEO.md`](./ELEVENLABS_VIDEO.md).

---

## GitHub

```
https://github.com/harshjoshi23/Thunder
```

---

## Live demo URL (optional)

**Leave blank.** No public demo URL found. Do not paste `localhost`, LAN/`172.x`, or invented `onrender.com` hosts.

(After you deploy via `render.yaml` on Render, paste the real `https://….onrender.com` URL here and in the portal.)

```
(leave blank)
```

---

## Pitch deck URL

**Blob (preferred for portal “page” link):**

```
https://github.com/harshjoshi23/Thunder/blob/main/docs/submission/Thunder_Pitch_Deck.pdf
```

**Raw (direct file download):**

```
https://github.com/harshjoshi23/Thunder/raw/main/docs/submission/Thunder_Pitch_Deck.pdf
```

Local file if uploading to Drive instead: `docs/submission/Thunder_Pitch_Deck.pdf`

---

## Samples / supporting materials

**GitHub tree (images + assets):**

```
https://github.com/harshjoshi23/Thunder/tree/main/docs/images
```

**Submission kit PDF:**

```
https://github.com/harshjoshi23/Thunder/blob/main/docs/submission/Thunder_Submission_Kit.pdf
```

---

## Sponsors — tick YES for all

| Sponsor | Tick? | Why (one line) |
|---------|-------|----------------|
| **Cursor** | YES | Built entirely in Cursor |
| **fal.ai** | YES | fal client in repo: LM fallback (`src/lib/fal/lm.ts`) + Flux covers (`src/lib/fal/image.ts`); `FAL_KEY` in `render.yaml` |
| **ElevenLabs** | YES | `/api/voiceover` calls ElevenLabs TTS; also used for video VO |
| **Render** | YES | `render.yaml` Blueprint in repo for the Next.js web service deploy path |
| **n8n** | YES | Workflow JSON + `POST /api/export/n8n` approve-and-send |
| **Firecrawl** | YES | `/api/source` Firecrawl scrape when `FIRECRAWL_API_KEY` set |

Do **not** claim live production usage of every optional key — the **code + blueprint** integrations above are what the portal is asking for.
