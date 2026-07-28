/**
 * Deterministic ffmpeg reel compose helper (no GPU).
 * Generates a shell script that turns slide PNGs + optional audio into MP4
 * when ffmpeg is installed locally or on Render.
 */

export function buildFfmpegReelScript(options: {
  slidePattern?: string;
  audioFile?: string | null;
  outputFile?: string;
  fps?: number;
  secondsPerSlide?: number;
}): string {
  const slides = options.slidePattern ?? "slides/slide-%02d.png";
  const out = options.outputFile ?? "reel.mp4";
  const fps = options.fps ?? 30;
  const sec = options.secondsPerSlide ?? 3;
  const audio = options.audioFile;

  const lines = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "# Thunder Media — compose vertical reel from slide PNGs (requires ffmpeg).",
    `# Usage: bash compose-reel.sh   (run from unzipped package root)`,
    `FPS=${fps}`,
    `SEC_PER_SLIDE=${sec}`,
    "",
    'if ! command -v ffmpeg >/dev/null 2>&1; then',
    '  echo "ffmpeg not found — install ffmpeg to produce MP4, or use the PNG/PDF/VTT package as-is."',
    "  exit 1",
    "fi",
    "",
  ];

  if (audio) {
    lines.push(
      `ffmpeg -y -framerate 1/$SEC_PER_SLIDE -i "${slides}" -i "${audio}" \\`,
      `  -c:v libx264 -pix_fmt yuv420p -r $FPS -c:a aac -shortest \\`,
      `  -movflags +faststart "${out}"`,
    );
  } else {
    lines.push(
      `ffmpeg -y -framerate 1/$SEC_PER_SLIDE -i "${slides}" \\`,
      `  -c:v libx264 -pix_fmt yuv420p -r $FPS -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \\`,
      `  -c:a aac -shortest -movflags +faststart "${out}"`,
    );
  }

  lines.push("", `echo "Wrote ${out}"`, "");
  return lines.join("\n");
}

export function ffmpegOneLiner(options?: {
  slidePattern?: string;
  audioFile?: string | null;
  outputFile?: string;
}): string {
  const slides = options?.slidePattern ?? "slides/slide-%02d.png";
  const out = options?.outputFile ?? "reel.mp4";
  const audio = options?.audioFile;
  if (audio) {
    return `ffmpeg -y -framerate 1/3 -i ${slides} -i ${audio} -c:v libx264 -pix_fmt yuv420p -r 30 -c:a aac -shortest -movflags +faststart ${out}`;
  }
  return `ffmpeg -y -framerate 1/3 -i ${slides} -c:v libx264 -pix_fmt yuv420p -r 30 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -c:a aac -shortest -movflags +faststart ${out}`;
}
