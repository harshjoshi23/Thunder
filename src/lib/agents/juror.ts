import {
  JurorOutputSchema,
  type Comment,
  type JurorOutput,
  type Segment,
} from "@/lib/schemas";
import { falStructuredGenerate } from "@/lib/fal/lm";
import { getFalJurorModel } from "@/lib/fal/config";
import { buildJurorSystemPrompt, buildJurorUserPrompt } from "./prompts";

export async function runJuror(args: {
  comments: Comment[];
  creatorContext: string;
  draftPost: string;
  segment: Segment;
  segmentIndex: number;
  allSegments: Segment[];
}): Promise<{ data: JurorOutput; model: string }> {
  const model = getFalJurorModel();
  const data = await falStructuredGenerate({
    model,
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

  // Force segment name alignment
  data.reaction.segmentName = args.segment.name;
  return { data, model };
}
