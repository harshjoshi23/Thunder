import {
  AudienceResearchSchema,
  type AudienceResearch,
  type Comment,
} from "@/lib/schemas";
import { falStructuredGenerate } from "@/lib/fal/lm";
import { getFalAudienceModel } from "@/lib/fal/config";
import {
  buildAudienceSystemPrompt,
  buildAudienceUserPrompt,
} from "./prompts";

export async function runAudienceResearch(args: {
  comments: Comment[];
  creatorContext: string;
  draftPost: string;
}): Promise<{ data: AudienceResearch; model: string }> {
  const model = getFalAudienceModel();
  const data = await falStructuredGenerate({
    model,
    system: buildAudienceSystemPrompt(),
    prompt: buildAudienceUserPrompt(args),
    schema: AudienceResearchSchema,
    repairHint: "Use only provided Cxx evidence IDs. Exactly 3 segments.",
  });
  return { data, model };
}
