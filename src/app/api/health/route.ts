import { NextResponse } from "next/server";
import { hasFalKey } from "@/lib/fal/config";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: process.env.NEXT_PUBLIC_APP_NAME ?? "Thunder",
    time: new Date().toISOString(),
    falConfigured: hasFalKey(),
    firecrawlConfigured: Boolean(process.env.FIRECRAWL_API_KEY?.trim()),
    elevenLabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY?.trim()),
    n8nConfigured: Boolean(process.env.N8N_WEBHOOK_URL?.trim()),
    fallbackEnabled:
      process.env.THUNDER_ENABLE_FALLBACK !== "false" &&
      process.env.THUNDER_ENABLE_FALLBACK !== "0",
  });
}
