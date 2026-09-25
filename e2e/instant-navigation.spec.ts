/**
 * The passes page must stay instant: its heading and pass list come from the
 * static shell, and only today's price streams. A refactor that pulls the clock
 * out of its Suspense boundary, or reads a cookie in a shared layout, makes the
 * page wait on the server, and these tests fail. Expectations come from
 * site-config, so a rebranded project keeps its guard without editing it.
 */
import { instant } from "@next/playwright";
import { expect, type Page, test } from "@playwright/test";
import { formatPrice } from "../src/lib/format.ts";
import { priceFor } from "../src/lib/pricing.ts";
import { SITE } from "../src/lib/site-config.ts";
import type { InstantExpectationType } from "./types.ts";

const [FIRST_PASS] = SITE.passes;

/** The first pass and its price today. The beforeEach hook skips every test first when there is no pass. */
function firstPassToday(): InstantExpectationType {
  if (!FIRST_PASS) throw new Error("no pass to test against");
  return {
    name: FIRST_PASS.name,
    price: formatPrice(priceFor(FIRST_PASS, Date.now())),
  };
}

async function expectShellOnly(
  page: Page,
  { name, price }: InstantExpectationType,
): Promise<void> {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByText(price, { exact: true })).toHaveCount(0);
}

test.beforeEach(() => {
  test.skip(!FIRST_PASS, "this project sells no passes");
});

test("the passes page is instant on an initial load", async ({
  page,
  baseURL,
}) => {
  const expected = firstPassToday();
  await instant(
    page,
    () => page.goto("/pricing").then(() => expectShellOnly(page, expected)),
    { baseURL },
  );
  await expect(
    page.getByText(expected.price, { exact: true }).first(),
  ).toBeVisible();
});

test("the passes page is instant on a client navigation", async ({
  page,
  isMobile,
}) => {
  const expected = firstPassToday();
  await page.goto("/");
  if (isMobile) await page.getByText("Menu", { exact: true }).click();
  await instant(page, async () => {
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Passes" })
      .click();
    await page.waitForURL((url) => url.pathname === "/pricing");
    await expectShellOnly(page, expected);
  });
  await expect(
    page.getByText(expected.price, { exact: true }).first(),
  ).toBeVisible();
});
