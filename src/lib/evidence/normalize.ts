import type { Comment } from "@/lib/schemas";

/**
 * Split pasted audience comments into stable IDs C01, C02, ...
 * Accepts newline-separated or numbered lists.
 */
export function normalizeComments(commentsText: string): Comment[] {
  const raw = commentsText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line
        .replace(/^[-*•]\s+/, "")
        .replace(/^\d+[.)]\s+/, "")
        .replace(/^C\d{2}[:\s-]+/i, "")
        .trim(),
    )
    .filter((line) => line.length > 0);

  const unique: string[] = [];
  for (const text of raw) {
    if (!unique.includes(text)) unique.push(text);
  }

  return unique.slice(0, 40).map((text, index) => ({
    id: `C${String(index + 1).padStart(2, "0")}`,
    text,
  }));
}

export function commentsToDelimitedBlock(comments: Comment[]): string {
  return comments.map((c) => `${c.id}: ${c.text}`).join("\n");
}
