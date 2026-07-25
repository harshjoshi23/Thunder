import { test, expect } from "@playwright/test";
import { goToStage, loadSeedAndReady, setTheme, shot } from "./helpers";

test.describe("Thunder creator player (seeded)", () => {
  test("input screen is self-explanatory", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await setTheme(page, "light");
    await loadSeedAndReady(page);

    await expect(
      page.getByTestId("stage-input").getByText("Step 1", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByTestId("stage-input").getByText("Step 2", { exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("run-audience-test")).toBeVisible();
    await expect(page.getByTestId("thunder-mark")).toBeVisible();

    const suffix = isMobile ? "mobile" : "desktop";
    await shot(page, `input-light-${suffix}`);

    await setTheme(page, "dark");
    await expect(page.getByTestId("stage-input")).toBeVisible();
    await shot(page, `input-dark-${suffix}`);
  });

  test("seeded run unlocks stages and captures flows", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name.includes("mobile"),
      "Full flow screenshots captured on desktop; mobile covered in input test",
    );

    await setTheme(page, "light");
    await loadSeedAndReady(page);

    // Hold analyze briefly so the running orchestra is screenshotable
    await page.route("**/api/analyze", async (route) => {
      await new Promise((r) => setTimeout(r, 1200));
      await route.continue();
    });

    await page.getByTestId("run-audience-test").click();
    await expect(page.getByTestId("stage-running")).toBeVisible({
      timeout: 10_000,
    });
    await shot(page, "running-light-desktop", { fullPage: false });

    await expect(page.getByTestId("stage-twin")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText("Seeded demo", { exact: true })).toBeVisible();
    await shot(page, "twin-light-desktop");

    await goToStage(page, "Reaction Lab");
    await expect(page.getByTestId("stage-jury")).toBeVisible();
    await shot(page, "jury-light-desktop");

    await goToStage(page, "Diagnostics");
    await expect(page.getByTestId("stage-diagnostics")).toBeVisible();
    await shot(page, "diagnostics-light-desktop");

    await goToStage(page, "Carousel");
    await expect(page.getByTestId("stage-carousel")).toBeVisible();
    await expect(page.getByTestId("cover-image")).toBeVisible();
    await expect(page.getByText(/Generate Reel/i)).toHaveCount(0);
    await shot(page, "carousel-light-desktop");

    await goToStage(page, "Before / After");
    await expect(page.getByTestId("stage-before-after")).toBeVisible();
    await shot(page, "before-after-light-desktop");

    await page.evaluate(() => {
      localStorage.setItem("thunder-theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.dataset.theme = "dark";
    });
    await shot(page, "before-after-dark-desktop");
    await goToStage(page, "Carousel");
    await shot(page, "carousel-dark-desktop");
  });

  test("theme toggle persists preference", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes("mobile"), "desktop only");
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", /.+/);
    await page.getByRole("button", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("health reports seeded-safe language path under e2e env", async ({
    request,
  }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as {
      ok: boolean;
      languagePath: string;
      openaiConfigured: boolean;
      falConfigured: boolean;
    };
    expect(body.ok).toBe(true);
    expect(body.openaiConfigured).toBe(false);
    expect(body.falConfigured).toBe(false);
    expect(body.languagePath).toBe("none");
  });
});
