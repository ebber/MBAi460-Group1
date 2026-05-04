# Playwright E2E (04) Execution Plan

> **🟢 Status (2026-05-04):** Plan-stage. Branch `feat/p01p03-playwright-e2e` created from `main` (last commit `d2e039c` Phase 0 merge). No execution started. Plan committed as the first commit on the branch.

> **For agentic workers:** Inline execution by the active agent (lightweight pattern, mirroring 01 / 02 / 03 — NOT full `superpowers:subagent-driven-development` ceremony per `feedback_subagent_overhead.md`). Steps use checkbox (`- [ ]`) syntax for tracking. **Updating this plan, the workstream approach doc, install-log, and source code are ATOMIC with each task's commit — not deferred.**

**Goal:** Add a Playwright-driven end-to-end test suite under `Part03/frontend/e2e/` that exercises the PhotoApp UI against the live Express + AWS+RDS stack, covering 12 of the 15 unticked browser-based human-walk rows from `MetaFiles/HumanTestInstructions/Human-Feature-Test-Suite.md`. The destructive `deleteAll()` arc ships as an opt-in sidecar that does not run by default.

**Architecture:** Playwright Test (`@playwright/test`) installed as a Part03/frontend devDep with chromium-only browser. Specs live in `frontend/e2e/specs/`; fixtures (one committed JPG + one runtime-generated PDF + one runtime-generated oversized blob) live in `frontend/e2e/fixtures/`. Two Playwright **projects** in `playwright.config.ts`: `default` (non-destructive — runs in CI) and `destructive` (opt-in — local on-demand only). `baseURL: http://localhost:8080`; serial execution (`workers: 1`); retries=1; reporter=list; trace + video on failure for triage. Express server (`npm start` from `Part03/`) must be running externally during local runs; CI starts it via `webServer` config.

**Tech Stack:** `@playwright/test` (latest 1.x), chromium binary (`npx playwright install chromium`), `pdfkit` (devDep, PDF fixture generation at global setup), Node 24.x (per Part 03 engines). Optional: `dotenv` if any env-driven config emerges (not anticipated).

**Approach doc (source of truth):** `MetaFiles/Approach/Future-State-playwright-e2e-workstream.md`. This plan tightens that approach into bite-sized, TDD-disciplined tasks; resolves three open routing decisions (fixtures = degu + runtime-pdfkit; destructive gating = named projects + split spec; CI = non-destructive only); and adds DOC-FRESHNESS closeout per the protocol introduced in Phase 0.5.

**Execution mode:** inline by the active agent. No subagent dispatch. Erik reviews at phase boundaries (between A↔B, B↔B-sidecar, B-sidecar↔C, C↔D, D↔E, E↔F).

---

## 🎯 First green spec — End of Phase A

After Phase A.5 lands, Erik can run:

```bash
cd ~/Documents/Lab/tempDir/MBAi460-Group1/projects/project01/Part03
npm start &                                # Terminal A — Express on :8080
cd frontend
npm run e2e                                # Terminal B — runs sanity spec
```

…and see Playwright pass a single sanity test that asserts `http://localhost:8080/` renders the wordmark. **This is the first viable green-pipe milestone.** Subsequent phases incrementally fill in coverage; final demo arrives at Phase F closeout.

---

## Standing Instructions

### Atomic doc-update gate (per `01-ui-workstream-plan.md` precedent — STRICT)

After each task's tests confirm GREEN:

1. Update **this plan's tracker** — flip the task's `[ ]` → `[x]` and the phase row in Master Tracker (✅ + commit hash + date).
2. Update **`MetaFiles/Approach/Future-State-playwright-e2e-workstream.md`** if scope, decisions, or status notes shifted (typical: at phase close).
3. Update **`Part03/MetaFiles/install-log.md`** if the task ran any `npm install` / `npm uninstall` / `npm prune`. **Working directory: `Part03/frontend/`** (NOT `Part03/`).
4. **Stage source + doc changes together** and commit in ONE git commit. The commit captures the full atomic state.
5. **Only then** start the next task.

### Push policy

No `git push` during execution. Erik signals when ready (anticipated at Phase F closeout when PR opens).

### Install permission

`npm install` permission is **pre-approved per Q5 routing (2026-05-04)**: agent asks once for the first install in a session, gets auto-approval thereafter for subsequent installs in the same session.

### Test scope reminder — what this workstream covers vs. defers

**Covered (12 of 15 unticked human-walk rows):**
- L1, L2, L3 — routing & auth (`routing-and-auth.spec.ts`)
- LIB3 — photo card label overflow (`library-happy-path.spec.ts`)
- LIB4 — document card placeholder (`document-upload.spec.ts`)
- U1, U2 — JPG upload happy path + error toast (`library-happy-path.spec.ts` + `error-paths.spec.ts`)
- U3 — PDF upload (`document-upload.spec.ts`)
- U4 — oversized file 400 + toast (`error-paths.spec.ts`)
- A1, A2, A3 — asset detail (photo + PDF + file preview) (`library-happy-path.spec.ts` + `document-upload.spec.ts`)

**Deferred (3 of 15) — NOT covered here, target other workstreams:**
- LIB1 (first-paint <2s) → Future-State Production Hardening (perf budget)
- LIB2 (responsive grid breakpoints 2/3/4/5 cols) → Future-State Mobile / Production Hardening
- A11Y1 (keyboard nav + focus + screen reader) → Future-State Production Hardening (axe-core gate)

At Phase F, tick the 12 covered rows in `Human-Feature-Test-Suite.md` with a footnote pointing to the spec ID. The 3 deferred rows stay un-ticked with a footnote pointing to their target workstream.

### Destructive arc gating

`destructive-deleteall.spec.ts` runs ONLY when `npm run e2e:destructive` is invoked (Playwright project filter). Default `npm run e2e` does NOT run it. CI (Phase E) runs ONLY the `default` project, never `destructive`. The split is enforced by `playwright.config.ts` projects, not by env vars or test tags — UX is self-documenting via npm-script names.

---

## Master Tracker

