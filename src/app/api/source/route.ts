import { NextResponse } from "next/server";
import { z } from "zod";
import { withTimeout } from "@/lib/timeouts";

export const runtime = "nodejs";
export const maxDuration = 60;

const SourceRequestSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = SourceRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        fallback: true,
        mode: "recovery_fallback",
        markdown: "",
        message:
          "FIRECRAWL_API_KEY not configured — paste comments manually or set the key. Labeled recovery fallback.",
      });
    }

    const res = await withTimeout(
      fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: parsed.data.url,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      }),
      45000,
      "Firecrawl scrape",
    );

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({
        ok: false,
        fallback: true,
        mode: "recovery_fallback",
        markdown: "",
        message: `Firecrawl responded ${res.status}: ${body.slice(0, 200)}`,
      });
    }

    const data = (await res.json()) as {
      success?: boolean;
      data?: { markdown?: string; content?: string };
    };
    const markdown =
      data.data?.markdown ?? data.data?.content ?? "";

    return NextResponse.json({
      ok: true,
      fallback: false,
      mode: "live",
      markdown,
      message: "Source scraped with Firecrawl.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Source fetch failed";
    return NextResponse.json({
      ok: false,
      fallback: true,
      mode: "recovery_fallback",
      markdown: "",
      message,
    });
  }
}
