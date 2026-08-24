import { test, expect } from "@playwright/test";

test.describe("Admin - Edit Product Flow", () => {
  test("should edit the first product's price successfully", async ({ page }) => {
    // 1. Admin ana sayfasına (ürünler listesine) git
    await page.goto("/admin/products");

    // 2. Üst menüdeki "PRODUCT SETTINGS" linkine tıkla
    const productSettingsTab = page.getByRole("link", { name: "PRODUCT SETTINGS", exact: true });
    await expect(productSettingsTab).toBeVisible();
    await productSettingsTab.click();

    // 3. Tablodaki İLK ürünün "Edit" (Düzenle) linkine tıkla
    const firstEditBtn = page.getByRole("link", { name: "Edit", exact: true }).first();
    await expect(firstEditBtn).toBeVisible();
    await firstEditBtn.click();

    // 4. Edit sayfasının açıldığını doğrula 
    await page.waitForURL("**/admin/products/*/edit");

    // 5. Fiyat (Price) giriş kutusunu bul ve yeni fiyatı yaz
    const priceInput = page.getByLabel("Price");
    await expect(priceInput).toBeVisible();
    await priceInput.fill("299.99");

    // 6. Formu göndermek için "Update product" butonuna bas
    const updateBtn = page.getByRole("button", { name: /update product/i });
    await expect(updateBtn).toBeVisible();
    await updateBtn.click();

    // 7. İşlem bitince sistemin bizi ana ürünler sayfasına geri atmasını bekle
    await page.waitForURL("**/admin/products");
  });
});