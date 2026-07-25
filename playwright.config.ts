import { defineConfig, devices } from "@playwright/test";

const PORT = 3457;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    // Use production server (avoids watchpack EMFILE on large trees)
    command: `npx next start -H 127.0.0.1 -p ${PORT}`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      // Force seeded path — never burn fal / Eleven / Firecrawl / n8n / OpenAI
      FORCE_SEEDED_DEMO: "true",
      THUNDER_ENABLE_FALLBACK: "true",
      OPENAI_API_KEY: "",
      FAL_KEY: "",
      FIRECRAWL_API_KEY: "",
      ELEVENLABS_API_KEY: "",
      N8N_WEBHOOK_URL: "",
      NEXT_PUBLIC_APP_URL: baseURL,
    },
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
