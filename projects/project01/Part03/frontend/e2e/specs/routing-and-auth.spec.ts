import { test, expect } from '@playwright/test';

test.describe('Routing & Auth (L1–L3)', () => {
  test('L1 — Default route redirects to /library', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByText(/MBAi\s*460/)).toBeVisible();
  });

  test('L2 — Login page reachable; submit toggles mockAuth + navigates to /library', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await page.getByLabel(/username/i).fill('erik');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Behavioral assertion: useUIStore is not exposed on window; LoginScreen
    // navigates to /library after setMockAuth (per source LoginScreen.tsx:34).
    await expect(page).toHaveURL(/\/library$/);
  });

  test('L3 — All in-scope routes render without auth gate', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());

    for (const path of ['/library', '/upload', '/profile', '/help']) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
});
