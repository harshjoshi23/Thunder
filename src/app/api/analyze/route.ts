import { NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/schemas";
import { runThunderAnalysis } from "@/lib/agents/graph";
import { shouldForceMock } from "@/lib/fal/config";
import { hasLiveLanguageKey } from "@/lib/llm/config";
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
export const maxDuration = 90;

export async function POST(request: Request) {
  try {
    const limited = await checkRateLimit(request, "analyze", { limit: 6 });
    if (!limited.ok) {
      return rateLimitResponse(limited.retryAfterSec);
    }

    const json: unknown = await request.json();
    const parsed = AnalyzeRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Seeded / no-LM paths never burn paid language APIs — keep them open
    // even when Clerk / API token auth is configured.
    const seededPath =
      Boolean(parsed.data.forceMock) ||
      Boolean(parsed.data.forceSeededDemo) ||
      shouldForceMock() ||
      !hasLiveLanguageKey();
    const auth = await requireApiAuth(request, { allowSeeded: seededPath });
    if (!auth.ok) {
      return unauthorizedResponse(auth.error);
    }

    const result = await runThunderAnalysis(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    captureException(err, { route: "analyze" });
    const message = err instanceof Error ? err.message : "Analyze failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
