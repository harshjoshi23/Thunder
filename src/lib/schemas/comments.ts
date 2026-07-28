import { z } from "zod";
import { EvidencePackSchema } from "@/lib/evidence-pack/schema";

export const CommentSchema = z.object({
  id: z.string().regex(/^C\d{2}$/),
  text: z.string().min(1),
});

export type Comment = z.infer<typeof CommentSchema>;

export const AnalyzeRequestSchema = z
  .object({
    commentsText: z.string().max(12000).optional(),
    creatorContext: z.string().max(2000).optional(),
    draftPost: z.string().min(1).max(4000),
    sourceUrl: z.union([z.string().url(), z.literal("")]).optional(),
    forceMock: z.boolean().optional(),
    forceSeededDemo: z.boolean().optional(),
    /** Source-neutral evidence package (validated before pipeline). */
    evidencePack: EvidencePackSchema.optional(),
  })
  .superRefine((val, ctx) => {
    const hasPack = Boolean(val.evidencePack);
    const hasComments = Boolean(val.commentsText?.trim());
    if (!hasPack && !hasComments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide commentsText or evidencePack",
        path: ["commentsText"],
      });
    }
    if (!hasPack && !val.creatorContext?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "creatorContext is required when evidencePack is omitted",
        path: ["creatorContext"],
      });
    }
  });

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
