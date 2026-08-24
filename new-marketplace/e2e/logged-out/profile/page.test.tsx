import { test, expect } from '@playwright/test';

test.describe('Profile', () => {
  test('logged out user should not be able to access user products page', async ({
    page,
  }) => {
    await page.goto('/admin/products');

    await expect(page).not.toHaveURL('/profile');
    // The next line would work with a regex matcher
    // await expect(page).toHaveURL('https://dev-jm5m0z3xkqxztipx.us.auth0.com');

    
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Continue', exact: true }),
    ).toBeVisible();
  });
});