| Phase | Status | Commits | Date | Notes |
|---|---|---|---|---|
| Plan + branch | ✅ | `8f17d76` | 2026-05-04 | Plan committed after 2 adversarial self-reviews + 13 inline fixes |
| Phase A — Bootstrap | ✅ | `3aa9bd2`→`b7729d4`→`632a9c4`→`8cdf893`→`8366e7d`→(this) | 2026-05-04 | Sanity passes 454ms; default+destructive projects gated correctly; pdfkit ESM/CJS interop works (R1.1 averted) |
| Phase B — Happy path (default) | 🔄 | (next) | — | L1-L3 + LIB3 + U1 + A1 + A3 — awaiting phase-boundary review |
| Phase B-sidecar — Destructive deleteAll | ⏳ | — | — | Opt-in only |
| Phase C — Document branch | ⏳ | — | — | LIB4 + U3 + A2 |
| Phase D — Error surfaces | ⏳ | — | — | U2 + U4 + missing-file + 404 |
| Phase E — CI (non-destructive) | ⏳ | — | — | GitHub Actions workflow |
| Phase F — DOC-FRESHNESS closeout + PR | ⏳ | — | — | Workstream status flip + Human-Walk footnotes + OrientationMap + Roadmap + PR open |

---

## Phase A — Bootstrap

**Goal:** Install Playwright, configure two projects (default + destructive), establish fixture infrastructure, and ship a green sanity spec.

### Pre-flight: confirm `npm start` works on this branch

- [x] **Step P.1:** ✅ 2026-05-04 — three attempts: #1 failed (no node_modules → `npm install` resolved via workspace hoist to root); #2 failed (frontend dist + photoapp-config.ini missing → frontend `npm install` + `npm run build` + config copied in from an external reference); #3 ALL GREEN — `/` 200, `/health` 200, `/api/ping` `{user_count:3, s3_object_count:14}`, `/api/images` returns asset list with at least assetid 1001.

```bash
curl -sf http://localhost:8080/                    # SPA HTML
curl -sf http://localhost:8080/health              # 200 OK (CLI-1 surface)
curl -sf http://localhost:8080/api/ping            # JSON { users, assets } — confirms RDS connectivity
curl -sf http://localhost:8080/api/images          # JSON array — confirms S3 + RDS read path
```

All four must succeed. Kill server with Ctrl-C.

If `/api/ping` or `/api/images` fail, **STOP** — investigate before installing anything. Likely causes post-Phase 0: (a) `lib/photoapp-server` resolution (run `npm install` from `Part03/` to refresh the symlink), (b) AWS creds expired (check `projects/project01/client/photoapp-config.ini`), (c) RDS sleeping (lab unlocked but instance stopped). Do NOT proceed to Task A.1 until pre-flight passes.

- [x] **Step P.2:** ✅ 2026-05-04 — OrientationMap Active section replaced with Playwright E2E workstream entry; Pending row marked moved-to-active. Last-updated date refreshed.

```markdown
**Future-State Playwright E2E** | 🔄 In progress | `Part03/MetaFiles/plans/04-playwright-e2e-plan.md` | Phase A bootstrap; targets 12 of 15 unticked human-walk rows
```

Commit:

```bash
git add Part03/MetaFiles/OrientationMap.md \
        Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "chore(part03): activate Playwright E2E workstream in OrientationMap (Phase A pre-flight)"
```

### Task A.1: Install `@playwright/test`

**Files:**
- Modify: `Part03/frontend/package.json` (devDeps)
- Modify: `Part03/frontend/package-lock.json` (auto)
- Modify: `Part03/MetaFiles/install-log.md` (new entry)

- [x] **Step A.1.1:** ✅ 2026-05-04 — permission asked + granted ("Permission to run NPM install!"). Q5 auto-approval active for remainder of session.

- [x] **Step A.1.2:** ✅ 2026-05-04 — `npm install -D @playwright/test` clean exit. Version 1.59.1 added to devDeps.

```bash
cd ~/Documents/Lab/tempDir/MBAi460-Group1/projects/project01/Part03/frontend
npm install -D @playwright/test
```

Expected: `@playwright/test` appears in `devDependencies`; lockfile updated; `node_modules/@playwright/test/` exists.

- [x] **Step A.1.3:** ✅ 2026-05-04 — `npx playwright install chromium` clean exit. Chromium-1217 + headless-shell + ffmpeg downloaded to `~/Library/Caches/ms-playwright/`. `npx playwright --version` → `Version 1.59.1`.

```bash
npx playwright install chromium
```

Expected: chromium downloads to `~/Library/Caches/ms-playwright/chromium-*/` (~150 MB). Confirm with `npx playwright --version` printing a version string.

- [x] **Step A.1.4:** ✅ 2026-05-04 — install-log appended in 3 verbose entries matching prior format conventions: (a) P.1 backend `npm install` workspaces hoist, (b) P.1 frontend `npm install` + `npm run build`, (c) Phase A.1 `@playwright/test` + chromium.

- [ ] **Step A.1.5:** Commit.

```bash
git add Part03/frontend/package.json Part03/frontend/package-lock.json Part03/MetaFiles/install-log.md Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "feat(part03): install @playwright/test devDep (Phase A.1)"
```

### Task A.2: Playwright config + npm scripts

**Files:**
- Create: `Part03/frontend/playwright.config.ts`
- Modify: `Part03/frontend/package.json` (scripts)

- [x] **Step A.2.1:** ✅ 2026-05-04 — `playwright.config.ts` created at `Part03/frontend/playwright.config.ts` with two projects (default + destructive), serial execution, baseURL :8080, trace+video on failure, globalSetup pointing at `./e2e/fixtures/setup.ts`.

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  globalSetup: './e2e/fixtures/setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'default',
      testIgnore: ['**/destructive-*.spec.ts'],
    },
    {
      name: 'destructive',
      testMatch: ['**/destructive-*.spec.ts'],
    },
  ],
});
```

Key choices:
- `globalSetup` runs once before any test — generates the PDF fixture.
- `fullyParallel: false` + `workers: 1` — serial execution (live RDS+S3 means concurrent tests would conflict on shared state).
- Two projects gate destructive specs by filename (`destructive-*.spec.ts`); CI runs only `--project=default`.

- [x] **Step A.2.2:** ✅ 2026-05-04 — added 4 scripts: `e2e` (default project), `e2e:destructive` (destructive project), `e2e:all`, `e2e:install` (chromium binary refresh).

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test --project=default",
    "e2e:destructive": "playwright test --project=destructive",
    "e2e:all": "playwright test",
    "e2e:install": "playwright install chromium"
  }
}
```

- [ ] **Step A.2.3:** Commit.

```bash
git add Part03/frontend/playwright.config.ts Part03/frontend/package.json Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "feat(part03): playwright config + npm scripts (Phase A.2)"
```

### Task A.3: Fixture infrastructure (JPG copy + PDF generator + global setup)

**Files:**
- Create: `Part03/frontend/e2e/fixtures/01degu.jpg` (copy of `projects/project01/client/01degu.jpg`)
- Create: `Part03/frontend/e2e/fixtures/setup.ts` (global setup)
- Modify: `Part03/frontend/package.json` (devDeps — add `pdfkit`)
- Modify: `Part03/frontend/package-lock.json` (auto)
- Modify: `Part03/MetaFiles/install-log.md` (new entry)
- Modify: `Part03/frontend/.gitignore` (or root .gitignore — exclude generated PDF + oversized blob)

