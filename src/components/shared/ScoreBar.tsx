"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ScoreBar({
  label,
  value,
  invert = false,
  formula,
}: {
  label: string;
  value: number;
  invert?: boolean;
  formula?: string;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const tone =
    invert
      ? value >= 60
        ? "bg-amber-600"
        : value >= 40
          ? "bg-amber-500"
          : "bg-electric"
      : value >= 70
        ? "bg-electric"
        : value >= 45
          ? "bg-amber-500"
          : "bg-ink/40";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-primary">{label}</span>
        <span className="font-mono text-sm tabular-nums text-secondary">
          {value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted-bg">
        <div
          className={cn("h-full rounded-full transition-all duration-700", tone)}
          style={{ width: `${width}%` }}
        />
      </div>
      {formula ? (
        <p className="font-mono text-[10px] text-muted">{formula}</p>
      ) : null}
    </div>
  );
}
