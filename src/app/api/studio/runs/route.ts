import { NextResponse } from "next/server";
import { z } from "zod";
import {
  dbUnavailableResponse,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma";
import { resolveStudioSession } from "@/lib/studio/session";
import { saveAnalysisRun } from "@/lib/studio/service";
import { unauthorizedResponse } from "@/lib/security/auth";

export const runtime = "nodejs";

const SaveRunSchema = z.object({
  projectId: z.string().min(1),
  mode: z.string().min(1).max(40),
  confidence: z.string().max(40).optional().nullable(),
  result: z.unknown(),
  meta: z.unknown().optional(),
  draftBody: z.string().max(8000).optional(),
  optimizedBody: z.string().max(8000).optional(),
});

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const json: unknown = await request.json();
  const parsed = SaveRunSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const saved = await saveAnalysisRun(prisma, {
    workspaceId: session.session.workspaceId,
    plan: session.session.plan,
    projectId: parsed.data.projectId,
    mode: parsed.data.mode,
    confidence: parsed.data.confidence,
    result: parsed.data.result,
    meta: parsed.data.meta,
    draftBody: parsed.data.draftBody,
    optimizedBody: parsed.data.optimizedBody,
  });

  if (!saved.ok) {
    return NextResponse.json(
      {
        error: saved.error,
        entitlement: "entitlement" in saved ? saved.entitlement : undefined,
      },
      { status: saved.status },
    );
  }

  return NextResponse.json(
    { run: saved.run, entitlement: saved.entitlement },
    { status: 201 },
  );
}
