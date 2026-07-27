import { NextResponse } from "next/server";
import { z } from "zod";
import {
  dbUnavailableResponse,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma";
import { resolveStudioSession } from "@/lib/studio/session";
import { parseCommentsCsv } from "@/lib/studio/csv";
import { importCsvSource } from "@/lib/studio/service";
import { unauthorizedResponse } from "@/lib/security/auth";

export const runtime = "nodejs";

const ImportCsvSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  csv: z.string().min(1).max(200_000),
  originLabel: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return dbUnavailableResponse();
  const prisma = getPrisma();
  const session = await resolveStudioSession(prisma, request);
  if (!session.ok) return unauthorizedResponse(session.error);

  const json: unknown = await request.json();
  const parsed = ImportCsvSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const csvParsed = parseCommentsCsv(parsed.data.csv);
  if (csvParsed.comments.length === 0) {
    return NextResponse.json(
      { error: "No comment rows found in CSV" },
      { status: 400 },
    );
  }

  const source = await importCsvSource(prisma, {
    workspaceId: session.session.workspaceId,
    name: parsed.data.name ?? "CSV import",
    content: csvParsed.commentsText,
    originLabel: parsed.data.originLabel,
  });

  return NextResponse.json(
    {
      source,
      parsed: {
        commentCount: csvParsed.comments.length,
        skippedEmpty: csvParsed.skippedEmpty,
        commentsTextPreview: csvParsed.commentsText.slice(0, 500),
      },
    },
    { status: 201 },
  );
}
