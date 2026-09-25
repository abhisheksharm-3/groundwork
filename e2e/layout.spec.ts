/**
 * Every page fits the viewport it is given: no sideways scroll at phone width,
 * which is the most common way a fluid layout breaks, and nothing on the console.
 */
import { expect, test } from "@playwright/test";

for (const path of ["/", "/about", "/pricing", "/contact"]) {
  test(`${path} fits the viewport and logs no errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, "horizontal overflow in pixels").toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}
