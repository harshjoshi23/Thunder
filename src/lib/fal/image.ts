import { fal } from "@fal-ai/client";
import { getFalImageModel, hasFalKey } from "./config";
import { withTimeout } from "@/lib/timeouts";

export async function generateCoverImage(args: {
  prompt: string;
}): Promise<{ imageUrl: string; model: string } | null> {
  if (!hasFalKey()) return null;

  const key = process.env.FAL_KEY!.trim();
  fal.config({ credentials: key });
  const model = getFalImageModel();

  const result = await withTimeout(
    fal.subscribe(model, {
      input: {
        prompt: args.prompt,
        image_size: "square_hd",
        num_images: 1,
      },
    }),
    60000,
    `fal image (${model})`,
  );

  const data = result.data as { images?: Array<{ url?: string }> };
  const imageUrl = data.images?.[0]?.url;
  if (!imageUrl) return null;
  return { imageUrl, model };
}
