import {
  Call2OutputSchema,
  type Call1Output,
  type Call2Output,
  type Comment,
  type Diagnostics,
} from "@/lib/schemas";
import { falStructuredGenerate } from "@/lib/fal/lm";
import { getFalStrategyModel } from "@/lib/fal/config";
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
  const model = getFalStrategyModel();
  const data = await falStructuredGenerate({
    model,
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
      "Exactly 5 slides. Include voiceoverScript. Evidence IDs from comments only. Deltas −3..+3.",
  });
  return { data, model };
}
