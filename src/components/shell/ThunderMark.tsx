import { cn } from "@/lib/utils";

/** Original Nordic-inspired storm-hammer + lightning mark (not Marvel Mjölnir). */
export function ThunderMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
      data-testid="thunder-mark"
    >
      <rect width="64" height="64" rx="14" fill="#07101c" />
      <path
        d="M14 18h36v10c0 2.2-1.8 4-4 4H18c-2.2 0-4-1.8-4-4V18Z"
        fill="#22d3ee"
      />
      <path d="M18 18h28v4H18V18Z" fill="#67e8f9" opacity="0.55" />
      <path
        d="M29 32h6v18c0 1.7-1.3 3-3 3h0c-1.7 0-3-1.3-3-3V32Z"
        fill="#94a3b8"
      />
      <path d="M30 48h4v4h-4v-4Z" fill="#64748b" />
      <path d="M36 8 28 26h7l-5 18 14-22h-8l6-14H36Z" fill="#fbbf24" />
      <path
        d="M36 8 28 26h7l-5 18 14-22h-8l6-14H36Z"
        fill="url(#tbolt)"
        opacity="0.85"
      />
      <defs>
        <linearGradient
          id="tbolt"
          x1="28"
          y1="8"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}
