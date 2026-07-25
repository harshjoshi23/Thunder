"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-ink/10">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-ink"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink/50 transition",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? <div className="pb-3 text-sm text-ink/75">{children}</div> : null}
    </div>
  );
}
