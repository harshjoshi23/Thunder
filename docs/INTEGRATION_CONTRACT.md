# EvidencePack integration contract (`evidence_pack_v1`)

Canonical Zod schemas: [`src/lib/evidence-pack/schema.ts`](../src/lib/evidence-pack/schema.ts)

Thunder’s audience pipeline consumes **normalized comments + creator context + draft**. Provider-specific raw payloads must be converted into `EvidencePack` **before** analyze.

## Schema version

`schemaVersion` must be exactly `"evidence_pack_v1"`. Breaking changes require `evidence_pack_v2` and dual support during migration.

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| schemaVersion | yes | Literal `evidence_pack_v1` |
| platform | yes | `youtube` \| `instagram` \| `tiktok` \| `csv` \| `json` \| `manual` \| `demo` |
| accessMode | yes | `live_api` \| `owner_authorized` \| `imported` \| `seeded_demo` \| `recovery_fallback` |
| contentType | yes | See enum in schema |
| collectedAt | yes | ISO-ish timestamp string when comments were gathered |
| comments | yes | 1–500 items; **unique** `id` per comment; `text` required |
| sourceId / sourceUrl | no | Platform object id / URL |
| creatorId / creatorDisplayName | no | Creator identity (display only) |
| contentTitle / contentCaption / contentTranscript | no | Source content context |
| publishedAt | no | Source publish time |
| metadata | no | Opaque provider extras (never used for scoring claims) |

### Comment object

| Field | Required | Notes |
|-------|----------|-------|
| id | yes | Stable string; uniqueness enforced in pack |
| text | yes | Comment body |
| authorDisplayName | no | Do not build psychological profiles from this |
| likeCount / replyCount | no | Engagement hints only |
| publishedAt / parentId / sourceUrl | no | Threading / provenance |

## Access mode → Thunder run mode

| accessMode | Run mode badge |
|------------|----------------|
| live_api, owner_authorized | Live (if LLM succeeds) |
| imported | Imported |
| seeded_demo | Seeded demo |
| recovery_fallback | Recovery fallback |

## Examples

See fixtures: [`tests/fixtures/evidence-pack.ts`](../tests/fixtures/evidence-pack.ts)

### YouTube (abbreviated)

```json
{
  "schemaVersion": "evidence_pack_v1",
  "platform": "youtube",
  "accessMode": "imported",
  "contentType": "youtube_video",
  "sourceUrl": "https://www.youtube.com/watch?v=EXAMPLE",
  "collectedAt": "2026-07-28T12:00:00.000Z",
  "comments": [
    { "id": "yt_1", "text": "Please give a concrete weekly plan." }
  ]
}
```

### Instagram / TikTok / CSV

Same shape; change `platform` + `contentType`. CSV imports should normalize rows into `comments[]` with stable ids (`row_1`, …).

## Validation errors

Zod failures include: wrong `schemaVersion`, empty `comments`, duplicate comment ids, missing `draftPost` when calling analyze without pack+comments.

## Future HTTP shape (ingestion → Thunder)

Suggested (not implemented in this repo):

```http
POST /api/analyze
Content-Type: application/json

{
  "draftPost": "...",
  "creatorContext": "optional override",
  "evidencePack": { ...EvidencePack }
}
```

### Idempotency

Ingestion services should send `Idempotency-Key` (future) derived from `platform + sourceId + collectedAt` hash so retries do not duplicate Studio runs.

### Data ownership

- Comment text is **audience evidence** owned by the creator who imports it.
- Do not infer medical, political, religious, or sexuality attributes.
- Do not store provider OAuth tokens inside EvidencePack.

### How Thunder consumes the pack

`evidencePackToPipelineInput` → `commentsText` + suggested context → LangGraph normalize → segments/reactions/scores. Raw `metadata` is ignored by scoring.
