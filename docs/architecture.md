# Thunder architecture (presentation-grade)

Import into [diagrams.net](https://app.diagrams.net): **Arrange → Insert → Advanced → Mermaid**.

## System context

```mermaid
flowchart TB
  subgraph creator [Creator]
    Browser[Browser_Workspace]
  end

  subgraph thunderApp [Thunder_on_Render_or_Vercel]
    UI[Nextjs_UI_6_Stages]
    API_A["/api/analyze"]
    API_C["/api/cover"]
    API_E["/api/export"]
    Graph[LangGraph_MultiAgent]
    Score[Deterministic_Scoring_TS]
    Evidence[Evidence_Validator]
    Mock[Mock_Fallback]
  end

  subgraph external [External_optional]
    OpenAI[OpenAI_API]
    Fal[fal.ai]
    N8N[n8n_Webhook]
  end

  Browser --> UI
  UI --> API_A
  UI --> API_C
  UI --> API_E
  API_A --> Graph
  Graph -->|structured_Call1_Call2| OpenAI
  Graph --> Evidence
  Graph --> Score
  Graph -.->|no_key_or_error| Mock
  API_C -.-> Fal
  API_E -.-> N8N
  Mock --> UI
  Score --> UI
```

## Agent graph (what “real agents” means)

```mermaid
flowchart LR
  N[normalizeComments] --> A[Call1_Research_Simulate_Critic]
  A --> V[verifyEvidence]
  V -->|retry_once| A
  V --> S[scoreDiagnostics]
  S --> C[Call2_ContentStrategy]
  C --> F[finalize]
  A -.->|fail| M[mockFallback]
  C -.->|fail| M
  M --> F
```

## UI stage map

```mermaid
flowchart LR
  S1[1_AudienceData] --> S2[2_AudienceTwin]
  S2 --> S3[3_ReactionLab]
  S3 --> S4[4_Diagnostics]
  S4 --> S5[5_Carousel]
  S5 --> S6[6_BeforeAfter]
```

## Data honesty

```mermaid
flowchart TB
  Comments[Imported_comments_C01_Cn] --> Twin[3_Segments]
  Twin --> Jury[Segment_Reactions]
  Draft[Draft_text] --> Jury
  Jury --> Factors[Factors_0_to_10]
  Factors --> Formulas[TS_Formulas_0_to_100]
  Formulas --> BA[Before_vs_After]
  Twin --> Strategy[5_Slides]
  Formulas --> Strategy
```

## Scaling note (pitch only — not built)

For a hackathon demo, one Node process on Render is enough.

**If** Thunder grew to many concurrent analyses later:

- Queue long LLM jobs (e.g. Redis/BullMQ) so HTTP requests don’t time out
- Keep scoring/evidence in-process (CPU-cheap)
- Kafka-style brokers are unnecessary until you have event fan-out across many services

Do not build this for the submission.
