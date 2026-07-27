/**
 * Auth foundation for costly API routes.
 *
 * When CLERK_SECRET_KEY (or THUNDER_API_TOKEN) is set, routes must present a
 * valid Clerk session / Bearer API token — except seeded demo analyze
 * (forceMock) which never burns paid language APIs.
 *
 * When auth env is unset, routes stay public (hackathon / open demo path)
 * and rely on Redis/in-memory rate limits.
 */

import { createClerkClient } from "@clerk/backend";

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.CLERK_SECRET_KEY?.trim() ||
      process.env.THUNDER_API_TOKEN?.trim(),
  );
}

export type AuthGateResult =
  | { ok: true; userId?: string; via: "clerk" | "api_token" | "seeded" | "open" }
  | { ok: false; status: 401; error: string };

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

function checkApiToken(request: Request): AuthGateResult | null {
  const expected = process.env.THUNDER_API_TOKEN?.trim();
  if (!expected) return null;
  const token = bearerToken(request);
  if (token && token === expected) {
    return { ok: true, via: "api_token" };
  }
  return null;
}

async function checkClerk(request: Request): Promise<AuthGateResult | null> {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) return null;

  try {
    const clerk = createClerkClient({ secretKey });
    const state = await clerk.authenticateRequest(request, {
      secretKey,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
    });

    if (state.isAuthenticated) {
      const auth = state.toAuth();
      return {
        ok: true,
        userId: auth.userId ?? undefined,
        via: "clerk",
      };
    }
  } catch (err) {
    console.warn(
      "[thunder] Clerk authenticateRequest failed:",
      err instanceof Error ? err.message : err,
    );
  }

  return null;
}

/**
 * Gate costly routes. Pass `allowSeeded: true` for /api/analyze when the
 * JSON body includes forceMock (caller peeks body before/after parse).
 */
export async function requireApiAuth(
  request: Request,
  options?: { allowSeeded?: boolean },
): Promise<AuthGateResult> {
  if (!isAuthConfigured()) {
    return { ok: true, via: "open" };
  }

  if (options?.allowSeeded) {
    return { ok: true, via: "seeded" };
  }

  const api = checkApiToken(request);
  if (api?.ok) return api;

  const clerk = await checkClerk(request);
  if (clerk?.ok) return clerk;

  return {
    ok: false,
    status: 401,
    error:
      "Authentication required. Sign in (Clerk) or send Authorization: Bearer <THUNDER_API_TOKEN>. Seeded demo (forceMock) stays open.",
  };
}

export function unauthorizedResponse(error: string) {
  return Response.json({ error }, { status: 401 });
}
