# Part 03 Install Log

A chronological record of every package install (npm or otherwise) performed in this Part 03 directory. Per Erik 2026-04-26: be VERY EXPLICIT about what was installed.

Each entry should capture:
- **Date** (UTC)
- **Working directory** (where the command was run from)
- **Command** (verbatim)
- **Exit code**
- **Packages installed / changed** (counts + notable adds)
- **Vulnerabilities reported** (counts + severity)
- **Warnings / notable output**
- **Source** (which plan phase + task triggered it)

Used by future agents (and any human reviewer) to understand the dependency chain of the Part 03 build.

---

## 2026-04-26 — Phase 0 baseline `npm install`

- **Source:** `02-server-foundation-plan.md` Phase 0 Task 0.2 (baseline verification before refactor begins).
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/`
- **Command:** `npm install`
- **Exit code:** `0`
- **Packages installed:** 305 (audited 306).
- **`node_modules/`:** created (~204 entries at top level).
- **`package-lock.json`:** generated (157 KB).
- **Funding:** 44 packages requesting (`run \`npm fund\` for details`).
- **Deprecation warnings (9):** transitive deps from `sqlite3@5.1.7`'s prebuild toolchain — `tar@6.2.1`, `gauge@4.0.4`, `are-we-there-yet@3.0.1`, `@npmcli/move-file@1.1.2`, `npmlog@6.0.2`, `glob@7.2.3`, `rimraf@3.0.2`, `prebuild-install@7.1.3`, `inflight@1.0.6`. None affect direct deps.
- **Vulnerabilities (8):** 2 low + 1 moderate + 5 high. **All 8 are transitive through `sqlite3@5.1.7`.** Affected packages: `@tootallnate/once`, `cacache`, `http-proxy-agent`, `make-fetch-happen`, `node-gyp`, `tar` (and a couple more in the tree). `npm audit --json` confirms `fixAvailable: { name: 'sqlite3', version: '6.0.1', isSemVerMajor: true }` for every vulnerability — single upgrade resolves them all.
- **Notable:** `sqlite3` is in the package.json dependencies but is **not actually used** by the Express baseline (`server/*.js` files do not `require('sqlite3')` — verified). It appears to be a leftover from the Project 2 copy. **Surface to Erik:** consider removing `sqlite3` from `dependencies` (eliminates all 8 vulnerabilities + 9 deprecation warnings + reduces install size) OR upgrading to `sqlite3@6.0.1` if it's needed downstream. Either path is destructive (changes runtime deps); deferred to Erik.
- **Result:** baseline install OK; no blockers for Phase 0 server smoke.

---

## 2026-04-26 — Phase 1 jest + supertest devDeps install

- **Source:** `02-server-foundation-plan.md` Phase 1 Task 1.1 (test toolchain).
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/`
- **Command:** `npm install --save-dev jest supertest`
- **Exit code:** `0`
- **Packages added:** 306 (audited 612 total).
- **Direct deps recorded in `package.json#devDependencies`:**
  - `jest@^30.3.0`
  - `supertest@^7.2.2`
- **Funding:** 91 packages requesting funds.
- **Deprecation warnings:** 3 × `glob@10.5.0` (transitive). No new direct-dep warnings.
- **Vulnerabilities:** unchanged at 8 (still all transitive through `sqlite3@5.1.7`). Adding jest+supertest did not introduce or fix any vulnerabilities.
- **Notable:** `jest@30.x` is the current major; `supertest@7.x` is current. Both work cleanly with Express 5.
- **Verification after install:** `npm test` (script: `jest --passWithNoTests`) → exit 0, "No tests found, exiting with code 0". Toolchain ready for first failing test in Phase 2.

---

## 2026-04-26 — Production polish: drop unused `sqlite3` and `uuid`

