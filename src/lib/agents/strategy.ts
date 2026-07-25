import {
  Call2OutputSchema,
  type Call1Output,
  type Call2Output,
  type Comment,
  type Diagnostics,
} from "@/lib/schemas";
import { structuredGenerate } from "@/lib/llm/structured";
import {
  buildStrategySystemPrompt,
  buildStrategyUserPrompt,
} from "./prompts";

export async function runStrategy(args: {
  comments: Comment[];
  creatorContext: string;
  draftPost: string;
  call1: Call1Output;
  diagnostics: Diagnostics;
}): Promise<{ data: Call2Output; model: string }> {
  const { data, model } = await structuredGenerate({
    role: "strategy",
    system: buildStrategySystemPrompt(),
    prompt: buildStrategyUserPrompt({
      comments: args.comments,
      creatorContext: args.creatorContext,
      draftPost: args.draftPost,
      call1Json: JSON.stringify(args.call1),
      diagnosticsJson: JSON.stringify(args.diagnostics),
    }),
    schema: Call2OutputSchema,
    repairHint:
      "Flat JSON only: hook, slides[5], caption, cta, voiceoverScript, changeExplanations[], optimizedFactorDeltas (−3..+3 integers). Evidence IDs from comments only.",
  });
  return { data, model };
}
