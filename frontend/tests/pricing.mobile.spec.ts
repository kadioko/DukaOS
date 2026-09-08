import { expect, test } from "@playwright/test";

test("mobile pricing shows the plans before the product walkthrough", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pricing?lang=en");
  const trial = page.getByRole("heading", { name: "Free Trial", exact: true });
  const proof = page.getByRole("heading", { name: "See the real workflows before you start.", exact: true });
  await expect(trial).toBeVisible();
  await expect(proof).toBeVisible();
  const [trialBox, proofBox] = await Promise.all([trial.boundingBox(), proof.boundingBox()]);
  expect(trialBox?.y || 0).toBeLessThan(proofBox?.y || 0);
  expect(trialBox?.y || 0).toBeLessThan(900);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
