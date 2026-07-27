import { NextResponse } from "next/server";
import { z } from "zod";
import {
  dbUnavailableResponse,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma";
import { resolveStudioSession } from "@/lib/studio/session";
import { unauthorizedResponse } from "@/lib/security/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const UpdateBrandKitSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  voiceSummary: z.string().max(2000).optional(),
  primaryColor: z.string().max(32).optional(),
  secondaryColor: z.string().max(32).optional(),
  accentColor: z.string().max(32).optional(),
  fontHeading: z.string().max(80).optional(),
  fontBody: z.string().max(80).optional(),
  prohibitedClaims: z.array(z.string().max(200)).max(40).optional(),
});

export async function GET(request: Request, ctx: Ctx) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const { id } = await ctx.params;
  const brandKit = await prisma.brandKit.findFirst({
    where: { id, workspaceId: session.session.workspaceId },
  });
  if (!brandKit) {
    return NextResponse.json({ error: "Brand kit not found" }, { status: 404 });
  }
  return NextResponse.json({ brandKit });
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const { id } = await ctx.params;
  const existing = await prisma.brandKit.findFirst({
    where: { id, workspaceId: session.session.workspaceId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Brand kit not found" }, { status: 404 });
  }

  const json: unknown = await request.json();
  const parsed = UpdateBrandKitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const brandKit = await prisma.brandKit.update({
    where: { id },
    data: {
      name: parsed.data.name,
      voiceSummary: parsed.data.voiceSummary,
      primaryColor: parsed.data.primaryColor,
      secondaryColor: parsed.data.secondaryColor,
      accentColor: parsed.data.accentColor,
      fontHeading: parsed.data.fontHeading,
      fontBody: parsed.data.fontBody,
      prohibitedClaims:
        parsed.data.prohibitedClaims != null
          ? JSON.stringify(parsed.data.prohibitedClaims)
          : undefined,
    },
  });

  return NextResponse.json({ brandKit });
}

export async function DELETE(request: Request, ctx: Ctx) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const { id } = await ctx.params;
  const existing = await prisma.brandKit.findFirst({
    where: { id, workspaceId: session.session.workspaceId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Brand kit not found" }, { status: 404 });
  }

  await prisma.brandKit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
