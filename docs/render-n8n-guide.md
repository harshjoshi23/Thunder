# Render + n8n beginner guide (Thunder)

You said you are newer to Render and n8n. This is the friendly path.

---

## Part A — Render (host the Thunder website)

### What Render is
A cloud host. You give it your GitHub repo; it builds `npm run build` and runs `npm start`. People open a public URL — that is your **demo URL** for the hackathon portal.

### What Render is *not*
It does not host GPT for you. Models still come from OpenAI via your API key (optional).

### Steps

1. **Claim credits**  
   Open the Render claim portal from the hackathon dashboard → authorize GitHub → wait for the email with credits.

2. **Push Thunder to a public GitHub repo**  
   (Create repo on github.com → empty → then from this folder:)
   ```bash
   git remote add origin https://github.com/YOUR_USER/thunder.git
   git branch -M main
   git push -u origin main
   ```

3. **New Web Service on Render**  
   - New → Web Service → connect the repo  
   - Runtime: Node  
   - Build: `npm install && npm run build`  
   - Start: `npm start`  
   - Or use the included `render.yaml`

4. **Environment variables** (Render dashboard → Environment)
   - `OPENAI_API_KEY` = your key (optional; without it, demo/fallback still works)
   - `OPENAI_MODEL` = `gpt-4o`
   - `FORCE_MOCK` = `false`
   - `FAL_KEY` = optional
   - `N8N_WEBHOOK_URL` = optional (from Part B)

5. **Deploy** → copy the `https://….onrender.com` URL into the submission form.

### If Render is slow
Deploy the same app on **Vercel** as backup (`npx vercel --prod`). Same code.

---

## Part B — n8n (automation after you approve content)

### What n8n is
A workflow tool: “When Thunder sends JSON → save to Notion / Slack / Google Sheet.”

It does **not** replace Thunder’s AI. Thunder analyzes; n8n only **receives the approved result**.

### Redeem voucher
Code: `2026-COMMUNITY-HACKATHON-STUTTGART-90DE8BA5`  
Must be **n8n Cloud Pro** tier (not free/lower/higher). Expires about a week after the event.

### Tiny workflow (10 minutes)

1. In n8n Cloud: create workflow.
2. Add trigger: **Webhook** → method POST → copy Production URL.
3. Paste that URL into Render / `.env.local` as `N8N_WEBHOOK_URL`.
4. Add a second node, e.g. **Slack** or **Set** (to inspect JSON) or **Google Sheets**.
5. Activate the workflow.
6. In Thunder Carousel stage → click **Export to n8n** after you like the result.

### Example payload Thunder sends
```json
{
  "source": "thunder",
  "approved": true,
  "hook": "...",
  "slides": [{ "title": "...", "body": "..." }],
  "caption": "...",
  "cta": "..."
}
```

### Important
Do **not** wire n8n to auto-post Instagram in the hackathon unless you fully control it — keep export as “approved content out,” not “publish for me.”

---

## Part C — Other perks (quick)

| Perk | Do this |
|------|---------|
| Cursor $50 | https://cursor.com/referral?code=TL5VHAVU5D |
| fal `FALCURSOREVENT` | fal dashboard → billing → redeem → set `FAL_KEY` |
| ElevenLabs | Discord coupon → use for **video voiceover**, not the web UI |
| Firecrawl `FIRECRAWL10KCURSOR` | optional; not in Thunder core |

---

## Recommended order today

1. Form team **Thunder** on portal  
2. Push GitHub + deploy Render (demo URL)  
3. Record 2-min video (`docs/SPEAKER.md`)  
4. Pitch deck from `docs/pitch-deck.md`  
5. If time: fal cover + n8n webhook  
6. Submit  
