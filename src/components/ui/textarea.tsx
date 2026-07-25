import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ className, label, id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="flex w-full flex-col gap-2">
      {label ? (
        <span className="text-sm font-medium text-secondary">{label}</span>
      ) : null}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-28 w-full resize-y rounded-md border border-border bg-elevated px-3 py-2 text-sm text-primary shadow-sm outline-none transition placeholder:text-muted focus:border-electric focus:ring-2 focus:ring-electric/20",
          className,
        )}
        {...props}
      />
    </label>
  );
}
