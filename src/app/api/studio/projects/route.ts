import { NextResponse } from "next/server";
import { z } from "zod";
import {
  dbUnavailableResponse,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma";
import { resolveStudioSession } from "@/lib/studio/session";
import { createProject, listProjects } from "@/lib/studio/service";
import { unauthorizedResponse } from "@/lib/security/auth";

export const runtime = "nodejs";

const CreateProjectSchema = z.object({
  title: z.string().min(1).max(200),
  creatorContext: z.string().max(2000).optional(),
  brandKitId: z.string().optional().nullable(),
  draftBody: z.string().max(8000).optional(),
});

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const projects = await listProjects(prisma, session.session.workspaceId);
  return NextResponse.json({
    projects,
    workspaceId: session.session.workspaceId,
    plan: session.session.plan,
  });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const json: unknown = await request.json();
  const parsed = CreateProjectSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const project = await createProject(
    prisma,
    session.session.workspaceId,
    parsed.data,
  );
  return NextResponse.json({ project }, { status: 201 });
}
