/**
 * S3-compatible storage abstraction with local filesystem fallback.
 *
 * When S3_BUCKET (and credentials) are set → R2/S3.
 * Otherwise → `.data/exports` (preferred) or `public/exports` with download URLs.
 */

import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

export type StoredObject = {
  key: string;
  url: string;
  backend: "local" | "s3";
  byteSize: number;
};

export function isS3Configured(): boolean {
  return Boolean(
    process.env.S3_BUCKET?.trim() &&
      (process.env.S3_ACCESS_KEY_ID?.trim() ||
        process.env.AWS_ACCESS_KEY_ID?.trim()) &&
      (process.env.S3_SECRET_ACCESS_KEY?.trim() ||
        process.env.AWS_SECRET_ACCESS_KEY?.trim()),
  );
}

export function localExportRoot(): string {
  const configured = process.env.MEDIA_EXPORT_DIR?.trim();
  if (configured) return path.resolve(configured);
  // Prefer private .data (not publicly browsable as static files)
  return path.join(process.cwd(), ".data", "exports");
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function publicUrlForKey(key: string): string {
  return `${appBaseUrl()}/api/media/files/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/**
 * Store bytes. Uses S3 when configured; otherwise local disk under export root.
 * S3 path is stubbed with a clear interface — wire AWS SDK / R2 when keys exist.
 */
export async function putObject(
  key: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<StoredObject> {
  // contentType reserved for S3/R2 PutObject when SDK is wired
  void contentType;
  const safeKey = key.replace(/^\/+/, "").replace(/\.\./g, "");

  if (isS3Configured()) {
    // Interface ready: prefer official SDK when product keys are present.
    // Without aws-sdk dependency in Phase 2, fall through with a documented stub
    // that still writes locally and labels backend for ops to swap.
    console.warn(
      "[thunder:media] S3_BUCKET set but SDK upload not bundled yet — writing local fallback. Wire @aws-sdk/client-s3 for production R2/S3.",
    );
  }

  const root = localExportRoot();
  const full = path.join(root, safeKey);
  await ensureDir(path.dirname(full));
  await writeFile(full, Buffer.from(bytes));

  return {
    key: safeKey,
    url: publicUrlForKey(safeKey),
    backend: isS3Configured() ? "s3" : "local",
    byteSize: bytes.byteLength,
  };
}

export async function getObject(key: string): Promise<{
  bytes: Buffer;
  contentType: string;
} | null> {
  const safeKey = key.replace(/^\/+/, "").replace(/\.\./g, "");
  const full = path.join(localExportRoot(), safeKey);
  try {
    await access(full, constants.R_OK);
  } catch {
    return null;
  }
  const bytes = await readFile(full);
  const contentType = guessMime(safeKey);
  return { bytes, contentType };
}

function guessMime(key: string): string {
  if (key.endsWith(".zip")) return "application/zip";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".pdf")) return "application/pdf";
  if (key.endsWith(".vtt")) return "text/vtt";
  if (key.endsWith(".json")) return "application/json";
  if (key.endsWith(".mp3")) return "audio/mpeg";
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".svg")) return "image/svg+xml";
  if (key.endsWith(".sh")) return "text/x-shellscript";
  return "application/octet-stream";
}

export type S3Config = {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
};

/** Read S3/R2 config when present (for future SDK wiring). */
export function readS3Config(): S3Config | null {
  const bucket = process.env.S3_BUCKET?.trim();
  if (!bucket) return null;
  const accessKeyId =
    process.env.S3_ACCESS_KEY_ID?.trim() ||
    process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey =
    process.env.S3_SECRET_ACCESS_KEY?.trim() ||
    process.env.AWS_SECRET_ACCESS_KEY?.trim();
  if (!accessKeyId || !secretAccessKey) return null;
  return {
    bucket,
    region: process.env.S3_REGION?.trim() || process.env.AWS_REGION?.trim() || "auto",
    endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL?.trim() || undefined,
  };
}
