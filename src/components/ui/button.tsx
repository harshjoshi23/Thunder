import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "amber";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-teal-800 text-paper hover:bg-teal-700 shadow-sm",
        variant === "secondary" &&
          "bg-ink/5 text-ink hover:bg-ink/10 border border-ink/10",
        variant === "ghost" && "bg-transparent text-ink/70 hover:bg-ink/5",
        variant === "amber" && "bg-amber-600 text-white hover:bg-amber-500",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        className,
      )}
      {...props}
    />
  );
}
