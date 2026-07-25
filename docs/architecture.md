# Thunder architecture

Import into [diagrams.net](https://app.diagrams.net): **Arrange → Insert → Advanced → Mermaid**.

## System context

```mermaid
flowchart TB
  subgraph creator [Creator]
    Browser[Browser_Workspace]
  end

  subgraph thunderApp [Thunder_on_Render]
    UI[Nextjs_UI_6_Stages]
    API_H["/api/health"]
    API_S["/api/source"]
    API_A["/api/analyze"]
    API_C["/api/cover"]
    API_V["/api/voiceover"]
    API_E["/api/export/n8n"]
    Graph[LangGraph_MultiAgent]
    Score[Deterministic_Scoring_TS]
    Evidence[Evidence_Validator]
    Fallback[Seeded_demo_or_Recovery_fallback]
  end

  subgraph external [External]
    FalLM["fal-ai/any-llm"]
    FalImg["fal-ai/flux/dev"]
    Firecrawl[Firecrawl]
    Eleven[ElevenLabs]
    N8N[n8n_Webhook]
  end

  Browser --> UI
  UI --> API_A
  UI --> API_S
  UI --> API_C
  UI --> API_V
  UI --> API_E
  API_A --> Graph
  Graph -->|structured JSON| FalLM
  Graph --> Evidence
  Graph --> Score
  Graph -.->|no key or error| Fallback
  API_C --> FalImg
  API_S -.-> Firecrawl
  API_V -.-> Eleven
  API_E -.-> N8N
  Fallback --> UI
  Score --> UI
```

## Agent graph

```mermaid
flowchart TB
  N[normalizeComments] --> A[audienceResearch_fal]
  A --> E[evidenceValidate]
  E -->|retry once| A
  E --> F[jurorFanout]
  F --> J1[juror1]
  F --> J2[juror2]
  F --> J3[juror3]
  J1 --> C[critic_fal]
  J2 --> C
  J3 --> C
  C --> S[originalScoring_TS]
  S --> ST[strategy_fal_voiceover]
  ST --> O[optimizedEval_TS]
  O --> V[finalVerify]
  A -.->|fail| M[recovery_fallback]
  ST -.->|fail| M
  M --> V
```

## Model IDs

| Node | Model |
|------|-------|
| Audience | `google/gemini-2.5-flash-lite` via `fal-ai/any-llm` |
| Jurors | `google/gemini-2.5-flash` |
| Critic | `anthropic/claude-3-5-haiku` |
| Strategy | `google/gemini-2.5-flash` |
| Cover | `fal-ai/flux/dev` |

## UI stage map

```mermaid
flowchart LR
  S1[1_AudienceData] --> S2[2_AudienceTwin]
  S2 --> S3[3_ReactionLab]
  S3 --> S4[4_Diagnostics]
  S4 --> S5[5_Carousel]
  S5 --> S6[6_BeforeAfter]
```

## Honesty modes

```mermaid
flowchart LR
  Live[Live] -->|FAL_KEY + validated JSON| UI
  Seeded[Seeded_demo] -->|force or Load seeded demo| UI
  Recovery[Recovery_fallback] -->|missing key or pipeline error| UI
```

## Future scale (not implemented)

Redis / Kafka fan-out for multi-tenant orchestration is **out of hackathon scope**. Documented in README only.
