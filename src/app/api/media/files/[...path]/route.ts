import { NextResponse } from "next/server";
import { getObject } from "@/lib/media/storage";

export const runtime = "nodejs";

type Params = { params: Promise<{ path: string[] }> };

/**
 * Serve locally stored media exports (when S3 is not configured).
 * Keys are under `.data/exports/` — never path-traverse outside.
 */
export async function GET(_request: Request, context: Params) {
  const { path: parts } = await context.params;
  if (!parts || parts.length === 0) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const key = parts.join("/");
  if (key.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const obj = await getObject(key);
  if (!obj) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filename = parts[parts.length - 1] ?? "download";
  return new NextResponse(new Uint8Array(obj.bytes), {
    status: 200,
    headers: {
      "Content-Type": obj.contentType,
      "Content-Length": String(obj.bytes.byteLength),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
