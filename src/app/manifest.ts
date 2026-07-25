import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Thunder",
    short_name: "Thunder",
    description: "Test your post before your audience does.",
    start_url: "/",
    display: "standalone",
    background_color: "#070d16",
    theme_color: "#0891b2",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
