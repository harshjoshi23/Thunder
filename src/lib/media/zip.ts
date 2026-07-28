import JSZip from "jszip";

export type ZipEntry = {
  path: string;
  bytes: Uint8Array | string;
};

export async function buildZip(entries: ZipEntry[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const entry of entries) {
    zip.file(entry.path, entry.bytes);
  }
  const buf = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  return buf;
}
