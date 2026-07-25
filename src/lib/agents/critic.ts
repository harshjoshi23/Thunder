import {
  CriticOutputSchema,
  type Comment,
  type CriticOutput,
  type Reaction,
  type Segment,
} from "@/lib/schemas";
import { falStructuredGenerate } from "@/lib/fal/lm";
import { getFalCriticModel } from "@/lib/fal/config";
import { buildCriticSystemPrompt, buildCriticUserPrompt } from "./prompts";

export async function runCritic(args: {
  comments: Comment[];
  creatorContext: string;
  draftPost: string;
  segments: Segment[];
  reactions: Reaction[];
}): Promise<{ data: CriticOutput; model: string }> {
  const model = getFalCriticModel();
  const data = await falStructuredGenerate({
    model,
    system: buildCriticSystemPrompt(),
    prompt: buildCriticUserPrompt({
      comments: args.comments,
      creatorContext: args.creatorContext,
      draftPost: args.draftPost,
      segmentsJson: JSON.stringify(args.segments),
      reactionsJson: JSON.stringify(args.reactions),
    }),
    schema: CriticOutputSchema,
    repairHint: "Factors must be integers 0–10. Use only provided Cxx IDs.",
  });
  return { data, model };
}
