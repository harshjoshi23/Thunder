import type { EvidencePack } from "@/lib/evidence-pack";

export const FIXTURE_YOUTUBE_PACK: EvidencePack = {
  schemaVersion: "evidence_pack_v1",
  platform: "youtube",
  accessMode: "imported",
  contentType: "youtube_video",
  sourceId: "yt_dQw4w9WgXcQ",
  sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  creatorDisplayName: "Career Systems",
  contentTitle: "Consistency without burnout",
  contentCaption: "A realistic weekly plan for people with full-time jobs.",
  collectedAt: "2026-07-28T12:00:00.000Z",
  comments: [
    {
      id: "yt_c1",
      text: "I only have 20 minutes at night — give a concrete weekly plan.",
      likeCount: 12,
    },
    {
      id: "yt_c2",
      text: "Daily posting burned me out. What actually works without guilt?",
      likeCount: 34,
    },
    {
      id: "yt_c3",
      text: "Skip the unstoppable hustle lines and show trade-offs.",
    },
  ],
};

export const FIXTURE_INSTAGRAM_PACK: EvidencePack = {
  schemaVersion: "evidence_pack_v1",
  platform: "instagram",
  accessMode: "owner_authorized",
  contentType: "instagram_post",
  sourceId: "ig_1789",
  creatorDisplayName: "Practical Creator",
  collectedAt: "2026-07-28T12:00:00.000Z",
  comments: [
    { id: "ig_1", text: "Beginners got lost by slide 2 — start simpler." },
    { id: "ig_2", text: "More simple visuals please." },
  ],
};

export const FIXTURE_TIKTOK_PACK: EvidencePack = {
  schemaVersion: "evidence_pack_v1",
  platform: "tiktok",
  accessMode: "imported",
  contentType: "tiktok_video",
  collectedAt: "2026-07-28T12:00:00.000Z",
  comments: [
    { id: "tt_1", text: "Who is this for — employees or full-time creators?" },
  ],
};

export const FIXTURE_CSV_NORMALISED_PACK: EvidencePack = {
  schemaVersion: "evidence_pack_v1",
  platform: "csv",
  accessMode: "imported",
  contentType: "generic_post",
  collectedAt: "2026-07-28T12:00:00.000Z",
  comments: [
    { id: "row_1", text: "Systems beat motivation. Show the boring checklist." },
    { id: "row_2", text: "I want a when-NOT-to-post slide." },
  ],
  metadata: { importFile: "comments.csv", rowCount: 2 },
};

/** Invalid: wrong schema version */
export const FIXTURE_INVALID_VERSION = {
  schemaVersion: "v0",
  platform: "youtube",
  accessMode: "imported",
  contentType: "youtube_video",
  collectedAt: "2026-07-28T12:00:00.000Z",
  comments: [{ id: "a", text: "hi" }],
};

/** Invalid: empty comments */
export const FIXTURE_INVALID_EMPTY_COMMENTS = {
  schemaVersion: "evidence_pack_v1",
  platform: "manual",
  accessMode: "imported",
  contentType: "generic_post",
  collectedAt: "2026-07-28T12:00:00.000Z",
  comments: [],
};

/** Invalid: duplicate ids */
export const FIXTURE_INVALID_DUP_IDS = {
  schemaVersion: "evidence_pack_v1",
  platform: "json",
  accessMode: "imported",
  contentType: "generic_post",
  collectedAt: "2026-07-28T12:00:00.000Z",
  comments: [
    { id: "same", text: "one" },
    { id: "same", text: "two" },
  ],
};
