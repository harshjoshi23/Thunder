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
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-electric text-white hover:brightness-110 shadow-sm",
        variant === "secondary" &&
          "border border-border bg-elevated text-primary hover:bg-muted-bg",
        variant === "ghost" &&
          "bg-transparent text-muted hover:bg-muted-bg hover:text-primary",
        variant === "amber" &&
          "bg-lightning text-[#07101c] hover:brightness-105",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        className,
      )}
      {...props}
    />
  );
}
