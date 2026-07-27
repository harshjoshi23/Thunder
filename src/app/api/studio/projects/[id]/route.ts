import { NextResponse } from "next/server";
import {
  dbUnavailableResponse,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma";
import { resolveStudioSession } from "@/lib/studio/session";
import { getProjectForWorkspace } from "@/lib/studio/service";
import { unauthorizedResponse } from "@/lib/security/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const { id } = await ctx.params;
  const project = await getProjectForWorkspace(
    prisma,
    session.session.workspaceId,
    id,
  );
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({
    project,
    plan: session.session.plan,
  });
}
