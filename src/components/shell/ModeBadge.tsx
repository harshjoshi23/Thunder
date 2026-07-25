import { Badge } from "@/components/ui/badge";

export function ModeBadge({
  mode,
  confidence,
}: {
  mode?: "live" | "fallback" | null;
  confidence?: "low" | "medium" | "high" | null;
}) {
  if (!mode) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={mode === "live" ? "success" : "amber"}>
        {mode === "live" ? "Live agents" : "Demo / fallback mode"}
      </Badge>
      {confidence ? (
        <Badge tone="neutral">Confidence: {confidence}</Badge>
      ) : null}
    </div>
  );
}