- **Source:** post-execution production review (Erik 2026-04-26).
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/`
- **Commands:**
  - `npm uninstall sqlite3` (initial; cleared lockfile + node_modules but did not update package.json — npm 11 quirk in this run).
  - Manual edit of `package.json` to remove `"sqlite3"` and `"uuid"` from `dependencies`.
  - `npm install` to sync lockfile.
  - `npm prune` to clean orphans from `node_modules/`.
- **Why:** both packages were carried over from the Project 2 baseline but are NOT `require()`d by any post-Phase-9 server file. Removing them eliminates all `npm audit` findings.
  - `sqlite3@5.1.7`: 8 vulnerabilities (2 low, 1 moderate, 5 high) + 9 deprecation warnings in its prebuild toolchain. None reachable from foundation code.
  - `uuid@13.x`: 1 moderate vulnerability (`<14.0.0` advisory — bounds check in v3/v5/v6 when `buf` is provided). We never used those code paths; v4 is what the legacy `api_post_image.js` calls.
- **Effect:**
  - `npm audit`: **0 vulnerabilities** (was 8 + 1 = 9).
  - Packages audited: 515 (down from ~612).
  - `node_modules/` size: **79 MB** (down from larger; sqlite3's prebuild + uuid native bits removed).
  - `npm test`: 5 suites / 8 tests still pass.
- **Side-effect (textual, intentional):** the legacy `server/api_post_image.js` reference file requires `uuid`. With uuid removed from `dependencies`, that file is now require-broken — it remains as a *textual* reference only. This is acceptable per the Part 03 TODO disposition decision (legacy api_*.js kept as reference; final fate decided at end-of-Part-03). When workstream 03 reinstalls `uuid` (probably v14, with `transformIgnorePatterns` for jest's ESM handling), legacy files become require-functional again — though they should never actually be required at runtime.
- **Decision recorded for workstream 03:** when re-adding `uuid`, decide between `uuid@14` (current, ESM-only — needs `transformIgnorePatterns: ['node_modules/(?!uuid)']` in `jest.config.js`) and `uuid@9.x` (CJS-compatible, last v9 release). Refactor-log 2026-04-26 Phase 2 entry already flagged this.

---

## 2026-04-26 — Phase 0 install: multer + ini + uuid@9 for /api/* implementation

- **Source:** `03-api-routes-plan.md` Phase 0 Task 0.2 — runtime deps for the PhotoApp service module + multipart upload middleware.
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/`
- **Command:** `npm install --save multer ini uuid@9`
- **Exit code:** `0`
- **Packages added (direct deps in `package.json#dependencies`):**
  - `multer@^2.1.1`
  - `ini@^6.0.0`
  - `uuid@^9.0.1` (pinned to v9 for CommonJS compatibility — v14 is ESM-only and would require `transformIgnorePatterns: ['node_modules/(?!uuid)']` in `jest.config.js`. See refactor-log 2026-04-26 Phase 2 side-finding.)
- **Net packages added to tree:** 15 (audited 530 total).
- **Funding:** 82 packages requesting (`npm fund` for details).
- **Vulnerabilities:** 1 moderate.
  - **Advisory:** `uuid <14.0.0` — *Missing buffer bounds check in v3/v5/v6 when `buf` is provided* (`GHSA-w5hq-g745-h8pq`).
  - **Reachable from our code?** No. The PhotoApp service uses `uuidv4()` for bucketkey generation only; we never pass a `buf` argument and never use v3/v5/v6 generators. The advisory does not affect our usage.
  - **Why we're not upgrading:** `npm audit fix --force` would install `uuid@14`, which is ESM-only and breaks Jest's CommonJS transform (would require jest config additions + likely break our test setup). The pin to v9 is intentional and the advisory is unreachable in our usage pattern.
- **Notable warnings:** none beyond the audit notice above.
- **Verification after install:** `npm test` re-run pending (next plan step) — confirm no regression in the 5 existing suites.

---

## 2026-04-27 — Phase 1.1 install: Vite + React 18.3.x + TypeScript strict (Part03/frontend)

- **Source:** `01-ui-workstream-plan.md` Phase 1 Task 1.1 — frontend bootstrap.
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/frontend/` (NEW directory; previous content was the 02 placeholder `dist/` only — removed via `git rm` and replaced by the Vite build output).
- **Bootstrap method:** scaffold files written manually (instead of `npm create vite@latest`, which is interactive and prompts on non-empty directory). Files created: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `.gitignore`.
- **Command:** `npm install` (from `Part03/frontend/`).
- **Exit code:** `0`.
- **Packages installed (direct deps in `package.json`):**
  - `react@^18.3.1`
  - `react-dom@^18.3.1`
- **Packages installed (devDeps):**
  - `@types/react@^18.3.12`
  - `@types/react-dom@^18.3.1`
  - `@vitejs/plugin-react@^4.3.3`
  - `typescript@^5.6.0`
  - `vite@^5.4.8` (resolved to v5.4.21)
- **Vulnerabilities:** 2 moderate (devDeps only; `npm audit --omit=dev` reports 0). Acceptable for assignment scope.
- **Notes:**
  - React pinned to 18.3.x per Q7 (NOT React 19 — Andrew's MVP runs on 18.3.1; concurrent semantics differ in 19).
  - `tsconfig.app.json` includes the strict additions per plan: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` (in addition to default `strict: true`).
  - `dist/` is gitignored at the frontend level; build output is local.
- **Verification after install:** `npm run build` succeeded (`vite v5.4.21`; 30 modules transformed; `dist/index.html` 0.33 kB + `dist/assets/index-cc7BSt1h.js` 142.78 kB / 45.85 kB gzipped). Wordmark "MBAi 460 — PhotoApp" present in built bundle.

---

## 2026-04-27 — Phase 1.2 install: Tailwind 3 + PostCSS + Autoprefixer (Part03/frontend)

