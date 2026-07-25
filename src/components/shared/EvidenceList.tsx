import type { Comment } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";

export function EvidenceList({
  evidenceIds,
  comments,
}: {
  evidenceIds: string[];
  comments: Comment[];
}) {
  const map = new Map(comments.map((c) => [c.id, c.text]));
  return (
    <ul className="space-y-2">
      {evidenceIds.map((id) => (
        <li
          key={id}
          className="rounded-md border border-border bg-elevated/70 p-2.5 text-sm text-secondary"
        >
          <Badge tone="teal" className="mb-1.5">
            {id}
          </Badge>
          <p>{map.get(id) ?? "Evidence comment not found in import."}</p>
        </li>
      ))}
    </ul>
  );
}
