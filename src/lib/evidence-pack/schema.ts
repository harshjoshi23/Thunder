import { z } from "zod";

/** Canonical source-neutral evidence package for Thunder (hackathon + future ingestion). */
export const SourcePlatformSchema = z.enum([
  "youtube",
  "instagram",
  "tiktok",
  "csv",
  "json",
  "manual",
  "demo",
]);
export type SourcePlatform = z.infer<typeof SourcePlatformSchema>;

export const AccessModeSchema = z.enum([
  "live_api",
  "owner_authorized",
  "imported",
  "seeded_demo",
  "recovery_fallback",
]);
export type AccessMode = z.infer<typeof AccessModeSchema>;

export const SourceContentTypeSchema = z.enum([
  "youtube_video",
  "youtube_short",
  "instagram_post",
  "instagram_reel",
  "tiktok_video",
  "carousel",
  "generic_post",
]);
export type SourceContentType = z.infer<typeof SourceContentTypeSchema>;

export const EvidenceCommentSchema = z.object({
  id: z.string().min(1).max(128),
  text: z.string().min(1).max(8000),
  authorDisplayName: z.string().max(200).optional(),
  likeCount: z.number().int().min(0).optional(),
  replyCount: z.number().int().min(0).optional(),
  publishedAt: z.string().max(40).optional(),
  parentId: z.string().max(128).optional(),
  sourceUrl: z.string().max(2000).optional(),
});
export type EvidenceComment = z.infer<typeof EvidenceCommentSchema>;

export const EvidencePackSchema = z
  .object({
    schemaVersion: z.literal("evidence_pack_v1"),
    platform: SourcePlatformSchema,
    accessMode: AccessModeSchema,
    contentType: SourceContentTypeSchema,
    sourceId: z.string().max(256).optional(),
    sourceUrl: z.string().max(2000).optional(),
    creatorId: z.string().max(256).optional(),
    creatorDisplayName: z.string().max(200).optional(),
    contentTitle: z.string().max(500).optional(),
    contentCaption: z.string().max(5000).optional(),
    contentTranscript: z.string().max(100_000).optional(),
    publishedAt: z.string().max(40).optional(),
    collectedAt: z.string().min(1).max(40),
    comments: z.array(EvidenceCommentSchema).min(1).max(500),
    metadata: z.record(z.unknown()).optional(),
  })
  .superRefine((pack, ctx) => {
    const ids = new Set<string>();
    for (const c of pack.comments) {
      if (ids.has(c.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate comment id: ${c.id}`,
          path: ["comments"],
        });
      }
      ids.add(c.id);
    }
  });

export type EvidencePack = z.infer<typeof EvidencePackSchema>;

export const EVIDENCE_PACK_SCHEMA_VERSION = "evidence_pack_v1" as const;

/** Map EvidencePack accessMode → Thunder AnalyzeResult run mode. */
export function accessModeToRunMode(
  accessMode: AccessMode,
): "live" | "imported" | "seeded_demo" | "recovery_fallback" {
  switch (accessMode) {
    case "live_api":
    case "owner_authorized":
      return "live";
    case "imported":
      return "imported";
    case "seeded_demo":
      return "seeded_demo";
    case "recovery_fallback":
      return "recovery_fallback";
    default:
      return "imported";
  }
}

/**
 * Convert a validated EvidencePack into the comment lines + optional context
 * the existing Thunder analyze pipeline expects. Provider-specific raw fields
 * stay in metadata / unused optional fields — never inside scoring.
 */
export function evidencePackToPipelineInput(pack: EvidencePack): {
  commentsText: string;
  suggestedCreatorContext: string;
  sourceUrl?: string;
  preferredRunMode: ReturnType<typeof accessModeToRunMode>;
  commentCount: number;
} {
  const lines = pack.comments.map((c) => c.text.trim()).filter(Boolean);
  const creatorBits = [
    pack.creatorDisplayName
      ? `Creator: ${pack.creatorDisplayName}`
      : undefined,
    pack.contentTitle ? `Content: ${pack.contentTitle}` : undefined,
    pack.contentCaption
      ? `Caption: ${pack.contentCaption.slice(0, 800)}`
      : undefined,
    `Source platform: ${pack.platform} (${pack.contentType})`,
    `Access: ${pack.accessMode}`,
  ].filter(Boolean);

  return {
    commentsText: lines.join("\n"),
    suggestedCreatorContext: creatorBits.join(". "),
    sourceUrl: pack.sourceUrl || undefined,
    preferredRunMode: accessModeToRunMode(pack.accessMode),
    commentCount: lines.length,
  };
}

export function parseEvidencePack(input: unknown): EvidencePack {
  return EvidencePackSchema.parse(input);
}

export function safeParseEvidencePack(input: unknown) {
  return EvidencePackSchema.safeParse(input);
}
