import { type Page, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

export const SCREENSHOT_DIR = path.join(
  process.cwd(),
  ".tmp",
  "playwright-screenshots",
);

export async function ensureScreenshotDir() {
  await fs.promises.mkdir(SCREENSHOT_DIR, { recursive: true });
}

/** Apply theme after load (does not install a sticky init script). */
export async function setTheme(page: Page, theme: "light" | "dark") {
  await page.goto("/");
  await page.evaluate((t) => {
    localStorage.setItem("thunder-theme", t);
    const root = document.documentElement;
    root.classList.toggle("dark", t === "dark");
    root.dataset.theme = t;
    root.style.colorScheme = t;
  }, theme);
}

export async function loadSeedAndReady(page: Page) {
  await expect(page.getByTestId("brand-title")).toHaveText("Thunder");
  await expect(page.getByTestId("stage-input")).toBeVisible();
  await page.getByTestId("load-seed").click();
  await expect(page.getByTestId("run-audience-test")).toBeEnabled();
}

export async function goToStage(page: Page, label: string) {
  await page.getByRole("button", { name: new RegExp(label, "i") }).click();
}

export async function shot(
  page: Page,
  name: string,
  options?: { fullPage?: boolean },
) {
  await ensureScreenshotDir();
  const file = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({
    path: file,
    fullPage: options?.fullPage ?? true,
  });
  return file;
}
