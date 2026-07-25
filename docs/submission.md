# Submission Checklist — Thunder

## Before coding (you must do in portal)
- [ ] Form team **Thunder** on the hackathon dashboard (1 member OK)
- [ ] Redeem Cursor $50 credit: https://cursor.com/referral?code=TL5VHAVU5D
- [ ] Redeem fal.ai: code `FALCURSOREVENT` in billing settings
- [ ] Claim Render credits via claim portal (authorize GitHub)
- [ ] (Optional) ElevenLabs Discord coupon with registration email
- [ ] (Optional) n8n voucher `2026-COMMUNITY-HACKATHON-STUTTGART-90DE8BA5`
- [ ] (Optional) Firecrawl `FIRECRAWL10KCURSOR`

## Portal submission fields
- [ ] Public GitHub repository URL
- [ ] Working demo URL (Render or Vercel)
- [ ] 2-minute demo video URL
- [ ] Pitch deck URL (max ~5 slides) — content ready in `docs/pitch-deck.md`
- [ ] Generated samples / screenshots (optional but recommended) — see `docs/samples/`

## Deploy (pick one)

### Vercel (fastest for Next.js)
```bash
npx vercel --prod
# set OPENAI_API_KEY (optional), FAL_KEY (optional) in project env
```

### Render (sponsor credits)
1. Push repo to GitHub
2. New Web Service from `render.yaml`
3. Set env vars from `.env.example`

## Record 2-min video
Follow `docs/demo-script.md`. Upload to YouTube/Drive (public or unlisted).

## Finals format (if selected)
3 min pitch + 2 min demo + 2 min Q&A
