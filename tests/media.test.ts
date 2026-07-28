import { describe, expect, it } from "vitest";
import {
  buildCaptionsFromScript,
  cuesToVtt,
  estimateCuesFromScript,
  formatVttTimestamp,
  buildStrategyPdf,
  renderSlidePng,
  buildZip,
  buildMediaPackage,
  getAspect,
  listAspects,
} from "@/lib/media";
import { DEFAULT_BRAND } from "@/lib/media/types";

const FIXTURE_STRATEGY = {
  hook: "Agents aren't magic. Here's what MCP actually changes.",
  slides: [
    {
      title: "Agent != chatbot",
      body: "Definition vs chatbot — clear boundaries for beginners.",
    },
    {
      title: "What MCP adds",
      body: "Plumbing and tool protocols, not automatic reliability.",
    },
    {
      title: "A first project",
      body: "Start with a read-only tool plus structured logging.",
    },
    {
      title: "When NOT to use",
      body: "Skip agents when a checklist or script is enough.",
    },
    {
      title: "What still breaks",
      body: "Evals, permissions, cost, and privacy still need humans.",
    },
  ],
  caption: "Mixed-audience path grounded in comment evidence.",
  cta: "Reply with the failure mode you hit last week.",
  voiceoverScript:
    "Agents are not magic. MCP changes the plumbing. Start small with a read-only tool. Know when not to use an agent. Evals and permissions still break.",
  mode: "seeded_demo",
  confidence: "medium",
};

describe("media aspect helpers", () => {
  it("lists platforms and resolves default aspect", () => {
    const aspects = listAspects();
    expect(aspects.length).toBeGreaterThanOrEqual(3);
    const a = getAspect("tiktok-reel");
    expect(a.width).toBe(1080);
    expect(a.height).toBe(1920);
    expect(getAspect().id).toBe("instagram-portrait");
  });
});

describe("VTT / captions from script timings", () => {
  it("formats timestamps", () => {
    expect(formatVttTimestamp(0)).toBe("00:00:00.000");
    expect(formatVttTimestamp(65.5)).toBe("00:01:05.500");
  });

  it("builds cues and VTT without audio", () => {
    const cues = estimateCuesFromScript(FIXTURE_STRATEGY.voiceoverScript);
    expect(cues.length).toBeGreaterThan(0);
    expect(cues[0]!.startSec).toBe(0);
    expect(cues[0]!.endSec).toBeGreaterThan(cues[0]!.startSec);

    const vtt = cuesToVtt(cues);
    expect(vtt.startsWith("WEBVTT")).toBe(true);
    expect(vtt).toContain("-->");

    const { captions } = buildCaptionsFromScript(
      FIXTURE_STRATEGY.voiceoverScript,
    );
    expect(captions.source).toBe("voiceover_script_estimate");
    expect(captions.cues.length).toBe(cues.length);
  });
});

describe("PNG / PDF / ZIP builders", () => {
  it("renders a valid PNG slide", () => {
    const aspect = getAspect("instagram-square");
    const png = renderSlidePng({
      index: 1,
      total: 5,
      slide: FIXTURE_STRATEGY.slides[0]!,
      hook: FIXTURE_STRATEGY.hook,
      brand: DEFAULT_BRAND,
      aspect,
    });
    expect(png.byteLength).toBeGreaterThan(100);
    // PNG signature
    expect(Array.from(png.slice(0, 8))).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
  });

  it("builds a PDF from five-slide strategy", async () => {
    const pdf = await buildStrategyPdf(FIXTURE_STRATEGY, DEFAULT_BRAND);
    expect(pdf.byteLength).toBeGreaterThan(500);
    const head = new TextDecoder().decode(pdf.slice(0, 5));
    expect(head).toBe("%PDF-");
  });

  it("zips arbitrary entries", async () => {
    const zip = await buildZip([
      { path: "a.txt", bytes: "hello" },
      { path: "b.json", bytes: new TextEncoder().encode('{"ok":true}') },
    ]);
    expect(zip.byteLength).toBeGreaterThan(20);
    // ZIP local file header signature PK\x03\x04
    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);
  });

  it("builds a full media package ZIP (no OpenAI / no fal)", async () => {
    const { zip, files, manifest } = await buildMediaPackage({
      payload: FIXTURE_STRATEGY,
      brand: DEFAULT_BRAND,
      aspectId: "instagram-portrait",
      audioMp3: null,
      packageId: "testpkg",
    });

    expect(zip.byteLength).toBeGreaterThan(1000);
    expect(manifest.hasAudio).toBe(false);
    expect(files.entries.some((e) => e.path.endsWith(".png"))).toBe(true);
    expect(files.entries.some((e) => e.path === "carousel.pdf")).toBe(true);
    expect(files.entries.some((e) => e.path === "subtitles.vtt")).toBe(true);
    expect(files.entries.some((e) => e.path === "captions.json")).toBe(true);
    expect(files.entries.some((e) => e.path === "compose-reel.sh")).toBe(true);
    expect(files.vtt.startsWith("WEBVTT")).toBe(true);
    expect(files.storyboard.slides).toHaveLength(5);
  });
});
