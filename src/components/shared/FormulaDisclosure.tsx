"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function FormulaDisclosure({
  label,
  formula,
}: {
  label: string;
  formula: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="text-xs text-teal-800 underline-offset-2 hover:underline"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        How calculated
      </button>
      {open ? (
        <div
          className={cn(
            "absolute left-0 top-full z-20 mt-2 w-72 rounded-md border border-border bg-paper p-3 text-xs text-secondary shadow-lg",
          )}
        >
          <p className="mb-1 font-medium text-primary">{label}</p>
          <p className="font-mono leading-relaxed">{formula}</p>
        </div>
      ) : null}
    </div>
  );
}
