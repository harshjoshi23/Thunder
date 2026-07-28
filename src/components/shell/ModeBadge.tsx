import { Badge } from "@/components/ui/badge";
import type { RunMode, Confidence } from "@/lib/schemas";

const LABELS: Record<
  RunMode,
  { text: string; tone: "success" | "amber" | "neutral" }
> = {
  live: { text: "Live", tone: "success" },
  imported: { text: "Imported", tone: "neutral" },
  seeded_demo: { text: "Seeded demo", tone: "neutral" },
  recovery_fallback: { text: "Recovery fallback", tone: "amber" },
};

export function ModeBadge({
  mode,
  confidence,
}: {
  mode?: RunMode | null;
  confidence?: Confidence | null;
}) {
  if (!mode) return null;
  const label = LABELS[mode];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={label.tone}>{label.text}</Badge>
      {confidence ? (
        <Badge tone="neutral">Confidence: {confidence}</Badge>
      ) : null}
    </div>
  );
}
