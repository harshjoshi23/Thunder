import {
  JurorOutputSchema,
  type Comment,
  type JurorOutput,
  type Segment,
} from "@/lib/schemas";
import { structuredGenerate } from "@/lib/llm/structured";
import { buildJurorSystemPrompt, buildJurorUserPrompt } from "./prompts";

export async function runJuror(args: {
  comments: Comment[];
  creatorContext: string;
  draftPost: string;
  segment: Segment;
  segmentIndex: number;
  allSegments: Segment[];
}): Promise<{ data: JurorOutput; model: string }> {
  const { data, model } = await structuredGenerate({
    role: "juror",
    system: buildJurorSystemPrompt(args.segmentIndex),
    prompt: buildJurorUserPrompt({
      comments: args.comments,
      creatorContext: args.creatorContext,
      draftPost: args.draftPost,
      segmentJson: JSON.stringify(args.segment),
      allSegmentNames: args.allSegments.map((s) => s.name),
    }),
    schema: JurorOutputSchema,
    repairHint: `reaction.segmentName must be exactly "${args.segment.name}".`,
  });

  data.reaction.segmentName = args.segment.name;
  return { data, model };
}
