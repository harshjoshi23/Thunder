import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import {
  requireApiAuth,
  unauthorizedResponse,
} from "@/lib/security/auth";
import { captureException } from "@/lib/monitoring/sentry";
import {
  buildMediaPackage,
  strategyFromAnalyzeOptimized,
  putObject,
  DEFAULT_BRAND,
  type BrandTokens,
} from "@/lib/media";
import { SlideSchema } from "@/lib/schemas/analysis";
import {
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma";
import { withTimeout } from "@/lib/timeouts";

export const runtime = "nodejs";
export const maxDuration = 120;

const BrandSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontHeading: z.string().optional(),
  fontBody: z.string().optional(),
  voiceSummary: z.string().optional(),
});

const PackageRequestSchema = z
  .object({
    analysisRunId: z.string().min(1).optional(),
    projectId: z.string().min(1).optional(),
    aspectId: z.string().optional(),
    includeVoiceover: z.boolean().optional().default(false),
    coverImageUrl: z.string().url().optional(),
    brand: BrandSchema.optional(),
    /** Inline strategy (when not loading a saved run) */
    hook: z.string().min(1).optional(),
    slides: z.array(SlideSchema).length(5).optional(),
    caption: z.string().min(1).optional(),
    cta: z.string().min(1).optional(),
    voiceoverScript: z.string().min(1).optional(),
    mode: z.string().optional(),
    confidence: z.string().optional(),
  })
  .refine(
    (d) =>
      Boolean(d.analysisRunId) ||
      (d.hook && d.slides && d.caption && d.cta && d.voiceoverScript),
    {
      message:
        "Provide analysisRunId or full strategy fields (hook, slides[5], caption, cta, voiceoverScript)",
    },
  );

async function maybeFetchVoiceover(
  script: string,
): Promise<Uint8Array | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!apiKey || !voiceId) return null;

  const modelId =
    process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";

  try {
    const res = await withTimeout(
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({ text: script, model_id: modelId }),
      }),
      60000,
      "ElevenLabs TTS (media package)",
    );
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch (err) {
    captureException(err, { route: "media/package", step: "voiceover" });
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request);
    if (!auth.ok) {
      return unauthorizedResponse(auth.error);
    }

    const limited = await checkRateLimit(request, "media-package", {
      limit: 6,
    });
    if (!limited.ok) {
      return rateLimitResponse(limited.retryAfterSec);
    }

    const json: unknown = await request.json();
    const parsed = PackageRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body = parsed.data;
    let hook = body.hook;
    let slides = body.slides;
    let caption = body.caption;
    let cta = body.cta;
    let voiceoverScript = body.voiceoverScript;
    let mode = body.mode;
    let confidence = body.confidence;
    let projectId = body.projectId ?? null;
    let analysisRunId = body.analysisRunId ?? null;
    let brand: BrandTokens = {
      ...DEFAULT_BRAND,
      ...Object.fromEntries(
        Object.entries(body.brand ?? {}).filter(
          ([, v]) => typeof v === "string" && v.length > 0,
        ),
      ),
    };

    if (body.analysisRunId) {
      if (!isDatabaseConfigured()) {
        return NextResponse.json(
          {
            error:
              "DATABASE_URL not configured — pass inline strategy fields or set Postgres for analysisRunId lookup.",
            code: "DATABASE_UNAVAILABLE",
          },
          { status: 503 },
        );
      }
      const prisma = getPrisma();
      const run = await prisma.analysisRun.findUnique({
        where: { id: body.analysisRunId },
        include: {
          project: { include: { brandKit: true } },
        },
      });
      if (!run) {
        return NextResponse.json(
          { error: "Analysis run not found" },
          { status: 404 },
        );
      }
      analysisRunId = run.id;
      projectId = run.projectId;
      const result = JSON.parse(run.resultJson) as {
        optimized?: {
          hook: string;
          slides: Array<{ title: string; body: string }>;
          caption: string;
          cta: string;
          voiceoverScript: string;
        };
        mode?: string;
        confidence?: string;
      };
      if (!result.optimized) {
        return NextResponse.json(
          { error: "Run has no optimized strategy" },
          { status: 422 },
        );
      }
      hook = result.optimized.hook;
      slides = result.optimized.slides;
      caption = result.optimized.caption;
      cta = result.optimized.cta;
      voiceoverScript = result.optimized.voiceoverScript;
      mode = result.mode ?? run.mode;
      confidence = result.confidence ?? run.confidence ?? undefined;

      const kit = run.project.brandKit;
      if (kit) {
        brand = {
          primaryColor: kit.primaryColor,
          secondaryColor: kit.secondaryColor,
          accentColor: kit.accentColor,
          fontHeading: kit.fontHeading,
          fontBody: kit.fontBody,
          voiceSummary: kit.voiceSummary,
        };
      }
    }

    if (!hook || !slides || !caption || !cta || !voiceoverScript) {
      return NextResponse.json(
        { error: "Missing strategy fields" },
        { status: 400 },
      );
    }

    const payload = strategyFromAnalyzeOptimized(
      { hook, slides, caption, cta, voiceoverScript },
      {
        mode,
        confidence,
        coverImageUrl: body.coverImageUrl,
      },
    );

    let audioMp3: Uint8Array | null = null;
    let voiceoverMode: "live" | "skipped" | "recovery_fallback" = "skipped";
    if (body.includeVoiceover) {
      audioMp3 = await maybeFetchVoiceover(voiceoverScript);
      voiceoverMode = audioMp3 ? "live" : "recovery_fallback";
    }

    const packageId = randomUUID().slice(0, 8);
    const built = await buildMediaPackage({
      payload,
      brand,
      aspectId: body.aspectId,
      audioMp3,
      packageId,
    });

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const storageKey = `packages/${stamp}-${packageId}/thunder-media.zip`;
    const stored = await putObject(
      storageKey,
      built.zip,
      "application/zip",
    );

    const provenance = {
      mode: mode ?? null,
      confidence: confidence ?? null,
      aspectId: body.aspectId ?? "instagram-portrait",
      storageBackend: stored.backend,
      voiceoverMode,
      includeVoiceover: Boolean(body.includeVoiceover),
      coverImageUrl: body.coverImageUrl ?? null,
      s3Configured: Boolean(process.env.S3_BUCKET?.trim()),
      fileCount: built.manifest.fileCount,
    };

    let mediaAssetId: string | null = null;
    if (isDatabaseConfigured()) {
      try {
        const prisma = getPrisma();
        const asset = await prisma.mediaAsset.create({
          data: {
            analysisRunId,
            projectId,
            kind: "package",
            storageKey: stored.key,
            mimeType: "application/zip",
            byteSize: stored.byteSize,
            url: stored.url,
            provenanceJson: JSON.stringify(provenance),
          },
        });
        mediaAssetId = asset.id;
      } catch (err) {
        // DB optional for export — package still downloadable
        captureException(err, { route: "media/package", step: "persist" });
      }
    }

    return NextResponse.json({
      ok: true,
      downloadUrl: stored.url,
      storageKey: stored.key,
      byteSize: stored.byteSize,
      backend: stored.backend,
      mediaAssetId,
      voiceoverMode,
      manifest: built.manifest,
      provenance,
      message:
        stored.backend === "local"
          ? "Media package ready (local export storage). Set S3_BUCKET + keys for R2/S3."
          : "Media package ready.",
    });
  } catch (err) {
    captureException(err, { route: "media/package" });
    const message =
      err instanceof Error ? err.message : "Media package failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