- **Source:** `01-ui-workstream-plan.md` Phase 1 Task 1.2 — Tailwind toolchain + Andrew's tokens.css → tailwind.config.ts theme.
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/frontend/`
- **Command:** `npm install -D tailwindcss@^3 postcss autoprefixer`
- **Exit code:** `0`
- **Packages installed (devDeps):**
  - `tailwindcss@^3.4.19`
  - `postcss@^8.5.12`
  - `autoprefixer@^10.5.0`
- **Pinned to Tailwind 3.x** (NOT v4 — v4 has breaking config syntax + PostCSS plugin interface changes; safer for the assignment window).
- **Vulnerabilities:** unchanged (2 moderate from Phase 1.1; production audit still 0).
- **Files created:**
  - `tailwind.config.ts` — full token translation (4-level paper, 4-level ink, line + line-strong, accent stack, status colors, font scale 12–40 px, 4px-grid spacing, radius xs–xl + full, shadows 1/2/3, motion durations + ease, fade + shim animations, rail-w/topbar-h sizing).
  - `postcss.config.js` — tailwindcss + autoprefixer.
  - `src/styles/globals.css` — `@tailwind base/components/utilities` + body resets via `@apply` + focus-visible ring per tokens.css.
- **Verification:** `npm run build` — `vite v5.4.21`; 31 modules transformed; new `dist/assets/index-B5RnLL3r.css` 5.67 kB / 1.76 kB gzipped. Compiled CSS contains the actual hex values (`#F0EEE6` paper, `#1E1E1C` ink, `#CC785C` accent), Source Serif 4 font stack, accent-soft `#cc785c1a` for selection, focus-visible outline at 2px solid accent.

---

## 2026-04-27 — Phase 1.4 install: Zustand + Vitest + RTL + jsdom (Part03/frontend)

- **Source:** `01-ui-workstream-plan.md` Phase 1 Task 1.4 — Zustand store + frontend test infrastructure.
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/frontend/`
- **Commands:**
  - `npm install zustand`
  - `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
- **Exit code:** `0` (both)
- **Packages installed:**
  - Direct dep: `zustand@^5.0.12`
  - DevDeps: `vitest@^4.1.5`, `@testing-library/react@^16.3.2`, `@testing-library/jest-dom@^6.9.1`, `@testing-library/user-event@^14.6.1`, `jsdom@^29.1.0`
- **Vulnerabilities:** unchanged (2 moderate from Phase 1.1; production audit still 0).
- **Files created:**
  - `vitest.config.ts` — globals + jsdom env + setupFiles + `@/` alias matching `tsconfig.app.json`.
  - `src/test/setup.ts` — `import '@testing-library/jest-dom/vitest'`.
  - `src/stores/ui.ts` — Zustand store: `sidebarCollapsed` + `mockAuth: { isMockAuthed, givenname?, familyname? }` + `toggleSidebar` + `setMockAuth`.
  - `src/stores/__tests__/ui.test.ts` — 2 tests (toggleSidebar, setMockAuth).
- **Files modified:**
  - `package.json` — added `test: vitest run` and `test:watch: vitest` scripts.
- **Verification:** `npm test` from `Part03/frontend/` — 1 test file / 2 tests passed in 345ms. (Minor noise: "Both esbuild and oxc options were set" — Vitest 4 + @vitejs/plugin-react interaction; cosmetic.)

---

## 2026-04-27 — Phase 1.5 install: react-router-dom 6 (Part03/frontend)

- **Source:** `01-ui-workstream-plan.md` Phase 1 Task 1.5 — react-router-dom + Q10 non-blocking routing scaffold.
- **Working directory:** `MBAi460-Group1/projects/project01/Part03/frontend/`
- **Command:** `npm install react-router-dom@^6`
- **Exit code:** `0`
- **Packages installed (direct deps):** `react-router-dom@^6.30.3`.
- **Vulnerabilities:** unchanged (2 moderate from Phase 1.1; production audit still 0).
- **Files modified/created:**
  - `src/main.tsx` — wraps `<App />` with `<BrowserRouter>`.
  - `src/App.tsx` — `<Routes>` with stub routes for the Q10 surface: `/` redirects to `/library`; `/library`, `/upload`, `/asset/:id`, `/login`, `/register`, `/profile`, `/help`, `*` (404) all render. NO auth guards. Default route is `/library`.
  - `src/__tests__/App.test.tsx` — 5 routing tests (wordmark on every route, default redirect, /login public, /upload public, 404 fallback).
- **Verification:** `npm test` — 2 files / 7 tests passed (2 Zustand + 5 routing). `npm run build` clean (`vite v5.4.21`; `dist/assets/index-CQa54pmN.js` 162.73 kB / 53.05 kB gzipped — bundle grew ~20 kB for react-router-dom).
