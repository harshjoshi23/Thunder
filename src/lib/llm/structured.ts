import { z } from "zod";
import { falStructuredGenerate } from "@/lib/fal/lm";
import {
  getFalAudienceModel,
  getFalCriticModel,
  getFalJurorModel,
  getFalStrategyModel,
  hasFalKey,
} from "@/lib/fal/config";
import {
  getOpenAiAudienceModel,
  getOpenAiCriticModel,
  getOpenAiJurorModel,
  getOpenAiStrategyModel,
  getPreferredLmProvider,
  hasOpenAiKey,
} from "./config";
import { openaiStructuredGenerate } from "./openai";

export type LmRole = "audience" | "juror" | "critic" | "strategy";

function resolveModel(role: LmRole, provider: "openai" | "fal"): string {
  if (provider === "openai") {
    switch (role) {
      case "audience":
        return getOpenAiAudienceModel();
      case "juror":
        return getOpenAiJurorModel();
      case "critic":
        return getOpenAiCriticModel();
      case "strategy":
        return getOpenAiStrategyModel();
    }
  }
  switch (role) {
    case "audience":
      return getFalAudienceModel();
    case "juror":
      return getFalJurorModel();
    case "critic":
      return getFalCriticModel();
    case "strategy":
      return getFalStrategyModel();
  }
}

/**
 * Prefer OpenAI when OPENAI_API_KEY is set; otherwise fal when FAL_KEY is set.
 * Callers must never label recovery/seeded as Live.
 */
export async function structuredGenerate<T>(args: {
  role: LmRole;
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  repairHint?: string;
}): Promise<{ data: T; model: string; provider: "openai" | "fal" }> {
  const preferred = getPreferredLmProvider();
  if (!preferred) {
    throw new Error(
      "No live language key configured (need OPENAI_API_KEY or FAL_KEY)",
    );
  }

  if (preferred === "openai" && hasOpenAiKey()) {
    const model = resolveModel(args.role, "openai");
    const data = await openaiStructuredGenerate({
      model,
      system: args.system,
      prompt: args.prompt,
      schema: args.schema,
      repairHint: args.repairHint,
    });
    return { data, model: `openai/${model}`, provider: "openai" };
  }

  if (!hasFalKey()) {
    throw new Error("FAL_KEY is not configured for fal language path");
  }

  const model = resolveModel(args.role, "fal");
  const data = await falStructuredGenerate({
    model,
    system: args.system,
    prompt: args.prompt,
    schema: args.schema,
    repairHint: args.repairHint,
  });
  return { data, model: `fal/${model}`, provider: "fal" };
}
