import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07101c",
          borderRadius: 40,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 64 64">
          <path
            d="M14 18h36v10c0 2.2-1.8 4-4 4H18c-2.2 0-4-1.8-4-4V18Z"
            fill="#22d3ee"
          />
          <path
            d="M29 32h6v18c0 1.7-1.3 3-3 3h0c-1.7 0-3-1.3-3-3V32Z"
            fill="#94a3b8"
          />
          <path
            d="M36 8 28 26h7l-5 18 14-22h-8l6-14H36Z"
            fill="#fbbf24"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
