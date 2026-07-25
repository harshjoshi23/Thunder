import { cn } from "@/lib/utils";

export const STAGES = [
  { id: 1, label: "Audience Data" },
  { id: 2, label: "Audience Twin" },
  { id: 3, label: "Reaction Lab" },
  { id: 4, label: "Diagnostics" },
  { id: 5, label: "Carousel" },
  { id: 6, label: "Before / After" },
] as const;

export function StageNav({
  active,
  unlockedThrough,
  onSelect,
}: {
  active: number;
  unlockedThrough: number;
  onSelect: (id: number) => void;
}) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Workspace stages">
      {STAGES.map((stage) => {
        const locked = stage.id > unlockedThrough;
        const activeStage = stage.id === active;
        return (
          <button
            key={stage.id}
            type="button"
            disabled={locked}
            onClick={() => onSelect(stage.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              activeStage && "bg-ink text-paper",
              !activeStage &&
                !locked &&
                "bg-ink/5 text-ink/70 hover:bg-ink/10",
              locked && "cursor-not-allowed bg-ink/[0.03] text-ink/30",
            )}
          >
            {stage.id}. {stage.label}
          </button>
        );
      })}
    </nav>
  );
}
