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
        <span className="text-sm font-medium text-ink/80">{label}</span>
      ) : null}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-28 w-full resize-y rounded-md border border-ink/15 bg-white/70 px-3 py-2 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink/35 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20",
          className,
        )}
        {...props}
      />
    </label>
  );
}