- [x] **Step A.3.1:** ✅ 2026-05-04 — `01degu.jpg` (163 KB) copied to `Part03/frontend/e2e/fixtures/01degu.jpg`. Larger than the plan's "~50 KB" estimate; full-quality canonical Andrew fixture.

```bash
mkdir -p Part03/frontend/e2e/fixtures
cp projects/project01/client/01degu.jpg Part03/frontend/e2e/fixtures/01degu.jpg
ls -la Part03/frontend/e2e/fixtures/01degu.jpg
```

Expected: file exists, size ~20–50 KB (Andrew's degu image).

- [x] **Step A.3.2:** ✅ 2026-05-04 — `npm install -D pdfkit @types/pdfkit` clean. pdfkit@^0.18.0, @types/pdfkit@^0.17.6.

```bash
cd Part03/frontend
npm install -D pdfkit @types/pdfkit
```

Expected: `pdfkit` and `@types/pdfkit` appear in devDeps; lockfile updated.

- [x] **Step A.3.3:** ✅ 2026-05-04 — `e2e/fixtures/setup.ts` written exactly per plan code block (PDF gen + oversized blob gen + RUN_ID export + globalSetup default export). ESM/CJS interop verified at A.4 sanity run.

> **ESM/CJS note:** `pdfkit` is a CJS module; `Part03/frontend/package.json` has `"type": "module"`. The default-import form (`import PDFDocument from 'pdfkit'`) works under modern Node + Playwright TS loader **if** TypeScript's `esModuleInterop: true` is enabled (it is — see `tsconfig.app.json`). If the import fails at runtime with "PDFDocument is not a constructor", swap to: `import PDFKit from 'pdfkit'; const PDFDocument = (PDFKit as unknown as typeof import('pdfkit'));` or use `createRequire` from `module`. Verify by running the sanity spec after creating this file — failure surfaces immediately.

```typescript
import PDFDocument from 'pdfkit';
import { createWriteStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = __dirname;

export const RUN_ID = randomUUID();

/** Generate a tiny single-page PDF for E2E document-upload tests. */
async function generateTestPdf(): Promise<string> {
  const path = join(FIXTURES_DIR, 'test-fixture.pdf');
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const stream = createWriteStream(path);
    doc.pipe(stream);
    doc.fontSize(20).text('E2E Test Fixture — DO NOT KEEP', 50, 100);
    doc.fontSize(12).text(`Run ID: ${RUN_ID}`, 50, 150);
    doc.fontSize(10).text('Generated by playwright global setup. Safe to delete.', 50, 180);
    doc.end();
    stream.on('finish', () => resolve(path));
    stream.on('error', reject);
  });
}

/** Generate a 51 MB oversized blob for U4 (>50 MB rejection test). */
async function generateOversizedBlob(): Promise<string> {
  const path = join(FIXTURES_DIR, 'oversized.bin');
  if (existsSync(path) && statSync(path).size > 50 * 1024 * 1024) {
    return path;
  }
  const { writeFile } = await import('node:fs/promises');
  const buf = Buffer.alloc(51 * 1024 * 1024, 0);
  await writeFile(path, buf);
  return path;
}

export default async function globalSetup() {
  if (!existsSync(FIXTURES_DIR)) mkdirSync(FIXTURES_DIR, { recursive: true });
  const pdfPath = await generateTestPdf();
  const blobPath = await generateOversizedBlob();
  console.log(`[e2e/fixtures/setup] PDF generated at ${pdfPath}`);
  console.log(`[e2e/fixtures/setup] oversized blob generated at ${blobPath}`);
  console.log(`[e2e/fixtures/setup] RUN_ID = ${RUN_ID}`);
}
```

- [x] **Step A.3.4:** ✅ 2026-05-04 — `e2e/fixtures/.gitignore` created with entries for `test-fixture.pdf` and `oversized.bin`.

Create or modify `Part03/frontend/e2e/fixtures/.gitignore`:

```
# Generated at global setup; never committed
test-fixture.pdf
oversized.bin
```

- [x] **Step A.3.5:** ✅ 2026-05-04 — install-log entry appended for pdfkit + types.

Append to `Part03/MetaFiles/install-log.md`:

```markdown
### 2026-05-04 — Phase A Task A.3 (`feat/p01p03-playwright-e2e`)

| Action | Working dir | Package | Why |
|---|---|---|---|
| `npm install -D pdfkit @types/pdfkit` | `Part03/frontend/` | `pdfkit@^0.x` + types | Runtime-generate PDF fixture in `e2e/fixtures/setup.ts` (avoid committing binary) |
```

- [ ] **Step A.3.6:** Commit.

```bash
git add Part03/frontend/e2e/fixtures/01degu.jpg \
        Part03/frontend/e2e/fixtures/setup.ts \
        Part03/frontend/e2e/fixtures/.gitignore \
        Part03/frontend/package.json \
        Part03/frontend/package-lock.json \
        Part03/MetaFiles/install-log.md \
        Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "feat(part03): e2e fixture infrastructure — degu.jpg + pdfkit setup (Phase A.3)"
```

### Task A.4: Sanity spec — wordmark renders on `/`

**Files:**
- Create: `Part03/frontend/e2e/specs/sanity.spec.ts`

- [x] **Step A.4.1:** ✅ 2026-05-04 — `e2e/specs/sanity.spec.ts` written; uses `getByText(/MBAi\s*460/)` (regex per R1.2 fix from adversarial review).

```typescript
import { test, expect } from '@playwright/test';

test.describe('Sanity', () => {
  test('home page renders the MBAi 460 wordmark', async ({ page }) => {
    await page.goto('/');
    // Use regex to tolerate "MBAi 460" rendered alongside other text or with different whitespace.
    await expect(page.getByText(/MBAi\s*460/)).toBeVisible();
  });
});
```

The wordmark text "MBAi 460" is asserted in `Human-Feature-Test-Suite.md` L1 expectations + appears in `frontend/src/components/TopBar.tsx`. If the selector misses, fall back to `getByRole('banner')` or inspect TopBar's rendered text — do NOT loosen to a partial match without flagging.

- [x] **Step A.4.2:** ✅ 2026-05-04 — sanity spec passed in 615ms (total run 2.1s); 1/1 passed; no retries needed. globalSetup logged: PDF generated, oversized blob (51 MB) generated, RUN_ID emitted. **Adversarial review R1.1 risk (pdfkit CJS/ESM interop) averted** — default-import form worked without fallback.

In Terminal A:

```bash
cd ~/Documents/Lab/tempDir/MBAi460-Group1/projects/project01/Part03
npm start
# wait for: **Web service running, listening on port 8080...**
```

In Terminal B:

```bash
cd ~/Documents/Lab/tempDir/MBAi460-Group1/projects/project01/Part03/frontend
npm run e2e
```

Expected output: 1 passed (1 with retries=0), `[default]` project shown in header.

- [ ] **Step A.4.3:** Commit.

```bash
git add Part03/frontend/e2e/specs/sanity.spec.ts \
        Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "feat(part03): sanity e2e spec — wordmark renders (Phase A.4)"
```

### Task A.5: Phase A close-out gate

- [x] **Step A.5.1:** ✅ 2026-05-04 — `npm run e2e` returned 1 passed (sanity; 101ms execution, 454ms total run). Clean.

```bash
cd Part03/frontend
npm run e2e
```

Expected: 1 passed (sanity); 0 failed; trace/video artifacts only on failure.

- [x] **Step A.5.2:** ✅ 2026-05-04 — `npm run e2e:destructive` returned "No tests found" — project filter working as designed. Destructive specs land in Phase B-sidecar.

```bash
npm run e2e:destructive
```

Expected: "No tests found" (or 0 passed). This confirms the project filter works — destructive specs don't yet exist, so the destructive project is empty by design.

- [x] **Step A.5.3:** ✅ 2026-05-04 — Master Tracker flipped: Phase A ✅ with commit range; Phase B 🔄 awaiting boundary review.

- [x] **Step A.5.4:** ✅ 2026-05-04 — committed (this commit).

```bash
git add Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "chore(part03): close out Phase A — flip tracker (Phase A.5)"
```

---

## Phase B — Happy path (default suite)

**Goal:** Cover routing/auth (L1, L2, L3) and the JPG happy-path arc (U1, A1, A3, LIB3) in two specs that ship in the default project.

### Task B.1: `routing-and-auth.spec.ts` — L1, L2, L3

**Files:**
- Create: `Part03/frontend/e2e/specs/routing-and-auth.spec.ts`

- [x] **Step B.1.1:** ✅ 2026-05-04 — `routing-and-auth.spec.ts` written. Source-inspection confirmed `useUIStore` NOT exposed on window → used **behavioral fallback for L2** (assert `/library` URL after submit; LoginScreen.tsx:34 navigates after setMockAuth). LoginScreen has proper `htmlFor`/`id` form linkage so `getByLabel` works.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Routing & Auth (L1–L3)', () => {
  test('L1 — Default route redirects to /library', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByText('MBAi 460')).toBeVisible();
  });

  test('L2 — Login page reachable; submit toggles mockAuth', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await page.getByLabel(/username/i).fill('erik');
    await page.getByLabel(/password/i).fill('test123');
    await page.getByRole('button', { name: /sign in/i }).click();
    const mockAuthed = await page.evaluate(() =>
      // @ts-expect-error — Zustand store exposed on window for E2E inspection
      window.useUIStore?.getState().mockAuth.isMockAuthed
    );
    expect(mockAuthed).toBe(true);
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
```

**Note on L2 store inspection:** the spec assumes `window.useUIStore` is exposed for E2E inspection. If the Zustand store is NOT globally exposed (likely), there are two paths: (a) augment the dev/preview build to expose it under a test flag (cleanest); (b) assert behaviorally via UI-visible state change after submit (no store inspection needed). Default to (b) to avoid surface mutation; if behavioral assertion is ambiguous, flag and route.

**Behavioral fallback for L2** (use this version if `window.useUIStore` isn't exposed):

```typescript
test('L2 — Login page reachable; submit produces visible auth state', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  await page.getByLabel(/username/i).fill('erik');
  await page.getByLabel(/password/i).fill('test123');
  await page.getByRole('button', { name: /sign in/i }).click();
  // After mockAuth toggle, app routes back to /library
  await expect(page).toHaveURL(/\/library$/);
});
```

Decide which version applies during execution by inspecting `frontend/src/stores/ui.ts` for window exposure; default to behavioral if uncertain.

- [x] **Step B.1.2:** ✅ 2026-05-04 — 3/3 passed (1.1s total): L1 248ms, L2 156ms, L3 168ms.

```bash
cd Part03/frontend
npm run e2e -- routing-and-auth
```

Expected: 3 passed; total 4 (with sanity).

- [ ] **Step B.1.3:** Commit.

```bash
git add Part03/frontend/e2e/specs/routing-and-auth.spec.ts \
        Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "feat(part03): e2e routing-and-auth.spec — L1/L2/L3 (Phase B.1)"
