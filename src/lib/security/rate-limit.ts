/**
 * Rate limiting for costly API routes.
 * Prefers Upstash Redis (shared across instances); falls back to in-memory
 * with a one-time warning when Redis env is missing.
 */

import { Redis } from "@upstash/redis";

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();
let warnedMissingRedis = false;
let redisClient: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token) {
    redisClient = new Redis({ url, token });
    return redisClient;
  }

  redisClient = null;
  if (!warnedMissingRedis) {
    warnedMissingRedis = true;
    console.warn(
      "[thunder] Redis rate-limit env missing (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). Using in-memory limits (single-instance only).",
    );
  }
  return null;
}

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

function checkMemory(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = memoryBuckets.get(key);

  if (!existing || now >= existing.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
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

async function checkRedis(
  redis: Redis,
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const redisKey = `thunder:rl:${key}`;
  const count = await redis.incr(redisKey);

  if (count === 1) {
    await redis.pexpire(redisKey, windowMs);
  }

  if (count > limit) {
    const ttlMs = await redis.pttl(redisKey);
    const retryAfterSec = Math.max(
      1,
      Math.ceil((ttlMs > 0 ? ttlMs : windowMs) / 1000),
    );
    return { ok: false, retryAfterSec };
  }

  return { ok: true };
}

export async function checkRateLimit(
  request: Request,
  route: string,
  options?: { limit?: number; windowMs?: number },
): Promise<RateLimitResult> {
  const limit = options?.limit ?? Number(process.env.THUNDER_RATE_LIMIT ?? 8);
  const windowMs =
    options?.windowMs ?? Number(process.env.THUNDER_RATE_WINDOW_MS ?? 3_600_000);

  if (!Number.isFinite(limit) || limit <= 0) {
    return { ok: true };
  }

  const key = clientKey(request, route);
  const redis = getRedis();

  if (!redis) {
    return checkMemory(key, limit, windowMs);
  }

  try {
    return await checkRedis(redis, key, limit, windowMs);
  } catch (err) {
    console.warn(
      "[thunder] Redis rate-limit failed; falling back to in-memory:",
      err instanceof Error ? err.message : err,
    );
    return checkMemory(key, limit, windowMs);
  }
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

/** Test helper — reset memory buckets between unit tests. */
export function __resetRateLimitMemoryForTests() {
  memoryBuckets.clear();
  warnedMissingRedis = false;
  redisClient = undefined;
}
