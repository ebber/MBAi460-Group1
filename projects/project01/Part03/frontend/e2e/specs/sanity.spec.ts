import { test, expect } from '@playwright/test';

test.describe('Sanity', () => {
  test('home page renders the MBAi 460 wordmark', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/MBAi\s*460/)).toBeVisible();
  });
});
