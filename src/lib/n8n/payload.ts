import { z } from "zod";
import {
  ConfidenceSchema,
  DiagnosticsSchema,
  N8nExportPayloadSchema,
  RunModeSchema,
  type N8nExportPayload,
} from "@/lib/schemas";

export const N8nExportRequestSchema = z.object({
  hook: z.string().min(1),
  slides: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .length(5),
  caption: z.string().min(1),
  cta: z.string().min(1),
  voiceoverScript: z.string().optional(),
  coverImageUrl: z.string().optional(),
  mode: RunModeSchema.optional(),
  confidence: ConfidenceSchema.optional(),
  diagnostics: DiagnosticsSchema.optional(),
});

export type N8nExportRequest = z.infer<typeof N8nExportRequestSchema>;

export function buildN8nPayload(data: N8nExportRequest): N8nExportPayload {
  return N8nExportPayloadSchema.parse({
    source: "thunder" as const,
    approved: true as const,
    exportedAt: new Date().toISOString(),
    hook: data.hook,
    slides: data.slides,
    caption: data.caption,
    cta: data.cta,
    voiceoverScript: data.voiceoverScript,
    coverImageUrl: data.coverImageUrl,
    mode: data.mode,
    confidence: data.confidence,
    diagnostics: data.diagnostics,
  });
}
