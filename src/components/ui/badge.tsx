import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "teal" | "amber" | "danger" | "success";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-wide",
        tone === "neutral" && "bg-ink/8 text-ink/70",
        tone === "teal" && "bg-teal-800/10 text-teal-900",
        tone === "amber" && "bg-amber-500/15 text-amber-800",
        tone === "danger" && "bg-red-500/10 text-red-800",
        tone === "success" && "bg-emerald-500/10 text-emerald-800",
        className,
      )}
    >
      {children}
    </span>
  );
}
