import type { CaptionsJson, TimedCue } from "./types";

const WORDS_PER_SEC = 2.6;

/**
 * Build WebVTT + caption cues from a voiceover script using estimated timings.
 * Works even when audio is recovery/missing — timings are reviewable estimates.
 */
export function estimateCuesFromScript(
  script: string,
  options?: { wordsPerSec?: number; maxCueWords?: number },
): TimedCue[] {
  const wps = options?.wordsPerSec ?? WORDS_PER_SEC;
  const maxWords = options?.maxCueWords ?? 12;
  const cleaned = script.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    if (words.length <= maxWords) {
      chunks.push(sentence);
      continue;
    }
    for (let i = 0; i < words.length; i += maxWords) {
      chunks.push(words.slice(i, i + maxWords).join(" "));
    }
  }

  let t = 0;
  const cues: TimedCue[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const text = chunks[i]!;
    const wordCount = text.split(/\s+/).length;
    const duration = Math.max(1.2, wordCount / wps);
    const startSec = t;
    const endSec = t + duration;
    cues.push({ index: i + 1, text, startSec, endSec });
    t = endSec + 0.15;
  }
  return cues;
}

export function formatVttTimestamp(seconds: number): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const h = Math.floor(totalMs / 3_600_000);
  const m = Math.floor((totalMs % 3_600_000) / 60_000);
  const s = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms, 3)}`;
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

export function cuesToVtt(cues: TimedCue[]): string {
  const lines = ["WEBVTT", ""];
  for (const cue of cues) {
    lines.push(String(cue.index));
    lines.push(
      `${formatVttTimestamp(cue.startSec)} --> ${formatVttTimestamp(cue.endSec)}`,
    );
    lines.push(cue.text);
    lines.push("");
  }
  return lines.join("\n");
}

export function buildCaptionsFromScript(
  script: string,
  language = "en",
): { vtt: string; captions: CaptionsJson } {
  const cues = estimateCuesFromScript(script);
  return {
    vtt: cuesToVtt(cues),
    captions: {
      version: 1,
      language,
      cues,
      source: "voiceover_script_estimate",
    },
  };
}

export function totalDurationSec(cues: TimedCue[]): number {
  if (cues.length === 0) return 0;
  return cues[cues.length - 1]!.endSec;
}