```

### Task B.2: `library-happy-path.spec.ts` — U1, LIB3, A1, A3

**Files:**
- Create: `Part03/frontend/e2e/specs/library-happy-path.spec.ts`

- [ ] **Step B.2.1:** Write the spec.

```typescript
import { test, expect } from '@playwright/test';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEGU_FIXTURE = join(__dirname, '..', 'fixtures', '01degu.jpg');

test.describe('Library happy path (U1 + LIB3 + A1 + A3)', () => {
  // Serial mode: U1 seeds data that LIB3/A1/A3 read. If U1 fails, subsequent tests
  // skip rather than running against ambiguous state.
  test.describe.configure({ mode: 'serial' });

  test('U1 — Upload JPG → assetid → library refreshes with new card + labels', async ({ page }) => {
    // Capture pre-upload count so we can assert the upload actually landed.
    await page.goto('/library');
    const cardsBefore = await page.locator('[data-testid="asset-card"]').count();

    await page.goto('/upload');
    await page.setInputFiles('input[type="file"]', DEGU_FIXTURE);
    await page.getByRole('button', { name: /upload/i }).click();

    // Upload service awaits DetectLabels before responding (per workstream Risks doc),
    // so the response includes the new asset; library refresh should follow.
    await page.waitForURL(/\/library$/, { timeout: 30_000 });

    // Assert the count went up — defensive against false-pass from stale prior data.
    await expect(async () => {
      const cardsAfter = await page.locator('[data-testid="asset-card"]').count();
      expect(cardsAfter).toBeGreaterThan(cardsBefore);
    }).toPass({ timeout: 10_000 });
  });

  test('LIB3 — Photo cards show ≤3 labels with overflow pill when >3', async ({ page }) => {
    await page.goto('/library');
    const card = page.locator('[data-testid="asset-card"]').first();
    await expect(card).toBeVisible();
    const labels = card.locator('[data-testid="card-label"]');
    const count = await labels.count();
    expect(count).toBeLessThanOrEqual(3);
    // If >3 labels exist on the asset, an overflow pill is present.
    const overflow = card.locator('[data-testid="card-label-overflow"]');
    if ((await overflow.count()) > 0) {
      await expect(overflow).toContainText(/\+\d+/);
    }
  });

  test('A1 — Asset detail shows labels in confidence-DESC order', async ({ page }) => {
    await page.goto('/library');
    await page.locator('[data-testid="asset-card"]').first().click();
    await expect(page).toHaveURL(/\/asset\/\d+$/);
    const confidences = await page.locator('[data-testid="label-confidence"]').allInnerTexts();
    const numeric = confidences.map((c) => parseFloat(c));
    for (let i = 1; i < numeric.length; i++) {
      expect(numeric[i - 1]).toBeGreaterThanOrEqual(numeric[i]);
    }
  });

  test('A3 — File preview loads via /api/images/:id/file (no base64)', async ({ page }) => {
    await page.goto('/library');
    await page.locator('[data-testid="asset-card"]').first().click();
    const img = page.locator('img[data-testid="asset-preview"]');
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toMatch(/\/api\/images\/\d+\/file$/);
    expect(src).not.toMatch(/^data:/);
  });
});
```

**Selector dependencies:** this spec relies on `data-testid` attributes (`asset-card`, `card-label`, `card-label-overflow`, `label-confidence`, `asset-preview`). Verify these exist in the rendered components before running — if any are missing, EITHER (a) add them to the source components (small surface change, justified for E2E observability) OR (b) refactor the spec to use accessible selectors (`getByRole`, `getByText`). Default to (a) for stability; flag any missing testid as part of the task.

- [ ] **Step B.2.2:** Inspect components for `data-testid` presence.

```bash
grep -rn "data-testid" Part03/frontend/src/components/AssetCard.tsx \
                       Part03/frontend/src/pages/AssetDetail.tsx \
                       Part03/frontend/src/components/Library.tsx
