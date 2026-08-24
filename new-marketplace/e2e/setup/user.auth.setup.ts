import fs from "node:fs";
import path from "node:path";
import { expect, test as setup, type Page } from "@playwright/test";

const authDir = path.join(__dirname, "..", ".auth");
const authFile = path.join(authDir, "user.json");

async function completeAuth0Login(page: Page): Promise<void> {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      [
        "Missing E2E user credentials.",
        "Add to .env.local:",
        "  E2E_USER_EMAIL=user@test.com",
        "  E2E_USER_PASSWORD=your-password",
      ].join("\n"),
    );
  }

  const acceptButton = page.getByRole("button", { name: "Accept" });
  const emailInput = page.getByRole("textbox", { name: "Email address" });

  await expect(acceptButton.or(emailInput)).toBeVisible({ timeout: 15_000 });

  if (await acceptButton.isVisible()) {
    await acceptButton.click();
    await page.waitForURL(/localhost:3000/, { timeout: 30_000 });
    return;
  }

  await emailInput.fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForURL(/localhost:3000/, { timeout: 30_000 });
}

setup("authenticate as user", async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true });

  
  await page.goto("/settings");


 const settingsHeading = page.getByText("User Settings", { exact: true }); 
  const auth0Email = page.getByRole("textbox", { name: "Email address" });
  const auth0Accept = page.getByRole("button", { name: "Accept" });
  const saveButton = page.getByRole("button", { name: "Save Changes" });

  await expect(settingsHeading.or(auth0Email).or(auth0Accept)).toBeVisible({
    timeout: 30_000,
  });

  if (!(await settingsHeading.isVisible())) {
    await completeAuth0Login(page);
    await page.goto("/settings");
  }

  
  await expect(page).toHaveURL(/\/settings/);
  await expect(settingsHeading).toBeVisible();

  await page.context().storageState({ path: authFile });
});