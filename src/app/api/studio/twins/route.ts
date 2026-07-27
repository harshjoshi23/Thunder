import { NextResponse } from "next/server";
import { z } from "zod";
import {
  dbUnavailableResponse,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma";
import { resolveStudioSession } from "@/lib/studio/session";
import { upsertTwinFromRun } from "@/lib/studio/service";
import { unauthorizedResponse } from "@/lib/security/auth";

export const runtime = "nodejs";

const UpsertTwinSchema = z.object({
  name: z.string().max(200).optional(),
  segments: z.unknown(),
  projectId: z.string().optional(),
  analysisRunId: z.string().optional(),
  sourceId: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const twins = await prisma.audienceTwin.findMany({
    where: { workspaceId: session.session.workspaceId },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ twins });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const json: unknown = await request.json();
  const parsed = UpsertTwinSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.segments == null) {
    return NextResponse.json(
      { error: "segments required" },
      { status: 400 },
    );
  }

  const twin = await upsertTwinFromRun(prisma, {
    workspaceId: session.session.workspaceId,
    name: parsed.data.name,
    segments: parsed.data.segments,
    projectId: parsed.data.projectId,
    analysisRunId: parsed.data.analysisRunId,
    sourceId: parsed.data.sourceId,
  });

  return NextResponse.json({ twin }, { status: 201 });
}