```

If missing, add minimal `data-testid` attributes to the components. Each addition is a one-line change; commit them with the spec.

- [ ] **Step B.2.3:** Run the spec.

```bash
cd Part03/frontend
npm run e2e -- library-happy-path
```

Expected: 4 passed (assuming Library has at least one asset; if empty, U1 seeds it).

- [ ] **Step B.2.4:** Commit.

```bash
git add Part03/frontend/e2e/specs/library-happy-path.spec.ts \
        Part03/frontend/src/components/AssetCard.tsx \
        Part03/frontend/src/pages/AssetDetail.tsx \
        Part03/frontend/src/components/Library.tsx \
        Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "feat(part03): e2e library-happy-path.spec — U1/LIB3/A1/A3 + testid (Phase B.2)"
```

### Task B.3: Phase B close-out gate

- [ ] **Step B.3.1:** Run full default suite.

```bash
cd Part03/frontend
npm run e2e
```

Expected: 8 passed total (1 sanity + 3 routing + 4 happy-path).

- [ ] **Step B.3.2:** Update Master Tracker — flip Phase B row.

- [ ] **Step B.3.3:** Commit tracker flip.

```bash
git add Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "chore(part03): close out Phase B — flip tracker (Phase B.3)"
```

---

## Phase B-sidecar — Destructive deleteAll

**Goal:** Ship the `deleteAll()` arc as an opt-in destructive spec that runs only via `npm run e2e:destructive`. Default suite is unaffected.

### Task BS.1: `destructive-deleteall.spec.ts`

**Files:**
- Create: `Part03/frontend/e2e/specs/destructive-deleteall.spec.ts`

- [ ] **Step BS.1.1:** Write the spec.

```typescript
import { test, expect } from '@playwright/test';

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
    // Confirm there's something to delete (or upload a fixture first if empty).
    const cardsBefore = await page.locator('[data-testid="asset-card"]').count();
    if (cardsBefore === 0) {
      test.skip(true, 'Library is empty — nothing to delete; run library-happy-path first');
    }
    // Click delete-all (button text per Human-Feature-Test-Suite + UI source).
    await page.getByRole('button', { name: /delete\s*all/i }).click();
    // Confirm via modal if one exists (per AssetDetail/Library Modal usage).
    const confirm = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirm.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await confirm.click();
    }
    await expect(page.locator('[data-testid="asset-card"]')).toHaveCount(0, { timeout: 30_000 });
    // Empty-state messaging is in the Library component.
    await expect(page.getByText(/no assets|empty/i)).toBeVisible();
  });
});
```

**Caveat:** if no delete-all button exists in the UI (Library/AssetDetail), this test cannot run as written. Inspect `frontend/src/components/Library.tsx` + nearby for the delete-all entry point. If absent, EITHER (a) add it (out of this workstream's scope — flag as Library Polish) OR (b) trigger via direct API `DELETE /api/images` from the Playwright request context. Default to (b) if no UI entry exists.

**API-fallback variant** (use if no UI delete-all button exists):

```typescript
test('API deleteAll → empty state', async ({ page, request }) => {
  await page.goto('/library');
  const before = await page.locator('[data-testid="asset-card"]').count();
  if (before === 0) test.skip(true, 'Library is empty');
  const res = await request.delete('/api/images');
  expect(res.ok()).toBe(true);
  await page.reload();
  await expect(page.locator('[data-testid="asset-card"]')).toHaveCount(0, { timeout: 10_000 });
});
```

Choose the variant during execution based on UI inspection; commit only one.

- [ ] **Step BS.1.2:** Run the destructive project.

```bash
cd Part03/frontend
npm run e2e:destructive
```

Expected: 1 passed (assuming library has assets; otherwise skipped).

- [ ] **Step BS.1.3:** Confirm default suite still does NOT run this spec.

```bash
npm run e2e
```

Expected: 8 passed (Phase B total) — destructive spec NOT executed.

- [ ] **Step BS.1.4:** Commit.

```bash
git add Part03/frontend/e2e/specs/destructive-deleteall.spec.ts \
        Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "feat(part03): e2e destructive-deleteall.spec — opt-in only (Phase BS.1)"
```

### Task BS.2: Phase B-sidecar close-out gate

- [ ] **Step BS.2.1:** Update Master Tracker.
- [ ] **Step BS.2.2:** Commit tracker flip.

```bash
git add Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "chore(part03): close out Phase B-sidecar — flip tracker (Phase BS.2)"
```

---

## Phase C — Document branch

**Goal:** Cover U3 (PDF upload) + A2 (PDF preview + "OCR coming soon") + LIB4 (document card placeholder).

### Task C.1: `document-upload.spec.ts`

**Files:**
- Create: `Part03/frontend/e2e/specs/document-upload.spec.ts`

- [ ] **Step C.1.1:** Write the spec.

```typescript
import { test, expect } from '@playwright/test';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PDF_FIXTURE = join(__dirname, '..', 'fixtures', 'test-fixture.pdf');

