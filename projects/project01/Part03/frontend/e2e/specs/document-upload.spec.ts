import { test, expect } from '@playwright/test';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PDF_FIXTURE = join(__dirname, '..', 'fixtures', 'test-fixture.pdf');
const FILE_INPUT = '[data-testid="upload-file-input"]';
const UPLOAD_SUBMIT = '[data-testid="upload-submit"]';
const ASSET_CARD = '[data-testid^="asset-card-"]';
const DOC_CARD = `${ASSET_CARD}[data-kind="document"]`;

test.describe('Document branch (U3 + LIB4 + A2)', () => {
  // Serial: U3 seeds the document data that LIB4 + A2 read.
  test.describe.configure({ mode: 'serial' });

  test('U3 — Upload PDF → document card with "OCR coming soon" placeholder', async ({ page }) => {
    await page.goto('/library');
    const docCardsBefore = await page.locator(DOC_CARD).count();

    await page.goto('/upload');
    await page.locator(FILE_INPUT).setInputFiles(PDF_FIXTURE);
    await expect(page.locator(UPLOAD_SUBMIT)).toBeEnabled();
    await page.locator(UPLOAD_SUBMIT).click();

    await page.waitForURL(/\/library$/, { timeout: 30_000 });

    // Assert the document card count went up (defensive against stale data).
    await expect(async () => {
      const docCardsAfter = await page.locator(DOC_CARD).count();
      expect(docCardsAfter).toBeGreaterThan(docCardsBefore);
    }).toPass({ timeout: 10_000 });

    // The newest document card should show "OCR coming soon" via the
    // card-level placeholder (AssetCard.tsx:100).
    const newDocCard = page.locator(DOC_CARD).first();
    await expect(newDocCard.locator('[data-testid="ocr-placeholder"]')).toBeVisible();
    await expect(newDocCard).toContainText(/OCR coming soon/i);
  });

  test('LIB4 — Document cards render placeholder + carry no Rekognition labels', async ({ page }) => {
    await page.goto('/library');
    const docCard = page.locator(DOC_CARD).first();
    await expect(docCard).toBeVisible();
    await expect(docCard.locator('[data-testid="ocr-placeholder"]')).toBeVisible();
    // Documents must NOT have label chips (those are photo-only per AssetCard
    // branching on isPhoto = asset.kind === 'photo').
    await expect(docCard.locator('[data-testid="card-label"]')).toHaveCount(0);
  });

  test('A2 — Document detail shows PDF embed + "OCR coming soon" + no labels', async ({ page }) => {
    await page.goto('/library');
    await page.locator(DOC_CARD).first().click();
    await expect(page).toHaveURL(/\/asset\/\d+$/);

    // Document branch container (AssetDetail.tsx:130).
    await expect(page.locator('[data-testid="asset-detail-document"]')).toBeVisible();

    // PDF preview embed (the fixture is .pdf so the embed branch is taken,
    // not the document-no-preview fallback at line 152).
    await expect(page.locator('[data-testid="pdf-embed"]')).toBeVisible({ timeout: 10_000 });

    // OCR placeholder visible on the detail page (separate from the card-level one).
    await expect(page.locator('[data-testid="ocr-placeholder"]')).toBeVisible();

    // Documents have no Rekognition labels — confidence pills should be absent.
    await expect(page.locator('[data-testid="label-confidence"]')).toHaveCount(0);
  });
});
