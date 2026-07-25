import {
  Call2OutputSchema,
  type Call1Output,
  type Call2Output,
  type Comment,
  type Diagnostics,
} from "@/lib/schemas";
import { createChatModel } from "@/lib/openai";
import { buildCall2SystemPrompt, buildCall2UserPrompt } from "./prompts";

export async function runCall2(args: {
  comments: Comment[];
  creatorContext: string;
  draftPost: string;
  call1: Call1Output;
  diagnostics: Diagnostics;
}): Promise<Call2Output> {
  const model = createChatModel(0.4).withStructuredOutput(Call2OutputSchema);
  const result = await model.invoke([
    { role: "system", content: buildCall2SystemPrompt() },
    {
      role: "user",
      content: buildCall2UserPrompt({
        comments: args.comments,
        creatorContext: args.creatorContext,
        draftPost: args.draftPost,
        call1Json: JSON.stringify(args.call1),
        diagnosticsJson: JSON.stringify(args.diagnostics),
      }),
    },
  ]);
  return Call2OutputSchema.parse(result);
}
