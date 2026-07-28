/** Brand tokens for carousel / PDF rendering (Phase 2). */
export type BrandTokens = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  voiceSummary?: string;
};

export const DEFAULT_BRAND: BrandTokens = {
  primaryColor: "#1B4DFF",
  secondaryColor: "#0B1220",
  accentColor: "#F5B942",
  fontHeading: "Newsreader",
  fontBody: "IBM Plex Sans",
};

export type MediaSlide = {
  title: string;
  body: string;
};

export type MediaStrategyPayload = {
  hook: string;
  slides: MediaSlide[];
  caption: string;
  cta: string;
  voiceoverScript: string;
  mode?: string;
  confidence?: string;
  coverImageUrl?: string;
};

export type PlatformAspect = {
  id: string;
  label: string;
  width: number;
  height: number;
  /** width / height */
  ratio: number;
};

export type TimedCue = {
  index: number;
  text: string;
  startSec: number;
  endSec: number;
};

export type CaptionsJson = {
  version: 1;
  language: string;
  cues: TimedCue[];
  source: "voiceover_script_estimate";
};

export type StoryboardJson = {
  version: 1;
  aspect: PlatformAspect;
  brand: BrandTokens;
  hook: string;
  slides: Array<MediaSlide & { file: string; durationSec: number }>;
  caption: string;
  cta: string;
  voiceoverScript: string;
  mode?: string;
  ffmpegHint: string;
};

export type BuiltMediaFiles = {
  /** Relative paths inside the ZIP */
  entries: Array<{ path: string; bytes: Uint8Array; mimeType: string }>;
  storyboard: StoryboardJson;
  captions: CaptionsJson;
  vtt: string;
};
