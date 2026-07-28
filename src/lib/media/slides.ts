import type { BrandTokens, MediaSlide, PlatformAspect } from "./types";
import { DEFAULT_BRAND } from "./types";
import { encodePngRgba, fillRect, parseHexColor } from "./png-encode";
import { drawText, wrapText, FONT_GLYPH_H } from "./bitmap-font";

export type SlidePngInput = {
  index: number;
  total: number;
  slide: MediaSlide;
  hook?: string;
  brand?: BrandTokens;
  aspect: PlatformAspect;
};

/**
 * Render one carousel slide as a PNG (deterministic, no GPU / no native deps).
 */
export function renderSlidePng(input: SlidePngInput): Uint8Array {
  const brand = input.brand ?? DEFAULT_BRAND;
  const { width, height } = input.aspect;
  const rgba = new Uint8Array(width * height * 4);

  const bg = parseHexColor(brand.secondaryColor);
  const accent = parseHexColor(brand.accentColor);
  const primary = parseHexColor(brand.primaryColor);
  const white: [number, number, number] = [245, 247, 250];
  const muted: [number, number, number] = [180, 190, 205];

  fillRect(rgba, width, 0, 0, width, height, bg);
  fillRect(rgba, width, 0, 0, width, Math.max(12, Math.floor(height * 0.02)), accent);
  fillRect(
    rgba,
    width,
    0,
    height - Math.max(12, Math.floor(height * 0.015)),
    width,
    Math.max(12, Math.floor(height * 0.015)),
    primary,
  );

  const pad = Math.floor(width * 0.08);
  const titleScale = Math.max(3, Math.floor(width / 180));
  const bodyScale = Math.max(2, Math.floor(width / 260));
  const labelScale = Math.max(2, Math.floor(width / 320));

  const label = `SLIDE ${input.index}/${input.total}`;
  drawText(rgba, width, label, pad, pad, labelScale, accent);

  const titleY = pad + (FONT_GLYPH_H + 2) * labelScale + Math.floor(height * 0.04);
  const titleLines = wrapText(input.slide.title, width - pad * 2, titleScale);
  let y = titleY;
  for (const line of titleLines.slice(0, 4)) {
    drawText(rgba, width, line, pad, y, titleScale, white);
    y += (FONT_GLYPH_H + 2) * titleScale;
  }

  y += Math.floor(height * 0.04);
  fillRect(rgba, width, pad, y, Math.floor(width * 0.18), 4, accent);
  y += Math.floor(height * 0.04);

  const bodyLines = wrapText(input.slide.body, width - pad * 2, bodyScale);
  const lineH = (FONT_GLYPH_H + 3) * bodyScale;
  const maxBodyLines = Math.floor((height - y - pad * 2) / lineH);
  for (const line of bodyLines.slice(0, Math.max(4, maxBodyLines))) {
    drawText(rgba, width, line, pad, y, bodyScale, muted);
    y += lineH;
  }

  if (input.hook && input.index === 1) {
    const hookScale = labelScale;
    const hookLines = wrapText(`Hook: ${input.hook}`, width - pad * 2, hookScale);
    let hy = height - pad - hookLines.length * (FONT_GLYPH_H + 2) * hookScale;
    for (const line of hookLines.slice(0, 2)) {
      drawText(rgba, width, line, pad, hy, hookScale, accent);
      hy += (FONT_GLYPH_H + 2) * hookScale;
    }
  }

  return encodePngRgba(width, height, rgba);
}

export function renderSlideSvg(input: SlidePngInput): string {
  const brand = input.brand ?? DEFAULT_BRAND;
  const { width, height } = input.aspect;
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${esc(brand.secondaryColor)}"/>
  <rect width="100%" height="${Math.floor(height * 0.02)}" fill="${esc(brand.accentColor)}"/>
  <text x="${Math.floor(width * 0.08)}" y="${Math.floor(height * 0.1)}" fill="${esc(brand.accentColor)}" font-family="${esc(brand.fontBody)}, sans-serif" font-size="${Math.floor(width / 28)}">SLIDE ${input.index}/${input.total}</text>
  <text x="${Math.floor(width * 0.08)}" y="${Math.floor(height * 0.22)}" fill="#F5F7FA" font-family="${esc(brand.fontHeading)}, serif" font-size="${Math.floor(width / 14)}" font-weight="600">${esc(input.slide.title)}</text>
  <foreignObject x="${Math.floor(width * 0.08)}" y="${Math.floor(height * 0.32)}" width="${Math.floor(width * 0.84)}" height="${Math.floor(height * 0.5)}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:#B4BECD;font-family:${esc(brand.fontBody)},sans-serif;font-size:${Math.floor(width / 22)}px;line-height:1.35">${esc(input.slide.body)}</div>
  </foreignObject>
  <rect y="${height - Math.floor(height * 0.015)}" width="100%" height="${Math.floor(height * 0.015)}" fill="${esc(brand.primaryColor)}"/>
</svg>`;
}
