import { test, expect } from '@playwright/test';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OVERSIZED_FIXTURE = join(__dirname, '..', 'fixtures', 'oversized.bin');
const FILE_INPUT = '[data-testid="upload-file-input"]';
const UPLOAD_SUBMIT = '[data-testid="upload-submit"]';

test.describe('Error surfaces (U4 + missing-file + 2 distinct 404 surfaces)', () => {
  test('U4 — File >50 MB rejected with friendly error toast', async ({ page }) => {
    await page.goto('/upload');
    await page.locator(FILE_INPUT).setInputFiles(OVERSIZED_FIXTURE);
    // After file selection, submit button should enable.
    await expect(page.locator(UPLOAD_SUBMIT)).toBeEnabled();
    await page.locator(UPLOAD_SUBMIT).click();
    // Server returns 4xx (multer LIMIT_FILE_SIZE → 50 MB cap per upload middleware:28);
    // UploadScreen catches and surfaces via addToast(errorMsg, 'error').
    // ToastProvider renders error toasts with role="status".
    const toast = page.getByRole('status').first();
    await expect(toast).toBeVisible({ timeout: 15_000 });
    // The exact error text comes from multer ("File too large" by default) or
    // the server's error envelope. Match flexibly on common error keywords.
    await expect(toast).toContainText(/error|fail|too large|limit|413|400/i);
    // User stays on /upload (no navigation away on failure).
    await expect(page).toHaveURL(/\/upload$/);
  });

  test('Submit button disabled when no files queued (UI prevents missing-file submit)', async ({ page }) => {
    // The UploadScreen submit button is `disabled={pendingCount === 0 || selectedUserid == null}`
    // (UploadScreen.tsx:307). The missing-file-validation surface is the disabled state itself —
    // the broken state is unreachable rather than reachable-with-validation-error.
    await page.goto('/upload');
    await expect(page.locator(UPLOAD_SUBMIT)).toBeDisabled();
    await expect(page.locator(UPLOAD_SUBMIT)).toContainText(/upload/i);
  });

  test('Unknown route → catch-all 404 page (NotFoundPage)', async ({ page }) => {
    // App.tsx:51 catches `*` to <NotFoundPage />. The page renders an h1 "404 — Not Found".
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByRole('heading', { name: /404|not found/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/doesn't exist/i)).toBeVisible();
  });

  test('Unknown asset id → AssetDetailPage error surface (distinct from catch-all 404)', async ({ page }) => {
    // /asset/:id matches AssetDetailPage which fetches the asset and renders an
    // explicit error UI when the fetch returns 404 (AssetDetailPage.tsx:30 →
    // setError('Asset not found') → data-testid="asset-detail-error" container).
    // This is a separate surface from the catch-all NotFoundPage.
    await page.goto('/asset/999999999');
    const errorPanel = page.locator('[data-testid="asset-detail-error"]');
    await expect(errorPanel).toBeVisible({ timeout: 10_000 });
    await expect(errorPanel).toContainText(/not found|not available/i);
  });
});