test.describe('Document branch (U3 + A2 + LIB4)', () => {
  test('U3 — Upload PDF → document card with "OCR coming soon"', async ({ page }) => {
    await page.goto('/upload');
    await page.setInputFiles('input[type="file"]', PDF_FIXTURE);
    await page.getByRole('button', { name: /upload/i }).click();
    await page.waitForURL(/\/library$/, { timeout: 30_000 });
    // The newly-uploaded document should be the most recent card.
    const docCard = page.locator('[data-testid="asset-card"][data-kind="document"]').first();
    await expect(docCard).toBeVisible();
    await expect(docCard).toContainText(/OCR coming soon/i);
  });

  test('LIB4 — Document cards render metadata + placeholder (no labels)', async ({ page }) => {
    await page.goto('/library');
    const docCard = page.locator('[data-testid="asset-card"][data-kind="document"]').first();
    await expect(docCard).toBeVisible();
    // Document cards should NOT have label chips (those are photo-only).
    await expect(docCard.locator('[data-testid="card-label"]')).toHaveCount(0);
  });

  test('A2 — Document asset detail shows PDF embed + "OCR coming soon"', async ({ page }) => {
    await page.goto('/library');
    await page.locator('[data-testid="asset-card"][data-kind="document"]').first().click();
    await expect(page).toHaveURL(/\/asset\/\d+$/);
    // PDF preview is rendered via <embed>, <iframe>, or <object> — accept any.
    const preview = page.locator('embed[type="application/pdf"], iframe[data-testid="pdf-preview"], object[type="application/pdf"]');
    await expect(preview.first()).toBeVisible();
    await expect(page.getByText(/OCR coming soon/i)).toBeVisible();
    // No labels on a document.
    await expect(page.locator('[data-testid="label-confidence"]')).toHaveCount(0);
  });
});
```

**Selector dependency:** spec assumes `data-kind="document"` attribute on AssetCard for kind discrimination. Verify in `AssetCard.tsx` before running — add if missing (one-line change). Same for `data-testid="pdf-preview"` if neither `<embed>` nor `<object>` is used; inspect `AssetDetail.tsx` PDF rendering path.

- [ ] **Step C.1.2:** Inspect components for required attributes; add if missing.

- [ ] **Step C.1.3:** Run the spec.

```bash
cd Part03/frontend
npm run e2e -- document-upload
```

Expected: 3 passed.

- [ ] **Step C.1.4:** Commit.

```bash
git add Part03/frontend/e2e/specs/document-upload.spec.ts \
        Part03/frontend/src/components/AssetCard.tsx \
        Part03/frontend/src/pages/AssetDetail.tsx \
        Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "feat(part03): e2e document-upload.spec — U3/LIB4/A2 (Phase C.1)"
```

### Task C.2: Phase C close-out gate

- [ ] **Step C.2.1:** Run full default suite — expect 11 passed.
- [ ] **Step C.2.2:** Update Master Tracker.
- [ ] **Step C.2.3:** Commit.

```bash
git add Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "chore(part03): close out Phase C — flip tracker (Phase C.2)"
```

---

## Phase D — Error surfaces

**Goal:** Cover U4 (oversized → 400 + toast), U2 (upload error toast), missing-file validation, and unknown-route 404 page.

### Task D.1: `error-paths.spec.ts`

**Files:**
- Create: `Part03/frontend/e2e/specs/error-paths.spec.ts`

- [ ] **Step D.1.1:** Write the spec.

```typescript
import { test, expect } from '@playwright/test';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OVERSIZED_FIXTURE = join(__dirname, '..', 'fixtures', 'oversized.bin');

