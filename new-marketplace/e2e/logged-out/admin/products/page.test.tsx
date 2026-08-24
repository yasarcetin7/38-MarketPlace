import { test, expect } from "@playwright/test";
test.describe("Admin - Product pages", () => {
  test("logged in admin user should able access admin products page", async ({
    page,
  }) => {
    await page.goto("/admin/products");
    await expect(page).not.toHaveURL("/admin/products");

    //await expect(page).toHaveURL("https://quotes-project32.eu.auth0.com");
    await expect(page.getByRole("textbox", { name: "Email address" }),
    ).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeVisible();
  });
});
