import { test, expect } from '@playwright/test';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEGU_FIXTURE = join(__dirname, '..', 'fixtures', '01degu.jpg');

const ASSET_CARD = '[data-testid^="asset-card-"]';

test.describe('Library happy path (U1 + LIB3 + A1 + A3)', () => {
  // Serial mode: U1 seeds data that LIB3/A1/A3 read. If U1 fails, subsequent tests
  // skip rather than running against ambiguous state. (R1.3 fix from adversarial review.)
  test.describe.configure({ mode: 'serial' });

  test('U1 — Upload JPG → assetid → library refreshes with new card + labels', async ({ page }) => {
    await page.goto('/library');
    const cardsBefore = await page.locator(ASSET_CARD).count();

    await page.goto('/upload');
    await page.setInputFiles('input[type="file"]', DEGU_FIXTURE);
    await page.getByRole('button', { name: /upload/i }).click();

    await page.waitForURL(/\/library$/, { timeout: 30_000 });

    await expect(async () => {
      const cardsAfter = await page.locator(ASSET_CARD).count();
      expect(cardsAfter).toBeGreaterThan(cardsBefore);
    }).toPass({ timeout: 10_000 });
  });

  test('LIB3 — Photo cards show ≤3 labels with overflow pill when >3', async ({ page }) => {
    await page.goto('/library');
    // Filter to photo cards (skip documents which have no labels).
    const photoCard = page.locator(`${ASSET_CARD}[data-kind="photo"]`).first();
    await expect(photoCard).toBeVisible();
    const labels = photoCard.locator('[data-testid="card-label"]');
    const count = await labels.count();
    expect(count).toBeLessThanOrEqual(3);
    const overflow = photoCard.locator('[data-testid="label-overflow"]');
    if ((await overflow.count()) > 0) {
      await expect(overflow).toContainText(/\+\d+/);
    }
  });

  test('A1 — Asset detail shows labels in confidence-DESC order', async ({ page }) => {
    await page.goto('/library');
    const photoCard = page.locator(`${ASSET_CARD}[data-kind="photo"]`).first();
    await photoCard.click();
    await expect(page).toHaveURL(/\/asset\/\d+$/);
    const confidences = await page.locator('[data-testid="label-confidence"]').allInnerTexts();
    const numeric = confidences.map((c) => parseFloat(c));
    // Labels should arrive in confidence-DESC order (highest → lowest).
    for (let i = 1; i < numeric.length; i++) {
      expect(numeric[i - 1]).toBeGreaterThanOrEqual(numeric[i]!);
    }
  });

  test('A3 — File preview loads via /api/images/:id/file (no base64)', async ({ page }) => {
    await page.goto('/library');
    const photoCard = page.locator(`${ASSET_CARD}[data-kind="photo"]`).first();
    await photoCard.click();
    const img = page.locator('img[data-testid="asset-preview"]');
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toMatch(/\/api\/images\/\d+\/file$/);
    expect(src).not.toMatch(/^data:/);
  });
});
