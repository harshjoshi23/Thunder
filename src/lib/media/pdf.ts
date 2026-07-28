import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { BrandTokens, MediaStrategyPayload } from "./types";
import { DEFAULT_BRAND } from "./types";
import { parseHexColor } from "./png-encode";

function toRgb(hex: string) {
  const [r, g, b] = parseHexColor(hex);
  return rgb(r / 255, g / 255, b / 255);
}

/**
 * Five-slide strategy PDF (+ cover page with hook / caption / CTA).
 */
export async function buildStrategyPdf(
  payload: MediaStrategyPayload,
  brand: BrandTokens = DEFAULT_BRAND,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageW = 612;
  const pageH = 792;
  const margin = 48;
  const primary = toRgb(brand.primaryColor);
  const secondary = toRgb(brand.secondaryColor);
  const accent = toRgb(brand.accentColor);

  // Cover
  {
    const page = doc.addPage([pageW, pageH]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageW,
      height: pageH,
      color: secondary,
    });
    page.drawRectangle({
      x: 0,
      y: pageH - 18,
      width: pageW,
      height: 18,
      color: accent,
    });
    page.drawText("THUNDER MEDIA PACKAGE", {
      x: margin,
      y: pageH - 72,
      size: 12,
      font: fontBold,
      color: accent,
    });
    const hookLines = wrapPdf(payload.hook, 42);
    let y = pageH - 120;
    for (const line of hookLines) {
      page.drawText(line, {
        x: margin,
        y,
        size: 22,
        font: fontBold,
        color: rgb(0.96, 0.97, 0.98),
      });
      y -= 28;
    }
    y -= 24;
    page.drawText("Caption", {
      x: margin,
      y,
      size: 11,
      font: fontBold,
      color: accent,
    });
    y -= 18;
    for (const line of wrapPdf(payload.caption, 72)) {
      page.drawText(line, {
        x: margin,
        y,
        size: 11,
        font,
        color: rgb(0.75, 0.8, 0.86),
      });
      y -= 14;
    }
    y -= 16;
    page.drawText("CTA", {
      x: margin,
      y,
      size: 11,
      font: fontBold,
      color: accent,
    });
    y -= 18;
    for (const line of wrapPdf(payload.cta, 72)) {
      page.drawText(line, {
        x: margin,
        y,
        size: 11,
        font,
        color: rgb(0.75, 0.8, 0.86),
      });
      y -= 14;
    }
    if (payload.mode) {
      page.drawText(`Mode: ${payload.mode}`, {
        x: margin,
        y: 56,
        size: 10,
        font,
        color: primary,
      });
    }
  }

  for (let i = 0; i < payload.slides.length; i++) {
    const slide = payload.slides[i]!;
    const page = doc.addPage([pageW, pageH]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageW,
      height: pageH,
      color: rgb(0.98, 0.98, 0.99),
    });
    page.drawRectangle({
      x: 0,
      y: pageH - 12,
      width: pageW,
      height: 12,
      color: primary,
    });
    page.drawText(`Slide ${i + 1} of ${payload.slides.length}`, {
      x: margin,
      y: pageH - 56,
      size: 11,
      font: fontBold,
      color: primary,
    });
    let y = pageH - 100;
    for (const line of wrapPdf(slide.title, 40)) {
      page.drawText(line, {
        x: margin,
        y,
        size: 24,
        font: fontBold,
        color: secondary,
      });
      y -= 30;
    }
    y -= 12;
    page.drawRectangle({
      x: margin,
      y: y + 8,
      width: 64,
      height: 3,
      color: accent,
    });
    y -= 24;
    for (const line of wrapPdf(slide.body, 78)) {
      page.drawText(line, {
        x: margin,
        y,
        size: 12,
        font,
        color: rgb(0.2, 0.24, 0.3),
      });
      y -= 16;
      if (y < 64) break;
    }
  }

  const bytes = await doc.save();
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

function wrapPdf(text: string, maxChars: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w;
    if (trial.length <= maxChars) cur = trial;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}
