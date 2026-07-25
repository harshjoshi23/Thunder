import {
  CriticOutputSchema,
  type Comment,
  type CriticOutput,
  type Reaction,
  type Segment,
} from "@/lib/schemas";
import { structuredGenerate } from "@/lib/llm/structured";
import { buildCriticSystemPrompt, buildCriticUserPrompt } from "./prompts";

export async function runCritic(args: {
  comments: Comment[];
  creatorContext: string;
  draftPost: string;
  segments: Segment[];
  reactions: Reaction[];
}): Promise<{ data: CriticOutput; model: string }> {
  const { data, model } = await structuredGenerate({
    role: "critic",
    system: buildCriticSystemPrompt(),
    prompt: buildCriticUserPrompt({
      comments: args.comments,
      creatorContext: args.creatorContext,
      draftPost: args.draftPost,
      segmentsJson: JSON.stringify(args.segments),
      reactionsJson: JSON.stringify(args.reactions),
    }),
    schema: CriticOutputSchema,
    repairHint:
      'guardrails must be objects like {"type":"exaggeration","severity":"high","finding":"..."}. Factors integers 0–10. Use only provided Cxx IDs.',
  });
  return { data: data as CriticOutput, model };
}
