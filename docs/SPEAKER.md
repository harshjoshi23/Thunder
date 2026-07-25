# Thunder — Speaker file (what to say)

Use this like a teleprompter. Simple English. Story style.

Time boxes assume **3 min pitch + 2 min demo** if you reach finals. For the **2-min submission video**, use the shorter cut at the bottom.

---

## Opening (20–30 seconds)

“Hi — I’m Harsh, and this is **Thunder**.

Creators don’t fail because they can’t write. They fail because they publish blind.

They already have the answer in their comments — beginners asking for basics, experts asking for proof, skeptics calling out hype — but nobody turns that into a rehearsal before posting.

Thunder’s idea is simple: **test your post before your audience does.**”

---

## Problem story (30 seconds)

“Imagine you draft a carousel: ‘Post every day or you’ll never grow.’

Your quiet beginners feel overwhelmed. Your busy professionals want a 20-minute plan. Your skeptics hate hustle culture.

If you publish that draft raw, one group loves it and two groups bounce — or worse, argue under the post.

Thunder builds an **audience twin** from real comments, runs a **multi-agent scenario test**, and shows the disagreement *before* you hit publish.”

---

## What we built — the 3 features (45–60 seconds)

“Three main features.

**One — Audience Twin.** You paste historical comments. We make three clear segments, each with evidence IDs linked to real comments. No silent fake quotes.

**Two — Reaction Lab.** This is real agent orchestration with LangGraph — research, simulate reactions, adversarial critic for guardrails — not three static persona cards.

**Three — Diagnostics and rewrite.** Scores are calculated with transparent formulas in TypeScript. Then a content-strategy agent proposes a five-slide carousel. We show **before versus after** so you can see the lift.”

---

## Honest scope (15–20 seconds) — say this, it builds trust

“With hackathon time, I focused on one complete workflow that works end to end — including a demo fallback if the model is slow.

I wanted extras like a ‘poke this segment’ chat and a tiny mobile companion app. I didn’t ship those, on purpose, so the core stays solid. Those are next.”

---

## Tech one-liner for judges (15 seconds)

“Stack is Next.js, Zod contracts, LangGraph with two structured OpenAI calls, deterministic evidence checks and scoring on the server. Optional fal cover image and n8n export of approved content — no auto-posting to social.”

---

## Demo talk-track (2 minutes)

While you click:

1. “Seeded demo — consistency posting with a full-time job. Mixed audience comments.”
2. “Run Audience Test — you’ll see the agent stages in the loading state.”
3. “Audience Twin — three segments, open evidence.”
4. “Reaction Lab — watch the disagreement strip. That’s the product insight.”
5. “Diagnostics — five scores; here’s how calculated.”
6. “Carousel — five slides, less hype, clearer path.”
7. “Before/After — same formulas, improved factors. That’s the punchline.”

Close: “Thunder doesn’t claim perfect prediction. It claims a grounded rehearsal from *your* comments.”

---

## Q&A cheat sheet

**“Is this just ChatGPT with cards?”**  
“No — shared LangGraph state, separate agent jobs, evidence validation, and scores from code formulas.”

**“Does it predict views?”**  
“No. We refuse that claim on purpose.”

**“What if OpenAI is down?”**  
“Fallback mode keeps the same UI so the demo never dies.”

**“Why n8n?”**  
“After you approve the carousel, export to a webhook — Notion, Slack, Drive — without Thunder posting for you.”

**“Why not poke agents?”**  
“Fun, but secondary. Vertical slice first.”

---

## 2-minute submission video cut

0:00 Problem + Thunder name  
0:25 Run seeded demo  
0:45 Twin + evidence  
1:05 Disagreement in Reaction Lab  
1:25 Diagnostics + formula honesty  
1:40 Carousel  
1:50 Before/After  
1:58 Tagline close  

---

## Pitch slide titles (5)

1. Thunder — test before you publish  
2. Problem: publish blind / comments unused  
3. Three features: Twin · Jury · Diagnostics+Rewrite  
4. Live demo / before-after  
5. Honest scope + next (poke segment, mobile)  

Copy full text from `docs/pitch-deck.md`.
