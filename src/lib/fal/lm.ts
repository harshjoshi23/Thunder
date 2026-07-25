import { fal } from "@fal-ai/client";
import { z } from "zod";
import { withTimeout } from "@/lib/timeouts";
import {
  getFalTextEndpoint,
  getLmTimeoutMs,
  hasFalKey,
} from "./config";

export class FalLmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FalLmError";
  }
}

function configureFal(): void {
  const key = process.env.FAL_KEY?.trim();
  if (!key) {
    throw new FalLmError("FAL_KEY is not configured");
  }
  fal.config({ credentials: key });
}

function extractText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const obj = data as Record<string, unknown>;
  if (typeof obj.output === "string") return obj.output;
  if (typeof obj.text === "string") return obj.text;
  if (typeof obj.response === "string") return obj.response;
  if (typeof obj.message === "string") return obj.message;
  if (Array.isArray(obj.choices)) {
    const first = obj.choices[0] as { message?: { content?: string } } | undefined;
    if (first?.message?.content) return first.message.content;
  }
  return JSON.stringify(data);
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return fence?.[1]?.trim() ?? trimmed;
}

function extractJsonObject(text: string): unknown {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as unknown;
    }
    throw new FalLmError("Model response was not valid JSON");
  }
}

async function callAnyLlm(args: {
  model: string;
  system: string;
  prompt: string;
}): Promise<string> {
  if (!hasFalKey()) {
    throw new FalLmError("FAL_KEY is not configured");
  }
  configureFal();
  const endpoint = getFalTextEndpoint();
  const timeoutMs = getLmTimeoutMs();

  const result = await withTimeout(
    fal.subscribe(endpoint, {
      input: {
        model: args.model,
        system_prompt: args.system,
        prompt: args.prompt,
      },
    }),
    timeoutMs,
    `fal ${endpoint} (${args.model})`,
  );

  return extractText(result.data);
}

/**
 * Shared fal LM adapter: Zod validate + one repair pass + timeouts.
 * Never invents live results — callers must label recovery fallback themselves.
 */
export async function falStructuredGenerate<T>(args: {
  model: string;
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  repairHint?: string;
}): Promise<T> {
  const baseSystem = `${args.system}

You MUST respond with a single JSON object only (no markdown fences, no commentary).
The JSON must match the required schema exactly.`;

  const firstText = await callAnyLlm({
    model: args.model,
    system: baseSystem,
    prompt: args.prompt,
  });

  try {
    const parsed = extractJsonObject(firstText);
    return args.schema.parse(parsed);
  } catch (firstErr) {
    const detail =
      firstErr instanceof Error ? firstErr.message : "validation failed";
    const repairPrompt = `${args.prompt}

PREVIOUS_OUTPUT_INVALID:
${firstText.slice(0, 4000)}

REPAIR: Fix the JSON so it validates. Error: ${detail}
${args.repairHint ? `Additional hint: ${args.repairHint}` : ""}
Return corrected JSON only.`;

    const repairedText = await callAnyLlm({
      model: args.model,
      system: baseSystem,
      prompt: repairPrompt,
    });

    try {
      const parsed = extractJsonObject(repairedText);
      return args.schema.parse(parsed);
    } catch (secondErr) {
      const msg =
        secondErr instanceof Error ? secondErr.message : "repair failed";
      throw new FalLmError(`fal structured generate failed after repair: ${msg}`);
    }
  }
}
