import { test, expect } from "@playwright/test";

// Backend responses are mocked via route interception — these tests exercise
// the frontend's golden path (camera → detection → voice chat) without
// depending on a live FastAPI/YOLO/MiDaS backend. Camera/mic access is
// granted via Chromium's fake-media-device flags (see playwright.config.ts),
// which jsdom-based unit tests cannot provide at all.

test.beforeEach(async ({ page }) => {
  await page.route("**/api/health", (route) =>
    route.fulfill({ json: { status: "ok", service: "Drishti AI" } }),
  );
  await page.route("**/api/process-frame", (route) =>
    route.fulfill({
      json: {
        success: true,
        detections: [],
        depth_zones: [],
        narration: "",
        audio_b64: null,
        annotated_frame: null,
        timestamp: Date.now() / 1000,
      },
    }),
  );
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      json: {
        success: true,
        question: "test question",
        answer: "test answer",
        audio_b64: null,
      },
    }),
  );
});

test("loads the golden-path UI", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Ask Drishti AI")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start navigation" })).toBeVisible();
});

test("camera stream attaches via fake device", async ({ page }) => {
  await page.goto("/");
  const video = page.locator("video.video-feed");
  await expect(video).toBeVisible();
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.readyState))
    .toBeGreaterThan(0);
});

test("start navigation shows stop control and stats bar", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start navigation" }).click();
  await expect(page.getByRole("button", { name: "Stop navigation" })).toBeVisible();
  await expect(page.locator(".stats-bar")).toBeVisible();
  await expect(page.getByText("Detected Objects")).toBeVisible();
});

test("language selector switches active language", async ({ page }) => {
  await page.goto("/");
  const hindiBtn = page.getByTitle("Hindi");
  await hindiBtn.click();
  await expect(hindiBtn).toHaveAttribute("aria-pressed", "true");
});

test("voice chat text mode sends a question and shows the answer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Text" }).click();
  await page.getByPlaceholder("Type your question...").fill("What's ahead?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.locator(".chat-a")).toContainText("test answer");
});
