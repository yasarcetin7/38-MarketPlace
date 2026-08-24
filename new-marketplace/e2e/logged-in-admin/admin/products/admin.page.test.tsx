import { test, expect } from "@playwright/test";

test.describe("Admin - Product pages", () => {
  test("logged in admin user should able access admin products page", async ({
    page,
  }) => {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/products/);

    const heading = page.getByRole("heading", {
      name: "Products",
      exact: true,
    });
    await expect(heading).toBeVisible();
    const createProductBtn = page.getByText('Create product');
    const editBtn = page.getByRole("link", { name: "Edit" });
    const deleteProductBtn = page.getByRole("link", { name: "Delete" });

    await expect(createProductBtn).toBeVisible();
    await expect(editBtn.first()).toBeVisible();
    await expect(deleteProductBtn.first()).toBeVisible();
  });
});
