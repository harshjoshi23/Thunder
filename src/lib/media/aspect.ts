import type { PlatformAspect } from "./types";

/** Common social aspect ratios for carousel / reel export. */
export const PLATFORM_ASPECTS: Record<string, PlatformAspect> = {
  "instagram-portrait": {
    id: "instagram-portrait",
    label: "Instagram / TikTok portrait (4:5)",
    width: 1080,
    height: 1350,
    ratio: 1080 / 1350,
  },
  "instagram-square": {
    id: "instagram-square",
    label: "Instagram square (1:1)",
    width: 1080,
    height: 1080,
    ratio: 1,
  },
  "tiktok-reel": {
    id: "tiktok-reel",
    label: "TikTok / Reels vertical (9:16)",
    width: 1080,
    height: 1920,
    ratio: 1080 / 1920,
  },
  "linkedin-landscape": {
    id: "linkedin-landscape",
    label: "LinkedIn landscape (1.91:1)",
    width: 1200,
    height: 628,
    ratio: 1200 / 628,
  },
  "story-vertical": {
    id: "story-vertical",
    label: "Stories vertical (9:16)",
    width: 1080,
    height: 1920,
    ratio: 1080 / 1920,
  },
};

export const DEFAULT_ASPECT_ID = "instagram-portrait";

export function getAspect(id?: string): PlatformAspect {
  if (id && PLATFORM_ASPECTS[id]) return PLATFORM_ASPECTS[id];
  return PLATFORM_ASPECTS[DEFAULT_ASPECT_ID]!;
}

export function listAspects(): PlatformAspect[] {
  return Object.values(PLATFORM_ASPECTS);
}

export function scaleToAspect(
  baseWidth: number,
  baseHeight: number,
  aspect: PlatformAspect,
): { width: number; height: number } {
  const targetRatio = aspect.ratio;
  const baseRatio = baseWidth / baseHeight;
  if (Math.abs(baseRatio - targetRatio) < 0.001) {
    return { width: aspect.width, height: aspect.height };
  }
  return { width: aspect.width, height: aspect.height };
}
