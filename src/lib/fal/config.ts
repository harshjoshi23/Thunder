export function hasFalKey(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

export function shouldForceSeededDemo(): boolean {
  const v = process.env.FORCE_SEEDED_DEMO;
  return v === "true" || v === "1";
}

/** Legacy FORCE_MOCK alias still honored. */
export function shouldForceMock(): boolean {
  const v = process.env.FORCE_MOCK;
  return shouldForceSeededDemo() || v === "true" || v === "1";
}

export function isFallbackEnabled(): boolean {
  const v = process.env.THUNDER_ENABLE_FALLBACK;
  if (v === undefined || v === "") return true;
  return v === "true" || v === "1";
}

export function getFalTextEndpoint(): string {
  return process.env.FAL_TEXT_ENDPOINT?.trim() || "fal-ai/any-llm";
}

export function getFalAudienceModel(): string {
  return (
    process.env.FAL_AUDIENCE_MODEL?.trim() || "google/gemini-2.5-flash-lite"
  );
}

export function getFalJurorModel(): string {
  return process.env.FAL_JUROR_MODEL?.trim() || "google/gemini-2.5-flash";
}

export function getFalCriticModel(): string {
  return (
    process.env.FAL_CRITIC_MODEL?.trim() || "anthropic/claude-3-5-haiku"
  );
}

export function getFalStrategyModel(): string {
  return process.env.FAL_STRATEGY_MODEL?.trim() || "google/gemini-2.5-flash";
}

export function getFalImageModel(): string {
  return process.env.FAL_IMAGE_MODEL?.trim() || "fal-ai/flux/dev";
}

export function getLmTimeoutMs(): number {
  const raw = process.env.FAL_LM_TIMEOUT_MS;
  const n = raw ? Number(raw) : 35000;
  return Number.isFinite(n) && n > 0 ? n : 35000;
}
