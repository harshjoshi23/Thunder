import { z } from "zod";

export const CommentSchema = z.object({
  id: z.string().regex(/^C\d{2}$/),
  text: z.string().min(1),
});

export type Comment = z.infer<typeof CommentSchema>;

export const AnalyzeRequestSchema = z.object({
  commentsText: z.string().min(1).max(12000),
  creatorContext: z.string().min(1).max(2000),
  draftPost: z.string().min(1).max(4000),
  sourceUrl: z
    .union([z.string().url(), z.literal("")])
    .optional(),
  forceMock: z.boolean().optional(),
  forceSeededDemo: z.boolean().optional(),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
