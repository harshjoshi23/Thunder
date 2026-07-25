import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const CoverRequestSchema = z.object({
  hook: z.string().min(1).max(200),
  creatorContext: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = CoverRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const falKey = process.env.FAL_KEY?.trim();
    if (!falKey) {
      return NextResponse.json({
        ok: false,
        fallback: true,
        imageUrl: "/og-cover.svg",
        message: "FAL_KEY not configured — using designed fallback cover.",
      });
    }

    const { fal } = await import("@fal-ai/client");
    fal.config({ credentials: falKey });

    const prompt = `Premium editorial carousel cover for a creator tool product called Thunder. Dark ink navy background, teal accent, clean typography space. Theme: "${parsed.data.hook}". Context: ${parsed.data.creatorContext}. No logos, no cluttered UI, no purple neon glow.`;

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt,
        image_size: "square_hd",
        num_images: 1,
      },
    });

    const data = result.data as { images?: Array<{ url: string }> };
    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({
        ok: false,
        fallback: true,
        imageUrl: "/og-cover.svg",
        message: "fal returned no image — using fallback cover.",
      });
    }

    return NextResponse.json({
      ok: true,
      fallback: false,
      imageUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cover generation failed";
    return NextResponse.json({
      ok: false,
      fallback: true,
      imageUrl: "/og-cover.svg",
      message,
    });
  }
}
