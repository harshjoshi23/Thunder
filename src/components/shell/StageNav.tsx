import { cn } from "@/lib/utils";
import { Check, Circle, Lock } from "lucide-react";

export const STAGES = [
  { id: 1, label: "Audience Data", hint: "Input" },
  { id: 2, label: "Audience Twin", hint: "Segments" },
  { id: 3, label: "Reaction Lab", hint: "Jury" },
  { id: 4, label: "Diagnostics", hint: "Scores" },
  { id: 5, label: "Carousel", hint: "Output" },
  { id: 6, label: "Before / After", hint: "Compare" },
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
    <nav aria-label="Workspace stages" className="overflow-x-auto pb-1">
      <ol className="flex min-w-max items-center gap-1 md:gap-2">
        {STAGES.map((stage, index) => {
          const locked = stage.id > unlockedThrough;
          const activeStage = stage.id === active;
          const completed =
            unlockedThrough >= 6
              ? stage.id < active
              : stage.id < unlockedThrough && stage.id !== active;

          return (
            <li key={stage.id} className="flex items-center gap-1 md:gap-2">
              {index > 0 ? (
                <span
                  className={cn(
                    "hidden h-px w-4 sm:block md:w-6",
                    stage.id <= unlockedThrough
                      ? "bg-electric/50"
                      : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
              <button
                type="button"
                disabled={locked}
                onClick={() => onSelect(stage.id)}
                aria-current={activeStage ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition md:px-3",
                  activeStage &&
                    "border-electric/40 bg-electric-soft text-primary shadow-sm",
                  !activeStage &&
                    !locked &&
                    "border-border bg-elevated text-secondary hover:border-electric/30 hover:text-primary",
                  locked &&
                    "cursor-not-allowed border-border/60 bg-muted-bg/40 text-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
                    activeStage && "bg-electric text-white",
                    !activeStage &&
                      !locked &&
                      completed &&
                      "bg-positive/15 text-positive",
                    !activeStage &&
                      !locked &&
                      !completed &&
                      "bg-muted-bg text-muted",
                    locked && "bg-muted-bg text-muted",
                  )}
                >
                  {locked ? (
                    <Lock className="h-3 w-3 opacity-80" aria-hidden />
                  ) : completed ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    stage.id
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium leading-tight md:text-sm">
                    {stage.label}
                  </span>
                  <span
                    className={cn(
                      "block text-[10px] md:text-[11px]",
                      locked ? "text-muted" : "text-muted",
                    )}
                  >
                    {locked ? "Unlocks after run" : stage.hint}
                  </span>
                </span>
                {!locked && !activeStage && !completed ? (
                  <Circle className="hidden h-2 w-2 text-muted sm:block" aria-hidden />
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
      {unlockedThrough < 2 ? (
        <p className="mt-3 text-xs text-muted">
          Complete step 1 and run the test to unlock Audience Twin → Before /
          After.
        </p>
      ) : null}
    </nav>
  );
}
