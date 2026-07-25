import { Call1OutputSchema, type Call1Output, type Comment } from "@/lib/schemas";
import { createChatModel } from "@/lib/openai";
import { buildCall1SystemPrompt, buildCall1UserPrompt } from "./prompts";

export async function runCall1(args: {
  comments: Comment[];
  creatorContext: string;
  draftPost: string;
  repairHint?: string;
}): Promise<Call1Output> {
  const model = createChatModel(0.2).withStructuredOutput(Call1OutputSchema);
  const result = await model.invoke([
    { role: "system", content: buildCall1SystemPrompt() },
    {
      role: "user",
      content: buildCall1UserPrompt(args),
    },
  ]);
  return Call1OutputSchema.parse(result);
}
