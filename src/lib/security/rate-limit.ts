/**
 * Simple in-memory rate limit for a single Render instance.
 * Protects OpenAI / fal / ElevenLabs spend when the demo URL is shared publicly.
 * Not a substitute for auth — production should add real auth + Redis limits later.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientKey(request: Request, route: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  return `${route}:${ip}`;
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

export function checkRateLimit(
  request: Request,
  route: string,
  options?: { limit?: number; windowMs?: number },
): RateLimitResult {
  const limit = options?.limit ?? Number(process.env.THUNDER_RATE_LIMIT ?? 8);
  const windowMs =
    options?.windowMs ?? Number(process.env.THUNDER_RATE_WINDOW_MS ?? 3_600_000);

  if (!Number.isFinite(limit) || limit <= 0) {
    return { ok: true };
  }

  const key = clientKey(request, route);
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true };
}

export function rateLimitResponse(retryAfterSec: number) {
  return Response.json(
    {
      error: "Rate limit exceeded. Try again later or use Load seeded demo.",
      retryAfterSec,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  );
}
