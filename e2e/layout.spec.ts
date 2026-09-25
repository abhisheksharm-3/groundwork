/**
 * Every page in the nav and every policy page fits the viewport it is given, logs nothing to the console, and has no
 * WCAG 2.2 AA violation axe can detect. Sideways scroll at phone width is the most
 * common way a fluid layout breaks; axe catches contrast, names and landmarks.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SITE } from "../src/lib/site-config.ts";

for (const { href: path } of [...SITE.nav, ...SITE.legal]) {
  test(`${path} fits the viewport, logs nothing and passes axe`, async ({
    page,
  }) => {
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
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      violations.map(
        (violation) =>
          `${violation.id}: ${violation.nodes.length} × ${violation.help}`,
      ),
    ).toEqual([]);
  });
}
