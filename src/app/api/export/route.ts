import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const ExportSchema = z.object({
  hook: z.string().min(1),
  slides: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .length(5),
  caption: z.string().min(1),
  cta: z.string().min(1),
  mode: z.enum(["live", "fallback"]).optional(),
});

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = ExportSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid export payload" }, { status: 400 });
    }

    const webhook = process.env.N8N_WEBHOOK_URL?.trim();
    if (!webhook) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        message:
          "N8N_WEBHOOK_URL not set. Create an n8n Webhook node, paste the URL in env, then retry. Core Thunder flow is unchanged.",
      });
    }

    const payload = {
      source: "thunder",
      approved: true,
      exportedAt: new Date().toISOString(),
      ...parsed.data,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok) {
        return NextResponse.json({
          ok: false,
          message: `n8n webhook responded ${res.status}. Check the workflow is active.`,
        });
      }
      return NextResponse.json({
        ok: true,
        message: "Approved carousel sent to n8n. No social auto-post from Thunder.",
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({
      ok: false,
      message: `Export failed: ${message}`,
    });
  }
}
