import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { ThemeProvider } from "@/components/shell/ThemeProvider";
import { ThemeScript } from "@/components/shell/ThemeScript";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Thunder — Test your post before your audience does",
  description:
    "Pre-publication audience intelligence and multi-agent scenario testing for creators.",
  applicationName: "Thunder",
  metadataBase: new URL(appUrl),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Thunder",
    description: "Test your post before your audience does.",
    images: [{ url: "/og-cover.png", width: 512, height: 512 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thunder",
    description: "Test your post before your audience does.",
    images: ["/og-cover.png"],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#070d16" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${plex.variable} ${newsreader.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
