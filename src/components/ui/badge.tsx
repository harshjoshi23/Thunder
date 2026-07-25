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
        tone === "neutral" && "bg-muted-bg text-secondary",
        tone === "teal" && "bg-electric-soft text-electric",
        tone === "amber" && "bg-lightning-soft text-warning",
        tone === "danger" && "bg-critical/10 text-critical",
        tone === "success" && "bg-positive/15 text-positive",
        className,
      )}
    >
      {children}
    </span>
  );
}
