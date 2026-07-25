import { cn } from "@/lib/utils";

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
    >
      <rect width="64" height="64" rx="14" fill="#0B1220" />
      <path
        d="M36.5 8L18 34.5h12.2L25.5 56 48 28.2H34.6L36.5 8Z"
        fill="#14B8A6"
      />
      <path
        d="M36.5 8L18 34.5h12.2L25.5 56 48 28.2H34.6L36.5 8Z"
        fill="url(#bolt)"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="bolt" x1="18" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5EEAD4" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>
    </svg>
  );
}
