import { getAspect } from "./aspect";
import { buildCaptionsFromScript, totalDurationSec } from "./vtt";
import { renderSlidePng, renderSlideSvg } from "./slides";
import { buildStrategyPdf } from "./pdf";
import { buildZip } from "./zip";
import { buildFfmpegReelScript, ffmpegOneLiner } from "./reel";
import type {
  BrandTokens,
  BuiltMediaFiles,
  MediaStrategyPayload,
  StoryboardJson,
} from "./types";
import { DEFAULT_BRAND } from "./types";

export type BuildMediaPackageOptions = {
  payload: MediaStrategyPayload;
  brand?: BrandTokens;
  aspectId?: string;
  /** Optional voiceover MPEG bytes (from ElevenLabs). */
  audioMp3?: Uint8Array | null;
  packageId?: string;
};

/**
 * Build downloadable media package contents (PNG slides, PDF, VTT, captions,
 * storyboard, ffmpeg script, optional audio) and a ZIP buffer.
 */
export async function buildMediaPackage(
  options: BuildMediaPackageOptions,
): Promise<{
  zip: Uint8Array;
  files: BuiltMediaFiles;
  manifest: Record<string, unknown>;
}> {
  const brand = options.brand ?? DEFAULT_BRAND;
  const aspect = getAspect(options.aspectId);
  const payload = options.payload;
  const slides = payload.slides.slice(0, 5);
  if (slides.length !== 5) {
    throw new Error("Media package requires exactly 5 strategy slides");
  }

  const { vtt, captions } = buildCaptionsFromScript(payload.voiceoverScript);
  const cueDuration = totalDurationSec(captions.cues);
  const perSlide =
    cueDuration > 0 ? Math.max(2, cueDuration / slides.length) : 3;

  const entries: BuiltMediaFiles["entries"] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]!;
    const idx = i + 1;
    const png = renderSlidePng({
      index: idx,
      total: slides.length,
      slide,
      hook: payload.hook,
      brand,
      aspect,
    });
    const svg = renderSlideSvg({
      index: idx,
      total: slides.length,
      slide,
      hook: payload.hook,
      brand,
      aspect,
    });
    const stem = `slides/slide-${String(idx).padStart(2, "0")}`;
    entries.push({
      path: `${stem}.png`,
      bytes: png,
      mimeType: "image/png",
    });
    entries.push({
      path: `${stem}.svg`,
      bytes: new TextEncoder().encode(svg),
      mimeType: "image/svg+xml",
    });
  }

  const pdf = await buildStrategyPdf(payload, brand);
  entries.push({
    path: "carousel.pdf",
    bytes: pdf,
    mimeType: "application/pdf",
  });

  const vttBytes = new TextEncoder().encode(vtt);
  entries.push({
    path: "subtitles.vtt",
    bytes: vttBytes,
    mimeType: "text/vtt",
  });

  const captionsBytes = new TextEncoder().encode(
    JSON.stringify(captions, null, 2),
  );
  entries.push({
    path: "captions.json",
    bytes: captionsBytes,
    mimeType: "application/json",
  });

  const hasAudio = Boolean(options.audioMp3 && options.audioMp3.byteLength > 0);
  if (hasAudio && options.audioMp3) {
    entries.push({
      path: "voiceover.mp3",
      bytes: options.audioMp3,
      mimeType: "audio/mpeg",
    });
  }

  const storyboard: StoryboardJson = {
    version: 1,
    aspect,
    brand,
    hook: payload.hook,
    slides: slides.map((s, i) => ({
      ...s,
      file: `slides/slide-${String(i + 1).padStart(2, "0")}.png`,
      durationSec: perSlide,
    })),
    caption: payload.caption,
    cta: payload.cta,
    voiceoverScript: payload.voiceoverScript,
    mode: payload.mode,
    ffmpegHint: ffmpegOneLiner({
      audioFile: hasAudio ? "voiceover.mp3" : null,
    }),
  };

  entries.push({
    path: "storyboard.json",
    bytes: new TextEncoder().encode(JSON.stringify(storyboard, null, 2)),
    mimeType: "application/json",
  });

  const script = buildFfmpegReelScript({
    audioFile: hasAudio ? "voiceover.mp3" : null,
    secondsPerSlide: Math.round(perSlide),
  });
  entries.push({
    path: "compose-reel.sh",
    bytes: new TextEncoder().encode(script),
    mimeType: "text/x-shellscript",
  });

  const readme = [
    "# Thunder media package",
    "",
    "Contents:",
    "- slides/*.png — five carousel slides (brand tokens applied)",
    "- slides/*.svg — vector companion for each slide",
    "- carousel.pdf — print/share PDF of hook + five slides",
    "- subtitles.vtt + captions.json — timed captions from voiceover script",
    "- storyboard.json — reel timing + ffmpeg one-liner",
    "- compose-reel.sh — run when ffmpeg is installed to produce reel.mp4",
    hasAudio
      ? "- voiceover.mp3 — ElevenLabs (or provided) audio"
      : "- (no audio) — voiceover script is in storyboard.json; generate via /api/voiceover",
    "",
    `Aspect: ${aspect.label} (${aspect.width}×${aspect.height})`,
    payload.mode ? `Analysis mode: ${payload.mode}` : "",
    "",
    "MP4 is optional. Use compose-reel.sh when ffmpeg is installed.",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  entries.push({
    path: "README.txt",
    bytes: new TextEncoder().encode(readme),
    mimeType: "text/plain",
  });

  const zip = await buildZip(
    entries.map((e) => ({ path: e.path, bytes: e.bytes })),
  );

  const manifest = {
    packageId: options.packageId ?? null,
    fileCount: entries.length,
    hasAudio,
    aspectId: aspect.id,
    mode: payload.mode ?? null,
    bytes: zip.byteLength,
  };

  return {
    zip,
    files: { entries, storyboard, captions, vtt },
    manifest,
  };
}

export function strategyFromAnalyzeOptimized(optimized: {
  hook: string;
  slides: Array<{ title: string; body: string }>;
  caption: string;
  cta: string;
  voiceoverScript: string;
}, meta?: { mode?: string; confidence?: string; coverImageUrl?: string }): MediaStrategyPayload {
  return {
    hook: optimized.hook,
    slides: optimized.slides,
    caption: optimized.caption,
    cta: optimized.cta,
    voiceoverScript: optimized.voiceoverScript,
    mode: meta?.mode,
    confidence: meta?.confidence,
    coverImageUrl: meta?.coverImageUrl,
  };
}
