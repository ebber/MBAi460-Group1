import { test, expect } from '@playwright/test';

const ASSET_CARD = '[data-testid^="asset-card-"]';

test.describe('DESTRUCTIVE: deleteAll() — opt-in only via e2e:destructive', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(() => {
    // eslint-disable-next-line no-console
    console.warn(
      '\n⚠️  DESTRUCTIVE E2E SUITE: this run will delete ALL assets in the live RDS+S3 stack.\n' +
      '⚠️  Cancel now (Ctrl-C) if any collaborator may be mid-test.\n'
    );
  });

  test('Library deleteAll → empty state', async ({ page }) => {
    await page.goto('/library');

    // Wait for the library to settle (async fetch resolves) — either at least one
    // asset card renders OR the empty-library state appears. Without this wait,
    // count() races the React effect and sees 0 cards before data loads.
    await Promise.race([
      page.locator(ASSET_CARD).first().waitFor({ state: 'visible', timeout: 15_000 }),
      page.locator('[data-testid="empty-library"]').waitFor({ state: 'visible', timeout: 15_000 }),
    ]);

    // If library is already empty, the test cannot exercise the delete arc;
    // skip rather than false-pass against pre-existing empty state.
    const cardsBefore = await page.locator(ASSET_CARD).count();
    if (cardsBefore === 0) {
      test.skip(true, 'Library is empty — nothing to delete; run library-happy-path or document-upload first');
    }

    // Click the LibraryPage "Delete all" trigger button (above the grid, before
    // the modal opens). Two buttons share the "Delete all" text on this page;
    // the trigger is the only one visible before the modal is open.
    await page.getByRole('button', { name: /delete all/i }).first().click();

    // DeleteAllConfirm modal opens — requires typing "delete" to enable.
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    const confirmInput = modal.locator('input[type="text"]');
    await confirmInput.fill('delete');

    // The confirm button inside the modal becomes enabled; click it.
    const confirmButton = modal.getByRole('button', { name: /delete all/i });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    // Wait for the wipe to complete + library to refresh.
    // Empty-state surface (EmptyLibrary, data-testid="empty-library") replaces the grid.
    await expect(page.locator('[data-testid="empty-library"]')).toBeVisible({ timeout: 30_000 });

    // Defensive: asset card count is now zero.
    await expect(page.locator(ASSET_CARD)).toHaveCount(0);
  });
});
