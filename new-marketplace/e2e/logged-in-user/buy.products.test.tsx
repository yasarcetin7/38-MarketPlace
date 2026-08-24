import { test, expect } from "@playwright/test";

test.describe("User - Purchase Flow", () => {
  test("should add a product to cart and proceed to Stripe checkout", async ({
    page,
  }) => {
    await page.goto("/");

    const addToCartBtn = page
      .getByRole("button", { name: /add to cart/i })
      .first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    const cartButton = page.locator("header button").filter({ hasText: "1" });
    await expect(cartButton).toBeVisible();
    await cartButton.click();

    const checkoutBtn = page.getByRole("link", { name: /checkout/i });

    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    await page.waitForURL(/.*stripe\.com.*/, {
      timeout: 15000,
    });

    await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/);
  });
});