test.describe('Error surfaces (U4 + U2 + missing-file + 404)', () => {
  test('U4 — File >50 MB rejected with friendly toast', async ({ page }) => {
    await page.goto('/upload');
    await page.setInputFiles('input[type="file"]', OVERSIZED_FIXTURE);
    await page.getByRole('button', { name: /upload/i }).click();
    // Server returns 400; UI surfaces friendly toast.
    const toast = page.locator('[data-testid="toast-error"], [role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 15_000 });
    await expect(toast).toContainText(/too large|50 MB|exceeds/i);
    // User stays on /upload (no navigation).
    await expect(page).toHaveURL(/\/upload$/);
  });

  test('Missing file in upload form → inline validation error', async ({ page }) => {
    await page.goto('/upload');
    await page.getByRole('button', { name: /upload/i }).click();
    // No file selected — UI should surface inline validation OR friendly toast.
    const errorSurface = page.locator('[data-testid="form-error"], [data-testid="toast-error"], [role="alert"]').first();
    await expect(errorSurface).toBeVisible({ timeout: 5_000 });
  });

  test('Unknown asset detail route → 404 page', async ({ page }) => {
    await page.goto('/asset/999999999');
    // App should render a 404 page rather than crash or redirect to library.
    const notFound = page.getByText(/not found|404|doesn't exist/i);
    await expect(notFound).toBeVisible({ timeout: 10_000 });
  });
});
```

**Selector dependencies:** `[data-testid="toast-error"]` and `[data-testid="form-error"]`. Inspect `frontend/src/components/ToastProvider.tsx` and the upload form for these — add if missing. `[role="alert"]` is a fallback that works for any ARIA-compliant toast/banner component.

- [ ] **Step D.1.2:** Inspect components; add testids if needed.

- [ ] **Step D.1.3:** Run the spec.

```bash
cd Part03/frontend
npm run e2e -- error-paths
```

Expected: 3 passed.

- [ ] **Step D.1.4:** Commit.

```bash
git add Part03/frontend/e2e/specs/error-paths.spec.ts \
        Part03/frontend/src/components/ToastProvider.tsx \
        Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "feat(part03): e2e error-paths.spec — U4/U2/missing-file/404 (Phase D.1)"
```

### Task D.2: Phase D close-out gate

- [ ] **Step D.2.1:** Run full default suite — expect 14 passed.
- [ ] **Step D.2.2:** Coverage review per `feedback_test_coverage_review.md` — step back: which behavioral paths remain uncovered? Document the answer in this plan + scratch dir.
- [ ] **Step D.2.3:** Update Master Tracker.
- [ ] **Step D.2.4:** Commit.

```bash
git add Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "chore(part03): close out Phase D — flip tracker + coverage review (Phase D.2)"
```

---

## Phase E — CI integration (non-destructive only)

**Goal:** Add a GitHub Actions workflow that runs `npm run e2e` (default project only) on every PR to `main`.

### Task E.1: `.github/workflows/playwright.yml`

**Files:**
- Create: `.github/workflows/playwright.yml`

- [ ] **Step E.1.1:** Write the workflow.

```yaml
name: Playwright E2E

on:
  pull_request:
    branches: [main]
    paths:
      - 'projects/project01/Part03/**'
      - 'lib/photoapp-server/**'
      - '.github/workflows/playwright.yml'
  workflow_dispatch:

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    defaults:
      run:
        working-directory: projects/project01/Part03

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: |
            projects/project01/Part03/package-lock.json
            projects/project01/Part03/frontend/package-lock.json
            lib/photoapp-server/package-lock.json

      - name: Install backend deps
        run: npm ci

      - name: Install frontend deps
        working-directory: projects/project01/Part03/frontend
        run: npm ci

      - name: Build frontend
        working-directory: projects/project01/Part03/frontend
        run: npm run build

      - name: Install Playwright chromium
        working-directory: projects/project01/Part03/frontend
        run: npx playwright install --with-deps chromium

      - name: Start Express + run Playwright
        working-directory: projects/project01/Part03
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.E2E_AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.E2E_AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-2
        run: |
          npm start &
          SERVER_PID=$!
          # Wait for :8080 to respond
          for i in {1..30}; do
            if curl -sf http://localhost:8080/health >/dev/null 2>&1; then break; fi
            sleep 1
          done
          cd frontend
          npm run e2e
          STATUS=$?
          kill $SERVER_PID || true
          exit $STATUS

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: projects/project01/Part03/frontend/playwright-report
          retention-days: 7
```

**Secrets required:** `E2E_AWS_ACCESS_KEY_ID`, `E2E_AWS_SECRET_ACCESS_KEY` — should be a SCOPED IAM identity (not the full Claude-Conjurer creds). **Flag this for Erik to provision** — the workflow won't run successfully without these. Capture as a sub-task to ensure setup precedes the first PR-triggered run.

**Path filter rationale:** workflow runs only when Part03, the consumed lib, or the workflow itself changes — avoids burning CI minutes on unrelated commits.

- [ ] **Step E.1.2:** Test the workflow locally via `act` if available, or commit and observe on first PR.

- [ ] **Step E.1.3:** Commit.

```bash
git add .github/workflows/playwright.yml \
        Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "ci(part03): playwright E2E GHA workflow — non-destructive (Phase E.1)"
```

### Task E.2: Surface secrets requirement to Erik

- [ ] **Step E.2.1:** Open a row in `Part03/MetaFiles/scratch/playwright-e2e-notes.md` (create if absent) capturing the secrets requirement, suggested IAM scope (S3 read/write on `photoapp-erik-mbai460`, RDS connect on `photoapp-db`, Rekognition `DetectLabels`), and the GHA secrets to set.
- [ ] **Step E.2.2:** Surface to Erik in chat — ack/act/queue.
- [ ] **Step E.2.3:** Commit scratch note.

### Task E.3: Phase E close-out gate

- [ ] **Step E.3.1:** Update Master Tracker.
- [ ] **Step E.3.2:** Commit.

---

## Phase F — DOC-FRESHNESS closeout + PR

**Goal:** Update all surfaces that reference Playwright E2E status; tick the 12 covered Human-Walk rows; update OrientationMap + roadmap; open the PR.

### Task F.1: Tick 12 rows in `Human-Feature-Test-Suite.md`

**Files:**
- Modify: `Part03/MetaFiles/HumanTestInstructions/Human-Feature-Test-Suite.md`

- [ ] **Step F.1.1:** For each of L1, L2, L3, LIB3, LIB4, U1, U2, U3, U4, A1, A2, A3 — flip `[ ]` → `[x]` and append a footnote at the end of each test section:

```markdown
> **Automated by Playwright E2E** (Phase 04 plan, `<spec-filename>.spec.ts`). Browser walk no longer required for regression — `npm run e2e` covers this row.
```

- [ ] **Step F.1.2:** For LIB1, LIB2, A11Y1 (the 3 deferred) — leave `[ ]` and append:

```markdown
> **Not covered by Playwright E2E workstream** — deferred to Future-State Production Hardening (perf budget / a11y axe-core gate / responsive viewport). Manual walk still required until that workstream lands.
```

- [ ] **Step F.1.3:** Commit.

```bash
git add Part03/MetaFiles/HumanTestInstructions/Human-Feature-Test-Suite.md \
        Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "docs(part03): tick 12 human-walk rows now covered by Playwright (Phase F.1)"
```

### Task F.2: Update workstream approach doc

**Files:**
- Modify: `Part03/MetaFiles/Approach/Future-State-playwright-e2e-workstream.md`

- [ ] **Step F.2.1:** Change status banner from "Aspirational. **Not committed to Part 03 assignment completion.** **🔥 HIGH PRIORITY**" to "✅ LANDED 2026-05-04 — see `Part03/MetaFiles/plans/04-playwright-e2e-plan.md`".

- [ ] **Step F.2.2:** Add a Closeout section at the bottom referencing the plan, the 12 covered rows, and the 3 deferred rows.

- [ ] **Step F.2.3:** Commit.

### Task F.3: Update OrientationMap

**Files:**
- Modify: `Part03/MetaFiles/OrientationMap.md`

- [ ] **Step F.3.1:** Move "Future-State Playwright E2E" row from Pending → Closed (recent — Class Project) with closeout commit hash + date.

- [ ] **Step F.3.2:** Commit.

### Task F.4: Update Future-State-roadmap.md

**Files:**
- Modify: `Part03/MetaFiles/Approach/Future-State-roadmap.md`

- [ ] **Step F.4.1:** Move Playwright E2E from Tier 1 (active) → DONE in the activation priority recommendation section. Tier 1 reduces to: Form Library, Library Polish.

- [ ] **Step F.4.2:** Commit.

### Task F.5: Capture proposed memories

**Files:**
- Create: `MBAi460-Group1/MetaFiles/Offered_Memories/<feedback_*.md>` files for any noteworthy patterns surfaced during execution
- Modify: `MBAi460-Group1/MetaFiles/Offered_Memories/MEMORY.md` (index)

Candidates to evaluate:
- **Destructive E2E test gating via Playwright projects** — pattern + when to apply (single shared stack, no API-level scoping)
- **Runtime fixture generation via global setup** — keep binaries out of repo
- **`data-testid` placement convention** — where to add, how to name, how to balance with accessible selectors
- **Live-AWS E2E tradeoffs** — when E2E against shared infra is and isn't appropriate

**Aggregate Memory Check** (apply to each candidate before filing):

1. **Cluster Test** — is this a distinct behavior, or an example of a larger one?
2. **Retrieval Test** — would I know which memory to open at the moment I need it?
3. **Compression Test** — could this + others be replaced by one principle + examples?
4. **Load Test** — does this make me sharper, or merely heavier?
5. **Tension Test** — does this pull in a different direction from another memory; if so, is the relationship named?

- [ ] **Step F.5.1:** Apply the 5 questions to each candidate. File only those that pass all five (or pass with named caveats).
- [ ] **Step F.5.2:** Write memory files; update index.
- [ ] **Step F.5.3:** Commit.

### Task F.6: Final default-suite green run + push + PR

- [ ] **Step F.6.1:** Run full default suite — expect all 14+ tests passing.

```bash
cd Part03/frontend
npm run e2e
```

- [ ] **Step F.6.2:** Update Master Tracker — flip Phase F + overall plan status to ✅ LANDED.

- [ ] **Step F.6.3:** Final commit.

```bash
git add Part03/MetaFiles/plans/04-playwright-e2e-plan.md
git commit -m "chore(part03): close out Phase F — Playwright E2E workstream landed"
```

- [ ] **Step F.6.4:** Ask Erik for `git push` permission (per push policy).

- [ ] **Step F.6.5:** Push to `origin/feat/p01p03-playwright-e2e`.

```bash
git push -u origin feat/p01p03-playwright-e2e
```

- [ ] **Step F.6.6:** Read `.github/pull_request_template.md` to confirm the current checklist shape (declared not-library-touching is the default expectation, but the template may have shifted). Open PR via `gh pr create` against `main`. Title: `feat(part03): Playwright E2E test suite (Tier 1 Future-State workstream)`.

- [ ] **Step F.6.7:** Surface PR URL to Erik for review.

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Playwright tests against live RDS+S3 mutate state — concurrent runs would conflict | Serial mode (`workers: 1`); destructive arc opt-in only; document destructive nature in spec headers + npm scripts |
| Test fixtures bloat the repo | One small JPG (<50 KB) committed; PDF + oversized blob runtime-generated, gitignored |
| Rekognition labels may not be available immediately after upload | Upload service awaits `DetectLabels` before responding (per workstream Risks doc); spec asserts after upload response |
| Playwright chromium binary is large (~150 MB) | Install on-demand; `npm run e2e:install` script; CI uses `npx playwright install --with-deps chromium` |
| CI flakiness | Phase E uses path filter to limit triggers; `retries: 1`; trace+video on failure for triage; report uploaded as artifact |
| Selector drift (data-testid changes break specs) | Use accessible selectors (`getByRole`, `getByText`) where stable; reserve `data-testid` for unambiguous test-only handles; document the convention in a memory at Phase F |
| `window.useUIStore` not exposed for L2 store inspection | Behavioral fallback documented inline in B.1 spec — assert routing post-submit instead of inspecting store |
| No UI delete-all button in Library | API-fallback variant documented in BS.1 — call `DELETE /api/images` directly via Playwright request context |
| `npm start` post-Phase-0 path resolution issues | Pre-flight step P.1 verifies before Phase A install begins |
| AWS creds in CI | Phase E uses GHA secrets `E2E_AWS_*`; Erik provisions a scoped IAM identity (Task E.2 surfaces this) |
| Rekognition `DetectLabels` cost — every test run triggers one call (~$0.001); CI on every PR multiplies | Path-filter on workflow limits triggers to Part03-touching PRs; cost is bounded but not zero. Surface to Erik at Phase F if monthly Rekognition spend trends up |
| Concurrent collaborator activity in shared RDS+S3 — non-destructive specs assume nobody else mutates state mid-run | Acknowledged: serial within a run + small assertion windows (10–30s); collaborator-window collisions are acceptable flake. If repeated, document a "no-E2E-during-collab-walk" coordination note in `MetaFiles/Journal/` |
| ESM/CJS interop — `pdfkit` is CJS, frontend is `"type": "module"`, Playwright TS loader behavior may shift | A.3.3 inline note + immediate sanity-spec verification post-setup-creation surface failure quickly; documented fallback import form |
| Accidental destructive run — `npm run e2e:destructive` silently nukes the live stack | Spec emits a `console.warn` banner on test start; spec name self-documents. Optional hardening: env-var double-gate (`E2E_CONFIRM_DESTRUCTIVE=1`) — defer unless misuse occurs |
| Phase E shell pid juggling — `npm start &` + curl polling is fragile vs. Playwright's built-in `webServer` config | Shell form chosen for explicit kill-on-fail behavior. If CI flakes on startup race, migrate to `webServer` block in `playwright.config.ts` (one-line addition) — captured as a Phase-E hardening task if needed |

---

## Cross-refs

- `Part03/MetaFiles/Approach/Future-State-playwright-e2e-workstream.md` — workstream approach doc (source of truth for goals + scope)
- `Part03/MetaFiles/Approach/Future-State-roadmap.md` — Tier 1 sequencing
- `Part03/MetaFiles/HumanTestInstructions/Human-Feature-Test-Suite.md` — 15 unticked browser rows (12 covered here, 3 deferred)
- `Part03/MetaFiles/OrientationMap.md` — Pending → Closed transition at Phase F
- `Part03/MetaFiles/plans/01-ui-workstream-plan.md` — format precedent (atomic doc-update gate, push policy, install-log convention)
- `Part03/MetaFiles/install-log.md` — every install entry per Q5 protocol
- `MBAi460-Group1/MetaFiles/Offered_Memories/` — proposed memories from execution
- `MBAi460-Group1/CONTRIBUTING.md` — branch + PR conventions (`feat/<scope>-<topic>`, PRs against main)
- `MBAi460-Group1/.github/pull_request_template.md` — library-touching declaration

---

## Post-execution review checklist

After Phase F lands, run through:

- [ ] All 14+ default-suite tests passing
- [ ] Destructive suite passes when explicitly invoked (or appropriately skips)
- [ ] CI workflow triggers on PR + passes (after secrets provisioned)
- [ ] Plan doc Master Tracker fully ✅
- [ ] Workstream approach doc status flipped to LANDED
- [ ] OrientationMap updated
- [ ] 12 Human-Walk rows ticked + footnoted; 3 deferred rows footnoted
- [ ] Future-State-roadmap Tier 1 updated
- [ ] Memory candidates evaluated + filed
- [ ] PR open + CI green + ready for Erik review

---

**End of plan.**
