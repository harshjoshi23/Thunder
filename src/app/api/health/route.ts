import { NextResponse } from "next/server";
import { hasFalKey } from "@/lib/fal/config";
import { hasOpenAiKey } from "@/lib/llm/config";
import { isAuthConfigured } from "@/lib/security/auth";
import { isSentryConfigured } from "@/lib/monitoring/sentry";
import { isDatabaseConfigured } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  const redisConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );

  return NextResponse.json({
    ok: true,
    service: process.env.NEXT_PUBLIC_APP_NAME ?? "Thunder",
    time: new Date().toISOString(),
    openaiConfigured: hasOpenAiKey(),
    falConfigured: hasFalKey(),
    languagePath: hasOpenAiKey()
      ? "openai"
      : hasFalKey()
        ? "fal"
        : "none",
    firecrawlConfigured: Boolean(process.env.FIRECRAWL_API_KEY?.trim()),
    elevenLabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY?.trim()),
    n8nConfigured: Boolean(process.env.N8N_WEBHOOK_URL?.trim()),
    authConfigured: isAuthConfigured(),
    redisConfigured,
    databaseConfigured: isDatabaseConfigured(),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    sentryConfigured: isSentryConfigured(),
    fallbackEnabled:
      process.env.THUNDER_ENABLE_FALLBACK !== "false" &&
      process.env.THUNDER_ENABLE_FALLBACK !== "0",
  });
}
