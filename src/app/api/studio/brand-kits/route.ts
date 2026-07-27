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

const BrandKitSchema = z.object({
  name: z.string().min(1).max(120),
  voiceSummary: z.string().max(2000).optional(),
  primaryColor: z.string().max(32).optional(),
  secondaryColor: z.string().max(32).optional(),
  accentColor: z.string().max(32).optional(),
  fontHeading: z.string().max(80).optional(),
  fontBody: z.string().max(80).optional(),
  prohibitedClaims: z.array(z.string().max(200)).max(40).optional(),
});

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const brandKits = await prisma.brandKit.findMany({
    where: { workspaceId: session.session.workspaceId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ brandKits });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const json: unknown = await request.json();
  const parsed = BrandKitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const brandKit = await prisma.brandKit.create({
    data: {
      workspaceId: session.session.workspaceId,
      name: parsed.data.name,
      voiceSummary: parsed.data.voiceSummary ?? "",
      primaryColor: parsed.data.primaryColor ?? "#1B4DFF",
      secondaryColor: parsed.data.secondaryColor ?? "#0B1220",
      accentColor: parsed.data.accentColor ?? "#F5B942",
      fontHeading: parsed.data.fontHeading ?? "Newsreader",
      fontBody: parsed.data.fontBody ?? "IBM Plex Sans",
      prohibitedClaims: JSON.stringify(parsed.data.prohibitedClaims ?? []),
    },
  });

  return NextResponse.json({ brandKit }, { status: 201 });
}
