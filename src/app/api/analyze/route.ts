import { NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/schemas";
import { runThunderAnalysis } from "@/lib/agents/graph";
import {
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  try {
    const limited = checkRateLimit(request, "analyze", { limit: 6 });
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

    const result = await runThunderAnalysis(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analyze failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
