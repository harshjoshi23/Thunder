import {
  AudienceResearchSchema,
  type AudienceResearch,
  type Comment,
} from "@/lib/schemas";
import { structuredGenerate } from "@/lib/llm/structured";
import {
  buildAudienceSystemPrompt,
  buildAudienceUserPrompt,
} from "./prompts";

export async function runAudienceResearch(args: {
  comments: Comment[];
  creatorContext: string;
  draftPost: string;
}): Promise<{ data: AudienceResearch; model: string }> {
  const { data, model } = await structuredGenerate({
    role: "audience",
    system: buildAudienceSystemPrompt(),
    prompt: buildAudienceUserPrompt(args),
    schema: AudienceResearchSchema,
    repairHint: "Use only provided Cxx evidence IDs. Exactly 3 segments.",
  });
  return { data, model };
}
