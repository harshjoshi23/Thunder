import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCoverImage } from "@/lib/fal/image";
import { getFalImageModel } from "@/lib/fal/config";
import {
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import {
  requireApiAuth,
  unauthorizedResponse,
} from "@/lib/security/auth";
import { captureException } from "@/lib/monitoring/sentry";

export const runtime = "nodejs";
export const maxDuration = 60;

const CoverRequestSchema = z.object({
  hook: z.string().min(1).max(200),
  creatorContext: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request);
    if (!auth.ok) {
      return unauthorizedResponse(auth.error);
    }

    const limited = await checkRateLimit(request, "cover", { limit: 10 });
    if (!limited.ok) {
      return rateLimitResponse(limited.retryAfterSec);
    }

    const json: unknown = await request.json();
    const parsed = CoverRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const prompt = `Premium editorial carousel cover for a creator tool product called Thunder. Dark ink navy background, teal accent, clean typography space. Theme: "${parsed.data.hook}". Context: ${parsed.data.creatorContext}. No logos, no cluttered UI, no purple neon glow.`;

    try {
      const generated = await generateCoverImage({ prompt });
      if (generated) {
        return NextResponse.json({
          ok: true,
          fallback: false,
          mode: "live",
          imageUrl: generated.imageUrl,
          model: generated.model,
          message: `Cover generated with ${generated.model}.`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "fal image failed";
      return NextResponse.json({
        ok: false,
        fallback: true,
        mode: "recovery_fallback",
        imageUrl: "/og-cover.png",
        model: getFalImageModel(),
        message: `Recovery fallback cover: ${message}`,
      });
    }

    return NextResponse.json({
      ok: false,
      fallback: true,
      mode: "recovery_fallback",
      imageUrl: "/og-cover.png",
      message:
        "FAL_KEY not configured or no image returned — using designed fallback cover (recovery fallback).",
    });
  } catch (err) {
    captureException(err, { route: "cover" });
    const message = err instanceof Error ? err.message : "Cover generation failed";
    return NextResponse.json({
      ok: false,
      fallback: true,
      mode: "recovery_fallback",
      imageUrl: "/og-cover.png",
      message,
    });
  }
}
