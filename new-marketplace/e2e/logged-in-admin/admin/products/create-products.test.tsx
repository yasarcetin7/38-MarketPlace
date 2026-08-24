import { test, expect } from "@playwright/test";

test.describe("Admin - Create Product Flow", () => {
  test("should fill the form and create a new product", async ({ page }) => {
    await page.goto("/admin/products/new");
    await expect(page).toHaveURL(/\/admin\/products\/new/);

    await page.getByLabel("Name").fill("Nike Air Max 2024");
    await page
      .getByLabel("Description")
      .fill(
        "This is a test product created by Playwright for testing purposes.",
      );
    await page.getByLabel("Price").fill("89.99");
    await page.getByLabel("Stock").fill("20");

    await page.getByLabel("Category").selectOption("OTHER");
    await page.getByLabel("Currency").selectOption("EUR");

    await page
      .getByLabel("Product images")
      .setInputFiles("./e2e/test-image.jpg");

    const submitBtn = page.getByRole("button", {
      name: "Create product",
      exact: true,
    });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    const successHeading = page.getByRole("heading", {
      name: "Product created",
    });
    await expect(successHeading).toBeVisible();

    await page.getByText("View all products", { exact: true }).click();

    await page.waitForURL("**/admin/products");

    await page
      .getByRole("link", { name: "Delete", exact: true })
      .first()
      .click();

    const confirmModalText = page.getByText(/confirm deletion/i);
    await expect(confirmModalText).toBeVisible();

    const finalDeleteBtn = page.getByRole("button", {
      name: "Delete product",
      exact: true,
    });
    await expect(finalDeleteBtn).toBeVisible();
    await finalDeleteBtn.click();

    await expect(finalDeleteBtn).toBeHidden();
  });
});
