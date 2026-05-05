---
name: Playwright async data-load race — wait for either-data-or-empty before counting
description: When a Playwright spec asserts on count of elements rendered from an async-loaded source (React useEffect → fetch), waiting on first-element-visible OR empty-state-visible (Promise.race) before count() prevents false-empty reads that race the data load.
type: feedback
---

**Rule:** When a Playwright spec asserts on the count of elements rendered from an async-loaded data source (React `useEffect` + fetch, suspended queries, deferred state), wait on **either** "first element visible" **or** "empty-state visible" via `Promise.race` **before** calling `count()`. Don't rely on `goto('/path')` having settled the data fetch — `goto` resolves on navigation, not on data hydration.

**Why:** Surfaced 2026-05-04 during destructive deleteAll spec authoring. The first run was SKIPPED (not failed) because:

```ts
await page.goto('/library');
const cardsBefore = await page.locator(ASSET_CARD).count();
if (cardsBefore === 0) test.skip(...);
```

Library had 20 assets per `/api/images` JSON. But `count()` ran *before* React's effect resolved + cards rendered, so it read 0 and skip-pathed. The `goto` resolution doesn't wait for in-flight `fetch()` calls triggered by mounted components.

**Fix pattern:**

```ts
await page.goto('/library');

// Wait for the page to settle: cards rendered OR empty-state visible.
await Promise.race([
  page.locator(ASSET_CARD).first().waitFor({ state: 'visible', timeout: 15_000 }),
  page.locator('[data-testid="empty-library"]').waitFor({ state: 'visible', timeout: 15_000 }),
]);

const cardsBefore = await page.locator(ASSET_CARD).count();
// Now cardsBefore is reliable.
```

After this fix, the same destructive test passed cleanly on re-run (20 → 0 wipe verified).

**How to apply:**

- **Generic trigger:** any Playwright assertion that depends on async-loaded data (lists, grids, tables, filtered subsets) — wait for the data-or-empty boundary first.
- **Selector pairs to wait on:** the testid for "data present" + the testid for "empty state". Both must exist on the page; if your app conflates them (e.g., shows nothing when empty), add an empty-state testid first.
- **Don't use fixed `waitForTimeout`** — flaky, slow, hides intermittent regressions. Use the data-boundary pattern.
- **Don't use `waitForLoadState('networkidle')`** — too broad; fires on any unrelated network activity.
- **Companion principle:** if you find yourself writing `count() === 0 → skip`, that's the smell. Either the data-boundary wait is missing, or the test should use `expect.poll(...)` to retry.

**Related pattern (not yet earning its own memory):** Playwright UI tests for two-step destructive confirmations (e.g., a modal that requires typing a phrase to enable the confirm button) read most cleanly when scoped: open the trigger → grab the modal via `page.getByRole('dialog')` → fill the input → click the now-enabled confirm. Demonstrated 2026-05-04 with `DeleteAllConfirm` (`REQUIRED_PHRASE='delete'`).
