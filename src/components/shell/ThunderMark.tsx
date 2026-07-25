import { cn } from "@/lib/utils";

/** Storm-hammer + lightning mark (ChatGPT brand asset). */
export function ThunderMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- brand mark; SVG already optimized
    <img
      src="/thunder-logo.svg"
      width={size}
      height={size}
      alt=""
      className={cn("shrink-0 rounded-[22%]", className)}
      data-testid="thunder-mark"
      draggable={false}
    />
  );
}
