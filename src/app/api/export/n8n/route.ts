import { NextResponse } from "next/server";
import {
  buildN8nPayload,
  N8nExportRequestSchema,
} from "@/lib/n8n/payload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = N8nExportRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid export payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const payload = buildN8nPayload(parsed.data);
    const webhook = process.env.N8N_WEBHOOK_URL?.trim();

    if (!webhook) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        mode: "recovery_fallback",
        payload,
        message:
          "N8N_WEBHOOK_URL not set. Import n8n/thunder-approved-content.workflow.json, activate the webhook, paste the Production URL into env, then retry. Payload preview returned.",
      });
    }

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
          mode: "recovery_fallback",
          payload,
          message: `n8n webhook responded ${res.status}. Check the workflow is active.`,
        });
      }
      return NextResponse.json({
        ok: true,
        mode: "live",
        payload,
        message:
          "Approved carousel sent to n8n. Thunder does not auto-post to social.",
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({
      ok: false,
      mode: "recovery_fallback",
      message: `Export failed: ${message}`,
    });
  }
}
