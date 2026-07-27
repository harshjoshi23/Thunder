import { NextResponse } from "next/server";
import { z } from "zod";
import { withTimeout } from "@/lib/timeouts";
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

const VoiceoverRequestSchema = z.object({
  text: z.string().min(1).max(5000),
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request);
    if (!auth.ok) {
      return unauthorizedResponse(auth.error);
    }

    const limited = await checkRateLimit(request, "voiceover", { limit: 8 });
    if (!limited.ok) {
      return rateLimitResponse(limited.retryAfterSec);
    }

    const json: unknown = await request.json();
    const parsed = VoiceoverRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
    const modelId =
      process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";

    if (!apiKey || !voiceId) {
      return NextResponse.json({
        ok: false,
        fallback: true,
        mode: "recovery_fallback",
        audioBase64: null,
        mimeType: null,
        script: parsed.data.text,
        message:
          "ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID not set — returning script only (recovery fallback). Paste keys from ElevenLabs (Discord coupon may apply).",
      });
    }

    const res = await withTimeout(
      fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text: parsed.data.text,
            model_id: modelId,
          }),
        },
      ),
      60000,
      "ElevenLabs TTS",
    );

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({
        ok: false,
        fallback: true,
        mode: "recovery_fallback",
        audioBase64: null,
        mimeType: null,
        script: parsed.data.text,
        message: `ElevenLabs ${res.status}: ${body.slice(0, 200)}`,
      });
    }

    const buf = Buffer.from(await res.arrayBuffer());
    return NextResponse.json({
      ok: true,
      fallback: false,
      mode: "live",
      audioBase64: buf.toString("base64"),
      mimeType: "audio/mpeg",
      script: parsed.data.text,
      model: modelId,
      message: "Voiceover generated with ElevenLabs.",
    });
  } catch (err) {
    captureException(err, { route: "voiceover" });
    const message = err instanceof Error ? err.message : "Voiceover failed";
    return NextResponse.json({
      ok: false,
      fallback: true,
      mode: "recovery_fallback",
      audioBase64: null,
      mimeType: null,
      message,
    });
  }
}
