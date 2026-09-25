/**
 * The passes page must stay instant: its heading and pass list come from the
 * static shell, and only today's price streams. A refactor that pulls the clock
 * out of its Suspense boundary, or reads a cookie in a shared layout, makes the
 * heading wait on the server, and these tests fail.
 */
import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

const STREAMED = /after 31 December|Including GST/;

test("the passes page is instant on an initial load", async ({
  page,
  baseURL,
}) => {
  await instant(
    page,
    async () => {
      await page.goto("/pricing");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Choose a pass",
      );
      await expect(
        page.getByRole("heading", { name: "Day pass" }),
      ).toBeVisible();
      await expect(page.getByText(STREAMED)).toHaveCount(0);
    },
    { baseURL },
  );
  await expect(page.getByText(STREAMED).first()).toBeVisible();
});

test("the passes page is instant on a client navigation", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  if (isMobile) await page.getByText("Menu", { exact: true }).click();
  await instant(page, async () => {
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Passes" })
      .click();
    await page.waitForURL((url) => url.pathname === "/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Choose a pass",
    );
    await expect(page.getByText(STREAMED)).toHaveCount(0);
  });
  await expect(page.getByText(STREAMED).first()).toBeVisible();
});
