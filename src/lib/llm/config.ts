import { hasFalKey } from "@/lib/fal/config";

export function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/** Live language path available via OpenAI or fal. */
export function hasLiveLanguageKey(): boolean {
  return hasOpenAiKey() || hasFalKey();
}

export type LmProvider = "openai" | "fal";

export function getPreferredLmProvider(): LmProvider | null {
  if (hasOpenAiKey()) return "openai";
  if (hasFalKey()) return "fal";
  return null;
}

export function getOpenAiAudienceModel(): string {
  return process.env.OPENAI_AUDIENCE_MODEL?.trim() || "gpt-4o-mini";
}

export function getOpenAiJurorModel(): string {
  return process.env.OPENAI_JUROR_MODEL?.trim() || "gpt-4o-mini";
}

export function getOpenAiCriticModel(): string {
  return process.env.OPENAI_CRITIC_MODEL?.trim() || "gpt-4o-mini";
}

export function getOpenAiStrategyModel(): string {
  return process.env.OPENAI_STRATEGY_MODEL?.trim() || "gpt-4o-mini";
}

export function getOpenAiTimeoutMs(): number {
  const raw = process.env.OPENAI_LM_TIMEOUT_MS;
  const n = raw ? Number(raw) : 45000;
  return Number.isFinite(n) && n > 0 ? n : 45000;
}
