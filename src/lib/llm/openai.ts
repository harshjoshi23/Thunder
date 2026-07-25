import OpenAI from "openai";
import { z } from "zod";
import { withTimeout } from "@/lib/timeouts";
import { getOpenAiTimeoutMs, hasOpenAiKey } from "./config";

export class OpenAiLmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAiLmError";
  }
}

function getClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new OpenAiLmError("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey: key });
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return fence?.[1]?.trim() ?? trimmed;
}

function unwrapStrategyObject(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.hook === "string" && Array.isArray(obj.slides)) return parsed;
  for (const key of ["result", "strategy", "output", "carousel", "data"]) {
    const nested = obj[key];
    if (nested && typeof nested === "object") {
      const n = nested as Record<string, unknown>;
      if (typeof n.hook === "string" || Array.isArray(n.slides)) return nested;
    }
  }
  return parsed;
}

function extractJsonObject(text: string): unknown {
  const cleaned = stripCodeFences(text);
  try {
    return unwrapStrategyObject(JSON.parse(cleaned) as unknown);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return unwrapStrategyObject(
        JSON.parse(cleaned.slice(start, end + 1)) as unknown,
      );
    }
    throw new OpenAiLmError("Model response was not valid JSON");
  }
}

async function callChat(args: {
  model: string;
  system: string;
  prompt: string;
}): Promise<string> {
  if (!hasOpenAiKey()) {
    throw new OpenAiLmError("OPENAI_API_KEY is not configured");
  }
  const client = getClient();
  const timeoutMs = getOpenAiTimeoutMs();

  const completion = await withTimeout(
    client.chat.completions.create({
      model: args.model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.prompt },
      ],
    }),
    timeoutMs,
    `openai ${args.model}`,
  );

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new OpenAiLmError("OpenAI returned empty content");
  }
  return text;
}

/**
 * OpenAI structured generate: JSON mode + Zod validate + one repair pass.
 */
export async function openaiStructuredGenerate<T>(args: {
  model: string;
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  repairHint?: string;
}): Promise<T> {
  const baseSystem = `${args.system}

You MUST respond with a single JSON object only (no markdown fences, no commentary).
The JSON must match the required schema exactly.`;

  const firstText = await callChat({
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

    const repairedText = await callChat({
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
      throw new OpenAiLmError(
        `OpenAI structured generate failed after repair: ${msg}`,
      );
    }
  }
}
