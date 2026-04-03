import { expect, test } from "@playwright/test";

test("shows validation error for invalid phone input", async ({ page }) => {
  await page.goto("/");

  await page.locator('input[type="tel"]').fill("abc");
  await page.locator('input[inputmode="numeric"]').fill("1234");
  await page.locator('form button[type="submit"]').click();

  await expect(page.getByText(/valid phone number|nambari sahihi ya simu/i)).toBeVisible();
});

test("shows validation error for invalid pin input", async ({ page }) => {
  await page.goto("/");

  await page.locator('input[type="tel"]').fill("+255700000003");
  await page.locator('input[inputmode="numeric"]').fill("12");
  await page.locator('form button[type="submit"]').click();

  await expect(page.getByText(/pin must be 4 to 8 digits|PIN lazima iwe nambari 4 hadi 8/i)).toBeVisible();
});

test("shows login error for invalid credentials", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "Invalid phone or PIN" }),
    });
  });

  await page.goto("/");

  await page.locator('input[type="tel"]').fill("+255700000003");
  await page.locator('input[inputmode="numeric"]').fill("9999");
  await page.locator('form button[type="submit"]').click();

  await expect(page.getByText(/invalid phone number or pin|nambari ya simu au PIN si sahihi/i)).toBeVisible();
});
