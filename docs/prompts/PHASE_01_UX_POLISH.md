# PHASE 01 — Cursor agent prompt (UX polish)

Copy everything below the line into a new Cursor Agent chat in the Thunder repo.

---

## PROMPT START

You are working in the Thunder hackathon repo (Next.js App Router, TypeScript, Tailwind, LangGraph already implemented).

### Critical constraints
- Do **NOT** add Python, Redis, Kafka, message brokers, or microservices.
- Do **NOT** break the existing 6-stage vertical slice or mock/fallback analyze path.
- Do **NOT** require OpenAI/n8n/fal keys for the demo to work.
- Keep posts **text-first** for now (comments + draft text). Do not build full vision/image-post analysis in this phase.
- Prefer small, polished UX wins over new product surfaces.
- After changes: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` must pass.
- Do not edit any file under `.cursor/plans/`.

### Product context (do not redesign)
Thunder: creator pastes audience comments + draft → multi-agent rehearsal → diagnostics → 5-slide carousel → before/after.
Stages already exist in `src/components/stages/*` and `src/app/page.tsx`.

### Phase 01 goals (implement all that fit cleanly; skip with reason if blocked)

1) **Carousel interaction**
- In the Optimized Carousel stage, make the 5 slides feel premium:
  - Hover elevates/focuses the active slide
  - Click or arrow keys can move “active slide” highlight
  - Optional subtle cross-fade / slide transition (CSS or light Framer Motion only if already cheap to add; prefer CSS to avoid heavy deps)

2) **Keyboard navigation as a product feature**
- Global (when not typing in a textarea):
  - `←` `→` or `h` `l`: previous/next stage (only unlocked stages)
  - `1`–`6`: jump to stage if unlocked
  - `Enter` on stage 1: trigger Run if not running (only if focus is not in an input)
  - `r`: Reset demo (with confirm or only when not running)
- Show a small non-blocking hint: “Keyboard: ← → stages · 1–6 jump”
- Do not trap focus badly; textareas must still type normally.

3) **Quick, tasteful animations**
- Stage enter already has fade; strengthen consistency:
  - Score bars / before-after remain animated
  - Loading orchestra feels snappier
  - Avoid purple glow / emoji clutter / animation noise
- Respect `prefers-reduced-motion`.

4) **Perceived performance**
- Instant feedback on Run click (disable button, show orchestra immediately)
- Avoid layout shift when results arrive
- Keep main bundle reasonable; no heavy chart libs

5) **Agent activity / intent UX (no fake streaming required)**
- During Run, make it crystal clear what is happening and what to do next:
  - Named steps matching agents (Research → Simulation → Critic → Scoring → Strategy)
  - After complete, a one-line “Next: review Audience Twin” coach mark that advances with the user
- If you add a lightweight “event log” panel, it must use real `meta.agentTrace` from the API result when available (fallback mode included). Do not invent tool-call PDF/banana theater unless tied to real trace strings.

6) **Streaming**
- Do **not** implement token streaming in this phase.
- Instead: document in a short code comment or UI microcopy that analysis is request/response with staged progress UI (honest).
- Optional stretch only if trivial: progressive stage unlock animation after result (auto-advance Twin → … with pause) — must be skippable.

### Explicitly out of scope this phase
- Redis, Kafka, queues, horizontal scaling
- Playwright full suite (that is Phase 02)
- Image/vision draft upload
- Poke-segment chat
- Changing scoring formulas or LangGraph topology unless a bug blocks UX

### Deliverable when done
Reply with:
1. Files changed (list)
2. What you implemented vs skipped (and why)
3. How to try keyboard + carousel interactions in 30 seconds
4. Commands run + pass/fail
5. Any follow-ups for Phase 02 (tests / vision / deploy)

## PROMPT END
